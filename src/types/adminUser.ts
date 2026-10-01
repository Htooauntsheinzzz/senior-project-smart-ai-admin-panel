export const adminRoles = ['Super Admin', 'Academic Admin', 'Registrar Admin', 'AI Content Admin', 'Campus Admin', 'Admin'] as const
export const adminDepartments = ['IT Services', 'Academic Affairs', 'Registrar Office', 'Student Services', 'Campus Operations', 'Library Services'] as const
export type AdminRole = typeof adminRoles[number]
export type AdminStatus = 'Active' | 'Inactive'

export interface AdminUser {
  id: number
  name: string
  employeeId: string
  email: string
  department: string
  role: AdminRole
  status: AdminStatus
  lastLogin: string
  createdAt: string
}

export type NewAdminUser = Omit<AdminUser, 'id' | 'lastLogin' | 'createdAt'>
