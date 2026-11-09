import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, CalendarRange, List } from 'lucide-react'
import { secondaryButton } from '../campus/CampusUi'
import { tabId, tabPanelId } from '../../utils/timetable'

// Page header, Calendar/List switch, primary action and tabs from Figma node 34:4266. The filters row (node 34:4322)
// is rendered as children inside the same bordered container. The Figma icon assets (IcCalGrid, IcList, IcPlus) could
// not be downloaded (figma.com asset URLs answer 403 from this environment), so the project's lucide icons and the
// existing /assets/figma/faculty-plus.svg stand in; see spec-md/00-changes-and-decisions.md.

export type TimetableView = 'calendar' | 'list'
export type TimetableTab = 'timetable' | 'conflicts'

const gradientButton = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(168.8deg,#273238_0%,#1a2329_100%)] px-4 py-2 text-[13px] leading-[19.5px] font-semibold text-white shadow-[0px_4px_7px_0px_rgba(39,50,56,0.27)] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const switchButton = (active: boolean) => `flex h-full items-center gap-1.5 px-3 text-[12.5px] leading-[18.75px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${active ? 'bg-[#273238] text-white' : 'bg-white text-[#68728a] hover:bg-[#f7f8fc]'}`

const tabs: { id: TimetableTab; icon: string; label: string }[] = [
  { id: 'timetable', icon: '🗓', label: 'Class Timetable' },
  { id: 'conflicts', icon: '⚠️', label: 'Schedule Conflicts' },
]

export default function TimetableToolbar({ view, onViewChange, tab, onTabChange, conflictCount, onAdd, children }: {
  view: TimetableView
  onViewChange: (view: TimetableView) => void
  tab: TimetableTab
  onTabChange: (tab: TimetableTab) => void
  /** Real conflict total from GET /timetable/conflicts; null while loading or unavailable (no badge is shown then). */
  conflictCount: number | null
  onAdd: () => void
  children?: ReactNode
}) {
  const tabRefs = useRef<Record<TimetableTab, HTMLButtonElement | null>>({ timetable: null, conflicts: null })

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex(entry => entry.id === tab)
    let next: number | null = null
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    if (next === null) return
    event.preventDefault()
    onTabChange(tabs[next].id)
    tabRefs.current[tabs[next].id]?.focus()
  }

  return <header className="border-b-[1.25px] border-[#e5e8f0] bg-white">
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 pt-5 pb-3 sm:px-7">
      <div className="min-w-0">
        <h1 className="font-display text-[22px] leading-[33px] font-extrabold text-[#17213c]">Class Timetable</h1>
        <p className="pt-0.5 text-[13.5px] leading-[20.25px] text-[#68728a]">Weekly schedule view across all faculties and departments.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <div role="group" aria-label="Timetable view" className="flex h-[37px] overflow-hidden rounded-xl border-[1.25px] border-[#e5e8f0]">
          <button type="button" aria-pressed={view === 'calendar'} onClick={() => onViewChange('calendar')} className={switchButton(view === 'calendar')}><CalendarDays size={13} aria-hidden="true" />Calendar</button>
          <button type="button" aria-pressed={view === 'list'} onClick={() => onViewChange('list')} className={switchButton(view === 'list')}><List size={13} aria-hidden="true" />List</button>
        </div>
        <Link to="/admin/academic-terms" className={secondaryButton}><CalendarRange size={14} aria-hidden="true" />Manage Terms</Link>
        <button type="button" onClick={onAdd} className={gradientButton}><img src="/assets/figma/faculty-plus.svg" width="16" height="16" alt="" />Add Class Schedule</button>
      </div>
    </div>
    <div role="tablist" aria-label="Timetable sections" onKeyDown={onTabKeyDown} className="flex gap-1 overflow-x-auto px-4 sm:px-7">
      {tabs.map(entry => {
        const active = entry.id === tab
        const count = entry.id === 'conflicts' && conflictCount !== null && conflictCount > 0 ? conflictCount : null
        return <button key={entry.id} ref={element => { tabRefs.current[entry.id] = element }} type="button" role="tab" id={tabId(entry.id)} aria-selected={active} aria-controls={tabPanelId(entry.id)} tabIndex={active ? 0 : -1} onClick={() => onTabChange(entry.id)}
          className={`flex shrink-0 items-center gap-1.5 rounded-t-xl border-b-[1.25px] px-4 py-2.5 text-[13px] leading-[19.5px] font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${active ? 'border-[#273238] bg-[rgba(39,50,56,0.04)] text-[#273238]' : 'border-transparent text-[#68728a] hover:bg-[rgba(39,50,56,0.03)]'}`}>
          <span aria-hidden="true">{entry.icon}</span>{entry.label}
          {count !== null && <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d80255] px-1 text-[9px] leading-[13.5px] font-bold text-white"><span className="sr-only">, </span>{count > 99 ? '99+' : count}<span className="sr-only"> conflicts</span></span>}
        </button>
      })}
    </div>
    {children}
  </header>
}
