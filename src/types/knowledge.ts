// AI Knowledge Base (sidebar: AI Management › AI Knowledge Base). Shapes of /api/v1/admin/knowledge/** as the
// page uses them; services/knowledgeService.ts maps and checks the raw responses.

export type ProcessingStatus = 'UPLOADED' | 'QUEUED' | 'PROCESSING' | 'CHUNKING' | 'EMBEDDING' | 'READY' | 'FAILED'
export type ScopeType = 'UNIVERSITY' | 'DEPARTMENT' | 'PROGRAM' | 'CURRICULUM'

export interface KnowledgeCategory {
  id: string
  code: string
  name: string
  isActive: boolean
}

export interface KnowledgeScope {
  type: ScopeType
  curriculumVersionId: string | null
  curriculumVersionCode: string | null
  programId: string | null
  programName: string | null
  departmentId: string | null
  departmentName: string | null
}

export interface KnowledgeDocument {
  id: string
  title: string
  description: string | null
  category: KnowledgeCategory | null
  academicYearLabel: string
  scope: KnowledgeScope
  file: { id: string; originalFilename: string; extension: string; mimeType: string; sizeBytes: number; revisionNumber: number } | null
  uploadedBy: string | null
  uploadedAt: string | null
  processingStatus: ProcessingStatus
  isActive: boolean
  updatedAt: string | null
}

export interface KnowledgeStatistics {
  total: number
  ready: number
  processing: number
  failed: number
}

export interface KnowledgeProcessing {
  status: ProcessingStatus
  revisionNumber: number
  attemptCount: number
  ingestionAvailable: boolean
  message: string | null
  failedStage: string | null
  lastErrorMessage: string | null
  pageCount: number
  chunkCount: number
  embeddedChunkCount: number
  indexStale: boolean
  startedAt: string | null
  completedAt: string | null
}

export interface KnowledgeFilters {
  query: string
  categoryId: string
  academicYear: string
  status: ProcessingStatus | ''
}

/** Upload / edit form. file is only used by the upload. */
export interface KnowledgeDraft {
  title: string
  categoryId: string
  academicYearLabel: string
  description: string
}
