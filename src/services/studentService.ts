import apiClient from '../api/apiClient'

export type StudentRecord = {
  id: number; studentCode: string; universityEmail: string; firstName: string; lastName: string
  facultyId: number; facultyNameEn: string; departmentId: number; departmentName: string
  programId: number; programName: string; semesterId: number | null; semesterNameEn: string | null
  academicYear: number | null; enrollmentYear: number | null; accountStatus: string
  phoneNumber?: string | null; dateOfBirth?: string | null; forcePasswordChange?: boolean
}
export type StudentDraft = Record<string, string>
export type StudentPage = { content: StudentRecord[]; page: number; size: number; totalElements: number; totalPages: number }
export type StudentSummary = { totalStudents: number; activeStudents: number; pendingStudents: number; inactiveOrSuspendedStudents: number }
export const studentStatuses = ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED']
const count = (v: unknown): v is number => Number.isSafeInteger(v) && Number(v) >= 0
function id(v: string) {
  if (!/^[1-9]\d*$/.test(v) || !Number.isSafeInteger(Number(v))) throw new Error('Invalid student or academic ID.')
  return Number(v)
}
export function studentPath(value: string) { return `/students/${id(value)}` }
export function mapStudent(value: unknown): StudentRecord {
  const row = value as StudentRecord
  if (!row || !['id', 'facultyId', 'departmentId', 'programId'].every(k => count(row[k as keyof StudentRecord]) && Number(row[k as keyof StudentRecord]) > 0) ||
    !['studentCode', 'universityEmail', 'firstName', 'lastName', 'facultyNameEn', 'departmentName', 'programName'].every(k => typeof row[k as keyof StudentRecord] === 'string') ||
    !studentStatuses.includes(row.accountStatus) || (row.semesterId !== null && (!count(row.semesterId) || row.semesterId === 0))) throw new Error('Unexpected student response.')
  return row
}
export function passwordPayload(value: StudentDraft) {
  const password = value.temporaryPassword || ''
  if ([...password].length < 15 || new TextEncoder().encode(password).length > 72 || password.includes('\0')) throw new Error('Use at least 15 characters and at most 72 UTF-8 bytes, without NUL.')
  if (password !== value.confirmPassword) throw new Error('Passwords must match.')
  return { temporaryPassword: password, confirmPassword: value.confirmPassword }
}
export function studentPayload(value: StudentDraft, creating: boolean) {
  const result: Record<string, unknown> = {}
  for (const [key, max] of Object.entries({ studentCode: 50, universityEmail: 255, firstName: 100, lastName: 100 })) {
    const text = (value[key] || '').trim()
    if (!text || text.length > max) throw new Error(`Check ${key}.`)
    result[key] = key === 'universityEmail' ? text.toLowerCase() : text
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(result.universityEmail))) throw new Error('Enter a valid university email.')
  for (const key of ['facultyId', 'departmentId', 'programId']) result[key] = id(value[key])
  result.semesterId = value.semesterId ? id(value.semesterId) : null
  for (const key of ['academicYear', 'enrollmentYear']) {
    if (value[key] && (!/^\d{4}$/.test(value[key]) || Number(value[key]) < 1900)) throw new Error('Years must be between 1900 and 9999.')
    result[key] = value[key] ? Number(value[key]) : null
  }
  if ((value.phoneNumber || '').trim().length > 30) throw new Error('Phone number must be at most 30 characters.')
  result.phoneNumber = (value.phoneNumber || '').trim() || null
  const dob = value.dateOfBirth || ''
  if (dob && (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || !Number.isFinite(Date.parse(dob)) || new Date(dob).toISOString().slice(0, 10) !== dob || dob >= new Date().toISOString().slice(0, 10))) throw new Error('Date of birth must be a valid date in the past.')
  result.dateOfBirth = dob || null
  if (!studentStatuses.includes(value.accountStatus) || (creating && value.accountStatus === 'PENDING')) throw new Error('Invalid account status.')
  result.accountStatus = value.accountStatus
  if (creating) Object.assign(result, passwordPayload(value), { forcePasswordChange: value.forcePasswordChange !== 'false' })
  return result
}
export async function getStudents(filters: Record<string, string>, page = 0, size = 10, signal?: AbortSignal): Promise<StudentPage> {
  const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value.trim() !== ''))
  const { data } = await apiClient.get('/students', { params: { ...params, page, size, sort: 'id,asc' }, signal })
  if (!data || !Array.isArray(data.content) || data.page !== page || data.size !== size || !count(data.totalElements) || !count(data.totalPages) || data.totalPages !== Math.ceil(data.totalElements / size)) throw new Error('Unexpected student page.')
  const content = data.content.map(mapStudent)
  if (content.length !== Math.min(size, Math.max(0, data.totalElements - page * size)) || new Set(content.map((r: StudentRecord) => r.id)).size !== content.length) throw new Error('Incomplete student page.')
  return { ...data, content }
}
export async function getStudentSummary(signal?: AbortSignal): Promise<StudentSummary> {
  const { data } = await apiClient.get('/students/summary', { signal })
  if (!data || !['totalStudents', 'activeStudents', 'pendingStudents', 'inactiveOrSuspendedStudents'].every(k => count(data[k]))) throw new Error('Unexpected student summary.')
  return data
}
export async function getStudent(value: string) {
  const { data } = await apiClient.get(studentPath(value))
  const row = mapStudent(data)
  if (typeof row.forcePasswordChange !== 'boolean' || !('phoneNumber' in row) || !('dateOfBirth' in row)) throw new Error('Incomplete student details.')
  return row
}
export async function saveStudent(value: StudentDraft, studentId?: string) {
  const payload = studentPayload(value, !studentId)
  if (studentId) await apiClient.put(studentPath(studentId), payload)
  else await apiClient.post('/students', payload)
}
export async function deleteStudent(value: string) { await apiClient.delete(studentPath(value)) }
export async function resetStudentPassword(value: string, draft: StudentDraft) { await apiClient.post(`${studentPath(value)}/reset-password`, passwordPayload(draft)) }
export async function exportStudentRows(filters: Record<string, string>) {
  const rows: StudentRecord[] = []
  let total = -1
  for (let page = 0; page < 100; page++) {
    const result = await getStudents(filters, page, 100)
    if (result.totalElements > 10000 || (total >= 0 && total !== result.totalElements)) throw new Error('Export is too large or changed while loading. Narrow the filters and retry.')
    total = result.totalElements; rows.push(...result.content)
    if (page + 1 >= result.totalPages) {
      if (rows.length !== total || new Set(rows.map(r => r.id)).size !== rows.length) throw new Error('Export changed while loading. Retry.')
      return rows
    }
  }
  throw new Error('Export is too large. Narrow the filters.')
}
export function studentError(error: unknown): string {
  const e = error as { response?: { status?: number; data?: { code?: string } } }
  const status = e.response?.status
  const messages: Record<string, string> = {
    STUDENT_CODE_ALREADY_EXISTS: 'The student ID is already in use.',
    STUDENT_EMAIL_ALREADY_EXISTS: 'The university email is already in use.',
    INVALID_STUDENT_UNIVERSITY_EMAIL: 'Use an email accepted by the university email policy.',
    INVALID_STUDENT_ACADEMIC_RELATIONSHIP: 'Select a valid faculty, department, program and semester combination. New placements must be active.',
    STUDENT_NOT_REGISTERED: 'This student must complete mobile registration before a password can be reset.',
    INVALID_STUDENT_ACCOUNT_STATUS: 'This status transition is not allowed. Pending accounts activate through registration.',
    INVALID_STUDENT_ACCOUNT_STATE: 'This account has an inconsistent registration state. Reload before proceeding.',
    PASSWORD_CONFIRMATION_MISMATCH: 'Passwords must match.',
    PASSWORD_POLICY_VIOLATION: 'Use at least 15 characters and at most 72 UTF-8 bytes, without NUL.',
  }
  if ([400, 409].includes(status ?? 0) && messages[e.response?.data?.code ?? '']) return messages[e.response?.data?.code ?? '']
  if (status === 401) return 'Your session expired. Sign in again.'
  if (status === 403) return 'You do not have permission to manage students, or must change your password first.'
  if (status === 404) return 'The student or selected academic record no longer exists. Reload and retry.'
  if (status === 409) return 'The student code or email is already in use, or the record changed. Check the values and reload.'
  if (status === 400) return 'Check the student details, password policy, account status and academic placement. Pending students must register before activation or password reset.'
  return 'Unable to complete the student request. Please retry.'
}
