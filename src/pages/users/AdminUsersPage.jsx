import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AdminLayout from '../../layouts/AdminLayout'
import { initialAdminUsers } from '../../data/adminUsers'

export default function AdminUsersPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [users, setUsers] = useState(initialAdminUsers)

  async function handleLogout() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logout()
    } catch {
      // AuthProvider clears the local session even if server logout fails.
    } finally {
      setIsLoggingOut(false)
      navigate('/login', { replace: true })
    }
  }

  return <AdminLayout onLogout={handleLogout} isLoggingOut={isLoggingOut} email={user?.email}><Outlet context={{ users, setUsers }} /></AdminLayout>
}
