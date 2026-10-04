import type { AdminUser } from '../types/adminUser'

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
