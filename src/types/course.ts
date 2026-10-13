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
  semesterId?: string
}
export type CourseFilters = { query: string; facultyId: string; departmentId: string; programId: string; year: string; term: string; status: string }
export type CourseDraft = { code: string; credits: string; name: string; description: string; facultyId: string; departmentId: string; programId: string; year: string; term: string; prerequisites: string; type: 'Required' | 'Elective'; maxStudents: string; status: 'active' | 'inactive' }
