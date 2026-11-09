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

const page = (content, extra = {}) => ({ data: { content, page: 0, size: 20, totalElements: content.length, totalPages: 1, ...extra } })
const event = { meetingId: 11, courseSectionId: 7, courseCode: 'CS301', courseName: 'Data Structures', sectionNumber: '01', lecturerId: 3, lecturerName: 'Dr. W', facultyId: 1, departmentId: 2, roomId: 5, roomNumber: 'IT-301', buildingId: 4, buildingName: 'IT Building', campusId: 1, meetingType: 'LECTURE', date: '2026-11-11', startsAt: '2026-11-11T08:30:00+07:00', endsAt: '2026-11-11T10:00:00+07:00', status: 'PUBLISHED', occurrenceStatus: 'REGULAR', exceptionId: null, originalDate: null }
const item = { id: 11, courseSectionId: 7, courseCode: 'CS301', courseName: 'Data Structures', sectionNumber: '01', facultyId: 1, facultyName: 'IT', departmentId: 2, departmentName: 'SE', lecturerId: 3, lecturerName: 'Dr. W', academicTermId: 3, academicYearLabel: '2025–2026', semesterName: 'Semester 1', dayOfWeek: 3, dayName: 'Wednesday', startTime: '08:30:00', endTime: '10:00:00', campusId: 1, campusName: 'Main', buildingId: 4, buildingName: 'IT Building', roomId: 5, roomNumber: 'IT-301', legacyRoomLabel: null, meetingType: 'LECTURE', status: 'DRAFT', effectiveFrom: '2026-08-10', effectiveTo: '2026-12-11' }
const detail = { id: 11, courseSection: { id: 7, code: '01', name: 'ACTIVE' }, course: { id: 9, code: 'CS301', name: 'Data Structures' }, academicTerm: { id: 3, semesterId: 2, semesterName: 'Semester 1', semesterNameTh: 'ภาคเรียนที่ 1', academicYearCode: '2568', academicYearLabel: '2025–2026', startDate: '2026-08-10', endDate: '2026-12-11', status: 'ACTIVE' }, faculty: { id: 1, code: 'IT', name: 'Faculty of Information Technology' }, department: { id: 2, code: 'SE', name: 'Software Engineering' }, lecturer: { id: 3, code: 'L3', name: 'Dr. W' }, location: { campusId: 1, campusName: 'Main', buildingId: 4, buildingCode: 'IT', buildingName: 'IT Building', roomId: 5, roomNumber: 'IT-301', roomName: null, floorNumber: 3, capacity: 40, legacyRoomLabel: null }, meetingType: 'LAB', dayOfWeek: 3, dayName: 'Wednesday', startTime: '08:30:00', endTime: '10:00:00', effectiveFrom: '2026-08-10', effectiveTo: '2026-12-11', status: 'DRAFT', notes: null, createdAt: '2026-11-09T10:00:00Z', updatedAt: null }
const draft = { courseId: '9', courseSectionId: '7', meetingType: 'LAB', dayOfWeek: '3', startTime: '08:30', endTime: '10:00', buildingId: '4', roomId: '5', effectiveFrom: '2026-08-10', effectiveTo: '2026-12-11', notes: '  ' }
const term = (id, extra = {}) => ({ id, semesterId: 2, semesterNameEn: 'Semester 1', semesterNameTh: 'ภาคเรียนที่ 1', semesterAcademicYear: 2568, academicYearCode: '2568', academicYearLabel: '2025–2026', startDate: '2026-08-10', endDate: '2026-12-11', status: 'ACTIVE', displayLabel: '1/2568', ...extra })

test('calendar sends the week and supported filters and keeps university local times', async () => {
  const h = harness(), s = h.load('src/services/timetableService.ts'), signal = new AbortController().signal
  h.respond(async () => ({ data: { academicTermId: 3, weekStart: '2026-11-09', weekEnd: '2026-11-15', timezone: 'Asia/Bangkok', events: [event, { ...event, meetingId: 12, startsAt: '2026-11-11T13:05:00Z', endsAt: '2026-11-11T14:00:00Z', status: 'DRAFT', occurrenceStatus: 'RESCHEDULED', exceptionId: 2, originalDate: '2026-11-10' }] } }))
  const week = await s.getTimetableCalendar({ weekStart: '2026-11-09', academicTermId: '3', facultyId: '', departmentId: undefined }, signal)
  assert.equal(h.calls[0].method, 'get')
  assert.equal(h.calls[0].args[0], '/timetable/calendar')
  assert.deepEqual(h.calls[0].args[1].params, { weekStart: '2026-11-09', academicTermId: '3' })
  assert.equal(h.calls[0].args[1].signal, signal)
  assert.equal(week.timezone, 'Asia/Bangkok')
  assert.equal(week.events[0].meetingId, '11'); assert.equal(week.events[0].facultyId, '1')
  assert.equal(week.events[0].startMinutes, 8 * 60 + 30); assert.equal(week.events[0].endMinutes, 10 * 60)
  // The wall-clock time is kept exactly as sent, whatever offset the backend uses and whatever the browser timezone is.
  assert.equal(week.events[1].startMinutes, 13 * 60 + 5); assert.equal(week.events[1].occurrenceStatus, 'RESCHEDULED'); assert.equal(week.events[1].originalDate, '2026-11-10')
  await assert.rejects(s.getTimetableCalendar({ weekStart: '2026-11-09', academicTermId: 'abc' }), /Invalid academicTerm filter/)
  await assert.rejects(s.getTimetableCalendar({ weekStart: 'next week' }), /Invalid week start/)
  h.respond(async () => ({ data: { weekStart: '2026-11-09', weekEnd: '2026-11-15', timezone: 'Asia/Bangkok', events: [event, event] } }))
  await assert.rejects(s.getTimetableCalendar({ weekStart: '2026-11-09' }), /Unexpected calendar/)
  assert.equal(h.calls.length, 2)
})

test('meetings list sends repeated sort parameters and maps the plain page', async () => {
  const h = harness(), s = h.load('src/services/timetableService.ts')
  h.respond(async () => page([item], { page: 1 }))
  const result = await s.getTimetableMeetings({ page: 1, academicTermId: '3', courseId: '9', departmentId: '', sort: { field: 'lecturerName', direction: 'desc' } })
  const url = new URL(`http://x${h.calls[0].args[0]}`)
  assert.equal(url.pathname, '/timetable/meetings')
  assert.deepEqual(url.searchParams.getAll('sort'), ['lecturerName,desc', 'dayOfWeek,asc'])
  assert.equal(url.searchParams.get('page'), '1'); assert.equal(url.searchParams.get('size'), '20')
  assert.equal(url.searchParams.get('academicTermId'), '3'); assert.equal(url.searchParams.get('courseId'), '9'); assert.equal(url.searchParams.has('departmentId'), false)
  assert.equal(result.content[0].id, '11'); assert.equal(result.content[0].startTime, '08:30'); assert.equal(result.content[0].academicYearLabel, '2025–2026'); assert.equal(result.totalElements, 1)
  h.respond(async () => page([item]))
  await s.getTimetableMeetings({ page: 0 })
  assert.deepEqual(new URL(`http://x${h.calls[1].args[0]}`).searchParams.getAll('sort'), ['dayOfWeek,asc', 'startTime,asc'])
  await s.getTimetableMeetings({ page: 0, sort: { field: 'dayOfWeek', direction: 'desc' } })
  assert.deepEqual(new URL(`http://x${h.calls[2].args[0]}`).searchParams.getAll('sort'), ['dayOfWeek,desc', 'startTime,desc'])
  await assert.rejects(s.getTimetableMeetings({ page: 0, size: 101 }), /Invalid schedule page/)
  h.respond(async () => page([item], { page: 3 }))
  await assert.rejects(s.getTimetableMeetings({ page: 0 }), /Unexpected page/)
  h.respond(async () => page([{ ...item, dayOfWeek: 8 }]))
  await assert.rejects(s.getTimetableMeetings({ page: 0 }), /Unexpected schedule/)
})

test('create, update, publish, cancel and delete send exactly the backend DTOs', async () => {
  const h = harness(), s = h.load('src/services/timetableService.ts'), u = h.load('src/utils/timetable.ts')
  const slot = { roomId: 5, meetingType: 'LAB', dayOfWeek: 3, startTime: '08:30', endTime: '10:00', effectiveFrom: '2026-08-10', effectiveTo: '2026-12-11' }
  assert.deepEqual(u.schedulePayload(draft), { courseSectionId: 7, ...slot })
  assert.equal(u.scheduleSlotPayload({ ...draft, notes: ' Bring laptops ' }).notes, 'Bring laptops')
  assert.deepEqual(u.conflictCheckPayload({ ...draft, notes: 'ignored' }, '11'), { meetingId: 11, courseSectionId: 7, ...slot })
  assert.deepEqual(u.conflictCheckPayload(draft), { courseSectionId: 7, ...slot })
  assert.throws(() => u.schedulePayload({ ...draft, courseSectionId: '' }))
  h.respond(async () => ({ data: detail }))
  const created = await s.createMeeting(draft)
  assert.equal(h.calls[0].method, 'post'); assert.equal(h.calls[0].args[0], '/timetable/meetings'); assert.deepEqual(h.calls[0].args[1], { courseSectionId: 7, ...slot })
  assert.equal(created.id, '11'); assert.equal(created.courseSection.code, '01'); assert.equal(created.academicTerm.id, '3'); assert.equal(created.location.capacity, 40); assert.equal(created.startTime, '08:30')
  await s.updateMeeting('11', draft)
  assert.equal(h.calls[1].method, 'put'); assert.equal(h.calls[1].args[0], '/timetable/meetings/11'); assert.deepEqual(h.calls[1].args[1], slot)
  await s.publishMeeting('11'); assert.equal(h.calls[2].method, 'post'); assert.equal(h.calls[2].args[0], '/timetable/meetings/11/publish')
  await s.cancelMeeting('11'); assert.equal(h.calls[3].args[0], '/timetable/meetings/11/cancel')
  await s.deleteMeeting('11'); assert.equal(h.calls[4].method, 'delete'); assert.equal(h.calls[4].args[0], '/timetable/meetings/11')
  await assert.rejects(s.updateMeeting('0', draft), /Invalid schedule ID/)
  h.respond(async () => ({ data: { ...detail, academicTerm: null, location: null } }))
  const bare = await s.getMeetingById('11')
  assert.equal(bare.academicTerm, null); assert.equal(bare.location.roomId, null)
})

test('conflicts use the supported filters only and keep the server total', async () => {
  const h = harness(), s = h.load('src/services/timetableService.ts'), u = h.load('src/utils/timetable.ts')
  const filters = { semesterId: '2', academicTermId: '3', facultyId: '1', departmentId: '', courseId: '9' }
  assert.deepEqual(u.serverFilters(filters, 'conflicts'), { academicTermId: '3', facultyId: '1' })
  assert.deepEqual(u.serverFilters(filters, 'meetings'), { academicTermId: '3', facultyId: '1', courseId: '9' })
  const meeting = { meetingId: 11, courseSectionId: 7, courseCode: 'CS301', courseName: 'DS', sectionNumber: '01', meetingType: 'LECTURE', dayOfWeek: 3, startTime: '08:30:00', endTime: '10:00:00', effectiveFrom: '2026-08-10', effectiveTo: '2026-12-11', roomId: 5, roomNumber: 'IT-301', lecturerId: 3, lecturerName: 'Dr. W' }
  h.respond(async () => ({ data: { total: 1, conflicts: [{ type: 'ROOM_CONFLICT', meetingA: meeting, meetingB: { ...meeting, meetingId: 12, courseCode: 'CS302' }, firstDate: '2026-11-11', overlapStart: '09:00:00', overlapEnd: '10:00:00', occurrenceCount: 14, roomId: 5, roomNumber: 'IT-301', lecturerId: null, lecturerName: null, courseSectionId: null }] } }))
  const list = await s.getTimetableConflicts(u.serverFilters(filters, 'conflicts'))
  assert.equal(h.calls[0].args[0], '/timetable/conflicts'); assert.deepEqual(h.calls[0].args[1].params, { academicTermId: '3', facultyId: '1' })
  assert.equal(list.total, 1); assert.equal(list.conflicts[0].overlapStart, '09:00'); assert.equal(list.conflicts[0].meetingB.meetingId, '12')
  assert.equal(u.conflictResource(list.conflicts[0]), 'Room IT-301'); assert.match(u.describeConflictPair(list.conflicts[0]), /share a room/)
  h.respond(async () => ({ data: { total: 2, conflicts: [] } }))
  await assert.rejects(s.getTimetableConflicts({}), /Unexpected conflict list/)
  h.respond(async () => ({ data: { hasConflicts: true, totalConflicts: 1, conflicts: [{ type: 'LECTURER_CONFLICT', conflictingMeetingId: 12, message: 'Lecturer busy', date: '2026-11-11', overlapStart: '09:00:00', overlapEnd: '10:00:00' }] } }))
  const check = await s.checkScheduleConflicts(draft, '11')
  assert.equal(h.calls[2].method, 'post'); assert.equal(h.calls[2].args[0], '/timetable/conflicts/check'); assert.equal(h.calls[2].args[1].meetingId, 11); assert.equal('notes' in h.calls[2].args[1], false)
  assert.equal(check.hasConflicts, true); assert.equal(check.conflicts[0].conflictingMeetingId, '12'); assert.equal(check.conflicts[0].overlapEnd, '10:00')
})

test('academic terms load every page and send the exact request body', async () => {
  const h = harness(), s = h.load('src/services/timetableService.ts')
  const pages = [{ content: [term(1)], page: 0, size: 100, totalElements: 2, totalPages: 2 }, { content: [term(2, { status: 'PLANNED' })], page: 1, size: 100, totalElements: 2, totalPages: 2 }]
  h.respond(async (method, url, config) => ({ data: pages[config.params.page] }))
  const rows = await s.getAcademicTerms()
  assert.deepEqual(h.calls.map(call => [call.args[0], call.args[1].params]), [['/academic-terms', { page: 0, size: 100, sort: 'startDate,desc' }], ['/academic-terms', { page: 1, size: 100, sort: 'startDate,desc' }]])
  assert.equal(rows.length, 2); assert.equal(rows[0].id, '1'); assert.equal(rows[0].displayLabel, '1/2568'); assert.equal(rows[1].status, 'PLANNED'); assert.equal(rows[0].semesterId, '2')
  h.respond(async () => ({ data: { content: [term(1), term(1)], page: 0, size: 100, totalElements: 2, totalPages: 1 } }))
  await assert.rejects(s.getAcademicTerms(), /changed while loading/)
  const termDraft = { semesterId: '2', academicYearCode: ' 2568 ', academicYearLabel: ' 2025–2026 ', startDate: '2026-08-10', endDate: '2026-12-11', status: 'PLANNED' }
  assert.deepEqual(s.academicTermPayload(termDraft), { semesterId: 2, academicYearCode: '2568', academicYearLabel: '2025–2026', startDate: '2026-08-10', endDate: '2026-12-11', status: 'PLANNED' })
  assert.deepEqual(Object.keys(s.validateAcademicTermDraft({ ...termDraft, semesterId: '', endDate: '2026-08-01' })), ['semesterId', 'endDate'])
  assert.deepEqual(s.validateAcademicTermDraft(termDraft), {})
  h.respond(async () => ({ data: term(3) }))
  await s.createAcademicTerm(termDraft); assert.equal(h.calls.at(-1).method, 'post'); assert.equal(h.calls.at(-1).args[0], '/academic-terms'); assert.deepEqual(h.calls.at(-1).args[1], s.academicTermPayload(termDraft))
  await s.updateAcademicTerm('3', termDraft); assert.equal(h.calls.at(-1).method, 'put'); assert.equal(h.calls.at(-1).args[0], '/academic-terms/3')
  await s.deleteAcademicTerm('3'); assert.equal(h.calls.at(-1).method, 'delete'); assert.equal(h.calls.at(-1).args[0], '/academic-terms/3')
  await assert.rejects(s.deleteAcademicTerm('x'), /Invalid academic term ID/)
})

test('filter options keep parent links as ids for the cascades', async () => {
  const h = harness(), s = h.load('src/services/timetableService.ts'), u = h.load('src/utils/timetable.ts')
  h.respond(async () => ({ data: { academicTerms: [], faculties: [{ id: 1, code: 'IT', name: 'Faculty of Information Technology', parentId: null }], departments: [{ id: 2, code: 'SE', name: 'Software Engineering', parentId: 1 }], courses: [{ id: 9, code: 'CS301', name: 'Data Structures', parentId: 2 }], courseSections: [], lecturers: [], campuses: [], buildings: [{ id: 4, code: 'IT', name: 'IT Building', parentId: 1 }], rooms: [{ id: 5, code: 'IT-301', name: 'Lab', parentId: 4 }], meetingTypes: ['LECTURE', 'LAB', 'TUTORIAL'], statuses: ['DRAFT', 'PUBLISHED', 'CANCELLED'] } }))
  const options = await s.getFilterOptions()
  assert.equal(h.calls[0].args[0], '/timetable/filter-options'); assert.deepEqual(h.calls[0].args[1].params, {})
  assert.equal(options.departments[0].parentId, '1'); assert.deepEqual(options.meetingTypes, ['LECTURE', 'LAB', 'TUTORIAL'])
  assert.deepEqual(u.roomsFor(options, '4').map(room => room.id), ['5']); assert.deepEqual(u.roomsFor(options, ''), [])
  assert.deepEqual(u.coursesFor(options, '1', '').map(course => course.id), ['9']); assert.deepEqual(u.coursesFor(options, '3', ''), [])
  h.respond(async () => ({ data: { faculties: 'nope' } }))
  await assert.rejects(s.getFilterOptions(), /Unexpected filter options/)
  await assert.rejects(s.getFilterOptions({ facultyId: '-1' }), /Invalid faculty filter/)
})

test('timetable errors use safe copy and map backend codes to form fields', () => {
  const u = harness().load('src/utils/timetable.ts')
  const failure = (status, code, message = 'raw server text') => ({ isAxiosError: true, response: { status, data: { code, message } } })
  assert.equal(u.timetableError(failure(409, 'TIMETABLE_ROOM_CONFLICT'), 'write').message, 'The selected room is already booked by another published class during this time.')
  assert.deepEqual(u.timetableError(failure(400, 'TIMETABLE_INVALID_TIME'), 'write').fields, { endTime: 'The end time must be after the start time.' })
  assert.equal(u.timetableError(failure(400, 'ACADEMIC_TERM_NOT_FOUND'), 'write').fields.courseSectionId.includes('no academic term'), true)
  assert.equal(u.timetableError(failure(403, 'FORBIDDEN')).message, 'You do not have permission to manage the timetable.')
  assert.equal(u.timetableError(failure(403, 'PASSWORD_CHANGE_REQUIRED')).message, 'Change your password before managing the timetable.')
  assert.equal(u.timetableError(failure(401, 'UNAUTHORIZED')).message, 'Your session expired. Sign in again.')
  assert.equal(u.timetableError(failure(400, 'VALIDATION_ERROR')).message.includes('raw server text'), false)
  assert.equal(u.timetableError(failure(500, 'INTERNAL')).message, 'The server reported an error. Please try again later.')
  assert.match(u.timetableError({ isAxiosError: true, code: 'ECONNABORTED' }, 'write').message, /may or may not have been saved/)
  assert.equal(u.timetableError({ isAxiosError: true, code: 'ERR_NETWORK' }).message, 'Unable to connect to the server. Please retry.')
  assert.equal(u.isMissingMeeting(failure(404, 'TIMETABLE_MEETING_NOT_FOUND')), true); assert.equal(u.isMissingMeeting(failure(409, 'TIMETABLE_ROOM_CONFLICT')), false)
})
