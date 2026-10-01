import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AdminLayout from '../../layouts/AdminLayout'
import TimetableContent from '../../components/timetable/TimetableContent'

export default function TimetablePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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

  return <AdminLayout onLogout={handleLogout} isLoggingOut={isLoggingOut} email={user?.email}><TimetableContent /></AdminLayout>
}
