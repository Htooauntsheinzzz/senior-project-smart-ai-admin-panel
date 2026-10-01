import { initialEnrollments, type Enrollment } from '../data/enrollments'

export const emptyEnrollmentDraft = { studentId: '', course: '', section: '', semester: '', year: '' }
export type EnrollmentDraft = typeof emptyEnrollmentDraft
export const enrollmentStudents = [...new Map(initialEnrollments.map(row => [row.studentId, row])).values()]
export const enrollmentCourses = [...new Map(initialEnrollments.map(row => [row.course, row])).values()]
export const enrollmentSemesters = [...new Set(initialEnrollments.map(row => row.semester))]
export const enrollmentYears = [...new Set(initialEnrollments.map(row => row.year))]
export function enrollmentSections(course: string) {
  return [...new Set(initialEnrollments.filter(row => row.course === course).map(row => row.section))]
}
export function validateEnrollment(value: EnrollmentDraft, rows: Enrollment[]) {
  const errors: Partial<Record<keyof EnrollmentDraft, string>> = {}
  if (!enrollmentStudents.some(row => row.studentId === value.studentId)) errors.studentId = 'Select a student.'
  if (!enrollmentCourses.some(row => row.course === value.course)) errors.course = 'Select a course.'
  if (!enrollmentSections(value.course).includes(value.section)) errors.section = 'Select a section for this course.'
  if (!enrollmentSemesters.includes(value.semester)) errors.semester = 'Select a semester.'
  if (!enrollmentYears.includes(value.year)) errors.year = 'Select an academic year.'
  if (!Object.keys(errors).length && rows.some(row => row.studentId === value.studentId && row.course === value.course && row.semester === value.semester && row.year === value.year && (row.status === 'Active' || row.status === 'Pending'))) errors.course = 'This student already has an active or pending enrollment in this course and term.'
  return errors
}
export function createLocalEnrollment(value: EnrollmentDraft): Enrollment {
  const student = enrollmentStudents.find(row => row.studentId === value.studentId)!
  const course = enrollmentCourses.find(row => row.course === value.course)!
  const now = new Date()
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return { ...value, id: crypto.randomUUID(), name: student.name, color: student.color, courseName: course.courseName, date, status: 'Active', demo: true }
}
