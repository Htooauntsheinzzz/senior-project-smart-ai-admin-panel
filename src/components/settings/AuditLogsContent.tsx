import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Download, FileClock, LockKeyhole, Search, XCircle } from 'lucide-react'

const summaries = [
  { label: 'Total Logs', icon: FileClock, style: 'bg-[#f0f1f3] text-[#273238]' },
  { label: "Today's Events", icon: CalendarDays, style: 'bg-[#ede9fe] text-[#7c3aed]' },
  { label: 'Successful', icon: CheckCircle2, style: 'bg-[#d1fae5] text-[#009d78]' },
  { label: 'Failed / Partial', icon: XCircle, style: 'bg-[#fee2e2] text-[#dc2626]' },
]
const control = 'h-10 rounded-xl border border-[#e5e8f0] bg-white px-3 text-[12px] text-[#68728a] disabled:cursor-not-allowed'

export default function AuditLogsContent() {
  return <main className="min-w-0 px-4 py-6 text-[#17213c] sm:px-7">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Audit Logs</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Review administrator activity in the SMART AI Admin Portal</p></div>
      <div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] px-3 py-2 text-[12px] font-medium text-[#059669]"><LockKeyhole size={14} aria-hidden="true" />Read-Only</span><button type="button" disabled aria-describedby="audit-availability" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e5e8f0] bg-white px-4 py-2 text-[12px] font-semibold disabled:cursor-not-allowed"><Download size={14} aria-hidden="true" />Export Logs</button></div>
    </header>
    <dl aria-label="Audit log summary" className="mt-5 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">{summaries.map(({ label, icon: Icon, style }) => <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#e5e8f0] bg-white p-4"><span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${style}`}><Icon size={18} /></span><div className="flex flex-col"><dt className="order-2 text-[12px] text-[#68728a]">{label}</dt><dd aria-label="Unavailable" className="order-1 font-display text-[22px] leading-7 font-extrabold">—</dd></div></div>)}</dl>
    <fieldset disabled aria-describedby="audit-availability" className="mt-4 flex min-w-0 flex-wrap gap-3">
      <legend className="sr-only">Filter audit logs (data source unavailable)</legend>
      <div className="relative min-w-[200px] flex-[1_1_280px]"><Search size={15} aria-hidden="true" className="absolute top-3 left-3.5 text-[#8791a8]" /><input type="search" aria-label="Search by record or admin name" placeholder="Search by record or admin name…" className={`${control} w-full pl-10`} /></div>
      {['Admin User', 'Module', 'Action'].map(label => <select key={label} aria-label={label} className={`${control} w-[125px]`}><option>{label}</option></select>)}
      <div className="flex max-w-full flex-wrap items-center gap-2"><input type="date" aria-label="Start date" className={`${control} w-[150px]`} /><span aria-hidden="true" className="text-[#8791a8]">–</span><input type="date" aria-label="End date" className={`${control} w-[150px]`} /></div>
    </fieldset>
    <div className="my-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#68728a]"><p>Log count unavailable</p><p className="inline-flex items-center gap-2"><span aria-hidden="true" className="size-1.5 rounded-full bg-[#10b981]" />Read-only view — no edit or delete actions</p></div>
    <section aria-label="Audit log directory" className="overflow-hidden rounded-2xl border border-[#e5e8f0] bg-white">
      <div role="region" aria-label="Audit logs table" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2]"><table className="w-full min-w-[1100px] text-left text-[13px]"><caption className="sr-only">Audit log IDs, timestamps, administrators, modules, actions, records, results and details</caption><thead className="border-b border-[#e5e8f0] bg-[#f7f8fc] text-[10px] tracking-[0.04em] text-[#68728a] uppercase"><tr>{['#', 'Timestamp', 'Admin', 'Module', 'Action', 'Record', 'Result', 'Details'].map(label => <th key={label} scope="col" className="px-4 py-4 font-semibold">{label === 'Details' ? <span className="sr-only">Details</span> : label}</th>)}</tr></thead><tbody /></table></div>
      <div className="flex min-h-[400px] flex-col items-center justify-center px-6 py-12 text-center"><FileClock size={32} aria-hidden="true" className="mb-4 text-[#8791a8]" /><h2 className="font-display text-base font-bold">Audit log data unavailable</h2><p id="audit-availability" role="status" className="mt-2 max-w-md text-[13px] leading-6 text-[#68728a]">The existing backend does not expose an audit-history API. Log records, totals, filters, record details, and export require an existing compatible API.</p></div>
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e5e8f0] px-4 py-3 text-[12px] text-[#68728a]"><p>Audit history unavailable</p><nav aria-label="Audit log pagination" aria-describedby="audit-availability" className="flex items-center gap-2"><button type="button" disabled aria-label="Previous page" className="rounded-lg p-2 disabled:opacity-40"><ChevronLeft size={14} aria-hidden="true" /></button><span aria-current="page" aria-label="Page 1" className="rounded-lg bg-[#273238] px-3 py-2 font-semibold text-white">1</span><button type="button" disabled aria-label="Next page" className="rounded-lg p-2 disabled:opacity-40"><ChevronRight size={14} aria-hidden="true" /></button></nav></footer>
    </section>
  </main>
}
