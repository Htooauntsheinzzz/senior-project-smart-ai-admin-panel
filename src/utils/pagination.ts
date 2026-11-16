/** Every admin table shows 10 rows per page, with Previous/Next to reach the rest (Hsu, 2026-11-12). */
export const TABLE_PAGE_SIZE = 10

/** Slice one page out of a fully loaded list. Out-of-range pages are clamped, so deleting the last row of the last page shows the page before it. */
export function paginate<T>(rows: T[], page: number, size: number = TABLE_PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(rows.length / size))
  const current = Math.min(Math.max(1, page), pageCount)
  return { page: current, pageCount, rows: rows.slice((current - 1) * size, current * size) }
}

/** "Showing 11–20 of 34 courses" for the pagination footer. */
export function pageSummary(offset: number, shown: number, total: number, noun = '') {
  const range = shown ? `${offset + 1}–${offset + shown}` : '0'
  return `Showing ${range} of ${total}${noun ? ` ${noun}` : ''}`
}
