import apiClient from '../api/apiClient'
import type { CampusCategory, CampusFacility, CampusMap, CampusSite } from '../types/campus'
import { cleanParams, getAllPages } from './campusCommon'

// AdminCampusMapController: GET /api/v1/admin/campus/map
export async function getCampusMap(params: { siteId?: number; categoryId?: number; status?: string } = {}, signal?: AbortSignal) {
  const { data } = await apiClient.get<CampusMap>('/campus/map', {
    params: cleanParams({ includeBuildings: true, includePlaces: true, includeNodes: true, includeEdges: true, ...params }),
    signal,
  })
  if (!data?.summary || !Array.isArray(data.buildings) || !Array.isArray(data.places)) throw new Error('Campus: Unexpected server response.')
  return data
}

// AdminCampusSiteController: GET /api/v1/admin/campus/sites (needed for create DTOs' siteId)
export function getCampusSites(signal?: AbortSignal) {
  return getAllPages<CampusSite>('/campus/sites', { isActive: true }, signal)
}

// AdminCampusCatalogController
export async function getCampusCategories(signal?: AbortSignal) {
  const { data } = await apiClient.get<CampusCategory[]>('/campus/categories', { signal })
  return Array.isArray(data) ? data : []
}

export async function getCampusFacilities(signal?: AbortSignal) {
  const { data } = await apiClient.get<CampusFacility[]>('/campus/facilities', { signal })
  return Array.isArray(data) ? data : []
}
