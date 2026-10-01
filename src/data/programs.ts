import { initialDepartments } from './departments'
import type { Degree, Program } from '../types/program'

// Labels and colors transcribed/sampled from the exported Program Screen.
export const degrees: Degree[] = [
  { id: 'beng', name: 'Bachelor of Engineering', background: '#DBEAFE', color: '#2563EB' },
  { id: 'meng', name: 'Master of Engineering', background: '#E0F2FE', color: '#0369A1' },
  { id: 'bsc', name: 'Bachelor of Science', background: '#D1FAE5', color: '#059669' },
  { id: 'bba', name: 'Bachelor of Business Admin', background: '#FEF3C7', color: '#D97706' },
  { id: 'md', name: 'Doctor of Medicine', background: '#FFF7ED', color: '#C2410C' },
  { id: 'bns', name: 'Bachelor of Nursing Science', background: '#FCE7F3', color: '#DB2777' },
  { id: 'bpharm', name: 'Bachelor of Pharmacy', background: '#FEE2E2', color: '#DC2626' },
  { id: 'ba', name: 'Bachelor of Arts', background: '#EDE9FE', color: '#7C3AED' },
]
// Configured demo options; the reference does not reveal the select's choices.
export const programDurations = [1, 2, 3, 4, 5, 6]

const rows: [string, string, string, string, number, number][] = [
  ['CE-BS', 'Computer Engineering', 'CE', 'beng', 4, 144],
  ['CE-MS', 'Computer Engineering (Graduate)', 'CE', 'meng', 2, 36],
  ['EE-BS', 'Electrical Engineering', 'EE', 'beng', 4, 138],
  ['ME-BS', 'Mechanical Engineering', 'ME', 'beng', 4, 140],
  ['SE-BS', 'Software Engineering', 'SE', 'bsc', 4, 132],
  ['MOB-BS', 'Mobile Development', 'SE', 'bsc', 4, 130],
  ['DS-BS', 'Data Science', 'DS', 'bsc', 4, 128],
  ['AI-BS', 'Artificial Intelligence', 'DS', 'bsc', 4, 130],
  ['CYB-BS', 'Cybersecurity', 'CYB', 'bsc', 4, 128],
  ['MKT-BS', 'Marketing', 'MKT', 'bba', 4, 126],
  ['DMKT-BS', 'Digital Marketing', 'MKT', 'bba', 4, 124],
  ['FIN-BS', 'Finance', 'FIN', 'bba', 4, 126],
  ['FINT-BS', 'Financial Technology', 'FIN', 'bba', 4, 126],
  ['IB-BS', 'International Business', 'IB', 'bba', 4, 128],
  ['MTH-BS', 'Applied Mathematics', 'MTH', 'bsc', 4, 130],
  ['STAT-BS', 'Statistics', 'MTH', 'bsc', 4, 128],
  ['PHY-BS', 'Applied Physics', 'PHY', 'bsc', 4, 132],
  ['BCH-BS', 'Biochemistry', 'BCH', 'bsc', 4, 136],
  ['MD', 'Doctor of Medicine', 'GM', 'md', 6, 234],
  ['NRS-BS', 'Nursing Science', 'NRS', 'bns', 4, 144],
  ['PHA-BS', 'Pharmaceutical Science', 'PHA', 'bpharm', 5, 186],
  ['ENG-BA', 'English for Communication', 'ENG', 'ba', 4, 122],
  ['JPN-BA', 'Japanese Studies', 'JPN', 'ba', 4, 120],
  ['MC-BA', 'Mass Communication', 'CA', 'ba', 4, 124],
  ['PR-BA', 'Public Relations', 'CA', 'ba', 4, 122],
]

// All 25 visible records from node 54:4923. IDs are local fixture identifiers.
export const initialPrograms: Program[] = rows.map(([code, name, departmentCode, degreeId, durationYears, totalCredits]) => {
  const department = initialDepartments.find(item => item.code === `DEPT-${departmentCode}`)!
  return { id: `reference-${code}`, code: `PRG-${code}`, name, facultyId: department.facultyId, departmentId: department.id, degreeId, durationYears, totalCredits, status: code === 'PR-BA' ? 'inactive' : 'active' }
})
