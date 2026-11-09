import apiClient from '../api/apiClient'
import type { AcademicTerm, AcademicTermDraft, CalendarEvent, CalendarWeek, ConflictCheck, ConflictList, ConflictMeeting, ConflictPair, FilterOptions, ListSort, MeetingDetail, MeetingListItem, MeetingLocation, NamedRef, ScheduleDraft, TermRef, TermStatus, TimetableOption, TimetablePage, TimetableStatistics } from '../types/timetable'
import { conflictCheckPayload, isIsoDate, isTime, localMinutesFromOffsetDateTime, schedulePayload, scheduleSlotPayload } from '../utils/timetable'

// Backend contract (feature/timetable, verified 2026-11-09):
//   GET  /timetable/calendar?weekStart&academicTermId&facultyId&departmentId&courseId&courseSectionId&lecturerId&campusId&buildingId&roomId&status
//   GET  /timetable/meetings (TimetablePageResponse, size ≤ 100, sort fields in TimetableServiceImpl.LIST_SORT)
//   GET|PUT|DELETE /timetable/meetings/{id}, POST /timetable/meetings, POST /timetable/meetings/{id}/publish|cancel
//   GET  /timetable/conflicts?academicTermId&facultyId&departmentId&courseSectionId&buildingId&roomId&type&weekStart
//   POST /timetable/conflicts/check, GET /timetable/statistics?academicTermId, GET /timetable/filter-options
//   GET|POST /academic-terms, GET|PUT|DELETE /academic-terms/{id}, PATCH /academic-terms/{id}/status
// Every list returns the page object directly (no success/data wrapper); unknown query parameters are a 400.

type Row = Record<string, unknown>
const count = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0
const validId = (value: string) => /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value))
const unexpected = (what: string) => new Error(`Unexpected ${what} response.`)

function id(value: unknown, what: string) {
  if (!count(value) || !value) throw unexpected(what)
  return String(value)
}
const optionalId = (value: unknown) => value == null ? null : String(value)
const text = (value: unknown, what: string) => { if (typeof value !== 'string') throw unexpected(what); return value }
const optionalText = (value: unknown) => value == null ? null : String(value)
const timeOf = (value: unknown, what: string) => { if (typeof value !== 'string' || !isTime(value.slice(0, 5))) throw unexpected(what); return value.slice(0, 5) }
const dateOf = (value: unknown, what: string) => { if (typeof value !== 'string' || !isIsoDate(value)) throw unexpected(what); return value }
const timestamp = (value: unknown) => value == null ? null : typeof value === 'string' ? value : typeof value === 'number' && Number.isFinite(value) ? new Date(value * 1000).toISOString() : null

export function cleanParams(params: object) {
  return Object.fromEntries(Object.entries(params as Record<string, unknown>).filter(([, value]) => value !== undefined && value !== null && value !== '')) as Record<string, string | number>
}

export function meetingPath(meetingId: string) {
  if (!validId(meetingId)) throw new Error('Invalid schedule ID.')
  return `/timetable/meetings/${meetingId}`
}
export function termPath(termId: string) {
  if (!validId(termId)) throw new Error('Invalid academic term ID.')
  return `/academic-terms/${termId}`
}

// ---- Mappers ------------------------------------------------------------------
export function mapOption(value: unknown): TimetableOption {
  const row = value as Row | null
  if (!row) throw unexpected('filter option')
  return { id: id(row.id, 'filter option'), code: optionalText(row.code) ?? '', name: optionalText(row.name) ?? '', parentId: optionalId(row.parentId) }
}

export function mapFilterOptions(value: unknown): FilterOptions {
  const row = value as Row | null
  if (!row) throw unexpected('filter options')
  const list = (key: string) => { const items = row[key]; if (!Array.isArray(items)) throw unexpected('filter options'); return items.map(mapOption) }
  const strings = (key: string) => Array.isArray(row[key]) ? (row[key] as unknown[]).map(String) : []
  return {
    academicTerms: list('academicTerms'), faculties: list('faculties'), departments: list('departments'), courses: list('courses'), courseSections: list('courseSections'),
    lecturers: list('lecturers'), campuses: list('campuses'), buildings: list('buildings'), rooms: list('rooms'), meetingTypes: strings('meetingTypes'), statuses: strings('statuses'),
  }
}

const termStatus = (value: unknown) => { if (value !== 'PLANNED' && value !== 'ACTIVE' && value !== 'CLOSED') throw unexpected('academic term'); return value }
const meetingStatus = (value: unknown) => { if (value !== 'DRAFT' && value !== 'PUBLISHED' && value !== 'CANCELLED') throw unexpected('schedule status'); return value }
const meetingType = (value: unknown) => { if (value !== 'LECTURE' && value !== 'LAB' && value !== 'TUTORIAL') throw unexpected('class type'); return value }
const conflictType = (value: unknown) => { if (value !== 'ROOM_CONFLICT' && value !== 'LECTURER_CONFLICT' && value !== 'COURSE_SECTION_CONFLICT') throw unexpected('conflict type'); return value }

export function mapAcademicTerm(value: unknown): AcademicTerm {
  const row = value as Row | null
  if (!row) throw unexpected('academic term')
  return {
    id: id(row.id, 'academic term'), semesterId: id(row.semesterId, 'academic term'), semesterNameEn: text(row.semesterNameEn, 'academic term'), semesterNameTh: optionalText(row.semesterNameTh) ?? '',
    semesterAcademicYear: count(row.semesterAcademicYear) ? row.semesterAcademicYear : null, academicYearCode: text(row.academicYearCode, 'academic term'), academicYearLabel: text(row.academicYearLabel, 'academic term'),
    startDate: dateOf(row.startDate, 'academic term'), endDate: dateOf(row.endDate, 'academic term'), status: termStatus(row.status),
    displayLabel: optionalText(row.displayLabel) ?? `${row.semesterNameEn} / ${row.academicYearCode}`,
  }
}

export function mapCalendarEvent(value: unknown): CalendarEvent {
  const row = value as Row | null
  if (!row) throw unexpected('calendar event')
  const startMinutes = localMinutesFromOffsetDateTime(text(row.startsAt, 'calendar event'))
  const endMinutes = localMinutesFromOffsetDateTime(text(row.endsAt, 'calendar event'))
  if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) throw unexpected('calendar event')
  const occurrence = row.occurrenceStatus
  if (occurrence !== 'REGULAR' && occurrence !== 'RESCHEDULED' && occurrence !== 'CANCELLED') throw unexpected('calendar event')
  return {
    meetingId: id(row.meetingId, 'calendar event'), courseSectionId: id(row.courseSectionId, 'calendar event'), courseCode: text(row.courseCode, 'calendar event'), courseName: text(row.courseName, 'calendar event'),
    sectionNumber: text(row.sectionNumber, 'calendar event'), lecturerId: id(row.lecturerId, 'calendar event'), lecturerName: optionalText(row.lecturerName) ?? '', facultyId: id(row.facultyId, 'calendar event'), departmentId: id(row.departmentId, 'calendar event'),
    roomId: optionalId(row.roomId), roomNumber: optionalText(row.roomNumber), buildingId: optionalId(row.buildingId), buildingName: optionalText(row.buildingName), campusId: optionalId(row.campusId),
    meetingType: meetingType(row.meetingType), date: dateOf(row.date, 'calendar event'), startMinutes, endMinutes, status: meetingStatus(row.status), occurrenceStatus: occurrence,
    exceptionId: optionalId(row.exceptionId), originalDate: typeof row.originalDate === 'string' ? row.originalDate : null,
  }
}

export function mapCalendarWeek(value: unknown): CalendarWeek {
  const row = value as Row | null
  if (!row || !Array.isArray(row.events)) throw unexpected('calendar')
  const events = row.events.map(mapCalendarEvent)
  // Rescheduled occurrences may be duplicated by the backend only per date; (meetingId, date, exceptionId) must be unique.
  const keys = new Set(events.map(event => `${event.meetingId}|${event.date}|${event.exceptionId ?? ''}|${event.occurrenceStatus}`))
  if (keys.size !== events.length) throw unexpected('calendar')
  return { academicTermId: optionalId(row.academicTermId), weekStart: dateOf(row.weekStart, 'calendar'), weekEnd: dateOf(row.weekEnd, 'calendar'), timezone: optionalText(row.timezone) ?? '', events }
}

export function mapMeetingListItem(value: unknown): MeetingListItem {
  const row = value as Row | null
  if (!row) throw unexpected('schedule')
  const day = row.dayOfWeek
  if (!count(day) || day < 1 || day > 7) throw unexpected('schedule')
  return {
    id: id(row.id, 'schedule'), courseSectionId: id(row.courseSectionId, 'schedule'), courseCode: text(row.courseCode, 'schedule'), courseName: text(row.courseName, 'schedule'), sectionNumber: text(row.sectionNumber, 'schedule'),
    facultyId: id(row.facultyId, 'schedule'), facultyName: optionalText(row.facultyName) ?? '', departmentId: id(row.departmentId, 'schedule'), departmentName: optionalText(row.departmentName) ?? '',
    lecturerId: id(row.lecturerId, 'schedule'), lecturerName: optionalText(row.lecturerName) ?? '', academicTermId: optionalId(row.academicTermId), academicYearLabel: optionalText(row.academicYearLabel), semesterName: optionalText(row.semesterName) ?? '',
    dayOfWeek: day, dayName: optionalText(row.dayName) ?? '', startTime: timeOf(row.startTime, 'schedule'), endTime: timeOf(row.endTime, 'schedule'),
    campusId: optionalId(row.campusId), campusName: optionalText(row.campusName), buildingId: optionalId(row.buildingId), buildingName: optionalText(row.buildingName), roomId: optionalId(row.roomId), roomNumber: optionalText(row.roomNumber), legacyRoomLabel: optionalText(row.legacyRoomLabel),
    meetingType: meetingType(row.meetingType), status: meetingStatus(row.status), effectiveFrom: dateOf(row.effectiveFrom, 'schedule'), effectiveTo: dateOf(row.effectiveTo, 'schedule'),
  }
}

function mapNamedRef(value: unknown, what: string): NamedRef {
  const row = value as Row | null
  if (!row) throw unexpected(what)
  return { id: id(row.id, what), code: optionalText(row.code) ?? '', name: optionalText(row.name) ?? '' }
}

function mapTermRef(value: unknown): TermRef | null {
  const row = value as Row | null
  if (!row) return null
  return {
    id: id(row.id, 'academic term'), semesterId: id(row.semesterId, 'academic term'), semesterName: optionalText(row.semesterName) ?? '', semesterNameTh: optionalText(row.semesterNameTh) ?? '',
    academicYearCode: optionalText(row.academicYearCode) ?? '', academicYearLabel: optionalText(row.academicYearLabel) ?? '', startDate: dateOf(row.startDate, 'academic term'), endDate: dateOf(row.endDate, 'academic term'), status: termStatus(row.status),
  }
}

function mapLocation(value: unknown): MeetingLocation {
  const row = (value as Row | null) ?? {}
  return {
    campusId: optionalId(row.campusId), campusName: optionalText(row.campusName), buildingId: optionalId(row.buildingId), buildingCode: optionalText(row.buildingCode), buildingName: optionalText(row.buildingName),
    roomId: optionalId(row.roomId), roomNumber: optionalText(row.roomNumber), roomName: optionalText(row.roomName), floorNumber: count(row.floorNumber) ? row.floorNumber : null, capacity: count(row.capacity) ? row.capacity : null, legacyRoomLabel: optionalText(row.legacyRoomLabel),
  }
}

export function mapMeetingDetail(value: unknown): MeetingDetail {
  const row = value as Row | null
  if (!row) throw unexpected('schedule')
  const day = row.dayOfWeek
  if (!count(day) || day < 1 || day > 7) throw unexpected('schedule')
  return {
    id: id(row.id, 'schedule'), courseSection: mapNamedRef(row.courseSection, 'schedule'), course: mapNamedRef(row.course, 'schedule'), academicTerm: mapTermRef(row.academicTerm),
    faculty: mapNamedRef(row.faculty, 'schedule'), department: mapNamedRef(row.department, 'schedule'), lecturer: mapNamedRef(row.lecturer, 'schedule'), location: mapLocation(row.location),
    meetingType: meetingType(row.meetingType), dayOfWeek: day, dayName: optionalText(row.dayName) ?? '', startTime: timeOf(row.startTime, 'schedule'), endTime: timeOf(row.endTime, 'schedule'),
    effectiveFrom: dateOf(row.effectiveFrom, 'schedule'), effectiveTo: dateOf(row.effectiveTo, 'schedule'), status: meetingStatus(row.status), notes: optionalText(row.notes), createdAt: timestamp(row.createdAt), updatedAt: timestamp(row.updatedAt),
  }
}

function mapConflictMeeting(value: unknown): ConflictMeeting {
  const row = value as Row | null
  if (!row || !count(row.dayOfWeek)) throw unexpected('conflict')
  return {
    meetingId: id(row.meetingId, 'conflict'), courseSectionId: id(row.courseSectionId, 'conflict'), courseCode: text(row.courseCode, 'conflict'), courseName: optionalText(row.courseName) ?? '', sectionNumber: text(row.sectionNumber, 'conflict'),
    meetingType: meetingType(row.meetingType), dayOfWeek: row.dayOfWeek, startTime: timeOf(row.startTime, 'conflict'), endTime: timeOf(row.endTime, 'conflict'), effectiveFrom: dateOf(row.effectiveFrom, 'conflict'), effectiveTo: dateOf(row.effectiveTo, 'conflict'),
    roomId: optionalId(row.roomId), roomNumber: optionalText(row.roomNumber), lecturerId: id(row.lecturerId, 'conflict'), lecturerName: optionalText(row.lecturerName) ?? '',
  }
}

export function mapConflictPair(value: unknown): ConflictPair {
  const row = value as Row | null
  if (!row || !count(row.occurrenceCount)) throw unexpected('conflict')
  return {
    type: conflictType(row.type), meetingA: mapConflictMeeting(row.meetingA), meetingB: mapConflictMeeting(row.meetingB), firstDate: dateOf(row.firstDate, 'conflict'),
    overlapStart: timeOf(row.overlapStart, 'conflict'), overlapEnd: timeOf(row.overlapEnd, 'conflict'), occurrenceCount: row.occurrenceCount,
    roomId: optionalId(row.roomId), roomNumber: optionalText(row.roomNumber), lecturerId: optionalId(row.lecturerId), lecturerName: optionalText(row.lecturerName), courseSectionId: optionalId(row.courseSectionId),
  }
}

export function mapConflictList(value: unknown): ConflictList {
  const row = value as Row | null
  if (!row || !count(row.total) || !Array.isArray(row.conflicts)) throw unexpected('conflict list')
  const conflicts = row.conflicts.map(mapConflictPair)
  if (conflicts.length !== row.total) throw unexpected('conflict list')
  return { total: row.total, conflicts }
}

export function mapConflictCheck(value: unknown): ConflictCheck {
  const row = value as Row | null
  if (!row || typeof row.hasConflicts !== 'boolean' || !count(row.totalConflicts) || !Array.isArray(row.conflicts)) throw unexpected('conflict check')
  return {
    hasConflicts: row.hasConflicts, totalConflicts: row.totalConflicts,
    conflicts: row.conflicts.map(item => {
      const conflict = item as Row
      return { type: conflictType(conflict.type), conflictingMeetingId: id(conflict.conflictingMeetingId, 'conflict check'), message: optionalText(conflict.message) ?? '', date: dateOf(conflict.date, 'conflict check'), overlapStart: timeOf(conflict.overlapStart, 'conflict check'), overlapEnd: timeOf(conflict.overlapEnd, 'conflict check') }
    }),
  }
}

function mapPage<T>(value: unknown, map: (row: unknown) => T, page: number, size: number): TimetablePage<T> {
  const row = value as Row | null
  if (!row || !Array.isArray(row.content) || row.page !== page || row.size !== size || !count(row.totalElements) || !count(row.totalPages)) throw unexpected('page')
  const content = row.content.map(map)
  return { content, page, size, totalElements: row.totalElements, totalPages: row.totalPages }
}

// ---- Reads --------------------------------------------------------------------
export interface MeetingQueryParams { academicTermId?: string; facultyId?: string; departmentId?: string; courseId?: string; courseSectionId?: string; lecturerId?: string; campusId?: string; buildingId?: string; roomId?: string; status?: string }

function checkIds(params: object) {
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) if (/Id$/.test(key) && value !== undefined && value !== null && value !== '' && !validId(String(value))) throw new Error(`Invalid ${key.replace(/Id$/, '')} filter.`)
}

/** All dated occurrences of one week (Monday–Sunday). The backend normalises weekStart to its Monday. */
export async function getTimetableCalendar(params: MeetingQueryParams & { weekStart: string }, signal?: AbortSignal): Promise<CalendarWeek> {
  checkIds(params)
  if (!isIsoDate(params.weekStart)) throw new Error('Invalid week start.')
  const { data } = await apiClient.get('/timetable/calendar', { params: cleanParams(params), signal })
  return mapCalendarWeek(data)
}

export const LIST_PAGE_SIZE = 20

export async function getTimetableMeetings(params: MeetingQueryParams & { page: number; size?: number; sort?: ListSort; search?: string }, signal?: AbortSignal): Promise<TimetablePage<MeetingListItem>> {
  checkIds(params)
  const size = params.size ?? LIST_PAGE_SIZE
  if (!count(params.page) || size < 1 || size > 100) throw new Error('Invalid schedule page.')
  const { page, sort, search, ...rest } = params
  const filters = { ...rest, size: undefined }
  // Several sort entries are sent as repeated `sort` parameters (TimetablePageQuery accepts up to three, id is appended).
  const sorts = sort ? [`${sort.field},${sort.direction}`, ...(sort.field === 'dayOfWeek' ? [`startTime,${sort.direction}`] : sort.field === 'startTime' ? [] : ['dayOfWeek,asc'])] : ['dayOfWeek,asc', 'startTime,asc']
  const query = new URLSearchParams(Object.entries(cleanParams({ ...filters, page, size, search: search?.trim() || undefined })).map(([key, value]) => [key, String(value)]))
  for (const entry of sorts) query.append('sort', entry)
  const { data } = await apiClient.get(`/timetable/meetings?${query.toString()}`, { signal })
  return mapPage(data, mapMeetingListItem, page, size)
}

export async function getMeetingById(meetingId: string, signal?: AbortSignal) {
  const { data } = await apiClient.get(meetingPath(meetingId), { signal })
  return mapMeetingDetail(data)
}

export interface ConflictQueryParams { academicTermId?: string; facultyId?: string; departmentId?: string; courseSectionId?: string; buildingId?: string; roomId?: string; type?: string; weekStart?: string }

export async function getTimetableConflicts(params: ConflictQueryParams, signal?: AbortSignal): Promise<ConflictList> {
  checkIds(params)
  const { data } = await apiClient.get('/timetable/conflicts', { params: cleanParams(params), signal })
  return mapConflictList(data)
}

export async function getTimetableStatistics(academicTermId?: string, signal?: AbortSignal): Promise<TimetableStatistics> {
  if (academicTermId && !validId(academicTermId)) throw new Error('Invalid academic term filter.')
  const { data } = await apiClient.get('/timetable/statistics', { params: cleanParams({ academicTermId }), signal })
  if (!data || !['totalMeetings', 'publishedMeetings', 'draftMeetings', 'cancelledMeetings', 'conflictCount'].every(key => count(data[key]))) throw unexpected('timetable statistics')
  return data
}

export async function getFilterOptions(params: { academicTermId?: string; facultyId?: string; departmentId?: string; courseId?: string; campusId?: string; buildingId?: string } = {}, signal?: AbortSignal) {
  checkIds(params)
  const { data } = await apiClient.get('/timetable/filter-options', { params: cleanParams(params), signal })
  return mapFilterOptions(data)
}

/** Every academic term, newest start date first (the backend page size is at most 100). */
export async function getAcademicTerms(signal?: AbortSignal): Promise<AcademicTerm[]> {
  const rows: AcademicTerm[] = []
  let total = -1
  for (let page = 0; page < 20; page++) {
    const { data } = await apiClient.get('/academic-terms', { params: { page, size: 100, sort: 'startDate,desc' }, signal })
    const result = mapPage(data, mapAcademicTerm, page, 100)
    if (total !== -1 && total !== result.totalElements) throw new Error('Academic terms changed while loading. Please retry.')
    total = result.totalElements
    rows.push(...result.content)
    if (page >= result.totalPages - 1) {
      if (rows.length !== total || new Set(rows.map(row => row.id)).size !== rows.length) throw new Error('Academic terms changed while loading. Please retry.')
      return rows
    }
  }
  throw new Error('Too many academic terms to display completely.')
}

// ---- Writes -------------------------------------------------------------------
export async function createMeeting(draft: ScheduleDraft) {
  const { data } = await apiClient.post('/timetable/meetings', schedulePayload(draft))
  return mapMeetingDetail(data)
}
export async function updateMeeting(meetingId: string, draft: ScheduleDraft) {
  const { data } = await apiClient.put(meetingPath(meetingId), scheduleSlotPayload(draft))
  return mapMeetingDetail(data)
}
export async function deleteMeeting(meetingId: string) { await apiClient.delete(meetingPath(meetingId)) }
export async function publishMeeting(meetingId: string) {
  const { data } = await apiClient.post(`${meetingPath(meetingId)}/publish`)
  return mapMeetingDetail(data)
}
export async function cancelMeeting(meetingId: string) {
  const { data } = await apiClient.post(`${meetingPath(meetingId)}/cancel`)
  return mapMeetingDetail(data)
}
/** Pre-save conflict check. Advisory only: the server re-checks when a published meeting is saved. */
export async function checkScheduleConflicts(draft: ScheduleDraft, meetingId?: string, signal?: AbortSignal) {
  const { data } = await apiClient.post('/timetable/conflicts/check', conflictCheckPayload(draft, meetingId), { signal })
  return mapConflictCheck(data)
}

export function validateAcademicTermDraft(draft: AcademicTermDraft) {
  const errors: Partial<Record<keyof AcademicTermDraft, string>> = {}
  if (!validId(draft.semesterId)) errors.semesterId = 'Select a semester.'
  if (!draft.academicYearCode.trim()) errors.academicYearCode = 'Academic year code is required.'
  else if (draft.academicYearCode.trim().length > 20) errors.academicYearCode = 'Use at most 20 characters.'
  if (!draft.academicYearLabel.trim()) errors.academicYearLabel = 'Academic year label is required.'
  else if (draft.academicYearLabel.trim().length > 30) errors.academicYearLabel = 'Use at most 30 characters.'
  if (!isIsoDate(draft.startDate)) errors.startDate = 'Enter the term start date.'
  if (!isIsoDate(draft.endDate)) errors.endDate = 'Enter the term end date.'
  else if (isIsoDate(draft.startDate) && draft.endDate < draft.startDate) errors.endDate = 'The end date must not be before the start date.'
  if (!['PLANNED', 'ACTIVE', 'CLOSED'].includes(draft.status)) errors.status = 'Select a status.'
  return errors
}
export function academicTermPayload(draft: AcademicTermDraft) {
  if (Object.keys(validateAcademicTermDraft(draft)).length) throw new Error('Check the academic term details.')
  return { semesterId: Number(draft.semesterId), academicYearCode: draft.academicYearCode.trim(), academicYearLabel: draft.academicYearLabel.trim(), startDate: draft.startDate, endDate: draft.endDate, status: draft.status }
}
export async function createAcademicTerm(draft: AcademicTermDraft) {
  const { data } = await apiClient.post('/academic-terms', academicTermPayload(draft))
  return mapAcademicTerm(data)
}
export async function updateAcademicTerm(termId: string, draft: AcademicTermDraft) {
  const { data } = await apiClient.put(termPath(termId), academicTermPayload(draft))
  return mapAcademicTerm(data)
}
export async function deleteAcademicTerm(termId: string) { await apiClient.delete(termPath(termId)) }
export async function getAcademicTermById(termId: string, signal?: AbortSignal) {
  const { data } = await apiClient.get(termPath(termId), { signal })
  return mapAcademicTerm(data)
}
export async function setAcademicTermStatus(termId: string, status: TermStatus) {
  if (!['PLANNED', 'ACTIVE', 'CLOSED'].includes(status)) throw new Error('Select a valid term status.')
  const { data } = await apiClient.patch(`${termPath(termId)}/status`, { status })
  return mapAcademicTerm(data)
}
