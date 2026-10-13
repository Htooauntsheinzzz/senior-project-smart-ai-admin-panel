import { BookOpen, ClipboardList, Compass, Footprints, GraduationCap, HeartPulse, Landmark, Map, MapPin, Minus, Plus, Search, SquareParking, Utensils, Waves } from 'lucide-react'

const types = [
  { label: 'All', Icon: Map, color: 'text-[#0891b2]' },
  { label: 'Academic Building', Icon: Landmark, color: 'text-[#8b8055]' },
  { label: 'Library', Icon: BookOpen, color: 'text-[#7c3aed]' },
  { label: 'Cafeteria', Icon: Utensils, color: 'text-[#ea9847]' },
  { label: 'Registrar', Icon: ClipboardList, color: 'text-[#45b986]' },
  { label: 'Student Affairs', Icon: GraduationCap, color: 'text-[#f15f85]' },
  { label: 'Health Center', Icon: HeartPulse, color: 'text-[#c65bda]' },
  { label: 'Parking', Icon: SquareParking, color: 'text-[#1678df]' },
  { label: 'Sports Center', Icon: Waves, color: 'text-[#37b8a4]' },
]
const layers = [
  { label: 'Buildings', Icon: Landmark, color: 'text-[#8b8055]', initial: true },
  { label: 'Campus Places', Icon: MapPin, color: 'text-[#ef4444]', initial: true },
  { label: 'Navigation Nodes', Icon: MapPin, color: 'text-[#1678df]', initial: false },
  { label: 'Walking Routes', Icon: Footprints, color: 'text-[#d79c34]', initial: true },
]
const sectionLabel = 'mb-3 text-[10px] font-bold tracking-[0.1em] text-[#68728a] uppercase'

export default function CampusMapContent() {
  return <main className="min-w-0 text-[#17213c]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e8f0] bg-white px-4 py-6 sm:px-7">
      <div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Campus Map</h1><p className="mt-1 max-w-[290px] text-[13px] leading-5 text-[#68728a]">Interactive map for mobile navigation data management</p></div>
      <div className="flex gap-3" aria-describedby="campus-map-availability"><button type="button" disabled className="inline-flex min-h-11 items-center gap-3 rounded-xl bg-[#273238] px-5 py-2.5 text-[13px] font-semibold text-white disabled:cursor-not-allowed"><Plus size={15} aria-hidden="true" />Add Location</button><button type="button" disabled className="inline-flex min-h-11 items-center gap-3 rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] px-5 py-2.5 text-[13px] font-semibold disabled:cursor-not-allowed"><Map size={15} aria-hidden="true" />Manage Routes</button></div>
    </header>
    <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside aria-label="Campus map controls" className="border-b border-[#e5e8f0] bg-white lg:border-r lg:border-b-0">
        <div className="p-4"><div className="relative"><Search size={15} aria-hidden="true" className="absolute top-3.5 left-3 text-[#8791a8]" /><input disabled type="search" aria-label="Search locations" aria-describedby="campus-map-availability" placeholder="Search locations…" className="h-11 w-full rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] pr-3 pl-9 text-[13px] disabled:cursor-not-allowed" /></div>
          <h2 className={`${sectionLabel} mt-4`}>Map Layers</h2><div className="space-y-2">{layers.map(({ label, Icon, color, initial }) => <div key={label} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 ${initial ? 'bg-[#f0f2f3]' : ''}`}><Icon size={16} className={color} aria-hidden="true" /><span id={`layer-${label.replaceAll(' ', '-')}`} className="flex-1 text-[12px]">{label}</span><button type="button" role="switch" aria-checked={initial} aria-labelledby={`layer-${label.replaceAll(' ', '-')}`} aria-describedby="campus-map-availability" disabled className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 disabled:cursor-not-allowed ${initial ? 'justify-end bg-[#273238]' : 'bg-[#e5e8f0]'}`}><span className="size-4 rounded-full bg-white shadow-sm" /></button></div>)}</div>
        </div>
        <section aria-label="Location type filters" className="border-t border-[#e5e8f0] p-4"><h2 className={sectionLabel}>Filter by Type</h2><div className="space-y-1">{types.map(({ label, Icon, color }, index) => <button key={label} type="button" disabled aria-pressed={index === 0} aria-describedby="campus-map-availability" className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-[12px] disabled:cursor-not-allowed ${index === 0 ? 'bg-[#f0f2f3] font-semibold' : ''}`}><Icon size={15} className={color} aria-hidden="true" /><span className="flex-1">{label}</span><span aria-label="Count unavailable" className={`rounded-full px-1.5 text-[10px] text-[#68728a] ${index === 0 ? 'bg-[#dde1e4]' : 'bg-[#f7f8fc]'}`}>—</span></button>)}</div></section>
        <section className="border-t border-[#e5e8f0] p-4"><h2 className={sectionLabel}>Summary</h2><dl className="space-y-3 text-[12px]">{['Total Locations', 'Active', 'Inactive'].map(label => <div key={label} className="flex justify-between gap-4"><dt className="text-[#68728a]">{label}</dt><dd aria-label="Unavailable" className={`font-semibold ${label === 'Active' ? 'text-[#00a878]' : label === 'Inactive' ? 'text-[#8791a8]' : 'text-[#273238]'}`}>—</dd></div>)}</dl></section>
      </aside>
      <section aria-label="Campus map viewport" className="min-w-0 p-4 lg:pt-0 lg:pl-0">
        <div className="relative flex min-h-[560px] items-center justify-center overflow-hidden bg-linear-[135deg,#eaf5f9,#c9e8f1,#e0f1f0] px-6 py-28 sm:min-h-[620px]">
          <div className="absolute inset-x-5 top-5 flex justify-center"><h2 className="rounded-2xl bg-white/90 px-5 py-3 text-[13px] font-semibold leading-5 text-[#273238]">Rangsit University<br />Campus</h2></div>
          <div aria-label="Map zoom controls" className="absolute top-24 right-4 flex flex-col gap-1.5">{[{ label: 'Zoom in', Icon: Plus }, { label: 'Zoom out', Icon: Minus }].map(({ label, Icon }) => <button key={label} type="button" disabled aria-label={label} aria-describedby="campus-map-availability" className="rounded-lg border border-[#e5e8f0] bg-white p-2 shadow-sm disabled:cursor-not-allowed"><Icon size={17} /></button>)}</div>
          <div className="max-w-sm rounded-2xl border border-white/90 bg-white/90 p-6 text-center shadow-sm"><MapPin size={30} aria-hidden="true" className="mx-auto mb-3 text-[#68728a]" /><h3 className="font-display text-base font-bold">Campus map data unavailable</h3><p id="campus-map-availability" role="status" className="mt-2 text-[13px] leading-6 text-[#68728a]">The existing backend does not expose campus locations or navigation routes. Search, layers, location details, and route management require an existing compatible API.</p></div>
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3"><button type="button" disabled aria-label="Reset map orientation" aria-describedby="campus-map-availability" className="rounded-full border border-[#e5e8f0] bg-white p-3 shadow-md disabled:cursor-not-allowed"><Compass size={21} /></button><p className="max-w-[220px] rounded-xl bg-white/90 px-4 py-3 text-[11px] leading-5 text-[#68728a]">Location markers will appear when campus data is available.</p></div>
        </div>
      </section>
    </div>
  </main>
}
