import { BookOpen, CalendarDays, ClipboardList, FilePenLine, Info, Save } from 'lucide-react'

const rules = [
  { id: 'class', title: 'Class Reminder', icon: BookOpen, color: 'border-[#bfdbfe]', tile: 'bg-[#dbeafe] text-[#3874ff]', variables: ['course_name', 'timing', 'room'] },
  { id: 'assignment', title: 'Assignment Reminder', icon: ClipboardList, color: 'border-[#ddd6fe]', tile: 'bg-[#ede9fe] text-[#7c3aed]', variables: ['timing', 'assignment_name', 'course_name'] },
  { id: 'exam', title: 'Exam Reminder', icon: FilePenLine, color: 'border-[#fed7aa]', tile: 'bg-[#fef3c7] text-[#d97706]', variables: ['exam_name', 'timing', 'room', 'time'] },
  { id: 'event', title: 'University Event Reminder', icon: CalendarDays, color: 'border-[#e5e8f0]', tile: 'bg-[#f3f4f6] text-[#8791a8]', variables: ['event_name', 'timing', 'location'] },
]
const button = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#273238] px-4 py-2 text-[12px] font-semibold text-white shadow-sm disabled:cursor-not-allowed'

export default function RemindersContent() {
  return <main className="min-w-0 px-4 py-6 text-[#17213c] sm:px-7">
    <div className="mx-auto max-w-[760px] space-y-5">
      <header>
        <h1 className="font-display text-[22px] leading-[33px] font-extrabold">Smart Reminder Rules</h1>
        <p className="mt-1 text-[13px] leading-5 text-[#68728a]">Configure automated notifications for classes, assignments, exams, and events</p>
        <div className="mt-4 flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 rounded-xl border border-[#e5e8f0] bg-white px-3 py-2 text-[12px] text-[#68728a]"><span aria-hidden="true" className="flex gap-1">{rules.map(rule => <span key={rule.id} className={`size-2 rounded-full ${rule.tile}`} />)}</span>Active rules unavailable</span><button type="button" disabled aria-describedby="reminders-availability" className={button}><Save size={14} aria-hidden="true" />Save Settings</button></div>
      </header>
      <section aria-labelledby="reminders-help" className="flex gap-3 rounded-2xl border border-[#dedfe2] bg-[#f0f1f3] p-4">
        <Info size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-[#68728a]" />
        <div><h2 id="reminders-help" className="text-[13px] font-semibold">How Smart Reminders work</h2><p className="mt-1 text-[12px] leading-6 text-[#68728a]">Reminder rules define when notifications are sent and which message templates they use. Template variables represent timetable and academic information.</p><p id="reminders-availability" role="status" className="mt-2 text-[12px] leading-6 text-[#68728a]">Reminder settings unavailable. The existing backend does not expose a reminder-rules API. Active states, timing, channels, templates, previews, and saving require an existing compatible API.</p></div>
      </section>
      {rules.map(({ id, title, icon: Icon, color, tile, variables }) => <section key={id} aria-labelledby={`${id}-title`} className={`rounded-2xl border bg-white p-5 ${color}`}>
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tile}`}><Icon size={18} /></span><div><h2 id={`${id}-title`} className="text-[14px] font-semibold">{title}</h2><p className="mt-1 text-[11px] text-[#8791a8]">Timing and channel unavailable</p></div></div>
          <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-[11px] text-[#68728a]">Status unavailable</span>
        </header>
        <fieldset disabled aria-describedby="reminders-availability" className="mt-5 min-w-0">
          <legend className="sr-only">{title} settings</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-[10px] font-semibold tracking-wide text-[#68728a] uppercase">Trigger Timing<select className="mt-2 h-10 w-full rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] px-3 text-[12px] font-normal tracking-normal normal-case disabled:cursor-not-allowed"><option>Unavailable</option></select></label>
            <fieldset className="min-w-0"><legend className="text-[10px] font-semibold tracking-wide text-[#68728a] uppercase">Notification Channel</legend><div className="mt-2 grid grid-cols-2 gap-2">{['Push Notification', 'In-App', 'Push + In-App', 'Email'].map(channel => <button key={channel} type="button" className="min-h-8 rounded-lg border border-[#e5e8f0] px-2 py-1 text-[10px] text-[#8791a8] disabled:cursor-not-allowed">{channel}</button>)}</div></fieldset>
          </div>
          <div className="mt-4"><div className="flex flex-wrap items-center justify-between gap-2"><label htmlFor={`${id}-template`} className="text-[10px] font-semibold tracking-wide text-[#68728a] uppercase">Message Template</label><ul aria-label={`${title} design template variables`} className="flex flex-wrap gap-1">{variables.map(variable => <li key={variable}><code className="rounded bg-[#f3f4f6] px-1.5 py-1 text-[10px] text-[#68728a]">{`{{${variable}}}`}</code></li>)}</ul></div><textarea id={`${id}-template`} rows={3} placeholder="Saved message template unavailable" className="mt-2 w-full resize-none rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] p-3 font-mono text-[11px] leading-5 disabled:cursor-not-allowed" /></div>
        </fieldset>
        {id !== 'event' && <section aria-label={`${title} message preview`} className="mt-4 overflow-hidden rounded-xl border border-[#e5e8f0]"><h3 className="border-b border-[#e5e8f0] bg-[#f7f8fc] px-3 py-2 text-[10px] font-semibold text-[#68728a] uppercase">Message Preview</h3><p className="px-3 py-4 text-[12px] leading-5 text-[#8791a8]">A preview requires a saved template and connected reminder data.</p></section>}
      </section>)}
      <section aria-labelledby="reminders-quick-actions" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e5e8f0] bg-white p-5"><div><h2 id="reminders-quick-actions" className="text-[13px] font-semibold">Quick Actions</h2><p className="mt-1 text-[11px] text-[#8791a8]">Bulk enable or disable all reminder rules at once</p></div><div aria-describedby="reminders-availability" className="flex flex-wrap gap-2"><button type="button" disabled className="min-h-10 rounded-xl border border-[#e5e8f0] px-3 py-2 text-[12px] text-[#68728a] disabled:cursor-not-allowed">Disable All</button><button type="button" disabled className={button}>Enable All</button></div></section>
      <footer className="flex justify-end"><button type="button" disabled aria-describedby="reminders-availability" className={button}><Save size={14} aria-hidden="true" />Save Settings</button></footer>
    </div>
  </main>
}
