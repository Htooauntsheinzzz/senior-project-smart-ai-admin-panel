import { TriangleAlert } from 'lucide-react'
import type { ConflictList, ConflictMeeting, ConflictPair } from '../../types/timetable'
import { conflictResource, dayName, describeConflictPair, describeConflictType, formatDate, formatTimeRange12 } from '../../utils/timetable'
import { ActionMenu, Badge, CampusTable, CodeChip, SerialChip, TableState } from '../campus/CampusUi'

// Schedule Conflicts tab (spec 40 §15, a design extension: Figma only shows the tab and a sample badge). Every row is a
// pair reported by GET /timetable/conflicts; nothing is computed client-side, and an unavailable result is shown as such.

const typeTone = (type: ConflictPair['type']) => type === 'ROOM_CONFLICT' ? { bg: '#fee2e2', text: '#dc2626' } : type === 'LECTURER_CONFLICT' ? { bg: '#fef3c7', text: '#b45309' } : { bg: '#ede9fe', text: '#7c3aed' }

function Schedule({ meeting, position }: { meeting: ConflictMeeting; position: string }) {
  return <p className="whitespace-nowrap"><span className="sr-only">{position} schedule: </span><CodeChip>{meeting.courseCode}</CodeChip> <span className="font-semibold">SEC-{meeting.sectionNumber}</span> <span className="text-[#68728a]">· {dayName(meeting.dayOfWeek)} {formatTimeRange12(meeting.startTime, meeting.endTime)}</span></p>
}

export default function ScheduleConflicts({ data, loading, error, onRetry, courseFilterActive, onView, onEdit }: {
  data?: ConflictList
  loading: boolean
  error?: string
  onRetry: () => void
  courseFilterActive: boolean
  onView: (meetingId: string) => void
  onEdit: (meetingId: string) => void
}) {
  const rows = data?.conflicts ?? []
  return <section aria-label="Schedule conflicts" aria-busy={loading || undefined} className="p-4 sm:p-7">
    <div className="mb-3 flex items-start gap-2 text-[13px] leading-5 text-[#68728a]">
      <TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[#b45309]" />
      <p>The server reports <strong className="font-semibold text-[#17213c]">published</strong> schedules that share a room, lecturer or course section on the same date within the selected term, faculty and department. Draft schedules are not checked until they are published.{courseFilterActive && ' The course filter does not apply to conflicts, so this list covers every course in that scope.'}</p>
    </div>
    <CampusTable label="Schedule conflicts" caption="Published class schedules that overlap: conflict type, the two schedules involved, the overlapping time, the shared resource and an explanation." headers={['No.', 'Conflict Type', 'Affected Schedules', 'Day & Overlap', 'Room / Lecturer / Section', 'Explanation', 'Actions']} minWidth={1200}
      state={<TableState loading={loading} error={error ? `Conflict information is unavailable. ${error}` : undefined} empty={!rows.length} loadingText="Checking published schedules for conflicts…" emptyText={data ? 'No conflicts among the published schedules in this scope.' : 'Conflict information is unavailable.'} onRetry={onRetry} />}>
      {rows.map((pair, index) => {
        const tone = typeTone(pair.type)
        return <tr key={`${pair.type}-${pair.meetingA.meetingId}-${pair.meetingB.meetingId}-${pair.firstDate}`} className={loading ? 'opacity-60' : undefined}>
          <td className="px-3.5 py-2.5 align-top"><SerialChip value={index + 1} /></td>
          <td className="px-3.5 py-2.5 align-top"><Badge bg={tone.bg} text={tone.text}>{describeConflictType(pair.type)}</Badge></td>
          <td className="px-3.5 py-2.5 align-top"><div className="space-y-1"><Schedule meeting={pair.meetingA} position="First" /><Schedule meeting={pair.meetingB} position="Second" /></div></td>
          <td className="px-3.5 py-2.5 align-top whitespace-nowrap">{dayName(pair.meetingA.dayOfWeek)}<span className="block text-[#68728a]">{formatTimeRange12(pair.overlapStart, pair.overlapEnd)}</span></td>
          <td className="px-3.5 py-2.5 align-top whitespace-nowrap">{conflictResource(pair)}</td>
          <td className="max-w-[320px] px-3.5 py-2.5 align-top text-[#68728a]">{describeConflictPair(pair)} First on {formatDate(pair.firstDate)}; {pair.occurrenceCount} {pair.occurrenceCount === 1 ? 'date is' : 'dates are'} affected.</td>
          <td className="px-3.5 py-2.5 align-top"><ActionMenu label={`Actions for conflict ${index + 1}`} items={[
            { label: 'View first schedule', onSelect: () => onView(pair.meetingA.meetingId) },
            { label: 'View second schedule', onSelect: () => onView(pair.meetingB.meetingId) },
            { label: 'Edit first schedule', onSelect: () => onEdit(pair.meetingA.meetingId) },
            { label: 'Edit second schedule', onSelect: () => onEdit(pair.meetingB.meetingId) },
          ]} /></td>
        </tr>
      })}
    </CampusTable>
  </section>
}
