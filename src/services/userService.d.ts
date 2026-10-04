export interface AdminUserRole {
  id: number
  roleCode: string
  roleName: string
  isActive?: boolean
  assignedBy?: number | null
  assignedAt?: string | null
}

export interface AdminUserSummary {
  id: number
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  departmentId: number | null
  accountStatus: string
  roles: AdminUserRole[]
  createdAt: string
  updatedAt: string
}

export interface AdminUserDetail extends AdminUserSummary {
  createdBy: number | null
  updatedBy: number | null
}

export interface AdminUserPage {
  content: AdminUserSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  sort: string[]
}

export interface AdminUserListParams {
  page?: number
  size?: number
  search?: string
  accountStatus?: string
  roleId?: number
  departmentId?: number
  sort?: string
}

export interface CreateAdminUserPayload {
  employeeId: string
  phoneNumber: string | null
  firstName: string
  lastName: string
  email: string
  departmentId: number | null
  accountStatus: string
  roleId: number
  temporaryPassword: string
  confirmPassword: string
  forcePasswordChange: boolean
}

export interface UpdateAdminUserPayload {
  employeeId: string
  phoneNumber: string | null
  firstName: string
  lastName: string
  email: string
  departmentId: number | null
  accountStatus: string
  roleId: number
}

export declare function createUser(payload: CreateAdminUserPayload): Promise<AdminUserDetail>

export declare function getUsers(params?: AdminUserListParams): Promise<AdminUserPage>

export declare function getUserById(id: number): Promise<AdminUserDetail>

export declare function updateUser(id: number, payload: UpdateAdminUserPayload): Promise<AdminUserDetail>

export declare function deleteUser(id: number): Promise<void>
