import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronDown, Clock3, Download, Search, UserPlus, X } from 'lucide-react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { accountStatusFilters, accountStatusLabels, adminRoles, type AdminUser } from '../../types/adminUser'
import { adminUsersCsv } from '../../utils/adminUsers'
import { apiErrorMessage } from '../../utils/apiError'
import { approveUser, deleteUser, getUserById, getUsers, isValidUserId, rejectUser, type AdminUserPage, type AdminUserSummary } from '../../services/userService'
import AdminUsersTable from './AdminUsersTable'
import Modal from '../ui/Modal'
import { Panel } from '../dashboard/DashboardUi'
import { TABLE_PAGE_SIZE } from '../../utils/pagination'

const PAGE_SIZE = TABLE_PAGE_SIZE

function toRow(user: AdminUserSummary): AdminUser {
  const primaryRole = user.roles.find(role => role.isActive !== false) ?? user.roles[0]
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    // A self-registered account has no employee ID until a Super Admin enters one.
    employeeId: user.employeeId ?? '—',
    email: user.email,
    phoneNumber: user.phoneNumber ?? '',
    departmentId: user.departmentId,
    department: user.departmentId == null ? '—' : `Department ID ${user.departmentId}`,
    roleId: primaryRole?.id ?? null,
    role: primaryRole?.roleName ?? '—',
    status: accountStatusLabels[user.accountStatus] ?? user.accountStatus,
    accountStatus: user.accountStatus,
    lastLogin: '—',
    createdAt: user.createdAt ? user.createdAt.slice(0, 10) : '—',
  }
}

export default function AdminUsersContent() {
  const { id } = useParams()
  return <AdminUsersScreen key={id ?? 'list'} id={id} />
}

function AdminUsersScreen({ id }: { id?: string }) {
  const [tab, setTab] = useState<'admins' | 'roles'>('admins')
  const navigate = useNavigate()
  const location = useLocation()
  const [pageData, setPageData] = useState<AdminUserPage | null>(null)
  const [fetching, setLoading] = useState(true)
  const [loadedQuery, setLoadedQuery] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [department, setDepartment] = useState('')
  const [page, setPage] = useState(1)
  const [listError, setListError] = useState('')
  const [detailAttempt, setDetailAttempt] = useState(0)
  const deleteLock = useRef(false)
  const [detailsId, setDetailsId] = useState<number | null>(() => isValidUserId(id) ? Number(id) : null)
  const [details, setDetails] = useState<AdminUser | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(isValidUserId(id))
  const [detailsError, setDetailsError] = useState(id != null && !isValidUserId(id) ? 'User not found.' : '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [message, setMessage] = useState(() => (location.state as { created?: string } | null)?.created ?? '')
  // Spec 46: registrations that wait for a Super Admin, and the decision about one.
  const [waitingCount, setWaitingCount] = useState(0)
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null)
  const [deciding, setDeciding] = useState(false)
  const [decisionError, setDecisionError] = useState('')
  const decisionLock = useRef(false)

  // Clear the one-shot navigation state so the toast does not reappear on refresh.
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  const requestKey = JSON.stringify([query, role, status, department, page, refreshKey])
  const loading = fetching || loadedQuery !== requestKey

  useEffect(() => {
    let cancelled = false
    const handle = window.setTimeout(async () => {
      setLoading(true)
      setPageData(null)
      setListError('')
      try {
        const data = await getUsers({
          page: page - 1,
          size: PAGE_SIZE,
          search: query.trim() || undefined,
          accountStatus: status || undefined,
          roleId: role ? Number(role) : undefined,
          departmentId: department ? Number(department) : undefined,
        })
        if (!cancelled) {
          if (page > Math.max(1, data.totalPages)) setPage(Math.max(1, data.totalPages))
          else setPageData(data)
        }
      } catch (error) {
        if (!cancelled) setListError(apiErrorMessage(error, 'Unable to load admin users. Please try again.'))
      } finally {
        if (!cancelled) { setLoading(false); setLoadedQuery(requestKey) }
      }
    }, 300)
    return () => { cancelled = true; window.clearTimeout(handle) }
  }, [query, role, status, department, page, refreshKey, requestKey])

  useEffect(() => {
    if (detailsId == null) return
    let cancelled = false
    getUserById(detailsId)
      .then(user => { if (!cancelled) setDetails(toRow(user)) })
      .catch(error => { if (!cancelled) setDetailsError(apiErrorMessage(error, 'Unable to load the admin user. Please try again.')) })
      .finally(() => { if (!cancelled) setDetailsLoading(false) })
    return () => { cancelled = true }
  }, [detailsId, detailAttempt])

  // The number of waiting registrations, loaded again with the list (spec 46 section 4.2).
  useEffect(() => {
    let cancelled = false
    getUsers({ page: 0, size: 1, accountStatus: 'PENDING_APPROVAL' })
      .then(data => { if (!cancelled) setWaitingCount(data.totalElements) })
      .catch(() => { if (!cancelled) setWaitingCount(0) })
    return () => { cancelled = true }
  }, [refreshKey])

  function openDetails(id: number) {
    setDetails(null)
    setDetailsError('')
    setDetailsLoading(true)
    setDetailsId(id)
  }

  const visible = useMemo(() => loading ? [] : (pageData?.content ?? []).map(toRow), [pageData, loading])
  const departmentIds = [...new Set([...(pageData?.content ?? []).flatMap(user => user.departmentId == null ? [] : [String(user.departmentId)]), ...(department ? [department] : [])])]
  const total = loading ? 0 : pageData?.totalElements ?? 0
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
    if (deleteLock.current || decisionLock.current) return
    setDetailsId(null)
    setDetails(null)
    setConfirmDelete(false)
    setDeleteError('')
    setDecision(null)
    setDecisionError('')
    if (id != null) navigate('/admin/users')
  }
  function askDecision(next: 'approve' | 'reject') {
    setDecisionError('')
    setDecision(next)
  }
  async function confirmDecision() {
    if (decisionLock.current || detailsId == null || decision == null || details == null) return
    decisionLock.current = true
    setDeciding(true)
    setDecisionError('')
    const name = details.name
    const proven = details.accountStatus === 'PENDING_APPROVAL'
    try {
      if (decision === 'approve') {
        const approved = await approveUser(detailsId)
        decisionLock.current = false
        setDetails(toRow(approved))
        setDecision(null)
        setMessage(`${name} is approved and gets an email.`)
      } else {
        await rejectUser(detailsId)
        decisionLock.current = false
        closeDetails()
        setMessage(`The registration of ${name} was rejected.${proven ? ' They get an email.' : ''}`)
      }
      setRefreshKey(key => key + 1)
    } catch (error) {
      setDecisionError(apiErrorMessage(error, 'Unable to complete the request. Please try again.'))
      // Somebody else may have decided already: show the account as it is now.
      const code = (error as { response?: { data?: { code?: string } } })?.response?.data?.code
      if (code === 'REGISTRATION_NOT_PENDING' || code === 'USER_NOT_FOUND') {
        setDetailAttempt(previous => previous + 1)
        setRefreshKey(key => key + 1)
      }
    } finally {
      decisionLock.current = false
      setDeciding(false)
    }
  }
  async function confirmDeleteUser() {
    if (deleteLock.current || detailsId == null) return
    deleteLock.current = true
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteUser(detailsId)
      deleteLock.current = false
      closeDetails()
      setRefreshKey(key => key + 1)
      setMessage('Admin user deleted successfully.')
    } catch (error) {
      setDeleteError(apiErrorMessage(error, 'Unable to complete the request. Please try again.'))
    } finally {
      deleteLock.current = false
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
    { label: 'All Status', value: status, options: accountStatusFilters, set: setStatus, width: 'sm:w-[170px]' },
    { label: 'All Departments', value: department, options: departmentIds.map(value => ({ value, label: `Department ID ${value}` })), set: setDepartment, width: 'sm:w-[170px]' },
  ]
  return <main className="min-w-0 px-4 pt-6 pb-4 sm:px-7" id="admin-users-content">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-display text-[22px] leading-[33px] font-bold tracking-[-0.55px] text-[#17213c]">Admin Users</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Manage staff accounts and administrative access.</p></div>{tab === 'admins' && <div className="flex gap-2.5"><button type="button" onClick={exportUsers} disabled={!visible.length} className={`${action} border border-[#e5e8f0] text-[#17213c] hover:bg-white`}><Download size={15} />Export</button><button type="button" onClick={() => navigate('/admin/users/new')} className={`${action} bg-[#273238] text-white shadow-[0_4px_10px_#27323833] hover:bg-[#1a2329]`}><UserPlus size={15} />Add Admin User</button></div>}</div>
    <div className="my-5 flex justify-start"><div role="tablist" aria-label="User Management" className="inline-flex rounded-xl border border-[#e5e8f0] p-1">{([{ id: 'admins', label: 'Admin Users' }, { id: 'roles', label: 'Roles & Permissions' }] as const).map(item => <button key={item.id} id={`tab-${item.id}`} type="button" role="tab" aria-selected={tab === item.id} aria-controls={`panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} onKeyDown={tabKeyboard} onClick={() => setTab(item.id)} className={`rounded-lg px-4 py-2 text-xs font-semibold focus-visible:outline-2 ${tab === item.id ? 'bg-white text-[#17213c] shadow-sm' : 'text-[#68728a] hover:bg-white/60'}`}>{item.label}</button>)}</div></div>
    {tab === 'roles' ? <div role="tabpanel" id="panel-roles" aria-labelledby="tab-roles" tabIndex={0}><Panel title="Roles & Permissions"><p className="text-sm text-[#68728a]">Not available right now</p></Panel></div> : <div role="tabpanel" id="panel-admins" aria-labelledby="tab-admins" className="space-y-5">
      {waitingCount > 0 && <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-[13px] leading-5 text-[#92400e]">
        <p className="flex items-center gap-2"><Clock3 size={16} aria-hidden="true" className="shrink-0" /><span><strong className="font-semibold">{waitingCount}</strong> {waitingCount === 1 ? 'registration' : 'registrations'} waiting for approval</span></p>
        {status !== 'PENDING_APPROVAL' && <button type="button" onClick={() => { setStatus('PENDING_APPROVAL'); setPage(1) }} className="rounded-lg border border-[#fcd34d] bg-white px-3 py-1.5 text-xs font-semibold text-[#92400e] hover:bg-[#fef3c7] focus-visible:outline-2">Show</button>}
      </div>}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[#e5e8f0] bg-white p-4">
        <div className="relative min-w-48 flex-1"><Search size={15} aria-hidden="true" className="pointer-events-none absolute top-3 left-4 text-[#9ca3af]" /><input type="search" aria-label="Search admin users" placeholder="Search by name, email, or employee ID..." value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} className="h-10 w-full rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] pr-3 pl-10 text-xs text-[#17213c] placeholder:text-[#8992a6] focus-visible:outline-2 focus-visible:outline-[#68728a]" /></div>
        {filters.map(filter => <div key={filter.label} className={`relative min-w-0 grow sm:grow-0 ${filter.width}`}><select aria-label={filter.label} value={filter.value} onChange={event => { filter.set(event.target.value); setPage(1) }} className="h-10 w-full appearance-none rounded-xl border border-[#e5e8f0] bg-white pr-8 pl-3 text-xs text-[#68728a] focus-visible:outline-2"><option value="">{filter.label}</option>{filter.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={12} aria-hidden="true" className="pointer-events-none absolute top-3.5 right-3 text-[#9ca3af]" /></div>)}
      </div>
      <AdminUsersTable users={visible} total={total} activeCount={activeCount} inactiveCount={visible.filter(user => user.accountStatus === 'INACTIVE').length} loading={loading} error={loading ? '' : listError} onRetry={() => setRefreshKey(key => key + 1)} page={currentPage} pageCount={pageCount} onPage={setPage} onDetails={user => openDetails(user.id)} />
      <p className="text-xs leading-5 text-[#68728a]">Status counts describe the displayed page. Department names and a complete department lookup are not provided by the current API; the filter uses department IDs returned on this page.</p>
    </div>}
    {(detailsId != null || id != null) && <Modal title="Admin User Details" onClose={closeDetails}>
      {detailsLoading ? <p role="status" className="text-sm text-[#68728a]">Loading user…</p> : detailsError ? <div role="alert" className="text-sm text-[#68728a]">{detailsError}{detailsId != null && <button type="button" onClick={() => { setDetailsLoading(true); setDetailsError(''); setDetailAttempt(previous => previous + 1) }} className={`${action} mt-3 border border-[#e5e8f0]`}>Retry</button>}</div> : details && <>
        {details.accountStatus === 'PENDING_APPROVAL' && <p className="mb-4 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3.5 py-2.5 text-xs leading-5 text-[#92400e]">This person registered with an @rsu.ac.th address and confirmed it. Approve to let them sign in, or reject the registration.</p>}
        {details.accountStatus === 'PENDING_VERIFICATION' && <p className="mb-4 rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] px-3.5 py-2.5 text-xs leading-5 text-[#68728a]">This person has not confirmed the email address yet.</p>}
        <dl className="space-y-3">{Object.entries({ Name: details.name, 'Employee ID': details.employeeId, Email: details.email, 'Phone Number': details.phoneNumber || '—', Department: details.department, Role: details.role, Status: details.status, 'Last Login': details.lastLogin, 'Created At': details.createdAt }).map(([label, value]) => <div key={label} className="grid grid-cols-[100px_1fr] gap-3 text-xs leading-5"><dt className="text-[#68728a]">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {details.accountStatus === 'PENDING_APPROVAL' && <button type="button" onClick={() => askDecision('approve')} className={`${action} bg-[#15803d] text-white shadow-[0_4px_10px_#15803d33] hover:bg-[#166534]`}>Approve</button>}
          {(details.accountStatus === 'PENDING_APPROVAL' || details.accountStatus === 'PENDING_VERIFICATION') && <button type="button" onClick={() => askDecision('reject')} className={`${action} border border-[#fecaca] text-[#b91c1c] hover:bg-[#fef2f2]`}>Reject</button>}
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
    {decision && detailsId != null && details && <Modal title={decision === 'approve' ? 'Approve registration?' : 'Reject registration?'} busy={deciding} onClose={() => { if (!deciding) { setDecision(null); setDecisionError('') } }}>
      {decision === 'approve' ? <div className="space-y-3 text-sm leading-6 text-[#68728a]">
        <p><strong className="font-semibold text-[#17213c]">{details.name}</strong> (<span className="break-all">{details.email}</span>) can sign in as <strong className="font-semibold text-[#17213c]">{details.role}</strong> and gets an email.</p>
        <p>To give another role, use Edit first.</p>
      </div> : <div className="space-y-3 text-sm leading-6 text-[#68728a]">
        <p>The account of <strong className="font-semibold text-[#17213c]">{details.name}</strong> (<span className="break-all">{details.email}</span>) is deleted, and this email address cannot register again.</p>
        <p>{details.accountStatus === 'PENDING_APPROVAL' ? 'They get an email that the registration was not approved.' : 'No email is sent, because the address was never confirmed.'}</p>
      </div>}
      {decisionError && <p role="alert" className="mt-3 text-xs text-[#d80255]">{decisionError}</p>}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={() => { setDecision(null); setDecisionError('') }} disabled={deciding} className={`${action} border border-[#e5e8f0] text-[#17213c] hover:bg-white`}>Cancel</button>
        <button type="button" onClick={confirmDecision} disabled={deciding} className={`${action} text-white ${decision === 'approve' ? 'bg-[#15803d] shadow-[0_4px_10px_#15803d33] hover:bg-[#166534]' : 'bg-[#b91c1c] shadow-[0_4px_10px_#b91c1c33] hover:bg-[#991b1b]'}`}>{deciding ? decision === 'approve' ? 'Approving…' : 'Rejecting…' : decision === 'approve' ? 'Approve' : 'Reject'}</button>
      </div>
    </Modal>}
    {message && <div role="status" className="fixed right-4 bottom-4 z-40 flex max-w-[calc(100vw-32px)] items-start gap-3 rounded-xl border border-[#e5e8f0] bg-white p-4 text-xs leading-5 text-[#68728a] shadow-lg sm:max-w-sm"><p>{message}</p><button type="button" aria-label="Dismiss message" onClick={() => setMessage('')} className="rounded p-1 focus-visible:outline-2"><X size={16} /></button></div>}
  </main>
}
