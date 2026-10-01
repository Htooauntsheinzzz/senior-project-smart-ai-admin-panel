import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react'
import type { AdminRole, AdminUser } from '../../types/adminUser'
import { Badge } from '../dashboard/DashboardUi'

const roleColors: Record<AdminRole, string> = {
  'Super Admin': 'bg-[#fee2e2] text-[#ff0000]',
  'Academic Admin': 'bg-[#ede9fe] text-[#8b3dff]',
  'Registrar Admin': 'bg-[#dbeafe] text-[#0055ff]',
  'AI Content Admin': 'bg-[#fce7f3] text-[#ff0066]',
  'Campus Admin': 'bg-[#d1fae5] text-[#009966]',
  'Admin': 'bg-[#f2f4f8] text-[#68728a]',
}
const avatars = ['from-[#e48100] to-[#7567f5]', 'from-[#00b4e5] to-[#2860fa]', 'from-[#6865f5] to-[#d70065]', 'from-[#e40055] to-[#7066f7]', 'from-[#8633f2] to-[#d67b00]', 'from-[#df7900] to-[#9033e2]', 'from-[#df8300] to-[#00996b]', 'from-[#7265f5] to-[#d98200]']

export default function AdminUsersTable({ users, total, activeCount, inactiveCount, page, pageCount, onPage, onDetails }: {
  users: AdminUser[]; total: number; activeCount: number; inactiveCount: number; page: number; pageCount: number; onPage: (page: number) => void; onDetails: (user: AdminUser) => void
}) {
  const start = total ? (page - 1) * 8 + 1 : 0
  const paginationButton = 'flex size-8 items-center justify-center rounded-lg border border-[#e5e8f0] text-xs font-medium text-[#68728a] hover:bg-[#f7f8fc] focus-visible:outline-2 disabled:cursor-default disabled:opacity-40'
  return <section aria-label="Admin users list" className="overflow-hidden rounded-2xl border border-[#e5e8f0] bg-white">
    <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 px-5 py-3 text-xs text-[#68728a]">
      <p role="status">Showing <strong className="font-semibold text-[#17213c]">{start}–{total ? start + users.length - 1 : 0}</strong> of <strong className="font-semibold text-[#17213c]">{total}</strong> admin users</p>
      <div className="flex gap-3 text-[11px]"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#22c55e]" />{activeCount} active</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#9ca3af]" />{inactiveCount} inactive</span></div>
    </div>
    <div className="overflow-x-auto" role="region" aria-label="Admin users table, scroll horizontally on small screens" tabIndex={0}>
      <table className="w-full min-w-[1150px] table-fixed border-collapse text-left text-[13px] text-[#17213c]">
        <caption className="sr-only">Admin accounts. Frontend demo data; changes are not saved to a server.</caption>
        <colgroup>{[17.6, 10.4, 14.7, 13.9, 13.1, 10, 12.1, 8.2].map((width, index) => <col key={index} style={{ width: `${width}%` }} />)}</colgroup>
        <thead className="border-y border-[#e5e8f0] bg-[#f7f8fc] text-[11px] font-semibold text-[#68728a] uppercase"><tr>{['Admin', 'Employee ID', 'Email', 'Department', 'Role', 'Status', 'Last Login', 'Actions'].map(label => <th key={label} scope="col" className="h-[58px] px-5 py-3 font-semibold">{label === 'Employee ID' ? <>Employee<br />ID</> : label}</th>)}</tr></thead>
        <tbody className="divide-y divide-[#e5e8f0]">{users.map(user => <tr key={user.id} className="hover:bg-[#f7f8fc]/60">
          <th scope="row" className="px-5 py-3.5 text-left font-medium"><div className="flex min-h-9 items-center gap-3"><span aria-hidden="true" className={`flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-[11px] font-semibold text-white ${avatars[(user.id - 1) % avatars.length]}`}>{user.name.split(/\s+/).slice(0, 2).map(name => name[0]).join('')}</span><span className="text-[13px] leading-5 font-semibold">{user.name}</span></div></th>
          <td className="px-5 py-3.5"><span className="rounded-lg bg-[#f7f8fc] px-2 py-1 font-mono text-[11px] font-semibold whitespace-nowrap text-[#68728a]">{user.employeeId}</span></td>
          <td className="px-5 py-3.5 leading-5 whitespace-nowrap text-[#68728a]">{user.email}</td>
          <td className="px-5 py-3.5 leading-5">{user.department}</td>
          <td className="px-5 py-3.5"><Badge className={`rounded-full! text-[11px]! font-medium! ${roleColors[user.role]}`}>{user.role === 'AI Content Admin' ? <span>AI Content<br />Admin</span> : user.role}</Badge></td>
          <td className="px-5 py-3.5"><Badge className={`gap-1.5 rounded-full! text-[11px]! font-medium! ${user.status === 'Active' ? 'bg-[#dcfce7] text-[#008a34]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}><span aria-hidden="true" className={`size-1.5 rounded-full ${user.status === 'Active' ? 'bg-[#22c55e]' : 'bg-[#9ca3af]'}`} />{user.status}</Badge></td>
          <td className="px-5 py-3.5 leading-5 text-[#68728a]">{user.lastLogin}</td>
          <td className="px-5 py-3.5"><button type="button" title="View admin details" aria-label={`View details for ${user.name}`} onClick={() => onDetails(user)} className="rounded-lg p-1.5 text-[#68728a] hover:bg-[#f7f8fc] focus-visible:outline-2"><MoreVertical size={16} /></button></td>
        </tr>)}</tbody>
      </table>
    </div>
    {!users.length && <p className="px-5 py-12 text-center text-sm text-[#68728a]">No admin users found. Try a different search or filter.</p>}
    <nav aria-label="Admin users pagination" className="flex min-h-16 items-center justify-between gap-3 border-t border-[#e5e8f0] px-5 py-4 text-xs text-[#68728a]">
      <p>Page {page} of {pageCount}</p><div className="flex flex-wrap gap-1.5"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onPage(page - 1)} className={paginationButton}><ChevronLeft size={14} /></button>{Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} type="button" aria-label={`Page ${number}`} aria-current={number === page ? 'page' : undefined} onClick={() => onPage(number)} className={`${paginationButton} ${number === page ? 'border-[#273238]! bg-[#273238]! text-white!' : ''}`}>{number}</button>)}<button type="button" aria-label="Next page" disabled={page === pageCount} onClick={() => onPage(page + 1)} className={paginationButton}><ChevronRight size={14} /></button></div>
    </nav>
  </section>
}
