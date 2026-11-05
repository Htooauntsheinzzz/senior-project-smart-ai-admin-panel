import apiClient from '../api/apiClient'
import type { LecturerDraft, LecturerFilters, LecturerStatus } from '../types/lecturer'

// The backend names this resource "lectures" (/api/v1/admin/lectures) and its
// fields lectureName*, although the records are lecturer people.
export type ApiLecturer = {
  id: string
  nameTh: string
  nameEn: string
  nickname: string
  facultyId: string
  facultyCode: string
  facultyNameEn: string
  departmentId: string
  departmentCode: string
  departmentName: string
  status: LecturerStatus
}

export type LecturerSummary = { totalLectures: number; activeLectures: number; inactiveLectures: number }

const count = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0
const validId = (value: string) => /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value))

export function lecturerPath(id: string) {
  if (!validId(id)) throw new Error('Invalid lecturer ID.')
  return `/lectures/${id}`
}

export function lecturerPayload(value: LecturerDraft) {
  if (!validId(value.facultyId)) throw new Error('Invalid faculty ID.')
  if (!validId(value.departmentId)) throw new Error('Invalid department ID.')
  return {
    lectureNameTh: value.nameTh.trim(),
    lectureNameEn: value.nameEn.trim(),
    lectureNickname: value.nickname.trim() || null,
    facultyId: Number(value.facultyId),
    departmentId: Number(value.departmentId),
    status: value.status === 'active' ? 'ACTIVE' : 'INACTIVE',
  }
}

export function mapLecturer(value: unknown): ApiLecturer {
  const row = value as Record<string, unknown> | null
  if (!row || !count(row.id) || !row.id || typeof row.lectureNameTh !== 'string' || typeof row.lectureNameEn !== 'string' ||
      (row.lectureNickname != null && typeof row.lectureNickname !== 'string') ||
      !count(row.facultyId) || !row.facultyId || typeof row.facultyCode !== 'string' || typeof row.facultyNameEn !== 'string' ||
      !count(row.departmentId) || !row.departmentId || typeof row.departmentCode !== 'string' || typeof row.departmentName !== 'string' ||
      (row.status !== 'ACTIVE' && row.status !== 'INACTIVE')) throw new Error('Unexpected lecturer response.')
  return {
    id: String(row.id),
    nameTh: row.lectureNameTh,
    nameEn: row.lectureNameEn,
    nickname: (row.lectureNickname as string | null | undefined) ?? '',
    facultyId: String(row.facultyId),
    facultyCode: row.facultyCode,
    facultyNameEn: row.facultyNameEn,
    departmentId: String(row.departmentId),
    departmentCode: row.departmentCode,
    departmentName: row.departmentName,
    status: row.status === 'ACTIVE' ? 'active' : 'inactive',
  }
}

export interface LecturerPage {
  content: unknown[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface LecturerListParams {
  page?: number
  size?: number
  search?: string
  facultyId?: number
  departmentId?: number
  status?: string
  sort?: string
}

export async function getLecturers(params: LecturerListParams = {}, signal?: AbortSignal): Promise<LecturerPage> {
  const response = await apiClient.get('/lectures', { params, signal })
  return response.data
}

export async function getLecturerDirectory(filters: LecturerFilters, signal?: AbortSignal): Promise<ApiLecturer[]> {
  const rows: ApiLecturer[] = []
  if (filters.facultyId && !validId(filters.facultyId)) throw new Error('Invalid faculty ID.')
  if (filters.departmentId && !validId(filters.departmentId)) throw new Error('Invalid department ID.')
  if (filters.status && !['active', 'inactive'].includes(filters.status)) throw new Error('Invalid lecturer status.')
  if (filters.query.trim().length > 255) throw new Error('Search must be at most 255 characters.')
  let total = -1
  for (let page = 0; page < 20; page++) {
    const data = await getLecturers({
      page, size: 100, sort: 'id,asc',
      search: filters.query.trim() || undefined,
      facultyId: filters.facultyId ? Number(filters.facultyId) : undefined,
      departmentId: filters.departmentId ? Number(filters.departmentId) : undefined,
      status: filters.status ? filters.status.toUpperCase() : undefined,
    }, signal)
    if (!data || !Array.isArray(data.content) || data.page !== page || data.size !== 100 || !count(data.totalElements) || !count(data.totalPages)) throw new Error('Unexpected lecturer page response.')
    if (data.totalElements > 2000 || data.totalPages > 20) throw new Error('Too many lecturers to display completely. Narrow your filters.')
    if (total !== -1 && total !== data.totalElements) throw new Error('Lecturer data changed while loading. Please retry.')
    total = data.totalElements
    rows.push(...data.content.map(mapLecturer))
    if (page >= data.totalPages - 1) {
      if (rows.length !== total || new Set(rows.map(row => row.id)).size !== rows.length) throw new Error('Lecturer data changed while loading. Please retry.')
      return rows
    }
  }
  throw new Error('Incomplete lecturer directory.')
}

export async function getLecturerSummary(signal?: AbortSignal): Promise<LecturerSummary> {
  const { data } = await apiClient.get('/lectures/summary', { signal })
  if (!data || !['totalLectures', 'activeLectures', 'inactiveLectures'].every(key => count(data[key]))) throw new Error('Unexpected lecturer summary response.')
  return data
}

export async function getLecturerById(id: string) {
  const { data } = await apiClient.get(lecturerPath(id))
  return mapLecturer(data)
}

export async function createLecturer(value: LecturerDraft) { await apiClient.post('/lectures', lecturerPayload(value)) }
export async function updateLecturer(id: string, value: LecturerDraft) { await apiClient.put(lecturerPath(id), lecturerPayload(value)) }
export async function deleteLecturer(id: string) { await apiClient.delete(lecturerPath(id)) }
