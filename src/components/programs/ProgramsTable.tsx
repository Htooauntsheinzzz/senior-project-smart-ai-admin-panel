import { initialDepartments } from '../../data/departments'
import { initialFaculties } from '../../data/faculties'
import { degrees } from '../../data/programs'
import type { Program } from '../../types/program'

export default function ProgramsTable({ programs, onAction }: { programs: Program[]; onAction: (program: Program) => void }) {
  return <div className="overflow-hidden rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white"><div role="region" aria-label="Programs directory" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
    <table className="w-full min-w-[1400px] table-fixed text-left text-[13px] leading-[19.5px] text-[#17213c]">
      <caption className="sr-only">Academic programs, faculties, departments, degrees, duration, credits, and status</caption>
      <colgroup>{[11.55, 21.35, 15.67, 17.73, 7.49, 9.78, 9.44, 6.99].map(width => <col key={width} style={{ width: `${width}%` }} />)}</colgroup>
      <thead className="bg-[#fafbfc] text-[#68728a]"><tr>{['Code', 'Program Name', 'Department', 'Degree', 'Duration', 'Total Credits', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-3.5 font-semibold">{label}</th>)}</tr></thead>
      <tbody>{programs.map(program => {
        const degree = degrees.find(item => item.id === program.degreeId)!
        return <tr key={program.id} className="border-t-[1.25px] border-[#e5e8f0]">
          <td className="px-4 py-3.5"><span className="inline-block rounded-lg bg-[#273238]/7 px-2 py-0.5 text-[11.5px] leading-[17.25px] font-bold text-[#273238]">{program.code}</span></td>
          <th scope="row" className="px-4 py-3.5 font-semibold">{program.name}<span className="block text-[11.5px] leading-[17.25px] font-normal text-[#68728a]">{initialFaculties.find(item => item.id === program.facultyId)?.nameEn.replace(/^Faculty of /, '')}</span></th>
          <td className="px-4 py-3.5 text-[#68728a]">{initialDepartments.find(item => item.id === program.departmentId)?.name}</td>
          <td className="px-4 py-3.5"><span className="inline-block rounded-full px-2.5 py-1 text-[11px] leading-[16.5px] font-semibold" style={{ background: degree.background, color: degree.color }}>{degree.name}</span></td>
          <td className="px-4 py-3.5 text-center font-semibold">{program.durationYears} yrs</td>
          <td className="px-4 py-3.5 text-center font-semibold">{program.totalCredits === null ? <span aria-label="Credits not specified">—</span> : <>{program.totalCredits}<span className="ml-1 text-[11px] font-normal text-[#68728a]">cr</span></>}</td>
          <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] leading-[17.25px] font-semibold ${program.status === 'active' ? 'bg-[#d1fae5] text-[#059669]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{program.status === 'active' ? 'Active' : 'Inactive'}</span></td>
          <td className="px-4 py-3.5"><button type="button" onClick={() => onAction(program)} aria-label={`Actions for ${program.name}`} className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f7f8fc] focus-visible:outline-2"><img src="/assets/figma/faculty-dots.svg" width="18" height="18" alt="" /></button></td>
        </tr>
      })}</tbody>
    </table>
    {!programs.length && <p role="status" className="px-4 py-10 text-center text-sm text-[#68728a]">No programs match your search and filters.</p>}
  </div></div>
}
