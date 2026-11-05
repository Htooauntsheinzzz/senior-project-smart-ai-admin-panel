import apiClient from '../api/apiClient'
import type { ProgramDraft, ProgramFilters } from '../types/program'

export type ApiProgram = {
  id: string
  code: string
  name: string
  facultyId: string
  facultyCode: string
  facultyNameEn: string
  departmentId: string
  departmentCode: string
  departmentName: string
  degreeLevel: string
  durationYears: number | null
  totalCredits: number | null
  status: 'active' | 'inactive'
}

export type ProgramSummary = { totalPrograms: number; activePrograms: number; inactivePrograms: number }

const count = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0

export function programPath(id: string) {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) throw new Error('Invalid program ID.')
  return `/programs/${id}`
}

export function programPayload(value: ProgramDraft, degreeName: string) {
  if (!/^[1-9]\d*$/.test(value.facultyId) || !Number.isSafeInteger(Number(value.facultyId))) throw new Error('Invalid faculty ID.')
  if (!/^[1-9]\d*$/.test(value.departmentId) || !Number.isSafeInteger(Number(value.departmentId))) throw new Error('Invalid department ID.')
  const payload: Record<string, unknown> = {
    programCode: value.code.trim(),
    programName: value.name.trim(),
    degreeLevel: degreeName.trim(),
    facultyId: Number(value.facultyId),
    departmentId: Number(value.departmentId),
    isActive: value.status === 'active',
  }
  const duration = value.durationYears.trim() ? Number(value.durationYears) : null
  if (duration != null && duration > 0) payload.durationYears = duration
  const credits = value.totalCredits.trim() ? Number(value.totalCredits) : null
  if (credits != null && credits > 0) payload.totalCredits = credits
  return payload
}

export function mapProgram(value: unknown): ApiProgram {
  const row = value as Record<string, unknown> | null
  if (!row || !count(row.id) || !row.id || typeof row.programCode !== 'string' || typeof row.programName !== 'string' || typeof row.degreeLevel !== 'string' ||
      !count(row.facultyId) || !row.facultyId || typeof row.facultyCode !== 'string' || typeof row.facultyNameEn !== 'string' ||
      !count(row.departmentId) || !row.departmentId || typeof row.departmentCode !== 'string' || typeof row.departmentName !== 'string' ||
      typeof row.isActive !== 'boolean') throw new Error('Unexpected program response.')
  return {
    id: String(row.id),
    code: row.programCode,
    name: row.programName,
    degreeLevel: row.degreeLevel,
    facultyId: String(row.facultyId),
    facultyCode: row.facultyCode,
    facultyNameEn: row.facultyNameEn,
    departmentId: String(row.departmentId),
    departmentCode: row.departmentCode,
    departmentName: row.departmentName,
    durationYears: row.durationYears == null ? null : (typeof row.durationYears === 'number' ? row.durationYears : null),
    totalCredits: row.totalCredits == null ? null : (typeof row.totalCredits === 'number' ? row.totalCredits : null),
    status: row.isActive ? 'active' : 'inactive',
  }
}

export interface ProgramPage {
  content: unknown[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ProgramListParams {
  page?: number
  size?: number
  search?: string
  facultyId?: number
  departmentId?: number
  degreeLevel?: string
  status?: string
  sort?: string
}

export async function getPrograms(params: ProgramListParams = {}, signal?: AbortSignal): Promise<ProgramPage> {
  const response = await apiClient.get('/programs', { params, signal })
  return response.data
}

export async function getProgramDirectory(filters: ProgramFilters, signal?: AbortSignal): Promise<ApiProgram[]> {
  const rows: ApiProgram[] = []
  if (filters.facultyId && (!/^[1-9]\d*$/.test(filters.facultyId) || !Number.isSafeInteger(Number(filters.facultyId)))) throw new Error('Invalid faculty ID.')
  if (filters.departmentId && (!/^[1-9]\d*$/.test(filters.departmentId) || !Number.isSafeInteger(Number(filters.departmentId)))) throw new Error('Invalid department ID.')
  if (filters.status && !['active', 'inactive'].includes(filters.status)) throw new Error('Invalid program status.')
  if (filters.query.trim().length > 255) throw new Error('Search must be at most 255 characters.')
  let total = -1
  for (let page = 0; page < 20; page++) {
    const data = await getPrograms({
      page, size: 100, sort: 'id,asc',
      search: filters.query.trim() || undefined,
      facultyId: filters.facultyId ? Number(filters.facultyId) : undefined,
      departmentId: filters.departmentId ? Number(filters.departmentId) : undefined,
      degreeLevel: filters.degreeId.trim() || undefined,
      status: filters.status ? filters.status.toUpperCase() : undefined,
    }, signal)
    if (!data || !Array.isArray(data.content) || data.page !== page || data.size !== 100 || !count(data.totalElements) || !count(data.totalPages)) throw new Error('Unexpected program page response.')
    if (data.totalElements > 2000 || data.totalPages > 20) throw new Error('Too many programs to display completely. Narrow your filters.')
    if (total !== -1 && total !== data.totalElements) throw new Error('Program data changed while loading. Please retry.')
    total = data.totalElements
    rows.push(...data.content.map(mapProgram))
    if (page >= data.totalPages - 1) {
      if (rows.length !== total || new Set(rows.map(row => row.id)).size !== rows.length) throw new Error('Program data changed while loading. Please retry.')
      return rows
    }
  }
  throw new Error('Incomplete program directory.')
}

export async function getProgramSummary(signal?: AbortSignal): Promise<ProgramSummary> {
  const { data } = await apiClient.get('/programs/summary', { signal })
  if (!data || !['totalPrograms', 'activePrograms', 'inactivePrograms'].every(key => count(data[key]))) throw new Error('Unexpected program summary response.')
  return data
}

export async function getProgramById(id: string) {
  const { data } = await apiClient.get(programPath(id))
  return mapProgram(data)
}

export async function createProgram(value: ProgramDraft, degreeName: string) { await apiClient.post('/programs', programPayload(value, degreeName)) }
export async function updateProgram(id: string, value: ProgramDraft, degreeName: string) { await apiClient.put(programPath(id), programPayload(value, degreeName)) }
export async function deleteProgram(id: string) { await apiClient.delete(programPath(id)) }
