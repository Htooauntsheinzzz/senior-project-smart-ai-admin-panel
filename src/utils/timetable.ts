import { timetableCourses } from '../data/timetable'
import { timetableDays, type ClassSchedule, type ScheduleInput, type TimetableFilters } from '../types/timetable'

export function formatScheduleTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

export function filterSchedules(schedules: ClassSchedule[], filters: TimetableFilters) {
  return schedules.filter(schedule => {
    const course = timetableCourses.find(item => item.code === schedule.courseCode)
    return schedule.semester === filters.semester && schedule.academicYear === filters.academicYear &&
      (!filters.faculty || course?.faculty === filters.faculty) && (!filters.department || course?.department === filters.department) && (!filters.course || schedule.courseCode === filters.course)
  })
}

// Separate lanes within each transitively overlapping group, matching Figma's
// three Monday-afternoon lanes. Adjacent, non-overlapping groups use full width.
export function layoutDaySchedules(schedules: ClassSchedule[]) {
  const groups: ClassSchedule[][] = []
  let groupEnd = -1
  for (const schedule of [...schedules].sort((a, b) => a.start - b.start)) {
    if (schedule.start >= groupEnd) { groups.push([schedule]); groupEnd = schedule.end }
    else { groups[groups.length - 1].push(schedule); groupEnd = Math.max(groupEnd, schedule.end) }
  }
  return groups.flatMap(group => group.map((schedule, lane) => ({ schedule, lane, lanes: group.length })))
}

export function validateSchedule(input: ScheduleInput, schedules: ClassSchedule[]) {
  if (!timetableCourses.some(course => course.code === input.courseCode)) return 'Select a course.'
  if (!timetableDays.includes(input.day)) return 'Select a valid weekday.'
  if (!input.section.trim() || !input.room.trim() || !input.instructor.trim()) return 'Section, room, and instructor are required.'
  if (!Number.isFinite(input.start) || !Number.isFinite(input.end) || input.start < 480 || input.end > 1080 || input.end - input.start < 60) return 'Choose a class of at least one hour between 08:00 and 18:00.'
  const conflicts = schedules.filter(existing => existing.day === input.day && existing.semester === input.semester && existing.academicYear === input.academicYear && input.start < existing.end && existing.start < input.end &&
    (existing.room.trim().toLowerCase() === input.room.trim().toLowerCase() || existing.instructor.trim().toLowerCase() === input.instructor.trim().toLowerCase() || (existing.courseCode === input.courseCode && existing.section.trim().toLowerCase() === input.section.trim().toLowerCase())))
  return conflicts.length ? `This schedule overlaps ${conflicts[0].courseCode} (${formatScheduleTime(conflicts[0].start)}–${formatScheduleTime(conflicts[0].end)}) for the same room, instructor, or course section. Adjust the time or assignment.` : ''
}
