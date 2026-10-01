import type { Dispatch, SetStateAction } from 'react'
import type { AdminUser } from '../../types/adminUser'

export type AdminUsersContext = { users: AdminUser[]; setUsers: Dispatch<SetStateAction<AdminUser[]>> }
