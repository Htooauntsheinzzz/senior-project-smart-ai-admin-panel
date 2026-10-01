import { useId, type ReactNode } from 'react'
import type { Accent, ActionHandler, DashboardAction } from '../../data/dashboard'
import type { LucideIcon } from 'lucide-react'
import { accentClasses } from './dashboardStyles'

export function Panel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  const id = useId()
  return <section aria-labelledby={id} className="min-w-0 rounded-2xl border border-[#e5e8f0] bg-white p-5 shadow-[0_2px_6px_#17213c03] sm:p-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div><h2 id={id} className="font-display text-[15px] font-bold text-[#17213c]">{title}</h2>{subtitle && <p className="mt-1 text-xs text-[#9ca3af]">{subtitle}</p>}</div>{action}
    </div>{children}
  </section>
}

export function Badge({ children, className = 'bg-[#f2f4f8] text-[#68728a]' }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex w-fit shrink-0 items-center rounded-md px-2 py-1 text-[10px] leading-4 font-semibold ${className}`}>{children}</span>
}

export function ActionButton({ label, icon: Icon, accent = 'neutral', onAction }: { label: DashboardAction; icon: LucideIcon; accent?: Accent; onAction: ActionHandler }) {
  return <button type="button" onClick={() => onAction(label)} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-display text-xs font-semibold text-white shadow-md hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#68728a] ${accentClasses[accent].button}`}><Icon size={15} aria-hidden="true" />{label}</button>
}

export function TextAction({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="rounded text-xs font-medium text-[#68728a] hover:text-[#17213c] focus-visible:outline-2 focus-visible:outline-offset-2">{children}</button>
}
