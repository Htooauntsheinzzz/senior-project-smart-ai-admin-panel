import { useMemo } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarEvent, CalendarWeek, FacultyColor } from '../../types/timetable'
import { HOUR_HEIGHT, addDays, dayAbbreviation, dayName, eventHeight, eventTop, formatWeekRange, isoWeekday, layoutLanes, timeFromMinutes, visibleDays, visibleRange } from '../../utils/timetable'

// Weekly calendar from Figma node 34:4391: 56 px time column, six day columns (Sunday appears only when a Sunday
// class exists), 76 px per hour, solid hour lines, dashed half-hour lines and faculty-coloured class cards.
// Positions are computed from each occurrence's real start and end minutes; nothing is hardcoded from fixtures.

const navButton = 'flex size-7 items-center justify-center rounded-lg border-[1.25px] border-[#e5e8f0] bg-white text-[#68728a] hover:bg-[#f7f8fc] focus-visible:outline-2 disabled:opacity-40'

export default function WeeklyCalendar({ weekStart, week, loading, error, onRetry, onWeekChange, onSelect, colorFor }: {
  weekStart: string
  week?: CalendarWeek
  loading: boolean
  error?: string
  onRetry: () => void
  onWeekChange: (weekStart: string) => void
  onSelect: (event: CalendarEvent) => void
  colorFor: (facultyId: string) => FacultyColor
}) {
  const events = useMemo(() => (week?.events ?? []).filter(event => event.date >= weekStart && event.date <= addDays(weekStart, 6)), [week, weekStart])
  const days = visibleDays(events)
  const range = visibleRange(events)
  const hours = Array.from({ length: (range.end - range.start) / 60 }, (_, index) => range.start + index * 60)
  // Top padding so the first time label is not clipped under the sticky day header.
  const OFFSET = 10
  const height = hours.length * HOUR_HEIGHT + OFFSET
  const columns = `56px repeat(${days.length}, minmax(0, 1fr))`
  const weekEnd = addDays(weekStart, 6)
  const byDay = useMemo(() => {
    const map = new Map<number, ReturnType<typeof layoutLanes<CalendarEvent>>>()
    for (const day of days) map.set(day, layoutLanes(events.filter(event => isoWeekday(event.date) === day)))
    return map
  }, [events, days])

  return <section aria-label="Weekly class calendar" className="border-b-[1.25px] border-[#e5e8f0] bg-white">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b-[1.25px] border-[#e5e8f0] px-4 py-2.5 sm:px-7">
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Previous week" onClick={() => onWeekChange(addDays(weekStart, -7))} className={navButton}><ChevronLeft size={14} aria-hidden="true" /></button>
        <button type="button" aria-label="Next week" onClick={() => onWeekChange(addDays(weekStart, 7))} className={navButton}><ChevronRight size={14} aria-hidden="true" /></button>
        <button type="button" onClick={() => onWeekChange('today')} className="h-7 rounded-lg border-[1.25px] border-[#e5e8f0] bg-white px-2.5 text-xs font-semibold text-[#68728a] hover:bg-[#f7f8fc] focus-visible:outline-2">This week</button>
        <p className="text-[13px] font-semibold text-[#17213c]" aria-live="polite"><CalendarDays size={13} aria-hidden="true" className="mr-1.5 inline -translate-y-px text-[#68728a]" />Week of {formatWeekRange(weekStart, weekEnd)}{week?.timezone && <span className="ml-1.5 text-[11px] font-normal text-[#68728a]">· {week.timezone}</span>}</p>
      </div>
      <ul aria-label="Schedule status legend" className="flex flex-wrap items-center gap-3 text-[11px] leading-[16.5px] font-medium text-[#68728a]">
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2.5 rounded-[3px] border-[1.5px] border-dashed border-[#68728a]" />Draft</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="inline-block rounded-[3px] bg-[#273238] px-1 text-[8px] leading-[12px] font-bold text-white">MOVED</span>Rescheduled</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2.5 rounded-[3px] bg-[#e5e8f0]" />Cancelled date</li>
      </ul>
    </div>
    <div role="region" aria-label="Weekly class calendar, scrolls horizontally on smaller screens" tabIndex={0} aria-busy={loading || undefined} className="relative max-h-[calc(100dvh-200px)] min-h-[320px] overflow-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
      <div className="min-w-[900px]">
        <div className="sticky top-0 z-20 grid h-[64.7px] border-b-[1.25px] border-[#e5e8f0] bg-white" style={{ gridTemplateColumns: columns }}>
          <div aria-hidden="true" className="sticky left-0 z-10 bg-white" />
          {days.map(day => <div key={day} className="flex flex-col items-center justify-center py-3">
            <span className="text-xs leading-[18px] font-bold tracking-[1.2px] text-[#68728a] uppercase">{dayAbbreviation(day)}</span>
            <h3 id={`timetable-day-${day}`} className="pt-0.5 text-[13px] leading-[19.5px] font-semibold text-[#17213c]">{dayName(day)}</h3>
          </div>)}
        </div>
        <div className={`grid bg-[#fafbfc] ${loading ? 'opacity-60' : ''}`} style={{ gridTemplateColumns: columns, height }}>
          <div aria-hidden="true" className="sticky left-0 z-10 border-r-[1.25px] border-[#e5e8f0] bg-[#fafbfc]">
            {hours.map((minutes, index) => <div key={minutes} className="absolute right-0 flex w-14 justify-end pr-2" style={{ top: index * HOUR_HEIGHT + OFFSET - 8 }}><span className="text-[10.5px] leading-[15.75px] font-semibold text-[#b0bac9]">{timeFromMinutes(minutes)}</span></div>)}
          </div>
          {days.map(day => <section key={day} aria-labelledby={`timetable-day-${day}`} className="relative border-r-[1.25px] border-[#e5e8f0] last:border-r-0">
            {hours.map((minutes, index) => <div key={minutes} aria-hidden="true">
              {index > 0 && <div className="pointer-events-none absolute inset-x-0 h-px bg-[#e5e8f0]" style={{ top: index * HOUR_HEIGHT + OFFSET }} />}
              <div className="pointer-events-none absolute inset-x-0 border-t-[1.25px] border-dashed border-[#e5e8f0]" style={{ top: index * HOUR_HEIGHT + OFFSET + HOUR_HEIGHT / 2 }} />
            </div>)}
            {(byDay.get(day) ?? []).map(({ event, lane, lanes }) => {
              const color = colorFor(event.facultyId)
              const cancelled = event.occurrenceStatus === 'CANCELLED'
              const label = `${dayName(day)} ${timeFromMinutes(event.startMinutes)}–${timeFromMinutes(event.endMinutes)}: ${event.courseCode} ${event.courseName}, section ${event.sectionNumber}${event.roomNumber ? `, room ${event.roomNumber}` : ''}, ${event.lecturerName}${event.status === 'DRAFT' ? ', draft' : ''}${event.occurrenceStatus === 'RESCHEDULED' ? ', rescheduled' : cancelled ? ', cancelled on this date' : ''}. Open class details.`
              return <button key={`${event.meetingId}-${event.date}-${event.exceptionId ?? 'r'}`} type="button" title={label} aria-label={label} onClick={() => onSelect(event)}
                className={`absolute overflow-hidden rounded-lg border-l-[2.5px] p-1.5 text-left shadow-[0px_1px_4px_0px_rgba(0,0,0,0.07)] hover:brightness-95 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${event.status === 'DRAFT' ? 'border-y-[1.5px] border-r-[1.5px] border-dashed' : ''} ${cancelled ? 'opacity-50 saturate-0' : ''}`}
                style={{ top: eventTop(event.startMinutes, range.start) + OFFSET + 1, height: eventHeight(event.startMinutes, event.endMinutes), left: `calc(${lane / lanes * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)`, background: color.background, borderColor: color.color, color: color.foreground }}>
                <span className={`block truncate text-[11px] leading-[13.75px] font-bold ${cancelled ? 'line-through' : ''}`}>{event.courseCode}{event.status === 'DRAFT' && <span className="ml-1 rounded-[3px] border border-current px-1 text-[8px] leading-[11px] font-bold uppercase opacity-80">Draft</span>}{event.occurrenceStatus === 'RESCHEDULED' && <span className="ml-1 rounded-[3px] bg-[#273238] px-1 text-[8px] leading-[11px] font-bold text-white uppercase">Moved</span>}{cancelled && <span className="ml-1 text-[8px] font-bold uppercase">Cancelled</span>}</span>
                <span className="block truncate pt-0.5 text-[10px] leading-[12.5px] opacity-80">{event.courseName}</span>
                <span className="block truncate pt-0.5 text-[10px] leading-[12.5px] opacity-70">SEC-{event.sectionNumber}{event.roomNumber ? ` · ${event.roomNumber}` : ' · No room'}</span>
                <span className="block truncate text-[10px] leading-[12.5px] opacity-65">{event.lecturerName}</span>
              </button>
            })}
          </section>)}
        </div>
      </div>
      {(error || (!loading && week && !events.length) || (loading && !week)) && <div className="pointer-events-none absolute inset-0 top-[64.7px] flex items-start justify-center pt-24">
        <div className="pointer-events-auto max-w-md rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white px-6 py-5 text-center shadow-sm">
          {error ? <div role="alert" className="text-sm text-[#68728a]"><p>{error}</p><button type="button" onClick={onRetry} className="mt-3 rounded-xl border border-[#e5e8f0] px-4 py-2 font-semibold text-[#17213c] focus-visible:outline-2">Retry</button></div>
            : loading ? <p role="status" className="text-sm text-[#68728a]">Loading this week's classes…</p>
              : <div role="status" className="text-sm text-[#68728a]"><CalendarDays size={28} aria-hidden="true" className="mx-auto mb-2 text-[#8791a8]" /><p className="font-semibold text-[#17213c]">No classes in this week</p><p className="mt-1 text-[13px] leading-5">No schedules match the current filters between {formatWeekRange(weekStart, weekEnd)}. Use the week arrows or change the filters.</p></div>}
        </div>
      </div>}
    </div>
  </section>
}
