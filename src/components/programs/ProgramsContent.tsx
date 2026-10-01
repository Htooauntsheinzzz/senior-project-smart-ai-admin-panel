import { useState } from 'react'
import { initialPrograms, degrees } from '../../data/programs'
import { initialFaculties } from '../../data/faculties'
import { initialDepartments } from '../../data/departments'
import type { Program, ProgramDraft, ProgramFilters } from '../../types/program'
import { changeProgramFaculty, createDemoProgram, filterPrograms } from '../../utils/programs'
import ProgramsTable from './ProgramsTable'
import AddProgramDrawer from './AddProgramDrawer'
import Modal from '../ui/Modal'

export default function ProgramsContent({ adding, onOpen, onClose }: { adding: boolean; onOpen: () => void; onClose: () => void }) {
  const [programs, setPrograms] = useState(initialPrograms)
  const [filters, setFilters] = useState<ProgramFilters>({ query: '', facultyId: '', departmentId: '', degreeId: '', status: '' })
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<Program | null>(null)
  const filtered = filterPrograms(programs, filters)
  function addProgram(value: ProgramDraft) {
    const program = createDemoProgram(value)
    setPrograms(previous => [...previous, program])
    onClose()
    setMessage(`${program.name} added to the local demo.${!filterPrograms([program], filters).length ? ' Your current filters hide this new program.' : ''} No server record was created.`)
  }
  const dropdowns: { key: keyof ProgramFilters; label: string; width: string; options: { value: string; label: string }[] }[] = [
    { key: 'facultyId', label: 'Faculty', width: 'sm:w-[261px]', options: initialFaculties.map(faculty => ({ value: faculty.id, label: faculty.nameEn.replace(/^Faculty of /, '') })) },
    { key: 'departmentId', label: 'Department', width: 'sm:w-[198px]', options: initialDepartments.filter(department => !filters.facultyId || department.facultyId === filters.facultyId).map(department => ({ value: department.id, label: department.name })) },
    { key: 'degreeId', label: 'Degree Level', width: 'sm:w-[259px]', options: degrees.map(degree => ({ value: degree.id, label: degree.name })) },
    { key: 'status', label: 'Status', width: 'sm:w-[150px]', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
  ]
  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-[1.25px] border-[#e5e8f0] px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Programs &amp; Majors</h1><p className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">Manage academic programs and degree offerings across all departments.</p></div><button type="button" onClick={onOpen} aria-expanded={adding} className="inline-flex items-center gap-2 rounded-xl bg-linear-[165deg,#273238,#1a2329] px-4 py-2 text-[13px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2"><img src="/assets/figma/faculty-plus.svg" width="16" height="16" alt="" />Add Program</button></header>
    <div className="flex flex-wrap items-center gap-3 px-4 pt-4 pb-3 sm:px-7"><div className="relative w-full sm:w-[280px]"><img src="/assets/figma/faculty-search.svg" width="16" height="16" alt="" className="pointer-events-none absolute top-3.5 left-3.5" /><input type="search" aria-label="Search program name or code" placeholder="Search program name or code…" value={filters.query} onChange={event => setFilters(previous => ({ ...previous, query: event.target.value }))} className="h-[42px] w-full rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-3.5 pl-10 text-[13px] placeholder:text-[#17213c]/50 focus-visible:outline-2" /></div>
      {dropdowns.map(filter => <div key={filter.key} className={`relative w-full ${filter.width}`}><select aria-label={filter.label} value={filters[filter.key]} onChange={event => setFilters(previous => filter.key === 'facultyId' ? changeProgramFaculty(previous, event.target.value) : { ...previous, [filter.key]: event.target.value })} className="h-[39px] w-full appearance-none rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-9 pl-3.5 text-[13px] text-[#68728a] focus-visible:outline-2"><option value="">{filter.label}</option>{filter.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><img src="/assets/figma/department-filter-arrow.svg" width="10" height="6" alt="" className="pointer-events-none absolute top-4 right-3.5" /></div>)}
    </div>
    <div className="px-4 pb-6 sm:px-7"><ProgramsTable programs={filtered} onAction={setSelected} /><p role="status" className="pt-3 text-[13px] text-[#68728a]">Showing <strong className="font-semibold text-[#17213c]">{filtered.length}</strong> of <strong className="font-semibold text-[#17213c]">{programs.length}</strong> programs</p><p className="mt-4 text-xs leading-5 text-[#68728a]">Demo directory and form options. Changes reset when you leave this page or reload.</p><p role="status" className="mt-2 text-[13px] leading-5 text-[#68728a]">{message}</p></div>
    {adding && <AddProgramDrawer programs={programs} onAdd={addProgram} onClose={onClose} />}
    {selected && <Modal title={`${selected.code} — Actions`} onClose={() => setSelected(null)}><p className="text-sm leading-6 text-[#68728a]">Actions for {selected.name} are not available right now. Program editing, deletion, and status changes have not been integrated.</p></Modal>}
  </main>
}
