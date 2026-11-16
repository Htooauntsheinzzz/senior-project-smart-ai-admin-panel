import apiClient from '../api/apiClient'
import type { EdgeStatus, NavigationNode, NavigationRoute, NodeDraft, RouteDraft, RouteStatistics, DestinationDraft, NavigationDestination, NavigationValidation } from '../types/campus'
import { cleanParams, getAllPages, numberOrNull, requiredId } from './campusCommon'

// AdminCampusNavigationController: /api/v1/admin/campus/navigation
const base = '/campus/navigation'

export function getNavigationNodes(signal?: AbortSignal) {
  return getAllPages<NavigationNode>(`${base}/nodes`, {}, signal)
}

export async function getNavigationNodeById(id: number, signal?: AbortSignal) {
  const { data } = await apiClient.get<NavigationNode>(`${base}/nodes/${id}`, { signal })
  return data
}

/** CampusNodeCreateRequest / CampusNodeUpdateRequest (update has no siteId). */
export function nodePayload(draft: NodeDraft, mode: 'create' | 'update') {
  if (!draft.nodeType) throw new Error('Campus: Select a node type.')
  const body = {
    nodeCode: draft.nodeCode.trim(),
    nodeName: draft.nodeName.trim(),
    nodeType: draft.nodeType,
    latitude: numberOrNull(draft.latitude),
    longitude: numberOrNull(draft.longitude),
    isAccessible: draft.isAccessible,
    isActive: draft.isActive,
  }
  return mode === 'create' ? { siteId: requiredId(draft.siteId), ...body } : body
}

export async function createNavigationNode(draft: NodeDraft) {
  const { data } = await apiClient.post<NavigationNode>(`${base}/nodes`, nodePayload(draft, 'create'))
  return data
}

export async function updateNavigationNode(id: number, draft: NodeDraft) {
  const { data } = await apiClient.put<NavigationNode>(`${base}/nodes/${id}`, nodePayload(draft, 'update'))
  return data
}

export async function deleteNavigationNode(id: number) {
  await apiClient.delete(`${base}/nodes/${id}`)
}

/** Figma filter chips map to the backend's status / isWheelchairAccessible edge filters. */
export type RouteFilter = 'ALL' | EdgeStatus | 'ACCESSIBLE'

export function routeFilterParams(filter: RouteFilter) {
  if (filter === 'ALL') return {}
  if (filter === 'ACCESSIBLE') return { isWheelchairAccessible: true }
  return { status: filter }
}

export function getRoutes(filter: RouteFilter, signal?: AbortSignal) {
  return getAllPages<NavigationRoute>(`${base}/edges`, routeFilterParams(filter), signal)
}

export async function getRouteStatistics(signal?: AbortSignal) {
  const { data } = await apiClient.get<RouteStatistics>(`${base}/edges/statistics`, { signal })
  return data
}

export async function getRouteById(id: number, signal?: AbortSignal) {
  const { data } = await apiClient.get<NavigationRoute>(`${base}/edges/${id}`, { signal })
  return data
}

/**
 * CampusEdgeCreateRequest / CampusEdgeUpdateRequest. intermediatePoints is sent
 * unchanged on update so editing a route never erases stored geometry.
 */
export function routePayload(draft: RouteDraft, mode: 'create' | 'update', intermediatePoints: { latitude: number | null; longitude: number | null }[] = []) {
  if (!draft.surfaceType) throw new Error('Campus: Select a surface type.')
  const body = {
    edgeCode: draft.edgeCode.trim(),
    startNodeId: requiredId(draft.startNodeId),
    endNodeId: requiredId(draft.endNodeId),
    distanceMeters: Number(draft.distanceMeters.trim()),
    surfaceType: draft.surfaceType,
    isWheelchairAccessible: draft.isWheelchairAccessible,
    isBidirectional: draft.isBidirectional,
    status: draft.status,
    intermediatePoints,
  }
  return mode === 'create' ? { siteId: requiredId(draft.siteId), ...body } : body
}

export async function createRoute(draft: RouteDraft) {
  const { data } = await apiClient.post<NavigationRoute>(`${base}/edges`, routePayload(draft, 'create'))
  return data
}

export async function updateRoute(id: number, draft: RouteDraft, intermediatePoints: { latitude: number | null; longitude: number | null }[]) {
  const { data } = await apiClient.put<NavigationRoute>(`${base}/edges/${id}`, routePayload(draft, 'update', intermediatePoints))
  return data
}

export async function deleteRoute(id: number) {
  await apiClient.delete(`${base}/edges/${id}`)
}

// ---- Destinations: which node a building or place is reached through (feeds map markers and student routing) ----

export async function getDestinations(signal?: AbortSignal) {
  const { data } = await apiClient.get<NavigationDestination[]>(`${base}/destinations`, { signal })
  if (!Array.isArray(data)) throw new Error('Campus: Unexpected server response.')
  return data
}

export function destinationPayload(draft: DestinationDraft) {
  const building = draft.ownerType === 'BUILDING'
  return {
    nodeId: requiredId(draft.nodeId),
    buildingId: building ? requiredId(draft.buildingId) : null,
    placeId: building ? null : requiredId(draft.placeId),
    isPrimary: draft.isPrimary,
    isAccessibleEntrance: draft.isAccessibleEntrance,
  }
}

export async function createDestination(draft: DestinationDraft) {
  const { data } = await apiClient.post<NavigationDestination>(`${base}/destinations`, destinationPayload(draft))
  return data
}

export async function updateDestination(id: number, draft: DestinationDraft) {
  const { data } = await apiClient.put<NavigationDestination>(`${base}/destinations/${id}`, destinationPayload(draft))
  return data
}

export async function deleteDestination(id: number) {
  await apiClient.delete(`${base}/destinations/${id}`)
}

/** Graph health check: disconnected nodes, unreachable destinations, missing entrances and similar. */
export async function getNavigationValidation(siteId?: number, signal?: AbortSignal) {
  const { data } = await apiClient.get<NavigationValidation>(`${base}/validation`, { params: cleanParams({ siteId }), signal })
  if (!data?.summary) throw new Error('Campus: Unexpected server response.')
  return data
}
