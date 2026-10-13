import type { ProgramDraft } from '../types/program'
import { degrees } from '../data/programs'

export function degreeNameFromId(degreeId: string): string {
  return degrees.find(d => d.id === degreeId)?.name ?? degreeId
}

export function degreeIdFromName(degreeLevel: string): string {
  return degrees.find(d => d.name === degreeLevel)?.id ?? ''
}

export function degreeBadgeStyle(degreeLevel: string): { background: string; color: string } {
  const known = degrees.find(d => d.name === degreeLevel)
  if (known) return { background: known.background, color: known.color }
  return { background: '#f3f4f6', color: '#6b7280' }
}

export function validateProgramForm(value: ProgramDraft) {
  const errors: Partial<Record<keyof ProgramDraft, string>> = {}
  if (!value.code.trim()) errors.code = 'Program code is required.'
  else if (value.code.trim().length > 50 || !/^[A-Z0-9-]+$/.test(value.code.trim())) errors.code = 'Use at most 50 uppercase letters, numbers, or hyphens.'
  if (!value.name.trim()) errors.name = 'Program name is required.'
  else if (value.name.trim().length > 255) errors.name = 'Use at most 255 characters.'
  if (!value.degreeId.trim()) errors.degreeId = 'Select a degree level.'
  else {
    const degreeName = degreeNameFromId(value.degreeId)
    if (!degreeName || degreeName.length > 100) errors.degreeId = 'Select a valid degree level.'
  }
  if (!/^[1-9]\d*$/.test(value.facultyId) || !Number.isSafeInteger(Number(value.facultyId))) errors.facultyId = 'Select a faculty.'
  if (!/^[1-9]\d*$/.test(value.departmentId) || !Number.isSafeInteger(Number(value.departmentId))) errors.departmentId = 'Select a department within the chosen faculty.'
  if (value.durationYears.trim()) {
    const duration = Number(value.durationYears)
    if (!/^\d+$/.test(value.durationYears.trim()) || !Number.isSafeInteger(duration) || duration <= 0) errors.durationYears = 'Enter a positive whole number of years, or leave blank.'
  }
  if (value.totalCredits.trim()) {
    const credits = Number(value.totalCredits)
    if (!/^\d+$/.test(value.totalCredits.trim()) || !Number.isSafeInteger(credits) || credits <= 0) errors.totalCredits = 'Enter a positive whole number of credits, or leave blank.'
  }
  if (!['active', 'inactive'].includes(value.status)) errors.status = 'Select a valid status.'
  return errors
}

export function programError(error: unknown) {
  const response = (error as { response?: { status: number; data?: { code?: string } } })?.response
  const fields: Partial<Record<keyof ProgramDraft, string>> = {}
  let message = 'Unable to complete the request. Please try again.'
  const code = response?.data?.code
  if (response?.status === 403) message = 'You do not have permission to perform this action.'
  else if (response && [400, 404, 409].includes(response.status)) {
    if (code === 'INVALID_FACULTY' || code === 'FACULTY_NOT_FOUND') fields.facultyId = message = 'The selected faculty is unavailable or inactive. Select an active faculty.'
    else if (code === 'INVALID_PROGRAM_DEPARTMENT' || code === 'DEPARTMENT_NOT_FOUND') fields.departmentId = message = 'The selected department is inactive or does not belong to the chosen faculty. Select a valid department.'
    else if (code === 'PROGRAM_CODE_ALREADY_EXISTS') fields.code = message = 'This program code is already in use.'
    else if (code === 'PROGRAM_ALREADY_EXISTS') fields.name = message = 'This program already exists in this department with the same name and degree level.'
    else if (response.status === 404) message = 'Program not found.'
    else if (response.status === 400) message = 'The request is invalid. Check the entered values.'
    else message = 'The request conflicts with current server data. Refresh and try again.'
  } else if (!response && error instanceof Error && ['Search must be at most 255 characters.', 'Too many programs to display completely. Narrow your filters.', 'Program data changed while loading. Please retry.'].includes(error.message)) message = error.message
  return { message, fields }
}
