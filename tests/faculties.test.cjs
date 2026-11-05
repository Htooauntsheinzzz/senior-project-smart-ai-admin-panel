const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function harness() {
  const calls = []
  let handler = async () => ({ data: undefined })
  const api = Object.fromEntries(['get', 'post', 'put', 'delete'].map(method => [method, async (...args) => { calls.push({ method, args }); return handler(method, ...args) }]))
  const cache = new Map()
  function load(file) {
    file = path.resolve(__dirname, '..', file)
    if (!path.extname(file)) file += '.ts'
    if (cache.has(file)) return cache.get(file).exports
    const module = { exports: {} }; cache.set(file, module)
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    const localRequire = name => name.includes('apiClient') ? { __esModule: true, default: api } : load(path.resolve(path.dirname(file), name))
    vm.runInThisContext(`(function(require,module,exports){${source}\n})`)(localRequire, module, module.exports)
    return module.exports
  }
  return { calls, load, respond: next => { handler = next } }
}
const input = { code: ' FAC-ENG ', nameEn: 'Faculty of Engineering', nameTh: 'คณะวิศวกรรมศาสตร์', status: 'inactive' }
const row = { id: 12, facultyCode: 'FAC-ENG', facultyNameEn: input.nameEn, facultyNameTh: input.nameTh, isActive: false, departmentCount: 0, studentCount: 17 }

test('mapping preserves Thai, false, zero, null and exact request fields', () => {
  const { load } = harness(), s = load('src/services/facultyService.ts')
  assert.deepEqual(s.facultyPayload(input), { facultyCode: 'FAC-ENG', facultyNameEn: input.nameEn, facultyNameTh: input.nameTh, isActive: false })
  assert.equal(s.facultyPayload({ ...input, nameTh: ' ' }).facultyNameTh, null)
  const result = s.mapFaculty(row)
  assert.equal(result.status, 'inactive'); assert.equal(result.departmentCount, 0); assert.equal(result.nameTh, input.nameTh)
  assert.equal(s.mapFaculty({ ...row, facultyNameTh: null }).nameTh, '')
  assert.throws(() => s.mapFaculty({ ...row, isActive: 'false' }))
  assert.throws(() => s.mapFaculty({ ...row, studentCount: undefined }))
})

test('validation follows actual code/name constraints without duplicate-self checks', () => {
  const { load } = harness(), { validateFacultyForm: validate, facultyError } = load('src/utils/facultyApi.ts')
  assert.deepEqual(validate(input), {})
  assert.ok(validate({ ...input, code: 'fac-eng' }).code)
  assert.ok(validate({ ...input, code: 'X'.repeat(31) }).code)
  assert.ok(validate({ ...input, nameEn: ' ' }).nameEn)
  assert.ok(validate({ ...input, nameTh: 'ก'.repeat(256) }).nameTh)
  assert.ok(facultyError({ response: { status: 409, data: { code: 'FACULTY_CODE_ALREADY_EXISTS' } } }).fields.code)
  assert.ok(facultyError({ response: { status: 409, data: { code: 'FACULTY_NAME_ALREADY_EXISTS' } } }).fields.nameEn)
  assert.equal(facultyError({ response: { status: 404 } }).message, 'Faculty not found.')
  assert.ok(!facultyError({ response: { status: 500, data: { message: 'SQL internals' } } }).message.includes('SQL'))
})

test('service reads complete pages with server search and rejects partial or changing results', async () => {
  const h = harness(), s = h.load('src/services/facultyService.ts')
  h.respond(async (method, url, options) => ({ data: { content: options.params.page === 0 ? [row] : [{ ...row, id: 13 }], page: options.params.page, size: 100, totalElements: 2, totalPages: 2, last: options.params.page === 1 } }))
  const rows = await s.getFaculties('  วิศวกรรม  ')
  assert.equal(rows.length, 2)
  assert.equal(h.calls[0].args[1].params.search, 'วิศวกรรม')
  assert.equal(h.calls[1].args[1].params.page, 1)
  h.respond(async () => ({ data: { content: [row], page: 0, size: 100, totalElements: 2, totalPages: 1, last: true } }))
  await assert.rejects(s.getFaculties())
  h.respond(async () => ({ data: { content: [], page: 0, size: 100, totalElements: 2001, totalPages: 21, last: false } }))
  await assert.rejects(s.getFaculties(), /too large/)
  h.respond(async () => ({ data: { data: [] } }))
  await assert.rejects(s.getFaculties())
})

test('CRUD uses verified URLs and ID validation; 204 deletion needs no body', async () => {
  const h = harness(), s = h.load('src/services/facultyService.ts')
  h.respond(async method => ({ data: method === 'get' ? row : undefined }))
  await s.createFaculty(input); await s.updateFaculty('12', input); await s.getFacultyById('12'); await s.deleteFaculty('12')
  assert.deepEqual(h.calls.map(call => [call.method, call.args[0]]), [['post', '/faculties'], ['put', '/faculties/12'], ['get', '/faculties/12'], ['delete', '/faculties/12']])
  assert.equal(Object.keys(h.calls[1].args[1]).length, 4)
  for (const id of ['', '0', '-1', 'NaN', '1/other', '9007199254740992']) {
    await assert.rejects(s.getFacultyById(id)); await assert.rejects(s.updateFaculty(id, input)); await assert.rejects(s.deleteFaculty(id))
  }
  assert.equal(h.calls.length, 4)
  h.respond(async () => ({ data: { totalFaculties: 7, activeFaculties: 6, inactiveFaculties: 1, totalDepartments: 20 } }))
  assert.equal((await s.getFacultySummary()).totalDepartments, 20)
  assert.equal(h.calls.at(-1).args[0], '/faculties/summary')
})
