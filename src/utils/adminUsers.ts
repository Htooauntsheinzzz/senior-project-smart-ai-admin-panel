import type { AdminUser, NewAdminUser } from '../types/adminUser'

export function filterAdminUsers(users: AdminUser[], query: string, role: string, status: string, department: string) {
  const search = query.trim().toLocaleLowerCase()
  return users.filter(user =>
    (!search || [user.name, user.email, user.role, user.employeeId].some(value => value.toLocaleLowerCase().includes(search))) &&
    (!role || user.role === role) && (!status || user.status === status) && (!department || user.department === department),
  )
}

export function validateAdminUser(user: NewAdminUser, users: AdminUser[]) {
  const errors: Partial<Record<keyof NewAdminUser, string>> = {}
  if (!user.name.trim()) errors.name = 'Full name is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email.trim())) errors.email = 'Enter a valid email address.'
  else if (users.some(existing => existing.email.toLowerCase() === user.email.trim().toLowerCase())) errors.email = 'This email is already in use.'
  if (!user.employeeId.trim()) errors.employeeId = 'Employee ID is required.'
  else if (users.some(existing => existing.employeeId.toLowerCase() === user.employeeId.trim().toLowerCase())) errors.employeeId = 'This employee ID is already in use.'
  if (!user.department.trim()) errors.department = 'Department is required.'
  return errors
}

export function adminUsersCsv(users: AdminUser[]) {
  function cell(value: string) {
    // Quote CSV delimiters and prevent spreadsheet formulas in user-entered data.
    const safe = /^[\s]*[=+@-]|^[\t\r\n]/.test(value) ? `'${value}` : value
    return `"${safe.replaceAll('"', '""')}"`
  }
  return [
    ['Admin', 'Employee ID', 'Email', 'Department', 'Role', 'Status', 'Last Login', 'Created At'],
    ...users.map(user => [user.name, user.employeeId, user.email, user.department, user.role, user.status, user.lastLogin, user.createdAt]),
  ].map(row => row.map(cell).join(',')).join('\r\n')
}
