import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AdminLayout from '../../layouts/AdminLayout'
import AcademicTermsContent from '../../components/timetable/AcademicTermsContent'

export default function AcademicTermsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  // The create/edit drawer is non-modal on wide screens, so the page makes room for it.
  const [drawerOpen, setDrawerOpen] = useState(false)
  async function handleLogout() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try { await logout() } catch {
      // AuthProvider clears the local session even if server logout fails.
    } finally { setIsLoggingOut(false); navigate('/login', { replace: true }) }
  }
  return <div className={drawerOpen ? 'xl:pr-[480px]' : undefined}>
    <AdminLayout onLogout={handleLogout} isLoggingOut={isLoggingOut} email={user?.email}><AcademicTermsContent onDrawerChange={setDrawerOpen} /></AdminLayout>
  </div>
}
