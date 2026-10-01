import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AdminLayout from '../../layouts/AdminLayout'
import DashboardContent from '../../components/dashboard/DashboardContent'
import { X } from 'lucide-react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [notice, setNotice] = useState('')

  async function handleLogout() {
    if (isLoggingOut) {
      return
    }

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

  return (
    <AdminLayout onLogout={handleLogout} isLoggingOut={isLoggingOut} email={user?.email}>
      <DashboardContent onAction={action => setNotice(`${action} is not available yet. This dashboard displays sample data; this workflow has not been integrated.`)} />
      {notice && <div role="status" className="fixed right-4 bottom-4 z-40 flex max-w-[calc(100vw-32px)] items-start gap-3 rounded-xl border border-[#e5e8f0] bg-white p-4 text-xs leading-5 text-[#68728a] shadow-lg sm:max-w-sm">
        <p>{notice}</p><button type="button" onClick={() => setNotice('')} aria-label="Dismiss message" className="rounded p-1 focus-visible:outline-2"><X size={16} /></button>
      </div>}
    </AdminLayout>
  )
}
