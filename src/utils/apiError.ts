interface ApiErrorShape {
  response?: { status?: number; data?: { code?: string; message?: string } }
}

// Map documented backend error codes to safe copy rather than displaying
// arbitrary server exception messages or rejected values.
export function apiErrorMessage(error: unknown, fallback: string): string {
  const { status, data } = (error as ApiErrorShape)?.response ?? {}
  if (status === 403) return 'You do not have permission to perform this action.'
  const messages: Record<string, string> = {
    VALIDATION_ERROR: 'The request is invalid. Check the entered values.',
    USER_NOT_FOUND: 'User not found.',
    ROLE_NOT_FOUND: 'The selected role does not exist.',
    ROLE_INACTIVE: 'The selected role is inactive.',
    ROLE_NOT_ASSIGNABLE: 'The selected role cannot be assigned.',
    INVALID_ROLE: 'The selected role cannot be assigned.',
    EMAIL_ALREADY_EXISTS: 'The email is already in use.',
    EMPLOYEE_ID_ALREADY_EXISTS: 'The employee ID is already in use.',
    USER_ALREADY_EXISTS: 'The email and employee ID are already in use.',
    PASSWORD_POLICY_VIOLATION: 'Use at least 15 Unicode characters and at most 72 UTF-8 bytes, without NUL.',
    SELF_ACCOUNT_CHANGE_NOT_ALLOWED: 'Changing your own status, role, or deleting your own account is not allowed.',
    CONCURRENT_MODIFICATION: 'The record was modified concurrently. Reload and try again.',
  }
  if ((status === 400 || status === 404 || status === 409) && data?.code && messages[data.code]) return messages[data.code]
  if (status === 404) return 'User not found.'
  return fallback
}

export function adminUserFieldErrors(error: unknown): Partial<Record<'email' | 'employeeId' | 'roleId' | 'temporaryPassword', string>> {
  const { status, data } = (error as ApiErrorShape)?.response ?? {}
  if (status !== 400 && status !== 404 && status !== 409) return {}
  const message = apiErrorMessage(error, 'Check this value.')
  switch (data?.code) {
    case 'USER_ALREADY_EXISTS': return { email: message, employeeId: message }
    case 'EMAIL_ALREADY_EXISTS': return { email: message }
    case 'EMPLOYEE_ID_ALREADY_EXISTS': return { employeeId: message }
    case 'INVALID_ROLE': case 'ROLE_NOT_FOUND': case 'ROLE_INACTIVE': case 'ROLE_NOT_ASSIGNABLE': return { roleId: message }
    case 'PASSWORD_POLICY_VIOLATION': return { temporaryPassword: message }
    default: return {}
  }
}
