const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

// Spec 45 (admin self-registration). Runs the real frontend modules without a
// browser or a backend. `env` stands for the Vite build settings; every call
// of harness() loads fresh modules, so module state never leaks between tests.
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
    const localRequire = name => name.includes('tokenStorage') ? { getAccessToken: () => null } : name.startsWith('.') ? load(path.resolve(path.dirname(file), name)) : require(name)
    vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: file })(localRequire, module, module.exports)
    return module.exports
  }
  return load
}

const validForm = {
  firstName: ' Somchai ', lastName: ' Jaidee ', email: '  Somchai.J@RSU.ac.th ', phoneNumber: ' 02 791 6000 ',
  password: 'a long passphrase for rsu', confirmPassword: 'a long passphrase for rsu',
}
const failure = (status, code) => ({ response: { status, data: { code, message: 'SQL internal details should not be shown' } } })

test('the register form accepts a valid form and names every wrong field', () => {
  const r = harness()('src/utils/adminRegistration.js')
  assert.deepEqual(r.validateRegistration(validForm, true), {})
  assert.deepEqual(r.validateRegistration({ ...validForm, phoneNumber: '' }, true), {})

  const empty = r.validateRegistration(r.EMPTY_REGISTRATION_FORM, false)
  assert.deepEqual(Object.keys(empty).sort(), ['confirmPassword', 'email', 'firstName', 'lastName', 'password', 'terms'])
  assert.equal(empty.firstName, 'First name is required.')
  assert.equal(empty.lastName, 'Last name is required.')
  assert.equal(empty.email, 'Email is required.')
  assert.equal(empty.password, 'Password is required.')
  assert.equal(empty.confirmPassword, 'Please confirm your password.')
  assert.equal(empty.terms, 'Please accept the terms to continue.')
  // Every field with a message is a field the form can focus.
  for (const field of Object.keys(empty)) assert.ok(r.REGISTRATION_FIELDS.includes(field))

  assert.equal(r.validateRegistration({ ...validForm, firstName: '   ' }, true).firstName, 'First name is required.')
  assert.ok(r.validateRegistration({ ...validForm, firstName: 'x'.repeat(101) }, true).firstName)
  assert.deepEqual(r.validateRegistration({ ...validForm, firstName: 'x'.repeat(100) }, true), {})
  assert.ok(r.validateRegistration({ ...validForm, lastName: 'x'.repeat(101) }, true).lastName)
  assert.equal(r.validateRegistration({ ...validForm, confirmPassword: 'a long passphrase for RSU' }, true).confirmPassword, 'Passwords do not match.')
  assert.equal(r.validateRegistration(validForm, false).terms, 'Please accept the terms to continue.')

  for (const phoneNumber of ['abc', '+++', '02-791-6000 ext 5', '0'.repeat(31)]) assert.ok(r.validateRegistration({ ...validForm, phoneNumber }, true).phoneNumber, phoneNumber)
  for (const phoneNumber of ['+66 (0)2 791-6000', '0812345678', '0'.repeat(30)]) assert.deepEqual(r.validateRegistration({ ...validForm, phoneNumber }, true), {}, phoneNumber)
})

test('the email rule is the backend rule: one domain, no sub-domain, a plain part before @', () => {
  const r = harness()('src/utils/adminRegistration.js')
  for (const email of ['somchai.j@rsu.ac.th', ' Somchai.J@RSU.AC.TH ', 'a_b%c+d-e@rsu.ac.th', 'x@rsu.ac.th']) assert.equal(r.emailProblem(email), '', email)
  for (const email of ['a@gmail.com', 'a@mail.rsu.ac.th', 'a@student.rsu.ac.th', 'a@rsu.ac.th.example.com', 'a@xrsu.ac.th']) assert.equal(r.emailProblem(email), 'Use your @rsu.ac.th email address.', email)
  for (const email of ['plain', 'a@b', 'a b@rsu.ac.th', 'a@@rsu.ac.th', 'a@b@rsu.ac.th', '.a@rsu.ac.th', 'a.@rsu.ac.th', 'a..b@rsu.ac.th', 'สมชาย@rsu.ac.th', "o'neil@rsu.ac.th"]) assert.equal(r.emailProblem(email), 'Please enter a valid email address.', email)
  assert.equal(r.emailProblem('   '), 'Email is required.')
  assert.equal(r.emailProblem(`${'a'.repeat(246)}@rsu.ac.th`), 'Use at most 255 characters.')
  assert.equal(r.emailProblem(`${'a'.repeat(245)}@rsu.ac.th`), '')
  assert.equal(r.normalizeEmail('  Somchai.J@RSU.ac.th '), 'somchai.j@rsu.ac.th')

  // Another university sets another domain for the build.
  const other = harness({ VITE_ADMIN_EMAIL_DOMAIN: 'Example.EDU' })('src/utils/adminRegistration.js')
  assert.equal(other.emailProblem('a@example.edu'), '')
  assert.equal(other.emailProblem('a@rsu.ac.th'), 'Use your @example.edu email address.')
})

test('the password rule counts characters and UTF-8 bytes like the backend', () => {
  const r = harness()('src/utils/adminRegistration.js')
  assert.equal(r.passwordProblem(''), 'Password is required.')
  assert.equal(r.passwordProblem('x'.repeat(14)), 'Use at least 15 characters.')
  assert.equal(r.passwordProblem('x'.repeat(15)), '')
  assert.equal(r.passwordProblem('x'.repeat(72)), '')
  assert.equal(r.passwordProblem('x'.repeat(73)), 'Use a shorter password (at most 72 bytes).')
  // 14 emoji are 28 UTF-16 units but 14 characters; 15 are 60 bytes.
  assert.equal(r.passwordProblem('😀'.repeat(14)), 'Use at least 15 characters.')
  assert.equal(r.passwordProblem('😀'.repeat(15)), '')
  // 25 Thai letters are 75 bytes.
  assert.equal(r.passwordProblem('ก'.repeat(24)), '')
  assert.equal(r.passwordProblem('ก'.repeat(25)), 'Use a shorter password (at most 72 bytes).')
  assert.equal(r.passwordProblem(`${'x'.repeat(15)}\0`), 'Use valid characters in the password.')
  assert.equal(r.passwordProblem(`${'x'.repeat(15)}\uD83D`), 'Use valid characters in the password.')
  // Spaces count: the backend does not trim a password.
  assert.equal(r.passwordProblem(' '.repeat(15)), '')
})

test('the request body has only the fields of the backend', () => {
  const r = harness()('src/utils/adminRegistration.js')
  const payload = r.buildRegisterPayload(validForm)
  assert.deepEqual(payload, {
    firstName: 'Somchai', lastName: 'Jaidee', email: 'somchai.j@rsu.ac.th', phoneNumber: '02 791 6000',
    password: 'a long passphrase for rsu', confirmPassword: 'a long passphrase for rsu',
  })
  // An empty phone number is left out, and no terms flag is sent (unknown fields are refused).
  const withoutPhone = r.buildRegisterPayload({ ...validForm, phoneNumber: '   ', terms: true, acceptedTerms: true })
  assert.deepEqual(Object.keys(withoutPhone).sort(), ['confirmPassword', 'email', 'firstName', 'lastName', 'password'])
  // A password is sent exactly as typed.
  assert.equal(r.buildRegisterPayload({ ...validForm, password: '  spaces stay here  ' }).password, '  spaces stay here  ')
})

test('the four public endpoints get the right paths and bodies', async () => {
  const load = harness()
  const api = load('src/api/apiClient.js')
  const auth = load('src/services/authService.js')
  const requests = []
  api.default.defaults.adapter = async config => {
    requests.push(config)
    return { data: { ok: requests.length }, status: 202, statusText: 'Accepted', headers: {}, config }
  }
  const payload = { firstName: 'A', lastName: 'B', email: 'a@rsu.ac.th', password: 'p', confirmPassword: 'p' }
  assert.deepEqual(await auth.register(payload), { ok: 1 })
  assert.deepEqual(await auth.verifyEmail('token-123'), { ok: 2 })
  assert.deepEqual(await auth.resendVerification('a@rsu.ac.th'), { ok: 3 })
  assert.deepEqual(await auth.googleSignIn('google.id.token'), { ok: 4 })
  assert.deepEqual(requests.map(r => [r.method, r.baseURL + r.url]), [
    ['post', 'http://test.invalid/api/v1/admin/auth/register'],
    ['post', 'http://test.invalid/api/v1/admin/auth/verify-email'],
    ['post', 'http://test.invalid/api/v1/admin/auth/resend-verification'],
    ['post', 'http://test.invalid/api/v1/admin/auth/google'],
  ])
  assert.deepEqual(requests.map(r => JSON.parse(r.data)), [payload, { token: 'token-123' }, { email: 'a@rsu.ac.th' }, { idToken: 'google.id.token' }])
  // Public pages: nobody is signed in, so no Authorization header is sent.
  for (const request of requests) assert.equal(request.headers.Authorization, undefined)
})

test('register failures become fixed texts and field messages, never the server message', () => {
  const r = harness()('src/utils/adminRegistration.js')
  assert.deepEqual(r.registrationFailure({ request: {} }), { message: 'Unable to connect to the server. Please try again.', fieldErrors: {} })
  assert.deepEqual(r.registrationFailure(failure(400, 'EMAIL_DOMAIN_NOT_ALLOWED')), { message: '', fieldErrors: { email: 'Only @rsu.ac.th email addresses can register.' } })
  assert.deepEqual(Object.keys(r.registrationFailure(failure(400, 'PASSWORD_POLICY_VIOLATION')).fieldErrors), ['password'])
  assert.deepEqual(r.registrationFailure(failure(400, 'PASSWORD_CONFIRMATION_MISMATCH')).fieldErrors, { confirmPassword: 'Passwords do not match.' })
  assert.equal(r.registrationFailure(failure(400, 'VALIDATION_ERROR')).message, 'Please check the entered values.')
  assert.equal(r.registrationFailure(failure(400, 'SOMETHING_NEW')).message, 'Please check the entered values.')
  assert.equal(r.registrationFailure(failure(403, 'REGISTRATION_DISABLED')).message, 'Registration is closed. Please contact IT Support.')
  assert.equal(r.registrationFailure(failure(429, 'TOO_MANY_REQUESTS')).message, 'Too many attempts. Please wait a minute and try again.')
  assert.equal(r.registrationFailure(failure(503, 'REGISTRATION_UNAVAILABLE')).message, 'Registration is not available right now. Please try again later.')
  assert.equal(r.registrationFailure(failure(500, 'INTERNAL_ERROR')).message, 'Registration is not available right now. Please try again later.')
  assert.equal(r.registrationFailure(failure(418, 'TEAPOT')).message, 'Unable to register. Please try again.')
  // A field message always belongs to a field of the form.
  for (const code of ['EMAIL_DOMAIN_NOT_ALLOWED', 'PASSWORD_POLICY_VIOLATION', 'PASSWORD_CONFIRMATION_MISMATCH']) {
    for (const field of Object.keys(r.registrationFailure(failure(400, code)).fieldErrors)) assert.ok(r.REGISTRATION_FIELDS.includes(field))
  }
  const everyText = [400, 403, 409, 418, 429, 500, 503].flatMap(status => ['X', 'EMAIL_DOMAIN_NOT_ALLOWED', 'REGISTRATION_DISABLED'].map(code => JSON.stringify(r.registrationFailure(failure(status, code)))))
  for (const text of everyText) assert.doesNotMatch(text, /SQL/)
})

test('the link check: a link works once, a server problem can be tried again', () => {
  const r = harness()('src/utils/adminRegistration.js')
  assert.equal(r.isUsableVerificationToken('k'.repeat(43)), true)
  assert.equal(r.isUsableVerificationToken('k'.repeat(128)), true)
  for (const token of ['', '   ', 'k'.repeat(129), null, undefined, 42]) assert.equal(r.isUsableVerificationToken(token), false)
  assert.equal(r.verificationFailure(failure(400, 'INVALID_VERIFICATION_TOKEN')), 'invalid')
  assert.equal(r.verificationFailure(failure(400, 'VALIDATION_ERROR')), 'invalid')
  for (const error of [failure(429, 'TOO_MANY_REQUESTS'), failure(500, 'INTERNAL_ERROR'), failure(503, 'X'), { request: {} }, new Error('offline')]) assert.equal(r.verificationFailure(error), 'retry')

  assert.deepEqual(r.resendFailure(failure(400, 'VALIDATION_ERROR')), { message: '', fieldError: 'Please enter a valid email address.' })
  assert.equal(r.resendFailure(failure(429, 'TOO_MANY_REQUESTS')).message, 'Too many emails for this address. Please wait a minute and try again.')
  assert.equal(r.resendFailure(failure(500, 'INTERNAL_ERROR')).message, 'Unable to send the email right now. Please try again.')
  assert.equal(r.resendFailure({ request: {} }).message, 'Unable to connect to the server. Please try again.')
})

test('Google sign-in failures say what to do, by error code', () => {
  const r = harness()('src/utils/adminRegistration.js')
  const text = (status, code) => r.googleSignInFailure(failure(status, code))
  assert.equal(text(401, 'INVALID_GOOGLE_TOKEN'), 'Google sign-in failed. Please try again.')
  assert.equal(text(400, 'VALIDATION_ERROR'), 'Google sign-in failed. Please try again.')
  assert.equal(text(403, 'GOOGLE_EMAIL_NOT_VERIFIED'), 'Google has not verified the email address of this account.')
  assert.equal(text(403, 'EMAIL_DOMAIN_NOT_ALLOWED'), 'Only @rsu.ac.th Google accounts can sign in. Choose your university account.')
  assert.equal(text(403, 'GOOGLE_ACCOUNT_NOT_IN_DOMAIN'), 'Use the Google account of your @rsu.ac.th university mailbox. A personal Google account cannot sign in.')
  assert.equal(text(403, 'ACCOUNT_NOT_ACTIVE'), 'This account cannot sign in. Please contact IT Support.')
  assert.equal(text(403, 'REGISTRATION_DISABLED'), 'Registration is closed. Please contact IT Support.')
  assert.equal(text(409, 'GOOGLE_ACCOUNT_MISMATCH'), 'This account is linked to another Google account. Please contact IT Support.')
  assert.equal(text(429, 'TOO_MANY_REQUESTS'), 'Too many attempts. Please wait a minute and try again.')
  assert.equal(text(503, 'GOOGLE_SIGN_IN_NOT_CONFIGURED'), 'Google sign-in is not set up on the server yet.')
  assert.equal(text(503, 'GOOGLE_SIGN_IN_UNAVAILABLE'), 'Google sign-in is not available right now. Please try again later.')
  assert.equal(text(500, 'INTERNAL_ERROR'), 'Google sign-in is not available right now. Please try again later.')
  assert.equal(r.googleSignInFailure({ request: {} }), 'Unable to connect to the server. Please try again.')
  assert.equal(r.googleSignInFailure({ code: 'ERR_NETWORK' }), 'Unable to connect to the server. Please try again.')
  // An answer without tokens (AuthContext throws a plain Error) and Google giving no credential.
  assert.equal(r.googleSignInFailure(new Error('Invalid authentication response.')), 'Google sign-in failed. Please try again.')
  assert.equal(r.googleSignInFailure(null), 'Google sign-in failed. Please try again.')
  for (const [status, code] of [[401, 'A'], [403, 'B'], [409, 'C'], [429, 'D'], [500, 'E'], [503, 'F']]) assert.doesNotMatch(text(status, code), /SQL/)
})

test('build settings: trimmed client ID, lower-case domains, safe fallbacks', () => {
  const defaults = harness()('src/utils/authConfig.js')
  assert.equal(defaults.GOOGLE_CLIENT_ID, '')
  assert.equal(defaults.ADMIN_EMAIL_DOMAIN, 'rsu.ac.th')
  assert.equal(defaults.GOOGLE_HOSTED_DOMAIN, 'rsu.ac.th')

  const set = harness({ VITE_GOOGLE_CLIENT_ID: '  123-abc.apps.googleusercontent.com ', VITE_ADMIN_EMAIL_DOMAIN: ' Example.EDU ', VITE_GOOGLE_HOSTED_DOMAIN: 'G.Example.edu' })('src/utils/authConfig.js')
  assert.equal(set.GOOGLE_CLIENT_ID, '123-abc.apps.googleusercontent.com')
  assert.equal(set.ADMIN_EMAIL_DOMAIN, 'example.edu')
  assert.equal(set.GOOGLE_HOSTED_DOMAIN, 'g.example.edu')

  // The hosted domain follows the email domain; a value that is not a host name is ignored.
  const follows = harness({ VITE_ADMIN_EMAIL_DOMAIN: 'example.edu', VITE_GOOGLE_HOSTED_DOMAIN: '' })('src/utils/authConfig.js')
  assert.equal(follows.GOOGLE_HOSTED_DOMAIN, 'example.edu')
  const broken = harness({ VITE_ADMIN_EMAIL_DOMAIN: '@rsu.ac.th', VITE_GOOGLE_HOSTED_DOMAIN: 'https://rsu.ac.th/' })('src/utils/authConfig.js')
  assert.equal(broken.ADMIN_EMAIL_DOMAIN, 'rsu.ac.th')
  assert.equal(broken.GOOGLE_HOSTED_DOMAIN, 'rsu.ac.th')
})

// A stand-in for the browser and for Google's script (accounts.google.com is not called in tests).
function fakeBrowser({ scriptWorks = () => true } = {}) {
  const scripts = []
  const calls = { initialize: [], renderButton: [] }
  const identity = {
    initialize: config => calls.initialize.push(config),
    renderButton: (container, options) => { calls.renderButton.push(options); container.children.push('google-button') },
  }
  globalThis.window = {}
  globalThis.document = {
    createElement: () => ({ remove() { this.removed = true } }),
    head: {
      appendChild(script) {
        scripts.push(script)
        setImmediate(() => {
          if (scriptWorks(scripts.length)) { globalThis.window.google = { accounts: { id: identity } }; script.onload() } else script.onerror()
        })
      },
    },
  }
  const container = () => ({ children: ['old'], replaceChildren() { this.children.length = 0 } })
  return { scripts, calls, container }
}

test("Google's script is loaded once, initialized once, and a failed load can be tried again", async t => {
  t.after(() => { delete globalThis.window; delete globalThis.document })
  const browser = fakeBrowser()
  const g = harness({ VITE_GOOGLE_CLIENT_ID: 'client-1.apps.googleusercontent.com' })('src/utils/googleIdentity.js')

  const first = browser.container()
  const second = browser.container()
  const [a, b] = await Promise.all([
    g.renderGoogleButton(first, { text: 'signin_with', width: 376, onResponse: () => {} }),
    g.renderGoogleButton(second, { text: 'signup_with', width: 280, onResponse: () => {} }),
  ])
  assert.deepEqual([a, b], [true, true])
  assert.equal(browser.scripts.length, 1)
  assert.equal(browser.scripts[0].src, 'https://accounts.google.com/gsi/client')
  assert.equal(browser.scripts[0].async, true)
  assert.equal(browser.calls.initialize.length, 1)
  const config = browser.calls.initialize[0]
  assert.equal(config.client_id, 'client-1.apps.googleusercontent.com')
  assert.equal(config.hd, 'rsu.ac.th')
  assert.equal(config.ux_mode, 'popup')
  assert.equal(config.auto_select, false)
  assert.equal(config.login_uri, undefined)
  assert.equal(typeof config.callback, 'function')
  assert.deepEqual(browser.calls.renderButton.map(o => [o.text, o.width, o.theme, o.size, o.shape, o.locale]), [
    ['signin_with', '376', 'outline', 'large', 'pill', 'en'],
    ['signup_with', '280', 'outline', 'large', 'pill', 'en'],
  ])
  // What was in the element before is removed, so a second draw never shows two buttons.
  assert.deepEqual(first.children, ['google-button'])

  // A third button later on the same page: no second script, no second initialize.
  await g.renderGoogleButton(browser.container(), { text: 'signin_with', width: 400, onResponse: () => {} })
  assert.equal(browser.scripts.length, 1)
  assert.equal(browser.calls.initialize.length, 1)

  assert.equal(g.googleButtonWidth(376.9), 376)
  assert.equal(g.googleButtonWidth(1200), 400)
  assert.equal(g.googleButtonWidth(120), 200)
  assert.equal(g.googleButtonWidth(undefined), 200)

  // Offline or blocked: the load fails, and the next try asks for the script again.
  const offline = fakeBrowser({ scriptWorks: attempt => attempt > 1 })
  const g2 = harness({ VITE_GOOGLE_CLIENT_ID: 'client-1.apps.googleusercontent.com' })('src/utils/googleIdentity.js')
  await assert.rejects(g2.renderGoogleButton(offline.container(), { text: 'signin_with', width: 300, onResponse: () => {} }))
  assert.equal(offline.scripts[0].removed, true)
  assert.equal(offline.calls.renderButton.length, 0)
  assert.equal(await g2.renderGoogleButton(offline.container(), { text: 'signin_with', width: 300, onResponse: () => {} }), true)
  assert.equal(offline.scripts.length, 2)
})

test("Google's answer goes to the button that is on the page now", async t => {
  t.after(() => { delete globalThis.window; delete globalThis.document })
  const browser = fakeBrowser()
  const g = harness({ VITE_GOOGLE_CLIENT_ID: 'client-1.apps.googleusercontent.com', VITE_GOOGLE_HOSTED_DOMAIN: 'g.rsu.ac.th' })('src/utils/googleIdentity.js')
  const seen = []
  const loginButton = response => seen.push(['login', response.credential])
  const registerButton = response => seen.push(['register', response.credential])

  await g.renderGoogleButton(browser.container(), { text: 'signin_with', width: 376, onResponse: loginButton })
  const answer = browser.calls.initialize[0].callback
  assert.equal(browser.calls.initialize[0].hd, 'g.rsu.ac.th')
  answer({ credential: 'token-1' })

  // The person goes from the login page to the register page.
  g.releaseGoogleButton(loginButton)
  answer({ credential: 'nobody-listens' })
  await g.renderGoogleButton(browser.container(), { text: 'signup_with', width: 376, onResponse: registerButton })
  answer({ credential: 'token-2' })
  // Releasing an old button does not silence the new one.
  g.releaseGoogleButton(loginButton)
  answer({ credential: 'token-3' })
  assert.deepEqual(seen, [['login', 'token-1'], ['register', 'token-2'], ['register', 'token-3']])

  // A page that was left before the script arrived draws nothing and listens to nothing.
  const late = browser.container()
  assert.equal(await g.renderGoogleButton(late, { text: 'signin_with', width: 376, onResponse: () => seen.push('late') }, () => false), false)
  assert.deepEqual(late.children, ['old'])
  answer({ credential: 'token-4' })
  assert.deepEqual(seen.at(-1), ['register', 'token-4'])
  assert.equal(browser.calls.initialize.length, 1)
})

test('Admin Users: an unconfirmed registration is shown as "Unverified" and that status cannot be saved', () => {
  const load = harness()
  const { accountStatusLabels, accountStatuses } = load('src/types/adminUser.ts')
  const { accountStatusChoices, emptyAdminForm, validateAdminForm } = load('src/utils/addAdminUser.ts')
  const { adminUsersCsv } = load('src/utils/adminUsers.ts')

  assert.equal(accountStatusLabels.PENDING_VERIFICATION, 'Unverified')
  assert.equal(accountStatusLabels.ACTIVE, 'Active')
  // The filter and the add form offer only what a Super Admin can set.
  assert.deepEqual(accountStatuses.map(status => status.value), ['ACTIVE', 'INACTIVE', 'LOCKED', 'SUSPENDED'])
  assert.equal(accountStatusChoices('ACTIVE'), accountStatuses)
  assert.equal(accountStatusChoices(''), accountStatuses)

  // The edit form shows the real status of the account; since spec 46 a registration status is the only choice.
  assert.deepEqual(accountStatusChoices('PENDING_VERIFICATION'), [{ value: 'PENDING_VERIFICATION', label: 'Unverified' }])
  assert.deepEqual(accountStatusChoices('SOMETHING_NEW')[0], { value: 'SOMETHING_NEW', label: 'SOMETHING_NEW' })

  const form = { ...emptyAdminForm, employeeId: 'RSU-001', firstName: 'Wait', lastName: 'Forlink', email: 'wait.forlink@rsu.ac.th', roleId: '2' }
  assert.equal(validateAdminForm({ ...form, accountStatus: 'PENDING_VERIFICATION' }, { requirePassword: false }).accountStatus, 'Select a valid account status.')
  assert.deepEqual(validateAdminForm({ ...form, accountStatus: 'ACTIVE' }, { requirePassword: false }), {})
  // A self-registered account has no employee ID; the edit form asks for one.
  assert.equal(validateAdminForm({ ...form, employeeId: '', accountStatus: 'ACTIVE' }, { requirePassword: false }).employeeId, 'Employee ID is required.')

  // The export writes the row of such an account (employee ID shown as a dash).
  const csv = adminUsersCsv([{ id: 7, name: 'Wait Forlink', employeeId: '—', email: 'wait.forlink@rsu.ac.th', phoneNumber: '', departmentId: null, department: '—', roleId: 2, role: 'Admin', status: 'Unverified', accountStatus: 'PENDING_VERIFICATION', lastLogin: '—', createdAt: '2026-11-16' }])
  assert.match(csv, /"Wait Forlink","—","wait\.forlink@rsu\.ac\.th","—","Admin","Unverified","—","2026-11-16"/)
})
