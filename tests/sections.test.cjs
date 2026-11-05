const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function harness() {
  const calls = [], cache = new Map()
  let handler = async () => ({ data: row })
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
const draft = { courseId: '8', number: ' A1 ', capacity: '45', lecturerId: '4', room: '', schedule: '', semester: '5', academicYear: '', status: 'closed' }
const row = { id: 1, courseId: 8, courseCode: 'TEST', courseName: 'Test course', sectionNumber: 'A1', capacity: 45, enrolledCount: 0, isFull: false, lectureId: 4, lectureNameTh: 'อาจารย์', lectureNameEn: 'Lecturer', semesterId: 5, semesterNameTh: '2568', semesterNameEn: 'Semester 1/2568', status: 'CLOSED', room: null, schedule: null }
const filters = { query: '', courseId: '', semester: '', academicYear: '', lecturerId: '', status: '' }

test('exact request fields, full PUT, blank capacity and unsafe IDs', async () => {
  const h = harness(), s = h.load('src/services/sectionService.ts'), u = h.load('src/utils/sectionApi.ts')
  assert.deepEqual(s.sectionPayload(draft), { courseId: 8, sectionNumber: 'A1', capacity: 45, lectureId: 4, semesterId: 5, status: 'CLOSED' })
  assert.deepEqual(u.validateSectionForm(draft, true), {})
  assert.ok(u.validateSectionForm({ ...draft, capacity: '' }, true).capacity)
  assert.equal(s.sectionPayload({ ...draft, capacity: '' }).capacity, undefined)
  await s.updateSection('1', draft)
  assert.equal(h.calls[0].args[1].room, null)
  assert.equal(h.calls[0].args[1].schedule, null)
  for (const id of ['0', '-1', '1.5', '9007199254740992', '../1']) {
    await assert.rejects(s.deleteSection(id))
    assert.throws(() => s.sectionPayload({ ...draft, lecturerId: id }))
  }
  assert.equal(h.calls.length, 1)
})

test('directory follows all pages, maps server filters, rejects duplicates and bounds', async () => {
  const h = harness(), s = h.load('src/services/sectionService.ts')
  h.respond(async (method, url, options) => ({ data: { content: [{ ...row, id: options.params.page + 1 }], page: options.params.page, size: 100, totalElements: 2, totalPages: 2 } }))
  assert.equal((await s.getSectionDirectory({ ...filters, query: ' test ', lecturerId: '4', semester: '5', status: 'full' })).length, 2)
  assert.equal(h.calls[0].args[1].params.search, 'test')
  assert.equal(h.calls[0].args[1].params.lectureId, 4)
  assert.equal(h.calls[0].args[1].params.semesterId, 5)
  assert.equal(h.calls[0].args[1].params.status, undefined)
  h.respond(async (method, url, options) => ({ data: { content: [row], page: options.params.page, size: 100, totalElements: 2, totalPages: 2 } }))
  await assert.rejects(s.getSectionDirectory(filters), /changed/)
  h.respond(async () => ({ data: { content: [], page: 0, size: 100, totalElements: 2001, totalPages: 21 } }))
  await assert.rejects(s.getSectionDirectory(filters), /Too many/)
})

test('server full status, malformed records, safe conflict feedback and 204 delete', async () => {
  const h = harness(), s = h.load('src/services/sectionService.ts'), u = h.load('src/utils/sectionApi.ts'), helpers = h.load('src/utils/courseSections.ts')
  assert.equal(helpers.sectionStatus(u.adaptApiSectionToCourseSection(s.mapSection({ ...row, status: 'ACTIVE', isFull: true }))), 'Full')
  assert.equal(helpers.sectionStatus(u.adaptApiSectionToCourseSection(s.mapSection(row))), 'Closed')
  assert.throws(() => s.mapSection({ ...row, status: 'OTHER' }))
  assert.throws(() => s.mapSection({ ...row, enrolledCount: -1 }))
  assert.ok(u.sectionError({ response: { status: 409, data: { code: 'COURSE_SECTION_ALREADY_EXISTS' } } }).fields.number)
  h.respond(async () => ({ status: 204 }))
  await s.deleteSection('1')
  assert.equal(h.calls[0].args[0], '/course-sections/1')
})
