import { useState } from 'react'
import '@fontsource/noto-sans-thai/thai-400.css'
import { initialFaculties } from '../../data/faculties'
import type { Faculty, FacultyInput } from '../../types/faculty'
import { createDemoFaculty, facultyTotals, filterFaculties } from '../../utils/faculties'
import FacultyTable from './FacultyTable'
import AddFacultyDrawer from './AddFacultyDrawer'
import Modal from '../ui/Modal'

export default function FacultiesContent({ adding, onOpen, onClose }: { adding: boolean; onOpen: () => void; onClose: () => void }) {
  const [faculties, setFaculties] = useState(initialFaculties)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<Faculty | null>(null)
  const totals = facultyTotals(faculties)
  function addFaculty(input: FacultyInput) {
    const faculty = createDemoFaculty(input)
    setFaculties(previous => [...previous, faculty])
    setQuery('')
    onClose()
    setMessage(`${faculty.nameEn} added to the local demo with zero departments and students. No server record was created.`)
  }
  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-[0.625px] border-[#e5e8f0] px-4 pt-6 pb-5 sm:px-7"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Faculties</h1><p className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">Manage university faculties and their administrative structure.</p></div><button id="add-faculty-trigger" type="button" onClick={onOpen} aria-expanded={adding} className="inline-flex items-center gap-2 rounded-xl bg-linear-[164deg,#273238,#1a2329] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_7px_#27323838] focus-visible:outline-2 focus-visible:outline-offset-2"><img src="/assets/figma/faculty-plus.svg" width="16" height="16" alt="" />Add Faculty</button></header>
    <div className="px-4 pt-4 pb-3 sm:px-7"><div className="relative"><img src="/assets/figma/faculty-search.svg" width="16" height="16" alt="" className="pointer-events-none absolute top-3 left-3.5" /><input type="search" aria-label="Search faculty name or code" placeholder="Search faculty name or code…" value={query} onChange={event => setQuery(event.target.value)} className="h-[41px] w-full rounded-xl border-[0.625px] border-[#e5e8f0] bg-white pr-3.5 pl-10 font-['Inter','Noto_Sans_Thai',sans-serif] text-[13px] placeholder:text-[#17213c]/50 focus-visible:outline-2" /></div></div>
    <div className="px-4 pb-6 sm:px-7"><FacultyTable faculties={filterFaculties(faculties, query)} onAction={setSelected} />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">{[{ value: totals.total, label: 'Total Faculties', color: '#273238' }, { value: totals.active, label: 'Active Faculties', color: '#059669' }, { value: totals.departments, label: 'Total Departments', color: '#7c3aed' }].map(metric => <div key={metric.label} className="rounded-2xl border-[0.625px] border-[#e5e8f0] bg-white px-4 py-3.5"><p className="font-display text-[22px] leading-[22px] font-extrabold" style={{ color: metric.color }}>{metric.value}</p><p className="mt-1 text-[11.5px] leading-[17.25px] text-[#68728a]">{metric.label}</p></div>)}</div>
      <p className="mt-4 text-xs leading-5 text-[#68728a]">Demo directory. Changes are local and reset when you leave this page or reload.</p>
      <p role="status" className="mt-2 text-[13px] leading-5 text-[#68728a]">{message}</p>
    </div>
    {adding && <AddFacultyDrawer faculties={faculties} onAdd={addFaculty} onClose={onClose} />}
    {selected && <Modal title={`${selected.code} — Actions`} onClose={() => setSelected(null)}><p className="text-sm leading-6 text-[#68728a]">Actions for {selected.nameEn} are not available right now. Faculty editing, deletion, and status changes have not been integrated.</p></Modal>}
  </main>
}
