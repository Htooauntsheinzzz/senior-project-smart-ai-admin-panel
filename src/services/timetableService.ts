import { getSections, mapSection, type ApiSection } from './sectionService'

export type TimetableQuery = { search: string; semesterId: string; status: string }
export const emptyTimetableQuery: TimetableQuery = { search: '', semesterId: '', status: '' }
export type TimetablePage = { rows: ApiSection[]; totalElements: number; totalPages: number }
const count = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0

export async function getTimetablePage(query: TimetableQuery, page = 0, signal?: AbortSignal): Promise<TimetablePage> {
  if (!count(page)) throw new Error('Invalid timetable page.')
  if (query.search.trim().length > 255) throw new Error('Search must be at most 255 characters.')
  if (query.semesterId && (!/^[1-9]\d*$/.test(query.semesterId) || !Number.isSafeInteger(Number(query.semesterId)))) throw new Error('Invalid semester ID.')
  if (query.status && !['ACTIVE', 'CLOSED'].includes(query.status)) throw new Error('Invalid section status.')
  const data = await getSections({ page, size: 10, sort: 'id,asc', search: query.search.trim() || undefined, semesterId: query.semesterId ? Number(query.semesterId) : undefined, status: query.status || undefined }, signal)
  if (!data || !Array.isArray(data.content) || data.page !== page || data.size !== 10 || !count(data.totalElements) || !count(data.totalPages) || data.totalPages !== Math.ceil(data.totalElements / 10)) throw new Error('Unexpected timetable page.')
  const rows = data.content.map(mapSection)
  if (rows.length !== Math.min(10, Math.max(0, data.totalElements - page * 10)) || new Set(rows.map(row => row.id)).size !== rows.length) throw new Error('Incomplete timetable page.')
  return { rows, totalElements: data.totalElements, totalPages: data.totalPages }
}

export function timetableError(error: unknown) {
  const status = (error as { response?: { status?: number } })?.response?.status
  if (status === 401) return 'Your session expired. Sign in again.'
  if (status === 403) return 'You do not have permission to read course sections, or must change your password first.'
  if (status === 400) return 'Check the search, semester and section-status filters.'
  return 'Timetable data could not be loaded. Please retry.'
}
