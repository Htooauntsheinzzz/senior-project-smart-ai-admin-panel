import { useState, type KeyboardEvent } from 'react'
import { AlertTriangle, CalendarDays, ChevronDown, List, Plus, X } from 'lucide-react'
import { faculties, initialSchedules, timetableCourses } from '../../data/timetable'
import type { ClassSchedule, ScheduleInput, TimetableFilters } from '../../types/timetable'
import { filterSchedules, formatScheduleTime } from '../../utils/timetable'
import Modal from '../ui/Modal'
import { Panel } from '../dashboard/DashboardUi'
import TimetableCalendar from './TimetableCalendar'
import TimetableList from './TimetableList'
import ScheduleForm from './ScheduleForm'

export default function TimetableContent() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [tab, setTab] = useState<'classes' | 'conflicts'>('classes')
  const [schedules, setSchedules] = useState(initialSchedules)
  const [filters, setFilters] = useState<TimetableFilters>({ semester: '1/2568', academicYear: '2025–2026', faculty: '', department: '', course: '' })
  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState<ClassSchedule | null>(null)
  const [message, setMessage] = useState('')
  const courses = timetableCourses.filter(course => !filters.faculty || course.faculty === filters.faculty)
  const filtered = filterSchedules(schedules, filters)
  function changeFilter(field: keyof TimetableFilters, value: string) {
    setFilters(previous => {
      const next = { ...previous, [field]: value }
      if (field === 'faculty' && !timetableCourses.some(course => (!value || course.faculty === value) && course.department === next.department)) next.department = ''
      if ((field === 'faculty' || field === 'department') && !timetableCourses.some(course => course.code === next.course && (!next.faculty || course.faculty === next.faculty) && (!next.department || course.department === next.department))) next.course = ''
      return next
    })
  }
  function addSchedule(input: ScheduleInput) {
    setSchedules(previous => [...previous, { ...input, id: crypto.randomUUID() }])
    setFilters(previous => ({ ...previous, faculty: '', department: '', course: '' }))
    setTab('classes'); setAdding(false)
    setMessage('Class schedule added to the local demo. No server record was created; changes reset when you leave this page.')
  }
  function tabKeyboard(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? 'classes' : event.key === 'End' ? 'conflicts' : tab === 'classes' ? 'conflicts' : 'classes'
    setTab(next); document.getElementById(`timetable-${next}`)?.focus()
  }
  const dropdowns: { field: keyof TimetableFilters; label: string; options: { value: string; label: string }[]; width: string; period?: boolean }[] = [
    { field: 'semester', label: 'Semester', options: ['1/2568', '2/2568', '1/2569'].map(value => ({ value, label: value })), width: 'w-[120px]', period: true },
    { field: 'academicYear', label: 'Academic year', options: ['2025–2026', '2026–2027'].map(value => ({ value, label: value })), width: 'w-[138px]', period: true },
    { field: 'faculty', label: 'Faculty', options: faculties.map(faculty => ({ value: faculty.id, label: faculty.name })), width: 'w-[192px]' },
    { field: 'department', label: 'Department', options: [...new Set(courses.map(course => course.department))].map(value => ({ value, label: value })), width: 'w-[120px]' },
    { field: 'course', label: 'Course', options: courses.filter(course => !filters.department || course.department === filters.department).map(course => ({ value: course.code, label: course.code })), width: 'w-[120px]' },
  ]
  const selectedCourse = selected ? timetableCourses.find(course => course.code === selected.courseCode) : undefined
  return <main id="timetable-content" className="min-w-0">
    <div className="bg-white px-4 pt-5 sm:px-7">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold text-[#17213c]">Class Timetable</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Weekly schedule view across all faculties and departments</p></div><div className="flex flex-wrap items-center gap-2.5"><div role="group" aria-label="Timetable view" className="inline-flex overflow-hidden rounded-xl border border-[#e5e8f0]">{([{ value: 'calendar', label: 'Calendar', icon: CalendarDays }, { value: 'list', label: 'List', icon: List }] as const).map(({ value, label, icon: Icon }) => <button key={value} type="button" aria-pressed={viewMode === value} onClick={() => setViewMode(value)} className={`flex h-9 items-center gap-1.5 px-3 text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${viewMode === value ? 'bg-[#273238] text-white' : 'bg-white text-[#68728a] hover:bg-[#f7f8fc]'}`}><Icon size={13} aria-hidden="true" />{label}</button>)}</div><button type="button" onClick={() => setAdding(true)} className="inline-flex h-9 items-center gap-2 rounded-xl bg-linear-[164.63deg,#273238_0%,#1a2329_100%] px-4 text-[13px] font-semibold text-white shadow-[0_4px_10px_#27323833] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2"><Plus size={16} aria-hidden="true" />Add Class Schedule</button></div></div>
      <div role="tablist" aria-label="Timetable Management" className="mt-3 flex flex-wrap gap-1">{([{ value: 'classes', label: 'Class Timetable', icon: CalendarDays }, { value: 'conflicts', label: 'Schedule Conflicts', icon: AlertTriangle }] as const).map(({ value, label, icon: Icon }) => <button key={value} id={`timetable-${value}`} type="button" role="tab" aria-selected={tab === value} aria-controls={`timetable-panel-${value}`} tabIndex={tab === value ? 0 : -1} onKeyDown={tabKeyboard} onClick={() => setTab(value)} className={`flex h-10 items-center gap-2 rounded-t-xl border-b-2 px-4 text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${tab === value ? 'border-[#273238] bg-[#f7f7f7] text-[#273238]' : 'border-transparent text-[#68728a] hover:bg-[#f7f8fc]'}`}><Icon size={13} aria-hidden="true" />{label}{value === 'conflicts' && <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-[#d80255] text-[10px] text-white">4</span>}</button>)}</div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-3"><div className="flex flex-wrap gap-3">{dropdowns.map(dropdown => <div key={dropdown.field} className={`relative max-w-full ${dropdown.width}`}><select aria-label={dropdown.label} value={filters[dropdown.field]} onChange={event => changeFilter(dropdown.field, event.target.value)} className={`h-[34px] w-full appearance-none rounded-xl border-[1.25px] pr-8 pl-4 text-[13px] focus-visible:outline-2 ${dropdown.period ? 'border-[#273238] bg-[#f0f1f3] text-[#273238]' : 'border-[#e5e8f0] bg-[#f7f8fc] text-[#68728a]'}`}>{!dropdown.period && <option value="">{dropdown.label}</option>}{dropdown.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={13} aria-hidden="true" className="pointer-events-none absolute top-2.5 right-3 text-[#68728a]" /></div>)}</div><ul aria-label="Faculty color legend" className="flex flex-wrap gap-3">{faculties.map(faculty => <li key={faculty.id} className="flex items-center gap-1.5 text-[11px] text-[#68728a]"><span aria-hidden="true" className="size-2.5 rounded" style={{ background: faculty.color }} />{faculty.label}</li>)}</ul></div>
    </div>
    {tab === 'conflicts' ? <div role="tabpanel" id="timetable-panel-conflicts" aria-labelledby="timetable-conflicts" tabIndex={0} className="p-4 sm:p-7"><Panel title="Schedule Conflicts" subtitle="4 conflicts indicated in the reference"><p className="text-sm leading-6 text-[#68728a]">Conflict details are not available right now. The design supplies a count of four, but no conflict records or connected conflict service.</p><p className="mt-3 text-xs leading-5 text-[#68728a]">The Add Class Schedule demo checks new entries for overlapping rooms, instructors, or course sections.</p></Panel></div> : <div role="tabpanel" id="timetable-panel-classes" aria-labelledby="timetable-classes">
      {!filtered.length && <p role="status" className="border-t border-[#e5e8f0] bg-white px-7 py-6 text-sm text-[#68728a]">No class schedules match this semester, academic year, or filter combination.</p>}
      {viewMode === 'calendar' ? <TimetableCalendar schedules={filtered} onSelect={setSelected} /> : <TimetableList schedules={filtered} onSelect={setSelected} />}
    </div>}
    {adding && <ScheduleForm schedules={schedules} semester={filters.semester} academicYear={filters.academicYear} onAdd={addSchedule} onClose={() => setAdding(false)} />}
    {selected && selectedCourse && <Modal title={`${selected.courseCode} — ${selectedCourse.title}`} onClose={() => setSelected(null)}><dl className="space-y-3">{Object.entries({ Day: selected.day, Time: `${formatScheduleTime(selected.start)}–${formatScheduleTime(selected.end)}`, Section: selected.section, Room: selected.room, Instructor: selected.instructor, Faculty: faculties.find(faculty => faculty.id === selectedCourse.faculty)?.name ?? '', Department: selectedCourse.department, Semester: selected.semester, 'Academic year': selected.academicYear }).map(([label, value]) => <div key={label} className="grid grid-cols-[100px_1fr] gap-3 text-[13px] leading-5"><dt className="text-[#68728a]">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl><p className="mt-5 text-xs leading-5 text-[#68728a]">Demo schedule. Ellipses preserve values clipped in the design reference; department assignments are sample metadata.</p></Modal>}
    {message && <div role="status" className="fixed right-4 bottom-4 z-40 flex max-w-[calc(100vw-32px)] items-start gap-3 rounded-xl border border-[#e5e8f0] bg-white p-4 text-xs leading-5 text-[#68728a] shadow-lg sm:max-w-sm"><p>{message}</p><button type="button" aria-label="Dismiss message" onClick={() => setMessage('')} className="rounded p-1 focus-visible:outline-2"><X size={16} /></button></div>}
  </main>
}
