import { useSearchParams } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import EmailVerification from '../../components/auth/EmailVerification'

// The page behind the link of the registration email:
// /verify-email?token=... (spec 45, section 6). Public.
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = (searchParams.get('token') ?? '').trim()

  return (
    <AuthLayout
      description="The last step of your registration for the admin panel."
      title="Email confirmation"
    >
      <EmailVerification token={token} />
    </AuthLayout>
  )
}
