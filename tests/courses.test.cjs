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

const draft = { code: ' CSC404 ', name: ' Web Development ', credits: '3', description: 'testing', facultyId: '2', departmentId: '2', programId: '8', year: '4', term: '5', prerequisites: 'CSC201', type: 'Required', maxStudents: '45', status: 'inactive' }
const row = { id: 7, courseCode: 'CSC404', courseName: 'Web Development', creditHours: 3, description: 'testing', facultyId: 2, facultyCode: 'FAC-ENG', facultyNameEn: 'Faculty of Engineering', departmentId: 2, departmentCode: 'DIT', departmentName: 'Digital Innovation Technology', programId: 8, programCode: 'PRG-CSC', programName: 'Computer Science', semesterId: 5, semesterNameTh: 'ภาคเรียนที่ 1/2568', semesterNameEn: 'Semester 1/2568', recommendedAcademicYear: 4, prerequisiteCourses: 'CSC201', courseType: 300, courseTypeName: 'Major Required', maximumStudentsPerSection: 45, sectionCount: 2, isActive: false }

const filters = { query: ' web ', facultyId: '2', departmentId: '2', programId: '8', year: '4', term: '5', status: 'inactive' }

test('payload maps UI fields to API fields and preserves false', () => {
  const h = harness(), s = h.load('src/services/courseService.ts'), u = h.load('src/utils/courseApi.ts')
  assert.deepEqual(s.coursePayload(draft), { courseCode: 'CSC404', courseName: 'Web Development', creditHours: 3, description: 'testing', facultyId: 2, departmentId: 2, programId: 8, semesterId: 5, recommendedAcademicYear: 4, prerequisiteCourses: 'CSC201', courseType: 300, maximumStudentsPerSection: 45, isActive: false })
  assert.deepEqual(u.validateCourseForm(draft), {})
  assert.equal(s.courseTypeFromUi('Required'), 300)
  assert.equal(s.courseTypeFromUi('Elective'), 200)
  assert.equal(s.courseTypeToUi(300), 'Required')
  assert.equal(s.courseTypeToUi(200), 'Elective')
  for (const facultyId of ['', '0', '-2', '1.5']) { assert.ok(u.validateCourseForm({ ...draft, facultyId }).facultyId); assert.throws(() => s.coursePayload({ ...draft, facultyId })) }
  for (const departmentId of ['', '0', '-2']) { assert.ok(u.validateCourseForm({ ...draft, departmentId }).departmentId); assert.throws(() => s.coursePayload({ ...draft, departmentId })) }
  assert.ok(u.validateCourseForm({ ...draft, code: '' }).code)
  assert.ok(u.validateCourseForm({ ...draft, name: '' }).name)
  assert.ok(u.validateCourseForm({ ...draft, credits: '-1' }).credits)
  assert.ok(u.validateCourseForm({ ...draft, type: 'Unknown' }).type)
  assert.equal(s.mapCourse(row).courseTypeName, 'Major Required')
  assert.equal(s.mapCourse(row).status, 'inactive')
  assert.throws(() => s.mapCourse({ ...row, isActive: 'false' }))
})

test('optional fields omitted when blank', () => {
  const h = harness(), s = h.load('src/services/courseService.ts')
  const empty = { ...draft, programId: '', year: '', term: '', prerequisites: '', maxStudents: '', description: '' }
  const payload = s.coursePayload(empty)
  assert.equal(payload.programId, undefined)
  assert.equal(payload.semesterId, undefined)
  assert.equal(payload.recommendedAcademicYear, undefined)
  assert.equal(payload.prerequisiteCourses, undefined)
  assert.equal(payload.maximumStudentsPerSection, undefined)
  assert.equal(payload.description, undefined)
})

test('directory uses supported filters, all pages and rejects incomplete data', async () => {
  const h = harness(), s = h.load('src/services/courseService.ts')
  h.respond(async (method, url, options) => ({ data: { content: [{ ...row, id: 7 + options.params.page }], page: options.params.page, size: 100, totalElements: 2, totalPages: 2 } }))
  assert.equal((await s.getCourseDirectory(filters)).length, 2)
  assert.equal(h.calls[0].args[1].params.page, 0)
  assert.equal(h.calls[0].args[1].params.search, 'web')
  assert.equal(h.calls[0].args[1].params.facultyId, 2)
  assert.equal(h.calls[0].args[1].params.departmentId, 2)
  assert.equal(h.calls[0].args[1].params.programId, 8)
  assert.equal(h.calls[0].args[1].params.semesterId, 5)
  assert.equal(h.calls[0].args[1].params.recommendedAcademicYear, 4)
  assert.equal(h.calls[0].args[1].params.status, 'INACTIVE')
})

test('CRUD and summary paths are correct and bad IDs never reach API', async () => {
  const h = harness(), s = h.load('src/services/courseService.ts')
  h.respond(async method => ({ data: method === 'get' ? row : undefined }))
  await s.createCourse(draft); await s.getCourseById('7'); await s.updateCourse('7', draft); await s.deleteCourse('7')
  assert.deepEqual(h.calls.map(c => [c.method, c.args[0]]), [['post', '/courses'], ['get', '/courses/7'], ['put', '/courses/7'], ['delete', '/courses/7']])
  for (const id of ['', '0', 'x', '2/path']) { await assert.rejects(s.getCourseById(id)); await assert.rejects(s.deleteCourse(id)); await assert.rejects(s.updateCourse(id, draft)) }
  assert.equal(h.calls.length, 4)
  h.respond(async () => ({ data: { totalCourses: 18, activeCourses: 17, inactiveCourses: 1, currentSemesterCourses: 12 } }))
  assert.equal((await s.getCourseSummary()).currentSemesterCourses, 12)
})

test('course badge style maps known types and falls back', () => {
  const { load } = harness(), { courseBadgeStyle: style } = load('src/utils/courseApi.ts')
  assert.equal(style(300).background, '#dbeafe')
  assert.equal(style(200).background, '#f3f4f6')
  assert.equal(style(100).background, '#f3f4f6')
})

test('course error codes map to correct fields and messages', () => {
  const { load } = harness(), { courseError: error } = load('src/utils/courseApi.ts')
  const response = (status, code) => ({ response: { status, data: { code, message: 'SQL internals' } } })
  assert.ok(error(response(404, 'COURSE_NOT_FOUND')).message.includes('not found'))
  assert.ok(error(response(404, 'FACULTY_NOT_FOUND')).message.includes('faculty'))
  assert.ok(error(response(409, 'COURSE_CODE_ALREADY_EXISTS')).fields.code)
  assert.ok(error(response(400, 'INVALID_COURSE_RELATIONSHIP')).fields.facultyId)
  assert.ok(error(response(400, 'INVALID_PREREQUISITE_COURSE')).fields.prerequisites)
  assert.ok(error(response(400, 'INVALID_COURSE_TYPE')).fields.type)
  assert.ok(!error(response(500, 'UNKNOWN')).message.includes('SQL'))
})
