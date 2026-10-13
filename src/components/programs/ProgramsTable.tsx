import { degreeBadgeStyle } from '../../utils/programApi'
import type { ApiProgram } from '../../services/programService'

export default function ProgramsTable({ programs, onAction, loading, error, onRetry, busy }: { programs: ApiProgram[]; onAction: (program: ApiProgram) => void; loading: boolean; error?: string; onRetry: () => void; busy: boolean }) {
  return <div className="overflow-hidden rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white"><div role="region" aria-label="Programs directory" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
    <table className="w-full min-w-[1400px] table-fixed text-left text-[13px] leading-[19.5px] text-[#17213c]">
      <caption className="sr-only">Academic programs, faculties, departments, degrees, duration, credits, and status</caption>
      <colgroup>{[11.55, 21.35, 15.67, 17.73, 7.49, 9.78, 9.44, 6.99].map(width => <col key={width} style={{ width: `${width}%` }} />)}</colgroup>
      <thead className="bg-[#fafbfc] text-[#68728a]"><tr>{['Code', 'Program Name', 'Department', 'Degree', 'Duration', 'Total Credits', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-3.5 font-semibold">{label}</th>)}</tr></thead>
      <tbody>{programs.map(program => {
        const style = degreeBadgeStyle(program.degreeLevel)
        return <tr key={program.id} className="border-t-[1.25px] border-[#e5e8f0]">
          <td className="px-4 py-3.5"><span className="inline-block rounded-lg bg-[#273238]/7 px-2 py-0.5 text-[11.5px] leading-[17.25px] font-bold text-[#273238]">{program.code}</span></td>
          <th scope="row" className="px-4 py-3.5 font-semibold">{program.name}<span className="block text-[11.5px] leading-[17.25px] font-normal text-[#68728a]">{program.facultyNameEn.replace(/^Faculty of /, '')}</span></th>
          <td className="px-4 py-3.5 text-[#68728a]">{program.departmentName}</td>
          <td className="px-4 py-3.5"><span className="inline-block rounded-full px-2.5 py-1 text-[11px] leading-[16.5px] font-semibold" style={{ background: style.background, color: style.color }}>{program.degreeLevel}</span></td>
          <td className="px-4 py-3.5 text-center font-semibold">{program.durationYears == null ? <span aria-label="Duration not specified">—</span> : `${program.durationYears} yrs`}</td>
          <td className="px-4 py-3.5 text-center font-semibold">{program.totalCredits == null ? <span aria-label="Credits not specified">—</span> : <>{program.totalCredits}<span className="ml-1 text-[11px] font-normal text-[#68728a]">cr</span></>}</td>
          <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] leading-[17.25px] font-semibold ${program.status === 'active' ? 'bg-[#d1fae5] text-[#059669]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{program.status === 'active' ? 'Active' : 'Inactive'}</span></td>
          <td className="px-4 py-3.5"><button type="button" disabled={busy} onClick={() => onAction(program)} aria-label={`Actions for ${program.name}`} className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f7f8fc] focus-visible:outline-2"><img src="/assets/figma/faculty-dots.svg" width="18" height="18" alt="" /></button></td>
        </tr>
      })}</tbody>
    </table>
    {error ? <div role="alert" className="px-4 py-10 text-center text-sm text-[#68728a]"><p>Directory refresh failed. {error}</p><button type="button" onClick={onRetry} className="mt-3 rounded-xl border border-[#e5e8f0] px-4 py-2 font-semibold focus-visible:outline-2">Retry</button></div> : !programs.length && <p role="status" className="px-4 py-10 text-center text-sm text-[#68728a]">{loading ? 'Loading programs…' : 'No programs match your search and filters.'}</p>}
  </div></div>
}
