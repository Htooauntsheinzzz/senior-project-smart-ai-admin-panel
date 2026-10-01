import type { Course, CourseFilters } from '../types/course'
import { currentCourseTerm } from '../data/courses'

export const emptyCourseFilters: CourseFilters = { query: '', facultyId: '', departmentId: '', programId: '', year: '', term: '', status: '' }
export function filterCourses(courses: Course[], filters: CourseFilters) {
  const query = filters.query.trim().toLocaleLowerCase()
  return courses.filter(course => [course.code, course.name].some(value => value.toLocaleLowerCase().includes(query)) &&
    (!filters.facultyId || course.facultyId === filters.facultyId) && (!filters.departmentId || course.departmentId === filters.departmentId) &&
    (!filters.programId || course.programIds.includes(filters.programId)) && (!filters.year || String(course.curriculumYear) === filters.year) &&
    (!filters.term || `${course.semester}/${course.academicYear}` === filters.term) && (!filters.status || course.status === filters.status))
}
export function changeCourseFilter(filters: CourseFilters, field: keyof CourseFilters, value: string, courses: Course[]): CourseFilters {
  const next = { ...filters, [field]: value }
  if (field === 'facultyId' && !courses.some(course => course.departmentId === next.departmentId && (!next.facultyId || course.facultyId === next.facultyId))) next.departmentId = ''
  if ((field === 'facultyId' || field === 'departmentId') && !courses.some(course => (!next.facultyId || course.facultyId === next.facultyId) && (!next.departmentId || course.departmentId === next.departmentId) && course.programIds.includes(next.programId))) next.programId = ''
  return next
}
export function courseTotals(courses: Course[]) {
  return { total: courses.length, active: courses.filter(course => course.status === 'active').length, current: courses.filter(course => course.semester === currentCourseTerm.semester && course.academicYear === currentCourseTerm.academicYear).length }
}
export function coursesCsv(courses: Course[]) {
  function cell(value: string | number) {
    const text = String(value)
    const safe = /^[\s]*[=+@-]|^[\t\r\n]/.test(text) ? `'${text}` : text
    return `"${safe.replaceAll('"', '""')}"`
  }
  return [
    ['Course Code', 'Course Name', 'Type', 'Credits', 'Department', 'Faculty', 'Semester', 'Academic Year', 'Curriculum Year', 'Sections', 'Status'],
    ...courses.map(course => [course.code, course.name, course.type, course.credits, course.departmentName, course.facultyName, course.semester, course.academicYear, course.curriculumYear ?? '', course.sectionCount, course.status === 'active' ? 'Active' : 'Inactive']),
  ].map(row => row.map(cell).join(',')).join('\r\n')
}
