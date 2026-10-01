import type { Department } from '../types/department'

// The 18 supplied reference rows. Faculty IDs refer to the shared demo faculty
// fixtures, not backend identifiers. No extra rows reconcile the other screen's totals.
const rows: [string, string, string, number, number, number][] = [
  ['CE', 'Computer Engineering', 'eng', 2, 22, 110],
  ['EE', 'Electrical Engineering', 'eng', 1, 18, 108],
  ['ME', 'Mechanical Engineering', 'eng', 1, 20, 102],
  ['SE', 'Software Engineering', 'it', 2, 19, 98],
  ['DS', 'Data Science', 'it', 2, 15, 97],
  ['CYB', 'Cybersecurity', 'it', 1, 14, 90],
  ['MKT', 'Marketing', 'biz', 2, 17, 145],
  ['FIN', 'Finance', 'biz', 2, 16, 138],
  ['IB', 'International Business', 'biz', 1, 14, 129],
  ['MTH', 'Mathematics', 'sci', 2, 12, 60],
  ['PHY', 'Physics', 'sci', 1, 10, 58],
  ['BCH', 'Biochemistry', 'sci', 1, 11, 60],
  ['GM', 'General Medicine', 'med', 1, 32, 72],
  ['NRS', 'Nursing', 'med', 1, 24, 68],
  ['PHA', 'Pharmacy', 'med', 1, 26, 63],
  ['ENG', 'English', 'la', 1, 9, 54],
  ['JPN', 'Japanese', 'la', 1, 8, 52],
  ['CA', 'Communication Arts', 'la', 2, 11, 50],
]
export const initialDepartments: Department[] = rows.map(([code, name, facultyId, programCount, courseCount, studentCount]) => ({ id: `reference-${code}`, code: `DEPT-${code}`, name, facultyId, programCount, courseCount, studentCount, status: 'active' }))
