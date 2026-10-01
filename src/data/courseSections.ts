import type { CourseSection } from '../types/courseSection'

export const sectionLecturers = [
  { id: 'nittaya-asst', name: 'Asst. Prof. Nittaya Chindakhan' },
  { id: 'pongsakorn', name: 'Dr. Pongsakorn Rattana' },
  { id: 'wichai', name: 'Assoc. Prof. Wichai Saengsuwan' },
  { id: 'apinya', name: 'Dr. Apinya Srisawat' },
  { id: 'supakorn', name: 'Prof. Supakorn Tantibundit' },
  { id: 'nittaya-dr', name: 'Dr. Nittaya Chindakhan' },
  { id: 'siriporn', name: 'Asst. Prof. Siriporn Kaewmanee' },
  { id: 'chanida', name: 'Prof. Chanida Buransiri' },
  { id: 'thanawat', name: 'Dr. Thanawat Phongsatit' },
  { id: 'sarah', name: 'Asst. Prof. Sarah Mitchell' },
  { id: 'emma', name: 'Ms. Emma Johnson' },
]
// Local IDs preserve the distinct lecturer titles in the reference. Production
// identity resolution is not inferred from similar names.
export const sectionSemesters = ['1/2568', '2/2568', 'Summer/2568']
export const sectionYears = ['2024', '2025', '2026']
const rows: [string, string, string, string, string, number, number][] = [
  ['CS101', '01', 'nittaya-asst', 'IT-101', 'Mon/Wed 08:00–09:30', 48, 50],
  ['CS101', '02', 'nittaya-asst', 'IT-102', 'Mon/Wed 10:00–11:30', 47, 50],
  ['CS101', '03', 'pongsakorn', 'IT-103', 'Tue/Thu 08:00–09:30', 46, 50],
  ['CS101', '04', 'pongsakorn', 'IT-104', 'Tue/Thu 10:00–11:30', 39, 50],
  ['CS201', '01', 'wichai', 'IT-201', 'Mon/Wed 13:00–14:30', 50, 50],
  ['CS201', '02', 'wichai', 'IT-202', 'Tue/Thu 13:00–14:30', 48, 50],
  ['CS201', '03', 'apinya', 'IT-203', 'Fri 09:00–12:00', 37, 50],
  ['CS301', '01', 'supakorn', 'IT-301', 'Mon/Wed 09:00–10:30', 45, 50],
  ['CS301', '02', 'supakorn', 'IT-302', 'Tue/Thu 09:00–10:30', 43, 50],
  ['CS301', '03', 'apinya', 'IT-303', 'Mon/Wed 15:00–16:30', 40, 50],
  ['CS315', '01', 'nittaya-dr', 'IT-201', 'Tue/Thu 13:00–14:30', 46, 50],
  ['CS315', '02', 'nittaya-dr', 'IT-202', 'Mon/Wed 11:00–12:30', 44, 50],
  ['CS315', '03', 'siriporn', 'IT-404', 'Fri 13:00–16:00', 40, 50],
  ['CS322', '01', 'supakorn', 'IT-405', 'Mon/Wed 13:00–14:30', 43, 45],
  ['CS322', '02', 'wichai', 'IT-406', 'Tue/Thu 15:00–16:30', 41, 45],
  ['MTH101', '01', 'chanida', 'SCI-101', 'Mon/Wed/Fri 08:00–09:00', 50, 50],
  ['MTH101', '02', 'chanida', 'SCI-102', 'Mon/Wed/Fri 10:00–11:00', 48, 50],
  ['MTH101', '03', 'thanawat', 'SCI-103', 'Tue/Thu 09:00–10:30', 47, 50],
  ['GE101', '01', 'sarah', 'LA-101', 'Mon/Wed 09:00–10:30', 48, 50],
  ['GE101', '02', 'sarah', 'LA-102', 'Tue/Thu 09:00–10:30', 47, 50],
  ['GE101', '03', 'emma', 'LA-103', 'Mon/Wed 13:00–14:30', 44, 50],
  ['CS450', '01', 'apinya', 'IT-B01', 'Mon 13:00–16:00', 44, 45],
  ['CS450', '02', 'apinya', 'IT-B02', 'Thu 13:00–16:00', 38, 45],
]
export const initialSections: CourseSection[] = rows.map(([code, number, lecturerId, room, schedule, enrolled, capacity]) => ({ id: `${code}-${number}`, courseId: `reference-${code}`, number, lecturerId, room, schedule, enrolled, capacity, semester: '1/2568', academicYear: '2024', status: 'active' }))
