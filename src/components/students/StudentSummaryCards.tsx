import type { Student } from '../../types/student'

export default function StudentSummaryCards({ students }: { students: Student[] }) {
  const active = students.filter(student => student.status === 'Active').length
  const cards = [
    { label: 'Total Students', value: students.length, icon: '👥', text: 'text-[#273238]', tile: 'bg-[#273238]/7' },
    { label: 'Active Students', value: active, icon: '✅', text: 'text-[#059669]', tile: 'bg-[#d1fae5]' },
    { label: 'New This Semester', value: students.filter(student => student.newThisSemester).length, icon: '🎓', text: 'text-[#7c3aed]', tile: 'bg-[#ede9fe]' },
    { label: 'Inactive / Suspended', value: students.length - active, icon: '⏸', text: 'text-[#d80255]', tile: 'bg-[#d80255]/7' },
  ]
  return <section aria-label="Student summary" className="grid gap-4 pt-6 min-[480px]:grid-cols-2 xl:grid-cols-4">
    {cards.map(card => <article key={card.label} className="flex items-center gap-3.5 rounded-2xl border-[1.25px] border-[#e5e8f0] bg-white px-4 py-3.5"><span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-lg leading-7 ${card.tile}`}>{card.icon}</span><div><p className={`font-display text-[22px] leading-[22px] font-extrabold ${card.text}`}>{card.value}</p><h2 className="mt-0.5 text-[11.5px] leading-[17.25px] text-[#68728a]">{card.label}</h2></div></article>)}
  </section>
}
