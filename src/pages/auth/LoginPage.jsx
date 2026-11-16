import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthSwitchLink from '../../components/auth/AuthSwitchLink'
import LoginForm from '../../components/auth/LoginForm'
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
    <AuthLayout
      description={
        <>
          Sign in to manage university services
          <br className="hidden sm:block" /> and administrative workflows.
        </>
      }
      title="SMART AI University Student Assistant"
    >
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
        <>
          <LoginForm
            onSuccess={() => navigate('/admin/dashboard', { replace: true })}
          />
          <AuthSwitchLink
            linkLabel="Sign up"
            prompt="Don't have an account?"
            to="/register"
          />
        </>
      )}
    </AuthLayout>
  )
}
