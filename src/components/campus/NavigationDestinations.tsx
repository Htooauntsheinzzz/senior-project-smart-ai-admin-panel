import { useCallback, useEffect, useState } from 'react'
import { Link2 } from 'lucide-react'
import Modal from '../ui/Modal'
import type { BuildingListItem, CampusPlace, NavigationDestination, NavigationNode, NavigationValidation, ValidationIssue } from '../../types/campus'
import { deleteDestination, getDestinations, getNavigationValidation } from '../../services/navigationRouteService'
import { getAllBuildings } from '../../services/buildingService'
import { getCampusPlaces } from '../../services/campusPlaceService'
import { campusError } from '../../utils/campusApi'
import { CampusTable, CodeChip, ConfirmDelete, SerialChip, SuccessToast, TableState, primaryButton } from './CampusUi'
import { DestinationForm } from './CampusForms'

// Destinations (AdminCampusNavigationController /destinations) link a building or campus place to the node
// students are routed to. They also give map markers their coordinates. No Figma screen exists for them,
// so this section follows the Route List table on the same page.

const describe = (error: unknown) => campusError(error, 'Destination not found.')

export function DestinationsSection({ nodes, version, disabled, onDrawerChange, onChanged }: { nodes: NavigationNode[]; version: number; disabled: boolean; onDrawerChange: (open: boolean) => void; onChanged: () => void }) {
  const [own, setOwn] = useState(0)
  const key = `${version}-${own}`
  const [data, setData] = useState<{ key: string; rows?: NavigationDestination[]; buildings?: BuildingListItem[]; places?: CampusPlace[]; error?: string } | null>(null)
  const [drawer, setDrawer] = useState<{ destination?: NavigationDestination } | null>(null)
  const [deleting, setDeleting] = useState<NavigationDestination | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([getDestinations(controller.signal), getAllBuildings(controller.signal), getCampusPlaces({ search: '', status: '' }, controller.signal)])
      .then(([rows, buildings, places]) => { if (!controller.signal.aborted) setData({ key, rows, buildings, places }) })
      .catch(error => { if (!controller.signal.aborted) setData({ key, error: describe(error) }) })
    return () => controller.abort()
  }, [key])

  const current = data?.key === key ? data : null
  const rows = current?.rows ?? []
  const refresh = () => { setOwn(previous => previous + 1); onChanged() }
  const dismiss = useCallback(() => setMessage(''), [])
  function openDrawer(next: { destination?: NavigationDestination } | null) { setDrawer(next); onDrawerChange(!!next) }
  const busy = disabled || !!drawer

  return <section aria-labelledby="destinations-title" className="mt-4">
    <div className="mb-2 flex flex-wrap items-center gap-3">
      <div className="mr-auto">
        <h2 id="destinations-title" className="font-display text-sm leading-[21px] font-bold text-[#17213c]">Destinations</h2>
        <p className="text-xs text-[#68728a]">Links each building or campus place to the node students are routed to. The Campus Map places markers from these links.</p>
      </div>
      <button type="button" disabled={busy} onClick={() => openDrawer({})} className={`${primaryButton} px-4`}><Link2 size={14} aria-hidden="true" />Link Destination</button>
    </div>
    <CampusTable label="Destinations table" caption="Row numbers, destination buildings or places, navigation nodes, primary and accessible entrance flags, and actions" minWidth={860}
      headers={['No.', 'Destination', 'Type', 'Navigation Node', 'Primary', 'Accessible Entrance', 'Actions']}
      state={<TableState loading={!current} error={current?.error} empty={!rows.length} loadingText="Loading destinations…" emptyText="No destinations yet. Link a building or place to its entrance node so students can navigate there." onRetry={refresh} />}>
      {rows.map((destination, index) => { const owner = destination.building ?? destination.place; return <tr key={destination.id}>
        <td className="px-3 py-2.5"><SerialChip value={index + 1} /></td>
        <th scope="row" className="px-3 py-2.5 text-xs font-semibold">{owner?.name ?? '—'}{owner && <span className="ml-1.5"><CodeChip>{owner.code}</CodeChip></span>}</th>
        <td className="px-3 py-2.5 text-xs text-[#68728a]">{destination.building ? 'Building' : 'Campus Place'}</td>
        <td className="px-3 py-2.5 text-xs">{destination.node.name}<span className="block text-[10px] text-[#68728a]">{destination.node.code}</span></td>
        <td className="px-3 py-2.5 text-xs">{destination.isPrimary ? '★ Primary' : <span className="text-[#9ca3af]">No</span>}</td>
        <td className="px-3 py-2.5">{destination.isAccessibleEntrance ? <span className="text-sm"><span aria-hidden="true">♿</span><span className="sr-only">Yes</span></span> : <span className="text-[11px] text-[#9ca3af]">No</span>}</td>
        <td className="px-3 py-2.5"><div className="flex gap-[5px]">
          <button type="button" disabled={busy} onClick={() => openDrawer({ destination })} aria-label={`Edit destination ${owner?.name ?? destination.id}`} className="h-[27px] rounded-md border-[1.25px] border-[#e5e8f0] bg-white px-2.5 text-[11px] text-[#17213c] hover:bg-[#f7f8fc] focus-visible:outline-2 disabled:opacity-50">Edit</button>
          <button type="button" disabled={busy} onClick={() => setDeleting(destination)} aria-label={`Delete destination ${owner?.name ?? destination.id}`} className="h-[27px] rounded-md border-[1.25px] border-[#fca5a5] px-2 text-[11px] text-[#ef4444] hover:bg-[#fef2f2] focus-visible:outline-2 disabled:opacity-50">✕</button>
        </div></td>
      </tr> })}
    </CampusTable>
    {drawer && <DestinationForm key={drawer.destination?.id ?? 'new-destination'} destination={drawer.destination} nodes={nodes} buildings={current?.buildings ?? []} places={current?.places ?? []}
      onClose={() => openDrawer(null)} onSaved={(name, operation) => { openDrawer(null); refresh(); setMessage(`Destination ${name} was ${operation} successfully.`) }} />}
    {deleting && <ConfirmDelete title="Remove destination?" describeError={describe} onClose={() => setDeleting(null)} onConfirm={() => deleteDestination(deleting.id)}
      onDeleted={() => { setMessage(`Destination ${(deleting.building ?? deleting.place)?.name ?? ''} was removed successfully.`); setDeleting(null); refresh() }}>
      Remove the link between <strong className="text-[#17213c]">{(deleting.building ?? deleting.place)?.name}</strong> and node <strong className="text-[#17213c]">{deleting.node.name}</strong>? Students can no longer navigate there through this entrance.
    </ConfirmDelete>}
    <SuccessToast message={message} onDismiss={dismiss} />
  </section>
}

const issueGroups: { key: keyof NavigationValidation; label: string; warning?: boolean }[] = [
  { key: 'crossCampusErrors', label: 'Cross-campus links' },
  { key: 'invalidCoordinates', label: 'Invalid coordinates' },
  { key: 'disconnectedNodes', label: 'Disconnected nodes' },
  { key: 'unreachableDestinations', label: 'Unreachable destinations' },
  { key: 'missingPrimaryEntrances', label: 'Missing primary entrances' },
  { key: 'inactiveEdges', label: 'Inactive routes', warning: true },
  { key: 'missingRouteGeometry', label: 'Routes without drawn path', warning: true },
  { key: 'accessibilityGaps', label: 'Accessibility gaps', warning: true },
]

/** GET /campus/navigation/validation: checks the graph the mobile app routes over. */
export function GraphCheckModal({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<{ data?: NavigationValidation; error?: string } | null>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    getNavigationValidation(undefined, controller.signal)
      .then(data => { if (!controller.signal.aborted) setState({ data }) })
      .catch(error => { if (!controller.signal.aborted) setState({ error: describe(error) }) })
    return () => controller.abort()
  }, [attempt])
  const data = state?.data
  return <Modal title="Navigation Graph Check" onClose={onClose}>
    {!state ? <p role="status" className="text-sm text-[#68728a]">Checking the navigation graph…</p>
      : state.error ? <div role="alert" className="text-sm text-[#68728a]"><p>{state.error}</p><button type="button" onClick={() => { setState(null); setAttempt(a => a + 1) }} className="mt-3 rounded-xl border border-[#e5e8f0] px-4 py-2 font-semibold focus-visible:outline-2">Retry</button></div>
        : data && <div className="space-y-4 text-sm">
          <p role="status" className={`rounded-xl px-3.5 py-2.5 font-semibold ${data.valid ? 'bg-[#ecfdf5] text-[#047857]' : 'bg-[#fff1f2] text-[#be123c]'}`}>
            {data.valid ? 'The graph is ready for student navigation.' : 'Students may not be able to navigate everywhere. Fix the blocking issues below.'}
          </p>
          <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
            {([['Active nodes', data.summary.activeNodes], ['Active routes', data.summary.activeEdges], ['Destinations', data.summary.destinations], ['Blocking', data.summary.blockingIssues], ['Warnings', data.summary.warnings]] as const).map(([label, value]) =>
              <div key={label} className="rounded-lg border border-[#e5e8f0] px-2.5 py-2"><dt className="text-[#68728a]">{label}</dt><dd className="font-display text-lg font-bold text-[#17213c]">{value}</dd></div>)}
          </dl>
          <div className="max-h-[50vh] space-y-3 overflow-y-auto">
            {issueGroups.map(group => { const issues = (data[group.key] as ValidationIssue[] | undefined) ?? []; if (!issues.length) return null; return <section key={group.key}>
              <h3 className="text-xs font-bold text-[#17213c]">{group.label} <span className={`ml-1 rounded-full px-1.5 text-[10px] ${group.warning ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#ffe4e6] text-[#be123c]'}`}>{group.warning ? 'Warning' : 'Blocking'} · {issues.length}</span></h3>
              <ul className="mt-1 space-y-1 text-xs text-[#68728a]">{issues.map((issue, index) => <li key={`${issue.entityType}-${issue.id ?? index}`}>{issue.code && <CodeChip>{issue.code}</CodeChip>} {issue.detail}</li>)}</ul>
            </section> })}
            {issueGroups.every(group => !((data[group.key] as ValidationIssue[] | undefined)?.length)) && <p className="text-xs text-[#68728a]">No issues found.</p>}
          </div>
        </div>}
  </Modal>
}
