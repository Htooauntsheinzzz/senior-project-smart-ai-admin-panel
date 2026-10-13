import apiClient from '../api/apiClient'
import { getSemesters, mapSemester, type Semester } from './courseService'

export { getSemesters }
export type { Semester }
export type SemesterDraft = { semesterNameEn: string; semesterNameTh: string }
export function semesterPath(id: string) {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) throw new Error('Invalid semester ID.')
  return `/semesters/${id}`
}
export function validateSemester(value: SemesterDraft) {
  const errors: Partial<Record<keyof SemesterDraft, string>> = {}
  for (const key of ['semesterNameEn', 'semesterNameTh'] as const) {
    if (!value[key].trim()) errors[key] = 'This field is required.'
    else if (value[key].trim().length > 150) errors[key] = 'Use at most 150 characters.'
  }
  return errors
}
export function semesterPayload(value: SemesterDraft) {
  if (Object.keys(validateSemester(value)).length) throw new Error('Check the semester names.')
  return { semesterNameEn: value.semesterNameEn.trim(), semesterNameTh: value.semesterNameTh.trim() }
}
export async function getSemester(id: string) {
  const { data } = await apiClient.get(semesterPath(id))
  return mapSemester(data)
}
export async function saveSemester(value: SemesterDraft, id?: string) {
  const payload = semesterPayload(value)
  if (id === undefined) await apiClient.post('/semesters', payload)
  else await apiClient.put(semesterPath(id), payload)
}
export async function getSemesterReferences(id: string) {
  semesterPath(id)
  const labels = ['courses', 'course sections', 'students']
  const counts = await Promise.all(['/courses', '/course-sections', '/students'].map(async endpoint => {
    const { data } = await apiClient.get(endpoint, { params: { semesterId: Number(id), page: 0, size: 1 } })
    if (!data || !Array.isArray(data.content) || !Number.isSafeInteger(data.totalElements) || data.totalElements < 0 || data.page !== 0 || data.size !== 1) throw new Error('Unable to verify semester references.')
    return data.totalElements as number
  }))
  return counts.flatMap((count, index) => count ? [`${count} ${labels[index]}`] : [])
}
export async function deleteSemester(id: string) {
  const path = semesterPath(id)
  const references = await getSemesterReferences(id)
  if (references.length) throw new Error(`Semester is referenced by ${references.join(', ')}. Resolve those references before deleting it.`)
  await apiClient.delete(path)
}
export function semesterError(error: unknown) {
  const response = (error as { response?: { status: number; data?: { code?: string } } })?.response
  if (!response && error instanceof Error && (error.message.startsWith('Semester is referenced by ') || error.message === 'Unable to verify semester references.')) return error.message
  if (response?.data?.code === 'SEMESTER_ALREADY_EXISTS') return 'A semester with this English and Thai name combination already exists.'
  if (response?.status === 403) return 'You do not have permission to perform this action or check its related records.'
  if (response?.status === 404) return 'The semester or a related record is unavailable. Refresh and try again.'
  if (response?.status === 409) return 'This request conflicts with existing records. Refresh and try again.'
  if (response?.status === 400) return 'Check the semester names. Both are required and may contain at most 150 characters.'
  return 'Unable to complete the request. Please try again.'
}
