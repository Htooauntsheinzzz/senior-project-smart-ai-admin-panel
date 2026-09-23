const ACCESS_TOKEN_STORAGE_KEY = 'smart_ai_admin_access_token'
const REFRESH_TOKEN_STORAGE_KEY = 'smart_ai_admin_refresh_token'

let accessToken = null
let refreshToken = null

function getStorage(remember = true) {
  return remember ? window.localStorage : window.sessionStorage
}

function clearStoredTokens(storage) {
  storage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  storage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
}

export function setAccessToken(token) {
  accessToken = token || null
}

export function getAccessToken() {
  return accessToken
}

export function setTokenSession(tokens, remember = false) {
  const nextAccessToken = tokens?.accessToken || null
  const nextRefreshToken = tokens?.refreshToken || null

  accessToken = nextAccessToken
  refreshToken = nextRefreshToken

  clearStoredTokens(window.localStorage)
  clearStoredTokens(window.sessionStorage)

  if (nextAccessToken && nextRefreshToken) {
    const storage = getStorage(remember)
    storage.setItem(ACCESS_TOKEN_STORAGE_KEY, nextAccessToken)
    storage.setItem(REFRESH_TOKEN_STORAGE_KEY, nextRefreshToken)
  }
}

export function replaceTokenSession(tokens) {
  const storage = window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
    ? window.localStorage
    : window.sessionStorage

  setTokenSession(tokens, storage === window.localStorage)
}

export function getStoredTokenSession() {
  const sessionAccessToken = window.sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  const sessionRefreshToken = window.sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)

  if (sessionAccessToken && sessionRefreshToken) {
    return {
      accessToken: sessionAccessToken,
      refreshToken: sessionRefreshToken,
      remember: false,
    }
  }

  const localAccessToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  const localRefreshToken = window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)

  if (localAccessToken && localRefreshToken) {
    return {
      accessToken: localAccessToken,
      refreshToken: localRefreshToken,
      remember: true,
    }
  }

  return null
}

export function getRefreshToken() {
  return refreshToken
}

export function removeTokenSession() {
  accessToken = null
  refreshToken = null
  clearStoredTokens(window.localStorage)
  clearStoredTokens(window.sessionStorage)
}
