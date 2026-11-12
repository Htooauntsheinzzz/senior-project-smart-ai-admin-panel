import { useState } from 'react'
import { TABLE_PAGE_SIZE, paginate } from '../utils/pagination'

/**
 * Client-side paging for tables that load their whole list up front.
 * The page goes back to 1 whenever `resetKey` changes (pass the search/filter values), without an effect.
 */
export function usePagedRows<T>(rows: T[], resetKey = '') {
  const [state, setState] = useState({ key: resetKey, page: 1 })
  const paged = paginate(rows, state.key === resetKey ? state.page : 1, TABLE_PAGE_SIZE)
  return {
    ...paged,
    offset: (paged.page - 1) * TABLE_PAGE_SIZE,
    total: rows.length,
    setPage: (page: number) => setState({ key: resetKey, page }),
  }
}

export type PagedRows<T> = ReturnType<typeof usePagedRows<T>>
