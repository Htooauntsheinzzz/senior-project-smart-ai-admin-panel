// Build-time settings of the public sign-in pages (spec 45, section 4).
// None of them is a secret: the Google client ID is visible to every browser.

const HOST_NAME = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/

function hostName(value, fallback) {
  const normalized = String(value ?? '').trim().toLowerCase()
  return HOST_NAME.test(normalized) ? normalized : fallback
}

// The OAuth 2.0 Web client ID, the same value as GOOGLE_OAUTH_CLIENT_ID of the
// backend. Empty: Google sign-in is not set up for this build.
export const GOOGLE_CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim()

// The only email domain that may register (ADMIN_REGISTRATION_EMAIL_DOMAIN).
export const ADMIN_EMAIL_DOMAIN = hostName(import.meta.env.VITE_ADMIN_EMAIL_DOMAIN, 'rsu.ac.th')

// The Google Workspace domain offered in Google's account list
// (GOOGLE_OAUTH_HOSTED_DOMAIN). Empty: the email domain.
export const GOOGLE_HOSTED_DOMAIN = hostName(import.meta.env.VITE_GOOGLE_HOSTED_DOMAIN, ADMIN_EMAIL_DOMAIN)
