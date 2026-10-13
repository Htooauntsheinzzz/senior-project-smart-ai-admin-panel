import apiClient from '../api/apiClient'
import type { CourseDraft, CourseFilters } from '../types/course'

export type ApiCourse = {
  id: string
  code: string
  name: string
  credits: number
  facultyId: string
  facultyCode: string
  facultyNameEn: string
  departmentId: string
  departmentCode: string
  departmentName: string
  programId: string | null
  programCode: string | null
  programName: string | null
  semesterId: string | null
  semesterNameTh: string | null
  semesterNameEn: string | null
  curriculumYear: number | null
  courseType: number
  courseTypeName: string
  sectionCount: number
  status: 'active' | 'inactive'
  description?: string | null
  prerequisiteCourses?: string | null
  maxStudentsPerSection?: number | null
}

export type CourseSummary = {
  totalCourses: number
  activeCourses: number
  inactiveCourses: number
  currentSemesterCourses: number
}

const count = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0

export function coursePath(id: string) {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) throw new Error('Invalid course ID.')
  return `/courses/${id}`
}

export function courseTypeFromUi(type: 'Required' | 'Elective'): number {
  return type === 'Required' ? 300 : 200
}

export function courseTypeToUi(courseType: number): 'Required' | 'Elective' {
  return courseType === 300 ? 'Required' : 'Elective'
}

export function coursePayload(value: CourseDraft) {
  if (!/^[1-9]\d*$/.test(value.facultyId) || !Number.isSafeInteger(Number(value.facultyId))) throw new Error('Invalid faculty ID.')
  if (!/^[1-9]\d*$/.test(value.departmentId) || !Number.isSafeInteger(Number(value.departmentId))) throw new Error('Invalid department ID.')
  const payload: Record<string, unknown> = {
    courseCode: value.code.trim(),
    courseName: value.name.trim(),
    creditHours: Number(value.credits),
    facultyId: Number(value.facultyId),
    departmentId: Number(value.departmentId),
    isActive: value.status === 'active',
    courseType: courseTypeFromUi(value.type as 'Required' | 'Elective'),
  }
  const description = value.description.trim() || null
  if (description) payload.description = description
  if (value.programId) payload.programId = Number(value.programId)
  if (value.term) payload.semesterId = Number(value.term)
  if (value.year) payload.recommendedAcademicYear = Number(value.year)
  const prerequisites = value.prerequisites.trim() || null
  if (prerequisites) payload.prerequisiteCourses = prerequisites
  if (value.maxStudents.trim()) payload.maximumStudentsPerSection = Number(value.maxStudents)
  return payload
}

export function mapCourse(value: unknown): ApiCourse {
  const row = value as Record<string, unknown> | null
  if (!row || !count(row.id) || !row.id || typeof row.courseCode !== 'string' || typeof row.courseName !== 'string' || !count(row.creditHours) ||
      !count(row.facultyId) || !row.facultyId || typeof row.facultyCode !== 'string' || typeof row.facultyNameEn !== 'string' ||
      !count(row.departmentId) || !row.departmentId || typeof row.departmentCode !== 'string' || typeof row.departmentName !== 'string' ||
      typeof row.courseTypeName !== 'string' || typeof row.isActive !== 'boolean' || !count(row.sectionCount)) {
    throw new Error('Unexpected course response.')
  }
  return {
    id: String(row.id),
    code: row.courseCode,
    name: row.courseName,
    credits: row.creditHours as number,
    facultyId: String(row.facultyId),
    facultyCode: row.facultyCode,
    facultyNameEn: row.facultyNameEn,
    departmentId: String(row.departmentId),
    departmentCode: row.departmentCode,
    departmentName: row.departmentName,
    programId: row.programId == null ? null : String(row.programId),
    programCode: row.programCode == null ? null : String(row.programCode),
    programName: row.programName == null ? null : String(row.programName),
    semesterId: row.semesterId == null ? null : String(row.semesterId),
    semesterNameTh: row.semesterNameTh == null ? null : String(row.semesterNameTh),
    semesterNameEn: row.semesterNameEn == null ? null : String(row.semesterNameEn),
    curriculumYear: row.recommendedAcademicYear == null ? null : (typeof row.recommendedAcademicYear === 'number' ? row.recommendedAcademicYear : null),
    courseType: typeof row.courseType === 'number' ? row.courseType : 200,
    courseTypeName: row.courseTypeName,
    sectionCount: row.sectionCount as number,
    status: row.isActive ? 'active' : 'inactive',
    description: row.description == null ? null : String(row.description),
    prerequisiteCourses: row.prerequisiteCourses == null ? null : String(row.prerequisiteCourses),
    maxStudentsPerSection: row.maximumStudentsPerSection == null ? null : (typeof row.maximumStudentsPerSection === 'number' ? row.maximumStudentsPerSection : null),
  }
}

export interface CoursePage {
  content: unknown[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface CourseListParams {
  page?: number
  size?: number
  search?: string
  facultyId?: number
  departmentId?: number
  programId?: number
  semesterId?: number
  recommendedAcademicYear?: number
  courseType?: number
  status?: string
  sort?: string
}

export async function getCourses(params: CourseListParams = {}, signal?: AbortSignal): Promise<CoursePage> {
  const response = await apiClient.get('/courses', { params, signal })
  return response.data
}

export async function getCourseDirectory(filters: CourseFilters, signal?: AbortSignal): Promise<ApiCourse[]> {
  const rows: ApiCourse[] = []
  if (filters.facultyId && (!/^[1-9]\d*$/.test(filters.facultyId) || !Number.isSafeInteger(Number(filters.facultyId)))) throw new Error('Invalid faculty ID.')
  if (filters.departmentId && (!/^[1-9]\d*$/.test(filters.departmentId) || !Number.isSafeInteger(Number(filters.departmentId)))) throw new Error('Invalid department ID.')
  if (filters.programId && (!/^[1-9]\d*$/.test(filters.programId) || !Number.isSafeInteger(Number(filters.programId)))) throw new Error('Invalid program ID.')
  if (filters.status && !['active', 'inactive'].includes(filters.status)) throw new Error('Invalid course status.')
  if (filters.query.trim().length > 255) throw new Error('Search must be at most 255 characters.')
  let total = -1
  for (let page = 0; page < 20; page++) {
    const data = await getCourses({
      page, size: 100, sort: 'id,asc',
      search: filters.query.trim() || undefined,
      facultyId: filters.facultyId ? Number(filters.facultyId) : undefined,
      departmentId: filters.departmentId ? Number(filters.departmentId) : undefined,
      programId: filters.programId ? Number(filters.programId) : undefined,
      semesterId: filters.term ? Number(filters.term) : undefined,
      recommendedAcademicYear: filters.year ? Number(filters.year) : undefined,
      courseType: undefined,
      status: filters.status ? filters.status.toUpperCase() : undefined,
    }, signal)
    if (!data || !Array.isArray(data.content) || data.page !== page || data.size !== 100 || !count(data.totalElements) || !count(data.totalPages)) throw new Error('Unexpected course page response.')
    if (data.totalElements > 2000 || data.totalPages > 20) throw new Error('Too many courses to display completely. Narrow your filters.')
    if (total !== -1 && total !== data.totalElements) throw new Error('Course data changed while loading. Please retry.')
    total = data.totalElements
    rows.push(...data.content.map(mapCourse))
    if (page >= data.totalPages - 1) {
      if (rows.length !== total || new Set(rows.map(row => row.id)).size !== rows.length) throw new Error('Course data changed while loading. Please retry.')
      return rows
    }
  }
  throw new Error('Incomplete course directory.')
}

export async function getCourseSummary(signal?: AbortSignal): Promise<CourseSummary> {
  const { data } = await apiClient.get('/courses/summary', { signal })
  if (!data || !['totalCourses', 'activeCourses', 'inactiveCourses', 'currentSemesterCourses'].every(key => count(data[key]))) throw new Error('Unexpected course summary response.')
  return data
}

export async function getCourseById(id: string) {
  const { data } = await apiClient.get(coursePath(id))
  return mapCourse(data)
}

export async function createCourse(value: CourseDraft) { await apiClient.post('/courses', coursePayload(value)) }
export async function updateCourse(id: string, value: CourseDraft) { await apiClient.put(coursePath(id), coursePayload(value)) }
export async function deleteCourse(id: string) { await apiClient.delete(coursePath(id)) }

// Semester lookup
export interface Semester {
  id: string
  semesterNameTh: string
  semesterNameEn: string
}

export function mapSemester(value: unknown): Semester {
  const row = value as Record<string, unknown> | null
  if (!row || !count(row.id) || !row.id || typeof row.semesterNameTh !== 'string' || typeof row.semesterNameEn !== 'string') throw new Error('Unexpected semester response.')
  return { id: String(row.id), semesterNameTh: row.semesterNameTh, semesterNameEn: row.semesterNameEn }
}

export async function getSemesters(signal?: AbortSignal): Promise<Semester[]> {
  const rows: Semester[] = []
  let total = -1
  for (let page = 0; page < 20; page++) {
    const { data } = await apiClient.get('/semesters', { params: { page, size: 100, sort: 'id,asc' }, signal })
    if (!data || !Array.isArray(data.content) || data.page !== page || data.size !== 100 || !count(data.totalElements) || !count(data.totalPages)) throw new Error('Unexpected semester page response.')
    if (data.totalElements > 2000 || data.totalPages > 20) throw new Error('Incomplete semester directory.')
    if (total !== -1 && total !== data.totalElements) throw new Error('Incomplete semester directory.')
    total = data.totalElements
    rows.push(...data.content.map(mapSemester))
    if (page >= data.totalPages - 1) {
      if (rows.length !== total || new Set(rows.map(row => row.id)).size !== rows.length) throw new Error('Incomplete semester directory.')
      return rows
    }
  }
  throw new Error('Incomplete semester directory.')
}
