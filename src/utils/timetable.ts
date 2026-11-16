import type { AcademicTerm, ConflictPair, FacultyColor, MeetingDetail, ScheduleDraft, ScheduleField, TimetableFilters, TimetableOption } from '../types/timetable'

// ---- Days and times -------------------------------------------------------
// Backend dayOfWeek is 1 = Monday … 7 = Sunday (java.time.DayOfWeek).
export const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
export const dayName = (dayOfWeek: number) => dayNames[dayOfWeek - 1] ?? `Day ${dayOfWeek}`
export const dayAbbreviation = (dayOfWeek: number) => dayName(dayOfWeek).slice(0, 3).toUpperCase()

export const isTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
export const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))

export function minutesFromTime(value: string) {
  if (!isTime(value)) return NaN
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}
export const timeFromMinutes = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

/** "08:00" → "8:00 AM" (details drawer, node 193:3056). */
export function formatTime12(value: string) {
  const minutes = minutesFromTime(value)
  if (Number.isNaN(minutes)) return value
  const hours = Math.floor(minutes / 60)
  return `${hours % 12 || 12}:${String(minutes % 60).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`
}
export const formatTimeRange12 = (start: string, end: string) => `${formatTime12(start)} – ${formatTime12(end)}`

/**
 * Local wall-clock minutes of an ISO offset timestamp such as "2026-11-10T08:30:00+07:00".
 * The university timezone is kept as sent; the browser timezone is never applied.
 */
export function localMinutesFromOffsetDateTime(value: string) {
  const match = /T(\d{2}):(\d{2})/.exec(value)
  return match ? Number(match[1]) * 60 + Number(match[2]) : NaN
}

// ---- Calendar dates (pure string/UTC arithmetic, so the browser timezone cannot shift a day) ----
const DAY = 86_400_000
const utc = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10)
export const addDays = (date: string, days: number) => iso(utc(date) + days * DAY)
/** ISO weekday 1 (Monday) … 7 (Sunday). */
export const isoWeekday = (date: string) => ((new Date(utc(date)).getUTCDay() + 6) % 7) + 1
export const mondayOf = (date: string) => addDays(date, 1 - isoWeekday(date))
export function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function formatDate(date: string | null | undefined) {
  if (!date || !isIsoDate(date)) return '—'
  const value = new Date(utc(date))
  return `${value.getUTCDate()} ${months[value.getUTCMonth()]} ${value.getUTCFullYear()}`
}
export function formatWeekRange(weekStart: string, weekEnd: string) {
  const start = new Date(utc(weekStart)), end = new Date(utc(weekEnd))
  if (start.getUTCMonth() === end.getUTCMonth()) return `${start.getUTCDate()} – ${end.getUTCDate()} ${months[end.getUTCMonth()]} ${end.getUTCFullYear()}`
  return `${start.getUTCDate()} ${months[start.getUTCMonth()]} – ${end.getUTCDate()} ${months[end.getUTCMonth()]} ${end.getUTCFullYear()}`
}

/** The week to open first: today's week, or the first week of a term that does not contain today. */
export function initialWeekStart(term: AcademicTerm | undefined, today = todayIso()) {
  const current = mondayOf(today)
  if (!term || !isIsoDate(term.startDate) || !isIsoDate(term.endDate)) return current
  if (today >= term.startDate && today <= term.endDate) return current
  return mondayOf(term.startDate)
}

/** Preferred default term: an ACTIVE term containing today, then any ACTIVE term, then a term containing today. */
export function defaultTerm(terms: AcademicTerm[], today = todayIso()) {
  const contains = (term: AcademicTerm) => today >= term.startDate && today <= term.endDate
  return terms.find(term => term.status === 'ACTIVE' && contains(term)) ?? terms.find(term => term.status === 'ACTIVE') ?? terms.find(contains)
}

/** The term to select when a semester is chosen: ACTIVE first, otherwise the most recent by start date. */
export function termForSemester(terms: AcademicTerm[], semesterId: string) {
  const candidates = terms.filter(term => term.semesterId === semesterId)
  return candidates.find(term => term.status === 'ACTIVE') ?? [...candidates].sort((a, b) => b.startDate.localeCompare(a.startDate))[0]
}

// ---- Calendar layout -------------------------------------------------------
export const HOUR_HEIGHT = 76 // 760 px for the 10 visible hours of node 34:4391
export const DEFAULT_RANGE = { start: 8 * 60, end: 18 * 60 }

/** Visible range: the Figma 08:00–18:00 window, widened to whole hours when real classes fall outside it. */
export function visibleRange(events: { startMinutes: number; endMinutes: number }[]) {
  let start = DEFAULT_RANGE.start, end = DEFAULT_RANGE.end
  for (const event of events) {
    if (Number.isFinite(event.startMinutes)) start = Math.min(start, Math.floor(event.startMinutes / 60) * 60)
    if (Number.isFinite(event.endMinutes)) end = Math.max(end, Math.ceil(event.endMinutes / 60) * 60)
  }
  return { start: Math.max(0, start), end: Math.min(24 * 60, Math.max(end, start + 60)) }
}

export const eventTop = (startMinutes: number, rangeStart: number) => (startMinutes - rangeStart) / 60 * HOUR_HEIGHT
export const eventHeight = (startMinutes: number, endMinutes: number) => Math.max(18, (endMinutes - startMinutes) / 60 * HOUR_HEIGHT - 2)

/** Lanes for simultaneous classes: each transitively overlapping group shares the column width. */
export function layoutLanes<T extends { startMinutes: number; endMinutes: number; meetingId: string }>(events: T[]) {
  const sorted = [...events].sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes || a.meetingId.localeCompare(b.meetingId))
  const groups: T[][] = []
  let groupEnd = -1
  for (const event of sorted) {
    if (event.startMinutes >= groupEnd) { groups.push([event]); groupEnd = event.endMinutes }
    else { groups[groups.length - 1].push(event); groupEnd = Math.max(groupEnd, event.endMinutes) }
  }
  return groups.flatMap(group => {
    const laneEnds: number[] = []
    return group.map(event => {
      let lane = laneEnds.findIndex(end => end <= event.startMinutes)
      if (lane === -1) { lane = laneEnds.length; laneEnds.push(event.endMinutes) } else laneEnds[lane] = event.endMinutes
      return { event, lane, lanes: 0 }
    }).map(item => ({ ...item, lanes: laneEnds.length }))
  })
}

/** Days shown: Monday–Saturday as designed, plus Sunday whenever a supported Sunday class exists. */
export function visibleDays(events: { date: string }[]) {
  return events.some(event => isoWeekday(event.date) === 7) ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5, 6]
}

// ---- Faculty colors (legend of node 34:4266) --------------------------------
export const facultyPalette: FacultyColor[] = [
  { key: 'information', label: 'Information', color: '#6366f1', background: '#eef0ff', foreground: '#4338ca' },
  { key: 'engineering', label: 'Engineering', color: '#2563eb', background: '#dbeafe', foreground: '#1d4ed8' },
  { key: 'business', label: 'Business', color: '#d97706', background: '#fef3c7', foreground: '#b45309' },
  { key: 'science', label: 'Science', color: '#059669', background: '#d1fae5', foreground: '#047857' },
  { key: 'medicine', label: 'Medicine', color: '#e11d48', background: '#ffe4e6', foreground: '#be123c' },
  { key: 'liberal', label: 'Liberal', color: '#c026d3', background: '#fce7f3', foreground: '#a21caf' },
]
export const neutralFacultyColor: FacultyColor = { key: 'neutral', label: 'Other', color: '#64748b', background: '#f1f5f9', foreground: '#334155' }
const facultyKeywords: [RegExp, string][] = [
  [/information|informatics|computing|computer|digital|\bict\b|\bit\b/i, 'information'],
  [/engineer/i, 'engineering'],
  [/business|management|account|commerce|economic|finance|marketing/i, 'business'],
  [/science/i, 'science'],
  [/medic|nurs|health|pharm|dent|clinic|hospital/i, 'medicine'],
  [/liberal|\barts?\b|humanit|communication|language|social/i, 'liberal'],
]
/** Stable colors by faculty identity: a recognised faculty name takes its legend color, anything else stays neutral. */
export function facultyColorFor(faculty: { id: string; name: string; code?: string } | undefined): FacultyColor {
  if (!faculty) return neutralFacultyColor
  const text = `${faculty.name} ${faculty.code ?? ''}`
  const match = facultyKeywords.find(([pattern]) => pattern.test(text))
  return facultyPalette.find(entry => entry.key === match?.[1]) ?? neutralFacultyColor
}
export function facultyColorMap(faculties: TimetableOption[]) {
  return new Map(faculties.map(faculty => [faculty.id, facultyColorFor(faculty)]))
}
export const shortFacultyName = (name: string) => name.replace(/^Faculty of\s+/i, '').trim()

// ---- Filter cascades -----------------------------------------------------
export function departmentsFor(options: { departments: TimetableOption[] }, facultyId: string) {
  return options.departments.filter(department => !facultyId || department.parentId === facultyId)
}
export function coursesFor(options: { departments: TimetableOption[]; courses: TimetableOption[] }, facultyId: string, departmentId: string) {
  if (departmentId) return options.courses.filter(course => course.parentId === departmentId)
  if (!facultyId) return options.courses
  const departments = new Set(departmentsFor(options, facultyId).map(department => department.id))
  return options.courses.filter(course => course.parentId != null && departments.has(course.parentId))
}
export function roomsFor(options: { rooms: TimetableOption[] }, buildingId: string) {
  return buildingId ? options.rooms.filter(room => room.parentId === buildingId) : []
}

/** Applies one filter change and clears selections that the new value makes incompatible. */
export function applyFilterChange(previous: TimetableFilters, key: keyof TimetableFilters, value: string, context: { options: { departments: TimetableOption[]; courses: TimetableOption[] }; terms: AcademicTerm[] }): TimetableFilters {
  const next = { ...previous, [key]: value }
  if (key === 'semesterId') next.academicTermId = value ? (termForSemester(context.terms, value)?.id ?? '') : ''
  if (key === 'academicTermId') next.semesterId = context.terms.find(term => term.id === value)?.semesterId ?? (value ? previous.semesterId : '')
  if (key === 'facultyId' || key === 'departmentId') {
    if (!departmentsFor(context.options, next.facultyId).some(department => department.id === next.departmentId)) next.departmentId = ''
    if (!coursesFor(context.options, next.facultyId, next.departmentId).some(course => course.id === next.courseId)) next.courseId = ''
  }
  return next
}

/** Calendar/list/conflict query parameters supported by the backend for the current filters. */
export function serverFilters(filters: TimetableFilters, view: 'meetings' | 'conflicts') {
  const params: Record<string, string> = {}
  if (filters.academicTermId) params.academicTermId = filters.academicTermId
  if (filters.facultyId) params.facultyId = filters.facultyId
  if (filters.departmentId) params.departmentId = filters.departmentId
  // GET /timetable/conflicts has no courseId filter (CONFLICT_FILTERS), so it is only sent for meetings.
  if (filters.courseId && view === 'meetings') params.courseId = filters.courseId
  return params
}

// ---- Form -------------------------------------------------------------------
export const meetingTypes: { value: 'LECTURE' | 'LAB' | 'TUTORIAL'; label: string }[] = [{ value: 'LECTURE', label: 'Lecture' }, { value: 'LAB', label: 'Lab' }, { value: 'TUTORIAL', label: 'Tutorial' }]
export const meetingTypeLabel = (value: string) => meetingTypes.find(type => type.value === value)?.label ?? value

export const emptyScheduleDraft: ScheduleDraft = { courseId: '', courseSectionId: '', meetingType: 'LECTURE', dayOfWeek: '', startTime: '', endTime: '', buildingId: '', roomId: '', effectiveFrom: '', effectiveTo: '', enrollmentDueDate: '', notes: '' }

export function draftFromMeeting(meeting: MeetingDetail): ScheduleDraft {
  return {
    courseId: meeting.course.id,
    courseSectionId: meeting.courseSection.id,
    meetingType: meeting.meetingType,
    dayOfWeek: String(meeting.dayOfWeek),
    startTime: meeting.startTime,
    endTime: meeting.endTime,
    buildingId: meeting.location.buildingId ?? '',
    roomId: meeting.location.roomId ?? '',
    effectiveFrom: meeting.effectiveFrom,
    effectiveTo: meeting.effectiveTo,
    enrollmentDueDate: meeting.enrollmentDueDate ?? '',
    notes: meeting.notes ?? '',
  }
}

const validId = (value: string) => /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value))

/** Mirrors TimetableMeetingRequest/TimetableMeetingSlot validation and the term date window. */
export function validateScheduleDraft(draft: ScheduleDraft, context: { term?: { startDate: string; endDate: string } | null; sectionHasTerm: boolean }) {
  const errors: Partial<Record<ScheduleField, string>> = {}
  if (!validId(draft.courseId)) errors.courseId = 'Select a course.'
  if (!validId(draft.courseSectionId)) errors.courseSectionId = 'Select a section of the course.'
  else if (!context.sectionHasTerm) errors.courseSectionId = 'This section has no academic term. Assign one in Course Sections before scheduling it.'
  if (!['LECTURE', 'LAB', 'TUTORIAL'].includes(draft.meetingType)) errors.meetingType = 'Select a class type.'
  const day = Number(draft.dayOfWeek)
  if (!/^[1-7]$/.test(draft.dayOfWeek) || day < 1 || day > 7) errors.dayOfWeek = 'Select a day of the week.'
  const start = minutesFromTime(draft.startTime), end = minutesFromTime(draft.endTime)
  if (Number.isNaN(start)) errors.startTime = 'Enter a start time.'
  if (Number.isNaN(end)) errors.endTime = 'Enter an end time.'
  else if (!Number.isNaN(start) && end <= start) errors.endTime = 'The end time must be after the start time.'
  if (!validId(draft.buildingId)) errors.buildingId = 'Select a building.'
  if (!validId(draft.roomId)) errors.roomId = draft.buildingId ? 'Select a room in this building.' : 'Select a building first.'
  if (!isIsoDate(draft.effectiveFrom)) errors.effectiveFrom = 'Enter the first date of this schedule.'
  if (!isIsoDate(draft.effectiveTo)) errors.effectiveTo = 'Enter the last date of this schedule.'
  else if (isIsoDate(draft.effectiveFrom) && draft.effectiveTo < draft.effectiveFrom) errors.effectiveTo = 'The last date must not be before the first date.'
  if (context.term && !errors.effectiveFrom && !errors.effectiveTo && (draft.effectiveFrom < context.term.startDate || draft.effectiveTo > context.term.endDate)) {
    errors.effectiveTo = `Dates must lie within the academic term (${formatDate(context.term.startDate)} – ${formatDate(context.term.endDate)}).`
  }
  if (draft.enrollmentDueDate) {
    if (!isIsoDate(draft.enrollmentDueDate)) errors.enrollmentDueDate = 'Enter a valid date, or leave it empty for no deadline.'
    else if (isIsoDate(draft.effectiveFrom) && draft.enrollmentDueDate > draft.effectiveFrom) errors.enrollmentDueDate = 'The enrollment due date must not be after the Effective From date.'
  }
  if (draft.notes.length > 2000) errors.notes = 'Use at most 2000 characters.'
  return errors
}

/** Backend TimetableMeetingSlot (PUT body and the slot part of POST). */
export function scheduleSlotPayload(draft: ScheduleDraft) {
  if (!validId(draft.roomId)) throw new Error('Select a room.')
  const payload: Record<string, unknown> = {
    roomId: Number(draft.roomId),
    meetingType: draft.meetingType,
    dayOfWeek: Number(draft.dayOfWeek),
    startTime: draft.startTime,
    endTime: draft.endTime,
    effectiveFrom: draft.effectiveFrom,
    effectiveTo: draft.effectiveTo,
  }
  if (draft.enrollmentDueDate) payload.enrollmentDueDate = draft.enrollmentDueDate
  const notes = draft.notes.trim()
  if (notes) payload.notes = notes
  return payload
}

/** Backend TimetableMeetingRequest (POST body): the slot plus the section it belongs to. */
export function schedulePayload(draft: ScheduleDraft) {
  if (!validId(draft.courseSectionId)) throw new Error('Select a section.')
  return { courseSectionId: Number(draft.courseSectionId), ...scheduleSlotPayload(draft) }
}

/** Backend TimetableConflictCheckRequest for the pre-save check (same slot, no notes). */
export function conflictCheckPayload(draft: ScheduleDraft, meetingId?: string) {
  const slot = scheduleSlotPayload(draft)
  delete slot.notes
  delete slot.enrollmentDueDate
  return { ...(meetingId ? { meetingId: Number(meetingId) } : {}), courseSectionId: Number(draft.courseSectionId), ...slot }
}

export function describeConflictType(type: ConflictPair['type']) {
  return type === 'ROOM_CONFLICT' ? 'Room overlap' : type === 'LECTURER_CONFLICT' ? 'Lecturer overlap' : 'Section overlap'
}
export function conflictResource(pair: ConflictPair) {
  if (pair.type === 'ROOM_CONFLICT') return pair.roomNumber ? `Room ${pair.roomNumber}` : 'Room (rescheduled occurrence)'
  if (pair.type === 'LECTURER_CONFLICT') return pair.lecturerName ?? 'Lecturer'
  return `${pair.meetingA.courseCode} section ${pair.meetingA.sectionNumber}`
}
export function describeConflictPair(pair: ConflictPair) {
  const kind = pair.type === 'ROOM_CONFLICT' ? 'share a room' : pair.type === 'LECTURER_CONFLICT' ? 'share a lecturer' : 'belong to the same section'
  return `These two published schedules ${kind} and overlap on ${pair.occurrenceCount} ${pair.occurrenceCount === 1 ? 'date' : 'dates'}, first on ${formatDate(pair.firstDate)} ${pair.overlapStart}–${pair.overlapEnd}.`
}

export const statusLabel = (status: string) => status === 'PUBLISHED' ? 'Published' : status === 'DRAFT' ? 'Draft' : status === 'CANCELLED' ? 'Cancelled' : status
export const statusTone = (status: string) => status === 'PUBLISHED' ? { bg: '#d1fae5', text: '#059669' } : status === 'DRAFT' ? { bg: '#fef3c7', text: '#b45309' } : { bg: '#f3f4f6', text: '#6b7280' }

// ---- Errors ------------------------------------------------------------------
interface ApiFailure { isAxiosError?: boolean; code?: string; response?: { status?: number; data?: { code?: string; message?: string } } }

const fieldForCode: Record<string, ScheduleField> = {
  TIMETABLE_INVALID_TIME: 'endTime',
  TIMETABLE_INVALID_DATE_RANGE: 'effectiveTo',
  TIMETABLE_INVALID_ENROLLMENT_DUE_DATE: 'enrollmentDueDate',
  TIMETABLE_INVALID_WEEKDAY: 'dayOfWeek',
  TIMETABLE_ROOM_NOT_FOUND: 'roomId',
  TIMETABLE_ROOM_UNAVAILABLE: 'roomId',
  COURSE_SECTION_NOT_FOUND: 'courseSectionId',
  COURSE_SECTION_INACTIVE: 'courseSectionId',
  TIMETABLE_LECTURER_NOT_FOUND: 'courseSectionId',
  ACADEMIC_TERM_NOT_FOUND: 'courseSectionId',
  ACADEMIC_TERM_CLOSED: 'courseSectionId',
}
const messages: Record<string, string> = {
  VALIDATION_ERROR: 'The request is invalid. Check the entered values.',
  TIMETABLE_INVALID_TIME: 'The end time must be after the start time.',
  TIMETABLE_INVALID_DATE_RANGE: 'The schedule dates must lie within the academic term and the last date must not be before the first.',
  TIMETABLE_INVALID_WEEKDAY: 'Select a weekday from Monday to Sunday.',
  TIMETABLE_ROOM_NOT_FOUND: 'The selected room does not exist or was deleted.',
  TIMETABLE_ROOM_UNAVAILABLE: 'The selected room, its building or its campus is not available for scheduling.',
  TIMETABLE_LECTURER_NOT_FOUND: "The section's lecturer does not exist or is inactive.",
  COURSE_SECTION_NOT_FOUND: 'The selected course section does not exist.',
  COURSE_SECTION_INACTIVE: 'The course section is not active, or its course or lecturer is inactive.',
  ACADEMIC_TERM_NOT_FOUND: 'The course section has no academic term. Assign one in Course Sections before scheduling it.',
  ACADEMIC_TERM_CLOSED: 'The academic term is closed; its timetable can no longer change.',
  ACADEMIC_TERM_IN_USE: 'Course sections still reference this academic term, so it cannot be deleted.',
  ACADEMIC_TERM_ALREADY_EXISTS: 'This semester already has a term with that academic year code.',
  SEMESTER_NOT_FOUND: 'The selected semester does not exist or was deleted.',
  TIMETABLE_MEETING_NOT_FOUND: 'This schedule no longer exists. It may have been deleted by another administrator.',
  TIMETABLE_EXCEPTION_NOT_FOUND: 'The schedule exception no longer exists.',
  TIMETABLE_ROOM_CONFLICT: 'The selected room is already booked by another published class during this time.',
  TIMETABLE_LECTURER_CONFLICT: 'The lecturer already teaches another published class during this time.',
  TIMETABLE_SECTION_CONFLICT: 'This course section already has a published class during this time.',
  TIMETABLE_PUBLISH_NOT_ALLOWED: 'This schedule cannot be published: it needs a campus room and dates inside the term, and a cancelled series cannot be republished.',
  TIMETABLE_EXCEPTION_INVALID: 'The schedule exception is invalid for this meeting.',
  TIMETABLE_CONCURRENT_MODIFICATION: 'Another administrator is changing the same room, lecturer or section right now. Try again in a moment.',
  PASSWORD_CHANGE_REQUIRED: 'Change your password before managing the timetable.',
}

/** Safe copy for timetable failures. Mutations get the uncertain-result wording for network/timeout failures. */
export function timetableError(error: unknown, kind: 'read' | 'write' = 'read') {
  const failure = error as ApiFailure | null
  const response = failure?.response
  const code = response?.data?.code
  const fields: Partial<Record<ScheduleField, string>> = {}
  let message = kind === 'write' ? 'The change could not be saved. Please try again.' : 'Timetable data could not be loaded. Please retry.'
  if (!response) {
    if (failure?.isAxiosError || failure?.code === 'ECONNABORTED' || failure?.code === 'ERR_NETWORK') {
      message = kind === 'write' ? 'The server did not respond. The change may or may not have been saved, so refresh the timetable before retrying.' : 'Unable to connect to the server. Please retry.'
    } else if (error instanceof Error && error.message && !/^Unexpected/.test(error.message)) message = error.message
    return { message, fields, code, status: undefined as number | undefined }
  }
  if (response.status === 401) message = 'Your session expired. Sign in again.'
  else if (response.status === 403) message = code === 'PASSWORD_CHANGE_REQUIRED' ? messages.PASSWORD_CHANGE_REQUIRED : 'You do not have permission to manage the timetable.'
  else if (code && messages[code]) message = messages[code]
  else if (response.status === 404) message = 'The requested record was not found.'
  else if (response.status === 409) message = 'The request conflicts with current server data. Refresh and try again.'
  else if (response.status === 400) message = 'The request is invalid. Check the entered values.'
  else if ((response.status ?? 0) >= 500) message = 'The server reported an error. Please try again later.'
  const field = code ? fieldForCode[code] : undefined
  if (field) fields[field] = message
  return { message, fields, code, status: response.status }
}

export const isMissingMeeting = (error: unknown) => (error as ApiFailure | null)?.response?.data?.code === 'TIMETABLE_MEETING_NOT_FOUND' || (error as ApiFailure | null)?.response?.status === 404

/** True when a created or updated schedule would be hidden by the current filters. */
export function hiddenByFilters(filters: TimetableFilters, meeting: MeetingDetail) {
  return !!((filters.academicTermId && meeting.academicTerm?.id !== filters.academicTermId) || (filters.facultyId && meeting.faculty.id !== filters.facultyId) || (filters.departmentId && meeting.department.id !== filters.departmentId) || (filters.courseId && meeting.course.id !== filters.courseId))
}


/** "SEC-01" style label for a course-section reference (the backend code is the section number). */
export function sectionLabel(ref: { code: string; name: string }) {
  const raw = (ref.code || ref.name).trim()
  return /^sec[-\s]?/i.test(raw) ? raw.toUpperCase() : `SEC-${raw}`
}

/** Semester filter choices: the distinct semesters that have at least one academic term. */
export function semesterOptions(terms: AcademicTerm[]) {
  const seen = new Map<string, string>()
  for (const term of terms) if (!seen.has(term.semesterId)) seen.set(term.semesterId, term.semesterNameEn)
  return [...seen].map(([value, label]) => ({ value, label }))
}

/** Academic Year filter choices: the terms of the chosen semester (or all terms), disambiguated when a label repeats. */
export function academicYearOptions(terms: AcademicTerm[], semesterId: string) {
  const rows = semesterId ? terms.filter(term => term.semesterId === semesterId) : terms
  const labelCount = new Map<string, number>()
  for (const term of rows) labelCount.set(term.academicYearLabel, (labelCount.get(term.academicYearLabel) ?? 0) + 1)
  return rows.map(term => ({ value: term.id, label: (labelCount.get(term.academicYearLabel) ?? 0) > 1 ? `${term.academicYearLabel} · ${term.semesterNameEn}` : term.academicYearLabel }))
}

/** Element ids shared by the tab buttons and their panels. */
export const tabPanelId = (tab: 'timetable' | 'conflicts') => `timetable-panel-${tab}`
export const tabId = (tab: 'timetable' | 'conflicts') => `timetable-tab-${tab}`
