import { useEffect, useRef, useState } from 'react'
import type { Faculty } from '../../types/faculty'
import { deleteFaculty, getFacultyById } from '../../services/facultyService'
import { facultyError } from '../../utils/facultyApi'
import Modal from '../ui/Modal'

export default function FacultyActions({ id, onClose, onEdit, onDeleted }: { id: string; onClose: () => void; onEdit: (faculty: Faculty) => void; onDeleted: () => void }) {
  const [result, setResult] = useState<{ attempt: number; faculty?: Faculty; error?: string } | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [confirm, setConfirm] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  useEffect(() => {
    let cancelled = false
    getFacultyById(id).then(faculty => { if (!cancelled) setResult({ attempt, faculty }) }).catch(error => { if (!cancelled) setResult({ attempt, error: facultyError(error).message }) })
    return () => { cancelled = true }
  }, [id, attempt])
  const current = result?.attempt === attempt ? result : null
  async function remove() {
    if (lock.current) return
    lock.current = true; setPending(true); setError('')
    try { await deleteFaculty(id); onDeleted() }
    catch (error) { setError(facultyError(error).message); lock.current = false; setPending(false) }
  }
  const button = 'rounded-xl border border-[#e5e8f0] px-4 py-2 text-sm font-semibold focus-visible:outline-2 disabled:opacity-50'
  return <Modal title={confirm ? 'Delete faculty?' : 'Faculty Details'} onClose={() => { if (!lock.current) onClose() }}>
    {!current ? <p role="status" className="text-sm text-[#68728a]">Loading faculty…</p> : current.error ? <div role="alert" className="text-sm text-[#68728a]"><p>{current.error}</p><button type="button" className={`${button} mt-4`} onClick={() => setAttempt(value => value + 1)}>Retry</button></div> : current.faculty && (confirm ? <>
      <p className="text-sm leading-6 text-[#68728a]">Delete {current.faculty.code} — {current.faculty.nameEn}? The faculty will be removed from the directory.</p>
      {error && <p role="alert" className="mt-3 text-sm text-[#d80255]">{error}</p>}
      <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={pending} className={button} onClick={() => { setConfirm(false); setError('') }}>Cancel</button><button type="button" disabled={pending} className={`${button} bg-[#273238] text-white`} onClick={remove}>{pending ? 'Deleting…' : 'Delete'}</button></div>
    </> : <>
      <dl className="space-y-3">{Object.entries({ 'Faculty Code': current.faculty.code, 'English Name': current.faculty.nameEn, 'Thai Name': current.faculty.nameTh || '—', Departments: current.faculty.departmentCount, Students: current.faculty.studentCount, Status: current.faculty.status === 'active' ? 'Active' : 'Inactive' }).map(([label, value]) => <div key={label} className="grid grid-cols-[110px_1fr] gap-3 text-sm"><dt className="text-[#68728a]">{label}</dt><dd className="break-words font-['Inter','Noto_Sans_Thai',sans-serif]">{value}</dd></div>)}</dl>
      <div className="mt-6 flex justify-end gap-3"><button type="button" className={button} onClick={() => onEdit(current.faculty!)}>Edit</button><button type="button" className={`${button} bg-[#273238] text-white`} onClick={() => setConfirm(true)}>Delete</button></div>
    </>)}
  </Modal>
}
