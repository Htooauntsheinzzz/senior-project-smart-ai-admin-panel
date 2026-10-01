import type { Enrollment } from '../data/enrollments'
export const emptyEnrollmentFilters = { query: '', studentId: '', course: '', section: '', semester: '', year: '', status: '' }
export type EnrollmentFilters = typeof emptyEnrollmentFilters
export function filterEnrollments(rows: Enrollment[], filters: EnrollmentFilters) {
  const query = filters.query.trim().toLowerCase()
  return rows.filter(row => [row.studentId, row.name, row.course, row.courseName].some(value => value.toLowerCase().includes(query)) &&
    (['studentId', 'course', 'section', 'semester', 'year', 'status'] as const).every(key => !filters[key] || row[key] === filters[key]))
}
export function enrollmentTotals(rows: Enrollment[]) {
  return [rows.length, rows.filter(row => row.status === 'Active').length, rows.filter(row => row.status === 'Pending').length, rows.filter(row => row.status === 'Withdrawn' || row.status === 'Dropped').length]
}
export function enrollmentsCsv(rows: Enrollment[]) {
  const escape = (value: string) => `"${(/^[=+\-@\t\r]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`
  return '\uFEFF' + [['Student ID', 'Student Name', 'Course', 'Course Name', 'Section', 'Enrollment Date', 'Semester', 'Academic Year', 'Status', 'Source'], ...rows.map(row => [row.studentId, row.name, row.course, row.courseName, row.section, row.date, row.semester, row.year, row.status, row.demo ? 'Synthetic demo' : 'Figma reference'])].map(row => row.map(escape).join(',')).join('\r\n')
}
