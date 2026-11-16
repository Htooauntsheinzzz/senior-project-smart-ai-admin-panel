import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import Pagination from '../ui/Pagination'
import type { AcademicTerm, TermStatus } from '../../types/timetable'
import { deleteAcademicTerm, getAcademicTermById, getAcademicTerms, setAcademicTermStatus } from '../../services/timetableService'
import { academicTermError, emptyTermFilters, filterTerms, paginate, statusActions, termDuration, termSemesterOptions, termStatusOptions, termStatuses, termSummary, termTitle, type TermFilters } from '../../utils/academicTerms'
import { formatDate } from '../../utils/timetable'
import { ActionMenu, Badge, CampusTable, CodeChip, ConfirmDelete, DetailsModal, FilterSelect, PageHeader, SearchInput, SerialChip, SuccessToast, SummaryCards, TableState, primaryButton, secondaryButton } from '../campus/CampusUi'
import AcademicTermForm from './AcademicTermForm'

// Academic Terms page (sidebar: Timetable › Academic Terms). Follows the Programs / Campus pattern: table with
// row numbers, drawer for create and edit, modal for details and delete, green toast after every change.
// The complete term list is loaded once (GET /academic-terms, all pages) and searched, filtered, counted and
// paged on the client, because a university has only a few terms per academic year.
const PAGE_SIZE = 10
const describe = (error: unknown) => academicTermError(error).message

export default function AcademicTermsContent({ onDrawerChange }: { onDrawerChange: (open: boolean) => void }) {
  const [filters, setFilters] = useState<TermFilters>(emptyTermFilters)
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ version: number; rows?: AcademicTerm[]; error?: string } | null>(null)
  const [drawer, setDrawer] = useState<{ term?: AcademicTerm } | null>(null)
  const [viewing, setViewing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<AcademicTerm | null>(null)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [acting, setActing] = useState(false)
  const lock = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    getAcademicTerms(controller.signal)
      .then(rows => { if (!controller.signal.aborted) setResult({ version, rows }) })
      .catch(error => { if (!controller.signal.aborted) setResult({ version, error: describe(error) }) })
    return () => controller.abort()
  }, [version])

  const current = result?.version === version ? result : null
  const loading = !current
  const all = useMemo(() => current?.rows ?? [], [current])
  const filtered = useMemo(() => filterTerms(all, filters), [all, filters])
  const paged = paginate(filtered, page, PAGE_SIZE)
  const summary = termSummary(all)
  const filtering = !!(filters.query.trim() || filters.semesterId || filters.status)
  const refresh = () => setVersion(previous => previous + 1)
  const dismiss = useCallback(() => setMessage(''), [])

  function openDrawer(next: { term?: AcademicTerm } | null) { setDrawer(next); onDrawerChange(!!next) }
  function change<K extends keyof TermFilters>(key: K, value: TermFilters[K]) { setFilters(previous => ({ ...previous, [key]: value })); setPage(1) }

  async function changeStatus(term: AcademicTerm, status: TermStatus) {
    if (lock.current) return
    lock.current = true; setActing(true); setActionError('')
    try {
      await setAcademicTermStatus(term.id, status)
      setMessage(`${termTitle(term)} is now ${termStatuses[status].label.toLowerCase()}.`)
      refresh()
    } catch (error) {
      setActionError(academicTermError(error, 'write').message)
    } finally {
      lock.current = false; setActing(false)
    }
  }

  return <main className="min-w-0 text-[#17213c]">
    <PageHeader title="Academic Terms" description="Define which semester runs in which academic year and when its classes take place. Course sections need a term before they can be scheduled."
      actions={<>
        <Link to="/admin/timetable" className={secondaryButton}><CalendarDays size={14} aria-hidden="true" />Class Timetable</Link>
        <button type="button" onClick={() => openDrawer({})} disabled={!!drawer} className={primaryButton}><img src="/assets/figma/faculty-plus.svg" width="15" height="15" alt="" />Add Term</button>
      </>}>
      <SummaryCards label="Academic term summary" error={current?.error} onRetry={refresh} items={[
        { label: 'Total Terms', value: loading || current.error ? null : summary.total, tone: 'violet' },
        { label: 'Active', value: loading || current.error ? null : summary.active, tone: 'green' },
        { label: 'Planned', value: loading || current.error ? null : summary.planned, tone: 'amber' },
        { label: 'Closed', value: loading || current.error ? null : summary.closed, tone: 'neutral' },
      ]} />
    </PageHeader>
    <div className="flex flex-wrap items-center gap-2.5 border-b-[1.25px] border-[#e5e8f0] bg-white px-4 py-3 sm:px-6">
      <SearchInput label="Search academic terms" placeholder="Search academic year, code or semester…" value={filters.query} onChange={value => change('query', value)} />
      <FilterSelect label="Semester" allLabel="All Semesters" value={filters.semesterId} onChange={value => change('semesterId', value)} options={termSemesterOptions(all)} />
      <FilterSelect label="Term status" allLabel="All Statuses" value={filters.status} onChange={value => change('status', value as TermStatus | '')} options={termStatusOptions} />
      <p className="text-[13px] text-[#68728a] sm:ml-auto">{loading || current.error ? '—' : `${filtered.length} ${filtered.length === 1 ? 'term' : 'terms'}`}</p>
    </div>
    <section aria-label="Academic term directory" className="px-4 pt-4 pb-6 sm:px-6">
      {actionError && <p role="alert" className="mb-3 text-[13px] text-[#d80255]">{actionError} <button type="button" onClick={() => setActionError('')} className="underline">Dismiss</button></p>}
      <CampusTable label="Academic terms table" caption="Row numbers, academic years, semesters, start and end dates, duration, status and actions" minWidth={1040}
        headers={['No.', 'Academic Year', 'Semester', 'Start Date', 'End Date', 'Duration', 'Status', 'Actions']}
        state={<TableState loading={loading} error={current?.error} empty={!paged.rows.length} loadingText="Loading academic terms…" emptyText={filtering ? 'No academic terms match your search and filters.' : 'No academic terms yet. Add the first term, then assign it to course sections before scheduling classes.'} onRetry={refresh} />}>
        {paged.rows.map((term, index) => { const s = termStatuses[term.status]; return <tr key={term.id}>
          <td className="px-3.5 py-3"><SerialChip value={(paged.page - 1) * PAGE_SIZE + index + 1} /></td>
          <th scope="row" className="px-3.5 py-3 font-semibold">{term.academicYearLabel}<span className="block pt-1"><CodeChip>{term.academicYearCode}</CodeChip></span></th>
          <td className="px-3.5 py-3">{term.semesterNameEn}{term.semesterNameTh && <span className="block text-[11px] leading-[16.5px] text-[#68728a]">{term.semesterNameTh}</span>}</td>
          <td className="px-3.5 py-3 whitespace-nowrap">{formatDate(term.startDate)}</td>
          <td className="px-3.5 py-3 whitespace-nowrap">{formatDate(term.endDate)}</td>
          <td className="px-3.5 py-3 text-[#68728a]">{termDuration(term.startDate, term.endDate)}</td>
          <td className="px-3.5 py-3"><Badge bg={s.bg} text={s.text} dot>{s.label}</Badge></td>
          <td className="px-3.5 py-3"><ActionMenu label={`Actions for ${termTitle(term)}`} disabled={!!drawer || acting} items={[
            { label: 'View details', onSelect: () => setViewing(term.id) },
            { label: 'Edit', onSelect: () => { setActionError(''); getAcademicTermById(term.id).then(data => openDrawer({ term: data })).catch(error => setActionError(describe(error))) } },
            ...statusActions(term.status).map(action => ({ label: action.label, onSelect: () => { void changeStatus(term, action.status) } })),
            { label: 'Delete', danger: true, onSelect: () => setDeleting(term) },
          ]} /></td>
        </tr> })}
      </CampusTable>
      {filtered.length > 0 && <Pagination label="Academic term pagination" page={paged.page} pageCount={paged.pageCount} onPage={setPage} summary={`Showing ${(paged.page - 1) * PAGE_SIZE + 1}–${(paged.page - 1) * PAGE_SIZE + paged.rows.length} of ${filtered.length}`} />}
    </section>
    {drawer && <AcademicTermForm key={drawer.term?.id ?? 'new'} term={drawer.term} onClose={() => openDrawer(null)} onSaved={(saved, operation) => { openDrawer(null); refresh(); setMessage(`${termTitle(saved)} was ${operation} successfully.`) }} />}
    {viewing != null && <DetailsModal<AcademicTerm> title="Academic Term Details" describeError={describe} load={signal => getAcademicTermById(viewing, signal)} onClose={() => setViewing(null)}
      onEdit={data => { setViewing(null); openDrawer({ term: data }) }} onDelete={data => { setViewing(null); setDeleting(data) }}
      rows={t => [['Academic Year', t.academicYearLabel], ['Year Code', <CodeChip key="code">{t.academicYearCode}</CodeChip>], ['Semester', t.semesterNameEn], ['Semester (Thai)', t.semesterNameTh || '—'], ['Semester Year', t.semesterAcademicYear ?? '—'], ['Start Date', formatDate(t.startDate)], ['End Date', formatDate(t.endDate)], ['Duration', termDuration(t.startDate, t.endDate)], ['Status', <Badge key="status" bg={termStatuses[t.status].bg} text={termStatuses[t.status].text} dot>{termStatuses[t.status].label}</Badge>], ['Display Label', t.displayLabel]]} />}
    {deleting && <ConfirmDelete title="Delete academic term?" describeError={error => academicTermError(error, 'write').message} onClose={() => setDeleting(null)} onConfirm={() => deleteAcademicTerm(deleting.id)}
      onDeleted={() => { setMessage(`${termTitle(deleting)} was deleted successfully.`); setDeleting(null); if (paged.rows.length === 1 && paged.page > 1) setPage(paged.page - 1); refresh() }}>
      Delete <strong className="text-[#17213c]">{termTitle(deleting)}</strong> ({formatDate(deleting.startDate)} – {formatDate(deleting.endDate)})? The backend refuses the delete while course sections still use this term.
    </ConfirmDelete>}
    <SuccessToast message={message} onDismiss={dismiss} />
  </main>
}
