import apiClient from '../api/apiClient'
import type { KnowledgeCategory, KnowledgeDocument, KnowledgeDraft, KnowledgeFilters, KnowledgeProcessing, KnowledgeStatistics, ProcessingStatus, ScopeType } from '../types/knowledge'
import { documentListParams, normalizeAcademicYear, processingStatuses } from '../utils/knowledgeBase'

// AI Knowledge Base API (backend feature/knowledge, base /api/v1/admin/knowledge). Every response is checked and
// mapped here so the page never renders unexpected data. IDs are kept as strings, as in the other services.

type Row = Record<string, unknown>
const object = (value: unknown): Row => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Unexpected knowledge response.')
  return value as Row
}
const id = (value: unknown) => {
  if (!Number.isSafeInteger(value) || Number(value) <= 0) throw new Error('Unexpected knowledge response.')
  return String(value)
}
const optionalId = (value: unknown) => value == null ? null : id(value)
const text = (value: unknown) => { if (typeof value !== 'string') throw new Error('Unexpected knowledge response.'); return value }
const optionalText = (value: unknown) => typeof value === 'string' ? value : null
const count = (value: unknown) => Number.isSafeInteger(value) && Number(value) >= 0 ? Number(value) : 0
const status = (value: unknown): ProcessingStatus => {
  if (!processingStatuses.includes(value as ProcessingStatus)) throw new Error('Unexpected knowledge response.')
  return value as ProcessingStatus
}
const scopeTypes: ScopeType[] = ['UNIVERSITY', 'DEPARTMENT', 'PROGRAM', 'CURRICULUM']

export function knowledgePath(documentId: string) {
  if (!/^[1-9]\d*$/.test(documentId) || !Number.isSafeInteger(Number(documentId))) throw new Error('Invalid document ID.')
  return `/knowledge/documents/${documentId}`
}

export function mapDocument(value: unknown): KnowledgeDocument {
  const row = object(value)
  const category = row.category == null ? null : object(row.category)
  const scope = row.scope == null ? {} as Row : object(row.scope)
  const file = row.file == null ? null : object(row.file)
  const uploader = row.uploadedBy == null ? null : object(row.uploadedBy)
  if (typeof row.isActive !== 'boolean') throw new Error('Unexpected knowledge response.')
  return {
    id: id(row.id),
    title: text(row.title),
    description: optionalText(row.description),
    category: category && { id: id(category.id), code: optionalText(category.code) ?? '', name: text(category.name), isActive: category.isActive !== false },
    academicYearLabel: text(row.academicYearLabel),
    scope: {
      type: scopeTypes.includes(scope.type as ScopeType) ? scope.type as ScopeType : 'UNIVERSITY',
      curriculumVersionId: optionalId(scope.curriculumVersionId), curriculumVersionCode: optionalText(scope.curriculumVersionCode),
      programId: optionalId(scope.programId), programName: optionalText(scope.programName),
      departmentId: optionalId(scope.departmentId), departmentName: optionalText(scope.departmentName),
    },
    file: file && { id: id(file.id), originalFilename: text(file.originalFilename), extension: text(file.extension), mimeType: optionalText(file.mimeType) ?? '', sizeBytes: count(file.sizeBytes), revisionNumber: count(file.revisionNumber) },
    uploadedBy: uploader ? optionalText(uploader.displayName) : null,
    uploadedAt: optionalText(row.uploadedAt),
    processingStatus: status(row.processingStatus),
    isActive: row.isActive,
    updatedAt: optionalText(row.updatedAt),
  }
}

export interface DocumentPage { rows: KnowledgeDocument[]; totalElements: number; totalPages: number }

export async function getKnowledgeDocuments(filters: KnowledgeFilters, page: number, size: number, signal?: AbortSignal): Promise<DocumentPage> {
  const { data } = await apiClient.get('/knowledge/documents', { params: documentListParams(filters, page, size), signal })
  const body = object(data)
  if (!Array.isArray(body.content)) throw new Error('Unexpected knowledge response.')
  return { rows: body.content.map(mapDocument), totalElements: count(body.totalElements), totalPages: count(body.totalPages) }
}

export async function getKnowledgeStatistics(signal?: AbortSignal): Promise<KnowledgeStatistics> {
  const { data } = await apiClient.get('/knowledge/documents/statistics', { signal })
  const body = object(data)
  return { total: count(body.totalDocuments), ready: count(body.readyDocuments), processing: count(body.processingDocuments), failed: count(body.failedDocuments) }
}

export async function getKnowledgeDocument(documentId: string, signal?: AbortSignal) {
  const { data } = await apiClient.get(knowledgePath(documentId), { signal })
  return mapDocument(data)
}

export async function getKnowledgeProcessing(documentId: string, signal?: AbortSignal): Promise<KnowledgeProcessing> {
  const { data } = await apiClient.get(`${knowledgePath(documentId)}/processing`, { signal })
  const body = object(data)
  return {
    status: status(body.status), revisionNumber: count(body.revisionNumber), attemptCount: count(body.attemptCount),
    ingestionAvailable: body.ingestionAvailable === true, message: optionalText(body.message),
    failedStage: optionalText(body.failedStage), lastErrorMessage: optionalText(body.lastErrorMessage),
    pageCount: count(body.pageCount), chunkCount: count(body.chunkCount), embeddedChunkCount: count(body.embeddedChunkCount),
    indexStale: body.indexStale === true, startedAt: optionalText(body.startedAt), completedAt: optionalText(body.completedAt),
  }
}

/** Active categories for the filter and the form (all pages; categories are few). */
export async function getKnowledgeCategories(signal?: AbortSignal): Promise<KnowledgeCategory[]> {
  const rows: KnowledgeCategory[] = []
  for (let page = 0; page < 20; page++) {
    const { data } = await apiClient.get('/knowledge/categories', { params: { page, size: 100, sort: 'categoryName,asc' }, signal })
    const body = object(data)
    if (!Array.isArray(body.content)) throw new Error('Unexpected knowledge response.')
    for (const item of body.content) {
      const row = object(item)
      rows.push({ id: id(row.id), code: optionalText(row.categoryCode) ?? '', name: text(row.categoryName), isActive: row.isActive !== false })
    }
    if (body.last !== false) break
  }
  return rows
}

/** POST /knowledge/categories. The code is stored upper-case; letters, digits and underscores keep it readable. */
export function categoryCodeFromName(name: string) {
  return name.normalize('NFKD').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').toUpperCase().slice(0, 60)
}
export async function createKnowledgeCategory(name: string): Promise<KnowledgeCategory> {
  const categoryName = name.trim().slice(0, 150)
  const categoryCode = categoryCodeFromName(categoryName) || `CATEGORY_${Date.now()}`
  const { data } = await apiClient.post('/knowledge/categories', { categoryCode, categoryName })
  const row = object(data)
  return { id: id(row.id), code: optionalText(row.categoryCode) ?? categoryCode, name: text(row.categoryName), isActive: row.isActive !== false }
}

function metadata(draft: KnowledgeDraft) {
  const year = normalizeAcademicYear(draft.academicYearLabel)
  if (!year || !/^[1-9]\d*$/.test(draft.categoryId)) throw new Error('Invalid document details.')
  return { title: draft.title.trim(), categoryId: Number(draft.categoryId), academicYearLabel: year, description: draft.description.trim() }
}

/** POST /knowledge/documents/upload (multipart). Only the documented fields are sent; the server rejects others. */
export function uploadFormData(draft: KnowledgeDraft, file: Blob & { name?: string }) {
  const fields = metadata(draft)
  const form = new FormData()
  form.append('title', fields.title)
  form.append('categoryId', String(fields.categoryId))
  form.append('academicYearLabel', fields.academicYearLabel)
  if (fields.description) form.append('description', fields.description)
  form.append('file', file, file.name)
  return form
}
const multipart = { headers: { 'Content-Type': 'multipart/form-data' } }

export async function uploadKnowledgeDocument(draft: KnowledgeDraft, file: File, onProgress?: (percent: number) => void) {
  const { data } = await apiClient.post('/knowledge/documents/upload', uploadFormData(draft, file), {
    ...multipart, onUploadProgress: event => { if (onProgress && event.total) onProgress(Math.round(event.loaded / event.total * 100)) },
  })
  const body = object(data)
  return { id: id(body.documentId), title: text(body.title) }
}

/** PUT replaces all metadata; the stored program/department/curriculum scope is sent back unchanged. */
export function updatePayload(document: KnowledgeDocument, draft: KnowledgeDraft) {
  const fields = metadata(draft)
  const scope = document.scope
  return {
    ...fields, description: fields.description || null,
    curriculumVersionId: scope.type === 'CURRICULUM' && scope.curriculumVersionId ? Number(scope.curriculumVersionId) : null,
    programId: scope.type === 'PROGRAM' && scope.programId ? Number(scope.programId) : null,
    departmentId: scope.type === 'DEPARTMENT' && scope.departmentId ? Number(scope.departmentId) : null,
  }
}

export async function updateKnowledgeDocument(document: KnowledgeDocument, draft: KnowledgeDraft) {
  const { data } = await apiClient.put(knowledgePath(document.id), updatePayload(document, draft))
  return mapDocument(data)
}

export async function replaceKnowledgeFile(documentId: string, file: File, onProgress?: (percent: number) => void) {
  const form = new FormData()
  form.append('file', file, file.name)
  await apiClient.post(`${knowledgePath(documentId)}/files`, form, {
    ...multipart, onUploadProgress: event => { if (onProgress && event.total) onProgress(Math.round(event.loaded / event.total * 100)) },
  })
}

export async function setKnowledgeDocumentActive(documentId: string, active: boolean) {
  const { data } = await apiClient.patch(`${knowledgePath(documentId)}/${active ? 'activate' : 'archive'}`)
  return mapDocument(data)
}

/** RESUME (no body) continues a failed run; FULL rebuilds pages, chunks and embeddings. */
export async function reprocessKnowledgeDocument(documentId: string, mode: 'RESUME' | 'FULL') {
  await apiClient.post(`${knowledgePath(documentId)}/reprocess`, mode === 'FULL' ? { mode: 'FULL' } : undefined)
}

export async function deleteKnowledgeDocument(documentId: string) {
  await apiClient.delete(knowledgePath(documentId))
}

/** Downloads the current file with the admin token and saves it under its original name. */
export async function downloadKnowledgeDocument(document: KnowledgeDocument) {
  const { data } = await apiClient.get(`${knowledgePath(document.id)}/download`, { responseType: 'blob' })
  const url = URL.createObjectURL(data as Blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = document.file?.originalFilename || `${document.title}.${document.file?.extension ?? 'pdf'}`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
