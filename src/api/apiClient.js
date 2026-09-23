import axios from 'axios'
import { getAccessToken } from '../utils/tokenStorage'

const backendUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const apiClient = axios.create({
  baseURL: `${backendUrl}/api/v1/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && unauthorizedHandler) {
      unauthorizedHandler(error)
    }

    return Promise.reject(error)
  },
)

export default apiClient
