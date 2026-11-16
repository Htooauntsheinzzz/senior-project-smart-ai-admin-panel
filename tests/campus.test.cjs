const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

// Same harness as the other service tests: TypeScript is transpiled and apiClient is stubbed.
function harness() {
  const calls = [], cache = new Map()
  let handler = async () => ({ data: undefined })
  const api = Object.fromEntries(['get', 'post', 'put', 'delete'].map(method => [method, async (...args) => { calls.push({ method, args }); return handler(method, ...args) }]))
  function load(file) {
    file = path.resolve(__dirname, '..', file)
    if (!path.extname(file)) file += '.ts'
    if (cache.has(file)) return cache.get(file).exports
    const module = { exports: {} }; cache.set(file, module)
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(name => name.includes('apiClient') ? { __esModule: true, default: api } : load(path.resolve(path.dirname(file), name)), module, module.exports)
    return module.exports
  }
  return { calls, load, respond: next => { handler = next } }
}

const page = (content, extra = {}) => ({ data: { content, page: 0, size: 100, totalElements: content.length, totalPages: 1, first: true, last: true, sort: [], ...extra } })
const buildingDraft = { siteId: '1', buildingCode: ' RSB ', buildingName: ' Rangsit Building ', buildingNameTh: ' ', description: '', totalFloors: '8', areaSquareMeters: '1250.5', status: 'ACTIVE' }
const roomDraft = { buildingId: '3', roomNumber: ' 201 ', roomName: '', floorNumber: '2', roomType: 'CLASSROOM', capacity: '', status: 'AVAILABLE', facilityIds: ['4', '9'] }
const placeDraft = { siteId: '1', categoryId: '2', buildingId: '', placeCode: ' LIB ', placeName: ' Library ', placeNameTh: '', description: ' Quiet zone ', floorLabel: '', phoneNumber: '', isPopular: true, isVisibleOnMobile: false, status: 'TEMPORARILY_CLOSED', facilityIds: [] }
const nodeDraft = { siteId: '1', nodeCode: ' JCT-A ', nodeName: ' Junction A ', nodeType: 'JUNCTION', latitude: '13.9649', longitude: '100.5875', isAccessible: false, isActive: true }
const routeDraft = { siteId: '1', edgeCode: ' R01 ', startNodeId: '5', endNodeId: '6', distanceMeters: '180', surfaceType: 'COVERED_WALKWAY', isWheelchairAccessible: true, isBidirectional: false, status: 'UNDER_CONSTRUCTION' }

test('building payload trims text, keeps backend enum and sends siteId only on create', () => {
  const s = harness().load('src/services/buildingService.ts')
  assert.deepEqual(s.buildingPayload(buildingDraft, 'create'), { siteId: 1, buildingCode: 'RSB', buildingName: 'Rangsit Building', buildingNameTh: null, description: null, totalFloors: 8, areaSquareMeters: 1250.5, status: 'ACTIVE' })
  assert.equal('siteId' in s.buildingPayload(buildingDraft, 'update'), false)
  assert.throws(() => s.buildingPayload({ ...buildingDraft, siteId: '' }, 'create'))
})

test('opening hours payload sends closed days with null times and skips blank days', () => {
  const s = harness().load('src/services/buildingService.ts')
  const rows = [{ dayOfWeek: 1, closed: false, opensAt: '08:00', closesAt: '17:30' }, { dayOfWeek: 2, closed: false, opensAt: '', closesAt: '' }, { dayOfWeek: 7, closed: true, opensAt: '', closesAt: '' }]
  assert.deepEqual(s.openingHoursPayload(rows), { hours: [{ dayOfWeek: 1, opensAt: '08:00', closesAt: '17:30', closed: false }, { dayOfWeek: 7, opensAt: null, closesAt: null, closed: true }] })
})

test('room, place, node and route payloads match the request DTOs', () => {
  const h = harness()
  const room = h.load('src/services/roomService.ts'), place = h.load('src/services/campusPlaceService.ts'), nav = h.load('src/services/navigationRouteService.ts')
  assert.deepEqual(room.roomPayload(roomDraft), { buildingId: 3, roomNumber: '201', roomName: null, floorNumber: 2, roomType: 'CLASSROOM', capacity: null, status: 'AVAILABLE', facilityIds: [4, 9] })
  assert.throws(() => room.roomPayload({ ...roomDraft, roomType: '' }))
  const created = place.placePayload(placeDraft, 'create')
  assert.equal(created.siteId, 1); assert.equal(created.buildingId, null); assert.deepEqual(created.facilityIds, []); assert.equal(created.isVisibleOnMobile, false); assert.equal(created.description, 'Quiet zone')
  assert.equal('siteId' in place.placePayload(placeDraft, 'update'), false)
  assert.deepEqual(nav.nodePayload(nodeDraft, 'create'), { siteId: 1, nodeCode: 'JCT-A', nodeName: 'Junction A', nodeType: 'JUNCTION', latitude: 13.9649, longitude: 100.5875, isAccessible: false, isActive: true })
  assert.equal(nav.nodePayload({ ...nodeDraft, latitude: '', longitude: '' }, 'update').latitude, null)
  const points = [{ latitude: 13.96, longitude: 100.58 }]
  assert.deepEqual(nav.routePayload(routeDraft, 'update', points), { edgeCode: 'R01', startNodeId: 5, endNodeId: 6, distanceMeters: 180, surfaceType: 'COVERED_WALKWAY', isWheelchairAccessible: true, isBidirectional: false, status: 'UNDER_CONSTRUCTION', intermediatePoints: points })
  assert.equal(nav.routePayload(routeDraft, 'create').siteId, 1)
})

test('list requests drop blank params and use backend filter names', async () => {
  const h = harness(), rooms = h.load('src/services/roomService.ts'), buildings = h.load('src/services/buildingService.ts')
  h.respond(async () => page([]))
  await rooms.getRooms({ page: 1, size: 10, search: '  lab ', buildingId: '3', floorNumber: '', roomType: '', status: 'MAINTENANCE' })
  assert.equal(h.calls[0].args[0], '/campus/rooms')
  assert.deepEqual(h.calls[0].args[1].params, { page: 1, size: 10, search: 'lab', buildingId: 3, status: 'MAINTENANCE' })
  await buildings.getBuildings({ page: 0, size: 8, search: ' ', status: '' })
  assert.deepEqual(h.calls[1].args[1].params, { page: 0, size: 8 })
})

test('route filter chips map to status and isWheelchairAccessible', async () => {
  const h = harness(), nav = h.load('src/services/navigationRouteService.ts')
  assert.deepEqual(nav.routeFilterParams('ALL'), {})
  assert.deepEqual(nav.routeFilterParams('INACTIVE'), { status: 'INACTIVE' })
  assert.deepEqual(nav.routeFilterParams('ACCESSIBLE'), { isWheelchairAccessible: true })
  h.respond(async () => page([]))
  await nav.getRoutes('ACCESSIBLE')
  assert.equal(h.calls[0].args[0], '/campus/navigation/edges')
  assert.deepEqual(h.calls[0].args[1].params, { isWheelchairAccessible: true, page: 0, size: 100 })
})

test('getAllPages reads every page and rejects malformed responses', async () => {
  const h = harness(), common = h.load('src/services/campusCommon.ts')
  h.respond(async (method, url, options) => page([{ id: options.params.page }], { page: options.params.page, totalPages: 3, last: options.params.page === 2 }))
  assert.deepEqual((await common.getAllPages('/campus/places', { status: '' })).map(row => row.id), [0, 1, 2])
  assert.deepEqual(h.calls[0].args[1].params, { page: 0, size: 100 })
  h.respond(async () => ({ data: { success: true } }))
  await assert.rejects(common.getAllPages('/campus/places', {}), /Unexpected server response/)
})

test('campus errors never expose server text for 5xx and show safe campus messages', () => {
  const u = harness().load('src/utils/campusApi.ts')
  const fail = (status, data) => ({ response: { status, data } })
  assert.equal(u.campusError(fail(500, { code: 'CAMPUS_X', message: 'SQL failed' })), 'Unable to complete the request. Please try again.')
  assert.equal(u.campusError({ message: 'Network Error' }), 'Unable to connect to the server. Please try again.')
  assert.equal(u.campusError({ code: 'ERR_CANCELED' }), '')
  assert.equal(u.campusError(fail(409, { code: 'CAMPUS_IN_USE', message: 'Navigation edges still use this node.' })), 'Navigation edges still use this node.')
  assert.equal(u.campusError(fail(400, { code: 'SOMETHING_ELSE', message: 'internal detail' })), 'The request is invalid. Check the entered values.')
  assert.equal(u.campusError(fail(404, {}), 'Room not found.'), 'Room not found.')
  assert.equal(u.campusError(fail(403, {})), 'You do not have permission to perform this action.')
  assert.equal(u.campusError(new Error('Campus: Select a valid option.')), 'Select a valid option.')
  assert.equal(u.campusErrorField(fail(400, { code: 'CAMPUS_INVALID_FLOOR' })), 'floorNumber')
})

test('validators mirror DTO limits', () => {
  const u = harness().load('src/utils/campusApi.ts')
  assert.deepEqual(u.validateBuilding(buildingDraft, true), {})
  assert.ok(u.validateBuilding({ ...buildingDraft, totalFloors: '0' }, true).totalFloors)
  assert.ok(u.validateBuilding({ ...buildingDraft, siteId: '' }, true).siteId)
  assert.deepEqual(u.validateRoom(roomDraft, -5, 8), {})
  assert.ok(u.validateRoom({ ...roomDraft, floorNumber: '9' }, -5, 8).floorNumber)
  assert.ok(u.validateRoom({ ...roomDraft, floorNumber: '2.5' }, -5, 8).floorNumber)
  assert.deepEqual(u.validateNode(nodeDraft, true), {})
  assert.ok(u.validateNode({ ...nodeDraft, longitude: '' }, true).latitude || u.validateNode({ ...nodeDraft, longitude: '' }, true).longitude)
  assert.ok(u.validateNode({ ...nodeDraft, latitude: '91' }, true).latitude)
  // Full-precision coordinates (e.g. copied from Google Maps) are accepted up to 15 decimals.
  assert.deepEqual(u.validateNode({ ...nodeDraft, latitude: '13.964438098079592', longitude: '100.5866727383530' }, true), {})
  assert.match(u.validateNode({ ...nodeDraft, latitude: '13.9644380980795921' }, true).latitude, /15 decimal places/)
  assert.match(u.validateNode({ ...nodeDraft, latitude: 'abc' }, true).latitude, /15 decimal places/)
  assert.match(u.validateNode({ ...nodeDraft, longitude: '180.5' }, true).longitude, /between -180 and 180/)
  assert.deepEqual(u.validateRoute(routeDraft, true), {})
  assert.ok(u.validateRoute({ ...routeDraft, endNodeId: '5' }, true).endNodeId)
  assert.ok(u.validateRoute({ ...routeDraft, distanceMeters: '0' }, true).distanceMeters)
  assert.equal(u.validateHours([{ dayOfWeek: 1, closed: false, opensAt: '18:00', closesAt: '08:00' }]), 'Monday: closing time must be after opening time.')
  assert.equal(u.floorLabel(0), 'G'); assert.equal(u.floorLabel(-2), 'B2'); assert.equal(u.floorLabel(3), 'F3')
})

test('map projection keeps every layer in one frame and reports records without coordinates', () => {
  const u = harness().load('src/utils/campusApi.ts')
  const items = [{ id: 1, latitude: 13.96, longitude: 100.58 }, { id: 2, latitude: 13.97, longitude: 100.59 }, { id: 3, latitude: null, longitude: null }]
  const result = u.project(items, item => item, 1000, 800, 50)
  assert.equal(result.points.length, 2)
  assert.deepEqual(result.missing.map(item => item.id), [3])
  const near = 1e-6
  for (const point of result.points) { assert.ok(point.x >= 50 - near && point.x <= 950 + near); assert.ok(point.y >= 50 - near && point.y <= 750 + near) }
  const second = result.points.find(point => point.item.id === 2)
  assert.deepEqual(result.at(13.97, 100.59), { x: second.x, y: second.y })
  assert.ok(result.points.find(point => point.item.id === 1).y > second.y, 'north is up')
  assert.ok(result.metersPerPixel > 0)
  assert.equal(u.project([items[2]], item => item, 1000, 800, 50).at, null)
})

test('campus setup payloads and validators match the site, category and facility DTOs', () => {
  const h = harness(), setup = h.load('src/services/campusSetupService.ts'), u = h.load('src/utils/campusApi.ts')
  const site = { siteCode: ' RSU ', siteName: ' Rangsit ', description: '', timezone: 'Asia/Bangkok', centerLatitude: '13.9649', centerLongitude: '100.5875', isActive: true }
  assert.deepEqual(setup.sitePayload(site), { siteCode: 'RSU', siteName: 'Rangsit', description: null, timezone: 'Asia/Bangkok', centerLatitude: 13.9649, centerLongitude: 100.5875, isActive: true })
  const clean = errors => Object.fromEntries(Object.entries(errors).filter(([, message]) => message))
  assert.deepEqual(clean(u.validateSite(site)), {})
  assert.deepEqual(clean(u.validateSite({ ...site, centerLatitude: '13.964438098079592', centerLongitude: '100.5866727383530' })), {})
  assert.deepEqual(setup.sitePayload({ ...site, centerLatitude: '13.964438098079592', centerLongitude: '100.5866727383530' }).centerLatitude, 13.964438098079592)
  assert.ok(u.validateSite({ ...site, siteCode: ' ' }).siteCode)
  assert.ok(u.validateSite({ ...site, centerLongitude: '' }).centerLongitude)
  assert.ok(u.validateSite({ ...site, centerLatitude: '91' }).centerLatitude)
  const category = { categoryCode: ' LIB ', categoryName: 'Library', mobileGroup: 'LIBRARY', description: ' ', isActive: true }
  assert.deepEqual(setup.categoryPayload(category), { categoryCode: 'LIB', categoryName: 'Library', mobileGroup: 'LIBRARY', description: null, isActive: true })
  assert.ok(u.validateCategory({ ...category, mobileGroup: '' }).mobileGroup)
  assert.throws(() => setup.categoryPayload({ ...category, mobileGroup: '' }))
  assert.deepEqual(setup.facilityPayload({ facilityCode: 'WIFI', facilityName: ' Wi-Fi ', description: '', isActive: false }), { facilityCode: 'WIFI', facilityName: 'Wi-Fi', description: null, isActive: false })
  assert.ok(u.validateFacility({ facilityCode: '', facilityName: 'x', description: '', isActive: true }).facilityCode)
})

test('special dates payload and validator match CampusOpeningExceptionsRequest', async () => {
  const h = harness(), b = h.load('src/services/buildingService.ts'), p = h.load('src/services/campusPlaceService.ts'), u = h.load('src/utils/campusApi.ts')
  const rows = [{ date: '2026-12-31', closed: true, opensAt: '09:00', closesAt: '17:00', reason: ' New Year ' }, { date: '2027-01-02', closed: false, opensAt: '10:00', closesAt: '14:00', reason: '' }]
  assert.deepEqual(b.openingExceptionsPayload(rows), { exceptions: [{ date: '2026-12-31', closed: true, opensAt: null, closesAt: null, reason: 'New Year' }, { date: '2027-01-02', closed: false, opensAt: '10:00', closesAt: '14:00', reason: null }] })
  assert.deepEqual(u.exceptionsDraft([{ date: '2027-01-02', closed: false, opensAt: '10:00:00', closesAt: '14:00:00', reason: null }]), [{ date: '2027-01-02', closed: false, opensAt: '10:00', closesAt: '14:00', reason: '' }])
  assert.equal(u.validateExceptions(rows), '')
  assert.ok(u.validateExceptions([...rows, rows[0]]))
  assert.ok(u.validateExceptions([{ ...rows[1], closesAt: '09:00' }]))
  assert.ok(u.validateExceptions([{ ...rows[1], date: '' }]))
  await b.saveBuildingOpeningExceptions(3, rows)
  await p.savePlaceOpeningExceptions(7, rows)
  assert.deepEqual(h.calls.map(c => [c.method, c.args[0]]), [['put', '/campus/buildings/3/opening-exceptions'], ['put', '/campus/places/7/opening-exceptions']])
})

test('destination payload sends exactly one owner and validation reads the graph check', async () => {
  const h = harness(), n = h.load('src/services/navigationRouteService.ts'), u = h.load('src/utils/campusApi.ts')
  const draft = { nodeId: '5', ownerType: 'BUILDING', buildingId: '3', placeId: '9', isPrimary: true, isAccessibleEntrance: false }
  assert.deepEqual(n.destinationPayload(draft), { nodeId: 5, buildingId: 3, placeId: null, isPrimary: true, isAccessibleEntrance: false })
  assert.deepEqual(n.destinationPayload({ ...draft, ownerType: 'PLACE' }), { nodeId: 5, buildingId: null, placeId: 9, isPrimary: true, isAccessibleEntrance: false })
  assert.ok(u.validateDestination({ ...draft, nodeId: '' }).nodeId)
  assert.ok(u.validateDestination({ ...draft, ownerType: 'PLACE', placeId: '' }).placeId)
  assert.equal(u.validateDestination(draft).buildingId, undefined)
  h.respond(() => ({ data: { siteId: null, valid: true, summary: { activeNodes: 2, activeEdges: 1, destinations: 1, blockingIssues: 0, warnings: 0 } } }))
  assert.equal((await n.getNavigationValidation()).valid, true)
  assert.deepEqual(h.calls.at(-1).args[1].params, {})
  h.respond(() => ({ data: '<html>' }))
  await assert.rejects(n.getNavigationValidation(1))
  h.respond(() => ({ data: [] }))
  await n.createDestination(draft); await n.updateDestination(4, draft); await n.deleteDestination(4)
  assert.deepEqual(h.calls.slice(-3).map(c => [c.method, c.args[0]]), [['post', '/campus/navigation/destinations'], ['put', '/campus/navigation/destinations/4'], ['delete', '/campus/navigation/destinations/4']])
})

test('code validators follow the backend code patterns', () => {
  const u = harness().load('src/utils/campusApi.ts')
  const category = { categoryCode: 'B-7', categoryName: 'Library', mobileGroup: 'BUILDINGS', description: '', isActive: true }
  assert.ok(u.validateCategory(category).categoryCode)
  assert.ok(u.validateCategory({ ...category, categoryCode: '7B' }).categoryCode)
  assert.equal(u.validateCategory({ ...category, categoryCode: 'b_7' }).categoryCode, undefined)
  assert.ok(u.validateFacility({ facilityCode: 'WI-FI', facilityName: 'Wi-Fi', description: '', isActive: true }).facilityCode)
  assert.equal(u.codeError('tst-b01', 50, 'x'), undefined)
  assert.ok(u.codeError('-B01', 50, 'x'))
  assert.ok(u.codeError('B 01', 50, 'x'))
  assert.equal(u.codeError('A/101', 50, 'x', 'room'), undefined)
  assert.equal(u.codeError(' ', 50, 'missing'), 'missing')
})

test('place phone number follows the backend pattern', () => {
  const u = harness().load('src/utils/campusApi.ts')
  assert.equal(u.validatePlace({ ...placeDraft, phoneNumber: '+66 2 997-2200' }, true).phoneNumber, undefined)
  assert.ok(u.validatePlace({ ...placeDraft, phoneNumber: 'ext. 12' }, true).phoneNumber)
})
