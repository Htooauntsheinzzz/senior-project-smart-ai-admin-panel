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
  return { calls, load, respond: next => { handler = next } }
}

const draft = { code: ' CSC ', name: ' Computer Science ', degreeId: 'bsc', facultyId: '2', departmentId: '2', durationYears: '4', totalCredits: '120', status: 'inactive' }
const row = { id: 7, programCode: 'CSC', programName: 'Computer Science', degreeLevel: 'Bachelor of Science', facultyId: 2, facultyCode: 'FAC-ENG', facultyNameEn: 'Faculty of Engineering', departmentId: 2, departmentCode: 'DIT', departmentName: 'Digital Innovation Technology', durationYears: 4, totalCredits: 120, isActive: false }
const filters = { query: ' science ', facultyId: '2', departmentId: '2', degreeId: 'Bachelor of Science', status: 'inactive' }

test('payload maps degreeId to degreeLevel string and preserves false', () => {
  const h = harness(), s = h.load('src/services/programService.ts'), u = h.load('src/utils/programApi.ts')
  assert.deepEqual(s.programPayload(draft, 'Bachelor of Science'), { programCode: 'CSC', programName: 'Computer Science', degreeLevel: 'Bachelor of Science', facultyId: 2, departmentId: 2, durationYears: 4, totalCredits: 120, isActive: false })
  assert.deepEqual(u.validateProgramForm(draft), {})
  for (const facultyId of ['', '0', '-2', '1.5', 'Engineering', '9007199254740992']) { assert.ok(u.validateProgramForm({ ...draft, facultyId }).facultyId); assert.throws(() => s.programPayload({ ...draft, facultyId }, 'Bachelor')) }
  for (const departmentId of ['', '0', '-2', '1.5']) { assert.ok(u.validateProgramForm({ ...draft, departmentId }).departmentId); assert.throws(() => s.programPayload({ ...draft, departmentId }, 'Bachelor')) }
  assert.ok(u.validateProgramForm({ ...draft, code: 'csc' }).code)
  assert.ok(u.validateProgramForm({ ...draft, name: ' ' }).name)
  assert.ok(u.validateProgramForm({ ...draft, code: 'X'.repeat(51) }).code)
  assert.ok(u.validateProgramForm({ ...draft, name: 'X'.repeat(256) }).name)
  assert.ok(u.validateProgramForm({ ...draft, degreeId: '' }).degreeId)
  assert.ok(u.validateProgramForm({ ...draft, durationYears: '-1' }).durationYears)
  assert.ok(u.validateProgramForm({ ...draft, totalCredits: '-1' }).totalCredits)
  assert.equal(s.mapProgram(row).degreeLevel, 'Bachelor of Science')
  assert.equal(s.mapProgram(row).status, 'inactive')
  assert.throws(() => s.mapProgram({ ...row, isActive: 'false' }))
  assert.throws(() => s.mapProgram({ ...row, facultyId: undefined }))
})

test('optional duration and credits are omitted when blank', () => {
  const h = harness(), s = h.load('src/services/programService.ts')
  const empty = { ...draft, durationYears: '', totalCredits: '' }
  const payload = s.programPayload(empty, 'Bachelor of Science')
  assert.equal(payload.durationYears, undefined)
  assert.equal(payload.totalCredits, undefined)
})

test('directory uses supported filters, all pages and rejects incomplete data', async () => {
  const h = harness(), s = h.load('src/services/programService.ts')
  h.respond(async (method, url, options) => ({ data: { content: [{ ...row, id: 7 + options.params.page }], page: options.params.page, size: 100, totalElements: 2, totalPages: 2 } }))
  assert.equal((await s.getProgramDirectory(filters)).length, 2)
  assert.deepEqual(h.calls[0].args[1].params, { page: 0, size: 100, sort: 'id,asc', search: 'science', facultyId: 2, departmentId: 2, degreeLevel: 'Bachelor of Science', status: 'INACTIVE' })
  assert.equal(h.calls[1].args[1].params.page, 1)
  h.respond(async () => ({ data: { content: [row], page: 0, size: 100, totalElements: 2, totalPages: 1 } }))
  await assert.rejects(s.getProgramDirectory(filters))
  h.respond(async () => ({ data: { content: [], page: 0, size: 100, totalElements: 2001, totalPages: 21 } }))
  await assert.rejects(s.getProgramDirectory(filters), /Too many/)
})

test('CRUD and summary paths are correct and bad IDs never reach API', async () => {
  const h = harness(), s = h.load('src/services/programService.ts')
  h.respond(async method => ({ data: method === 'get' ? row : undefined }))
  await s.createProgram(draft, 'Bachelor'); await s.getProgramById('7'); await s.updateProgram('7', draft, 'Bachelor'); await s.deleteProgram('7')
  assert.deepEqual(h.calls.map(c => [c.method, c.args[0]]), [['post', '/programs'], ['get', '/programs/7'], ['put', '/programs/7'], ['delete', '/programs/7']])
  for (const id of ['', '0', 'x', '2/path']) { await assert.rejects(s.getProgramById(id)); await assert.rejects(s.deleteProgram(id)); await assert.rejects(s.updateProgram(id, draft, 'Bachelor')) }
  assert.equal(h.calls.length, 4)
  h.respond(async () => ({ data: { totalPrograms: 18, activePrograms: 17, inactivePrograms: 1 } }))
  assert.equal((await s.getProgramSummary()).totalPrograms, 18)
})

test('degree badge style maps known names and falls back for unknown', () => {
  const { load } = harness(), { degreeBadgeStyle: style } = load('src/utils/programApi.ts')
  const known = style('Bachelor of Science')
  assert.equal(known.background, '#D1FAE5')
  assert.equal(known.color, '#059669')
  const unknown = style('Master of Unknown')
  assert.equal(unknown.background, '#f3f4f6')
  assert.equal(unknown.color, '#6b7280')
})

test('program error codes map to correct fields and messages', () => {
  const { load } = harness(), { programError: error } = load('src/utils/programApi.ts')
  const response = (status, code) => ({ response: { status, data: { code, message: 'SQL internals' } } })
  assert.ok(error(response(404, 'PROGRAM_NOT_FOUND')).message.includes('not found'))
  assert.ok(error(response(404, 'FACULTY_NOT_FOUND')).fields.facultyId)
  assert.ok(error(response(404, 'DEPARTMENT_NOT_FOUND')).fields.departmentId)
  assert.ok(error(response(409, 'PROGRAM_CODE_ALREADY_EXISTS')).fields.code)
  assert.ok(error(response(409, 'PROGRAM_ALREADY_EXISTS')).fields.name)
  assert.ok(error(response(400, 'INVALID_PROGRAM_DEPARTMENT')).fields.departmentId)
  assert.ok(!error(response(500, 'UNKNOWN')).message.includes('SQL'))
})
