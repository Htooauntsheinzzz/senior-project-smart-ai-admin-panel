import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bot, Download, MessageSquare, Search } from 'lucide-react'
import type { ConversationDetail, ConversationSummary, HistoryFilters, Page } from '../../types/aiAssistant'
import { exportConversations, getConversation, getConversations, isConversationId } from '../../services/aiAssistantService'
import { MAX_SEARCH_CHARS, assistantError, countLabel, dateRangeError, emptyHistoryFilters } from '../../utils/aiAssistant'
import { formatDateTime } from '../../utils/knowledgeBase'
import TablePagination from '../ui/TablePagination'
import { SerialChip, SuccessToast, TableState } from '../campus/CampusUi'
import { AiPageHeader, EmptyPanel, ErrorAlert, MessageBubble, RatingBadge, SourceChips, card, control, headerButton, headerLink } from './AssistantUi'

// Chat History (sidebar: AI Management › Chat History), admin panel spec 43. The conversations of all Students with the
// AI Student Assistant: GET /api/v1/admin/assistant/conversations (server-side search, date filter and paging),
// /{conversationId} for the transcript and /export for the CSV. Read-only: an Admin cannot change or delete a
// conversation. ?conversation=<id> opens one transcript directly (the link AI Feedback uses).
// Hsu, 2026-11-13: this table shows 3 conversations per page (its rows are tall and the transcript sits beside it);
// the other admin tables keep TABLE_PAGE_SIZE.
const PAGE_SIZE = 3
const headers = ['No.', 'Conversation', 'Participant', 'Messages', 'Last Activity']
const cell = 'px-3 py-3 align-top'

function Transcript({ conversationId, onClose }: { conversationId: string; onClose: () => void }) {
  const [state, setState] = useState<{ id: string; data?: ConversationDetail; error?: string } | null>(null)
  const [version, setVersion] = useState(0)
  const [earlier, setEarlier] = useState({ loading: false, error: '' })
  const lock = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    getConversation(conversationId, undefined, controller.signal)
      .then(data => { if (!controller.signal.aborted) setState({ id: conversationId, data }) })
      .catch(error => { if (!controller.signal.aborted) setState({ id: conversationId, error: assistantError(error, 'The transcript could not be loaded. Try again.') }) })
    return () => controller.abort()
  }, [conversationId, version])

  const current = state?.id === conversationId ? state : null
  const detail = current?.data

  async function loadEarlier() {
    if (!detail?.messages.length || lock.current) return
    lock.current = true; setEarlier({ loading: true, error: '' })
    try {
      const older = await getConversation(detail.conversationId, detail.messages[0].messageId)
      setState(previous => previous?.id === detail.conversationId && previous.data
        ? { id: previous.id, data: { ...previous.data, hasMoreBefore: older.hasMoreBefore, messages: [...older.messages, ...previous.data.messages] } } : previous)
      setEarlier({ loading: false, error: '' })
    } catch (error) {
      setEarlier({ loading: false, error: assistantError(error, 'Earlier messages could not be loaded. Try again.') })
    } finally { lock.current = false }
  }

  if (!current) return <p role="status" className="px-6 py-16 text-center text-[13px] text-[#68728a]">Loading transcript…</p>
  if (!detail) return <div className="p-5"><ErrorAlert message={current.error ?? ''} onRetry={() => { setState(null); setVersion(previous => previous + 1) }} /><button type="button" onClick={onClose} className="mt-3 rounded text-xs font-semibold underline focus-visible:outline-2">Close transcript</button></div>
  return <>
    <div className="border-b border-[#e5e8f0] px-5 py-4">
      <h3 className="text-[13px] leading-5 font-semibold break-words">{detail.title}</h3>
      <p className="mt-1 text-xs leading-5 text-[#68728a]">{detail.student.fullName} · <span className="font-mono">{detail.student.studentCode}</span> · {countLabel(detail.messageCount, 'message')}</p>
      <p className="text-xs leading-5 text-[#68728a]">Started {formatDateTime(detail.createdAt)} · Last activity {formatDateTime(detail.updatedAt)}</p>
    </div>
    <div role="region" aria-label="Transcript messages" tabIndex={0} className="max-h-[560px] overflow-y-auto p-5 focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
      {detail.hasMoreBefore && <div className="mb-4 text-center"><button type="button" onClick={() => { void loadEarlier() }} disabled={earlier.loading} className="rounded-xl border border-[#e5e8f0] px-4 py-2 text-xs font-semibold hover:bg-[#f7f8fc] focus-visible:outline-2 disabled:opacity-50">{earlier.loading ? 'Loading…' : 'Load earlier messages'}</button></div>}
      <ErrorAlert message={earlier.error} className="mb-4" />
      {!detail.messages.length ? <p role="status" className="py-10 text-center text-[13px] text-[#68728a]">This conversation has no messages.</p>
        : <ul className="space-y-4">{detail.messages.map(message => <MessageBubble key={message.messageId} role={message.role} author={message.role === 'USER' ? detail.student.fullName : 'AI Assistant'} time={formatDateTime(message.createdAt)}
          footer={(message.sources.length > 0 || message.feedback) && <>
            <SourceChips sources={message.sources} />
            {message.feedback && <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px] leading-4 text-[#68728a]"><span>Student feedback:</span><RatingBadge rating={message.feedback.rating} />{message.feedback.comment && <span className="break-words">“{message.feedback.comment}”</span>}</p>}
          </>}>{message.content}</MessageBubble>)}</ul>}
    </div>
  </>
}

export default function ChatHistoryContent() {
  const [searchParams, setSearchParams] = useSearchParams()
  const linked = searchParams.get('conversation') ?? ''
  const selected = isConversationId(linked) ? linked.toLowerCase() : null
  const [filters, setFilters] = useState<HistoryFilters>(emptyHistoryFilters)
  const [query, setQuery] = useState('')
  const [dates, setDates] = useState({ from: '', to: '' })
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; data?: Page<ConversationSummary>; error?: string } | null>(null)
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
    getConversations(filters, page, PAGE_SIZE, controller.signal)
      .then(data => { if (!controller.signal.aborted) setResult({ key: requestKey, data }) })
      .catch(error => { if (!controller.signal.aborted) setResult({ key: requestKey, error: assistantError(error, 'Chat history could not be loaded. Try again.') }) })
    return () => controller.abort()
  }, [filters, page, version])

  const current = result?.key === key ? result : null
  const rows = current?.data?.rows ?? []
  const total = current?.data?.totalElements ?? 0
  const rangeError = dateRangeError(dates.from, dates.to)
  const filtering = !!(filters.query.trim() || filters.from || filters.to)
  const dismiss = useCallback(() => setMessage(''), [])

  // A date range is applied only when it is valid; an invalid one keeps the last list and shows the reason.
  function changeDates(next: { from: string; to: string }) {
    setDates(next)
    if (dateRangeError(next.from, next.to)) return
    setFilters(previous => ({ ...previous, ...next })); setPage(1)
  }
  function select(conversationId: string | null) {
    setSearchParams(previous => { const next = new URLSearchParams(previous); if (conversationId) next.set('conversation', conversationId); else next.delete('conversation'); return next }, { replace: true })
  }
  async function exportHistory() {
    if (exporting) return
    setExporting(true); setExportError('')
    try { await exportConversations(filters); setMessage('Chat history was exported successfully.') }
    catch (error) { setExportError(assistantError(error, 'Chat history could not be exported. Try again.')) }
    finally { setExporting(false) }
  }

  return <main className="min-w-0 px-4 py-6 text-[#17213c] sm:px-7">
    <AiPageHeader title="Chat History" description="Review the conversations students had with the AI Student Assistant and their message transcripts.">
      <Link to="/admin/ai-assistant" className={headerLink}><Bot size={15} aria-hidden="true" />Open AI Assistant</Link>
      <button type="button" onClick={() => { void exportHistory() }} disabled={exporting || !current?.data || !total} className={headerButton}><Download size={15} aria-hidden="true" />{exporting ? 'Exporting…' : 'Export History'}</button>
    </AiPageHeader>
    <ErrorAlert message={exportError} onDismiss={() => setExportError('')} className="mt-5" />
    <fieldset className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_180px_180px]"><legend className="sr-only">Filter chat history</legend>
      <label className="block text-xs font-medium text-[#68728a]">Search conversations<div className="relative mt-1"><Search size={15} aria-hidden="true" className="pointer-events-none absolute top-3 left-3.5 text-[#8791a8]" /><input type="search" value={query} maxLength={MAX_SEARCH_CHARS} onChange={event => setQuery(event.target.value)} placeholder="Title, student or message text…" className={`${control} pl-10`} /></div></label>
      <label className="block text-xs font-medium text-[#68728a]">From date<input type="date" value={dates.from} max={dates.to || undefined} onChange={event => changeDates({ ...dates, from: event.target.value })} aria-invalid={!!rangeError || undefined} aria-describedby={rangeError ? 'history-range-error' : undefined} className={`${control} mt-1`} /></label>
      <label className="block text-xs font-medium text-[#68728a]">To date<input type="date" value={dates.to} min={dates.from || undefined} onChange={event => changeDates({ ...dates, to: event.target.value })} aria-invalid={!!rangeError || undefined} aria-describedby={rangeError ? 'history-range-error' : undefined} className={`${control} mt-1`} /></label>
    </fieldset>
    {rangeError && <p id="history-range-error" role="alert" className="mt-2 text-xs text-[#b91c1c]">{rangeError}</p>}
    <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <section aria-labelledby="conversation-history-title" className={`overflow-hidden ${card}`}>
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e8f0] px-5 py-4"><h2 id="conversation-history-title" className="text-sm font-semibold">Conversations</h2><span className="text-xs text-[#68728a]">{current?.data ? countLabel(total, 'conversation') : '—'}</span></header>
          <div role="region" aria-label="Conversation history table" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
            <table className="w-full min-w-[600px] text-left text-[13px]"><caption className="sr-only">Row numbers, conversation titles, participants, message counts and last activity. Choose a conversation to read its transcript.</caption>
              <thead className="border-b border-[#e5e8f0] bg-[#f7f8fc] text-[10px] tracking-wide text-[#68728a] uppercase"><tr>{headers.map(label => <th key={label} scope="col" className="px-3 py-4 font-semibold whitespace-nowrap">{label}</th>)}</tr></thead>
              <tbody className="[&>tr]:border-b [&>tr]:border-[#e5e8f0] [&>tr:last-child]:border-b-0">
                {rows.map((row, index) => {
                  const active = row.conversationId === selected
                  return <tr key={row.conversationId} aria-selected={active} className={active ? 'bg-[#ede9fe]/50' : 'hover:bg-[#f7f8fc]'}>
                    <td className={cell}><SerialChip value={(page - 1) * PAGE_SIZE + index + 1} /></td>
                    <th scope="row" className={`${cell} max-w-[240px] font-normal`}>
                      <button type="button" onClick={() => select(row.conversationId)} aria-pressed={active} aria-label={`Open transcript: ${row.title}`} className="block max-w-full rounded text-left text-[13px] leading-5 font-semibold break-words underline-offset-2 hover:underline focus-visible:outline-2">{row.title}</button>
                      {row.lastMessagePreview && <span className="mt-0.5 line-clamp-2 block text-xs leading-5 break-words text-[#68728a]">{row.lastMessagePreview}</span>}
                    </th>
                    <td className={cell}><span className="block text-[13px] leading-5">{row.student.fullName}</span><span className="block font-mono text-xs leading-5 text-[#68728a]">{row.student.studentCode}</span></td>
                    <td className={`${cell} tabular-nums`}>{row.messageCount}</td>
                    <td className={`${cell} text-xs leading-5 whitespace-nowrap text-[#68728a]`}>{formatDateTime(row.updatedAt)}</td>
                  </tr>
                })}
              </tbody>
            </table>
          </div>
          <TableState loading={!current} error={current?.error} empty={!rows.length} loadingText="Loading conversations…" onRetry={() => setVersion(previous => previous + 1)}
            emptyText={filtering ? 'No conversations match your search and dates.' : 'No student has chatted with the AI Student Assistant yet.'} />
        </section>
        <TablePagination label="Conversation pagination" noun="conversations" paging={{ page, pageCount: Math.max(1, current?.data?.totalPages ?? 1), offset: (page - 1) * PAGE_SIZE, total, rows, setPage }} />
      </div>
      <section aria-labelledby="history-transcript-title" className={`min-w-0 overflow-hidden ${card}`}>
        <header className="flex items-center justify-between gap-3 border-b border-[#e5e8f0] px-5 py-4"><h2 id="history-transcript-title" className="text-sm font-semibold">Message Transcript</h2>{selected && <button type="button" onClick={() => select(null)} className="rounded text-xs font-semibold text-[#68728a] underline-offset-2 hover:underline focus-visible:outline-2">Close</button>}</header>
        {selected ? <Transcript key={selected} conversationId={selected} onClose={() => select(null)} />
          : <EmptyPanel minHeight="min-h-[350px]" icon={<MessageSquare size={32} aria-hidden="true" className="mb-3 text-[#8791a8]" />} title="No conversation selected">Choose a conversation in the list to read its messages, the sources of each answer and the feedback the student gave.</EmptyPanel>}
      </section>
    </div>
    <p className="mt-4 text-xs leading-5 text-[#68728a]">Only student conversations are recorded. Chats in AI Assistant and tests in Test AI Knowledge are not saved and do not appear here. A conversation a student deletes is removed from this list.</p>
    <SuccessToast message={message} onDismiss={dismiss} />
  </main>
}
