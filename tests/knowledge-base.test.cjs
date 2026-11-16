const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

// AI Knowledge Base: src/utils/knowledgeBase.ts helpers and src/services/knowledgeService.ts requests/mapping.
// Same harness as the other service tests (TypeScript transpiled, apiClient stubbed).
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

const apiDocument = (extra = {}) => ({
  id: 7, title: 'TST Student Handbook', description: null,
  category: { id: 3, code: 'STUDENT_HANDBOOK', name: 'Student Handbook', isActive: true },
  academicYearLabel: '2025-2026',
  scope: { type: 'PROGRAM', curriculumVersionId: null, curriculumVersionCode: null, programId: 12, programName: 'Computer Science', departmentId: 4, departmentName: 'CS' },
  file: { id: 70, originalFilename: 'handbook.pdf', extension: 'pdf', mimeType: 'application/pdf', sizeBytes: 2048, revisionNumber: 1 },
  uploadedBy: { id: 1, displayName: 'Admin' }, uploadedAt: '2026-11-10T03:00:00Z', processingStatus: 'EMBEDDING', isActive: true,
  createdBy: 1, createdAt: '2026-11-10T03:00:00Z', updatedBy: 1, updatedAt: '2026-11-10T03:00:00Z', ...extra,
})

test('academic year labels follow the backend rule and display with an en dash', () => {
  const { normalizeAcademicYear, displayYear } = harness().load('src/utils/knowledgeBase')
  assert.equal(normalizeAcademicYear('2025–2026'), '2025-2026')
  assert.equal(normalizeAcademicYear(' 2025 - 2026 '), '2025-2026')
  assert.equal(normalizeAcademicYear('2025-2027'), null)
  assert.equal(normalizeAcademicYear('1999-2000'), null)
  assert.equal(normalizeAcademicYear('2568'), null)
  assert.equal(displayYear('2024-2025'), '2024–2025')
})

test('year filter options start from the academic year after the current one', () => {
  const { academicYearOptions, currentAcademicYear } = harness().load('src/utils/knowledgeBase')
  const july = new Date(2026, 6, 1), march = new Date(2026, 2, 1)
  assert.equal(academicYearOptions(july)[0].value, '2027-2028')
  assert.equal(currentAcademicYear(july), '2026-2027')
  assert.equal(currentAcademicYear(march), '2025-2026')
  assert.equal(academicYearOptions(july)[1].label, '2026–2027')
})

test('validation requires title, category, academic year and an allowed file for uploads', () => {
  const { validateDraft, validateFile } = harness().load('src/utils/knowledgeBase')
  const draft = { title: 'Handbook', categoryId: '3', academicYearLabel: '2025–2026', description: '' }
  assert.deepEqual(validateDraft(draft, { name: 'a.pdf', size: 10 }), {})
  assert.deepEqual(validateDraft(draft, undefined), {}, 'edit has no file')
  assert.ok(validateDraft(draft, null).file)
  assert.ok(validateDraft({ ...draft, title: ' ' }, undefined).title)
  assert.ok(validateDraft({ ...draft, categoryId: '' }, undefined).categoryId)
  assert.ok(validateDraft({ ...draft, academicYearLabel: '2025' }, undefined).academicYearLabel)
  assert.equal(validateFile({ name: 'x.exe', size: 5 }), 'Only PDF, DOCX, TXT and XLSX files can be uploaded.')
  assert.equal(validateFile({ name: 'x.DOCX', size: 5 }), undefined)
  assert.equal(validateFile({ name: 'x.pdf', size: 0 }), 'The file is empty.')
  assert.equal(validateFile({ name: 'x.pdf', size: 50 * 1024 * 1024 + 1 }), 'The file is larger than 50 MB.')
})

test('list params are 0-based and only carry set filters', () => {
  const { documentListParams, emptyFilters } = harness().load('src/utils/knowledgeBase')
  assert.deepEqual(documentListParams(emptyFilters, 1, 10), { page: 0, size: 10, sort: 'createdAt,desc' })
  assert.deepEqual(documentListParams({ query: ' cat ', categoryId: '3', academicYear: '2025-2026', status: 'FAILED' }, 3, 10),
    { page: 2, size: 10, sort: 'createdAt,desc', search: 'cat', categoryId: '3', academicYear: '2025-2026', status: 'FAILED' })
})

test('category style follows the Figma palette and falls back to a stable colour', () => {
  const { categoryStyle } = harness().load('src/utils/knowledgeBase')
  assert.deepEqual(categoryStyle({ code: 'STUDENT_HANDBOOK', name: 'Student Handbook' }), { color: '#1d4ed8', background: 'rgba(29,78,216,0.09)', emoji: '📘' })
  assert.equal(categoryStyle({ code: 'FIN', name: 'Financial Aid' }).emoji, '💰')
  const other = categoryStyle({ code: 'XYZ', name: 'Misc' })
  assert.equal(other.emoji, '📄')
  assert.deepEqual(categoryStyle({ code: 'XYZ', name: 'Misc' }), other)
  assert.equal(categoryStyle(null).emoji, '📄')
})

test('error messages map backend codes', () => {
  const { knowledgeError, knowledgeErrorField } = harness().load('src/utils/knowledgeBase')
  const err = (status, code) => ({ response: { status, data: { code } } })
  assert.equal(knowledgeError(err(400, 'DOCUMENT_FILE_TYPE_UNSUPPORTED')), 'Only PDF, DOCX, TXT and XLSX files can be uploaded.')
  assert.equal(knowledgeError(err(413)), 'The file is larger than the 50 MB upload limit.')
  assert.equal(knowledgeError(err(403, 'FORBIDDEN')), 'You do not have permission to manage the AI Knowledge Base.')
  assert.match(knowledgeError({}), /could not be reached/)
  assert.equal(knowledgeErrorField(err(400, 'DOCUMENT_FILE_CONTENT_INVALID')), 'file')
  assert.equal(knowledgeErrorField(err(404, 'DOCUMENT_CATEGORY_NOT_FOUND')), 'categoryId')
  assert.equal(knowledgeErrorField(err(409, 'DOCUMENT_NOT_EDITABLE')), undefined)
})

test('document list maps rows and statistics', async () => {
  const h = harness()
  const service = h.load('src/services/knowledgeService')
  h.respond(async (method, url) => url.endsWith('/statistics')
    ? { data: { totalDocuments: 12, readyDocuments: 8, processingDocuments: 3, failedDocuments: 1 } }
    : { data: { content: [apiDocument()], page: 0, size: 10, totalElements: 1, totalPages: 1, first: true, last: true, sort: [] } })
  const page = await service.getKnowledgeDocuments({ query: '', categoryId: '', academicYear: '', status: 'EMBEDDING' }, 1, 10)
  assert.equal(h.calls[0].args[0], '/knowledge/documents')
  assert.deepEqual(h.calls[0].args[1].params, { page: 0, size: 10, sort: 'createdAt,desc', status: 'EMBEDDING' })
  assert.equal(page.totalElements, 1)
  const row = page.rows[0]
  assert.equal(row.id, '7'); assert.equal(row.category.id, '3'); assert.equal(row.uploadedBy, 'Admin')
  assert.equal(row.scope.type, 'PROGRAM'); assert.equal(row.scope.programId, '12'); assert.equal(row.file.extension, 'pdf')
  assert.deepEqual(await service.getKnowledgeStatistics(), { total: 12, ready: 8, processing: 3, failed: 1 })
  assert.throws(() => service.mapDocument(apiDocument({ processingStatus: 'DONE' })), /Unexpected/)
})

test('upload sends only the documented multipart fields with a normalized year', async () => {
  const h = harness()
  const service = h.load('src/services/knowledgeService')
  h.respond(async () => ({ data: { documentId: 9, fileId: 90, title: 'Handbook' } }))
  const file = new File(['%PDF'], 'handbook.pdf', { type: 'application/pdf' })
  const saved = await service.uploadKnowledgeDocument({ title: ' Handbook ', categoryId: '3', academicYearLabel: '2025–2026', description: '' }, file)
  assert.deepEqual(saved, { id: '9', title: 'Handbook' })
  const [url, form, config] = h.calls[0].args
  assert.equal(url, '/knowledge/documents/upload')
  assert.deepEqual([...form.keys()], ['title', 'categoryId', 'academicYearLabel', 'file'])
  assert.equal(form.get('title'), 'Handbook'); assert.equal(form.get('academicYearLabel'), '2025-2026')
  assert.equal(form.get('file').name, 'handbook.pdf')
  assert.equal(config.headers['Content-Type'], 'multipart/form-data')
})

test('edit keeps the stored scope and other actions call the right endpoints', async () => {
  const h = harness()
  const service = h.load('src/services/knowledgeService')
  h.respond(async () => ({ data: apiDocument() }))
  const document = service.mapDocument(apiDocument())
  await service.updateKnowledgeDocument(document, { title: 'New', categoryId: '3', academicYearLabel: '2025–2026', description: ' ' })
  assert.deepEqual(h.calls[0].args, ['/knowledge/documents/7', { title: 'New', categoryId: 3, academicYearLabel: '2025-2026', description: null, curriculumVersionId: null, programId: 12, departmentId: null }])
  await service.setKnowledgeDocumentActive('7', false)
  await service.reprocessKnowledgeDocument('7', 'RESUME')
  await service.reprocessKnowledgeDocument('7', 'FULL')
  await service.deleteKnowledgeDocument('7')
  assert.deepEqual(h.calls.slice(1).map(call => [call.method, call.args[0], call.args[1]]), [
    ['patch', '/knowledge/documents/7/archive', undefined],
    ['post', '/knowledge/documents/7/reprocess', undefined],
    ['post', '/knowledge/documents/7/reprocess', { mode: 'FULL' }],
    ['delete', '/knowledge/documents/7', undefined],
  ])
  assert.throws(() => service.knowledgePath('../1'), /Invalid document ID/)
})

test('categories load all pages and new categories get an upper-case code', async () => {
  const h = harness()
  const service = h.load('src/services/knowledgeService')
  h.respond(async (method, url, body) => method === 'post'
    ? { data: { id: 5, categoryCode: body.categoryCode, categoryName: body.categoryName, isActive: true } }
    : { data: { content: [{ id: 1, categoryCode: 'A', categoryName: 'Alpha', isActive: true }], last: true } })
  assert.deepEqual(await service.getKnowledgeCategories(), [{ id: '1', code: 'A', name: 'Alpha', isActive: true }])
  assert.equal(service.categoryCodeFromName('Scholarship & Financial Aid'), 'SCHOLARSHIP_FINANCIAL_AID')
  const created = await service.createKnowledgeCategory('Campus Safety')
  assert.deepEqual(h.calls[1].args, ['/knowledge/categories', { categoryCode: 'CAMPUS_SAFETY', categoryName: 'Campus Safety' }])
  assert.equal(created.id, '5')
})
