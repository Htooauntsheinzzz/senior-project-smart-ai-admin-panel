import { adminDepartments, adminRoles, type AdminUser, type NewAdminUser } from '../types/adminUser'

export const emptyAdminForm = {
  employeeId: '', phoneNumber: '', firstName: '', lastName: '', email: '',
  departmentId: '', status: 'Active', roleId: '', temporaryPassword: '', confirmPassword: '', forcePasswordChange: true,
}
export type AdminFormValues = typeof emptyAdminForm
export type AdminFormErrors = Partial<Record<keyof AdminFormValues, string>>

export function validateAdminForm(value: AdminFormValues, users: AdminUser[]): AdminFormErrors {
  const errors: AdminFormErrors = {}
  if (!value.employeeId.trim()) errors.employeeId = 'Employee ID is required.'
  else if (users.some(user => user.employeeId.toLowerCase() === value.employeeId.trim().toLowerCase())) errors.employeeId = 'This employee ID is already in use.'
  if (!value.firstName.trim()) errors.firstName = 'First name is required.'
  if (!value.lastName.trim()) errors.lastName = 'Last name is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) errors.email = 'Enter a valid email address.'
  else if (users.some(user => user.email.toLowerCase() === value.email.trim().toLowerCase())) errors.email = 'This email is already in use.'
  if (!adminDepartments.some(item => item === value.departmentId)) errors.departmentId = 'Select a department.'
  if (!adminRoles.some(item => item === value.roleId)) errors.roleId = 'Select a role.'
  if (!['Active', 'Inactive'].includes(value.status)) errors.status = 'Select a valid account status.'
  if (value.temporaryPassword.length < 8) errors.temporaryPassword = 'Use at least 8 characters.'
  if (!value.confirmPassword) errors.confirmPassword = 'Confirm the temporary password.'
  else if (value.confirmPassword !== value.temporaryPassword) errors.confirmPassword = 'Passwords do not match.'
  return errors
}

// Only non-sensitive table fields enter the in-memory demo dataset. There is
// no account-creation endpoint or password storage in this prototype.
export function adminFormToDemoUser(value: AdminFormValues): NewAdminUser {
  return { name: `${value.firstName.trim()} ${value.lastName.trim()}`, employeeId: value.employeeId.trim(), email: value.email.trim(), department: value.departmentId, role: value.roleId as NewAdminUser['role'], status: value.status as NewAdminUser['status'] }
}
