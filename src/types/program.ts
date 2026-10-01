export type ProgramStatus = 'active' | 'inactive'
export interface Program {
  id: string
  code: string
  name: string
  facultyId: string
  departmentId: string
  degreeId: string
  durationYears: number
  totalCredits: number | null
  status: ProgramStatus
}
export type ProgramDraft = Omit<Program, 'id' | 'durationYears' | 'totalCredits'> & { durationYears: string; totalCredits: string }
export type ProgramFilters = { query: string; facultyId: string; departmentId: string; degreeId: string; status: string }
export type Degree = { id: string; name: string; background: string; color: string }
