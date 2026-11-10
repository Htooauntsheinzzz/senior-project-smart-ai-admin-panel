const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

// Pure calendar, filter and validation helpers of src/utils/timetable.ts (no API access).
function load(file) {
  file = path.resolve(__dirname, '..', file)
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(() => ({}), module, module.exports)
  return module.exports
}
const u = load('src/utils/timetable.ts')
const ev = (meetingId, startMinutes, endMinutes) => ({ meetingId, startMinutes, endMinutes })
const term = { id: '3', semesterId: '2', status: 'ACTIVE', startDate: '2026-08-10', endDate: '2026-12-11' }
const draft = { courseId: '9', courseSectionId: '7', meetingType: 'LECTURE', dayOfWeek: '3', startTime: '08:30', endTime: '10:00', buildingId: '4', roomId: '5', effectiveFrom: '2026-08-10', effectiveTo: '2026-12-11', notes: '' }

test('overlapping classes share lanes and positions follow real minutes', () => {
  const lanes = u.layoutLanes([ev('a', 480, 600), ev('b', 540, 660), ev('c', 630, 720), ev('d', 780, 840)])
  const byId = Object.fromEntries(lanes.map(lane => [lane.event.meetingId, lane]))
  // a–b–c overlap transitively (a with b, b with c) and share two lanes; d stands alone.
  assert.deepEqual([byId.a.lane, byId.b.lane, byId.c.lane, byId.d.lane], [0, 1, 0, 0])
  assert.deepEqual([byId.a.lanes, byId.b.lanes, byId.c.lanes, byId.d.lanes], [2, 2, 2, 1])
  assert.equal(u.eventTop(8 * 60 + 30, 8 * 60), 38)
  assert.equal(u.eventTop(9 * 60 + 45, 8 * 60), 1.75 * 76)
  assert.equal(u.eventHeight(8 * 60 + 30, 9 * 60 + 20), 50 / 60 * 76 - 2)
  assert.equal(u.eventHeight(600, 605), 18)
  assert.deepEqual(u.visibleRange([]), { start: 480, end: 1080 })
  assert.deepEqual(u.visibleRange([ev('x', 7 * 60 + 15, 8 * 60), ev('y', 17 * 60, 19 * 60 + 30)]), { start: 420, end: 1200 })
  assert.deepEqual(u.visibleDays([{ date: '2026-11-11' }]), [1, 2, 3, 4, 5, 6])
  assert.deepEqual(u.visibleDays([{ date: '2026-11-11' }, { date: '2026-11-15' }]), [1, 2, 3, 4, 5, 6, 7])
})

test('week and time helpers use ISO weekdays and never the browser timezone', () => {
  assert.equal(u.isoWeekday('2026-11-09'), 1); assert.equal(u.isoWeekday('2026-11-15'), 7)
  assert.equal(u.mondayOf('2026-11-12'), '2026-11-09'); assert.equal(u.mondayOf('2026-11-15'), '2026-11-09'); assert.equal(u.mondayOf('2026-11-09'), '2026-11-09')
  assert.equal(u.addDays('2026-11-30', 7), '2026-12-07'); assert.equal(u.addDays('2026-01-01', -1), '2025-12-31')
  assert.equal(u.localMinutesFromOffsetDateTime('2026-11-10T13:05:00+07:00'), 785)
  assert.equal(u.localMinutesFromOffsetDateTime('2026-11-10T13:05:00Z'), 785)
  assert.equal(u.minutesFromTime('08:30'), 510); assert.ok(Number.isNaN(u.minutesFromTime('8:30'))); assert.equal(u.timeFromMinutes(785), '13:05')
  assert.equal(u.formatTime12('08:00'), '8:00 AM'); assert.equal(u.formatTime12('00:15'), '12:15 AM'); assert.equal(u.formatTimeRange12('08:00', '13:30'), '8:00 AM – 1:30 PM')
  assert.equal(u.formatDate('2026-11-09'), '9 Nov 2026'); assert.equal(u.formatDate(null), '—')
  assert.equal(u.formatWeekRange('2026-11-09', '2026-11-15'), '9 – 15 Nov 2026'); assert.equal(u.formatWeekRange('2026-11-30', '2026-12-06'), '30 Nov – 6 Dec 2026')
  assert.equal(u.dayName(1), 'Monday'); assert.equal(u.dayName(7), 'Sunday'); assert.equal(u.dayAbbreviation(3), 'WED')
  assert.equal(u.sectionLabel({ code: '01', name: 'ACTIVE' }), 'SEC-01'); assert.equal(u.sectionLabel({ code: 'sec-02', name: '' }), 'SEC-02')
})

test('default term and initial week come from real terms and today', () => {
  assert.equal(u.initialWeekStart(term, '2026-11-12'), '2026-11-09')
  assert.equal(u.initialWeekStart(term, '2027-01-05'), '2026-08-10')
  assert.equal(u.initialWeekStart(undefined, '2026-11-12'), '2026-11-09')
  const planned = { ...term, id: '4', status: 'PLANNED', startDate: '2027-01-11', endDate: '2027-05-14' }
  const closed = { ...term, id: '5', semesterId: '1', status: 'CLOSED', startDate: '2026-01-12', endDate: '2026-05-15' }
  assert.equal(u.defaultTerm([planned, term, closed], '2026-11-12').id, '3')
  assert.equal(u.defaultTerm([planned, term, closed], '2026-03-01').id, '3')
  assert.equal(u.defaultTerm([planned, closed], '2026-03-01').id, '5')
  assert.equal(u.defaultTerm([planned, closed], '2026-07-01'), undefined)
  assert.equal(u.termForSemester([planned, term, closed], '2').id, '3')
  assert.equal(u.termForSemester([planned, { ...planned, id: '6', startDate: '2026-01-05' }], '2').id, '4')
  assert.equal(u.termForSemester([planned], '9'), undefined)
})

test('schedule validation mirrors the backend rules and the term window', () => {
  const context = { term, sectionHasTerm: true }
  assert.deepEqual(u.validateScheduleDraft(draft, context), {})
  assert.equal(u.validateScheduleDraft({ ...draft, endTime: '08:00' }, context).endTime, 'The end time must be after the start time.')
  assert.match(u.validateScheduleDraft({ ...draft, effectiveTo: '2026-12-20' }, context).effectiveTo, /within the academic term/)
  assert.match(u.validateScheduleDraft({ ...draft, effectiveFrom: '2026-08-03' }, context).effectiveTo, /within the academic term/)
  assert.equal(u.validateScheduleDraft({ ...draft, effectiveTo: '2026-08-01' }, context).effectiveTo, 'The last date must not be before the first date.')
  // Enrollment due date (backend V47): optional, and never after Effective From.
  assert.equal(u.validateScheduleDraft({ ...draft, enrollmentDueDate: '2026-08-10' }, context).enrollmentDueDate, undefined)
  assert.match(u.validateScheduleDraft({ ...draft, enrollmentDueDate: '2026-08-11' }, context).enrollmentDueDate, /must not be after/)
  assert.equal(u.scheduleSlotPayload({ ...draft, enrollmentDueDate: '2026-08-01' }).enrollmentDueDate, '2026-08-01')
  assert.equal('enrollmentDueDate' in u.scheduleSlotPayload(draft), false)
  assert.equal('enrollmentDueDate' in u.conflictCheckPayload({ ...draft, enrollmentDueDate: '2026-08-01' }), false)
  assert.match(u.validateScheduleDraft(draft, { term, sectionHasTerm: false }).courseSectionId, /no academic term/)
  assert.equal(u.validateScheduleDraft({ ...draft, buildingId: '', roomId: '' }, context).roomId, 'Select a building first.')
  assert.equal(u.validateScheduleDraft({ ...draft, roomId: '' }, context).roomId, 'Select a room in this building.')
  assert.equal(u.validateScheduleDraft({ ...draft, dayOfWeek: '8' }, context).dayOfWeek, 'Select a day of the week.')
  assert.equal(u.validateScheduleDraft({ ...draft, startTime: '8:30' }, context).startTime, 'Enter a start time.')
  assert.equal(u.validateScheduleDraft({ ...draft, meetingType: 'SEMINAR' }, context).meetingType, 'Select a class type.')
  assert.equal(u.validateScheduleDraft({ ...draft, notes: 'x'.repeat(2001) }, context).notes, 'Use at most 2000 characters.')
  assert.deepEqual(u.validateScheduleDraft(draft, { term: null, sectionHasTerm: true }), {})
  assert.deepEqual(u.draftFromMeeting({ course: { id: '9' }, courseSection: { id: '7' }, meetingType: 'LAB', dayOfWeek: 5, startTime: '13:00', endTime: '15:00', location: { buildingId: '4', roomId: null }, effectiveFrom: '2026-08-10', effectiveTo: '2026-12-11', notes: null }),
    { courseId: '9', courseSectionId: '7', meetingType: 'LAB', dayOfWeek: '5', startTime: '13:00', endTime: '15:00', buildingId: '4', roomId: '', effectiveFrom: '2026-08-10', effectiveTo: '2026-12-11', enrollmentDueDate: '', notes: '' })
})

test('faculty colours are stable per faculty and filters cascade', () => {
  assert.equal(u.facultyColorFor({ id: '1', name: 'Faculty of Engineering' }).key, 'engineering')
  assert.equal(u.facultyColorFor({ id: '2', name: 'Faculty of Information Technology' }).key, 'information')
  assert.equal(u.facultyColorFor({ id: '3', name: 'Faculty of Fine Arts' }).key, 'liberal')
  assert.equal(u.facultyColorFor({ id: '4', name: 'Veterinary' }).key, 'neutral')
  assert.equal(u.facultyColorFor(undefined).key, 'neutral')
  assert.equal(u.facultyPalette.length, 6); assert.equal(u.shortFacultyName('Faculty of Business Administration'), 'Business Administration')
  const options = { departments: [{ id: '2', code: 'SE', name: 'SE', parentId: '1' }, { id: '3', code: 'CE', name: 'CE', parentId: '5' }, { id: '6', code: 'MA', name: 'MA', parentId: '1' }], courses: [{ id: '9', code: 'CS301', name: 'DS', parentId: '2' }, { id: '10', code: 'CE101', name: 'Statics', parentId: '3' }] }
  const terms = [term, { ...term, id: '4', status: 'PLANNED', startDate: '2027-01-11', endDate: '2027-05-14' }]
  const filters = { semesterId: '', academicTermId: '', facultyId: '1', departmentId: '2', courseId: '9' }
  assert.deepEqual(u.applyFilterChange(filters, 'facultyId', '5', { options, terms }), { semesterId: '', academicTermId: '', facultyId: '5', departmentId: '', courseId: '' })
  assert.deepEqual(u.applyFilterChange(filters, 'departmentId', '2', { options, terms }), filters)
  assert.equal(u.applyFilterChange(filters, 'departmentId', '6', { options, terms }).courseId, '')
  // A department outside the selected faculty is cleared instead of being accepted.
  assert.deepEqual(u.applyFilterChange(filters, 'departmentId', '3', { options, terms }), { ...filters, departmentId: '' })
  assert.equal(u.applyFilterChange(filters, 'semesterId', '2', { options, terms }).academicTermId, '3')
  assert.equal(u.applyFilterChange(filters, 'academicTermId', '4', { options, terms }).semesterId, '2')
  assert.equal(u.applyFilterChange({ ...filters, semesterId: '2', academicTermId: '3' }, 'semesterId', '', { options, terms }).academicTermId, '')
  assert.deepEqual(u.departmentsFor(options, '').map(department => department.id), ['2', '3', '6'])
  assert.deepEqual(u.departmentsFor(options, '1').map(department => department.id), ['2', '6'])
  assert.deepEqual(u.coursesFor(options, '', '3').map(course => course.id), ['10'])
  assert.deepEqual(u.coursesFor(options, '', '').map(course => course.id), ['9', '10'])
  const meeting = { academicTerm: { id: '4' }, faculty: { id: '1' }, department: { id: '2' }, course: { id: '9' } }
  assert.equal(u.hiddenByFilters({ ...filters, academicTermId: '3' }, meeting), true)
  assert.equal(u.hiddenByFilters({ ...filters, academicTermId: '4' }, meeting), false)
  assert.equal(u.hiddenByFilters({ ...filters, facultyId: '', departmentId: '', courseId: '' }, { ...meeting, academicTerm: null }), false)
  assert.equal(u.hiddenByFilters({ ...filters, academicTermId: '3', facultyId: '' }, { ...meeting, academicTerm: null }), true)
})
