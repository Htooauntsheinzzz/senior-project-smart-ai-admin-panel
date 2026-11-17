import apiClient from '../api/apiClient'

export async function login(credentials) {
  const response = await apiClient.post('/auth/login', credentials)
  return response.data
}

export async function refresh(refreshToken) {
  const response = await apiClient.post('/auth/refresh', { refreshToken })
  return response.data
}

export async function logout() {
  await apiClient.post('/auth/logout')
}

// Admin self-registration (spec 45). The four endpoints are public.

// Answers 202 with the same body for every address of the allowed domain.
export async function register(payload) {
  const response = await apiClient.post('/auth/register', payload)
  return response.data
}

// The token of the link in the registration email. Works one time.
export async function verifyEmail(token) {
  const response = await apiClient.post('/auth/verify-email', { token })
  return response.data
}

export async function resendVerification(email) {
  const response = await apiClient.post('/auth/resend-verification', { email })
  return response.data
}

// `idToken` is the credential of the Google button. The answer is the body of
// /auth/login.
export async function googleSignIn(idToken) {
  const response = await apiClient.post('/auth/google', { idToken })
  return response.data
}
