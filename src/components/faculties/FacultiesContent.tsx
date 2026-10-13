import { useEffect, useState } from 'react'
import '@fontsource/noto-sans-thai/thai-400.css'
import type { Faculty, FacultyInput } from '../../types/faculty'
import { createFaculty, getFaculties, getFacultySummary, updateFaculty, type FacultySummary } from '../../services/facultyService'
import { facultyError } from '../../utils/facultyApi'
import FacultyTable from './FacultyTable'
import AddFacultyDrawer from './AddFacultyDrawer'
import FacultyActions from './FacultyActions'

export default function FacultiesContent({ adding, onOpen, onClose, onEditing }: { adding: boolean; onOpen: () => void; onClose: () => void; onEditing: (open: boolean) => void }) {
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<Faculty | null>(null)
  const [editing, setEditing] = useState<Faculty | null>(null)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; rows?: Faculty[]; error?: string } | null>(null)
  const [summary, setSummary] = useState<{ version: number; data?: FacultySummary; error?: string } | null>(null)
  const key = JSON.stringify([query, version])
  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      if (query.trim().length > 255) { setResult({ key, error: 'Search must be at most 255 characters.' }); return }
      getFaculties(query, controller.signal).then(rows => { if (!controller.signal.aborted) setResult({ key, rows }) }).catch(error => { if (!controller.signal.aborted) setResult({ key, error: facultyError(error).message }) })
    }, 300)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [query, version, key])
  useEffect(() => {
    const controller = new AbortController()
    getFacultySummary(controller.signal).then(data => { if (!controller.signal.aborted) setSummary({ version, data }) }).catch(error => { if (!controller.signal.aborted) setSummary({ version, error: facultyError(error).message }) })
    return () => controller.abort()
  }, [version])
  const current = result?.key === key ? result : null
  const totals = summary?.version === version ? summary.data : undefined
  function closeEdit() { setEditing(null); onEditing(false) }
  async function saveFaculty(input: FacultyInput) {
    if (editing) await updateFaculty(editing.id, input)
    else await createFaculty(input)
    const operation = editing ? 'updated' : 'created'
    if (editing) closeEdit()
    else { setQuery(''); onClose() }
    setVersion(previous => previous + 1)
    setMessage(`${input.nameEn.trim()} was ${operation} successfully. Refreshing server data.`)
  }
  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-[0.625px] border-[#e5e8f0] px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Faculties</h1><p className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">Manage university faculties and their administrative structure.</p></div><button id="add-faculty-trigger" type="button" onClick={onOpen} aria-expanded={adding} className="inline-flex items-center gap-2 rounded-xl bg-linear-[164deg,#273238,#1a2329] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_7px_#27323838] focus-visible:outline-2 focus-visible:outline-offset-2"><img src="/assets/figma/faculty-plus.svg" width="16" height="16" alt="" />Add Faculty</button></header>
    <div className="px-4 pt-4 pb-3 sm:px-7"><div className="relative"><img src="/assets/figma/faculty-search.svg" width="16" height="16" alt="" className="pointer-events-none absolute top-3 left-3.5" /><input type="search" aria-label="Search faculty name or code" placeholder="Search faculty name or code…" value={query} onChange={event => setQuery(event.target.value)} className="h-[41px] w-full rounded-xl border-[0.625px] border-[#e5e8f0] bg-white pr-3.5 pl-10 font-['Inter','Noto_Sans_Thai',sans-serif] text-[13px] placeholder:text-[#17213c]/50 focus-visible:outline-2" /></div></div>
    <div className="px-4 pb-6 sm:px-7"><FacultyTable faculties={current?.rows ?? []} loading={!current} error={current?.error} busy={adding || !!editing} onRetry={() => setVersion(previous => previous + 1)} onAction={setSelected} />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">{[{ value: totals?.totalFaculties, label: 'Total Faculties', color: '#273238' }, { value: totals?.activeFaculties, label: 'Active Faculties', color: '#059669' }, { value: totals?.totalDepartments, label: 'Total Departments', color: '#7c3aed' }].map(metric => <div key={metric.label} className="rounded-2xl border-[0.625px] border-[#e5e8f0] bg-white px-4 py-3.5"><p className="font-display text-[22px] leading-[22px] font-extrabold" style={{ color: metric.color }}>{metric.value ?? '—'}</p><p className="mt-1 text-[11.5px] leading-[17.25px] text-[#68728a]">{metric.label}</p></div>)}</div>
      {summary?.version === version && summary.error && <div role="alert" className="mt-4 text-xs leading-5 text-[#68728a]">Summary could not be refreshed. {summary.error} <button type="button" onClick={() => setVersion(previous => previous + 1)} className="rounded px-2 py-1 font-semibold underline focus-visible:outline-2">Retry</button></div>}
      <p role="status" className="mt-2 text-[13px] leading-5 text-[#68728a]">{message}</p>
    </div>
    {(adding || editing) && <AddFacultyDrawer key={editing?.id ?? 'new'} faculty={editing ?? undefined} onAdd={saveFaculty} onClose={editing ? closeEdit : onClose} />}
    {selected && <FacultyActions key={selected.id} id={selected.id} onClose={() => setSelected(null)} onEdit={faculty => { setSelected(null); setEditing(faculty); onEditing(true) }} onDeleted={() => { setSelected(null); setVersion(previous => previous + 1); setMessage('Faculty deleted successfully. Refreshing server data.') }} />}
  </main>
}
