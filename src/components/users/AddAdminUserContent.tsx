import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { adminDepartments, adminRoles } from '../../types/adminUser'
import { adminFormToDemoUser, emptyAdminForm, validateAdminForm, type AdminFormErrors, type AdminFormValues } from '../../utils/addAdminUser'
import type { AdminUsersContext } from './adminUsersContext'
import Modal from '../ui/Modal'

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section aria-label={title} className="rounded-2xl border-[0.625px] border-[#e5e8f0] bg-white p-4 sm:p-6">
    <h2 className="font-display text-[15.5px] leading-[23.25px] font-bold">{title}</h2>
    <p className="mt-1 text-[13px] leading-[19.5px] text-[#68728a]">{description}</p>
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  </section>
}

export default function AddAdminUserContent() {
  const { users, setUsers } = useOutletContext<AdminUsersContext>()
  const navigate = useNavigate()
  const [value, setValue] = useState<AdminFormValues>({ ...emptyAdminForm })
  const [errors, setErrors] = useState<AdminFormErrors>({})
  const [visible, setVisible] = useState({ temporaryPassword: false, confirmPassword: false })
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [created, setCreated] = useState(false)
  const [discard, setDiscard] = useState(false)
  const submitting = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  const dirty = Object.keys(emptyAdminForm).some(key => value[key as keyof AdminFormValues] !== emptyAdminForm[key as keyof AdminFormValues])

  useEffect(() => {
    if (!dirty) return
    function beforeUnload(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [dirty])

  function update<K extends keyof AdminFormValues>(field: K, next: AdminFormValues[K]) {
    setValue(previous => ({ ...previous, [field]: next }))
    setErrors(previous => ({ ...previous, [field]: undefined }))
    setFeedback('')
  }
  function leave() { if (dirty) setDiscard(true); else navigate('/admin/users') }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current || created) return
    const nextErrors = validateAdminForm(value, users)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setFeedback('Please correct the highlighted fields.')
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    submitting.current = true
    setPending(true)
    try {
      // Yield one frame so pending feedback is painted. No simulated API request:
      // this creates only a local table record, never an authenticated account.
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
      const record = adminFormToDemoUser(value)
      setUsers(previous => [{ ...record, id: Math.max(0, ...previous.map(user => user.id)) + 1, createdAt: new Date().toISOString().slice(0, 10), lastLogin: 'Never' }, ...previous])
      setValue({ ...emptyAdminForm })
      setVisible({ temporaryPassword: false, confirmPassword: false })
      setCreated(true)
      setFeedback(`${record.name} added to the local demo list. No server account was created. Passwords were cleared; first-login password changes are not enforced by this demo.`)
    } catch {
      setFeedback('Unable to add the demo record. Your entries have been kept; please try again.')
    } finally {
      submitting.current = false
      setPending(false)
    }
  }
  const control = 'h-[42px] w-full min-w-0 rounded-xl border-[0.625px] bg-white px-3.5 text-[13.5px] text-[#17213c] placeholder:text-[#17213c]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#68728a] disabled:opacity-60'
  function field(name: Exclude<keyof AdminFormValues, 'forcePasswordChange'>, label: string, placeholder: string, options?: { type?: string; full?: boolean; optional?: boolean; choices?: readonly string[] }) {
    const password = name === 'temporaryPassword' || name === 'confirmPassword'
    const error = errors[name]
    const classes = `${control} ${error ? 'border-[#d80255]' : 'border-[#e5e8f0]'} ${password ? 'pr-12' : ''}`
    const attributes = { id: name, name, required: !options?.optional, value: value[name], 'aria-invalid': !!error, 'aria-describedby': error ? `${name}-error` : undefined, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => update(name, event.target.value) }
    return <div className={options?.full ? 'sm:col-span-2' : undefined}>
      <label htmlFor={name} className="mb-1.5 block text-[13px] leading-[19.5px] font-semibold">{label}{!options?.optional && <span aria-hidden="true" className="ml-0.5 text-[#d80255]">*</span>}</label>
      <div className="relative">{options?.choices ? <select {...attributes} className={`${classes} appearance-none ${!value[name] ? 'text-[#9ca3af]' : ''}`}>
        {placeholder && <option value="">{placeholder}</option>}{options.choices.map(option => <option key={option} value={option}>{option}</option>)}
      </select> : <input {...attributes} className={classes} type={password ? visible[name] ? 'text' : 'password' : options?.type ?? 'text'} placeholder={placeholder} autoComplete={password ? 'new-password' : name === 'email' ? 'email' : name === 'phoneNumber' ? 'tel' : name === 'firstName' ? 'given-name' : name === 'lastName' ? 'family-name' : 'off'} />}
      {password && <button type="button" aria-label={`${visible[name] ? 'Hide' : 'Show'} ${label.toLowerCase()}`} aria-pressed={visible[name]} onClick={() => setVisible(previous => ({ ...previous, [name]: !previous[name] }))} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-xl focus-visible:outline-2"><img src="/assets/figma/admin-eye.svg" width="16" height="16" alt="" /></button>}</div>
      {error && <p id={`${name}-error`} className="mt-1.5 text-xs text-[#d80255]">{error}</p>}
    </div>
  }
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-[13.5px] leading-[20.25px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60'
  return <main className="min-w-0 px-4 py-6 text-[#17213c] sm:px-7">
    <div className="max-w-[900px]">
      <header className="mb-6 flex items-center gap-3"><button type="button" onClick={leave} disabled={pending} aria-label="Back to User Management" className="flex size-9 shrink-0 items-center justify-center rounded-xl border-[0.625px] border-[#e5e8f0] focus-visible:outline-2"><img src="/assets/figma/admin-back.svg" width="14" height="14" alt="" /></button><div><h1 className="font-display text-[22px] leading-[33px] font-bold tracking-[-0.55px]">Add Admin User</h1><p className="mt-1 text-[13.5px] leading-[20.25px] text-[#68728a]">Create a new staff account with administrative access.</p></div></header>
      <form ref={form} onSubmit={submit} noValidate aria-label="Add Admin User">
        <fieldset disabled={pending || created} className="min-w-0 space-y-5">
          <FormSection title="Personal Information" description="Basic identity details for the staff member.">
            {field('employeeId', 'Employee ID', 'e.g. RSU-001')}
            {field('phoneNumber', 'Phone Number', '+66 81 234 5678', { type: 'tel', optional: true })}
            {field('firstName', 'First Name', 'First name')}
            {field('lastName', 'Last Name', 'Last name')}
            {field('email', 'Email Address', 'staff@rsu.ac.th', { type: 'email', full: true })}
          </FormSection>
          <FormSection title="Administrative Access" description="Department assignment, role, and initial account status.">
            {field('departmentId', 'Department', 'Select department', { choices: adminDepartments })}
            {field('status', 'Account Status', '', { choices: ['Active', 'Inactive'], optional: true })}
            {field('roleId', 'Role', 'Select a role', { choices: adminRoles, full: true })}
          </FormSection>
          <FormSection title="Security" description="Set a temporary password. The user will be required to change it on first login.">
            {field('temporaryPassword', 'Temporary Password', 'Min. 8 characters')}
            {field('confirmPassword', 'Confirm Password', 'Re-enter password')}
            <div className="flex items-start gap-3 sm:col-span-2"><input id="forcePasswordChange" name="forcePasswordChange" type="checkbox" checked={value.forcePasswordChange} onChange={event => update('forcePasswordChange', event.target.checked)} aria-describedby="force-password-help" className="mt-0.5 size-5 shrink-0 appearance-none rounded-[5px] border border-[#e5e8f0] bg-center bg-no-repeat checked:border-[#273238] checked:bg-[#273238] checked:bg-[url('/assets/figma/admin-check.svg')] focus-visible:outline-2 focus-visible:outline-offset-2" /><div><label htmlFor="forcePasswordChange" className="text-[13px] leading-[19.5px] font-semibold">Force password change on first login</label><p id="force-password-help" className="mt-1 text-[12px] leading-[18px] text-[#68728a]">The user will be required to set a new password immediately after their first successful sign-in.</p></div></div>
          </FormSection>
        </fieldset>
        <div className="flex flex-wrap justify-end gap-3 pt-5 pb-4"><button type="button" onClick={leave} disabled={pending} className={`${button} border-[0.625px] border-[#e5e8f0] hover:bg-white`}>{created ? 'Back to Admin Users' : 'Cancel'}</button>{!created && <button type="submit" disabled={pending} className={`${button} bg-[#273238] text-white shadow-[0_4px_7px_#27323838] hover:bg-[#1a2329]`}><img src="/assets/figma/admin-user-plus.svg" width="15" height="15" alt="" />{pending ? 'Creating…' : 'Create Admin User'}</button>}</div>
        <p className="text-xs leading-5 text-[#68728a]">Demo mode: department, role, and status options are mock data. Creation adds a local list entry only; it resets when you leave User Management or reload. Passwords are never stored.</p>
        <p role="status" aria-live="polite" className="mt-3 text-[13px] leading-5 text-[#68728a]">{feedback}</p>
      </form>
    </div>
    {discard && <Modal title="Discard changes?" onClose={() => setDiscard(false)}><p className="text-sm text-[#68728a]">Your unsaved admin user details will be lost.</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setDiscard(false)} className={`${button} border border-[#e5e8f0]`}>Keep editing</button><button type="button" onClick={() => navigate('/admin/users')} className={`${button} bg-[#273238] text-white`}>Discard changes</button></div></Modal>}
  </main>
}
