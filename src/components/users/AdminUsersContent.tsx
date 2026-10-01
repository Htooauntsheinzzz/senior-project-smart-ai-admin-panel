import { useState, type KeyboardEvent } from 'react'
import { ChevronDown, Download, Search, UserPlus, X } from 'lucide-react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import type { AdminUsersContext } from './adminUsersContext'
import { adminDepartments, adminRoles, type AdminUser } from '../../types/adminUser'
import { adminUsersCsv, filterAdminUsers } from '../../utils/adminUsers'
import AdminUsersTable from './AdminUsersTable'
import Modal from '../ui/Modal'
import { Panel } from '../dashboard/DashboardUi'

export default function AdminUsersContent() {
  const [tab, setTab] = useState<'admins' | 'roles'>('admins')
  const { users } = useOutletContext<AdminUsersContext>()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [department, setDepartment] = useState('')
  const [page, setPage] = useState(1)
  const [details, setDetails] = useState<AdminUser | null>(null)
  const [message, setMessage] = useState('')
  const filtered = filterAdminUsers(users, query, role, status, department)
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * 8, currentPage * 8)
  const activeCount = filtered.filter(user => user.status === 'Active').length

  function exportUsers() {
    const url = URL.createObjectURL(new Blob(['\ufeff', adminUsersCsv(visible)], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'admin-users.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage(`Exported ${visible.length} displayed admin users to admin-users.csv.`)
  }
  function tabKeyboard(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? 'admins' : event.key === 'End' ? 'roles' : tab === 'admins' ? 'roles' : 'admins'
    setTab(next)
    document.getElementById(`tab-${next}`)?.focus()
  }
  const action = 'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'
  return <main className="min-w-0 px-4 pt-6 pb-4 sm:px-7" id="admin-users-content">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-display text-[22px] leading-[33px] font-bold tracking-[-0.55px] text-[#17213c]">Admin Users</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Manage staff accounts and administrative access.</p></div>{tab === 'admins' && <div className="flex gap-2.5"><button type="button" onClick={exportUsers} disabled={!visible.length} className={`${action} border border-[#e5e8f0] text-[#17213c] hover:bg-white`}><Download size={15} />Export</button><button type="button" onClick={() => navigate('/admin/users/new')} className={`${action} bg-[#273238] text-white shadow-[0_4px_10px_#27323833] hover:bg-[#1a2329]`}><UserPlus size={15} />Add Admin User</button></div>}</div>
    <div className="my-5 flex justify-start"><div role="tablist" aria-label="User Management" className="inline-flex rounded-xl border border-[#e5e8f0] p-1">{([{ id: 'admins', label: 'Admin Users' }, { id: 'roles', label: 'Roles & Permissions' }] as const).map(item => <button key={item.id} id={`tab-${item.id}`} type="button" role="tab" aria-selected={tab === item.id} aria-controls={`panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} onKeyDown={tabKeyboard} onClick={() => setTab(item.id)} className={`rounded-lg px-4 py-2 text-xs font-semibold focus-visible:outline-2 ${tab === item.id ? 'bg-white text-[#17213c] shadow-sm' : 'text-[#68728a] hover:bg-white/60'}`}>{item.label}</button>)}</div></div>
    {tab === 'roles' ? <div role="tabpanel" id="panel-roles" aria-labelledby="tab-roles" tabIndex={0}><Panel title="Roles & Permissions"><p className="text-sm text-[#68728a]">Not available right now</p></Panel></div> : <div role="tabpanel" id="panel-admins" aria-labelledby="tab-admins" className="space-y-5">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[#e5e8f0] bg-white p-4">
        <div className="relative min-w-48 flex-1"><Search size={15} aria-hidden="true" className="pointer-events-none absolute top-3 left-4 text-[#9ca3af]" /><input type="search" aria-label="Search admin users" placeholder="Search by name, email, or employee ID..." value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} className="h-10 w-full rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] pr-3 pl-10 text-xs text-[#17213c] placeholder:text-[#8992a6] focus-visible:outline-2 focus-visible:outline-[#68728a]" /></div>
        {[{ label: 'All Roles', value: role, options: adminRoles, set: setRole, width: 'sm:w-[155px]' }, { label: 'All Status', value: status, options: ['Active', 'Inactive'], set: setStatus, width: 'sm:w-[104px]' }, { label: 'All Departments', value: department, options: adminDepartments, set: setDepartment, width: 'sm:w-[170px]' }].map(filter => <div key={filter.label} className={`relative min-w-0 grow sm:grow-0 ${filter.width}`}><select aria-label={filter.label} value={filter.value} onChange={event => { filter.set(event.target.value); setPage(1) }} className="h-10 w-full appearance-none rounded-xl border border-[#e5e8f0] bg-white pr-8 pl-3 text-xs text-[#68728a] focus-visible:outline-2"><option value="">{filter.label}</option>{filter.options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={12} aria-hidden="true" className="pointer-events-none absolute top-3.5 right-3 text-[#9ca3af]" /></div>)}
      </div>
      <AdminUsersTable users={visible} total={filtered.length} activeCount={activeCount} inactiveCount={filtered.length - activeCount} page={currentPage} pageCount={pageCount} onPage={setPage} onDetails={setDetails} />
    </div>}
    {details && <Modal title="Admin User Details" onClose={() => setDetails(null)}><dl className="space-y-3">{Object.entries({ Name: details.name, 'Employee ID': details.employeeId, Email: details.email, Department: details.department, Role: details.role, Status: details.status, 'Last Login': details.lastLogin, 'Created At': details.createdAt }).map(([label, value]) => <div key={label} className="grid grid-cols-[100px_1fr] gap-3 text-xs leading-5"><dt className="text-[#68728a]">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl><p className="mt-5 text-xs text-[#68728a]">Frontend demo record.</p></Modal>}
    {message && <div role="status" className="fixed right-4 bottom-4 z-40 flex max-w-[calc(100vw-32px)] items-start gap-3 rounded-xl border border-[#e5e8f0] bg-white p-4 text-xs leading-5 text-[#68728a] shadow-lg sm:max-w-sm"><p>{message}</p><button type="button" aria-label="Dismiss message" onClick={() => setMessage('')} className="rounded p-1 focus-visible:outline-2"><X size={16} /></button></div>}
  </main>
}
