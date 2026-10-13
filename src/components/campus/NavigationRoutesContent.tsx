import { Accessibility, GitBranch, Network, Plus } from 'lucide-react'

const summaries = [
  { label: 'Total Routes', style: 'border-[#dedfe2] bg-[#f0f0f1] text-[#273238]' },
  { label: 'Active', style: 'border-[#a7f3d0] bg-[#d1fae5] text-[#009d78]' },
  { label: 'Accessible', style: 'border-[#ddd6fe] bg-[#ede9fe] text-[#7c3aed]' },
  { label: 'Under Construction', style: 'border-[#fde68a] bg-[#fef3c7] text-[#b45309]' },
]

export default function NavigationRoutesContent() {
  return <main className="min-w-0 text-[#17213c]">
    <section aria-labelledby="navigation-routes-title" className="border-b border-[#e5e8f0] bg-white px-4 pt-6 pb-5 sm:px-7">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 id="navigation-routes-title" className="font-display text-[22px] leading-[33px] font-extrabold">Navigation Routes</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Manage campus walking graph — nodes and paths used by the student mobile navigation</p></div>
        <div className="flex flex-wrap gap-3" aria-describedby="routes-availability"><button type="button" disabled className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] px-4 py-2.5 text-[13px] font-semibold disabled:cursor-not-allowed"><Plus size={15} aria-hidden="true" />Add Node</button><button type="button" disabled className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#273238] px-4 py-2.5 text-[13px] font-semibold text-white disabled:cursor-not-allowed"><GitBranch size={15} aria-hidden="true" />Connect Nodes</button></div>
      </header>
      <dl aria-label="Route summary" className="mt-5 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">{summaries.map(({ label, style }) => <div key={label} className={`flex min-h-[84px] flex-col rounded-xl border px-4 py-3 ${style}`}><dt className="order-2 mt-1 text-[12px] leading-5">{label}</dt><dd aria-label="Unavailable" className="order-1 font-display text-[25px] leading-8 font-extrabold">—</dd></div>)}</dl>
    </section>
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e8f0] bg-white px-4 py-3 sm:px-7">
      <fieldset disabled aria-describedby="routes-availability" className="flex flex-wrap items-center gap-2"><legend className="sr-only">Filter Routes</legend><span aria-hidden="true" className="mr-1 text-[12px] font-semibold">Filter Routes:</span>{['All', 'Active', 'Inactive', 'Under Construction'].map((label, index) => <button key={label} type="button" aria-pressed={index === 0} className={`rounded-full border px-3 py-1.5 text-[11px] font-medium disabled:cursor-not-allowed ${index === 0 ? 'border-[#273238] bg-[#273238] text-white' : 'border-[#e5e8f0] bg-[#f7f8fc] text-[#68728a]'}`}>{label}</button>)}</fieldset>
      <section aria-label="Route legend" className="flex flex-wrap items-center gap-3 text-[10px] text-[#68728a]"><span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="w-6 border-t-2 border-[#64748b]" />Active</span><span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="w-6 border-t-2 border-dashed border-[#b7c0cf]" />Inactive</span><span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="w-6 border-t-2 border-dashed border-[#f59e0b]" />Under Construction</span><span className="inline-flex items-center gap-1.5"><Accessibility size={13} aria-hidden="true" className="text-[#1678df]" />Accessible</span></section>
    </div>
    <div className="space-y-4 p-4 sm:px-7 sm:py-5">
      <section aria-label="Campus walking-route graph" className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-white bg-[#e7f4f7] px-5 py-16 shadow-sm sm:min-h-[560px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 border-l-2 border-[#d5e6eb]" /><div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 border-t-2 border-[#d5e6eb]" />
        <div className="relative max-w-md rounded-2xl border border-white bg-white/95 p-6 text-center shadow-sm"><Network size={32} aria-hidden="true" className="mx-auto mb-3 text-[#68728a]" /><h2 className="font-display text-base font-bold">Navigation route data unavailable</h2><p id="routes-availability" role="status" className="mt-2 text-[13px] leading-6 text-[#68728a]">The existing backend does not expose navigation nodes or walking routes. Route counts, connections, distances, walking times, and accessibility information require an existing compatible API.</p></div>
      </section>
      <section aria-labelledby="route-list-title" className="overflow-hidden rounded-xl border border-[#e5e8f0] bg-white">
        <h2 id="route-list-title" className="border-b border-[#e5e8f0] px-4 py-3 text-[13px] font-semibold">Route List</h2>
        <div role="region" aria-label="Route list table" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2]"><table className="w-full min-w-[1080px] text-left text-[13px]"><caption className="sr-only">Row numbers, start and end nodes, distances, walking times, accessibility, surfaces, status and actions</caption><thead className="border-b border-[#e5e8f0] bg-[#f7f8fc] text-[10px] tracking-[0.06em] text-[#68728a] uppercase"><tr>{['No.', 'Start Node', 'End Node', 'Distance', 'Walk Time', 'Accessible', 'Surface', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-4 font-semibold">{label}</th>)}</tr></thead><tbody /></table></div>
        <p className="px-6 py-12 text-center text-[13px] leading-6 text-[#68728a]">Route records are unavailable. Add Node, Connect Nodes, filtering, editing, and deletion require a connected navigation API.</p>
      </section>
    </div>
  </main>
}
