import { GOOGLE_CLIENT_ID } from '../../utils/authConfig'
import GoogleSignInButton from './GoogleSignInButton'

// Spec 45, section 7. Google: the real button of Google Identity Services when
// a client ID is set for this build, otherwise the design-only button. Apple:
// design only (the backend has no Apple sign-in). For a design-only button the
// parent decides what a click does (`onSelect`).

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 48 48">
      <path
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        fill="#FFC107"
      />
      <path
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
        fill="#FF3D00"
      />
      <path
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        fill="#4CAF50"
      />
      <path
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
        fill="#1976D2"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      fill="#000000"
      viewBox="0 0 24 24"
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  )
}

// Same height and shape as Google's button, so the two look like one set.
function DesignOnlyButton({ children, disabled, onClick }) {
  return (
    <button
      className="flex h-10 w-full max-w-[400px] items-center justify-center gap-2.5 rounded-full border border-[#DADCE0] bg-white px-3 text-[14px] font-medium whitespace-nowrap text-[#3C4043] transition hover:border-[#D2E3FC] hover:bg-[#F8FAFF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#273238]/10 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

export default function SocialAuthButtons({
  actionLabel = 'Sign up',
  isBusy = false,
  onGoogleCredential,
  onGoogleError,
  onSelect,
  showApple = true,
}) {
  return (
    <div>
      <div className="my-6 flex items-center gap-3">
        <span aria-hidden="true" className="h-px flex-1 bg-[#E5E8F0]" />
        <span className="text-[12.5px] font-medium text-[#68728A]">Or</span>
        <span aria-hidden="true" className="h-px flex-1 bg-[#E5E8F0]" />
      </div>

      <div className="flex flex-col items-center gap-3">
        {GOOGLE_CLIENT_ID ? (
          <GoogleSignInButton
            isBusy={isBusy}
            onCredential={onGoogleCredential}
            onError={onGoogleError}
            text={actionLabel === 'Sign in' ? 'signin_with' : 'signup_with'}
          />
        ) : (
          <DesignOnlyButton disabled={isBusy} onClick={() => onSelect('google', 'Google')}>
            <GoogleIcon />
            {actionLabel} with Google
          </DesignOnlyButton>
        )}

        {showApple && (
          <DesignOnlyButton disabled={isBusy} onClick={() => onSelect('apple', 'Apple')}>
            <AppleIcon />
            {actionLabel} with Apple
          </DesignOnlyButton>
        )}
      </div>
    </div>
  )
}
