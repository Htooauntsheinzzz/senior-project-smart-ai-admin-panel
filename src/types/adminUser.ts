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

// Set by the backend only (specs 45 and 46): PENDING_VERIFICATION for a form
// registration whose email link was not opened yet, PENDING_APPROVAL for a
// registration that waits for a Super Admin. They can be shown and filtered,
// but an admin cannot set them, so they are not in accountStatuses. An account
// leaves them only by Approve or Reject.
export const registrationStatuses = [
  { value: 'PENDING_APPROVAL', label: 'Waiting for approval' },
  { value: 'PENDING_VERIFICATION', label: 'Unverified' },
] as const

export function isRegistrationStatus(status: string | null | undefined): boolean {
  return registrationStatuses.some(item => item.value === status)
}

// The options of the status filter of Admin Users.
export const accountStatusFilters = [...accountStatuses, ...registrationStatuses] as const

export const accountStatusLabels: Record<string, string> = Object.fromEntries(
  accountStatusFilters.map(status => [status.value, status.label]),
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
