export const timetableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
export type TimetableDay = typeof timetableDays[number]
export type FacultyKey = 'information' | 'engineering' | 'business' | 'science' | 'medicine' | 'liberal'
export interface TimetableCourse {
  code: string
  title: string
  faculty: FacultyKey
  department: string
}
export interface ClassSchedule {
  id: string
  courseCode: string
  day: TimetableDay
  start: number
  end: number
  section: string
  room: string
  instructor: string
  semester: string
  academicYear: string
}
export type ScheduleInput = Omit<ClassSchedule, 'id'>
export interface TimetableFilters {
  semester: string
  academicYear: string
  faculty: string
  department: string
  course: string
}
