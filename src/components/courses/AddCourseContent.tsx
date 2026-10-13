import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import type { ApiCourse } from '../../services/courseService'
import type { CourseDraft } from '../../types/course'
import type { CourseCatalogContext } from './courseCatalogContext'
import { createCourse, updateCourse } from '../../services/courseService'
import { courseError, validateCourseForm } from '../../utils/courseApi'
import { filterCourses } from '../../utils/courses'
import Modal from '../ui/Modal'

function Section({ title, icon, children }: { title: string; icon: string; children: ReactNode }) {
  return <section aria-label={title} className="overflow-hidden rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white"><header className="flex items-center gap-3 border-b-[1.25px] border-[#e5e8f0] bg-[#fafbfc] px-4 py-5 sm:px-6"><span aria-hidden="true">{icon}</span><h2 className="font-display text-[15px] leading-[22.5px] font-bold">{title}</h2></header><div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6">{children}</div></section>
}

const emptyCourseDraft: CourseDraft = { code: '', credits: '', name: '', description: '', facultyId: '', departmentId: '', programId: '', year: '', term: '', prerequisites: '', type: 'Required', maxStudents: '', status: 'active' }

export default function AddCourseContent() {
  const { state, retry, filters, setMessage, faculties, departments, programs, semesters } = useOutletContext<CourseCatalogContext>()
  const navigate = useNavigate()
  const location = useLocation()
  const editCourse = (location.state as { editCourse?: ApiCourse } | null)?.editCourse
  const isEditing = !!editCourse

  const initial: CourseDraft = editCourse ? {
    code: editCourse.code,
    credits: String(editCourse.credits),
    name: editCourse.name,
    description: editCourse.description ?? '',
    facultyId: editCourse.facultyId,
    departmentId: editCourse.departmentId,
    programId: editCourse.programId ?? '',
    year: editCourse.curriculumYear == null ? '' : String(editCourse.curriculumYear),
    term: editCourse.semesterId ?? '',
    prerequisites: editCourse.prerequisiteCourses ?? '',
    type: editCourse.courseType === 300 ? 'Required' : 'Elective',
    maxStudents: editCourse.maxStudentsPerSection == null ? '' : String(editCourse.maxStudentsPerSection),
    status: editCourse.status,
  } : { ...emptyCourseDraft }

  const [value, setValue] = useState<CourseDraft>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof CourseDraft, string>>>({})
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState('')
  const [discard, setDiscard] = useState(false)
  const lock = useRef(false)
  const form = useRef<HTMLFormElement>(null)

  const dirty = (Object.keys(initial) as (keyof CourseDraft)[]).some(key => value[key] !== initial[key])

  useEffect(() => {
    if (!dirty) return
    function beforeUnload(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [dirty])

  function leave() { if (lock.current) return; if (dirty) setDiscard(true); else navigate('/admin/courses') }

  function update(key: keyof CourseDraft, next: string) {
    setValue(previous => {
      const result = { ...previous, [key]: next }
      if (key === 'facultyId') {
        const deptOk = departments.some(d => d.id === result.departmentId && d.facultyId === next)
        if (!deptOk) { result.departmentId = ''; result.programId = '' }
      }
      if ((key === 'facultyId' || key === 'departmentId') && result.departmentId) {
        const progOk = programs.some(p => p.id === result.programId && p.departmentId === result.departmentId)
        if (!progOk) result.programId = ''
      }
      return result
    })
    setErrors(previous => ({ ...previous, [key]: undefined, ...(key === 'facultyId' ? { departmentId: undefined, programId: undefined } : key === 'departmentId' ? { programId: undefined } : {}) }))
    setFailure('')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (lock.current || state !== 'ready') return
    const next = validateCourseForm(value)
    setErrors(next)
    if (Object.keys(next).length) { setFailure('Please correct the highlighted fields.'); requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]:not(:disabled)')?.focus()); return }
    lock.current = true; setPending(true)
    try {
      if (isEditing && editCourse) await updateCourse(editCourse.id, value)
      else await createCourse(value)
      const operation = isEditing ? 'updated' : 'created'
      setMessage(`${value.code.trim()} was ${operation} successfully.${!filterCourses([{ id: 'x', code: value.code, name: value.name, credits: Number(value.credits), departmentId: value.departmentId, departmentName: '', facultyId: value.facultyId, facultyName: '', programIds: value.programId ? [value.programId] : [], curriculumYear: value.year ? Number(value.year) : null, semester: '', academicYear: '', sectionCount: 0, type: value.type as 'Required' | 'Elective', status: value.status as 'active' | 'inactive' }], filters).length ? ' Your current filters hide this course.' : ''} Refreshing server data.`)
      navigate('/admin/courses')
    } catch (error) {
      const err = courseError(error)
      setFailure(err.message); setErrors(err.fields)
      setPending(false); lock.current = false
    }
  }

  type FieldKey = 'code' | 'credits' | 'name' | 'description' | 'facultyId' | 'departmentId' | 'programId' | 'year' | 'term' | 'prerequisites' | 'type' | 'maxStudents' | 'status'
  type FieldOptions = { required?: boolean; full?: boolean; numeric?: boolean; multiline?: boolean; disabled?: boolean; choices?: { value: string; label: string }[] }
  function field(key: FieldKey, label: string, placeholder: string, options: FieldOptions = {}) {
    const error = errors[key]
    const inputId = `new-course-${key}`
    const inputValue = value[key]
    const inputName = key
    const errorId = error ? `new-course-${key}-error` : undefined
    const control = `w-full min-w-0 rounded-xl border-[1.25px] bg-white px-3.5 text-[13.5px] text-[#17213c] placeholder:text-[#17213c]/50 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${error ? 'border-[#ef4355]' : 'border-[#e5e8f0]'}`
    return <div className={`min-w-0 ${options.full ? 'sm:col-span-2' : ''}`}><label htmlFor={inputId} className="mb-1.5 block text-[12.5px] leading-[18.75px] font-semibold">{label}{options.required && <span aria-hidden="true" className="ml-0.5 text-[#ef4355]">*</span>}</label>
      {options.choices ? <div className="relative"><select id={inputId} name={inputName} value={inputValue} required={options.required} disabled={options.disabled || pending} aria-invalid={!!error} aria-describedby={errorId} onChange={event => update(key, event.target.value)} className={`${control} h-[39px] appearance-none pr-9`}>{placeholder && <option value="">{placeholder}</option>}{options.choices.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><img src="/assets/figma/department-select-arrow.svg" width="10" height="6" alt="" className={`pointer-events-none absolute top-4 right-3.5 ${options.disabled ? 'opacity-50' : ''}`} /></div> : options.multiline ? <textarea id={inputId} name={inputName} value={inputValue} required={options.required} disabled={options.disabled || pending} aria-invalid={!!error} aria-describedby={errorId} onChange={event => update(key, event.target.value)} placeholder={placeholder} className={`${control} min-h-[83px] resize-y py-3`} /> : <input id={inputId} name={inputName} value={inputValue} required={options.required} disabled={options.disabled || pending} aria-invalid={!!error} aria-describedby={errorId} onChange={event => update(key, event.target.value)} type={options.numeric ? 'number' : 'text'} min={options.numeric ? key === 'maxStudents' ? 1 : 0 : undefined} step={options.numeric ? 1 : undefined} placeholder={placeholder} className={`${control} h-[43px]`} />}
      {error && <p id={errorId} className="mt-1.5 text-xs text-[#ef4355]">{error}</p>}
    </div>
  }

  const filteredDepartments = departments.filter(d => d.facultyId === value.facultyId && d.status === 'active')
  const filteredPrograms = programs.filter(p => p.departmentId === value.departmentId && p.status === 'active')
  const yearOptions = ['1', '2', '3', '4', '5', '6']
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] leading-[20.25px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'

  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-[1.25px] border-[#e5e8f0] px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">{isEditing ? 'Edit Course' : 'Add Course'}</h1><p className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">{isEditing ? 'Update course details in the academic catalog.' : 'Create a new course in the academic catalog.'}</p></div><button type="button" onClick={leave} disabled={pending} className="inline-flex items-center gap-2 rounded-xl border-[1.25px] border-[#e5e8f0] px-4 py-2 text-[13px] font-semibold text-[#68728a] focus-visible:outline-2"><img src="/assets/figma/course-back.svg" width="14" height="14" alt="" />Back to Courses</button></header>
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
          {field('facultyId', 'Faculty', 'Select faculty…', { required: true, choices: faculties.map(item => ({ value: item.id, label: item.nameEn.replace(/^Faculty of /, '') })) })}
          {field('departmentId', 'Department', 'Select department…', { required: true, disabled: !value.facultyId, choices: filteredDepartments.map(item => ({ value: item.id, label: item.name })) })}
          {field('programId', 'Program', 'Select program…', { disabled: !value.departmentId, choices: filteredPrograms.map(item => ({ value: item.id, label: item.name })) })}
          {field('year', 'Recommended Academic Year', 'Select year…', { choices: yearOptions.map(year => ({ value: year, label: `Year ${year}` })) })}
          {field('term', 'Semester', 'Select semester…', { choices: semesters.map(s => ({ value: s.id, label: s.semesterNameEn })) })}
          {value.departmentId && !filteredPrograms.length && <p className="text-xs leading-5 text-[#68728a]">No programs are available for this department. Program is optional.</p>}
        </Section>
        <Section title="Requirements" icon="📎">
          {field('prerequisites', 'Prerequisite Courses', 'e.g. CS101, CS201 (comma-separated course codes)', { full: true })}
          {field('type', 'Course Type', '', { choices: ['Required', 'Elective'].map(type => ({ value: type, label: type })) })}
          {field('maxStudents', 'Maximum Students per Section', 'e.g. 50', { numeric: true })}
        </Section>
        <Section title="Status" icon="⚡"><fieldset className="sm:col-span-2"><legend className="sr-only">Course status</legend><div className="flex gap-6">{['active', 'inactive'].map(status => <label key={status} className="flex items-center gap-2.5 text-[13.5px] font-semibold"><input type="radio" name="status" checked={value.status === status} onChange={() => update('status', status)} className="size-5 appearance-none rounded-full border border-[#e5e8f0] bg-white checked:border-[6px] checked:border-[#273238] focus-visible:outline-2 focus-visible:outline-offset-2" />{status === 'active' ? 'Active' : 'Inactive'}</label>)}</div></fieldset></Section>
      </fieldset>
      <div className="flex flex-wrap gap-3 pt-5"><button type="submit" disabled={pending || state !== 'ready'} className={`${button} bg-linear-[165deg,#273238,#1a2329] text-white`}><img src="/assets/figma/faculty-check.svg" width="14" height="14" alt="" />{pending ? 'Saving…' : isEditing ? 'Update Course' : 'Save Course'}</button><button type="button" onClick={leave} disabled={pending} className={`${button} border-[1.25px] border-[#e5e8f0] text-[#68728a]`}>Cancel</button></div>
      <p role="alert" className="mt-3 text-sm text-[#ef4355]">{failure}</p>
    </form>
    {discard && <Modal title="Discard course details?" onClose={() => setDiscard(false)}><p className="text-sm text-[#68728a]">Your unsaved changes will be lost.</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setDiscard(false)} className={`${button} border border-[#e5e8f0]`}>Keep editing</button><button type="button" onClick={() => navigate('/admin/courses')} className={`${button} bg-[#273238] text-white`}>Discard changes</button></div></Modal>}
  </main>
}
