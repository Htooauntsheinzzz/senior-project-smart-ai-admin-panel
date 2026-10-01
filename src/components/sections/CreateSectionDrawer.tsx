import { useRef, useState, type FormEvent } from 'react'
import { initialCourses } from '../../data/courses'
import { sectionLecturers, sectionSemesters, sectionYears } from '../../data/courseSections'
import type { CourseSection, SectionDraft } from '../../types/courseSection'
import { emptySectionDraft, validateSection } from '../../utils/courseSections'
import Drawer from '../ui/Drawer'
import Modal from '../ui/Modal'

export default function CreateSectionDrawer({ sections, onCreate, onClose }: { sections: CourseSection[]; onCreate: (value: SectionDraft) => void | Promise<void>; onClose: () => void }) {
  const [value, setValue] = useState({ ...emptySectionDraft })
  const [errors, setErrors] = useState<Partial<Record<keyof SectionDraft, string>>>({})
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState('')
  const [discard, setDiscard] = useState(false)
  const lock = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  function close() {
    if (lock.current) return
    if (Object.keys(emptySectionDraft).some(key => value[key as keyof SectionDraft] !== emptySectionDraft[key as keyof SectionDraft])) setDiscard(true)
    else onClose()
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (lock.current) return
    const next = validateSection(value, sections)
    setErrors(next)
    if (Object.keys(next).length) { requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return }
    lock.current = true; setPending(true)
    try { await new Promise<void>(resolve => requestAnimationFrame(() => resolve())); await onCreate(value) }
    catch { setFailure('Unable to create the section. Your entries have been kept. Please try again.'); setPending(false); lock.current = false }
  }
  const fields: { key: keyof SectionDraft; label: string; placeholder: string; required?: boolean; full?: boolean; numeric?: boolean; options?: { value: string; label: string }[] }[] = [
    { key: 'courseId', label: 'Course', placeholder: 'Select a course…', required: true, full: true, options: initialCourses.map(course => ({ value: course.id, label: `${course.code} — ${course.name}` })) },
    { key: 'number', label: 'Section Number', placeholder: 'e.g. 01', required: true },
    { key: 'capacity', label: 'Capacity', placeholder: '50', numeric: true },
    { key: 'lecturerId', label: 'Lecturer', placeholder: 'Select a lecturer…', required: true, full: true, options: sectionLecturers.map(item => ({ value: item.id, label: item.name })) },
    { key: 'room', label: 'Room', placeholder: 'e.g. IT-301', full: true },
    { key: 'schedule', label: 'Schedule', placeholder: 'e.g. Mon/Wed 09:00–10:30', full: true },
    { key: 'semester', label: 'Semester', placeholder: '', options: sectionSemesters.map(semester => ({ value: semester, label: `Semester ${semester}` })) },
    { key: 'academicYear', label: 'Academic Year', placeholder: '', options: sectionYears.map(year => ({ value: year, label: year })) },
  ]
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] leading-[20.25px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'
  return <>
    <Drawer width={480} title="Create Section" description="Add a new section to an existing course." busy={pending} onClose={close} footer={<><button type="submit" form="create-section-form" disabled={pending} className={`${button} bg-linear-[165deg,#273238,#1a2329] text-white`}><img src="/assets/figma/faculty-check.svg" width="14" height="14" alt="" />{pending ? 'Creating…' : 'Create Section'}</button><button type="button" onClick={close} disabled={pending} className={`${button} border-[1.25px] border-[#e5e8f0]`}>Cancel</button></>}>
      <form id="create-section-form" ref={form} onSubmit={submit} noValidate><fieldset disabled={pending} className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2">
        {fields.map(field => {
          const error = errors[field.key]
          const attrs = { id: `section-${field.key}`, name: field.key, required: field.required, value: value[field.key], 'aria-invalid': !!error, 'aria-describedby': error ? `section-${field.key}-error` : undefined, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setValue(previous => ({ ...previous, [field.key]: event.target.value })); setErrors(previous => ({ ...previous, [field.key]: undefined })); setFailure('') } }
          const control = `w-full min-w-0 rounded-xl border-[1.25px] bg-white px-3.5 text-[13.5px] placeholder:text-[#17213c]/50 focus-visible:outline-2 focus-visible:outline-offset-2 ${error ? 'border-[#d80255]' : 'border-[#e5e8f0]'}`
          return <div key={field.key} className={`min-w-0 ${field.full ? 'min-[400px]:col-span-2' : ''}`}><label htmlFor={attrs.id} className="mb-1.5 block text-[12.5px] leading-[18.75px] font-semibold">{field.label}{field.required && <span aria-hidden="true" className="ml-0.5 text-[#d80255]">*</span>}</label>
            {field.options ? <div className="relative"><select {...attrs} className={`${control} h-[39px] appearance-none pr-8`}>{field.placeholder && <option value="">{field.placeholder}</option>}{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><img src="/assets/figma/department-select-arrow.svg" width="10" height="6" alt="" className="pointer-events-none absolute top-4 right-3.5" /></div> : <input {...attrs} type={field.numeric ? 'number' : 'text'} min={field.numeric ? 1 : undefined} step={field.numeric ? 1 : undefined} inputMode={field.key === 'number' ? 'numeric' : undefined} placeholder={field.placeholder} className={`${control} h-[43px]`} />}
            {error && <p id={`section-${field.key}-error`} className="mt-1.5 text-xs text-[#d80255]">{error}</p>}
          </div>
        })}
        <fieldset className="min-[400px]:col-span-2"><legend className="mb-2 text-[12.5px] leading-[18.75px] font-semibold">Status</legend><div className="flex gap-4">{(['active', 'closed'] as const).map(status => <label key={status} className="flex items-center gap-2.5 text-[13.5px] font-semibold"><input type="radio" name="status" checked={value.status === status} onChange={() => setValue(previous => ({ ...previous, status }))} className="size-5 appearance-none rounded-full border border-[#e5e8f0] bg-white checked:border-[6px] checked:border-[#273238] focus-visible:outline-2 focus-visible:outline-offset-2" />{status === 'active' ? 'Active' : 'Closed'}</label>)}</div></fieldset>
      </fieldset><p role="alert" className="mt-4 text-xs leading-5 text-[#d80255]">{failure}</p></form>
    </Drawer>
    {discard && <Modal title="Discard section details?" onClose={() => setDiscard(false)}><p className="text-sm text-[#68728a]">Your unsaved changes will be lost.</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setDiscard(false)} className={`${button} border border-[#e5e8f0]`}>Keep editing</button><button type="button" onClick={onClose} className={`${button} bg-[#273238] text-white`}>Discard changes</button></div></Modal>}
  </>
}
