import { useEffect, useState } from 'react'
import { CircleCheck, X } from 'lucide-react'
import Pagination from '../ui/Pagination'
import SemesterForm from './SemesterForm'
import SemesterActions from './SemesterActions'
import SemestersTable from './SemestersTable'
import { createSemester, getSemesterPage, semesterError, updateSemester, validAcademicYear, type ApiSemester, type SemesterDraft, type SemesterPage } from '../../services/semesterService'

const PAGE_SIZE = 10

export default function SemesterDirectory({ adding, onOpen, onClose, onEditing }: { adding: boolean; onOpen: () => void; onClose: () => void; onEditing: (open: boolean) => void }) {
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('')
  const [page, setPage] = useState(0)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; data?: SemesterPage; error?: string } | null>(null)
  const [selected, setSelected] = useState<ApiSemester | null>(null)
  const [editing, setEditing] = useState<ApiSemester | null>(null)
  const [message, setMessage] = useState('')
  // Only a complete, in-range year is sent; the backend rejects anything else with 400.
  const academicYear = validAcademicYear(year) ? Number(year) : undefined
  const yearIncomplete = year !== '' && academicYear === undefined
  const key = JSON.stringify([query.trim(), academicYear, page, version])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      getSemesterPage({ page, size: PAGE_SIZE, search: query, academicYear }, controller.signal)
        .then(data => {
          if (controller.signal.aborted) return
          // A delete can empty the last page; step back instead of showing an empty table.
          if (!data.rows.length && page > 0 && data.totalPages > 0) setPage(Math.min(page - 1, data.totalPages - 1))
          else setResult({ key, data })
        })
        .catch(error => { if (!controller.signal.aborted) setResult({ key, error: semesterError(error).message }) })
    }, 300)
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [query, academicYear, page, version, key])

  // Success alerts dismiss themselves; a new message restarts the timer.
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(''), 4000)
    return () => window.clearTimeout(timer)
  }, [message])

  const current = result?.key === key ? result : null
  const data = current?.data
  const rows = data?.rows ?? []

  function closeEdit() { setEditing(null); onEditing(false) }

  async function save(input: SemesterDraft) {
    if (editing) await updateSemester(editing.id, input)
    else await createSemester(input)
    const operation = editing ? 'updated' : 'created'
    if (editing) closeEdit()
    else { onClose(); setPage(0) }
    setVersion(previous => previous + 1)
    setMessage(`Semester ${operation} successfully.`)
  }

  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-[1.25px] border-[#e5e8f0] px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Semester</h1><p className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">Manage semesters for each academic year.</p></div><button type="button" onClick={onOpen} disabled={!!editing} aria-expanded={adding} className="inline-flex items-center gap-2 rounded-xl bg-linear-[165deg,#273238,#1a2329] px-4 py-2 text-[13px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"><img src="/assets/figma/faculty-plus.svg" width="16" height="16" alt="" />Add Semester</button></header>
    <div className="flex flex-wrap items-start gap-3 px-4 pt-4 pb-3 sm:px-7">
      <div className="relative w-full sm:w-[280px]"><img src="/assets/figma/faculty-search.svg" width="16" height="16" alt="" className="pointer-events-none absolute top-3.5 left-3.5" /><input type="search" maxLength={150} aria-label="Search semester name" placeholder="Search semester name…" value={query} onChange={event => { setQuery(event.target.value); setPage(0) }} className="h-[42px] w-full rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-3.5 pl-10 text-[13px] placeholder:text-[#17213c]/50 focus-visible:outline-2" /></div>
      <div className="w-full sm:w-[170px]"><input type="text" inputMode="numeric" maxLength={4} aria-label="Filter by academic year" aria-invalid={yearIncomplete} aria-describedby={yearIncomplete ? 'semester-year-filter-hint' : undefined} placeholder="Academic year" value={year} onChange={event => { setYear(event.target.value.replace(/\D/g, '')); setPage(0) }} className={`h-[42px] w-full rounded-xl border-[1.25px] bg-white px-3.5 text-[13px] placeholder:text-[#17213c]/50 focus-visible:outline-2 ${yearIncomplete ? 'border-[#d80255]' : 'border-[#e5e8f0]'}`} />{yearIncomplete && <p id="semester-year-filter-hint" className="mt-1 text-xs text-[#d80255]">Enter a year from 2000 to 2100.</p>}</div>
      {(query || year) && <button type="button" onClick={() => { setQuery(''); setYear(''); setPage(0) }} className="h-[42px] rounded-xl border-[1.25px] border-[#e5e8f0] px-4 text-[13px] font-semibold focus-visible:outline-2">Clear filters</button>}
    </div>
    <div className="px-4 pb-6 sm:px-7">
      <SemestersTable semesters={rows} offset={(data?.page ?? page) * PAGE_SIZE} loading={!current} error={current?.error} onRetry={() => setVersion(previous => previous + 1)} busy={adding || !!editing} onAction={setSelected} />
      <Pagination label="Semester pagination" page={(data?.page ?? page) + 1} pageCount={Math.max(1, data?.totalPages ?? 1)} onPage={next => setPage(next - 1)}
        summary={data ? <>Showing <strong className="font-semibold text-[#17213c]">{rows.length ? `${data.page * PAGE_SIZE + 1}–${data.page * PAGE_SIZE + rows.length}` : 0}</strong> of <strong className="font-semibold text-[#17213c]">{data.totalElements}</strong> semesters</> : <>Showing <strong className="font-semibold text-[#17213c]">—</strong> of <strong className="font-semibold text-[#17213c]">—</strong> semesters</>} />
    </div>
    {(adding || editing) && <SemesterForm key={editing?.id ?? 'new'} semester={editing ?? undefined} onSave={save} onClose={editing ? closeEdit : onClose} />}
    {selected && <SemesterActions key={selected.id} id={selected.id} onClose={() => setSelected(null)} onEdit={semester => { setSelected(null); setEditing(semester); onEditing(true) }} onDeleted={() => { setSelected(null); setVersion(previous => previous + 1); setMessage('Semester deleted successfully.') }} />}
    {message && <div role="status" className="fixed right-4 bottom-4 z-40 flex max-w-[calc(100vw-32px)] items-center gap-3 rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] p-4 text-[13px] leading-5 font-semibold text-[#047857] shadow-lg sm:max-w-sm"><CircleCheck size={18} aria-hidden="true" className="shrink-0" /><p>{message}</p><button type="button" aria-label="Dismiss message" onClick={() => setMessage('')} className="ml-auto rounded p-1 focus-visible:outline-2"><X size={16} /></button></div>}
  </main>
}
