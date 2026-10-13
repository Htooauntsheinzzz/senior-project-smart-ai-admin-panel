import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, Plus, Search } from 'lucide-react'
import Modal from '../ui/Modal'
import SemesterForm from './SemesterForm'
import { getSemesters, getSemester, saveSemester, deleteSemester, semesterError, type Semester, type SemesterDraft } from '../../services/semesterService'

const button = 'rounded-xl border border-[#e5e8f0] px-4 py-2 text-[13px] font-semibold focus-visible:outline-2 disabled:opacity-50'
function SemesterActions({ id, onClose, onEdit, onDeleted }: { id: string; onClose: () => void; onEdit: (row: Semester) => void; onDeleted: () => void }) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ attempt: number; row?: Semester; error?: string } | null>(null)
  const [confirm, setConfirm] = useState(false)
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState('')
  const lock = useRef(false)
  useEffect(() => {
    let cancelled = false
    getSemester(id).then(row => { if (!cancelled) setResult({ attempt, row }) }).catch(error => { if (!cancelled) setResult({ attempt, error: semesterError(error) }) })
    return () => { cancelled = true }
  }, [id, attempt])
  const current = result?.attempt === attempt ? result : null
  const row = current?.row
  async function remove() {
    if (lock.current) return
    lock.current = true; setPending(true); setFailure('')
    try { await deleteSemester(id); onDeleted() }
    catch (error) { setFailure(semesterError(error)); lock.current = false; setPending(false) }
  }
  return <Modal title={confirm ? 'Delete semester?' : 'Semester Details'} onClose={() => { if (!lock.current) onClose() }}>
    {!current ? <p role="status">Loading details…</p> : current.error ? <div role="alert"><p>{current.error}</p><button type="button" className={`${button} mt-4`} onClick={() => setAttempt(a => a + 1)}>Retry</button></div> : row && <>
      {confirm ? <p className="text-sm leading-6 text-[#68728a]">Delete {row.semesterNameEn}? The portal will check current course, course-section, and student references first and stop if any are found or cannot be checked.</p> : <dl className="space-y-3">{Object.entries({ ID: row.id, 'English Name': row.semesterNameEn, 'Thai Name': row.semesterNameTh }).map(([label, value]) => <div key={label} className="grid grid-cols-[110px_1fr] gap-3 text-sm"><dt className="text-[#68728a]">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl>}
      {failure && <p role="alert" className="mt-4 text-sm text-[#d80255]">{failure}</p>}
      <div className="mt-6 flex justify-end gap-3">{confirm ? <><button type="button" disabled={pending} className={button} onClick={() => { setConfirm(false); setFailure('') }}>Cancel</button><button type="button" disabled={pending} className={`${button} bg-[#273238] text-white`} onClick={remove}>{pending ? 'Checking / deleting…' : 'Confirm Delete'}</button></> : <><button type="button" className={button} onClick={() => onEdit(row)}>Edit</button><button type="button" className={`${button} bg-[#273238] text-white`} onClick={() => setConfirm(true)}>Delete</button></>}</div>
    </>}
  </Modal>
}

export default function SemesterDirectory({ onEditing }: { onEditing: (open: boolean) => void }) {
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ version: number; rows?: Semester[]; error?: string } | null>(null)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Semester | 'new' | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    getSemesters(controller.signal).then(rows => { if (!controller.signal.aborted) setResult({ version, rows }) }).catch(error => { if (!controller.signal.aborted) setResult({ version, error: semesterError(error) }) })
    return () => controller.abort()
  }, [version])
  useEffect(() => { onEditing(!!editing); return () => onEditing(false) }, [editing, onEditing])
  const current = result?.version === version ? result : null
  const rows = current?.rows ?? []
  const filtered = rows.filter(row => `${row.semesterNameEn} ${row.semesterNameTh}`.toLowerCase().includes(query.trim().toLowerCase()))
  async function save(value: SemesterDraft) {
    await saveSemester(value, editing && editing !== 'new' ? editing.id : undefined)
    setEditing(null); setVersion(v => v + 1)
    setMessage('Semester saved successfully. Refreshing server records. Your search is retained.')
  }
  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e8f0] px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Semester</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Manage the university's existing semester records.</p></div><button type="button" disabled={!!editing || selected !== null} onClick={() => setEditing('new')} className={`${button} inline-flex items-center gap-2 bg-linear-[164deg,#273238,#1a2329] text-white shadow-[0_4px_7px_#27323838]`}><Plus size={16} />Add Semester</button></header>
    <div className="px-4 pt-4 pb-3 sm:px-7"><p className="mb-3 text-xs leading-5 text-[#68728a]">The existing API provides semester names only. Codes, academic years, dates, status filtering, and active/upcoming totals are unavailable.</p><div className="relative"><Search size={16} className="absolute top-3 left-3.5 text-[#68728a]" aria-hidden="true" /><input type="search" aria-label="Search semester names" placeholder="Search semester names…" value={query} onChange={event => setQuery(event.target.value)} className="h-[41px] w-full rounded-xl border border-[#e5e8f0] bg-white pr-3.5 pl-10 text-[13px] focus-visible:outline-2" /></div></div>
    <div className="px-4 pb-6 sm:px-7"><div className="overflow-hidden rounded-2xl border border-[#e5e8f0] bg-white">
      {!current ? <p role="status" className="p-12 text-center text-sm text-[#68728a]">Loading semesters…</p> : current.error ? <div role="alert" className="p-10 text-center text-sm text-[#68728a]"><p>Directory could not be refreshed. {current.error}</p><button type="button" className={`${button} mt-4`} onClick={() => setVersion(v => v + 1)}>Retry</button></div> : !filtered.length ? <div className="p-12 text-center text-sm text-[#68728a]"><p role="status">No semesters match your search.</p><button type="button" className={`${button} mt-4`} onClick={() => setQuery('')}>Clear search</button></div> : <div role="region" aria-label="Semester directory" tabIndex={0} className="overflow-x-auto focus-visible:outline-2"><table className="w-full min-w-[700px] text-left text-[13px]"><caption className="sr-only">Semester management</caption><thead className="bg-[#fafbfc] text-[#68728a]"><tr>{['ID', 'Semester Name (English)', 'Semester Name (Thai)', 'Actions'].map(column => <th key={column} scope="col" className="px-4 py-3.5 font-semibold">{column}</th>)}</tr></thead><tbody>{filtered.map(row => <tr key={row.id} className="border-t border-[#e5e8f0]"><td className="px-4 py-3.5">{row.id}</td><th scope="row" className="px-4 py-3.5 font-semibold">{row.semesterNameEn}</th><td className="px-4 py-3.5">{row.semesterNameTh}</td><td className="px-4 py-3.5"><button type="button" disabled={!!editing} aria-label={`View and manage ${row.semesterNameEn}`} onClick={() => setSelected(row.id)} className="rounded-lg p-2 hover:bg-[#f7f8fc] focus-visible:outline-2"><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div>}
    </div><div className="mt-4 rounded-2xl border border-[#e5e8f0] bg-white px-4 py-3.5 sm:max-w-sm"><p className="font-display text-[22px] font-extrabold">{current?.rows ? rows.length : '—'}</p><p className="mt-1 text-[11.5px] text-[#68728a]">Total Semesters</p></div><p className="mt-3 text-xs text-[#68728a]">Showing {current?.rows ? filtered.length : '—'} of {current?.rows ? rows.length : '—'} semesters</p><p role="status" className="mt-2 text-[13px] text-[#68728a]">{message}</p></div>
    {editing && <SemesterForm key={editing === 'new' ? 'new' : editing.id} semester={editing === 'new' ? undefined : editing} onSave={save} onClose={() => setEditing(null)} />}
    {selected !== null && <SemesterActions key={selected} id={selected} onClose={() => setSelected(null)} onEdit={row => { setSelected(null); setEditing(row) }} onDeleted={() => { setSelected(null); setVersion(v => v + 1); setMessage('Semester deleted successfully. Refreshing server records.') }} />}
  </main>
}
