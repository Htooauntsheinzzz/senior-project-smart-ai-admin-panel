import { useRef, useState, type FormEvent } from 'react'
import { studentPrograms } from '../../data/students'
import { studentSemesters, studentStatuses, type Student, type StudentInput } from '../../types/student'
import { validateStudent } from '../../utils/students'
import Modal from '../ui/Modal'

export default function StudentForm({ students, onAdd, onClose }: { students: Student[]; onAdd: (student: StudentInput) => void; onClose: () => void }) {
  const form = useRef<HTMLFormElement>(null)
  const [value, setValue] = useState<StudentInput>({ studentId: '', name: '', email: '', ...studentPrograms[0], year: 1, semester: 'Sem 1/2568', status: 'Active', newThisSemester: false })
  const [errors, setErrors] = useState<Partial<Record<keyof StudentInput, string>>>({})
  function update(field: keyof StudentInput, next: string | number | boolean) {
    setValue(previous => {
      if (field === 'faculty') return { ...previous, ...studentPrograms.find(program => program.faculty === next)! }
      if (field === 'department') return { ...previous, ...studentPrograms.find(program => program.faculty === previous.faculty && program.department === next)! }
      return { ...previous, [field]: next }
    })
    setErrors({})
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    const invalid = validateStudent(value, students)
    setErrors(invalid)
    const first = Object.keys(invalid)[0]
    if (first) { form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return }
    onAdd(value)
  }
  const control = 'mt-1.5 h-10 w-full rounded-xl border border-[#e5e8f0] bg-white px-3 text-[13px] text-[#17213c] focus-visible:outline-2 focus-visible:outline-[#68728a]'
  const fields = [
    { key: 'faculty', label: 'Faculty', options: [...new Set(studentPrograms.map(program => program.faculty))] },
    { key: 'department', label: 'Department', options: [...new Set(studentPrograms.filter(program => program.faculty === value.faculty).map(program => program.department))] },
    { key: 'major', label: 'Major', options: studentPrograms.filter(program => program.faculty === value.faculty && program.department === value.department).map(program => program.major) },
    { key: 'year', label: 'Year', options: ['1', '2', '3', '4', '5', '6'] },
    { key: 'semester', label: 'Semester', options: [...studentSemesters] },
    { key: 'status', label: 'Status', options: [...studentStatuses] },
  ] as const
  return <Modal title="Add Student" onClose={onClose}>
    <p className="mb-5 text-xs leading-5 text-[#68728a]">Frontend demo: this student is added locally only. Changes reset when you leave this page; no server account is created.</p>
    <form ref={form} onSubmit={submit} noValidate className="space-y-4">
      {([{ key: 'studentId', label: 'Student ID', type: 'text' }, { key: 'name', label: 'Full Name', type: 'text' }, { key: 'email', label: 'University Email', type: 'email' }] as const).map(field => <div key={field.key}><label htmlFor={`student-${field.key}`} className="text-xs font-medium text-[#68728a]">{field.label}</label><input id={`student-${field.key}`} name={field.key} type={field.type} value={value[field.key]} onChange={event => update(field.key, event.target.value)} required maxLength={field.key === 'email' ? 254 : 100} aria-invalid={Boolean(errors[field.key])} aria-describedby={errors[field.key] ? `student-error-${field.key}` : undefined} className={control} />{errors[field.key] && <p id={`student-error-${field.key}`} className="mt-1 text-xs text-[#b42318]">{errors[field.key]}</p>}</div>)}
      <div className="grid gap-4 sm:grid-cols-2">{fields.map(field => <div key={field.key}><label htmlFor={`student-${field.key}`} className="text-xs font-medium text-[#68728a]">{field.label}</label><select id={`student-${field.key}`} name={field.key} value={value[field.key]} onChange={event => update(field.key, field.key === 'year' ? Number(event.target.value) : event.target.value)} aria-invalid={Boolean(errors[field.key])} aria-describedby={errors[field.key] ? `student-error-${field.key}` : undefined} className={control}>{field.options.map(option => <option key={option} value={option}>{field.key === 'year' ? `Year ${option}` : option}</option>)}</select>{errors[field.key] && <p id={`student-error-${field.key}`} className="mt-1 text-xs text-[#b42318]">{errors[field.key]}</p>}</div>)}</div>
      <label className="flex items-center gap-2 text-xs text-[#68728a]"><input type="checkbox" checked={value.newThisSemester} onChange={event => update('newThisSemester', event.target.checked)} className="size-4 accent-[#273238]" />New this semester (explicit demo metric)</label>
      <div className="flex justify-end gap-3 border-t border-[#e5e8f0] pt-5"><button type="button" onClick={onClose} className="rounded-xl border border-[#e5e8f0] px-4 py-2.5 text-xs font-semibold focus-visible:outline-2">Cancel</button><button type="submit" className="rounded-xl bg-[#273238] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1a2329] focus-visible:outline-2 focus-visible:outline-offset-2">Add Student</button></div>
    </form>
  </Modal>
}
