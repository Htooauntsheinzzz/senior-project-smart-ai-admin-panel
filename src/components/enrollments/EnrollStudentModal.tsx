import { useRef, useState, type FormEvent } from 'react'
import type { Enrollment } from '../../data/enrollments'
import { createLocalEnrollment, emptyEnrollmentDraft, enrollmentCourses, enrollmentSections, enrollmentSemesters, enrollmentStudents, enrollmentYears, validateEnrollment, type EnrollmentDraft } from '../../utils/enrollStudent'
import Modal from '../ui/Modal'

export default function EnrollStudentModal({ rows, onEnroll, onClose }: { rows: Enrollment[]; onEnroll: (row: Enrollment) => void; onClose: () => void }) {
  const [value, setValue] = useState({ ...emptyEnrollmentDraft })
  const [errors, setErrors] = useState<Partial<Record<keyof EnrollmentDraft, string>>>({})
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState('')
  const [discard, setDiscard] = useState(false)
  const lock = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  function close() { if (lock.current) return; if (Object.values(value).some(Boolean)) setDiscard(true); else onClose() }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (lock.current) return
    const next = validateEnrollment(value, rows)
    setErrors(next)
    if (Object.keys(next).length) { requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]:not(:disabled)')?.focus()); return }
    lock.current = true; setPending(true); setFailure('')
    try { await new Promise<void>(resolve => requestAnimationFrame(() => resolve())); onEnroll(createLocalEnrollment(value)) }
    catch { lock.current = false; setPending(false); setFailure('Unable to save the local enrollment. Your selections have been kept. Please try again.') }
  }
  const fields: { key: keyof EnrollmentDraft; label: string; placeholder: string; options: { value: string; label: string }[]; half?: boolean; disabled?: boolean }[] = [
    { key: 'studentId', label: 'Student', placeholder: 'Select student...', options: enrollmentStudents.map(row => ({ value: row.studentId, label: `${row.name} — ${row.studentId}` })) },
    { key: 'course', label: 'Course', placeholder: 'Select course...', options: enrollmentCourses.map(row => ({ value: row.course, label: `${row.course} — ${row.courseName}` })) },
    { key: 'section', label: 'Section', placeholder: 'Select section...', disabled: !value.course, options: enrollmentSections(value.course).map(section => ({ value: section, label: section })) },
    { key: 'semester', label: 'Semester', placeholder: 'Select...', half: true, options: enrollmentSemesters.map(term => ({ value: term, label: term })) },
    { key: 'year', label: 'Academic Year', placeholder: 'Select...', half: true, options: enrollmentYears.map(year => ({ value: year, label: year })) },
  ]
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'
  return <Modal title="Enroll Student" dividedHeader onClose={close}>
    <form ref={form} onSubmit={submit} noValidate aria-busy={pending}>
      <fieldset disabled={pending} className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">{fields.map(field => <div key={field.key} className={`min-w-0 ${field.half ? '' : 'sm:col-span-2'}`}>
        <label htmlFor={`enroll-${field.key}`} className="mb-1.5 block text-[12.5px] font-semibold">{field.label}<span aria-hidden="true" className="ml-0.5 text-[#d80255]">*</span></label>
        <div className="relative"><select id={`enroll-${field.key}`} name={field.key} required disabled={field.disabled || pending} value={value[field.key]} aria-invalid={!!errors[field.key]} aria-describedby={errors[field.key] ? `enroll-${field.key}-error` : undefined} onChange={event => { const next = event.target.value; setValue(previous => ({ ...previous, [field.key]: next, ...(field.key === 'course' ? { section: '' } : {}) })); setErrors({}); setFailure(''); setDiscard(false) }} className={`h-[39px] w-full appearance-none rounded-xl border-[1.25px] bg-white pr-8 pl-4 text-[13.5px] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${errors[field.key] ? 'border-[#d80255]' : 'border-[#e5e8f0]'}`}><option value="">{field.placeholder}</option>{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><img src="/assets/figma/department-select-arrow.svg" width="10" height="6" alt="" className={`pointer-events-none absolute top-4 right-3.5 ${field.disabled ? 'opacity-50' : ''}`} /></div>
        {errors[field.key] && <p id={`enroll-${field.key}-error`} className="mt-1.5 text-xs text-[#d80255]">{errors[field.key]}</p>}
      </div>)}</fieldset>
      {failure && <p role="alert" className="mt-3 text-xs text-[#d80255]">{failure}</p>}
      <div className="mt-6 flex flex-wrap gap-3"><button type="submit" disabled={pending} className={`${button} bg-linear-[165deg,#273238,#1a2329] text-white`}><img src="/assets/figma/faculty-check.svg" width="16" height="16" alt="" />{pending ? 'Confirming…' : 'Confirm Enrollment'}</button><button type="button" onClick={close} disabled={pending} className={`${button} border-[1.25px] border-[#e5e8f0] text-[#68728a]`}>Cancel</button></div>
      {discard && <div role="alert" className="mt-4 rounded-xl border border-[#e5e8f0] p-3 text-sm"><p>Discard your enrollment selections?</p><div className="mt-2 flex gap-3"><button type="button" onClick={() => setDiscard(false)} className={`${button} border border-[#e5e8f0]`}>Keep editing</button><button type="button" onClick={onClose} className={`${button} bg-[#273238] text-white`}>Discard</button></div></div>}
    </form>
  </Modal>
}
