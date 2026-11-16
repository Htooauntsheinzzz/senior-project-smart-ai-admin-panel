import { useEffect, useRef, useState, type FormEvent } from 'react'
import { getLecturerDirectory, type ApiLecturer } from '../../services/lecturerService'
import type { ApiSection } from '../../services/sectionService'
import type { Semester } from '../../services/courseService'
import type { SectionDraft } from '../../types/courseSection'
import { applySectionTermChange, sectionError, sectionTermOptions, validateSectionForm } from '../../utils/sectionApi'
import { getAcademicTerms } from '../../services/timetableService'
import type { AcademicTerm } from '../../types/timetable'
import Drawer from '../ui/Drawer'
import Modal from '../ui/Modal'

export default function CreateSectionDrawer({ section, courses, semesters, onSave, onClose }: { section?: ApiSection; courses: { id: string; code: string; name: string }[]; semesters: Semester[]; onSave: (value: SectionDraft) => void | Promise<void>; onClose: () => void }) {
  const isEdit = !!section
  const [lecturers, setLecturers] = useState<ApiLecturer[]>()
  const [lecturerError, setLecturerError] = useState('')
  const [lecturerAttempt, setLecturerAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    getLecturerDirectory({ query: '', facultyId: '', departmentId: '', status: 'active' }, controller.signal).then(rows => {
      if (!controller.signal.aborted) { setLecturers(rows); setLecturerError('') }
    }).catch(() => { if (!controller.signal.aborted) setLecturerError('Unable to load lecturers. Please retry.') })
    return () => controller.abort()
  }, [lecturerAttempt])
  // Academic terms (spec 40): optional on a section, but required before it can be scheduled on the timetable.
  const [terms, setTerms] = useState<AcademicTerm[]>()
  const [termError, setTermError] = useState('')
  const [termAttempt, setTermAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    getAcademicTerms(controller.signal).then(rows => { if (!controller.signal.aborted) { setTerms(rows); setTermError('') } })
      .catch(() => { if (!controller.signal.aborted) setTermError('Unable to load academic terms. Please retry.') })
    return () => controller.abort()
  }, [termAttempt])
  const lecturerOptions = (lecturers ?? []).map(lecturer => ({ value: lecturer.id, label: `${lecturer.nameEn || lecturer.nameTh}${lecturer.nickname ? ` (${lecturer.nickname})` : ''}` }))
  if (section && !lecturerOptions.some(option => option.value === section.lectureId)) lecturerOptions.push({ value: section.lectureId, label: `${section.lectureNameEn || section.lectureNameTh} (current assignment)` })
  const courseOptions = courses.map(course => ({ value: course.id, label: `${course.code} — ${course.name}` }))
  if (section && !courses.some(course => course.id === section.courseId)) courseOptions.push({ value: section.courseId, label: `${section.courseCode} — ${section.courseName} (current assignment)` })
  const semesterOptions = semesters.map(semester => ({ value: semester.id, label: semester.semesterNameEn || semester.semesterNameTh }))
  if (section && !semesters.some(semester => semester.id === section.semesterId)) semesterOptions.push({ value: section.semesterId, label: section.semesterNameEn || section.semesterNameTh })
  const initial: SectionDraft = section ? {
    courseId: section.courseId,
    number: section.sectionNumber,
    capacity: String(section.capacity),
    lecturerId: section.lectureId,
    semester: section.semesterId,
    academicYear: '',
    academicTermId: section.academicTermId ?? '',
    status: section.status === 'ACTIVE' ? 'active' : 'closed',
  } : {
    courseId: '', number: '', capacity: '', lecturerId: '', semester: '', academicYear: '', academicTermId: '', status: 'active',
  }
  const [value, setValue] = useState<SectionDraft>({ ...initial })
  const [errors, setErrors] = useState<Partial<Record<keyof SectionDraft, string>>>({})
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState('')
  const [discard, setDiscard] = useState(false)
  const lock = useRef(false)
  const form = useRef<HTMLFormElement>(null)

  function close() {
    if (lock.current) return
    if (Object.keys(initial).some(key => value[key as keyof SectionDraft] !== initial[key as keyof SectionDraft])) setDiscard(true)
    else onClose()
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (lock.current) return
    const next = validateSectionForm(value, isEdit)
    setErrors(next)
    if (Object.keys(next).length) { requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return }
    lock.current = true; setPending(true); setFailure('')
    try { await onSave(value) }
    catch (error) {
      const mapped = sectionError(error)
      setErrors(previous => ({ ...previous, ...mapped.fields }))
      setFailure(mapped.message)
      lock.current = false; setPending(false)
    }
  }

  // The term select is always enabled: picking a term fills in its semester, picking a semester narrows the terms.
  const termOptions = sectionTermOptions(terms ?? [], value.semester, section)
  const fields: { key: keyof SectionDraft; label: string; placeholder: string; required?: boolean; full?: boolean; numeric?: boolean; disabled?: boolean; options?: { value: string; label: string }[] }[] = [
    { key: 'courseId', label: 'Course', placeholder: 'Select a course…', required: true, full: true, options: courseOptions },
    { key: 'number', label: 'Section Number', placeholder: 'e.g. 01', required: true },
    { key: 'capacity', label: 'Capacity', placeholder: '50', numeric: true },
    { key: 'lecturerId', label: 'Lecturer', placeholder: !lecturers && !lecturerError ? 'Loading lecturers…' : 'Select a lecturer…', required: true, full: true, options: lecturerOptions },
    { key: 'semester', label: 'Semester', placeholder: 'Select a semester…', required: true, full: true, options: semesterOptions },
    { key: 'academicTermId', label: 'Academic Term', placeholder: !terms && !termError ? 'Loading academic terms…' : !termOptions.length ? (value.semester ? 'No terms exist for this semester yet' : 'No academic terms exist yet') : 'No academic term (not on the timetable)', full: true, options: termOptions },
  ]

  const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] leading-[20.25px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'

  return <>
    <Drawer width={480} title={isEdit ? 'Edit Section' : 'Create Section'} description={isEdit ? 'Update the section details.' : 'Add a new section to an existing course.'} busy={pending} onClose={close} footer={<>
      <button type="submit" form="section-form" disabled={pending} className={`${button} bg-linear-[165deg,#273238,#1a2329] text-white`}><img src="/assets/figma/faculty-check.svg" width="14" height="14" alt="" />{pending ? (isEdit ? 'Updating…' : 'Creating…') : (isEdit ? 'Update Section' : 'Create Section')}</button>
      <button type="button" onClick={close} disabled={pending} className={`${button} border-[1.25px] border-[#e5e8f0]`}>Cancel</button>
    </>}>
      <form id="section-form" ref={form} onSubmit={submit} noValidate><fieldset disabled={pending} className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2">
        {fields.map(field => {
          const error = errors[field.key]
          const attrs = { id: `section-${field.key}`, name: field.key, required: field.required, disabled: field.disabled, value: value[field.key], 'aria-invalid': !!error, 'aria-describedby': error ? `section-${field.key}-error` : field.key === 'academicTermId' ? 'section-academicTermId-hint' : undefined, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const next = event.target.value
            setValue(previous => applySectionTermChange(previous, field.key, next, terms ?? []))
            setErrors(previous => ({ ...previous, [field.key]: undefined, ...(field.key === 'semester' ? { academicTermId: undefined } : field.key === 'academicTermId' ? { semester: undefined } : {}) })); setFailure('')
          } }
          const control = `w-full min-w-0 rounded-xl border-[1.25px] bg-white px-3.5 text-[13.5px] placeholder:text-[#17213c]/50 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:bg-[#f7f8fc] disabled:text-[#68728a] ${error ? 'border-[#d80255]' : 'border-[#e5e8f0]'}`
          return <div key={field.key} className={`min-w-0 ${field.full ? 'min-[400px]:col-span-2' : ''}`}><label htmlFor={attrs.id} className="mb-1.5 block text-[12.5px] leading-[18.75px] font-semibold">{field.label}{field.required && <span aria-hidden="true" className="ml-0.5 text-[#d80255]">*</span>}</label>
            {field.options ? <div className="relative"><select {...attrs} className={`${control} h-[39px] appearance-none pr-8`}>{field.placeholder && <option value="">{field.placeholder}</option>}{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><img src="/assets/figma/department-select-arrow.svg" width="10" height="6" alt="" className="pointer-events-none absolute top-4 right-3.5" /></div> : <input {...attrs} type={field.numeric ? 'number' : 'text'} min={field.numeric ? 1 : undefined} step={field.numeric ? 1 : undefined} inputMode={field.key === 'number' ? 'numeric' : undefined} placeholder={field.placeholder} className={`${control} h-[43px]`} />}
            {error && <p id={`section-${field.key}-error`} className="mt-1.5 text-xs text-[#d80255]">{error}</p>}
            {field.key === 'lecturerId' && (lecturerError ? <p role="alert" className="mt-1.5 text-xs text-[#d80255]">{lecturerError} <button type="button" onClick={() => { setLecturerError(''); setLecturerAttempt(attempt => attempt + 1) }} className="underline focus-visible:outline-2">Retry</button></p> : lecturers?.length === 0 ? <p role="status" className="mt-1.5 text-xs text-[#68728a]">No active lecturers available.</p> : null)}
            {field.key === 'academicTermId' && (termError ? <p role="alert" className="mt-1.5 text-xs text-[#d80255]">{termError} <button type="button" onClick={() => { setTermError(''); setTermAttempt(attempt => attempt + 1) }} className="underline focus-visible:outline-2">Retry</button></p> : <p id="section-academicTermId-hint" className="mt-1.5 text-xs text-[#68728a]">Optional here, but a section needs an academic term before it can be scheduled. Picking a term also sets its semester. Terms are managed under Timetable › Academic Terms.</p>)}
            {field.key !== 'lecturerId' && field.key !== 'academicTermId' && field.options && !field.options.length && <p role="status" className="mt-1.5 text-xs text-[#68728a]">No options available yet. Check lookup loading or retry on the directory.</p>}
          </div>
        })}
        <fieldset className="min-[400px]:col-span-2"><legend className="mb-2 text-[12.5px] leading-[18.75px] font-semibold">Status</legend><div className="flex gap-4">{(['active', 'closed'] as const).map(status => <label key={status} className="flex items-center gap-2.5 text-[13.5px] font-semibold"><input type="radio" name="status" checked={value.status === status} onChange={() => setValue(previous => ({ ...previous, status }))} className="size-5 appearance-none rounded-full border border-[#e5e8f0] bg-white checked:border-[6px] checked:border-[#273238] focus-visible:outline-2 focus-visible:outline-offset-2" />{status === 'active' ? 'Active' : 'Closed'}</label>)}</div></fieldset>
      </fieldset><p role="alert" className="mt-4 text-xs leading-5 text-[#d80255]">{failure}</p></form>
    </Drawer>
    {discard && <Modal title={isEdit ? 'Discard changes?' : 'Discard section details?'} onClose={() => setDiscard(false)}><p className="text-sm text-[#68728a]">Your unsaved changes will be lost.</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setDiscard(false)} className={`${button} border border-[#e5e8f0]`}>Keep editing</button><button type="button" onClick={onClose} className={`${button} bg-[#273238] text-white`}>Discard changes</button></div></Modal>}
  </>
}
