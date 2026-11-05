import { useState } from 'react'
import { BookOpen, ClipboardList, CreditCard, GraduationCap, HeartPulse, LayoutGrid, MapPin, Plus, SquareParking, Table2, Utensils, Waves, DoorOpen } from 'lucide-react'

const summaries = [
  { label: 'Total Places', style: 'border-[#dedfe2] bg-[#f0f0f1] text-[#273238]' },
  { label: 'Open', style: 'border-[#a7f3d0] bg-[#d1fae5] text-[#009d78]' },
  { label: 'Closed', style: 'border-[#fecaca] bg-[#fee2e2] text-[#dc2626]' },
  { label: 'Popular', style: 'border-[#fde68a] bg-[#fef3c7] text-[#b45309]' },
]
const categories = [
  { label: 'Library', Icon: BookOpen, color: 'text-[#7c3aed]' },
  { label: 'Cafeteria', Icon: Utensils, color: 'text-[#ea9847]' },
  { label: 'Registrar', Icon: ClipboardList, color: 'text-[#45b986]' },
  { label: 'Student Affairs', Icon: GraduationCap, color: 'text-[#f15f85]' },
  { label: 'Health Center', Icon: HeartPulse, color: 'text-[#c65bda]' },
  { label: 'ATM', Icon: CreditCard, color: 'text-[#b49334]' },
  { label: 'Parking', Icon: SquareParking, color: 'text-[#1678df]' },
  { label: 'Sports Center', Icon: Waves, color: 'text-[#37b8a4]' },
  { label: 'Main Gate', Icon: DoorOpen, color: 'text-[#b49334]' },
]

export default function CampusPlacesContent() {
  const [view, setView] = useState<'cards' | 'table'>('cards')
  return <main className="min-w-0 text-[#17213c]">
    <section aria-labelledby="places-title" className="border-b border-[#e5e8f0] bg-white px-4 pt-6 pb-5 sm:px-7">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 id="places-title" className="font-display text-[22px] leading-[33px] font-extrabold">Campus Places</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Points of interest and campus facilities for the student mobile navigation app</p></div>
        <div className="flex flex-wrap items-center gap-3"><div role="group" aria-label="Place display mode" className="inline-flex overflow-hidden rounded-lg border border-[#e5e8f0] bg-white">{([{ value: 'cards', label: 'Cards', Icon: LayoutGrid }, { value: 'table', label: 'Table', Icon: Table2 }] as const).map(({ value, label, Icon }) => <button key={value} type="button" aria-pressed={view === value} aria-controls="places-directory" onClick={() => setView(value)} className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-3] ${view === value ? 'bg-[#273238] text-white' : 'text-[#68728a] hover:bg-[#f7f8fc]'}`}><Icon size={14} aria-hidden="true" />{label}</button>)}</div><button type="button" disabled aria-describedby="places-availability" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#273238] px-4 py-2.5 text-[13px] font-semibold text-white disabled:cursor-not-allowed"><Plus size={15} aria-hidden="true" />Add Campus Place</button></div>
      </header>
      <dl aria-label="Campus place summary" className="mt-5 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">{summaries.map(({ label, style }) => <div key={label} className={`flex min-h-[84px] flex-col rounded-xl border px-4 py-3 ${style}`}><dt className="order-2 mt-1 text-[12px] leading-5">{label}</dt><dd aria-label="Unavailable" className="order-1 font-display text-[25px] leading-8 font-extrabold">—</dd></div>)}</dl>
    </section>
    <nav aria-label="Place categories" className="flex flex-wrap items-center gap-x-3 border-b border-[#e5e8f0] bg-white px-4 sm:px-7">
      <button type="button" disabled aria-pressed="true" aria-describedby="places-availability" className="inline-flex items-center gap-2 border-b-2 border-[#273238] px-2 py-3 text-[12px] font-semibold disabled:cursor-not-allowed">All <span aria-label="Count unavailable" className="rounded bg-[#f0f2f3] px-1.5 text-[10px]">—</span></button>
      {categories.map(({ label, Icon, color }) => <button key={label} type="button" disabled aria-pressed="false" aria-describedby="places-availability" className="inline-flex items-center gap-1.5 border-b-2 border-transparent px-1 py-3 text-[11px] text-[#68728a] disabled:cursor-not-allowed"><Icon size={13} aria-hidden="true" className={color} />{label}<span aria-label="Count unavailable" className="rounded bg-[#f7f8fc] px-1 text-[10px]">—</span></button>)}
    </nav>
    <div className="flex flex-wrap items-center gap-3 border-b border-[#e5e8f0] bg-white px-4 py-4 sm:px-7"><input disabled type="search" aria-label="Search places" aria-describedby="places-availability" placeholder="Search places…" className="h-10 w-full rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] px-4 text-[13px] text-[#68728a] disabled:cursor-not-allowed sm:w-[260px]" /><select disabled aria-label="Place status" aria-describedby="places-availability" className="h-10 rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] px-4 text-[13px] disabled:cursor-not-allowed"><option>All Statuses</option><option>Open</option><option>Temporarily Closed</option></select><p className="text-[12px] text-[#68728a] sm:ml-auto">Place count unavailable</p></div>
    <section id="places-directory" aria-label={`Campus places ${view} view`} className="p-4 sm:px-7 sm:py-5">
      <p role="status" className="sr-only">{view === 'cards' ? 'Cards view selected.' : 'Table view selected.'} Place data unavailable.</p>
      <div className="overflow-hidden rounded-2xl border border-[#e5e8f0] bg-white">
        {view === 'table' && <div role="region" aria-label="Campus places table" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2]"><table className="w-full min-w-[1000px] text-left text-[13px]"><caption className="sr-only">Campus place names, types, locations, opening hours, contact information, status and actions</caption><thead className="border-b border-[#e5e8f0] bg-[#f7f8fc] text-[10px] tracking-[0.06em] text-[#68728a] uppercase"><tr>{['Place Name', 'Type', 'Building', 'Floor', 'Hours', 'Phone', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-4 font-semibold">{label}</th>)}</tr></thead><tbody /></table></div>}
        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center"><MapPin size={32} aria-hidden="true" className="mb-4 text-[#8791a8]" /><h2 className="font-display text-base font-bold">Campus place data unavailable</h2><p id="places-availability" className="mt-2 max-w-md text-[13px] leading-6 text-[#68728a]">The existing backend does not expose a campus-places API. Place records, counts, category and status filters, and place management require an existing compatible API. You can switch between Cards and Table views.</p></div>
      </div>
    </section>
  </main>
}
