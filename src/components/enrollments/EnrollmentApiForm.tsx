import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { getSemesterById, type ApiSemester } from '../../services/semesterService'
import Modal from '../ui/Modal'
import { allowedEnrollmentStatuses, enrollmentError, enrollmentPayload, saveEnrollment, type EnrollmentDetail } from '../../services/enrollmentService'
import EnrollmentRecordPicker, { enrollmentButton, enrollmentControl, type EnrollmentChoice } from './EnrollmentRecordPicker'

export default function EnrollmentApiForm({ enrollment, onClose, onSaved }: { enrollment?: EnrollmentDetail; onClose: () => void; onSaved: () => void }) {
  const [student, setStudent] = useState<EnrollmentChoice | undefined>(enrollment ? { id: String(enrollment.studentId), label: `${enrollment.studentCode} — ${enrollment.studentName}` } : undefined)
  const [course, setCourse] = useState<EnrollmentChoice | undefined>(enrollment ? { id: String(enrollment.courseId), label: `${enrollment.courseCode} — ${enrollment.courseName}` } : undefined)
  const [section, setSection] = useState<EnrollmentChoice | undefined>(enrollment ? { id: String(enrollment.courseSectionId), label: `${enrollment.courseCode} — ${enrollment.sectionNumber} · ${enrollment.semesterNameEn}`, semesterId: String(enrollment.semesterId), semesterName: enrollment.semesterNameEn } : undefined)
  const [semester, setSemester] = useState<ApiSemester>()
  useEffect(() => {
    let cancelled = false
    if (section?.semesterId) getSemesterById(section.semesterId).then(value => { if (!cancelled) setSemester(value) }).catch(() => { if (!cancelled) setSemester(undefined) })
    return () => { cancelled = true }
  }, [section?.semesterId])
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
  return <Modal dividedHeader title={enrollment ? 'Edit Enrollment' : 'Enroll Student'} onClose={() => { if (!lock.current) onClose() }}><form onSubmit={submit} className="space-y-5">
    {canMove ? <><EnrollmentRecordPicker compact kind="student" value={student} onChange={setStudent} eligibleOnly disabled={busy} /><EnrollmentRecordPicker compact kind="course" value={course} onChange={choice => { setCourse(choice); setSection(undefined) }} disabled={busy} /><EnrollmentRecordPicker key={course?.id ?? 'no-course'} compact kind="section" courseId={course?.id} value={section} onChange={setSection} eligibleOnly disabled={busy || !course} /></> : <p className="text-sm">{student?.label}<br />{section?.label}<br /><span className="text-xs text-[#68728a]">Only Pending enrollments can change student or section.</span></p>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="text-xs font-semibold">Semester<input readOnly value={section?.semesterName ?? ''} placeholder="Select a section…" className={`${enrollmentControl} mt-2 bg-[#f7f8fc]`} /></label><label className="text-xs font-semibold">Academic Year<input readOnly value={section?.semesterId && semester?.id === section.semesterId ? semester.academicYear : ''} placeholder={section ? 'Unavailable / loading' : 'Select a section…'} className={`${enrollmentControl} mt-2 bg-[#f7f8fc]`} /></label></div>
    <p className="text-xs text-[#68728a]">Semester and academic year are determined by the selected section.</p>
    <details open={enrollment ? true : undefined}><summary className="cursor-pointer text-xs font-semibold text-[#68728a]">Enrollment options (date and status)</summary><div className="mt-3 space-y-3">
    <label className="block text-xs font-semibold">Enrollment Date<input type="date" disabled={busy} value={date} onChange={e => setDate(e.target.value)} className={`${enrollmentControl} mt-1`} /></label><p className="text-xs text-[#68728a]">Leave blank to {enrollment ? 'keep the existing date' : "use the server's current date"}.</p>
    <label className="block text-xs font-semibold">Status<select disabled={busy} value={status} onChange={e => setStatus(e.target.value)} className={`${enrollmentControl} mt-1`}>{allowedEnrollmentStatuses(enrollment?.status).map(s => <option key={s}>{s}</option>)}</select></label>
    <p className="text-xs leading-5 text-[#68728a]">Pending and Active reserve seats. Capacity and duplicate-course checks are enforced by the server when saving. Withdrawn and Dropped cannot be reactivated.</p>
    </div></details>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <div className="flex flex-wrap gap-3"><button type="submit" disabled={busy || !student || !section} className={`${enrollmentButton} inline-flex min-h-11 items-center gap-2 bg-[#273238] px-5 text-white hover:bg-[#1c252a]`}><Check size={16} aria-hidden="true" />{busy ? 'Saving…' : enrollment ? 'Save Enrollment' : 'Confirm Enrollment'}</button><button type="button" disabled={busy} onClick={onClose} className={`${enrollmentButton} min-h-11 bg-white px-4 text-[#68728a]`}>Cancel</button></div>
  </form></Modal>
}
