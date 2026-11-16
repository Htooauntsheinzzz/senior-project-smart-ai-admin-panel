import type { AssistantPassage, ChatTurn, FeedbackFilters, HistoryFilters, Rating, ReviewStatus } from '../types/aiAssistant'

// Pure helpers of the AI Assistant, Test AI Knowledge, Chat History and AI Feedback screens (admin panel specs 41 to 44).

export const MAX_MESSAGE_CHARS = 4000
export const MAX_QUESTION_CHARS = 500
export const MAX_SEARCH_CHARS = 100
export const MAX_NOTE_CHARS = 1000
/** The chat endpoint accepts at most 20 earlier turns of at most 8000 characters each. */
export const MAX_HISTORY_TURNS = 20
export const MAX_TURN_CHARS = 8000

export const emptyHistoryFilters: HistoryFilters = { query: '', from: '', to: '' }
export const emptyFeedbackFilters: FeedbackFilters = { query: '', rating: '', reviewStatus: '', from: '', to: '' }

export const ratings: Rating[] = ['POSITIVE', 'NEGATIVE']
export const reviewStatuses: ReviewStatus[] = ['PENDING', 'REVIEWED', 'RESOLVED']
export const ratingLabels: Record<Rating, string> = { POSITIVE: 'Positive', NEGATIVE: 'Negative' }
export const reviewStatusLabels: Record<ReviewStatus, string> = { PENDING: 'Awaiting Review', REVIEWED: 'Reviewed', RESOLVED: 'Resolved' }
export const ratingStyles: Record<Rating, { bg: string; text: string }> = {
  POSITIVE: { bg: '#d1fae5', text: '#047857' },
  NEGATIVE: { bg: '#fee2e2', text: '#b91c1c' },
}
export const reviewStatusStyles: Record<ReviewStatus, { bg: string; text: string }> = {
  PENDING: { bg: '#fef3c7', text: '#92400e' },
  REVIEWED: { bg: '#e0e7ff', text: '#3730a3' },
  RESOLVED: { bg: '#d1fae5', text: '#047857' },
}
export const ratingOptions = ratings.map(value => ({ value, label: ratingLabels[value] }))
export const reviewStatusOptions = reviewStatuses.map(value => ({ value, label: reviewStatusLabels[value] }))

/** Local midnight of a date input value (YYYY-MM-DD) plus addDays, or null when the value is not a real date. */
export function localDayStart(value: string, addDays = 0) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(year, month - 1, day + addDays)
  // new Date() rolls 2026-02-31 over to March; such a value is not a date the user picked.
  const check = new Date(year, month - 1, day)
  if (check.getFullYear() !== year || check.getMonth() !== month - 1 || check.getDate() !== day) return null
  return date
}

/** "From date" must not be after "To date". Empty when the range is fine. */
export function dateRangeError(from: string, to: string) {
  if ((from && !localDayStart(from)) || (to && !localDayStart(to))) return 'Enter a valid date.'
  return from && to && from > to ? 'From date must not be after To date.' : ''
}

/**
 * The backend filters by instants: from is inclusive, to exclusive. The whole local "To" day is included by sending
 * the start of the next day.
 */
export function dateRangeParams(from: string, to: string) {
  const params: Record<string, string> = {}
  if (dateRangeError(from, to)) return params
  const start = from ? localDayStart(from) : null
  const end = to ? localDayStart(to, 1) : null
  if (start) params.from = start.toISOString()
  if (end) params.to = end.toISOString()
  return params
}

function searchParam(query: string) {
  const search = query.trim().slice(0, MAX_SEARCH_CHARS)
  return search ? { search } : {}
}

/** Query of GET /assistant/conversations; page is 1-based on screen and 0-based on the server. */
export function historyParams(filters: HistoryFilters, page?: number, size?: number) {
  return { ...(page == null ? {} : { page: page - 1, size }), ...searchParam(filters.query), ...dateRangeParams(filters.from, filters.to) }
}

/** Query of GET /assistant/feedback. */
export function feedbackParams(filters: FeedbackFilters, page?: number, size?: number) {
  return {
    ...historyParams(filters, page, size),
    ...(filters.rating ? { rating: filters.rating } : {}),
    ...(filters.reviewStatus ? { reviewStatus: filters.reviewStatus } : {}),
  }
}

/** The earlier turns to send with the next chat message: the newest ones, each within the server limit. */
export function historyTurns(turns: ChatTurn[]) {
  const newest = turns.filter(turn => turn.content.trim()).slice(-MAX_HISTORY_TURNS)
  // A model conversation starts with a user turn; a cut that begins with an answer drops that answer.
  return (newest[0]?.role === 'ASSISTANT' ? newest.slice(1) : newest)
    .map(turn => ({ role: turn.role, content: turn.content.slice(0, MAX_TURN_CHARS) }))
}

/** One entry per document, in the order of the best passage, for the source chips under a chat answer. */
export function sourceDocuments(passages: AssistantPassage[]) {
  const seen = new Map<string, AssistantPassage>()
  for (const passage of passages) if (!seen.has(passage.documentId)) seen.set(passage.documentId, passage)
  return [...seen.values()]
}

/** "Page 12", "Pages 12–14", "Sheet 2", "Section 3" or '' when the passage has no position. */
export function passageLocation(passage: Pick<AssistantPassage, 'unitType' | 'pageStart' | 'pageEnd'>) {
  if (!(passage.pageStart > 0)) return ''
  const names: Record<string, [string, string]> = { PAGE: ['Page', 'Pages'], SHEET: ['Sheet', 'Sheets'], SECTION: ['Section', 'Sections'], TEXT: ['Part', 'Parts'] }
  const [one, many] = names[passage.unitType ?? 'PAGE'] ?? names.PAGE
  return passage.pageEnd > passage.pageStart ? `${many} ${passage.pageStart}–${passage.pageEnd}` : `${one} ${passage.pageStart}`
}

/** 0.834 → "83%". */
export function scorePercent(score: number) {
  return `${Math.round(Math.min(1, Math.max(0, score)) * 100)}%`
}

/** 2140 → "2.1 s", 180 → "180 ms". */
export function formatDuration(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.max(0, Math.round(ms))} ms`
}

/** "3 conversations", "1 conversation". */
export function countLabel(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`
}

/** ai-feedback-2026-11-13.csv */
export function exportFileName(prefix: string, now = new Date()) {
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return `${prefix}-${day}.csv`
}

interface ApiErrorShape { response?: { status?: number; data?: { code?: string } } }
const errorMessages: Record<string, string> = {
  VALIDATION_ERROR: 'The request is invalid. Check the entered values.',
  AI_ASSISTANT_UNAVAILABLE: 'The AI model is not available right now. Check the AI settings of the backend (AI_API_KEY, AI_MODEL, AI_BASE_URL) and try again.',
  AI_REQUEST_TIMEOUT: 'The AI model took too long to answer. Try again.',
  AI_PROVIDER_RATE_LIMITED: 'The AI model is busy. Try again shortly.',
  INVALID_AI_PROVIDER_RESPONSE: 'The AI model returned no usable answer. Try again.',
  KNOWLEDGE_SEARCH_NOT_CONFIGURED: 'Knowledge search is not configured: the backend has no embedding model (AI_EMBEDDING_MODEL).',
  KNOWLEDGE_SEARCH_UNAVAILABLE: 'Knowledge search is temporarily unavailable. Try again.',
  KNOWLEDGE_SEARCH_RATE_LIMITED: 'Knowledge search is busy. Try again shortly.',
  INVALID_CONVERSATION_ID: 'This conversation link is not valid.',
  CONVERSATION_NOT_FOUND: 'This conversation no longer exists. The student may have deleted it.',
  ASSISTANT_FEEDBACK_NOT_FOUND: 'This feedback no longer exists. The student may have deleted the conversation.',
}

/** Safe copy for a failed AI Management request; server messages are never shown as they are. */
export function assistantError(error: unknown, fallback = 'The request could not be completed. Try again.') {
  const { status, data } = (error as ApiErrorShape)?.response ?? {}
  if (!status) return 'The server could not be reached. Check your connection and try again.'
  if (status === 403) return 'You do not have permission to use AI Management.'
  if (data?.code && errorMessages[data.code]) return errorMessages[data.code]
  if (status === 400) return errorMessages.VALIDATION_ERROR
  if (status === 429) return errorMessages.AI_PROVIDER_RATE_LIMITED
  return fallback
}
