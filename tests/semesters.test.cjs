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
const draft = { academicYear: ' 2026 ', semesterNameEn: ' Semester 1 ', semesterNameTh: ' ภาคเรียน 1 ' }
const row = { id: 7, academicYear: 2026, semesterNameTh: 'ภาคเรียน 1', semesterNameEn: 'Semester 1', createdBy: 1, createdAt: '2026-10-01T00:00:00Z', updatedBy: null, updatedAt: null }
test('semester writes send exactly the backend DTO fields, with academicYear as a number', async () => {
  const h = harness(), s = h.load('src/services/semesterService.ts')
  h.respond(async () => ({ data: row }))
  await s.createSemester({ ...draft, status: 'ACTIVE', code: 'UNSUPPORTED' })
  await s.updateSemester('7', draft)
  assert.deepEqual(h.calls.map(c => [c.method, c.args[0]]), [['post', '/semesters'], ['put', '/semesters/7']])
  for (const call of h.calls) assert.deepEqual(call.args[1], { academicYear: 2026, semesterNameTh: 'ภาคเรียน 1', semesterNameEn: 'Semester 1' })
})
test('validation mirrors backend constraints', () => {
  const h = harness(), s = h.load('src/services/semesterService.ts')
  assert.deepEqual(s.validateSemester(draft), {})
  assert.ok(s.validateSemester({ ...draft, semesterNameTh: ' ' }).semesterNameTh)
  assert.ok(s.validateSemester({ ...draft, semesterNameEn: 'x'.repeat(151) }).semesterNameEn)
  for (const academicYear of ['', '1999', '2101', '26', '20a6']) assert.ok(s.validateSemester({ ...draft, academicYear }).academicYear)
  assert.throws(() => s.semesterPayload({ ...draft, academicYear: '1999' }))
})
test('invalid IDs never reach the API', async () => {
  const h = harness(), s = h.load('src/services/semesterService.ts')
  for (const id of ['0', '1.5', '../7', '9007199254740992']) {
    await assert.rejects(s.getSemesterById(id)); await assert.rejects(s.deleteSemester(id)); await assert.rejects(s.updateSemester(id, draft))
  }
  assert.equal(h.calls.length, 0)
})
test('delete calls only the DELETE endpoint and accepts 204', async () => {
  const h = harness(), s = h.load('src/services/semesterService.ts')
  h.respond(async () => ({ status: 204 }))
  await s.deleteSemester('7')
  assert.deepEqual(h.calls.map(c => [c.method, c.args[0]]), [['delete', '/semesters/7']])
})
test('list uses server pagination, search and academicYear filter and maps the plain page object', async () => {
  const h = harness(), s = h.load('src/services/semesterService.ts')
  h.respond(async (method, url, options) => ({ data: { content: [row], page: options.params.page, size: options.params.size, totalElements: 11, totalPages: 2, first: false, last: true, sort: [] } }))
  const page = await s.getSemesterPage({ page: 1, size: 10, search: '  sem ', academicYear: 2026 })
  assert.deepEqual(h.calls[0].args[1].params, { page: 1, size: 10, search: 'sem', academicYear: 2026, sort: 'academicYear,desc' })
  assert.equal(page.totalElements, 11)
  assert.deepEqual(page.rows[0], { id: '7', academicYear: 2026, semesterNameTh: 'ภาคเรียน 1', semesterNameEn: 'Semester 1', createdAt: '2026-10-01T00:00:00Z', updatedAt: null })
  await s.getSemesterPage({ page: 0, size: 10, search: ' ' })
  assert.equal(h.calls[1].args[1].params.search, undefined)
  h.respond(async () => ({ data: { content: [{ ...row, academicYear: undefined }], page: 0, size: 10, totalElements: 1, totalPages: 1 } }))
  await assert.rejects(s.getSemesterPage({ page: 0, size: 10 }), /Unexpected/)
})
test('errors map to safe messages and duplicate conflicts mark the fields', () => {
  const h = harness(), s = h.load('src/services/semesterService.ts')
  const err = (status, code) => ({ response: { status, data: { code, message: 'java.lang.Something' } } })
  const duplicate = s.semesterError(err(409, 'SEMESTER_ALREADY_EXISTS'))
  assert.match(duplicate.message, /already exists/)
  assert.deepEqual(Object.keys(duplicate.fields).sort(), ['academicYear', 'semesterNameEn', 'semesterNameTh'])
  assert.equal(s.semesterError(err(404, 'SEMESTER_NOT_FOUND')).message, 'Semester not found.')
  assert.match(s.semesterError(err(403, 'FORBIDDEN')).message, /permission/)
  assert.equal(s.semesterError(err(500, 'INTERNAL_ERROR')).message, 'Unable to complete the request. Please try again.')
  assert.equal(s.semesterError({ isAxiosError: true }).message, 'Unable to connect to the server. Please try again.')
})
test('navigation order and routes are preserved; no scheduled-session API is called', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../src/data/navigation.ts'), 'utf8')
  const academic = source.slice(source.indexOf("id: 'academic'"), source.indexOf("id: 'timetable'"))
  assert.deepEqual([...academic.matchAll(/label: '([^']+)'/g)].map(match => match[1]), ['Academic Management', 'Semester', 'Faculty', 'Department', 'Lectures', 'Program', 'Courses', 'Course Sections', 'Enrollments'])
  // The old LecturesContent placeholder was replaced by the real Lecturers page.
  const semesters = fs.readFileSync(path.resolve(__dirname, '../src/services/semesterService.ts'), 'utf8')
  assert.ok(!semesters.includes('teaching-sessions'))
})
