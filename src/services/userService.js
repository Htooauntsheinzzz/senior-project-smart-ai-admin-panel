import apiClient from '../api/apiClient'

export function isValidUserId(id) {
  return /^(?:[1-9]\d*)$/.test(String(id)) && Number.isSafeInteger(Number(id))
}

function userPath(id) {
  if (!isValidUserId(id)) throw new Error('Invalid admin user ID.')
  return `/users/${id}`
}

export async function createUser(payload) {
  const response = await apiClient.post('/users', payload)
  return response.data
}

export async function getUsers(params = {}) {
  const response = await apiClient.get('/users', { params })
  return response.data
}

export async function getUserById(id) {
  const response = await apiClient.get(userPath(id))
  return response.data
}

export async function updateUser(id, payload) {
  const response = await apiClient.put(userPath(id), payload)
  return response.data
}

export async function deleteUser(id) {
  await apiClient.delete(userPath(id))
}
