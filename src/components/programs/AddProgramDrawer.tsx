import { useRef, useState, type FormEvent } from 'react'
import type { ApiDepartment } from '../../services/departmentService'
import type { Faculty } from '../../types/faculty'
import type { ProgramDraft } from '../../types/program'
import type { ApiProgram } from '../../services/programService'
import { degrees, programDurations } from '../../data/programs'
import { degreeIdFromName, programError, validateProgramForm } from '../../utils/programApi'
import Drawer from '../ui/Drawer'
import Modal from '../ui/Modal'

export default function AddProgramDrawer({ program, faculties, departments, onAdd, onClose }: { program?: ApiProgram; faculties: Faculty[]; departments: ApiDepartment[]; onAdd: (value: ProgramDraft) => Promise<void>; onClose: () => void }) {
  const empty: ProgramDraft = { code: '', name: '', facultyId: '', departmentId: '', degreeId: '', durationYears: '4', totalCredits: '', status: 'active' }
  const [initial] = useState<ProgramDraft>(() => program ? {
    code: program.code,
    name: program.name,
    facultyId: program.facultyId,
    departmentId: program.departmentId,
    degreeId: degreeIdFromName(program.degreeLevel),
    durationYears: program.durationYears == null ? '' : String(program.durationYears),
    totalCredits: program.totalCredits == null ? '' : String(program.totalCredits),
    status: program.status,
  } : { ...empty })
  const [value, setValue] = useState<ProgramDraft>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof ProgramDraft, string>>>({})
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState('')
  const [discard, setDiscard] = useState(false)
  const lock = useRef(false)
  const form = useRef<HTMLFormElement>(null)

  function close() {
    if (lock.current) return
    if ((Object.keys(initial) as (keyof ProgramDraft)[]).some(key => value[key] !== initial[key])) setDiscard(true)
    else onClose()
  }

  function update(key: keyof ProgramDraft, next: string) {
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
    const next = validateProgramForm(value)
    setErrors(next)
    if (Object.keys(next).length) { requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]:not(:disabled)')?.focus()); return }
    lock.current = true; setPending(true)
    try {
      await onAdd(value)
    } catch (error) {
      const failure = programError(error)
      setFailure(failure.message); setErrors(failure.fields)
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]:not(:disabled)')?.focus())
      setPending(false); lock.current = false
    }
  }

  const filteredDepartments = departments.filter(d => d.facultyId === value.facultyId && d.status === 'active')
  const fields: { key: keyof ProgramDraft; label: string; placeholder: string; required?: boolean; full?: boolean; numeric?: boolean; disabled?: boolean; options?: { value: string; label: string }[] }[] = [
    { key: 'code', label: 'Program Code', placeholder: 'e.g. PRG-CE-BS', required: true },
    { key: 'degreeId', label: 'Degree Level', placeholder: 'Select…', required: true, options: degrees.map(degree => ({ value: degree.id, label: degree.name })) },
    { key: 'name', label: 'Program Name', placeholder: 'e.g. Computer Engineering', required: true, full: true },
    { key: 'facultyId', label: 'Faculty', placeholder: 'Select a faculty…', required: true, full: true, options: faculties.map(faculty => ({ value: faculty.id, label: faculty.nameEn.replace(/^Faculty of /, '') })) },
    { key: 'departmentId', label: 'Department', placeholder: 'Select a department…', required: true, full: true, disabled: !value.facultyId, options: filteredDepartments.map(department => ({ value: department.id, label: department.name })) },
    { key: 'durationYears', label: 'Duration (years)', placeholder: '', options: programDurations.map(years => ({ value: String(years), label: `${years} ${years === 1 ? 'year' : 'years'}` })) },
    { key: 'totalCredits', label: 'Total Credits', placeholder: 'e.g. 132', numeric: true },
  ]
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] leading-[20.25px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60'
  return <>
    <Drawer width={480} title={program ? 'Edit Program' : 'Add Program'} description={program ? 'Update program details and assignment.' : 'Create a new academic program or major.'} busy={pending} onClose={close} footer={<><button type="submit" form="add-program-form" disabled={pending} className={`${button} bg-linear-[165deg,#273238,#1a2329] text-white`}><img src="/assets/figma/faculty-check.svg" width="14" height="14" alt="" />{pending ? program ? 'Updating…' : 'Adding…' : program ? 'Update Program' : 'Add Program'}</button><button type="button" disabled={pending} onClick={close} className={`${button} border-[1.25px] border-[#e5e8f0]`}>Cancel</button></>}>
      <form ref={form} id="add-program-form" onSubmit={submit} noValidate>
        <fieldset disabled={pending} className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2">
          {fields.map(field => {
            const error = errors[field.key]
            const attrs = { id: `program-${field.key}`, name: field.key, value: value[field.key], required: field.required, disabled: field.disabled || pending, 'aria-invalid': !!error, 'aria-describedby': error ? `program-${field.key}-error` : field.key === 'departmentId' && value.facultyId && !filteredDepartments.length ? 'program-department-empty' : undefined, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => update(field.key, event.target.value) }
            const classes = `w-full min-w-0 rounded-xl border-[1.25px] bg-white px-3.5 text-[13.5px] placeholder:text-[#17213c]/50 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${error ? 'border-[#d80255]' : 'border-[#e5e8f0]'}`
            return <div key={field.key} className={`min-w-0 ${field.full ? 'min-[400px]:col-span-2' : ''}`}><label htmlFor={attrs.id} className="mb-1.5 block text-[12.5px] leading-[18.75px] font-semibold">{field.label}{field.required && <span aria-hidden="true" className="ml-0.5 text-[#d80255]">*</span>}</label>
              {field.options ? <div className="relative"><select {...attrs} className={`${classes} h-[39px] appearance-none pr-8`}>
                {field.placeholder && <option value="">{field.placeholder}</option>}{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select><img src="/assets/figma/department-select-arrow.svg" width="10" height="6" alt="" className={`pointer-events-none absolute top-4 right-3.5 ${field.disabled ? 'opacity-50' : ''}`} /></div> : <input {...attrs} type={field.numeric ? 'number' : 'text'} min={field.numeric ? 0 : undefined} step={field.numeric ? 1 : undefined} placeholder={field.placeholder} className={`${classes} h-[43px]`} />}
              {field.key === 'departmentId' && value.facultyId && !filteredDepartments.length && <p id="program-department-empty" className="mt-1.5 text-xs text-[#68728a]">No departments are available for this faculty.</p>}
              {error && <p id={`program-${field.key}-error`} className="mt-1.5 text-xs text-[#d80255]">{error}</p>}
            </div>
          })}
          <fieldset className="min-[400px]:col-span-2"><legend className="mb-2 text-[12.5px] leading-[18.75px] font-semibold">Status</legend><div className="flex gap-4">{(['active', 'inactive'] as const).map(status => <label key={status} className="flex items-center gap-2.5 text-[13.5px] leading-[20.25px] font-semibold"><input type="radio" name="status" checked={value.status === status} onChange={() => update('status', status)} className="size-5 appearance-none rounded-full border border-[#e5e8f0] bg-white checked:border-[6px] checked:border-[#273238] focus-visible:outline-2 focus-visible:outline-offset-2" />{status === 'active' ? 'Active' : 'Inactive'}</label>)}</div></fieldset>
        </fieldset>
        <p role="alert" className="mt-4 text-xs leading-5 text-[#d80255]">{failure}</p>
      </form>
    </Drawer>
    {discard && <Modal title="Discard program details?" onClose={() => setDiscard(false)}><p className="text-sm text-[#68728a]">Your unsaved changes will be lost.</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setDiscard(false)} className={`${button} border border-[#e5e8f0]`}>Keep editing</button><button type="button" onClick={onClose} className={`${button} bg-[#273238] text-white`}>Discard changes</button></div></Modal>}
  </>
}
