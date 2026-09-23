import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginBranding from '../../components/auth/LoginBranding'
import LoginForm from '../../components/auth/LoginForm'
import StaffOnlyNotice from '../../components/auth/StaffOnlyNotice'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isAuthLoading } = useAuth()

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isAuthenticated, isAuthLoading, navigate])

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#F7F8FC] px-4 py-10 sm:px-6 sm:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-56 -top-64 h-[496px] w-[496px] rounded-full bg-[radial-gradient(circle,rgba(1,162,229,0.14)_0%,rgba(1,162,229,0)_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -right-44 h-[415px] w-[415px] rounded-full bg-[radial-gradient(circle,rgba(39,50,56,0.12)_0%,rgba(39,50,56,0)_72%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#273238_0%,transparent_42%,#273238_100%)] opacity-[0.02]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[440px] flex-col items-center">
        <LoginBranding />

        <div className="mb-7 mt-7 text-center">
          <h1 className="font-display text-[25.6px] leading-[1.5] font-extrabold tracking-[-0.64px] text-[#17213C]">
            SMART AI University Student Assistant
          </h1>
          <p className="mt-2 text-sm leading-[22.75px] text-[#68728A]">
            Sign in to manage university services
            <br className="hidden sm:block" /> and administrative workflows.
          </p>
        </div>

        {isAuthLoading ? (
          <div
            className="grid w-full place-items-center rounded-[24px] bg-white p-10 shadow-[0_4px_12px_rgba(15,39,76,0.08)]"
            role="status"
          >
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E8F0] border-t-[#273238]" />
            <p className="mt-4 text-sm font-medium text-[#68728A]">
              Checking authentication...
            </p>
          </div>
        ) : (
          <LoginForm
            onSuccess={() => navigate('/admin/dashboard', { replace: true })}
          />
        )}

        <div className="mt-5 w-full">
          <StaffOnlyNotice />
        </div>

        <footer className="mt-7 text-center text-xs leading-5 text-[#9CA3AF]">
          © 2026 Rangsit University · All rights reserved ·{' '}
          <span className="text-[#273238]">IT Support</span>
        </footer>
      </div>
    </main>
  )
}
