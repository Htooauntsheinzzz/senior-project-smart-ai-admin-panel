import { useCallback, useEffect, useState } from 'react'
import type { BuildingListItem, CampusCategory, CampusFacility, CampusPlace, CampusSite, PlaceStatistics, PlaceStatus } from '../../types/campus'
import { deleteCampusPlace, getCampusPlaceById, getCampusPlaceStatistics, getCampusPlaces } from '../../services/campusPlaceService'
import { getCampusCategories, getCampusFacilities, getCampusSites } from '../../services/campusMapService'
import { getAllBuildings } from '../../services/buildingService'
import { campusError, categoryVisual, formatHours, placeStatuses } from '../../utils/campusApi'
import { ActionMenu, Badge, CampusTable, CodeChip, ConfirmDelete, DetailsModal, FilterSelect, PageHeader, SearchInput, SerialChip, SuccessToast, SummaryCards, TableState, primaryButton } from './CampusUi'
import { PlaceForm } from './CampusForms'

const describe = (error: unknown) => campusError(error, 'Campus place not found.')

export default function CampusPlacesContent({ onDrawerChange }: { onDrawerChange: (open: boolean) => void }) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PlaceStatus | ''>('')
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; rows?: CampusPlace[]; error?: string } | null>(null)
  const [stats, setStats] = useState<{ version: number; data?: PlaceStatistics; error?: string } | null>(null)
  const [lookups, setLookups] = useState<{ sites: CampusSite[]; categories: CampusCategory[]; buildings: BuildingListItem[]; facilities: CampusFacility[] }>({ sites: [], categories: [], buildings: [], facilities: [] })
  const [lookupError, setLookupError] = useState('')
  const [drawer, setDrawer] = useState<{ place?: CampusPlace } | null>(null)
  const [viewing, setViewing] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<{ id: number; name: string } | null>(null)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  // viewMode and category are not part of the key: switching them never refetches.
  const key = JSON.stringify([search, status, version])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      getCampusPlaces({ search, status }, controller.signal)
        .then(rows => { if (!controller.signal.aborted) setResult({ key, rows }) })
        .catch(error => { if (!controller.signal.aborted) setResult({ key, error: describe(error) }) })
    }, 300)
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [search, status, key])

  useEffect(() => {
    const controller = new AbortController()
    getCampusPlaceStatistics(controller.signal).then(data => { if (!controller.signal.aborted) setStats({ version, data }) }).catch(error => { if (!controller.signal.aborted) setStats({ version, error: describe(error) }) })
    return () => controller.abort()
  }, [version])

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([getCampusSites(controller.signal), getCampusCategories(controller.signal), getAllBuildings(controller.signal), getCampusFacilities(controller.signal)])
      .then(([sites, categories, buildings, facilities]) => { if (!controller.signal.aborted) { setLookups({ sites, categories, buildings, facilities }); setLookupError('') } })
      .catch(error => { if (!controller.signal.aborted) setLookupError(`Category and building options could not be loaded. ${describe(error)}`) })
    return () => controller.abort()
  }, [])

  const current = result?.key === key ? result : null
  const totals = stats?.version === version ? stats : null
  const all = current?.rows ?? []
  const places = category ? all.filter(place => String(place.category.id) === category) : all
  const refresh = () => setVersion(previous => previous + 1)
  const dismiss = useCallback(() => setMessage(''), [])
  function openDrawer(next: { place?: CampusPlace } | null) { setDrawer(next); onDrawerChange(!!next) }
  const edit = (id: number) => { setActionError(''); getCampusPlaceById(id).then(data => openDrawer({ place: data })).catch(error => setActionError(describe(error))) }
  const actions = (place: CampusPlace) => [
    { label: 'View details', onSelect: () => setViewing(place.id) },
    { label: 'Edit', onSelect: () => edit(place.id) },
    { label: 'Delete', danger: true, onSelect: () => setDeleting({ id: place.id, name: place.placeName }) },
  ]

  // Category tabs: backend categories that are active or currently used, with counts from the loaded places.
  const tabs = lookups.categories.filter(c => c.isActive || all.some(p => p.category.id === c.id)).map(c => ({ id: String(c.id), name: c.categoryName, count: all.filter(p => p.category.id === c.id).length }))
  const view = (mode: 'cards' | 'table', label: string) => <button type="button" aria-pressed={viewMode === mode} onClick={() => setViewMode(mode)} className={`h-full px-3.5 text-xs leading-[18px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${viewMode === mode ? 'bg-[#273238] text-white' : 'bg-white text-[#68728a]'}`}>{label}</button>

  return <main className="min-w-0 text-[#17213c]">
    <PageHeader title="Campus Places" description="Points of interest and campus facilities for the student mobile navigation app"
      actions={<>
        <div role="group" aria-label="View mode" className="flex h-[37.5px] overflow-hidden rounded-[9px] border-[1.25px] border-[#e5e8f0]">{view('cards', '⊞ Cards')}{view('table', '☰ Table')}</div>
        <button type="button" onClick={() => openDrawer({})} disabled={!!drawer} className={primaryButton}><img src="/assets/figma/faculty-plus.svg" width="15" height="15" alt="" />Add Campus Place</button>
      </>}>
      <SummaryCards label="Campus place summary" error={totals?.error} onRetry={refresh} items={[
        { label: 'Total Places', value: totals?.data?.totalPlaces, tone: 'neutral' },
        { label: 'Open', value: totals?.data?.activePlaces, tone: 'green' },
        { label: 'Closed', value: totals?.data?.temporarilyClosedPlaces, tone: 'red' },
        { label: 'Popular', value: totals?.data?.popularPlaces, tone: 'amber' },
      ]} />
    </PageHeader>
    <div className="border-b-[1.25px] border-[#e5e8f0] bg-white">
      <div role="tablist" aria-label="Place categories" className="flex gap-0.5 overflow-x-auto px-4 sm:px-6">
        {[{ id: '', name: 'All', count: all.length }, ...tabs].map(tab => { const on = category === tab.id; return <button key={tab.id || 'all'} type="button" role="tab" aria-selected={on} onClick={() => setCategory(tab.id)}
          className={`flex shrink-0 items-center gap-[5px] border-b-[2.5px] px-3.5 py-2.5 text-[13px] leading-[19.5px] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${on ? 'border-[#273238] font-bold text-[#273238]' : 'border-transparent text-[#68728a] hover:text-[#273238]'}`}>
          {tab.id && <span aria-hidden="true" className="text-sm">{categoryVisual(tab.name).icon}</span>}{tab.name}
          <span className={`rounded-full px-1.5 py-px text-[10px] leading-[15px] font-semibold ${on ? 'bg-[rgba(39,50,56,0.08)] text-[#273238]' : 'bg-[#f7f8fc] text-[#9ca3af]'}`}>{current ? tab.count : '—'}</span>
        </button> })}
      </div>
      <div className="flex flex-wrap items-center gap-2.5 border-t-[1.25px] border-[#e5e8f0] px-4 py-2.5 sm:px-6">
        <SearchInput label="Search places" placeholder="Search places…" className="sm:w-[240px]" value={search} onChange={setSearch} />
        <FilterSelect label="Place status" allLabel="All Statuses" value={status} onChange={value => setStatus(value as PlaceStatus | '')} options={Object.entries(placeStatuses).map(([value, s]) => ({ value, label: s.label }))} />
        <p className="text-[13px] text-[#68728a] sm:ml-auto">{current ? `${places.length} place${places.length === 1 ? '' : 's'}` : '—'}</p>
      </div>
    </div>
    <section aria-label="Campus place directory" className="px-4 pt-6 pb-6 sm:px-6">
      {lookupError && <p role="alert" className="mb-3 text-xs text-[#68728a]">{lookupError}</p>}
      {actionError && <p role="alert" className="mb-3 text-[13px] text-[#d80255]">{actionError} <button type="button" onClick={() => setActionError('')} className="underline">Dismiss</button></p>}
      {viewMode === 'cards' ? <>
        {(!current || current.error || !places.length) && <div className="rounded-[14px] border-[1.25px] border-[#e5e8f0] bg-white"><TableState loading={!current} error={current?.error} empty={!places.length} loadingText="Loading campus places…" emptyText="No campus places found." onRetry={refresh} /></div>}
        {!!places.length && <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">{places.map(place => <li key={place.id}><PlaceCard place={place} actions={actions(place)} disabled={!!drawer} /></li>)}</ul>}
      </> : <CampusTable label="Campus places table" caption="Row numbers, place names, categories, buildings, floors, hours, phone numbers, status and actions" minWidth={1100}
        headers={['No.', 'Place', 'Category', 'Building', 'Floor', 'Hours', 'Phone', 'Status', 'Actions']}
        state={<TableState loading={!current} error={current?.error} empty={!places.length} loadingText="Loading campus places…" emptyText="No campus places found." onRetry={refresh} />}>
        {places.map((place, index) => { const s = placeStatuses[place.status], c = categoryVisual(place.category.name); return <tr key={place.id}>
          <td className="px-3.5 py-3"><SerialChip value={index + 1} /></td>
          <th scope="row" className="px-3.5 py-3 font-semibold">{place.placeName}{place.isPopular && <span className="ml-2 rounded-full border border-[#fde68a] bg-[#fef3c7] px-1.5 py-px text-[10px] font-bold text-[#b45309]">⭐ Popular</span>}<span className="block text-[11px] font-normal text-[#68728a]"><CodeChip>{place.placeCode}</CodeChip></span></th>
          <td className="px-3.5 py-3"><Badge bg={c.bg} text={c.tag}>{c.icon} {place.category.name}</Badge></td>
          <td className="px-3.5 py-3 text-xs">{place.building?.name ?? '—'}</td>
          <td className="px-3.5 py-3 text-xs">{place.floorLabel || '—'}</td>
          <td className="px-3.5 py-3 font-mono text-xs text-[#68728a]">{formatHours(place.openingHoursSummary)}</td>
          <td className="px-3.5 py-3 text-xs">{place.phoneNumber || '—'}</td>
          <td className="px-3.5 py-3"><Badge bg={s.bg} text={s.text} dot>{s.label}</Badge></td>
          <td className="px-3.5 py-3"><ActionMenu label={`Actions for ${place.placeName}`} disabled={!!drawer} items={actions(place)} /></td>
        </tr> })}
      </CampusTable>}
    </section>
    {drawer && <PlaceForm key={drawer.place?.id ?? 'new'} place={drawer.place} {...lookups} onClose={() => openDrawer(null)} onSaved={(name, operation, warning) => { openDrawer(null); refresh(); setMessage(`${name} was ${operation} successfully.${warning ? ` ${warning}` : ''}`) }} />}
    {viewing != null && <DetailsModal<CampusPlace> title="Campus Place Details" describeError={describe} load={signal => getCampusPlaceById(viewing, signal)} onClose={() => setViewing(null)}
      onEdit={data => { setViewing(null); openDrawer({ place: data }) }} onDelete={data => { setViewing(null); setDeleting({ id: data.id, name: data.placeName }) }}
      rows={p => [['Place Code', <CodeChip key="c">{p.placeCode}</CodeChip>], ['Name', p.placeName], ['Name (Thai)', p.placeNameTh], ['Category', p.category.name], ['Building', p.building?.name], ['Floor', p.floorLabel], ['Hours', formatHours(p.openingHoursSummary)], ['Phone', p.phoneNumber], ['Status', placeStatuses[p.status].label], ['Popular', p.isPopular ? 'Yes' : 'No'], ['Visible on mobile', p.isVisibleOnMobile ? 'Yes' : 'No'], ['Facilities', p.facilities.map(f => f.name).join(', ') || null], ['Description', p.description]]} />}
    {deleting && <ConfirmDelete title="Delete campus place?" describeError={describe} onClose={() => setDeleting(null)} onConfirm={() => deleteCampusPlace(deleting.id)}
      onDeleted={() => { setMessage(`${deleting.name} was deleted successfully.`); setDeleting(null); refresh() }}>
      Delete <strong className="text-[#17213c]">{deleting.name}</strong>? It will no longer appear in the student mobile navigation app.
    </ConfirmDelete>}
    <SuccessToast message={message} onDismiss={dismiss} />
  </main>
}

function PlaceCard({ place, actions, disabled }: { place: CampusPlace; actions: { label: string; onSelect: () => void; danger?: boolean }[]; disabled: boolean }) {
  const c = categoryVisual(place.category.name), s = placeStatuses[place.status]
  const details: [string, string][] = [['Building', place.building?.name ?? '—'], ['Floor', place.floorLabel || '—'], ['Hours', formatHours(place.openingHoursSummary)], ['Phone', place.phoneNumber || '—']]
  return <article aria-label={place.placeName} className="relative flex h-full flex-col rounded-[14px] border-[1.25px] border-[#e5e8f0] bg-white p-4">
    <div className="flex items-start gap-3 pr-[92px]">
      <span aria-hidden="true" style={{ backgroundColor: c.bg, borderColor: c.border.replace('0.6', '0.33') }} className="flex size-[42px] shrink-0 items-center justify-center rounded-[11px] border-[1.25px] text-xl">{c.icon}</span>
      <div className="min-w-0"><h2 className="font-display text-sm leading-[18.2px] font-bold break-words">{place.placeName}</h2>
        <p className="flex flex-wrap gap-1.5 pt-1"><span style={{ backgroundColor: c.bg, color: c.tag }} className="rounded-full px-[7px] py-0.5 text-[10px] leading-[15px] font-semibold">{place.category.name}</span><span style={{ backgroundColor: s.bg, color: s.text }} className="rounded-full px-[7px] py-0.5 text-[10px] leading-[15px] font-semibold">● {s.label}</span></p>
      </div>
    </div>
    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
      {place.isPopular && <span className="rounded-full border-[1.25px] border-[#fde68a] bg-[#fef3c7] px-[7px] py-0.5 text-[10px] leading-[15px] font-bold text-[#b45309]">⭐ Popular</span>}
      <CardMenu label={`Actions for ${place.placeName}`} items={actions} disabled={disabled} />
    </div>
    {place.description && <p className="pt-2.5 text-xs leading-[18.6px] text-[#68728a]">{place.description}</p>}
    <dl className="mt-auto grid grid-cols-2 gap-1.5 pt-2.5">{details.map(([label, value]) => <div key={label} className="rounded-lg border-[1.25px] border-[#e5e8f0] bg-[#f7f8fc] px-2.5 py-[7px]"><dt className="text-[10px] leading-[15px] text-[#68728a]">{label}</dt><dd className="truncate pt-px text-[11px] leading-[16.5px] font-semibold" title={value}>{value}</dd></div>)}</dl>
  </article>
}

/** The card's "···" button opens the same actions as the table menu. */
function CardMenu({ label, items, disabled }: { label: string; items: { label: string; onSelect: () => void; danger?: boolean }[]; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  return <div className="relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false) }} onKeyDown={event => { if (event.key === 'Escape') setOpen(false) }}>
    <button type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} disabled={disabled} onClick={() => setOpen(previous => !previous)} className="flex h-[28.5px] w-[29px] items-center justify-center rounded-[7px] border-[1.25px] border-[#e5e8f0] bg-white text-xs text-[#68728a] hover:bg-[#f7f8fc] focus-visible:outline-2 disabled:opacity-50">···</button>
    {open && <div role="menu" className="absolute right-0 z-30 mt-1 min-w-[140px] overflow-hidden rounded-[10px] border-[1.25px] border-[#e5e8f0] bg-white py-1 shadow-lg">{items.map(item => <button key={item.label} type="button" role="menuitem" onClick={() => { setOpen(false); item.onSelect() }} className={`block w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-[#f7f8fc] focus-visible:bg-[#f7f8fc] focus-visible:outline-none ${item.danger ? 'text-[#dc2626]' : 'text-[#17213c]'}`}>{item.label}</button>)}</div>}
  </div>
}
