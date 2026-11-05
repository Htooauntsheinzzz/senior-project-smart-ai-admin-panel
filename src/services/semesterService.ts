import apiClient from '../api/apiClient'
import { getSemesters, type Semester } from './courseService'

// Courses and Course Sections keep using the lightweight lookup from courseService.
export { getSemesters }
export type { Semester }

// Backend contract (feature/semester): SemesterCreateRequest and SemesterUpdateRequest
// both take academicYear (2000–2100) plus Thai/English names (max 150). There is no
// status field. DELETE is a soft delete that returns 204.
export type SemesterDraft = { academicYear: string; semesterNameTh: string; semesterNameEn: string }
export type SemesterField = keyof SemesterDraft
export type ApiSemester = {
  id: string
  academicYear: number
  semesterNameTh: string
  semesterNameEn: string
  createdAt: string | null
  updatedAt: string | null
}
export type SemesterListParams = { page: number; size: number; search?: string; academicYear?: number }
export type SemesterPage = { rows: ApiSemester[]; page: number; size: number; totalElements: number; totalPages: number }

export const MIN_ACADEMIC_YEAR = 2000
export const MAX_ACADEMIC_YEAR = 2100
const count = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0
const timestamp = (value: unknown) => value == null ? null : typeof value === 'string' ? value : typeof value === 'number' && Number.isFinite(value) ? new Date(value * 1000).toISOString() : undefined
export const validAcademicYear = (value: string) => /^\d{4}$/.test(value.trim()) && Number(value) >= MIN_ACADEMIC_YEAR && Number(value) <= MAX_ACADEMIC_YEAR

export function semesterPath(id: string) {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) throw new Error('Invalid semester ID.')
  return `/semesters/${id}`
}

export function validateSemester(value: SemesterDraft) {
  const errors: Partial<Record<SemesterField, string>> = {}
  if (!value.academicYear.trim()) errors.academicYear = 'Academic year is required.'
  else if (!validAcademicYear(value.academicYear)) errors.academicYear = `Enter a year between ${MIN_ACADEMIC_YEAR} and ${MAX_ACADEMIC_YEAR}.`
  if (!value.semesterNameTh.trim()) errors.semesterNameTh = 'Semester name in Thai is required.'
  else if (value.semesterNameTh.trim().length > 150) errors.semesterNameTh = 'Use at most 150 characters.'
  if (!value.semesterNameEn.trim()) errors.semesterNameEn = 'Semester name in English is required.'
  else if (value.semesterNameEn.trim().length > 150) errors.semesterNameEn = 'Use at most 150 characters.'
  return errors
}

export function semesterPayload(value: SemesterDraft) {
  if (Object.keys(validateSemester(value)).length) throw new Error('Check the semester details.')
  return { academicYear: Number(value.academicYear.trim()), semesterNameTh: value.semesterNameTh.trim(), semesterNameEn: value.semesterNameEn.trim() }
}

export function mapApiSemester(value: unknown): ApiSemester {
  const row = value as Record<string, unknown> | null
  const createdAt = timestamp(row?.createdAt), updatedAt = timestamp(row?.updatedAt)
  if (!row || !count(row.id) || !row.id || !count(row.academicYear) || typeof row.semesterNameTh !== 'string' || typeof row.semesterNameEn !== 'string' ||
      createdAt === undefined || updatedAt === undefined) throw new Error('Unexpected semester response.')
  return { id: String(row.id), academicYear: row.academicYear, semesterNameTh: row.semesterNameTh, semesterNameEn: row.semesterNameEn, createdAt, updatedAt }
}

// GET /semesters returns the page object directly (no success/data wrapper).
export async function getSemesterPage(params: SemesterListParams, signal?: AbortSignal): Promise<SemesterPage> {
  const search = params.search?.trim()
  if (search && search.length > 150) throw new Error('Search must be at most 150 characters.')
  const { data } = await apiClient.get('/semesters', {
    params: { page: params.page, size: params.size, search: search || undefined, academicYear: params.academicYear, sort: 'academicYear,desc' },
    signal,
  })
  if (!data || !Array.isArray(data.content) || data.page !== params.page || data.size !== params.size || !count(data.totalElements) || !count(data.totalPages)) throw new Error('Unexpected semester page response.')
  return { rows: data.content.map(mapApiSemester), page: data.page, size: data.size, totalElements: data.totalElements, totalPages: data.totalPages }
}

export async function getSemesterById(id: string) {
  const { data } = await apiClient.get(semesterPath(id))
  return mapApiSemester(data)
}

export async function createSemester(value: SemesterDraft) {
  const { data } = await apiClient.post('/semesters', semesterPayload(value))
  return mapApiSemester(data)
}

export async function updateSemester(id: string, value: SemesterDraft) {
  const path = semesterPath(id)
  const { data } = await apiClient.put(path, semesterPayload(value))
  return mapApiSemester(data)
}

export async function deleteSemester(id: string) {
  await apiClient.delete(semesterPath(id))
}

export function formatSemesterDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function semesterError(error: unknown) {
  const response = (error as { response?: { status: number; data?: { code?: string } } })?.response
  const fields: Partial<Record<SemesterField, string>> = {}
  let message = 'Unable to complete the request. Please try again.'
  const code = response?.data?.code
  if (!response) {
    if (error instanceof Error && ['Search must be at most 150 characters.', 'Invalid semester ID.'].includes(error.message)) message = error.message
    else if ((error as { isAxiosError?: boolean })?.isAxiosError) message = 'Unable to connect to the server. Please try again.'
  } else if (code === 'SEMESTER_ALREADY_EXISTS') {
    message = 'A semester with these Thai and English names already exists for this academic year.'
    fields.academicYear = fields.semesterNameTh = fields.semesterNameEn = message
  } else if (code === 'PASSWORD_CHANGE_REQUIRED') message = 'Change your password before managing semesters.'
  else if (response.status === 403) message = 'You do not have permission to perform this action.'
  else if (response.status === 404) message = 'Semester not found.'
  else if (code === 'CONCURRENT_MODIFICATION') message = 'This semester was modified at the same time. Refresh and try again.'
  else if (response.status === 409) message = 'The request conflicts with current server data. Refresh and try again.'
  else if (response.status === 400) message = 'The request is invalid. Check the entered values.'
  return { message, fields }
}
