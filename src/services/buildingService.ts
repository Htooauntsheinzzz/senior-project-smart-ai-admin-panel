import apiClient from '../api/apiClient'
import type { Building, BuildingDraft, BuildingListItem, BuildingStatistics, BuildingStatus, HoursDraftRow, OpeningHour, ExceptionDraftRow, OpeningException } from '../types/campus'
import { getAllPages, getPage, numberOrNull, requiredId, trimOrNull } from './campusCommon'

// AdminCampusBuildingController: /api/v1/admin/campus/buildings
const base = '/campus/buildings'

export function getBuildings(params: { page: number; size: number; search?: string; status?: BuildingStatus | '' }, signal?: AbortSignal) {
  return getPage<BuildingListItem>(base, { page: params.page, size: params.size, search: params.search?.trim(), status: params.status }, signal)
}

/** All buildings, for filter and form selects. */
export function getAllBuildings(signal?: AbortSignal) {
  return getAllPages<BuildingListItem>(base, {}, signal)
}

export async function getBuildingStatistics(signal?: AbortSignal) {
  const { data } = await apiClient.get<BuildingStatistics>(`${base}/statistics`, { signal })
  return data
}

export async function getBuildingById(id: number, signal?: AbortSignal) {
  const { data } = await apiClient.get<Building>(`${base}/${id}`, { signal })
  return data
}

/** CampusBuildingCreateRequest / CampusBuildingUpdateRequest (update has no siteId). */
export function buildingPayload(draft: BuildingDraft, mode: 'create' | 'update') {
  const body = {
    buildingCode: draft.buildingCode.trim(),
    buildingName: draft.buildingName.trim(),
    buildingNameTh: trimOrNull(draft.buildingNameTh),
    description: trimOrNull(draft.description),
    totalFloors: Number(draft.totalFloors.trim()),
    areaSquareMeters: numberOrNull(draft.areaSquareMeters),
    status: draft.status,
  }
  return mode === 'create' ? { siteId: requiredId(draft.siteId), ...body } : body
}

export async function createBuilding(draft: BuildingDraft) {
  const { data } = await apiClient.post<Building>(base, buildingPayload(draft, 'create'))
  return data
}

export async function updateBuilding(id: number, draft: BuildingDraft) {
  const { data } = await apiClient.put<Building>(`${base}/${id}`, buildingPayload(draft, 'update'))
  return data
}

export async function deleteBuilding(id: number) {
  await apiClient.delete(`${base}/${id}`)
}

/** CampusOpeningHoursRequest: only days with a decision are sent; blank open days are omitted. */
export function openingHoursPayload(rows: HoursDraftRow[]): { hours: OpeningHour[] } {
  return {
    hours: rows
      .filter(row => row.closed || (row.opensAt && row.closesAt))
      .map(row => row.closed
        ? { dayOfWeek: row.dayOfWeek, opensAt: null, closesAt: null, closed: true }
        : { dayOfWeek: row.dayOfWeek, opensAt: row.opensAt.slice(0, 5), closesAt: row.closesAt.slice(0, 5), closed: false }),
  }
}

export async function saveBuildingOpeningHours(id: number, rows: HoursDraftRow[]) {
  const { data } = await apiClient.put<OpeningHour[]>(`${base}/${id}/opening-hours`, openingHoursPayload(rows))
  return data
}

/** PUT .../opening-exceptions replaces the whole list; closed dates send null times. */
export function openingExceptionsPayload(rows: ExceptionDraftRow[]): { exceptions: OpeningException[] } {
  return {
    exceptions: rows.filter(row => row.date).map(row => ({
      date: row.date,
      closed: row.closed,
      opensAt: row.closed ? null : row.opensAt.slice(0, 5),
      closesAt: row.closed ? null : row.closesAt.slice(0, 5),
      reason: trimOrNull(row.reason),
    })),
  }
}

export async function saveBuildingOpeningExceptions(id: number, rows: ExceptionDraftRow[]) {
  const { data } = await apiClient.put<OpeningException[]>(`${base}/${id}/opening-exceptions`, openingExceptionsPayload(rows))
  return data
}
