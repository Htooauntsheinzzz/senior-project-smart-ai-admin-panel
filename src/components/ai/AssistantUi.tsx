import type { ReactNode } from 'react'
import { Bot, FileText, Info, ThumbsDown, ThumbsUp, User } from 'lucide-react'
import type { ChatRole, MessageSource, Rating, ReviewStatus } from '../../types/aiAssistant'
import { ratingLabels, ratingStyles, reviewStatusLabels, reviewStatusStyles } from '../../utils/aiAssistant'
import { displayYear } from '../../utils/knowledgeBase'
import { Badge } from '../campus/CampusUi'

// Building blocks shared by AI Assistant, Test AI Knowledge, Chat History and AI Feedback (admin panel specs 41 to 44).

export const card = 'rounded-2xl border border-[#e5e8f0] bg-white'
export const control = 'min-h-10 w-full rounded-xl border border-[#e5e8f0] bg-white px-3 py-2 text-xs text-[#17213c] placeholder:text-[#8791a8] focus-visible:outline-2 focus-visible:outline-offset-2'
export const headerLink = 'inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e5e8f0] bg-white px-4 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2'
export const headerButton = 'inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#273238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a2329] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
export const outlineButton = 'inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e5e8f0] px-4 py-2 text-xs font-semibold hover:bg-[#f7f8fc] focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50'

export function AiPageHeader({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <header className="flex flex-wrap items-center justify-between gap-4">
    <div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">{title}</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">{description}</p></div>
    {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
  </header>
}

/** The information card under a page header. */
export function Notice({ title, children }: { title: string; children: ReactNode }) {
  return <section className={`mt-5 flex gap-3 p-4 ${card}`}><Info size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-[#68728a]" /><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-[13px] leading-6 text-[#68728a]">{children}</p></div></section>
}

export function ErrorAlert({ message, onRetry, onDismiss, className = '' }: { message: string; onRetry?: () => void; onDismiss?: () => void; className?: string }) {
  if (!message) return null
  return <p role="alert" className={`rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] leading-5 text-[#b91c1c] ${className}`}>{message}
    {onRetry && <button type="button" onClick={onRetry} className="ml-2 rounded font-semibold underline focus-visible:outline-2">Retry</button>}
    {onDismiss && <button type="button" onClick={onDismiss} className="ml-2 rounded font-semibold underline focus-visible:outline-2">Dismiss</button>}
  </p>
}

export function RatingBadge({ rating }: { rating: Rating }) {
  const Icon = rating === 'POSITIVE' ? ThumbsUp : ThumbsDown
  return <Badge bg={ratingStyles[rating].bg} text={ratingStyles[rating].text}><Icon size={11} aria-hidden="true" />{ratingLabels[rating]}</Badge>
}

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return <Badge bg={reviewStatusStyles[status].bg} text={reviewStatusStyles[status].text}>{reviewStatusLabels[status]}</Badge>
}

/** The knowledge documents an answer names as its sources. */
export function SourceChips({ sources }: { sources: MessageSource[] }) {
  if (!sources.length) return null
  return <ul aria-label="Sources" className="mt-2 flex flex-wrap gap-1.5">{sources.map((source, index) => <li key={`${source.title}-${index}`} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#e5e8f0] bg-white px-2.5 py-1 text-[11px] leading-4 font-medium text-[#68728a]">
    <FileText size={12} aria-hidden="true" className="shrink-0" /><span className="truncate">{source.title}{source.academicYear ? ` · ${displayYear(source.academicYear)}` : ''}</span>
  </li>)}</ul>
}

/** One chat message: the person's on the right, the assistant's on the left. Text is shown as written, never as HTML. */
export function MessageBubble({ role, author, time, children, footer }: { role: ChatRole; author: string; time?: string; children: ReactNode; footer?: ReactNode }) {
  const user = role === 'USER'
  const Icon = user ? User : Bot
  return <li className={`flex gap-2.5 ${user ? 'flex-row-reverse' : ''}`}>
    <span aria-hidden="true" className={`mt-5 flex size-8 shrink-0 items-center justify-center rounded-full ${user ? 'bg-[#273238] text-white' : 'bg-[#ede9fe] text-[#7c3aed]'}`}><Icon size={15} /></span>
    <div className={`flex max-w-[85%] min-w-0 flex-col ${user ? 'items-end' : 'items-start'}`}>
      <p className="mb-1 text-[11px] leading-4 text-[#68728a]"><span className="font-semibold text-[#17213c]">{author}</span>{time ? ` · ${time}` : ''}</p>
      <div className={`max-w-full rounded-2xl px-4 py-2.5 text-[13px] leading-6 break-words whitespace-pre-wrap ${user ? 'rounded-tr-sm bg-[#273238] text-white' : 'rounded-tl-sm border border-[#e5e8f0] bg-[#f7f8fc] text-[#17213c]'}`}>{children}</div>
      {footer}
    </div>
  </li>
}

export function EmptyPanel({ icon, title, children, minHeight = 'min-h-[300px]' }: { icon: ReactNode; title: string; children: ReactNode; minHeight?: string }) {
  return <div className={`flex ${minHeight} flex-col items-center justify-center px-6 py-10 text-center`}>{icon}<h3 className="text-sm font-semibold">{title}</h3><p className="mt-2 max-w-md text-[13px] leading-6 text-[#68728a]">{children}</p></div>
}
