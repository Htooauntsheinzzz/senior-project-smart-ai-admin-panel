import type { Faculty } from '../types/faculty'
import type { Department, DepartmentFilters, DepartmentInput } from '../types/department'

export function filterDepartments(departments: Department[], filters: DepartmentFilters) {
  const search = filters.query.trim().toLocaleLowerCase()
  return departments.filter(item => (!filters.facultyId || item.facultyId === filters.facultyId) && (!filters.status || item.status === filters.status) && [item.code, item.name].some(value => value.toLocaleLowerCase().includes(search)))
}
export function validateDepartment(value: DepartmentInput, departments: Department[], faculties: Faculty[]) {
  const errors: Partial<Record<keyof DepartmentInput, string>> = {}
  if (!value.code.trim()) errors.code = 'Department code is required.'
  // University-wide, case-insensitive uniqueness is a demo policy only.
  else if (departments.some(item => item.code.toLowerCase() === value.code.trim().toLowerCase())) errors.code = 'This department code is already in use.'
  if (!value.name.trim()) errors.name = 'Department name is required.'
  if (!faculties.some(item => item.id === value.facultyId)) errors.facultyId = 'Please select a faculty.'
  if (!['active', 'inactive'].includes(value.status)) errors.status = 'Select a valid status.'
  return errors
}
export function createDemoDepartment(value: DepartmentInput): Department {
  return { ...value, code: value.code.trim(), name: value.name.trim(), id: crypto.randomUUID(), programCount: 0, courseCount: 0, studentCount: 0 }
}
