import { useRef, useState } from 'react'
import Modal from '../ui/Modal'
import { allowedEnrollmentStatuses, enrollmentError, enrollmentPayload, saveEnrollment, type EnrollmentDetail } from '../../services/enrollmentService'
import EnrollmentRecordPicker, { enrollmentButton, enrollmentControl, type EnrollmentChoice } from './EnrollmentRecordPicker'

export default function EnrollmentApiForm({ enrollment, onClose, onSaved }: { enrollment?: EnrollmentDetail; onClose: () => void; onSaved: () => void }) {
  const [student, setStudent] = useState<EnrollmentChoice | undefined>(enrollment ? { id: String(enrollment.studentId), label: `${enrollment.studentCode} — ${enrollment.studentName}` } : undefined)
  const [section, setSection] = useState<EnrollmentChoice | undefined>(enrollment ? { id: String(enrollment.courseSectionId), label: `${enrollment.courseCode} — ${enrollment.sectionNumber} · ${enrollment.semesterNameEn}` } : undefined)
  const [date, setDate] = useState(enrollment?.enrollmentDate ?? '')
  const [status, setStatus] = useState<string>(enrollment?.status ?? 'ACTIVE')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const canMove = !enrollment || enrollment.status === 'PENDING'
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lock.current) return
    const draft = { studentId: student?.id ?? '', courseSectionId: section?.id ?? '', enrollmentDate: date, status }
    try { enrollmentPayload(draft) } catch (e) { setError((e as Error).message); return }
    lock.current = true; setBusy(true); setError('')
    try { await saveEnrollment(draft, enrollment ? String(enrollment.id) : undefined); onSaved() } catch (e) { setError(enrollmentError(e)); lock.current = false; setBusy(false) }
  }
  return <Modal title={enrollment ? 'Edit Enrollment' : 'Enroll Student'} onClose={() => { if (!lock.current) onClose() }}><form onSubmit={submit} className="space-y-4">
    {canMove ? <><EnrollmentRecordPicker kind="student" value={student} onChange={setStudent} eligibleOnly disabled={busy} /><EnrollmentRecordPicker kind="section" value={section} onChange={setSection} eligibleOnly disabled={busy} /></> : <p className="text-sm">{student?.label}<br />{section?.label}<br /><span className="text-xs text-[#68728a]">Only Pending enrollments can change student or section.</span></p>}
    <label className="block text-xs font-semibold">Enrollment Date<input type="date" disabled={busy} value={date} onChange={e => setDate(e.target.value)} className={`${enrollmentControl} mt-1`} /></label><p className="text-xs text-[#68728a]">Leave blank to {enrollment ? 'keep the existing date' : "use the server's current date"}.</p>
    <label className="block text-xs font-semibold">Status<select disabled={busy} value={status} onChange={e => setStatus(e.target.value)} className={`${enrollmentControl} mt-1`}>{allowedEnrollmentStatuses(enrollment?.status).map(s => <option key={s}>{s}</option>)}</select></label>
    <p className="text-xs leading-5 text-[#68728a]">Pending and Active reserve seats. Capacity and duplicate-course checks are enforced by the server when saving. Withdrawn and Dropped cannot be reactivated.</p>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button disabled={busy || !student || !section} className={`${enrollmentButton} bg-[#273238] text-white`}>{busy ? 'Saving…' : 'Save Enrollment'}</button>
  </form></Modal>
}
