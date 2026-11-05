import type { Course, CourseDraft } from '../types/course'

export function validateCourseForm(value: CourseDraft) {
  const errors: Partial<Record<keyof CourseDraft, string>> = {}
  const integer = (text: string) => /^\d+$/.test(text.trim()) && Number.isSafeInteger(Number(text))
  if (!value.code.trim()) errors.code = 'Course code is required.'
  else if (value.code.trim().length > 50) errors.code = 'Use at most 50 characters.'
  if (!integer(value.credits)) errors.credits = 'Enter credit hours as a positive whole number.'
  if (!value.name.trim()) errors.name = 'Course name is required.'
  else if (value.name.trim().length > 255) errors.name = 'Use at most 255 characters.'
  if (!/^[1-9]\d*$/.test(value.facultyId) || !Number.isSafeInteger(Number(value.facultyId))) errors.facultyId = 'Select a faculty.'
  if (!/^[1-9]\d*$/.test(value.departmentId) || !Number.isSafeInteger(Number(value.departmentId))) errors.departmentId = 'Select a department within the chosen faculty.'
  if (value.programId && (!/^[1-9]\d*$/.test(value.programId) || !Number.isSafeInteger(Number(value.programId)))) errors.programId = 'Select a valid program, or leave blank.'
  if (value.year) {
    const year = Number(value.year)
    if (!/^\d+$/.test(value.year.trim()) || !Number.isSafeInteger(year) || year <= 0) errors.year = 'Enter a positive whole number, or leave blank.'
  }
  if (value.term && (!/^[1-9]\d*$/.test(value.term) || !Number.isSafeInteger(Number(value.term)))) errors.term = 'Select a valid semester, or leave blank.'
  if (value.maxStudents.trim() && (!integer(value.maxStudents) || Number(value.maxStudents) < 1)) errors.maxStudents = 'Enter a positive whole number, or leave blank.'
  if (!['Required', 'Elective'].includes(value.type)) errors.type = 'Select a course type.'
  if (!['active', 'inactive'].includes(value.status)) errors.status = 'Select a status.'
  if (value.description.trim().length > 1000) errors.description = 'Use at most 1000 characters.'
  if (value.prerequisites.trim().length > 1000) errors.prerequisites = 'Use at most 1000 characters.'
  const prerequisites = value.prerequisites.split(',').map((code: string) => code.trim()).filter(Boolean)
  if (prerequisites.some((code: string) => code.toLowerCase() === value.code.trim().toLowerCase())) errors.prerequisites = 'A course cannot be its own prerequisite.'
  return errors
}

export function courseError(error: unknown) {
  const response = (error as { response?: { status: number; data?: { code?: string; message?: string } } })?.response
  const fields: Partial<Record<keyof CourseDraft, string>> = {}
  let message = 'Unable to complete the request. Please try again.'
  const code = response?.data?.code
  if (response?.status === 403) message = 'You do not have permission to perform this action.'
  else if (response && [400, 404, 409].includes(response.status)) {
    if (code === 'INVALID_COURSE_RELATIONSHIP') fields.facultyId = message = 'The selected faculty, department, or program relationship is invalid.'
    else if (code === 'INVALID_PREREQUISITE_COURSE') fields.prerequisites = message = 'One or more prerequisite courses are invalid.'
    else if (code === 'INVALID_COURSE_TYPE') fields.type = message = 'The selected course type is invalid.'
    else if (code === 'FACULTY_NOT_FOUND') fields.facultyId = message = 'The selected faculty is unavailable.'
    else if (code === 'DEPARTMENT_NOT_FOUND') fields.departmentId = message = 'The selected department is unavailable.'
    else if (code === 'PROGRAM_NOT_FOUND') fields.programId = message = 'The selected program is unavailable.'
    else if (code === 'COURSE_CODE_ALREADY_EXISTS') fields.code = message = 'This course code is already in use.'
    else if (response.status === 404) message = 'Course not found.'
    else if (response.status === 400) message = 'The request is invalid. Check the entered values.'
    else message = 'The request conflicts with current server data. Refresh and try again.'
  } else if (!response && error instanceof Error && ['Search must be at most 255 characters.', 'Too many courses to display completely. Narrow your filters.', 'Course data changed while loading. Please retry.'].includes(error.message)) message = error.message
  return { message, fields }
}

export function courseBadgeStyle(courseType: number): { background: string; color: string } {
  if (courseType === 300) return { background: '#dbeafe', color: '#2563eb' }
  if (courseType === 200) return { background: '#f3f4f6', color: '#6b7280' }
  return { background: '#f3f4f6', color: '#6b7280' }
}

export function adaptApiCourseToCourse(apiCourse: import('../services/courseService').ApiCourse): Course {
  return {
    id: apiCourse.id,
    code: apiCourse.code,
    name: apiCourse.name,
    credits: apiCourse.credits,
    departmentId: apiCourse.departmentId,
    departmentName: apiCourse.departmentName,
    facultyId: apiCourse.facultyId,
    facultyName: apiCourse.facultyNameEn.replace(/^Faculty of /, ''),
    programIds: apiCourse.programId ? [apiCourse.programId] : [],
    curriculumYear: apiCourse.curriculumYear,
    semester: apiCourse.semesterNameEn ?? '',
    academicYear: '',
    sectionCount: apiCourse.sectionCount,
    type: apiCourse.courseType === 300 ? 'Required' : 'Elective',
    status: apiCourse.status,
    description: apiCourse.description ?? undefined,
    prerequisiteCodes: apiCourse.prerequisiteCourses ? apiCourse.prerequisiteCourses.split(',').map(c => c.trim()).filter(Boolean) : undefined,
    maxStudentsPerSection: apiCourse.maxStudentsPerSection ?? undefined,
    semesterId: apiCourse.semesterId ?? undefined,
  }
}
