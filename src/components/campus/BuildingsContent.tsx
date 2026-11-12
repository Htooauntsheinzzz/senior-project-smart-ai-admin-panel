import { useCallback, useEffect, useState } from 'react'
import Pagination from '../ui/Pagination'
import type { Building, BuildingListItem, BuildingStatistics, BuildingStatus, CampusPage, CampusSite } from '../../types/campus'
import { deleteBuilding, getBuildingById, getBuildingStatistics, getBuildings } from '../../services/buildingService'
import { getCampusSites } from '../../services/campusMapService'
import { buildingStatuses, campusError, formatArea, formatHours } from '../../utils/campusApi'
import { ActionMenu, Badge, CampusTable, CodeChip, ConfirmDelete, DetailsModal, FilterSelect, PageHeader, SearchInput, SerialChip, SuccessToast, SummaryCards, TableState, primaryButton } from './CampusUi'
import { BuildingForm } from './CampusForms'
import { TABLE_PAGE_SIZE } from '../../utils/pagination'

const PAGE_SIZE = TABLE_PAGE_SIZE
const describe = (error: unknown) => campusError(error, 'Building not found.')

export default function BuildingsContent({ onDrawerChange }: { onDrawerChange: (open: boolean) => void }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BuildingStatus | ''>('')
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; data?: CampusPage<BuildingListItem>; error?: string } | null>(null)
  const [stats, setStats] = useState<{ version: number; data?: BuildingStatistics; error?: string } | null>(null)
  const [sites, setSites] = useState<CampusSite[]>([])
  const [drawer, setDrawer] = useState<{ building?: Building } | null>(null)
  const [viewing, setViewing] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<{ id: number; name: string } | null>(null)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const key = JSON.stringify([search, status, page, version])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      getBuildings({ page: page - 1, size: PAGE_SIZE, search, status }, controller.signal)
        .then(data => { if (!controller.signal.aborted) setResult({ key, data }) })
        .catch(error => { if (!controller.signal.aborted) setResult({ key, error: describe(error) }) })
    }, 300)
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [search, status, page, key])

  useEffect(() => {
    const controller = new AbortController()
    getBuildingStatistics(controller.signal).then(data => { if (!controller.signal.aborted) setStats({ version, data }) }).catch(error => { if (!controller.signal.aborted) setStats({ version, error: describe(error) }) })
    return () => controller.abort()
  }, [version])

  useEffect(() => {
    const controller = new AbortController()
    getCampusSites(controller.signal).then(rows => { if (!controller.signal.aborted) setSites(rows) }).catch(() => undefined)
    return () => controller.abort()
  }, [])

  const current = result?.key === key ? result : null
  const totals = stats?.version === version ? stats : null
  const rows = current?.data?.content ?? []
  const total = current?.data?.totalElements
  const pageCount = Math.max(1, current?.data?.totalPages ?? 1)
  const refresh = () => setVersion(previous => previous + 1)
  const dismiss = useCallback(() => setMessage(''), [])

  function openDrawer(next: { building?: Building } | null) { setDrawer(next); onDrawerChange(!!next) }

  return <main className="min-w-0 text-[#17213c]">
    <PageHeader title="Campus Buildings" description="Manage university building information used by the campus navigation system"
      actions={<button type="button" onClick={() => openDrawer({})} disabled={!!drawer} className={primaryButton}><img src="/assets/figma/faculty-plus.svg" width="15" height="15" alt="" />Add Building</button>}>
      <SummaryCards label="Building summary" error={totals?.error} onRetry={refresh} items={[
        { label: 'Total Buildings', value: totals?.data?.totalBuildings, tone: 'neutral' },
        { label: 'Active', value: totals?.data?.activeBuildings, tone: 'green' },
        { label: 'Under Renovation', value: totals?.data?.underRenovationBuildings, tone: 'amber' },
        { label: 'Total Rooms', value: totals?.data?.totalRooms, tone: 'violet' },
      ]} />
    </PageHeader>
    <div className="flex flex-wrap items-center gap-2.5 border-b-[1.25px] border-[#e5e8f0] bg-white px-4 py-3 sm:px-6">
      <SearchInput label="Search buildings" placeholder="Search buildings…" value={search} onChange={value => { setSearch(value); setPage(1) }} />
      <FilterSelect label="Building status" allLabel="All Statuses" value={status} onChange={value => { setStatus(value as BuildingStatus | ''); setPage(1) }} options={Object.entries(buildingStatuses).map(([value, s]) => ({ value, label: s.label }))} />
      <p className="text-[13px] text-[#68728a] sm:ml-auto">{total == null ? '—' : `${total} building${total === 1 ? '' : 's'}`}</p>
    </div>
    <section aria-label="Building directory" className="px-4 pt-4 pb-6 sm:px-6">
      {actionError && <p role="alert" className="mb-3 text-[13px] text-[#d80255]">{actionError} <button type="button" onClick={() => setActionError('')} className="underline">Dismiss</button></p>}
      <CampusTable label="Buildings table" caption="Row numbers, building codes, names, floors, rooms, opening hours, status and actions" minWidth={980}
        headers={['No.', 'Building Code', 'Building Name', 'Floors', 'Rooms', 'Opening Hours', 'Status', 'Actions']}
        state={<TableState loading={!current} error={current?.error} empty={!rows.length} loadingText="Loading buildings…" emptyText="No buildings found." onRetry={refresh} />}>
        {rows.map((building, index) => { const s = buildingStatuses[building.status]; return <tr key={building.id}>
          <td className="px-3.5 py-3"><SerialChip value={(page - 1) * PAGE_SIZE + index + 1} /></td>
          <td className="px-3.5 py-3"><CodeChip>{building.buildingCode}</CodeChip></td>
          <th scope="row" className="px-3.5 py-3 font-semibold">{building.buildingName}{formatArea(building.areaSquareMeters) && <span className="block text-[11px] leading-[16.5px] font-normal text-[#68728a]">{formatArea(building.areaSquareMeters)}</span>}</th>
          <td className="px-3.5 py-3 font-semibold">{building.totalFloors}F</td>
          <td className="px-3.5 py-3">{building.totalRooms}</td>
          <td className="px-3.5 py-3 font-mono text-xs text-[#68728a]">{formatHours(building.openingHoursSummary)}</td>
          <td className="px-3.5 py-3"><Badge bg={s.bg} text={s.text} dot>{s.label}</Badge></td>
          <td className="px-3.5 py-3"><ActionMenu label={`Actions for ${building.buildingName}`} disabled={!!drawer} items={[
            { label: 'View details', onSelect: () => setViewing(building.id) },
            { label: 'Edit', onSelect: () => { setActionError(''); getBuildingById(building.id).then(data => openDrawer({ building: data })).catch(error => setActionError(describe(error))) } },
            { label: 'Delete', danger: true, onSelect: () => setDeleting({ id: building.id, name: building.buildingName }) },
          ]} /></td>
        </tr> })}
      </CampusTable>
      {!!total && <Pagination label="Building pagination" page={page} pageCount={pageCount} onPage={setPage} summary={`Showing ${(page - 1) * PAGE_SIZE + 1}–${(page - 1) * PAGE_SIZE + rows.length} of ${total}`} />}
    </section>
    {drawer && <BuildingForm key={drawer.building?.id ?? 'new'} building={drawer.building} sites={sites} onClose={() => openDrawer(null)} onSaved={(name, operation, warning) => { openDrawer(null); refresh(); setMessage(`${name} was ${operation} successfully.${warning ? ` ${warning}` : ''}`) }} />}
    {viewing != null && <DetailsModal<Building> title="Building Details" describeError={describe} load={signal => getBuildingById(viewing, signal)} onClose={() => setViewing(null)}
      onEdit={data => { setViewing(null); openDrawer({ building: data }) }} onDelete={data => { setViewing(null); setDeleting({ id: data.id, name: data.buildingName }) }}
      rows={b => [['Building Code', <CodeChip key="c">{b.buildingCode}</CodeChip>], ['Name', b.buildingName], ['Name (Thai)', b.buildingNameTh], ['Campus', b.siteName], ['Floors', b.totalFloors], ['Area', formatArea(b.areaSquareMeters)], ['Rooms', b.totalRooms], ['Opening Hours', formatHours(b.openingHoursSummary)], ['Status', buildingStatuses[b.status].label], ['Description', b.description]]} />}
    {deleting && <ConfirmDelete title="Delete building?" describeError={describe} onClose={() => setDeleting(null)} onConfirm={() => deleteBuilding(deleting.id)}
      onDeleted={() => { setMessage(`${deleting.name} was deleted successfully.`); setDeleting(null); if (rows.length === 1 && page > 1) setPage(page - 1); refresh() }}>
      Delete <strong className="text-[#17213c]">{deleting.name}</strong>? The backend refuses the delete while rooms, campus places, or navigation entrances still belong to this building.
    </ConfirmDelete>}
    <SuccessToast message={message} onDismiss={dismiss} />
  </main>
}
