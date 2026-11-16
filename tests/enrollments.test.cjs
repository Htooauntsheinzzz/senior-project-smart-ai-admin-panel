const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function harness() {
  const calls = []
  let handler = async () => ({ status: 204 })
  const api = Object.fromEntries(['get', 'post', 'put', 'patch', 'delete'].map(method => [method, async (...args) => { calls.push({ method, args }); return handler(method, ...args) }]))
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync('src/services/enrollmentService.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  new Function('require', 'module', 'exports', code)(() => ({ __esModule: true, default: api }), module, module.exports)
  return { s: module.exports, calls, respond: fn => { handler = fn } }
}
const row = { id: 1, studentId: 2, studentCode: 'S002', studentName: 'Student Name', courseId: 3, courseCode: 'CS101', courseName: 'Course', courseSectionId: 4, sectionNumber: '01', semesterId: 5, semesterNameEn: 'Semester 1', semesterNameTh: 'ภาคเรียน 1', enrollmentDate: '2026-10-23', status: 'PENDING' }
const detail = { ...row, studentFirstName: 'Student', studentLastName: 'Name', universityEmail: 'student@example.test', lectureId: 6, lectureNameEn: 'Lecturer', lectureNameTh: 'อาจารย์', capacity: 30, enrolledCount: 0, isFull: false }
const draft = { studentId: '2', courseSectionId: '4', enrollmentDate: '', status: 'PENDING' }

test('enrollment create/update/status/delete use exact contracts and accept 204 deletion', async () => {
  const { s, calls } = harness()
  await s.saveEnrollment({ ...draft, semesterId: '999', capacity: '500', createdBy: '9' })
  await s.saveEnrollment({ ...draft, enrollmentDate: '2026-10-23' }, '1')
  await s.setEnrollmentStatus('1', 'ACTIVE')
  await s.deleteEnrollment('1')
  assert.deepEqual(calls.map(c => [c.method, c.args[0]]), [['post', '/enrollments'], ['put', '/enrollments/1'], ['patch', '/enrollments/1/status'], ['delete', '/enrollments/1']])
  assert.deepEqual(calls[0].args[1], { studentId: 2, courseSectionId: 4, enrollmentDate: null, status: 'PENDING' })
  assert.deepEqual(calls[1].args[1], { studentId: 2, courseSectionId: 4, enrollmentDate: '2026-10-23', status: 'PENDING' })
  assert.deepEqual(calls[2].args[1], { status: 'ACTIVE' })
})
test('unsafe IDs, unsupported status and invalid dates never reach enrollment endpoints', async () => {
  const { s, calls } = harness()
  for (const id of ['0', '../1', '1.5', '9007199254740992']) {
    await assert.rejects(s.getEnrollment(id)); await assert.rejects(s.deleteEnrollment(id)); await assert.rejects(s.saveEnrollment(draft, id)); await assert.rejects(s.setEnrollmentStatus(id, 'ACTIVE'))
  }
  await assert.rejects(s.saveEnrollment({ ...draft, enrollmentDate: '2026-02-30' }))
  await assert.rejects(s.saveEnrollment({ ...draft, status: 'CLOSED' }))
  await assert.rejects(s.getEnrollments({ ...s.emptyEnrollmentQuery, studentId: '-2' }))
  assert.equal(calls.length, 0)
})
test('transition options match pending/active seat rules and terminal states', () => {
  const { s } = harness()
  assert.deepEqual([...s.allowedEnrollmentStatuses('PENDING')], ['PENDING', 'ACTIVE', 'WITHDRAWN', 'DROPPED'])
  assert.deepEqual([...s.allowedEnrollmentStatuses('ACTIVE')], ['ACTIVE', 'WITHDRAWN', 'DROPPED'])
  assert.deepEqual([...s.allowedEnrollmentStatuses('WITHDRAWN')], ['WITHDRAWN'])
  assert.deepEqual([...s.allowedEnrollmentStatuses('DROPPED')], ['DROPPED'])
})
test('list uses only supported filters; details map distinct response and preserve null/false/zero', async () => {
  const h = harness()
  h.respond(async (_, url, options) => ({ data: url.endsWith('/1') ? detail : { content: [row], page: 0, size: options.params.size, totalElements: 1, totalPages: 1 } }))
  const signal = new AbortController().signal
  const page = await h.s.getEnrollments({ ...h.s.emptyEnrollmentQuery, search: ' CS ', courseSectionId: '4', status: 'PENDING', academicYear: '2026' }, 0, 10, signal)
  assert.equal(page.content[0].studentName, 'Student Name')
  assert.deepEqual(h.calls[0].args[1].params, { page: 0, size: 10, sort: 'id,asc', search: 'CS', courseSectionId: 4, status: 'PENDING' })
  assert.equal(h.calls[0].args[1].signal, signal)
  const record = await h.s.getEnrollment('1')
  assert.ok(!('room' in record) && !('schedule' in record)); assert.equal(record.isFull, false); assert.equal(record.enrolledCount, 0)
  assert.equal(record.studentName, 'Student Name')
  h.respond(async () => ({ data: { ...detail, id: 99 } }))
  await assert.rejects(h.s.getEnrollment('1'), /ID/)
})
test('export fetches all pages and rejects changing totals, duplicate IDs and incomplete data', async () => {
  const h = harness()
  const first = Array.from({ length: 100 }, (_, i) => ({ ...row, id: i + 1 }))
  h.respond(async (_, url, options) => ({ data: { content: options.params.page === 0 ? first : [{ ...row, id: 101 }], page: options.params.page, size: 100, totalElements: 101, totalPages: 2 } }))
  assert.equal((await h.s.getEnrollmentExport(h.s.emptyEnrollmentQuery)).length, 101)
  h.respond(async (_, url, options) => ({ data: { content: options.params.page === 0 ? first : [row], page: options.params.page, size: 100, totalElements: 101, totalPages: 2 } }))
  await assert.rejects(h.s.getEnrollmentExport(h.s.emptyEnrollmentQuery), /changed/)
  h.respond(async (_, url, options) => ({ data: { content: options.params.page === 0 ? first : [], page: options.params.page, size: 100, totalElements: options.params.page === 0 ? 101 : 100, totalPages: options.params.page === 0 ? 2 : 1 } }))
  await assert.rejects(h.s.getEnrollmentExport(h.s.emptyEnrollmentQuery), /changed/)
  h.respond(async () => ({ data: { content: [], page: 0, size: 100, totalElements: 1, totalPages: 1 } }))
  await assert.rejects(h.s.getEnrollmentExport(h.s.emptyEnrollmentQuery), /Incomplete/)
})
test('CSV escapes formula-like cells and error copy does not expose raw server messages', () => {
  const { s } = harness()
  const csv = s.enrollmentCsv([{ ...row, studentName: '=SUM(1,2)', courseName: 'A "quoted" course' }])
  assert.ok(csv.includes('"\'=SUM(1,2)"'))
  assert.ok(csv.includes('"A ""quoted"" course"'))
  assert.match(s.enrollmentError({ response: { status: 409, data: { code: 'COURSE_SECTION_FULL', message: 'SQL SECRET' } } }), /Pending and Active/)
  assert.doesNotMatch(s.enrollmentError({ response: { status: 500, data: { message: 'SQL SECRET' } } }), /SQL SECRET/)
})
