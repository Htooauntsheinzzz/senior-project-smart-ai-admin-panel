import type { CourseSection, SectionDraft } from '../types/courseSection'

export function validateSectionForm(value: SectionDraft, editing = false) {
  const errors: Partial<Record<keyof SectionDraft, string>> = {}
  if (!/^[1-9]\d*$/.test(value.courseId) || !Number.isSafeInteger(Number(value.courseId))) errors.courseId = 'Select a course.'
  if (!value.number.trim()) errors.number = 'Section number is required.'
  else if (value.number.trim().length > 20) errors.number = 'Use at most 20 characters.'
  if (value.capacity.trim() && (!/^\d+$/.test(value.capacity.trim()) || !Number.isSafeInteger(Number(value.capacity)) || Number(value.capacity) < 1)) errors.capacity = 'Enter a positive whole-number capacity, or leave blank for default.'
  if (!/^[1-9]\d*$/.test(value.lecturerId) || !Number.isSafeInteger(Number(value.lecturerId))) errors.lecturerId = 'Enter a valid lecturer ID.'
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
    else if (code === 'ACADEMIC_TERM_NOT_FOUND') fields.academicTermId = message = 'The selected academic term does not exist or was deleted.'
    else if (code === 'ACADEMIC_TERM_SEMESTER_MISMATCH') fields.academicTermId = message = 'The academic term belongs to a different semester. Pick a term of the selected semester.'
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
    capacity: apiSection.capacity,
    enrolled: apiSection.enrolledCount,
    isFull: apiSection.isFull,
    semester: apiSection.semesterNameEn,
    academicYear: apiSection.academicYearLabel ?? '',
    status: apiSection.status === 'ACTIVE' ? 'active' : 'closed',
  }
}

// ---- Academic term on a section (spec 40) ------------------------------------
type TermRow = { id: string; semesterId: string; semesterNameEn: string; academicYearLabel: string; academicYearCode: string; status: string }
const termStatusLabel = (status: string) => status === 'ACTIVE' ? 'Active' : status === 'CLOSED' ? 'Closed' : 'Planned'

/**
 * Options of the Academic Term select: every term while no semester is chosen (choosing one fills the semester),
 * only that semester's terms afterwards. A section's current term stays selectable even when it is no longer listed.
 */
export function sectionTermOptions(terms: TermRow[], semesterId: string, current?: { academicTermId: string | null; semesterId: string; academicYearLabel: string | null; academicYearCode: string | null }) {
  const options = terms.filter(term => !semesterId || term.semesterId === semesterId)
    .map(term => ({ value: term.id, label: `${term.academicYearLabel} (${term.academicYearCode}) · ${term.semesterNameEn} · ${termStatusLabel(term.status)}` }))
  if (current?.academicTermId && (!semesterId || current.semesterId === semesterId) && !options.some(option => option.value === current.academicTermId)) {
    options.push({ value: current.academicTermId, label: `${current.academicYearLabel ?? current.academicYearCode ?? 'Current term'} (current assignment)` })
  }
  return options
}

/** A term belongs to one semester (ACADEMIC_TERM_SEMESTER_MISMATCH): picking a term fills the semester, changing the semester drops an incompatible term. */
export function applySectionTermChange<T extends { semester: string; academicTermId: string }>(draft: T, key: string, value: string, terms: TermRow[]): T {
  const next = { ...draft, [key]: value }
  if (key === 'academicTermId') {
    const term = terms.find(entry => entry.id === value)
    if (term && term.semesterId !== draft.semester) next.semester = term.semesterId
  }
  if (key === 'semester' && !terms.some(term => term.id === next.academicTermId && term.semesterId === value)) next.academicTermId = ''
  return next
}
