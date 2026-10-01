import { useState } from 'react'
import { Download, Plus, Upload, X } from 'lucide-react'
import { initialStudents } from '../../data/students'
import type { Student, StudentFilters as Filters, StudentInput } from '../../types/student'
import { emptyStudentFilters, filterStudents, makeLocalStudent, studentsCsv, updateStudentFilters } from '../../utils/students'
import Modal from '../ui/Modal'
import Pagination from '../ui/Pagination'
import StudentSummaryCards from './StudentSummaryCards'
import StudentFilters from './StudentFilters'
import StudentTable from './StudentTable'
import StudentForm from './StudentForm'

export default function StudentsContent() {
  const [students, setStudents] = useState(initialStudents)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>(emptyStudentFilters)
  const [page, setPage] = useState(1)
  const [adding, setAdding] = useState(false)
  const [importing, setImporting] = useState(false)
  const [selected, setSelected] = useState<Student | null>(null)
  const [message, setMessage] = useState('')
  const filtered = filterStudents(students, query, filters)
  const pageSize = 10
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * pageSize
  const visible = filtered.slice(start, start + pageSize)

  function changeFilter(field: keyof Filters, value: string) {
    setFilters(previous => updateStudentFilters(previous, field, value))
    setPage(1)
  }
  function addStudent(input: StudentInput) {
    const student = makeLocalStudent(input)
    setStudents(previous => [student, ...previous])
    setQuery(''); setFilters(emptyStudentFilters); setPage(1); setAdding(false)
    setMessage(`${student.name} added to the local demo list. No server account was created.`)
  }
  function exportStudents() {
    const url = URL.createObjectURL(new Blob(['\ufeff', studentsCsv(filtered)], { type: 'text/csv;charset=utf-8;' }))
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = 'students.csv'; anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage(`Exported all ${filtered.length} filtered students to students.csv.`)
  }
  const action = 'inline-flex h-[39px] items-center justify-center gap-2 rounded-xl border-[1.25px] border-[#e5e8f0] bg-white px-3.5 text-[13px] font-semibold text-[#273238] hover:bg-[#f7f8fc] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'
  return <main id="students-content" className="min-w-0 pb-3">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e8f0] px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold text-[#17213c]">Students</h1><p className="mt-1 text-[13.5px] leading-[20.25px] text-[#68728a]">Manage students who use the SMART AI University Student Assistant mobile app.</p></div><div className="flex flex-wrap items-center gap-2.5"><button type="button" onClick={() => setImporting(true)} className={action}><Upload size={15} aria-hidden="true" />Import Students</button><button type="button" onClick={exportStudents} disabled={!filtered.length} className={action}><Download size={15} aria-hidden="true" />Export Students</button><button type="button" onClick={() => setAdding(true)} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-linear-[164.63deg,#273238_0%,#1a2329_100%] px-3.5 text-[13px] font-semibold text-white hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2"><Plus size={16} aria-hidden="true" />Add Student</button></div></div>
    <div className="px-4 sm:px-7">
      <StudentSummaryCards students={students} />
      <StudentFilters query={query} filters={filters} onQuery={value => { setQuery(value); setPage(1) }} onFilter={changeFilter} />
      <StudentTable students={visible} onActions={setSelected} />
      <Pagination label="Students pagination" page={currentPage} pageCount={pageCount} onPage={setPage} summary={filtered.length ? <>Showing <strong className="font-semibold text-[#17213c]">{start + 1}–{start + visible.length}</strong> of <strong className="font-semibold text-[#17213c]">{filtered.length}</strong> students</> : <>Showing <strong className="font-semibold text-[#17213c]">0</strong> of <strong className="font-semibold text-[#17213c]">0</strong> students</>} />
    </div>
    {adding && <StudentForm students={students} onAdd={addStudent} onClose={() => setAdding(false)} />}
    {importing && <Modal title="Import Students" onClose={() => setImporting(false)}><p className="text-sm leading-6 text-[#68728a]">Import is not available right now. A student import format and backend integration have not been configured.</p><p className="mt-3 text-xs leading-5 text-[#68728a]">Use Add Student to try the local demo. No files are uploaded or records imported.</p><button type="button" onClick={() => setImporting(false)} className="mt-5 rounded-xl bg-[#273238] px-4 py-2.5 text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2">Close</button></Modal>}
    {selected && <Modal title="Student Details" onClose={() => setSelected(null)}><dl className="space-y-3">{Object.entries({ Name: selected.name, 'Student ID': selected.studentId, Email: selected.email, Faculty: selected.faculty, Department: selected.department, Major: selected.major, Year: `Year ${selected.year}`, Semester: selected.semester, Status: selected.status }).map(([label, value]) => <div key={label} className="grid grid-cols-[90px_1fr] gap-3 text-[13px] leading-5"><dt className="text-[#68728a]">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl><p className="mt-5 text-xs leading-5 text-[#68728a]">{selected.source === 'figma' ? 'Reference fixture transcribed from Figma.' : selected.source === 'synthetic' ? 'Synthetic demo record, not supplied by Figma.' : 'Locally added demo record, not saved to a server.'}</p></Modal>}
    {message && <div role="status" className="fixed right-4 bottom-4 z-40 flex max-w-[calc(100vw-32px)] items-start gap-3 rounded-xl border border-[#e5e8f0] bg-white p-4 text-xs leading-5 text-[#68728a] shadow-lg sm:max-w-sm"><p>{message}</p><button type="button" aria-label="Dismiss message" onClick={() => setMessage('')} className="rounded p-1 focus-visible:outline-2"><X size={16} /></button></div>}
  </main>
}
