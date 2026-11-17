import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthSwitchLink from '../../components/auth/AuthSwitchLink'
import RegisterForm from '../../components/auth/RegisterForm'
import { useAuth } from '../../hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isAuthLoading } = useAuth()

  // A signed-in admin has nothing to register, as on the login page.
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isAuthenticated, isAuthLoading, navigate])

  return (
    <AuthLayout
      description={
        <>
          Create a staff account to manage university services
          <br className="hidden sm:block" /> and administrative workflows.
        </>
      }
      title="Create your account"
    >
      <RegisterForm
        onGoogleSuccess={() => navigate('/admin/dashboard', { replace: true })}
      />
      <AuthSwitchLink
        linkLabel="Sign in"
        prompt="Already have an account?"
        to="/login"
      />
    </AuthLayout>
  )
}
