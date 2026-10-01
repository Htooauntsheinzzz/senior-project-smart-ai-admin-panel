import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import type { CourseFilters as Filters } from '../../types/course'
import type { CourseCatalogContext } from './courseCatalogContext'
import { changeCourseFilter, coursesCsv, emptyCourseFilters, filterCourses } from '../../utils/courses'
import CourseFilters from './CourseFilters'
import CourseSummaryCards from './CourseSummaryCards'
import CoursesTable from './CoursesTable'
import Modal from '../ui/Modal'

export default function CoursesContent() {
  const { courses, state, retry, filters, setFilters, message, setMessage } = useOutletContext<CourseCatalogContext>()
  const navigate = useNavigate()
  const [dialog, setDialog] = useState<{ title: string; text: string } | null>(null)
  const filtered = filterCourses(courses, filters)
  function changeFilter(key: keyof Filters, value: string) { setFilters(previous => changeCourseFilter(previous, key, value, courses)) }
  function exportCourses() {
    try {
      const url = URL.createObjectURL(new Blob(['\ufeff', coursesCsv(filtered)], { type: 'text/csv;charset=utf-8;' }))
      const link = document.createElement('a')
      link.href = url; link.download = 'courses.csv'
      document.body.appendChild(link); link.click(); link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setMessage(`CSV prepared for ${filtered.length} filtered courses. Download requested as courses.csv.`)
    } catch { setMessage('Unable to prepare the export. Please try again.') }
  }
  const action = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-[13px] leading-[19.5px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'
  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-[1.25px] border-[#e5e8f0] px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Courses</h1><p className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">Manage course catalog, credit hours, and assignments across all departments.</p></div><div className="flex flex-wrap items-center gap-2.5">
      <button type="button" onClick={() => setDialog({ title: 'Import Courses', text: 'Course import is not available right now. An approved file format, validation rules, and import service have not been supplied.' })} className={`${action} border-[1.25px] border-[#e5e8f0] bg-white`}><img src="/assets/figma/course-upload.svg" width="14" height="14" alt="" />Import Courses</button>
      <button type="button" disabled={state !== 'ready' || !filtered.length} onClick={exportCourses} className={`${action} border-[1.25px] border-[#e5e8f0] bg-white`}><img src="/assets/figma/course-download.svg" width="16" height="16" alt="" />Export</button>
      <button type="button" onClick={() => navigate('/admin/courses/new')} className={`${action} bg-linear-[164.63deg,#273238,#1a2329] text-white`}><img src="/assets/figma/faculty-plus.svg" width="16" height="16" alt="" />Add Course</button>
    </div></header>
    <CourseSummaryCards courses={courses} ready={state === 'ready'} />
    <CourseFilters courses={courses} filters={filters} onChange={changeFilter} disabled={state === 'loading'} />
    <div className="px-4 pb-6 sm:px-7"><CoursesTable courses={filtered} state={state} onRetry={retry} onClear={() => setFilters({ ...emptyCourseFilters })} onAction={course => setDialog({ title: `${course.code} — Actions`, text: `Actions for ${course.name} are not available right now. Course editing, deletion, and assignment actions have not been integrated.` })} />
      {state === 'ready' && <p role="status" className="pt-3 text-[12.5px] leading-[18.75px] text-[#68728a]">Showing <strong className="font-bold text-[#17213c]">{filtered.length}</strong> of <strong className="font-bold text-[#17213c]">{courses.length}</strong> courses</p>}
      <p className="mt-4 text-xs leading-5 text-[#68728a]">Demo catalog. Program memberships are illustrative sample data; current semester is configured as Sem 1/2568.</p><p role="status" className="mt-2 text-[13px] leading-5 text-[#68728a]">{message}</p>
    </div>
    {dialog && <Modal title={dialog.title} onClose={() => setDialog(null)}><p className="text-sm leading-6 text-[#68728a]">{dialog.text}</p></Modal>}
  </main>
}
