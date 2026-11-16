import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Map as MapIcon, X } from 'lucide-react'
import Modal from '../ui/Modal'
import type { Building, BuildingListItem, BuildingStatus, CampusCategory, CampusFacility, CampusMap, CampusPlace, CampusSite, MapMarker, PlaceStatus } from '../../types/campus'
import { getCampusMap, getCampusCategories, getCampusFacilities, getCampusSites } from '../../services/campusMapService'
import { getAllBuildings, getBuildingById } from '../../services/buildingService'
import { getCampusPlaceById } from '../../services/campusPlaceService'
import { buildingStatuses, campusError, categoryVisual, edgeStatuses, placeStatuses, project } from '../../utils/campusApi'
import { Badge, CodeChip, PageHeader, SearchInput, SuccessToast, primaryButton, secondaryButton } from './CampusUi'
import { BuildingForm, PlaceForm } from './CampusForms'

// Figma node 121:2466 (Campus Map Screen). Custom SVG/CSS map; no map library.
const describe = (error: unknown) => campusError(error, 'Location not found.')
type MapNode = CampusMap['navigationNodes'][number]
type DrawerState = { kind: 'building'; building?: Building } | { kind: 'place'; place?: CampusPlace }
const markerKey = (marker: MapMarker) => `${marker.entityType}-${marker.id}`
const ZOOM_MIN = 1, ZOOM_MAX = 4

/** Rounds to 1/2/5 × 10ⁿ for the "~ 200 m" scale pill. */
function niceDistance(meters: number) {
  const power = 10 ** Math.floor(Math.log10(meters))
  const step = [1, 2, 5, 10].find(n => n * power >= meters / 1.5) ?? 10
  return step * power
}

export default function CampusMapContent({ onDrawerChange }: { onDrawerChange: (open: boolean) => void }) {
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ version: number; data?: CampusMap; error?: string } | null>(null)
  const [lookups, setLookups] = useState<{ sites: CampusSite[]; categories: CampusCategory[]; buildings: BuildingListItem[]; facilities: CampusFacility[] }>({ sites: [], categories: [], buildings: [], facilities: [] })
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')
  // Layer visibility is display-only state (no backend preference API). Defaults follow Figma.
  const [layers, setLayers] = useState({ buildings: true, places: true, nodes: false, routes: true })
  const [selected, setSelected] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [choosing, setChoosing] = useState(false)
  const [drawer, setDrawer] = useState<DrawerState | null>(null)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const surface = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getCampusMap({}, controller.signal)
      .then(data => { if (!controller.signal.aborted) setResult({ version, data }) })
      .catch(error => { if (!controller.signal.aborted) setResult({ version, error: describe(error) }) })
    return () => controller.abort()
  }, [version])

  // Options for Add Location (building and campus place forms); refreshed after each save.
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([getCampusSites(controller.signal), getCampusCategories(controller.signal), getAllBuildings(controller.signal), getCampusFacilities(controller.signal)])
      .then(([sites, categories, buildings, facilities]) => { if (!controller.signal.aborted) setLookups({ sites, categories, buildings, facilities }) })
      .catch(() => undefined)
    return () => controller.abort()
  }, [version])

  useEffect(() => {
    const element = surface.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setSize({ width: Math.round(entry.contentRect.width), height: Math.round(entry.contentRect.height) }))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const current = result?.version === version ? result : null
  const data = current?.data
  const markers = data ? [...data.buildings, ...data.places] : []
  const nodes = data?.navigationNodes ?? []
  const refresh = () => setVersion(previous => previous + 1)
  const dismiss = useCallback(() => setMessage(''), [])
  function openDrawer(next: DrawerState | null) { setDrawer(next); onDrawerChange(!!next) }
  const saved = (name: string, operation: 'created' | 'updated', warning?: string) => { openDrawer(null); setSelected(null); refresh(); setMessage(`${name} was ${operation} successfully.${warning ? ` ${warning}` : ''}`) }
  function edit(marker: MapMarker) {
    setActionError('')
    const load = marker.entityType === 'BUILDING' ? getBuildingById(marker.id).then(building => openDrawer({ kind: 'building', building })) : getCampusPlaceById(marker.id).then(place => openDrawer({ kind: 'place', place }))
    load.catch(error => setActionError(describe(error)))
  }

  // Type list comes from backend marker categories ("Building" for buildings, place category names otherwise).
  const order = ['Building', ...lookups.categories.map(c => c.categoryName)]
  const typeNames = [...new Set(markers.map(m => m.category))].sort((a, b) => (order.indexOf(a) + 1 || 999) - (order.indexOf(b) + 1 || 999) || a.localeCompare(b))
  const term = search.trim().toLowerCase()
  const matching = markers.filter(m => (m.entityType === 'BUILDING' ? layers.buildings : layers.places)
    && (!selectedType || m.category === selectedType)
    && (!term || m.name.toLowerCase().includes(term) || m.code.toLowerCase().includes(term)))

  // One projection for every layer, so toggling layers or filters never moves markers.
  const { width, height } = size
  const base = project<MapMarker | MapNode>([...markers, ...nodes], item => item, width || 1, height || 1, Math.min(110, Math.max(40, Math.min(width, height) * 0.12)))
  const center = { x: width / 2, y: height / 2 }
  const view = (p: { x: number; y: number }) => ({ x: center.x + (p.x - center.x) * zoom + offset.x, y: center.y + (p.y - center.y) * zoom + offset.y })
  const placed = new Map(base.points.map(p => [`${p.item.entityType}-${p.item.id}`, view(p)]))
  const visible = matching.flatMap(marker => { const at = placed.get(markerKey(marker)); return at ? [{ marker, at }] : [] })
  const unmappedMatching = matching.length - visible.length
  const locate = base.at
  const edges = layers.routes && locate ? (data?.navigationEdges ?? []).map(edge => ({ edge, line: edge.geometry.filter(c => c.latitude != null && c.longitude != null).map(c => view(locate(Number(c.latitude), Number(c.longitude)))) })).filter(e => e.line.length > 1) : []
  const scaleMeters = base.metersPerPixel ? niceDistance((base.metersPerPixel / zoom) * 62) : null
  const selectedMarker = markers.find(m => markerKey(m) === selected) ?? null
  const selectedPoint = selectedMarker ? placed.get(markerKey(selectedMarker)) : undefined

  function setZoomLevel(next: number) {
    const value = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next))
    setZoom(value)
    if (value === 1) setOffset({ x: 0, y: 0 })
    else setOffset(previous => ({ x: previous.x * (value / zoom), y: previous.y * (value / zoom) }))
  }
  function startPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (zoom === 1 || (event.target as HTMLElement).closest('button')) return
    drag.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function movePan(event: ReactPointerEvent<HTMLDivElement>) {
    const start = drag.current
    if (start) setOffset({ x: start.ox + event.clientX - start.x, y: start.oy + event.clientY - start.y })
  }

  const layerRows: { key: keyof typeof layers; icon: string; label: string }[] = [
    { key: 'buildings', icon: '🏛️', label: 'Buildings' }, { key: 'places', icon: '📍', label: 'Campus Places' },
    { key: 'nodes', icon: '🔵', label: 'Navigation Nodes' }, { key: 'routes', icon: '🚶', label: 'Walking Routes' },
  ]
  const sectionTitle = 'text-[10px] leading-[15px] font-bold tracking-[0.8px] text-[#68728a] uppercase'

  return <main className="flex min-w-0 flex-col text-[#17213c] lg:h-[calc(100dvh-64px)] lg:min-h-[720px]">
    <PageHeader title="Campus Map" description="Interactive map for mobile navigation data management"
      actions={<>
        <button type="button" onClick={() => setChoosing(true)} disabled={!!drawer} className={`${primaryButton} px-[18px]`}><img src="/assets/figma/faculty-plus.svg" width="15" height="15" alt="" />Add Location</button>
        <button type="button" onClick={() => navigate('/admin/navigation-routes')} className={`${secondaryButton} px-[18px]`}><MapIcon size={15} aria-hidden="true" />Manage Routes</button>
      </>} />
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <aside aria-label="Map controls" className="flex shrink-0 flex-col border-b-[1.25px] border-[#e5e8f0] bg-white lg:w-[240px] lg:overflow-y-auto lg:border-r-[1.25px] lg:border-b-0">
        <div className="px-3.5 pt-3.5 pb-2.5"><SearchInput label="Search locations" placeholder="Search locations…" className="" value={search} onChange={value => { setSearch(value); setSelected(null) }} /></div>
        <section aria-labelledby="map-layers" className="border-b-[1.25px] border-[#e5e8f0] px-3.5 pb-3.5">
          <h2 id="map-layers" className={sectionTitle}>Map Layers</h2>
          <div className="space-y-0.5 pt-2">{layerRows.map(row => { const on = layers[row.key]; return <button key={row.key} type="button" role="switch" aria-checked={on} onClick={() => setLayers(previous => ({ ...previous, [row.key]: !previous[row.key] }))}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left focus-visible:outline-2 ${on ? 'bg-[rgba(39,50,56,0.06)]' : 'hover:bg-[#f7f8fc]'}`}>
            <span aria-hidden="true" className="text-[15px] leading-[22.5px]">{row.icon}</span>
            <span className={`flex-1 text-xs leading-[18px] font-medium ${on ? 'text-[#273238]' : 'text-[#17213c]'}`}>{row.label}</span>
            <span aria-hidden="true" className={`relative h-5 w-9 shrink-0 rounded-[10px] ${on ? 'bg-[#273238]' : 'bg-[#e5e8f0]'}`}><span className={`absolute top-[2px] size-4 rounded-full bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] ${on ? 'left-[18px]' : 'left-[2px]'}`} /></span>
          </button> })}</div>
        </section>
        <section aria-labelledby="map-types" className="flex-1 border-b-[1.25px] border-[#e5e8f0] px-3.5 py-3">
          <h2 id="map-types" className={sectionTitle}>Filter by Type</h2>
          <div className="space-y-0.5 pt-2">{[{ name: '', label: 'All', icon: '🗺️', count: markers.length }, ...typeNames.map(name => ({ name, label: name, icon: categoryVisual(name).icon, count: markers.filter(m => m.category === name).length }))].map(type => { const on = selectedType === type.name; return <button key={type.name || 'all'} type="button" aria-pressed={on} onClick={() => { setSelectedType(type.name); setSelected(null) }}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-[7px] text-left focus-visible:outline-2 ${on ? 'bg-[rgba(39,50,56,0.06)]' : 'hover:bg-[#f7f8fc]'}`}>
            <span aria-hidden="true" className="text-sm leading-[21px]">{type.icon}</span>
            <span className={`min-w-0 flex-1 truncate text-xs leading-[18px] ${on ? 'font-semibold text-[#273238]' : 'text-[#17213c]'}`}>{type.label}</span>
            <span className={`rounded-[20px] px-1.5 py-px text-[10px] leading-[15px] font-semibold ${on ? 'bg-[rgba(39,50,56,0.13)] text-[#273238]' : 'bg-[#f7f8fc] text-[#68728a]'}`}>{current ? type.count : '—'}</span>
          </button> })}</div>
        </section>
        <section aria-labelledby="map-summary" className="px-3.5 py-3">
          <h2 id="map-summary" className={sectionTitle}>Summary</h2>
          <dl className="pt-2">{[{ label: 'Total Locations', value: data?.summary.totalLocations, tone: 'text-[#273238]' }, { label: 'Active', value: data?.summary.activeLocations, tone: 'text-[#059669]' }, { label: 'Inactive', value: data?.summary.inactiveLocations, tone: 'text-[#9ca3af]' }].map(row => <div key={row.label} className="flex items-center justify-between py-[5px]">
            <dt className="text-xs leading-[18px] text-[#68728a]">{row.label}</dt><dd className={`text-[13px] leading-[19.5px] font-bold ${row.tone}`}>{row.value ?? '—'}</dd>
          </div>)}</dl>
        </section>
      </aside>
      <section aria-label="Campus map" onKeyDown={event => { if (event.key === 'Escape') setSelected(null) }} className="relative h-[540px] min-w-0 overflow-hidden bg-linear-[160deg,#e9f5f9,#d6edf5_55%,#c7e7f1] lg:h-auto lg:flex-1">
        <div ref={surface} onPointerDown={startPan} onPointerMove={movePan} onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }} className={`absolute inset-0 touch-none ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}>
          {/* Decorative campus backdrop recreated from the Figma map layers. */}
          <svg aria-hidden="true" width="100%" height="100%" className="pointer-events-none absolute inset-0">
            <line x1="20%" y1="0" x2="80%" y2="100%" stroke="#b9d3df" strokeWidth="1.25" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#c6dbe6" strokeWidth="3" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#c6dbe6" strokeWidth="3" />
            <ellipse cx="50%" cy="50%" rx="42%" ry="40%" fill="none" stroke="#5f6b7a" strokeOpacity="0.55" strokeWidth="1.25" strokeDasharray="8 6" />
            <ellipse cx="50%" cy="50%" rx="6%" ry="5%" fill="#a7f3d0" fillOpacity="0.75" />
            <ellipse cx="30%" cy="35%" rx="4%" ry="3%" fill="#a7f3d0" fillOpacity="0.55" />
            <ellipse cx="65%" cy="65%" rx="5%" ry="4%" fill="#a7f3d0" fillOpacity="0.6" />
          </svg>
          {width > 0 && <svg aria-hidden="true" width={width} height={height} className="pointer-events-none absolute inset-0">
            {edges.map(({ edge, line }) => { const s = edgeStatuses[edge.status]; return <polyline key={edge.id} points={line.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={s.line} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={s.dash ? '6 5' : undefined} opacity="0.85" /> })}
            {layers.nodes && base.points.filter(p => p.item.entityType === 'NAV_NODE').map(p => { const node = p.item as MapNode, at = view(p); return <circle key={node.id} cx={at.x} cy={at.y} r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" opacity={node.isActive ? 1 : 0.5}><title>{node.name}</title></circle> })}
          </svg>}
          {visible.map(({ marker, at }) => { const c = categoryVisual(marker.category), on = selected === markerKey(marker); return <button key={markerKey(marker)} type="button"
            aria-label={`${marker.name}, ${marker.category}${marker.status === 'ACTIVE' ? '' : `, ${marker.status.toLowerCase().replace(/_/g, ' ')}`}. View location details`} aria-pressed={on} title={marker.name}
            onClick={() => setSelected(on ? null : markerKey(marker))} style={{ left: at.x, top: at.y }}
            className={`absolute z-10 flex -translate-x-1/2 translate-y-[calc(-100%+3px)] flex-col items-center rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-2 ${marker.status === 'ACTIVE' ? '' : 'opacity-50'} ${on ? 'z-20' : ''}`}>
            <span style={{ backgroundColor: c.bg, borderColor: c.border }} className={`flex size-9 items-center justify-center rounded-[10px] border-[2.5px] text-lg leading-[27px] drop-shadow-[0px_2px_4px_rgba(0,0,0,0.14)] ${on ? 'ring-2 ring-[#273238] ring-offset-1' : ''}`}><span aria-hidden="true">{c.icon}</span></span>
            <span aria-hidden="true" style={{ backgroundColor: c.border.replace('0.6)', '0.53)') }} className="h-2 w-0.5" />
            <span aria-hidden="true" style={{ backgroundColor: c.border.replace('0.6)', '0.53)') }} className="size-1.5 rounded-[3px]" />
          </button> })}
        </div>
        {data && <p className="pointer-events-none absolute top-4 left-1/2 z-30 max-w-[calc(100%-120px)] -translate-x-1/2 truncate rounded-[20px] border-[1.25px] border-[#e5e8f0] bg-white/88 px-4 py-[5px] text-xs leading-[18px] font-bold tracking-[0.48px] text-[#273238] backdrop-blur-[6px]">{data.site.name}</p>}
        <div className="absolute top-[60px] right-4 z-30 flex flex-col gap-0.5">
          {[{ label: 'Zoom in', text: '+', next: zoom * 1.25, off: zoom >= ZOOM_MAX }, { label: 'Zoom out', text: '–', next: zoom / 1.25, off: zoom <= ZOOM_MIN }].map(control => <button key={control.label} type="button" aria-label={control.label} disabled={control.off} onClick={() => setZoomLevel(control.next)}
            className="flex size-8 items-center justify-center rounded-lg border-[1.25px] border-[#e5e8f0] bg-white text-base leading-6 font-bold text-[#17213c] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#f7f8fc] focus-visible:outline-2 disabled:opacity-50">{control.text}</button>)}
        </div>
        <div className="pointer-events-none absolute bottom-4 left-4 z-30 flex items-end gap-2.5">
          <span role="img" aria-label="Compass: north is up" className="flex size-11 items-center justify-center rounded-full border-[1.25px] border-[#e5e8f0] bg-white text-xl drop-shadow-[0px_2px_4px_rgba(0,0,0,0.12)]">🧭</span>
          {scaleMeters != null && <span title="Approximate map distance across this label" className="rounded-lg border-[1.25px] border-[#e5e8f0] bg-white px-2.5 py-1 text-[10px] leading-[15px] font-medium text-[#68728a] drop-shadow-[0px_2px_4px_rgba(0,0,0,0.1)]">~ {scaleMeters >= 1000 ? `${scaleMeters / 1000} km` : `${scaleMeters} m`}</span>}
        </div>
        <div className="pointer-events-none absolute right-4 bottom-4 z-30 w-[200px] rounded-[10px] border-[1.25px] border-[#e5e8f0] bg-white/90 px-3.5 py-2 text-[11px] leading-[16.5px] text-[#68728a] backdrop-blur-[6px]">
          <p>Click a marker to view location details</p>
          {current && unmappedMatching > 0 && <p className="pt-1 text-[#b45309]">{unmappedMatching} location{unmappedMatching === 1 ? '' : 's'} not shown: no map coordinates yet.</p>}
        </div>
        {!current ? <p role="status" className="absolute inset-x-0 top-1/2 z-30 mx-auto w-fit -translate-y-1/2 rounded-xl bg-white/90 px-4 py-2.5 text-sm text-[#68728a]">Loading campus map…</p>
          : current.error ? <div role="alert" className="absolute inset-x-4 top-1/2 z-30 mx-auto max-w-sm -translate-y-1/2 rounded-xl border border-[#e5e8f0] bg-white p-4 text-center text-sm text-[#68728a] shadow-lg"><p>{current.error}</p><button type="button" onClick={refresh} className="mt-3 rounded-xl border border-[#e5e8f0] px-4 py-2 font-semibold focus-visible:outline-2">Retry</button></div>
            : !matching.length ? <p role="status" className="absolute inset-x-4 top-1/2 z-30 mx-auto w-fit max-w-sm -translate-y-1/2 rounded-xl bg-white/90 px-4 py-2.5 text-center text-sm text-[#68728a]">{markers.length ? 'No locations match the current search, layers or type.' : 'No campus locations yet. Use Add Location to create one.'}</p>
              : !base.points.length && <p role="status" className="absolute inset-x-4 top-1/2 z-30 mx-auto w-fit max-w-sm -translate-y-1/2 rounded-xl bg-white/90 px-4 py-2.5 text-center text-sm text-[#68728a]">No locations have map coordinates yet. Positions come from navigation nodes linked to each location.</p>}
        {selectedMarker && selectedPoint && <LocationPopup marker={selectedMarker} point={selectedPoint} width={width} disabled={!!drawer} error={actionError} onEdit={() => edit(selectedMarker)} onClose={() => { setSelected(null); setActionError('') }} />}
      </section>
    </div>
    {choosing && <Modal title="Add Location" onClose={() => setChoosing(false)}>
      <p className="text-sm leading-6 text-[#68728a]">Choose what kind of campus location to add. It appears on the map once a navigation node is linked to it.</p>
      <div className="mt-5 grid gap-3 min-[400px]:grid-cols-2">
        {([['building', '🏛️', 'Building', 'Academic and service buildings'], ['place', '📍', 'Campus Place', 'Library, cafeteria, offices and other points']] as const).map(([kind, icon, label, hint]) => <button key={kind} type="button" onClick={() => { setChoosing(false); openDrawer({ kind }) }}
          className="rounded-xl border-[1.25px] border-[#e5e8f0] p-4 text-left hover:border-[#273238] hover:bg-[#f7f8fc] focus-visible:outline-2"><span aria-hidden="true" className="text-2xl">{icon}</span><span className="block pt-2 text-sm font-semibold text-[#17213c]">{label}</span><span className="block text-xs text-[#68728a]">{hint}</span></button>)}
      </div>
    </Modal>}
    {drawer?.kind === 'building' && <BuildingForm key={drawer.building?.id ?? 'new-building'} building={drawer.building} sites={lookups.sites} onClose={() => openDrawer(null)} onSaved={saved} />}
    {drawer?.kind === 'place' && <PlaceForm key={drawer.place?.id ?? 'new-place'} place={drawer.place} {...lookups} onClose={() => openDrawer(null)} onSaved={saved} />}
    <SuccessToast message={message} onDismiss={dismiss} />
  </main>
}

function LocationPopup({ marker, point, width, disabled, error, onEdit, onClose }: { marker: MapMarker; point: { x: number; y: number }; width: number; disabled: boolean; error: string; onEdit: () => void; onClose: () => void }) {
  const c = categoryVisual(marker.category)
  const status = marker.entityType === 'BUILDING' ? buildingStatuses[marker.status as BuildingStatus] : placeStatuses[marker.status as PlaceStatus]
  const above = point.y > 260
  const left = Math.min(Math.max(point.x - 130, 8), Math.max(8, width - 268))
  return <div role="dialog" aria-label={`${marker.name} details`} style={{ left, top: above ? point.y - 58 : point.y + 12 }}
    className={`absolute z-40 w-[260px] rounded-[14px] border-[1.25px] border-[#e5e8f0] bg-white p-3.5 shadow-lg ${above ? '-translate-y-full' : ''}`}>
    <div className="flex items-start gap-2.5">
      <span aria-hidden="true" style={{ backgroundColor: c.bg, borderColor: c.border }} className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border-[2px] text-lg">{c.icon}</span>
      <div className="min-w-0 flex-1"><h2 className="font-display text-sm leading-[18px] font-bold break-words text-[#17213c]">{marker.name}</h2><p style={{ color: c.tag }} className="pt-0.5 text-[11px] font-semibold">{marker.category}</p></div>
      <button type="button" aria-label="Close location details" onClick={onClose} className="rounded-md p-1 text-[#68728a] hover:bg-[#f7f8fc] focus-visible:outline-2"><X size={14} /></button>
    </div>
    <dl className="mt-3 space-y-1.5 text-xs">
      <div className="flex items-center justify-between gap-2"><dt className="text-[#68728a]">Code</dt><dd><CodeChip>{marker.code}</CodeChip></dd></div>
      <div className="flex items-center justify-between gap-2"><dt className="text-[#68728a]">Status</dt><dd>{status ? <Badge bg={status.bg} text={status.text} dot>{status.label}</Badge> : marker.status}</dd></div>
      <div className="flex items-center justify-between gap-2"><dt className="text-[#68728a]">Navigation</dt><dd className="font-semibold">{marker.canNavigate ? 'Students can navigate here' : 'Not navigable yet'}</dd></div>
    </dl>
    {error && <p role="alert" className="mt-2 text-xs text-[#d80255]">{error}</p>}
    <button type="button" disabled={disabled} onClick={onEdit} className={`${secondaryButton} mt-3 w-full py-1.5 text-xs`}>Edit {marker.entityType === 'BUILDING' ? 'Building' : 'Campus Place'}</button>
  </div>
}
