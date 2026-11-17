import { useState } from 'react'
import {
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  Mail,
  Phone,
  UserPlus,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import * as authService from '../../services/authService'
import {
  EMPTY_REGISTRATION_FORM,
  MIN_PASSWORD_CHARACTERS,
  REGISTRATION_FIELDS,
  buildRegisterPayload,
  googleSignInFailure,
  isPendingApproval,
  registrationFailure,
  validateRegistration,
} from '../../utils/adminRegistration'
import { ADMIN_EMAIL_DOMAIN } from '../../utils/authConfig'
import Button from '../ui/Button'
import Input from '../ui/Input'
import RegistrationSent from './RegistrationSent'
import RegistrationWaiting from './RegistrationWaiting'
import SocialAuthButtons from './SocialAuthButtons'

// Admin self-registration (spec 45, section 5). The form posts to
// POST /auth/register and then shows "Check your email". The Google button
// creates the account at once (section 7). Since spec 46 every new account
// waits for a Super Admin's approval before it can sign in.

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

function focusFirstError(formElement, fieldErrors) {
  const field = REGISTRATION_FIELDS.find((name) => fieldErrors[name])

  if (field) {
    formElement.elements.namedItem(field)?.focus()
  }
}

export default function RegisterForm({ onGoogleSuccess }) {
  const { loginWithGoogle } = useAuth()
  const [form, setForm] = useState(EMPTY_REGISTRATION_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleBusy, setIsGoogleBusy] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setNotice('')
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting || isGoogleBusy) {
      return
    }

    const formElement = event.currentTarget
    const validationErrors = validateRegistration(form, acceptedTerms)

    setFormError('')
    setNotice('')

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      focusFirstError(formElement, validationErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const payload = buildRegisterPayload(form)

      await authService.register(payload)
      // The passwords are not needed any more; do not keep them in memory.
      setForm((current) => ({ ...current, password: '', confirmPassword: '' }))
      setShowPassword(false)
      setShowConfirmPassword(false)
      setSentTo(payload.email)
    } catch (error) {
      const failure = registrationFailure(error)

      setErrors(failure.fieldErrors)
      setFormError(failure.message)
      focusFirstError(formElement, failure.fieldErrors)
    } finally {
      setIsSubmitting(false)
    }
  }

  function showAtTop(setMessage, message) {
    setErrors({})
    setFormError('')
    setNotice('')
    setMessage(message)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleGoogleCredential(idToken) {
    if (isSubmitting || isGoogleBusy) {
      return
    }

    setErrors({})
    setFormError('')
    setNotice('')
    setIsGoogleBusy(true)

    try {
      const session = await loginWithGoogle({ idToken })

      onGoogleSuccess?.(session)
    } catch (error) {
      if (isPendingApproval(error)) {
        setIsWaiting(true)
      } else {
        showAtTop(setFormError, googleSignInFailure(error))
      }
    } finally {
      setIsGoogleBusy(false)
    }
  }

  if (isWaiting) {
    return (
      <div className="w-full rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(15,39,76,0.08)] sm:p-8">
        <RegistrationWaiting />
      </div>
    )
  }

  if (sentTo) {
    return (
      <div className="w-full rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(15,39,76,0.08)] sm:p-8">
        <RegistrationSent email={sentTo} onUseDifferentEmail={() => setSentTo('')} />
      </div>
    )
  }

  return (
    <div className="w-full rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(15,39,76,0.08)] sm:p-8">
      <form noValidate onSubmit={handleSubmit}>
        {formError && (
          <div
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
            role="alert"
          >
            {formError}
          </div>
        )}

        {notice && (
          <div
            className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#E5E8F0] bg-[#F7F8FC] px-4 py-3 text-sm leading-5 text-[#273238]"
            role="status"
          >
            <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#68728A]" />
            <p>{notice}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              autoComplete="given-name"
              error={errors.firstName}
              icon={<UserRound className="h-[18px] w-[18px]" />}
              label="First name"
              name="firstName"
              onChange={(event) => updateField('firstName', event.target.value)}
              placeholder="First Name"
              type="text"
              value={form.firstName}
            />
            <Input
              autoComplete="family-name"
              error={errors.lastName}
              icon={<UserRound className="h-[18px] w-[18px]" />}
              label="Last name"
              name="lastName"
              onChange={(event) => updateField('lastName', event.target.value)}
              placeholder="Last Name"
              type="text"
              value={form.lastName}
            />
          </div>
          <Input
            autoComplete="email"
            error={errors.email}
            hint={`Only @${ADMIN_EMAIL_DOMAIN} addresses can register.`}
            icon={<Mail className="h-[18px] w-[18px]" />}
            label="Email address"
            name="email"
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="Email Address"
            type="email"
            value={form.email}
          />
          <Input
            autoComplete="tel"
            error={errors.phoneNumber}
            icon={<Phone className="h-[18px] w-[18px]" />}
            label="Phone number (optional)"
            name="phoneNumber"
            onChange={(event) => updateField('phoneNumber', event.target.value)}
            placeholder="Phone Number (optional)"
            type="tel"
            value={form.phoneNumber}
          />
          <Input
            autoComplete="new-password"
            error={errors.password}
            hint={`At least ${MIN_PASSWORD_CHARACTERS} characters.`}
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
              name="terms"
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

        <Button disabled={isGoogleBusy} isLoading={isSubmitting} type="submit">
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <UserPlus aria-hidden="true" className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <SocialAuthButtons
        isBusy={isGoogleBusy}
        onGoogleCredential={handleGoogleCredential}
        onGoogleError={() => showAtTop(setFormError, googleSignInFailure(null))}
        onSelect={(provider) =>
          showAtTop(
            setNotice,
            provider === 'google'
              ? 'Sign up with Google is not set up on this site yet. Please use the form.'
              : 'Sign up with Apple is not available. Use the form or your university Google account.',
          )
        }
      />
    </div>
  )
}
