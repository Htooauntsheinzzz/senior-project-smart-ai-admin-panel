const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
function harness() {
  const calls = []
  let handler = async () => ({ status: 204 })
  const api = Object.fromEntries(['get', 'post', 'put', 'delete'].map(method => [method, async (...args) => { calls.push({ method, args }); return handler(...args) }]))
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync('src/services/studentService.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  new Function('require', 'module', 'exports', code)(() => ({ __esModule: true, default: api }), module, module.exports)
  return { s: module.exports, calls, respond: fn => { handler = fn } }
}
const draft = { studentCode: ' S1 ', universityEmail: ' A@RSU.AC.TH ', firstName: ' First ', lastName: 'Last', facultyId: '1', departmentId: '2', programId: '3', semesterId: '', academicYear: '2026', enrollmentYear: '', accountStatus: 'ACTIVE', temporaryPassword: 'long-password-12345', confirmPassword: 'long-password-12345', forcePasswordChange: 'false' }
const row = { id: 1, studentCode: 'S1', universityEmail: 'a@rsu.ac.th', firstName: 'First', lastName: 'Last', facultyId: 1, facultyNameEn: 'Faculty', departmentId: 2, departmentName: 'Department', programId: 3, programName: 'Program', semesterId: null, semesterNameEn: null, academicYear: 2026, enrollmentYear: null, accountStatus: 'ACTIVE' }
test('student writes use exact DTO fields and preserve nulls and false; update excludes credentials', async () => {
  const { s, calls } = harness()
  await s.saveStudent({ ...draft, id: '99', createdBy: '88' })
  await s.saveStudent(draft, '1')
  assert.equal(calls[0].args[0], '/students')
  const payload = calls[0].args[1]
  assert.equal(payload.facultyId, 1); assert.equal(payload.academicYear, 2026)
  assert.equal(payload.semesterId, null); assert.equal(payload.enrollmentYear, null)
  assert.equal(payload.forcePasswordChange, false); assert.equal(payload.universityEmail, 'a@rsu.ac.th')
  assert.equal(payload.createdBy, undefined); assert.equal(payload.id, undefined)
  assert.equal(calls[1].method, 'put'); assert.equal(calls[1].args[0], '/students/1')
  for (const key of ['temporaryPassword', 'confirmPassword', 'forcePasswordChange']) assert.equal(calls[1].args[1][key], undefined)
})
test('invalid IDs, pending creation, dates and password byte limits never write', async () => {
  const { s, calls } = harness()
  for (const id of ['0', '../1', '9007199254740992']) await assert.rejects(s.deleteStudent(id))
  await assert.rejects(s.saveStudent({ ...draft, accountStatus: 'PENDING' }))
  await assert.rejects(s.saveStudent({ ...draft, dateOfBirth: '2001-02-30' }))
  await assert.rejects(s.resetStudentPassword('1', { temporaryPassword: 'ก'.repeat(25), confirmPassword: 'ก'.repeat(25) }))
  assert.equal(calls.length, 0)
  await s.deleteStudent('1'); await s.resetStudentPassword('1', draft)
  assert.equal(calls[1].args[0], '/students/1/reset-password')
  assert.deepEqual(Object.keys(calls[1].args[1]).sort(), ['confirmPassword', 'temporaryPassword'])
})
test('student paging preserves filters; export rejects duplicate, incomplete and changing pages', async () => {
  const h = harness()
  h.respond(async (_, config) => ({ data: { content: [row], page: config.params.page, size: config.params.size, totalElements: 1, totalPages: 1 } }))
  const result = await h.s.getStudents({ search: 'First', status: 'ACTIVE', programId: '3', semesterId: '' })
  assert.equal(result.content[0].id, 1)
  assert.equal(h.calls[0].args[1].params.programId, '3'); assert.equal(h.calls[0].args[1].params.semesterId, undefined)
  assert.equal((await h.s.exportStudentRows({})).length, 1)
  h.respond(async (_, config) => ({ data: { content: [row, row], page: 0, size: config.params.size, totalElements: 2, totalPages: 1 } }))
  await assert.rejects(h.s.exportStudentRows({}), /Incomplete/)
  h.respond(async (_, config) => ({ data: { content: [], page: 0, size: config.params.size, totalElements: 2, totalPages: 1 } }))
  await assert.rejects(h.s.exportStudentRows({}), /Incomplete/)
})
test('student feedback does not expose raw server exceptions or rejected passwords', () => {
  const { s } = harness()
  assert.match(s.studentError({ response: { status: 409, data: { code: 'STUDENT_EMAIL_ALREADY_EXISTS', message: 'secret' } } }), /email is already/)
  assert.doesNotMatch(s.studentError({ response: { status: 500, data: { message: 'secret' } } }), /secret/)
})
