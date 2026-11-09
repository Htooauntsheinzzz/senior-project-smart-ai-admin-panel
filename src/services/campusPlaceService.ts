import apiClient from '../api/apiClient'
import type { CampusPlace, HoursDraftRow, OpeningHour, PlaceDraft, PlaceStatistics, PlaceStatus, ExceptionDraftRow, OpeningException } from '../types/campus'
import { openingExceptionsPayload, openingHoursPayload } from './buildingService'
import { getAllPages, optionalId, requiredId, trimOrNull } from './campusCommon'

// AdminCampusPlaceController: /api/v1/admin/campus/places
const base = '/campus/places'

/**
 * Figma shows every place (no pagination), so all pages for the server-side
 * search and status filter are loaded once; cards and table share this result.
 */
export function getCampusPlaces(params: { search: string; status: PlaceStatus | '' }, signal?: AbortSignal) {
  return getAllPages<CampusPlace>(base, { search: params.search.trim(), status: params.status }, signal)
}

export async function getCampusPlaceStatistics(signal?: AbortSignal) {
  const { data } = await apiClient.get<PlaceStatistics>(`${base}/statistics`, { signal })
  return data
}

export async function getCampusPlaceById(id: number, signal?: AbortSignal) {
  const { data } = await apiClient.get<CampusPlace>(`${base}/${id}`, { signal })
  return data
}

/** CampusPlaceCreateRequest / CampusPlaceUpdateRequest (update has no siteId). */
export function placePayload(draft: PlaceDraft, mode: 'create' | 'update') {
  const body = {
    categoryId: requiredId(draft.categoryId),
    buildingId: optionalId(draft.buildingId),
    placeCode: draft.placeCode.trim(),
    placeName: draft.placeName.trim(),
    placeNameTh: trimOrNull(draft.placeNameTh),
    description: trimOrNull(draft.description),
    floorLabel: trimOrNull(draft.floorLabel),
    phoneNumber: trimOrNull(draft.phoneNumber),
    isPopular: draft.isPopular,
    isVisibleOnMobile: draft.isVisibleOnMobile,
    status: draft.status,
    // A null list clears facilities on update, so the current selection is always sent.
    facilityIds: draft.facilityIds.map(requiredId),
  }
  return mode === 'create' ? { siteId: requiredId(draft.siteId), ...body } : body
}

export async function createCampusPlace(draft: PlaceDraft) {
  const { data } = await apiClient.post<CampusPlace>(base, placePayload(draft, 'create'))
  return data
}

export async function updateCampusPlace(id: number, draft: PlaceDraft) {
  const { data } = await apiClient.put<CampusPlace>(`${base}/${id}`, placePayload(draft, 'update'))
  return data
}

export async function deleteCampusPlace(id: number) {
  await apiClient.delete(`${base}/${id}`)
}

export async function savePlaceOpeningHours(id: number, rows: HoursDraftRow[]) {
  const { data } = await apiClient.put<OpeningHour[]>(`${base}/${id}/opening-hours`, openingHoursPayload(rows))
  return data
}

export async function savePlaceOpeningExceptions(id: number, rows: ExceptionDraftRow[]) {
  const { data } = await apiClient.put<OpeningException[]>(`${base}/${id}/opening-exceptions`, openingExceptionsPayload(rows))
  return data
}
