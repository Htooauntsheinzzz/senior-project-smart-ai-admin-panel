import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    try {
      await logout()
      navigate('/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F8FC] p-6 text-center">
      <div>
        <p className="text-sm font-semibold tracking-widest text-[#68728A] uppercase">
          Smart AI Admin Web
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-[#17213C]">
          Dashboard
        </h1>
        {user?.email && (
          <p className="mt-3 text-sm text-[#68728A]">
            Signed in as <span className="font-medium text-[#273238]">{user.email}</span>
          </p>
        )}
        <button
          className="mt-6 rounded-xl bg-[#273238] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1A2329] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#273238]/20 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoggingOut}
          onClick={handleLogout}
          type="button"
        >
          {isLoggingOut ? 'Signing out...' : 'Logout'}
        </button>
      </div>
    </main>
  )
}
