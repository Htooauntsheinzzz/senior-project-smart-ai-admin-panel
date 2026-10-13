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
const input = { code: ' DIT ', name: ' Digital Innovation Technology ', facultyId: '2', status: 'inactive' }
const row = { id: 7, departmentCode: 'DIT', departmentName: 'Digital Innovation Technology', facultyId: 2, facultyCode: 'FAC-ENG', facultyNameEn: 'Faculty of Engineering', isActive: false, programCount: 3, courseCount: 0, studentCount: 0 }
const filters = { query: ' digital ', facultyId: '2', status: 'inactive' }

test('payload, validation and response mapping preserve server IDs and false', () => {
  const h = harness(), s = h.load('src/services/departmentService.ts'), u = h.load('src/utils/departmentApi.ts')
  assert.deepEqual(s.departmentPayload(input), { departmentCode: 'DIT', departmentName: 'Digital Innovation Technology', facultyId: 2, isActive: false })
  assert.deepEqual(u.validateDepartmentForm(input), {})
  for (const facultyId of ['', '0', '-2', '1.5', 'Engineering', '9007199254740992']) { assert.ok(u.validateDepartmentForm({ ...input, facultyId }).facultyId); assert.throws(() => s.departmentPayload({ ...input, facultyId })) }
  assert.ok(u.validateDepartmentForm({ ...input, code: 'dit' }).code)
  assert.ok(u.validateDepartmentForm({ ...input, name: ' ' }).name)
  assert.ok(u.validateDepartmentForm({ ...input, code: 'X'.repeat(31) }).code)
  assert.ok(u.validateDepartmentForm({ ...input, name: 'X'.repeat(256) }).name)
  assert.equal(s.mapDepartment(row).facultyNameEn, row.facultyNameEn)
  assert.equal(s.mapDepartment(row).status, 'inactive')
  assert.equal(s.mapDepartment(row).courseCount, 0)
  assert.throws(() => s.mapDepartment({ ...row, isActive: 'false' }))
  assert.throws(() => s.mapDepartment({ ...row, facultyId: undefined }))
})

test('directory uses supported filters, all pages and rejects incomplete data', async () => {
  const h = harness(), s = h.load('src/services/departmentService.ts')
  h.respond(async (method, url, options) => ({ data: { content: [{ ...row, id: 7 + options.params.page }], page: options.params.page, size: 100, totalElements: 2, totalPages: 2 } }))
  assert.equal((await s.getDepartmentDirectory(filters)).length, 2)
  assert.deepEqual(h.calls[0].args[1].params, { page: 0, size: 100, sort: 'id,asc', search: 'digital', facultyId: 2, status: 'INACTIVE' })
  assert.equal(h.calls[1].args[1].params.page, 1)
  h.respond(async () => ({ data: { content: [row], page: 0, size: 100, totalElements: 2, totalPages: 1 } }))
  await assert.rejects(s.getDepartmentDirectory(filters))
  h.respond(async () => ({ data: { content: [], page: 0, size: 100, totalElements: 2001, totalPages: 21 } }))
  await assert.rejects(s.getDepartmentDirectory(filters), /Too many/)
})

test('CRUD and summary paths are correct and bad IDs never reach API', async () => {
  const h = harness(), s = h.load('src/services/departmentService.ts')
  h.respond(async method => ({ data: method === 'get' ? row : undefined }))
  await s.createDepartment(input); await s.getDepartmentById('7'); await s.updateDepartment('7', input); await s.deleteDepartment('7')
  assert.deepEqual(h.calls.map(c => [c.method, c.args[0]]), [['post', '/departments'], ['get', '/departments/7'], ['put', '/departments/7'], ['delete', '/departments/7']])
  for (const id of ['', '0', 'x', '2/path']) { await assert.rejects(s.getDepartmentById(id)); await assert.rejects(s.deleteDepartment(id)); await assert.rejects(s.updateDepartment(id, input)) }
  assert.equal(h.calls.length, 4)
  h.respond(async () => ({ data: { totalDepartments: 18, activeDepartments: 17, inactiveDepartments: 1 } }))
  assert.equal((await s.getDepartmentSummary()).totalDepartments, 18)
})

test('faculty assignment lookup uses ACTIVE, directory lookup includes inactive', async () => {
  const h = harness(), s = h.load('src/services/facultyService.ts')
  h.respond(async () => ({ data: { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0, last: true } }))
  await s.getActiveFacultyOptions(); await s.getFaculties()
  assert.equal(h.calls[0].args[1].params.status, 'ACTIVE')
  assert.equal(h.calls[1].args[1].params.status, undefined)
})

test('faculty and department 404s, conflicts and dependencies have distinct safe feedback', () => {
  const { load } = harness(), { departmentError: error } = load('src/utils/departmentApi.ts')
  const response = (status, code) => ({ response: { status, data: { code, message: 'SQL internals' } } })
  assert.ok(error(response(404, 'FACULTY_NOT_FOUND')).fields.facultyId)
  assert.equal(error(response(404, 'DEPARTMENT_NOT_FOUND')).message, 'Department not found.')
  assert.ok(error(response(409, 'DEPARTMENT_NAME_ALREADY_EXISTS')).fields.name)
  assert.ok(error(response(409, 'DEPARTMENT_CODE_ALREADY_EXISTS')).fields.code)
  assert.match(error(response(409, 'DEPARTMENT_IN_USE')).message, /users/)
  assert.match(error(response(409, 'DEPARTMENT_HAS_PROGRAMS')).message, /programs/)
  assert.ok(!error(response(500, 'UNKNOWN')).message.includes('SQL'))
})
