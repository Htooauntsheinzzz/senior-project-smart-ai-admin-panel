import { useState } from 'react'
import '@fontsource/noto-sans-thai/thai-400.css'
import { initialDepartments } from '../../data/departments'
import { initialFaculties } from '../../data/faculties'
import type { Department, DepartmentFilters, DepartmentInput } from '../../types/department'
import { createDemoDepartment, filterDepartments } from '../../utils/departments'
import DepartmentTable from './DepartmentTable'
import AddDepartmentDrawer from './AddDepartmentDrawer'
import Modal from '../ui/Modal'

export default function DepartmentsContent({ adding, onOpen, onClose }: { adding: boolean; onOpen: () => void; onClose: () => void }) {
  const [departments, setDepartments] = useState(initialDepartments)
  const [filters, setFilters] = useState<DepartmentFilters>({ query: '', facultyId: '', status: '' })
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<Department | null>(null)
  const filtered = filterDepartments(departments, filters)
  function addDepartment(input: DepartmentInput) {
    const department = createDemoDepartment(input)
    setDepartments(previous => [...previous, department])
    onClose()
    const hidden = !filterDepartments([department], filters).length
    setMessage(`${department.name} added to the local demo with zero programs, courses, and students.${hidden ? ' Your current filters hide this new department.' : ''} No server record was created.`)
  }
  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-[0.625px] border-[#e5e8f0] px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Departments</h1><p className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">Manage departments within each faculty.</p></div><button type="button" onClick={onOpen} aria-expanded={adding} className="inline-flex items-center gap-2 rounded-xl bg-linear-[164deg,#273238,#1a2329] px-4 py-2 text-[13px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2"><img src="/assets/figma/faculty-plus.svg" width="16" height="16" alt="" />Add Department</button></header>
    <div className="flex flex-wrap items-center gap-3 px-4 pt-4 pb-3 sm:px-7"><div className="relative w-full sm:w-[280px]"><img src="/assets/figma/faculty-search.svg" width="16" height="16" alt="" className="pointer-events-none absolute top-3 left-3.5" /><input type="search" aria-label="Search department name or code" placeholder="Search department name or code…" value={filters.query} onChange={event => setFilters(previous => ({ ...previous, query: event.target.value }))} className="h-[41px] w-full rounded-xl border-[0.625px] border-[#e5e8f0] bg-white pr-3.5 pl-10 text-[13px] placeholder:text-[#17213c]/50 focus-visible:outline-2" /></div>
      {[{ key: 'facultyId', label: 'Faculty', width: 'sm:w-[261px]', options: initialFaculties.map(faculty => ({ value: faculty.id, label: faculty.nameEn.replace(/^Faculty of /, '') })) }, { key: 'status', label: 'Status', width: 'sm:w-[150px]', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] }].map(filter => <div key={filter.key} className={`relative w-full ${filter.width}`}><select aria-label={filter.label} value={filters[filter.key as keyof DepartmentFilters]} onChange={event => setFilters(previous => ({ ...previous, [filter.key]: event.target.value }))} className="h-[39px] w-full appearance-none rounded-xl border-[0.625px] border-[#e5e8f0] bg-white pr-9 pl-3.5 text-[13px] text-[#68728a] focus-visible:outline-2"><option value="">{filter.label}</option>{filter.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><img src="/assets/figma/department-filter-arrow.svg" width="10" height="6" alt="" className="pointer-events-none absolute top-4 right-3.5" /></div>)}
    </div>
    <div className="px-4 pb-6 sm:px-7"><DepartmentTable departments={filtered} onAction={setSelected} /><p role="status" className="pt-3 text-[13px] text-[#68728a]">Showing <strong className="font-semibold text-[#17213c]">{filtered.length}</strong> of <strong className="font-semibold text-[#17213c]">{departments.length}</strong> departments</p><p className="mt-4 text-xs leading-5 text-[#68728a]">Demo directory and faculty options. Changes reset when you leave this page or reload.</p><p role="status" className="mt-2 text-[13px] leading-5 text-[#68728a]">{message}</p></div>
    {adding && <AddDepartmentDrawer departments={departments} onAdd={addDepartment} onClose={onClose} />}
    {selected && <Modal title={`${selected.code} — Actions`} onClose={() => setSelected(null)}><p className="text-sm leading-6 text-[#68728a]">Actions for {selected.name} are not available right now. Department editing, deletion, and status changes have not been integrated.</p></Modal>}
  </main>
}
