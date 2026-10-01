import { faculties, timetableCourses } from '../../data/timetable'
import { timetableDays, type ClassSchedule } from '../../types/timetable'
import { formatScheduleTime } from '../../utils/timetable'

export default function TimetableList({ schedules, onSelect }: { schedules: ClassSchedule[]; onSelect: (schedule: ClassSchedule) => void }) {
  const sorted = [...schedules].sort((a, b) => timetableDays.indexOf(a.day) - timetableDays.indexOf(b.day) || a.start - b.start)
  return <div className="mx-4 mb-6 overflow-hidden rounded-2xl border border-[#e5e8f0] bg-white sm:mx-7"><div role="region" aria-label="Class schedule list" tabIndex={0} className="overflow-x-auto focus-visible:outline-2"><table className="w-full min-w-[1000px] text-left text-[13px] text-[#17213c]"><caption className="sr-only">The same filtered weekly schedules shown in Calendar view.</caption><thead className="border-b border-[#e5e8f0] bg-[#fafbfc] text-xs text-[#68728a]"><tr>{['Day', 'Time', 'Course', 'Section', 'Faculty', 'Room', 'Instructor'].map(label => <th key={label} scope="col" className="px-4 py-4 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#e5e8f0]">{sorted.map(schedule => {
    const course = timetableCourses.find(item => item.code === schedule.courseCode)!
    const faculty = faculties.find(item => item.id === course.faculty)!
    return <tr key={schedule.id} className="hover:bg-[#f7f8fc]"><td className="px-4 py-4">{schedule.day}</td><td className="px-4 py-4 whitespace-nowrap text-[#68728a]">{formatScheduleTime(schedule.start)}–{formatScheduleTime(schedule.end)}</td><th scope="row" className="px-4 py-4 font-normal"><button type="button" onClick={() => onSelect(schedule)} className="rounded text-left focus-visible:outline-2"><span className="block font-semibold" style={{ color: faculty.foreground }}>{course.code}</span><span className="mt-1 block text-xs text-[#68728a]">{course.title}</span></button></th><td className="px-4 py-4">{schedule.section}</td><td className="px-4 py-4">{faculty.label}</td><td className="px-4 py-4">{schedule.room}</td><td className="px-4 py-4 text-[#68728a]">{schedule.instructor}</td></tr>
  })}</tbody></table></div></div>
}
