import apiClient from '../api/apiClient'

export async function createUser(payload) {
  const response = await apiClient.post('/users', payload)
  return response.data
}

export async function getUsers(params = {}) {
  const response = await apiClient.get('/users', { params })
  return response.data
}

export async function getUserById(id) {
  const response = await apiClient.get(`/users/${id}`)
  return response.data
}

export async function updateUser(id, payload) {
  const response = await apiClient.put(`/users/${id}`, payload)
  return response.data
}

export async function deleteUser(id) {
  await apiClient.delete(`/users/${id}`)
}
