import { useEffect, useRef } from 'react'
import { Clock3, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

// Spec 46, section 3.3: "Sign up with Google" worked, and the new account waits
// for a Super Admin (the backend answered 403 ACCOUNT_PENDING_APPROVAL). The
// backend has sent the "waiting for approval" email.
export default function RegistrationWaiting() {
  const navigate = useNavigate()
  const headingRef = useRef(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFFBEB] text-[#92400E]">
        <Clock3 aria-hidden="true" className="h-7 w-7" />
      </div>
      <h2
        className="mt-4 font-display text-xl font-bold text-[#17213C] outline-none"
        ref={headingRef}
        tabIndex={-1}
      >
        Registration received
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#68728A]">
        Google has confirmed your university account. The admin team checks every
        registration. We will email you when it is approved. Then use &quot;Sign in with
        Google&quot; on the sign-in page.
      </p>
      <div className="mt-6">
        <Button onClick={() => navigate('/login')} type="button">
          Go to sign in
          <LogIn aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
