import { initialFaculties } from '../../data/faculties'
import type { Department } from '../../types/department'

export default function DepartmentTable({ departments, onAction }: { departments: Department[]; onAction: (department: Department) => void }) {
  return <div className="overflow-hidden rounded-2xl border-[0.625px] border-[#e5e8f0] bg-white"><div role="region" aria-label="Department directory" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
    <table className="w-full min-w-[1100px] table-fixed text-left text-[13px] leading-[19.5px] text-[#17213c]">
      <caption className="sr-only">Departments and their faculties, programs, courses, students, and account status</caption>
      <colgroup>{[12, 20, 19.5, 10.1, 9.2, 9.6, 10.8, 8.8].map(width => <col key={width} style={{ width: `${width}%` }} />)}</colgroup>
      <thead className="bg-[#fafbfc] text-[#68728a]"><tr>{['Code', 'Department', 'Faculty', 'Programs', 'Courses', 'Students', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-3.5 font-semibold">{label}</th>)}</tr></thead>
      <tbody>{departments.map(department => <tr key={department.id} className="border-t-[0.625px] border-[#e5e8f0]">
        <td className="px-4 py-3.5"><span className="inline-block rounded-lg bg-[#273238]/7 px-2 py-0.5 text-[11.5px] leading-[17.25px] font-bold text-[#273238]">{department.code}</span></td>
        <th scope="row" className="px-4 py-3.5 font-semibold">{department.name}</th>
        <td className="px-4 py-3.5 text-[#68728a]">{initialFaculties.find(faculty => faculty.id === department.facultyId)?.nameEn.replace(/^Faculty of /, '')}</td>
        {[department.programCount, department.courseCount, department.studentCount].map((count, index) => <td key={index} className="px-4 py-3.5 text-center font-semibold">{count}</td>)}
        <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] leading-[17.25px] font-semibold ${department.status === 'active' ? 'bg-[#d1fae5] text-[#059669]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{department.status === 'active' ? 'Active' : 'Inactive'}</span></td>
        <td className="px-4 py-3.5"><button type="button" aria-label={`Actions for ${department.name}`} onClick={() => onAction(department)} className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f7f8fc] focus-visible:outline-2"><img src="/assets/figma/faculty-dots.svg" width="18" height="18" alt="" /></button></td>
      </tr>)}</tbody>
    </table>
    {!departments.length && <p role="status" className="px-4 py-10 text-center text-sm text-[#68728a]">No departments match your search and filters.</p>}
  </div></div>
}
