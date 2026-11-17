import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, LogIn, Mail, MailWarning, RefreshCw, WifiOff } from 'lucide-react'
import * as authService from '../../services/authService'
import {
  emailProblem,
  isUsableVerificationToken,
  normalizeEmail,
  resendFailure,
  verificationFailure,
} from '../../utils/adminRegistration'
import Button from '../ui/Button'
import Input from '../ui/Input'

// Spec 45, section 6: the page of the link in the registration email.

// A link works one time, so its token is posted once per page load. React
// StrictMode runs effects twice in development; without this the second
// request would fail and the page would show "does not work" for a
// confirmation that went through.
const verificationRequests = new Map()

function verifyOnce(token) {
  let request = verificationRequests.get(token)

  if (!request) {
    request = authService.verifyEmail(token)
    verificationRequests.set(token, request)
  }

  return request
}

function StateIcon({ children, tone }) {
  const tones = {
    success: 'bg-[#F0FDF4] text-[#166534]',
    warning: 'bg-[#FFF7ED] text-[#B45309]',
    neutral: 'bg-[#F7F8FC] text-[#68728A]',
  }

  return (
    <div
      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${tones[tone]}`}
    >
      {children}
    </div>
  )
}

function StateHeading({ children }) {
  const headingRef = useRef(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <h2
      className="mt-4 font-display text-xl font-bold text-[#17213C] outline-none"
      ref={headingRef}
      tabIndex={-1}
    >
      {children}
    </h2>
  )
}

function NewLinkForm() {
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [isSending, setIsSending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSending) {
      return
    }

    const problem = emailProblem(email)

    setError('')
    setNote('')

    if (problem) {
      setFieldError(problem)
      return
    }

    setFieldError('')
    setIsSending(true)

    try {
      await authService.resendVerification(normalizeEmail(email))
      setNote(
        'If this address has a registration that is not finished, a new link is on its way. Only the newest link works.',
      )
    } catch (requestError) {
      const failure = resendFailure(requestError)

      setFieldError(failure.fieldError)
      setError(failure.message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form className="mt-5 text-left" noValidate onSubmit={handleSubmit}>
      {note && (
        <div
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm leading-5 text-[#166534]"
          role="status"
        >
          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{note}</p>
        </div>
      )}

      {error && (
        <div
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <Input
        autoComplete="email"
        error={fieldError}
        icon={<Mail className="h-[18px] w-[18px]" />}
        label="Email address"
        name="email"
        onChange={(event) => {
          setEmail(event.target.value)
          setNote('')
          if (fieldError) {
            setFieldError('')
          }
        }}
        placeholder="Email Address"
        type="email"
        value={email}
      />

      <div className="mt-4">
        <Button isLoading={isSending} type="submit">
          {isSending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
              Sending...
            </>
          ) : (
            'Send a new link'
          )}
        </Button>
      </div>
    </form>
  )
}

function SignInLink({ onClick }) {
  return (
    <button
      className="mt-5 text-[13.5px] font-semibold text-[#273238] underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#273238]/20"
      onClick={onClick}
      type="button"
    >
      Go to sign in
    </button>
  )
}

export default function EmailVerification({ token }) {
  const navigate = useNavigate()
  const isUsable = isUsableVerificationToken(token)
  const [result, setResult] = useState({ token: '', status: 'loading', email: '' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isUsable) {
      return undefined
    }

    let isActive = true

    verifyOnce(token)
      .then((data) => {
        if (isActive) {
          setResult({
            token,
            status: 'confirmed',
            email: typeof data?.email === 'string' ? data.email : '',
          })
        }
      })
      .catch((error) => {
        const status = verificationFailure(error)

        // A link that could not be checked may be sent again.
        if (status === 'retry') {
          verificationRequests.delete(token)
        }

        if (isActive) {
          setResult({ token, status, email: '' })
        }
      })

    return () => {
      isActive = false
    }
  }, [token, isUsable, attempt])

  function goToSignIn() {
    navigate('/login')
  }

  function tryAgain() {
    setResult({ token: '', status: 'loading', email: '' })
    setAttempt((current) => current + 1)
  }

  let status = 'invalid'

  if (isUsable) {
    status = result.token === token ? result.status : 'loading'
  }

  return (
    <div className="w-full rounded-[24px] bg-white p-6 text-center shadow-[0_4px_12px_rgba(15,39,76,0.08)] sm:p-8">
      {status === 'loading' && (
        <div className="py-4" role="status">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-4 border-[#E5E8F0] border-t-[#273238]" />
          <p className="mt-4 text-sm font-medium text-[#68728A]">
            Confirming your email address...
          </p>
        </div>
      )}

      {status === 'confirmed' && (
        <>
          <StateIcon tone="success">
            <CheckCircle2 aria-hidden="true" className="h-7 w-7" />
          </StateIcon>
          <StateHeading>Your email is confirmed</StateHeading>
          {/* Spec 46, section 3.2: the registration now waits for a Super Admin. */}
          <p className="mt-2 text-sm leading-6 text-[#68728A]">
            Your registration is now waiting for approval by the admin team. We will email{' '}
            {result.email ? (
              <strong className="font-semibold break-all text-[#273238]">{result.email}</strong>
            ) : (
              'you'
            )}{' '}
            when it is approved. Then you can sign in with your password.
          </p>
          <div className="mt-6">
            <Button onClick={goToSignIn} type="button">
              Go to sign in
              <LogIn aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {status === 'invalid' && (
        <>
          <StateIcon tone="warning">
            <MailWarning aria-hidden="true" className="h-7 w-7" />
          </StateIcon>
          <StateHeading>This link does not work</StateHeading>
          <p className="mt-2 text-sm leading-6 text-[#68728A]">
            It has expired, was replaced by a newer link, or was already used. If you
            already confirmed your email, wait for the email that your registration is
            approved. If not, enter your email and we will send a new link.
          </p>
          <NewLinkForm />
          <SignInLink onClick={goToSignIn} />
        </>
      )}

      {status === 'retry' && (
        <>
          <StateIcon tone="neutral">
            <WifiOff aria-hidden="true" className="h-7 w-7" />
          </StateIcon>
          <StateHeading>We could not confirm your email</StateHeading>
          <p className="mt-2 text-sm leading-6 text-[#68728A]">
            The server did not answer as expected. Your link is still good.
          </p>
          <div className="mt-6">
            <Button onClick={tryAgain} type="button">
              Try again
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
