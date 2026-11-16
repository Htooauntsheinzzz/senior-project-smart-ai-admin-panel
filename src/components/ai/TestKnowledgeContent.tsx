import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Bot, Download, FileSearch, Play, RotateCcw } from 'lucide-react'
import type { AssistantAnswer, AssistantPassage } from '../../types/aiAssistant'
import { runKnowledgeTest } from '../../services/aiAssistantService'
import { downloadKnowledgeDocument, getKnowledgeDocument } from '../../services/knowledgeService'
import { MAX_QUESTION_CHARS, assistantError, countLabel, formatDuration, passageLocation, scorePercent } from '../../utils/aiAssistant'
import { displayYear, knowledgeError } from '../../utils/knowledgeBase'
import { Badge, SerialChip } from '../campus/CampusUi'
import { AiPageHeader, EmptyPanel, ErrorAlert, Notice, card, headerButton, headerLink, outlineButton } from './AssistantUi'

// Test AI Knowledge (sidebar: AI Management › Test AI Knowledge), admin panel spec 42. One question goes to
// POST /api/v1/admin/assistant/knowledge-test; the screen shows the answer and the document passages it was written
// from, so the Admin can see whether the knowledge base covers the question. Nothing is stored.
interface TestResult { question: string; answer: AssistantAnswer }

function Passage({ passage, number, onDownload, downloading }: { passage: AssistantPassage; number: number; onDownload: () => void; downloading: boolean }) {
  const location = passageLocation(passage)
  return <li className="p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3"><SerialChip value={number} />
        <div className="min-w-0"><h3 className="text-[13px] leading-5 font-semibold break-words">{passage.title}</h3>
          <p className="mt-0.5 text-xs leading-5 text-[#68728a]">{[passage.category, passage.academicYear && displayYear(passage.academicYear), passage.sectionTitle, location].filter(Boolean).join(' · ') || 'Knowledge document'}</p></div></div>
      <Badge bg="#ede9fe" text="#6d28d9">{scorePercent(passage.score)} match</Badge>
    </div>
    <blockquote className="mt-3 max-h-44 overflow-y-auto rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] p-3 text-[13px] leading-6 break-words whitespace-pre-wrap text-[#17213c]">{passage.content.trim() || 'This passage has no text.'}</blockquote>
    <button type="button" onClick={onDownload} disabled={downloading} className="mt-3 inline-flex items-center gap-1.5 rounded text-xs font-semibold text-[#273238] underline-offset-2 hover:underline focus-visible:outline-2 disabled:opacity-50"><Download size={13} aria-hidden="true" />{downloading ? 'Downloading…' : 'Download document'}</button>
  </li>
}

export default function TestKnowledgeContent() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<TestResult | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState('')
  const [downloadError, setDownloadError] = useState('')
  const editor = useRef<HTMLTextAreaElement>(null)
  const request = useRef<AbortController | null>(null)

  useEffect(() => () => request.current?.abort(), [])

  const draft = question.trim()
  const tooLong = draft.length > MAX_QUESTION_CHARS

  async function run() {
    if (!draft || tooLong || request.current) return
    const controller = new AbortController()
    request.current = controller
    setRunning(true); setError(''); setDownloadError('')
    try {
      const answer = await runKnowledgeTest(draft, controller.signal)
      if (!controller.signal.aborted) setResult({ question: draft, answer })
    } catch (failure) {
      if (!controller.signal.aborted) { setResult(null); setError(assistantError(failure, 'The test could not be run. Try again.')) }
    } finally {
      if (request.current === controller) { request.current = null; setRunning(false) }
    }
  }

  function clear() {
    request.current?.abort()
    request.current = null
    setQuestion(''); setResult(null); setError(''); setDownloadError(''); setRunning(false)
    editor.current?.focus()
  }

  async function download(documentId: string) {
    if (downloading) return
    setDownloading(documentId); setDownloadError('')
    try { await downloadKnowledgeDocument(await getKnowledgeDocument(documentId)) }
    catch (failure) { setDownloadError(knowledgeError(failure, 'The document could not be downloaded. It may have been deleted.')) }
    finally { setDownloading('') }
  }

  const answer = result?.answer
  return <main className="min-w-0 px-4 py-6 text-[#17213c] sm:px-7">
    <AiPageHeader title="Test AI Knowledge" description="Ask a question and see the answer together with the knowledge passages it is based on.">
      <Link to="/admin/ai-knowledge-base" className={headerLink}><BookOpen size={15} aria-hidden="true" />AI Knowledge Base</Link>
    </AiPageHeader>
    <Notice title="How the test works">The question is matched against the documents whose AI Status is Ready. The best passages are given to the AI model, which answers only from them. When no passage matches, no answer is generated: upload a document that covers the topic. Tests are not saved.</Notice>
    <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <section aria-labelledby="test-question-title" className={`min-w-0 overflow-hidden ${card}`}>
        <header className="border-b border-[#e5e8f0] px-5 py-4"><h2 id="test-question-title" className="text-sm font-semibold">Test Question</h2><p className="mt-1 text-xs leading-5 text-[#68728a]">Write the question the way a student would ask it.</p></header>
        <form className="space-y-4 p-5" onSubmit={event => { event.preventDefault(); void run() }}>
          <label htmlFor="knowledge-question" className="block text-xs font-semibold">Question</label>
          <textarea ref={editor} id="knowledge-question" rows={9} value={question} onChange={event => setQuestion(event.target.value)} aria-describedby="knowledge-question-help" aria-invalid={tooLong || undefined}
            placeholder="Enter a question about university services, academic policies, or campus information…"
            className="w-full resize-y rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] p-3 text-sm leading-6 placeholder:text-[#8791a8] focus-visible:outline-2 focus-visible:outline-offset-2" />
          <p id="knowledge-question-help" className={`flex flex-wrap justify-between gap-2 text-xs leading-5 ${tooLong ? 'text-[#b91c1c]' : 'text-[#68728a]'}`}><span>{tooLong ? `A test question can have at most ${MAX_QUESTION_CHARS} characters.` : 'One question per test. Earlier tests are not used as context.'}</span><span>{draft.length} / {MAX_QUESTION_CHARS}</span></p>
          <ErrorAlert message={error} onDismiss={() => setError('')} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" disabled={!question && !result && !error} onClick={clear} className={outlineButton}><RotateCcw size={14} aria-hidden="true" />Clear Question</button>
            <button type="submit" disabled={!draft || tooLong || running} className={headerButton}><Play size={14} aria-hidden="true" />{running ? 'Running…' : 'Run Test'}</button>
          </div>
        </form>
      </section>
      <div className="min-w-0 space-y-5">
        <section aria-labelledby="test-answer-title" aria-busy={running} className={`overflow-hidden ${card}`}>
          <h2 id="test-answer-title" className="border-b border-[#e5e8f0] px-5 py-4 text-sm font-semibold">AI Answer</h2>
          {running ? <p role="status" className="px-6 py-16 text-center text-[13px] text-[#68728a]">Searching the knowledge base and writing an answer…</p>
            : !answer ? <EmptyPanel minHeight="min-h-[240px]" icon={<Bot size={32} aria-hidden="true" className="mb-3 text-[#8791a8]" />} title="No test run yet">Enter a question and choose Run Test. The answer appears here.</EmptyPanel>
              : <div className="p-5">
                <p className="text-xs leading-5 text-[#68728a]"><span className="font-semibold text-[#17213c]">Question:</span> {result.question}</p>
                <p role="status" className="mt-3 rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] p-4 text-[13px] leading-6 break-words whitespace-pre-wrap">{answer.message}</p>
                <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#68728a]">
                  <div><dt className="sr-only">Result</dt><dd>{answer.grounded ? <Badge bg="#d1fae5" text="#047857">Answered from {countLabel(answer.passages.length, 'passage')}</Badge> : <Badge bg="#fef3c7" text="#92400e">No matching passage</Badge>}</dd></div>
                  {answer.model && <div className="flex gap-1.5"><dt>Model</dt><dd className="font-mono font-semibold text-[#17213c]">{answer.model}</dd></div>}
                  <div className="flex gap-1.5"><dt>Search</dt><dd className="font-semibold text-[#17213c]">{formatDuration(answer.retrievalMs)}</dd></div>
                  {answer.model && <div className="flex gap-1.5"><dt>Answer</dt><dd className="font-semibold text-[#17213c]">{formatDuration(answer.generationMs)}</dd></div>}
                </dl>
              </div>}
        </section>
        <section aria-labelledby="test-sources-title" className={`overflow-hidden ${card}`}>
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e8f0] px-5 py-4"><h2 id="test-sources-title" className="text-sm font-semibold">Supporting Sources</h2>{answer && !running && <span className="text-xs text-[#68728a]">{countLabel(answer.passages.length, 'passage')}</span>}</header>
          {downloadError && <div className="px-5 pt-4"><ErrorAlert message={downloadError} onDismiss={() => setDownloadError('')} /></div>}
          {!answer || running ? <div className="flex gap-3 p-5"><FileSearch size={22} aria-hidden="true" className="shrink-0 text-[#8791a8]" /><p className="text-[13px] leading-6 text-[#68728a]">The passages the answer is based on are listed here after a test, with the document, the position in it and how closely each passage matches the question.</p></div>
            : !answer.passages.length ? <div className="flex gap-3 p-5"><FileSearch size={22} aria-hidden="true" className="shrink-0 text-[#8791a8]" /><p className="text-[13px] leading-6 text-[#68728a]">No Ready document contains a passage that matches this question. Check in AI Knowledge Base that a document on this topic is uploaded, active and Ready.</p></div>
              : <ol className="divide-y divide-[#e5e8f0]">{answer.passages.map((passage, index) => <Passage key={`${passage.documentId}-${passage.rank}-${index}`} passage={passage} number={index + 1} downloading={downloading === passage.documentId} onDownload={() => { void download(passage.documentId) }} />)}</ol>}
        </section>
      </div>
    </div>
  </main>
}
