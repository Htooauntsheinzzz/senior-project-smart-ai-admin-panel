import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Faculty, FacultyInput } from '../../types/faculty'
import { validateFaculty } from '../../utils/faculties'
import Modal from '../ui/Modal'

export default function AddFacultyDrawer({ faculties, onAdd, onClose }: { faculties: Faculty[]; onAdd: (input: FacultyInput) => void; onClose: () => void }) {
  const [value, setValue] = useState<FacultyInput>({ code: '', nameEn: '', nameTh: '', status: 'active' })
  const [errors, setErrors] = useState<Partial<Record<keyof FacultyInput, string>>>({})
  const [discard, setDiscard] = useState(false)
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState('')
  const [overlay, setOverlay] = useState(() => !window.matchMedia('(min-width: 1280px)').matches)
  const dialog = useRef<HTMLDialogElement>(null)
  const lock = useRef(false)
  const dirty = !!(value.code || value.nameEn || value.nameTh || value.status !== 'active')

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)')
    const resize = () => setOverlay(!media.matches)
    media.addEventListener('change', resize)
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    return () => { media.removeEventListener('change', resize); opener?.focus() }
  }, [])
  useEffect(() => {
    const panel = dialog.current
    const overflow = document.body.style.overflow
    panel?.close()
    if (overlay) { panel?.showModal(); document.body.style.overflow = 'hidden' }
    else panel?.show()
    panel?.querySelector<HTMLInputElement>('input')?.focus()
    return () => { panel?.close(); document.body.style.overflow = overflow }
  }, [overlay])

  function close() { if (pending) return; if (dirty) setDiscard(true); else onClose() }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (lock.current) return
    const next = validateFaculty(value, faculties)
    setErrors(next)
    if (Object.keys(next).length) {
      requestAnimationFrame(() => dialog.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    lock.current = true
    setPending(true)
    try {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
      onAdd(value)
    } catch {
      setFailure('Unable to add the local faculty. Your entries have been kept. Please try again.')
      setPending(false)
      lock.current = false
    }
  }
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] leading-[20.25px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60'
  return <>
    <dialog ref={dialog} aria-modal={overlay || undefined} aria-labelledby="add-faculty-title" aria-describedby="add-faculty-description" onCancel={event => { event.preventDefault(); close() }} onKeyDown={event => { if (event.key === 'Escape' && !overlay) { event.preventDefault(); close() } }} className="fixed inset-y-0 right-0 left-auto z-50 m-0 h-dvh max-h-none w-full max-w-[460px] border-0 bg-white p-0 text-[#17213c] shadow-[0_25px_25px_#00000040] backdrop:bg-[#17213c]/25">
      <form onSubmit={submit} noValidate className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b-[0.625px] border-[#e5e8f0] px-6 py-5"><div><h2 id="add-faculty-title" className="font-display text-lg leading-[27px] font-extrabold">Add Faculty</h2><p id="add-faculty-description" className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">Create a new faculty in the university.</p></div><button type="button" onClick={close} disabled={pending} aria-label="Close Add Faculty" className="flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-[#f7f8fc] focus-visible:outline-2"><img src="/assets/figma/faculty-close.svg" width="16" height="16" alt="" /></button></header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <fieldset disabled={pending} className="space-y-4">
            {([{ key: 'code', label: 'Faculty Code', placeholder: 'e.g. FAC-ENG', required: true }, { key: 'nameEn', label: 'Faculty Name (English)', placeholder: 'e.g. Faculty of Engineering', required: true }, { key: 'nameTh', label: 'Faculty Name (Thai)', placeholder: 'e.g. คณะวิศวกรรมศาสตร์', required: false }] as const).map(field => <div key={field.key}><label htmlFor={`faculty-${field.key}`} className="mb-1.5 block text-[12.5px] leading-[18.75px] font-semibold">{field.label}{field.required && <span aria-hidden="true" className="ml-0.5 text-[#d80255]">*</span>}</label><input id={`faculty-${field.key}`} name={field.key} required={field.required} value={value[field.key]} placeholder={field.placeholder} onChange={event => { setValue(previous => ({ ...previous, [field.key]: event.target.value })); setErrors(previous => ({ ...previous, [field.key]: undefined })); setFailure('') }} aria-invalid={!!errors[field.key]} aria-describedby={errors[field.key] ? `faculty-${field.key}-error` : undefined} className={`h-[41px] w-full rounded-xl border-[0.625px] px-3.5 font-['Inter','Noto_Sans_Thai',sans-serif] text-[13.5px] placeholder:text-[#17213c]/50 focus-visible:outline-2 focus-visible:outline-offset-2 ${errors[field.key] ? 'border-[#d80255]' : 'border-[#e5e8f0]'}`} />{errors[field.key] && <p id={`faculty-${field.key}-error`} className="mt-1.5 text-xs text-[#d80255]">{errors[field.key]}</p>}</div>)}
            <fieldset><legend className="mb-2 text-[12.5px] leading-[18.75px] font-semibold">Status</legend><div className="flex gap-4">{(['active', 'inactive'] as const).map(status => <label key={status} className="flex items-center gap-2 text-[13.5px] leading-[20.25px] font-semibold"><input name="status" type="radio" value={status} checked={value.status === status} onChange={() => setValue(previous => ({ ...previous, status }))} className="size-5 appearance-none rounded-full border border-[#e5e8f0] bg-white checked:border-[6px] checked:border-[#273238] focus-visible:outline-2 focus-visible:outline-offset-2" />{status === 'active' ? 'Active' : 'Inactive'}</label>)}</div></fieldset>
          </fieldset>
          <p role="alert" className="mt-4 text-xs leading-5 text-[#d80255]">{failure}</p>
        </div>
        <footer className="flex shrink-0 flex-wrap gap-3 border-t-[0.625px] border-[#e5e8f0] px-6 py-4"><button type="submit" disabled={pending} className={`${button} bg-linear-[164deg,#273238,#1a2329] text-white shadow-[0_4px_7px_#27323838]`}><img src="/assets/figma/faculty-check.svg" width="14" height="14" alt="" />{pending ? 'Adding…' : 'Add Faculty'}</button><button type="button" disabled={pending} onClick={close} className={`${button} border-[0.625px] border-[#e5e8f0]`}>Cancel</button></footer>
      </form>
    </dialog>
    {discard && <Modal title="Discard faculty details?" onClose={() => setDiscard(false)}><p className="text-sm text-[#68728a]">Your unsaved changes will be lost.</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setDiscard(false)} className={`${button} border border-[#e5e8f0]`}>Keep editing</button><button type="button" onClick={onClose} className={`${button} bg-[#273238] text-white`}>Discard changes</button></div></Modal>}
  </>
}
