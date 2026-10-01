import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AdminLayout from '../../layouts/AdminLayout'
import ProgramsContent from '../../components/programs/ProgramsContent'

export default function ProgramsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const adding = params.get('add') === '1'
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  function setAdding(open) {
    setParams(previous => { const next = new URLSearchParams(previous); if (open) next.set('add', '1'); else next.delete('add'); return next }, { replace: true })
  }
  async function handleLogout() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try { await logout() } catch {
      // AuthProvider clears the local session even if server logout fails.
    } finally { setIsLoggingOut(false); navigate('/login', { replace: true }) }
  }
  return <div className={adding ? 'xl:pr-[480px]' : undefined}><AdminLayout onLogout={handleLogout} isLoggingOut={isLoggingOut} email={user?.email}><ProgramsContent adding={adding} onOpen={() => setAdding(true)} onClose={() => setAdding(false)} /></AdminLayout></div>
}
