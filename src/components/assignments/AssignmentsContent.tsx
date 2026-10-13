import { CheckSquare, ChevronLeft, ChevronRight, ClipboardList, Download, FileText, LockKeyhole, Plus, Search } from 'lucide-react'

const control = 'h-[40px] rounded-xl border border-[#e5e8f0] bg-white px-3.5 text-[13px] text-[#68728a] disabled:cursor-not-allowed'
const summaries = [
  { label: 'Total Assignments', Icon: ClipboardList, tile: 'bg-[#f0f1f3]', color: 'text-[#273238]' },
  { label: 'Published', Icon: CheckSquare, tile: 'bg-[#d1fae5]', color: 'text-[#00a878]' },
  { label: 'Drafts', Icon: FileText, tile: 'bg-[#f3f4f6]', color: 'text-[#68728a]' },
  { label: 'Closed', Icon: LockKeyhole, tile: 'bg-[#dbeafe]', color: 'text-[#3874ff]' },
]

export default function AssignmentsContent() {
  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[#e5e8f0] bg-white px-4 pt-6 pb-5 sm:px-7">
      <div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Assignments</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Create and manage course assignments across all sections.</p></div>
      <div className="flex items-center gap-2.5" aria-describedby="assignment-availability">
        <button type="button" disabled className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e5e8f0] bg-white px-4 text-[13px] font-semibold disabled:cursor-not-allowed"><Download size={15} aria-hidden="true" />Export</button>
        <button type="button" disabled className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-xl bg-linear-[164deg,#273238,#1a2329] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_7px_#27323838] disabled:cursor-not-allowed"><Plus size={15} aria-hidden="true" />Create Assignment</button>
      </div>
    </header>
    <div className="space-y-5 px-4 py-5 sm:px-7">
      <section aria-label="Assignment summary" className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 xl:grid-cols-4">
        {summaries.map(({ label, Icon, tile, color }) => <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#e5e8f0] bg-white px-3.5 py-3.5"><span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tile} ${color}`}><Icon size={19} aria-hidden="true" /></span><div><p aria-label={`${label}: unavailable`} className={`font-display text-[22px] leading-7 font-extrabold ${color}`}>—</p><p className="text-[11.5px] leading-4 text-[#68728a]">{label}</p></div></div>)}
      </section>
      <fieldset disabled aria-describedby="assignment-availability" className="flex min-w-0 flex-wrap gap-3">
        <legend className="sr-only">Filter assignments (data source unavailable)</legend>
        <div className="relative min-w-[200px] flex-[1_1_280px]"><Search size={15} aria-hidden="true" className="absolute top-3 left-3.5 text-[#8791a8]" /><input type="search" aria-label="Search assignments" placeholder="Search by title, course, or section…" className={`${control} w-full pl-10`} /></div>
        <select aria-label="Course" className={`${control} w-[120px]`}><option>Course</option></select><select aria-label="Section" className={`${control} w-[120px]`}><option>Section</option></select><select aria-label="Status" className={`${control} w-[120px]`}><option>Status</option><option>Published</option><option>Draft</option><option>Closed</option></select><input aria-label="Due date" placeholder="Due:" className={`${control} w-[178px]`} />
      </fieldset>
      <div className="overflow-hidden rounded-2xl border border-[#e5e8f0] bg-white">
        <div role="region" aria-label="Assignments table" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2]">
          <table className="w-full min-w-[900px] text-left text-[13px]">
            <caption className="sr-only">Course assignments, due dates, priorities, and publication status</caption>
            <thead className="border-b border-[#e5e8f0] bg-[#fafbfc] text-[#68728a]"><tr>{['Assignment Title', 'Course', 'Section', 'Due Date', 'Priority', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-4 text-[12px] font-semibold first:w-[30%]">{label}</th>)}</tr></thead>
            <tbody />
          </table>
        </div>
        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center"><ClipboardList size={32} aria-hidden="true" className="mb-4 text-[#8791a8]" /><h2 className="font-display text-base font-bold">Assignment data unavailable</h2><p id="assignment-availability" role="status" className="mt-2 max-w-md text-[13px] leading-6 text-[#68728a]">The existing backend does not expose a coursework assignments API. Assignment records, totals, filters, creation, and export are unavailable until an existing compatible API is provided.</p></div>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-5 text-[12px] text-[#68728a]"><p>Assignment count unavailable</p><nav aria-label="Assignment pagination" className="flex items-center gap-2"><button type="button" disabled aria-label="Previous page" className="rounded-lg border border-[#e5e8f0] p-2 disabled:opacity-40"><ChevronLeft size={14} /></button><span aria-label="Current page, 1" className="rounded-lg bg-[#273238] px-3 py-2 font-semibold text-white">1</span><button type="button" disabled aria-label="Next page" className="rounded-lg border border-[#e5e8f0] p-2 disabled:opacity-40"><ChevronRight size={14} /></button></nav></footer>
    </div>
  </main>
}
