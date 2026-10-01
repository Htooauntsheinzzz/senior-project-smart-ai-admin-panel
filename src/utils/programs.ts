import { initialDepartments } from '../data/departments'
import { initialFaculties } from '../data/faculties'
import { degrees, programDurations } from '../data/programs'
import type { Program, ProgramDraft, ProgramFilters } from '../types/program'

export const emptyProgram: ProgramDraft = { code: '', name: '', facultyId: '', departmentId: '', degreeId: '', durationYears: '4', totalCredits: '', status: 'active' }

export function filterPrograms(programs: Program[], filters: ProgramFilters) {
  const query = filters.query.trim().toLocaleLowerCase()
  return programs.filter(program => [program.code, program.name].some(value => value.toLocaleLowerCase().includes(query)) &&
    (!filters.facultyId || program.facultyId === filters.facultyId) && (!filters.departmentId || program.departmentId === filters.departmentId) &&
    (!filters.degreeId || program.degreeId === filters.degreeId) && (!filters.status || program.status === filters.status))
}

export function changeProgramFaculty<T extends { facultyId: string; departmentId: string }>(value: T, facultyId: string): T {
  const compatible = initialDepartments.some(department => department.id === value.departmentId && (!facultyId || department.facultyId === facultyId))
  return { ...value, facultyId, departmentId: compatible ? value.departmentId : '' }
}

export function validateProgram(value: ProgramDraft, programs: Program[]) {
  const errors: Partial<Record<keyof ProgramDraft, string>> = {}
  if (!value.code.trim()) errors.code = 'Program code is required.'
  else if (programs.some(program => program.code.toLowerCase() === value.code.trim().toLowerCase())) errors.code = 'This program code is already in use.'
  if (!degrees.some(degree => degree.id === value.degreeId)) errors.degreeId = 'Select a degree level.'
  if (!value.name.trim()) errors.name = 'Program name is required.'
  if (!initialFaculties.some(faculty => faculty.id === value.facultyId)) errors.facultyId = 'Select a faculty.'
  if (!initialDepartments.some(department => department.id === value.departmentId && department.facultyId === value.facultyId)) errors.departmentId = 'Select a department within the chosen faculty.'
  if (!programDurations.includes(Number(value.durationYears))) errors.durationYears = 'Select a supported duration.'
  if (value.totalCredits.trim() && (!/^\d+$/.test(value.totalCredits.trim()) || !Number.isSafeInteger(Number(value.totalCredits)))) errors.totalCredits = 'Enter a nonnegative whole number of credits, or leave blank.'
  if (!['active', 'inactive'].includes(value.status)) errors.status = 'Select a valid status.'
  return errors
}

export function createDemoProgram(value: ProgramDraft): Program {
  return { ...value, id: crypto.randomUUID(), code: value.code.trim(), name: value.name.trim(), durationYears: Number(value.durationYears), totalCredits: value.totalCredits.trim() ? Number(value.totalCredits) : null }
}
