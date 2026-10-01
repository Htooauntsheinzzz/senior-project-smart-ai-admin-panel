import { studentPrograms } from '../data/students'
import { studentSemesters, studentStatuses, type Student, type StudentFilters, type StudentInput } from '../types/student'

export const emptyStudentFilters: StudentFilters = { faculty: '', department: '', major: '', year: '', semester: '', status: '' }

export function filterStudents(students: Student[], query: string, filters: StudentFilters) {
  const search = query.trim().toLowerCase()
  return students.filter(student =>
    (!search || [student.studentId, student.name, student.email].some(value => value.toLowerCase().includes(search))) &&
    Object.entries(filters).every(([field, value]) => !value || String(student[field as keyof StudentFilters]) === value),
  )
}

export function updateStudentFilters(filters: StudentFilters, field: keyof StudentFilters, value: string): StudentFilters {
  const next = { ...filters, [field]: value }
  if (field === 'faculty') {
    if (!studentPrograms.some(p => (!value || p.faculty === value) && p.department === next.department)) next.department = ''
  }
  if (field === 'faculty' || field === 'department') {
    if (!studentPrograms.some(p => (!next.faculty || p.faculty === next.faculty) && (!next.department || p.department === next.department) && p.major === next.major)) next.major = ''
  }
  return next
}

export function validateStudent(input: StudentInput, existing: Student[]) {
  const errors: Partial<Record<keyof StudentInput, string>> = {}
  if (!input.name.trim()) errors.name = 'Full name is required.'
  if (!input.studentId.trim()) errors.studentId = 'Student ID is required.'
  else if (existing.some(s => s.studentId.toLowerCase() === input.studentId.trim().toLowerCase())) errors.studentId = 'This student ID already exists.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) errors.email = 'Enter a valid university email address.'
  else if (existing.some(s => s.email.toLowerCase() === input.email.trim().toLowerCase())) errors.email = 'This email already exists.'
  if (!studentPrograms.some(p => p.faculty === input.faculty && p.department === input.department && p.major === input.major)) errors.major = 'Choose a valid faculty, department, and major combination.'
  if (!Number.isInteger(input.year) || input.year < 1 || input.year > 6) errors.year = 'Select a year from 1 to 6.'
  if (!studentSemesters.includes(input.semester)) errors.semester = 'Select a supported semester.'
  if (!studentStatuses.includes(input.status)) errors.status = 'Select a supported status.'
  return errors
}

export function makeLocalStudent(input: StudentInput): Student {
  return { ...input, studentId: input.studentId.trim(), name: input.name.trim(), email: input.email.trim(), initials: input.name.trim().split(/\s+/).slice(0, 2).map(part => part[0].toUpperCase()).join(''), avatarColor: '#273238', source: 'local' }
}

export function studentsCsv(students: Student[]) {
  const cell = (value: string) => `"${(/^[\s]*[=+@-]|^[\t\r\n]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`
  return [
    ['Student ID', 'Name', 'Email', 'Faculty', 'Department', 'Major', 'Year', 'Semester', 'Status'],
    ...students.map(s => [s.studentId, s.name, s.email, s.faculty, s.department, s.major, String(s.year), s.semester, s.status]),
  ].map(row => row.map(cell).join(',')).join('\r\n')
}
