import { CalendarDays, MapPin, Megaphone } from 'lucide-react'
import { activities, announcements, classes, events, quickActions, statistics, type ActionHandler, type Stat } from '../../data/dashboard'
import AiUsageChart from './AiUsageChart'
import { ActionButton, Badge, Panel, TextAction } from './DashboardUi'
import { accentClasses } from './dashboardStyles'

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon
  return <article className="min-w-0 rounded-2xl border border-[#e5e8f0] bg-white p-4 min-[1440px]:min-h-[149px]">
    <div className="flex items-center gap-3"><span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${accentClasses[stat.accent].tile}`}><Icon size={18} aria-hidden="true" /></span><p className="font-display text-[25px] font-bold tracking-tight text-[#17213c]">{stat.value}</p></div>
    <h2 className="mt-3 font-display text-xs font-semibold text-[#68728a]">{stat.label}</h2>
    <p className="mt-2 text-[10px] text-[#9ca3af]">{stat.detail}</p>
  </article>
}

function UpcomingEvents({ onAction }: { onAction: ActionHandler }) {
  return <Panel title="Upcoming Academic Events" action={<TextAction onClick={() => onAction('View all events')}>View all</TextAction>}>
    <ul className="space-y-3">{events.map(event => <li key={event.id} className="flex items-start gap-3 rounded-xl border border-[#e5e8f0] p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#273238] text-white"><CalendarDays size={16} aria-hidden="true" /></span>
      <div className="min-w-0 flex-1"><h3 className="font-display text-xs leading-5 font-semibold text-[#17213c]">{event.title}</h3><p className="mt-0.5 text-[11px] text-[#9ca3af]">{event.date}</p><div className="mt-2 flex flex-wrap items-center gap-2"><Badge>{event.category}</Badge><Badge className={event.priority === 'HIGH' ? 'bg-[#fff0f2] text-[#e05a74]' : event.priority === 'MEDIUM' ? 'bg-[#fff7e3] text-[#b58721]' : 'bg-[#e7f7ef] text-[#22a676]'}>{event.priority}</Badge></div></div>
    </li>)}</ul>
  </Panel>
}

function ActivityFeed({ onAction }: { onAction: ActionHandler }) {
  return <Panel title="Recent Administrative Activities" action={<TextAction onClick={() => onAction('View activity log')}>View log</TextAction>}>
    <ul className="divide-y divide-[#f0f2f7]">{activities.map(activity => {
      const Icon = activity.icon
      return <li key={activity.id} className="flex items-start gap-3 py-4 first:pt-1 last:pb-1">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${accentClasses[activity.accent].tile}`}><Icon size={16} aria-hidden="true" /></span>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1"><h3 className="font-display text-xs font-semibold text-[#17213c]">{activity.title}</h3><span className="text-[10px] whitespace-nowrap text-[#9ca3af]">{activity.time}</span></div><p className="mt-1.5 text-[11px] leading-5 text-[#9ca3af]">{activity.detail}</p></div>
      </li>
    })}</ul>
  </Panel>
}

function ClassSummary() {
  return <Panel title="Today's Class Summary" action={<Badge>126 total</Badge>}>
    <ul className="space-y-3">{classes.map(item => <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e5e8f0] p-3">
      <span className="flex min-h-11 w-12 shrink-0 items-center justify-center rounded-xl bg-[#273238] px-1 text-center font-display text-[10px] font-bold text-white">{item.code}</span>
      <div className="min-w-0 flex-1 basis-40"><h3 className="font-display text-xs leading-5 font-semibold text-[#17213c]">{item.title}</h3><p className="mt-1 flex items-center gap-1 text-[10px] text-[#9ca3af]"><MapPin size={11} aria-hidden="true" />{item.room} · {item.time}</p><p className="mt-1 text-[10px] leading-4 text-[#9ca3af]">{item.instructor} · {item.students} students</p></div>
      <Badge className={item.status === 'Live Now' ? 'bg-[#e7f7ef] text-[#22a676]' : item.status === 'Upcoming' ? 'bg-[#eaf2ff] text-[#5b89cf]' : undefined}>{item.status}</Badge>
    </li>)}</ul>
  </Panel>
}

function RecentAnnouncements({ onAction }: { onAction: ActionHandler }) {
  return <Panel title="Recent Announcements" action={<ActionButton label="Create Announcement" icon={Megaphone} onAction={onAction} />}>
    <div className="grid gap-4 xl:grid-cols-3">{announcements.map(item => <article key={item.id} className="flex min-w-0 flex-col rounded-xl border border-[#e5e8f0] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><Badge className={item.category === 'Academic' ? 'bg-[#f2edff] text-[#8250df]' : item.category === 'System' ? 'bg-[#e5f7fc] text-[#17a5d2]' : 'bg-[#e7f7ef] text-[#22a676]'}>{item.category}</Badge><span className="text-[10px] text-[#9ca3af]">{item.time}</span></div>
      <h3 className="mt-4 font-display text-[13px] leading-5 font-bold text-[#17213c]">{item.title}</h3><p className="mt-2 mb-4 flex-1 text-xs leading-5 text-[#9ca3af]">{item.body}</p><p className="border-t border-[#e5e8f0] pt-3 text-[11px] font-medium text-[#68728a]">{item.author}</p>
    </article>)}</div>
  </Panel>
}

export default function DashboardContent({ onAction }: { onAction: ActionHandler }) {
  return <main id="dashboard-content" className="space-y-6 px-4 pt-6 pb-5 sm:px-7">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="font-display text-2xl leading-9 font-bold tracking-[-0.6px] text-[#17213c]">Good morning, Admin 👋</h1><p className="mt-1 text-xs leading-5 text-[#68728a]">Here is what is happening across the university today.</p></div><div className="flex items-center gap-2 rounded-xl border border-[#e5e8f0] bg-white px-3 py-2.5 text-[11px] text-[#68728a]"><CalendarDays size={14} aria-hidden="true" />Saturday, 30 Aug 2026</div></div>
    <section aria-label="University statistics" className="grid gap-4 min-[360px]:grid-cols-2 lg:grid-cols-3 min-[1440px]:grid-cols-6">{statistics.map(stat => <StatCard key={stat.id} stat={stat} />)}</section>
    <section aria-labelledby="quick-actions"><h2 id="quick-actions" className="mb-3 font-display text-[10px] font-bold tracking-[1.3px] text-[#9ca3af] uppercase">Quick Actions</h2><div className="flex flex-wrap gap-3">{quickActions.map(action => <ActionButton key={action.label} {...action} onAction={onAction} />)}</div></section>
    <div className="grid items-stretch gap-5 xl:grid-cols-[3fr_2fr]"><AiUsageChart /><UpcomingEvents onAction={onAction} /></div>
    <div className="grid items-stretch gap-5 xl:grid-cols-2"><ActivityFeed onAction={onAction} /><ClassSummary /></div>
    <RecentAnnouncements onAction={onAction} />
    <footer className="py-2 text-center text-[10px] leading-5 text-[#9ca3af]">© 2026 Rangsit University · SMART AI Admin Portal · <TextAction onClick={() => onAction('IT Support')}>IT Support</TextAction></footer>
  </main>
}
