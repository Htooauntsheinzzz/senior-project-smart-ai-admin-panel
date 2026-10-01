import type { Faculty, FacultyInput } from '../types/faculty'

export function filterFaculties(faculties: Faculty[], query: string) {
  const search = query.trim().toLocaleLowerCase()
  return faculties.filter(faculty => [faculty.code, faculty.nameEn, faculty.nameTh].some(value => value.toLocaleLowerCase().includes(search)))
}
export function facultyTotals(faculties: Faculty[]) {
  return { total: faculties.length, active: faculties.filter(faculty => faculty.status === 'active').length, departments: faculties.reduce((sum, faculty) => sum + faculty.departmentCount, 0) }
}
export function validateFaculty(value: FacultyInput, faculties: Faculty[]) {
  const errors: Partial<Record<keyof FacultyInput, string>> = {}
  if (!value.code.trim()) errors.code = 'Faculty code is required.'
  else if (faculties.some(faculty => faculty.code.toLowerCase() === value.code.trim().toLowerCase())) errors.code = 'This faculty code is already in use.'
  if (!value.nameEn.trim()) errors.nameEn = 'English faculty name is required.'
  if (!['active', 'inactive'].includes(value.status)) errors.status = 'Select a valid status.'
  return errors
}
export function createDemoFaculty(input: FacultyInput): Faculty {
  return { ...input, code: input.code.trim(), nameEn: input.nameEn.trim(), nameTh: input.nameTh.trim(), id: crypto.randomUUID(), departmentCount: 0, studentCount: 0 }
}
