import type { Course } from '../../types/course'

export default function CoursesTable({ courses, state, onRetry, onClear, onAction }: { courses: Course[]; state: 'loading' | 'error' | 'ready'; onRetry: () => void; onClear: () => void; onAction: (course: Course) => void }) {
  return <div className="overflow-hidden rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white"><div role="region" aria-label="Course catalog" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
    <table aria-busy={state === 'loading'} className="w-full min-w-[1320px] table-fixed text-left text-[13px] leading-[19.5px] text-[#17213c]">
      <caption className="sr-only">Courses, credit hours, department assignments, semesters, sections, and status</caption>
      <colgroup>{[11.63, 23.26, 7.88, 18.5, 11.59, 8.84, 10.12, 8.18].map(width => <col key={width} style={{ width: `${width}%` }} />)}</colgroup>
      <thead className="bg-[#fafbfc] text-[#68728a]"><tr>{['Course Code', 'Course Name', 'Credits', 'Department', 'Semester', 'Sections', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-3.5 font-semibold">{label}</th>)}</tr></thead>
      <tbody>{state === 'ready' && courses.map(course => <tr key={course.id} className="border-t-[1.25px] border-[#e5e8f0]">
        <td className="px-4 py-3.5"><span className="inline-block rounded-lg bg-[#273238]/7 px-2 py-0.5 text-xs leading-[18px] font-bold text-[#273238]">{course.code}</span></td>
        <th scope="row" className="px-4 py-3.5 font-semibold">{course.name}<span className="block"><span className={`inline-block rounded-full px-2.5 py-1 text-[11.5px] leading-[17.25px] font-semibold ${course.type === 'Required' ? 'bg-[#dbeafe] text-[#2563eb]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>{course.type}</span></span></th>
        <td className="px-4 py-3.5 text-center"><span className="block font-bold">{course.credits}</span><span className="block text-[11px] leading-[16.5px] text-[#68728a]">credits</span></td>
        <td className="px-4 py-3.5"><span className="block font-medium">{course.departmentName}</span><span className="block text-[11.5px] leading-[17.25px] text-[#68728a]">{course.facultyName}</span></td>
        <td className="px-4 py-3.5">{course.semester ? <span className="inline-block rounded-full bg-[#ede9fe] px-2 text-[11.5px] leading-[17.25px] font-semibold text-[#7c3aed]">Sem {course.semester}/{course.academicYear}</span> : <span className="text-xs text-[#68728a]">Not assigned</span>}<span className="mt-1 block text-[11.5px] leading-[17.25px] text-[#68728a]">{course.curriculumYear === null ? 'Year not assigned' : `Year ${course.curriculumYear}`}</span></td>
        <td className="px-4 py-3.5 text-center"><span className="block font-bold">{course.sectionCount}</span><span className="block text-[11px] leading-[16.5px] text-[#68728a]">sections</span></td>
        <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] leading-[17.25px] font-semibold ${course.status === 'active' ? 'bg-[#d1fae5] text-[#059669]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{course.status === 'active' ? 'Active' : 'Inactive'}</span></td>
        <td className="px-4 py-3.5"><button type="button" aria-label={`Actions for ${course.code}`} onClick={() => onAction(course)} className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f7f8fc] focus-visible:outline-2"><img src="/assets/figma/faculty-dots.svg" width="18" height="18" alt="" /></button></td>
      </tr>)}</tbody>
    </table>
  </div>
    {state === 'loading' && <p role="status" className="px-4 py-16 text-center text-sm text-[#68728a]">Loading courses…</p>}
    {state === 'error' && <div role="alert" className="px-4 py-12 text-center text-sm text-[#68728a]"><p>Unable to load courses. Your filters have been kept.</p><button type="button" onClick={onRetry} className="mt-4 rounded-xl border border-[#e5e8f0] px-4 py-2 font-semibold focus-visible:outline-2">Retry</button></div>}
    {state === 'ready' && !courses.length && <div className="px-4 py-12 text-center text-sm text-[#68728a]"><p role="status">No courses match your search and filters.</p><button type="button" onClick={onClear} className="mt-4 rounded-xl border border-[#e5e8f0] px-4 py-2 font-semibold focus-visible:outline-2">Clear filters</button></div>}
  </div>
}
