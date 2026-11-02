import { Link } from 'react-router-dom'
import { CheckCircle2, Clock3, FileSearch, Files, Info, Play, Search, Upload, XCircle } from 'lucide-react'

const summaries = [
  { label: 'Total Documents', icon: Files, style: 'bg-[#f0f1f3] text-[#273238]' },
  { label: 'Indexed', icon: CheckCircle2, style: 'bg-[#d1fae5] text-[#059669]' },
  { label: 'Processing', icon: Clock3, style: 'bg-[#dbeafe] text-[#3874ff]' },
  { label: 'Failed', icon: XCircle, style: 'bg-[#fee2e2] text-[#dc2626]' },
]
const control = 'min-h-10 rounded-xl border border-[#e5e8f0] bg-white px-3 py-2 text-[12px] text-[#68728a] disabled:cursor-not-allowed'

export default function KnowledgeBaseContent() {
  return <main className="min-w-0 px-4 py-6 text-[#17213c] sm:px-7">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">AI Knowledge Base</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Manage the university documents and sources intended to support AI answers.</p></div>
      <div className="flex flex-wrap gap-3"><Link to="/admin/test-ai-knowledge" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e5e8f0] bg-white px-4 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"><Play size={14} aria-hidden="true" />Test AI Knowledge</Link><button type="button" disabled aria-describedby="knowledge-base-availability" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#273238] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"><Upload size={15} aria-hidden="true" />Upload Document</button></div>
    </header>
    <dl aria-label="Knowledge document summary" className="mt-5 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">{summaries.map(({ label, icon: Icon, style }) => <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#e5e8f0] bg-white p-4"><span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${style}`}><Icon size={18} /></span><div className="flex flex-col"><dt className="order-2 text-xs text-[#68728a]">{label}</dt><dd aria-label="Unavailable" className="order-1 font-display text-[23px] font-extrabold">—</dd></div></div>)}</dl>
    <section aria-labelledby="knowledge-base-status-title" className="mt-5 flex gap-3 rounded-2xl border border-[#e5e8f0] bg-white p-4"><Info size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-[#68728a]" /><div><h2 id="knowledge-base-status-title" className="text-sm font-semibold">Knowledge base API unavailable</h2><p id="knowledge-base-availability" role="status" className="mt-1 text-[13px] leading-6 text-[#68728a]">The existing backend does not expose knowledge-document or indexing endpoints. Document records, totals, uploads, search, filters, and document actions require a compatible existing API.</p></div></section>
    <fieldset disabled aria-describedby="knowledge-base-availability" className="mt-5 flex min-w-0 flex-wrap gap-3"><legend className="sr-only">Filter knowledge documents</legend><div className="relative min-w-[180px] flex-[1_1_280px]"><Search size={15} aria-hidden="true" className="absolute top-3 left-3.5 text-[#8791a8]" /><input type="search" aria-label="Search knowledge documents" placeholder="Search documents…" className={`${control} w-full pl-10`} /></div><select aria-label="Document category" className={`${control} flex-[0_1_160px]`}><option>All Categories</option></select><select aria-label="Document type" className={`${control} flex-[0_1_140px]`}><option>All File Types</option></select><select aria-label="Indexing status" className={`${control} flex-[0_1_150px]`}><option>All Statuses</option></select></fieldset>
    <section aria-labelledby="knowledge-documents-title" className="mt-4 overflow-hidden rounded-2xl border border-[#e5e8f0] bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e8f0] px-5 py-4"><h2 id="knowledge-documents-title" className="text-sm font-semibold">Knowledge Documents</h2><span className="text-xs text-[#68728a]">Document count unavailable</span></header>
      <div role="region" aria-label="Knowledge documents table" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2]"><table className="w-full min-w-[950px] text-left text-[13px]"><caption className="sr-only">Knowledge document names, categories, file types, sizes, indexing statuses, update times and actions</caption><thead className="border-b border-[#e5e8f0] bg-[#f7f8fc] text-[10px] tracking-wide text-[#68728a] uppercase"><tr>{['Document Name', 'Category', 'File Type', 'Size', 'Indexing Status', 'Last Updated', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-4 font-semibold">{label}</th>)}</tr></thead><tbody /></table></div>
      <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-10 text-center"><FileSearch size={32} aria-hidden="true" className="mb-3 text-[#8791a8]" /><h3 className="text-sm font-semibold">Knowledge documents unavailable</h3><p className="mt-2 max-w-md text-[13px] leading-6 text-[#68728a]">Connect a supported knowledge-base API to display documents and their indexing state. No document list has been loaded.</p></div>
    </section>
    <p className="mt-4 text-xs leading-5 text-[#68728a]">Test AI Knowledge opens the question-drafting screen. Running AI tests also requires a compatible API.</p>
  </main>
}
