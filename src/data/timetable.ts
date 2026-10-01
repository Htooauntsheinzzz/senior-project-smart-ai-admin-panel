import type { ClassSchedule, FacultyKey, TimetableCourse, TimetableDay } from '../types/timetable'

export const faculties: { id: FacultyKey; label: string; name: string; color: string; background: string; foreground: string }[] = [
  { id: 'information', label: 'Information', name: 'Information Technology', color: '#6366ff', background: '#eef0ff', foreground: '#4338ca' },
  { id: 'engineering', label: 'Engineering', name: 'Engineering', color: '#2563eb', background: '#dbeafe', foreground: '#1d4ed8' },
  { id: 'business', label: 'Business', name: 'Business Administration', color: '#d97706', background: '#fef3c7', foreground: '#b45309' },
  { id: 'science', label: 'Science', name: 'Science', color: '#059669', background: '#d1fae5', foreground: '#047857' },
  { id: 'medicine', label: 'Medicine', name: 'Medicine', color: '#e11d48', background: '#ffe4e6', foreground: '#be123c' },
  { id: 'liberal', label: 'Liberal', name: 'Liberal Arts', color: '#c026d3', background: '#fce7f3', foreground: '#a21caf' },
]

// Titles visible in the calendar; department mappings are local demo metadata
// because the reference only shows closed department filters.
export const timetableCourses: TimetableCourse[] = [
  { code: 'CS301', title: 'Data Structures & Algorithms', faculty: 'information', department: 'Computer Science' },
  { code: 'CS315', title: 'Database Systems', faculty: 'information', department: 'Computer Science' },
  { code: 'CS322', title: 'Software Engineering', faculty: 'information', department: 'Computer Science' },
  { code: 'CS340', title: 'Computer Networks', faculty: 'information', department: 'Computer Science' },
  { code: 'CS350', title: 'Operating Systems', faculty: 'information', department: 'Computer Science' },
  { code: 'CS401', title: 'Artificial Intelligence', faculty: 'information', department: 'Computer Science' },
  { code: 'CS410', title: 'Machine Learning', faculty: 'information', department: 'Computer Science' },
  { code: 'CE201', title: 'Circuit Analysis', faculty: 'engineering', department: 'Electrical Engineering' },
  { code: 'BA102', title: 'Principles of Management', faculty: 'business', department: 'Management' },
  { code: 'MA211', title: 'Calculus II', faculty: 'science', department: 'Mathematics' },
  { code: 'BIO301', title: 'Human Anatomy', faculty: 'medicine', department: 'General Medicine' },
  { code: 'GE201', title: 'English for Academic Purposes', faculty: 'liberal', department: 'English' },
]

type ReferenceSchedule = [TimetableDay, string, number, number, string, string, string]
// Times and visible card contents transcribed from node 34:3999. Ellipses retain
// text clipped in the source instead of claiming unobserved complete values.
const referenceSchedules: ReferenceSchedule[] = [
  ['Monday', 'CS301', 8, 10, 'SEC-01', 'IT-301', 'Wichai Saengsuwan'],
  ['Monday', 'BA102', 8, 10, 'SEC-01', 'BA-201', 'Charowan Manit'],
  ['Monday', 'CS315', 10, 12, 'SEC-01', 'IT-202', 'Nittaya Chindakhan'],
  ['Monday', 'MA211', 13, 15, 'SEC-01', 'SC-101', 'Prasert Sombat'],
  ['Monday', 'CS322', 13, 16, 'SEC-01', 'IT-405', 'Supakorn Tanti…'],
  ['Monday', 'GE201', 15, 17, 'SEC-01', 'LA-101', 'Sarah Mitchell'],
  ['Tuesday', 'CE201', 8, 10, 'SEC-01', 'EN-101', 'Anuwat Chalermchai'],
  ['Tuesday', 'CS340', 9, 12, 'SEC-01', 'IT-B01', 'Apinya Srisawat'],
  ['Tuesday', 'BA102', 13, 15, 'SEC-02', 'BA-202', 'Charowan Manit'],
  ['Tuesday', 'CS401', 13, 15, 'SEC-01', 'IT-B02', 'Rangsima Boonmee'],
  ['Tuesday', 'CS350', 15, 17, 'SEC-01', 'IT-301', 'Somsak Wiriya'],
  ['Wednesday', 'CS301', 8, 10, 'SEC-02', 'IT-301', 'Wichai Saengsuwan'],
  ['Wednesday', 'BA102', 8, 10, 'SEC-01', 'BA-201', 'Charowan Manit'],
  ['Wednesday', 'CS315', 10, 12, 'SEC-02', 'IT-203', 'Nittaya Chindakhan'],
  ['Wednesday', 'CS410', 13, 16, 'SEC-01', 'IT-B02', 'Rangsima Boonmee'],
  ['Wednesday', 'GE201', 15, 17, 'SEC-02', 'LA-102', 'Sarah Mitchell'],
  ['Thursday', 'MA211', 8, 10, 'SEC-02', 'SC-1…', 'Prasert Sombat'],
  ['Thursday', 'BIO301', 8, 11, 'SEC-01', 'MED-…', 'Pimchanok Kar…'],
  ['Thursday', 'CS340', 9, 12, 'SEC-01', 'IT-B01', 'Apinya Srisawat'],
  ['Thursday', 'CE201', 13, 15, 'SEC-01', 'EN-102', 'Anuwat Chalermchai'],
  ['Thursday', 'CS322', 13, 16, 'SEC-02', 'IT-406', 'Siriwan Phakdee'],
  ['Friday', 'CS350', 9, 12, 'SEC-01', 'IT-301', 'Somsak Wiriya'],
  ['Friday', 'GE201', 10, 12, 'SEC-03', 'LA-101', 'Sarah Mitchell'],
  ['Friday', 'CS322', 13, 16, 'SEC-02', 'IT-406', 'Siriwan Phakdee'],
  ['Friday', 'MA211', 13, 15, 'SEC-01', 'SC-101', 'Prasert Sombat'],
  ['Saturday', 'CS401', 9, 12, 'SEC-02', 'IT-B01', 'Rangsima Boonmee'],
  ['Saturday', 'BA102', 9, 12, 'SEC-03', 'BA-203', 'Kannika Rattana'],
  ['Saturday', 'GE201', 13, 16, 'SEC-04', 'LA-101', 'Sarah Mitchell'],
  ['Saturday', 'CS410', 13, 16, 'SEC-01', 'IT-B02', 'Rangsima Boonmee'],
]

export const initialSchedules: ClassSchedule[] = referenceSchedules.map(([day, courseCode, start, end, section, room, instructor], index) => ({
  id: `reference-${index + 1}`, day, courseCode, start: start * 60, end: end * 60, section, room, instructor, semester: '1/2568', academicYear: '2025–2026',
}))
