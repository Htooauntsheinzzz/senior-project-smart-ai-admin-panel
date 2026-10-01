import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export default function Modal({ title, children, onClose, dividedHeader = false }: { title: string; children: ReactNode; onClose: () => void; dividedHeader?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const dialog = ref.current
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog?.showModal()
    return () => {
      dialog?.close()
      document.body.style.overflow = overflow
      opener?.focus()
    }
  }, [])

  return <dialog ref={ref} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose() }}
    onClick={event => {
      const bounds = event.currentTarget.getBoundingClientRect()
      if (event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) onClose()
    }} className="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[min(520px,calc(100vw-32px))] overflow-y-auto rounded-2xl border border-[#e5e8f0] bg-white p-6 text-[#17213c] shadow-xl backdrop:bg-[#17213c]/35">
    <div className={dividedHeader ? '-mx-6 -mt-6 mb-6 flex items-center justify-between gap-3 border-b border-[#e5e8f0] px-6 py-4' : 'mb-5 flex items-center justify-between gap-3'}><h2 id={titleId} className="font-display text-lg font-bold">{title}</h2><button type="button" aria-label="Close dialog" onClick={onClose} className="rounded-lg p-1.5 text-[#68728a] hover:bg-[#f7f8fc] focus-visible:outline-2"><X size={18} /></button></div>
    {children}
  </dialog>
}
