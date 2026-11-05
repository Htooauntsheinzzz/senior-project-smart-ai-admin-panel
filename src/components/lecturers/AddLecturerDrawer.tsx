import { useRef, useState, type FormEvent } from 'react'
import type { ApiDepartment } from '../../services/departmentService'
import type { Faculty } from '../../types/faculty'
import type { LecturerDraft } from '../../types/lecturer'
import type { ApiLecturer } from '../../services/lecturerService'
import { lecturerError, validateLecturerForm } from '../../utils/lecturerApi'
import Drawer from '../ui/Drawer'
import Modal from '../ui/Modal'

export default function AddLecturerDrawer({ lecturer, faculties, departments, onAdd, onClose }: { lecturer?: ApiLecturer; faculties: Faculty[]; departments: ApiDepartment[]; onAdd: (value: LecturerDraft) => Promise<void>; onClose: () => void }) {
  const [initial] = useState<LecturerDraft>(() => lecturer ? {
    nameTh: lecturer.nameTh,
    nameEn: lecturer.nameEn,
    nickname: lecturer.nickname,
    facultyId: lecturer.facultyId,
    departmentId: lecturer.departmentId,
    status: lecturer.status,
  } : { nameTh: '', nameEn: '', nickname: '', facultyId: '', departmentId: '', status: 'active' })
  const [value, setValue] = useState<LecturerDraft>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof LecturerDraft, string>>>({})
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState('')
  const [discard, setDiscard] = useState(false)
  const lock = useRef(false)
  const form = useRef<HTMLFormElement>(null)

  function close() {
    if (lock.current) return
    if ((Object.keys(initial) as (keyof LecturerDraft)[]).some(key => value[key] !== initial[key])) setDiscard(true)
    else onClose()
  }

  function update(key: keyof LecturerDraft, next: string) {
    setValue(previous => {
      if (key === 'facultyId') {
        const compatible = departments.some(d => d.id === previous.departmentId && (!next || d.facultyId === next))
        return { ...previous, facultyId: next, departmentId: compatible ? previous.departmentId : '' }
      }
      return { ...previous, [key]: next }
    })
    setErrors(previous => ({ ...previous, [key]: undefined, ...(key === 'facultyId' ? { departmentId: undefined } : {}) }))
    setFailure('')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (lock.current) return
    const next = validateLecturerForm(value)
    setErrors(next)
    if (Object.keys(next).length) { requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]:not(:disabled)')?.focus()); return }
    lock.current = true; setPending(true)
    try {
      await onAdd(value)
    } catch (error) {
      const failure = lecturerError(error)
      setFailure(failure.message); setErrors(failure.fields)
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]:not(:disabled)')?.focus())
      setPending(false); lock.current = false
    }
  }

  // The backend accepts only active faculties and active departments of the
  // chosen faculty; keep the record's current selection visible when editing.
  const facultyOptions = faculties.filter(f => f.status === 'active' || f.id === initial.facultyId)
  const filteredDepartments = departments.filter(d => d.facultyId === value.facultyId && (d.status === 'active' || d.id === initial.departmentId))
  const fields: { key: keyof LecturerDraft; label: string; placeholder: string; required?: boolean; full?: boolean; disabled?: boolean; options?: { value: string; label: string }[] }[] = [
    { key: 'nameEn', label: 'Lecturer Name (English)', placeholder: 'e.g. John Derrick', required: true, full: true },
    { key: 'nameTh', label: 'Lecturer Name (Thai)', placeholder: 'e.g. อาจารย์ จอห์น', required: true, full: true },
    { key: 'nickname', label: 'Nickname', placeholder: 'e.g. John', full: true },
    { key: 'facultyId', label: 'Faculty', placeholder: 'Select a faculty…', required: true, full: true, options: facultyOptions.map(faculty => ({ value: faculty.id, label: faculty.nameEn.replace(/^Faculty of /, '') })) },
    { key: 'departmentId', label: 'Department', placeholder: 'Select a department…', required: true, full: true, disabled: !value.facultyId, options: filteredDepartments.map(department => ({ value: department.id, label: department.name })) },
  ]
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] leading-[20.25px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60'
  return <>
    <Drawer width={480} title={lecturer ? 'Edit Lecturer' : 'Add Lecturer'} description={lecturer ? 'Update lecturer details and assignment.' : 'Create a new lecturer record.'} busy={pending} onClose={close} footer={<><button type="submit" form="add-lecturer-form" disabled={pending} className={`${button} bg-linear-[165deg,#273238,#1a2329] text-white`}><img src="/assets/figma/faculty-check.svg" width="14" height="14" alt="" />{pending ? lecturer ? 'Updating…' : 'Creating…' : lecturer ? 'Update Lecturer' : 'Add Lecturer'}</button><button type="button" disabled={pending} onClick={close} className={`${button} border-[1.25px] border-[#e5e8f0]`}>Cancel</button></>}>
      <form ref={form} id="add-lecturer-form" onSubmit={submit} noValidate>
        <fieldset disabled={pending} className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2">
          {fields.map(field => {
            const error = errors[field.key]
            const attrs = { id: `lecturer-${field.key}`, name: field.key, value: value[field.key], required: field.required, disabled: field.disabled || pending, 'aria-invalid': !!error, 'aria-describedby': error ? `lecturer-${field.key}-error` : field.key === 'departmentId' && value.facultyId && !filteredDepartments.length ? 'lecturer-department-empty' : undefined, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => update(field.key, event.target.value) }
            const classes = `w-full min-w-0 rounded-xl border-[1.25px] bg-white px-3.5 text-[13.5px] placeholder:text-[#17213c]/50 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${error ? 'border-[#d80255]' : 'border-[#e5e8f0]'}`
            return <div key={field.key} className={`min-w-0 ${field.full ? 'min-[400px]:col-span-2' : ''}`}><label htmlFor={attrs.id} className="mb-1.5 block text-[12.5px] leading-[18.75px] font-semibold">{field.label}{field.required && <span aria-hidden="true" className="ml-0.5 text-[#d80255]">*</span>}</label>
              {field.options ? <div className="relative"><select {...attrs} className={`${classes} h-[39px] appearance-none pr-8`}>
                <option value="">{field.placeholder}</option>{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select><img src="/assets/figma/department-select-arrow.svg" width="10" height="6" alt="" className={`pointer-events-none absolute top-4 right-3.5 ${field.disabled ? 'opacity-50' : ''}`} /></div> : <input {...attrs} type="text" maxLength={field.key === 'nickname' ? 100 : 255} placeholder={field.placeholder} className={`${classes} h-[43px]`} />}
              {field.key === 'departmentId' && value.facultyId && !filteredDepartments.length && <p id="lecturer-department-empty" className="mt-1.5 text-xs text-[#68728a]">No active departments are available for this faculty.</p>}
              {error && <p id={`lecturer-${field.key}-error`} className="mt-1.5 text-xs text-[#d80255]">{error}</p>}
            </div>
          })}
          <fieldset className="min-[400px]:col-span-2"><legend className="mb-2 text-[12.5px] leading-[18.75px] font-semibold">Status</legend><div className="flex gap-4">{(['active', 'inactive'] as const).map(status => <label key={status} className="flex items-center gap-2.5 text-[13.5px] leading-[20.25px] font-semibold"><input type="radio" name="status" checked={value.status === status} onChange={() => update('status', status)} className="size-5 appearance-none rounded-full border border-[#e5e8f0] bg-white checked:border-[6px] checked:border-[#273238] focus-visible:outline-2 focus-visible:outline-offset-2" />{status === 'active' ? 'Active' : 'Inactive'}</label>)}</div></fieldset>
        </fieldset>
        <p role="alert" className="mt-4 text-xs leading-5 text-[#d80255]">{failure}</p>
      </form>
    </Drawer>
    {discard && <Modal title="Discard lecturer details?" onClose={() => setDiscard(false)}><p className="text-sm text-[#68728a]">Your unsaved changes will be lost.</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setDiscard(false)} className={`${button} border border-[#e5e8f0]`}>Keep editing</button><button type="button" onClick={onClose} className={`${button} bg-[#273238] text-white`}>Discard changes</button></div></Modal>}
  </>
}
