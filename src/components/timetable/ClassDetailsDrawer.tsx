import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Building, CalendarDays, CalendarRange, Clock3, DoorOpen, FileText, Pencil, Tag, UserRound, X } from 'lucide-react'
import type { FacultyColor, MeetingDetail } from '../../types/timetable'
import { getMeetingById } from '../../services/timetableService'
import { dayName, formatDate, formatTimeRange12, isMissingMeeting, meetingTypeLabel, sectionLabel, statusLabel, statusTone, timetableError } from '../../utils/timetable'
import { Badge } from '../campus/CampusUi'

// Class Details drawer from Figma node 193:3056 (spec 40 §13): 360 px right-side panel, faculty-tinted header, info
// cards and an Edit Schedule / Close footer. The record is always fetched by id (GET /timetable/meetings/{id}); the
// summary from the calendar or list row only fills the header while that request runs, and nothing from a previously
// selected schedule is kept. The status card (publish, cancel, delete) is an extension for the backend's draft workflow.
// Figma's emoji glyphs and IcX/IcEdit assets (not downloadable here) are replaced by lucide icons.

export interface ScheduleSelection { meetingId: string; courseCode?: string; courseName?: string; sectionNumber?: string; facultyId?: string }

const smallButton = 'rounded-lg px-3 py-1.5 text-xs font-semibold focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50'

function Card({ icon, label, value, detail }: { icon: ReactNode; label: string; value: ReactNode; detail?: ReactNode }) {
  return <div className="flex items-start gap-3 rounded-xl bg-[#f7f8fc] p-3">
    <span aria-hidden="true" className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-[#68728a]">{icon}</span>
    <div className="min-w-0">
      <p className="text-[11px] leading-[16.5px] font-bold tracking-[0.275px] text-[#68728a] uppercase">{label}</p>
      <p className="pt-0.5 text-[13.5px] leading-[20.25px] font-semibold break-words text-[#17213c]">{value}</p>
      {detail && <p className="text-xs leading-4 text-[#68728a]">{detail}</p>}
    </div>
  </div>
}

const statusHelp: Record<MeetingDetail['status'], string> = {
  DRAFT: 'Drafts are visible to administrators only. Publishing checks room, lecturer and section conflicts and makes the class visible to students.',
  PUBLISHED: 'Visible to students. Changes to a published schedule are checked for conflicts before they are saved.',
  CANCELLED: 'This series was cancelled. It stays for reference and cannot be republished or edited.',
}

export default function ClassDetailsDrawer({ selection, reloadKey, colorFor, busy, onClose, onEdit, onPublish, onCancel, onDelete, onMissing }: {
  selection: ScheduleSelection
  /** Bumped by the parent after a mutation so the drawer refetches the same schedule. */
  reloadKey: number
  colorFor: (facultyId: string) => FacultyColor
  /** True while the parent runs publish/cancel/delete for this schedule. */
  busy: boolean
  onClose: () => void
  onEdit: (meeting: MeetingDetail) => void
  onPublish: (meeting: MeetingDetail) => void
  onCancel: (meeting: MeetingDetail) => void
  onDelete: (meeting: MeetingDetail) => void
  /** The schedule no longer exists on the server; the parent refreshes its lists. */
  onMissing: () => void
}) {
  const titleId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const missingHandler = useRef(onMissing)
  useEffect(() => { missingHandler.current = onMissing })
  const [overlay, setOverlay] = useState(() => !window.matchMedia('(min-width: 1280px)').matches)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ key: string; meetingId: string; data?: MeetingDetail; error?: string; missing?: boolean } | null>(null)
  const key = `${selection.meetingId}|${reloadKey}|${attempt}`
  const loading = result?.key !== key
  // Details of the same schedule stay visible while it reloads after an action; another schedule's details never do.
  const data = result?.meetingId === selection.meetingId ? result.data : undefined
  const error = result?.key === key ? result.error : undefined
  const missing = result?.key === key ? result.missing : false

  useEffect(() => {
    const controller = new AbortController()
    getMeetingById(selection.meetingId, controller.signal)
      .then(detail => setResult({ key, meetingId: selection.meetingId, data: detail }))
      .catch(failure => {
        if (controller.signal.aborted) return
        if (isMissingMeeting(failure)) { setResult({ key, meetingId: selection.meetingId, missing: true }); missingHandler.current() }
        else setResult({ key, meetingId: selection.meetingId, error: timetableError(failure).message })
      })
    return () => controller.abort()
  }, [key, selection.meetingId])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)')
    const resize = () => setOverlay(!media.matches)
    media.addEventListener('change', resize)
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    return () => { media.removeEventListener('change', resize); opener?.focus() }
  }, [])
  useEffect(() => {
    const panel = dialog.current
    const previousOverflow = document.body.style.overflow
    panel?.close()
    if (overlay) { panel?.showModal(); document.body.style.overflow = 'hidden' } else panel?.show()
    closeButton.current?.focus()
    return () => { panel?.close(); document.body.style.overflow = previousOverflow }
  }, [overlay])

  const color = colorFor(data?.faculty.id ?? selection.facultyId ?? '')
  const courseCode = data?.course.code ?? selection.courseCode
  const courseName = data?.course.name ?? selection.courseName ?? (loading ? 'Loading…' : 'Class details')
  const section = data ? sectionLabel(data.courseSection) : selection.sectionNumber ? `SEC-${selection.sectionNumber}` : undefined
  const tone = data ? statusTone(data.status) : null

  return <dialog ref={dialog} aria-labelledby={titleId} aria-modal={overlay || undefined}
    onCancel={event => { event.preventDefault(); if (!busy) onClose() }}
    onKeyDown={event => { if (event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); if (!busy) onClose() } }}
    className="fixed inset-y-0 right-0 left-auto z-50 m-0 h-dvh max-h-none w-full max-w-[360px] border-0 bg-white p-0 text-[#17213c] shadow-[-4px_0px_32px_0px_rgba(15,39,76,0.13)] backdrop:bg-[#17213c]/25">
    <div className="flex h-full min-h-0 flex-col" aria-busy={loading || busy || undefined}>
      <header className="shrink-0 p-5" style={{ backgroundColor: color.background, color: color.foreground }}>
        <div className="flex items-center justify-between">
          <p id={titleId} className="text-[11px] leading-[16.5px] font-bold tracking-[1.1px] uppercase opacity-70">Class Details</p>
          <button ref={closeButton} type="button" aria-label="Close class details" disabled={busy} onClick={onClose} className="flex size-7 items-center justify-center rounded-lg hover:bg-white/50 focus-visible:outline-2 disabled:opacity-50"><X size={13} aria-hidden="true" /></button>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-3">
          {courseCode && <span className="rounded-md px-2.5 py-0.5 text-[11px] leading-[16.5px] font-bold text-white" style={{ backgroundColor: color.color }}>{courseCode}</span>}
          {section && <span className="rounded-md px-2 py-0.5 text-[11px] leading-[16.5px] font-semibold" style={{ backgroundColor: `${color.color}21` }}>{section}</span>}
          {data && tone && <Badge bg={tone.bg} text={tone.text} dot>{statusLabel(data.status)}</Badge>}
        </div>
        <h2 className="pt-2 font-display text-[17px] leading-[21.25px] font-extrabold break-words">{courseName}</h2>
        <p className="pt-1.5 text-[12.5px] leading-[18.75px] opacity-70">{data ? `${data.faculty.name} · ${data.department.name}` : loading ? 'Loading faculty and department…' : ' '}</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {error && <div role="alert" className="rounded-xl border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-[13px] leading-5 text-[#be123c]">
          <p>{error}</p>
          <button type="button" onClick={() => setAttempt(value => value + 1)} className="mt-2 rounded-lg border border-[#e5e8f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#17213c] focus-visible:outline-2">Retry</button>
        </div>}
        {missing && <div role="alert" className="rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] px-4 py-3 text-[13px] leading-5 text-[#68728a]">This schedule no longer exists. It may have been deleted by another administrator; the timetable has been refreshed.</div>}
        {!data && loading && !error && <p role="status" className="text-[13px] text-[#68728a]">Loading schedule details…</p>}
        {data && <div className="space-y-3">
          <Card icon={<CalendarDays size={16} />} label="Day" value={dayName(data.dayOfWeek)} />
          <Card icon={<Clock3 size={16} />} label="Time" value={formatTimeRange12(data.startTime, data.endTime)} />
          <Card icon={<Building size={16} />} label="Building" value={data.location.buildingName ?? 'No campus building'} detail={data.location.campusName ?? undefined} />
          <Card icon={<DoorOpen size={16} />} label="Room" value={data.location.roomNumber ?? data.location.legacyRoomLabel ?? 'No room'}
            detail={[data.location.roomName, data.location.floorNumber !== null ? `Floor ${data.location.floorNumber}` : null, data.location.capacity !== null ? `${data.location.capacity} seats` : null].filter(Boolean).join(' · ') || undefined} />
          <Card icon={<UserRound size={16} />} label="Lecturer" value={data.lecturer.name} />
          <Card icon={<CalendarRange size={16} />} label="Semester" value={data.academicTerm ? `${data.academicTerm.semesterName} · ${data.academicTerm.academicYearLabel}` : 'No academic term assigned'}
            detail={data.academicTerm ? `${formatDate(data.academicTerm.startDate)} – ${formatDate(data.academicTerm.endDate)}` : 'Assign a term to the section in Course Sections.'} />
          <Card icon={<Tag size={16} />} label="Class type & dates" value={meetingTypeLabel(data.meetingType)} detail={`${formatDate(data.effectiveFrom)} – ${formatDate(data.effectiveTo)}${data.enrollmentDueDate ? ` · Enroll by ${formatDate(data.enrollmentDueDate)}` : ''}`} />
          {data.notes && <Card icon={<FileText size={16} />} label="Notes" value={<span className="font-normal whitespace-pre-wrap">{data.notes}</span>} />}
          <section aria-label="Schedule status" className="rounded-xl border border-[#e5e8f0] p-3">
            <div className="flex items-center justify-between gap-2"><p className="text-[11px] leading-[16.5px] font-bold tracking-[0.275px] text-[#68728a] uppercase">Status</p>{tone && <Badge bg={tone.bg} text={tone.text} dot>{statusLabel(data.status)}</Badge>}</div>
            <p className="pt-1.5 text-xs leading-4 text-[#68728a]">{statusHelp[data.status]}</p>
            <div className="flex flex-wrap gap-2 pt-3">
              {data.status === 'DRAFT' && <button type="button" disabled={busy} onClick={() => onPublish(data)} className={`${smallButton} bg-[#273238] text-white hover:bg-[#1a2329]`}>Publish</button>}
              {data.status !== 'CANCELLED' && <button type="button" disabled={busy} onClick={() => onCancel(data)} className={`${smallButton} border border-[#e5e8f0] bg-white text-[#17213c] hover:bg-[#f7f8fc]`}>Cancel series</button>}
              <button type="button" disabled={busy} onClick={() => onDelete(data)} className={`${smallButton} border border-[#fecdd3] bg-white text-[#dc2626] hover:bg-[#fff1f2]`}>Delete</button>
            </div>
          </section>
        </div>}
      </div>

      <footer className="flex shrink-0 items-center gap-2 border-t border-[#e5e8f0] p-5">
        <button type="button" disabled={!data || data.status === 'CANCELLED' || busy} onClick={() => data && onEdit(data)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(170.6deg,#273238_0%,#1a2329_100%)] py-2.5 text-[13px] leading-[19.5px] font-semibold text-white hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"><Pencil size={13} aria-hidden="true" />Edit Schedule</button>
        <button type="button" disabled={busy} onClick={onClose} className="rounded-xl border border-[#e5e8f0] px-4 py-2.5 text-[13px] leading-[19.5px] font-semibold text-[#68728a] hover:bg-[#f7f8fc] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50">Close</button>
      </footer>
    </div>
  </dialog>
}
