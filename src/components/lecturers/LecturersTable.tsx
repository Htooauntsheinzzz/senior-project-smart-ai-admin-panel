import type { ApiLecturer } from '../../services/lecturerService'

export default function LecturersTable({ lecturers, onAction, loading, error, onRetry, busy }: { lecturers: ApiLecturer[]; onAction: (lecturer: ApiLecturer) => void; loading: boolean; error?: string; onRetry: () => void; busy: boolean }) {
  return <div className="overflow-hidden rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white"><div role="region" aria-label="Lecturers directory" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
    <table className="w-full min-w-[1100px] table-fixed text-left text-[13px] leading-[19.5px] text-[#17213c]">
      <caption className="sr-only">Row numbers, lecturers, nicknames, faculties, departments, and status</caption>
      <colgroup>{[7, 30, 13, 18, 16, 9, 7].map((width, index) => <col key={index} style={{ width: `${width}%` }} />)}</colgroup>
      <thead className="bg-[#fafbfc] text-[#68728a]"><tr>{['No.', 'Lecturer Name', 'Nickname', 'Faculty', 'Department', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-3.5 font-semibold">{label}</th>)}</tr></thead>
      <tbody>{lecturers.map((lecturer, index) => <tr key={lecturer.id} className="border-t-[1.25px] border-[#e5e8f0]">
        <td className="px-4 py-3.5"><span className="inline-block rounded-lg bg-[#273238]/7 px-2 py-0.5 text-[11.5px] leading-[17.25px] font-bold text-[#273238]">{index + 1}</span></td>
        <th scope="row" className="px-4 py-3.5 font-semibold">{lecturer.nameEn}<span className="block text-[11.5px] leading-[17.25px] font-normal text-[#68728a]">{lecturer.nameTh}</span></th>
        <td className="px-4 py-3.5 text-[#68728a]">{lecturer.nickname || <span aria-label="No nickname">—</span>}</td>
        <td className="px-4 py-3.5 text-[#68728a]">{lecturer.facultyNameEn.replace(/^Faculty of /, '')}</td>
        <td className="px-4 py-3.5 text-[#68728a]">{lecturer.departmentName}</td>
        <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] leading-[17.25px] font-semibold ${lecturer.status === 'active' ? 'bg-[#d1fae5] text-[#059669]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{lecturer.status === 'active' ? 'Active' : 'Inactive'}</span></td>
        <td className="px-4 py-3.5"><button type="button" disabled={busy} onClick={() => onAction(lecturer)} aria-label={`Actions for ${lecturer.nameEn}`} className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f7f8fc] focus-visible:outline-2"><img src="/assets/figma/faculty-dots.svg" width="18" height="18" alt="" /></button></td>
      </tr>)}</tbody>
    </table>
    {error ? <div role="alert" className="px-4 py-10 text-center text-sm text-[#68728a]"><p>Directory refresh failed. {error}</p><button type="button" onClick={onRetry} className="mt-3 rounded-xl border border-[#e5e8f0] px-4 py-2 font-semibold focus-visible:outline-2">Retry</button></div> : !lecturers.length && <p role="status" className="px-4 py-10 text-center text-sm text-[#68728a]">{loading ? 'Loading lecturers…' : 'No lecturers found.'}</p>}
  </div></div>
}
