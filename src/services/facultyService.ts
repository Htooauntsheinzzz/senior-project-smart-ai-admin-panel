import apiClient from '../api/apiClient'
import type { Faculty, FacultyInput } from '../types/faculty'

export type FacultySummary = { totalFaculties: number; activeFaculties: number; inactiveFaculties: number; totalDepartments: number }
const count = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0
export function facultyPath(id: string) {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) throw new Error('Invalid faculty ID.')
  return `/faculties/${id}`
}
export function mapFaculty(value: unknown): Faculty {
  const row = value as Record<string, unknown> | null
  if (!row || !count(row.id) || row.id === 0 || typeof row.facultyCode !== 'string' || typeof row.facultyNameEn !== 'string' || (row.facultyNameTh !== null && typeof row.facultyNameTh !== 'string') || typeof row.isActive !== 'boolean' || !count(row.departmentCount) || !count(row.studentCount)) throw new Error('Unexpected faculty response.')
  return { id: String(row.id), code: row.facultyCode, nameEn: row.facultyNameEn, nameTh: row.facultyNameTh ?? '', status: row.isActive ? 'active' : 'inactive', departmentCount: row.departmentCount, studentCount: row.studentCount }
}
export function facultyPayload(value: FacultyInput) {
  return { facultyCode: value.code.trim(), facultyNameEn: value.nameEn.trim(), facultyNameTh: value.nameTh.trim() || null, isActive: value.status === 'active' }
}

// Preserve the directory design by reading all documented pages. Bound work
// and reject partial/changing results rather than pretending page 1 is complete.
export async function getFaculties(search = '', signal?: AbortSignal, status?: 'ACTIVE' | 'INACTIVE'): Promise<Faculty[]> {
  const rows: Faculty[] = []
  let total = -1
  for (let page = 0; page < 20; page++) {
    const { data } = await apiClient.get('/faculties', { params: { page, size: 100, sort: 'id,asc', ...(search.trim() ? { search: search.trim() } : {}), ...(status ? { status } : {}) }, signal })
    if (!data || !Array.isArray(data.content) || data.page !== page || data.size !== 100 || !count(data.totalElements) || !count(data.totalPages) || typeof data.last !== 'boolean') throw new Error('Unexpected faculty page response.')
    if (data.totalElements > 2000 || data.totalPages > 20) throw new Error('The faculty directory is too large to display completely. Narrow your search.')
    if (total !== -1 && total !== data.totalElements) throw new Error('The faculty directory changed while loading. Please retry.')
    total = data.totalElements
    rows.push(...data.content.map(mapFaculty))
    if (data.last) {
      if (rows.length !== total || new Set(rows.map(row => row.id)).size !== rows.length) throw new Error('The faculty directory changed while loading. Please retry.')
      return rows
    }
  }
  throw new Error('Unable to load the complete faculty directory.')
}
export function getActiveFacultyOptions() { return getFaculties('', undefined, 'ACTIVE') }
export async function getFacultySummary(signal?: AbortSignal): Promise<FacultySummary> {
  const { data } = await apiClient.get('/faculties/summary', { signal })
  if (!data || !['totalFaculties', 'activeFaculties', 'inactiveFaculties', 'totalDepartments'].every(key => count(data[key]))) throw new Error('Unexpected faculty summary response.')
  return data
}
export async function getFacultyById(id: string): Promise<Faculty> {
  const { data } = await apiClient.get(facultyPath(id))
  return mapFaculty(data)
}
export async function createFaculty(value: FacultyInput): Promise<void> {
  // The following refetch validates server data separately from write success.
  await apiClient.post('/faculties', facultyPayload(value))
}
export async function updateFaculty(id: string, value: FacultyInput): Promise<void> {
  await apiClient.put(facultyPath(id), facultyPayload(value))
}
export async function deleteFaculty(id: string): Promise<void> {
  await apiClient.delete(facultyPath(id))
}
