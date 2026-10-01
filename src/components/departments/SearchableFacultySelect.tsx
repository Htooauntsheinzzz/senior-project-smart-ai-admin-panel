import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Faculty } from '../../types/faculty'
import { filterFaculties } from '../../utils/faculties'
import { loadDemoFacultyOptions } from '../../services/departmentDemo'

type Props = { value: string; selectedFaculty?: Faculty; onChange: (faculty: Faculty) => void; error?: string; disabled?: boolean; loadOptions?: () => Promise<Faculty[]> }

export default function SearchableFacultySelect({ value, selectedFaculty, onChange, error, disabled, loadOptions = loadDemoFacultyOptions }: Props) {
  const id = useId()
  const listId = `${id}-list`
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(false)
  const [options, setOptions] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [active, setActive] = useState(0)
  const popup = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const matches = filterFaculties(options, query)
  const highlighted = matches[Math.min(active, Math.max(0, matches.length - 1))]

  useEffect(() => {
    if (!open) return
    let cancelled = false
    loadOptions().then(items => {
      if (cancelled) return
      setOptions(items); setLoading(false); setActive(Math.max(0, items.findIndex(item => item.id === value)))
    }).catch(() => { if (!cancelled) { setFailed(true); setLoading(false) } })
    return () => { cancelled = true }
  }, [open, attempt, loadOptions, value])

  useLayoutEffect(() => {
    if (!open) return
    const panel = popup.current
    // Native popover enters the top layer but stays a DOM descendant of the
    // drawer, avoiding clipping and retaining the modal dialog's focus scope.
    panel?.showPopover()
    function position() {
      const bounds = input.current?.getBoundingClientRect()
      if (!bounds || !panel) return
      const below = window.innerHeight - bounds.bottom - 12
      const above = bounds.top - 12
      const upwards = below < 240 && above > below
      const height = Math.max(80, Math.min(320, upwards ? above : below))
      panel.style.width = `${Math.min(bounds.width, window.innerWidth - 16)}px`
      panel.style.left = `${Math.max(8, Math.min(bounds.left, window.innerWidth - bounds.width - 8))}px`
      panel.style.top = upwards ? 'auto' : `${bounds.bottom + 6}px`
      panel.style.bottom = upwards ? `${window.innerHeight - bounds.top + 6}px` : 'auto'
      panel.style.maxHeight = `${height}px`
    }
    position()
    input.current?.focus()
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !panel?.contains(event.target) && !input.current?.contains(event.target)) setOpen(false)
    }
    function focusOutside(event: FocusEvent) {
      if (event.target instanceof Node && !panel?.contains(event.target) && !input.current?.contains(event.target)) setOpen(false)
    }
    window.addEventListener('resize', position)
    document.addEventListener('scroll', position, true)
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', focusOutside)
    return () => {
      panel?.hidePopover()
      window.removeEventListener('resize', position)
      document.removeEventListener('scroll', position, true)
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('focusin', focusOutside)
    }
  }, [open])
  useEffect(() => {
    if (open && highlighted) document.getElementById(`${id}-${highlighted.id}`)?.scrollIntoView({ block: 'nearest' })
  }, [open, highlighted, id])

  function close() { input.current?.focus(); setOpen(false) }
  function show() { if (open) return; setQuery(''); setEditing(false); setLoading(true); setFailed(false); setOpen(true) }
  function select(faculty: Faculty) { onChange(faculty); close() }
  function keyboard(event: KeyboardEvent) {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); show() }
      return
    }
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close() }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(previous => matches.length ? (previous + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length : 0)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (!loading && !failed && highlighted) select(highlighted)
    }
  }
  return <div>
    <label id={`${id}-label`} htmlFor="department-facultyId" className="mb-1.5 block text-[12.5px] leading-[18.75px] font-semibold">Faculty<span aria-hidden="true" className="ml-0.5 text-[#d80255]">*</span></label>
    <div className="relative"><input ref={input} id="department-facultyId" type="text" role="combobox" required autoComplete="off" aria-required="true" aria-labelledby={`${id}-label`} aria-expanded={open} aria-controls={open ? listId : undefined} aria-autocomplete="list" aria-haspopup="listbox" aria-activedescendant={open && !loading && !failed && highlighted ? `${id}-${highlighted.id}` : undefined} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} disabled={disabled}
      value={open && editing ? query : selectedFaculty?.nameEn ?? ''} placeholder="Search or select a faculty…"
      onFocus={show} onClick={show} onKeyDown={keyboard} onChange={event => { if (!open) show(); setQuery(event.target.value); setEditing(true); setActive(0) }}
      className={`h-[41px] w-full rounded-xl border-[0.625px] pr-9 pl-3.5 font-['Inter','Noto_Sans_Thai',sans-serif] text-[13.5px] text-[#17213c] placeholder:text-[#9ca3af] focus-visible:outline-2 focus-visible:outline-offset-2 ${error ? 'border-[#d80255]' : 'border-[#e5e8f0]'}`} />
      <img src="/assets/figma/department-select-arrow.svg" width="10" height="6" alt="" className="pointer-events-none absolute top-[18px] right-3.5" />
    </div>
    {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-[#d80255]">{error}</p>}
    {open && <div ref={popup} popover="manual" onKeyDown={keyboard} className="fixed inset-auto m-0 flex flex-col overflow-hidden rounded-xl border border-[#e5e8f0] bg-white p-0 text-[#17213c] shadow-xl">
      {loading && <p role="status" className="px-3 py-4 text-xs text-[#68728a]">Loading faculties…</p>}
      {failed && <div role="alert" className="px-3 py-4 text-xs"><p>Unable to load faculties.</p><button type="button" onClick={() => { setFailed(false); setLoading(true); setAttempt(previous => previous + 1) }} className="mt-2 rounded-lg border border-[#e5e8f0] px-3 py-2 font-semibold focus-visible:outline-2">Retry</button></div>}
      <div id={listId} role="listbox" aria-labelledby={`${id}-label`} aria-busy={loading} className="min-h-0 overflow-y-auto overscroll-contain p-1">
        {!loading && !failed && matches.map(faculty => <div key={faculty.id} id={`${id}-${faculty.id}`} role="option" aria-selected={value === faculty.id} onPointerDown={event => event.preventDefault()} onClick={() => select(faculty)} className={`cursor-pointer rounded-lg px-3 py-2 text-[13px] ${highlighted?.id === faculty.id ? 'bg-[#f0f1f3] outline-1 outline-inset outline-[#68728a]' : 'hover:bg-[#f7f8fc]'}`}><span className="block font-medium">{faculty.nameEn}</span><span className="mt-0.5 block text-xs text-[#68728a]">{faculty.code}{value === faculty.id ? ' · Selected' : ''}</span></div>)}
      </div>
      {!loading && !failed && !matches.length && <p role="status" className="px-3 py-4 text-xs text-[#68728a]">No faculties found</p>}
    </div>}
  </div>
}
