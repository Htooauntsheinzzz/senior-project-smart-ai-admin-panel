import type { BuildingDraft, BuildingStatus, EdgeStatus, HoursDraftRow, NodeDraft, NodeType, OpeningHour, PlaceDraft, PlaceStatus, RoomDraft, RoomStatus, RoomType, RouteDraft, SurfaceType, SiteDraft, CategoryDraft, FacilityDraft, MobileGroup, ExceptionDraftRow, OpeningException, DestinationDraft } from '../types/campus'

// Backend enum value -> Figma label. Submitted values are always the enum keys.
export const buildingStatuses: Record<BuildingStatus, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: 'Active', bg: '#d1fae5', text: '#059669' },
  UNDER_RENOVATION: { label: 'Under Renovation', bg: '#fef3c7', text: '#b45309' },
  INACTIVE: { label: 'Inactive', bg: '#f3f4f6', text: '#6b7280' },
}

export const roomStatuses: Record<RoomStatus, { label: string; bg: string; text: string }> = {
  AVAILABLE: { label: 'Available', bg: '#d1fae5', text: '#059669' },
  OCCUPIED: { label: 'Occupied', bg: '#fee2e2', text: '#dc2626' },
  RESERVED: { label: 'Reserved', bg: '#dbeafe', text: '#1d4ed8' },
  MAINTENANCE: { label: 'Under Maintenance', bg: '#fef3c7', text: '#b45309' },
  INACTIVE: { label: 'Inactive', bg: '#f3f4f6', text: '#6b7280' },
}

export const roomTypes: Record<RoomType, { label: string; icon: string; bg: string; text: string }> = {
  CLASSROOM: { label: 'Classroom', icon: '📖', bg: '#eff6ff', text: '#1d4ed8' },
  COMPUTER_LAB: { label: 'Computer Lab', icon: '💻', bg: '#f5f3ff', text: '#5b21b6' },
  LABORATORY: { label: 'Laboratory', icon: '🔬', bg: '#ecfdf5', text: '#047857' },
  LECTURE_HALL: { label: 'Lecture Hall', icon: '🎓', bg: '#fff7ed', text: '#c2410c' },
  MEETING_ROOM: { label: 'Meeting Room', icon: '🤝', bg: '#fff1f2', text: '#be123c' },
  STUDY_ROOM: { label: 'Study Room', icon: '📚', bg: '#fefce8', text: '#a16207' },
  OFFICE: { label: 'Office', icon: '🗂️', bg: '#f1f5f9', text: '#475569' },
  OTHER: { label: 'Other', icon: '🏷️', bg: '#f3f4f6', text: '#4b5563' },
}

export const placeStatuses: Record<PlaceStatus, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: 'Open', bg: '#d1fae5', text: '#059669' },
  TEMPORARILY_CLOSED: { label: 'Temporarily Closed', bg: '#fef3c7', text: '#b45309' },
  INACTIVE: { label: 'Inactive', bg: '#f3f4f6', text: '#6b7280' },
}

export const edgeStatuses: Record<EdgeStatus, { label: string; bg: string; text: string; line: string; dash?: string }> = {
  ACTIVE: { label: 'Active', bg: '#d1fae5', text: '#059669', line: '#3cb4e6' },
  INACTIVE: { label: 'Inactive', bg: '#f3f4f6', text: '#6b7280', line: '#9ca3af', dash: '6 5' },
  UNDER_CONSTRUCTION: { label: 'Under Construction', bg: '#fef3c7', text: '#b45309', line: '#f59e0b', dash: '6 5' },
}

export const surfaceTypes: Record<SurfaceType, string> = {
  PAVED: 'Paved', COVERED_WALKWAY: 'Covered Walkway', GRAVEL: 'Gravel', STAIRS: 'Stairs', RAMP: 'Ramp', OTHER: 'Other',
}

export const nodeTypes: Record<NodeType, { label: string; icon: string }> = {
  ENTRANCE: { label: 'Entrance', icon: '🏛️' },
  JUNCTION: { label: 'Junction', icon: '' },
  GATE: { label: 'Gate', icon: '🚪' },
  POINT_OF_INTEREST: { label: 'Point of Interest', icon: '📍' },
  OTHER: { label: 'Other', icon: '•' },
}

export const mobileGroups: Record<MobileGroup, string> = {
  BUILDINGS: 'Buildings', FOOD: 'Food', LIBRARY: 'Library', STUDENT_SERVICES: 'Student Services', HEALTH: 'Health', PARKING: 'Parking', OTHER: 'Other',
}

export const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/** Floors are integers in the backend (negative = basement). */
export function floorLabel(floor: number) {
  if (floor > 0) return `F${floor}`
  if (floor === 0) return 'G'
  return `B${-floor}`
}

export function formatArea(value: number | null) {
  return value == null ? null : `${Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 })} m²`
}

export function formatDistance(value: number) {
  return `${Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 })} m`
}

/** Opening hour summaries come from the backend; show en dash like Figma. */
export function formatHours(summary: string | null | undefined) {
  return summary ? summary.replace(/\s*-\s*/g, '–') : '—'
}

const categoryStyles: { match: RegExp; icon: string; bg: string; border: string; tag: string }[] = [
  { match: /librar/i, icon: '📚', bg: '#f5f3ff', border: 'rgba(124,58,237,0.6)', tag: '#5b21b6' },
  { match: /cafeteria|food|canteen|dining|restaurant/i, icon: '🍽️', bg: '#fff7ed', border: 'rgba(249,115,22,0.6)', tag: '#c2410c' },
  { match: /registrar/i, icon: '📋', bg: '#f0fdf4', border: 'rgba(22,163,74,0.6)', tag: '#15803d' },
  { match: /student|affairs|counsel/i, icon: '🎓', bg: '#fff1f2', border: 'rgba(225,29,72,0.6)', tag: '#be123c' },
  { match: /health|medical|clinic/i, icon: '⚕️', bg: '#fff0fb', border: 'rgba(162,28,175,0.6)', tag: '#a21caf' },
  { match: /atm|bank/i, icon: '💳', bg: '#fefce8', border: 'rgba(202,138,4,0.6)', tag: '#a16207' },
  { match: /park/i, icon: '🅿️', bg: '#f8fafc', border: 'rgba(100,116,139,0.6)', tag: '#475569' },
  { match: /sport|gym|pool/i, icon: '🏊', bg: '#ecfdf5', border: 'rgba(5,150,105,0.6)', tag: '#047857' },
  { match: /gate/i, icon: '🚪', bg: '#eff6ff', border: 'rgba(59,130,246,0.6)', tag: '#1d4ed8' },
  { match: /building|academic/i, icon: '🏛️', bg: '#eff6ff', border: 'rgba(59,130,246,0.6)', tag: '#1d4ed8' },
]

/** Visual for a backend category name; unknown categories get a neutral pin. */
export function categoryVisual(name: string | null | undefined) {
  const found = categoryStyles.find(style => style.match.test(name ?? ''))
  return found ?? { icon: '📍', bg: '#f8fafc', border: 'rgba(100,116,139,0.6)', tag: '#475569' }
}

const facilityIcons: [RegExp, string][] = [
  [/projector/i, '📽'], [/air|a\/c|\bac\b|aircon/i, '❄️'], [/white ?board|board/i, '📋'], [/computer|pc/i, '💻'],
  [/wi-?fi|internet/i, '📶'], [/sound|speaker|audio|mic/i, '🔊'], [/wheelchair|accessib/i, '♿'], [/power|outlet|plug/i, '🔌'],
]

export function facilityIcon(facility: { code: string; name: string }) {
  const text = `${facility.code} ${facility.name}`
  return facilityIcons.find(([match]) => match.test(text))?.[1] ?? '🏷️'
}

// ---- Validation (mirrors the request DTO constraints) ----

const positiveId = /^[1-9]\d{0,15}$/
export const isPositiveId = (value: string) => positiveId.test(value) && Number.isSafeInteger(Number(value))
const decimal = (value: string, integer: number, fraction: number) => new RegExp(`^\\d{1,${integer}}(\\.\\d{1,${fraction}})?$`).test(value.trim())
// Up to 15 decimal places, matching the backend NUMERIC(18,15) columns (V55), so values pasted
// from Google Maps such as 13.964438098079592 are accepted as typed.
const COORDINATE_DECIMALS = 15
const coordinate = (value: string) => new RegExp(`^-?\\d{1,3}(\\.\\d{1,${COORDINATE_DECIMALS}})?$`).test(value.trim())
const coordinateError = (value: string, max: number, label: string) =>
  !coordinate(value) ? `Enter ${label.toLowerCase()} as a number with at most ${COORDINATE_DECIMALS} decimal places.`
    : Math.abs(Number(value)) > max ? `${label} must be between -${max} and ${max}.` : ''

type Errors<T> = Partial<Record<keyof T, string>>

// The backend upper-cases codes, then checks them against these patterns (CampusWriteSupport).
const codeFormats = {
  code: { pattern: /^[A-Z0-9][A-Z0-9._-]*$/, message: 'Start with a letter or number, then use only letters, numbers, dots, hyphens or underscores.' },
  reference: { pattern: /^[A-Z][A-Z0-9_]*$/, message: 'Start with a letter, then use only letters, numbers and underscores (no hyphens or spaces), for example LIB or WI_FI.' },
  room: { pattern: /^[A-Z0-9][A-Z0-9._ /-]*$/, message: 'Start with a letter or number, then use only letters, numbers, spaces, dots, slashes or hyphens.' },
}
export function codeError(value: string, max: number, missing: string, format: keyof typeof codeFormats = 'code') {
  const code = value.trim().toUpperCase()
  if (!code) return missing
  if (code.length > max) return `Use at most ${max} characters.`
  return codeFormats[format].pattern.test(code) ? undefined : codeFormats[format].message
}

export function validateBuilding(value: BuildingDraft, needsSite: boolean) {
  const errors: Errors<BuildingDraft> = {}
  if (needsSite && !isPositiveId(value.siteId)) errors.siteId = 'Select a campus.'
  const buildingCodeError = codeError(value.buildingCode, 50, 'Building code is required.')
  if (buildingCodeError) errors.buildingCode = buildingCodeError
  if (!value.buildingName.trim()) errors.buildingName = 'Building name is required.'
  else if (value.buildingName.trim().length > 200) errors.buildingName = 'Use at most 200 characters.'
  if (value.buildingNameTh.trim().length > 200) errors.buildingNameTh = 'Use at most 200 characters.'
  if (value.description.trim().length > 5000) errors.description = 'Use at most 5000 characters.'
  if (!/^\d+$/.test(value.totalFloors.trim()) || Number(value.totalFloors) < 1 || Number(value.totalFloors) > 200) errors.totalFloors = 'Enter a whole number from 1 to 200.'
  if (value.areaSquareMeters.trim() && (!decimal(value.areaSquareMeters, 10, 2) || Number(value.areaSquareMeters) <= 0)) errors.areaSquareMeters = 'Enter a positive area with up to 2 decimals.'
  return errors
}

export function validateRoom(value: RoomDraft, lowestFloor: number, totalFloors: number | null) {
  const errors: Errors<RoomDraft> = {}
  if (!isPositiveId(value.buildingId)) errors.buildingId = 'Select a building.'
  const roomNumberError = codeError(value.roomNumber, 50, 'Room number is required.', 'room')
  if (roomNumberError) errors.roomNumber = roomNumberError
  if (value.roomName.trim().length > 200) errors.roomName = 'Use at most 200 characters.'
  if (!/^-?\d{1,5}$/.test(value.floorNumber.trim())) errors.floorNumber = 'Enter a floor number.'
  else if (Number(value.floorNumber) < lowestFloor || (totalFloors != null && Number(value.floorNumber) > totalFloors)) errors.floorNumber = `Floor must be between ${floorLabel(lowestFloor)} and ${totalFloors != null ? floorLabel(totalFloors) : 'the top floor'}.`
  if (!value.roomType) errors.roomType = 'Select a room type.'
  if (value.capacity.trim() && (!/^\d+$/.test(value.capacity.trim()) || Number(value.capacity) < 1 || Number(value.capacity) > 2147483647)) errors.capacity = 'Enter a positive whole number.'
  return errors
}

export function validatePlace(value: PlaceDraft, needsSite: boolean) {
  const errors: Errors<PlaceDraft> = {}
  if (needsSite && !isPositiveId(value.siteId)) errors.siteId = 'Select a campus.'
  if (!isPositiveId(value.categoryId)) errors.categoryId = 'Select a category.'
  if (value.buildingId && !isPositiveId(value.buildingId)) errors.buildingId = 'Select a building.'
  const placeCodeError = codeError(value.placeCode, 50, 'Place code is required.')
  if (placeCodeError) errors.placeCode = placeCodeError
  if (!value.placeName.trim()) errors.placeName = 'Place name is required.'
  else if (value.placeName.trim().length > 200) errors.placeName = 'Use at most 200 characters.'
  if (value.placeNameTh.trim().length > 200) errors.placeNameTh = 'Use at most 200 characters.'
  if (value.description.trim().length > 5000) errors.description = 'Use at most 5000 characters.'
  if (value.floorLabel.trim().length > 60) errors.floorLabel = 'Use at most 60 characters.'
  if (value.phoneNumber.trim().length > 50) errors.phoneNumber = 'Use at most 50 characters.'
  else if (value.phoneNumber.trim() && !/^\+?[0-9][0-9 ()-]{2,48}$/.test(value.phoneNumber.trim())) errors.phoneNumber = 'Use digits, spaces, brackets or hyphens, with an optional leading +.'
  return errors
}

export function validateNode(value: NodeDraft, needsSite: boolean) {
  const errors: Errors<NodeDraft> = {}
  if (needsSite && !isPositiveId(value.siteId)) errors.siteId = 'Select a campus.'
  const nodeCodeError = codeError(value.nodeCode, 50, 'Node code is required.')
  if (nodeCodeError) errors.nodeCode = nodeCodeError
  if (!value.nodeName.trim()) errors.nodeName = 'Node name is required.'
  else if (value.nodeName.trim().length > 200) errors.nodeName = 'Use at most 200 characters.'
  if (!value.nodeType) errors.nodeType = 'Select a node type.'
  const lat = value.latitude.trim(), lng = value.longitude.trim()
  if (!!lat !== !!lng) { if (!lat) errors.latitude = 'Enter both latitude and longitude, or leave both blank.'; else errors.longitude = 'Enter both latitude and longitude, or leave both blank.' }
  if (lat && coordinateError(lat, 90, 'Latitude')) errors.latitude = coordinateError(lat, 90, 'Latitude')
  if (lng && coordinateError(lng, 180, 'Longitude')) errors.longitude = coordinateError(lng, 180, 'Longitude')
  return errors
}

export function validateRoute(value: RouteDraft, needsSite: boolean) {
  const errors: Errors<RouteDraft> = {}
  if (needsSite && !isPositiveId(value.siteId)) errors.siteId = 'Select a campus.'
  const edgeCodeError = codeError(value.edgeCode, 50, 'Route code is required.')
  if (edgeCodeError) errors.edgeCode = edgeCodeError
  if (!isPositiveId(value.startNodeId)) errors.startNodeId = 'Select a start node.'
  if (!isPositiveId(value.endNodeId)) errors.endNodeId = 'Select an end node.'
  else if (value.endNodeId === value.startNodeId) errors.endNodeId = 'Start and end nodes must be different.'
  if (!decimal(value.distanceMeters, 8, 2) || Number(value.distanceMeters) <= 0) errors.distanceMeters = 'Enter a positive distance with up to 2 decimals.'
  if (!value.surfaceType) errors.surfaceType = 'Select a surface type.'
  return errors
}

/** Rows are complete only when every open day has both times. */
export function validateHours(rows: HoursDraftRow[]) {
  for (const row of rows) {
    if (row.closed) continue
    if (!row.opensAt && !row.closesAt) continue
    if (!row.opensAt || !row.closesAt) return `${weekdays[row.dayOfWeek - 1]} needs both opening and closing times.`
    if (row.closesAt <= row.opensAt) return `${weekdays[row.dayOfWeek - 1]}: closing time must be after opening time.`
  }
  return ''
}

export function hoursDraft(hours: OpeningHour[] | undefined): HoursDraftRow[] {
  return weekdays.map((_, index) => {
    const found = hours?.find(hour => hour.dayOfWeek === index + 1)
    return { dayOfWeek: index + 1, closed: found?.closed ?? false, opensAt: found?.opensAt ?? '', closesAt: found?.closesAt ?? '' }
  })
}

// ---- Errors ----

interface ErrorShape { response?: { status?: number; data?: { code?: string; message?: string } }; code?: string; message?: string }

const safeCodes = /^(CAMPUS_[A-Z_]+|VALIDATION_ERROR)$/

/**
 * Campus failures carry hand-written, non-sensitive messages (CampusFailure.java),
 * so 4xx campus messages are shown. 5xx and unknown errors never expose server text.
 */
export function campusError(error: unknown, notFound = 'The requested record was not found.') {
  const failure = error as ErrorShape
  const response = failure?.response
  if (!response) {
    if (failure?.code === 'ERR_CANCELED') return ''
    if (error instanceof Error && error.message.startsWith('Campus:')) return error.message.slice(7).trim()
    return 'Unable to connect to the server. Please try again.'
  }
  const status = response.status ?? 0
  const code = response.data?.code ?? ''
  const message = response.data?.message ?? ''
  if (status === 403) return 'You do not have permission to perform this action.'
  if (status === 401) return 'Your session has expired. Please sign in again.'
  if (status >= 500) return 'Unable to complete the request. Please try again.'
  if (status === 404 && !safeCodes.test(code)) return notFound
  if ([400, 404, 409, 422].includes(status) && safeCodes.test(code) && message && message.length <= 300) {
    return code === 'VALIDATION_ERROR' && message === 'The request is invalid.' ? 'The request is invalid. Check the entered values.' : message
  }
  if (status === 409) return 'The request conflicts with current server data. Refresh and try again.'
  return 'The request is invalid. Check the entered values.'
}

/** Field the backend error code points to, for inline form highlighting. */
export function campusErrorField(error: unknown): string | null {
  const code = (error as ErrorShape)?.response?.data?.code
  switch (code) {
    case 'CAMPUS_INVALID_SITE': return 'siteId'
    case 'CAMPUS_INVALID_BUILDING': return 'buildingId'
    case 'CAMPUS_INVALID_CATEGORY': return 'categoryId'
    case 'CAMPUS_INVALID_FLOOR': return 'floorNumber'
    case 'CAMPUS_INVALID_NODE': return 'startNodeId'
    case 'CAMPUS_INVALID_COORDINATES': return 'latitude'
    default: return null
  }
}

// ---- Map projection ----

export interface Projected<T> { item: T; x: number; y: number }

/**
 * Projects latitude/longitude records into a width×height box (equirectangular,
 * corrected for latitude). Records without both coordinates are returned separately.
 */
export function project<T>(items: T[], coords: (item: T) => { latitude: number | null; longitude: number | null }, width: number, height: number, padding: number) {
  const placed = items.map(item => ({ item, ...coords(item) })).filter(p => p.latitude != null && p.longitude != null) as { item: T; latitude: number; longitude: number }[]
  const missing = items.filter(item => { const c = coords(item); return c.latitude == null || c.longitude == null })
  if (!placed.length) return { points: [] as Projected<T>[], missing, metersPerPixel: null as number | null, at: null as ((latitude: number, longitude: number) => { x: number; y: number }) | null }
  const lats = placed.map(p => Number(p.latitude)), lngs = placed.map(p => Number(p.longitude))
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2
  const k = Math.cos((midLat * Math.PI) / 180)
  const xs = lngs.map(lng => lng * k)
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...lats), maxY = Math.max(...lats)
  const spanX = Math.max(maxX - minX, 1e-6), spanY = Math.max(maxY - minY, 1e-6)
  const scale = Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY)
  const offsetX = (width - spanX * scale) / 2, offsetY = (height - spanY * scale) / 2
  // `at` places any other coordinate (e.g. route geometry) in the same frame.
  const at = (latitude: number, longitude: number) => ({ x: offsetX + (Number(longitude) * k - minX) * scale, y: offsetY + (maxY - Number(latitude)) * scale })
  const points = placed.map(p => ({ item: p.item, ...at(p.latitude, p.longitude) }))
  // 1 degree of latitude ≈ 111,320 m.
  return { points, missing, metersPerPixel: placed.length > 1 ? 111320 / scale : null, at }
}

// ---- Campus setup (CampusSiteRequest / CampusCategoryRequest / CampusFacilityRequest) ----

const required = (value: string, max: number, missing: string) => (!value.trim() ? missing : value.trim().length > max ? `Use at most ${max} characters.` : undefined)
const optional = (value: string, max: number) => (value.trim().length > max ? `Use at most ${max} characters.` : undefined)

export function validateSite(value: SiteDraft) {
  const errors: Errors<SiteDraft> = {
    siteCode: codeError(value.siteCode, 50, 'Campus code is required.'),
    siteName: required(value.siteName, 200, 'Campus name is required.'),
    description: optional(value.description, 5000),
    timezone: optional(value.timezone, 60),
  }
  const lat = value.centerLatitude.trim(), lng = value.centerLongitude.trim()
  if (!!lat !== !!lng) errors[lat ? 'centerLongitude' : 'centerLatitude'] = 'Enter both latitude and longitude, or leave both blank.'
  if (lat && coordinateError(lat, 90, 'Latitude')) errors.centerLatitude = coordinateError(lat, 90, 'Latitude')
  if (lng && coordinateError(lng, 180, 'Longitude')) errors.centerLongitude = coordinateError(lng, 180, 'Longitude')
  return errors
}

export function validateCategory(value: CategoryDraft) {
  return {
    categoryCode: codeError(value.categoryCode, 60, 'Category code is required.', 'reference'),
    categoryName: required(value.categoryName, 150, 'Category name is required.'),
    mobileGroup: value.mobileGroup ? undefined : 'Select a mobile app group.',
    description: optional(value.description, 5000),
  } as Errors<CategoryDraft>
}

export function validateFacility(value: FacilityDraft) {
  return {
    facilityCode: codeError(value.facilityCode, 60, 'Facility code is required.', 'reference'),
    facilityName: required(value.facilityName, 150, 'Facility name is required.'),
    description: optional(value.description, 5000),
  } as Errors<FacilityDraft>
}

// ---- Opening exceptions and destinations ----

export function exceptionsDraft(rows: OpeningException[] | undefined): ExceptionDraftRow[] {
  return (rows ?? []).map(row => ({ date: row.date, closed: row.closed, opensAt: row.opensAt?.slice(0, 5) ?? '', closesAt: row.closesAt?.slice(0, 5) ?? '', reason: row.reason ?? '' }))
}

export function validateExceptions(rows: ExceptionDraftRow[]) {
  const seen = new Set<string>()
  for (const row of rows) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) return 'Every special date needs a date.'
    if (seen.has(row.date)) return `${row.date} is listed twice.`
    seen.add(row.date)
    if (row.reason.trim().length > 255) return `${row.date}: use at most 255 characters for the reason.`
    if (row.closed) continue
    if (!row.opensAt || !row.closesAt) return `${row.date} needs both opening and closing times, or tick Closed.`
    if (row.closesAt <= row.opensAt) return `${row.date}: closing time must be after opening time.`
  }
  if (rows.length > 366) return 'Use at most 366 special dates.'
  return ''
}

export function validateDestination(value: DestinationDraft) {
  return {
    nodeId: isPositiveId(value.nodeId) ? undefined : 'Select a navigation node.',
    buildingId: value.ownerType === 'BUILDING' && !isPositiveId(value.buildingId) ? 'Select a building.' : undefined,
    placeId: value.ownerType === 'PLACE' && !isPositiveId(value.placeId) ? 'Select a campus place.' : undefined,
  } as Partial<Record<keyof DestinationDraft, string>>
}
