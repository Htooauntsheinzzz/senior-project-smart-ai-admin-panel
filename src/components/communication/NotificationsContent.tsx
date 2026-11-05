import { Bell, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Plus, Search, Send, XCircle } from 'lucide-react'

const summaries = [
  { label: 'Sent Today', detail: 'notifications', icon: Send, style: 'bg-[#f0f1f3] text-[#273238]' },
  { label: 'Scheduled', detail: 'pending delivery', icon: Clock3, style: 'bg-[#dbeafe] text-[#3874ff]' },
  { label: 'Delivered', detail: 'messages received', icon: CheckCircle2, style: 'bg-[#d1fae5] text-[#009d78]' },
  { label: 'Failed', detail: 'delivery errors', icon: XCircle, style: 'bg-[#fee2e2] text-[#dc2626]' },
]
const control = 'h-10 rounded-xl border border-[#e5e8f0] bg-white px-3 text-[12px] text-[#68728a] disabled:cursor-not-allowed'

export default function NotificationsContent() {
  return <main className="min-w-0 px-4 py-6 text-[#17213c] sm:px-7">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Notifications</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Send and track push notifications to students and faculty</p></div>
      <button type="button" disabled aria-describedby="notifications-availability" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-linear-[164deg,#273238,#1a2329] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_7px_#27323838] disabled:cursor-not-allowed"><Plus size={15} aria-hidden="true" />Send Notification</button>
    </header>
    <dl aria-label="Notification summary" className="mt-5 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">
      {summaries.map(({ label, detail, icon: Icon, style }) => <div key={label} className="flex items-center gap-4 rounded-2xl border border-[#e5e8f0] bg-white p-4">
        <span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${style}`}><Icon size={18} /></span>
        <div className="flex flex-col"><dt className="order-2 text-[12px] text-[#68728a]">{label}<span className="mt-1 block text-[10px] text-[#8791a8]">{detail}</span></dt><dd aria-label="Unavailable" className="order-1 font-display text-[22px] leading-7 font-extrabold">—</dd></div>
      </div>)}
    </dl>
    <fieldset disabled aria-describedby="notifications-availability" className="mt-4 flex min-w-0 flex-wrap gap-3">
      <legend className="sr-only">Filter notifications (data source unavailable)</legend>
      <div className="relative min-w-[200px] flex-[1_1_280px]"><Search size={15} aria-hidden="true" className="absolute top-3 left-3.5 text-[#8791a8]" /><input type="search" aria-label="Search notifications" placeholder="Search notifications…" className={`${control} w-full pl-10`} /></div>
      <select aria-label="Notification type" className={`${control} w-[125px]`}><option>Type</option></select>
      <select aria-label="Target audience" className={`${control} w-[150px]`}><option>Target Audience</option></select>
      <select aria-label="Delivery status" className={`${control} w-[125px]`}><option>Status</option></select>
      <input type="date" aria-label="Filter notifications by date" className={`${control} w-[155px]`} />
    </fieldset>
    <section aria-label="Notification directory" className="mt-4 overflow-hidden rounded-2xl border border-[#e5e8f0] bg-white">
      <div role="region" aria-label="Notifications table" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2]">
        <table className="w-full min-w-[1080px] text-left text-[13px]">
          <caption className="sr-only">Notification titles, types, audiences, scheduled and sent times, delivery statuses, and actions</caption>
          <thead className="border-b border-[#e5e8f0] bg-[#f7f8fc] text-[10px] tracking-[0.04em] text-[#68728a] uppercase"><tr>{['Notification Title', 'Type', 'Audience', 'Scheduled Time', 'Sent Time', 'Delivery Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-4 font-semibold first:w-[28%]">{label}</th>)}</tr></thead>
          <tbody />
        </table>
      </div>
      <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center"><Bell size={32} aria-hidden="true" className="mb-4 text-[#8791a8]" /><h2 className="font-display text-base font-bold">Notification data unavailable</h2><p id="notifications-availability" role="status" className="mt-2 max-w-md text-[13px] leading-6 text-[#68728a]">The existing backend does not expose a notifications API. Notification records, totals, delivery progress, search, filters, sending, and scheduling require an existing compatible API.</p></div>
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e5e8f0] px-4 py-3 text-[12px] text-[#68728a]">
        <p>Notification count unavailable</p>
        <nav aria-label="Notification pagination" aria-describedby="notifications-availability" className="flex items-center gap-2"><button type="button" disabled aria-label="Previous page" className="rounded-lg p-2 disabled:opacity-40"><ChevronLeft size={14} aria-hidden="true" /></button><span aria-current="page" aria-label="Page 1" className="rounded-lg bg-[#273238] px-3 py-2 font-semibold text-white">1</span><button type="button" disabled aria-label="Next page" className="rounded-lg p-2 disabled:opacity-40"><ChevronRight size={14} aria-hidden="true" /></button></nav>
      </footer>
    </section>
  </main>
}
