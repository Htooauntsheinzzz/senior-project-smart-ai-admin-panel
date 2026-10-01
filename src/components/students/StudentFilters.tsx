import { ChevronDown, Search } from 'lucide-react'
import { studentPrograms } from '../../data/students'
import { studentSemesters, studentStatuses, type StudentFilters as Filters } from '../../types/student'

export default function StudentFilters({ query, filters, onQuery, onFilter }: { query: string; filters: Filters; onQuery: (value: string) => void; onFilter: (field: keyof Filters, value: string) => void }) {
  const programs = studentPrograms.filter(p => !filters.faculty || p.faculty === filters.faculty)
  const options: { field: keyof Filters; label: string; values: string[]; width: string }[] = [
    { field: 'faculty', label: 'Faculty', values: [...new Set(studentPrograms.map(p => p.faculty))], width: 'xl:w-[156px] min-[1800px]:w-[196px]' },
    { field: 'department', label: 'Department', values: [...new Set(programs.map(p => p.department))], width: 'xl:w-[124px] min-[1800px]:w-[123px]' },
    { field: 'major', label: 'Major', values: [...new Set(programs.filter(p => !filters.department || p.department === filters.department).map(p => p.major))], width: 'xl:w-[96px] min-[1800px]:w-[120px]' },
    { field: 'year', label: 'Year', values: ['1', '2', '3', '4', '5', '6'], width: 'xl:w-[96px] min-[1800px]:w-[120px]' },
    { field: 'semester', label: 'Semester', values: [...studentSemesters], width: 'xl:w-[116px] min-[1800px]:w-[120px]' },
    { field: 'status', label: 'Status', values: [...studentStatuses], width: 'xl:w-[96px] min-[1800px]:w-[120px]' },
  ]
  return <section aria-label="Search and filter students" className="flex flex-wrap items-center gap-3 pt-4 pb-3">
    <div className="relative w-full min-w-0 xl:min-w-[260px] xl:flex-1"><Search size={16} aria-hidden="true" className="pointer-events-none absolute top-[13px] left-3.5 text-[#b0b8cc]" /><input type="search" aria-label="Search students" placeholder="Search by student ID, name or university email…" value={query} onChange={event => onQuery(event.target.value)} className="h-[42px] w-full rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-3 pl-10 text-[13px] text-[#17213c] placeholder:text-[#b0b8cc] focus-visible:outline-2 focus-visible:outline-[#68728a]" /></div>
    {options.map(option => <div key={option.field} className={`relative min-w-0 basis-[calc(50%-6px)] sm:basis-[calc(33.333%-8px)] xl:basis-auto ${option.width}`}><select aria-label={`Filter by ${option.label.toLowerCase()}`} value={filters[option.field]} onChange={event => onFilter(option.field, event.target.value)} className="h-[39px] w-full appearance-none rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-7 pl-3 text-[13px] text-[#68728a] focus-visible:outline-2"><option value="">{option.label}</option>{option.values.map(value => <option key={value} value={value}>{option.field === 'year' ? `Year ${value}` : value}</option>)}</select><ChevronDown aria-hidden="true" size={12} className="pointer-events-none absolute top-3.5 right-3 text-[#b0b8cc]" /></div>)}
  </section>
}
