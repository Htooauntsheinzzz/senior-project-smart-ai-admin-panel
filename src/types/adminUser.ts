// Role options follow the V6 seed migration insert order (SUPER_ADMIN=1,
// ADMIN=2, ACADEMIC_ADMIN=3). The backend exposes no roles lookup endpoint,
// so these IDs cannot be loaded from an API.
export const adminRoles = [
  { id: 1, code: 'SUPER_ADMIN', name: 'Super Admin' },
  { id: 2, code: 'ADMIN', name: 'Admin' },
  { id: 3, code: 'ACADEMIC_ADMIN', name: 'Academic Admin' },
] as const

// Exact accountStatus values accepted by the backend contract.
export const accountStatuses = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'LOCKED', label: 'Locked' },
  { value: 'SUSPENDED', label: 'Suspended' },
] as const

export const accountStatusLabels: Record<string, string> = Object.fromEntries(
  accountStatuses.map(status => [status.value, status.label]),
)

export interface AdminUser {
  id: number
  name: string
  employeeId: string
  email: string
  phoneNumber: string
  departmentId: number | null
  department: string
  roleId: number | null
  role: string
  status: string
  accountStatus: string
  lastLogin: string
  createdAt: string
}
