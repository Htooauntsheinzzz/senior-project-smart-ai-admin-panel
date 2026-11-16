import apiClient from '../api/apiClient'
import type { CampusCategory, CampusFacility, CampusSite, CategoryDraft, FacilityDraft, SiteDraft } from '../types/campus'
import { getAllPages, numberOrNull, trimOrNull } from './campusCommon'

// AdminCampusSiteController: /api/v1/admin/campus/sites (create, update and delete need SUPER_ADMIN)
// AdminCampusCatalogController: /api/v1/admin/campus/categories and /facilities (create and update need ADMIN or SUPER_ADMIN; no delete)

/** Every campus, active or not, for the setup screen. */
export function getAllCampusSites(signal?: AbortSignal) {
  return getAllPages<CampusSite>('/campus/sites', {}, signal)
}

export function sitePayload(draft: SiteDraft) {
  return {
    siteCode: draft.siteCode.trim(),
    siteName: draft.siteName.trim(),
    description: trimOrNull(draft.description),
    timezone: trimOrNull(draft.timezone),
    centerLatitude: numberOrNull(draft.centerLatitude),
    centerLongitude: numberOrNull(draft.centerLongitude),
    isActive: draft.isActive,
  }
}

export async function createCampusSite(draft: SiteDraft) {
  const { data } = await apiClient.post<CampusSite>('/campus/sites', sitePayload(draft))
  return data
}

export async function updateCampusSite(id: number, draft: SiteDraft) {
  const { data } = await apiClient.put<CampusSite>(`/campus/sites/${id}`, sitePayload(draft))
  return data
}

export async function deleteCampusSite(id: number) {
  await apiClient.delete(`/campus/sites/${id}`)
}

export function categoryPayload(draft: CategoryDraft) {
  if (!draft.mobileGroup) throw new Error('Campus: Select a mobile app group.')
  return { categoryCode: draft.categoryCode.trim(), categoryName: draft.categoryName.trim(), mobileGroup: draft.mobileGroup, description: trimOrNull(draft.description), isActive: draft.isActive }
}

export async function createCampusCategory(draft: CategoryDraft) {
  const { data } = await apiClient.post<CampusCategory>('/campus/categories', categoryPayload(draft))
  return data
}

export async function updateCampusCategory(id: number, draft: CategoryDraft) {
  const { data } = await apiClient.put<CampusCategory>(`/campus/categories/${id}`, categoryPayload(draft))
  return data
}

export function facilityPayload(draft: FacilityDraft) {
  return { facilityCode: draft.facilityCode.trim(), facilityName: draft.facilityName.trim(), description: trimOrNull(draft.description), isActive: draft.isActive }
}

export async function createCampusFacility(draft: FacilityDraft) {
  const { data } = await apiClient.post<CampusFacility>('/campus/facilities', facilityPayload(draft))
  return data
}

export async function updateCampusFacility(id: number, draft: FacilityDraft) {
  const { data } = await apiClient.put<CampusFacility>(`/campus/facilities/${id}`, facilityPayload(draft))
  return data
}
