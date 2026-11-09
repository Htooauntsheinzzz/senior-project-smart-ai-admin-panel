import type { AcademicTerm, AcademicTermDraft, TermStatus } from '../types/timetable'
import { isIsoDate, timetableError } from './timetable'

// Helpers of the Academic Terms page (Timetable › Academic Terms). Pure functions, unit-tested in
// tests/academic-terms.test.cjs. Terms are few (one per semester and academic year), so the page loads the
// complete list once and searches, filters, counts and pages it here.

export const termStatuses: Record<TermStatus, { label: string; bg: string; text: string }> = {
  PLANNED: { label: 'Planned', bg: '#fef3c7', text: '#b45309' },
  ACTIVE: { label: 'Active', bg: '#d1fae5', text: '#059669' },
  CLOSED: { label: 'Closed', bg: '#f3f4f6', text: '#6b7280' },
}
export const termStatusOptions = (Object.keys(termStatuses) as TermStatus[]).map(value => ({ value, label: termStatuses[value].label }))

export type TermField = keyof AcademicTermDraft
export const emptyTermDraft: AcademicTermDraft = { semesterId: '', academicYearCode: '', academicYearLabel: '', startDate: '', endDate: '', status: 'PLANNED' }
export const termDraftOf = (term: AcademicTerm): AcademicTermDraft => ({ semesterId: term.semesterId, academicYearCode: term.academicYearCode, academicYearLabel: term.academicYearLabel, startDate: term.startDate, endDate: term.endDate, status: term.status })

/** "Semester 1 · 2025–2026" */
export const termTitle = (term: Pick<AcademicTerm, 'semesterNameEn' | 'academicYearLabel'>) => `${term.semesterNameEn} · ${term.academicYearLabel}`

/** Calendar days from the start to the end date inclusive; null when the dates are invalid or reversed. */
export function termDays(startDate: string, endDate: string) {
  if (!isIsoDate(startDate) || !isIsoDate(endDate) || endDate < startDate) return null
  return Math.round((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86_400_000) + 1
}
export function termDuration(startDate: string, endDate: string) {
  const days = termDays(startDate, endDate)
  if (days === null) return '—'
  if (days < 14) return `${days} ${days === 1 ? 'day' : 'days'}`
  return `${Math.round(days / 7)} weeks`
}

export interface TermFilters { query: string; semesterId: string; status: TermStatus | '' }
export const emptyTermFilters: TermFilters = { query: '', semesterId: '', status: '' }

/** Search over the academic year code and label and the semester names (English and Thai), plus exact semester and status filters. */
export function filterTerms(terms: AcademicTerm[], filters: TermFilters) {
  const query = filters.query.trim().toLowerCase()
  return terms.filter(term =>
    (!filters.semesterId || term.semesterId === filters.semesterId)
    && (!filters.status || term.status === filters.status)
    && (!query || [term.academicYearCode, term.academicYearLabel, term.semesterNameEn, term.semesterNameTh].some(text => text.toLowerCase().includes(query))))
}

export function termSummary(terms: AcademicTerm[]) {
  const of = (status: TermStatus) => terms.filter(term => term.status === status).length
  return { total: terms.length, active: of('ACTIVE'), planned: of('PLANNED'), closed: of('CLOSED') }
}

/** Distinct semesters among the terms, in list order (most recent term first). */
export function termSemesterOptions(terms: AcademicTerm[]) {
  const seen = new Map<string, string>()
  for (const term of terms) if (!seen.has(term.semesterId)) seen.set(term.semesterId, term.semesterNameEn)
  return [...seen].map(([value, label]) => ({ value, label }))
}

export function paginate<T>(rows: T[], page: number, size: number) {
  const pageCount = Math.max(1, Math.ceil(rows.length / size))
  const current = Math.min(Math.max(1, page), pageCount)
  return { page: current, pageCount, rows: rows.slice((current - 1) * size, current * size) }
}

/** Quick status change offered in the row menu (PATCH /academic-terms/{id}/status). */
export function statusActions(status: TermStatus): { status: TermStatus; label: string }[] {
  if (status === 'ACTIVE') return [{ status: 'CLOSED', label: 'Close term' }]
  if (status === 'PLANNED') return [{ status: 'ACTIVE', label: 'Mark active' }]
  return [{ status: 'ACTIVE', label: 'Reopen as active' }]
}

/** Error copy for academic-term reads and writes, with the field each backend code belongs to. */
export function academicTermError(error: unknown, kind: 'read' | 'write' = 'read') {
  const failure = timetableError(error, kind)
  const fields: Partial<Record<TermField, string>> = {}
  let message = failure.message
  if (failure.status === 403 && failure.code !== 'PASSWORD_CHANGE_REQUIRED') message = 'You do not have permission to manage academic terms.'
  if (failure.code === 'ACADEMIC_TERM_NOT_FOUND') message = 'This academic term no longer exists. It may have been deleted by another administrator.'
  if (failure.code === 'TIMETABLE_INVALID_DATE_RANGE') { message = 'The end date must not be before the start date.'; fields.endDate = message }
  if (failure.code === 'SEMESTER_NOT_FOUND') fields.semesterId = message
  if (failure.code === 'ACADEMIC_TERM_ALREADY_EXISTS') fields.academicYearCode = message
  return { message, fields, code: failure.code, status: failure.status }
}
