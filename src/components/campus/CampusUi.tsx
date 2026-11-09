import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { CircleCheck, X } from 'lucide-react'
import Modal from '../ui/Modal'
import type { CampusFacility, ExceptionDraftRow, HoursDraftRow } from '../../types/campus'
import { weekdays } from '../../utils/campusApi'

// Shared Campus Management building blocks, styled from Figma nodes 121:2 / 121:3054 / 121:3861 / 121:5185.

export const primaryButton = 'inline-flex items-center justify-center gap-[7px] rounded-[10px] bg-[#273238] px-5 py-[9px] text-[13px] leading-[19.5px] font-semibold text-white hover:bg-[#1a2329] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
export const secondaryButton = 'inline-flex items-center justify-center gap-[7px] rounded-[10px] border-[1.25px] border-[#e5e8f0] bg-[#f7f8fc] px-4 py-[9px] text-[13px] leading-[19.5px] font-semibold text-[#17213c] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
const modalButton = 'rounded-xl border border-[#e5e8f0] px-4 py-2 text-sm font-semibold focus-visible:outline-2 disabled:opacity-50'

export function PageHeader({ title, description, actions, children }: { title: string; description: string; actions?: ReactNode; children?: ReactNode }) {
  return <section className="border-b-[1.25px] border-[#e5e8f0] bg-white px-4 pt-5 pb-4 sm:px-6">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0"><h1 className="font-display text-xl leading-[30px] font-extrabold text-[#17213c]">{title}</h1><p className="pt-0.5 text-xs leading-[18px] text-[#68728a]">{description}</p></div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
    {children}
  </section>
}

export type Tone = 'neutral' | 'green' | 'amber' | 'violet' | 'red'
const tones: Record<Tone, string> = {
  neutral: 'border-[rgba(39,50,56,0.13)] bg-[rgba(39,50,56,0.07)] text-[#273238]',
  green: 'border-[rgba(5,150,105,0.13)] bg-[#d1fae5] text-[#059669]',
  amber: 'border-[rgba(180,83,9,0.13)] bg-[#fef3c7] text-[#b45309]',
  violet: 'border-[rgba(124,58,237,0.13)] bg-[#ede9fe] text-[#7c3aed]',
  red: 'border-[rgba(220,38,38,0.13)] bg-[#fee2e2] text-[#dc2626]',
}

/** Statistic cards. A null value renders an em dash (loading or unavailable), never a sample number. */
export function SummaryCards({ label, items, error, onRetry }: { label: string; items: { label: string; value: number | null | undefined; tone: Tone }[]; error?: string; onRetry?: () => void }) {
  return <div className="pt-4">
    <dl aria-label={label} className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">
      {items.map(item => <div key={item.label} className={`flex flex-col rounded-xl border-[1.25px] px-4 py-3.5 ${tones[item.tone]}`}>
        <dt className="order-2 pt-0.5 text-xs leading-[18px] font-medium">{item.label}</dt>
        <dd className="order-1 font-display text-[22px] leading-[33px] font-extrabold">{item.value ?? <span aria-label="Not available">—</span>}</dd>
      </div>)}
    </dl>
    {error && <p role="alert" className="mt-2 text-xs text-[#68728a]">Statistics could not be loaded. {error} {onRetry && <button type="button" onClick={onRetry} className="rounded px-1 underline focus-visible:outline-2">Retry</button>}</p>}
  </div>
}

export function SearchInput({ value, onChange, placeholder, label, className = 'sm:w-[300px]' }: { value: string; onChange: (value: string) => void; placeholder: string; label: string; className?: string }) {
  return <div className={`relative w-full ${className}`}>
    <img src="/assets/figma/faculty-search.svg" width="14" height="14" alt="" className="pointer-events-none absolute top-3 left-2.5" />
    <input type="search" aria-label={label} placeholder={placeholder} value={value} maxLength={200} onChange={event => onChange(event.target.value)}
      className="h-[38px] w-full rounded-[9px] border-[1.25px] border-[#e5e8f0] bg-[#f7f8fc] pr-2.5 pl-8 text-[13px] text-[#17213c] placeholder:text-[#17213c]/50 focus-visible:outline-2" />
  </div>
}

export function FilterSelect({ value, onChange, label, allLabel, options, className = '' }: { value: string; onChange: (value: string) => void; label: string; allLabel: string; options: { value: string; label: string }[]; className?: string }) {
  return <div className={`relative w-full sm:w-auto ${className}`}>
    <select aria-label={label} value={value} onChange={event => onChange(event.target.value)}
      className="h-[35px] w-full appearance-none rounded-[9px] border-[1.25px] border-[#e5e8f0] bg-[#f7f8fc] pr-9 pl-4 text-[13px] text-[#17213c] focus-visible:outline-2 sm:min-w-[106px]">
      <option value="">{allLabel}</option>
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    <img src="/assets/figma/department-filter-arrow.svg" width="10" height="6" alt="" className="pointer-events-none absolute top-[14.5px] right-[13px]" />
  </div>
}

export function Badge({ bg, text, children, dot = false }: { bg: string; text: string; children: ReactNode; dot?: boolean }) {
  return <span style={{ backgroundColor: bg, color: text }} className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] leading-[16.5px] font-semibold whitespace-nowrap">{dot && <span aria-hidden="true">●</span>}{children}</span>
}

export function CodeChip({ children }: { children: ReactNode }) {
  return <span className="inline-block rounded-md bg-[rgba(39,50,56,0.07)] px-2 py-px font-mono text-xs leading-[18px] font-bold text-[#273238]">{children}</span>
}

export function SerialChip({ value }: { value: number }) {
  return <span className="inline-block rounded-lg bg-[#273238]/7 px-2 py-0.5 text-[11.5px] leading-[17.25px] font-bold text-[#273238]">{value}</span>
}

/** "Actions ▾" menu from the Figma tables. */
export function ActionMenu({ label, items, disabled }: { label: string; items: { label: string; onSelect: () => void; danger?: boolean }[]; disabled?: boolean }) {
  // The menu is fixed-positioned from the button so the table's horizontal scroll container cannot clip it.
  const [position, setPosition] = useState<CSSProperties | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const open = position !== null
  useEffect(() => {
    if (!open) return
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : event.type !== 'mousedown' || !root.current?.contains(event.target as Node)) setPosition(null)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close) }
  }, [open])
  function toggle(button: HTMLButtonElement) {
    if (open) { setPosition(null); return }
    const rect = button.getBoundingClientRect(), height = items.length * 34 + 12
    const right = window.innerWidth - rect.right
    setPosition(rect.bottom + 4 + height > window.innerHeight && rect.top > height ? { right, bottom: window.innerHeight - rect.top + 4 } : { right, top: rect.bottom + 4 })
  }
  return <div ref={root} className="relative inline-block">
    <button type="button" disabled={disabled} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} aria-label={label} onClick={event => toggle(event.currentTarget)}
      className="h-[30.5px] rounded-[7px] border-[1.25px] border-[#e5e8f0] bg-white px-3 text-xs leading-[18px] font-semibold whitespace-nowrap text-[#17213c] hover:bg-[#f7f8fc] focus-visible:outline-2 disabled:opacity-50">Actions ▾</button>
    {position && <div id={menuId} role="menu" style={position} className="fixed z-40 min-w-[140px] overflow-hidden rounded-[10px] border-[1.25px] border-[#e5e8f0] bg-white py-1 shadow-lg">
      {items.map(item => <button key={item.label} type="button" role="menuitem" onClick={() => { setPosition(null); item.onSelect() }}
        className={`block w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-[#f7f8fc] focus-visible:bg-[#f7f8fc] focus-visible:outline-none ${item.danger ? 'text-[#dc2626]' : 'text-[#17213c]'}`}>{item.label}</button>)}
    </div>}
  </div>
}

/** Green success toast (Admin Users style); dismisses itself after 4 seconds. */
export function SuccessToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(onDismiss, 4000)
    return () => window.clearTimeout(timer)
  }, [message, onDismiss])
  if (!message) return null
  return <div role="status" className="fixed right-4 bottom-4 z-[60] flex max-w-[calc(100vw-32px)] items-center gap-3 rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] p-4 text-[13px] leading-5 font-semibold text-[#047857] shadow-lg sm:max-w-sm"><CircleCheck size={18} aria-hidden="true" className="shrink-0" /><p>{message}</p><button type="button" aria-label="Dismiss message" onClick={onDismiss} className="ml-auto rounded p-1 focus-visible:outline-2"><X size={16} /></button></div>
}

/** Delete confirmation. The lock prevents duplicate DELETE requests. */
export function ConfirmDelete({ title, children, onConfirm, onClose, onDeleted, describeError }: { title: string; children: ReactNode; onConfirm: () => Promise<void>; onClose: () => void; onDeleted: () => void; describeError: (error: unknown) => string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  async function remove() {
    if (lock.current) return
    lock.current = true; setIsDeleting(true); setError('')
    try { await onConfirm(); onDeleted() } catch (failure) { setError(describeError(failure)); lock.current = false; setIsDeleting(false) }
  }
  return <Modal title={title} onClose={() => { if (!lock.current) onClose() }}>
    <div className="text-sm leading-6 text-[#68728a]">{children}</div>
    {error && <p role="alert" className="mt-3 text-sm text-[#d80255]">{error}</p>}
    <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={isDeleting} className={modalButton} onClick={onClose}>Cancel</button><button type="button" disabled={isDeleting} className={`${modalButton} border-[#dc2626] bg-[#dc2626] text-white`} onClick={remove}>{isDeleting ? 'Deleting…' : 'Delete'}</button></div>
  </Modal>
}

/** Detail modal: loads one record by id (GET /{id}) and offers Edit / Delete. */
export function DetailsModal<T>({ title, load, rows, onClose, onEdit, onDelete, describeError }: { title: string; load: (signal: AbortSignal) => Promise<T>; rows: (data: T) => [string, ReactNode][]; onClose: () => void; onEdit?: (data: T) => void; onDelete?: (data: T) => void; describeError: (error: unknown) => string }) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ attempt: number; data?: T; error?: string } | null>(null)
  const loader = useRef(load)
  useEffect(() => {
    const controller = new AbortController()
    loader.current(controller.signal).then(data => { if (!controller.signal.aborted) setResult({ attempt, data }) }).catch(error => { if (!controller.signal.aborted) setResult({ attempt, error: describeError(error) }) })
    return () => controller.abort()
  }, [attempt, describeError])
  const current = result?.attempt === attempt ? result : null
  return <Modal title={title} onClose={onClose}>
    {!current ? <p role="status" className="text-sm text-[#68728a]">Loading…</p> : current.error ? <div role="alert" className="text-sm text-[#68728a]"><p>{current.error}</p><button type="button" className={`${modalButton} mt-4`} onClick={() => setAttempt(previous => previous + 1)}>Retry</button></div> : current.data !== undefined && <>
      <dl className="space-y-3">{rows(current.data).map(([label, value]) => <div key={label} className="grid grid-cols-[130px_1fr] gap-3 text-sm"><dt className="text-[#68728a]">{label}</dt><dd className="break-words text-[#17213c]">{value ?? '—'}</dd></div>)}</dl>
      {(onEdit || onDelete) && <div className="mt-6 flex justify-end gap-3">{onEdit && <button type="button" className={modalButton} onClick={() => onEdit(current.data as T)}>Edit</button>}{onDelete && <button type="button" className={`${modalButton} bg-[#273238] text-white`} onClick={() => onDelete(current.data as T)}>Delete</button>}</div>}
    </>}
  </Modal>
}

// ---- Drawer form fields (style of the existing Add Program / Add Lecturer drawers) ----

const control = 'w-full rounded-xl border-[1.25px] border-[#e5e8f0] bg-white px-3.5 py-2.5 text-[13px] text-[#17213c] placeholder:text-[#68728a]/70 focus-visible:outline-2 aria-[invalid=true]:border-[#d80255] disabled:bg-[#f7f8fc]'

export function Field({ id, label, error, required, full = true, hint, children }: { id: string; label: string; error?: string; required?: boolean; full?: boolean; hint?: string; children: ReactNode }) {
  return <div className={full ? 'min-[400px]:col-span-2' : undefined}>
    <label htmlFor={id} className="mb-1.5 block text-xs leading-[18px] font-semibold text-[#17213c]">{label}{required && <span aria-hidden="true" className="text-[#d80255]"> *</span>}</label>
    {children}
    {hint && !error && <p id={`${id}-hint`} className="mt-1 text-[11px] text-[#68728a]">{hint}</p>}
    {error && <p id={`${id}-error`} className="mt-1 text-xs text-[#d80255]">{error}</p>}
  </div>
}

export function TextInput({ id, value, onChange, error, placeholder, type = 'text', required, inputMode, step, min, max }: { id: string; value: string; onChange: (value: string) => void; error?: string; placeholder?: string; type?: string; required?: boolean; inputMode?: 'numeric' | 'decimal' | 'tel'; step?: string; min?: number; max?: number }) {
  return <input id={id} type={type} value={value} required={required} inputMode={inputMode} step={step} min={min} max={max} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} onChange={event => onChange(event.target.value)} className={control} />
}

export function TextArea({ id, value, onChange, error, placeholder }: { id: string; value: string; onChange: (value: string) => void; error?: string; placeholder?: string }) {
  return <textarea id={id} rows={3} value={value} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} onChange={event => onChange(event.target.value)} className={`${control} resize-y`} />
}

export function SelectInput({ id, value, onChange, error, placeholder, options, required, disabled }: { id: string; value: string; onChange: (value: string) => void; error?: string; placeholder: string; options: { value: string; label: string }[]; required?: boolean; disabled?: boolean }) {
  return <div className="relative"><select id={id} value={value} required={required} disabled={disabled} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} onChange={event => onChange(event.target.value)} className={`${control} appearance-none pr-9`}>
    <option value="">{placeholder}</option>
    {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
  </select><img src="/assets/figma/department-select-arrow.svg" width="10" height="6" alt="" className="pointer-events-none absolute top-[18px] right-3.5" /></div>
}

export function Toggle({ id, label, checked, onChange, description }: { id: string; label: string; checked: boolean; onChange: (value: boolean) => void; description?: string }) {
  return <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl border-[1.25px] border-[#e5e8f0] px-3.5 py-2.5 min-[400px]:col-span-1">
    <input id={id} type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="mt-0.5 size-4 accent-[#273238]" />
    <span><span className="block text-[13px] font-semibold text-[#17213c]">{label}</span>{description && <span className="block text-[11px] text-[#68728a]">{description}</span>}</span>
  </label>
}

export function FacilityPicker({ facilities, selected, onChange, initial }: { facilities: CampusFacility[]; selected: string[]; onChange: (next: string[]) => void; initial: { id: number; name: string }[] }) {
  // Keep facilities already attached to the record visible even if since deactivated.
  const options = [...facilities.filter(f => f.isActive).map(f => ({ id: String(f.id), name: f.facilityName })), ...initial.filter(f => !facilities.some(a => a.id === f.id && a.isActive)).map(f => ({ id: String(f.id), name: f.name }))]
  if (!options.length) return <p className="text-xs text-[#68728a]">No active facilities are configured.</p>
  return <fieldset className="min-[400px]:col-span-2"><legend className="mb-1.5 text-xs leading-[18px] font-semibold text-[#17213c]">Facilities</legend><div className="flex flex-wrap gap-2">
    {options.map(option => { const on = selected.includes(option.id); return <label key={option.id} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border-[1.25px] px-3 py-1 text-xs font-semibold ${on ? 'border-[#273238] bg-[#273238] text-white' : 'border-[#e5e8f0] bg-white text-[#68728a]'}`}>
      <input type="checkbox" className="sr-only" checked={on} onChange={event => onChange(event.target.checked ? [...selected, option.id] : selected.filter(id => id !== option.id))} />{option.name}</label> })}
  </div></fieldset>
}

export function HoursEditor({ rows, onChange, error }: { rows: HoursDraftRow[]; onChange: (rows: HoursDraftRow[]) => void; error?: string }) {
  const set = (index: number, patch: Partial<HoursDraftRow>) => onChange(rows.map((row, i) => i === index ? { ...row, ...patch, ...(patch.closed ? { opensAt: '', closesAt: '' } : {}) } : row))
  return <fieldset className="min-[400px]:col-span-2" aria-describedby={error ? 'opening-hours-error' : undefined}>
    <legend className="mb-1.5 text-xs leading-[18px] font-semibold text-[#17213c]">Opening Hours</legend>
    <p className="mb-2 text-[11px] text-[#68728a]">Leave both times blank for days without published hours. Overnight hours are not supported.</p>
    <div className="space-y-1.5">{rows.map((row, index) => <div key={row.dayOfWeek} className="grid grid-cols-[84px_1fr_1fr_auto] items-center gap-2 text-xs">
      <span className="font-semibold text-[#17213c]">{weekdays[row.dayOfWeek - 1].slice(0, 3)}</span>
      <input type="time" aria-label={`${weekdays[row.dayOfWeek - 1]} opens at`} disabled={row.closed} value={row.opensAt} onChange={event => set(index, { opensAt: event.target.value })} className={`${control} py-1.5`} />
      <input type="time" aria-label={`${weekdays[row.dayOfWeek - 1]} closes at`} disabled={row.closed} value={row.closesAt} onChange={event => set(index, { closesAt: event.target.value })} className={`${control} py-1.5`} />
      <label className="inline-flex items-center gap-1.5 text-[#68728a]"><input type="checkbox" checked={row.closed} onChange={event => set(index, { closed: event.target.checked })} className="size-3.5 accent-[#273238]" />Closed</label>
    </div>)}</div>
    {error && <p id="opening-hours-error" className="mt-1 text-xs text-[#d80255]">{error}</p>}
  </fieldset>
}

/** Table frame matching the Figma tables (header #f7f8fc, uppercase 11px labels). */
/** Special dates (PUT .../opening-exceptions): each row overrides the weekly hours for one day. */
export function ExceptionsEditor({ rows, onChange, error }: { rows: ExceptionDraftRow[]; onChange: (rows: ExceptionDraftRow[]) => void; error?: string }) {
  const set = (index: number, patch: Partial<ExceptionDraftRow>) => onChange(rows.map((row, i) => i === index ? { ...row, ...patch, ...(patch.closed ? { opensAt: '', closesAt: '' } : {}) } : row))
  return <fieldset className="min-[400px]:col-span-2" aria-describedby={error ? 'opening-exceptions-error' : undefined}>
    <legend className="mb-1.5 text-xs leading-[18px] font-semibold text-[#17213c]">Special Dates</legend>
    <p className="mb-2 text-[11px] text-[#68728a]">Holidays or events that change the weekly hours. Tick Closed for a closed day.</p>
    <div className="space-y-2">{rows.map((row, index) => <div key={index} className="rounded-xl border-[1.25px] border-[#e5e8f0] p-2.5">
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-xs">
        <input type="date" aria-label={`Special date ${index + 1}`} value={row.date} onChange={event => set(index, { date: event.target.value })} className={`${control} py-1.5`} />
        <label className="inline-flex items-center gap-1.5 text-[#68728a]"><input type="checkbox" checked={row.closed} onChange={event => set(index, { closed: event.target.checked })} className="size-3.5 accent-[#273238]" />Closed</label>
        <button type="button" onClick={() => onChange(rows.filter((_, i) => i !== index))} aria-label={`Remove special date ${index + 1}`} className="h-[27px] rounded-md border-[1.25px] border-[#fca5a5] px-2 text-[11px] text-[#ef4444] hover:bg-[#fef2f2] focus-visible:outline-2">✕</button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <input type="time" aria-label={`Special date ${index + 1} opens at`} disabled={row.closed} value={row.opensAt} onChange={event => set(index, { opensAt: event.target.value })} className={`${control} py-1.5`} />
        <input type="time" aria-label={`Special date ${index + 1} closes at`} disabled={row.closed} value={row.closesAt} onChange={event => set(index, { closesAt: event.target.value })} className={`${control} py-1.5`} />
        <input type="text" aria-label={`Special date ${index + 1} reason`} placeholder="Reason, e.g. Songkran holiday" value={row.reason} onChange={event => set(index, { reason: event.target.value })} className={`${control} col-span-2 py-1.5`} />
      </div>
    </div>)}</div>
    <button type="button" onClick={() => onChange([...rows, { date: '', closed: true, opensAt: '', closesAt: '', reason: '' }])} className="mt-2 rounded-lg border-[1.25px] border-dashed border-[#cbd5e1] px-3 py-1.5 text-xs font-semibold text-[#17213c] hover:bg-[#f7f8fc] focus-visible:outline-2">+ Add special date</button>
    {error && <p id="opening-exceptions-error" className="mt-1 text-xs text-[#d80255]">{error}</p>}
  </fieldset>
}

/** A table header: plain text, or a node (for example a sort button) with its aria-sort state. */
export type TableHeader = string | { key: string; label: ReactNode; sort?: 'ascending' | 'descending' | 'none' }
const headerCell = 'px-3.5 py-2.5 text-[11px] leading-[16.5px] font-bold tracking-[0.06em] whitespace-nowrap text-[#68728a] uppercase'

export function CampusTable({ label, caption, headers, minWidth, children, state, title }: { label: string; caption: string; headers: TableHeader[]; minWidth: number; children: ReactNode; state?: ReactNode; title?: string }) {
  return <div className="overflow-hidden rounded-xl border-[1.25px] border-[#e5e8f0] bg-white">
    {title && <h2 className="border-b-[1.25px] border-[#e5e8f0] px-4 py-3 font-display text-sm leading-[21px] font-bold text-[#17213c]">{title}</h2>}
    <div role="region" aria-label={label} tabIndex={0} className="relative overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
      <table style={{ minWidth }} className="w-full text-left text-[13px] leading-[19.5px] text-[#17213c]">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[#f7f8fc]"><tr className="border-b-[1.25px] border-[#e5e8f0]">{headers.map(header => typeof header === 'string' ? <th key={header} scope="col" className={headerCell}>{header}</th> : <th key={header.key} scope="col" aria-sort={header.sort} className={headerCell}>{header.label}</th>)}</tr></thead>
        <tbody className="[&>tr]:border-b-[1.25px] [&>tr]:border-[#e5e8f0] [&>tr:nth-child(even)]:bg-[#f7f8fc] [&>tr:last-child]:border-b-0">{children}</tbody>
      </table>
    </div>
    {state}
  </div>
}

export function TableState({ loading, error, empty, loadingText, emptyText, onRetry }: { loading: boolean; error?: string; empty: boolean; loadingText: string; emptyText: string; onRetry: () => void }) {
  if (error) return <div role="alert" className="px-4 py-10 text-center text-sm text-[#68728a]"><p>{error}</p><button type="button" onClick={onRetry} className="mt-3 rounded-xl border border-[#e5e8f0] px-4 py-2 font-semibold focus-visible:outline-2">Retry</button></div>
  if (loading && empty) return <p role="status" className="px-4 py-10 text-center text-sm text-[#68728a]">{loadingText}</p>
  if (empty) return <p role="status" className="px-4 py-10 text-center text-sm text-[#68728a]">{emptyText}</p>
  return null
}
