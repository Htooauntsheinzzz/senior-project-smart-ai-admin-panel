export const studentStatuses = ['Active', 'Inactive', 'Suspended'] as const
export const studentSemesters = ['Sem 1/2568', 'Sem 2/2567'] as const
export type StudentStatus = typeof studentStatuses[number]
export type StudentSemester = typeof studentSemesters[number]

export interface Student {
  studentId: string
  name: string
  email: string
  faculty: string
  department: string
  major: string
  year: number
  semester: StudentSemester
  status: StudentStatus
  initials: string
  avatarColor: string
  newThisSemester: boolean
  source: 'figma' | 'synthetic' | 'local'
}

export type StudentInput = Pick<Student, 'studentId' | 'name' | 'email' | 'faculty' | 'department' | 'major' | 'year' | 'semester' | 'status' | 'newThisSemester'>
export type StudentFilters = Record<'faculty' | 'department' | 'major' | 'year' | 'semester' | 'status', string>
