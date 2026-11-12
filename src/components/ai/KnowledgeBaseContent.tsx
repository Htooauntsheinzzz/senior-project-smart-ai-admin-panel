import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KnowledgeCategory, KnowledgeDocument, KnowledgeFilters, KnowledgeProcessing, KnowledgeStatistics, ProcessingStatus } from '../../types/knowledge'
import { deleteKnowledgeDocument, downloadKnowledgeDocument, getKnowledgeCategories, getKnowledgeDocument, getKnowledgeDocuments, getKnowledgeProcessing, getKnowledgeStatistics, reprocessKnowledgeDocument, setKnowledgeDocumentActive, type DocumentPage } from '../../services/knowledgeService'
import { academicYearOptions, aiStatuses, categoryStyle, displayYear, emptyFilters, formatDateTime, formatDay, formatSize, isInProgress, knowledgeError, scopeLabel, statusOptions } from '../../utils/knowledgeBase'
import Pagination from '../ui/Pagination'
import { ActionMenu, CampusTable, ConfirmDelete, DetailsModal, FilterSelect, PageHeader, SearchInput, SerialChip, SuccessToast, SummaryCards, TableState, primaryButton } from '../campus/CampusUi'
import KnowledgeDocumentForm, { ReplaceFileModal } from './KnowledgeDocumentForm'

// AI Knowledge Base (sidebar: AI Management › AI Knowledge Base), Figma node 168:2100 "AIKnowledgeBaseScreen" in
// frame 168:1864 "AI Management". Backend: /api/v1/admin/knowledge/documents (server-side search, filters and paging),
// /statistics for the four cards and /knowledge/categories for the category filter. While any document is still being
// processed the list and the cards refresh every 5 seconds so the AI Status column moves on by itself.
const PAGE_SIZE = 10
const POLL_MS = 5000
const describe = (error: unknown) => knowledgeError(error)
const cell = 'px-3 py-3'

export function AiStatusBadge({ status }: { status: ProcessingStatus }) {
  const s = aiStatuses[status]
  return <span style={{ backgroundColor: s.bg, color: s.text }} className="inline-flex h-[22.5px] items-center gap-[5px] rounded-full px-[9px] text-[11px] leading-[16.5px] font-bold whitespace-nowrap">
    {s.emoji ? <span aria-hidden="true" className="text-[10px] leading-[15px]">{s.emoji}</span>
      : <span aria-hidden="true" className="relative size-[10px] shrink-0"><img src={s.icon} width="10" height="10" alt="" className="absolute inset-0 rotate-[109.02deg] motion-safe:animate-spin" /></span>}
    {s.label}
  </span>
}

function CategoryChip({ category }: { category: KnowledgeCategory | null }) {
  const style = categoryStyle(category)
  return <span style={{ backgroundColor: style.background, color: style.color }} className="inline-block rounded-full px-2 text-[11px] leading-[16.5px] font-semibold whitespace-nowrap">{category?.name ?? 'Uncategorised'}</span>
}

function TypeChip({ extension }: { extension: string }) {
  return <span className="inline-block rounded-[5px] border-[1.111px] border-[#e5e8f0] bg-[#f7f8fc] px-[6px] font-mono text-[10px] leading-[15px] font-bold text-[#68728a] uppercase">{extension || '—'}</span>
}

export default function KnowledgeBaseContent({ onDrawerChange }: { onDrawerChange: (open: boolean) => void }) {
  const [filters, setFilters] = useState<KnowledgeFilters>(emptyFilters)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; data?: DocumentPage; error?: string } | null>(null)
  const [stats, setStats] = useState<{ data?: KnowledgeStatistics; error?: string } | null>(null)
  const [categories, setCategories] = useState<KnowledgeCategory[] | null>(null)
  const [categoryError, setCategoryError] = useState('')
  const [categoryVersion, setCategoryVersion] = useState(0)
  const reloadCategories = () => setCategoryVersion(previous => previous + 1)
  const [drawer, setDrawer] = useState<{ document?: KnowledgeDocument } | null>(null)
  const [replacing, setReplacing] = useState<KnowledgeDocument | null>(null)
  const [viewing, setViewing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<KnowledgeDocument | null>(null)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [acting, setActing] = useState(false)
  const lock = useRef(false)

  // Debounce the search box so typing does not send a request per key.
  useEffect(() => {
    if (query === filters.query) return
    const timer = window.setTimeout(() => { setFilters(previous => ({ ...previous, query })); setPage(1) }, 300)
    return () => window.clearTimeout(timer)
  }, [query, filters.query])

  const key = JSON.stringify([filters, page])
  const current = result?.key === key ? result : null
  const loading = !current
  const rows = useMemo(() => current?.data?.rows ?? [], [current])

  useEffect(() => {
    const controller = new AbortController()
    getKnowledgeDocuments(filters, page, PAGE_SIZE, controller.signal)
      .then(data => { if (!controller.signal.aborted) setResult({ key: JSON.stringify([filters, page]), data }) })
      .catch(error => { if (!controller.signal.aborted) setResult({ key: JSON.stringify([filters, page]), error: describe(error) }) })
    getKnowledgeStatistics(controller.signal)
      .then(data => { if (!controller.signal.aborted) setStats({ data }) })
      .catch(error => { if (!controller.signal.aborted) setStats({ error: describe(error) }) })
    return () => controller.abort()
  }, [filters, page, version])

  useEffect(() => {
    const controller = new AbortController()
    getKnowledgeCategories(controller.signal)
      .then(data => { if (!controller.signal.aborted) { setCategories(data); setCategoryError('') } })
      .catch(error => { if (!controller.signal.aborted) setCategoryError(describe(error)) })
    return () => controller.abort()
  }, [categoryVersion])

  const busy = rows.some(row => isInProgress(row.processingStatus)) || (stats?.data?.processing ?? 0) > 0
  useEffect(() => {
    if (!busy) return
    const timer = window.setTimeout(() => setVersion(previous => previous + 1), POLL_MS)
    return () => window.clearTimeout(timer)
  }, [busy, version])

  const refresh = () => setVersion(previous => previous + 1)
  const dismiss = useCallback(() => setMessage(''), [])
  function openDrawer(next: { document?: KnowledgeDocument } | null) { setDrawer(next); onDrawerChange(!!next) }
  function change<K extends keyof KnowledgeFilters>(field: K, value: KnowledgeFilters[K]) { setFilters(previous => ({ ...previous, [field]: value })); setPage(1) }

  async function act(run: () => Promise<unknown>, success: string) {
    if (lock.current) return
    lock.current = true; setActing(true); setActionError('')
    try { await run(); if (success) setMessage(success); refresh() } catch (error) { setActionError(describe(error)) } finally { lock.current = false; setActing(false) }
  }

  const total = current?.data?.totalElements ?? 0
  const pageCount = Math.max(1, current?.data?.totalPages ?? 1)
  const filtering = !!(filters.query.trim() || filters.categoryId || filters.academicYear || filters.status)
  const statValue = (value: number | undefined) => stats?.data ? value : null
  const categoryOptions = (categories ?? []).filter(category => category.isActive || category.id === filters.categoryId).map(category => ({ value: category.id, label: category.name }))

  return <main className="min-w-0 text-[#17213c]">
    <PageHeader title="AI Knowledge Base" description="Manage official university information used by the AI Student Assistant"
      actions={<button type="button" onClick={() => openDrawer({})} disabled={!!drawer} className={primaryButton}><img src="/assets/figma/ai-upload.svg" width="15" height="15" alt="" />Upload Document</button>}>
      <SummaryCards label="Knowledge document summary" error={stats?.error} onRetry={refresh} items={[
        { label: 'Total Documents', value: statValue(stats?.data?.total), tone: 'neutral' },
        { label: 'Ready', value: statValue(stats?.data?.ready), tone: 'green' },
        { label: 'Processing', value: statValue(stats?.data?.processing), tone: 'amber' },
        { label: 'Failed', value: statValue(stats?.data?.failed), tone: 'red' },
      ]} />
    </PageHeader>
    <div className="flex flex-wrap items-center gap-2.5 border-b-[1.111px] border-[#e5e8f0] bg-white px-4 py-3 sm:px-6">
      <SearchInput label="Search documents" placeholder="Search documents…" value={query} onChange={setQuery} className="sm:w-[240px]" />
      <FilterSelect label="Category" allLabel="All Categories" value={filters.categoryId} onChange={value => change('categoryId', value)} options={categoryOptions} className="sm:min-w-[183px]" />
      <FilterSelect label="Academic year" allLabel="All Years" value={filters.academicYear} onChange={value => change('academicYear', value)} options={academicYearOptions()} />
      <FilterSelect label="AI status" allLabel="All Statuses" value={filters.status} onChange={value => change('status', value as ProcessingStatus | '')} options={statusOptions} />
      <p className="text-[13px] leading-[19.5px] text-[#68728a] sm:ml-auto">{loading || current.error ? '—' : `${total} ${total === 1 ? 'document' : 'documents'}`}</p>
    </div>
    <section aria-label="Knowledge documents" className="px-4 pt-4 pb-6 sm:px-6">
      {categoryError && <p role="alert" className="mb-3 text-[13px] text-[#68728a]">Categories could not be loaded. {categoryError} <button type="button" onClick={reloadCategories} className="underline">Retry</button></p>}
      {actionError && <p role="alert" className="mb-3 text-[13px] text-[#d80255]">{actionError} <button type="button" onClick={() => setActionError('')} className="underline">Dismiss</button></p>}
      <CampusTable label="Knowledge documents table" caption="Row numbers, document names, categories, academic years, file types, uploaders, upload dates, AI processing status and actions" minWidth={1180}
        headers={['No.', 'Document Name', 'Category', 'Acad. Year', 'Type', 'Uploaded By', 'Date', 'AI Status', 'Actions']}
        state={<TableState loading={loading} error={current?.error} empty={!rows.length} loadingText="Loading knowledge documents…" onRetry={refresh}
          emptyText={filtering ? 'No documents match your search and filters.' : categories?.length === 0 ? 'No document categories exist yet. Create a category first (see the note in Upload Document), then upload the first document.' : 'No documents yet. Upload the first official document for the AI Student Assistant.'} />}>
        {rows.map((document, index) => <tr key={document.id} className="align-middle">
          <td className={cell}><SerialChip value={(page - 1) * PAGE_SIZE + index + 1} /></td>
          <th scope="row" className={`${cell} font-normal`}><div className="flex items-center gap-[9px]">
            <span aria-hidden="true" className="text-[18px] leading-[27px]">{categoryStyle(document.category).emoji}</span>
            <span className="min-w-0"><span className="block text-[13px] leading-[19.5px] font-semibold text-[#17213c]">{document.title}</span>
              {!document.isActive && <span className="block pt-[4.8px] text-[10px] leading-[15px] font-medium text-[#9ca3af]">⛔ Inactive</span>}</span>
          </div></th>
          <td className={cell}><CategoryChip category={document.category} /></td>
          <td className={`${cell} font-mono text-xs leading-[18px] whitespace-nowrap text-[#68728a]`}>{displayYear(document.academicYearLabel)}</td>
          <td className={cell}><TypeChip extension={document.file?.extension ?? ''} /></td>
          <td className={`${cell} text-xs leading-[18px]`}>{document.uploadedBy ?? '—'}</td>
          <td className={`${cell} text-xs leading-[18px] whitespace-nowrap text-[#68728a]`}>{formatDay(document.uploadedAt)}</td>
          <td className={cell}><AiStatusBadge status={document.processingStatus} /></td>
          <td className={cell}><ActionMenu label={`Actions for ${document.title}`} disabled={!!drawer || acting} items={[
            { label: 'View details', onSelect: () => setViewing(document.id) },
            ...(document.isActive ? [
              { label: 'Edit details', onSelect: () => openDrawer({ document }) },
              { label: 'Replace file', onSelect: () => setReplacing(document) },
            ] : []),
            ...(document.file ? [{ label: 'Download', onSelect: () => { void act(() => downloadKnowledgeDocument(document), '') } }] : []),
            ...(document.isActive && document.processingStatus === 'FAILED' ? [{ label: 'Retry processing', onSelect: () => { void act(() => reprocessKnowledgeDocument(document.id, 'RESUME'), `${document.title} was queued for processing again.`) } }] : []),
            ...(document.isActive && document.processingStatus === 'READY' ? [{ label: 'Reprocess', onSelect: () => { void act(() => reprocessKnowledgeDocument(document.id, 'FULL'), `${document.title} was queued for a full reprocess.`) } }] : []),
            document.isActive
              ? { label: 'Deactivate', onSelect: () => { void act(() => setKnowledgeDocumentActive(document.id, false), `${document.title} is now inactive and hidden from the AI Student Assistant.`) } }
              : { label: 'Activate', onSelect: () => { void act(() => setKnowledgeDocumentActive(document.id, true), `${document.title} is active again.`) } },
            { label: 'Delete', danger: true, onSelect: () => setDeleting(document) },
          ]} /></td>
        </tr>)}
      </CampusTable>
      {total > 0 && <Pagination label="Knowledge document pagination" page={page} pageCount={pageCount} onPage={setPage} summary={`Showing ${(page - 1) * PAGE_SIZE + 1}–${(page - 1) * PAGE_SIZE + rows.length} of ${total}`} />}
    </section>
    {drawer && <KnowledgeDocumentForm key={drawer.document?.id ?? 'new'} document={drawer.document} categories={categories} categoryError={categoryError} onRetryCategories={reloadCategories} onClose={() => openDrawer(null)}
      onSaved={(title, operation) => { openDrawer(null); if (operation === 'uploaded') setPage(1); refresh(); setMessage(operation === 'uploaded' ? `${title} was uploaded successfully. AI processing has started.` : `${title} was updated successfully.`) }} />}
    {replacing && <ReplaceFileModal document={replacing} onClose={() => setReplacing(null)} onReplaced={() => { setMessage(`A new file for ${replacing.title} was uploaded successfully. AI processing has started.`); setReplacing(null); refresh() }} />}
    {viewing != null && <DetailsModal<{ document: KnowledgeDocument; processing: KnowledgeProcessing | null }> title="Document Details" describeError={describe}
      load={async signal => { const document = await getKnowledgeDocument(viewing, signal); const processing = await getKnowledgeProcessing(viewing, signal).catch(() => null); return { document, processing } }}
      onClose={() => setViewing(null)}
      onEdit={({ document }) => { setViewing(null); if (document.isActive) openDrawer({ document }) }}
      onDelete={({ document }) => { setViewing(null); setDeleting(document) }}
      rows={({ document: d, processing: p }) => [
        ['Title', d.title], ['Category', <CategoryChip key="category" category={d.category} />], ['Academic Year', displayYear(d.academicYearLabel)], ['Scope', scopeLabel(d)],
        ['Description', d.description || '—'],
        ['File', d.file ? `${d.file.originalFilename} (${formatSize(d.file.sizeBytes)}, revision ${d.file.revisionNumber})` : '—'],
        ['Uploaded', `${d.uploadedBy ?? '—'} · ${formatDateTime(d.uploadedAt)}`], ['Visibility', d.isActive ? 'Active (used by the AI Student Assistant)' : 'Inactive (hidden from the AI)'],
        ['AI Status', <AiStatusBadge key="status" status={p?.status ?? d.processingStatus} />],
        ...(p ? [
          ['Indexed', `${p.pageCount} pages · ${p.chunkCount} chunks · ${p.embeddedChunkCount} embedded${p.indexStale ? ' (index out of date)' : ''}`],
          ...(p.status === 'FAILED' ? [['Last error', `${p.failedStage ? `${p.failedStage}: ` : ''}${p.lastErrorMessage ?? p.message ?? 'Unknown error'}`]] : []),
          ...(!p.ingestionAvailable ? [['Processing', 'AI processing is turned off or not configured on the server.']] : []),
        ] as [string, string][] : []),
      ]} />}
    {deleting && <ConfirmDelete title="Delete document?" describeError={describe} onClose={() => setDeleting(null)} onConfirm={() => deleteKnowledgeDocument(deleting.id)}
      onDeleted={() => { setMessage(`${deleting.title} was deleted successfully.`); setDeleting(null); if (rows.length === 1 && page > 1) setPage(page - 1); refresh() }}>
      Delete <strong className="text-[#17213c]">{deleting.title}</strong>? The AI Student Assistant stops using it at once. To hide it only for now, choose Deactivate instead.
    </ConfirmDelete>}
    <SuccessToast message={message} onDismiss={dismiss} />
  </main>
}
