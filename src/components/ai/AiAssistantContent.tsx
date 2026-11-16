import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Bot, History, MessageSquarePlus, Play, RotateCcw, Send } from 'lucide-react'
import type { AssistantAnswer, ChatRole } from '../../types/aiAssistant'
import { sendAssistantMessage } from '../../services/aiAssistantService'
import { MAX_MESSAGE_CHARS, assistantError, countLabel, sourceDocuments } from '../../utils/aiAssistant'
import { formatDateTime } from '../../utils/knowledgeBase'
import { AiPageHeader, EmptyPanel, ErrorAlert, MessageBubble, Notice, SourceChips, card, headerButton, outlineButton } from './AssistantUi'

// AI Assistant (sidebar: AI Management › AI Assistant), admin panel spec 41. The Admin chats with the assistant to
// check its answers: POST /api/v1/admin/assistant/chat answers from the Ready knowledge documents. The conversation
// lives only in this screen; the earlier turns are sent back with each message and nothing is stored on the server.
interface Turn { key: number; role: ChatRole; content: string; at: string; answer?: AssistantAnswer }

export default function AiAssistantContent() {
  const [message, setMessage] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const composer = useRef<HTMLTextAreaElement>(null)
  const log = useRef<HTMLDivElement>(null)
  const request = useRef<AbortController | null>(null)
  const nextKey = useRef(0)

  useEffect(() => () => request.current?.abort(), [])
  // Keep the newest message in view.
  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight }, [turns, sending])

  const draft = message.trim()
  const tooLong = message.length > MAX_MESSAGE_CHARS

  async function send() {
    if (!draft || tooLong || request.current) return
    const earlier = turns.map(({ role, content }) => ({ role, content }))
    const controller = new AbortController()
    request.current = controller
    setTurns(previous => [...previous, { key: nextKey.current++, role: 'USER', content: draft, at: new Date().toISOString() }])
    setMessage(''); setError(''); setSending(true)
    try {
      const answer = await sendAssistantMessage(draft, earlier, controller.signal)
      if (controller.signal.aborted) return
      setTurns(previous => [...previous, { key: nextKey.current++, role: 'ASSISTANT', content: answer.message, at: answer.createdAt ?? new Date().toISOString(), answer }])
    } catch (failure) {
      if (controller.signal.aborted) return
      // The question goes back into the composer so it can be sent again.
      setTurns(previous => previous.slice(0, -1))
      setMessage(draft)
      setError(assistantError(failure, 'The assistant could not answer. Try again.'))
    } finally {
      if (request.current === controller) { request.current = null; setSending(false); composer.current?.focus() }
    }
  }

  function newChat() {
    request.current?.abort()
    request.current = null
    setTurns([]); setError(''); setSending(false)
    composer.current?.focus()
  }

  return <main className="min-w-0 px-4 py-6 text-[#17213c] sm:px-7">
    <AiPageHeader title="AI Assistant" description="Ask the assistant about university information and check the answers students would get from the knowledge base.">
      <button type="button" onClick={newChat} disabled={!turns.length && !sending} className={outlineButton}><MessageSquarePlus size={15} aria-hidden="true" />New Chat</button>
    </AiPageHeader>
    <Notice title="Test chat with the knowledge base">Answers come from the documents whose AI Status is Ready in AI Knowledge Base. This chat is not saved and does not appear in Chat History. Student records such as grades, enrollments and schedules are not available here.</Notice>
    <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
      <section aria-labelledby="assistant-conversation-title" className={`min-w-0 overflow-hidden ${card}`}>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e8f0] px-5 py-4"><h2 id="assistant-conversation-title" className="inline-flex items-center gap-2 text-sm font-semibold"><Bot size={18} aria-hidden="true" />Conversation</h2><span className="text-xs text-[#68728a]">{turns.length ? countLabel(turns.length, 'message') : 'No messages yet'}</span></header>
        <div ref={log} role="log" aria-live="polite" aria-label="Conversation messages" tabIndex={0} className="max-h-[520px] min-h-[300px] overflow-y-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
          {!turns.length && !sending ? <EmptyPanel icon={<span className="mb-4 rounded-2xl bg-[#ede9fe] p-4 text-[#7c3aed]"><Bot size={32} aria-hidden="true" /></span>} title="Start a conversation">Ask a question about regulations, fees, the academic calendar, registration or campus services. The assistant answers from the uploaded knowledge documents and names its sources.</EmptyPanel>
            : <ul className="space-y-4 p-5">
              {turns.map(turn => <MessageBubble key={turn.key} role={turn.role} author={turn.role === 'USER' ? 'You' : 'AI Assistant'} time={formatDateTime(turn.at)}
                footer={turn.answer && (turn.answer.passages.length
                  ? <SourceChips sources={sourceDocuments(turn.answer.passages).map(passage => ({ title: passage.title, academicYear: passage.academicYear, category: passage.category }))} />
                  : <p className="mt-1.5 text-[11px] leading-4 text-[#68728a]">No knowledge document matched this message.</p>)}>{turn.content}</MessageBubble>)}
              {sending && <MessageBubble role="ASSISTANT" author="AI Assistant"><span role="status" className="text-[#68728a]">Searching the knowledge base and writing an answer…</span></MessageBubble>}
            </ul>}
        </div>
        <form className="border-t border-[#e5e8f0] p-5" onSubmit={event => { event.preventDefault(); void send() }}>
          <ErrorAlert message={error} onDismiss={() => setError('')} className="mb-4" />
          <label htmlFor="assistant-message" className="text-xs font-semibold">Message</label>
          <textarea ref={composer} id="assistant-message" rows={3} value={message} onChange={event => setMessage(event.target.value)} aria-describedby="assistant-message-help" aria-invalid={tooLong || undefined}
            onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send() } }}
            placeholder="Write a question about university services, academic policies, or campus information…"
            className="mt-2 w-full resize-y rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] p-3 text-sm leading-6 placeholder:text-[#8791a8] focus-visible:outline-2 focus-visible:outline-offset-2" />
          <p id="assistant-message-help" className={`mt-2 flex flex-wrap justify-between gap-2 text-xs leading-5 ${tooLong ? 'text-[#b91c1c]' : 'text-[#68728a]'}`}><span>{tooLong ? `A message can have at most ${MAX_MESSAGE_CHARS} characters.` : 'Press Enter to send, Shift + Enter for a new line.'}</span><span>{message.length} / {MAX_MESSAGE_CHARS}</span></p>
          <div className="mt-4 flex flex-wrap justify-between gap-3">
            <button type="button" disabled={!message || sending} onClick={() => { setMessage(''); composer.current?.focus() }} className={outlineButton}><RotateCcw size={14} aria-hidden="true" />Clear Draft</button>
            <button type="submit" disabled={!draft || tooLong || sending} className={headerButton}><Send size={14} aria-hidden="true" />{sending ? 'Sending…' : 'Send Message'}</button>
          </div>
        </form>
      </section>
      <aside aria-labelledby="assistant-tools-title" className={`p-5 ${card}`}><h2 id="assistant-tools-title" className="text-sm font-semibold">AI Management Tools</h2>
        <nav aria-label="Related AI screens" className="mt-4 space-y-3">
          <Link to="/admin/ai-knowledge-base" className="flex items-center gap-2 rounded-xl border border-[#e5e8f0] p-3 text-xs font-semibold hover:bg-[#f7f8fc] focus-visible:outline-2"><BookOpen size={16} aria-hidden="true" />AI Knowledge Base</Link>
          <Link to="/admin/test-ai-knowledge" className="flex items-center gap-2 rounded-xl border border-[#e5e8f0] p-3 text-xs font-semibold hover:bg-[#f7f8fc] focus-visible:outline-2"><Play size={16} aria-hidden="true" />Test AI Knowledge</Link>
          <Link to="/admin/chat-history" className="flex items-center gap-2 rounded-xl border border-[#e5e8f0] p-3 text-xs font-semibold hover:bg-[#f7f8fc] focus-visible:outline-2"><History size={16} aria-hidden="true" />Chat History</Link>
        </nav>
        <p className="mt-4 text-xs leading-5 text-[#68728a]">Upload or update documents in AI Knowledge Base, then ask here to see what the assistant answers. Test AI Knowledge also shows the passages behind an answer.</p>
      </aside>
    </div>
  </main>
}
