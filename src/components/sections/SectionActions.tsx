import { useEffect, useRef, useState } from 'react'
import { deleteSection, getSectionById, type ApiSection } from '../../services/sectionService'
import { sectionError } from '../../utils/sectionApi'
import Modal from '../ui/Modal'

export default function SectionActions({ id, onClose, onEdit, onDeleted }: { id: string; onClose: () => void; onEdit: (value: ApiSection) => void; onDeleted: () => void }) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ attempt: number; data?: ApiSection; error?: string } | null>(null)
  const [confirm, setConfirm] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  useEffect(() => {
    let cancelled = false
    getSectionById(id).then(data => { if (!cancelled) setResult({ attempt, data }) }).catch(error => { if (!cancelled) setResult({ attempt, error: sectionError(error).message }) })
    return () => { cancelled = true }
  }, [id, attempt])
  const current = result?.attempt === attempt ? result : null
  const data = current?.data
  async function remove() {
    if (lock.current) return
    lock.current = true; setPending(true); setError('')
    try { await deleteSection(id); onDeleted() }
    catch (error) { setError(sectionError(error).message); lock.current = false; setPending(false) }
  }
  const button = 'rounded-xl border border-[#e5e8f0] px-4 py-2 text-sm font-semibold focus-visible:outline-2 disabled:opacity-50'
  const status = data ? (data.status === 'CLOSED' ? 'Closed' : data.isFull ? 'Full' : 'Active') : ''
  return <Modal title={confirm ? 'Delete section?' : 'Section Details'} onClose={() => { if (!lock.current) onClose() }}>
    {!current ? <p role="status" className="text-sm text-[#68728a]">Loading section…</p> : current.error ? <div role="alert" className="text-sm text-[#68728a]"><p>{current.error}</p><button type="button" className={`${button} mt-4`} onClick={() => setAttempt(previous => previous + 1)}>Retry</button></div> : data && (confirm ? <>
      <p className="text-sm leading-6 text-[#68728a]">Delete {data.courseCode} section {data.sectionNumber}? The section will be removed.</p>
      {error && <p role="alert" className="mt-3 text-sm text-[#d80255]">{error}</p>}
      <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={pending} className={button} onClick={() => setConfirm(false)}>Cancel</button><button type="button" disabled={pending} className={`${button} bg-[#273238] text-white`} onClick={remove}>{pending ? 'Deleting…' : 'Delete'}</button></div>
    </> : <>
      <dl className="space-y-3">{Object.entries({
        Course: `${data.courseCode} — ${data.courseName}`,
        Section: data.sectionNumber,
        Lecturer: data.lectureNameEn || data.lectureNameTh,
        Room: data.room || 'Not assigned',
        Schedule: data.schedule || 'Not scheduled',
        Capacity: `${data.enrolledCount}/${data.capacity}`,
        Semester: data.semesterNameEn,
        Status: status,
      }).map(([label, value]) => <div key={label} className="grid grid-cols-[100px_1fr] gap-3 text-sm"><dt className="text-[#68728a]">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl>
      <div className="mt-6 flex justify-end gap-3"><button type="button" className={button} onClick={() => onEdit(data)}>Edit</button><button type="button" className={`${button} bg-[#273238] text-white`} onClick={() => { setError(''); setConfirm(true) }}>Delete</button></div>
    </>)}
  </Modal>
}
