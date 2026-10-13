import { formatSemesterDate, type ApiSemester } from '../../services/semesterService'

export default function SemestersTable({ semesters, offset, onAction, loading, error, onRetry, busy }: { semesters: ApiSemester[]; offset: number; onAction: (semester: ApiSemester) => void; loading: boolean; error?: string; onRetry: () => void; busy: boolean }) {
  return <div className="overflow-hidden rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white"><div role="region" aria-label="Semester directory" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
    <table className="w-full min-w-[960px] table-fixed text-left text-[13px] leading-[19.5px] text-[#17213c]">
      <caption className="sr-only">Row numbers, English and Thai semester names, academic years, and record dates</caption>
      <colgroup>{[7, 24, 24, 13, 12, 12, 8].map((width, index) => <col key={index} style={{ width: `${width}%` }} />)}</colgroup>
      <thead className="bg-[#fafbfc] text-[#68728a]"><tr>{['No.', 'Semester Name (English)', 'Semester Name (Thai)', 'Academic Year', 'Created', 'Last Updated', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-3.5 font-semibold">{label}</th>)}</tr></thead>
      <tbody>{semesters.map((semester, index) => <tr key={semester.id} className="border-t-[1.25px] border-[#e5e8f0]">
        <td className="px-4 py-3.5"><span className="inline-block rounded-lg bg-[#273238]/7 px-2 py-0.5 text-[11.5px] leading-[17.25px] font-bold text-[#273238]">{offset + index + 1}</span></td>
        <th scope="row" className="px-4 py-3.5 font-semibold break-words">{semester.semesterNameEn}</th>
        <td className="px-4 py-3.5 break-words">{semester.semesterNameTh}</td>
        <td className="px-4 py-3.5 text-[#68728a]">{semester.academicYear}</td>
        <td className="px-4 py-3.5 text-[#68728a]">{formatSemesterDate(semester.createdAt)}</td>
        <td className="px-4 py-3.5 text-[#68728a]">{formatSemesterDate(semester.updatedAt)}</td>
        <td className="px-4 py-3.5"><button type="button" disabled={busy} onClick={() => onAction(semester)} aria-label={`Actions for ${semester.semesterNameEn} ${semester.academicYear}`} className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f7f8fc] focus-visible:outline-2"><img src="/assets/figma/faculty-dots.svg" width="18" height="18" alt="" /></button></td>
      </tr>)}</tbody>
    </table>
    {error ? <div role="alert" className="px-4 py-10 text-center text-sm text-[#68728a]"><p>Directory refresh failed. {error}</p><button type="button" onClick={onRetry} className="mt-3 rounded-xl border border-[#e5e8f0] px-4 py-2 font-semibold focus-visible:outline-2">Retry</button></div> : !semesters.length && <p role="status" className="px-4 py-10 text-center text-sm text-[#68728a]">{loading ? 'Loading semesters…' : 'No semesters found.'}</p>}
  </div></div>
}
