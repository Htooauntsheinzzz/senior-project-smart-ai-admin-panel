import type { ApiSection } from '../../services/sectionService'
import type { CourseSection } from '../../types/courseSection'
import { capacityColor, sectionStatus } from '../../utils/courseSections'

export default function SectionsTable({ sections, apiSections, loading, error, onRetry, onClear, onAction, busy }: { sections: CourseSection[]; apiSections: ApiSection[]; loading: boolean; error?: string; onRetry: () => void; onClear: () => void; onAction: (section: CourseSection) => void; busy: boolean }) {
  return <div className="overflow-hidden rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white"><div role="region" aria-label="Course sections directory" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
    <table className="w-full min-w-[1430px] table-fixed text-left text-[13px] leading-[19.5px] text-[#17213c]"><caption className="sr-only">Course sections, lecturers, rooms, schedules, capacity, semesters, and statuses</caption>
      <colgroup>{[18, 7, 20, 15, 13, 10, 9, 8].map((width, index) => <col key={index} style={{ width: `${width}%` }} />)}</colgroup>
      <thead className="bg-[#fafbfc] text-[#68728a]"><tr>{['Course', 'Section', 'Lecturer', 'Room / Schedule', 'Capacity', 'Semester', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-3.5 font-semibold">{label}</th>)}</tr></thead>
      <tbody>{!loading && !error && sections.map(section => {
        const api = apiSections.find(s => s.id === section.id)
        const status = sectionStatus(section)
        const courseCode = api?.courseCode ?? ''
        const courseName = api?.courseName ?? ''
        const lecturerName = api?.lectureNameEn || api?.lectureNameTh || ''
        return <tr key={section.id} className="border-t-[1.25px] border-[#e5e8f0]">
          <th scope="row" className="px-4 py-3.5 font-normal"><span className="inline-block rounded-lg bg-[#273238]/7 px-2 py-0.5 text-[11.5px] leading-[17.25px] font-bold text-[#273238]">{courseCode}</span><span className="mt-1 block text-xs text-[#68728a]">{courseName}</span></th>
          <td className="px-4 py-3.5 font-bold">Sec {section.number}</td><td className="px-4 py-3.5">{lecturerName}</td>
          <td className="px-4 py-3.5"><span className="block font-medium">{section.room || 'Not assigned'}</span><span className="mt-1 block text-[11.5px] leading-[17.25px] text-[#68728a]">{section.schedule || 'Not scheduled'}</span></td>
          <td className="px-4 py-3.5"><div className="flex items-center gap-2.5"><div role="meter" aria-label={`${courseCode} section ${section.number} enrollment`} aria-valuemin={0} aria-valuemax={section.capacity} aria-valuenow={section.enrolled} aria-valuetext={`${section.enrolled} of ${section.capacity} students`} className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-[#e5e8f0]"><div className="h-full rounded-full" style={{ width: `${Math.min(100, section.enrolled / section.capacity * 100)}%`, background: capacityColor(section) }} /></div><p className="text-xs font-medium" style={{ color: capacityColor(section) }}>{section.enrolled}/{section.capacity}</p></div></td>
          <td className="px-4 py-3.5"><span className="inline-block rounded-full bg-[#ede9fe] px-2 py-0.5 text-[11.5px] leading-[17.25px] font-semibold text-[#7c3aed]">{api?.semesterNameEn ?? section.semester}</span></td>
          <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] leading-[17.25px] font-semibold ${status === 'Active' ? 'bg-[#d1fae5] text-[#059669]' : status === 'Full' ? 'bg-[#fef3c7] text-[#d97706]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{status}</span></td>
          <td className="px-4 py-3.5"><button type="button" disabled={busy} onClick={() => onAction(section)} aria-label={`Actions for ${courseCode} section ${section.number}`} className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f7f8fc] focus-visible:outline-2"><img src="/assets/figma/faculty-dots.svg" width="18" height="18" alt="" /></button></td>
        </tr>
      })}</tbody>
    </table>
  </div>{error ? <div role="alert" className="px-4 py-12 text-center text-sm text-[#68728a]"><p>Directory refresh failed. {error}</p><button type="button" onClick={onRetry} className="mt-4 rounded-xl border border-[#e5e8f0] px-4 py-2 font-semibold focus-visible:outline-2">Retry</button></div> : loading ? <p role="status" className="px-4 py-16 text-center text-sm text-[#68728a]">Loading sections…</p> : !sections.length && <div className="px-4 py-12 text-center text-sm text-[#68728a]"><p role="status">No sections match your search and filters.</p><button type="button" onClick={onClear} className="mt-4 rounded-xl border border-[#e5e8f0] px-4 py-2 font-semibold focus-visible:outline-2">Clear filters</button></div>}</div>
}
