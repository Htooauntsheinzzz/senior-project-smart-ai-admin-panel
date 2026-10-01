import { useRef, useState, type FormEvent } from 'react'
import type { Department, DepartmentInput } from '../../types/department'
import { initialFaculties } from '../../data/faculties'
import { validateDepartment } from '../../utils/departments'
import Drawer from '../ui/Drawer'
import Modal from '../ui/Modal'
import SearchableFacultySelect from './SearchableFacultySelect'

export default function AddDepartmentDrawer({ departments, onAdd, onClose }: { departments: Department[]; onAdd: (value: DepartmentInput) => void | Promise<void>; onClose: () => void }) {
  const [value, setValue] = useState<DepartmentInput>({ code: '', name: '', facultyId: '', status: 'active' })
  const [errors, setErrors] = useState<Partial<Record<keyof DepartmentInput, string>>>({})
  const [failure, setFailure] = useState('')
  const [pending, setPending] = useState(false)
  const [discard, setDiscard] = useState(false)
  const lock = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  function close() {
    if (lock.current) return
    if (value.code || value.name || value.facultyId || value.status !== 'active') setDiscard(true)
    else onClose()
  }
  function update<K extends keyof DepartmentInput>(key: K, next: DepartmentInput[K]) {
    setValue(previous => ({ ...previous, [key]: next }))
    setErrors(previous => ({ ...previous, [key]: undefined })); setFailure('')
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (lock.current) return
    const next = validateDepartment(value, departments, initialFaculties)
    setErrors(next)
    if (Object.keys(next).length) { requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return }
    lock.current = true; setPending(true)
    try {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
      await onAdd(value)
    } catch {
      setFailure('Unable to add the department. Your entries have been kept. Please try again.')
      setPending(false); lock.current = false
    }
  }
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] leading-[20.25px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60'
  return <>
    <Drawer title="Add Department" description="Create a new department within a faculty." busy={pending} onClose={close} footer={<><button type="submit" form="add-department-form" disabled={pending} className={`${button} bg-linear-[164deg,#273238,#1a2329] text-white shadow-[0_4px_7px_#27323838]`}><img src="/assets/figma/faculty-check.svg" width="14" height="14" alt="" />{pending ? 'Adding…' : 'Add Department'}</button><button type="button" disabled={pending} onClick={close} className={`${button} border-[0.625px] border-[#e5e8f0]`}>Cancel</button></>}>
      <form id="add-department-form" ref={form} onSubmit={submit} noValidate>
        <fieldset disabled={pending} className="space-y-4">
          {([{ key: 'code', label: 'Department Code', placeholder: 'e.g. DEPT-CE' }, { key: 'name', label: 'Department Name', placeholder: 'e.g. Computer Engineering' }] as const).map(field => <div key={field.key}><label htmlFor={`department-${field.key}`} className="mb-1.5 block text-[12.5px] leading-[18.75px] font-semibold">{field.label}<span aria-hidden="true" className="ml-0.5 text-[#d80255]">*</span></label><input id={`department-${field.key}`} name={field.key} required value={value[field.key]} placeholder={field.placeholder} onChange={event => update(field.key, event.target.value)} aria-invalid={!!errors[field.key]} aria-describedby={errors[field.key] ? `department-${field.key}-error` : undefined} className={`h-[41px] w-full rounded-xl border-[0.625px] px-3.5 text-[13.5px] placeholder:text-[#17213c]/50 focus-visible:outline-2 focus-visible:outline-offset-2 ${errors[field.key] ? 'border-[#d80255]' : 'border-[#e5e8f0]'}`} />{errors[field.key] && <p id={`department-${field.key}-error`} className="mt-1.5 text-xs text-[#d80255]">{errors[field.key]}</p>}</div>)}
          <SearchableFacultySelect value={value.facultyId} selectedFaculty={initialFaculties.find(faculty => faculty.id === value.facultyId)} onChange={faculty => update('facultyId', faculty.id)} error={errors.facultyId} disabled={pending} />
          <fieldset><legend className="mb-2 text-[12.5px] leading-[18.75px] font-semibold">Status</legend><div className="flex gap-4">{(['active', 'inactive'] as const).map(status => <label key={status} className="flex items-center gap-2.5 text-[13.5px] leading-[20.25px] font-semibold"><input type="radio" name="status" value={status} checked={value.status === status} onChange={() => update('status', status)} className="size-5 appearance-none rounded-full border border-[#e5e8f0] bg-white checked:border-[6px] checked:border-[#273238] focus-visible:outline-2 focus-visible:outline-offset-2" />{status === 'active' ? 'Active' : 'Inactive'}</label>)}</div></fieldset>
        </fieldset>
        <p role="alert" className="mt-4 text-xs leading-5 text-[#d80255]">{failure}</p>
      </form>
    </Drawer>
    {discard && <Modal title="Discard department details?" onClose={() => setDiscard(false)}><p className="text-sm text-[#68728a]">Your unsaved changes will be lost.</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setDiscard(false)} className={`${button} border border-[#e5e8f0]`}>Keep editing</button><button type="button" onClick={onClose} className={`${button} bg-[#273238] text-white`}>Discard changes</button></div></Modal>}
  </>
}
