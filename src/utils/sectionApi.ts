import type { CourseSection, SectionDraft } from '../types/courseSection'

export function validateSectionForm(value: SectionDraft, editing = false) {
  const errors: Partial<Record<keyof SectionDraft, string>> = {}
  if (!/^[1-9]\d*$/.test(value.courseId) || !Number.isSafeInteger(Number(value.courseId))) errors.courseId = 'Select a course.'
  if (!value.number.trim()) errors.number = 'Section number is required.'
  else if (value.number.trim().length > 20) errors.number = 'Use at most 20 characters.'
  if (value.capacity.trim() && (!/^\d+$/.test(value.capacity.trim()) || !Number.isSafeInteger(Number(value.capacity)) || Number(value.capacity) < 1)) errors.capacity = 'Enter a positive whole-number capacity, or leave blank for default.'
  if (!/^[1-9]\d*$/.test(value.lecturerId) || !Number.isSafeInteger(Number(value.lecturerId))) errors.lecturerId = 'Enter a valid lecturer ID.'
  if (value.room.trim().length > 100) errors.room = 'Use at most 100 characters.'
  if (value.schedule.trim().length > 255) errors.schedule = 'Use at most 255 characters.'
  if (!/^[1-9]\d*$/.test(value.semester) || !Number.isSafeInteger(Number(value.semester))) errors.semester = 'Select a semester.'
  if (!['active', 'closed'].includes(value.status)) errors.status = 'Select a valid status.'
  if (editing && !value.capacity.trim()) errors.capacity = 'Capacity is required when updating a section.'
  if (Number(value.capacity) > 2147483647) errors.capacity = 'Capacity must not exceed 2147483647.'
  return errors
}

export function sectionError(error: unknown) {
  const response = (error as { response?: { status: number; data?: { code?: string } } })?.response
  const fields: Partial<Record<keyof SectionDraft, string>> = {}
  let message = 'Unable to complete the request. Please try again.'
  const code = response?.data?.code
  if (response?.status === 403) message = 'You do not have permission to perform this action.'
  else if (response && [400, 404, 409].includes(response.status)) {
    if (code === 'INVALID_COURSE_SECTION_COURSE') fields.courseId = message = 'The selected course is inactive or unavailable.'
    else if (code === 'INVALID_COURSE_SECTION_LECTURER') fields.lecturerId = message = 'The selected lecturer is inactive or does not belong to the course faculty and department.'
    else if (code === 'INVALID_COURSE_SECTION_STATUS') fields.status = message = 'The selected status is invalid.'
    else if (code === 'COURSE_SECTION_ALREADY_EXISTS') fields.number = message = 'Course section already exists for this course and semester.'
    else if (code === 'COURSE_SECTION_NOT_FOUND') message = 'Section not found.'
    else if (response.status === 404) message = 'A selected course, lecturer, or semester is unavailable.'
    else if (response.status === 400) message = 'The request is invalid. Check the entered values.'
    else message = 'The request conflicts with current server data. Refresh and try again.'
  } else if (!response && error instanceof Error && ['Search must be at most 255 characters.', 'Too many sections to display completely. Narrow your filters.', 'Section data changed while loading. Please retry.'].includes(error.message)) message = error.message
  return { message, fields }
}

export function adaptApiSectionToCourseSection(apiSection: import('../services/sectionService').ApiSection): CourseSection {
  return {
    id: apiSection.id,
    courseId: apiSection.courseId,
    number: apiSection.sectionNumber,
    lecturerId: apiSection.lectureId,
    room: apiSection.room ?? '',
    schedule: apiSection.schedule ?? '',
    capacity: apiSection.capacity,
    enrolled: apiSection.enrolledCount,
    isFull: apiSection.isFull,
    semester: apiSection.semesterNameEn,
    academicYear: '',
    status: apiSection.status === 'ACTIVE' ? 'active' : 'closed',
  }
}
