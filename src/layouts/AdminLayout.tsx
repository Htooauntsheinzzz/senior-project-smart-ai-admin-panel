import { useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import Sidebar from '../components/navigation/Sidebar'
import TopNav from '../components/navigation/TopNav'

export default function AdminLayout({ children, onLogout, isLoggingOut, email }: { children: ReactNode; onLogout: () => void; isLoggingOut: boolean; email?: string }) {
  const [compact, setCompact] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const sidebar = useRef<HTMLElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)')
    const handleResize = () => { if (media.matches) setMobileOpen(false) }
    media.addEventListener('change', handleResize)
    return () => media.removeEventListener('change', handleResize)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const getControls = () => Array.from(sidebar.current?.querySelectorAll<HTMLElement>('button, a[href]') ?? []).filter(el => el.getClientRects().length)
    getControls()[0]?.focus()
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileOpen(false)
      if (event.key !== 'Tab') return
      const controls = getControls()
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', handleKey)
    const opener = trigger.current
    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKey)
      opener?.focus()
    }
  }, [mobileOpen])

  return (
    <div className="min-h-dvh bg-[#f7f8fc]">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-[#17213c]/35 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />}
      <aside ref={sidebar} id="admin-sidebar" aria-label="Administration" role={mobileOpen ? 'dialog' : undefined} aria-modal={mobileOpen || undefined}
        className={`fixed inset-y-0 left-0 z-50 h-dvh flex-col border-r border-[#e5e8f0] bg-white ${mobileOpen ? 'flex w-[252px]' : 'hidden md:flex'} ${compact ? 'md:w-[68px]' : 'md:w-[252px]'}`}>
        <Sidebar compact={!mobileOpen && compact} onToggleCompact={() => setCompact(value => !value)} onClose={() => setMobileOpen(false)} onUnavailable={label => setNotice(`${label} is not available yet. This destination has not been integrated.`)} />
        {notice && <div role="status" className="absolute inset-x-2 bottom-24 rounded-xl border border-[#e5e8f0] bg-white p-3 text-xs text-[#68728a] shadow-lg">
          <button type="button" aria-label="Dismiss message" onClick={() => setNotice('')} className="float-right ml-1 rounded p-1 focus-visible:outline-2"><X size={14} /></button>{notice}
        </div>}
      </aside>
      <div inert={mobileOpen} className={`min-w-0 ${compact ? 'md:pl-[68px]' : 'md:pl-[252px]'}`}>
        <TopNav navigationTrigger={trigger} navigationOpen={mobileOpen} onOpenNavigation={() => setMobileOpen(true)} onLogout={onLogout} isLoggingOut={isLoggingOut} email={email} />
        {children}
      </div>
    </div>
  )
}
