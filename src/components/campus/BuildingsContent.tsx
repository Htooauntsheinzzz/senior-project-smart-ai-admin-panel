import { Building2, Plus } from 'lucide-react'

const summaries = [
  { label: 'Total Buildings', style: 'border-[#dedfe2] bg-[#f0f0f1] text-[#273238]' },
  { label: 'Active', style: 'border-[#a7f3d0] bg-[#d1fae5] text-[#009d78]' },
  { label: 'Under Renovation', style: 'border-[#fde68a] bg-[#fef3c7] text-[#b45309]' },
  { label: 'Total Rooms', style: 'border-[#ddd6fe] bg-[#ede9fe] text-[#7c3aed]' },
]

export default function BuildingsContent() {
  return <main className="min-w-0 text-[#17213c]">
    <section aria-labelledby="buildings-title" className="border-b border-[#e5e8f0] bg-white px-4 pt-6 pb-5 sm:px-7">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 id="buildings-title" className="font-display text-[22px] leading-[33px] font-extrabold">Campus Buildings</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Manage university building information used by the campus navigation system</p></div>
        <button type="button" disabled aria-describedby="buildings-availability" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#273238] px-5 py-2.5 text-[13px] font-semibold text-white disabled:cursor-not-allowed"><Plus size={15} aria-hidden="true" />Add Building</button>
      </header>
      <dl aria-label="Building summary" className="mt-5 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">
        {summaries.map(({ label, style }) => <div key={label} className={`flex min-h-[84px] flex-col rounded-xl border px-4 py-3 ${style}`}><dt className="order-2 mt-1 text-[12px] leading-5">{label}</dt><dd aria-label="Unavailable" className="order-1 font-display text-[25px] leading-8 font-extrabold">—</dd></div>)}
      </dl>
    </section>
    <div className="flex flex-wrap items-center gap-3 border-b border-[#e5e8f0] bg-white px-4 py-4 sm:px-7">
      <input disabled type="search" aria-label="Search buildings" aria-describedby="buildings-availability" placeholder="Search buildings…" className="h-10 w-full rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] px-4 text-[13px] text-[#68728a] disabled:cursor-not-allowed sm:w-[280px]" />
      <select disabled aria-label="Building status" aria-describedby="buildings-availability" className="h-10 rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] px-4 text-[13px] disabled:cursor-not-allowed"><option>All Statuses</option><option>Active</option><option>Under Renovation</option></select><p className="text-[12px] text-[#68728a] sm:ml-auto">Building count unavailable</p>
    </div>
    <section aria-label="Building directory" className="px-4 sm:px-7">
      <div role="region" aria-label="Buildings table" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2]">
        <table className="w-full min-w-[850px] text-left text-[13px]"><caption className="sr-only">Campus building codes, names, floors, rooms, opening hours, status, and actions</caption><thead className="border-b border-[#e5e8f0] bg-[#f7f8fc] text-[10px] tracking-[0.06em] text-[#68728a] uppercase"><tr>{['Building Code', 'Building Name', 'Floors', 'Rooms', 'Opening Hours', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-4 font-semibold">{label}</th>)}</tr></thead><tbody /></table>
      </div>
      <div className="flex min-h-[330px] flex-col items-center justify-center border-b border-[#e5e8f0] bg-white px-6 py-12 text-center"><Building2 size={32} aria-hidden="true" className="mb-4 text-[#8791a8]" /><h2 className="font-display text-base font-bold">Building data unavailable</h2><p id="buildings-availability" role="status" className="mt-2 max-w-md text-[13px] leading-6 text-[#68728a]">The existing backend does not expose a buildings API. Building records, totals, search, status filtering, and building management require an existing compatible API.</p></div>
      <footer className="flex flex-wrap items-center justify-between gap-4 py-5 text-[12px] text-[#68728a]"><p>Building count unavailable</p><nav aria-label="Building pagination"><button type="button" disabled aria-current="page" aria-label="Page 1, building data unavailable" className="rounded-lg bg-[#273238] px-3.5 py-2 font-semibold text-white disabled:cursor-not-allowed">1</button></nav></footer>
    </section>
  </main>
}
