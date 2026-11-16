import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import Drawer from '../ui/Drawer'
import Modal from '../ui/Modal'
import type { AcademicTerm, AcademicTermDraft, TermStatus } from '../../types/timetable'
import { getSemesters, type Semester } from '../../services/courseService'
import { createAcademicTerm, updateAcademicTerm, validateAcademicTermDraft } from '../../services/timetableService'
import { academicTermError, emptyTermDraft, termDraftOf, termStatusOptions, type TermField } from '../../utils/academicTerms'
import { timetableError } from '../../utils/timetable'
import { Field, SelectInput, TextInput } from '../campus/CampusUi'

// Create / edit drawer of the Academic Terms page (Programs pattern: drawer for create and edit, modal for
// details and delete). POST and PUT /academic-terms take the whole term including its status.
const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] leading-[20.25px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60'
const same = (a: AcademicTermDraft, b: AcademicTermDraft) => (Object.keys(a) as TermField[]).every(key => a[key] === b[key])

export default function AcademicTermForm({ term, onClose, onSaved }: { term?: AcademicTerm; onClose: () => void; onSaved: (saved: AcademicTerm, operation: 'created' | 'updated') => void }) {
  const formId = useId()
  const [start] = useState<AcademicTermDraft>(() => term ? termDraftOf(term) : { ...emptyTermDraft })
  const [value, setValue] = useState(start)
  const [errors, setErrors] = useState<Partial<Record<TermField, string>>>({})
  const [failure, setFailure] = useState('')
  const [pending, setPending] = useState(false)
  const [discard, setDiscard] = useState(false)
  const [semesterAttempt, setSemesterAttempt] = useState(0)
  const [semesters, setSemesters] = useState<{ attempt: number; rows?: Semester[]; error?: string } | null>(null)
  const lock = useRef(false)
  const semesterRows = semesters?.attempt === semesterAttempt ? semesters.rows : undefined
  const semesterError = semesters?.attempt === semesterAttempt ? semesters.error : undefined

  useEffect(() => {
    const controller = new AbortController()
    getSemesters(controller.signal)
      .then(rows => { if (!controller.signal.aborted) setSemesters({ attempt: semesterAttempt, rows }) })
      .catch(error => { if (!controller.signal.aborted) setSemesters({ attempt: semesterAttempt, error: timetableError(error).message }) })
    return () => controller.abort()
  }, [semesterAttempt])

  function set(field: TermField, next: string) {
    setValue(previous => ({ ...previous, [field]: next }))
    setErrors(previous => { if (!previous[field]) return previous; const copy = { ...previous }; delete copy[field]; return copy })
    setFailure('')
  }
  function requestClose() {
    if (lock.current) return
    if (same(value, start)) onClose(); else setDiscard(true)
  }
  const focusInvalid = () => requestAnimationFrame(() => document.getElementById(formId)?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (lock.current) return
    const found = validateAcademicTermDraft(value)
    setErrors(found); setFailure('')
    if (Object.keys(found).length) { focusInvalid(); return }
    lock.current = true; setPending(true)
    try {
      const saved = term ? await updateAcademicTerm(term.id, value) : await createAcademicTerm(value)
      onSaved(saved, term ? 'updated' : 'created')
    } catch (error) {
      const result = academicTermError(error, 'write')
      setFailure(result.message); setErrors(result.fields)
      if (Object.keys(result.fields).length) focusInvalid()
      lock.current = false; setPending(false)
    }
  }

  const semesterOptions = (semesterRows ?? []).map(semester => ({ value: semester.id, label: semester.semesterNameEn }))
  if (term && semesterRows && !semesterRows.some(semester => semester.id === term.semesterId)) semesterOptions.unshift({ value: term.semesterId, label: term.semesterNameEn })
  const id = (field: TermField) => `${formId}-${field}`

  return <>
    <Drawer width={480} title={term ? 'Edit Academic Term' : 'Add Academic Term'} description={term ? 'Update the semester, academic year, dates or status of this term.' : 'A term is one semester offered in one academic year, with the dates its classes run.'} busy={pending} onClose={requestClose}
      footer={<>
        <button type="submit" form={formId} disabled={pending} className={`${button} bg-linear-[165deg,#273238,#1a2329] text-white`}><img src="/assets/figma/faculty-check.svg" width="14" height="14" alt="" />{pending ? 'Saving…' : term ? 'Update Term' : 'Add Term'}</button>
        <button type="button" disabled={pending} onClick={requestClose} className={`${button} border-[1.25px] border-[#e5e8f0]`}>Cancel</button>
      </>}>
      {failure && <p role="alert" className="mb-4 rounded-xl border border-[#fecdd3] bg-[#fff1f2] px-3.5 py-2.5 text-[13px] text-[#be123c]">{failure}</p>}
      <form id={formId} onSubmit={submit} noValidate>
        <fieldset disabled={pending} className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2">
          <Field id={id('semesterId')} label="Semester" required error={errors.semesterId} hint={semesterError ? undefined : 'Semesters are managed under Academic Management › Semester.'}>
            <SelectInput id={id('semesterId')} value={value.semesterId} onChange={next => set('semesterId', next)} placeholder={semesterRows ? 'Select semester…' : semesterError ? 'Semesters unavailable' : 'Loading semesters…'} options={semesterOptions} disabled={!semesterRows} error={errors.semesterId} required />
            {semesterError && <p className="mt-1 text-xs text-[#d80255]">Semesters could not be loaded. <button type="button" onClick={() => setSemesterAttempt(current => current + 1)} className="rounded px-1 font-semibold underline focus-visible:outline-2">Retry</button></p>}
          </Field>
          <Field id={id('academicYearCode')} label="Academic Year Code" required full={false} error={errors.academicYearCode} hint="Up to 20 characters, unique per semester, e.g. 2568.">
            <TextInput id={id('academicYearCode')} value={value.academicYearCode} onChange={next => set('academicYearCode', next)} placeholder="e.g. 2568" error={errors.academicYearCode} required />
          </Field>
          <Field id={id('academicYearLabel')} label="Academic Year Label" required full={false} error={errors.academicYearLabel} hint="Shown in the Timetable filters, up to 30 characters.">
            <TextInput id={id('academicYearLabel')} value={value.academicYearLabel} onChange={next => set('academicYearLabel', next)} placeholder="e.g. 2025–2026" error={errors.academicYearLabel} required />
          </Field>
          <Field id={id('startDate')} label="Start Date" required full={false} error={errors.startDate}>
            <TextInput id={id('startDate')} type="date" value={value.startDate} onChange={next => set('startDate', next)} error={errors.startDate} required />
          </Field>
          <Field id={id('endDate')} label="End Date" required full={false} error={errors.endDate}>
            <TextInput id={id('endDate')} type="date" value={value.endDate} onChange={next => set('endDate', next)} error={errors.endDate} required />
          </Field>
          <Field id={id('status')} label="Status" required error={errors.status} hint="The active term is selected by default on the Class Timetable. Closed terms can no longer be scheduled.">
            <SelectInput id={id('status')} value={value.status} onChange={next => set('status', (next || 'PLANNED') as TermStatus)} placeholder="Select status…" options={termStatusOptions} error={errors.status} required />
          </Field>
        </fieldset>
      </form>
    </Drawer>
    {discard && <Modal title="Discard changes?" onClose={() => setDiscard(false)}><p className="text-sm leading-6 text-[#68728a]">Your unsaved changes to this academic term will be lost.</p><div className="mt-6 flex justify-end gap-3"><button type="button" className="rounded-xl border border-[#e5e8f0] px-4 py-2 text-sm font-semibold focus-visible:outline-2" onClick={() => setDiscard(false)}>Keep editing</button><button type="button" className="rounded-xl bg-[#273238] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2" onClick={onClose}>Discard</button></div></Modal>}
  </>
}
