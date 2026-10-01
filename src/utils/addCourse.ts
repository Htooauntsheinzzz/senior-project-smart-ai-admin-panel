import { initialCourses } from '../data/courses'
import { initialDepartments } from '../data/departments'
import { initialFaculties } from '../data/faculties'
import { initialPrograms } from '../data/programs'
import type { Course } from '../types/course'

export const emptyCourseDraft = { code: '', credits: '', name: '', description: '', facultyId: '', departmentId: '', programId: '', year: '', term: '', prerequisites: '', type: 'Required', maxStudents: '', status: 'active' }
export type CourseDraft = typeof emptyCourseDraft
export const courseYearOptions = ['1', '2', '3', '4', '5', '6']
export const courseTermOptions = ['1/2568', '2/2568', 'Summer/2568']
const departmentKey = (facultyId: string, name: string) => `course-${facultyId}-${name.toLowerCase().replaceAll(' ', '-')}`
// Course fixtures contain two assignments absent from the Departments screen.
// Merge rather than rewrite those reference values. These remain local IDs.
export const courseDepartmentOptions = [...new Map([
  ...initialDepartments.map(item => ({ id: departmentKey(item.facultyId, item.name), name: item.name, facultyId: item.facultyId })),
  ...initialCourses.map(item => ({ id: item.departmentId, name: item.departmentName, facultyId: item.facultyId })),
].map(item => [item.id, item])).values()]

export function courseProgramOptions(facultyId: string, departmentId: string) {
  const department = courseDepartmentOptions.find(item => item.id === departmentId && item.facultyId === facultyId)
  if (!department) return []
  return initialPrograms.filter(program => program.facultyId === facultyId && (
    initialDepartments.some(item => item.id === program.departmentId && item.name === department.name) ||
    initialCourses.some(course => course.departmentId === departmentId && course.programIds.includes(program.id))
  ))
}
export function updateCourseDraft(value: CourseDraft, field: keyof CourseDraft, next: string): CourseDraft {
  const result = { ...value, [field]: next }
  if (field === 'facultyId' && !courseDepartmentOptions.some(item => item.id === result.departmentId && item.facultyId === next)) result.departmentId = ''
  if ((field === 'facultyId' || field === 'departmentId') && !courseProgramOptions(result.facultyId, result.departmentId).some(item => item.id === result.programId)) result.programId = ''
  return result
}
export function validateCourseDraft(value: CourseDraft, courses: Course[]) {
  const errors: Partial<Record<keyof CourseDraft, string>> = {}
  const integer = (text: string) => /^\d+$/.test(text.trim()) && Number.isSafeInteger(Number(text))
  if (!value.code.trim()) errors.code = 'Course code is required.'
  else if (courses.some(course => course.code.toLowerCase() === value.code.trim().toLowerCase())) errors.code = 'This course code is already in use.'
  if (!integer(value.credits)) errors.credits = 'Enter credit hours as a nonnegative whole number.'
  if (!value.name.trim()) errors.name = 'Course name is required.'
  if (!initialFaculties.some(item => item.id === value.facultyId)) errors.facultyId = 'Select a faculty.'
  if (!courseDepartmentOptions.some(item => item.id === value.departmentId && item.facultyId === value.facultyId)) errors.departmentId = 'Select a department within the chosen faculty.'
  if (value.programId && !courseProgramOptions(value.facultyId, value.departmentId).some(item => item.id === value.programId)) errors.programId = 'Select a program for this department, or leave blank.'
  if (value.year && !courseYearOptions.includes(value.year)) errors.year = 'Select a supported academic year.'
  if (value.term && !courseTermOptions.includes(value.term)) errors.term = 'Select a supported semester.'
  if (value.maxStudents.trim() && (!integer(value.maxStudents) || Number(value.maxStudents) < 1)) errors.maxStudents = 'Enter a positive whole number, or leave blank.'
  if (!['Required', 'Elective'].includes(value.type)) errors.type = 'Select a course type.'
  if (!['active', 'inactive'].includes(value.status)) errors.status = 'Select a status.'
  const prerequisites = value.prerequisites.split(',').map(code => code.trim()).filter(Boolean)
  if (prerequisites.some(code => code.toLowerCase() === value.code.trim().toLowerCase())) errors.prerequisites = 'A course cannot be its own prerequisite.'
  else if (prerequisites.some(code => !courses.some(course => course.code.toLowerCase() === code.toLowerCase()))) errors.prerequisites = 'Use existing course codes separated by commas.'
  return errors
}
export function createDemoCourse(value: CourseDraft, courses: Course[]): Course {
  const department = courseDepartmentOptions.find(item => item.id === value.departmentId)!
  const [semester = '', academicYear = ''] = value.term.split('/')
  return {
    id: crypto.randomUUID(), code: value.code.trim(), name: value.name.trim(), credits: Number(value.credits), description: value.description.trim(),
    departmentId: department.id, departmentName: department.name, facultyId: value.facultyId,
    facultyName: initialFaculties.find(item => item.id === value.facultyId)!.nameEn.replace(/^Faculty of /, ''),
    programIds: value.programId ? [value.programId] : [], curriculumYear: value.year ? Number(value.year) : null,
    semester, academicYear, sectionCount: 0, type: value.type as Course['type'], status: value.status as Course['status'],
    maxStudentsPerSection: value.maxStudents.trim() ? Number(value.maxStudents) : null,
    prerequisiteCodes: [...new Set(value.prerequisites.split(',').map(code => code.trim()).filter(Boolean).map(code => courses.find(item => item.code.toLowerCase() === code.toLowerCase())!.code))],
  }
}
