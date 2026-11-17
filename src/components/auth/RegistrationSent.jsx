import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, MailCheck } from 'lucide-react'
import * as authService from '../../services/authService'
import { resendFailure } from '../../utils/adminRegistration'

// Spec 45, section 5.3: shown after POST /auth/register answered 202. The text
// is the same whether or not the address already has an account.
export default function RegistrationSent({ email, onUseDifferentEmail }) {
  const headingRef = useRef(null)
  const [isSending, setIsSending] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  async function resend() {
    if (isSending) {
      return
    }

    setIsSending(true)
    setNote('')
    setError('')

    try {
      await authService.resendVerification(email)
      setNote(
        'We have sent the email again, if this address can be registered. Only the newest link works.',
      )
    } catch (requestError) {
      const failure = resendFailure(requestError)
      setError(failure.message || failure.fieldError)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0FDF4] text-[#166534]">
        <MailCheck aria-hidden="true" className="h-7 w-7" />
      </div>
      <h2
        className="mt-4 font-display text-xl font-bold text-[#17213C] outline-none"
        ref={headingRef}
        tabIndex={-1}
      >
        Check your email
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#68728A]">
        If <strong className="font-semibold break-all text-[#273238]">{email}</strong> can be
        registered, we have sent an email to it. Open the link in that email to confirm your
        address. Then the admin team checks your registration, and we email you when you can
        sign in.
      </p>

      {note && (
        <div
          className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-left text-sm leading-5 text-[#166534]"
          role="status"
        >
          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{note}</p>
        </div>
      )}

      {error && (
        <div
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm leading-5 text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <p className="mt-5 text-[13px] leading-5 text-[#68728A]">
        No email after a few minutes? Look in the spam folder first.
      </p>

      <button
        className="mt-3 flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-[#E5E8F0] bg-white px-3 text-[13.5px] font-semibold text-[#273238] transition hover:border-[#D1D5DB] hover:bg-[#F7F8FC] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#273238]/10 disabled:cursor-not-allowed disabled:opacity-65"
        disabled={isSending}
        onClick={resend}
        type="button"
      >
        {isSending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#E5E8F0] border-t-[#273238]" />
            Sending...
          </>
        ) : (
          'Send the email again'
        )}
      </button>

      <button
        className="mt-4 text-[13.5px] font-semibold text-[#273238] underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#273238]/20"
        onClick={onUseDifferentEmail}
        type="button"
      >
        Use a different email
      </button>
    </div>
  )
}
