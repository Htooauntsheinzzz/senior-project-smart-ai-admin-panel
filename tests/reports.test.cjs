const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
function harness(fail) {
  const calls = []
  const values = {
    getStudentSummary: { totalStudents: 10, activeStudents: 7, pendingStudents: 0, inactiveOrSuspendedStudents: 3 },
    getCourseSummary: { totalCourses: 5, activeCourses: 4, inactiveCourses: 1 },
    getSectionSummary: { totalSections: 8, activeSections: 6, closedSections: 2, fullSections: 0 },
    getEnrollmentSummary: { totalEnrollments: 20, activeEnrollments: 15, pendingEnrollments: 2, withdrawnEnrollments: 1, droppedEnrollments: 2 },
  }
  const mocks = Object.fromEntries(Object.entries(values).map(([name, value]) => [name, async signal => { calls.push({ name, signal }); if (name === fail) throw { response: { status: 403, data: { message: 'SQL SECRET' } } }; return value }]))
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync('src/services/reportService.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  new Function('require', 'module', 'exports', code)(() => mocks, module, module.exports)
  return { s: module.exports, calls }
}
test('reports preserve actual zero counts and pass cancellation to all loaders', async () => {
  const { s, calls } = harness()
  const signal = new AbortController().signal
  const sections = await s.getReportSections(signal)
  assert.equal(calls.length, 4); assert.ok(calls.every(c => c.signal === signal))
  assert.equal(sections[0].metrics[2].value, 0)
  assert.equal(sections[2].metrics[3].value, 0)
  assert.ok(sections.every(s => !s.error && Number.isFinite(Date.parse(s.fetchedAt))))
  const csv = s.reportCsv(sections)
  assert.ok(csv.includes('"Students","Pending accounts","0"'))
  assert.equal(csv.split('\r\n').length, 17)
})
test('one forbidden summary does not discard others and incomplete export is rejected', async () => {
  const { s } = harness('getCourseSummary')
  const sections = await s.getReportSections()
  assert.equal(sections.filter(s => !s.error).length, 3)
  assert.match(sections[1].error, /permission/)
  assert.doesNotMatch(sections[1].error, /SQL SECRET/)
  assert.deepEqual(sections[1].metrics, [])
  assert.throws(() => s.reportCsv(sections), /all summaries/)
  assert.throws(() => s.reportCsv([]), /all summaries/)
})
