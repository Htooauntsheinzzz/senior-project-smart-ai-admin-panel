import type { CourseSummary } from '../../services/courseService'

export default function CourseSummaryCards({ summary, ready }: { summary: CourseSummary | null; ready: boolean }) {
  return <div className="grid grid-cols-1 gap-4 px-4 pt-4 pb-1 sm:grid-cols-3 sm:px-7">{[
    { label: 'Total Courses', value: summary?.totalCourses ?? 0, icon: '📚', background: 'rgba(39,50,56,0.07)', color: '#273238' },
    { label: 'Active Courses', value: summary?.activeCourses ?? 0, icon: '✅', background: '#d1fae5', color: '#059669' },
    { label: 'Current Semester Courses', value: summary?.currentSemesterCourses ?? 0, icon: '📅', background: '#ede9fe', color: '#7c3aed' },
  ].map(metric => <div key={metric.label} className="flex min-w-0 items-center gap-3.5 rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white px-4 py-3.5"><span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: metric.background }}>{metric.icon}</span><div><p className="font-display text-2xl leading-6 font-extrabold" style={{ color: metric.color }}>{ready ? metric.value : '—'}</p><p className="mt-1 text-[11.5px] leading-[17.25px] text-[#68728a]">{metric.label}</p></div></div>)}</div>
}
