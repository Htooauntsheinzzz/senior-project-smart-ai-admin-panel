import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import Drawer from '../ui/Drawer'
import Modal from '../ui/Modal'
import { MAX_ACADEMIC_YEAR, MIN_ACADEMIC_YEAR, semesterError, validateSemester, type ApiSemester, type SemesterDraft, type SemesterField } from '../../services/semesterService'

export default function SemesterForm({ semester, onSave, onClose }: { semester?: ApiSemester; onSave: (value: SemesterDraft) => Promise<void>; onClose: () => void }) {
  const [initial] = useState<SemesterDraft>(() => ({
    academicYear: semester ? String(semester.academicYear) : String(new Date().getFullYear()),
    semesterNameTh: semester?.semesterNameTh ?? '',
    semesterNameEn: semester?.semesterNameEn ?? '',
  }))
  const [value, setValue] = useState<SemesterDraft>(initial)
  const [errors, setErrors] = useState<Partial<Record<SemesterField, string>>>({})
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState('')
  const [discard, setDiscard] = useState(false)
  const lock = useRef(false)
  const form = useRef<HTMLFormElement>(null)

  function close() {
    if (lock.current) return
    if ((Object.keys(initial) as SemesterField[]).some(key => value[key] !== initial[key])) setDiscard(true)
    else onClose()
  }

  function update(key: SemesterField, next: string) {
    setValue(previous => ({ ...previous, [key]: next }))
    setErrors(previous => ({ ...previous, [key]: undefined }))
    setFailure('')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (lock.current) return
    const next = validateSemester(value)
    setErrors(next)
    if (Object.keys(next).length) { requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return }
    lock.current = true; setPending(true)
    try {
      await onSave(value)
    } catch (error) {
      const result = semesterError(error)
      setFailure(result.message); setErrors(result.fields)
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      setPending(false); lock.current = false
    }
  }

  const fields: { key: SemesterField; label: string; placeholder: string; numeric?: boolean }[] = [
    { key: 'academicYear', label: 'Academic Year', placeholder: `e.g. ${new Date().getFullYear()}`, numeric: true },
    { key: 'semesterNameEn', label: 'Semester Name (English)', placeholder: 'e.g. Semester 1' },
    { key: 'semesterNameTh', label: 'Semester Name (Thai)', placeholder: 'e.g. ภาคการศึกษาที่ 1' },
  ]
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] leading-[20.25px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60'
  return <>
    <Drawer width={480} title={semester ? 'Edit Semester' : 'Add Semester'} description={semester ? 'Update the academic year and semester names.' : 'Create a new semester record.'} busy={pending} onClose={close} footer={<><button type="submit" form="semester-form" disabled={pending} className={`${button} bg-linear-[165deg,#273238,#1a2329] text-white`}><img src="/assets/figma/faculty-check.svg" width="14" height="14" alt="" />{pending ? semester ? 'Updating…' : 'Creating…' : semester ? 'Update Semester' : 'Add Semester'}</button><button type="button" disabled={pending} onClick={close} className={`${button} border-[1.25px] border-[#e5e8f0]`}>Cancel</button></>}>
      <form ref={form} id="semester-form" onSubmit={submit} noValidate>
        <fieldset disabled={pending} className="grid min-w-0 grid-cols-1 gap-4">
          {fields.map(field => {
            const error = errors[field.key]
            const id = `semester-${field.key}`
            return <div key={field.key} className="min-w-0"><label htmlFor={id} className="mb-1.5 block text-[12.5px] leading-[18.75px] font-semibold">{field.label}<span aria-hidden="true" className="ml-0.5 text-[#d80255]">*</span></label>
              <input id={id} name={field.key} type="text" required value={value[field.key]} placeholder={field.placeholder}
                inputMode={field.numeric ? 'numeric' : undefined} maxLength={field.numeric ? 4 : 150}
                aria-invalid={!!error} aria-describedby={error ? `${id}-error` : field.numeric ? `${id}-hint` : undefined}
                onChange={(event: ChangeEvent<HTMLInputElement>) => update(field.key, field.numeric ? event.target.value.replace(/\D/g, '') : event.target.value)}
                className={`h-[43px] w-full min-w-0 rounded-xl border-[1.25px] bg-white px-3.5 text-[13.5px] placeholder:text-[#17213c]/50 focus-visible:outline-2 focus-visible:outline-offset-2 ${error ? 'border-[#d80255]' : 'border-[#e5e8f0]'}`} />
              {field.numeric && !error && <p id={`${id}-hint`} className="mt-1.5 text-xs text-[#68728a]">A year from {MIN_ACADEMIC_YEAR} to {MAX_ACADEMIC_YEAR}.</p>}
              {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-[#d80255]">{error}</p>}
            </div>
          })}
        </fieldset>
        <p role="alert" className="mt-4 text-xs leading-5 text-[#d80255]">{failure}</p>
      </form>
    </Drawer>
    {discard && <Modal title="Discard semester details?" onClose={() => setDiscard(false)}><p className="text-sm text-[#68728a]">Your unsaved changes will be lost.</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setDiscard(false)} className={`${button} border border-[#e5e8f0]`}>Keep editing</button><button type="button" onClick={onClose} className={`${button} bg-[#273238] text-white`}>Discard changes</button></div></Modal>}
  </>
}
