import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Download, RefreshCw } from 'lucide-react'
import { getReportSections, reportCsv, type ReportSection } from '../../services/reportService'

const button = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#e5e8f0] bg-white px-4 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'
export default function ReportsContent() {
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ version: number; sections: ReportSection[] }>()
  const [message, setMessage] = useState('')
  const current = result?.version === version ? result.sections : undefined
  const complete = current?.length === 4 && current.every(s => !s.error)
  useEffect(() => {
    const controller = new AbortController()
    getReportSections(controller.signal).then(sections => { if (!controller.signal.aborted) setResult({ version, sections }) })
    return () => controller.abort()
  }, [version])
  function exportReport() {
    if (!current || !complete) return
    const url = URL.createObjectURL(new Blob(['\ufeff', reportCsv(current)], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a'); link.href = url; link.download = 'university-current-summary.csv'; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('Exported the displayed current summaries with their fetch timestamps.')
  }
  return <main className="min-w-0 px-4 py-6 text-[#17213c] sm:px-7">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">Reports &amp; Analytics</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Current student and academic summaries from the existing APIs.</p></div><div className="flex flex-wrap gap-3"><button type="button" disabled={!current} onClick={() => { setMessage(''); setVersion(v => v + 1) }} className={button}><RefreshCw size={14} aria-hidden="true" />Refresh</button><button type="button" disabled={!complete} onClick={exportReport} className={`${button} bg-[#273238] text-white`}><Download size={14} aria-hidden="true" />Export Summary</button></div></header>
    <section aria-labelledby="report-scope-title" className="mt-5 rounded-2xl border border-[#e5e8f0] bg-white p-4"><h2 id="report-scope-title" className="text-sm font-semibold">Current snapshot</h2><p className="mt-1 text-[13px] leading-6 text-[#68728a]">These are global current counts, not activity or date-range reports. Summaries are fetched independently and may reflect slightly different moments. Active student accounts do not measure app usage.</p></section>
    {!current ? <p role="status" className="py-12 text-center text-sm text-[#68728a]">Loading reports…</p> : <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">{current.map(section => <section key={section.id} aria-labelledby={`report-${section.id}`} className="overflow-hidden rounded-2xl border border-[#e5e8f0] bg-white"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e8f0] px-5 py-4"><h2 id={`report-${section.id}`} className="text-sm font-semibold">{section.title}</h2><Link to={section.path} className="rounded text-xs font-medium text-[#68728a] underline focus-visible:outline-2">View records</Link></header>{section.error ? <div className="p-5"><p role="alert" className="text-sm text-red-700">{section.error}</p><button type="button" onClick={() => setVersion(v => v + 1)} className={`${button} mt-3`}>Retry summaries</button></div> : <><dl className="divide-y divide-[#e5e8f0] px-5">{section.metrics.map(metric => <div key={metric.label} className="flex items-center justify-between gap-4 py-3"><dt className="text-[13px] text-[#68728a]">{metric.label}</dt><dd className="font-display text-xl font-bold">{metric.value.toLocaleString()}</dd></div>)}</dl><p className="border-t border-[#e5e8f0] px-5 py-3 text-[11px] text-[#68728a]">Fetched: <time dateTime={section.fetchedAt}>{new Date(section.fetchedAt!).toLocaleString()}</time> (local time)</p></>}</section>)}</div>}
    {current && !complete && <p className="mt-4 text-xs text-[#68728a]">Export requires all four summaries to load successfully. Available summaries remain visible.</p>}
    <section aria-labelledby="report-analytics-title" className="mt-5 rounded-2xl border border-[#e5e8f0] bg-white p-5"><h2 id="report-analytics-title" className="inline-flex items-center gap-2 text-sm font-semibold"><BarChart3 size={18} aria-hidden="true" />Additional Analytics</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{[
      ['Student Activity', 'Daily active users, sessions, feature usage and historical trends require an analytics API.'],
      ['AI Performance', 'Response times, answer accuracy, token usage and feedback rates require AI telemetry APIs.'],
      ['Campus Usage', 'Navigation requests, popular destinations and room utilization require campus activity APIs.'],
    ].map(([title, description]) => <section key={title} className="rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] p-4"><h3 className="text-[13px] font-semibold">{title}</h3><p className="mt-1 text-xs font-medium text-[#92400e]">Unavailable</p><p className="mt-2 text-xs leading-5 text-[#68728a]">{description}</p></section>)}</div><p className="mt-4 text-xs leading-5 text-[#68728a]">No date-range controls or trend charts are shown because the existing summary endpoints do not support historical reporting.</p></section>
    <p role="status" className="mt-4 text-sm text-[#68728a]">{message}</p>
  </main>
}
