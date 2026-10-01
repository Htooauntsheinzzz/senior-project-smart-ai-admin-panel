import { faculties, timetableCourses } from '../../data/timetable'
import { timetableDays, type ClassSchedule } from '../../types/timetable'
import { formatScheduleTime, layoutDaySchedules } from '../../utils/timetable'

export default function TimetableCalendar({ schedules, onSelect }: { schedules: ClassSchedule[]; onSelect: (schedule: ClassSchedule) => void }) {
  return <div role="region" aria-label="Weekly class calendar, scroll horizontally on smaller screens" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
    <div className="min-w-[1180px]">
      <div className="grid grid-cols-[56px_repeat(6,minmax(0,1fr))] border-y border-[#e5e8f0] bg-white"><div aria-hidden="true" />{timetableDays.map(day => <div key={day} className="flex h-16 flex-col items-center justify-center gap-1"><span className="text-xs font-bold tracking-[1.2px] text-[#68728a]">{day.slice(0, 3).toUpperCase()}</span><h2 id={`day-${day}`} className="text-[13px] font-semibold text-[#17213c]">{day}</h2></div>)}</div>
      <div className="grid grid-cols-[56px_repeat(6,minmax(0,1fr))]">
        <div aria-hidden="true" className="relative h-[760px] border-r border-[#e5e8f0]">{Array.from({ length: 10 }, (_, i) => <span key={i} className="absolute right-2 -translate-y-1/2 text-[11px] text-[#9ca3af]" style={{ top: i * 76 }}>{formatScheduleTime((i + 8) * 60)}</span>)}</div>
        {timetableDays.map(day => <section key={day} aria-labelledby={`day-${day}`} className="relative h-[760px] border-r border-[#e5e8f0] last:border-r-0">
          {Array.from({ length: 20 }, (_, index) => <div key={index} aria-hidden="true" className={`pointer-events-none absolute inset-x-0 border-t border-[#e5e8f0] ${index % 2 ? 'border-dashed' : ''}`} style={{ top: index * 38 }} />)}
          {layoutDaySchedules(schedules.filter(schedule => schedule.day === day)).map(({ schedule, lane, lanes }) => {
            const course = timetableCourses.find(item => item.code === schedule.courseCode)!
            const faculty = faculties.find(item => item.id === course.faculty)!
            const label = `${day} ${formatScheduleTime(schedule.start)}–${formatScheduleTime(schedule.end)}: ${course.code}, ${course.title}, ${schedule.section}, ${schedule.room}, ${schedule.instructor}`
            return <button key={schedule.id} type="button" title={label} aria-label={label} onClick={() => onSelect(schedule)} className="absolute overflow-hidden rounded-lg border-l-2 p-1.5 text-left align-top hover:brightness-95 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px]" style={{ top: (schedule.start - 480) / 60 * 76 + 1, height: (schedule.end - schedule.start) / 60 * 76 - 2, left: `calc(${lane / lanes * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)`, background: faculty.background, borderColor: faculty.color, color: faculty.foreground }}>
              <span className="absolute inset-x-1.5 top-1.5 block"><span className="block truncate text-[11px] leading-[15px] font-bold">{course.code}</span><span className="block truncate text-[10px] leading-[14px] opacity-80">{course.title}</span><span className="block truncate text-[10px] leading-[14px] opacity-70">{schedule.section} · {schedule.room}</span><span className="block truncate text-[10px] leading-[14px] opacity-70">{schedule.instructor}</span></span>
            </button>
          })}
        </section>)}
      </div>
    </div>
  </div>
}
