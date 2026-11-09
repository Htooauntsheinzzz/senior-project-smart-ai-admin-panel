import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import Drawer from '../ui/Drawer'
import Modal from '../ui/Modal'
import type { DestinationDraft, ExceptionDraftRow, NavigationDestination, CategoryDraft, FacilityDraft, MobileGroup, SiteDraft, Building, BuildingDraft, BuildingListItem, CampusCategory, CampusFacility, CampusPlace, CampusSite, HoursDraftRow, NavigationNode, NavigationRoute, NodeDraft, NodeType, PlaceDraft, PlaceStatus, Room, RoomDraft, RoomStatus, RoomType, RouteDraft, SurfaceType, BuildingStatus, EdgeStatus } from '../../types/campus'
import { exceptionsDraft, validateDestination, validateExceptions, mobileGroups, validateCategory, validateFacility, validateSite, buildingStatuses, campusError, campusErrorField, edgeStatuses, floorLabel, hoursDraft, nodeTypes, placeStatuses, roomStatuses, roomTypes, surfaceTypes, validateBuilding, validateHours, validateNode, validatePlace, validateRoom, validateRoute } from '../../utils/campusApi'
import { createBuilding, saveBuildingOpeningExceptions, saveBuildingOpeningHours, updateBuilding } from '../../services/buildingService'
import { createRoom, updateRoom } from '../../services/roomService'
import { createCampusPlace, savePlaceOpeningExceptions, savePlaceOpeningHours, updateCampusPlace } from '../../services/campusPlaceService'
import { createCampusCategory, createCampusFacility, createCampusSite, updateCampusCategory, updateCampusFacility, updateCampusSite } from '../../services/campusSetupService'
import { createDestination, createNavigationNode, createRoute, updateDestination, updateNavigationNode, updateRoute } from '../../services/navigationRouteService'
import { ExceptionsEditor, FacilityPicker, Field, HoursEditor, SelectInput, TextArea, TextInput, Toggle } from './CampusUi'

/** Backend default (app.campus.lowest-floor-number); the server re-validates floors. */
export const LOWEST_FLOOR = -5

type Saved = (name: string, operation: 'created' | 'updated', warning?: string) => void
const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] leading-[20.25px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60'
const options = <K extends string>(record: Record<K, { label: string } | string>) => (Object.keys(record) as K[]).map(key => ({ value: key, label: typeof record[key] === 'string' ? record[key] as string : (record[key] as { label: string }).label }))
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Shared drawer shell: dirty-check on close, one submission at a time
 * (isSubmitting / isUpdating lock), backend error shown above the form.
 */
function useFormState<T extends object>(initial: T, formId: string) {
  const [start] = useState(initial)
  const [value, setValue] = useState(initial)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState('')
  const [discard, setDiscard] = useState(false)
  const lock = useRef(false)
  const set = <K extends keyof T>(key: K, next: T[K]) => { setValue(previous => ({ ...previous, [key]: next })); setErrors(previous => ({ ...previous, [key as string]: undefined })); setFailure('') }
  const showFailure = () => requestAnimationFrame(() => document.getElementById(`${formId}-failure`)?.scrollIntoView({ block: 'nearest' }))
  // Focus the first invalid field; when the error belongs to nothing on screen, show it above the form instead of failing silently.
  const focusInvalid = (fallback?: string) => requestAnimationFrame(() => {
    const target = document.getElementById(formId)?.querySelector<HTMLElement>('[aria-invalid="true"]')
    if (target) target.focus()
    else if (fallback) { setFailure(fallback); showFailure() }
  })
  async function run(event: FormEvent, validate: () => Partial<Record<string, string>>, save: () => Promise<void>) {
    event.preventDefault()
    if (lock.current) return
    const found = Object.fromEntries(Object.entries(validate()).filter(([, message]) => message))
    setErrors(found)
    setFailure('')
    if (Object.keys(found).length) { focusInvalid(Object.values(found)[0]); return }
    lock.current = true; setPending(true); setFailure('')
    try { await save() } catch (error) {
      const message = campusError(error)
      const field = campusErrorField(error)
      setFailure(message)
      showFailure()
      if (field && field in (start as object)) { setErrors({ [field]: message }); focusInvalid() }
      lock.current = false; setPending(false)
    }
  }
  // Refs stay inside the hook; callers only get values and handlers (react-hooks/refs).
  const requestClose = (onClose: () => void) => { if (lock.current) return; if (!same(value, start)) setDiscard(true); else onClose() }
  return { start, value, set, errors, pending, failure, discard, setDiscard, run, requestClose }
}

function FormDrawer({ id, title, description, submitLabel, pending, failure, blocked = '', discard, onDiscardCancel, onClose, requestClose, children }: { id: string; title: string; description: string; submitLabel: string; pending: boolean; failure: string; blocked?: string; discard: boolean; onDiscardCancel: () => void; onClose: () => void; requestClose: () => void; children: ReactNode }) {
  return <>
    <Drawer width={480} title={title} description={description} busy={pending} onClose={requestClose} footer={<>
      <button type="submit" form={id} disabled={pending || !!blocked} className={`${button} bg-linear-[165deg,#273238,#1a2329] text-white`}><img src="/assets/figma/faculty-check.svg" width="14" height="14" alt="" />{pending ? 'Saving…' : submitLabel}</button>
      <button type="button" disabled={pending} onClick={requestClose} className={`${button} border-[1.25px] border-[#e5e8f0]`}>Cancel</button>
    </>}>
      {blocked && <p role="alert" className="mb-4 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3.5 py-2.5 text-[13px] text-[#92400e]">{blocked}</p>}
      {failure && <p id={`${id}-failure`} role="alert" className="mb-4 rounded-xl border border-[#fecdd3] bg-[#fff1f2] px-3.5 py-2.5 text-[13px] text-[#be123c]">{failure}</p>}
      {children}
    </Drawer>
    {discard && <Modal title="Discard changes?" onClose={onDiscardCancel}><p className="text-sm leading-6 text-[#68728a]">Your unsaved changes will be lost.</p><div className="mt-6 flex justify-end gap-3"><button type="button" className="rounded-xl border border-[#e5e8f0] px-4 py-2 text-sm font-semibold focus-visible:outline-2" onClick={onDiscardCancel}>Keep editing</button><button type="button" className="rounded-xl bg-[#273238] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2" onClick={onClose}>Discard</button></div></Modal>}
  </>
}

function SiteField({ sites, value, onChange, error, prefix }: { sites: CampusSite[]; value: string; onChange: (value: string) => void; error?: string; prefix: string }) {
  if (sites.length === 1) return null
  if (!sites.length) return null
  return <Field id={`${prefix}-site`} label="Campus" required error={error}><SelectInput id={`${prefix}-site`} value={value} onChange={onChange} error={error} placeholder="Select a campus…" options={sites.map(site => ({ value: String(site.id), label: site.siteName }))} /></Field>
}

const defaultSite = (sites: CampusSite[]) => (sites.length === 1 ? String(sites[0].id) : '')
/** The campus list can arrive after the drawer opens; with one campus it is picked automatically. */
const withSite = <T extends { siteId: string }>(value: T, sites: CampusSite[]) => (value.siteId || !sites.length ? value : { ...value, siteId: defaultSite(sites) })
const NO_CAMPUS = 'No active campus exists yet, so this record cannot be created. Add one in Campus Management > Campus Setup first.'
const NO_CATEGORY = 'No place categories exist yet, so a campus place cannot be saved. Add one in Campus Management > Campus Setup first.'
const noCampus = (creating: boolean, sites: CampusSite[]) => (creating && !sites.length ? NO_CAMPUS : '')

// ---------------- Building ----------------

export function BuildingForm({ building, sites, onSaved, onClose }: { building?: Building; sites: CampusSite[]; onSaved: Saved; onClose: () => void }) {
  const f = useFormState<BuildingDraft & { hours: HoursDraftRow[]; exceptions: ExceptionDraftRow[] }>(building ? {
    siteId: String(building.siteId), buildingCode: building.buildingCode, buildingName: building.buildingName, buildingNameTh: building.buildingNameTh ?? '',
    description: building.description ?? '', totalFloors: String(building.totalFloors), areaSquareMeters: building.areaSquareMeters == null ? '' : String(building.areaSquareMeters),
    status: building.status, hours: hoursDraft(building.openingHours), exceptions: exceptionsDraft(building.openingExceptions),
  } : { siteId: defaultSite(sites), buildingCode: '', buildingName: '', buildingNameTh: '', description: '', totalFloors: '', areaSquareMeters: '', status: 'ACTIVE', hours: hoursDraft([]), exceptions: [] }, 'campus-building-form')
  const v = withSite(f.value, sites)
  const submit = (event: FormEvent) => f.run(event, () => ({ ...validateBuilding(v, !building), hours: validateHours(v.hours), exceptions: validateExceptions(v.exceptions) }), async () => {
    const saved = building ? await updateBuilding(building.id, v) : await createBuilding(v)
    let warning
    if (!same(v.hours, f.start.hours)) {
      try { await saveBuildingOpeningHours(saved.id, v.hours) } catch (error) { warning = `Opening hours were not saved: ${campusError(error)}` }
    }
    if (!same(v.exceptions, f.start.exceptions)) {
      try { await saveBuildingOpeningExceptions(saved.id, v.exceptions) } catch (error) { warning = `${warning ? `${warning} ` : ''}Special dates were not saved: ${campusError(error)}` }
    }
    onSaved(saved.buildingName, building ? 'updated' : 'created', warning)
  })
  const close = () => f.requestClose(onClose)
  const e = f.errors
  return <FormDrawer id="campus-building-form" title={building ? 'Edit Building' : 'Add Building'} description={building ? 'Update building information used by campus navigation.' : 'Create a building record for the campus navigation system.'} submitLabel={building ? 'Update Building' : 'Add Building'} pending={f.pending} failure={f.failure} blocked={noCampus(!building, sites)} discard={f.discard} onDiscardCancel={() => f.setDiscard(false)} onClose={onClose} requestClose={close}>
    <form id="campus-building-form" onSubmit={submit} noValidate><fieldset disabled={f.pending} className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2">
      {!building && <SiteField prefix="building" sites={sites} value={v.siteId} onChange={value => f.set('siteId', value)} error={e.siteId} />}
      <Field id="building-code" label="Building Code" required full={false} error={e.buildingCode}><TextInput id="building-code" value={v.buildingCode} onChange={value => f.set('buildingCode', value)} error={e.buildingCode} placeholder="e.g. AVB" required /></Field>
      <Field id="building-status" label="Status" full={false}><SelectInput id="building-status" value={v.status} onChange={value => f.set('status', (value || 'ACTIVE') as BuildingStatus)} placeholder="Select status…" options={options(buildingStatuses)} /></Field>
      <Field id="building-name" label="Building Name" required error={e.buildingName}><TextInput id="building-name" value={v.buildingName} onChange={value => f.set('buildingName', value)} error={e.buildingName} placeholder="e.g. Avebury Building" required /></Field>
      <Field id="building-name-th" label="Building Name (Thai)" error={e.buildingNameTh}><TextInput id="building-name-th" value={v.buildingNameTh} onChange={value => f.set('buildingNameTh', value)} error={e.buildingNameTh} /></Field>
      <Field id="building-floors" label="Floors" required full={false} error={e.totalFloors}><TextInput id="building-floors" type="number" inputMode="numeric" min={1} max={200} value={v.totalFloors} onChange={value => f.set('totalFloors', value)} error={e.totalFloors} placeholder="e.g. 8" required /></Field>
      <Field id="building-area" label="Area (m²)" full={false} error={e.areaSquareMeters}><TextInput id="building-area" type="number" inputMode="decimal" step="0.01" value={v.areaSquareMeters} onChange={value => f.set('areaSquareMeters', value)} error={e.areaSquareMeters} placeholder="e.g. 18400" /></Field>
      <Field id="building-description" label="Description" error={e.description}><TextArea id="building-description" value={v.description} onChange={value => f.set('description', value)} error={e.description} /></Field>
      <HoursEditor rows={v.hours} onChange={rows => f.set('hours', rows)} error={e.hours} />
      <ExceptionsEditor rows={v.exceptions} onChange={rows => f.set('exceptions', rows)} error={e.exceptions} />
    </fieldset></form>
  </FormDrawer>
}

// ---------------- Room ----------------

export function RoomForm({ room, buildings, facilities, onSaved, onClose }: { room?: Room; buildings: BuildingListItem[]; facilities: CampusFacility[]; onSaved: Saved; onClose: () => void }) {
  const f = useFormState<RoomDraft>(room ? {
    buildingId: String(room.buildingId), roomNumber: room.roomNumber, roomName: room.roomName ?? '', floorNumber: String(room.floorNumber), roomType: room.roomType,
    capacity: room.capacity == null ? '' : String(room.capacity), status: room.status, facilityIds: room.facilities.map(x => String(x.id)),
  } : { buildingId: '', roomNumber: '', roomName: '', floorNumber: '', roomType: '', capacity: '', status: 'AVAILABLE', facilityIds: [] }, 'campus-room-form')
  const v = f.value
  const building = buildings.find(b => String(b.id) === v.buildingId)
  const submit = (event: FormEvent) => f.run(event, () => validateRoom(v, LOWEST_FLOOR, building?.totalFloors ?? null), async () => {
    const saved = room ? await updateRoom(room.id, v) : await createRoom(v)
    onSaved(saved.roomNumber, room ? 'updated' : 'created')
  })
  const close = () => f.requestClose(onClose)
  const e = f.errors
  const buildingOptions = buildings.filter(b => b.status !== 'INACTIVE' || String(b.id) === v.buildingId).map(b => ({ value: String(b.id), label: `${b.buildingName} (${b.buildingCode})` }))
  return <FormDrawer id="campus-room-form" title={room ? 'Edit Room' : 'Add Room'} description={room ? 'Update room information.' : 'Create a classroom, lab, or office room record.'} submitLabel={room ? 'Update Room' : 'Add Room'} pending={f.pending} failure={f.failure} discard={f.discard} onDiscardCancel={() => f.setDiscard(false)} onClose={onClose} requestClose={close}>
    <form id="campus-room-form" onSubmit={submit} noValidate><fieldset disabled={f.pending} className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2">
      <Field id="room-building" label="Building" required error={e.buildingId}><SelectInput id="room-building" value={v.buildingId} onChange={value => f.set('buildingId', value)} error={e.buildingId} placeholder="Select a building…" options={buildingOptions} required /></Field>
      <Field id="room-number" label="Room Number" required full={false} error={e.roomNumber}><TextInput id="room-number" value={v.roomNumber} onChange={value => f.set('roomNumber', value)} error={e.roomNumber} placeholder="e.g. AVB-101" required /></Field>
      <Field id="room-floor" label="Floor" required full={false} error={e.floorNumber} hint={building ? `${floorLabel(LOWEST_FLOOR)} to ${floorLabel(building.totalFloors)} (negative = basement)` : undefined}><TextInput id="room-floor" type="number" inputMode="numeric" min={LOWEST_FLOOR} max={building?.totalFloors} value={v.floorNumber} onChange={value => f.set('floorNumber', value)} error={e.floorNumber} placeholder="e.g. 1" required /></Field>
      <Field id="room-name" label="Room Name" error={e.roomName}><TextInput id="room-name" value={v.roomName} onChange={value => f.set('roomName', value)} error={e.roomName} placeholder="e.g. IT Lecture Room 1" /></Field>
      <Field id="room-type" label="Type" required full={false} error={e.roomType}><SelectInput id="room-type" value={v.roomType} onChange={value => f.set('roomType', value as RoomType | '')} error={e.roomType} placeholder="Select a type…" options={options(roomTypes)} required /></Field>
      <Field id="room-capacity" label="Capacity" full={false} error={e.capacity}><TextInput id="room-capacity" type="number" inputMode="numeric" min={1} value={v.capacity} onChange={value => f.set('capacity', value)} error={e.capacity} placeholder="e.g. 50" /></Field>
      <Field id="room-status" label="Status" full={false}><SelectInput id="room-status" value={v.status} onChange={value => f.set('status', (value || 'AVAILABLE') as RoomStatus)} placeholder="Select status…" options={options(roomStatuses)} /></Field>
      <FacilityPicker facilities={facilities} selected={v.facilityIds} onChange={next => f.set('facilityIds', next)} initial={room?.facilities ?? []} />
    </fieldset></form>
  </FormDrawer>
}

// ---------------- Campus Place ----------------

export function PlaceForm({ place, sites, categories, buildings, facilities, onSaved, onClose }: { place?: CampusPlace; sites: CampusSite[]; categories: CampusCategory[]; buildings: BuildingListItem[]; facilities: CampusFacility[]; onSaved: Saved; onClose: () => void }) {
  const f = useFormState<PlaceDraft & { hours: HoursDraftRow[]; exceptions: ExceptionDraftRow[] }>(place ? {
    siteId: String(place.siteId), categoryId: String(place.category.id), buildingId: place.building ? String(place.building.id) : '', placeCode: place.placeCode, placeName: place.placeName,
    placeNameTh: place.placeNameTh ?? '', description: place.description ?? '', floorLabel: place.floorLabel ?? '', phoneNumber: place.phoneNumber ?? '',
    isPopular: place.isPopular, isVisibleOnMobile: place.isVisibleOnMobile, status: place.status, facilityIds: place.facilities.map(x => String(x.id)), hours: hoursDraft(place.openingHours), exceptions: exceptionsDraft(place.openingExceptions),
  } : { siteId: defaultSite(sites), categoryId: '', buildingId: '', placeCode: '', placeName: '', placeNameTh: '', description: '', floorLabel: '', phoneNumber: '', isPopular: false, isVisibleOnMobile: true, status: 'ACTIVE', facilityIds: [], hours: hoursDraft([]), exceptions: [] }, 'campus-place-form')
  const v = withSite(f.value, sites)
  const submit = (event: FormEvent) => f.run(event, () => ({ ...validatePlace(v, !place), hours: validateHours(v.hours), exceptions: validateExceptions(v.exceptions) }), async () => {
    const saved = place ? await updateCampusPlace(place.id, v) : await createCampusPlace(v)
    let warning
    if (!same(v.hours, f.start.hours)) {
      try { await savePlaceOpeningHours(saved.id, v.hours) } catch (error) { warning = `Opening hours were not saved: ${campusError(error)}` }
    }
    if (!same(v.exceptions, f.start.exceptions)) {
      try { await savePlaceOpeningExceptions(saved.id, v.exceptions) } catch (error) { warning = `${warning ? `${warning} ` : ''}Special dates were not saved: ${campusError(error)}` }
    }
    onSaved(saved.placeName, place ? 'updated' : 'created', warning)
  })
  const close = () => f.requestClose(onClose)
  const e = f.errors
  const siteId = v.siteId || (place ? String(place.siteId) : '')
  const categoryOptions = categories.filter(c => c.isActive || String(c.id) === v.categoryId).map(c => ({ value: String(c.id), label: c.categoryName }))
  const buildingOptions = buildings.filter(b => (!siteId || String(b.siteId) === siteId) && (b.status !== 'INACTIVE' || String(b.id) === v.buildingId)).map(b => ({ value: String(b.id), label: `${b.buildingName} (${b.buildingCode})` }))
  return <FormDrawer id="campus-place-form" title={place ? 'Edit Campus Place' : 'Add Campus Place'} description={place ? 'Update this point of interest.' : 'Create a point of interest for the student mobile navigation app.'} submitLabel={place ? 'Update Place' : 'Add Campus Place'} pending={f.pending} failure={f.failure} blocked={noCampus(!place, sites) || (categories.length ? '' : NO_CATEGORY)} discard={f.discard} onDiscardCancel={() => f.setDiscard(false)} onClose={onClose} requestClose={close}>
    <form id="campus-place-form" onSubmit={submit} noValidate><fieldset disabled={f.pending} className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2">
      {!place && <SiteField prefix="place" sites={sites} value={v.siteId} onChange={value => f.set('siteId', value)} error={e.siteId} />}
      <Field id="place-name" label="Place Name" required error={e.placeName}><TextInput id="place-name" value={v.placeName} onChange={value => f.set('placeName', value)} error={e.placeName} placeholder="e.g. Henry Luce III Library" required /></Field>
      <Field id="place-code" label="Place Code" required full={false} error={e.placeCode}><TextInput id="place-code" value={v.placeCode} onChange={value => f.set('placeCode', value)} error={e.placeCode} placeholder="e.g. LIB-MAIN" required /></Field>
      <Field id="place-category" label="Category" required full={false} error={e.categoryId}><SelectInput id="place-category" value={v.categoryId} onChange={value => f.set('categoryId', value)} error={e.categoryId} placeholder="Select a category…" options={categoryOptions} required /></Field>
      <Field id="place-name-th" label="Place Name (Thai)" error={e.placeNameTh}><TextInput id="place-name-th" value={v.placeNameTh} onChange={value => f.set('placeNameTh', value)} error={e.placeNameTh} /></Field>
      <Field id="place-description" label="Description" error={e.description}><TextArea id="place-description" value={v.description} onChange={value => f.set('description', value)} error={e.description} /></Field>
      <Field id="place-building" label="Building" full={false} error={e.buildingId}><SelectInput id="place-building" value={v.buildingId} onChange={value => f.set('buildingId', value)} error={e.buildingId} placeholder="No building" options={buildingOptions} /></Field>
      <Field id="place-floor" label="Floor" full={false} error={e.floorLabel}><TextInput id="place-floor" value={v.floorLabel} onChange={value => f.set('floorLabel', value)} error={e.floorLabel} placeholder="e.g. 1F–5F" /></Field>
      <Field id="place-phone" label="Phone" full={false} error={e.phoneNumber}><TextInput id="place-phone" type="tel" inputMode="tel" value={v.phoneNumber} onChange={value => f.set('phoneNumber', value)} error={e.phoneNumber} placeholder="e.g. 02-997-2200 ext.1201" /></Field>
      <Field id="place-status" label="Status" full={false}><SelectInput id="place-status" value={v.status} onChange={value => f.set('status', (value || 'ACTIVE') as PlaceStatus)} placeholder="Select status…" options={options(placeStatuses)} /></Field>
      <Toggle id="place-popular" label="⭐ Popular" checked={v.isPopular} onChange={value => f.set('isPopular', value)} />
      <Toggle id="place-visible" label="Visible on mobile" checked={v.isVisibleOnMobile} onChange={value => f.set('isVisibleOnMobile', value)} />
      <FacilityPicker facilities={facilities} selected={v.facilityIds} onChange={next => f.set('facilityIds', next)} initial={place?.facilities ?? []} />
      <HoursEditor rows={v.hours} onChange={rows => f.set('hours', rows)} error={e.hours} />
      <ExceptionsEditor rows={v.exceptions} onChange={rows => f.set('exceptions', rows)} error={e.exceptions} />
    </fieldset></form>
  </FormDrawer>
}

// ---------------- Navigation node ----------------

export function NodeForm({ node, sites, onSaved, onClose }: { node?: NavigationNode; sites: CampusSite[]; onSaved: Saved; onClose: () => void }) {
  const f = useFormState<NodeDraft>(node ? {
    siteId: String(node.siteId), nodeCode: node.nodeCode, nodeName: node.nodeName, nodeType: node.nodeType,
    latitude: node.latitude == null ? '' : String(node.latitude), longitude: node.longitude == null ? '' : String(node.longitude), isAccessible: node.isAccessible, isActive: node.isActive,
  } : { siteId: defaultSite(sites), nodeCode: '', nodeName: '', nodeType: '', latitude: '', longitude: '', isAccessible: true, isActive: true }, 'campus-node-form')
  const v = withSite(f.value, sites)
  const submit = (event: FormEvent) => f.run(event, () => validateNode(v, !node), async () => {
    const saved = node ? await updateNavigationNode(node.id, v) : await createNavigationNode(v)
    onSaved(saved.nodeName, node ? 'updated' : 'created')
  })
  const close = () => f.requestClose(onClose)
  const e = f.errors
  return <FormDrawer id="campus-node-form" title={node ? 'Edit Node' : 'Add Node'} description="Navigation nodes are the points of the student walking graph." submitLabel={node ? 'Update Node' : 'Add Node'} pending={f.pending} failure={f.failure} blocked={noCampus(!node, sites)} discard={f.discard} onDiscardCancel={() => f.setDiscard(false)} onClose={onClose} requestClose={close}>
    <form id="campus-node-form" onSubmit={submit} noValidate><fieldset disabled={f.pending} className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2">
      {!node && <SiteField prefix="node" sites={sites} value={v.siteId} onChange={value => f.set('siteId', value)} error={e.siteId} />}
      <Field id="node-code" label="Node Code" required full={false} error={e.nodeCode}><TextInput id="node-code" value={v.nodeCode} onChange={value => f.set('nodeCode', value)} error={e.nodeCode} placeholder="e.g. JCT-A" required /></Field>
      <Field id="node-type" label="Node Type" required full={false} error={e.nodeType}><SelectInput id="node-type" value={v.nodeType} onChange={value => f.set('nodeType', value as NodeType | '')} error={e.nodeType} placeholder="Select a type…" options={options(nodeTypes)} required /></Field>
      <Field id="node-name" label="Node Name" required error={e.nodeName}><TextInput id="node-name" value={v.nodeName} onChange={value => f.set('nodeName', value)} error={e.nodeName} placeholder="e.g. Junction A" required /></Field>
      <Field id="node-lat" label="Latitude" full={false} error={e.latitude}><TextInput id="node-lat" inputMode="decimal" value={v.latitude} onChange={value => f.set('latitude', value)} error={e.latitude} placeholder="e.g. 13.9649" /></Field>
      <Field id="node-lng" label="Longitude" full={false} error={e.longitude}><TextInput id="node-lng" inputMode="decimal" value={v.longitude} onChange={value => f.set('longitude', value)} error={e.longitude} placeholder="e.g. 100.5875" /></Field>
      <Toggle id="node-accessible" label="♿ Accessible" checked={v.isAccessible} onChange={value => f.set('isAccessible', value)} />
      <Toggle id="node-active" label="Active" checked={v.isActive} onChange={value => f.set('isActive', value)} />
    </fieldset></form>
  </FormDrawer>
}

// ---------------- Navigation route (Connect Nodes) ----------------

export function RouteForm({ route, sites, nodes, onSaved, onClose }: { route?: NavigationRoute; sites: CampusSite[]; nodes: NavigationNode[]; onSaved: Saved; onClose: () => void }) {
  const f = useFormState<RouteDraft>(route ? {
    siteId: String(route.siteId), edgeCode: route.edgeCode, startNodeId: String(route.startNode.id), endNodeId: String(route.endNode.id), distanceMeters: String(route.distanceMeters),
    surfaceType: route.surfaceType, isWheelchairAccessible: route.isWheelchairAccessible, isBidirectional: route.isBidirectional, status: route.status,
  } : { siteId: defaultSite(sites), edgeCode: '', startNodeId: '', endNodeId: '', distanceMeters: '', surfaceType: '', isWheelchairAccessible: true, isBidirectional: true, status: 'ACTIVE' }, 'campus-route-form')
  const v = withSite(f.value, sites)
  const submit = (event: FormEvent) => f.run(event, () => validateRoute(v, !route), async () => {
    const saved = route ? await updateRoute(route.id, v, route.intermediatePoints ?? []) : await createRoute(v)
    onSaved(saved.edgeCode, route ? 'updated' : 'created')
  })
  const close = () => f.requestClose(onClose)
  const e = f.errors
  const siteId = v.siteId || (route ? String(route.siteId) : '')
  const nodeOptions = nodes.filter(n => (!siteId || String(n.siteId) === siteId) && (n.isActive || [v.startNodeId, v.endNodeId].includes(String(n.id)))).map(n => ({ value: String(n.id), label: `${n.nodeName} (${n.nodeCode})` }))
  return <FormDrawer id="campus-route-form" title={route ? 'Edit Route' : 'Connect Nodes'} description="A route is a walking path between two navigation nodes." submitLabel={route ? 'Update Route' : 'Connect Nodes'} pending={f.pending} failure={f.failure} blocked={noCampus(!route, sites)} discard={f.discard} onDiscardCancel={() => f.setDiscard(false)} onClose={onClose} requestClose={close}>
    <form id="campus-route-form" onSubmit={submit} noValidate><fieldset disabled={f.pending} className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2">
      {!route && <SiteField prefix="route" sites={sites} value={v.siteId} onChange={value => f.set('siteId', value)} error={e.siteId} />}
      <Field id="route-start" label="Start Node" required error={e.startNodeId}><SelectInput id="route-start" value={v.startNodeId} onChange={value => f.set('startNodeId', value)} error={e.startNodeId} placeholder="Select start node…" options={nodeOptions} required /></Field>
      <Field id="route-end" label="End Node" required error={e.endNodeId}><SelectInput id="route-end" value={v.endNodeId} onChange={value => f.set('endNodeId', value)} error={e.endNodeId} placeholder="Select end node…" options={nodeOptions.filter(o => o.value !== v.startNodeId)} required /></Field>
      <Field id="route-code" label="Route Code" required full={false} error={e.edgeCode}><TextInput id="route-code" value={v.edgeCode} onChange={value => f.set('edgeCode', value)} error={e.edgeCode} placeholder="e.g. R01" required /></Field>
      <Field id="route-distance" label="Distance (m)" required full={false} error={e.distanceMeters} hint="Walk time is calculated by the backend."><TextInput id="route-distance" type="number" inputMode="decimal" step="0.01" min={0} value={v.distanceMeters} onChange={value => f.set('distanceMeters', value)} error={e.distanceMeters} placeholder="e.g. 180" required /></Field>
      <Field id="route-surface" label="Surface" required full={false} error={e.surfaceType}><SelectInput id="route-surface" value={v.surfaceType} onChange={value => f.set('surfaceType', value as SurfaceType | '')} error={e.surfaceType} placeholder="Select surface…" options={options(surfaceTypes)} required /></Field>
      <Field id="route-status" label="Status" full={false}><SelectInput id="route-status" value={v.status} onChange={value => f.set('status', (value || 'ACTIVE') as EdgeStatus)} placeholder="Select status…" options={options(edgeStatuses)} /></Field>
      <Toggle id="route-accessible" label="♿ Wheelchair accessible" checked={v.isWheelchairAccessible} onChange={value => f.set('isWheelchairAccessible', value)} />
      <Toggle id="route-bidirectional" label="Two-way path" checked={v.isBidirectional} onChange={value => f.set('isBidirectional', value)} />
    </fieldset></form>
  </FormDrawer>
}

// ---------------- Campus setup: sites, place categories, facilities ----------------

export function SiteForm({ site, onSaved, onClose }: { site?: CampusSite; onSaved: Saved; onClose: () => void }) {
  const f = useFormState<SiteDraft>(site ? {
    siteCode: site.siteCode, siteName: site.siteName, description: site.description ?? '', timezone: site.timezone ?? '',
    centerLatitude: site.centerLatitude == null ? '' : String(site.centerLatitude), centerLongitude: site.centerLongitude == null ? '' : String(site.centerLongitude), isActive: site.isActive,
  } : { siteCode: '', siteName: '', description: '', timezone: 'Asia/Bangkok', centerLatitude: '', centerLongitude: '', isActive: true }, 'campus-site-form')
  const v = f.value
  const submit = (event: FormEvent) => f.run(event, () => validateSite(v), async () => {
    const saved = site ? await updateCampusSite(site.id, v) : await createCampusSite(v)
    onSaved(saved.siteName, site ? 'updated' : 'created')
  })
  const close = () => f.requestClose(onClose)
  const e = f.errors
  return <FormDrawer id="campus-site-form" title={site ? 'Edit Campus' : 'Add Campus'} description="A campus groups every building, place and navigation node. Only a Super Admin can save campuses." submitLabel={site ? 'Update Campus' : 'Add Campus'} pending={f.pending} failure={f.failure} discard={f.discard} onDiscardCancel={() => f.setDiscard(false)} onClose={onClose} requestClose={close}>
    <form id="campus-site-form" onSubmit={submit} noValidate><fieldset disabled={f.pending} className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2">
      <Field id="site-code" label="Campus Code" required full={false} error={e.siteCode}><TextInput id="site-code" value={v.siteCode} onChange={value => f.set('siteCode', value)} error={e.siteCode} placeholder="e.g. RSU" required /></Field>
      <Field id="site-timezone" label="Timezone" full={false} error={e.timezone}><TextInput id="site-timezone" value={v.timezone} onChange={value => f.set('timezone', value)} error={e.timezone} placeholder="Asia/Bangkok" /></Field>
      <Field id="site-name" label="Campus Name" required error={e.siteName}><TextInput id="site-name" value={v.siteName} onChange={value => f.set('siteName', value)} error={e.siteName} placeholder="e.g. Rangsit University Main Campus" required /></Field>
      <Field id="site-lat" label="Center Latitude" full={false} error={e.centerLatitude}><TextInput id="site-lat" inputMode="decimal" value={v.centerLatitude} onChange={value => f.set('centerLatitude', value)} error={e.centerLatitude} placeholder="e.g. 13.9649" /></Field>
      <Field id="site-lng" label="Center Longitude" full={false} error={e.centerLongitude}><TextInput id="site-lng" inputMode="decimal" value={v.centerLongitude} onChange={value => f.set('centerLongitude', value)} error={e.centerLongitude} placeholder="e.g. 100.5875" /></Field>
      <Field id="site-description" label="Description" error={e.description}><TextArea id="site-description" value={v.description} onChange={value => f.set('description', value)} error={e.description} /></Field>
      <Toggle id="site-active" label="Active" description="Only active campuses can be picked in the other forms." checked={v.isActive} onChange={value => f.set('isActive', value)} />
    </fieldset></form>
  </FormDrawer>
}

export function CategoryForm({ category, onSaved, onClose }: { category?: CampusCategory; onSaved: Saved; onClose: () => void }) {
  const f = useFormState<CategoryDraft>(category ? {
    categoryCode: category.categoryCode, categoryName: category.categoryName, mobileGroup: category.mobileGroup, description: category.description ?? '', isActive: category.isActive,
  } : { categoryCode: '', categoryName: '', mobileGroup: '', description: '', isActive: true }, 'campus-category-form')
  const v = f.value
  const submit = (event: FormEvent) => f.run(event, () => validateCategory(v), async () => {
    const saved = category ? await updateCampusCategory(category.id, v) : await createCampusCategory(v)
    onSaved(saved.categoryName, category ? 'updated' : 'created')
  })
  const close = () => f.requestClose(onClose)
  const e = f.errors
  return <FormDrawer id="campus-category-form" title={category ? 'Edit Place Category' : 'Add Place Category'} description="Categories group campus places, such as Library or Cafeteria, in the student app." submitLabel={category ? 'Update Category' : 'Add Category'} pending={f.pending} failure={f.failure} discard={f.discard} onDiscardCancel={() => f.setDiscard(false)} onClose={onClose} requestClose={close}>
    <form id="campus-category-form" onSubmit={submit} noValidate><fieldset disabled={f.pending} className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2">
      <Field id="category-code" label="Category Code" required full={false} error={e.categoryCode} hint="Letters, numbers and _ only. No hyphens."><TextInput id="category-code" value={v.categoryCode} onChange={value => f.set('categoryCode', value)} error={e.categoryCode} placeholder="e.g. LIBRARY" required /></Field>
      <Field id="category-group" label="Mobile App Group" required full={false} error={e.mobileGroup}><SelectInput id="category-group" value={v.mobileGroup} onChange={value => f.set('mobileGroup', value as MobileGroup | '')} error={e.mobileGroup} placeholder="Select a group…" options={options(mobileGroups)} required /></Field>
      <Field id="category-name" label="Category Name" required error={e.categoryName}><TextInput id="category-name" value={v.categoryName} onChange={value => f.set('categoryName', value)} error={e.categoryName} placeholder="e.g. Library" required /></Field>
      <Field id="category-description" label="Description" error={e.description}><TextArea id="category-description" value={v.description} onChange={value => f.set('description', value)} error={e.description} /></Field>
      <Toggle id="category-active" label="Active" description="The backend refuses to deactivate a category that places still use." checked={v.isActive} onChange={value => f.set('isActive', value)} />
    </fieldset></form>
  </FormDrawer>
}

export function FacilityForm({ facility, onSaved, onClose }: { facility?: CampusFacility; onSaved: Saved; onClose: () => void }) {
  const f = useFormState<FacilityDraft>(facility ? {
    facilityCode: facility.facilityCode, facilityName: facility.facilityName, description: facility.description ?? '', isActive: facility.isActive,
  } : { facilityCode: '', facilityName: '', description: '', isActive: true }, 'campus-facility-form')
  const v = f.value
  const submit = (event: FormEvent) => f.run(event, () => validateFacility(v), async () => {
    const saved = facility ? await updateCampusFacility(facility.id, v) : await createCampusFacility(v)
    onSaved(saved.facilityName, facility ? 'updated' : 'created')
  })
  const close = () => f.requestClose(onClose)
  const e = f.errors
  return <FormDrawer id="campus-facility-form" title={facility ? 'Edit Facility' : 'Add Facility'} description="Facilities, such as Projector or Wi-Fi, can be attached to rooms and campus places." submitLabel={facility ? 'Update Facility' : 'Add Facility'} pending={f.pending} failure={f.failure} discard={f.discard} onDiscardCancel={() => f.setDiscard(false)} onClose={onClose} requestClose={close}>
    <form id="campus-facility-form" onSubmit={submit} noValidate><fieldset disabled={f.pending} className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2">
      <Field id="facility-code" label="Facility Code" required full={false} error={e.facilityCode} hint="Letters, numbers and _ only. No hyphens."><TextInput id="facility-code" value={v.facilityCode} onChange={value => f.set('facilityCode', value)} error={e.facilityCode} placeholder="e.g. PROJECTOR" required /></Field>
      <Field id="facility-name" label="Facility Name" required full={false} error={e.facilityName}><TextInput id="facility-name" value={v.facilityName} onChange={value => f.set('facilityName', value)} error={e.facilityName} placeholder="e.g. Projector" required /></Field>
      <Field id="facility-description" label="Description" error={e.description}><TextArea id="facility-description" value={v.description} onChange={value => f.set('description', value)} error={e.description} /></Field>
      <Toggle id="facility-active" label="Active" description="The backend refuses to deactivate a facility that rooms or places still use." checked={v.isActive} onChange={value => f.set('isActive', value)} />
    </fieldset></form>
  </FormDrawer>
}

// ---------------- Navigation destination (link a building or place to a node) ----------------

export function DestinationForm({ destination, nodes, buildings, places, onSaved, onClose }: { destination?: NavigationDestination; nodes: NavigationNode[]; buildings: BuildingListItem[]; places: CampusPlace[]; onSaved: Saved; onClose: () => void }) {
  const f = useFormState<DestinationDraft>(destination ? {
    nodeId: String(destination.node.id), ownerType: destination.building ? 'BUILDING' : 'PLACE', buildingId: destination.building ? String(destination.building.id) : '',
    placeId: destination.place ? String(destination.place.id) : '', isPrimary: destination.isPrimary, isAccessibleEntrance: destination.isAccessibleEntrance,
  } : { nodeId: '', ownerType: 'BUILDING', buildingId: '', placeId: '', isPrimary: true, isAccessibleEntrance: false }, 'campus-destination-form')
  const v = f.value
  const submit = (event: FormEvent) => f.run(event, () => validateDestination(v), async () => {
    const saved = destination ? await updateDestination(destination.id, v) : await createDestination(v)
    onSaved((saved.building ?? saved.place)?.name ?? 'Destination', destination ? 'updated' : 'created')
  })
  const close = () => f.requestClose(onClose)
  const e = f.errors
  const owner = v.ownerType === 'BUILDING' ? buildings.find(b => String(b.id) === v.buildingId) : places.find(p => String(p.id) === v.placeId)
  // A destination must stay on its owner's campus, so the node list follows the chosen building or place.
  const nodeOptions = nodes.filter(n => (!owner || n.siteId === owner.siteId) && (n.isActive || String(n.id) === v.nodeId)).map(n => ({ value: String(n.id), label: `${n.nodeName} (${n.nodeCode})${n.latitude == null ? ' · no coordinates' : ''}` }))
  return <FormDrawer id="campus-destination-form" title={destination ? 'Edit Destination' : 'Link Destination'} description="Students navigating to this building or place are routed to the chosen node, and the map uses its coordinates." submitLabel={destination ? 'Update Destination' : 'Link Destination'} pending={f.pending} failure={f.failure} blocked={nodes.length ? '' : 'Add a navigation node first, then link it to a building or place.'} discard={f.discard} onDiscardCancel={() => f.setDiscard(false)} onClose={onClose} requestClose={close}>
    <form id="campus-destination-form" onSubmit={submit} noValidate><fieldset disabled={f.pending} className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2">
      <Field id="destination-type" label="Destination Type" required><SelectInput id="destination-type" value={v.ownerType} onChange={value => f.set('ownerType', (value || 'BUILDING') as DestinationDraft['ownerType'])} placeholder="Select a type…" options={[{ value: 'BUILDING', label: 'Building' }, { value: 'PLACE', label: 'Campus Place' }]} /></Field>
      {v.ownerType === 'BUILDING'
        ? <Field id="destination-building" label="Building" required error={e.buildingId}><SelectInput id="destination-building" value={v.buildingId} onChange={value => f.set('buildingId', value)} error={e.buildingId} placeholder="Select a building…" options={buildings.map(b => ({ value: String(b.id), label: `${b.buildingName} (${b.buildingCode})` }))} required /></Field>
        : <Field id="destination-place" label="Campus Place" required error={e.placeId}><SelectInput id="destination-place" value={v.placeId} onChange={value => f.set('placeId', value)} error={e.placeId} placeholder="Select a place…" options={places.map(p => ({ value: String(p.id), label: `${p.placeName} (${p.placeCode})` }))} required /></Field>}
      <Field id="destination-node" label="Navigation Node" required error={e.nodeId} hint="Usually the entrance node of the building or place."><SelectInput id="destination-node" value={v.nodeId} onChange={value => f.set('nodeId', value)} error={e.nodeId} placeholder="Select a node…" options={nodeOptions} required /></Field>
      <Toggle id="destination-primary" label="Primary entrance" description="Default arrival point. One per building or place." checked={v.isPrimary} onChange={value => f.set('isPrimary', value)} />
      <Toggle id="destination-accessible" label="♿ Accessible entrance" description="Used for wheelchair-accessible routing." checked={v.isAccessibleEntrance} onChange={value => f.set('isAccessibleEntrance', value)} />
    </fieldset></form>
  </FormDrawer>
}
