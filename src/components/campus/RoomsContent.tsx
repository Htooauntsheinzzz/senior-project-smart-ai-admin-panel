import { useCallback, useEffect, useState } from 'react'
import Pagination from '../ui/Pagination'
import type { BuildingListItem, CampusFacility, CampusPage, Room, RoomStatistics } from '../../types/campus'
import { deleteRoom, getRoomById, getRoomFacilities, getRoomStatistics, getRooms, type RoomFilters } from '../../services/roomService'
import { getAllBuildings } from '../../services/buildingService'
import { campusError, facilityIcon, floorLabel, roomStatuses, roomTypes } from '../../utils/campusApi'
import { ActionMenu, Badge, CampusTable, CodeChip, ConfirmDelete, DetailsModal, FilterSelect, PageHeader, SearchInput, SerialChip, SuccessToast, SummaryCards, TableState, primaryButton } from './CampusUi'
import { RoomForm } from './CampusForms'

const PAGE_SIZE = 10
const describe = (error: unknown) => campusError(error, 'Room not found.')
const emptyFilters: RoomFilters = { search: '', buildingId: '', floorNumber: '', roomType: '', status: '' }

export default function RoomsContent({ onDrawerChange }: { onDrawerChange: (open: boolean) => void }) {
  const [filters, setFilters] = useState<RoomFilters>(emptyFilters)
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; data?: CampusPage<Room>; error?: string } | null>(null)
  const [stats, setStats] = useState<{ version: number; data?: RoomStatistics; error?: string } | null>(null)
  const [buildings, setBuildings] = useState<BuildingListItem[]>([])
  const [facilities, setFacilities] = useState<CampusFacility[]>([])
  const [lookupError, setLookupError] = useState('')
  const [drawer, setDrawer] = useState<{ room?: Room } | null>(null)
  const [viewing, setViewing] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<{ id: number; name: string } | null>(null)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const key = JSON.stringify([filters, page, version])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      getRooms({ page: page - 1, size: PAGE_SIZE, ...filters }, controller.signal)
        .then(data => { if (!controller.signal.aborted) setResult({ key, data }) })
        .catch(error => { if (!controller.signal.aborted) setResult({ key, error: describe(error) }) })
    }, 300)
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [filters, page, key])

  useEffect(() => {
    const controller = new AbortController()
    getRoomStatistics(undefined, controller.signal).then(data => { if (!controller.signal.aborted) setStats({ version, data }) }).catch(error => { if (!controller.signal.aborted) setStats({ version, error: describe(error) }) })
    return () => controller.abort()
  }, [version])

  // Building filter and form use real backend buildings; refreshed after each mutation for room counts.
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([getAllBuildings(controller.signal), getRoomFacilities(controller.signal)])
      .then(([buildingRows, facilityRows]) => { if (!controller.signal.aborted) { setBuildings(buildingRows); setFacilities(facilityRows); setLookupError('') } })
      .catch(error => { if (!controller.signal.aborted) setLookupError(`Building and facility options could not be loaded. ${describe(error)}`) })
    return () => controller.abort()
  }, [version])

  const current = result?.key === key ? result : null
  const totals = stats?.version === version ? stats : null
  const rows = current?.data?.content ?? []
  const total = current?.data?.totalElements
  const refresh = () => setVersion(previous => previous + 1)
  const dismiss = useCallback(() => setMessage(''), [])
  const change = (patch: Partial<RoomFilters>) => { setFilters(previous => ({ ...previous, ...patch })); setPage(1) }
  function openDrawer(next: { room?: Room } | null) { setDrawer(next); onDrawerChange(!!next) }

  // Floors are integers; options cover the selected building (or the tallest one).
  const selectedBuilding = buildings.find(b => String(b.id) === filters.buildingId)
  const topFloor = selectedBuilding?.totalFloors ?? Math.max(0, ...buildings.map(b => b.totalFloors))
  const floorOptions = Array.from({ length: topFloor }, (_, index) => ({ value: String(index + 1), label: floorLabel(index + 1) }))

  return <main className="min-w-0 text-[#17213c]">
    <PageHeader title="Rooms" description="Manage classroom, lab, and office room data for campus navigation"
      actions={<button type="button" onClick={() => openDrawer({})} disabled={!!drawer} className={primaryButton}><img src="/assets/figma/faculty-plus.svg" width="15" height="15" alt="" />Add Room</button>}>
      <SummaryCards label="Room summary" error={totals?.error} onRetry={refresh} items={[
        { label: 'Total Rooms', value: totals?.data?.totalRooms, tone: 'neutral' },
        { label: 'Available', value: totals?.data?.available, tone: 'green' },
        { label: 'Occupied', value: totals?.data?.occupied, tone: 'red' },
        { label: 'Maintenance', value: totals?.data?.maintenance, tone: 'amber' },
      ]} />
    </PageHeader>
    <div className="flex flex-wrap items-center gap-2.5 border-b-[1.25px] border-[#e5e8f0] bg-white px-4 py-3 sm:px-6">
      <SearchInput label="Search rooms" placeholder="Search rooms…" className="sm:w-[220px]" value={filters.search} onChange={search => change({ search })} />
      <FilterSelect label="Building" allLabel="All Buildings" value={filters.buildingId} onChange={buildingId => change({ buildingId, floorNumber: '' })} options={buildings.map(b => ({ value: String(b.id), label: b.buildingName }))} />
      <FilterSelect label="Floor" allLabel="All Floors" value={filters.floorNumber} onChange={floorNumber => change({ floorNumber })} options={floorOptions} />
      <FilterSelect label="Room type" allLabel="All Types" value={filters.roomType} onChange={roomType => change({ roomType: roomType as RoomFilters['roomType'] })} options={Object.entries(roomTypes).map(([value, t]) => ({ value, label: t.label }))} />
      <FilterSelect label="Room status" allLabel="All Statuses" value={filters.status} onChange={status => change({ status: status as RoomFilters['status'] })} options={Object.entries(roomStatuses).map(([value, s]) => ({ value, label: s.label }))} />
      <p className="text-[13px] text-[#68728a] sm:ml-auto">{total == null ? '—' : `${total} room${total === 1 ? '' : 's'}`}</p>
    </div>
    <section aria-label="Room directory" className="px-4 pt-4 pb-6 sm:px-6">
      {lookupError && <p role="alert" className="mb-3 text-xs text-[#68728a]">{lookupError} <button type="button" onClick={refresh} className="underline">Retry</button></p>}
      {actionError && <p role="alert" className="mb-3 text-[13px] text-[#d80255]">{actionError} <button type="button" onClick={() => setActionError('')} className="underline">Dismiss</button></p>}
      <CampusTable label="Rooms table" caption="Row numbers, room numbers, names, buildings, floors, types, capacities, status, facilities and actions" minWidth={1080}
        headers={['No.', 'Room Number', 'Room Name', 'Building', 'Floor', 'Type', 'Capacity', 'Status', 'Facilities', 'Actions']}
        state={<TableState loading={!current} error={current?.error} empty={!rows.length} loadingText="Loading rooms…" emptyText="No rooms found." onRetry={refresh} />}>
        {rows.map((room, index) => { const t = roomTypes[room.roomType], s = roomStatuses[room.status]; return <tr key={room.id}>
          <td className="px-3 py-3"><SerialChip value={(page - 1) * PAGE_SIZE + index + 1} /></td>
          <td className="px-3 py-3"><CodeChip>{room.roomNumber}</CodeChip></td>
          <th scope="row" className="px-3 py-3 font-medium">{room.roomName || <span className="text-[#68728a]">—</span>}</th>
          <td className="px-3 py-3 text-xs leading-[18px]">{room.buildingName}<span className="block text-[10px] leading-[15px] text-[#68728a]">{room.buildingCode}</span></td>
          <td className="px-3 py-3 font-semibold">{floorLabel(room.floorNumber)}</td>
          <td className="px-3 py-3"><Badge bg={t.bg} text={t.text}>{t.icon} {t.label}</Badge></td>
          <td className="px-3 py-3">{room.capacity == null ? <span className="text-[#68728a]">—</span> : <>{room.capacity} <span className="text-[11px] text-[#68728a]">pax</span></>}</td>
          <td className="px-3 py-3"><Badge bg={s.bg} text={s.text}>{s.label}</Badge></td>
          <td className="px-3 py-3">{room.facilities.length ? <ul aria-label="Facilities" className="flex gap-1">{room.facilities.map(f => <li key={f.id} title={f.name}><span aria-hidden="true">{facilityIcon(f)}</span><span className="sr-only">{f.name}</span></li>)}</ul> : <span className="text-[#68728a]">—</span>}</td>
          <td className="px-3 py-3"><ActionMenu label={`Actions for room ${room.roomNumber}`} disabled={!!drawer} items={[
            { label: 'View details', onSelect: () => setViewing(room.id) },
            { label: 'Edit', onSelect: () => { setActionError(''); getRoomById(room.id).then(data => openDrawer({ room: data })).catch(error => setActionError(describe(error))) } },
            { label: 'Delete', danger: true, onSelect: () => setDeleting({ id: room.id, name: room.roomNumber }) },
          ]} /></td>
        </tr> })}
      </CampusTable>
      {!!total && <Pagination label="Room pagination" page={page} pageCount={Math.max(1, current?.data?.totalPages ?? 1)} onPage={setPage} summary={`Showing ${(page - 1) * PAGE_SIZE + 1}–${(page - 1) * PAGE_SIZE + rows.length} of ${total}`} />}
    </section>
    {drawer && <RoomForm key={drawer.room?.id ?? 'new'} room={drawer.room} buildings={buildings} facilities={facilities} onClose={() => openDrawer(null)} onSaved={(name, operation) => { openDrawer(null); refresh(); setMessage(`Room ${name} was ${operation} successfully.`) }} />}
    {viewing != null && <DetailsModal<Room> title="Room Details" describeError={describe} load={signal => getRoomById(viewing, signal)} onClose={() => setViewing(null)}
      onEdit={data => { setViewing(null); openDrawer({ room: data }) }} onDelete={data => { setViewing(null); setDeleting({ id: data.id, name: data.roomNumber }) }}
      rows={r => [['Room Number', <CodeChip key="c">{r.roomNumber}</CodeChip>], ['Room Name', r.roomName], ['Building', `${r.buildingName} (${r.buildingCode})`], ['Floor', floorLabel(r.floorNumber)], ['Type', roomTypes[r.roomType].label], ['Capacity', r.capacity == null ? null : `${r.capacity} pax`], ['Status', roomStatuses[r.status].label], ['Facilities', r.facilities.map(f => f.name).join(', ') || null]]} />}
    {deleting && <ConfirmDelete title="Delete room?" describeError={describe} onClose={() => setDeleting(null)} onConfirm={() => deleteRoom(deleting.id)}
      onDeleted={() => { setMessage(`Room ${deleting.name} was deleted successfully.`); setDeleting(null); if (rows.length === 1 && page > 1) setPage(page - 1); refresh() }}>
      Delete room <strong className="text-[#17213c]">{deleting.name}</strong>? It will be removed from the room directory.
    </ConfirmDelete>}
    <SuccessToast message={message} onDismiss={dismiss} />
  </main>
}
