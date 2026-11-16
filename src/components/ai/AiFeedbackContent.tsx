import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, Download, History, MessageSquare, Search, ThumbsDown, ThumbsUp } from 'lucide-react'
import type { FeedbackFilters, FeedbackRecord, FeedbackStatistics, Page, Rating, ReviewStatus } from '../../types/aiAssistant'
import { exportFeedback, getFeedback, getFeedbackDetail, getFeedbackStatistics, reviewFeedback } from '../../services/aiAssistantService'
import { MAX_NOTE_CHARS, MAX_SEARCH_CHARS, assistantError, countLabel, dateRangeError, emptyFeedbackFilters, ratingOptions, reviewStatusOptions } from '../../utils/aiAssistant'
import { formatDateTime } from '../../utils/knowledgeBase'
import { TABLE_PAGE_SIZE } from '../../utils/pagination'
import Modal from '../ui/Modal'
import TablePagination from '../ui/TablePagination'
import { SerialChip, SuccessToast, TableState, primaryButton, secondaryButton } from '../campus/CampusUi'
import { AiPageHeader, ErrorAlert, RatingBadge, ReviewStatusBadge, SourceChips, card, control, headerButton, headerLink } from './AssistantUi'

// AI Feedback (sidebar: AI Management › AI Feedback), admin panel spec 44. The ratings Students gave to AI answers:
// GET /api/v1/admin/assistant/feedback (server-side search, filters and paging), /statistics for the four cards,
// /{id} for the complete question and answer, PATCH /{id}/review for the review and /export for the CSV.
const headers = ['No.', 'Submitted By', 'Question / Response', 'Rating', 'Comment', 'Submitted At', 'Review Status', 'Actions']
const cell = 'px-4 py-3 align-top'
const summaries: { label: string; field: keyof FeedbackStatistics; icon: typeof MessageSquare; style: string }[] = [
  { label: 'Total Feedback', field: 'total', icon: MessageSquare, style: 'bg-[#f0f1f3] text-[#273238]' },
  { label: 'Positive', field: 'positive', icon: ThumbsUp, style: 'bg-[#d1fae5] text-[#059669]' },
  { label: 'Negative', field: 'negative', icon: ThumbsDown, style: 'bg-[#fee2e2] text-[#dc2626]' },
  { label: 'Awaiting Review', field: 'awaitingReview', icon: ClipboardCheck, style: 'bg-[#fef3c7] text-[#d97706]' },
]

/** The complete question and answer of one feedback with the review form. */
function ReviewModal({ feedbackId, onClose, onSaved }: { feedbackId: string; onClose: () => void; onSaved: () => void }) {
  const [state, setState] = useState<{ data?: FeedbackRecord; error?: string } | null>(null)
  const [version, setVersion] = useState(0)
  const [status, setStatus] = useState<ReviewStatus>('REVIEWED')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const lock = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    getFeedbackDetail(feedbackId, controller.signal)
      .then(data => {
        if (controller.signal.aborted) return
        setState({ data })
        // A feedback that still awaits its review opens with "Reviewed" preselected.
        setStatus(data.reviewStatus === 'PENDING' ? 'REVIEWED' : data.reviewStatus); setNote(data.reviewNote ?? '')
      })
      .catch(error => { if (!controller.signal.aborted) setState({ error: assistantError(error, 'The feedback could not be loaded. Try again.') }) })
    return () => controller.abort()
  }, [feedbackId, version])

  async function save() {
    if (lock.current || note.length > MAX_NOTE_CHARS) return
    lock.current = true; setSaving(true); setSaveError('')
    try { await reviewFeedback(feedbackId, status, note); onSaved() }
    catch (error) { setSaveError(assistantError(error, 'The review could not be saved. Try again.')); lock.current = false; setSaving(false) }
  }

  const data = state?.data
  const label = 'text-[11px] leading-4 font-bold tracking-[0.06em] text-[#68728a] uppercase'
  const block = 'mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] p-3 text-[13px] leading-6 break-words whitespace-pre-wrap'
  return <Modal title="Review Feedback" onClose={onClose} dividedHeader width={620} busy={saving}>
    {!state ? <p role="status" className="py-10 text-center text-[13px] text-[#68728a]">Loading feedback…</p>
      : !data ? <ErrorAlert message={state.error ?? ''} onRetry={() => { setState(null); setVersion(previous => previous + 1) }} />
        : <form onSubmit={event => { event.preventDefault(); void save() }} className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs leading-5 text-[#68728a]">
            <span><span className="font-semibold text-[#17213c]">{data.student.fullName}</span> · <span className="font-mono">{data.student.studentCode}</span></span>
            <span>{formatDateTime(data.submittedAt)}</span><RatingBadge rating={data.rating} /><ReviewStatusBadge status={data.reviewStatus} />
          </div>
          {data.comment && <div><h3 className={label}>Student comment</h3><p className={block}>{data.comment}</p></div>}
          <div><h3 className={label}>Question</h3><p className={block}>{data.question ?? 'The question of this answer is no longer available.'}</p></div>
          <div><h3 className={label}>AI response</h3><p className={block}>{data.answer}</p><SourceChips sources={data.sources} />
            <p className="mt-2 text-xs leading-5 text-[#68728a]">{data.model ? <>Model <span className="font-mono text-[#17213c]">{data.model}</span> · </> : null}<Link to={`/admin/chat-history?conversation=${data.conversationId}`} className="rounded font-semibold text-[#273238] underline focus-visible:outline-2">Open the conversation in Chat History</Link></p></div>
          {data.reviewedAt && <p className="text-xs leading-5 text-[#68728a]">Last reviewed by {data.reviewedBy ?? 'an administrator'} on {formatDateTime(data.reviewedAt)}.</p>}
          <div className="border-t border-[#e5e8f0] pt-4">
            <label htmlFor="feedback-review-status" className="block text-xs font-semibold">Review status</label>
            <select id="feedback-review-status" value={status} onChange={event => setStatus(event.target.value as ReviewStatus)} className={`${control} mt-1.5 sm:w-56`}>{reviewStatusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
            <label htmlFor="feedback-review-note" className="mt-4 block text-xs font-semibold">Review note <span className="font-normal text-[#68728a]">(optional)</span></label>
            <textarea id="feedback-review-note" rows={3} value={note} onChange={event => setNote(event.target.value)} aria-describedby="feedback-review-note-help" aria-invalid={note.length > MAX_NOTE_CHARS || undefined} placeholder="What was checked or changed, for example the document that was updated…" className={`${control} mt-1.5 resize-y leading-5`} />
            <p id="feedback-review-note-help" className={`mt-1 text-right text-xs ${note.length > MAX_NOTE_CHARS ? 'text-[#b91c1c]' : 'text-[#68728a]'}`}>{note.length} / {MAX_NOTE_CHARS}</p>
          </div>
          <ErrorAlert message={saveError} />
          <div className="flex flex-wrap justify-end gap-3"><button type="button" onClick={onClose} disabled={saving} className={secondaryButton}>Cancel</button><button type="submit" disabled={saving || note.length > MAX_NOTE_CHARS} className={primaryButton}>{saving ? 'Saving…' : 'Save Review'}</button></div>
        </form>}
  </Modal>
}

export default function AiFeedbackContent() {
  const [filters, setFilters] = useState<FeedbackFilters>(emptyFeedbackFilters)
  const [query, setQuery] = useState('')
  const [dates, setDates] = useState({ from: '', to: '' })
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; data?: Page<FeedbackRecord>; error?: string } | null>(null)
  const [stats, setStats] = useState<{ data?: FeedbackStatistics; error?: string } | null>(null)
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [message, setMessage] = useState('')

  // Debounce the search box so typing does not send a request per key.
  useEffect(() => {
    if (query === filters.query) return
    const timer = window.setTimeout(() => { setFilters(previous => ({ ...previous, query })); setPage(1) }, 300)
    return () => window.clearTimeout(timer)
  }, [query, filters.query])

  const key = JSON.stringify([filters, page])
  useEffect(() => {
    const controller = new AbortController()
    const requestKey = JSON.stringify([filters, page])
    getFeedback(filters, page, TABLE_PAGE_SIZE, controller.signal)
      .then(data => { if (!controller.signal.aborted) setResult({ key: requestKey, data }) })
      .catch(error => { if (!controller.signal.aborted) setResult({ key: requestKey, error: assistantError(error, 'AI feedback could not be loaded. Try again.') }) })
    getFeedbackStatistics(controller.signal)
      .then(data => { if (!controller.signal.aborted) setStats({ data }) })
      .catch(error => { if (!controller.signal.aborted) setStats({ error: assistantError(error) }) })
    return () => controller.abort()
  }, [filters, page, version])

  const current = result?.key === key ? result : null
  const rows = current?.data?.rows ?? []
  const total = current?.data?.totalElements ?? 0
  const rangeError = dateRangeError(dates.from, dates.to)
  const filtering = !!(filters.query.trim() || filters.rating || filters.reviewStatus || filters.from || filters.to)
  const refresh = () => setVersion(previous => previous + 1)
  const dismiss = useCallback(() => setMessage(''), [])

  function change<K extends keyof FeedbackFilters>(field: K, value: FeedbackFilters[K]) { setFilters(previous => ({ ...previous, [field]: value })); setPage(1) }
  // A date range is applied only when it is valid; an invalid one keeps the last list and shows the reason.
  function changeDates(next: { from: string; to: string }) {
    setDates(next)
    if (dateRangeError(next.from, next.to)) return
    setFilters(previous => ({ ...previous, ...next })); setPage(1)
  }
  async function exportList() {
    if (exporting) return
    setExporting(true); setExportError('')
    try { await exportFeedback(filters); setMessage('AI feedback was exported successfully.') }
    catch (error) { setExportError(assistantError(error, 'AI feedback could not be exported. Try again.')) }
    finally { setExporting(false) }
  }

  return <main className="min-w-0 px-4 py-6 text-[#17213c] sm:px-7">
    <AiPageHeader title="AI Feedback" description="Review the feedback students gave on AI answers and identify responses that need attention.">
      <Link to="/admin/chat-history" className={headerLink}><History size={15} aria-hidden="true" />Chat History</Link>
      <button type="button" onClick={() => { void exportList() }} disabled={exporting || !current?.data || !total} className={headerButton}><Download size={15} aria-hidden="true" />{exporting ? 'Exporting…' : 'Export Feedback'}</button>
    </AiPageHeader>
    <dl aria-label="AI feedback summary" className="mt-5 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">{summaries.map(({ label, field, icon: Icon, style }) => <div key={label} className={`flex items-center gap-3 p-4 ${card}`}><span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${style}`}><Icon size={18} /></span><div className="flex flex-col"><dt className="order-2 text-xs text-[#68728a]">{label}</dt><dd className="order-1 font-display text-[23px] font-extrabold">{stats?.data ? stats.data[field] : <span aria-label="Not available">—</span>}</dd></div></div>)}</dl>
    {stats?.error && <p role="alert" className="mt-2 text-xs text-[#68728a]">Statistics could not be loaded. {stats.error} <button type="button" onClick={refresh} className="rounded px-1 underline focus-visible:outline-2">Retry</button></p>}
    <ErrorAlert message={exportError} onDismiss={() => setExportError('')} className="mt-5" />
    <fieldset className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1fr)_140px_160px_160px_160px]"><legend className="sr-only">Filter AI feedback</legend>
      <label className="block text-xs font-medium text-[#68728a]">Search feedback<div className="relative mt-1"><Search size={15} aria-hidden="true" className="pointer-events-none absolute top-3 left-3.5 text-[#8791a8]" /><input type="search" value={query} maxLength={MAX_SEARCH_CHARS} onChange={event => setQuery(event.target.value)} placeholder="Student, question, answer or comment…" className={`${control} pl-10`} /></div></label>
      <label className="block text-xs font-medium text-[#68728a]">Rating<select value={filters.rating} onChange={event => change('rating', event.target.value as Rating | '')} className={`${control} mt-1`}><option value="">All Ratings</option>{ratingOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <label className="block text-xs font-medium text-[#68728a]">Review status<select value={filters.reviewStatus} onChange={event => change('reviewStatus', event.target.value as ReviewStatus | '')} className={`${control} mt-1`}><option value="">All Statuses</option>{reviewStatusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <label className="block text-xs font-medium text-[#68728a]">From date<input type="date" value={dates.from} max={dates.to || undefined} onChange={event => changeDates({ ...dates, from: event.target.value })} aria-invalid={!!rangeError || undefined} aria-describedby={rangeError ? 'feedback-range-error' : undefined} className={`${control} mt-1`} /></label>
      <label className="block text-xs font-medium text-[#68728a]">To date<input type="date" value={dates.to} min={dates.from || undefined} onChange={event => changeDates({ ...dates, to: event.target.value })} aria-invalid={!!rangeError || undefined} aria-describedby={rangeError ? 'feedback-range-error' : undefined} className={`${control} mt-1`} /></label>
    </fieldset>
    {rangeError && <p id="feedback-range-error" role="alert" className="mt-2 text-xs text-[#b91c1c]">{rangeError}</p>}
    <section aria-labelledby="feedback-list-title" className={`mt-5 overflow-hidden ${card}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e8f0] px-5 py-4"><h2 id="feedback-list-title" className="text-sm font-semibold">Feedback Reviews</h2><span className="text-xs text-[#68728a]">{current?.data ? countLabel(total, 'feedback record') : '—'}</span></header>
      <div role="region" aria-label="AI feedback table" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
        <table className="w-full min-w-[1120px] text-left text-[13px]"><caption className="sr-only">Row numbers, feedback contributors, questions and responses, ratings, comments, submission dates, review statuses and actions</caption>
          <thead className="border-b border-[#e5e8f0] bg-[#f7f8fc] text-[10px] tracking-wide text-[#68728a] uppercase"><tr>{headers.map(label => <th key={label} scope="col" className="px-4 py-4 font-semibold whitespace-nowrap">{label}</th>)}</tr></thead>
          <tbody className="[&>tr]:border-b [&>tr]:border-[#e5e8f0] [&>tr:last-child]:border-b-0">
            {rows.map((row, index) => <tr key={row.id}>
              <td className={cell}><SerialChip value={(page - 1) * TABLE_PAGE_SIZE + index + 1} /></td>
              <th scope="row" className={`${cell} font-normal`}><span className="block text-[13px] leading-5 font-semibold">{row.student.fullName}</span><span className="block font-mono text-xs leading-5 text-[#68728a]">{row.student.studentCode}</span></th>
              <td className={`${cell} max-w-[320px]`}><span className="line-clamp-2 block text-[13px] leading-5 font-semibold break-words">{row.question ?? '—'}</span><span className="mt-0.5 line-clamp-2 block text-xs leading-5 break-words text-[#68728a]">{row.answer}</span></td>
              <td className={cell}><RatingBadge rating={row.rating} /></td>
              <td className={`${cell} max-w-[220px] text-xs leading-5 text-[#68728a]`}><span className="line-clamp-3 break-words">{row.comment || '—'}</span></td>
              <td className={`${cell} text-xs leading-5 whitespace-nowrap text-[#68728a]`}>{formatDateTime(row.submittedAt)}</td>
              <td className={cell}><ReviewStatusBadge status={row.reviewStatus} /></td>
              <td className={cell}><button type="button" onClick={() => setReviewing(row.id)} aria-label={`Review feedback from ${row.student.fullName}`} className="rounded-lg border border-[#e5e8f0] px-3 py-1.5 text-xs font-semibold hover:bg-[#f7f8fc] focus-visible:outline-2">{row.reviewStatus === 'PENDING' ? 'Review' : 'View'}</button></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <TableState loading={!current} error={current?.error} empty={!rows.length} loadingText="Loading AI feedback…" onRetry={refresh}
        emptyText={filtering ? 'No feedback matches your search and filters.' : 'No feedback yet. Feedback appears here when students rate an answer of the AI Student Assistant.'} />
    </section>
    <TablePagination label="AI feedback pagination" noun="feedback records" paging={{ page, pageCount: Math.max(1, current?.data?.totalPages ?? 1), offset: (page - 1) * TABLE_PAGE_SIZE, total, rows, setPage }} />
    <p className="mt-4 text-xs leading-5 text-[#68728a]">Each row is one rating a student gave to one AI answer. When a student changes a rating, it goes back to Awaiting Review. Feedback of a conversation the student deletes is removed.</p>
    {reviewing && <ReviewModal key={reviewing} feedbackId={reviewing} onClose={() => setReviewing(null)} onSaved={() => { setReviewing(null); setMessage('Feedback review saved.'); refresh() }} />}
    <SuccessToast message={message} onDismiss={dismiss} />
  </main>
}
