import { useEffect, useState } from 'react'
import '@fontsource/noto-sans-thai/thai-400.css'
import type { DepartmentFilters, DepartmentInput } from '../../types/department'
import type { Faculty } from '../../types/faculty'
import { getFaculties } from '../../services/facultyService'
import { createDepartment, getDepartmentDirectory, getDepartmentSummary, updateDepartment, type ApiDepartment, type DepartmentSummary } from '../../services/departmentService'
import { departmentError } from '../../utils/departmentApi'
import DepartmentTable from './DepartmentTable'
import AddDepartmentDrawer from './AddDepartmentDrawer'
import DepartmentActions from './DepartmentActions'

export default function DepartmentsContent({ adding, onOpen, onClose, onEditing }: { adding: boolean; onOpen: () => void; onClose: () => void; onEditing: (open: boolean) => void }) {
  const [filters, setFilters] = useState<DepartmentFilters>({ query: '', facultyId: '', status: '' })
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<ApiDepartment | null>(null)
  const [editing, setEditing] = useState<ApiDepartment | null>(null)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; rows?: ApiDepartment[]; error?: string } | null>(null)
  const [summary, setSummary] = useState<{ version: number; data?: DepartmentSummary; error?: string } | null>(null)
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [lookupError, setLookupError] = useState('')
  const [lookupAttempt, setLookupAttempt] = useState(0)
  const key = JSON.stringify([filters, version])
  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      getDepartmentDirectory(filters, controller.signal).then(rows => { if (!controller.signal.aborted) setResult({ key, rows }) }).catch(error => { if (!controller.signal.aborted) setResult({ key, error: departmentError(error).message }) })
    }, 300)
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [filters, version, key])
  useEffect(() => {
    const controller = new AbortController()
    getDepartmentSummary(controller.signal).then(data => { if (!controller.signal.aborted) setSummary({ version, data }) }).catch(error => { if (!controller.signal.aborted) setSummary({ version, error: departmentError(error).message }) })
    return () => controller.abort()
  }, [version])
  useEffect(() => {
    const controller = new AbortController()
    getFaculties('', controller.signal).then(rows => { if (!controller.signal.aborted) { setFaculties(rows); setLookupError('') } }).catch(() => { if (!controller.signal.aborted) setLookupError('Unable to load Faculty filter options.') })
    return () => controller.abort()
  }, [lookupAttempt])
  const current = result?.key === key ? result : null
  const totals = summary?.version === version ? summary : null
  function closeEdit() { setEditing(null); onEditing(false) }
  async function saveDepartment(input: DepartmentInput) {
    if (editing) await updateDepartment(editing.id, input)
    else await createDepartment(input)
    const operation = editing ? 'updated' : 'created'
    if (editing) closeEdit(); else onClose()
    setVersion(previous => previous + 1)
    const query = filters.query.trim().toLowerCase()
    const hidden = !!((filters.facultyId && filters.facultyId !== input.facultyId) || (filters.status && filters.status !== input.status) || (query && ![input.code, input.name].some(text => text.toLowerCase().includes(query))))
    setMessage(`${input.name.trim()} was ${operation} successfully.${hidden ? ' Your current filters hide this department.' : ''} Refreshing server data.`)
  }
  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-[0.625px] border-[#e5e8f0] px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Departments</h1><p className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">Manage departments within each faculty.</p></div><button type="button" onClick={onOpen} aria-expanded={adding} className="inline-flex items-center gap-2 rounded-xl bg-linear-[164deg,#273238,#1a2329] px-4 py-2 text-[13px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2"><img src="/assets/figma/faculty-plus.svg" width="16" height="16" alt="" />Add Department</button></header>
    <div className="flex flex-wrap items-center gap-3 px-4 pt-4 pb-3 sm:px-7"><div className="relative w-full sm:w-[280px]"><img src="/assets/figma/faculty-search.svg" width="16" height="16" alt="" className="pointer-events-none absolute top-3 left-3.5" /><input type="search" aria-label="Search department name or code" placeholder="Search department name or code…" value={filters.query} onChange={event => setFilters(previous => ({ ...previous, query: event.target.value }))} className="h-[41px] w-full rounded-xl border-[0.625px] border-[#e5e8f0] bg-white pr-3.5 pl-10 text-[13px] placeholder:text-[#17213c]/50 focus-visible:outline-2" /></div>
      {[{ key: 'facultyId', label: 'Faculty', width: 'sm:w-[261px]', options: faculties.map(faculty => ({ value: faculty.id, label: faculty.nameEn.replace(/^Faculty of /, '') })) }, { key: 'status', label: 'Status', width: 'sm:w-[150px]', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] }].map(filter => <div key={filter.key} className={`relative w-full ${filter.width}`}><select aria-label={filter.label} value={filters[filter.key as keyof DepartmentFilters]} onChange={event => setFilters(previous => ({ ...previous, [filter.key]: event.target.value }))} className="h-[39px] w-full appearance-none rounded-xl border-[0.625px] border-[#e5e8f0] bg-white pr-9 pl-3.5 text-[13px] text-[#68728a] focus-visible:outline-2"><option value="">{filter.label}</option>{filter.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><img src="/assets/figma/department-filter-arrow.svg" width="10" height="6" alt="" className="pointer-events-none absolute top-4 right-3.5" /></div>)}
    </div>
    <div className="px-4 pb-6 sm:px-7"><DepartmentTable departments={current?.rows ?? []} loading={!current} error={current?.error} onRetry={() => setVersion(previous => previous + 1)} busy={adding || !!editing} onAction={setSelected} /><p role="status" className="pt-3 text-[13px] text-[#68728a]">Showing <strong className="font-semibold text-[#17213c]">{current?.rows?.length ?? '—'}</strong> of <strong className="font-semibold text-[#17213c]">{totals?.data?.totalDepartments ?? '—'}</strong> departments</p>
      {totals?.error && <p role="alert" className="mt-3 text-xs text-[#68728a]">Total could not be refreshed. {totals.error} <button type="button" onClick={() => setVersion(previous => previous + 1)} className="rounded px-2 py-1 underline focus-visible:outline-2">Retry</button></p>}
      {lookupError && <p role="alert" className="mt-3 text-xs text-[#68728a]">{lookupError} <button type="button" onClick={() => setLookupAttempt(previous => previous + 1)} className="rounded px-2 py-1 underline focus-visible:outline-2">Retry</button></p>}
      <p role="status" className="mt-2 text-[13px] leading-5 text-[#68728a]">{message}</p></div>
    {(adding || editing) && <AddDepartmentDrawer key={editing?.id ?? 'new'} department={editing ?? undefined} onAdd={saveDepartment} onClose={editing ? closeEdit : onClose} />}
    {selected && <DepartmentActions key={selected.id} id={selected.id} onClose={() => setSelected(null)} onEdit={department => { setSelected(null); setEditing(department); onEditing(true) }} onDeleted={() => { setSelected(null); setVersion(previous => previous + 1); setMessage('Department deleted successfully. Refreshing server data.') }} />}
  </main>
}
