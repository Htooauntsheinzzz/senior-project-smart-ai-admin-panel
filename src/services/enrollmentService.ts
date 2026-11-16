import apiClient from '../api/apiClient'

export const enrollmentStatuses = ['PENDING', 'ACTIVE', 'WITHDRAWN', 'DROPPED'] as const
export type EnrollmentStatus = typeof enrollmentStatuses[number]
export type EnrollmentRow = {
  id: number; studentId: number; studentCode: string; studentName: string
  courseId: number; courseCode: string; courseName: string; courseSectionId: number; sectionNumber: string
  semesterId: number; semesterNameEn: string; semesterNameTh: string; enrollmentDate: string; status: EnrollmentStatus
}
export type EnrollmentDetail = EnrollmentRow & {
  universityEmail: string; lectureId: number; lectureNameEn: string; lectureNameTh: string
  capacity: number; enrolledCount: number; isFull: boolean
}
export type EnrollmentDraft = { studentId: string; courseSectionId: string; enrollmentDate: string; status: string }
export const emptyEnrollmentQuery = { search: '', studentId: '', courseId: '', courseSectionId: '', semesterId: '', status: '', enrollmentDate: '' }
export type EnrollmentQuery = typeof emptyEnrollmentQuery
export type EnrollmentPage = { content: EnrollmentRow[]; page: number; size: number; totalElements: number; totalPages: number }
export type EnrollmentSummary = { totalEnrollments: number; activeEnrollments: number; pendingEnrollments: number; withdrawnEnrollments: number; droppedEnrollments: number; withdrawnOrDropped: number }
const count = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0
function positiveId(value: string) {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error('Select a valid record ID.')
  return Number(value)
}
function validDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value }
function validStatus(value: unknown): value is EnrollmentStatus { return enrollmentStatuses.includes(value as EnrollmentStatus) }
export function allowedEnrollmentStatuses(current?: EnrollmentStatus): readonly EnrollmentStatus[] {
  if (!current || current === 'PENDING') return enrollmentStatuses
  return current === 'ACTIVE' ? ['ACTIVE', 'WITHDRAWN', 'DROPPED'] : [current]
}
export function enrollmentPath(id: string) { return `/enrollments/${positiveId(id)}` }
export function enrollmentPayload(draft: EnrollmentDraft) {
  if (!validStatus(draft.status)) throw new Error('Select a valid enrollment status.')
  if (draft.enrollmentDate && !validDate(draft.enrollmentDate)) throw new Error('Enter a valid enrollment date.')
  return { studentId: positiveId(draft.studentId), courseSectionId: positiveId(draft.courseSectionId), enrollmentDate: draft.enrollmentDate || null, status: draft.status }
}
export function mapEnrollment(value: unknown): EnrollmentRow {
  const row = value as EnrollmentRow
  if (!row || !['id', 'studentId', 'courseId', 'courseSectionId', 'semesterId'].every(k => count(row[k as keyof EnrollmentRow]) && Number(row[k as keyof EnrollmentRow]) > 0) ||
    !['studentCode', 'studentName', 'courseCode', 'courseName', 'sectionNumber', 'semesterNameEn', 'semesterNameTh'].every(k => typeof row[k as keyof EnrollmentRow] === 'string') || !validStatus(row.status) || !validDate(row.enrollmentDate)) throw new Error('Unexpected enrollment response.')
  return row
}
export function mapEnrollmentDetail(value: unknown): EnrollmentDetail {
  const row = value as EnrollmentDetail & { studentFirstName: string; studentLastName: string }
  if (!row || typeof row.studentFirstName !== 'string' || typeof row.studentLastName !== 'string' || typeof row.universityEmail !== 'string' || !count(row.lectureId) || !row.lectureId || typeof row.lectureNameEn !== 'string' || typeof row.lectureNameTh !== 'string' || !count(row.capacity) || !row.capacity || !count(row.enrolledCount) || typeof row.isFull !== 'boolean') throw new Error('Unexpected enrollment details.')
  return { ...row, ...mapEnrollment({ ...row, studentName: `${row.studentFirstName} ${row.studentLastName}`.trim() }) }
}
export async function getEnrollments(query: EnrollmentQuery, page = 0, size = 10, signal?: AbortSignal): Promise<EnrollmentPage> {
  if (!count(page) || !count(size) || size < 1 || size > 100) throw new Error('Invalid enrollment pagination.')
  const params: Record<string, string | number> = { page, size, sort: 'id,asc' }
  for (const key of Object.keys(emptyEnrollmentQuery) as (keyof EnrollmentQuery)[]) {
    const value = query[key].trim()
    if (!value) continue
    if (key.endsWith('Id')) params[key] = positiveId(value)
    else {
      if (key === 'status' && !validStatus(value)) throw new Error('Invalid status filter.')
      if (key === 'enrollmentDate' && !validDate(value)) throw new Error('Invalid enrollment date.')
      if (key === 'search' && value.length > 255) throw new Error('Search must be at most 255 characters.')
      params[key] = value
    }
  }
  const { data } = await apiClient.get('/enrollments', { params, signal })
  if (!data || !Array.isArray(data.content) || data.page !== page || data.size !== size || !count(data.totalElements) || !count(data.totalPages) || data.totalPages !== Math.ceil(data.totalElements / size)) throw new Error('Unexpected enrollment page.')
  const content: EnrollmentRow[] = data.content.map(mapEnrollment)
  if (content.length !== Math.min(size, Math.max(0, data.totalElements - page * size)) || new Set(content.map(r => r.id)).size !== content.length) throw new Error('Incomplete enrollment page.')
  return { ...data, content }
}
export async function getEnrollmentSummary(signal?: AbortSignal): Promise<EnrollmentSummary> {
  const { data } = await apiClient.get('/enrollments/summary', { signal })
  if (!data || !['totalEnrollments', 'activeEnrollments', 'pendingEnrollments', 'withdrawnEnrollments', 'droppedEnrollments', 'withdrawnOrDropped'].every(k => count(data[k]))) throw new Error('Unexpected enrollment summary.')
  return data
}
export async function getEnrollment(id: string) {
  const { data } = await apiClient.get(enrollmentPath(id))
  const row = mapEnrollmentDetail(data)
  if (row.id !== Number(id)) throw new Error('Unexpected enrollment ID.')
  return row
}
export async function saveEnrollment(draft: EnrollmentDraft, id?: string) {
  const payload = enrollmentPayload(draft)
  if (id) await apiClient.put(enrollmentPath(id), payload)
  else await apiClient.post('/enrollments', payload)
}
export async function setEnrollmentStatus(id: string, status: EnrollmentStatus) {
  if (!validStatus(status)) throw new Error('Invalid enrollment status.')
  await apiClient.patch(`${enrollmentPath(id)}/status`, { status })
}
export async function deleteEnrollment(id: string) { await apiClient.delete(enrollmentPath(id)) }
export async function getEnrollmentExport(query: EnrollmentQuery) {
  const rows: EnrollmentRow[] = []
  let total = -1
  for (let page = 0; page < 100; page++) {
    const result = await getEnrollments(query, page, 100)
    if (result.totalElements > 10000 || (total !== -1 && total !== result.totalElements)) throw new Error('Export is too large or changed while loading. Narrow your filters and retry.')
    total = result.totalElements; rows.push(...result.content)
    if (page + 1 >= result.totalPages) {
      if (rows.length !== total || new Set(rows.map(r => r.id)).size !== rows.length) throw new Error('Enrollment data changed during export. Retry.')
      return rows
    }
  }
  throw new Error('Export is too large. Narrow your filters.')
}
export function enrollmentCsv(rows: EnrollmentRow[]) {
  const keys = ['id', 'studentCode', 'studentName', 'courseCode', 'courseName', 'sectionNumber', 'enrollmentDate', 'semesterNameEn', 'status'] as const
  const cell = (value: unknown) => { const text = String(value ?? ''); return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replaceAll('"', '""')}"` }
  return [keys.join(','), ...rows.map(row => keys.map(key => cell(row[key])).join(','))].join('\r\n')
}
export function enrollmentError(error: unknown) {
  const response = (error as { response?: { status?: number; data?: { code?: string } } })?.response
  const messages: Record<string, string> = {
    ENROLLMENT_ALREADY_EXISTS: 'This student already has an enrollment for this section, including historical or deleted records.',
    STUDENT_ALREADY_ENROLLED_IN_COURSE: 'This student already holds a seat in this course for the selected semester.',
    COURSE_SECTION_FULL: 'This section is full. Pending and Active enrollments both reserve seats.',
    COURSE_SECTION_NOT_IN_TIMETABLE: 'This section has no published timetable yet. Publish its class schedule in Timetable first.',
    ENROLLMENT_DUE_DATE_PASSED: 'The enrollment due date of this section has passed.',
    COURSE_SECTION_NOT_AVAILABLE: 'The section is closed or unavailable.',
    ENROLLMENT_STUDENT_NOT_ELIGIBLE: 'Only active, non-deleted students can be enrolled.',
    INVALID_ENROLLMENT_STATUS_TRANSITION: 'That status transition is not allowed. Reload the enrollment.',
    ENROLLMENT_UPDATE_NOT_ALLOWED: 'Only Pending enrollments may be moved to another student or section.',
    INVALID_ENROLLMENT_STATUS: 'Choose a supported enrollment status.',
    DATABASE_CONSTRAINT_VIOLATION: 'The request conflicts with existing data. Reload and retry.',
  }
  if (response?.status === 401) return 'Your session expired. Sign in again.'
  if (response?.status === 403) return 'You do not have permission to manage enrollments, or must change your password first.'
  if (response?.status === 404) return 'The enrollment, student or section no longer exists. Reload and retry.'
  if (response && [400, 409].includes(response.status ?? 0) && messages[response.data?.code ?? '']) return messages[response.data?.code ?? '']
  if (response?.status === 400) return 'Check the selected student, section, date and status.'
  if (response?.status === 409) return 'Enrollment data changed or conflicts with another record. Reload and retry.'
  return 'Unable to complete the enrollment request. Please retry.'
}
