import { useEffect, useMemo, useRef, useState } from 'react'
import { Info, X } from 'lucide-react'
import Modal from '../ui/Modal'
import type { AcademicTerm, CalendarEvent, CalendarWeek, ConflictList, FilterOptions, ListSort, MeetingDetail, MeetingListItem, ScheduleDraft, TimetableFilters as Filters, TimetablePage } from '../../types/timetable'
import { cancelMeeting, deleteMeeting, getAcademicTerms, getFilterOptions, getMeetingById, getTimetableCalendar, getTimetableConflicts, getTimetableMeetings, publishMeeting } from '../../services/timetableService'
import { addDays, applyFilterChange, defaultTerm, draftFromMeeting, emptyScheduleDraft, facultyColorMap, hiddenByFilters, initialWeekStart, isMissingMeeting, mondayOf, neutralFacultyColor, sectionLabel, serverFilters, tabId, tabPanelId, timetableError, todayIso } from '../../utils/timetable'
import { ConfirmDelete, SuccessToast } from '../campus/CampusUi'
import TimetableToolbar, { type TimetableTab, type TimetableView } from './TimetableToolbar'
import TimetableFilters from './TimetableFilters'
import WeeklyCalendar from './WeeklyCalendar'
import TimetableList from './TimetableList'
import ScheduleConflicts from './ScheduleConflicts'
import ScheduleFormModal from './ScheduleFormModal'
import ClassDetailsDrawer, { type ScheduleSelection } from './ClassDetailsDrawer'
import { Link } from 'react-router-dom'

// Admin Timetable page (spec 40). State is kept apart: lookups (academic terms, filter options), the filters shared by
// Calendar and List, three server queries keyed by their inputs (calendar week, meetings page, conflicts), the schedule
// selected for the details drawer, and the dialogs. A mutation bumps `version`, which reloads only those queries.

const emptyFilters: Filters = { semesterId: '', academicTermId: '', facultyId: '', departmentId: '', courseId: '' }
const defaultSort: ListSort = { field: 'dayOfWeek', direction: 'asc' }
type Query<T> = { key: string; data?: T; error?: string } | null
const modalButton = 'rounded-xl border border-[#e5e8f0] px-4 py-2 text-sm font-semibold focus-visible:outline-2 disabled:opacity-50'
const scheduleName = (meeting: MeetingDetail) => `${meeting.course.code} ${sectionLabel(meeting.courseSection)}`

export default function TimetableContent() {
  const [view, setView] = useState<TimetableView>('calendar')
  const [tab, setTab] = useState<TimetableTab>('timetable')
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [weekStart, setWeekStart] = useState(() => mondayOf(todayIso()))
  const [listPage, setListPage] = useState(1)
  const [sort, setSort] = useState<ListSort>(defaultSort)
  const [version, setVersion] = useState(0)

  const [termsAttempt, setTermsAttempt] = useState(0)
  const [terms, setTerms] = useState<{ attempt: number; data?: AcademicTerm[]; error?: string } | null>(null)
  const [optionsAttempt, setOptionsAttempt] = useState(0)
  const [options, setOptions] = useState<{ attempt: number; data?: FilterOptions; error?: string } | null>(null)
  const initialised = useRef(false)

  const [calendarAttempt, setCalendarAttempt] = useState(0)
  const [calendar, setCalendar] = useState<Query<CalendarWeek>>(null)
  const [listAttempt, setListAttempt] = useState(0)
  const [list, setList] = useState<Query<TimetablePage<MeetingListItem>>>(null)
  const [conflictsAttempt, setConflictsAttempt] = useState(0)
  const [conflicts, setConflicts] = useState<Query<ConflictList>>(null)

  const [selection, setSelection] = useState<ScheduleSelection | null>(null)
  const [detailsVersion, setDetailsVersion] = useState(0)
  const [form, setForm] = useState<{ mode: 'create' | 'edit'; meeting?: MeetingDetail; initial: ScheduleDraft } | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<{ id: string; label: string; error?: string } | null>(null)
  const [deleting, setDeleting] = useState<{ id: string; label: string } | null>(null)
  const [acting, setActing] = useState(false)
  const actionLock = useRef(false)
  const [toast, setToast] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')

  const termRows = useMemo(() => terms?.data ?? [], [terms])
  const termsLoading = terms?.attempt !== termsAttempt
  const termsError = terms?.attempt === termsAttempt ? terms.error : undefined
  const optionsLoading = options?.attempt !== optionsAttempt
  const optionsError = options?.attempt === optionsAttempt ? options.error : undefined
  const filterOptions = options?.data
  // Data requests wait for the terms so the first calendar/list request already carries the default term.
  const ready = terms?.attempt === termsAttempt

  useEffect(() => {
    const controller = new AbortController()
    getAcademicTerms(controller.signal).then(rows => {
      setTerms({ attempt: termsAttempt, data: rows })
      if (!initialised.current) {
        initialised.current = true
        const term = defaultTerm(rows)
        if (term) { setFilters(current => ({ ...current, semesterId: term.semesterId, academicTermId: term.id })); setWeekStart(initialWeekStart(term)) }
      } else {
        setFilters(current => current.academicTermId && !rows.some(term => term.id === current.academicTermId) ? { ...current, semesterId: '', academicTermId: '' } : current)
      }
    }).catch(error => { if (!controller.signal.aborted) setTerms({ attempt: termsAttempt, error: timetableError(error).message }) })
    return () => controller.abort()
  }, [termsAttempt])

  useEffect(() => {
    const controller = new AbortController()
    getFilterOptions({}, controller.signal).then(data => setOptions({ attempt: optionsAttempt, data })).catch(error => { if (!controller.signal.aborted) setOptions({ attempt: optionsAttempt, error: timetableError(error).message }) })
    return () => controller.abort()
  }, [optionsAttempt])

  // Server-side filter parameters, memoised by value so the query effects depend on their content.
  const meetingParamsJson = JSON.stringify(serverFilters(filters, 'meetings'))
  const meetingParams = useMemo(() => JSON.parse(meetingParamsJson) as Record<string, string>, [meetingParamsJson])
  const conflictParamsJson = JSON.stringify(serverFilters(filters, 'conflicts'))
  const conflictParams = useMemo(() => JSON.parse(conflictParamsJson) as Record<string, string>, [conflictParamsJson])
  const calendarVisible = tab === 'timetable' && view === 'calendar'
  const listVisible = tab === 'timetable' && view === 'list'
  const calendarKey = JSON.stringify(['calendar', meetingParams, weekStart, version, calendarAttempt])
  const listKey = JSON.stringify(['list', meetingParams, listPage, sort, version, listAttempt])
  const conflictsKey = JSON.stringify(['conflicts', conflictParams, version, conflictsAttempt])

  useEffect(() => {
    const key = JSON.stringify(['calendar', meetingParams, weekStart, version, calendarAttempt])
    if (!ready || !calendarVisible) return
    const controller = new AbortController()
    getTimetableCalendar({ ...meetingParams, weekStart }, controller.signal).then(data => setCalendar({ key, data })).catch(error => { if (!controller.signal.aborted) setCalendar({ key, error: timetableError(error).message }) })
    return () => controller.abort()
  }, [meetingParams, weekStart, version, calendarAttempt, ready, calendarVisible])

  useEffect(() => {
    const key = JSON.stringify(['list', meetingParams, listPage, sort, version, listAttempt])
    if (!ready || !listVisible) return
    const controller = new AbortController()
    getTimetableMeetings({ ...meetingParams, page: listPage - 1, sort }, controller.signal).then(data => setList({ key, data })).catch(error => { if (!controller.signal.aborted) setList({ key, error: timetableError(error).message }) })
    return () => controller.abort()
  }, [meetingParams, listPage, sort, version, listAttempt, ready, listVisible])

  useEffect(() => {
    const key = JSON.stringify(['conflicts', conflictParams, version, conflictsAttempt])
    if (!ready) return
    const controller = new AbortController()
    getTimetableConflicts(conflictParams, controller.signal).then(data => setConflicts({ key, data })).catch(error => { if (!controller.signal.aborted) setConflicts({ key, error: timetableError(error).message }) })
    return () => controller.abort()
  }, [conflictParams, version, conflictsAttempt, ready])

  const colors = useMemo(() => facultyColorMap(filterOptions?.faculties ?? []), [filterOptions])
  const colorFor = (facultyId: string) => colors.get(facultyId) ?? neutralFacultyColor

  function changeFilter(key: keyof Filters, value: string) {
    const next = applyFilterChange(filters, key, value, { options: filterOptions ?? { departments: [], courses: [] }, terms: termRows })
    setFilters(next)
    setListPage(1)
    if (next.academicTermId !== filters.academicTermId) {
      const term = termRows.find(entry => entry.id === next.academicTermId)
      if (term && (weekStart < mondayOf(term.startDate) || weekStart > term.endDate)) setWeekStart(initialWeekStart(term))
    }
  }

  function refresh(message?: string) {
    setVersion(current => current + 1)
    setDetailsVersion(current => current + 1)
    if (message) setToast(message)
  }

  async function runAction(action: () => Promise<void>, onError: (message: string) => void) {
    if (actionLock.current) return
    actionLock.current = true
    setActing(true)
    try { await action() } catch (error) {
      onError(timetableError(error, 'write').message)
      if (isMissingMeeting(error)) refresh()
    } finally {
      actionLock.current = false
      setActing(false)
    }
  }

  function openCreate() { setForm({ mode: 'create', initial: { ...emptyScheduleDraft, courseId: filters.courseId } }) }
  function openEdit(meetingId: string, known?: MeetingDetail) {
    if (known) { setForm({ mode: 'edit', meeting: known, initial: draftFromMeeting(known) }); return }
    setActionError('')
    void runAction(async () => {
      const meeting = await getMeetingById(meetingId)
      if (meeting.status === 'CANCELLED') { setActionError(`${scheduleName(meeting)} is cancelled and can no longer be edited.`); return }
      setForm({ mode: 'edit', meeting, initial: draftFromMeeting(meeting) })
    }, setActionError)
  }
  function publish(meetingId: string, label: string) {
    setActionError('')
    void runAction(async () => { await publishMeeting(meetingId); refresh(`${label} published.`) }, setActionError)
  }
  function cancelSeries() {
    if (!confirmCancel) return
    const { id, label } = confirmCancel
    void runAction(async () => { await cancelMeeting(id); setConfirmCancel(null); refresh(`${label} cancelled.`) }, message => setConfirmCancel(current => current ? { ...current, error: message } : current))
  }

  function saved(meeting: MeetingDetail, mode: 'create' | 'edit') {
    setForm(null)
    const label = scheduleName(meeting)
    refresh(mode === 'create' ? `${label} created as a draft. Publish it when it is ready.` : `${label} updated.`)
    if (hiddenByFilters(filters, meeting)) setNotice(`${label} was saved, but it does not match the current term, faculty, department or course filters, so it is not shown in this view.`)
    else if (calendarVisible && (meeting.effectiveTo < weekStart || meeting.effectiveFrom > addDays(weekStart, 6))) setWeekStart(mondayOf(meeting.effectiveFrom))
  }

  const selectEvent = (event: CalendarEvent) => setSelection({ meetingId: event.meetingId, courseCode: event.courseCode, courseName: event.courseName, sectionNumber: event.sectionNumber, facultyId: event.facultyId })
  const selectItem = (item: MeetingListItem) => setSelection({ meetingId: item.id, courseCode: item.courseCode, courseName: item.courseName, sectionNumber: item.sectionNumber, facultyId: item.facultyId })
  const itemLabel = (item: MeetingListItem) => `${item.courseCode} SEC-${item.sectionNumber}`
  const conflictTotal = conflicts?.data ? conflicts.data.total : null
  const noTerms = ready && !termsError && !termRows.length

  return <div className="min-h-full bg-[#fafbfc]">
    <TimetableToolbar view={view} onViewChange={setView} tab={tab} onTabChange={setTab} conflictCount={conflictTotal} onAdd={openCreate}>
      <TimetableFilters filters={filters} onChange={changeFilter} options={filterOptions} optionsLoading={optionsLoading} optionsError={optionsError} onRetryOptions={() => setOptionsAttempt(current => current + 1)}
        terms={termRows} termsLoading={termsLoading} termsError={termsError} onRetryTerms={() => setTermsAttempt(current => current + 1)} />
    </TimetableToolbar>

    {noTerms && <div role="status" className="mx-4 mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#fcd34d] bg-[#fffbeb] px-4 py-3 text-[13px] leading-5 text-[#92400e] sm:mx-7">
      <Info size={16} aria-hidden="true" className="shrink-0" />
      <p className="flex-1">No academic terms exist yet. Create a term on the Academic Terms page, assign it to course sections on the Course Sections page, then add class schedules.</p>
      <Link to="/admin/academic-terms" className="rounded-lg border border-[#fcd34d] bg-white px-3 py-1.5 text-xs font-semibold text-[#92400e] focus-visible:outline-2">Manage Terms</Link>
    </div>}
    {notice && <div role="status" className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-[13px] leading-5 text-[#1d4ed8] sm:mx-7">
      <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" /><p className="flex-1">{notice}</p>
      <button type="button" aria-label="Dismiss message" onClick={() => setNotice('')} className="rounded p-0.5 focus-visible:outline-2"><X size={14} /></button>
    </div>}
    {actionError && <div role="alert" className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-[13px] leading-5 text-[#be123c] sm:mx-7">
      <p className="flex-1">{actionError}</p>
      <button type="button" aria-label="Dismiss error" onClick={() => setActionError('')} className="rounded p-0.5 focus-visible:outline-2"><X size={14} /></button>
    </div>}

    <div role="tabpanel" id={tabPanelId('timetable')} aria-labelledby={tabId('timetable')} hidden={tab !== 'timetable'} className={tab === 'timetable' ? 'pt-4' : undefined}>
      {view === 'calendar'
        ? <WeeklyCalendar weekStart={weekStart} week={calendar?.data} loading={calendar?.key !== calendarKey} error={calendar?.key === calendarKey ? calendar.error : undefined} onRetry={() => setCalendarAttempt(current => current + 1)}
          onWeekChange={value => setWeekStart(value === 'today' ? mondayOf(todayIso()) : value)} onSelect={selectEvent} colorFor={colorFor} />
        : <TimetableList page={list?.data} pageNumber={listPage} loading={list?.key !== listKey} error={list?.key === listKey ? list.error : undefined} onRetry={() => setListAttempt(current => current + 1)}
          sort={sort} onSort={next => { setSort(next); setListPage(1) }} onPage={setListPage} onView={selectItem} onEdit={item => openEdit(item.id)} onPublish={item => publish(item.id, itemLabel(item))} onCancel={item => setConfirmCancel({ id: item.id, label: itemLabel(item) })} />}
    </div>
    <div role="tabpanel" id={tabPanelId('conflicts')} aria-labelledby={tabId('conflicts')} hidden={tab !== 'conflicts'}>
      <ScheduleConflicts data={conflicts?.data} loading={conflicts?.key !== conflictsKey} error={conflicts?.key === conflictsKey ? conflicts.error : undefined} onRetry={() => setConflictsAttempt(current => current + 1)}
        courseFilterActive={!!filters.courseId} onView={meetingId => setSelection({ meetingId })} onEdit={meetingId => openEdit(meetingId)} />
    </div>

    {form && <ScheduleFormModal mode={form.mode} meeting={form.meeting} initial={form.initial} options={filterOptions} optionsError={optionsError} onRetryOptions={() => setOptionsAttempt(current => current + 1)} terms={termRows} onClose={() => setForm(null)} onSaved={meeting => saved(meeting, form.mode)} />}
    {selection && <ClassDetailsDrawer selection={selection} reloadKey={detailsVersion} colorFor={colorFor} busy={acting} onClose={() => setSelection(null)} onEdit={meeting => openEdit(meeting.id, meeting)}
      onPublish={meeting => publish(meeting.id, scheduleName(meeting))} onCancel={meeting => setConfirmCancel({ id: meeting.id, label: scheduleName(meeting) })} onDelete={meeting => setDeleting({ id: meeting.id, label: scheduleName(meeting) })} onMissing={() => setVersion(current => current + 1)} />}
    {confirmCancel && <Modal title="Cancel class series" onClose={() => { if (!acting) setConfirmCancel(null) }} busy={acting}>
      <p className="text-sm leading-6 text-[#68728a]">Cancel <strong className="text-[#17213c]">{confirmCancel.label}</strong>? The series disappears from the student timetable and cannot be republished; the record stays visible as cancelled.</p>
      {confirmCancel.error && <p role="alert" className="mt-3 text-sm text-[#d80255]">{confirmCancel.error}</p>}
      <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={acting} onClick={() => setConfirmCancel(null)} className={modalButton}>Keep schedule</button><button type="button" disabled={acting} onClick={cancelSeries} className={`${modalButton} border-[#dc2626] bg-[#dc2626] text-white`}>{acting ? 'Cancelling…' : 'Cancel series'}</button></div>
    </Modal>}
    {deleting && <ConfirmDelete title="Delete class schedule" onClose={() => setDeleting(null)} onConfirm={() => deleteMeeting(deleting.id)} onDeleted={() => { setDeleting(null); setSelection(null); refresh(`${deleting.label} deleted.`) }} describeError={error => timetableError(error, 'write').message}>
      Delete <strong>{deleting.label}</strong>? Every occurrence of this weekly schedule is removed permanently. To keep the record, cancel the series instead.
    </ConfirmDelete>}
    <SuccessToast message={toast} onDismiss={() => setToast('')} />
  </div>
}
