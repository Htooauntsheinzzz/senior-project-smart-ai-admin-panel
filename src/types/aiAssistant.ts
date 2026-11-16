// AI Management › AI Assistant, Test AI Knowledge, Chat History and AI Feedback. Shapes of /api/v1/admin/assistant/**
// (backend spec 59) as the pages use them; services/aiAssistantService.ts maps and checks the raw responses.

export type Rating = 'POSITIVE' | 'NEGATIVE'
export type ReviewStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED'
export type ChatRole = 'USER' | 'ASSISTANT'

/** One document passage the answer was generated from. score is the similarity to the question (0 to 1). */
export interface AssistantPassage {
  rank: number
  score: number
  documentId: string
  title: string
  category: string | null
  academicYear: string | null
  sectionTitle: string | null
  unitType: string | null
  pageStart: number
  pageEnd: number
  content: string
}

/** Answer of POST /assistant/chat and POST /assistant/knowledge-test. model is null when no model was called. */
export interface AssistantAnswer {
  message: string
  requestId: string
  model: string | null
  createdAt: string | null
  grounded: boolean
  retrievalMs: number
  generationMs: number
  passages: AssistantPassage[]
}

/** One earlier turn sent back as chat history; the backend stores nothing of an admin chat. */
export interface ChatTurn {
  role: ChatRole
  content: string
}

export interface StudentRef {
  id: string
  studentCode: string
  fullName: string
}

export interface ConversationSummary {
  conversationId: string
  title: string
  lastMessagePreview: string | null
  messageCount: number
  createdAt: string | null
  updatedAt: string | null
  student: StudentRef
}

export interface MessageSource {
  title: string
  academicYear: string | null
  category: string | null
}

export interface TranscriptMessage {
  messageId: string
  role: ChatRole
  content: string
  createdAt: string | null
  model: string | null
  sources: MessageSource[]
  feedback: { id: string; rating: Rating; comment: string | null; reviewStatus: ReviewStatus } | null
}

export interface ConversationDetail {
  conversationId: string
  title: string
  messageCount: number
  createdAt: string | null
  updatedAt: string | null
  student: StudentRef
  hasMoreBefore: boolean
  messages: TranscriptMessage[]
}

/** In the list question and answer are previews (300 characters); the detail has the complete texts, model and sources. */
export interface FeedbackRecord {
  id: string
  rating: Rating
  comment: string | null
  reviewStatus: ReviewStatus
  reviewNote: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  submittedAt: string | null
  student: StudentRef
  conversationId: string
  conversationTitle: string
  messageId: string
  question: string | null
  answer: string
  model: string | null
  sources: MessageSource[]
}

export interface FeedbackStatistics {
  total: number
  positive: number
  negative: number
  awaitingReview: number
}

/** from and to are the values of the date inputs (YYYY-MM-DD, local time) or ''. */
export interface HistoryFilters {
  query: string
  from: string
  to: string
}

export interface FeedbackFilters extends HistoryFilters {
  rating: Rating | ''
  reviewStatus: ReviewStatus | ''
}

export interface Page<T> {
  rows: T[]
  totalElements: number
  totalPages: number
}
