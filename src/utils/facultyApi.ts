import type { FacultyInput } from '../types/faculty'

export function validateFacultyForm(value: FacultyInput) {
  const errors: Partial<Record<keyof FacultyInput, string>> = {}
  if (!value.code.trim()) errors.code = 'Faculty code is required.'
  else if (value.code.trim().length > 30 || !/^[A-Z0-9-]+$/.test(value.code.trim())) errors.code = 'Use at most 30 uppercase letters, numbers, or hyphens.'
  if (!value.nameEn.trim()) errors.nameEn = 'English faculty name is required.'
  else if (value.nameEn.trim().length > 255) errors.nameEn = 'Use at most 255 characters.'
  if (value.nameTh.trim().length > 255) errors.nameTh = 'Use at most 255 characters.'
  if (!['active', 'inactive'].includes(value.status)) errors.status = 'Select a valid status.'
  return errors
}
export function facultyError(error: unknown): { message: string; fields: Partial<Record<keyof FacultyInput, string>> } {
  const response = (error as { response?: { status?: number; data?: { code?: string } } })?.response
  const fields: Partial<Record<keyof FacultyInput, string>> = {}
  let message = 'Unable to complete the request. Please try again.'
  if (response?.status === 403) message = 'You do not have permission to perform this action.'
  else if (response?.status === 404) message = 'Faculty not found.'
  else if (response?.status === 409 && response.data?.code === 'FACULTY_CODE_ALREADY_EXISTS') fields.code = message = 'This faculty code is already in use.'
  else if (response?.status === 409 && response.data?.code === 'FACULTY_NAME_ALREADY_EXISTS') fields.nameEn = message = 'This English faculty name is already in use.'
  else if (response?.status === 409) message = 'The request conflicts with the current server data. Refresh and try again.'
  else if (response?.status === 400) message = 'The request is invalid. Check the entered values.'
  else if (!response && error instanceof Error && ['The faculty directory is too large to display completely. Narrow your search.', 'The faculty directory changed while loading. Please retry.'].includes(error.message)) message = error.message
  return { message, fields }
}
