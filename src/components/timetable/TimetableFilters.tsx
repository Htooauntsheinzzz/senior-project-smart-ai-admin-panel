import type { AcademicTerm, FilterOptions, TimetableFilters as Filters } from '../../types/timetable'
import { academicYearOptions, coursesFor, departmentsFor, facultyColorFor, semesterOptions, shortFacultyName } from '../../utils/timetable'

// Filter row and faculty legend from Figma node 34:4322. Semester and Academic Year come from GET /timetable/academic-terms
// (a term is a semester offered in one academic year); faculty, department and course from GET /timetable/filter-options.
// A dropdown with a value takes the dark "selected" style of the Figma Semester/Year controls.

type Option = { value: string; label: string }

function Dropdown({ label, value, onChange, placeholder, options, disabled, title }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; options: Option[]; disabled?: boolean; title?: string }) {
  const selected = value !== ''
  return <div className="relative w-full min-w-[120px] sm:w-auto">
    <select aria-label={label} title={title} value={value} disabled={disabled} onChange={event => onChange(event.target.value)}
      className={`h-[33.5px] w-full appearance-none rounded-xl border-[1.25px] pr-8 pl-4 text-[12.5px] focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-60 ${selected ? 'border-[#273238] bg-[rgba(39,50,56,0.07)] text-[#273238]' : 'border-[#e5e8f0] bg-[#f7f8fc] text-[#68728a]'}`}>
      <option value="">{placeholder}</option>
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    <img src={selected ? '/assets/figma/department-select-arrow.svg' : '/assets/figma/department-filter-arrow.svg'} width="10" height="6" alt="" className="pointer-events-none absolute top-[13.5px] right-[6.5px]" />
  </div>
}

function LookupState({ loading, error, onRetry, what }: { loading: boolean; error?: string; onRetry: () => void; what: string }) {
  if (error) return <p role="alert" className="flex items-center gap-2 text-[11px] leading-[16.5px] font-medium text-[#d80255]"><span>{what} could not be loaded.</span><button type="button" onClick={onRetry} className="rounded border border-[#e5e8f0] bg-white px-2 py-0.5 font-semibold text-[#17213c] focus-visible:outline-2">Retry</button></p>
  if (loading) return <p role="status" className="text-[11px] leading-[16.5px] font-medium text-[#68728a]">Loading {what.toLowerCase()}…</p>
  return null
}

export default function TimetableFilters({ filters, onChange, options, optionsLoading, optionsError, onRetryOptions, terms, termsLoading, termsError, onRetryTerms }: {
  filters: Filters
  onChange: (key: keyof Filters, value: string) => void
  options?: FilterOptions
  optionsLoading: boolean
  optionsError?: string
  onRetryOptions: () => void
  terms: AcademicTerm[]
  termsLoading: boolean
  termsError?: string
  onRetryTerms: () => void
}) {
  const termsReady = !termsLoading && !termsError
  const optionsReady = !!options && !optionsError
  const faculties = options?.faculties ?? []
  const departments = options ? departmentsFor(options, filters.facultyId) : []
  const courses = options ? coursesFor(options, filters.facultyId, filters.departmentId) : []

  return <div className="flex flex-col gap-3 px-4 pt-2 pb-3 sm:px-7">
    <div className="flex flex-wrap items-center gap-3">
      <Dropdown label="Semester" placeholder="Semester" value={filters.semesterId} onChange={value => onChange('semesterId', value)} options={semesterOptions(terms)} disabled={!termsReady} title={termsReady && !terms.length ? 'No academic terms exist yet. Create one with Manage Terms.' : undefined} />
      <Dropdown label="Academic Year" placeholder="Academic Year" value={filters.academicTermId} onChange={value => onChange('academicTermId', value)} options={academicYearOptions(terms, filters.semesterId)} disabled={!termsReady} />
      <Dropdown label="Faculty" placeholder="Faculty" value={filters.facultyId} onChange={value => onChange('facultyId', value)} options={faculties.map(faculty => ({ value: faculty.id, label: faculty.name }))} disabled={!optionsReady} />
      <Dropdown label="Department" placeholder="Department" value={filters.departmentId} onChange={value => onChange('departmentId', value)} options={departments.map(department => ({ value: department.id, label: department.name }))} disabled={!optionsReady} />
      <Dropdown label="Course" placeholder="Course" value={filters.courseId} onChange={value => onChange('courseId', value)} options={courses.map(course => ({ value: course.id, label: `${course.code} – ${course.name}` }))} disabled={!optionsReady} />
      <LookupState loading={termsLoading} error={termsError} onRetry={onRetryTerms} what="Academic terms" />
      <LookupState loading={optionsLoading} error={optionsError} onRetry={onRetryOptions} what="Filter options" />
      {optionsReady && faculties.length > 0 && <ul aria-label="Faculty color legend" className="ml-auto flex flex-wrap items-center gap-3">
        {faculties.map(faculty => {
          const color = facultyColorFor(faculty)
          return <li key={faculty.id} className="flex items-center gap-1.5 text-[11px] leading-[16.5px] font-medium text-[#68728a]"><span aria-hidden="true" className="size-2.5 rounded-[4px]" style={{ backgroundColor: color.color }} />{shortFacultyName(faculty.name)}</li>
        })}
      </ul>}
    </div>
  </div>
}
