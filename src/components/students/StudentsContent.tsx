import { useEffect, useState } from 'react'
import { Download, Plus, Upload } from 'lucide-react'
import Modal from '../ui/Modal'
import Pagination from '../ui/Pagination'
import { getFaculties } from '../../services/facultyService'
import { getDepartmentDirectory } from '../../services/departmentService'
import { getProgramDirectory } from '../../services/programService'
import { getSemesters } from '../../services/courseService'
import { deleteStudent, exportStudentRows, getStudent, getStudents, getStudentSummary, passwordPayload, resetStudentPassword, studentError, studentStatuses, type StudentPage, type StudentRecord, type StudentSummary } from '../../services/studentService'
import StudentApiForm, { studentButton, studentControl, type StudentLookups } from './StudentApiForm'

const initialFilters = { search: '', facultyId: '', departmentId: '', programId: '', semesterId: '', academicYear: '', enrollmentYear: '', status: '' }
export default function StudentsContent() {
  const [filters, setFilters] = useState(initialFilters)
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; data?: StudentPage; error?: string }>()
  const [summary, setSummary] = useState<StudentSummary>()
  const [summaryError, setSummaryError] = useState('')
  const [lookups, setLookups] = useState<StudentLookups>()
  const [lookupError, setLookupError] = useState('')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState<StudentRecord>()
  const [mode, setMode] = useState<'detail' | 'delete' | 'password'>('detail')
  const [passwords, setPasswords] = useState({ temporaryPassword: '', confirmPassword: '' })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const key = JSON.stringify({ filters, page, version })
  const current = result?.key === key ? result : undefined
  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      getStudents(filters, page - 1, 10, controller.signal).then(data => {
        if (controller.signal.aborted) return
        if (page > Math.max(1, data.totalPages)) { setPage(Math.max(1, data.totalPages)); return }
        setResult({ key, data })
      }).catch(e => { if (!controller.signal.aborted) setResult({ key, error: studentError(e) }) })
    }, 250)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [key, filters, page])
  useEffect(() => {
    const controller = new AbortController()
    getStudentSummary(controller.signal).then(data => { if (!controller.signal.aborted) { setSummary(data); setSummaryError('') } }).catch(e => { if (!controller.signal.aborted) { setSummary(undefined); setSummaryError(studentError(e)) } })
    Promise.all([getFaculties('', controller.signal), getDepartmentDirectory({ query: '', facultyId: '', status: '' }, controller.signal), getProgramDirectory({ query: '', facultyId: '', departmentId: '', degreeId: '', status: '' }, controller.signal), getSemesters(controller.signal)]).then(([f, d, p, s]) => { if (!controller.signal.aborted) { setLookups({ faculties: f.map(r => ({ ...r, name: r.nameEn })), departments: d, programs: p, semesters: s.map(r => ({ id: String(r.id), name: r.semesterNameEn })) }); setLookupError('') } }).catch(() => { if (!controller.signal.aborted) { setLookups(undefined); setLookupError('Academic choices could not be loaded. Retry before adding or editing students.') } })
    return () => controller.abort()
  }, [version])
  function change(field: string, value: string) { setFilters(f => ({ ...f, [field]: value, ...(field === 'facultyId' ? { departmentId: '', programId: '' } : field === 'departmentId' ? { programId: '' } : {}) })); setPage(1) }
  function saved() { setAdding(false); setEditing(false); setSelected(undefined); setPasswords({ temporaryPassword: '', confirmPassword: '' }); setMessage('Student change saved. Refreshing server data.'); setVersion(v => v + 1) }
  async function details(row: StudentRecord) {
    setBusy(true); setActionError(''); setMessage('')
    try { setSelected(await getStudent(String(row.id))); setMode('detail') } catch (e) { setMessage(studentError(e)) } finally { setBusy(false) }
  }
  async function mutate() {
    if (!selected || busy) return
    if (mode === 'password') { try { passwordPayload(passwords) } catch (e) { setActionError((e as Error).message); return } }
    setBusy(true); setActionError('')
    try { if (mode === 'delete') await deleteStudent(String(selected.id)); else await resetStudentPassword(String(selected.id), passwords); saved() } catch (e) { setActionError(studentError(e)) } finally { setBusy(false) }
  }
  async function exportCsv() {
    setBusy(true); setMessage('Preparing export…')
    try {
      const rows = await exportStudentRows(filters)
      const cell = (v: unknown) => { const s = String(v ?? ''); return `"${(/^[\s]*[=+@-]/.test(s) ? "'" + s : s).replaceAll('"', '""')}"` }
      const columns = ['studentCode', 'firstName', 'lastName', 'universityEmail', 'facultyNameEn', 'departmentName', 'programName', 'semesterNameEn', 'academicYear', 'enrollmentYear', 'accountStatus'] as const
      const csv = [columns.join(','), ...rows.map(r => columns.map(c => cell(r[c])).join(','))].join('\r\n')
      const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }))
      const a = document.createElement('a'); a.href = url; a.download = 'students.csv'; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setMessage(`Exported ${rows.length} students matching the filters.`)
    } catch (e) { setMessage(e instanceof Error && !('response' in e) ? e.message : studentError(e)) } finally { setBusy(false) }
  }
  return <main className="min-w-0 p-4 text-[#17213c] sm:p-7">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="font-display text-[22px] font-extrabold">Students</h1><p className="mt-1 text-sm text-[#68728a]">Manage students who use the SMART AI University Student Assistant mobile app.</p></div><div className="flex flex-wrap gap-2"><button disabled title="No student import API is available" className="flex items-center gap-2 rounded-xl border p-2 text-sm opacity-50"><Upload size={15} />Import Students</button><button disabled={busy || !current?.data} onClick={exportCsv} className="flex items-center gap-2 rounded-xl border p-2 text-sm disabled:opacity-50"><Download size={15} />Export Students</button><button disabled={!lookups || busy} onClick={() => setAdding(true)} className={`${studentButton} flex items-center gap-2`}><Plus size={15} />Add Student</button></div></header>
    <dl className="my-5 grid grid-cols-2 gap-3 xl:grid-cols-4">{(['totalStudents', 'activeStudents', 'pendingStudents', 'inactiveOrSuspendedStudents'] as const).map((k, i) => <div key={k} className="rounded-2xl border border-[#e5e8f0] bg-white p-4"><dt className="text-xs text-[#68728a]">{['Total Students', 'Active', 'Pending', 'Inactive / Suspended'][i]}</dt><dd className="mt-2 text-2xl font-bold">{summary?.[k] ?? '—'}</dd></div>)}</dl>
    {(summaryError || lookupError) && <p role="alert" className="mb-4 text-sm text-red-700">{summaryError || lookupError} <button onClick={() => setVersion(v => v + 1)} className="underline">Retry</button></p>}
    <div className="mb-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-4"><input aria-label="Search students" placeholder="Search name, ID or email…" maxLength={255} value={filters.search} onChange={e => change('search', e.target.value)} className={studentControl} />
      {(['faculties', 'departments', 'programs', 'semesters'] as const).map((group, i) => { const field = ['facultyId', 'departmentId', 'programId', 'semesterId'][i] as keyof typeof filters; return <select key={group} aria-label={group} disabled={!lookups} className={studentControl} value={filters[field]} onChange={e => change(field, e.target.value)}><option value="">All {group}</option>{lookups?.[group].filter(o => (group !== 'departments' || !filters.facultyId || o.facultyId === filters.facultyId) && (group !== 'programs' || ((!filters.facultyId || o.facultyId === filters.facultyId) && (!filters.departmentId || o.departmentId === filters.departmentId)))).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select> })}
      {(['academicYear', 'enrollmentYear'] as const).map(field => <input key={field} aria-label={field === 'academicYear' ? 'Academic year' : 'Enrollment year'} placeholder={field === 'academicYear' ? 'Academic year' : 'Enrollment year'} value={filters[field]} onChange={e => change(field, e.target.value)} className={studentControl} />)}
      <select aria-label="Account status" className={studentControl} value={filters.status} onChange={e => change('status', e.target.value)}><option value="">All statuses</option>{studentStatuses.map(s => <option key={s}>{s}</option>)}</select></div>
    <button className="mb-3 text-xs underline" onClick={() => { setFilters(initialFilters); setPage(1) }}>Clear filters</button>
    {!current ? <p role="status">Loading students…</p> : current.error ? <p role="alert">{current.error} <button className="underline" onClick={() => setVersion(v => v + 1)}>Retry</button></p> : <><div tabIndex={0} role="region" aria-label="Students table" className="overflow-x-auto rounded-2xl border border-[#e5e8f0] bg-white"><table className="w-full min-w-[1100px] text-left text-xs"><thead className="bg-[#f7f8fc] text-[#68728a]"><tr>{['Student ID', 'Name / Email', 'Faculty', 'Department', 'Program / Major', 'Academic Year', 'Semester', 'Status', 'Actions'].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{current.data?.content.map(row => <tr key={row.id} className="border-t border-[#e5e8f0]"><td className="p-3">{row.studentCode}</td><td className="p-3 font-semibold">{row.firstName} {row.lastName}<span className="mt-1 block font-normal text-[#68728a]">{row.universityEmail}</span></td>{[row.facultyNameEn, row.departmentName, row.programName, row.academicYear, row.semesterNameEn, row.accountStatus].map((v, i) => <td key={i} className="p-3">{v ?? '—'}</td>)}<td className="p-3"><button disabled={busy} onClick={() => details(row)} className="underline">Details</button></td></tr>)}</tbody></table>{!current.data?.content.length && <p className="p-10 text-center">No students match these filters.</p>}</div><Pagination label="Students pagination" page={page} pageCount={Math.max(1, current.data?.totalPages ?? 1)} onPage={setPage} summary={`${current.data?.totalElements ?? 0} students · page ${page}`} /></>}
    <p role="status" className="mt-4 text-sm">{message}</p><p className="mt-2 text-xs text-[#68728a]">Import is unavailable: no existing import API. Academic year is a calendar year, not year of study.</p>
    {(adding || editing) && lookups && <StudentApiForm student={editing ? selected : undefined} lookups={lookups} onClose={() => { setAdding(false); setEditing(false) }} onSaved={saved} />}
    {selected && !editing && <Modal title={mode === 'detail' ? 'Student Details' : mode === 'delete' ? 'Delete Student' : 'Reset Student Password'} onClose={() => { if (!busy) { setSelected(undefined); setPasswords({ temporaryPassword: '', confirmPassword: '' }) } }}>
      {mode === 'detail' ? <><dl className="space-y-2 text-sm">{Object.entries({ 'Student ID': selected.studentCode, Name: `${selected.firstName} ${selected.lastName}`, Email: selected.universityEmail, Phone: selected.phoneNumber, 'Date of Birth': selected.dateOfBirth, Faculty: selected.facultyNameEn, Department: selected.departmentName, Program: selected.programName, Semester: selected.semesterNameEn, 'Academic Year': selected.academicYear, 'Enrollment Year': selected.enrollmentYear, Status: selected.accountStatus, 'Password change required': selected.forcePasswordChange ? 'Yes' : 'No' }).map(([k, v]) => <div key={k}><dt className="text-xs text-[#68728a]">{k}</dt><dd className="break-words">{v ?? '—'}</dd></div>)}</dl><div className="mt-5 flex flex-wrap gap-3"><button disabled={!lookups} onClick={() => setEditing(true)} className={studentButton}>Edit</button><button onClick={() => setMode('delete')} className={studentButton}>Delete</button><button disabled={selected.accountStatus === 'PENDING'} onClick={() => setMode('password')} className={studentButton}>Reset Password</button></div></> : <><p className="mb-4 text-sm">{mode === 'delete' ? `Delete ${selected.studentCode}? This soft-deletes the student and revokes access.` : 'Set a temporary password (15+ characters, at most 72 UTF-8 bytes). Existing sessions are revoked.'}</p>{mode === 'password' && <div className="space-y-3">{(['temporaryPassword', 'confirmPassword'] as const).map(k => <label key={k} className="block text-xs">{k === 'temporaryPassword' ? 'Temporary password' : 'Confirm password'}<input autoComplete="new-password" type="password" disabled={busy} value={passwords[k]} onChange={e => setPasswords(p => ({ ...p, [k]: e.target.value }))} className={studentControl} /></label>)}</div>}<button disabled={busy} onClick={mutate} className={`${studentButton} mt-4`}>{busy ? 'Saving…' : 'Confirm'}</button></>}
      {actionError && <p role="alert" className="mt-3 text-sm text-red-700">{actionError}</p>}
    </Modal>}
  </main>
}
