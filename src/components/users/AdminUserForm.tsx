import { useRef, useState, type FormEvent } from 'react'
import { adminDepartments, adminRoles, type AdminUser, type NewAdminUser } from '../../types/adminUser'
import { validateAdminUser } from '../../utils/adminUsers'
import Modal from '../ui/Modal'

export default function AdminUserForm({ users, onAdd, onClose }: { users: AdminUser[]; onAdd: (user: NewAdminUser) => void; onClose: () => void }) {
  const form = useRef<HTMLFormElement>(null)
  const [value, setValue] = useState<NewAdminUser>({ name: '', email: '', employeeId: '', department: 'IT Services', role: 'Admin', status: 'Active' })
  const [errors, setErrors] = useState<Partial<Record<keyof NewAdminUser, string>>>({})
  function update(key: keyof NewAdminUser, next: string) {
    setValue(previous => ({ ...previous, [key]: next }))
    setErrors(previous => ({ ...previous, [key]: undefined }))
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateAdminUser(value, users)
    setErrors(nextErrors)
    const invalid = Object.keys(nextErrors)[0]
    if (invalid) { form.current?.querySelector<HTMLElement>(`[name="${invalid}"]`)?.focus(); return }
    onAdd({ ...value, name: value.name.trim(), email: value.email.trim(), employeeId: value.employeeId.trim() })
  }
  const inputStyle = 'mt-1.5 h-10 w-full rounded-xl border border-[#e5e8f0] bg-white px-3 text-[13px] text-[#17213c] outline-none focus:border-[#68728a] focus:ring-2 focus:ring-[#68728a]/15'
  return <Modal title="Add Admin User" onClose={onClose}>
    <p className="mb-5 text-xs leading-5 text-[#68728a]">Demo mode: this account is added to this page only. No account is created on the server.</p>
    <form ref={form} onSubmit={submit} noValidate className="space-y-4">
      {([{ key: 'name', label: 'Full Name', type: 'text' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'employeeId', label: 'Employee ID', type: 'text' }] as const).map(field => <div key={field.key}>
        <label htmlFor={`admin-${field.key}`} className="text-xs font-medium text-[#68728a]">{field.label}</label>
        <input id={`admin-${field.key}`} name={field.key} type={field.type} required maxLength={field.key === 'email' ? 254 : 100} value={value[field.key]} onChange={event => update(field.key, event.target.value)} aria-invalid={Boolean(errors[field.key])} aria-describedby={errors[field.key] ? `error-${field.key}` : undefined} className={inputStyle} />
        {errors[field.key] && <p id={`error-${field.key}`} className="mt-1 text-xs text-[#b42318]">{errors[field.key]}</p>}
      </div>)}
      <div><label htmlFor="admin-department" className="text-xs font-medium text-[#68728a]">Department</label><select id="admin-department" name="department" value={value.department} onChange={event => update('department', event.target.value)} className={inputStyle}>{adminDepartments.map(department => <option key={department}>{department}</option>)}</select></div>
      <div className="grid grid-cols-2 gap-4"><div><label htmlFor="admin-role" className="text-xs font-medium text-[#68728a]">Role</label><select id="admin-role" name="role" value={value.role} onChange={event => update('role', event.target.value)} className={inputStyle}>{adminRoles.map(role => <option key={role}>{role}</option>)}</select></div><div><label htmlFor="admin-status" className="text-xs font-medium text-[#68728a]">Status</label><select id="admin-status" name="status" value={value.status} onChange={event => update('status', event.target.value)} className={inputStyle}><option>Active</option><option>Inactive</option></select></div></div>
      <div className="flex justify-end gap-3 border-t border-[#e5e8f0] pt-5"><button type="button" onClick={onClose} className="rounded-xl border border-[#e5e8f0] px-4 py-2.5 text-xs font-semibold focus-visible:outline-2">Cancel</button><button type="submit" className="rounded-xl bg-[#273238] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1a2329] focus-visible:outline-2 focus-visible:outline-offset-2">Add Admin</button></div>
    </form>
  </Modal>
}
