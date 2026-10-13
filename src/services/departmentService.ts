import apiClient from '../api/apiClient'
import type { Department, DepartmentFilters, DepartmentInput } from '../types/department'

export type ApiDepartment = Department & { facultyCode: string; facultyNameEn: string }
export type DepartmentSummary = { totalDepartments: number; activeDepartments: number; inactiveDepartments: number }
const count = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0
export function departmentPath(id: string) {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) throw new Error('Invalid department ID.')
  return `/departments/${id}`
}
export function departmentPayload(value: DepartmentInput) {
  if (!/^[1-9]\d*$/.test(value.facultyId) || !Number.isSafeInteger(Number(value.facultyId))) throw new Error('Invalid faculty ID.')
  return { departmentCode: value.code.trim(), departmentName: value.name.trim(), facultyId: Number(value.facultyId), isActive: value.status === 'active' }
}
export function mapDepartment(value: unknown): ApiDepartment {
  const row = value as Record<string, unknown> | null
  if (!row || !count(row.id) || !row.id || !count(row.facultyId) || !row.facultyId || typeof row.departmentCode !== 'string' || typeof row.departmentName !== 'string' || typeof row.facultyCode !== 'string' || typeof row.facultyNameEn !== 'string' || typeof row.isActive !== 'boolean' || !['programCount', 'courseCount', 'studentCount'].every(key => count(row[key]))) throw new Error('Unexpected department response.')
  return { id: String(row.id), code: row.departmentCode, name: row.departmentName, facultyId: String(row.facultyId), facultyCode: row.facultyCode, facultyNameEn: row.facultyNameEn, status: row.isActive ? 'active' : 'inactive', programCount: row.programCount as number, courseCount: row.courseCount as number, studentCount: row.studentCount as number }
}

export interface DepartmentOption {
  id: number
  departmentCode?: string
  departmentName: string
}

export interface DepartmentPage {
  content: DepartmentOption[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface DepartmentListParams {
  page?: number
  size?: number
  search?: string
  facultyId?: number
  status?: string
  sort?: string
}

export async function getDepartments(params: DepartmentListParams = {}, signal?: AbortSignal): Promise<DepartmentPage> {
  const response = await apiClient.get('/departments', { params, signal })
  return response.data
}

export async function getDepartmentDirectory(filters: DepartmentFilters, signal?: AbortSignal): Promise<ApiDepartment[]> {
  const rows: ApiDepartment[] = []
  if (filters.facultyId && (!/^[1-9]\d*$/.test(filters.facultyId) || !Number.isSafeInteger(Number(filters.facultyId)))) throw new Error('Invalid faculty ID.')
  if (filters.status && !['active', 'inactive'].includes(filters.status)) throw new Error('Invalid department status.')
  if (filters.query.trim().length > 255) throw new Error('Search must be at most 255 characters.')
  let total = -1
  for (let page = 0; page < 20; page++) {
    const data = await getDepartments({ page, size: 100, sort: 'id,asc', search: filters.query.trim() || undefined, facultyId: filters.facultyId ? Number(filters.facultyId) : undefined, status: filters.status ? filters.status.toUpperCase() : undefined }, signal)
    if (!data || !Array.isArray(data.content) || data.page !== page || data.size !== 100 || !count(data.totalElements) || !count(data.totalPages)) throw new Error('Unexpected department page response.')
    if (data.totalElements > 2000 || data.totalPages > 20) throw new Error('Too many departments to display completely. Narrow your filters.')
    if (total !== -1 && total !== data.totalElements) throw new Error('Department data changed while loading. Please retry.')
    total = data.totalElements
    rows.push(...data.content.map(mapDepartment))
    if (page >= data.totalPages - 1) {
      if (rows.length !== total || new Set(rows.map(row => row.id)).size !== rows.length) throw new Error('Department data changed while loading. Please retry.')
      return rows
    }
  }
  throw new Error('Incomplete department directory.')
}
export async function getDepartmentSummary(signal?: AbortSignal): Promise<DepartmentSummary> {
  const { data } = await apiClient.get('/departments/summary', { signal })
  if (!data || !['totalDepartments', 'activeDepartments', 'inactiveDepartments'].every(key => count(data[key]))) throw new Error('Unexpected department summary response.')
  return data
}
export async function getDepartmentById(id: string) {
  const { data } = await apiClient.get(departmentPath(id))
  return mapDepartment(data)
}
export async function createDepartment(value: DepartmentInput) { await apiClient.post('/departments', departmentPayload(value)) }
export async function updateDepartment(id: string, value: DepartmentInput) { await apiClient.put(departmentPath(id), departmentPayload(value)) }
export async function deleteDepartment(id: string) { await apiClient.delete(departmentPath(id)) }
