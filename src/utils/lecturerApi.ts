import type { LecturerDraft } from '../types/lecturer'

export function validateLecturerForm(value: LecturerDraft) {
  const errors: Partial<Record<keyof LecturerDraft, string>> = {}
  if (!value.nameTh.trim()) errors.nameTh = 'Thai name is required.'
  else if (value.nameTh.trim().length > 255) errors.nameTh = 'Use at most 255 characters.'
  if (!value.nameEn.trim()) errors.nameEn = 'English name is required.'
  else if (value.nameEn.trim().length > 255) errors.nameEn = 'Use at most 255 characters.'
  if (value.nickname.trim().length > 100) errors.nickname = 'Use at most 100 characters.'
  if (!/^[1-9]\d*$/.test(value.facultyId) || !Number.isSafeInteger(Number(value.facultyId))) errors.facultyId = 'Select a faculty.'
  if (!/^[1-9]\d*$/.test(value.departmentId) || !Number.isSafeInteger(Number(value.departmentId))) errors.departmentId = 'Select a department within the chosen faculty.'
  if (!['active', 'inactive'].includes(value.status)) errors.status = 'Select a valid status.'
  return errors
}

export function lecturerError(error: unknown) {
  const response = (error as { response?: { status: number; data?: { code?: string } } })?.response
  const fields: Partial<Record<keyof LecturerDraft, string>> = {}
  let message = 'Unable to complete the request. Please try again.'
  const code = response?.data?.code
  if (response?.status === 403) message = 'You do not have permission to perform this action.'
  else if (response && [400, 404, 409].includes(response.status)) {
    if (code === 'INVALID_FACULTY' || code === 'FACULTY_NOT_FOUND') fields.facultyId = message = 'The selected faculty is unavailable or inactive. Select an active faculty.'
    else if (code === 'INVALID_LECTURE_DEPARTMENT' || code === 'DEPARTMENT_NOT_FOUND') fields.departmentId = message = 'The selected department is inactive or does not belong to the chosen faculty. Select a valid department.'
    else if (code === 'LECTURE_ALREADY_EXISTS') fields.nameEn = fields.nameTh = message = 'A lecturer with these Thai and English names already exists in this department.'
    else if (response.status === 404) message = 'Lecturer not found.'
    else if (response.status === 400) message = 'The request is invalid. Check the entered values.'
    else message = 'The request conflicts with current server data. Refresh and try again.'
  } else if (!response && error instanceof Error && ['Search must be at most 255 characters.', 'Too many lecturers to display completely. Narrow your filters.', 'Lecturer data changed while loading. Please retry.'].includes(error.message)) message = error.message
  return { message, fields }
}
