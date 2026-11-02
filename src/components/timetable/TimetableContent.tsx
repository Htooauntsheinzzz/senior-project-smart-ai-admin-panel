import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarDays, List, RefreshCw } from 'lucide-react'
import { getSemesters, type Semester } from '../../services/courseService'
import { emptyTimetableQuery, getTimetablePage, timetableError, type TimetablePage, type TimetableQuery } from '../../services/timetableService'
import Pagination from '../ui/Pagination'

const button = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#e5e8f0] bg-white px-4 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'
const control = 'min-h-10 rounded-xl border border-[#e5e8f0] bg-white px-3 py-2 text-sm focus-visible:outline-2 disabled:opacity-50'

export default function TimetableContent() {
  const [view, setView] = useState<'list' | 'calendar' | 'conflicts'>('list')
  const [filters, setFilters] = useState({ ...emptyTimetableQuery })
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; data?: TimetablePage; error?: string }>()
  const [semesters, setSemesters] = useState<Semester[]>()
  const [lookupError, setLookupError] = useState('')
  const key = JSON.stringify({ filters, page, version })
  const current = result?.key === key ? result : undefined
  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      getTimetablePage(filters, page - 1, controller.signal).then(data => {
        if (controller.signal.aborted) return
        if (page > Math.max(1, data.totalPages)) { setPage(Math.max(1, data.totalPages)); return }
        setResult({ key, data })
      }).catch(error => { if (!controller.signal.aborted) setResult({ key, error: timetableError(error) }) })
    }, 250)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [key, filters, page])
  useEffect(() => {
    const controller = new AbortController()
    getSemesters(controller.signal).then(data => { if (!controller.signal.aborted) { setSemesters(data); setLookupError('') } }).catch(() => { if (!controller.signal.aborted) { setSemesters(undefined); setLookupError('Semester choices could not be loaded. Retry or use search and status filters.') } })
    return () => controller.abort()
  }, [version])
  function change(field: keyof TimetableQuery, value: string) { setFilters(previous => ({ ...previous, [field]: value })); setPage(1) }
  return <main id="timetable-content" className="min-w-0 text-[#17213c]">
    <header className="border-b border-[#e5e8f0] bg-white px-4 pt-6 pb-5 sm:px-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Class Timetable</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Course-section schedules from the existing academic APIs.</p></div><div className="flex flex-wrap gap-3"><button type="button" onClick={() => setVersion(v => v + 1)} className={button}><RefreshCw size={14} aria-hidden="true" />Refresh</button><Link to="/admin/sections" className={`${button} bg-[#273238] text-white`}>Manage Course Sections</Link></div></div>
      <div role="group" aria-label="Timetable view" className="mt-5 flex flex-wrap gap-2">{([{ id: 'list', label: 'List', icon: List }, { id: 'calendar', label: 'Calendar', icon: CalendarDays }, { id: 'conflicts', label: 'Schedule Conflicts', icon: AlertTriangle }] as const).map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)} className={`${button} ${view === id ? 'bg-[#273238] text-white' : 'text-[#68728a]'}`}><Icon size={14} aria-hidden="true" />{label}</button>)}</div>
    </header>
    <div className="px-4 py-5 sm:px-7"><section aria-labelledby="timetable-api-title" className="mb-5 rounded-2xl border border-[#e5e8f0] bg-white p-4"><h2 id="timetable-api-title" className="text-sm font-semibold">Available schedule data</h2><p className="mt-1 text-[13px] leading-6 text-[#68728a]">The backend stores room and schedule text on course sections. The list shows that text as saved. Structured weekdays, start/end times, recurrence and conflict records are not available. Use Course Sections to create or edit section schedules.</p></section>
      {view !== 'list' ? <section aria-labelledby="timetable-unavailable-title" className="rounded-2xl border border-[#e5e8f0] bg-white px-6 py-12 text-center"><CalendarDays size={32} aria-hidden="true" className="mx-auto mb-3 text-[#8791a8]" /><h2 id="timetable-unavailable-title" className="text-base font-semibold">{view === 'calendar' ? 'Calendar data unavailable' : 'Conflict detection unavailable'}</h2><p role="status" className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#68728a]">{view === 'calendar' ? 'A weekly calendar requires structured session dates, times and recurrence. Free-text section schedules are not interpreted as calendar events.' : 'No conflict API or structured session data is available. An unavailable conflict count does not mean that schedules are conflict-free.'}</p><button type="button" onClick={() => setView('list')} className={`${button} mt-5`}>View Section Schedules</button></section> : <>
        <div className="mb-4 flex flex-wrap gap-3"><input type="search" aria-label="Search course sections" placeholder="Search course or section…" maxLength={255} value={filters.search} onChange={e => change('search', e.target.value)} className={`${control} min-w-[200px] flex-1`} /><select aria-label="Semester" disabled={!semesters} value={filters.semesterId} onChange={e => change('semesterId', e.target.value)} className={`${control} max-w-full`}><option value="">All Semesters</option>{semesters?.map(s => <option key={s.id} value={s.id}>{s.semesterNameEn}</option>)}</select><select aria-label="Section status" value={filters.status} onChange={e => change('status', e.target.value)} className={control}><option value="">All Statuses</option><option value="ACTIVE">Active</option><option value="CLOSED">Closed</option></select><button type="button" onClick={() => { setFilters({ ...emptyTimetableQuery }); setPage(1) }} className={button}>Clear Filters</button></div>
        {lookupError && <p role="alert" className="mb-4 text-sm text-red-700">{lookupError} <button onClick={() => setVersion(v => v + 1)} className="underline">Retry</button></p>}
        {!current ? <p role="status" className="py-12 text-center">Loading section schedules…</p> : current.error ? <p role="alert" className="py-12 text-center">{current.error} <button onClick={() => setVersion(v => v + 1)} className="underline">Retry</button></p> : <>
          <div className="overflow-hidden rounded-2xl border border-[#e5e8f0] bg-white"><div role="region" aria-label="Course section schedules table" tabIndex={0} className="overflow-x-auto focus-visible:outline-2"><table className="w-full min-w-[1050px] text-left text-[13px]"><caption className="sr-only">Saved course-section schedule text, rooms, lecturers and semesters</caption><thead className="bg-[#f7f8fc] text-xs text-[#68728a]"><tr>{['Course', 'Section', 'Lecturer', 'Room', 'Schedule (as stored)', 'Semester', 'Status'].map(label => <th key={label} scope="col" className="px-4 py-4 font-semibold">{label}</th>)}</tr></thead><tbody>{current.data?.rows.map(row => <tr key={row.id} className="border-t border-[#e5e8f0]"><th scope="row" className="px-4 py-4 font-semibold">{row.courseCode}<span className="mt-1 block text-xs font-normal text-[#68728a]">{row.courseName}</span></th><td className="px-4 py-4">{row.sectionNumber}</td><td className="px-4 py-4">{row.lectureNameEn}</td><td className="px-4 py-4">{row.room || 'Not specified'}</td><td className="max-w-sm px-4 py-4 whitespace-pre-wrap break-words">{row.schedule || 'Not specified'}</td><td className="px-4 py-4">{row.semesterNameEn}</td><td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-xs ${row.status === 'ACTIVE' ? 'bg-[#d1fae5] text-[#059669]' : 'bg-[#f0f1f3] text-[#68728a]'}`}>{row.status}</span></td></tr>)}</tbody></table></div>{!current.data?.rows.length && <p role="status" className="px-6 py-12 text-center text-sm">No course sections match these filters.</p>}</div>
          <Pagination label="Timetable pagination" page={page} pageCount={Math.max(1, current.data?.totalPages ?? 1)} onPage={setPage} summary={`${current.data?.totalElements ?? 0} course sections · page ${page}`} />
        </>}
      </>}
    </div>
  </main>
}
