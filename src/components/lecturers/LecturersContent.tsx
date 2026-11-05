import { useEffect, useState } from 'react'
import { CircleCheck, X } from 'lucide-react'
import type { Faculty } from '../../types/faculty'
import type { ApiDepartment } from '../../services/departmentService'
import type { LecturerDraft, LecturerFilters } from '../../types/lecturer'
import { getFaculties } from '../../services/facultyService'
import { getDepartmentDirectory } from '../../services/departmentService'
import { createLecturer, getLecturerDirectory, getLecturerSummary, updateLecturer, type ApiLecturer, type LecturerSummary } from '../../services/lecturerService'
import { lecturerError } from '../../utils/lecturerApi'
import LecturersTable from './LecturersTable'
import AddLecturerDrawer from './AddLecturerDrawer'
import LecturerActions from './LecturerActions'

export default function LecturersContent({ adding, onOpen, onClose, onEditing }: { adding: boolean; onOpen: () => void; onClose: () => void; onEditing: (open: boolean) => void }) {
  const [filters, setFilters] = useState<LecturerFilters>({ query: '', facultyId: '', departmentId: '', status: '' })
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<ApiLecturer | null>(null)
  const [editing, setEditing] = useState<ApiLecturer | null>(null)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; rows?: ApiLecturer[]; error?: string } | null>(null)
  const [summary, setSummary] = useState<{ version: number; data?: LecturerSummary; error?: string } | null>(null)
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<ApiDepartment[]>([])
  const [lookupError, setLookupError] = useState('')
  const [lookupAttempt, setLookupAttempt] = useState(0)
  const key = JSON.stringify([filters, version])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      getLecturerDirectory(filters, controller.signal).then(rows => { if (!controller.signal.aborted) setResult({ key, rows }) }).catch(error => { if (!controller.signal.aborted) setResult({ key, error: lecturerError(error).message }) })
    }, 300)
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [filters, version, key])

  useEffect(() => {
    const controller = new AbortController()
    getLecturerSummary(controller.signal).then(data => { if (!controller.signal.aborted) setSummary({ version, data }) }).catch(error => { if (!controller.signal.aborted) setSummary({ version, error: lecturerError(error).message }) })
    return () => controller.abort()
  }, [version])

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      getFaculties('', controller.signal),
      getDepartmentDirectory({ query: '', facultyId: '', status: '' }, controller.signal),
    ]).then(([facultyRows, departmentRows]) => {
      if (controller.signal.aborted) return
      setFaculties(facultyRows)
      setDepartments(departmentRows)
      setLookupError('')
    }).catch(() => { if (!controller.signal.aborted) setLookupError('Unable to load faculty and department options.') })
    return () => controller.abort()
  }, [lookupAttempt])

  // Success alerts dismiss themselves; a new message restarts the timer.
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(''), 4000)
    return () => window.clearTimeout(timer)
  }, [message])

  const current = result?.key === key ? result : null
  const totals = summary?.version === version ? summary : null

  function closeEdit() { setEditing(null); onEditing(false) }

  async function saveLecturer(input: LecturerDraft) {
    if (editing) await updateLecturer(editing.id, input)
    else await createLecturer(input)
    const operation = editing ? 'updated' : 'created'
    if (editing) closeEdit(); else onClose()
    setVersion(previous => previous + 1)
    setMessage(`Lecturer ${operation} successfully.`)
  }

  function changeFaculty(previous: LecturerFilters, facultyId: string) {
    const compatible = departments.some(d => d.id === previous.departmentId && (!facultyId || d.facultyId === facultyId))
    return { ...previous, facultyId, departmentId: compatible ? previous.departmentId : '' }
  }

  const dropdowns: { key: keyof LecturerFilters; label: string; width: string; options: { value: string; label: string }[] }[] = [
    { key: 'facultyId', label: 'Faculty', width: 'sm:w-[261px]', options: faculties.map(faculty => ({ value: faculty.id, label: faculty.nameEn.replace(/^Faculty of /, '') })) },
    { key: 'departmentId', label: 'Department', width: 'sm:w-[198px]', options: departments.filter(d => !filters.facultyId || d.facultyId === filters.facultyId).map(d => ({ value: d.id, label: d.name })) },
    { key: 'status', label: 'Status', width: 'sm:w-[150px]', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
  ]

  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-[1.25px] border-[#e5e8f0] px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Lecturers</h1><p className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">Manage lecturers and their faculty and department assignments.</p></div><button type="button" onClick={onOpen} aria-expanded={adding} className="inline-flex items-center gap-2 rounded-xl bg-linear-[165deg,#273238,#1a2329] px-4 py-2 text-[13px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2"><img src="/assets/figma/faculty-plus.svg" width="16" height="16" alt="" />Add Lecturer</button></header>
    <div className="flex flex-wrap items-center gap-3 px-4 pt-4 pb-3 sm:px-7"><div className="relative w-full sm:w-[280px]"><img src="/assets/figma/faculty-search.svg" width="16" height="16" alt="" className="pointer-events-none absolute top-3.5 left-3.5" /><input type="search" aria-label="Search lecturer name or nickname" placeholder="Search lecturer name or nickname…" value={filters.query} onChange={event => setFilters(previous => ({ ...previous, query: event.target.value }))} className="h-[42px] w-full rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-3.5 pl-10 text-[13px] placeholder:text-[#17213c]/50 focus-visible:outline-2" /></div>
      {dropdowns.map(filter => <div key={filter.key} className={`relative w-full ${filter.width}`}><select aria-label={filter.label} value={filters[filter.key]} onChange={event => setFilters(previous => filter.key === 'facultyId' ? changeFaculty(previous, event.target.value) : { ...previous, [filter.key]: event.target.value })} className="h-[39px] w-full appearance-none rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-9 pl-3.5 text-[13px] text-[#68728a] focus-visible:outline-2"><option value="">{filter.label}</option>{filter.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><img src="/assets/figma/department-filter-arrow.svg" width="10" height="6" alt="" className="pointer-events-none absolute top-4 right-3.5" /></div>)}
    </div>
    <div className="px-4 pb-6 sm:px-7"><LecturersTable lecturers={current?.rows ?? []} loading={!current} error={current?.error} onRetry={() => setVersion(previous => previous + 1)} busy={adding || !!editing} onAction={setSelected} /><p role="status" className="pt-3 text-[13px] text-[#68728a]">Showing <strong className="font-semibold text-[#17213c]">{current?.rows?.length ?? '—'}</strong> of <strong className="font-semibold text-[#17213c]">{totals?.data?.totalLectures ?? '—'}</strong> lecturers</p>
      {totals?.error && <p role="alert" className="mt-3 text-xs text-[#68728a]">Total could not be refreshed. {totals.error} <button type="button" onClick={() => setVersion(previous => previous + 1)} className="rounded px-2 py-1 underline focus-visible:outline-2">Retry</button></p>}
      {lookupError && <p role="alert" className="mt-3 text-xs text-[#68728a]">{lookupError} <button type="button" onClick={() => setLookupAttempt(previous => previous + 1)} className="rounded px-2 py-1 underline focus-visible:outline-2">Retry</button></p>}</div>
    {(adding || editing) && <AddLecturerDrawer key={editing?.id ?? 'new'} lecturer={editing ?? undefined} departments={departments} faculties={faculties} onAdd={saveLecturer} onClose={editing ? closeEdit : onClose} />}
    {selected && <LecturerActions key={selected.id} id={selected.id} onClose={() => setSelected(null)} onEdit={lecturer => { setSelected(null); setEditing(lecturer); onEditing(true) }} onDeleted={() => { setSelected(null); setVersion(previous => previous + 1); setMessage('Lecturer deleted successfully.') }} />}
    {message && <div role="status" className="fixed right-4 bottom-4 z-40 flex max-w-[calc(100vw-32px)] items-center gap-3 rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] p-4 text-[13px] leading-5 font-semibold text-[#047857] shadow-lg sm:max-w-sm"><CircleCheck size={18} aria-hidden="true" className="shrink-0" /><p>{message}</p><button type="button" aria-label="Dismiss message" onClick={() => setMessage('')} className="ml-auto rounded p-1 focus-visible:outline-2"><X size={16} /></button></div>}
  </main>
}
