const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

// Spec 46 (self-registrations wait for a Super Admin's approval). Runs the real
// frontend modules without a browser or a backend, like admin-registration.test.cjs.
function harness(env = {}) {
  const settings = { VITE_API_BASE_URL: 'http://test.invalid', ...env }
  const cache = new Map()
  function load(file) {
    file = path.resolve(__dirname, '..', file)
    if (!path.extname(file)) file += fs.existsSync(`${file}.ts`) ? '.ts' : '.js'
    if (cache.has(file)) return cache.get(file).exports
    const module = { exports: {} }
    cache.set(file, module)
    const source = fs.readFileSync(file, 'utf8').replace(/import\.meta\.env\.(VITE_[A-Z_]+)/g, (_, name) => JSON.stringify(settings[name]) ?? 'undefined')
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    const localRequire = name => name.includes('tokenStorage') ? { getAccessToken: () => 'super-admin-token' } : name.startsWith('.') ? load(path.resolve(path.dirname(file), name)) : require(name)
    vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: file })(localRequire, module, module.exports)
    return module.exports
  }
  return load
}

const failure = (status, code) => ({ response: { status, data: { code, message: 'SQL internal details should not be shown' } } })

test('a waiting registration is told apart from every other refusal', () => {
  const r = harness()('src/utils/adminRegistration.js')
  assert.equal(r.isPendingApproval(failure(403, 'ACCOUNT_PENDING_APPROVAL')), true)
  for (const other of [failure(403, 'ACCOUNT_NOT_ACTIVE'), failure(401, 'ACCOUNT_PENDING_APPROVAL'), failure(401, 'INVALID_CREDENTIALS'), failure(403, undefined), { request: {} }, new Error('x'), null])
    assert.equal(r.isPendingApproval(other), false)
  assert.equal(r.PENDING_APPROVAL_NOTICE, 'Your registration is waiting for approval by the admin team. We will email you when it is approved.')
  // Also where the Google text is used as it is.
  assert.equal(r.googleSignInFailure(failure(403, 'ACCOUNT_PENDING_APPROVAL')), r.PENDING_APPROVAL_NOTICE)
  assert.equal(r.googleSignInFailure(failure(403, 'ACCOUNT_NOT_ACTIVE')), 'This account cannot sign in. Please contact IT Support.')
})

test('approve and reject post to the user, with the Super Admin token, and refuse a bad ID without a request', async () => {
  const load = harness()
  const api = load('src/api/apiClient.js')
  const users = load('src/services/userService.js')
  const requests = []
  api.default.defaults.adapter = async config => {
    requests.push(config)
    return config.url.endsWith('/approve')
      ? { data: { id: 7, accountStatus: 'ACTIVE' }, status: 200, statusText: 'OK', headers: {}, config }
      : { data: '', status: 204, statusText: 'No Content', headers: {}, config }
  }
  assert.deepEqual(await users.approveUser(7), { id: 7, accountStatus: 'ACTIVE' })
  assert.equal(await users.rejectUser(8), undefined)
  assert.deepEqual(requests.map(r => [r.method, r.baseURL + r.url]), [
    ['post', 'http://test.invalid/api/v1/admin/users/7/approve'],
    ['post', 'http://test.invalid/api/v1/admin/users/8/reject'],
  ])
  for (const request of requests) {
    assert.equal(request.headers.Authorization, 'Bearer super-admin-token')
    assert.equal(request.data, undefined)
  }
  for (const bad of [0, -1, '7/../9', '1e3', 'abc', 2 ** 60])
    await assert.rejects(users.approveUser(bad), /Invalid admin user ID/)
  await assert.rejects(users.rejectUser('../7'), /Invalid admin user ID/)
  assert.equal(requests.length, 2)
})

test('Admin Users: the waiting status has a name, a filter option, and only Approve or Reject change it', () => {
  const load = harness()
  const { accountStatusFilters, accountStatusLabels, accountStatuses, isRegistrationStatus } = load('src/types/adminUser.ts')
  const { accountStatusChoices, emptyAdminForm, validateAdminForm } = load('src/utils/addAdminUser.ts')

  assert.equal(accountStatusLabels.PENDING_APPROVAL, 'Waiting for approval')
  assert.equal(accountStatusLabels.PENDING_VERIFICATION, 'Unverified')
  assert.deepEqual(accountStatusFilters.map(status => status.value), ['ACTIVE', 'INACTIVE', 'LOCKED', 'SUSPENDED', 'PENDING_APPROVAL', 'PENDING_VERIFICATION'])
  // The add form still offers only what a Super Admin can set.
  assert.deepEqual(accountStatuses.map(status => status.value), ['ACTIVE', 'INACTIVE', 'LOCKED', 'SUSPENDED'])
  assert.equal(isRegistrationStatus('PENDING_APPROVAL'), true)
  assert.equal(isRegistrationStatus('PENDING_VERIFICATION'), true)
  for (const other of ['ACTIVE', 'SUSPENDED', '', null, undefined]) assert.equal(isRegistrationStatus(other), false)

  // The edit form of a waiting registration has its own status as the only choice.
  assert.deepEqual(accountStatusChoices('PENDING_APPROVAL'), [{ value: 'PENDING_APPROVAL', label: 'Waiting for approval' }])
  assert.equal(accountStatusChoices('SUSPENDED'), accountStatuses)

  const form = { ...emptyAdminForm, employeeId: 'RSU-001', firstName: 'Wait', lastName: 'Approval', email: 'wait.approval@rsu.ac.th', roleId: '2' }
  const edit = (accountStatus, currentStatus) => validateAdminForm({ ...form, accountStatus }, { requirePassword: false, currentStatus }).accountStatus
  // Kept unchanged: valid, so the employee ID and the role can be saved before approving.
  assert.equal(edit('PENDING_APPROVAL', 'PENDING_APPROVAL'), undefined)
  assert.equal(edit('PENDING_VERIFICATION', 'PENDING_VERIFICATION'), undefined)
  // Any other use of a pending status is refused before the request.
  assert.equal(edit('PENDING_APPROVAL', 'ACTIVE'), 'Select a valid account status.')
  assert.equal(edit('PENDING_APPROVAL', 'PENDING_VERIFICATION'), 'Select a valid account status.')
  assert.equal(edit('PENDING_APPROVAL', ''), 'Select a valid account status.')
  assert.equal(validateAdminForm({ ...form, accountStatus: 'PENDING_APPROVAL' }).accountStatus, 'Select a valid account status.')
  assert.equal(edit('ACTIVE', 'ACTIVE'), undefined)
})

test('the decision errors of the backend become fixed texts', () => {
  const { apiErrorMessage } = harness()('src/utils/apiError.ts')
  assert.equal(apiErrorMessage(failure(409, 'REGISTRATION_NOT_PENDING'), 'fallback'), 'This registration was already approved or rejected.')
  assert.equal(apiErrorMessage(failure(409, 'REGISTRATION_DECISION_REQUIRED'), 'fallback'), 'Approve or reject this registration first.')
  assert.equal(apiErrorMessage(failure(404, 'USER_NOT_FOUND'), 'fallback'), 'User not found.')
  assert.equal(apiErrorMessage(failure(403, 'ACCESS_DENIED'), 'fallback'), 'You do not have permission to perform this action.')
  assert.equal(apiErrorMessage(failure(500, 'INTERNAL_ERROR'), 'fallback'), 'fallback')
})
