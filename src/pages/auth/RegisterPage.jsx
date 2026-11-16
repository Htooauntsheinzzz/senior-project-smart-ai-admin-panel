import AuthLayout from '../../components/auth/AuthLayout'
import AuthSwitchLink from '../../components/auth/AuthSwitchLink'
import RegisterForm from '../../components/auth/RegisterForm'

export default function RegisterPage() {
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
      <RegisterForm />
      <AuthSwitchLink
        linkLabel="Sign in"
        prompt="Already have an account?"
        to="/login"
      />
    </AuthLayout>
  )
}
