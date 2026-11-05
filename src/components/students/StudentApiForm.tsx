import { useState } from 'react'
import Modal from '../ui/Modal'
import { passwordPayload, saveStudent, studentPayload, studentError, studentStatuses, type StudentDraft, type StudentRecord } from '../../services/studentService'

export type AcademicOption = { id: string; name: string; facultyId?: string; departmentId?: string; status?: string }
export type StudentLookups = { faculties: AcademicOption[]; departments: AcademicOption[]; programs: AcademicOption[]; semesters: AcademicOption[] }
export const studentControl = 'w-full rounded-xl border border-[#e5e8f0] bg-white px-3 py-2 text-sm disabled:opacity-50'
export const studentButton = 'rounded-xl bg-[#273238] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50'

export default function StudentApiForm({ student, lookups, onClose, onSaved }: { student?: StudentRecord; lookups: StudentLookups; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState<StudentDraft>(() => Object.fromEntries(Object.entries({ studentCode: '', universityEmail: '', firstName: '', lastName: '', phoneNumber: '', dateOfBirth: '', facultyId: '', departmentId: '', programId: '', semesterId: '', academicYear: '', enrollmentYear: '', accountStatus: 'ACTIVE', ...student, temporaryPassword: '', confirmPassword: '', forcePasswordChange: 'true' }).map(([k, v]) => [k, v == null ? '' : String(v)])))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  function change(key: string, value: string) { setDraft(d => ({ ...d, [key]: value, ...(key === 'facultyId' ? { departmentId: '', programId: '' } : key === 'departmentId' ? { programId: '' } : {}) })) }
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    try { studentPayload(draft, !student); if (!student) passwordPayload(draft) } catch (e) { setError((e as Error).message); return }
    setBusy(true); setError('')
    try { await saveStudent(draft, student ? String(student.id) : undefined); onSaved() } catch (e) { setError(studentError(e)); setBusy(false) }
  }
  const fields = [['studentCode', 'Student ID', 'text', 50], ['universityEmail', 'University Email', 'email', 255], ['firstName', 'First Name', 'text', 100], ['lastName', 'Last Name', 'text', 100], ['phoneNumber', 'Phone Number', 'tel', 30], ['dateOfBirth', 'Date of Birth', 'date', 10], ['academicYear', 'Academic Year', 'number', 4], ['enrollmentYear', 'Enrollment Year', 'number', 4]] as const
  return <Modal title={student ? 'Edit Student' : 'Add Student'} onClose={() => { if (!busy) onClose() }}><form onSubmit={submit} className="space-y-4"><fieldset disabled={busy} className="space-y-4">
    {fields.map(([key, label, type, max]) => <label key={key} className="block text-xs font-semibold">{label}<input className={`${studentControl} mt-1`} type={type} value={draft[key]} onChange={e => change(key, e.target.value)} maxLength={max} required={['studentCode', 'universityEmail', 'firstName', 'lastName'].includes(key)} min={type === 'number' ? 1900 : undefined} max={type === 'number' ? 9999 : undefined} /></label>)}
    {(['faculties', 'departments', 'programs', 'semesters'] as const).map((group, index) => {
      const key = ['facultyId', 'departmentId', 'programId', 'semesterId'][index]
      const options = lookups[group].filter(o => (group !== 'departments' || o.facultyId === draft.facultyId) && (group !== 'programs' || (o.facultyId === draft.facultyId && o.departmentId === draft.departmentId)))
      return <label key={group} className="block text-xs font-semibold">{['Faculty', 'Department', 'Program / Major', 'Semester (optional)'][index]}<select required={index < 3} value={draft[key]} onChange={e => change(key, e.target.value)} className={`${studentControl} mt-1`}><option value="">Select…</option>{options.map(o => <option key={o.id} value={o.id} disabled={o.status === 'inactive' && String(student?.[key as keyof StudentRecord]) !== o.id}>{o.name}{o.status === 'inactive' ? ' (inactive)' : ''}</option>)}</select></label>
    })}
    <label className="block text-xs font-semibold">Account Status<select className={`${studentControl} mt-1`} value={draft.accountStatus} onChange={e => change('accountStatus', e.target.value)}>{(student?.accountStatus === 'PENDING' ? ['PENDING'] : studentStatuses.filter(s => s !== 'PENDING')).map(s => <option key={s}>{s}</option>)}</select></label>
    {student?.accountStatus === 'PENDING' && <p className="text-xs text-[#68728a]">Pending accounts activate through student registration.</p>}
    {!student && <><p className="text-xs text-[#68728a]">Temporary password: at least 15 characters, at most 72 UTF-8 bytes.</p>{['temporaryPassword', 'confirmPassword'].map(key => <label key={key} className="block text-xs font-semibold">{key === 'temporaryPassword' ? 'Temporary Password' : 'Confirm Password'}<input type="password" autoComplete="new-password" required value={draft[key]} onChange={e => change(key, e.target.value)} className={`${studentControl} mt-1`} /></label>)}<label className="flex gap-2 text-xs"><input type="checkbox" checked={draft.forcePasswordChange !== 'false'} onChange={e => change('forcePasswordChange', String(e.target.checked))} />Require password change at next sign-in</label></>}
    </fieldset>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={busy} className={studentButton}>{busy ? 'Saving…' : 'Save Student'}</button></form></Modal>
}
