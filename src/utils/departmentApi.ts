import type { DepartmentInput } from '../types/department'

export function validateDepartmentForm(value: DepartmentInput) {
  const errors: Partial<Record<keyof DepartmentInput, string>> = {}
  if (!value.code.trim()) errors.code = 'Department code is required.'
  else if (value.code.trim().length > 30 || !/^[A-Z0-9-]+$/.test(value.code.trim())) errors.code = 'Use at most 30 uppercase letters, numbers, or hyphens.'
  if (!value.name.trim()) errors.name = 'Department name is required.'
  else if (value.name.trim().length > 255) errors.name = 'Use at most 255 characters.'
  if (!/^[1-9]\d*$/.test(value.facultyId) || !Number.isSafeInteger(Number(value.facultyId))) errors.facultyId = 'Select an active faculty.'
  if (!['active', 'inactive'].includes(value.status)) errors.status = 'Select a valid status.'
  return errors
}
export function departmentError(error: unknown) {
  const response = (error as { response?: { status: number; data?: { code?: string } } })?.response
  const fields: Partial<Record<keyof DepartmentInput, string>> = {}
  let message = 'Unable to complete the request. Please try again.'
  const code = response?.data?.code
  if (response?.status === 403) message = 'You do not have permission to perform this action.'
  else if (response && [400, 404, 409].includes(response.status)) {
    if (code === 'INVALID_FACULTY' || code === 'FACULTY_NOT_FOUND') fields.facultyId = message = 'The selected faculty is unavailable or inactive. Select an active faculty.'
    else if (code === 'DEPARTMENT_CODE_ALREADY_EXISTS') fields.code = message = 'This department code is already in use.'
    else if (code === 'DEPARTMENT_NAME_ALREADY_EXISTS') fields.name = message = 'This department name is already in use in the selected faculty.'
    else if (code === 'DEPARTMENT_IN_USE') message = 'Cannot delete this department because users are assigned to it.'
    else if (code === 'DEPARTMENT_HAS_PROGRAMS') message = 'Cannot delete this department because programs are assigned to it.'
    else if (response.status === 404) message = 'Department not found.'
    else if (response.status === 400) message = 'The request is invalid. Check the entered values.'
    else message = 'The request conflicts with current server data. Refresh and try again.'
  } else if (!response && error instanceof Error && ['Search must be at most 255 characters.', 'Too many departments to display completely. Narrow your filters.', 'Department data changed while loading. Please retry.'].includes(error.message)) message = error.message
  return { message, fields }
}
