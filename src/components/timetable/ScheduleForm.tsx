import { useRef, useState, type FormEvent } from 'react'
import { timetableCourses } from '../../data/timetable'
import { timetableDays, type ClassSchedule, type ScheduleInput } from '../../types/timetable'
import { formatScheduleTime, validateSchedule } from '../../utils/timetable'
import Modal from '../ui/Modal'

export default function ScheduleForm({ schedules, semester, academicYear, onAdd, onClose }: { schedules: ClassSchedule[]; semester: string; academicYear: string; onAdd: (input: ScheduleInput) => void; onClose: () => void }) {
  const [value, setValue] = useState<ScheduleInput>({ courseCode: 'CS301', day: 'Monday', start: 480, end: 600, section: '', room: '', instructor: '', semester, academicYear })
  const [error, setError] = useState('')
  const errorRef = useRef<HTMLParagraphElement>(null)
  function update(field: keyof ScheduleInput, next: string | number) { setValue(previous => ({ ...previous, [field]: next })); setError('') }
  function submit(event: FormEvent) {
    event.preventDefault()
    const problem = validateSchedule(value, schedules)
    if (problem) { setError(problem); requestAnimationFrame(() => errorRef.current?.focus()); return }
    onAdd({ ...value, section: value.section.trim(), room: value.room.trim(), instructor: value.instructor.trim() })
  }
  const control = 'mt-1.5 h-10 w-full rounded-xl border border-[#e5e8f0] bg-white px-3 text-[13px] text-[#17213c] focus-visible:outline-2 focus-visible:outline-[#68728a]'
  return <Modal title="Add Class Schedule" onClose={onClose}><p className="mb-4 text-xs leading-5 text-[#68728a]">Demo schedule for semester {semester}, {academicYear}. Changes stay on this page only and are not saved to a server.</p><form onSubmit={submit} noValidate className="space-y-4">
    {error && <p ref={errorRef} tabIndex={-1} role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700 focus:outline-2">{error}</p>}
    <div><label htmlFor="schedule-course" className="text-xs font-medium text-[#68728a]">Course</label><select id="schedule-course" name="courseCode" value={value.courseCode} onChange={event => update('courseCode', event.target.value)} className={control}>{timetableCourses.map(course => <option key={course.code} value={course.code}>{course.code} — {course.title}</option>)}</select></div>
    <div><label htmlFor="schedule-day" className="text-xs font-medium text-[#68728a]">Day</label><select id="schedule-day" name="day" value={value.day} onChange={event => update('day', event.target.value)} className={control}>{timetableDays.map(day => <option key={day}>{day}</option>)}</select></div>
    <div className="grid grid-cols-2 gap-3">{([{ field: 'start', label: 'Start time' }, { field: 'end', label: 'End time' }] as const).map(({ field, label }) => <div key={field}><label htmlFor={`schedule-${field}`} className="text-xs font-medium text-[#68728a]">{label}</label><input id={`schedule-${field}`} name={field} type="time" required min="08:00" max="18:00" step="1800" value={Number.isFinite(value[field]) ? formatScheduleTime(value[field]) : ''} onChange={event => { const [hours, minutes] = event.target.value.split(':').map(Number); update(field, hours * 60 + minutes) }} className={control} /></div>)}</div>
    {([{ field: 'section', label: 'Section', placeholder: 'SEC-01' }, { field: 'room', label: 'Room', placeholder: 'IT-301' }, { field: 'instructor', label: 'Instructor', placeholder: 'Instructor name' }] as const).map(({ field, label, placeholder }) => <div key={field}><label htmlFor={`schedule-${field}`} className="text-xs font-medium text-[#68728a]">{label}</label><input id={`schedule-${field}`} name={field} required maxLength={100} placeholder={placeholder} value={value[field]} onChange={event => update(field, event.target.value)} className={control} /></div>)}
    <div className="flex justify-end gap-3 border-t border-[#e5e8f0] pt-5"><button type="button" onClick={onClose} className="rounded-xl border border-[#e5e8f0] px-4 py-2.5 text-xs font-semibold focus-visible:outline-2">Cancel</button><button type="submit" className="rounded-xl bg-[#273238] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1a2329] focus-visible:outline-2 focus-visible:outline-offset-2">Add Class Schedule</button></div>
  </form></Modal>
}
