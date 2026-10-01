import { MoreVertical } from 'lucide-react'
import type { Student } from '../../types/student'
import { Badge } from '../dashboard/DashboardUi'

const statusColors = { Active: 'bg-[#d1fae5] text-[#059669]', Inactive: 'bg-[#f3f4f6] text-[#6b7280]', Suspended: 'bg-[#fee2e2] text-[#dc2626]' }

export default function StudentTable({ students, onActions }: { students: Student[]; onActions: (student: Student) => void }) {
  return <div className="overflow-hidden rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white">
    <div role="region" aria-label="Student table, scroll horizontally on narrow screens" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
      <table className="w-full min-w-[1280px] table-fixed border-collapse text-left text-[13px] leading-[19.5px] text-[#17213c]">
        <caption className="sr-only">Student demo records. First ten records transcribed from Figma; other sample records are marked Demo.</caption>
        <colgroup>{[19.74, 16.31, 16.71, 18.12, 10.11, 11.68, 7.34].map((width, index) => <col key={index} style={{ width: `${width}%` }} />)}</colgroup>
        <thead className="border-b border-[#e5e8f0] bg-[#fafbfc] text-[#68728a]"><tr>{['Student', 'Email', 'Faculty', 'Major', 'Year / Sem', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="h-12 px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
        <tbody className="divide-y divide-[#e5e8f0]">{students.map(student => <tr key={student.studentId} className="hover:bg-[#f7f8fc]/60">
          <th scope="row" className="px-4 py-3 font-normal"><div className="flex items-center gap-3"><span aria-hidden="true" className="flex size-[34px] shrink-0 items-center justify-center rounded-full text-[11.22px] leading-[16.83px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${student.avatarColor}, ${student.avatarColor}cc)` }}>{student.initials}</span><div className="min-w-0"><p className="font-semibold">{student.name}</p><p className="mt-0.5 text-[11.5px] leading-[17.25px] text-[#68728a]">{student.studentId}</p></div></div></th>
          <td className="px-4 py-3 break-words text-[#68728a]">{student.email}</td>
          <td className="px-4 py-3"><p className="font-medium">{student.faculty}</p><p className="mt-0.5 text-[11.5px] leading-[17.25px] text-[#68728a]">{student.department}</p></td>
          <td className="px-4 py-3">{student.major}</td>
          <td className="px-4 py-3"><p className="font-semibold">Year {student.year}</p><Badge className={`mt-0.5 rounded-full! py-0! text-[10.5px]! leading-[16.5px]! font-bold! ${student.semester === 'Sem 1/2568' ? 'bg-[#fce7f3] text-[#c026d3]' : 'bg-[#ede9fe] text-[#7c3aed]'}`}>{student.semester}</Badge></td>
          <td className="px-4 py-3"><Badge className={`gap-1.5 rounded-full! px-2.5! text-[11.5px]! leading-[17.25px]! ${statusColors[student.status]}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{student.status}</Badge></td>
          <td className="px-4 py-3"><button type="button" aria-label={`Actions for ${student.name}`} aria-haspopup="dialog" onClick={() => onActions(student)} className="flex size-8 items-center justify-center rounded-lg text-[#68728a] hover:bg-[#f7f8fc] focus-visible:outline-2"><MoreVertical size={18} /></button></td>
        </tr>)}</tbody>
      </table>
    </div>
    {!students.length && <p role="status" className="px-4 py-12 text-center text-sm text-[#68728a]">No students found. Try a different search or filter.</p>}
  </div>
}
