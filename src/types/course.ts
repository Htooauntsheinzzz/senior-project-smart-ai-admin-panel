export interface Course {
  id: string
  code: string
  name: string
  credits: number
  departmentId: string
  departmentName: string
  facultyId: string
  facultyName: string
  programIds: string[]
  curriculumYear: number | null
  semester: string
  academicYear: string
  sectionCount: number
  type: 'Required' | 'Elective'
  status: 'active' | 'inactive'
  description?: string
  prerequisiteCodes?: string[]
  maxStudentsPerSection?: number | null
}
export type CourseFilters = { query: string; facultyId: string; departmentId: string; programId: string; year: string; term: string; status: string }
