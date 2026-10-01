import { useEffect, useRef, useState } from 'react'
import { initialEnrollments, type Enrollment } from '../../data/enrollments'
import { emptyEnrollmentFilters, enrollmentTotals, enrollmentsCsv, filterEnrollments, type EnrollmentFilters } from '../../utils/enrollments'
import Modal from '../ui/Modal'
import EnrollStudentModal from './EnrollStudentModal'

export default function EnrollmentsContent() {
  const [enrollments, setEnrollments] = useState(initialEnrollments)
  const [enrolling, setEnrolling] = useState(false)
  const [filters, setFilters] = useState({ ...emptyEnrollmentFilters })
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [dialog, setDialog] = useState<{ title: string; text: string } | null>(null)
  const [message, setMessage] = useState('')
  const selectAll = useRef<HTMLInputElement>(null)
  const filtered = filterEnrollments(enrollments, filters)
  const pages = Math.max(1, Math.ceil(filtered.length / 10))
  const visible = filtered.slice((page - 1) * 10, page * 10)
  const checked = visible.filter(row => selected.has(row.id)).length
  useEffect(() => { if (selectAll.current) selectAll.current.indeterminate = checked > 0 && checked < visible.length }, [checked, visible.length])
  function update(key: keyof EnrollmentFilters, value: string) {
    setFilters(previous => ({ ...previous, [key]: value, ...(key === 'course' ? { section: '' } : {}) })); setPage(1); setSelected(new Set()); setMessage('')
  }
  function toggle(row: Enrollment) { setSelected(previous => { const next = new Set(previous); if (next.has(row.id)) next.delete(row.id); else next.add(row.id); return next }) }
  function exportRows() {
    const rows = selected.size ? filtered.filter(row => selected.has(row.id)) : filtered
    const url = URL.createObjectURL(new Blob([enrollmentsCsv(rows)], { type: 'text/csv;charset=utf-8;' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'enrollments.csv'; anchor.click(); URL.revokeObjectURL(url)
    setMessage(`Exported ${rows.length} ${selected.size ? 'selected' : 'filtered'} enrollments.`)
  }
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl border-[1.25px] border-[#e5e8f0] bg-white px-4 py-2 text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'
  const totals = enrollmentTotals(enrollments)
  const dropdowns: { key: Exclude<keyof EnrollmentFilters, 'query'>; label: string; width: string }[] = [
    { key: 'studentId', label: 'Student', width: 'sm:w-[150px]' }, { key: 'course', label: 'Course', width: 'sm:w-[130px]' }, { key: 'section', label: 'Section', width: 'sm:w-[130px]' },
    { key: 'semester', label: 'Semester', width: 'sm:w-[130px]' }, { key: 'year', label: 'Academic Year', width: 'sm:w-[142px]' }, { key: 'status', label: 'Status', width: 'sm:w-[130px]' },
  ]
  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-[1.25px] border-[#e5e8f0] bg-white px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Enrollments</h1><p className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">Manage course enrollments across semesters and academic years.</p></div><div className="flex flex-wrap gap-2.5">
      <button type="button" className={button} onClick={() => setDialog({ title: 'Bulk Enroll', text: 'Bulk enrollment is not available right now. An import format and enrollment service have not been supplied.' })}><img src="/assets/figma/course-upload.svg" width="16" height="16" alt="" />Bulk Enroll</button>
      <button type="button" className={button} disabled={!filtered.length} onClick={exportRows}><img src="/assets/figma/course-download.svg" width="16" height="16" alt="" />Export</button>
      <button type="button" className={`${button} border-transparent bg-linear-[165deg,#273238,#1a2329] text-white shadow-md`} onClick={() => setEnrolling(true)}><img src="/assets/figma/faculty-plus.svg" width="16" height="16" alt="" />Enroll Student</button>
    </div></header>
    <div className="grid grid-cols-1 gap-4 px-4 pt-5 sm:grid-cols-2 sm:px-7 xl:grid-cols-4">{[
      ['📋', 'Total Enrollments', '#273238', '#27323812'], ['✅', 'Active', '#059669', '#d1fae5'], ['⌛', 'Pending Approval', '#d97706', '#fef3c7'], ['❌', 'Withdrawn / Dropped', '#d80255', '#fcecf3'],
    ].map(([icon, label, color, background], index) => <div key={label} className="flex items-center gap-3.5 rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white px-4 py-3.5"><span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background }}>{icon}</span><div><p className="font-display text-[23px] leading-6 font-extrabold" style={{ color }}>{totals[index]}</p><p className="mt-1 text-[11px] text-[#68728a]">{label}</p></div></div>)}</div>
    <div className="flex flex-wrap items-center gap-3 px-4 pt-5 pb-3 sm:px-7"><div className="relative min-w-[220px] flex-1"><img src="/assets/figma/faculty-search.svg" width="16" height="16" alt="" className="pointer-events-none absolute top-3.5 left-3.5" /><input type="search" aria-label="Search enrollments" placeholder="Search by student ID, name or course..." value={filters.query} onChange={event => update('query', event.target.value)} className="h-[42px] w-full rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-3.5 pl-10 text-[13px] placeholder:text-[#68728a]/75 focus-visible:outline-2" /></div>{dropdowns.map(({ key, label, width }) => {
      const options = [...new Set(enrollments.filter(row => key !== 'section' || !filters.course || row.course === filters.course).map(row => row[key]))]
      return <div key={key} className={`relative w-full ${width}`}><select aria-label={label} value={filters[key]} onChange={event => update(key, event.target.value)} className="h-[39px] w-full appearance-none rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-8 pl-4 text-[13px] text-[#68728a] focus-visible:outline-2"><option value="">{label}</option>{options.map(option => <option key={option} value={option}>{key === 'studentId' ? `${option} — ${initialEnrollments.find(row => row.studentId === option)?.name}` : option}</option>)}</select><img src="/assets/figma/department-filter-arrow.svg" width="10" height="6" alt="" className="pointer-events-none absolute top-4 right-3.5" /></div>
    })}</div>
    <div className="px-4 pb-6 sm:px-7">
      {selected.size > 0 && <div role="status" className="mb-3 flex items-center gap-4 text-sm text-[#68728a]">{selected.size} selected — Export uses selected rows.<button type="button" onClick={() => setSelected(new Set())} className="rounded font-semibold underline focus-visible:outline-2">Clear selection</button></div>}
      <div className="overflow-hidden rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white"><div role="region" aria-label="Enrollments table" tabIndex={0} className="overflow-x-auto focus-visible:outline-2"><table className="w-full min-w-[1380px] table-fixed text-left text-[13px] leading-[19.5px]"><caption className="sr-only">Student course enrollments</caption><colgroup>{[3, 12, 19, 17, 9, 12, 8, 10, 6].map((width, index) => <col key={index} style={{ width: `${width}%` }} />)}</colgroup><thead className="bg-[#fafbfc] text-[#68728a]"><tr><th className="px-4 py-3.5"><input ref={selectAll} type="checkbox" aria-label="Select all enrollments on this page" checked={visible.length > 0 && checked === visible.length} disabled={!visible.length} onChange={event => { const all = event.target.checked; setSelected(previous => { const next = new Set(previous); visible.forEach(row => { if (all) next.add(row.id); else next.delete(row.id) }); return next }) }} className="size-4 accent-[#273238]" /></th>{['Student ID', 'Student Name', 'Course', 'Section', 'Enrollment Date', 'Semester', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-3.5 font-semibold">{label}</th>)}</tr></thead><tbody>{visible.map(row => <tr key={row.id} className="border-t-[1.25px] border-[#e5e8f0]">
        <td className="px-4 py-3.5"><input type="checkbox" aria-label={`Select ${row.name}, ${row.course}, ${row.section}`} checked={selected.has(row.id)} onChange={() => toggle(row)} className="size-4 accent-[#273238]" /></td>
        <td className="px-4 py-3.5"><span className="whitespace-nowrap rounded-lg bg-[#273238]/6 px-2 py-1 font-mono text-xs font-bold text-[#273238]">{row.studentId}</span></td>
        <th scope="row" className="px-4 py-3.5 font-semibold"><div className="flex items-center gap-2.5"><span aria-hidden="true" className="flex size-[30px] shrink-0 items-center justify-center rounded-full text-[10px] text-white" style={{ background: row.color }}>{row.name.split(' ').slice(0, 2).map(part => part[0]).join('')}</span>{row.name}</div></th>
        <td className="px-4 py-3.5"><span className="font-bold text-[#273238]">{row.course}</span><span title={row.courseName} className="mt-1 block truncate text-[11.5px] leading-[17.25px] text-[#68728a]">{row.courseName}</span></td>
        <td className="px-4 py-3.5"><span className="rounded-lg bg-[#ede9fe] px-2 py-1 text-xs font-semibold text-[#7c3aed]">{row.section}</span></td><td className="px-4 py-3.5 text-[#68728a]">{row.date}</td>
        <td className="px-4 py-3.5"><span className="font-semibold">{row.semester}</span><span className="block text-[11.5px] text-[#68728a]">{row.year}</span></td>
        <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${row.status === 'Active' ? 'bg-[#d1fae5] text-[#059669]' : row.status === 'Pending' ? 'bg-[#fef3c7] text-[#d97706]' : 'bg-[#fcecf3] text-[#d80255]'}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{row.status}</span></td>
        <td className="px-4 py-3.5"><button type="button" aria-label={`Actions for ${row.name}, ${row.course}`} onClick={() => setDialog({ title: `${row.name} — ${row.course}`, text: 'Enrollment actions are not available right now. Approval, withdrawal, and other record changes have not been integrated.' })} className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f7f8fc] focus-visible:outline-2"><img src="/assets/figma/faculty-dots.svg" width="18" height="18" alt="" /></button></td>
      </tr>)}</tbody></table></div>{!filtered.length && <div className="py-12 text-center text-sm text-[#68728a]"><p role="status">No enrollments match your search and filters.</p><button type="button" className={`${button} mt-4`} onClick={() => { setFilters({ ...emptyEnrollmentFilters }); setPage(1) }}>Clear filters</button></div>}</div>
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-[13px] text-[#68728a]"><p role="status">Showing <strong className="text-[#17213c]">{filtered.length ? (page - 1) * 10 + 1 : 0}–{Math.min(page * 10, filtered.length)}</strong> of <strong className="text-[#17213c]">{filtered.length}</strong> enrollments</p><nav aria-label="Enrollment pagination" className="flex gap-1.5"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)} className={`${button} size-8 px-0`}>‹</button>{Array.from({ length: pages }, (_, index) => index + 1).map(number => <button type="button" key={number} aria-label={`Page ${number}`} aria-current={page === number ? 'page' : undefined} onClick={() => setPage(number)} className={`${button} size-8 px-0 ${page === number ? 'bg-linear-[165deg,#273238,#1a2329] text-white' : ''}`}>{number}</button>)}<button type="button" aria-label="Next page" disabled={page === pages} onClick={() => setPage(page + 1)} className={`${button} size-8 px-0`}>›</button></nav></div>
      <p className="mt-5 text-xs leading-5 text-[#68728a]">Demo mode: 10 Figma reference records and 10 labeled synthetic records, plus any local additions. Enrollment options use local data; confirmations create Active demo records only and reset when you leave or reload. Summary cards cover all records.</p><p role="status" className="mt-2 text-xs text-[#68728a]">{message}</p>
    </div>{dialog && <Modal title={dialog.title} onClose={() => setDialog(null)}><p className="text-sm leading-6 text-[#68728a]">{dialog.text}</p></Modal>}
    {enrolling && <EnrollStudentModal rows={enrollments} onClose={() => setEnrolling(false)} onEnroll={row => {
      setEnrollments(previous => [row, ...previous]); setEnrolling(false); setPage(1); setSelected(new Set())
      setMessage(`${row.name} enrolled in ${row.course}, ${row.section} in the local demo.${filterEnrollments([row], filters).length ? '' : ' Your current filters hide this enrollment.'} No server record was created.`)
    }} />}
  </main>
}
