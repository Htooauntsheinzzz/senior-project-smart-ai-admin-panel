import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import { ChevronDown, Download, Search, UserPlus, X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { accountStatusLabels, accountStatuses, adminRoles, type AdminUser } from '../../types/adminUser'
import { adminUsersCsv } from '../../utils/adminUsers'
import { apiErrorMessage } from '../../utils/apiError'
import { deleteUser, getUserById, getUsers, type AdminUserPage, type AdminUserSummary } from '../../services/userService'
import { getDepartments, type DepartmentOption } from '../../services/departmentService'
import AdminUsersTable from './AdminUsersTable'
import Modal from '../ui/Modal'
import { Panel } from '../dashboard/DashboardUi'

const PAGE_SIZE = 8

function toRow(user: AdminUserSummary, departments: DepartmentOption[]): AdminUser {
  const primaryRole = user.roles.find(role => role.isActive !== false) ?? user.roles[0]
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    employeeId: user.employeeId,
    email: user.email,
    phoneNumber: user.phoneNumber ?? '',
    departmentId: user.departmentId,
    department: departments.find(department => department.id === user.departmentId)?.departmentName ?? '—',
    roleId: primaryRole?.id ?? null,
    role: primaryRole?.roleName ?? '—',
    status: accountStatusLabels[user.accountStatus] ?? user.accountStatus,
    accountStatus: user.accountStatus,
    lastLogin: '—',
    createdAt: user.createdAt ? user.createdAt.slice(0, 10) : '—',
  }
}

export default function AdminUsersContent() {
  const [tab, setTab] = useState<'admins' | 'roles'>('admins')
  const navigate = useNavigate()
  const location = useLocation()
  const [pageData, setPageData] = useState<AdminUserPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [department, setDepartment] = useState('')
  const [page, setPage] = useState(1)
  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [detailsId, setDetailsId] = useState<number | null>(null)
  const [details, setDetails] = useState<AdminUser | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [message, setMessage] = useState(() => (location.state as { created?: string } | null)?.created ?? '')

  // Clear the one-shot navigation state so the toast does not reappear on refresh.
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  useEffect(() => {
    let cancelled = false
    getDepartments({ size: 100, status: 'ACTIVE', sort: 'departmentName,asc' })
      .then(data => { if (!cancelled) setDepartments(data.content ?? []) })
      .catch(() => { if (!cancelled) setMessage('Unable to load departments. The department filter and names may be incomplete.') })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const handle = window.setTimeout(async () => {
      setLoading(true)
      try {
        const data = await getUsers({
          page: page - 1,
          size: PAGE_SIZE,
          search: query.trim() || undefined,
          accountStatus: status || undefined,
          roleId: role ? Number(role) : undefined,
          departmentId: department ? Number(department) : undefined,
        })
        if (!cancelled) setPageData(data)
      } catch (error) {
        if (!cancelled) setMessage(apiErrorMessage(error, 'Unable to load admin users. Please try again.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)
    return () => { cancelled = true; window.clearTimeout(handle) }
  }, [query, role, status, department, page, refreshKey])

  useEffect(() => {
    if (detailsId == null) return
    let cancelled = false
    getUserById(detailsId)
      .then(user => { if (!cancelled) setDetails(toRow(user, departments)) })
      .catch(error => { if (!cancelled) setDetailsError(apiErrorMessage(error, 'Unable to load the admin user. Please try again.')) })
      .finally(() => { if (!cancelled) setDetailsLoading(false) })
    return () => { cancelled = true }
  }, [detailsId, departments])

  function openDetails(id: number) {
    setDetails(null)
    setDetailsError('')
    setDetailsLoading(true)
    setDetailsId(id)
  }

  const visible = useMemo(() => (pageData?.content ?? []).map(user => toRow(user, departments)), [pageData, departments])
  const total = pageData?.totalElements ?? 0
  const pageCount = Math.max(1, pageData?.totalPages ?? 1)
  const currentPage = Math.min(page, pageCount)
  const activeCount = visible.filter(user => user.accountStatus === 'ACTIVE').length

  function exportUsers() {
    const url = URL.createObjectURL(new Blob(['\ufeff', adminUsersCsv(visible)], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'admin-users.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage(`Exported ${visible.length} displayed admin users to admin-users.csv.`)
  }
  function closeDetails() {
    setDetailsId(null)
    setDetails(null)
    setConfirmDelete(false)
    setDeleteError('')
  }
  async function confirmDeleteUser() {
    if (deleting || detailsId == null) return
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteUser(detailsId)
      closeDetails()
      setRefreshKey(key => key + 1)
      setMessage('Admin user deleted successfully.')
    } catch (error) {
      setDeleteError(apiErrorMessage(error, 'Unable to complete the request. Please try again.'))
    } finally {
      setDeleting(false)
    }
  }
  function tabKeyboard(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? 'admins' : event.key === 'End' ? 'roles' : tab === 'admins' ? 'roles' : 'admins'
    setTab(next)
    document.getElementById(`tab-${next}`)?.focus()
  }
  const action = 'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'
  const filters: { label: string; value: string; options: readonly { value: string; label: string }[]; set: (value: string) => void; width: string }[] = [
    { label: 'All Roles', value: role, options: adminRoles.map(item => ({ value: String(item.id), label: item.name })), set: setRole, width: 'sm:w-[155px]' },
    { label: 'All Status', value: status, options: accountStatuses, set: setStatus, width: 'sm:w-[104px]' },
    { label: 'All Departments', value: department, options: departments.map(item => ({ value: String(item.id), label: item.departmentName })), set: setDepartment, width: 'sm:w-[170px]' },
  ]
  return <main className="min-w-0 px-4 pt-6 pb-4 sm:px-7" id="admin-users-content">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-display text-[22px] leading-[33px] font-bold tracking-[-0.55px] text-[#17213c]">Admin Users</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Manage staff accounts and administrative access.</p></div>{tab === 'admins' && <div className="flex gap-2.5"><button type="button" onClick={exportUsers} disabled={!visible.length} className={`${action} border border-[#e5e8f0] text-[#17213c] hover:bg-white`}><Download size={15} />Export</button><button type="button" onClick={() => navigate('/admin/users/new')} className={`${action} bg-[#273238] text-white shadow-[0_4px_10px_#27323833] hover:bg-[#1a2329]`}><UserPlus size={15} />Add Admin User</button></div>}</div>
    <div className="my-5 flex justify-start"><div role="tablist" aria-label="User Management" className="inline-flex rounded-xl border border-[#e5e8f0] p-1">{([{ id: 'admins', label: 'Admin Users' }, { id: 'roles', label: 'Roles & Permissions' }] as const).map(item => <button key={item.id} id={`tab-${item.id}`} type="button" role="tab" aria-selected={tab === item.id} aria-controls={`panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} onKeyDown={tabKeyboard} onClick={() => setTab(item.id)} className={`rounded-lg px-4 py-2 text-xs font-semibold focus-visible:outline-2 ${tab === item.id ? 'bg-white text-[#17213c] shadow-sm' : 'text-[#68728a] hover:bg-white/60'}`}>{item.label}</button>)}</div></div>
    {tab === 'roles' ? <div role="tabpanel" id="panel-roles" aria-labelledby="tab-roles" tabIndex={0}><Panel title="Roles & Permissions"><p className="text-sm text-[#68728a]">Not available right now</p></Panel></div> : <div role="tabpanel" id="panel-admins" aria-labelledby="tab-admins" className="space-y-5">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[#e5e8f0] bg-white p-4">
        <div className="relative min-w-48 flex-1"><Search size={15} aria-hidden="true" className="pointer-events-none absolute top-3 left-4 text-[#9ca3af]" /><input type="search" aria-label="Search admin users" placeholder="Search by name, email, or employee ID..." value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} className="h-10 w-full rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] pr-3 pl-10 text-xs text-[#17213c] placeholder:text-[#8992a6] focus-visible:outline-2 focus-visible:outline-[#68728a]" /></div>
        {filters.map(filter => <div key={filter.label} className={`relative min-w-0 grow sm:grow-0 ${filter.width}`}><select aria-label={filter.label} value={filter.value} onChange={event => { filter.set(event.target.value); setPage(1) }} className="h-10 w-full appearance-none rounded-xl border border-[#e5e8f0] bg-white pr-8 pl-3 text-xs text-[#68728a] focus-visible:outline-2"><option value="">{filter.label}</option>{filter.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={12} aria-hidden="true" className="pointer-events-none absolute top-3.5 right-3 text-[#9ca3af]" /></div>)}
      </div>
      <AdminUsersTable users={visible} total={total} activeCount={activeCount} inactiveCount={visible.length - activeCount} loading={loading} page={currentPage} pageCount={pageCount} onPage={setPage} onDetails={user => openDetails(user.id)} />
    </div>}
    {detailsId != null && <Modal title="Admin User Details" onClose={closeDetails}>
      {detailsLoading ? <p className="text-sm text-[#68728a]">Loading user…</p> : detailsError ? <p className="text-sm text-[#68728a]">{detailsError}</p> : details && <>
        <dl className="space-y-3">{Object.entries({ Name: details.name, 'Employee ID': details.employeeId, Email: details.email, 'Phone Number': details.phoneNumber || '—', Department: details.department, Role: details.role, Status: details.status, 'Last Login': details.lastLogin, 'Created At': details.createdAt }).map(([label, value]) => <div key={label} className="grid grid-cols-[100px_1fr] gap-3 text-xs leading-5"><dt className="text-[#68728a]">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={() => navigate(`/admin/users/${detailsId}/edit`)} className={`${action} border border-[#e5e8f0] text-[#17213c] hover:bg-white`}>Edit</button>
          <button type="button" onClick={() => { setDeleteError(''); setConfirmDelete(true) }} className={`${action} bg-[#273238] text-white shadow-[0_4px_10px_#27323833] hover:bg-[#1a2329]`}>Delete</button>
        </div>
      </>}
    </Modal>}
    {confirmDelete && detailsId != null && <Modal title="Delete admin user?" onClose={() => { if (!deleting) setConfirmDelete(false) }}>
      <p className="text-sm text-[#68728a]">This will delete the admin user{details ? ` ${details.name}` : ''}. This action cannot be undone from this screen.</p>
      {deleteError && <p role="alert" className="mt-3 text-xs text-[#d80255]">{deleteError}</p>}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={() => setConfirmDelete(false)} disabled={deleting} className={`${action} border border-[#e5e8f0] text-[#17213c] hover:bg-white`}>Cancel</button>
        <button type="button" onClick={confirmDeleteUser} disabled={deleting} className={`${action} bg-[#273238] text-white shadow-[0_4px_10px_#27323833] hover:bg-[#1a2329]`}>{deleting ? 'Deleting…' : 'Delete'}</button>
      </div>
    </Modal>}
    {message && <div role="status" className="fixed right-4 bottom-4 z-40 flex max-w-[calc(100vw-32px)] items-start gap-3 rounded-xl border border-[#e5e8f0] bg-white p-4 text-xs leading-5 text-[#68728a] shadow-lg sm:max-w-sm"><p>{message}</p><button type="button" aria-label="Dismiss message" onClick={() => setMessage('')} className="rounded p-1 focus-visible:outline-2"><X size={16} /></button></div>}
  </main>
}
