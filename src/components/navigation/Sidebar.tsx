import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronRight, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { navigation } from '../../data/navigation'

type Props = {
  compact: boolean
  onToggleCompact: () => void
  onClose: () => void
  onUnavailable: (label: string) => void
}

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#68728a]'

export default function Sidebar({ compact, onToggleCompact, onClose, onUnavailable }: Props) {
  const pathname = useLocation().pathname
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navigation.filter(item => item.children).map(item => [item.id, true])),
  )

  function destination(item: { label: string; to?: string }, content: ReactNode, className: string) {
    return item.to ? (
      <NavLink to={item.to} onClick={onClose} title={compact ? item.label : undefined}
        className={({ isActive }) => `${className} ${focus} ${isActive ? 'bg-[#273238] text-white' : 'text-[#68728a] hover:bg-[#f7f8fc]'}`}>
        {content}
      </NavLink>
    ) : (
      <button type="button" title={compact ? item.label : `${item.label} — not available yet`}
        onClick={() => onUnavailable(item.label)} className={`${className} ${focus} text-[#68728a] hover:bg-[#f7f8fc]`}>
        {content}
      </button>
    )
  }

  return (
    <>
      <div className="flex h-20 shrink-0 items-center gap-2 border-b border-[#e5e8f0] px-3">
        {!compact && <>
          <img src="/assets/rsulogo.png" alt="Rangsit University" className="h-10 w-[103px] shrink-0 object-contain" />
          <div className="font-display whitespace-nowrap">
            <p className="text-[12px] font-extrabold text-[#273238]">SMART AI</p>
            <p className="mt-1 text-[8px] font-semibold tracking-wider text-[#9ca3af]">ADMIN PORTAL</p>
          </div>
        </>}
        <button type="button" onClick={onToggleCompact} aria-label={compact ? 'Expand sidebar' : 'Collapse sidebar'}
          title={compact ? 'Expand sidebar' : 'Collapse sidebar'} className={`mx-auto hidden rounded-md p-1.5 text-[#68728a] md:block ${focus}`}>
          {compact ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
        <button type="button" onClick={onClose} aria-label="Close navigation" className={`ml-auto rounded-md p-1 text-[#68728a] md:hidden ${focus}`}><X size={18} /></button>
      </div>
      <nav aria-label="Main navigation" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4 font-display [scrollbar-width:thin]">
        <p className={`px-2.5 pt-5 pb-3 text-[10px] font-semibold tracking-[1.2px] text-[#b0b8cc] ${compact ? 'sr-only' : ''}`}>NAVIGATION</p>
        <ul className={`space-y-1 ${compact ? 'pt-3' : ''}`}>
          {navigation.map(item => {
            const Icon = item.icon
            const content = <><Icon size={17} className="shrink-0" aria-hidden="true" /><span className={compact ? 'sr-only' : ''}>{item.label}</span></>
            const row = `flex min-h-10 w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] leading-[19.5px] font-medium ${compact ? 'justify-center' : ''}`
            return <li key={item.id}>
              {item.children ? <>
                <button type="button" aria-expanded={!compact && expanded[item.id]} aria-controls={`nav-${item.id}`} title={compact ? item.label : undefined}
                  className={`${row} ${focus} ${item.children.some(child => child.to && pathname.startsWith(child.to)) ? 'text-[#273238]' : 'text-[#68728a]'} hover:bg-[#f7f8fc]`}
                  onClick={() => {
                    if (compact) {
                      onToggleCompact()
                      setExpanded(previous => ({ ...previous, [item.id]: true }))
                    } else setExpanded(previous => ({ ...previous, [item.id]: !previous[item.id] }))
                  }}>
                  {content}
                  {!compact && <ChevronRight size={14} aria-hidden="true" className={`ml-auto shrink-0 motion-safe:transition-transform ${expanded[item.id] ? 'rotate-90' : ''}`} />}
                </button>
                <ul id={`nav-${item.id}`} hidden={compact || !expanded[item.id]} className="my-1 ml-[22px] border-l-[1.25px] border-[#e5e8f0] py-1 pl-3">
                  {item.children.map(child => <li key={child.id}>
                    {destination(child, <><span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${child.to && pathname.startsWith(child.to) ? 'bg-white' : 'bg-[#e5e8f0]'}`} /><span>{child.label}</span></>, 'flex min-h-[31px] w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] leading-[18.75px] font-medium')}
                  </li>)}
                </ul>
              </> : destination(item, content, row)}
            </li>
          })}
        </ul>
      </nav>
      <div className="shrink-0 border-t border-[#e5e8f0] p-3">
        <div title={compact ? 'Admin User — Super Administrator' : undefined} className={`flex items-center gap-2.5 rounded-xl bg-[#f7f8fc] ${compact ? 'justify-center py-2' : 'p-2.5'}`}>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#273238] text-[13px] font-semibold text-white">A</span>
          <div className={compact ? 'sr-only' : ''}><p className="font-display text-[12px] font-semibold text-[#273238]">Admin User</p><p className="mt-0.5 text-[10px] text-[#9ca3af]">Super Administrator</p></div>
        </div>
      </div>
    </>
  )
}
