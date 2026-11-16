import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import Modal from '../ui/Modal'
import type { AcademicTerm, ConflictCheck, FilterOptions, MeetingDetail, ScheduleDraft, ScheduleField } from '../../types/timetable'
import { getSectionDirectory, type ApiSection } from '../../services/sectionService'
import { checkScheduleConflicts, createMeeting, updateMeeting } from '../../services/timetableService'
import { dayNames, describeConflictType, formatDate, meetingTypes, roomsFor, sectionLabel, timetableError, validateScheduleDraft } from '../../utils/timetable'

// Add / Edit Class Schedule modal from Figma node 193:973 (spec 40 §10–§14). Course, Section, Building and Room are
// selects over real records. Lecturer, Semester and Academic Year are derived from the chosen section and read-only,
// because the backend takes them from the section (TimetableMeetingRequest has no such fields). Class Type, Effective
// From/To and Notes are backend fields the Figma frame does not show; they extend the Schedule group and a Notes group.
// Editing keeps Course and Section fixed: PUT /timetable/meetings/{id} accepts the slot only (TimetableMeetingSlot).

const control = 'h-[40.5px] w-full rounded-xl border border-[#e5e8f0] bg-white px-3.5 text-[13.5px] text-[#17213c] placeholder:text-[#17213c]/50 focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[#d80255]'
const readOnlyControl = `${control} bg-[#f7f8fc] text-[#68728a]`
const groupLabel = 'text-[11.5px] leading-[17.25px] font-bold tracking-[1.15px] text-[#68728a] uppercase'
const primary = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(166.5deg,#273238_0%,#1a2329_100%)] px-5 py-2.5 text-[13.5px] leading-[20.25px] font-semibold text-white hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
const secondary = 'inline-flex items-center justify-center rounded-xl border border-[#e5e8f0] px-4 py-2.5 text-[13.5px] leading-[20.25px] font-semibold text-[#68728a] hover:bg-[#f7f8fc] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
const retryLink = 'rounded px-1 font-semibold underline focus-visible:outline-2'

type Option = { value: string; label: string; disabled?: boolean }

interface SectionChoice { id: string; sectionNumber: string; lecturerName: string; semesterName: string; academicTermId: string | null; academicYearLabel: string | null }
const fromApiSection = (section: ApiSection): SectionChoice => ({ id: section.id, sectionNumber: section.sectionNumber, lecturerName: section.lectureNameEn, semesterName: section.semesterNameEn, academicTermId: section.academicTermId, academicYearLabel: section.academicYearLabel })

const describedBy = (id: string, error?: string, hint?: string) => error ? `${id}-error` : hint ? `${id}-hint` : undefined

function Field({ id, label, required = true, error, hint, children }: { id: string; label: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return <div>
    <label htmlFor={id} className="block pb-1.5 text-[12.5px] leading-[18.75px] font-semibold text-[#17213c]">{label}{required && <span aria-hidden="true" className="text-[#d80255]"> *</span>}</label>
    {children}
    {hint && !error && <p id={`${id}-hint`} className="pt-1 text-[11px] leading-4 text-[#68728a]">{hint}</p>}
    {error && <p id={`${id}-error`} className="pt-1 text-xs leading-4 text-[#d80255]">{error}</p>}
  </div>
}

function Select({ id, value, onChange, placeholder, options, disabled, error, hint }: { id: string; value: string; onChange: (value: string) => void; placeholder: string; options: Option[]; disabled?: boolean; error?: string; hint?: string }) {
  return <div className="relative">
    <select id={id} value={value} disabled={disabled} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, hint)} onChange={event => onChange(event.target.value)} className={`${control} appearance-none pr-9 pl-[18px]`}>
      <option value="">{placeholder}</option>
      {options.map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
    </select>
    <img src="/assets/figma/department-select-arrow.svg" width="10" height="6" alt="" className="pointer-events-none absolute top-[17px] right-4" />
  </div>
}

function Input({ id, type, value, onChange, error, hint, min, max, placeholder }: { id: string; type: 'time' | 'date'; value: string; onChange: (value: string) => void; error?: string; hint?: string; min?: string; max?: string; placeholder?: string }) {
  return <input id={id} type={type} value={value} min={min} max={max} step={type === 'time' ? 60 : undefined} placeholder={placeholder} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, hint)} onChange={event => onChange(event.target.value)} className={control} />
}

function ReadOnly({ id, value, placeholder }: { id: string; value: string; placeholder: string }) {
  return <input id={id} readOnly aria-readonly="true" value={value} placeholder={placeholder} className={readOnlyControl} />
}

export default function ScheduleFormModal({ mode, meeting, initial, options, optionsError, onRetryOptions, terms, onClose, onSaved }: {
  mode: 'create' | 'edit'
  /** The schedule being edited (GET /timetable/meetings/{id}); required when mode is 'edit'. */
  meeting?: MeetingDetail
  initial: ScheduleDraft
  options?: FilterOptions
  optionsError?: string
  onRetryOptions: () => void
  terms: AcademicTerm[]
  onClose: () => void
  onSaved: (meeting: MeetingDetail) => void
}) {
  const uid = useId()
  const fieldId = (field: ScheduleField) => `${uid}-${field}`
  const editing = mode === 'edit' && meeting ? meeting : null
  const [draft, setDraft] = useState<ScheduleDraft>(initial)
  const [errors, setErrors] = useState<Partial<Record<ScheduleField, string>>>({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [conflicts, setConflicts] = useState<ConflictCheck | null>(null)
  const [sectionsAttempt, setSectionsAttempt] = useState(0)
  const [sections, setSections] = useState<{ key: string; rows?: SectionChoice[]; error?: string } | null>(null)
  const lock = useRef(false)
  // Effective dates follow the section's term until the administrator edits them.
  const datesTouched = useRef(initial.effectiveFrom !== '' || initial.effectiveTo !== '')

  const sectionsKey = `${draft.courseId}|${sectionsAttempt}`
  const sectionRows = sections?.key === sectionsKey ? sections.rows : undefined
  const sectionsError = sections?.key === sectionsKey ? sections.error : undefined
  const sectionsLoading = !editing && !!draft.courseId && sections?.key !== sectionsKey

  useEffect(() => {
    if (editing || !draft.courseId) return
    const controller = new AbortController()
    getSectionDirectory({ query: '', courseId: draft.courseId, semester: '', academicYear: '', lecturerId: '', status: 'active' }, controller.signal)
      .then(rows => setSections({ key: sectionsKey, rows: rows.map(fromApiSection) }))
      .catch(error => { if (!controller.signal.aborted) setSections({ key: sectionsKey, error: timetableError(error).message }) })
    return () => controller.abort()
  }, [draft.courseId, editing, sectionsKey])

  const selectedSection: SectionChoice | undefined = editing
    ? { id: editing.courseSection.id, sectionNumber: sectionLabel(editing.courseSection), lecturerName: editing.lecturer.name, semesterName: editing.academicTerm?.semesterName ?? '', academicTermId: editing.academicTerm?.id ?? null, academicYearLabel: editing.academicTerm?.academicYearLabel ?? null }
    : sectionRows?.find(row => row.id === draft.courseSectionId)
  const term = selectedSection?.academicTermId
    ? terms.find(entry => entry.id === selectedSection.academicTermId) ?? (editing?.academicTerm ? { startDate: editing.academicTerm.startDate, endDate: editing.academicTerm.endDate } : undefined)
    : undefined
  const canSaveAnyway = !editing || editing.status === 'DRAFT'
  const lookupsReady = !!options && !optionsError

  function update(field: ScheduleField, value: string) {
    setConflicts(null)
    setFormError('')
    setErrors(previous => { if (!previous[field]) return previous; const next = { ...previous }; delete next[field]; return next })
    setDraft(previous => {
      const next = { ...previous, [field]: value }
      if (field === 'courseId') next.courseSectionId = ''
      if (field === 'buildingId') next.roomId = ''
      if (field === 'effectiveFrom' || field === 'effectiveTo') datesTouched.current = true
      if ((field === 'courseId' || field === 'courseSectionId') && !datesTouched.current) {
        const section = field === 'courseSectionId' ? sectionRows?.find(row => row.id === value) : undefined
        const sectionTerm = section?.academicTermId ? terms.find(entry => entry.id === section.academicTermId) : undefined
        next.effectiveFrom = sectionTerm?.startDate ?? ''
        next.effectiveTo = sectionTerm?.endDate ?? ''
      }
      return next
    })
  }

  async function save(acknowledged: boolean) {
    if (lock.current) return
    const validation = validateScheduleDraft(draft, { term, sectionHasTerm: !!selectedSection?.academicTermId })
    const invalid = Object.keys(validation) as ScheduleField[]
    if (invalid.length) {
      setErrors(validation)
      setFormError('Check the highlighted fields.')
      document.getElementById(fieldId(invalid[0]))?.focus()
      return
    }
    lock.current = true
    setSaving(true); setFormError(''); setErrors({})
    try {
      if (!acknowledged) {
        // Advisory pre-check; the server re-validates published schedules on save, so a failed check does not block saving.
        const check = await checkScheduleConflicts(draft, editing?.id).catch(() => null)
        if (check?.hasConflicts) { setConflicts(check); return }
      }
      onSaved(editing ? await updateMeeting(editing.id, draft) : await createMeeting(draft))
    } catch (error) {
      const failure = timetableError(error, 'write')
      setErrors(failure.fields)
      setFormError(failure.message)
    } finally {
      lock.current = false
      setSaving(false)
    }
  }

  const courseOptions: Option[] = (options?.courses ?? []).map(course => ({ value: course.id, label: `${course.code} – ${course.name}` }))
  const sectionOptions: Option[] = (sectionRows ?? []).map(section => ({ value: section.id, label: `SEC-${section.sectionNumber} · ${section.lecturerName}${section.academicTermId ? '' : ' (no academic term)'}`, disabled: !section.academicTermId }))
  const buildingOptions: Option[] = (options?.buildings ?? []).map(building => ({ value: building.id, label: building.code ? `${building.code} – ${building.name}` : building.name }))
  const roomOptions: Option[] = (options ? roomsFor(options, draft.buildingId) : []).map(room => ({ value: room.id, label: room.name && room.name !== room.code ? `${room.code} – ${room.name}` : room.code }))
  const sectionHint = sectionsLoading ? 'Loading sections…' : sectionRows && !sectionRows.length ? 'This course has no active sections.' : sectionRows?.some(section => !section.academicTermId) ? 'Sections without an academic term cannot be scheduled yet. Assign one in Course Sections.' : undefined
  const termWindow = term ? `${formatDate(term.startDate)} – ${formatDate(term.endDate)}` : undefined
  const primaryLabel = saving ? 'Saving…' : conflicts && canSaveAnyway ? 'Save draft anyway' : mode === 'create' ? 'Create Schedule' : 'Save Changes'

  return <Modal title={mode === 'create' ? 'Add Class Schedule' : 'Edit Class Schedule'} onClose={onClose} dividedHeader width={620} busy={saving}>
    <form noValidate aria-busy={saving || undefined} onSubmit={event => { event.preventDefault(); void save(false) }}>
      {!lookupsReady && <div role={optionsError ? 'alert' : 'status'} className="mb-5 rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] px-4 py-3 text-[13px] leading-5 text-[#68728a]">
        {optionsError ? <>Courses, buildings and rooms could not be loaded. {optionsError} <button type="button" onClick={onRetryOptions} className={retryLink}>Retry</button></> : 'Loading courses, buildings and rooms…'}
      </div>}

      <section aria-labelledby={`${uid}-course-group`}>
        <h3 id={`${uid}-course-group`} className={groupLabel}>Course Information</h3>
        <div className="grid gap-4 pt-3 min-[480px]:grid-cols-2">
          <Field id={fieldId('courseId')} label="Course" error={errors.courseId}>
            {editing ? <ReadOnly id={fieldId('courseId')} value={`${editing.course.code} – ${editing.course.name}`} placeholder="" />
              : <Select id={fieldId('courseId')} value={draft.courseId} onChange={value => update('courseId', value)} placeholder="Select course…" options={courseOptions} disabled={!lookupsReady} error={errors.courseId} />}
          </Field>
          <Field id={fieldId('courseSectionId')} label="Section" error={errors.courseSectionId} hint={sectionHint}>
            {editing ? <ReadOnly id={fieldId('courseSectionId')} value={sectionLabel(editing.courseSection)} placeholder="" />
              : <Select id={fieldId('courseSectionId')} value={draft.courseSectionId} onChange={value => update('courseSectionId', value)} placeholder={draft.courseId ? 'Select section…' : 'Select a course first'} options={sectionOptions} disabled={!draft.courseId || sectionsLoading || !!sectionsError} error={errors.courseSectionId} hint={sectionHint} />}
            {sectionsError && <p className="pt-1 text-xs leading-4 text-[#d80255]">Sections could not be loaded. <button type="button" onClick={() => setSectionsAttempt(attempt => attempt + 1)} className={retryLink}>Retry</button></p>}
          </Field>
        </div>
      </section>

      <section aria-labelledby={`${uid}-schedule-group`} className="pt-5">
        <h3 id={`${uid}-schedule-group`} className={groupLabel}>Schedule</h3>
        <div className="grid gap-4 pt-3 min-[480px]:grid-cols-3">
          <Field id={fieldId('dayOfWeek')} label="Day of Week" error={errors.dayOfWeek}>
            <Select id={fieldId('dayOfWeek')} value={draft.dayOfWeek} onChange={value => update('dayOfWeek', value)} placeholder="Select day…" options={dayNames.map((name, index) => ({ value: String(index + 1), label: name }))} error={errors.dayOfWeek} />
          </Field>
          <Field id={fieldId('startTime')} label="Start Time" error={errors.startTime}>
            <Input id={fieldId('startTime')} type="time" value={draft.startTime} onChange={value => update('startTime', value)} error={errors.startTime} />
          </Field>
          <Field id={fieldId('endTime')} label="End Time" error={errors.endTime}>
            <Input id={fieldId('endTime')} type="time" value={draft.endTime} onChange={value => update('endTime', value)} min={draft.startTime || undefined} error={errors.endTime} />
          </Field>
          <Field id={fieldId('meetingType')} label="Class Type" error={errors.meetingType}>
            <Select id={fieldId('meetingType')} value={draft.meetingType} onChange={value => update('meetingType', value)} placeholder="Select type…" options={meetingTypes} error={errors.meetingType} />
          </Field>
          <Field id={fieldId('effectiveFrom')} label="Effective From" error={errors.effectiveFrom} hint={termWindow ? `Term: ${termWindow}` : undefined}>
            <Input id={fieldId('effectiveFrom')} type="date" value={draft.effectiveFrom} onChange={value => update('effectiveFrom', value)} min={term?.startDate} max={term?.endDate} error={errors.effectiveFrom} hint={termWindow} />
          </Field>
          <Field id={fieldId('effectiveTo')} label="Effective To" error={errors.effectiveTo}>
            <Input id={fieldId('effectiveTo')} type="date" value={draft.effectiveTo} onChange={value => update('effectiveTo', value)} min={draft.effectiveFrom || term?.startDate} max={term?.endDate} error={errors.effectiveTo} />
          </Field>
          <Field id={fieldId('enrollmentDueDate')} label="Enrollment Due Date" required={false} error={errors.enrollmentDueDate} hint="Optional. Last day students and admins can enroll; not after Effective From.">
            <Input id={fieldId('enrollmentDueDate')} type="date" value={draft.enrollmentDueDate} onChange={value => update('enrollmentDueDate', value)} max={draft.effectiveFrom || undefined} error={errors.enrollmentDueDate} hint="Optional. Last day students and admins can enroll; not after Effective From." />
          </Field>
        </div>
      </section>

      <section aria-labelledby={`${uid}-location-group`} className="pt-5">
        <h3 id={`${uid}-location-group`} className={groupLabel}>Location</h3>
        <div className="grid gap-4 pt-3 min-[480px]:grid-cols-2">
          <Field id={fieldId('buildingId')} label="Building" error={errors.buildingId}>
            <Select id={fieldId('buildingId')} value={draft.buildingId} onChange={value => update('buildingId', value)} placeholder="Select building…" options={buildingOptions} disabled={!lookupsReady} error={errors.buildingId} />
          </Field>
          <Field id={fieldId('roomId')} label="Room" error={errors.roomId} hint={draft.buildingId && lookupsReady && !roomOptions.length ? 'This building has no rooms available for scheduling.' : undefined}>
            <Select id={fieldId('roomId')} value={draft.roomId} onChange={value => update('roomId', value)} placeholder={draft.buildingId ? 'Select room…' : 'Select a building first'} options={roomOptions} disabled={!lookupsReady || !draft.buildingId} error={errors.roomId} />
          </Field>
        </div>
      </section>

      <section aria-labelledby={`${uid}-staff-group`} className="pt-5">
        <h3 id={`${uid}-staff-group`} className={groupLabel}>Staff &amp; Term</h3>
        <div className="grid gap-4 pt-3 min-[480px]:grid-cols-3">
          <Field id={`${uid}-lecturer`} label="Lecturer" hint="From the selected section">
            <ReadOnly id={`${uid}-lecturer`} value={selectedSection?.lecturerName ?? ''} placeholder="Select a section" />
          </Field>
          <Field id={`${uid}-semester`} label="Semester" hint="From the selected section">
            <ReadOnly id={`${uid}-semester`} value={selectedSection?.semesterName ?? ''} placeholder="Select a section" />
          </Field>
          <Field id={`${uid}-year`} label="Academic Year" hint={selectedSection && !selectedSection.academicTermId ? 'This section has no academic term yet.' : "From the section's academic term"}>
            <ReadOnly id={`${uid}-year`} value={selectedSection?.academicYearLabel ?? ''} placeholder={selectedSection ? 'Not assigned' : 'Select a section'} />
          </Field>
        </div>
      </section>

      <section aria-labelledby={`${uid}-notes-group`} className="pt-5">
        <h3 id={`${uid}-notes-group`} className={groupLabel}>Notes</h3>
        <div className="pt-3">
          <Field id={fieldId('notes')} label="Notes" required={false} error={errors.notes} hint="Optional, up to 2000 characters. Shown to administrators only.">
            <textarea id={fieldId('notes')} rows={2} value={draft.notes} maxLength={2000} aria-invalid={errors.notes ? true : undefined} aria-describedby={describedBy(fieldId('notes'), errors.notes, 'hint')} onChange={event => update('notes', event.target.value)} className={`${control} h-auto resize-y py-2.5`} />
          </Field>
        </div>
      </section>

      {conflicts && <div role="alert" className="mt-5 rounded-xl border border-[#fcd34d] bg-[#fffbeb] px-4 py-3 text-[13px] leading-5 text-[#92400e]">
        <p className="font-semibold">{conflicts.totalConflicts} scheduling {conflicts.totalConflicts === 1 ? 'conflict' : 'conflicts'} with published schedules</p>
        <ul className="mt-1 list-disc pl-5">{conflicts.conflicts.slice(0, 5).map((conflict, index) => <li key={index}>{describeConflictType(conflict.type)}: {conflict.message} ({formatDate(conflict.date)}, {conflict.overlapStart}–{conflict.overlapEnd})</li>)}</ul>
        {conflicts.conflicts.length > 5 && <p className="mt-1">…and {conflicts.conflicts.length - 5} more.</p>}
        <p className="mt-2">{canSaveAnyway ? 'You can still save this schedule as a draft and resolve the overlap before publishing it.' : 'Published schedules cannot overlap. Change the day, time or room, or cancel the other schedule first.'}</p>
      </div>}
      {formError && !conflicts && <p role="alert" className="mt-5 rounded-xl border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-[13px] leading-5 text-[#be123c]">{formError}</p>}

      <div className="flex flex-wrap items-center gap-3 pt-6">
        <button type="button" disabled={saving} onClick={() => void save(!!conflicts && canSaveAnyway)} className={primary}><img src="/assets/figma/faculty-check.svg" width="14" height="14" alt="" />{primaryLabel}</button>
        <button type="button" disabled={saving} onClick={onClose} className={secondary}>Cancel</button>
      </div>
    </form>
  </Modal>
}
