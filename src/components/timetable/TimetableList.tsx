import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import Pagination from '../ui/Pagination'
import type { ListSort, ListSortField, MeetingListItem, TimetablePage } from '../../types/timetable'
import { formatTime12, meetingTypeLabel, statusLabel, statusTone } from '../../utils/timetable'
import { ActionMenu, Badge, CampusTable, CodeChip, SerialChip, TableState, type TableHeader } from '../campus/CampusUi'

// List view (spec 40 §9, a design extension: Figma has no list frame). Rows come from GET /timetable/meetings with the same
// filters as the calendar; sorting and paging are server-side. Rows stay visible while a refresh is in flight, and the
// "No." column is the row's serial number on the current page, never a database id.

const columns: { label: string; sort?: ListSortField }[] = [
  { label: 'No.' }, { label: 'Course Code', sort: 'courseCode' }, { label: 'Course Name' }, { label: 'Section' }, { label: 'Day', sort: 'dayOfWeek' },
  { label: 'Start Time', sort: 'startTime' }, { label: 'End Time' }, { label: 'Building' }, { label: 'Room', sort: 'roomNumber' }, { label: 'Lecturer', sort: 'lecturerName' },
  { label: 'Semester' }, { label: 'Academic Year' }, { label: 'Status', sort: 'status' }, { label: 'Actions' },
]

const dash = <span className="text-[#68728a]">—</span>

export default function TimetableList({ page, pageNumber, loading, error, onRetry, sort, onSort, onPage, onView, onEdit, onPublish, onCancel }: {
  page?: TimetablePage<MeetingListItem>
  /** 1-based page shown to the user; the backend page is pageNumber - 1. */
  pageNumber: number
  loading: boolean
  error?: string
  onRetry: () => void
  sort: ListSort
  onSort: (sort: ListSort) => void
  onPage: (page: number) => void
  onView: (meeting: MeetingListItem) => void
  onEdit: (meeting: MeetingListItem) => void
  onPublish: (meeting: MeetingListItem) => void
  onCancel: (meeting: MeetingListItem) => void
}) {
  const rows = page?.content ?? []
  const start = page ? page.page * page.size : 0
  const headers: TableHeader[] = columns.map(column => {
    if (!column.sort) return column.label
    const active = sort.field === column.sort
    const direction = active && sort.direction === 'asc' ? 'desc' : 'asc'
    return {
      key: column.label,
      sort: active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none',
      label: <button type="button" onClick={() => onSort({ field: column.sort as ListSortField, direction })} aria-label={`Sort by ${column.label}${active ? `, currently ${sort.direction === 'asc' ? 'ascending' : 'descending'}` : ''}`}
        className="inline-flex items-center gap-1 rounded uppercase hover:text-[#17213c] focus-visible:outline-2">
        {column.label}{active ? (sort.direction === 'asc' ? <ChevronUp size={12} aria-hidden="true" /> : <ChevronDown size={12} aria-hidden="true" />) : <ChevronsUpDown size={12} aria-hidden="true" className="opacity-50" />}
      </button>,
    }
  })

  return <section aria-label="Class schedule list" aria-busy={loading || undefined} className="p-4 sm:p-7">
    <CampusTable label="Class schedules" caption="Class schedules matching the current filters: serial number, course, section, day, times, location, lecturer, term and status." headers={headers} minWidth={1420}
      state={<TableState loading={loading} error={error} empty={!rows.length} loadingText="Loading class schedules…" emptyText="No class schedules match the current filters. Add a class schedule or change the filters." onRetry={onRetry} />}>
      {rows.map((meeting, index) => <tr key={meeting.id} className={loading ? 'opacity-60' : undefined}>
        <td className="px-3.5 py-2.5"><SerialChip value={start + index + 1} /></td>
        <td className="px-3.5 py-2.5"><CodeChip>{meeting.courseCode}</CodeChip></td>
        <td className="max-w-[240px] truncate px-3.5 py-2.5 font-semibold" title={meeting.courseName}>{meeting.courseName}</td>
        <td className="px-3.5 py-2.5 whitespace-nowrap">SEC-{meeting.sectionNumber}<span className="block text-[11px] leading-4 text-[#68728a]">{meetingTypeLabel(meeting.meetingType)}</span></td>
        <td className="px-3.5 py-2.5 whitespace-nowrap">{meeting.dayName}</td>
        <td className="px-3.5 py-2.5 whitespace-nowrap">{formatTime12(meeting.startTime)}</td>
        <td className="px-3.5 py-2.5 whitespace-nowrap">{formatTime12(meeting.endTime)}</td>
        <td className="px-3.5 py-2.5 whitespace-nowrap">{meeting.buildingName ?? dash}</td>
        <td className="px-3.5 py-2.5 whitespace-nowrap">{meeting.roomNumber ?? meeting.legacyRoomLabel ?? dash}</td>
        <td className="px-3.5 py-2.5 whitespace-nowrap">{meeting.lecturerName}</td>
        <td className="px-3.5 py-2.5 whitespace-nowrap">{meeting.semesterName}</td>
        <td className="px-3.5 py-2.5 whitespace-nowrap">{meeting.academicYearLabel ?? <span className="text-[#68728a]">Not assigned</span>}</td>
        <td className="px-3.5 py-2.5"><Badge bg={statusTone(meeting.status).bg} text={statusTone(meeting.status).text} dot>{statusLabel(meeting.status)}</Badge></td>
        <td className="px-3.5 py-2.5"><ActionMenu label={`Actions for ${meeting.courseCode} section ${meeting.sectionNumber}`} items={[
          { label: 'View details', onSelect: () => onView(meeting) },
          ...(meeting.status !== 'CANCELLED' ? [{ label: 'Edit schedule', onSelect: () => onEdit(meeting) }] : []),
          ...(meeting.status === 'DRAFT' ? [{ label: 'Publish', onSelect: () => onPublish(meeting) }] : []),
          ...(meeting.status !== 'CANCELLED' ? [{ label: 'Cancel series', onSelect: () => onCancel(meeting), danger: true }] : []),
        ]} /></td>
      </tr>)}
    </CampusTable>
    {page && page.totalElements > 0 && <Pagination page={pageNumber} pageCount={Math.max(1, page.totalPages)} onPage={onPage} label="Class schedule pages"
      summary={`Showing ${start + 1}–${Math.min(start + rows.length, page.totalElements)} of ${page.totalElements} schedules`} />}
  </section>
}
