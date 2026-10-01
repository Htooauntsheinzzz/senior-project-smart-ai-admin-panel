import { initialCourses } from '../data/courses'
import { sectionLecturers, sectionSemesters, sectionYears } from '../data/courseSections'
import type { CourseSection, SectionDraft, SectionFilters } from '../types/courseSection'

export const emptySectionDraft: SectionDraft = { courseId: '', number: '', capacity: '50', lecturerId: '', room: '', schedule: '', semester: '1/2568', academicYear: '2024', status: 'active' }
export const emptySectionFilters: SectionFilters = { query: '', courseId: '', semester: '', academicYear: '', lecturerId: '', status: '' }
export function sectionStatus(section: CourseSection) { return section.status === 'closed' ? 'Closed' : section.enrolled >= section.capacity ? 'Full' : 'Active' }
// Prototype threshold: <80% neutral, 80–99% amber, full magenta. This reproduces
// all reference bar colors without claiming a verified production threshold.
export function capacityColor(section: CourseSection) { return section.enrolled >= section.capacity ? '#d80255' : section.enrolled / section.capacity >= 0.8 ? '#d97706' : '#273238' }
export function sectionTotals(sections: CourseSection[]) {
  return { total: sections.length, active: sections.filter(item => sectionStatus(item) === 'Active').length, full: sections.filter(item => sectionStatus(item) === 'Full').length, enrolled: sections.reduce((sum, item) => sum + item.enrolled, 0), capacity: sections.reduce((sum, item) => sum + item.capacity, 0) }
}
export function filterSections(sections: CourseSection[], filters: SectionFilters) {
  const query = filters.query.trim().toLowerCase()
  return sections.filter(section => {
    const course = initialCourses.find(item => item.id === section.courseId)
    return [course?.code ?? '', course?.name ?? '', section.number, `Sec ${section.number}`].some(text => text.toLowerCase().includes(query)) &&
      (!filters.courseId || section.courseId === filters.courseId) && (!filters.semester || section.semester === filters.semester) && (!filters.academicYear || section.academicYear === filters.academicYear) &&
      (!filters.lecturerId || section.lecturerId === filters.lecturerId) && (!filters.status || sectionStatus(section).toLowerCase() === filters.status)
  })
}
export function validateSection(value: SectionDraft, sections: CourseSection[]) {
  const errors: Partial<Record<keyof SectionDraft, string>> = {}
  if (!initialCourses.some(course => course.id === value.courseId)) errors.courseId = 'Select a course.'
  if (!/^\d+$/.test(value.number.trim()) || !Number.isSafeInteger(Number(value.number)) || Number(value.number) < 1) errors.number = 'Enter a positive section number.'
  else if (sections.some(section => section.courseId === value.courseId && Number(section.number) === Number(value.number) && section.semester === value.semester && section.academicYear === value.academicYear)) errors.number = 'This section already exists for the course, semester, and academic year.'
  if (value.capacity.trim() && (!/^\d+$/.test(value.capacity.trim()) || !Number.isSafeInteger(Number(value.capacity)) || Number(value.capacity) < 1)) errors.capacity = 'Enter a positive whole-number capacity, or leave blank for 50.'
  if (!sectionLecturers.some(item => item.id === value.lecturerId)) errors.lecturerId = 'Select a lecturer.'
  if (!sectionSemesters.includes(value.semester)) errors.semester = 'Select a semester.'
  if (!sectionYears.includes(value.academicYear)) errors.academicYear = 'Select an academic year.'
  if (!['active', 'closed'].includes(value.status)) errors.status = 'Select a valid status.'
  return errors
}
export function createDemoSection(value: SectionDraft): CourseSection {
  return { ...value, id: crypto.randomUUID(), number: String(Number(value.number)).padStart(2, '0'), capacity: value.capacity.trim() ? Number(value.capacity) : 50, room: value.room.trim(), schedule: value.schedule.trim(), enrolled: 0 }
}
