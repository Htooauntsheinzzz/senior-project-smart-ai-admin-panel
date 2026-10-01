import type { Student } from '../types/student'

// Academic options transcribed from the ten reference rows, not a backend catalog.
export const studentPrograms = [
  { faculty: 'Engineering', department: 'Computer Engineering', major: 'Computer Engineering' },
  { faculty: 'Business Administration', department: 'Marketing', major: 'Digital Marketing' },
  { faculty: 'Information Technology', department: 'Software Engineering', major: 'Mobile Development' },
  { faculty: 'Science', department: 'Data Science', major: 'Data Science' },
  { faculty: 'Medicine', department: 'General Medicine', major: 'General Medicine' },
  { faculty: 'Engineering', department: 'Electrical Engineering', major: 'Electrical Engineering' },
  { faculty: 'Liberal Arts', department: 'English', major: 'English for Communication' },
  { faculty: 'Business Administration', department: 'Finance', major: 'Financial Technology' },
  { faculty: 'Information Technology', department: 'Cybersecurity', major: 'Cybersecurity' },
  { faculty: 'Science', department: 'Mathematics', major: 'Applied Mathematics' },
]

type ReferenceRow = [string, string, string, string, number, Student['semester'], Student['status'], string]
const referenceRows: ReferenceRow[] = [
  ['Thanapon Srisuk', 'STD-2024-0001', 'thanapon.s@rsu.ac.th', 'TS', 2, 'Sem 1/2568', 'Active', '#7c3aed'],
  ['Pimchanok Buranasiri', 'STD-2024-0002', 'pimchanok.b@rsu.ac.th', 'PB', 3, 'Sem 1/2568', 'Active', '#d97706'],
  ['Kittipong Manit', 'STD-2024-0003', 'kittipong.m@rsu.ac.th', 'KM', 1, 'Sem 1/2568', 'Active', '#d80255'],
  ['Naruemon Chaiya', 'STD-2023-0147', 'naruemon.c@rsu.ac.th', 'NC', 3, 'Sem 2/2567', 'Active', '#2563eb'],
  ['Wanchai Pongpai', 'STD-2022-0283', 'wanchai.p@rsu.ac.th', 'WP', 4, 'Sem 1/2568', 'Active', '#d97706'],
  ['Apirak Thongchai', 'STD-2023-0312', 'apirak.t@rsu.ac.th', 'AT', 3, 'Sem 1/2568', 'Inactive', '#059669'],
  ['Sirikwan Lertsak', 'STD-2024-0058', 'sirikwan.l@rsu.ac.th', 'SL', 2, 'Sem 1/2568', 'Active', '#6366f1'],
  ['Phongphat Tadee', 'STD-2022-0401', 'phongphat.t@rsu.ac.th', 'PT', 4, 'Sem 1/2568', 'Active', '#d97706'],
  ['Sutida Kamnerd', 'STD-2024-0099', 'sutida.k@rsu.ac.th', 'SK', 1, 'Sem 1/2568', 'Active', '#6366f1'],
  ['Jirapon Sombat', 'STD-2023-0205', 'jirapon.s@rsu.ac.th', 'JS', 3, 'Sem 2/2567', 'Suspended', '#0ea5e9'],
]

export const referenceStudents: Student[] = referenceRows.map(([name, studentId, email, initials, year, semester, status, avatarColor], index) => ({
  ...studentPrograms[index], name, studentId, email, initials, year, semester, status, avatarColor, newThisSemester: false, source: 'figma',
}))

// The source only supplies ten rows. These explicitly named demo records make
// pagination usable and reproduce its 24 / 20 / 3 / 4 summary values. The three
// newThisSemester flags are explicit mock metrics, not inferred from year/semester.
export const initialStudents: Student[] = [...referenceStudents, ...Array.from({ length: 14 }, (_, index): Student => ({
  ...studentPrograms[index % studentPrograms.length],
  studentId: `DEMO-STU-${String(index + 1).padStart(3, '0')}`,
  name: `Demo Student ${String(index + 1).padStart(2, '0')}`,
  email: `student${index + 1}@example.com`,
  year: index % 4 + 1, semester: 'Sem 1/2568', status: index < 12 ? 'Active' : index === 12 ? 'Inactive' : 'Suspended',
  initials: 'DS', avatarColor: '#6366f1', newThisSemester: index < 3, source: 'synthetic',
}))]
