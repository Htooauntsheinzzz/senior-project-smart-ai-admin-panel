const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

// Academic Terms page: client-side helpers in src/utils/academicTerms.ts and the term detail / status calls of
// src/services/timetableService.ts. Same harness as the other service tests (TypeScript transpiled, apiClient stubbed).
function harness() {
  const calls = [], cache = new Map()
  let handler = async () => ({ data: undefined })
  const api = Object.fromEntries(['get', 'post', 'put', 'patch', 'delete'].map(method => [method, async (...args) => { calls.push({ method, args }); return handler(method, ...args) }]))
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
const term = (id, extra = {}) => ({ id, semesterId: '2', semesterNameEn: 'Semester 1', semesterNameTh: 'ภาคเรียนที่ 1', semesterAcademicYear: 2568, academicYearCode: '2568', academicYearLabel: '2025–2026', startDate: '2026-08-10', endDate: '2026-12-11', status: 'ACTIVE', displayLabel: '1/2568', ...extra })
const terms = [
  term('1'),
  term('2', { semesterId: '3', semesterNameEn: 'Semester 2', semesterNameTh: 'ภาคเรียนที่ 2', startDate: '2027-01-11', endDate: '2027-05-14', status: 'PLANNED' }),
  term('3', { academicYearCode: '2567', academicYearLabel: '2024–2025', startDate: '2025-08-11', endDate: '2025-12-12', status: 'CLOSED' }),
]

test('terms are searched and filtered on the client and counted by status', () => {
  const u = harness().load('src/utils/academicTerms.ts')
  const ids = filters => u.filterTerms(terms, { query: '', semesterId: '', status: '', ...filters }).map(t => t.id)
  assert.deepEqual(ids({}), ['1', '2', '3'])
  assert.deepEqual(ids({ query: '  2024 ' }), ['3'])
  assert.deepEqual(ids({ query: 'SEMESTER 2' }), ['2'])
  assert.deepEqual(ids({ query: 'ภาคเรียน', semesterId: '2', status: 'ACTIVE' }), ['1'])
  assert.deepEqual(ids({ status: 'CLOSED' }), ['3'])
  assert.deepEqual(ids({ semesterId: '9' }), [])
  assert.deepEqual(u.termSummary(terms), { total: 3, active: 1, planned: 1, closed: 1 })
  assert.deepEqual(u.termSemesterOptions(terms), [{ value: '2', label: 'Semester 1' }, { value: '3', label: 'Semester 2' }])
})

test('pagination clamps the page and durations, titles and status actions read correctly', () => {
  const u = harness().load('src/utils/academicTerms.ts')
  const rows = Array.from({ length: 23 }, (_, index) => index)
  assert.deepEqual(u.paginate(rows, 3, 10), { page: 3, pageCount: 3, rows: [20, 21, 22] })
  assert.equal(u.paginate(rows, 9, 10).page, 3)
  assert.equal(u.paginate(rows, 0, 10).page, 1)
  assert.deepEqual(u.paginate([], 1, 10), { page: 1, pageCount: 1, rows: [] })
  assert.equal(u.termDays('2026-08-10', '2026-12-11'), 124)
  assert.equal(u.termDuration('2026-08-10', '2026-12-11'), '18 weeks')
  assert.equal(u.termDuration('2026-08-10', '2026-08-14'), '5 days')
  assert.equal(u.termDuration('2026-08-10', '2026-08-10'), '1 day')
  assert.equal(u.termDuration('2026-08-10', '2026-08-01'), '—')
  assert.equal(u.termTitle(term('1')), 'Semester 1 · 2025–2026')
  assert.deepEqual(u.termDraftOf(term('1')), { semesterId: '2', academicYearCode: '2568', academicYearLabel: '2025–2026', startDate: '2026-08-10', endDate: '2026-12-11', status: 'ACTIVE' })
  assert.deepEqual(u.statusActions('PLANNED'), [{ status: 'ACTIVE', label: 'Mark active' }])
  assert.deepEqual(u.statusActions('ACTIVE'), [{ status: 'CLOSED', label: 'Close term' }])
  assert.deepEqual(u.statusActions('CLOSED'), [{ status: 'ACTIVE', label: 'Reopen as active' }])
  assert.deepEqual(u.termStatusOptions.map(option => option.value), ['PLANNED', 'ACTIVE', 'CLOSED'])
})

test('term errors map to the form fields with academic-term wording', () => {
  const u = harness().load('src/utils/academicTerms.ts')
  const failure = (status, code) => ({ isAxiosError: true, response: { status, data: { code } } })
  assert.deepEqual(u.academicTermError(failure(409, 'ACADEMIC_TERM_ALREADY_EXISTS'), 'write').fields, { academicYearCode: 'This semester already has a term with that academic year code.' })
  assert.equal(u.academicTermError(failure(400, 'TIMETABLE_INVALID_DATE_RANGE'), 'write').fields.endDate, 'The end date must not be before the start date.')
  assert.equal(u.academicTermError(failure(404, 'SEMESTER_NOT_FOUND'), 'write').fields.semesterId, 'The selected semester does not exist or was deleted.')
  assert.equal(u.academicTermError(failure(403, 'FORBIDDEN')).message, 'You do not have permission to manage academic terms.')
  assert.equal(u.academicTermError(failure(403, 'PASSWORD_CHANGE_REQUIRED')).message, 'Change your password before managing the timetable.')
  assert.match(u.academicTermError(failure(404, 'ACADEMIC_TERM_NOT_FOUND')).message, /no longer exists/)
  assert.equal(u.academicTermError(failure(409, 'ACADEMIC_TERM_IN_USE'), 'write').message, 'Course sections still reference this academic term, so it cannot be deleted.')
  assert.deepEqual(u.academicTermError(failure(500)).fields, {})
})

test('term detail and status change use the backend paths and bodies', async () => {
  const h = harness(), s = h.load('src/services/timetableService.ts'), signal = new AbortController().signal
  h.respond(async () => ({ data: { ...term('4'), id: 4, semesterId: 2, status: 'CLOSED' } }))
  const detail = await s.getAcademicTermById('4', signal)
  assert.equal(h.calls[0].method, 'get'); assert.equal(h.calls[0].args[0], '/academic-terms/4'); assert.equal(h.calls[0].args[1].signal, signal)
  assert.equal(detail.id, '4'); assert.equal(detail.semesterId, '2'); assert.equal(detail.status, 'CLOSED')
  await s.setAcademicTermStatus('4', 'ACTIVE')
  assert.equal(h.calls[1].method, 'patch'); assert.equal(h.calls[1].args[0], '/academic-terms/4/status'); assert.deepEqual(h.calls[1].args[1], { status: 'ACTIVE' })
  await assert.rejects(s.setAcademicTermStatus('x', 'ACTIVE'), /Invalid academic term ID/)
  await assert.rejects(s.setAcademicTermStatus('4', 'DONE'), /valid term status/)
  await assert.rejects(s.getAcademicTermById('0'), /Invalid academic term ID/)
  assert.equal(h.calls.length, 2)
})
