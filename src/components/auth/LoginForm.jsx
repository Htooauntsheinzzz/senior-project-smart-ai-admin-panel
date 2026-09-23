import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'
import Input from '../ui/Input'
import SecurityIndicators from './SecurityIndicators'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(email, password) {
  const errors = {}
  const normalizedEmail = email.trim()

  if (!normalizedEmail) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Password is required.'
  }

  return errors
}

function getAuthenticationError(error) {
  if (!error.response) {
    return 'Unable to connect to the server. Please try again.'
  }

  if (error.response.status === 429) {
    return 'Too many login attempts. Please try again later.'
  }

  if (error.response.status === 403) {
    return 'Access is denied for this account.'
  }

  if (error.response.status === 401) {
    return 'Invalid email or password.'
  }

  if (error.response.status === 400) {
    return 'Please check the entered email and password.'
  }

  if (error.response.status >= 500) {
    return 'Unable to sign in right now. Please try again.'
  }

  return 'Unable to sign in. Please try again.'
}

export default function LoginForm({ onSuccess }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (isLoading) {
      return
    }

    const validationErrors = validate(email, password)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setAuthError('')
      return
    }

    setErrors({})
    setAuthError('')
    setIsLoading(true)

    try {
      const session = await login({
        email: email.trim(),
        password,
        rememberMe,
      })
      onSuccess(session)
    } catch (error) {
      setAuthError(getAuthenticationError(error))
    } finally {
      setIsLoading(false)
    }
  }

  function clearFieldError(field) {
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  return (
    <div className="w-full rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(15,39,76,0.08)] sm:p-8">
      <form noValidate onSubmit={handleSubmit}>
        {authError && (
          <div
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
            role="alert"
          >
            {authError}
          </div>
        )}

        <div className="space-y-4">
          <Input
            autoComplete="email"
            error={errors.email}
            icon={<Mail className="h-[18px] w-[18px]" />}
            label="Email address"
            name="email"
            onChange={(event) => {
              setEmail(event.target.value)
              clearFieldError('email')
            }}
            placeholder="Email Address"
            type="email"
            value={email}
          />
          <Input
            autoComplete="current-password"
            error={errors.password}
            icon={<LockKeyhole className="h-[18px] w-[18px]" />}
            label="Password"
            name="password"
            onChange={(event) => {
              setPassword(event.target.value)
              clearFieldError('password')
            }}
            placeholder="Password"
            trailingAction={
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#9CA3AF] transition hover:text-[#273238] focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#273238]/20"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="h-[18px] w-[18px]" />
                ) : (
                  <Eye aria-hidden="true" className="h-[18px] w-[18px]" />
                )}
              </button>
            }
            type={showPassword ? 'text' : 'password'}
            value={password}
          />
        </div>

        <div className="my-5 flex items-center justify-between gap-4 text-[13.5px]">
          <label className="flex cursor-pointer items-center gap-2.5 text-[#68728A]">
            <input
              checked={rememberMe}
              className="h-[18px] w-[18px] rounded-[5px] border-2 border-[#E5E8F0] accent-[#273238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#273238]/20"
              onChange={(event) => setRememberMe(event.target.checked)}
              type="checkbox"
            />
            Remember me
          </label>
          <button
            className="font-semibold text-[#273238] underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#273238]/20"
            onClick={() =>
              setAuthError('Password recovery is not available yet. Please contact IT Support.')
            }
            type="button"
          >
            Forgot password?
          </button>
        </div>

        <Button isLoading={isLoading} type="submit">
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <LogIn aria-hidden="true" className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[#E5E8F0]" />
        <span className="text-[10.5px] font-semibold tracking-[1.05px] text-[#D1D5DB]">
          SECURE ACCESS
        </span>
        <span className="h-px flex-1 bg-[#E5E8F0]" />
      </div>

      <SecurityIndicators />
    </div>
  )
}
