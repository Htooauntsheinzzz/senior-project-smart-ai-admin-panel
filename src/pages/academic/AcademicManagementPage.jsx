import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AdminLayout from '../../layouts/AdminLayout'
import SemesterDirectory from '../../components/academic/SemesterDirectory'

export default function AcademicManagementPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const adding = params.get('add') === '1'
  const [editing, setEditing] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  function setAdding(open) {
    setParams(previous => { const next = new URLSearchParams(previous); if (open) next.set('add', '1'); else next.delete('add'); return next }, { replace: true })
  }
  async function handleLogout() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try { await logout() } catch {
      // The existing auth provider clears local session state on logout failure.
    } finally { setIsLoggingOut(false); navigate('/login', { replace: true }) }
  }
  return <div className={adding || editing ? 'xl:pr-[480px]' : undefined}><AdminLayout onLogout={handleLogout} isLoggingOut={isLoggingOut} email={user?.email}><SemesterDirectory adding={adding} onOpen={() => { if (!editing) setAdding(true) }} onClose={() => setAdding(false)} onEditing={setEditing} /></AdminLayout></div>
}
