const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
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
  return { calls, load, respond: fn => { handler = fn } }
}
const draft = { semesterNameEn: ' Semester 1 ', semesterNameTh: ' ภาคเรียน 1 ' }
test('semester writes contain only fields supported by the unchanged API', async () => {
  const h = harness(), s = h.load('src/services/semesterService.ts')
  await s.saveSemester({ ...draft, code: 'UNSUPPORTED', startDate: '2026-01-01' })
  await s.saveSemester(draft, '7')
  assert.deepEqual(h.calls.map(c => [c.method, c.args[0]]), [['post', '/semesters'], ['put', '/semesters/7']])
  assert.deepEqual(h.calls[0].args[1], { semesterNameEn: 'Semester 1', semesterNameTh: 'ภาคเรียน 1' })
  assert.ok(s.validateSemester({ ...draft, semesterNameTh: ' ' }).semesterNameTh)
  assert.ok(s.validateSemester({ ...draft, semesterNameEn: 'x'.repeat(151) }).semesterNameEn)
  for (const id of ['0', '1.5', '../7', '9007199254740992']) await assert.rejects(s.getSemester(id))
  assert.equal(h.calls.length, 2)
})
test('deletion checks existing course, section and student references and blocks used records', async () => {
  const h = harness(), s = h.load('src/services/semesterService.ts')
  h.respond(async (method, url) => ({ data: { page: 0, size: 1, content: [], totalElements: url === '/students' ? 2 : 0 } }))
  await assert.rejects(s.deleteSemester('7'), /2 students/)
  assert.equal(h.calls.filter(c => c.method === 'delete').length, 0)
  assert.deepEqual(h.calls.map(c => c.args[0]), ['/courses', '/course-sections', '/students'])
  assert.ok(h.calls.every(c => c.args[1].params.semesterId === 7))
})
test('failed dependency reads never permit deletion; confirmed unreferenced delete handles 204', async () => {
  const h = harness(), s = h.load('src/services/semesterService.ts')
  h.respond(async () => { throw new Error('Network unavailable') })
  await assert.rejects(s.deleteSemester('7'))
  assert.equal(h.calls.filter(c => c.method === 'delete').length, 0)
  h.respond(async method => method === 'delete' ? { status: 204 } : { data: { page: 0, size: 1, content: [], totalElements: 0 } })
  await s.deleteSemester('7')
  assert.equal(h.calls.filter(c => c.method === 'delete').length, 1)
})
test('semester loader rejects duplicate and incomplete directories', async () => {
  const h = harness(), s = h.load('src/services/semesterService.ts')
  h.respond(async (method, url, options) => ({ data: { page: options.params.page, size: 100, totalElements: 2, totalPages: 2, content: [{ id: options.params.page + 1, ...draft }] } }))
  assert.equal((await s.getSemesters()).length, 2)
  h.respond(async (method, url, options) => ({ data: { page: options.params.page, size: 100, totalElements: 2, totalPages: 2, content: [{ id: 1, ...draft }] } }))
  await assert.rejects(s.getSemesters(), /Incomplete/)
})
test('navigation order and routes are preserved; no scheduled-session API is called', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../src/data/navigation.ts'), 'utf8')
  const academic = source.slice(source.indexOf("id: 'academic'"), source.indexOf("id: 'timetable'"))
  assert.deepEqual([...academic.matchAll(/label: '([^']+)'/g)].map(match => match[1]), ['Academic Management', 'Semester', 'Faculty', 'Department', 'Lectures', 'Program', 'Courses', 'Course Sections', 'Enrollments'])
  const lectures = fs.readFileSync(path.resolve(__dirname, '../src/components/academic/LecturesContent.tsx'), 'utf8')
  assert.ok(lectures.includes('Scheduling API unavailable'))
  assert.ok(!lectures.includes('teaching-sessions'))
})
