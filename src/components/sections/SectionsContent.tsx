import { useState } from 'react'
import { initialCourses } from '../../data/courses'
import { initialSections, sectionLecturers, sectionSemesters, sectionYears } from '../../data/courseSections'
import type { CourseSection, SectionDraft, SectionFilters } from '../../types/courseSection'
import { createDemoSection, emptySectionFilters, filterSections, sectionTotals } from '../../utils/courseSections'
import SectionsTable from './SectionsTable'
import CreateSectionDrawer from './CreateSectionDrawer'
import Modal from '../ui/Modal'

export default function SectionsContent({ adding, onOpen, onClose }: { adding: boolean; onOpen: () => void; onClose: () => void }) {
  const [sections, setSections] = useState(initialSections)
  const [filters, setFilters] = useState({ ...emptySectionFilters })
  const [selected, setSelected] = useState<CourseSection | null>(null)
  const [message, setMessage] = useState('')
  const totals = sectionTotals(sections)
  const filtered = filterSections(sections, filters)
  const visibleTotals = sectionTotals(filtered)
  function createSection(value: SectionDraft) {
    const section = createDemoSection(value)
    setSections(previous => [...previous, section]); onClose()
    setMessage(`Section ${section.number} created in the local demo with zero enrolled students.${filterSections([section], filters).length ? '' : ' Your current filters hide this section.'} No server record was created.`)
  }
  const dropdowns: { key: keyof SectionFilters; label: string; width: string; options: { value: string; label: string }[] }[] = [
    { key: 'courseId', label: 'Course', width: 'sm:w-[130px]', options: initialCourses.map(course => ({ value: course.id, label: course.code })) },
    { key: 'semester', label: 'Semester', width: 'sm:w-[130px]', options: sectionSemesters.map(semester => ({ value: semester, label: `Sem ${semester}` })) },
    { key: 'academicYear', label: 'Year', width: 'sm:w-[130px]', options: sectionYears.map(year => ({ value: year, label: year })) },
    { key: 'lecturerId', label: 'Lecturer', width: 'sm:w-[251px]', options: sectionLecturers.map(item => ({ value: item.id, label: item.name })) },
    { key: 'status', label: 'Status', width: 'sm:w-[130px]', options: ['Active', 'Full', 'Closed'].map(status => ({ value: status.toLowerCase(), label: status })) },
  ]
  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-[1.25px] border-[#e5e8f0] px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Course Sections</h1><p className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">Manage individual course sections, lecturers, and class capacity.</p></div><button type="button" onClick={onOpen} aria-expanded={adding} className="inline-flex items-center gap-2 rounded-xl bg-linear-[165deg,#273238,#1a2329] px-4 py-2 text-[13px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2"><img src="/assets/figma/faculty-plus.svg" width="16" height="16" alt="" />Create Section</button></header>
    <div className="grid grid-cols-1 gap-4 px-4 pt-4 pb-1 sm:grid-cols-2 sm:px-7 xl:grid-cols-4">{[
      { label: 'Total Sections', value: totals.total, icon: '📂', color: '#273238', background: 'rgba(39,50,56,0.07)' },
      { label: 'Active Sections', value: totals.active, icon: '✅', color: '#059669', background: '#d1fae5' },
      { label: 'Full Sections', value: totals.full, icon: '⚠️', color: '#d97706', background: '#fef3c7' },
      { label: 'Total Enrolled', value: totals.enrolled, icon: '👥', color: '#7c3aed', background: '#ede9fe' },
    ].map(metric => <div key={metric.label} className="flex items-center gap-3.5 rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white px-4 py-3.5"><span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: metric.background }}>{metric.icon}</span><div><p className="font-display text-xl leading-5 font-extrabold" style={{ color: metric.color }}>{metric.value}</p><p className="mt-1 text-[11px] text-[#68728a]">{metric.label}</p></div></div>)}</div>
    <div className="flex flex-wrap items-center gap-3 px-4 pt-4 pb-3 sm:px-7"><div className="relative w-full sm:w-[260px]"><img src="/assets/figma/faculty-search.svg" width="16" height="16" alt="" className="pointer-events-none absolute top-3.5 left-3.5" /><input type="search" aria-label="Search course or section" placeholder="Search course or section…" value={filters.query} onChange={event => setFilters(previous => ({ ...previous, query: event.target.value }))} className="h-[42px] w-full rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-3.5 pl-10 text-[13px] placeholder:text-[#17213c]/50 focus-visible:outline-2" /></div>{dropdowns.map(dropdown => <div key={dropdown.key} className={`relative w-full ${dropdown.width}`}><select aria-label={dropdown.label} value={filters[dropdown.key]} onChange={event => setFilters(previous => ({ ...previous, [dropdown.key]: event.target.value }))} className="h-[39px] w-full appearance-none rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-9 pl-3.5 text-[13px] text-[#68728a] focus-visible:outline-2"><option value="">{dropdown.label}</option>{dropdown.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><img src="/assets/figma/department-filter-arrow.svg" width="10" height="6" alt="" className="pointer-events-none absolute top-4 right-3.5" /></div>)}</div>
    <div className="px-4 pb-6 sm:px-7"><SectionsTable sections={filtered} onAction={setSelected} onClear={() => setFilters({ ...emptySectionFilters })} /><div role="status" className="flex flex-wrap justify-between gap-2 pt-3 text-[12.5px] text-[#68728a]"><p>Showing <strong className="text-[#17213c]">{filtered.length}</strong> of <strong className="text-[#17213c]">{sections.length}</strong> sections</p><p>{visibleTotals.enrolled} enrolled / {visibleTotals.capacity} total capacity</p></div><p className="mt-4 text-xs leading-5 text-[#68728a]">Demo sections and form options. Changes reset when you leave this page or reload.</p><p role="status" className="mt-2 text-[13px] leading-5 text-[#68728a]">{message}</p></div>
    {adding && <CreateSectionDrawer sections={sections} onCreate={createSection} onClose={onClose} />}
    {selected && <Modal title={`Section ${selected.number} — Actions`} onClose={() => setSelected(null)}><p className="text-sm leading-6 text-[#68728a]">Section actions are not available right now. Editing, enrollment changes, and deletion have not been integrated.</p></Modal>}
  </main>
}
