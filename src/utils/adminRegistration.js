import { ADMIN_EMAIL_DOMAIN } from './authConfig'

// Admin self-registration (spec 45): the form check, the request body and the
// texts for every answer of the four public endpoints. The backend checks
// everything again; these rules only tell the person early.

export const MIN_PASSWORD_CHARACTERS = 15
export const MAX_PASSWORD_BYTES = 72
export const MAX_VERIFICATION_TOKEN_LENGTH = 128

export const EMPTY_REGISTRATION_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
}

// The order in which the fields appear, used to focus the first wrong one.
export const REGISTRATION_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phoneNumber',
  'password',
  'confirmPassword',
  'terms',
]

const MAX_LENGTH = { firstName: 100, lastName: 100, email: 255, phoneNumber: 30 }
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_LOCAL_PART = /^[a-z0-9._%+-]+$/
const PHONE_NUMBER = /^(?=.*[0-9])[0-9 +()-]+$/
const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u

const CONNECTION_ERROR = 'Unable to connect to the server. Please try again.'
const TOO_MANY_ATTEMPTS = 'Too many attempts. Please wait a minute and try again.'
const TOO_MANY_EMAILS = 'Too many emails for this address. Please wait a minute and try again.'
const REGISTRATION_CLOSED = 'Registration is closed. Please contact IT Support.'
const INVALID_EMAIL = 'Please enter a valid email address.'

// Spec 46: a registration that waits for a Super Admin. The backend answers
// 403 ACCOUNT_PENDING_APPROVAL to /auth/google and, after the right password,
// to /auth/login.
export const PENDING_APPROVAL_NOTICE =
  'Your registration is waiting for approval by the admin team. We will email you when it is approved.'

export function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

// Returns the message for an address that cannot register, or '' when it can.
export function emailProblem(value) {
  const email = normalizeEmail(value)

  if (!email) {
    return 'Email is required.'
  }

  if (email.length > MAX_LENGTH.email) {
    return `Use at most ${MAX_LENGTH.email} characters.`
  }

  if (!EMAIL_SHAPE.test(email)) {
    return INVALID_EMAIL
  }

  const at = email.indexOf('@')
  const localPart = email.slice(0, at)

  if (email.slice(at + 1) !== ADMIN_EMAIL_DOMAIN) {
    return `Use your @${ADMIN_EMAIL_DOMAIN} email address.`
  }

  if (
    !EMAIL_LOCAL_PART.test(localPart) ||
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..')
  ) {
    return INVALID_EMAIL
  }

  return ''
}

// The password rule of the backend: at least 15 characters (code points), at
// most 72 UTF-8 bytes, no NUL and no broken characters.
export function passwordProblem(value) {
  const password = String(value ?? '')

  if (!password) {
    return 'Password is required.'
  }

  if (password.includes('\0') || LONE_SURROGATE.test(password)) {
    return 'Use valid characters in the password.'
  }

  if (Array.from(password).length < MIN_PASSWORD_CHARACTERS) {
    return `Use at least ${MIN_PASSWORD_CHARACTERS} characters.`
  }

  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
    return `Use a shorter password (at most ${MAX_PASSWORD_BYTES} bytes).`
  }

  return ''
}

export function validateRegistration(form, acceptedTerms) {
  const errors = {}
  const firstName = form.firstName.trim()
  const lastName = form.lastName.trim()
  const phoneNumber = form.phoneNumber.trim()

  if (!firstName) {
    errors.firstName = 'First name is required.'
  } else if (firstName.length > MAX_LENGTH.firstName) {
    errors.firstName = `Use at most ${MAX_LENGTH.firstName} characters.`
  }

  if (!lastName) {
    errors.lastName = 'Last name is required.'
  } else if (lastName.length > MAX_LENGTH.lastName) {
    errors.lastName = `Use at most ${MAX_LENGTH.lastName} characters.`
  }

  const emailError = emailProblem(form.email)
  if (emailError) {
    errors.email = emailError
  }

  if (phoneNumber.length > MAX_LENGTH.phoneNumber) {
    errors.phoneNumber = `Use at most ${MAX_LENGTH.phoneNumber} characters.`
  } else if (phoneNumber && !PHONE_NUMBER.test(phoneNumber)) {
    errors.phoneNumber = 'Enter a valid phone number.'
  }

  const passwordError = passwordProblem(form.password)
  if (passwordError) {
    errors.password = passwordError
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

// The backend refuses unknown fields, so only its own fields are sent. An
// empty phone number is left out.
export function buildRegisterPayload(form) {
  const payload = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: normalizeEmail(form.email),
    password: form.password,
    confirmPassword: form.confirmPassword,
  }
  const phoneNumber = form.phoneNumber.trim()

  if (phoneNumber) {
    payload.phoneNumber = phoneNumber
  }

  return payload
}

// A link without a token, or with one the backend would refuse unread, shows
// "this link does not work" without a request.
export function isUsableVerificationToken(token) {
  return (
    typeof token === 'string' &&
    token.trim().length > 0 &&
    token.trim().length <= MAX_VERIFICATION_TOKEN_LENGTH
  )
}

function answerOf(error) {
  const response = error?.response

  return {
    hasResponse: Boolean(response),
    status: Number(response?.status) || 0,
    code: typeof response?.data?.code === 'string' ? response.data.code : '',
  }
}

export function isPendingApproval(error) {
  const { status, code } = answerOf(error)
  return status === 403 && code === 'ACCOUNT_PENDING_APPROVAL'
}

// POST /auth/register. Returns { message, fieldErrors }; a server message is
// never shown as it is.
export function registrationFailure(error) {
  const { hasResponse, status, code } = answerOf(error)

  if (!hasResponse) {
    return { message: CONNECTION_ERROR, fieldErrors: {} }
  }

  if (status === 429) {
    return { message: TOO_MANY_ATTEMPTS, fieldErrors: {} }
  }

  if (status === 400) {
    if (code === 'EMAIL_DOMAIN_NOT_ALLOWED') {
      return {
        message: '',
        fieldErrors: { email: `Only @${ADMIN_EMAIL_DOMAIN} email addresses can register.` },
      }
    }

    if (code === 'PASSWORD_POLICY_VIOLATION') {
      return {
        message: '',
        fieldErrors: {
          password: `Use at least ${MIN_PASSWORD_CHARACTERS} characters and at most ${MAX_PASSWORD_BYTES} bytes.`,
        },
      }
    }

    if (code === 'PASSWORD_CONFIRMATION_MISMATCH') {
      return { message: '', fieldErrors: { confirmPassword: 'Passwords do not match.' } }
    }

    return { message: 'Please check the entered values.', fieldErrors: {} }
  }

  if (status === 403 && code === 'REGISTRATION_DISABLED') {
    return { message: REGISTRATION_CLOSED, fieldErrors: {} }
  }

  if (status >= 500) {
    return {
      message: 'Registration is not available right now. Please try again later.',
      fieldErrors: {},
    }
  }

  return { message: 'Unable to register. Please try again.', fieldErrors: {} }
}

// POST /auth/verify-email. 'invalid': the link does not work and a new one is
// needed. 'retry': the same link can be sent again.
export function verificationFailure(error) {
  return answerOf(error).status === 400 ? 'invalid' : 'retry'
}

// POST /auth/resend-verification. Returns { message, fieldError }.
export function resendFailure(error) {
  const { hasResponse, status } = answerOf(error)

  if (!hasResponse) {
    return { message: CONNECTION_ERROR, fieldError: '' }
  }

  if (status === 400) {
    return { message: '', fieldError: INVALID_EMAIL }
  }

  if (status === 429) {
    return { message: TOO_MANY_EMAILS, fieldError: '' }
  }

  return { message: 'Unable to send the email right now. Please try again.', fieldError: '' }
}

// POST /auth/google. Also used for an answer without tokens (no response).
export function googleSignInFailure(error) {
  const { hasResponse, status, code } = answerOf(error)

  if (!hasResponse) {
    return error?.code === 'ERR_NETWORK' || error?.request
      ? CONNECTION_ERROR
      : 'Google sign-in failed. Please try again.'
  }

  if (status === 429) {
    return TOO_MANY_ATTEMPTS
  }

  if (status === 403) {
    if (code === 'GOOGLE_EMAIL_NOT_VERIFIED') {
      return 'Google has not verified the email address of this account.'
    }

    if (code === 'EMAIL_DOMAIN_NOT_ALLOWED') {
      return `Only @${ADMIN_EMAIL_DOMAIN} Google accounts can sign in. Choose your university account.`
    }

    if (code === 'GOOGLE_ACCOUNT_NOT_IN_DOMAIN') {
      return `Use the Google account of your @${ADMIN_EMAIL_DOMAIN} university mailbox. A personal Google account cannot sign in.`
    }

    if (code === 'REGISTRATION_DISABLED') {
      return REGISTRATION_CLOSED
    }

    if (code === 'ACCOUNT_PENDING_APPROVAL') {
      return PENDING_APPROVAL_NOTICE
    }

    return 'This account cannot sign in. Please contact IT Support.'
  }

  if (status === 409) {
    return 'This account is linked to another Google account. Please contact IT Support.'
  }

  if (status === 503 && code === 'GOOGLE_SIGN_IN_NOT_CONFIGURED') {
    return 'Google sign-in is not set up on the server yet.'
  }

  if (status >= 500) {
    return 'Google sign-in is not available right now. Please try again later.'
  }

  return 'Google sign-in failed. Please try again.'
}
