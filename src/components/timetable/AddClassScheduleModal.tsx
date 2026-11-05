import { useEffect, useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import Modal from '../ui/Modal'
import { getCourseDirectory, getSemesters, type ApiCourse, type Semester } from '../../services/courseService'
import { getLecturerDirectory, type ApiLecturer } from '../../services/lecturerService'
import { getSemesterById, type ApiSemester } from '../../services/semesterService'

const control = 'mt-2 h-10 w-full min-w-0 rounded-xl border border-[#e5e8f0] bg-white px-3 text-xs font-normal text-[#17213c] focus-visible:outline-2 disabled:bg-[#fafbfc] disabled:text-[#8791a8]'
const times = Array.from({ length: 33 }, (_, index) => `${String(6 + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`)

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block min-w-0 text-xs font-medium">{label}<span className="ml-0.5 text-[#d80255]">*</span>{children}</label>
}
function Group({ title, children, columns = 2 }: { title: string; children: ReactNode; columns?: number }) {
  return <fieldset><legend className="mb-3 text-[10px] font-semibold tracking-[0.1em] text-[#68728a] uppercase">{title}</legend><div className={`grid grid-cols-1 gap-3 ${columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>{children}</div></fieldset>
}

export default function AddClassScheduleModal({ onClose }: { onClose: () => void }) {
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [lecturers, setLecturers] = useState<ApiLecturer[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [semesterId, setSemesterId] = useState('')
  const [semester, setSemester] = useState<ApiSemester>()
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [lookup, setLookup] = useState<{ attempt: number; failed: boolean }>()
  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    Promise.allSettled([
      getCourseDirectory({ query: '', facultyId: '', departmentId: '', programId: '', year: '', term: '', status: 'active' }, signal).then(setCourses),
      getLecturerDirectory({ query: '', facultyId: '', departmentId: '', status: 'active' }, signal).then(setLecturers),
      getSemesters(signal).then(setSemesters),
    ]).then(results => { if (!signal.aborted) setLookup({ attempt, failed: results.some(result => result.status === 'rejected') }) })
    return () => controller.abort()
  }, [attempt])
  useEffect(() => {
    let cancelled = false
    if (semesterId) getSemesterById(semesterId).then(value => { if (!cancelled) setSemester(value) }).catch(() => { if (!cancelled) setSemester(undefined) })
    return () => { cancelled = true }
  }, [semesterId])
  const loading = lookup?.attempt !== attempt
  const year = semester?.id === semesterId ? String(semester.academicYear) : ''
  return <Modal title="Add Class Schedule" dividedHeader onClose={onClose}>
    <form className="space-y-5" onSubmit={event => event.preventDefault()}>
      <Group title="Course Information">
        <Field label="Course"><select required defaultValue="" className={control}><option value="">Select course…</option>{courses.map(course => <option key={course.id} value={course.id}>{course.code} — {course.name}</option>)}</select></Field>
        <Field label="Section"><input required placeholder="e.g. SEC-01" className={control} /></Field>
      </Group>
      <Group title="Schedule" columns={3}>
        <Field label="Day of Week"><select required defaultValue="" className={control}><option value="">Select day…</option>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => <option key={day}>{day}</option>)}</select></Field>
        <Field label="Start Time"><select required value={start} onChange={event => { setStart(event.target.value); setEnd('') }} className={control}><option value="">Select…</option>{times.slice(0, -1).map(time => <option key={time}>{time}</option>)}</select></Field>
        <Field label="End Time"><select required disabled={!start} value={end} onChange={event => setEnd(event.target.value)} className={control}><option value="">Select…</option>{times.filter(time => time > start).map(time => <option key={time}>{time}</option>)}</select></Field>
      </Group>
      <Group title="Location">
        <Field label="Building"><select disabled className={control} aria-describedby="schedule-api-note"><option>Select building…</option></select></Field>
        <Field label="Room"><select disabled className={control} aria-describedby="schedule-api-note"><option>Select room…</option></select></Field>
      </Group>
      <Group title="Staff & Term" columns={3}>
        <Field label="Lecturer"><select required defaultValue="" className={control}><option value="">Select lecturer…</option>{lecturers.map(lecturer => <option key={lecturer.id} value={lecturer.id}>{lecturer.nameEn || lecturer.nameTh}</option>)}</select></Field>
        <Field label="Semester"><select required value={semesterId} onChange={event => setSemesterId(event.target.value)} className={control}><option value="">Select…</option>{semesters.map(term => <option key={term.id} value={term.id}>{term.semesterNameEn || term.semesterNameTh}</option>)}</select></Field>
        <Field label="Academic Year"><select disabled value={year} className={control}><option value="">Select…</option>{year && <option value={year}>{year}</option>}</select></Field>
      </Group>
      {loading ? <p role="status" className="text-xs text-[#68728a]">Loading course, lecturer and semester choices…</p> : lookup?.failed ? <p role="alert" className="text-xs text-red-700">Some choices could not be loaded. <button type="button" onClick={() => setAttempt(value => value + 1)} className="underline">Retry</button></p> : null}
      <p id="schedule-api-note" className="text-xs leading-5 text-[#68728a]">Building/room choices and schedule creation are unavailable with the current APIs. Academic year follows the selected semester.</p>
      <div className="flex flex-wrap gap-3"><button type="submit" disabled aria-describedby="schedule-api-note" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#273238] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Check size={14} aria-hidden="true" />Create Schedule</button><button type="button" onClick={onClose} className="min-h-10 rounded-xl border border-[#e5e8f0] bg-white px-4 py-2 text-xs text-[#68728a] focus-visible:outline-2">Cancel</button></div>
    </form>
  </Modal>
}
