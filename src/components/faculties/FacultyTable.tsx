import type { Faculty } from '../../types/faculty'

export default function FacultyTable({ faculties, onAction }: { faculties: Faculty[]; onAction: (faculty: Faculty) => void }) {
  return <div className="overflow-hidden rounded-2xl border-[0.625px] border-[#e5e8f0] bg-white"><div role="region" aria-label="Faculty directory" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
    <table className="w-full min-w-[1000px] table-fixed text-left text-[13px] leading-[19.5px] text-[#17213c]">
      <caption className="sr-only">University faculties, departments, student counts, and status</caption>
      <colgroup>{[14.6, 35.3, 14.4, 11.4, 13.7, 10.6].map(width => <col key={width} style={{ width: `${width}%` }} />)}</colgroup>
      <thead className="bg-[#fafbfc] text-[#68728a]"><tr>{['Faculty Code', 'Faculty Name', 'Departments', 'Students', 'Status', 'Actions'].map(label => <th scope="col" key={label} className="px-5 py-3.5 font-semibold">{label}</th>)}</tr></thead>
      <tbody>{faculties.map(faculty => <tr key={faculty.id} className="border-t-[0.625px] border-[#e5e8f0]">
        <td className="px-5 py-3.5"><span className="inline-block rounded-lg bg-[#273238]/7 px-2.5 py-1 text-xs leading-[18px] font-bold text-[#273238]">{faculty.code}</span></td>
        <th scope="row" className="px-5 py-3.5 font-semibold">{faculty.nameEn}<span lang="th" className="mt-0.5 block font-['Noto_Sans_Thai',sans-serif] text-[11.5px] leading-[17.25px] font-normal text-[#68728a]">{faculty.nameTh}</span></th>
        {[{ value: faculty.departmentCount, label: 'departments' }, { value: faculty.studentCount, label: 'students' }].map(count => <td key={count.label} className="px-5 py-3.5 text-center"><span className="block text-[15px] leading-[22.5px] font-bold">{count.value}</span><span className="block text-[11px] leading-[16.5px] text-[#68728a]">{count.label}</span></td>)}
        <td className="px-5 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] leading-[17.25px] font-semibold ${faculty.status === 'active' ? 'bg-[#d1fae5] text-[#059669]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}><span className="size-1.5 rounded-full bg-current" aria-hidden="true" />{faculty.status === 'active' ? 'Active' : 'Inactive'}</span></td>
        <td className="px-5 py-3.5 text-center"><button type="button" onClick={() => onAction(faculty)} aria-label={`Actions for ${faculty.nameEn}`} className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-[#f7f8fc] focus-visible:outline-2"><img src="/assets/figma/faculty-dots.svg" width="18" height="18" alt="" /></button></td>
      </tr>)}</tbody>
    </table>
    {!faculties.length && <p role="status" className="px-5 py-10 text-center text-sm text-[#68728a]">No faculties match your search.</p>}
  </div></div>
}
