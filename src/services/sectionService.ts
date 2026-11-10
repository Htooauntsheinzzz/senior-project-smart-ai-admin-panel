import apiClient from '../api/apiClient'
import type { SectionFilters } from '../types/courseSection'

export type ApiSection = {
  id: string
  courseId: string
  courseCode: string
  courseName: string
  sectionNumber: string
  capacity: number
  enrolledCount: number
  isFull: boolean
  lectureId: string
  lectureNameTh: string
  lectureNameEn: string
  lectureNickname?: string
  semesterId: string
  semesterNameTh: string
  semesterNameEn: string
  // Backend spec 44: on the published timetable, and whether its enrollment due date is still open.
  scheduled?: boolean
  enrollmentDueDate?: string
  enrollmentOpen?: boolean
  // Optional year-specific term (Flyway V41); required before a section can appear on the timetable.
  academicTermId: string | null
  academicYearCode: string | null
  academicYearLabel: string | null
  status: 'ACTIVE' | 'CLOSED'
}

export type SectionSummary = {
  totalSections: number
  activeSections: number
  closedSections: number
  fullSections: number
  totalEnrolled: number
}

const count = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0

export function sectionPath(id: string) {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) throw new Error('Invalid section ID.')
  return `/course-sections/${id}`
}

export function sectionPayload(value: Record<string, string>) {
  if (!/^[1-9]\d*$/.test(value.courseId) || !Number.isSafeInteger(Number(value.courseId))) throw new Error('Invalid course ID.')
  if (!/^[1-9]\d*$/.test(value.lecturerId) || !Number.isSafeInteger(Number(value.lecturerId))) throw new Error('Invalid lecturer ID.')
  if (!/^[1-9]\d*$/.test(value.semester) || !Number.isSafeInteger(Number(value.semester))) throw new Error('Invalid semester ID.')
  if (!['active', 'closed'].includes(value.status) || !value.number.trim() || value.number.trim().length > 20) throw new Error('Invalid section values.')
  const payload: Record<string, unknown> = {
    courseId: Number(value.courseId),
    sectionNumber: value.number.trim(),
    lectureId: Number(value.lecturerId),
    semesterId: Number(value.semester),
    status: value.status === 'active' ? 'ACTIVE' : 'CLOSED',
  }
  if (value.capacity.trim()) {
    const cap = Number(value.capacity)
    if (!/^\d+$/.test(value.capacity.trim()) || !Number.isSafeInteger(cap) || cap <= 0 || cap > 2147483647) throw new Error('Invalid capacity.')
    payload.capacity = cap
  }
  if (value.academicTermId) {
    if (!/^[1-9]\d*$/.test(value.academicTermId) || !Number.isSafeInteger(Number(value.academicTermId))) throw new Error('Invalid academic term ID.')
    payload.academicTermId = Number(value.academicTermId)
  }
  return payload
}

export function mapSection(value: unknown): ApiSection {
  const row = value as Record<string, unknown> | null
  if (!row || !count(row.id) || !row.id || !count(row.courseId) || !row.courseId || typeof row.courseCode !== 'string' || typeof row.courseName !== 'string' ||
      typeof row.sectionNumber !== 'string' || !count(row.capacity) || !row.capacity || !count(row.enrolledCount) || typeof row.isFull !== 'boolean' ||
      !count(row.lectureId) || !row.lectureId || typeof row.lectureNameTh !== 'string' || typeof row.lectureNameEn !== 'string' ||
      !count(row.semesterId) || !row.semesterId || typeof row.semesterNameTh !== 'string' || typeof row.semesterNameEn !== 'string' ||
      !['ACTIVE', 'CLOSED'].includes(String(row.status))) throw new Error('Unexpected section response.')
  return {
    id: String(row.id),
    courseId: String(row.courseId),
    courseCode: row.courseCode,
    courseName: row.courseName,
    sectionNumber: row.sectionNumber,
    capacity: row.capacity as number,
    enrolledCount: row.enrolledCount as number,
    isFull: row.isFull as boolean,
    lectureId: String(row.lectureId),
    lectureNameTh: row.lectureNameTh,
    lectureNameEn: row.lectureNameEn,
    lectureNickname: row.lectureNickname == null ? undefined : String(row.lectureNickname),
    semesterId: String(row.semesterId),
    semesterNameTh: row.semesterNameTh,
    semesterNameEn: row.semesterNameEn,
    scheduled: typeof row.scheduled === 'boolean' ? row.scheduled : undefined,
    enrollmentDueDate: typeof row.enrollmentDueDate === 'string' ? row.enrollmentDueDate : undefined,
    enrollmentOpen: typeof row.enrollmentOpen === 'boolean' ? row.enrollmentOpen : undefined,
    academicTermId: row.academicTermId == null ? null : String(row.academicTermId),
    academicYearCode: row.academicYearCode == null ? null : String(row.academicYearCode),
    academicYearLabel: row.academicYearLabel == null ? null : String(row.academicYearLabel),
    status: row.status === 'ACTIVE' ? 'ACTIVE' : 'CLOSED',
  }
}

export interface SectionPage {
  content: unknown[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface SectionListParams {
  page?: number
  size?: number
  search?: string
  courseId?: number
  semesterId?: number
  lectureId?: number
  status?: string
  /** true = only sections with a published timetable meeting (backend spec 44). */
  scheduled?: boolean
  sort?: string
}

export async function getSections(params: SectionListParams = {}, signal?: AbortSignal): Promise<SectionPage> {
  const response = await apiClient.get('/course-sections', { params, signal })
  return response.data
}

export async function getSectionDirectory(filters: SectionFilters, signal?: AbortSignal): Promise<ApiSection[]> {
  const rows: ApiSection[] = []
  if (filters.courseId && (!/^[1-9]\d*$/.test(filters.courseId) || !Number.isSafeInteger(Number(filters.courseId)))) throw new Error('Invalid course ID.')
  if (filters.semester && (!/^[1-9]\d*$/.test(filters.semester) || !Number.isSafeInteger(Number(filters.semester)))) throw new Error('Invalid semester ID.')
  if (filters.lecturerId && (!/^[1-9]\d*$/.test(filters.lecturerId) || !Number.isSafeInteger(Number(filters.lecturerId)))) throw new Error('Invalid lecturer ID.')
  if (filters.status && !['active', 'closed', 'full'].includes(filters.status)) throw new Error('Invalid section status.')
  if (filters.query.trim().length > 255) throw new Error('Search must be at most 255 characters.')
  let total = -1
  for (let page = 0; page < 20; page++) {
    const data = await getSections({
      page, size: 100, sort: 'id,asc',
      search: filters.query.trim() || undefined,
      courseId: filters.courseId ? Number(filters.courseId) : undefined,
      semesterId: filters.semester ? Number(filters.semester) : undefined,
      lectureId: filters.lecturerId ? Number(filters.lecturerId) : undefined,
      status: filters.status && filters.status !== 'full' ? filters.status.toUpperCase() : undefined,
    }, signal)
    if (!data || !Array.isArray(data.content) || data.page !== page || data.size !== 100 || !count(data.totalElements) || !count(data.totalPages)) throw new Error('Unexpected section page response.')
    if (data.totalElements > 2000 || data.totalPages > 20) throw new Error('Too many sections to display completely. Narrow your filters.')
    if (total !== -1 && total !== data.totalElements) throw new Error('Section data changed while loading. Please retry.')
    total = data.totalElements
    rows.push(...data.content.map(mapSection))
    if (page >= data.totalPages - 1) {
      if (rows.length !== total || new Set(rows.map(row => row.id)).size !== rows.length) throw new Error('Section data changed while loading. Please retry.')
      return rows
    }
  }
  throw new Error('Incomplete section directory.')
}

export async function getSectionSummary(signal?: AbortSignal): Promise<SectionSummary> {
  const { data } = await apiClient.get('/course-sections/summary', { signal })
  if (!data || !['totalSections', 'activeSections', 'closedSections', 'fullSections', 'totalEnrolled'].every(key => count(data[key]))) throw new Error('Unexpected section summary response.')
  return data
}

export async function getSectionById(id: string) {
  const { data } = await apiClient.get(sectionPath(id))
  return mapSection(data)
}

export async function createSection(value: Record<string, string>) {
  const { data } = await apiClient.post('/course-sections', sectionPayload(value))
  return mapSection(data)
}
export async function updateSection(id: string, value: Record<string, string>) {
  if (!value.capacity.trim()) throw new Error('Capacity is required.')
  const { data } = await apiClient.put(sectionPath(id), sectionPayload(value))
  return mapSection(data)
}
export async function deleteSection(id: string) { await apiClient.delete(sectionPath(id)) }
