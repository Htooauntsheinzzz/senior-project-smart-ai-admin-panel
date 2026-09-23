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
