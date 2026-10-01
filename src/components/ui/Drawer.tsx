import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

export default function Drawer({ title, description, children, footer, onClose, busy = false, width = 460 }: { title: string; description: string; children: ReactNode; footer: ReactNode; onClose: () => void; busy?: boolean; width?: 460 | 480 }) {
  const titleId = useId()
  const descriptionId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const [overlay, setOverlay] = useState(() => !window.matchMedia('(min-width: 1280px)').matches)
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)')
    const resize = () => setOverlay(!media.matches)
    media.addEventListener('change', resize)
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    return () => { media.removeEventListener('change', resize); opener?.focus() }
  }, [])
  useEffect(() => {
    const panel = dialog.current
    const previousOverflow = document.body.style.overflow
    panel?.close()
    if (overlay) { panel?.showModal(); document.body.style.overflow = 'hidden' }
    else panel?.show()
    panel?.querySelector<HTMLInputElement>('input')?.focus()
    return () => { panel?.close(); document.body.style.overflow = previousOverflow }
  }, [overlay])
  return <dialog ref={dialog} aria-labelledby={titleId} aria-describedby={descriptionId} aria-modal={overlay || undefined}
    onCancel={event => { event.preventDefault(); if (!busy) onClose() }}
    onKeyDown={event => { if (event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); if (!busy) onClose() } }}
    style={{ maxWidth: width }} className="fixed inset-y-0 right-0 left-auto z-50 m-0 h-dvh max-h-none w-full border-0 bg-white p-0 text-[#17213c] shadow-[0_25px_25px_#00000040] backdrop:bg-[#17213c]/25">
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b-[0.625px] border-[#e5e8f0] px-6 py-5"><div><h2 id={titleId} className="font-display text-lg leading-[27px] font-extrabold">{title}</h2><p id={descriptionId} className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">{description}</p></div><button type="button" onClick={onClose} disabled={busy} aria-label={`Close ${title}`} className="flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-[#f7f8fc] focus-visible:outline-2"><img src="/assets/figma/faculty-close.svg" width="16" height="16" alt="" /></button></header>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
      <footer className="flex shrink-0 flex-wrap gap-3 border-t-[0.625px] border-[#e5e8f0] px-6 py-4">{footer}</footer>
    </div>
  </dialog>
}
