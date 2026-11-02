import { useEffect, useRef, useState } from 'react'
import { Download, Plus, Upload } from 'lucide-react'
import Modal from '../ui/Modal'
import Pagination from '../ui/Pagination'
import { getSectionDirectory, type ApiSection } from '../../services/sectionService'
import { getSemesters, type Semester } from '../../services/courseService'
import { allowedEnrollmentStatuses, deleteEnrollment, emptyEnrollmentQuery, enrollmentCsv, enrollmentError, enrollmentStatuses, getEnrollment, getEnrollmentExport, getEnrollments, getEnrollmentSummary, setEnrollmentStatus, type EnrollmentDetail, type EnrollmentPage, type EnrollmentQuery, type EnrollmentStatus, type EnrollmentSummary } from '../../services/enrollmentService'
import EnrollmentApiForm from './EnrollmentApiForm'
import EnrollmentRecordPicker, { enrollmentButton as button, enrollmentControl as control, type EnrollmentChoice } from './EnrollmentRecordPicker'

export default function EnrollmentsContent() {
  const [filters, setFilters] = useState({ ...emptyEnrollmentQuery })
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; data?: EnrollmentPage; error?: string }>()
  const [totals, setTotals] = useState<{ version: number; data?: EnrollmentSummary; error?: string }>()
  const [lookup, setLookup] = useState<{ sections: ApiSection[]; semesters: Semester[] }>()
  const [lookupError, setLookupError] = useState('')
  const [studentFilter, setStudentFilter] = useState<EnrollmentChoice>()
  const [pickingStudent, setPickingStudent] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [editing, setEditing] = useState(false)
  const [detail, setDetail] = useState<EnrollmentDetail>()
  const [mode, setMode] = useState<'detail' | 'status' | 'delete'>('detail')
  const [targetStatus, setTargetStatus] = useState<EnrollmentStatus>('ACTIVE')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const allCheckbox = useRef<HTMLInputElement>(null)
  const key = JSON.stringify({ filters, page, version })
  const current = result?.key === key ? result : undefined
  const summary = totals?.version === version ? totals : undefined
  const rows = current?.data?.content ?? []
  const checked = rows.filter(row => selected.has(row.id)).length
  useEffect(() => { if (allCheckbox.current) allCheckbox.current.indeterminate = checked > 0 && checked < rows.length }, [checked, rows.length])
  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      getEnrollments(filters, page - 1, 10, controller.signal).then(data => {
        if (controller.signal.aborted) return
        if (page > Math.max(1, data.totalPages)) { setPage(Math.max(1, data.totalPages)); return }
        setResult({ key, data })
      }).catch(e => { if (!controller.signal.aborted) setResult({ key, error: enrollmentError(e) }) })
    }, 250)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [key, filters, page])
  useEffect(() => {
    const controller = new AbortController()
    getEnrollmentSummary(controller.signal).then(data => { if (!controller.signal.aborted) setTotals({ version, data }) }).catch(e => { if (!controller.signal.aborted) setTotals({ version, error: enrollmentError(e) }) })
    Promise.all([getSectionDirectory({ query: '', courseId: '', semester: '', academicYear: '', lecturerId: '', status: '' }, controller.signal), getSemesters(controller.signal)]).then(([sections, semesters]) => { if (!controller.signal.aborted) { setLookup({ sections, semesters }); setLookupError('') } }).catch(() => { if (!controller.signal.aborted) { setLookup(undefined); setLookupError('Course/section/semester filter choices could not be loaded completely. Search and enrollment forms remain available.') } })
    return () => controller.abort()
  }, [version])
  function update(field: keyof EnrollmentQuery, value: string) {
    setFilters(previous => ({ ...previous, [field]: value, ...(field === 'courseId' || field === 'semesterId' ? { courseSectionId: '' } : {}) })); setPage(1); setSelected(new Set())
  }
  function refresh() { setSelected(new Set()); setVersion(v => v + 1) }
  function saved() { setEnrolling(false); setEditing(false); setDetail(undefined); setMessage('Enrollment saved. Refreshing server records and totals.'); refresh() }
  async function openDetail(id: number) {
    if (lock.current) return
    lock.current = true; setBusy(true); setActionError('')
    try { const row = await getEnrollment(String(id)); setDetail(row); setTargetStatus(row.status); setMode('detail') } catch (e) { setMessage(enrollmentError(e)) } finally { lock.current = false; setBusy(false) }
  }
  async function mutate() {
    if (!detail || lock.current) return
    lock.current = true; setBusy(true); setActionError('')
    try {
      if (mode === 'delete') await deleteEnrollment(String(detail.id))
      else await setEnrollmentStatus(String(detail.id), targetStatus)
      saved()
    } catch (e) { setActionError(enrollmentError(e)) } finally { lock.current = false; setBusy(false) }
  }
  async function exportRows() {
    if (lock.current || !current?.data) return
    lock.current = true; setBusy(true); setMessage('Preparing export…')
    try {
      const exported = selected.size ? rows.filter(row => selected.has(row.id)) : await getEnrollmentExport(filters)
      const url = URL.createObjectURL(new Blob(['\ufeff', enrollmentCsv(exported)], { type: 'text/csv;charset=utf-8;' }))
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'enrollments.csv'; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setMessage(`Exported ${exported.length} ${selected.size ? 'selected rows from this page' : 'filtered enrollments'}.`)
    } catch (e) { setMessage(e instanceof Error && !('response' in e) ? e.message : enrollmentError(e)) } finally { lock.current = false; setBusy(false) }
  }
  const courses = [...new Map(lookup?.sections.map(s => [s.courseId, { id: s.courseId, label: `${s.courseCode} — ${s.courseName}` }])).values()]
  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e8f0] bg-white px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] font-extrabold">Enrollments</h1><p className="mt-1 text-[13px] text-[#68728a]">Manage course enrollments across semesters and academic years.</p></div><div className="flex flex-wrap gap-2"><button disabled aria-describedby="enrollment-limitations" className={`${button} inline-flex items-center gap-2`}><Upload size={15} aria-hidden="true" />Bulk Enroll</button><button disabled={busy || !current?.data?.content.length} onClick={exportRows} className={`${button} inline-flex items-center gap-2`}><Download size={15} aria-hidden="true" />Export</button><button disabled={busy} onClick={() => setEnrolling(true)} className={`${button} inline-flex items-center gap-2 bg-[#273238] text-white`}><Plus size={15} aria-hidden="true" />Enroll Student</button></div></header>
    <div className="px-4 py-5 sm:px-7">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{(['totalEnrollments', 'activeEnrollments', 'pendingEnrollments', 'withdrawnOrDropped'] as const).map((field, index) => <div key={field} className="flex items-center gap-3 rounded-2xl border border-[#e5e8f0] bg-white p-4"><span aria-hidden="true" className={`flex size-10 items-center justify-center rounded-xl text-xl ${['bg-[#f0f1f3]', 'bg-[#d1fae5]', 'bg-[#fef3c7]', 'bg-[#fcecf3]'][index]}`}>{['📋', '✅', '⌛', '❌'][index]}</span><div><dt className="text-xs text-[#68728a]">{['Total Enrollments', 'Active', 'Pending Approval', 'Withdrawn / Dropped'][index]}</dt><dd className="font-display text-[23px] font-extrabold">{summary?.data?.[field] ?? '—'}</dd></div></div>)}</dl>
      {(summary?.error || lookupError) && <p role="alert" className="mt-4 text-sm text-red-700">{summary?.error} {lookupError} <button onClick={refresh} className="underline">Retry</button></p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <input type="search" aria-label="Search enrollments" maxLength={255} placeholder="Search student ID, name or course…" value={filters.search} onChange={e => update('search', e.target.value)} className={control} />
        <button className={`${button} truncate text-left`} onClick={() => setPickingStudent(true)}>{studentFilter?.label || 'All Students — select a student'}</button>
        <select aria-label="Course" value={filters.courseId} disabled={!lookup} onChange={e => update('courseId', e.target.value)} className={control}><option value="">All Courses</option>{courses.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
        <select aria-label="Section" value={filters.courseSectionId} disabled={!lookup} onChange={e => update('courseSectionId', e.target.value)} className={control}><option value="">All Sections</option>{lookup?.sections.filter(s => (!filters.courseId || s.courseId === filters.courseId) && (!filters.semesterId || s.semesterId === filters.semesterId)).map(s => <option key={s.id} value={s.id}>{s.courseCode} — {s.sectionNumber} · {s.semesterNameEn}</option>)}</select>
        <select aria-label="Semester" value={filters.semesterId} disabled={!lookup} onChange={e => update('semesterId', e.target.value)} className={control}><option value="">All Semesters</option>{lookup?.semesters.map(s => <option key={s.id} value={s.id}>{s.semesterNameEn}</option>)}</select>
        <select aria-label="Enrollment status" value={filters.status} onChange={e => update('status', e.target.value)} className={control}><option value="">All Statuses</option>{enrollmentStatuses.map(s => <option key={s}>{s}</option>)}</select>
        <label className="text-xs text-[#68728a]">Enrollment date<input type="date" value={filters.enrollmentDate} onChange={e => update('enrollmentDate', e.target.value)} className={control} /></label>
        <button className={button} onClick={() => { setFilters({ ...emptyEnrollmentQuery }); setStudentFilter(undefined); setPage(1); setSelected(new Set()) }}>Clear Filters</button>
      </div>
      <p id="enrollment-limitations" className="my-3 text-xs leading-5 text-[#68728a]">Bulk enrollment and academic-year filtering have no existing API. Summary counts cover all records. Pending and Active both reserve seats.</p>
      {selected.size > 0 && <p role="status" className="my-3 text-sm">{selected.size} selected on this page — Export uses these rows. <button className="underline" onClick={() => setSelected(new Set())}>Clear selection</button></p>}
      {!current ? <p role="status" className="p-8 text-center">Loading enrollments…</p> : current.error ? <p role="alert" className="p-8 text-center">{current.error} <button className="underline" onClick={refresh}>Retry</button></p> : <>
        <div className="overflow-hidden rounded-2xl border border-[#e5e8f0] bg-white"><div role="region" aria-label="Enrollments table" tabIndex={0} className="overflow-x-auto focus-visible:outline-2"><table className="w-full min-w-[1150px] text-left text-[13px]"><caption className="sr-only">Student course enrollments</caption><thead className="bg-[#fafbfc] text-[#68728a]"><tr><th className="p-3"><input ref={allCheckbox} type="checkbox" aria-label="Select all enrollments on this page" checked={rows.length > 0 && checked === rows.length} disabled={!rows.length} onChange={e => setSelected(e.target.checked ? new Set(rows.map(r => r.id)) : new Set())} /></th>{['Student ID', 'Student Name', 'Course', 'Section', 'Enrollment Date', 'Semester', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="p-3 font-semibold">{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t border-[#e5e8f0]"><td className="p-3"><input type="checkbox" aria-label={`Select ${row.studentCode}, ${row.courseCode}, ${row.sectionNumber}`} checked={selected.has(row.id)} onChange={() => setSelected(previous => { const next = new Set(previous); if (next.has(row.id)) next.delete(row.id); else next.add(row.id); return next })} /></td><td className="p-3 font-mono font-semibold">{row.studentCode}</td><th scope="row" className="p-3 font-semibold">{row.studentName}</th><td className="p-3"><strong>{row.courseCode}</strong><span className="mt-1 block text-xs text-[#68728a]">{row.courseName}</span></td><td className="p-3"><span className="rounded-lg bg-[#ede9fe] px-2 py-1 text-xs text-[#7c3aed]">{row.sectionNumber}</span></td><td className="p-3">{row.enrollmentDate}</td><td className="p-3">{row.semesterNameEn}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs ${row.status === 'ACTIVE' ? 'bg-[#d1fae5] text-[#059669]' : row.status === 'PENDING' ? 'bg-[#fef3c7] text-[#d97706]' : 'bg-[#fcecf3] text-[#d80255]'}`}>{row.status}</span></td><td className="p-3"><button disabled={busy} onClick={() => openDetail(row.id)} className="rounded p-2 underline focus-visible:outline-2">Details</button></td></tr>)}</tbody></table></div>{!rows.length && <p role="status" className="p-10 text-center text-sm">No enrollments match these filters.</p>}</div>
        <Pagination label="Enrollment pagination" page={page} pageCount={Math.max(1, current.data?.totalPages ?? 1)} onPage={value => { setPage(value); setSelected(new Set()) }} summary={`Showing ${rows.length ? (page - 1) * 10 + 1 : 0}–${rows.length ? (page - 1) * 10 + rows.length : 0} of ${current.data?.totalElements ?? 0} enrollments`} />
      </>}
      <p role="status" className="mt-4 text-sm">{message}</p>
    </div>
    {pickingStudent && <Modal title="Filter by Student" onClose={() => setPickingStudent(false)}><EnrollmentRecordPicker kind="student" value={studentFilter} onChange={choice => { setStudentFilter(choice); update('studentId', choice.id); setPickingStudent(false) }} /><button className={`${button} mt-4`} onClick={() => { setStudentFilter(undefined); update('studentId', ''); setPickingStudent(false) }}>All Students</button></Modal>}
    {(enrolling || editing) && <EnrollmentApiForm enrollment={editing ? detail : undefined} onClose={() => { setEnrolling(false); setEditing(false) }} onSaved={saved} />}
    {detail && !editing && <Modal title={mode === 'delete' ? 'Delete Enrollment' : mode === 'status' ? 'Change Enrollment Status' : 'Enrollment Details'} onClose={() => { if (!lock.current) setDetail(undefined) }}>
      {mode === 'detail' ? <><dl className="space-y-3 text-sm">{Object.entries({ Student: `${detail.studentCode} — ${detail.studentName}`, Email: detail.universityEmail, Course: `${detail.courseCode} — ${detail.courseName}`, Section: detail.sectionNumber, Semester: detail.semesterNameEn, Lecturer: detail.lectureNameEn, Room: detail.room, Schedule: detail.schedule, 'Seat usage': `${detail.enrolledCount}/${detail.capacity}${detail.isFull ? ' (full)' : ''}`, 'Enrollment Date': detail.enrollmentDate, Status: detail.status }).map(([label, value]) => <div key={label}><dt className="text-xs text-[#68728a]">{label}</dt><dd className="break-words">{value ?? '—'}</dd></div>)}</dl><div className="mt-5 flex flex-wrap gap-2"><button className={button} onClick={() => setEditing(true)}>Edit</button><button className={button} disabled={allowedEnrollmentStatuses(detail.status).length === 1} onClick={() => { setTargetStatus(detail.status); setMode('status') }}>Change Status</button><button className={button} onClick={() => setMode('delete')}>Delete</button></div></> : <>
        <p className="mb-4 text-sm">{mode === 'delete' ? `Delete ${detail.studentCode}'s enrollment in ${detail.courseCode}, section ${detail.sectionNumber}? This soft-deletes the record and releases any reserved seat. The same student/section pair cannot be recreated.` : `${detail.studentCode} — ${detail.courseCode}. Withdrawn and Dropped are terminal states.`}</p>
        {mode === 'status' && <label className="block text-xs">New status<select disabled={busy} value={targetStatus} onChange={e => setTargetStatus(e.target.value as EnrollmentStatus)} className={control}>{allowedEnrollmentStatuses(detail.status).map(s => <option key={s}>{s}</option>)}</select></label>}
        <div className="mt-4 flex gap-2"><button disabled={busy || (mode === 'status' && targetStatus === detail.status)} className={`${button} bg-[#273238] text-white`} onClick={mutate}>{busy ? 'Saving…' : 'Confirm'}</button><button disabled={busy} className={button} onClick={() => { setMode('detail'); setActionError('') }}>Back</button></div>
      </>}
      {actionError && <p role="alert" className="mt-3 text-sm text-red-700">{actionError}</p>}
    </Modal>}
  </main>
}
