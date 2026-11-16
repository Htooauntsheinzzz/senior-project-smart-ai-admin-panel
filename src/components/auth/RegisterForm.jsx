import { useState } from 'react'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserPlus,
  UserRound,
} from 'lucide-react'
import Button from '../ui/Button'
import SocialAuthButtons from './SocialAuthButtons'
import Input from '../ui/Input'

// Design only: the backend has no registration API yet, so submitting
// validates the form and shows a notice instead of sending a request.
// The Google and Apple buttons are design only as well.

const NOT_AVAILABLE_NOTICE =
  'Registration is not available yet. Please contact IT Support to get an account.'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

const EMPTY_FORM = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function validate(form, acceptedTerms) {
  const errors = {}
  const email = form.email.trim()

  if (!form.fullName.trim()) {
    errors.fullName = 'Full name is required.'
  }

  if (!email) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!form.password) {
    errors.password = 'Password is required.'
  } else if (form.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (!acceptedTerms) {
    errors.terms = 'Please accept the terms to continue.'
  }

  return errors
}

function PasswordToggle({ isVisible, onToggle }) {
  return (
    <button
      aria-label={isVisible ? 'Hide password' : 'Show password'}
      className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#9CA3AF] transition hover:text-[#273238] focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#273238]/20"
      onClick={onToggle}
      type="button"
    >
      {isVisible ? (
        <EyeOff aria-hidden="true" className="h-[18px] w-[18px]" />
      ) : (
        <Eye aria-hidden="true" className="h-[18px] w-[18px]" />
      )}
    </button>
  )
}

export default function RegisterForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setNotice('')
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validate(form, acceptedTerms)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setNotice('')
      return
    }

    setErrors({})
    setNotice(NOT_AVAILABLE_NOTICE)
  }

  return (
    <div className="w-full rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(15,39,76,0.08)] sm:p-8">
      <form noValidate onSubmit={handleSubmit}>
        {notice && (
          <div
            className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm leading-5 text-[#166534]"
            role="status"
          >
            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{notice}</p>
          </div>
        )}

        <div className="space-y-4">
          <Input
            autoComplete="name"
            error={errors.fullName}
            icon={<UserRound className="h-[18px] w-[18px]" />}
            label="Full name"
            name="fullName"
            onChange={(event) => updateField('fullName', event.target.value)}
            placeholder="Full Name"
            type="text"
            value={form.fullName}
          />
          <Input
            autoComplete="email"
            error={errors.email}
            icon={<Mail className="h-[18px] w-[18px]" />}
            label="Email address"
            name="email"
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="Email Address"
            type="email"
            value={form.email}
          />
          <Input
            autoComplete="new-password"
            error={errors.password}
            icon={<LockKeyhole className="h-[18px] w-[18px]" />}
            label="Password"
            name="password"
            onChange={(event) => updateField('password', event.target.value)}
            placeholder="Password"
            trailingAction={
              <PasswordToggle
                isVisible={showPassword}
                onToggle={() => setShowPassword((current) => !current)}
              />
            }
            type={showPassword ? 'text' : 'password'}
            value={form.password}
          />
          <Input
            autoComplete="new-password"
            error={errors.confirmPassword}
            icon={<LockKeyhole className="h-[18px] w-[18px]" />}
            label="Confirm password"
            name="confirmPassword"
            onChange={(event) =>
              updateField('confirmPassword', event.target.value)
            }
            placeholder="Confirm Password"
            trailingAction={
              <PasswordToggle
                isVisible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((current) => !current)}
              />
            }
            type={showConfirmPassword ? 'text' : 'password'}
            value={form.confirmPassword}
          />
        </div>

        <div className="my-5 text-[13.5px]">
          <label className="flex cursor-pointer items-start gap-2.5 text-[#68728A]">
            <input
              aria-describedby={errors.terms ? 'terms-error' : undefined}
              aria-invalid={Boolean(errors.terms)}
              checked={acceptedTerms}
              className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded-[5px] border-2 border-[#E5E8F0] accent-[#273238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#273238]/20"
              onChange={(event) => {
                setAcceptedTerms(event.target.checked)
                setNotice('')
                if (errors.terms) {
                  setErrors((current) => ({ ...current, terms: undefined }))
                }
              }}
              type="checkbox"
            />
            <span>
              I agree to the{' '}
              <span className="font-semibold text-[#273238]">Terms of Use</span>{' '}
              and{' '}
              <span className="font-semibold text-[#273238]">Privacy Policy</span>
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1.5 px-1 text-xs text-[#B42318]" id="terms-error">
              {errors.terms}
            </p>
          )}
        </div>

        <Button type="submit">
          Create Account
          <UserPlus aria-hidden="true" className="h-4 w-4" />
        </Button>
      </form>

      <SocialAuthButtons
        onSelect={(_provider, name) => {
          setErrors({})
          setNotice(
            `Sign up with ${name} is not available yet. Please contact IT Support to get an account.`,
          )
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
    </div>
  )
}
