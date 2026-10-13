import { useEffect, useState } from 'react'
import { degrees } from '../../data/programs'
import type { Faculty } from '../../types/faculty'
import type { ApiDepartment } from '../../services/departmentService'
import type { ProgramDraft, ProgramFilters } from '../../types/program'
import { getFaculties } from '../../services/facultyService'
import { getDepartmentDirectory } from '../../services/departmentService'
import { createProgram, getProgramDirectory, getProgramSummary, updateProgram, type ApiProgram, type ProgramSummary } from '../../services/programService'
import { degreeNameFromId, programError } from '../../utils/programApi'
import ProgramsTable from './ProgramsTable'
import AddProgramDrawer from './AddProgramDrawer'
import ProgramActions from './ProgramActions'

export default function ProgramsContent({ adding, onOpen, onClose, onEditing }: { adding: boolean; onOpen: () => void; onClose: () => void; onEditing: (open: boolean) => void }) {
  const [filters, setFilters] = useState<ProgramFilters>({ query: '', facultyId: '', departmentId: '', degreeId: '', status: '' })
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<ApiProgram | null>(null)
  const [editing, setEditing] = useState<ApiProgram | null>(null)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; rows?: ApiProgram[]; error?: string } | null>(null)
  const [summary, setSummary] = useState<{ version: number; data?: ProgramSummary; error?: string } | null>(null)
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<ApiDepartment[]>([])
  const [lookupError, setLookupError] = useState('')
  const [lookupAttempt, setLookupAttempt] = useState(0)
  const key = JSON.stringify([filters, version])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      getProgramDirectory(filters, controller.signal).then(rows => { if (!controller.signal.aborted) setResult({ key, rows }) }).catch(error => { if (!controller.signal.aborted) setResult({ key, error: programError(error).message }) })
    }, 300)
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [filters, version, key])

  useEffect(() => {
    const controller = new AbortController()
    getProgramSummary(controller.signal).then(data => { if (!controller.signal.aborted) setSummary({ version, data }) }).catch(error => { if (!controller.signal.aborted) setSummary({ version, error: programError(error).message }) })
    return () => controller.abort()
  }, [version])

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      getFaculties('', controller.signal).then(rows => ({ type: 'faculties' as const, rows })),
      getDepartmentDirectory({ query: '', facultyId: '', status: '' }, controller.signal).then(rows => ({ type: 'departments' as const, rows })),
    ]).then(results => {
      if (controller.signal.aborted) return
      results.forEach(r => {
        if (r.type === 'faculties') setFaculties(r.rows)
        else setDepartments(r.rows)
      })
      setLookupError('')
    }).catch(() => { if (!controller.signal.aborted) setLookupError('Unable to load filter options.') })
    return () => controller.abort()
  }, [lookupAttempt])

  const current = result?.key === key ? result : null
  const totals = summary?.version === version ? summary : null

  function closeEdit() { setEditing(null); onEditing(false) }

  async function saveProgram(input: ProgramDraft) {
    const degreeName = degreeNameFromId(input.degreeId)
    if (editing) await updateProgram(editing.id, input, degreeName)
    else await createProgram(input, degreeName)
    const operation = editing ? 'updated' : 'created'
    if (editing) closeEdit(); else onClose()
    setVersion(previous => previous + 1)
    const query = filters.query.trim().toLowerCase()
    const hidden = !!((filters.facultyId && filters.facultyId !== input.facultyId) || (filters.departmentId && filters.departmentId !== input.departmentId) || (filters.degreeId && filters.degreeId !== input.degreeId) || (filters.status && filters.status !== input.status) || (query && ![input.code, input.name].some(text => text.toLowerCase().includes(query))))
    setMessage(`${input.name.trim()} was ${operation} successfully.${hidden ? ' Your current filters hide this program.' : ''} Refreshing server data.`)
  }

  function changeFaculty(previous: ProgramFilters, facultyId: string) {
    const compatible = departments.some(d => d.id === previous.departmentId && (!facultyId || d.facultyId === facultyId))
    return { ...previous, facultyId, departmentId: compatible ? previous.departmentId : '' }
  }

  const facultyOptions = faculties.map(faculty => ({ value: faculty.id, label: faculty.nameEn.replace(/^Faculty of /, '') }))
  const departmentOptions = departments.filter(d => !filters.facultyId || d.facultyId === filters.facultyId).map(d => ({ value: d.id, label: d.name }))
  const degreeOptions = degrees.map(degree => ({ value: degree.id, label: degree.name }))

  const dropdowns: { key: keyof ProgramFilters; label: string; width: string; options: { value: string; label: string }[] }[] = [
    { key: 'facultyId', label: 'Faculty', width: 'sm:w-[261px]', options: facultyOptions },
    { key: 'departmentId', label: 'Department', width: 'sm:w-[198px]', options: departmentOptions },
    { key: 'degreeId', label: 'Degree Level', width: 'sm:w-[259px]', options: degreeOptions },
    { key: 'status', label: 'Status', width: 'sm:w-[150px]', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
  ]

  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-[1.25px] border-[#e5e8f0] px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Programs &amp; Majors</h1><p className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">Manage academic programs and degree offerings across all departments.</p></div><button type="button" onClick={onOpen} aria-expanded={adding} className="inline-flex items-center gap-2 rounded-xl bg-linear-[165deg,#273238,#1a2329] px-4 py-2 text-[13px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2"><img src="/assets/figma/faculty-plus.svg" width="16" height="16" alt="" />Add Program</button></header>
    <div className="flex flex-wrap items-center gap-3 px-4 pt-4 pb-3 sm:px-7"><div className="relative w-full sm:w-[280px]"><img src="/assets/figma/faculty-search.svg" width="16" height="16" alt="" className="pointer-events-none absolute top-3.5 left-3.5" /><input type="search" aria-label="Search program name or code" placeholder="Search program name or code…" value={filters.query} onChange={event => setFilters(previous => ({ ...previous, query: event.target.value }))} className="h-[42px] w-full rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-3.5 pl-10 text-[13px] placeholder:text-[#17213c]/50 focus-visible:outline-2" /></div>
      {dropdowns.map(filter => <div key={filter.key} className={`relative w-full ${filter.width}`}><select aria-label={filter.label} value={filters[filter.key]} onChange={event => setFilters(previous => filter.key === 'facultyId' ? changeFaculty(previous, event.target.value) : { ...previous, [filter.key]: event.target.value })} className="h-[39px] w-full appearance-none rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-9 pl-3.5 text-[13px] text-[#68728a] focus-visible:outline-2"><option value="">{filter.label}</option>{filter.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><img src="/assets/figma/department-filter-arrow.svg" width="10" height="6" alt="" className="pointer-events-none absolute top-4 right-3.5" /></div>)}
    </div>
    <div className="px-4 pb-6 sm:px-7"><ProgramsTable programs={current?.rows ?? []} loading={!current} error={current?.error} onRetry={() => setVersion(previous => previous + 1)} busy={adding || !!editing} onAction={setSelected} /><p role="status" className="pt-3 text-[13px] text-[#68728a]">Showing <strong className="font-semibold text-[#17213c]">{current?.rows?.length ?? '—'}</strong> of <strong className="font-semibold text-[#17213c]">{totals?.data?.totalPrograms ?? '—'}</strong> programs</p>
      {totals?.error && <p role="alert" className="mt-3 text-xs text-[#68728a]">Total could not be refreshed. {totals.error} <button type="button" onClick={() => setVersion(previous => previous + 1)} className="rounded px-2 py-1 underline focus-visible:outline-2">Retry</button></p>}
      {lookupError && <p role="alert" className="mt-3 text-xs text-[#68728a]">{lookupError} <button type="button" onClick={() => setLookupAttempt(previous => previous + 1)} className="rounded px-2 py-1 underline focus-visible:outline-2">Retry</button></p>}
      <p role="status" className="mt-2 text-[13px] leading-5 text-[#68728a]">{message}</p></div>
    {(adding || editing) && <AddProgramDrawer key={editing?.id ?? 'new'} program={editing ?? undefined} departments={departments} faculties={faculties} onAdd={saveProgram} onClose={editing ? closeEdit : onClose} />}
    {selected && <ProgramActions key={selected.id} id={selected.id} onClose={() => setSelected(null)} onEdit={program => { setSelected(null); setEditing(program); onEditing(true) }} onDeleted={() => { setSelected(null); setVersion(previous => previous + 1); setMessage('Program deleted successfully. Refreshing server data.') }} />}
  </main>
}
