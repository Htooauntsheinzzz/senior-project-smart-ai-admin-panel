import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { initialFaculties } from '../../data/faculties'
import { courseDepartmentOptions, courseProgramOptions, courseTermOptions, courseYearOptions, createDemoCourse, emptyCourseDraft, updateCourseDraft, validateCourseDraft, type CourseDraft } from '../../utils/addCourse'
import { filterCourses } from '../../utils/courses'
import type { CourseCatalogContext } from './courseCatalogContext'
import Modal from '../ui/Modal'

function Section({ title, icon, children }: { title: string; icon: string; children: ReactNode }) {
  return <section aria-label={title} className="overflow-hidden rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white"><header className="flex items-center gap-3 border-b-[1.25px] border-[#e5e8f0] bg-[#fafbfc] px-4 py-5 sm:px-6"><span aria-hidden="true">{icon}</span><h2 className="font-display text-[15px] leading-[22.5px] font-bold">{title}</h2></header><div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6">{children}</div></section>
}

export default function AddCourseContent() {
  const { courses, setCourses, state, retry, filters, setMessage } = useOutletContext<CourseCatalogContext>()
  const navigate = useNavigate()
  const [value, setValue] = useState({ ...emptyCourseDraft })
  const [errors, setErrors] = useState<Partial<Record<keyof CourseDraft, string>>>({})
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState('')
  const [discard, setDiscard] = useState(false)
  const lock = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  const dirty = Object.keys(emptyCourseDraft).some(key => value[key as keyof CourseDraft] !== emptyCourseDraft[key as keyof CourseDraft])
  useEffect(() => {
    if (!dirty) return
    function beforeUnload(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [dirty])
  function leave() { if (lock.current) return; if (dirty) setDiscard(true); else navigate('/admin/courses') }
  function update(key: keyof CourseDraft, next: string) {
    setValue(previous => updateCourseDraft(previous, key, next))
    setErrors(previous => ({ ...previous, [key]: undefined, ...(key === 'facultyId' ? { departmentId: undefined, programId: undefined } : key === 'departmentId' ? { programId: undefined } : {}) }))
    setFailure('')
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (lock.current || state !== 'ready') return
    const next = validateCourseDraft(value, courses)
    setErrors(next)
    if (Object.keys(next).length) { setFailure('Please correct the highlighted fields.'); requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]:not(:disabled)')?.focus()); return }
    lock.current = true; setPending(true)
    try {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
      const course = createDemoCourse(value, courses)
      setCourses(previous => [...previous, course])
      setMessage(`${course.code} saved to the local demo catalog with zero sections.${filterCourses([course], filters).length ? '' : ' Your current filters hide this course.'} No server record was created.`)
      navigate('/admin/courses')
    } catch { setFailure('Unable to save the local course. Your entries have been kept. Please try again.'); setPending(false); lock.current = false }
  }
  type FieldOptions = { required?: boolean; full?: boolean; numeric?: boolean; multiline?: boolean; disabled?: boolean; choices?: { value: string; label: string }[] }
  function field(key: keyof CourseDraft, label: string, placeholder: string, options: FieldOptions = {}) {
    const error = errors[key]
    const attrs = { id: `new-course-${key}`, name: key, value: value[key], required: options.required, disabled: options.disabled || pending, 'aria-invalid': !!error, 'aria-describedby': error ? `new-course-${key}-error` : undefined, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => update(key, event.target.value) }
    const control = `w-full min-w-0 rounded-xl border-[1.25px] bg-white px-3.5 text-[13.5px] text-[#17213c] placeholder:text-[#17213c]/50 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${error ? 'border-[#ef4355]' : 'border-[#e5e8f0]'}`
    return <div className={`min-w-0 ${options.full ? 'sm:col-span-2' : ''}`}><label htmlFor={attrs.id} className="mb-1.5 block text-[12.5px] leading-[18.75px] font-semibold">{label}{options.required && <span aria-hidden="true" className="ml-0.5 text-[#ef4355]">*</span>}</label>
      {options.choices ? <div className="relative"><select {...attrs} className={`${control} h-[39px] appearance-none pr-9`}>{placeholder && <option value="">{placeholder}</option>}{options.choices.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><img src="/assets/figma/department-select-arrow.svg" width="10" height="6" alt="" className={`pointer-events-none absolute top-4 right-3.5 ${options.disabled ? 'opacity-50' : ''}`} /></div> : options.multiline ? <textarea {...attrs} placeholder={placeholder} className={`${control} min-h-[83px] resize-y py-3`} /> : <input {...attrs} type={options.numeric ? 'number' : 'text'} min={options.numeric ? key === 'maxStudents' ? 1 : 0 : undefined} step={options.numeric ? 1 : undefined} placeholder={placeholder} className={`${control} h-[43px]`} />}
      {error && <p id={`new-course-${key}-error`} className="mt-1.5 text-xs text-[#ef4355]">{error}</p>}
    </div>
  }
  const departments = courseDepartmentOptions.filter(item => item.facultyId === value.facultyId)
  const programs = courseProgramOptions(value.facultyId, value.departmentId)
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] leading-[20.25px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'
  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-[1.25px] border-[#e5e8f0] px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Add Course</h1><p className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">Create a new course in the academic catalog.</p></div><button type="button" onClick={leave} disabled={pending} className="inline-flex items-center gap-2 rounded-xl border-[1.25px] border-[#e5e8f0] px-4 py-2 text-[13px] font-semibold text-[#68728a] focus-visible:outline-2"><img src="/assets/figma/course-back.svg" width="14" height="14" alt="" />Back to Courses</button></header>
    <form ref={form} onSubmit={submit} noValidate className="px-4 pt-5 pb-6 sm:px-7">
      {state === 'loading' && <p role="status" className="mb-4 text-sm text-[#68728a]">Loading course catalog…</p>}
      {state === 'error' && <div role="alert" className="mb-4 text-sm text-[#68728a]">Unable to load the course catalog. <button type="button" onClick={retry} className="rounded px-2 py-1 font-semibold underline focus-visible:outline-2">Retry</button></div>}
      <fieldset disabled={pending || state !== 'ready'} className="min-w-0 space-y-5">
        <Section title="Basic Information" icon="📋">
          {field('code', 'Course Code', 'e.g. CS301', { required: true })}
          {field('credits', 'Credit Hours', 'e.g. 3', { required: true, numeric: true })}
          {field('name', 'Course Name', 'e.g. Data Structures & Algorithms', { required: true, full: true })}
          {field('description', 'Course Description', 'Brief description of the course content and objectives…', { multiline: true, full: true })}
        </Section>
        <Section title="Academic Classification" icon="🎓">
          {field('facultyId', 'Faculty', 'Select faculty…', { required: true, choices: initialFaculties.map(item => ({ value: item.id, label: item.nameEn.replace(/^Faculty of /, '') })) })}
          {field('departmentId', 'Department', 'Select department…', { required: true, disabled: !value.facultyId, choices: departments.map(item => ({ value: item.id, label: item.name })) })}
          {field('programId', 'Program', 'Select program…', { disabled: !value.departmentId, choices: programs.map(item => ({ value: item.id, label: item.name })) })}
          {field('year', 'Recommended Academic Year', 'Select year…', { choices: courseYearOptions.map(year => ({ value: year, label: `Year ${year}` })) })}
          {field('term', 'Semester', 'Select semester…', { choices: courseTermOptions.map(term => ({ value: term, label: `Sem ${term}` })) })}
          {value.departmentId && !programs.length && <p className="text-xs leading-5 text-[#68728a]">No programs are available for this department in the demo. Program is optional.</p>}
        </Section>
        <Section title="Requirements" icon="📎">
          {field('prerequisites', 'Prerequisite Courses', 'e.g. CS101, CS201 (comma-separated course codes)', { full: true })}
          {field('type', 'Course Type', '', { choices: ['Required', 'Elective'].map(type => ({ value: type, label: type })) })}
          {field('maxStudents', 'Maximum Students per Section', 'e.g. 50', { numeric: true })}
        </Section>
        <Section title="Status" icon="⚡"><fieldset className="sm:col-span-2"><legend className="sr-only">Course status</legend><div className="flex gap-6">{['active', 'inactive'].map(status => <label key={status} className="flex items-center gap-2.5 text-[13.5px] font-semibold"><input type="radio" name="status" checked={value.status === status} onChange={() => update('status', status)} className="size-5 appearance-none rounded-full border border-[#e5e8f0] bg-white checked:border-[6px] checked:border-[#273238] focus-visible:outline-2 focus-visible:outline-offset-2" />{status === 'active' ? 'Active' : 'Inactive'}</label>)}</div></fieldset></Section>
      </fieldset>
      <div className="flex flex-wrap gap-3 pt-5"><button type="submit" disabled={pending || state !== 'ready'} className={`${button} bg-linear-[165deg,#273238,#1a2329] text-white`}><img src="/assets/figma/faculty-check.svg" width="14" height="14" alt="" />{pending ? 'Saving…' : 'Save Course'}</button><button type="button" onClick={leave} disabled={pending} className={`${button} border-[1.25px] border-[#e5e8f0] text-[#68728a]`}>Cancel</button></div>
      <p role="alert" className="mt-3 text-sm text-[#ef4355]">{failure}</p><p className="mt-3 text-xs leading-5 text-[#68728a]">Demo mode: options and prerequisite checks use local data. Saving adds a local catalog record only; changes reset when you leave Courses or reload.</p>
    </form>
    {discard && <Modal title="Discard course details?" onClose={() => setDiscard(false)}><p className="text-sm text-[#68728a]">Your unsaved changes will be lost.</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setDiscard(false)} className={`${button} border border-[#e5e8f0]`}>Keep editing</button><button type="button" onClick={() => navigate('/admin/courses')} className={`${button} bg-[#273238] text-white`}>Discard changes</button></div></Modal>}
  </main>
}
