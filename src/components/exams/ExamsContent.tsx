import { BookOpen, CalendarDays, CheckSquare, ChevronLeft, ChevronRight, ClipboardList, Download, FlaskConical, GraduationCap, Pencil, Plus, TriangleAlert } from 'lucide-react'

const control = 'h-10 rounded-xl border border-[#e5e8f0] bg-white px-3.5 text-[13px] text-[#68728a] disabled:cursor-not-allowed'
const summaries = [
  { label: 'Total Exams', Icon: ClipboardList, tile: 'bg-[#f0f1f3]', color: 'text-[#273238]' },
  { label: 'Scheduled', Icon: CalendarDays, tile: 'bg-[#dbeafe]', color: 'text-[#3874ff]' },
  { label: 'Completed', Icon: CheckSquare, tile: 'bg-[#d1fae5]', color: 'text-[#00a878]' },
  { label: 'With Conflicts', Icon: TriangleAlert, tile: 'bg-[#fef3c7]', color: 'text-[#d97706]' },
]
const examTypes = [
  { label: 'Quiz', Icon: Pencil, style: 'bg-[#dbeafe] text-[#3874ff]' },
  { label: 'Midterm', Icon: BookOpen, style: 'bg-[#ede9fe] text-[#7c3aed]' },
  { label: 'Final', Icon: GraduationCap, style: 'bg-[#fee2e2] text-[#dc2626]' },
  { label: 'Practical', Icon: FlaskConical, style: 'bg-[#d1fae5] text-[#059669]' },
]

export default function ExamsContent() {
  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e8f0] bg-white px-4 pt-6 pb-5 sm:px-7">
      <div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Exams</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Schedule and manage course examinations with conflict detection.</p></div>
      <div className="flex flex-wrap items-center gap-2.5" aria-describedby="exam-availability">
        <span className="inline-flex items-center gap-2 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-[12px] text-[#b45309]"><TriangleAlert size={14} aria-hidden="true" />Conflicts: —</span>
        <button type="button" disabled className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e5e8f0] bg-white px-4 text-[13px] font-semibold disabled:cursor-not-allowed"><Download size={15} aria-hidden="true" />Export</button>
        <button type="button" disabled className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-xl bg-linear-[164deg,#273238,#1a2329] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_7px_#27323838] disabled:cursor-not-allowed"><Plus size={15} aria-hidden="true" />Schedule Exam</button>
      </div>
    </header>
    <div className="space-y-5 px-4 py-5 sm:px-7">
      <section aria-label="Exam summary" className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 xl:grid-cols-4">
        {summaries.map(({ label, Icon, tile, color }) => <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#e5e8f0] bg-white px-3.5 py-3.5"><span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tile} ${color}`}><Icon size={19} aria-hidden="true" /></span><div><p aria-label={`${label}: unavailable`} className={`font-display text-[22px] leading-7 font-extrabold ${color}`}>—</p><p className="text-[11.5px] leading-4 text-[#68728a]">{label}</p></div></div>)}
      </section>
      <fieldset disabled aria-describedby="exam-availability" className="flex flex-wrap gap-3">
        <legend className="sr-only">Filter exams (data source unavailable)</legend>
        <select aria-label="Exam type" className={`${control} w-[120px]`}><option>Exam Type</option>{examTypes.map(type => <option key={type.label}>{type.label}</option>)}</select><select aria-label="Course" className={`${control} w-[120px]`}><option>Course</option></select><select aria-label="Semester" className={`${control} w-[120px]`}><option>Semester</option></select><select aria-label="Status" className={`${control} w-[120px]`}><option>Status</option><option>Scheduled</option><option>Completed</option></select><select aria-label="Conflict" className={`${control} w-[120px]`}><option>Conflict</option></select><input type="date" aria-label="Exam date" className={`${control} w-[170px]`} />
      </fieldset>
      <section aria-label="Exam type and conflict legend" className="flex flex-wrap items-center gap-3">
        {examTypes.map(({ label, Icon, style }) => <span key={label} className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${style}`}><Icon size={13} aria-hidden="true" />{label}</span>)}
        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#b45309] sm:ml-auto"><TriangleAlert size={13} aria-hidden="true" />Yellow row = schedule conflict</span>
      </section>
      <div className="overflow-hidden rounded-2xl border border-[#e5e8f0] bg-white">
        <div role="region" aria-label="Exams table" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2]">
          <table className="w-full min-w-[1000px] text-left text-[13px]">
            <caption className="sr-only">Examinations, courses, sections, types, dates, times, rooms, and status. Exam data is unavailable.</caption>
            <thead className="border-b border-[#e5e8f0] bg-[#fafbfc] text-[#68728a]"><tr>{['Exam', 'Course', 'Section', 'Type', 'Date', 'Time', 'Building / Room', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-4 text-[12px] font-semibold">{label}</th>)}</tr></thead>
            <tbody />
          </table>
        </div>
        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center"><CalendarDays size={32} aria-hidden="true" className="mb-4 text-[#8791a8]" /><h2 className="font-display text-base font-bold">Exam data unavailable</h2><p id="exam-availability" role="status" className="mt-2 max-w-md text-[13px] leading-6 text-[#68728a]">The existing backend does not expose an exams API. Exam records, totals, filters, scheduling, conflict detection, and export are unavailable until an existing compatible API is provided.</p></div>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-5 text-[12px] text-[#68728a]"><p>Exam count unavailable <span className="text-[#b45309]">· Conflicts unavailable</span></p><nav aria-label="Exam pagination" className="flex items-center gap-2"><button type="button" disabled aria-label="Previous page" className="rounded-lg border border-[#e5e8f0] p-2 disabled:opacity-40"><ChevronLeft size={14} /></button><span aria-label="Current page, 1" className="rounded-lg bg-[#273238] px-3 py-2 font-semibold text-white">1</span><button type="button" disabled aria-label="Next page" className="rounded-lg border border-[#e5e8f0] p-2 disabled:opacity-40"><ChevronRight size={14} /></button></nav></footer>
    </div>
  </main>
}
