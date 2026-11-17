import { GOOGLE_CLIENT_ID, GOOGLE_HOSTED_DOMAIN } from './authConfig'

// Google Identity Services, the "Sign in with Google" button (spec 45,
// section 7). Google's window gives the browser an ID token; the admin web
// posts it to POST /auth/google. No client secret and no redirect page.

const SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const MIN_BUTTON_WIDTH = 200
const MAX_BUTTON_WIDTH = 400 // Google's limit.

let scriptRequest = null
let isInitialized = false
let credentialListener = null

function googleIdentity() {
  return window.google?.accounts?.id ?? null
}

// Loads Google's script one time. A failed load can be tried again.
export function loadGoogleIdentity() {
  const loaded = googleIdentity()

  if (loaded) {
    return Promise.resolve(loaded)
  }

  if (!scriptRequest) {
    scriptRequest = new Promise((resolve, reject) => {
      const script = document.createElement('script')

      function fail() {
        script.remove()
        scriptRequest = null
        reject(new Error('Google Identity Services could not be loaded.'))
      }

      script.src = SCRIPT_URL
      script.async = true
      script.onload = () => {
        const identity = googleIdentity()

        if (identity) {
          resolve(identity)
        } else {
          fail()
        }
      }
      script.onerror = fail
      document.head.appendChild(script)
    })
  }

  return scriptRequest
}

// Google's reference: initialize must be called only once per page, and only
// the last call counts. The login and the register page share this one call;
// the callback hands the answer to the button that is on the page now.
function initializeOnce(identity) {
  if (isInitialized) {
    return
  }

  identity.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => {
      credentialListener?.(response)
    },
    // A hint for Google's account list. The backend decides who may sign in.
    hd: GOOGLE_HOSTED_DOMAIN,
    ux_mode: 'popup',
    auto_select: false,
  })
  isInitialized = true
}

export function googleButtonWidth(availableWidth) {
  const width = Math.floor(Number(availableWidth) || 0)

  return Math.min(MAX_BUTTON_WIDTH, Math.max(MIN_BUTTON_WIDTH, width))
}

// Draws Google's own button into `container`. `onResponse` receives Google's
// answer ({ credential }) after the person chose an account. Returns false
// when the caller is gone before the script arrived (`isCurrent`).
export async function renderGoogleButton(container, { text, width, onResponse }, isCurrent = () => true) {
  const identity = await loadGoogleIdentity()

  if (!isCurrent()) {
    return false
  }

  initializeOnce(identity)
  credentialListener = onResponse
  container.replaceChildren()
  identity.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    shape: 'pill',
    logo_alignment: 'center',
    text,
    width: String(width),
    locale: 'en',
  })

  return true
}

// Called when a button leaves the page, so a late answer goes nowhere.
export function releaseGoogleButton(onResponse) {
  if (credentialListener === onResponse) {
    credentialListener = null
  }
}
