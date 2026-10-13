import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AdminLayout from '../../layouts/AdminLayout'
import SemesterDirectory from '../../components/academic/SemesterDirectory'
import LecturesContent from '../../components/academic/LecturesContent'

export default function AcademicManagementPage({ kind }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  async function handleLogout() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try { await logout() } catch {
      // The existing auth provider clears local session state on logout failure.
    } finally { setIsLoggingOut(false); navigate('/login', { replace: true }) }
  }
  return <div className={editing ? 'xl:pr-[480px]' : undefined}><AdminLayout onLogout={handleLogout} isLoggingOut={isLoggingOut} email={user?.email}>{kind === 'semesters' ? <SemesterDirectory onEditing={setEditing} /> : <LecturesContent />}</AdminLayout></div>
}
