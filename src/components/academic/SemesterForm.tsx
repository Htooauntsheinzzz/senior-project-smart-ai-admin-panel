import { useRef, useState, type FormEvent } from 'react'
import Drawer from '../ui/Drawer'
import Modal from '../ui/Modal'
import { semesterError, validateSemester, type Semester, type SemesterDraft } from '../../services/semesterService'

const button = 'rounded-xl border border-[#e5e8f0] px-5 py-2.5 text-[13px] font-semibold focus-visible:outline-2 disabled:opacity-50'
export default function SemesterForm({ semester, onSave, onClose }: { semester?: Semester; onSave: (value: SemesterDraft) => Promise<void>; onClose: () => void }) {
  const [initial] = useState<SemesterDraft>(() => ({ semesterNameEn: semester?.semesterNameEn ?? '', semesterNameTh: semester?.semesterNameTh ?? '' }))
  const [value, setValue] = useState(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof SemesterDraft, string>>>({})
  const [failure, setFailure] = useState('')
  const [pending, setPending] = useState(false)
  const [discard, setDiscard] = useState(false)
  const lock = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  function close() {
    if (lock.current) return
    if (value.semesterNameEn !== initial.semesterNameEn || value.semesterNameTh !== initial.semesterNameTh) setDiscard(true)
    else onClose()
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (lock.current) return
    const next = validateSemester(value); setErrors(next)
    if (Object.keys(next).length) { requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return }
    lock.current = true; setPending(true); setFailure('')
    try { await onSave(value) }
    catch (error) { setFailure(semesterError(error)); lock.current = false; setPending(false) }
  }
  return <>
    <Drawer width={480} title={semester ? 'Edit Semester' : 'Add Semester'} description="Manage the semester names stored by the existing API." busy={pending} onClose={close} footer={<><button form="semester-form" type="submit" disabled={pending} className={`${button} bg-[#273238] text-white`}>{pending ? 'Saving…' : semester ? 'Save Changes' : 'Add Semester'}</button><button type="button" disabled={pending} onClick={close} className={button}>Cancel</button></>}>
      <form id="semester-form" ref={form} onSubmit={submit} noValidate><fieldset disabled={pending} className="space-y-4">{(['semesterNameEn', 'semesterNameTh'] as const).map(key => <div key={key}><label htmlFor={`semester-${key}`} className="text-[12.5px] font-semibold">Semester Name ({key === 'semesterNameEn' ? 'English' : 'Thai'}) <span className="text-[#d80255]">*</span></label><input id={`semester-${key}`} required maxLength={150} value={value[key]} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `semester-${key}-error` : undefined} onChange={event => { setValue(previous => ({ ...previous, [key]: event.target.value })); setErrors(previous => ({ ...previous, [key]: undefined })); setFailure('') }} className={`mt-1.5 h-[42px] w-full rounded-xl border bg-white px-3.5 text-[13px] focus-visible:outline-2 ${errors[key] ? 'border-[#d80255]' : 'border-[#e5e8f0]'}`} />{errors[key] && <p id={`semester-${key}-error`} className="mt-1 text-xs text-[#d80255]">{errors[key]}</p>}</div>)}</fieldset><p className="mt-4 text-xs leading-5 text-[#68728a]">The existing API stores English and Thai names only. Semester code, academic year, dates, and status cannot be saved through this API.</p>{failure && <p role="alert" className="mt-4 text-sm text-[#d80255]">{failure}</p>}</form>
    </Drawer>
    {discard && <Modal title="Discard changes?" onClose={() => setDiscard(false)}><p className="text-sm text-[#68728a]">Your unsaved changes will be lost.</p><div className="mt-5 flex justify-end gap-3"><button type="button" className={button} onClick={() => setDiscard(false)}>Keep editing</button><button type="button" className={`${button} bg-[#273238] text-white`} onClick={onClose}>Discard changes</button></div></Modal>}
  </>
}
