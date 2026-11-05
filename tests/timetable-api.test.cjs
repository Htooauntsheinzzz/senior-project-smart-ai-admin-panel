const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
function harness() {
  const calls = []
  let handler
  const api = { get: async (...args) => { calls.push(args); return handler(...args) } }
  function load(file) {
    const module = { exports: {} }
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    new Function('require', 'module', 'exports', code)(name => name.includes('apiClient') ? { __esModule: true, default: api } : load(path.resolve(path.dirname(file), name + '.ts')), module, module.exports)
    return module.exports
  }
  return { s: load('src/services/timetableService.ts'), calls, respond: fn => { handler = fn } }
}
const row = { id: 1, courseId: 2, courseCode: 'CS1', courseName: 'Course', sectionNumber: '01', capacity: 30, enrolledCount: 0, isFull: false, lectureId: 3, lectureNameEn: 'Lecturer', lectureNameTh: 'อาจารย์', room: null, schedule: 'By appointment; วันจันทร์', semesterId: 4, semesterNameEn: 'Semester 1', semesterNameTh: 'ภาคเรียน 1', status: 'ACTIVE' }
test('timetable reads only supported section filters and preserves raw schedule text', async () => {
  const h = harness(), signal = new AbortController().signal
  h.respond(async () => ({ data: { content: [row], page: 0, size: 10, totalElements: 1, totalPages: 1 } }))
  const result = await h.s.getTimetablePage({ search: ' CS ', semesterId: '4', status: 'ACTIVE' }, 0, signal)
  assert.equal(h.calls[0][0], '/course-sections')
  assert.deepEqual(h.calls[0][1].params, { page: 0, size: 10, sort: 'id,asc', search: 'CS', semesterId: 4, status: 'ACTIVE' })
  assert.equal(h.calls[0][1].signal, signal)
  assert.equal(result.rows[0].schedule, row.schedule); assert.equal(result.rows[0].room, null)
  h.respond(async () => ({ data: { content: [{ ...row, schedule: null }], page: 0, size: 10, totalElements: 1, totalPages: 1 } }))
  assert.equal((await h.s.getTimetablePage(h.s.emptyTimetableQuery)).rows[0].schedule, null)
})
test('timetable rejects unsupported filters and incomplete/duplicate pages', async () => {
  const h = harness()
  await assert.rejects(h.s.getTimetablePage({ ...h.s.emptyTimetableQuery, semesterId: '9007199254740992' }))
  await assert.rejects(h.s.getTimetablePage({ ...h.s.emptyTimetableQuery, status: 'FULL' }))
  assert.equal(h.calls.length, 0)
  h.respond(async () => ({ data: { content: [row, row], page: 0, size: 10, totalElements: 2, totalPages: 1 } }))
  await assert.rejects(h.s.getTimetablePage(h.s.emptyTimetableQuery), /Incomplete/)
  h.respond(async () => ({ data: { content: [], page: 0, size: 10, totalElements: 1, totalPages: 1 } }))
  await assert.rejects(h.s.getTimetablePage(h.s.emptyTimetableQuery), /Incomplete/)
})
