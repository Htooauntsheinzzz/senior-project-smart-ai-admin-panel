import type { CreateAdminUserPayload, UpdateAdminUserPayload } from '../services/userService'
import { accountStatusLabels, accountStatuses, isRegistrationStatus } from '../types/adminUser'

export const emptyAdminForm = {
  employeeId: '', phoneNumber: '', firstName: '', lastName: '', email: '',
  departmentId: '', accountStatus: 'ACTIVE', roleId: '', temporaryPassword: '', confirmPassword: '', forcePasswordChange: true,
}
export type AdminFormValues = typeof emptyAdminForm
export type AdminFormErrors = Partial<Record<keyof AdminFormValues, string>>

// The status choices of the form. A registration status (spec 46 section 4.4)
// is the only choice: the account leaves it by Approve or Reject, and the PUT
// keeps it unchanged. Any other status that only the backend knows stays in the
// list as the current value; it cannot be saved.
export function accountStatusChoices(current: string): readonly { value: string; label: string }[] {
  if (!current || accountStatuses.some(status => status.value === current)) return accountStatuses
  const own = { value: current, label: accountStatusLabels[current] ?? current }
  return isRegistrationStatus(current) ? [own] : [own, ...accountStatuses]
}

// currentStatus: the loaded status of the account that is edited. A pending
// registration status is valid only as that status.
export function validateAdminForm(value: AdminFormValues, { requirePassword = true, currentStatus = '' } = {}): AdminFormErrors {
  const errors: AdminFormErrors = {}
  if (!value.employeeId.trim()) errors.employeeId = 'Employee ID is required.'
  if (!value.firstName.trim()) errors.firstName = 'First name is required.'
  if (!value.lastName.trim()) errors.lastName = 'Last name is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) errors.email = 'Enter a valid email address.'
  if (value.phoneNumber.trim() && !/^(?=.*[0-9])[0-9 +()-]+$/.test(value.phoneNumber.trim())) errors.phoneNumber = 'Enter a valid phone number.'
  const positiveId = (id: string) => /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id))
  if (!positiveId(value.roleId)) errors.roleId = 'Select a valid role.'
  if (value.departmentId && !positiveId(value.departmentId)) errors.departmentId = 'Select a valid department.'
  for (const [field, max] of [['employeeId', 50], ['phoneNumber', 30], ['firstName', 100], ['lastName', 100], ['email', 255]] as const) {
    if (value[field].trim().length > max) errors[field] = `Use at most ${max} characters.`
  }
  const keepsRegistration = isRegistrationStatus(value.accountStatus) && value.accountStatus === currentStatus
  if (!keepsRegistration && !accountStatuses.some(status => status.value === value.accountStatus)) errors.accountStatus = 'Select a valid account status.'
  if (requirePassword) {
    if (Array.from(value.temporaryPassword).length < 15) errors.temporaryPassword = 'Use at least 15 characters.'
    if (new TextEncoder().encode(value.temporaryPassword).length > 72 || value.temporaryPassword.includes('\0') || /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value.temporaryPassword)) errors.temporaryPassword = 'Use valid Unicode characters, at most 72 UTF-8 bytes, without NUL.'
    if (!value.confirmPassword) errors.confirmPassword = 'Confirm the temporary password.'
    else if (value.confirmPassword !== value.temporaryPassword) errors.confirmPassword = 'Passwords do not match.'
  }
  return errors
}

export function buildCreatePayload(value: AdminFormValues): CreateAdminUserPayload {
  return {
    employeeId: value.employeeId.trim(),
    phoneNumber: value.phoneNumber.trim() || null,
    firstName: value.firstName.trim(),
    lastName: value.lastName.trim(),
    email: value.email.trim(),
    departmentId: value.departmentId === '' ? null : Number(value.departmentId),
    accountStatus: value.accountStatus,
    roleId: Number(value.roleId),
    temporaryPassword: value.temporaryPassword,
    confirmPassword: value.confirmPassword,
    forcePasswordChange: Boolean(value.forcePasswordChange),
  }
}

// The update endpoint is a full-replacement PUT without password fields.
export function buildUpdatePayload(value: AdminFormValues): UpdateAdminUserPayload {
  return {
    employeeId: value.employeeId.trim(),
    phoneNumber: value.phoneNumber.trim() || null,
    firstName: value.firstName.trim(),
    lastName: value.lastName.trim(),
    email: value.email.trim(),
    departmentId: value.departmentId === '' ? null : Number(value.departmentId),
    accountStatus: value.accountStatus,
    roleId: Number(value.roleId),
  }
}
