import type { KnowledgeCategory, KnowledgeDocument, KnowledgeDraft, KnowledgeFilters, ProcessingStatus } from '../types/knowledge'

// Pure helpers of the AI Knowledge Base page, unit-tested in tests/knowledge-base.test.cjs. Colours and labels come
// from Figma node 168:2100 (AIKnowledgeBaseScreen).

/** AI Status badge: Figma shows ✅ Ready, ❌ Failed and a spinner icon for the in-progress stages. */
export const aiStatuses: Record<ProcessingStatus, { label: string; bg: string; text: string; emoji?: string; icon?: string }> = {
  READY: { label: 'Ready', bg: '#d1fae5', text: '#059669', emoji: '✅' },
  FAILED: { label: 'Failed', bg: '#fee2e2', text: '#dc2626', emoji: '❌' },
  EMBEDDING: { label: 'Embedding', bg: '#fff0fb', text: '#86198f', icon: '/assets/figma/ai-status-embedding.svg' },
  CHUNKING: { label: 'Chunking', bg: '#f5f3ff', text: '#5b21b6', icon: '/assets/figma/ai-status-chunking.svg' },
  PROCESSING: { label: 'Processing', bg: '#fef3c7', text: '#b45309', icon: '/assets/figma/ai-status-processing.svg' },
  QUEUED: { label: 'Queued', bg: '#fef3c7', text: '#b45309', icon: '/assets/figma/ai-status-processing.svg' },
  UPLOADED: { label: 'Uploaded', bg: '#fef3c7', text: '#b45309', icon: '/assets/figma/ai-status-processing.svg' },
}
export const processingStatuses = Object.keys(aiStatuses) as ProcessingStatus[]
export const isInProgress = (status: ProcessingStatus) => status !== 'READY' && status !== 'FAILED'
export const statusOptions: { value: ProcessingStatus; label: string }[] =
  (['READY', 'UPLOADED', 'QUEUED', 'PROCESSING', 'CHUNKING', 'EMBEDDING', 'FAILED'] as ProcessingStatus[]).map(value => ({ value, label: aiStatuses[value].label }))

// Category chip colours and row icons of the Figma rows. Categories are data (document_categories), so a category is
// matched by keywords in its code or name; anything else gets a stable colour from the same palette and 📄.
const categoryStyles: { match: RegExp; color: string; emoji: string }[] = [
  { match: /handbook/i, color: '#1d4ed8', emoji: '📘' },
  { match: /regulation|rule/i, color: '#5b21b6', emoji: '⚖️' },
  { match: /catalog|course/i, color: '#0369a1', emoji: '📚' },
  { match: /scholar/i, color: '#047857', emoji: '🎓' },
  { match: /calendar/i, color: '#b45309', emoji: '📅' },
  { match: /safety|emergency|security/i, color: '#1e40af', emoji: '🛡️' },
  { match: /polic|procedure/i, color: '#374151', emoji: '🏛️' },
  { match: /faculty|guideline|program/i, color: '#be123c', emoji: '👩‍🏫' },
  { match: /financ|fee|tuition|aid/i, color: '#92400e', emoji: '💰' },
]
export function categoryStyle(category: Pick<KnowledgeCategory, 'code' | 'name'> | null) {
  if (!category) return { color: '#68728a', background: 'rgba(104,114,138,0.09)', emoji: '📄' }
  const text = `${category.code} ${category.name}`
  const found = categoryStyles.find(style => style.match.test(text))
  if (found) return { color: found.color, background: hexAlpha(found.color, 0.09), emoji: found.emoji }
  let hash = 0
  for (const char of category.code || category.name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  const color = categoryStyles[hash % categoryStyles.length].color
  return { color, background: hexAlpha(color, 0.09), emoji: '📄' }
}
function hexAlpha(hex: string, alpha: number) {
  const value = Number.parseInt(hex.slice(1), 16)
  return `rgba(${value >> 16},${(value >> 8) & 255},${value & 255},${alpha})`
}

/** The backend stores "2024-2025"; Figma shows it with an en dash. */
export const displayYear = (label: string) => label.replace(/^(\d{4})\s*[-–]\s*(\d{4})$/, '$1–$2')

/** Same rule as the backend's AcademicYearLabel: YYYY-YYYY, the second year one after the first, 2000–2100. */
export function normalizeAcademicYear(value: string) {
  const match = /^(\d{4})\s*[-–]\s*(\d{4})$/.exec(value.trim())
  if (!match) return null
  const first = Number(match[1]), second = Number(match[2])
  if (first < 2000 || first > 2100 || second !== first + 1) return null
  return `${first}-${second}`
}

/** Academic years offered in the year filter: next year back to six years ago (Thai academic year starts in June). */
export function academicYearOptions(today = new Date()) {
  const start = today.getMonth() >= 5 ? today.getFullYear() : today.getFullYear() - 1
  return Array.from({ length: 8 }, (_, index) => start + 1 - index).map(year => ({ value: `${year}-${year + 1}`, label: `${year}–${year + 1}` }))
}
export const currentAcademicYear = (today = new Date()) => academicYearOptions(today)[1].value

/** "2024-07-15" in the user's time zone, as in the Figma Date column. */
export function formatDay(instant: string | null) {
  if (!instant) return '—'
  const date = new Date(instant)
  if (Number.isNaN(date.getTime())) return '—'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function formatDateTime(instant: string | null) {
  if (!instant) return '—'
  const date = new Date(instant)
  return Number.isNaN(date.getTime()) ? '—' : `${formatDay(instant)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
export function scopeLabel(document: KnowledgeDocument) {
  const scope = document.scope
  switch (scope.type) {
    case 'CURRICULUM': return `Curriculum ${scope.curriculumVersionCode ?? ''}${scope.programName ? ` · ${scope.programName}` : ''}`.trim()
    case 'PROGRAM': return `Program · ${scope.programName ?? '—'}`
    case 'DEPARTMENT': return `Department · ${scope.departmentName ?? '—'}`
    default: return 'University-wide'
  }
}

export const emptyFilters: KnowledgeFilters = { query: '', categoryId: '', academicYear: '', status: '' }

/** Query string of GET /knowledge/documents (page is 1-based on screen, 0-based in the API). */
export function documentListParams(filters: KnowledgeFilters, page: number, size: number) {
  const params: Record<string, string | number> = { page: page - 1, size, sort: 'createdAt,desc' }
  const search = filters.query.trim()
  if (search) params.search = search.slice(0, 255)
  if (filters.categoryId) params.categoryId = filters.categoryId
  if (filters.academicYear) params.academicYear = filters.academicYear
  if (filters.status) params.status = filters.status
  return params
}

// ---- Upload / edit form ----

export const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'txt', 'xlsx'] as const
export const ACCEPT_ATTRIBUTE = '.pdf,.docx,.txt,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
export const MAX_FILE_BYTES = 50 * 1024 * 1024
export type DraftField = keyof KnowledgeDraft | 'file'
export const emptyDraft = (): KnowledgeDraft => ({ title: '', categoryId: '', academicYearLabel: displayYear(currentAcademicYear()), description: '' })
export const draftOf = (document: KnowledgeDocument): KnowledgeDraft => ({ title: document.title, categoryId: document.category?.id ?? '', academicYearLabel: displayYear(document.academicYearLabel), description: document.description ?? '' })
export const titleFromFilename = (name: string) => name.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').trim().slice(0, 255)

export function validateFile(file: { name: string; size: number } | null): string | undefined {
  if (!file) return 'Choose a PDF, DOCX, TXT or XLSX file.'
  const extension = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : ''
  if (!(ACCEPTED_EXTENSIONS as readonly string[]).includes(extension)) return 'Only PDF, DOCX, TXT and XLSX files can be uploaded.'
  if (file.size === 0) return 'The file is empty.'
  if (file.size > MAX_FILE_BYTES) return 'The file is larger than 50 MB.'
  return undefined
}

export function validateDraft(draft: KnowledgeDraft, file: { name: string; size: number } | null | undefined) {
  const errors: Partial<Record<DraftField, string>> = {}
  const title = draft.title.trim()
  if (!title) errors.title = 'Enter the document title.'
  else if (title.length > 255) errors.title = 'Use at most 255 characters.'
  if (!/^[1-9]\d*$/.test(draft.categoryId)) errors.categoryId = 'Select a category.'
  if (!normalizeAcademicYear(draft.academicYearLabel)) errors.academicYearLabel = 'Use the form 2025–2026 (two consecutive years).'
  if (draft.description.length > 5000) errors.description = 'Use at most 5,000 characters.'
  if (file !== undefined) { const fileError = validateFile(file); if (fileError) errors.file = fileError }
  return errors
}

// ---- Errors ----

interface ApiErrorShape { response?: { status?: number; data?: { code?: string } } }
const errorMessages: Record<string, string> = {
  DOCUMENT_CATEGORY_NOT_FOUND: 'The selected category no longer exists. Reload and choose another.',
  DOCUMENT_NOT_FOUND: 'This document no longer exists. Reload the list.',
  DOCUMENT_NOT_EDITABLE: 'Archived documents must be activated before they are changed.',
  DOCUMENT_FILE_REQUIRED: 'Choose a file to upload.',
  DOCUMENT_FILE_EMPTY: 'The file is empty.',
  DOCUMENT_FILE_TOO_LARGE: 'The file is larger than the 50 MB upload limit.',
  DOCUMENT_FILE_TYPE_UNSUPPORTED: 'Only PDF, DOCX, TXT and XLSX files can be uploaded.',
  DOCUMENT_FILE_CONTENT_INVALID: 'The file content does not match its type or the file is damaged.',
  DOCUMENT_STORAGE_FAILED: 'Document storage is temporarily unavailable. Try again later.',
  DOCUMENT_FILE_NOT_FOUND: 'The stored file could not be found.',
  DOCUMENT_UPLOAD_DISABLED: 'Document upload is turned off on the server.',
  DOCUMENT_UPLOAD_VALIDATION_ERROR: 'The upload is invalid. Check the title, category, academic year and file.',
  DOCUMENT_CATEGORY_INVALID: 'The selected category is inactive. Choose another.',
  DOCUMENT_SCOPE_INVALID: 'The document’s program, department or curriculum is no longer valid.',
  DOCUMENT_METADATA_SAVE_FAILED: 'The document details could not be saved. Try again.',
  DOCUMENT_REVISION_CONFLICT: 'The document was changed by someone else. Reload and try again.',
  DOCUMENT_PROCESSING_ALREADY_RUNNING: 'This document is already being processed.',
  DOCUMENT_PROCESSING_NOT_AVAILABLE: 'AI processing is not available on the server (ingestion is off or the embedding model is not configured).',
  DOCUMENT_ALREADY_PROCESSED: 'This document is already processed. Use a full reprocess to rebuild it.',
}
export function knowledgeError(error: unknown, fallback = 'The request could not be completed. Try again.') {
  const { status, data } = (error as ApiErrorShape)?.response ?? {}
  if (!status) return 'The server could not be reached. Check your connection and try again.'
  if (status === 403) return 'You do not have permission to manage the AI Knowledge Base.'
  if (data?.code && errorMessages[data.code]) return errorMessages[data.code]
  if (status === 413) return errorMessages.DOCUMENT_FILE_TOO_LARGE
  if (status === 400) return 'The request is invalid. Check the entered values.'
  if (status === 404) return errorMessages.DOCUMENT_NOT_FOUND
  return fallback
}
/** Which form field a backend error belongs to. */
export function knowledgeErrorField(error: unknown): DraftField | undefined {
  const code = (error as ApiErrorShape)?.response?.data?.code ?? ''
  if (code === 'DOCUMENT_CATEGORY_NOT_FOUND' || code === 'DOCUMENT_CATEGORY_INVALID') return 'categoryId'
  if (code.startsWith('DOCUMENT_FILE_') || (error as ApiErrorShape)?.response?.status === 413) return 'file'
  return undefined
}
