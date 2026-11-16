import { useCallback, useEffect, useState, type KeyboardEvent } from 'react'
import { CirclePlus, ExternalLink, ShieldCheck } from 'lucide-react'
import type { CampusSite, NavigationNode, NavigationRoute, NodeType, RouteStatistics } from '../../types/campus'
import { deleteNavigationNode, deleteRoute, getNavigationNodeById, getNavigationNodes, getRouteById, getRouteStatistics, getRoutes, type RouteFilter } from '../../services/navigationRouteService'
import { getCampusSites } from '../../services/campusMapService'
import { campusError, edgeStatuses, formatDistance, nodeTypes, project, surfaceTypes } from '../../utils/campusApi'
import { Badge, CampusTable, CodeChip, ConfirmDelete, DetailsModal, PageHeader, SerialChip, SuccessToast, SummaryCards, TableState, primaryButton, secondaryButton } from './CampusUi'
import { NodeForm, RouteForm } from './CampusForms'
import { DestinationsSection, GraphCheckModal } from './NavigationDestinations'
import TablePagination from '../ui/TablePagination'
import { usePagedRows } from '../../hooks/usePagedRows'

// Figma node 121:5185 (Navigation Screen).
const describe = (error: unknown) => campusError(error, 'Navigation record not found.')
const routeFilters: { value: RouteFilter; label: string }[] = [
  { value: 'ALL', label: 'All' }, { value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' },
  { value: 'UNDER_CONSTRUCTION', label: 'Under Construction' }, { value: 'ACCESSIBLE', label: '♿ Accessible' },
]
type DrawerState = { kind: 'node'; node?: NavigationNode } | { kind: 'route'; route?: NavigationRoute }
type DeleteState = { kind: 'node' | 'route'; id: number; name: string }

export default function NavigationRoutesContent({ onDrawerChange }: { onDrawerChange: (open: boolean) => void }) {
  const [filter, setFilter] = useState<RouteFilter>('ALL')
  const [version, setVersion] = useState(0)
  const [routes, setRoutes] = useState<{ key: string; rows?: NavigationRoute[]; error?: string } | null>(null)
  const [nodes, setNodes] = useState<{ version: number; rows?: NavigationNode[]; error?: string } | null>(null)
  const [stats, setStats] = useState<{ version: number; data?: RouteStatistics; error?: string } | null>(null)
  const [sites, setSites] = useState<CampusSite[]>([])
  const [drawer, setDrawer] = useState<DrawerState | null>(null)
  const [viewingNode, setViewingNode] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<DeleteState | null>(null)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [destinationDrawer, setDestinationDrawer] = useState(false)
  const [checking, setChecking] = useState(false)
  const key = JSON.stringify([filter, version])

  // One route request feeds both the graph lines and the route table.
  useEffect(() => {
    const controller = new AbortController()
    getRoutes(filter, controller.signal)
      .then(rows => { if (!controller.signal.aborted) setRoutes({ key, rows }) })
      .catch(error => { if (!controller.signal.aborted) setRoutes({ key, error: describe(error) }) })
    return () => controller.abort()
  }, [filter, key])

  useEffect(() => {
    const controller = new AbortController()
    getNavigationNodes(controller.signal)
      .then(rows => { if (!controller.signal.aborted) setNodes({ version, rows }) })
      .catch(error => { if (!controller.signal.aborted) setNodes({ version, error: describe(error) }) })
    getRouteStatistics(controller.signal)
      .then(data => { if (!controller.signal.aborted) setStats({ version, data }) })
      .catch(error => { if (!controller.signal.aborted) setStats({ version, error: describe(error) }) })
    return () => controller.abort()
  }, [version])

  useEffect(() => {
    const controller = new AbortController()
    getCampusSites(controller.signal).then(rows => { if (!controller.signal.aborted) setSites(rows) }).catch(() => undefined)
    return () => controller.abort()
  }, [])

  const currentRoutes = routes?.key === key ? routes : null
  const currentNodes = nodes?.version === version ? nodes : null
  const totals = stats?.version === version ? stats : null
  const rows = currentRoutes?.rows ?? []
  const nodeRows = currentNodes?.rows ?? []
  const pagedRoutes = usePagedRows(rows, filter)
  // Every node or route mutation refetches nodes, routes and statistics together.
  const refresh = () => setVersion(previous => previous + 1)
  const dismiss = useCallback(() => setMessage(''), [])
  function openDrawer(next: DrawerState | null) { setDrawer(next); onDrawerChange(!!next) }
  const destinationDrawerChange = useCallback((open: boolean) => { setDestinationDrawer(open); onDrawerChange(open) }, [onDrawerChange])
  const busy = !!drawer || destinationDrawer
  const saved = (name: string, operation: 'created' | 'updated') => { openDrawer(null); refresh(); setMessage(`${name} was ${operation} successfully.`) }
  const editRoute = (id: number) => { setActionError(''); getRouteById(id).then(route => openDrawer({ kind: 'route', route })).catch(error => setActionError(describe(error))) }
  const graphLoading = !currentNodes || !currentRoutes
  const graphError = currentNodes?.error || currentRoutes?.error

  return <main className="min-w-0 text-[#17213c]">
    <PageHeader title="Navigation Routes" description="Manage campus walking graph — nodes and paths used by the student mobile navigation"
      actions={<>
        <button type="button" onClick={() => setChecking(true)} disabled={busy} className={secondaryButton}><ShieldCheck size={14} aria-hidden="true" />Check Graph</button>
        <button type="button" onClick={() => openDrawer({ kind: 'node' })} disabled={busy} className={secondaryButton}><CirclePlus size={14} aria-hidden="true" />Add Node</button>
        <button type="button" onClick={() => openDrawer({ kind: 'route' })} disabled={busy} className={`${primaryButton} px-4`}><ExternalLink size={14} aria-hidden="true" />Connect Nodes</button>
      </>}>
      <SummaryCards label="Route summary" error={totals?.error} onRetry={refresh} items={[
        { label: 'Total Routes', value: totals?.data?.totalEdges, tone: 'neutral' },
        { label: 'Active', value: totals?.data?.activeEdges, tone: 'green' },
        { label: 'Accessible', value: totals?.data?.wheelchairAccessibleEdges, tone: 'violet' },
        { label: 'Under Construction', value: totals?.data?.underConstructionEdges, tone: 'amber' },
      ]} />
    </PageHeader>
    <div className="flex flex-wrap items-center gap-2.5 border-b-[1.25px] border-[#e5e8f0] bg-white px-4 py-2.5 sm:px-5">
      <p id="route-filter-label" className="text-xs leading-[18px] font-semibold">Filter Routes:</p>
      <div role="group" aria-labelledby="route-filter-label" className="flex flex-wrap gap-2.5">
        {routeFilters.map(option => { const on = filter === option.value; return <button key={option.value} type="button" aria-pressed={on} onClick={() => setFilter(option.value)}
          className={`rounded-[20px] border-[1.25px] px-3 py-[5px] text-xs leading-[18px] font-semibold focus-visible:outline-2 ${on ? 'border-[#273238] bg-[#273238] text-white' : 'border-[#e5e8f0] bg-[#f7f8fc] text-[#68728a] hover:text-[#273238]'}`}>{option.label}</button> })}
      </div>
      <ul aria-label="Legend" className="flex flex-wrap items-center gap-3.5 text-[11px] leading-[16.5px] text-[#68728a] sm:ml-auto">
        {(Object.keys(edgeStatuses) as (keyof typeof edgeStatuses)[]).map(status => <li key={status} className="flex items-center gap-[5px]">
          <svg width="24" height="6" aria-hidden="true"><line x1="0" y1="3" x2="24" y2="3" stroke={edgeStatuses[status].line} strokeWidth="2.5" strokeDasharray={edgeStatuses[status].dash ? '4 3' : undefined} /></svg>{edgeStatuses[status].label}
        </li>)}
        <li className="flex items-center gap-1"><span aria-hidden="true" className="size-2.5 rounded-[5px] border-[1.25px] border-[#273238] bg-[#273238]" />♿ Accessible</li>
      </ul>
    </div>
    <div className="px-4 pt-4 pb-6 sm:px-5">
      {actionError && <p role="alert" className="mb-3 text-[13px] text-[#d80255]">{actionError} <button type="button" onClick={() => setActionError('')} className="underline">Dismiss</button></p>}
      <section aria-label="Navigation graph" className="overflow-hidden rounded-[14px] border-[1.25px] border-[#e5e8f0] bg-[#e8f4f8]">
        {graphError ? <div role="alert" className="px-4 py-16 text-center text-sm text-[#68728a]"><p>{graphError}</p><button type="button" onClick={refresh} className="mt-3 rounded-xl border border-[#e5e8f0] bg-white px-4 py-2 font-semibold focus-visible:outline-2">Retry</button></div>
          : graphLoading ? <p role="status" className="px-4 py-16 text-center text-sm text-[#68728a]">Loading navigation graph…</p>
            : !nodeRows.length ? <p role="status" className="px-4 py-16 text-center text-sm text-[#68728a]">No navigation nodes yet. Use Add Node to create the first point of the walking graph.</p>
              : <NavigationGraph nodes={nodeRows} routes={rows} disabled={busy} onSelect={setViewingNode} />}
      </section>
      <div className="mt-4">
        <CampusTable title="Route List" label="Route list table" caption="Row numbers, route codes, start and end nodes, distance, walk time, accessibility, surface, status and actions" minWidth={1100}
          headers={['No.', 'Route Code', 'Start Node', 'End Node', 'Distance', 'Walk Time', 'Accessible', 'Surface', 'Status', 'Actions']}
          state={<TableState loading={!currentRoutes} error={currentRoutes?.error} empty={!rows.length} loadingText="Loading routes…" emptyText="No routes found." onRetry={refresh} />}>
          {pagedRoutes.rows.map((route, index) => { const s = edgeStatuses[route.status]; return <tr key={route.id}>
            <td className="px-3 py-2.5"><SerialChip value={pagedRoutes.offset + index + 1} /></td>
            <td className="px-3 py-2.5"><CodeChip>{route.edgeCode}</CodeChip></td>
            <th scope="row" className="px-3 py-2.5 text-xs font-normal">{route.startNode.name}</th>
            <td className="px-3 py-2.5 text-xs">{route.endNode.name}{!route.isBidirectional && <span className="block text-[10px] text-[#68728a]">One-way</span>}</td>
            <td className="px-3 py-2.5 text-xs">{formatDistance(route.distanceMeters)}</td>
            <td className="px-3 py-2.5 text-xs">{route.walkTimeMinutes == null ? '—' : `${route.walkTimeMinutes} min`}</td>
            <td className="px-3 py-2.5">{route.isWheelchairAccessible ? <span className="text-sm"><span aria-hidden="true">♿</span><span className="sr-only">Yes</span></span> : <span className="text-[11px] text-[#9ca3af]">No</span>}</td>
            <td className="px-3 py-2.5 text-[11px] leading-[16.5px] text-[#68728a]">{surfaceTypes[route.surfaceType]}</td>
            <td className="px-3 py-2.5"><Badge bg={s.bg} text={s.text} dot>{s.label}</Badge></td>
            <td className="px-3 py-2.5"><div className="flex gap-[5px]">
              <button type="button" disabled={busy} onClick={() => editRoute(route.id)} aria-label={`Edit route ${route.edgeCode}`} className="h-[27px] rounded-md border-[1.25px] border-[#e5e8f0] bg-white px-2.5 text-[11px] text-[#17213c] hover:bg-[#f7f8fc] focus-visible:outline-2 disabled:opacity-50">Edit</button>
              <button type="button" disabled={busy} onClick={() => setDeleting({ kind: 'route', id: route.id, name: route.edgeCode })} aria-label={`Delete route ${route.edgeCode}`} className="h-[27px] rounded-md border-[1.25px] border-[#fca5a5] px-2 text-[11px] text-[#ef4444] hover:bg-[#fef2f2] focus-visible:outline-2 disabled:opacity-50">✕</button>
            </div></td>
          </tr> })}
        </CampusTable>
        {!currentRoutes?.error && <TablePagination label="Route pagination" noun="routes" paging={pagedRoutes} />}
        <DestinationsSection nodes={nodes?.rows ?? []} version={version} disabled={!!drawer} onDrawerChange={destinationDrawerChange} onChanged={refresh} />
      </div>
    </div>
    {checking && <GraphCheckModal onClose={() => setChecking(false)} />}
    {drawer?.kind === 'node' && <NodeForm key={drawer.node?.id ?? 'new-node'} node={drawer.node} sites={sites} onClose={() => openDrawer(null)} onSaved={saved} />}
    {/* Connect Nodes offers all nodes, not only the ones visible in the filtered graph. */}
    {drawer?.kind === 'route' && <RouteForm key={drawer.route?.id ?? 'new-route'} route={drawer.route} sites={sites} nodes={nodes?.rows ?? []} onClose={() => openDrawer(null)} onSaved={saved} />}
    {viewingNode != null && <DetailsModal<NavigationNode> title="Navigation Node" describeError={describe} load={signal => getNavigationNodeById(viewingNode, signal)} onClose={() => setViewingNode(null)}
      onEdit={data => { setViewingNode(null); openDrawer({ kind: 'node', node: data }) }} onDelete={data => { setViewingNode(null); setDeleting({ kind: 'node', id: data.id, name: data.nodeName }) }}
      rows={n => [['Node Code', <CodeChip key="c">{n.nodeCode}</CodeChip>], ['Name', n.nodeName], ['Type', nodeTypes[n.nodeType].label], ['Latitude', n.latitude], ['Longitude', n.longitude], ['♿ Accessible', n.isAccessible ? 'Yes' : 'No'], ['Status', n.isActive ? 'Active' : 'Inactive']]} />}
    {deleting && <ConfirmDelete title={deleting.kind === 'node' ? 'Delete node?' : 'Delete route?'} describeError={describe} onClose={() => setDeleting(null)}
      onConfirm={() => deleting.kind === 'node' ? deleteNavigationNode(deleting.id) : deleteRoute(deleting.id)}
      onDeleted={() => { setMessage(`${deleting.kind === 'node' ? 'Node' : 'Route'} ${deleting.name} was deleted successfully.`); setDeleting(null); refresh() }}>
      {deleting.kind === 'node'
        ? <>Delete node <strong className="text-[#17213c]">{deleting.name}</strong>? The backend refuses the delete while routes or navigation destinations still use this node.</>
        : <>Delete route <strong className="text-[#17213c]">{deleting.name}</strong>? Students will no longer be guided along this path.</>}
    </ConfirmDelete>}
    <SuccessToast message={message} onDismiss={dismiss} />
  </main>
}

// ---- Graph (SVG, no map library; layout comes from node latitude/longitude) ----

const WIDTH = 1463, HEIGHT = 946
const nodeStyles: Record<NodeType, { halo: string; haloOpacity: number; fill: string; stroke: string; r: number; haloR: number; icon: string; iconSize: number }> = {
  ENTRANCE: { halo: '#273238', haloOpacity: 0.14, fill: '#ffffff', stroke: '#273238', r: 30, haloR: 43, icon: '🏛', iconSize: 23.7 },
  GATE: { halo: '#273238', haloOpacity: 0.14, fill: '#273238', stroke: '#273238', r: 28, haloR: 41, icon: '🚪', iconSize: 25.8 },
  JUNCTION: { halo: '#64b5f6', haloOpacity: 0.28, fill: '#f0f9ff', stroke: '#64b5f6', r: 17, haloR: 30, icon: '', iconSize: 0 },
  POINT_OF_INTEREST: { halo: '#f97316', haloOpacity: 0.16, fill: '#ffffff', stroke: '#f97316', r: 26, haloR: 39, icon: '📍', iconSize: 23.7 },
  OTHER: { halo: '#68728a', haloOpacity: 0.16, fill: '#ffffff', stroke: '#68728a', r: 22, haloR: 34, icon: '•', iconSize: 22 },
}
const pillWidth = (text: string, perChar: number, pad: number) => text.length * perChar + pad
const shortLabel = (text: string) => (text.length > 14 ? `${text.slice(0, 13)}…` : text)

function NavigationGraph({ nodes, routes, disabled, onSelect }: { nodes: NavigationNode[]; routes: NavigationRoute[]; disabled: boolean; onSelect: (id: number) => void }) {
  const { points, missing, at } = project(nodes, node => node, WIDTH, HEIGHT, 110)
  const byId = new Map(points.map(point => [point.item.id, point]))
  const drawn = routes.flatMap(route => {
    const start = byId.get(route.startNode.id), end = byId.get(route.endNode.id)
    if (!start || !end || !at) return []
    const middle = route.intermediatePoints.filter(p => p.latitude != null && p.longitude != null).map(p => at(Number(p.latitude), Number(p.longitude)))
    const line = [start, ...middle, end].map(p => ({ x: p.x, y: p.y }))
    // Distance pill sits at the middle of the drawn path.
    const segment = Math.floor((line.length - 1) / 2), a = line[segment], b = line[segment + 1]
    return [{ route, line, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }]
  })
  const hidden = routes.length - drawn.length
  const keyOpen = (id: number) => (event: KeyboardEvent<SVGGElement>) => { if (!disabled && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onSelect(id) } }

  return <div>
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="group" aria-label={`Walking graph with ${points.length} nodes and ${drawn.length} routes`} className="block h-auto w-full min-w-[720px] font-sans">
        <line x1="0" y1={HEIGHT / 2} x2={WIDTH} y2={HEIGHT / 2} stroke="#d8e4eb" strokeWidth="3" />
        <line x1={WIDTH / 2} y1="0" x2={WIDTH / 2} y2={HEIGHT} stroke="#d8e4eb" strokeWidth="3" />
        {drawn.map(({ route, line }) => { const s = edgeStatuses[route.status]; return <polyline key={route.id} points={line.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={s.line} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={s.dash ? '12 10' : undefined}><title>{`${route.edgeCode}: ${route.startNode.name} → ${route.endNode.name}`}</title></polyline> })}
        {drawn.map(({ route, mid }) => { const text = `${Math.round(Number(route.distanceMeters))}m`, w = pillWidth(text, 10.6, 20); return <g key={`pill-${route.id}`} aria-hidden="true">
          <rect x={mid.x - w / 2} y={mid.y - 17} width={w} height="34" rx="17" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.25" />
          <text x={mid.x} y={mid.y + 7} textAnchor="middle" fontSize="19.36" fill="#64748b">{text}</text>
          {route.isWheelchairAccessible && <text x={mid.x} y={mid.y + 36} textAnchor="middle" fontSize="19.36" fill="#059669">♿</text>}
        </g> })}
        {points.map(({ item: node, x, y }) => { const v = nodeStyles[node.nodeType], label = shortLabel(node.nodeCode), w = pillWidth(label, 12.6, 22), labelY = y + v.r + 6; return <g key={node.id}
          role="button" tabIndex={disabled ? -1 : 0} aria-disabled={disabled || undefined} aria-label={`${node.nodeName} (${nodeTypes[node.nodeType].label}${node.isActive ? '' : ', inactive'}). Open node details`}
          onClick={() => { if (!disabled) onSelect(node.id) }} onKeyDown={keyOpen(node.id)} opacity={node.isActive ? 1 : 0.5} className="cursor-pointer outline-none [&:focus-visible>circle:first-of-type]:stroke-[#17213c] [&:focus-visible>circle:first-of-type]:stroke-[3]">
          <title>{node.nodeName}</title>
          <circle cx={x} cy={y} r={v.haloR} fill={v.halo} fillOpacity={v.haloOpacity} />
          <circle cx={x} cy={y} r={v.r} fill={v.fill} stroke={v.stroke} strokeWidth="3" />
          {node.nodeType === 'JUNCTION' ? <circle cx={x} cy={y} r="8.6" fill="#64b5f6" /> : <text x={x} y={y + v.iconSize * 0.36} textAnchor="middle" fontSize={v.iconSize} fill={node.nodeType === 'GATE' ? '#ffffff' : '#000000'}>{v.icon}</text>}
          <rect x={x - w / 2} y={labelY} width={w} height="30" rx="15" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.25" />
          <text x={x} y={labelY + 22} textAnchor="middle" fontSize="19.36" fontWeight="700" fill="#17213c">{label}</text>
        </g> })}
      </svg>
    </div>
    {(missing.length > 0 || hidden > 0) && <div className="border-t-[1.25px] border-[#d8e4eb] bg-white/70 px-4 py-2.5 text-xs text-[#68728a]">
      {missing.length > 0 && <p>Not drawn (no coordinates): {missing.map((node, index) => <span key={node.id}>{index > 0 && ', '}<button type="button" disabled={disabled} onClick={() => onSelect(node.id)} className="font-semibold text-[#273238] underline focus-visible:outline-2 disabled:no-underline">{node.nodeCode}</button></span>)}</p>}
      {hidden > 0 && <p>{hidden} route{hidden === 1 ? '' : 's'} not drawn because a connected node has no coordinates. They are still listed below.</p>}
    </div>}
  </div>
}
