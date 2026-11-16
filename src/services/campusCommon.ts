import apiClient from '../api/apiClient'
import type { CampusPage } from '../types/campus'

export type Params = Record<string, string | number | boolean | undefined | null>

/**
 * CampusPageQuery rejects unknown or malformed parameters with 400, and an empty
 * string is malformed for ids, so blank values are dropped before sending.
 */
export function cleanParams(params: Params) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')) as Record<string, string | number | boolean>
}

export async function getPage<T>(url: string, params: Params, signal?: AbortSignal) {
  const { data } = await apiClient.get<CampusPage<T>>(url, { params: cleanParams(params), signal })
  if (!data || !Array.isArray(data.content)) throw new Error('Campus: Unexpected server response.')
  return data
}

/** Reads every page (backend max size is 100). Used where Figma shows no pagination. */
export async function getAllPages<T>(url: string, params: Params, signal?: AbortSignal, maxPages = 20) {
  const rows: T[] = []
  for (let page = 0; page < maxPages; page++) {
    const data = await getPage<T>(url, { ...params, page, size: 100 }, signal)
    rows.push(...data.content)
    if (data.last || page >= data.totalPages - 1) return rows
  }
  throw new Error('Campus: Too many records to display completely. Narrow your filters.')
}

export const trimOrNull = (value: string) => value.trim() || null
export const numberOrNull = (value: string) => (value.trim() === '' ? null : Number(value.trim()))
export const requiredId = (value: string) => {
  const id = Number(value)
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(id)) throw new Error('Campus: Select a valid option.')
  return id
}
export const optionalId = (value: string) => (value === '' ? null : requiredId(value))
