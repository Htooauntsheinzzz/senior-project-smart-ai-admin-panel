import { useEffect, useState } from 'react'
import { getStudents } from '../../services/studentService'
import { getSections, mapSection } from '../../services/sectionService'
import { enrollmentError } from '../../services/enrollmentService'

export type EnrollmentChoice = { id: string; label: string }
export const enrollmentControl = 'w-full rounded-xl border border-[#e5e8f0] bg-white px-3 py-2 text-sm focus-visible:outline-2 disabled:opacity-50'
export const enrollmentButton = 'rounded-xl border border-[#e5e8f0] bg-white px-3 py-2 text-sm font-semibold focus-visible:outline-2 disabled:opacity-50'

export default function EnrollmentRecordPicker({ kind, value, onChange, disabled = false, eligibleOnly = false }: {
  kind: 'student' | 'section'; value?: EnrollmentChoice; onChange: (choice: EnrollmentChoice) => void; disabled?: boolean; eligibleOnly?: boolean
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const key = JSON.stringify({ kind, search, page, attempt, eligibleOnly })
  const [result, setResult] = useState<{ key: string; rows?: EnrollmentChoice[]; pages?: number; error?: string }>()
  const current = result?.key === key ? result : undefined
  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        let rows: EnrollmentChoice[], pages: number
        if (kind === 'student') {
          const data = await getStudents({ search, ...(eligibleOnly ? { status: 'ACTIVE' } : {}) }, page, 10, controller.signal)
          rows = data.content.map(r => ({ id: String(r.id), label: `${r.studentCode} — ${r.firstName} ${r.lastName}` })); pages = data.totalPages
        } else {
          const data = await getSections({ search: search.trim() || undefined, page, size: 10, sort: 'id,asc', ...(eligibleOnly ? { status: 'ACTIVE' } : {}) }, controller.signal)
          if (!data || !Array.isArray(data.content) || data.page !== page || data.size !== 10 || !Number.isSafeInteger(data.totalElements) || data.totalElements < 0 || data.totalPages !== Math.ceil(data.totalElements / 10)) throw new Error('Unexpected section page.')
          rows = data.content.map(mapSection).map(r => ({ id: r.id, label: `${r.courseCode} — ${r.sectionNumber} · ${r.semesterNameEn} · ${r.enrolledCount}/${r.capacity}${r.isFull ? ' (full)' : ''}` })); pages = data.totalPages
          if (new Set(rows.map(r => r.id)).size !== rows.length || rows.length !== Math.min(10, Math.max(0, data.totalElements - page * 10))) throw new Error('Incomplete section page.')
        }
        if (!controller.signal.aborted) {
          if (page >= pages && page > 0) { setPage(Math.max(0, pages - 1)); return }
          setResult({ key, rows, pages })
        }
      } catch (e) { if (!controller.signal.aborted) setResult({ key, error: enrollmentError(e) }) }
    }, 250)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [key, kind, search, page, eligibleOnly])
  return <fieldset disabled={disabled} className="min-w-0 space-y-2 rounded-xl border border-[#e5e8f0] p-3">
    <legend className="px-1 text-xs font-semibold">{kind === 'student' ? 'Student' : 'Course Section'}</legend>
    <p className="break-words text-xs text-[#68728a]">Selected: {value?.label || 'None'}</p>
    <input type="search" aria-label={`Search ${kind}s`} placeholder={kind === 'student' ? 'Search student ID, name or email…' : 'Search course or section…'} maxLength={255} value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} className={enrollmentControl} />
    {!current ? <p role="status" className="text-xs">Loading choices…</p> : current.error ? <p role="alert" className="text-xs text-red-700">{current.error} <button type="button" onClick={() => setAttempt(v => v + 1)} className="underline">Retry</button></p> : <>
      <ul className="max-h-44 overflow-y-auto divide-y divide-[#e5e8f0]">{current.rows?.map(row => <li key={row.id}><button type="button" aria-pressed={value?.id === row.id} onClick={() => onChange(row)} className={`w-full rounded p-2 text-left text-xs focus-visible:outline-2 ${value?.id === row.id ? 'bg-[#ede9fe] font-semibold' : ''}`}>{row.label}</button></li>)}</ul>
      {!current.rows?.length && <p className="text-xs">No matching {kind}s.</p>}
      <div className="flex items-center justify-between gap-2 text-xs"><button type="button" disabled={disabled || page === 0} onClick={() => setPage(p => p - 1)} className={enrollmentButton}>Previous</button><span>Page {page + 1} of {Math.max(1, current.pages ?? 1)}</span><button type="button" disabled={disabled || page + 1 >= (current.pages ?? 0)} onClick={() => setPage(p => p + 1)} className={enrollmentButton}>Next</button></div>
    </>}
  </fieldset>
}
