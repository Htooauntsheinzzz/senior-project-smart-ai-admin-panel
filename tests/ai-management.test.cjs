const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

// AI Assistant, Test AI Knowledge, Chat History and AI Feedback (admin panel specs 41 to 44): src/utils/aiAssistant.ts
// helpers and src/services/aiAssistantService.ts requests/mapping. Same harness as the other service tests
// (TypeScript transpiled, apiClient stubbed).
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

const CONVERSATION = '0f8fad5b-d9cb-469f-a165-70867728950e'
const student = { id: 4, studentCode: 'TST-650001', fullName: 'TST Alice Anders' }
const passage = (extra = {}) => ({ rank: 1, score: 0.834, documentId: 7, title: 'TST Student Handbook', category: 'Regulations', academicYear: '2026-2027', sectionTitle: 'Fees', unitType: 'PAGE', pageStart: 12, pageEnd: 14, content: 'The late registration fee is 500 baht.', ...extra })
const apiAnswer = (extra = {}) => ({ message: 'The late registration fee is 500 baht.', requestId: 'b7c1e0c2-0000-4000-8000-000000000001', model: 'gemini-test', createdAt: '2026-11-13T03:00:00Z', grounded: true, retrievalMs: 180, generationMs: 2140, passages: [passage(), passage({ rank: 2, score: 0.7 }), passage({ rank: 3, documentId: 9, title: 'TST Fee Announcement', unitType: null, pageStart: 0, pageEnd: 0 })], ...extra })
const apiFeedback = (extra = {}) => ({ id: 31, rating: 'NEGATIVE', comment: 'The handbook says 1,000 baht', reviewStatus: 'PENDING', reviewNote: null, reviewedBy: null, reviewedAt: null, submittedAt: '2026-11-13T04:00:00Z', student, conversationId: CONVERSATION, conversationTitle: 'Late fee', messageId: 52, question: 'What is the late registration fee?', answer: 'The late fee is 500 baht.', model: 'gemini-test', sources: [{ title: 'TST Student Handbook', academicYear: '2026-2027', category: 'Regulations' }], ...extra })
const pageOf = content => ({ content, page: 0, size: 10, totalElements: content.length, totalPages: 1, first: true, last: true })

test('date filters send whole local days and reject a reversed range', () => {
  const { dateRangeError, dateRangeParams, localDayStart } = harness().load('src/utils/aiAssistant')
  assert.equal(dateRangeError('', ''), '')
  assert.equal(dateRangeError('2026-11-10', '2026-11-10'), '')
  assert.equal(dateRangeError('2026-11-11', '2026-11-10'), 'From date must not be after To date.')
  assert.equal(dateRangeError('2026-02-31', ''), 'Enter a valid date.')
  assert.equal(localDayStart('13/11/2026'), null)
  // "to" is exclusive on the server, so the start of the next local day includes the whole To day.
  assert.deepEqual(dateRangeParams('2026-11-10', '2026-11-13'), { from: new Date(2026, 10, 10).toISOString(), to: new Date(2026, 10, 14).toISOString() })
  assert.deepEqual(dateRangeParams('', '2026-12-31'), { to: new Date(2027, 0, 1).toISOString() })
  assert.deepEqual(dateRangeParams('2026-11-11', '2026-11-10'), {})
})

test('list params are 0-based, trim the search and only carry set filters', () => {
  const { historyParams, feedbackParams, emptyHistoryFilters, emptyFeedbackFilters } = harness().load('src/utils/aiAssistant')
  assert.deepEqual(historyParams(emptyHistoryFilters, 1, 10), { page: 0, size: 10 })
  assert.deepEqual(historyParams({ query: '  late fee ', from: '', to: '' }, 3, 10), { page: 2, size: 10, search: 'late fee' })
  assert.equal(historyParams({ query: 'x'.repeat(150), from: '', to: '' }, 1, 10).search.length, 100)
  // The export has no paging.
  assert.deepEqual(historyParams({ query: 'tst', from: '', to: '' }), { search: 'tst' })
  assert.deepEqual(feedbackParams(emptyFeedbackFilters, 1, 10), { page: 0, size: 10 })
  assert.deepEqual(feedbackParams({ query: '', rating: 'NEGATIVE', reviewStatus: 'PENDING', from: '2026-11-13', to: '' }, 2, 10),
    { page: 1, size: 10, from: new Date(2026, 10, 13).toISOString(), rating: 'NEGATIVE', reviewStatus: 'PENDING' })
})

test('chat history keeps the newest 20 turns, starts with a user turn and cuts long turns', () => {
  const { historyTurns } = harness().load('src/utils/aiAssistant')
  assert.deepEqual(historyTurns([]), [])
  const turns = Array.from({ length: 23 }, (_, index) => ({ role: index % 2 ? 'ASSISTANT' : 'USER', content: `turn ${index}`, key: index }))
  const sent = historyTurns(turns)
  assert.equal(sent.length, 19)
  assert.deepEqual(sent[0], { role: 'USER', content: 'turn 4' })
  assert.deepEqual(sent.at(-1), { role: 'USER', content: 'turn 22' })
  assert.equal(historyTurns([{ role: 'USER', content: 'x'.repeat(9000) }, { role: 'ASSISTANT', content: '  ' }]).length, 1)
  assert.equal(historyTurns([{ role: 'USER', content: 'x'.repeat(9000) }])[0].content.length, 8000)
})

test('passage helpers: one chip per document, location, score, duration and labels', () => {
  const { sourceDocuments, passageLocation, scorePercent, formatDuration, countLabel, exportFileName, reviewStatusLabels } = harness().load('src/utils/aiAssistant')
  const passages = [{ documentId: '7', title: 'A' }, { documentId: '7', title: 'A' }, { documentId: '9', title: 'B' }]
  assert.deepEqual(sourceDocuments(passages).map(p => p.title), ['A', 'B'])
  assert.equal(passageLocation({ unitType: 'PAGE', pageStart: 12, pageEnd: 14 }), 'Pages 12–14')
  assert.equal(passageLocation({ unitType: 'SHEET', pageStart: 2, pageEnd: 2 }), 'Sheet 2')
  assert.equal(passageLocation({ unitType: null, pageStart: 3, pageEnd: 0 }), 'Page 3')
  assert.equal(passageLocation({ unitType: 'PAGE', pageStart: 0, pageEnd: 0 }), '')
  assert.equal(scorePercent(0.834), '83%'); assert.equal(scorePercent(1.4), '100%'); assert.equal(scorePercent(-1), '0%')
  assert.equal(formatDuration(180), '180 ms'); assert.equal(formatDuration(2140), '2.1 s')
  assert.equal(countLabel(1, 'conversation'), '1 conversation'); assert.equal(countLabel(0, 'conversation'), '0 conversations')
  assert.equal(exportFileName('ai-feedback', new Date(2026, 10, 3)), 'ai-feedback-2026-11-03.csv')
  assert.equal(reviewStatusLabels.PENDING, 'Awaiting Review')
})

test('error messages map backend codes and never show a server message', () => {
  const { assistantError } = harness().load('src/utils/aiAssistant')
  const err = (status, code, message) => ({ response: { status, data: { code, message } } })
  assert.match(assistantError(err(503, 'AI_ASSISTANT_UNAVAILABLE')), /AI model is not available/)
  assert.match(assistantError(err(503, 'KNOWLEDGE_SEARCH_NOT_CONFIGURED')), /embedding model/)
  assert.match(assistantError(err(404, 'CONVERSATION_NOT_FOUND')), /no longer exists/)
  assert.equal(assistantError(err(403, 'FORBIDDEN')), 'You do not have permission to use AI Management.')
  assert.equal(assistantError(err(400, 'SOMETHING_NEW')), 'The request is invalid. Check the entered values.')
  assert.equal(assistantError(err(500, 'INTERNAL_ERROR', 'stack trace'), 'Fallback.'), 'Fallback.')
  assert.match(assistantError({}), /could not be reached/)
})

test('chat sends the trimmed message with the earlier turns and maps the answer', async () => {
  const h = harness()
  const service = h.load('src/services/aiAssistantService')
  h.respond(async () => ({ data: apiAnswer() }))
  const answer = await service.sendAssistantMessage('  And the deadline?  ', [{ role: 'USER', content: 'Fee?', key: 1 }, { role: 'ASSISTANT', content: '500 baht.', answer: {} }])
  assert.equal(h.calls[0].method, 'post')
  assert.deepEqual(h.calls[0].args.slice(0, 2), ['/assistant/chat', { message: 'And the deadline?', history: [{ role: 'USER', content: 'Fee?' }, { role: 'ASSISTANT', content: '500 baht.' }] }])
  assert.equal(answer.message, 'The late registration fee is 500 baht.')
  assert.equal(answer.grounded, true); assert.equal(answer.model, 'gemini-test')
  assert.equal(answer.passages.length, 3); assert.equal(answer.passages[0].documentId, '7'); assert.equal(answer.passages[2].unitType, null)
  // The first message of a chat has no history field (the server rejects nothing, but null is not sent either).
  await service.sendAssistantMessage('Hello', [])
  assert.deepEqual(h.calls[1].args[1], { message: 'Hello' })
  h.respond(async () => ({ data: { message: 5 } }))
  await assert.rejects(service.sendAssistantMessage('Hello', []), /Unexpected AI assistant response/)
})

test('knowledge test sends only the question and maps an answer without passages', async () => {
  const h = harness()
  const service = h.load('src/services/aiAssistantService')
  h.respond(async () => ({ data: apiAnswer({ message: 'No passage matched.', model: null, grounded: false, generationMs: 0, passages: [] }) }))
  const answer = await service.runKnowledgeTest(' How many credits? ')
  assert.deepEqual(h.calls[0].args.slice(0, 2), ['/assistant/knowledge-test', { question: 'How many credits?' }])
  assert.equal(answer.model, null); assert.equal(answer.grounded, false); assert.deepEqual(answer.passages, [])
})

test('conversation list, transcript and export call the history endpoints', async () => {
  const h = harness()
  const service = h.load('src/services/aiAssistantService')
  const summary = { conversationId: CONVERSATION, title: 'Late fee', lastMessagePreview: 'The late fee is 500 baht.', messageCount: 2, createdAt: '2026-11-13T03:00:00Z', updatedAt: '2026-11-13T03:01:00Z', student }
  h.respond(async () => ({ data: pageOf([summary]) }))
  const page = await service.getConversations({ query: 'fee', from: '', to: '' }, 2, 10)
  assert.equal(h.calls[0].args[0], '/assistant/conversations')
  assert.deepEqual(h.calls[0].args[1].params, { page: 1, size: 10, search: 'fee' })
  assert.equal(page.totalElements, 1); assert.equal(page.rows[0].student.id, '4'); assert.equal(page.rows[0].student.studentCode, 'TST-650001')

  h.respond(async () => ({ data: { ...summary, hasMoreBefore: true, messages: [
    { messageId: 51, role: 'USER', content: 'What is the late registration fee?', createdAt: '2026-11-13T03:00:00Z', model: null, sources: [], feedback: null },
    { messageId: 52, role: 'ASSISTANT', content: 'The late fee is 500 baht.', createdAt: '2026-11-13T03:01:00Z', model: 'gemini-test', sources: [{ title: 'TST Student Handbook', academicYear: '2026-2027', category: 'Regulations' }], feedback: { id: 31, rating: 'NEGATIVE', comment: null, reviewStatus: 'PENDING' } },
  ] } }))
  const detail = await service.getConversation(CONVERSATION.toUpperCase())
  assert.equal(h.calls[1].args[0], `/assistant/conversations/${CONVERSATION}`)
  assert.deepEqual(h.calls[1].args[1].params, { limit: 50 })
  assert.equal(detail.hasMoreBefore, true); assert.equal(detail.messages[1].feedback.rating, 'NEGATIVE'); assert.equal(detail.messages[1].sources[0].title, 'TST Student Handbook')
  await service.getConversation(CONVERSATION, '51')
  assert.deepEqual(h.calls[2].args[1].params, { limit: 50, beforeMessageId: 51 })
  await assert.rejects(service.getConversation('../feedback'), /Invalid conversation ID/)
  assert.equal(service.isConversationId(CONVERSATION), true); assert.equal(service.isConversationId('abc'), false)
  h.respond(async () => ({ data: { ...summary, messages: [{ messageId: 51, role: 'SYSTEM', content: 'x' }] } }))
  await assert.rejects(service.getConversation(CONVERSATION), /Unexpected AI assistant response/)
})

test('feedback list, statistics, detail and review call the feedback endpoints', async () => {
  const h = harness()
  const service = h.load('src/services/aiAssistantService')
  h.respond(async (method, url) => url.endsWith('/statistics')
    ? { data: { totalFeedback: 3, positive: 1, negative: 2, awaitingReview: 3 } }
    : url === '/assistant/feedback' ? { data: pageOf([apiFeedback()]) }
      : { data: apiFeedback({ reviewStatus: 'REVIEWED', reviewNote: 'Handbook needs an update', reviewedBy: { id: 1, displayName: 'TST Admin' }, reviewedAt: '2026-11-13T05:00:00Z' }) })
  const page = await service.getFeedback({ query: '', rating: 'NEGATIVE', reviewStatus: '', from: '', to: '' }, 1, 10)
  assert.equal(h.calls[0].args[0], '/assistant/feedback')
  assert.deepEqual(h.calls[0].args[1].params, { page: 0, size: 10, rating: 'NEGATIVE' })
  assert.equal(page.rows[0].id, '31'); assert.equal(page.rows[0].reviewedBy, null); assert.equal(page.rows[0].messageId, '52')
  assert.deepEqual(await service.getFeedbackStatistics(), { total: 3, positive: 1, negative: 2, awaitingReview: 3 })
  const detail = await service.getFeedbackDetail('31')
  assert.equal(h.calls[2].args[0], '/assistant/feedback/31'); assert.equal(detail.reviewedBy, 'TST Admin')
  const saved = await service.reviewFeedback('31', 'REVIEWED', '  Handbook needs an update  ')
  assert.equal(h.calls[3].method, 'patch')
  assert.deepEqual(h.calls[3].args, ['/assistant/feedback/31/review', { reviewStatus: 'REVIEWED', reviewNote: 'Handbook needs an update' }])
  assert.equal(saved.reviewStatus, 'REVIEWED')
  await service.reviewFeedback('31', 'PENDING', '   ')
  assert.deepEqual(h.calls[4].args[1], { reviewStatus: 'PENDING', reviewNote: null })
  await assert.rejects(service.reviewFeedback('0', 'REVIEWED', ''), /Invalid feedback ID/)
  assert.throws(() => service.mapFeedback(apiFeedback({ rating: 'GOOD' })), /Unexpected/)
})
