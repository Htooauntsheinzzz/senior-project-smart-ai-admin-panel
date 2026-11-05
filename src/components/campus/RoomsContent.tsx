import { DoorOpen, Plus } from 'lucide-react'

const summaries = [
  { label: 'Total Rooms', style: 'border-[#dedfe2] bg-[#f0f0f1] text-[#273238]' },
  { label: 'Available', style: 'border-[#a7f3d0] bg-[#d1fae5] text-[#009d78]' },
  { label: 'Occupied', style: 'border-[#fecaca] bg-[#fee2e2] text-[#dc2626]' },
  { label: 'Maintenance', style: 'border-[#fde68a] bg-[#fef3c7] text-[#b45309]' },
]
const control = 'h-10 rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] px-3.5 text-[13px] disabled:cursor-not-allowed'
const roomTypes = ['Classroom', 'Computer Lab', 'Laboratory', 'Lecture Hall', 'Meeting Room', 'Study Room']

export default function RoomsContent() {
  return <main className="min-w-0 text-[#17213c]">
    <section aria-labelledby="rooms-title" className="border-b border-[#e5e8f0] bg-white px-4 pt-6 pb-5 sm:px-7">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 id="rooms-title" className="font-display text-[22px] leading-[33px] font-extrabold">Rooms</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Manage classroom, lab, and office room data for campus navigation</p></div>
        <button type="button" disabled aria-describedby="rooms-availability" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#273238] px-5 py-2.5 text-[13px] font-semibold text-white disabled:cursor-not-allowed"><Plus size={15} aria-hidden="true" />Add Room</button>
      </header>
      <dl aria-label="Room summary" className="mt-5 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">
        {summaries.map(({ label, style }) => <div key={label} className={`flex min-h-[84px] flex-col rounded-xl border px-4 py-3 ${style}`}><dt className="order-2 mt-1 text-[12px] leading-5">{label}</dt><dd aria-label="Unavailable" className="order-1 font-display text-[25px] leading-8 font-extrabold">—</dd></div>)}
      </dl>
    </section>
    <div className="flex flex-wrap items-center gap-3 border-b border-[#e5e8f0] bg-white px-4 py-4 sm:px-7">
      <fieldset disabled aria-describedby="rooms-availability" className="flex min-w-0 flex-wrap gap-3">
        <legend className="sr-only">Filter rooms (data source unavailable)</legend>
        <input type="search" aria-label="Search rooms" placeholder="Search rooms…" className={`${control} w-full text-[#68728a] sm:w-[220px]`} />
        <select aria-label="Building" className={`${control} w-[180px]`}><option>All Buildings</option></select>
        <select aria-label="Floor" className={`${control} w-[110px]`}><option>All Floors</option></select>
        <select aria-label="Room type" className={`${control} w-[145px]`}><option>All Types</option>{roomTypes.map(type => <option key={type}>{type}</option>)}</select>
        <select aria-label="Room status" className={`${control} w-[160px]`}><option>All Statuses</option><option>Available</option><option>Occupied</option><option>Reserved</option><option>Under Maintenance</option></select>
      </fieldset>
      <p className="text-[12px] text-[#68728a] sm:ml-auto">Room count unavailable</p>
    </div>
    <section aria-label="Room directory" className="px-4 sm:px-7">
      <div role="region" aria-label="Rooms table" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2]">
        <table className="w-full min-w-[1050px] text-left text-[13px]"><caption className="sr-only">Campus room numbers, names, buildings, floors, types, capacities, status, facilities, and actions</caption><thead className="border-b border-[#e5e8f0] bg-[#f7f8fc] text-[10px] tracking-[0.06em] text-[#68728a] uppercase"><tr>{['Room Number', 'Room Name', 'Building', 'Floor', 'Type', 'Capacity', 'Status', 'Facilities', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-4 font-semibold">{label}</th>)}</tr></thead><tbody /></table>
      </div>
      <div className="flex min-h-[360px] flex-col items-center justify-center border-b border-[#e5e8f0] bg-white px-6 py-12 text-center"><DoorOpen size={32} aria-hidden="true" className="mb-4 text-[#8791a8]" /><h2 className="font-display text-base font-bold">Room data unavailable</h2><p id="rooms-availability" role="status" className="mt-2 max-w-md text-[13px] leading-6 text-[#68728a]">The existing backend does not expose a room-directory API. Room records, totals, filters, facilities, and room management require an existing compatible API. Course Section room names are free text, not room-directory records.</p></div>
      <footer className="flex flex-wrap items-center justify-between gap-4 py-5 text-[12px] text-[#68728a]"><p>Room count unavailable</p><nav aria-label="Room pagination"><button type="button" disabled aria-current="page" aria-label="Page 1, room data unavailable" className="rounded-lg bg-[#273238] px-3.5 py-2 font-semibold text-white disabled:cursor-not-allowed">1</button></nav></footer>
    </section>
  </main>
}
