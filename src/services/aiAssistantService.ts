import apiClient from '../api/apiClient'
import type { AssistantAnswer, AssistantPassage, ChatRole, ChatTurn, ConversationDetail, ConversationSummary, FeedbackFilters, FeedbackRecord, FeedbackStatistics, HistoryFilters, MessageSource, Page, Rating, ReviewStatus, StudentRef, TranscriptMessage } from '../types/aiAssistant'
import { MAX_NOTE_CHARS, exportFileName, feedbackParams, historyParams, historyTurns, ratings, reviewStatuses } from '../utils/aiAssistant'

// AI Management API (backend spec 59, base /api/v1/admin/assistant): the Admin chat, the knowledge test, the Students'
// chat history and the feedback on AI answers. Every response is checked and mapped here so a screen never renders
// unexpected data. IDs are kept as strings, as in the other services.

type Row = Record<string, unknown>
const unexpected = () => new Error('Unexpected AI assistant response.')
const object = (value: unknown): Row => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw unexpected()
  return value as Row
}
const list = (value: unknown): unknown[] => { if (!Array.isArray(value)) throw unexpected(); return value }
const id = (value: unknown) => {
  if (!Number.isSafeInteger(value) || Number(value) <= 0) throw unexpected()
  return String(value)
}
const text = (value: unknown) => { if (typeof value !== 'string') throw unexpected(); return value }
const optionalText = (value: unknown) => typeof value === 'string' ? value : null
const count = (value: unknown) => Number.isSafeInteger(value) && Number(value) >= 0 ? Number(value) : 0
const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : 0
const oneOf = <T extends string>(values: readonly T[], value: unknown): T => {
  if (!values.includes(value as T)) throw unexpected()
  return value as T
}
const roles: ChatRole[] = ['USER', 'ASSISTANT']
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isConversationId = (value: string) => uuid.test(value)
export function conversationPath(conversationId: string) {
  if (!isConversationId(conversationId)) throw new Error('Invalid conversation ID.')
  return `/assistant/conversations/${conversationId.toLowerCase()}`
}
export function feedbackPath(feedbackId: string) {
  if (!/^[1-9]\d*$/.test(feedbackId) || !Number.isSafeInteger(Number(feedbackId))) throw new Error('Invalid feedback ID.')
  return `/assistant/feedback/${feedbackId}`
}

function mapPassage(value: unknown): AssistantPassage {
  const row = object(value)
  return {
    rank: count(row.rank), score: number(row.score), documentId: id(row.documentId), title: text(row.title),
    category: optionalText(row.category), academicYear: optionalText(row.academicYear), sectionTitle: optionalText(row.sectionTitle),
    unitType: optionalText(row.unitType), pageStart: count(row.pageStart), pageEnd: count(row.pageEnd), content: optionalText(row.content) ?? '',
  }
}

export function mapAnswer(value: unknown): AssistantAnswer {
  const row = object(value)
  return {
    message: text(row.message), requestId: text(row.requestId), model: optionalText(row.model), createdAt: optionalText(row.createdAt),
    grounded: row.grounded === true, retrievalMs: count(row.retrievalMs), generationMs: count(row.generationMs),
    passages: list(row.passages ?? []).map(mapPassage),
  }
}

const mapStudent = (value: unknown): StudentRef => {
  const row = object(value)
  return { id: id(row.id), studentCode: text(row.studentCode), fullName: text(row.fullName) }
}
const mapSources = (value: unknown): MessageSource[] => list(value ?? []).map(item => {
  const row = object(item)
  return { title: text(row.title), academicYear: optionalText(row.academicYear), category: optionalText(row.category) }
})

export function mapConversation(value: unknown): ConversationSummary {
  const row = object(value)
  return {
    conversationId: text(row.conversationId), title: text(row.title), lastMessagePreview: optionalText(row.lastMessagePreview),
    messageCount: count(row.messageCount), createdAt: optionalText(row.createdAt), updatedAt: optionalText(row.updatedAt), student: mapStudent(row.student),
  }
}

function mapMessage(value: unknown): TranscriptMessage {
  const row = object(value)
  const feedback = row.feedback == null ? null : object(row.feedback)
  return {
    messageId: id(row.messageId), role: oneOf(roles, row.role), content: text(row.content), createdAt: optionalText(row.createdAt),
    model: optionalText(row.model), sources: mapSources(row.sources),
    feedback: feedback && { id: id(feedback.id), rating: oneOf<Rating>(ratings, feedback.rating), comment: optionalText(feedback.comment), reviewStatus: oneOf<ReviewStatus>(reviewStatuses, feedback.reviewStatus) },
  }
}

export function mapConversationDetail(value: unknown): ConversationDetail {
  const row = object(value)
  return {
    conversationId: text(row.conversationId), title: text(row.title), messageCount: count(row.messageCount), createdAt: optionalText(row.createdAt),
    updatedAt: optionalText(row.updatedAt), student: mapStudent(row.student), hasMoreBefore: row.hasMoreBefore === true, messages: list(row.messages).map(mapMessage),
  }
}

export function mapFeedback(value: unknown): FeedbackRecord {
  const row = object(value)
  const reviewer = row.reviewedBy == null ? null : object(row.reviewedBy)
  return {
    id: id(row.id), rating: oneOf<Rating>(ratings, row.rating), comment: optionalText(row.comment), reviewStatus: oneOf<ReviewStatus>(reviewStatuses, row.reviewStatus),
    reviewNote: optionalText(row.reviewNote), reviewedBy: reviewer ? optionalText(reviewer.displayName) : null, reviewedAt: optionalText(row.reviewedAt),
    submittedAt: optionalText(row.submittedAt), student: mapStudent(row.student), conversationId: text(row.conversationId), conversationTitle: optionalText(row.conversationTitle) ?? '',
    messageId: id(row.messageId), question: optionalText(row.question), answer: text(row.answer), model: optionalText(row.model), sources: mapSources(row.sources),
  }
}

function mapPage<T>(value: unknown, map: (row: unknown) => T): Page<T> {
  const body = object(value)
  return { rows: list(body.content).map(map), totalElements: count(body.totalElements), totalPages: count(body.totalPages) }
}

/** POST /assistant/chat. turns are the earlier messages of this chat; the server keeps no admin conversation. */
export async function sendAssistantMessage(message: string, turns: ChatTurn[], signal?: AbortSignal) {
  const history = historyTurns(turns)
  const { data } = await apiClient.post('/assistant/chat', { message: message.trim(), ...(history.length ? { history } : {}) }, { signal })
  return mapAnswer(data)
}

/** POST /assistant/knowledge-test: the answer the Ready knowledge documents give, with the passages it was built from. */
export async function runKnowledgeTest(question: string, signal?: AbortSignal) {
  const { data } = await apiClient.post('/assistant/knowledge-test', { question: question.trim() }, { signal })
  return mapAnswer(data)
}

export async function getConversations(filters: HistoryFilters, page: number, size: number, signal?: AbortSignal) {
  const { data } = await apiClient.get('/assistant/conversations', { params: historyParams(filters, page, size), signal })
  return mapPage(data, mapConversation)
}

/** The newest 50 messages, or the 50 before beforeMessageId ("Load earlier messages"). */
export async function getConversation(conversationId: string, beforeMessageId?: string, signal?: AbortSignal) {
  const params = { limit: 50, ...(beforeMessageId ? { beforeMessageId: Number(id(Number(beforeMessageId))) } : {}) }
  const { data } = await apiClient.get(conversationPath(conversationId), { params, signal })
  return mapConversationDetail(data)
}

export async function getFeedback(filters: FeedbackFilters, page: number, size: number, signal?: AbortSignal) {
  const { data } = await apiClient.get('/assistant/feedback', { params: feedbackParams(filters, page, size), signal })
  return mapPage(data, mapFeedback)
}

export async function getFeedbackStatistics(signal?: AbortSignal): Promise<FeedbackStatistics> {
  const { data } = await apiClient.get('/assistant/feedback/statistics', { signal })
  const body = object(data)
  return { total: count(body.totalFeedback), positive: count(body.positive), negative: count(body.negative), awaitingReview: count(body.awaitingReview) }
}

/** The complete question and answer of one feedback, with the model and the sources of the answer. */
export async function getFeedbackDetail(feedbackId: string, signal?: AbortSignal) {
  const { data } = await apiClient.get(feedbackPath(feedbackId), { signal })
  return mapFeedback(data)
}

/** PATCH /assistant/feedback/{id}/review. An empty note is sent as null; PENDING puts the feedback back to Awaiting Review. */
export async function reviewFeedback(feedbackId: string, reviewStatus: ReviewStatus, reviewNote: string) {
  const note = reviewNote.trim().slice(0, MAX_NOTE_CHARS)
  const { data } = await apiClient.patch(`${feedbackPath(feedbackId)}/review`, { reviewStatus, reviewNote: note || null })
  return mapFeedback(data)
}

function saveCsv(data: unknown, fileName: string) {
  const url = URL.createObjectURL(data as Blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** Downloads the conversations that match the filters (all pages, at most 5000 rows) as CSV. */
export async function exportConversations(filters: HistoryFilters) {
  const { data } = await apiClient.get('/assistant/conversations/export', { params: historyParams(filters), responseType: 'blob' })
  saveCsv(data, exportFileName('ai-chat-history'))
}

/** Downloads the feedback that matches the filters (all pages, at most 5000 rows) as CSV. */
export async function exportFeedback(filters: FeedbackFilters) {
  const { data } = await apiClient.get('/assistant/feedback/export', { params: feedbackParams(filters), responseType: 'blob' })
  saveCsv(data, exportFileName('ai-feedback'))
}
