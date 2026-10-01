import { initialFaculties } from './faculties'
import type { Course } from '../types/course'

export const currentCourseTerm = { semester: '1', academicYear: '2568' }
type ReferenceRow = [string, string, number, string, string, number, number, string[]]
// Visible columns are transcribed from the Courses reference. Program suffixes
// are explicitly illustrative demo memberships, not data recovered from Figma.
const rows: ReferenceRow[] = [
  ['CS101', 'Introduction to Programming', 3, 'Software Engineering', 'it', 1, 4, ['SE-BS', 'MOB-BS']],
  ['CS201', 'Data Structures', 3, 'Software Engineering', 'it', 2, 3, ['SE-BS', 'MOB-BS']],
  ['CS301', 'Data Structures & Algorithms', 3, 'Computer Engineering', 'it', 2, 3, ['SE-BS']],
  ['CS315', 'Database Systems', 3, 'Software Engineering', 'it', 2, 3, ['SE-BS', 'MOB-BS']],
  ['CS322', 'Software Engineering', 3, 'Software Engineering', 'it', 3, 2, ['SE-BS']],
  ['CS340', 'Computer Networks', 3, 'Computer Engineering', 'it', 3, 2, ['CYB-BS']],
  ['CS401', 'Artificial Intelligence', 3, 'Data Science', 'it', 3, 2, ['DS-BS', 'AI-BS']],
  ['CS410', 'Machine Learning', 3, 'Data Science', 'it', 3, 2, ['DS-BS', 'AI-BS']],
  ['CS450', 'Cybersecurity Fundamentals', 3, 'Cybersecurity', 'it', 2, 2, ['CYB-BS']],
  ['MTH101', 'Calculus I', 3, 'Mathematics', 'sci', 1, 5, ['MTH-BS', 'STAT-BS']],
  ['MTH201', 'Linear Algebra', 3, 'Mathematics', 'sci', 2, 3, ['MTH-BS']],
  ['MTH202', 'Probability & Statistics', 3, 'Mathematics', 'sci', 2, 3, ['MTH-BS', 'STAT-BS']],
  ['BIZ101', 'Principles of Management', 3, 'Management', 'biz', 1, 4, ['MKT-BS', 'FIN-BS', 'IB-BS']],
  ['MKT201', 'Marketing Management', 3, 'Marketing', 'biz', 2, 3, ['MKT-BS', 'DMKT-BS']],
  ['FIN201', 'Financial Management', 3, 'Finance', 'biz', 2, 3, ['FIN-BS', 'FINT-BS']],
  ['GE101', 'English for Academic Purposes', 2, 'English', 'la', 1, 6, ['ENG-BA']],
  ['GE201', 'Critical Thinking', 2, 'Communication Arts', 'la', 1, 4, ['MC-BA', 'PR-BA']],
  ['EE301', 'Circuit Analysis', 3, 'Electrical Engineering', 'eng', 2, 2, ['EE-BS']],
  ['ME201', 'Engineering Mechanics', 3, 'Mechanical Engineering', 'eng', 2, 2, ['ME-BS']],
  ['CS499', 'Senior Project', 6, 'Software Engineering', 'it', 4, 1, ['SE-BS']],
]

export const initialCourses: Course[] = rows.map(([code, name, credits, departmentName, facultyId, curriculumYear, sectionCount, programs]) => ({
  id: `reference-${code}`, code, name, credits, departmentName, facultyId,
  // The screenshot puts Computer Engineering under IT and includes Management.
  // Keep course-local IDs rather than altering the earlier department fixtures.
  departmentId: `course-${facultyId}-${departmentName.toLowerCase().replaceAll(' ', '-')}`,
  facultyName: initialFaculties.find(faculty => faculty.id === facultyId)!.nameEn.replace(/^Faculty of /, ''),
  programIds: programs.map(program => `reference-${program}`), curriculumYear, sectionCount,
  ...currentCourseTerm, type: 'Required', status: 'active',
}))
