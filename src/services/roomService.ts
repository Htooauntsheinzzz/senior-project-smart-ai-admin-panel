import apiClient from '../api/apiClient'
import type { CampusFacility, Room, RoomDraft, RoomStatistics, RoomStatus, RoomType } from '../types/campus'
import { getPage, numberOrNull, requiredId, trimOrNull } from './campusCommon'

// AdminCampusRoomController: /api/v1/admin/campus/rooms
const base = '/campus/rooms'

export interface RoomFilters { search: string; buildingId: string; floorNumber: string; roomType: RoomType | ''; status: RoomStatus | '' }

/** Supported filters: buildingId, floorNumber (integer), roomType, status, search. */
export function getRooms(params: { page: number; size: number } & RoomFilters, signal?: AbortSignal) {
  return getPage<Room>(base, {
    page: params.page,
    size: params.size,
    search: params.search.trim(),
    buildingId: params.buildingId ? requiredId(params.buildingId) : undefined,
    floorNumber: params.floorNumber === '' ? undefined : Number(params.floorNumber),
    roomType: params.roomType,
    status: params.status,
  }, signal)
}

export async function getRoomStatistics(buildingId?: string, signal?: AbortSignal) {
  const { data } = await apiClient.get<RoomStatistics>(`${base}/statistics`, { params: buildingId ? { buildingId: requiredId(buildingId) } : {}, signal })
  return data
}

/** Active facilities that can be attached to rooms. */
export async function getRoomFacilities(signal?: AbortSignal) {
  const { data } = await apiClient.get<CampusFacility[]>(`${base}/facilities`, { signal })
  return Array.isArray(data) ? data : []
}

export async function getRoomById(id: number, signal?: AbortSignal) {
  const { data } = await apiClient.get<Room>(`${base}/${id}`, { signal })
  return data
}

/** CampusRoomRequest (same DTO for create and update). */
export function roomPayload(draft: RoomDraft) {
  if (!draft.roomType) throw new Error('Campus: Select a room type.')
  return {
    buildingId: requiredId(draft.buildingId),
    roomNumber: draft.roomNumber.trim(),
    roomName: trimOrNull(draft.roomName),
    floorNumber: Number(draft.floorNumber.trim()),
    roomType: draft.roomType,
    capacity: numberOrNull(draft.capacity),
    status: draft.status,
    facilityIds: draft.facilityIds.map(requiredId),
  }
}

export async function createRoom(draft: RoomDraft) {
  const { data } = await apiClient.post<Room>(base, roomPayload(draft))
  return data
}

export async function updateRoom(id: number, draft: RoomDraft) {
  const { data } = await apiClient.put<Room>(`${base}/${id}`, roomPayload(draft))
  return data
}

export async function deleteRoom(id: number) {
  await apiClient.delete(`${base}/${id}`)
}
