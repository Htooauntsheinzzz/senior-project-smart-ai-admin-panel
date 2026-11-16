import Pagination from './Pagination'
import { pageSummary } from '../../utils/pagination'

/** Footer for a table paged with usePagedRows: "Showing 1–10 of 34 courses" plus Previous / page numbers / Next. */
export default function TablePagination({ label, noun, paging }: { label: string; noun?: string; paging: { page: number; pageCount: number; offset: number; total: number; rows: unknown[]; setPage: (page: number) => void } }) {
  if (!paging.total) return null
  return <Pagination label={label} page={paging.page} pageCount={paging.pageCount} onPage={paging.setPage} summary={pageSummary(paging.offset, paging.rows.length, paging.total, noun)} />
}
