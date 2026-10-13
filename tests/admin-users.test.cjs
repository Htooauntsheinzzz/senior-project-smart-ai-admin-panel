const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

// Run the actual frontend service and validation modules without a browser or
// live database. The Axios adapter captures requests after auth interception.
function harness() {
  const cache = new Map()
  function load(file) {
    file = path.resolve(__dirname, '..', file)
    if (!path.extname(file)) file += fs.existsSync(`${file}.ts`) ? '.ts' : '.js'
    if (cache.has(file)) return cache.get(file).exports
    const module = { exports: {} }
    cache.set(file, module)
    const source = fs.readFileSync(file, 'utf8').replaceAll('import.meta.env.VITE_API_BASE_URL', "'http://test.invalid'")
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    const localRequire = name => name.includes('tokenStorage') ? { getAccessToken: () => 'test-access-token' } : name.startsWith('.') ? load(path.resolve(path.dirname(file), name)) : require(name)
    vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: file })(localRequire, module, module.exports)
    return module.exports
  }
  return load
}

test('create and update preserve exact field types and exclude security fields from PUT', () => {
  const load = harness()
  const u = load('src/utils/addAdminUser.ts')
  const values = { ...u.emptyAdminForm, employeeId: ' TEST-001 ', phoneNumber: '+66 81 234 5678', firstName: ' Test ', lastName: ' Person ', email: 'test@example.edu', roleId: '2', temporaryPassword: 'TestOnlyPassword!123', confirmPassword: 'TestOnlyPassword!123', forcePasswordChange: false }
  assert.deepEqual(u.validateAdminForm(values), {})
  const payload = u.buildCreatePayload(values)
  assert.equal(payload.departmentId, null)
  assert.equal(payload.roleId, 2)
  assert.equal(payload.forcePasswordChange, false)
  assert.equal(payload.employeeId, 'TEST-001')
  assert.equal(u.buildCreatePayload({ ...values, departmentId: '5' }).departmentId, 5)
  assert.deepEqual(Object.keys(payload).sort(), ['employeeId', 'phoneNumber', 'firstName', 'lastName', 'email', 'departmentId', 'accountStatus', 'roleId', 'temporaryPassword', 'confirmPassword', 'forcePasswordChange'].sort())
  const update = u.buildUpdatePayload(values)
  assert.equal(Object.keys(update).length, 8)
  for (const field of ['temporaryPassword', 'confirmPassword', 'forcePasswordChange']) assert.equal(field in update, false)
  assert.ok(u.validateAdminForm({ ...values, confirmPassword: 'different' }).confirmPassword)
  for (const roleId of ['', '0', '-1', 'NaN', '1.5', '9007199254740992']) assert.ok(u.validateAdminForm({ ...values, roleId }).roleId)
  assert.ok(u.validateAdminForm({ ...values, departmentId: 'invalid' }).departmentId)
  assert.ok(u.validateAdminForm({ ...values, employeeId: 'x'.repeat(51) }).employeeId)
  assert.ok(u.validateAdminForm({ ...values, temporaryPassword: '😀'.repeat(14) }).temporaryPassword)
  assert.ok(u.validateAdminForm({ ...values, temporaryPassword: 'x'.repeat(73) }).temporaryPassword)
  assert.ok(u.validateAdminForm({ ...values, temporaryPassword: 'x'.repeat(15) + '\0' }).temporaryPassword)
  assert.deepEqual(u.validateAdminForm({ ...values, temporaryPassword: '', confirmPassword: '' }, { requirePassword: false }), {})
})

test('CRUD uses central auth, correct URLs, query parameters, and response shapes', async () => {
  const load = harness()
  const api = load('src/api/apiClient.js')
  const users = load('src/services/userService.js')
  const requests = []
  const data = { content: [{ id: 7 }], page: 0, totalElements: 1, totalPages: 1 }
  api.default.defaults.adapter = async config => {
    requests.push(config)
    assert.equal(config.headers.Authorization, 'Bearer test-access-token')
    assert.equal(config.baseURL, 'http://test.invalid/api/v1/admin')
    return { data, status: 200, statusText: 'OK', headers: {}, config }
  }
  const params = { page: 1, size: 8, search: 'test', accountStatus: 'ACTIVE', roleId: 2, departmentId: 5 }
  assert.deepEqual(await users.getUsers(params), data)
  assert.deepEqual(requests[0].params, params)
  await users.getUserById(7)
  await users.createUser({ roleId: 2, departmentId: null, forcePasswordChange: false })
  await users.updateUser(7, { roleId: 2, departmentId: null })
  await users.deleteUser(7)
  assert.deepEqual(requests.map(r => [r.method, r.url]), [['get', '/users'], ['get', '/users/7'], ['post', '/users'], ['put', '/users/7'], ['delete', '/users/7']])
  assert.deepEqual(JSON.parse(requests[2].data), { roleId: 2, departmentId: null, forcePasswordChange: false })
  for (const id of [undefined, NaN, '', 0, -1, 1.5, '1/role', Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(users.getUserById(id))
    await assert.rejects(users.updateUser(id, {}))
    await assert.rejects(users.deleteUser(id))
  }
  assert.equal(requests.length, 5)
  let unauthorized = 0
  api.setUnauthorizedHandler(() => unauthorized++)
  api.default.defaults.adapter = async () => { throw { response: { status: 401 } } }
  await assert.rejects(users.getUsers())
  assert.equal(unauthorized, 1)
})

test('API failures provide safe messages and field errors without exposing server details', () => {
  const load = harness()
  const { apiErrorMessage, adminUserFieldErrors } = load('src/utils/apiError.ts')
  const error = (status, code) => ({ response: { status, data: { code, message: 'SQL internal details should not be shown' } } })
  assert.equal(apiErrorMessage(error(500, 'INTERNAL_ERROR'), 'Retry'), 'Retry')
  assert.equal(apiErrorMessage(error(400, 'UNEXPECTED'), 'Retry'), 'Retry')
  assert.equal(apiErrorMessage(error(404, 'USER_NOT_FOUND'), 'Retry'), 'User not found.')
  assert.match(apiErrorMessage(error(403, 'ACCESS_DENIED'), 'Retry'), /permission/)
  assert.deepEqual(Object.keys(adminUserFieldErrors(error(409, 'USER_ALREADY_EXISTS'))).sort(), ['email', 'employeeId'])
  assert.ok(adminUserFieldErrors(error(400, 'INVALID_ROLE')).roleId)
  assert.ok(adminUserFieldErrors(error(400, 'PASSWORD_POLICY_VIOLATION')).temporaryPassword)
  assert.deepEqual(adminUserFieldErrors(error(500, 'USER_ALREADY_EXISTS')), {})
})
