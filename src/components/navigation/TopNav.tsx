import { useEffect, useRef, useState, type RefObject } from 'react'
import { Bell, BookOpen, CalendarDays, ChevronDown, GraduationCap, LayoutDashboard, LogOut, Menu, Search, Users } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { announcements, classes } from '../../data/dashboard'

type Props = {
  onOpenNavigation: () => void
  navigationOpen: boolean
  navigationTrigger: RefObject<HTMLButtonElement | null>
  onLogout: () => void
  isLoggingOut: boolean
  email?: string
}

const control = 'rounded-lg p-2 text-[#68728a] hover:bg-[#f7f8fc] focus-visible:outline-2 focus-visible:outline-offset-2'

export default function TopNav({ onOpenNavigation, navigationOpen, navigationTrigger, onLogout, isLoggingOut, email }: Props) {
  const pathname = useLocation().pathname
  const isUserManagement = pathname.startsWith('/admin/users')
  const isStudents = pathname.startsWith('/admin/students')
  const isTimetable = pathname.startsWith('/admin/timetable')
  const isDepartments = pathname.startsWith('/admin/departments')
  const isPrograms = pathname.startsWith('/admin/programs')
  const isCourses = pathname.startsWith('/admin/courses')
  const isSections = pathname.startsWith('/admin/sections')
  const isEnrollments = pathname.startsWith('/admin/enrollments')
  const isAcademic = pathname.startsWith('/admin/faculties') || isDepartments || isPrograms || isCourses || isSections || isEnrollments
  const PageIcon = isAcademic ? BookOpen : isTimetable ? CalendarDays : isStudents ? GraduationCap : isUserManagement ? Users : LayoutDashboard
  const pageLabel = isAcademic ? 'Academic Management' : isTimetable ? 'Timetable' : isStudents ? 'Students' : isUserManagement ? 'User Management' : 'Dashboard'
  const pagePath = isEnrollments ? '/admin/enrollments' : isSections ? '/admin/sections' : isCourses ? '/admin/courses' : isPrograms ? '/admin/programs' : isDepartments ? '/admin/departments' : isAcademic ? '/admin/faculties' : isTimetable ? '/admin/timetable' : isStudents ? '/admin/students' : isUserManagement ? '/admin/users' : '/admin/dashboard'
  const [open, setOpen] = useState<'search' | 'notifications' | 'account' | null>(null)
  const [query, setQuery] = useState('')
  const root = useRef<HTMLElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const notifications = useRef<HTMLButtonElement>(null)
  const account = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const results = [...classes.map(item => `${item.code} · ${item.title} · ${item.room}`), ...announcements.map(item => item.title)].filter(text => text.toLowerCase().includes(query.trim().toLowerCase()))

  useEffect(() => {
    if (!open) return
    const trigger = open === 'search' ? search.current : open === 'notifications' ? notifications.current : account.current
    function close() { setOpen(null); trigger?.focus() }
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !panel.current?.contains(event.target) && !trigger?.contains(event.target)) close()
    }
    function keyboard(event: KeyboardEvent) { if (event.key === 'Escape') close() }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', keyboard)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', keyboard) }
  }, [open])

  return <header ref={root} className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center gap-3 border-b border-[#e5e8f0] bg-white px-4 py-3 sm:px-7">
    <button ref={navigationTrigger} type="button" onClick={onOpenNavigation} aria-label="Open navigation" aria-expanded={navigationOpen} aria-controls="admin-sidebar" className={`${control} md:hidden`}><Menu size={20} /></button>
    <form role="search" onSubmit={event => { event.preventDefault(); setOpen('search') }} className="order-last flex w-full items-center rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] sm:order-none sm:w-64 lg:w-80">
      <button type="submit" aria-label="Search dashboard sample data" className={control}><Search size={16} /></button>
      <input ref={search} type="search" value={query} onChange={event => setQuery(event.target.value)} aria-label="Search students, courses, rooms" placeholder="Search students, courses, rooms…" className="h-9 min-w-0 flex-1 rounded-r-xl bg-transparent pr-3 text-[11px] text-[#68728a] outline-none focus-visible:ring-2 focus-visible:ring-[#68728a]" />
    </form>
    <NavLink to={pagePath} className="flex items-center gap-2 rounded-xl border border-[#e5e8f0] px-3 py-2 text-xs font-medium text-[#68728a] focus-visible:outline-2"><PageIcon size={14} aria-hidden="true" />{pageLabel}</NavLink>
    <div className="flex-1" />
    <button ref={notifications} type="button" aria-label="Notifications" aria-expanded={open === 'notifications'} aria-controls={open === 'notifications' ? 'topnav-panel' : undefined} onClick={() => setOpen(value => value === 'notifications' ? null : 'notifications')} className={`relative ${control}`}><Bell size={18} /><span className="absolute top-1.5 right-2 size-1.5 rounded-full border border-white bg-[#dc4c8d]" /></button>
    <button ref={account} type="button" aria-label="Administrator account" aria-expanded={open === 'account'} aria-controls={open === 'account' ? 'topnav-panel' : undefined} onClick={() => setOpen(value => value === 'account' ? null : 'account')} className="flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"><span className="flex size-8 items-center justify-center rounded-full bg-[#273238] text-[10px] font-bold text-white">AD</span><ChevronDown size={13} className="text-[#9ca3af]" /></button>
    {open && <div ref={panel} id="topnav-panel" className={`absolute top-full z-40 mt-2 max-h-[60dvh] w-[min(360px,calc(100vw-32px))] overflow-y-auto rounded-2xl border border-[#e5e8f0] bg-white p-4 text-xs text-[#68728a] shadow-xl ${open === 'search' ? 'left-4 sm:left-7' : 'right-4 sm:right-7'}`}>
      {open === 'search' && <><h2 className="font-display font-bold text-[#17213c]">Search sample dashboard data</h2><p className="mt-2 text-[11px] leading-5">Demo search covers the displayed courses, rooms, and announcements. Student search is not connected.</p><div role="status" className="mt-3">{!query.trim() ? 'Enter a course, room, or announcement to search.' : !results.length ? 'No matching sample records found.' : <ul className="divide-y divide-[#e5e8f0]">{results.map(result => <li key={result} className="py-2 leading-5">{result}</li>)}</ul>}</div></>}
      {open === 'notifications' && <><h2 className="font-display font-bold text-[#17213c]">Notifications</h2><p className="mt-3 leading-5">Demo preview — no live notification feed is connected.</p><p className="mt-2 leading-5">Recent sample notices are listed in Recent Announcements below.</p></>}
      {open === 'account' && <><h2 className="font-display font-bold text-[#17213c]">Admin User</h2><p className="mt-1">Super Administrator</p>{email && <p className="mt-2 break-all">{email}</p>}<button type="button" disabled={isLoggingOut} onClick={onLogout} className="mt-4 flex w-full items-center gap-2 rounded-xl bg-[#273238] px-3 py-2.5 text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"><LogOut size={14} />{isLoggingOut ? 'Signing out...' : 'Logout'}</button></>}
    </div>}
  </header>
}
