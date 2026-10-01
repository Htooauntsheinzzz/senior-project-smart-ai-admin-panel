import { initialPrograms } from '../../data/programs'
import type { Course, CourseFilters as Filters } from '../../types/course'

export default function CourseFilters({ courses, filters, onChange, disabled }: { courses: Course[]; filters: Filters; onChange: (key: keyof Filters, value: string) => void; disabled: boolean }) {
  const facultyCourses = courses.filter(course => !filters.facultyId || course.facultyId === filters.facultyId)
  const departmentCourses = facultyCourses.filter(course => !filters.departmentId || course.departmentId === filters.departmentId)
  const programIds = new Set(departmentCourses.flatMap(course => course.programIds))
  const controls: { key: keyof Filters; label: string; width: string; options: [string, string][] }[] = [
    { key: 'facultyId', label: 'Faculty', width: 'sm:w-[261px]', options: [...new Map(courses.map(course => [course.facultyId, course.facultyName]))] },
    { key: 'departmentId', label: 'Department', width: 'sm:w-[198px]', options: [...new Map(facultyCourses.map(course => [course.departmentId, course.departmentName]))] },
    { key: 'programId', label: 'Program', width: 'sm:w-[215px]', options: initialPrograms.filter(program => programIds.has(program.id)).map(program => [program.id, program.name]) },
    { key: 'year', label: 'Year', width: 'sm:w-[130px]', options: [...new Set(courses.flatMap(course => course.curriculumYear === null ? [] : [course.curriculumYear]))].sort((a, b) => a - b).map(year => [String(year), `Year ${year}`]) },
    { key: 'term', label: 'Semester', width: 'sm:w-[130px]', options: [...new Set(courses.filter(course => course.semester && course.academicYear).map(course => `${course.semester}/${course.academicYear}`))].map(term => [term, `Sem ${term}`]) },
    { key: 'status', label: 'Status', width: 'sm:w-[130px]', options: [['active', 'Active'], ['inactive', 'Inactive']] },
  ]
  return <div className="flex flex-wrap items-center gap-3 px-4 pt-4 pb-3 sm:px-7">
    <div className="relative w-full min-w-[240px] flex-1"><img src="/assets/figma/faculty-search.svg" width="16" height="16" alt="" className="pointer-events-none absolute top-3.5 left-3.5" /><input type="search" aria-label="Course code or course name" placeholder="Course code or course name…" value={filters.query} onChange={event => onChange('query', event.target.value)} disabled={disabled} className="h-[42px] w-full rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-3.5 pl-10 text-[13px] placeholder:text-[#17213c]/50 focus-visible:outline-2 disabled:opacity-50" /></div>
    {controls.map(control => <div key={control.key} className={`relative w-full shrink-0 ${control.width}`}><select aria-label={control.label} value={filters[control.key]} onChange={event => onChange(control.key, event.target.value)} disabled={disabled} className="h-[39px] w-full appearance-none rounded-xl border-[1.25px] border-[#e5e8f0] bg-white pr-9 pl-3.5 text-[13px] text-[#68728a] focus-visible:outline-2 disabled:opacity-50"><option value="">{control.label}</option>{control.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><img src="/assets/figma/department-filter-arrow.svg" width="10" height="6" alt="" className="pointer-events-none absolute top-4 right-3.5" /></div>)}
  </div>
}
