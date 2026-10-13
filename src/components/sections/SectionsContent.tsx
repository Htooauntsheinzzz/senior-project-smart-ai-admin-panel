import { useEffect, useState } from 'react'
import type { Semester } from '../../services/courseService'
import type { ApiSection, SectionSummary } from '../../services/sectionService'
import type { SectionDraft, SectionFilters } from '../../types/courseSection'
import { getCourseDirectory } from '../../services/courseService'
import { getSemesters } from '../../services/courseService'
import { createSection, getSectionDirectory, getSectionSummary, updateSection } from '../../services/sectionService'
import { adaptApiSectionToCourseSection, sectionError } from '../../utils/sectionApi'
import { emptySectionFilters, sectionStatus, sectionTotals } from '../../utils/courseSections'
import SectionsTable from './SectionsTable'
import CreateSectionDrawer from './CreateSectionDrawer'
import SectionActions from './SectionActions'

const semesterYear = (name: string) => name.match(/\b(?:19|20|25|26)\d{2}\b/)?.[0] ?? ''

export default function SectionsContent({ adding, onOpen: openCreate, onClose, onEditing }: { adding: boolean; onOpen: () => void; onClose: () => void; onEditing: (open: boolean) => void }) {
  const [filters, setFilters] = useState<SectionFilters>({ ...emptySectionFilters })
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<ApiSection | null>(null)
  const [editing, setEditing] = useState<ApiSection | null>(null)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; rows?: ApiSection[]; error?: string } | null>(null)
  const [summary, setSummary] = useState<{ version: number; data?: SectionSummary; error?: string } | null>(null)
  const [courses, setCourses] = useState<{ id: string; code: string; name: string; status: string }[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [lookupError, setLookupError] = useState('')
  const [lookupAttempt, setLookupAttempt] = useState(0)
  const [lecturers, setLecturers] = useState<Record<string, string>>({})
  const key = JSON.stringify([filters, version])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      getSectionDirectory(filters, controller.signal).then(rows => { if (!controller.signal.aborted) { setResult({ key, rows }); setLecturers(previous => ({ ...previous, ...Object.fromEntries(rows.map(row => [row.lectureId, row.lectureNameEn || row.lectureNameTh])) })) } }).catch(error => { if (!controller.signal.aborted) setResult({ key, error: sectionError(error).message }) })
    }, 300)
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [filters, version, key])

  useEffect(() => {
    const controller = new AbortController()
    getSectionSummary(controller.signal).then(data => { if (!controller.signal.aborted) setSummary({ version, data }) }).catch(error => { if (!controller.signal.aborted) setSummary({ version, error: sectionError(error).message }) })
    return () => controller.abort()
  }, [version])

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      getCourseDirectory({ query: '', facultyId: '', departmentId: '', programId: '', year: '', term: '', status: '' }, controller.signal),
      getSemesters(controller.signal),
    ]).then(([c, s]) => {
      if (controller.signal.aborted) return
      setCourses(c)
      setSemesters(s)
      setLookupError('')
    }).catch(() => { if (!controller.signal.aborted) setLookupError('Unable to load lookup options.') })
    return () => controller.abort()
  }, [lookupAttempt])

  useEffect(() => {
    onEditing(!!editing)
  }, [editing, onEditing])

  const current = result?.key === key ? result : null
  const totals = summary?.version === version ? summary : null
  const apiRows = current?.rows ?? []
  const courseSections = apiRows.map(adaptApiSectionToCourseSection)
  // Backend handles search, courseId, semesterId, lecturerId, active/closed status.
  // Only 'full' status needs client-side filtering.
  const statusFiltered = filters.status === 'full'
    ? courseSections.filter(s => sectionStatus(s) === 'Full')
    : courseSections
  const filtered = statusFiltered.filter(s => !filters.academicYear || semesterYear(s.semester) === filters.academicYear)
  const visibleTotals = sectionTotals(filtered)

  function closeEdit() { setEditing(null); onEditing(false) }
  function onOpen() { if (!editing && !selected && !adding) openCreate() }

  async function saveSection(input: SectionDraft) {
    const payload: Record<string, string> = {
      courseId: input.courseId,
      number: input.number,
      capacity: input.capacity,
      lecturerId: input.lecturerId,
      room: input.room,
      schedule: input.schedule,
      semester: input.semester,
      status: input.status,
    }
    if (editing) await updateSection(editing.id, payload)
    else await createSection(payload)
    const operation = editing ? 'updated' : 'created'
    if (editing) closeEdit(); else onClose()
    setVersion(previous => previous + 1)
    setMessage(`Section ${input.number.trim()} was ${operation} successfully. Refreshing server data.${Object.values(filters).some(Boolean) ? ' Your current filters may hide this section.' : ''}`)
  }

  const dropdowns: { key: keyof SectionFilters; label: string; width: string; options: { value: string; label: string }[] }[] = [
    { key: 'courseId', label: 'Course', width: 'sm:w-[130px]', options: courses.map(course => ({ value: course.id, label: course.code })) },
    { key: 'semester', label: 'Semester', width: 'sm:w-[130px]', options: semesters.map(semester => ({ value: semester.id, label: semester.semesterNameEn })) },
    { key: 'academicYear', label: 'Year', width: 'sm:w-[110px]', options: [...new Set(semesters.map(s => semesterYear(s.semesterNameEn)).filter(Boolean))].map(year => ({ value: year, label: year })) },
    { key: 'lecturerId', label: 'Lecturer', width: 'sm:w-[251px]', options: Object.entries(lecturers).map(([id, name]) => ({ value: id, label: name })) },
    { key: 'status', label: 'Status', width: 'sm:w-[130px]', options: ['Active', 'Full', 'Closed'].map(status => ({ value: status.toLowerCase(), label: status })) },
  ]

  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-[1.25px] border-[#e5e8f0] px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Course Sections</h1><p className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">Manage individual course sections, lecturers, and class capacity.</p></div><button type="button" onClick={onOpen} aria-expanded={adding} className="inline-flex items-center gap-2 rounded-xl bg-linear-[165deg,#273238,#1a2329] px-4 py-2 text-[13px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2"><img src="/assets/figma/faculty-plus.svg" width="16" height="16" alt="" />Create Section</button></header>
    <div className="grid grid-cols-1 gap-4 px-4 pt-4 pb-1 sm:grid-cols-2 sm:px-7 xl:grid-cols-4">{[
      { label: 'Total Sections', value: totals?.data?.totalSections ?? '—', icon: '📂', color: '#273238', background: 'rgba(39,50,56,0.07)' },
      { label: 'Active Sections', value: totals?.data?.activeSections ?? '—', icon: '✅', color: '#059669', background: '#d1fae5' },
      { label: 'Full Sections', value: totals?.data?.fullSections ?? '—', icon: '⚠️', color: '#d97706', background: '#fef3c7' },
      { label: 'Total Enrolled', value: totals?.data?.totalEnrolled ?? '—', icon: '👥', color: '#7c3aed', background: '#ede9fe' },
    ].map(metric => <div key={metric.label} className="flex items-center gap-3.5 rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white px-4 py-3.5"><span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: metric.background }}>{metric.icon}</span><div><p className="font-display text-xl leading-5 font-extrabold" style={{ color: metric.color }}>{metric.value}</p><p className="mt-1 text-[11px] text-[#68728a]">{metric.label}</p></div></div>)}</div>
    <div className="flex flex-wrap items-center gap-3 px-4 pt-4 pb-3 sm:px-7"><div className="relative w-full sm:w-[260px]"><img src="/assets/figma/faculty-search.svg" width="16" height="16" alt="" className="pointer-events-none absolute top-3.5 left-3.5" /><input type="search" aria-label="Search course or section" placeholder="Search course or section…" value={filters.query} onChange={event => setFilters(previous => ({ ...previous, query: event.target.value }))} className="h-[42px] w-full rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-3.5 pl-10 text-[13px] placeholder:text-[#17213c]/50 focus-visible:outline-2" /></div>{dropdowns.map(dropdown => <div key={dropdown.key} className={`relative w-full ${dropdown.width}`}><select aria-label={dropdown.label} value={filters[dropdown.key]} onChange={event => setFilters(previous => ({ ...previous, [dropdown.key]: event.target.value }))} className="h-[39px] w-full appearance-none rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-9 pl-3.5 text-[13px] text-[#68728a] focus-visible:outline-2"><option value="">{dropdown.label}</option>{dropdown.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><img src="/assets/figma/department-filter-arrow.svg" width="10" height="6" alt="" className="pointer-events-none absolute top-4 right-3.5" /></div>)}</div>
    <div className="px-4 pb-6 sm:px-7"><SectionsTable sections={filtered} apiSections={apiRows} loading={!current} error={current?.error} onRetry={() => setVersion(previous => previous + 1)} onClear={() => setFilters({ ...emptySectionFilters })} onAction={section => { const api = apiRows.find(s => s.id === section.id); if (api) setSelected(api) }} busy={adding || !!editing} /><div role="status" className="flex flex-wrap justify-between gap-2 pt-3 text-[12.5px] text-[#68728a]"><p>Showing <strong className="text-[#17213c]">{current?.rows ? filtered.length : '—'}</strong> of <strong className="text-[#17213c]">{totals?.data?.totalSections ?? '—'}</strong> sections</p><p>{current?.rows ? visibleTotals.enrolled : '—'} enrolled / {current?.rows ? visibleTotals.capacity : '—'} total capacity</p></div>
      {totals?.error && <p role="alert" className="mt-3 text-xs text-[#68728a]">Summary could not be refreshed. {totals.error} <button type="button" onClick={() => setVersion(previous => previous + 1)} className="rounded px-2 py-1 underline focus-visible:outline-2">Retry</button></p>}
      {lookupError && <p role="alert" className="mt-3 text-xs text-[#68728a]">{lookupError} <button type="button" onClick={() => setLookupAttempt(previous => previous + 1)} className="rounded px-2 py-1 underline focus-visible:outline-2">Retry</button></p>}
      <p role="status" className="mt-2 text-[13px] leading-5 text-[#68728a]">{message}</p></div>
    {(adding || editing) && <CreateSectionDrawer key={editing?.id ?? 'new'} section={editing ?? undefined} courses={courses.filter(course => course.status === 'active')} semesters={semesters} onSave={saveSection} onClose={editing ? closeEdit : onClose} />}
    {selected && <SectionActions key={selected.id} id={selected.id} onClose={() => setSelected(null)} onEdit={section => { setSelected(null); setEditing(section) }} onDeleted={() => { setSelected(null); setVersion(previous => previous + 1); setMessage('Section deleted successfully. Refreshing server data.') }} />}
  </main>
}
