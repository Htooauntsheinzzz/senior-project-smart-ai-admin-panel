// Shapes mirror the Spring Boot campus DTOs (feature/campus/dto). Field names
// and enum values are the backend's; the UI maps them to Figma labels.

export type BuildingStatus = 'ACTIVE' | 'UNDER_RENOVATION' | 'INACTIVE'
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'INACTIVE'
export type RoomType = 'CLASSROOM' | 'COMPUTER_LAB' | 'LABORATORY' | 'LECTURE_HALL' | 'MEETING_ROOM' | 'STUDY_ROOM' | 'OFFICE' | 'OTHER'
export type PlaceStatus = 'ACTIVE' | 'TEMPORARILY_CLOSED' | 'INACTIVE'
export type EdgeStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_CONSTRUCTION'
export type SurfaceType = 'PAVED' | 'COVERED_WALKWAY' | 'GRAVEL' | 'STAIRS' | 'RAMP' | 'OTHER'
export type NodeType = 'ENTRANCE' | 'JUNCTION' | 'GATE' | 'POINT_OF_INTEREST' | 'OTHER'
export type MobileGroup = 'BUILDINGS' | 'FOOD' | 'LIBRARY' | 'STUDENT_SERVICES' | 'HEALTH' | 'PARKING' | 'OTHER'
export type LocationType = 'BUILDING' | 'PLACE' | 'ROOM'

/** CampusPageResponse<T> — returned as a plain object, no success/data wrapper. */
export interface CampusPage<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  sort: string[]
}

export interface NamedRef { id: number; code: string; name: string }
export interface Coordinate { latitude: number | null; longitude: number | null }
export interface OpeningHour { dayOfWeek: number; opensAt: string | null; closesAt: string | null; closed: boolean }
export interface OpeningException { date: string; closed: boolean; opensAt: string | null; closesAt: string | null; reason: string | null }

export interface CampusSite {
  id: number; siteCode: string; siteName: string; description: string | null; timezone: string
  centerLatitude: number | null; centerLongitude: number | null; isActive: boolean
}

export interface CampusCategory {
  id: number; categoryCode: string; categoryName: string; mobileGroup: MobileGroup; description: string | null; isActive: boolean
}

export interface CampusFacility { id: number; facilityCode: string; facilityName: string; description: string | null; isActive: boolean }

export interface BuildingListItem {
  id: number; siteId: number; buildingCode: string; buildingName: string; areaSquareMeters: number | null
  totalFloors: number; totalRooms: number; openingHoursSummary: string | null; status: BuildingStatus
}

export interface Building extends BuildingListItem {
  siteName: string; buildingNameTh: string | null; description: string | null
  openingHours: OpeningHour[]; openingExceptions: OpeningException[]
}

export interface BuildingStatistics { totalBuildings: number; activeBuildings: number; underRenovationBuildings: number; inactiveBuildings: number; totalRooms: number }

export interface Room {
  id: number; buildingId: number; buildingCode: string; buildingName: string; roomNumber: string; roomName: string | null
  floorNumber: number; roomType: RoomType; capacity: number | null; status: RoomStatus; facilities: NamedRef[]
}

export interface RoomStatistics { totalRooms: number; available: number; occupied: number; reserved: number; maintenance: number; inactive: number; basis: string }

export interface CampusPlace {
  id: number; siteId: number; category: { id: number; code: string; name: string; mobileGroup: MobileGroup }
  building: NamedRef | null; placeCode: string; placeName: string; placeNameTh: string | null; description: string | null
  floorLabel: string | null; phoneNumber: string | null; isPopular: boolean; isVisibleOnMobile: boolean; status: PlaceStatus
  facilities: NamedRef[]; openingHoursSummary: string | null; openingHours: OpeningHour[]; openingExceptions: OpeningException[]
}

export interface PlaceStatistics {
  totalPlaces: number; activePlaces: number; temporarilyClosedPlaces: number; inactivePlaces: number
  popularPlaces: number; visibleOnMobilePlaces: number; expectedOpenNow: number; activePlacesWithoutPublishedHours: number
}

export interface NavigationNode {
  id: number; siteId: number; nodeCode: string; nodeName: string; nodeType: NodeType
  latitude: number | null; longitude: number | null; isAccessible: boolean; isActive: boolean
}

export interface NavigationRoute {
  id: number; siteId: number; edgeCode: string; startNode: NamedRef; endNode: NamedRef; distanceMeters: number
  walkTimeMinutes: number | null; surfaceType: SurfaceType; isWheelchairAccessible: boolean; isBidirectional: boolean
  status: EdgeStatus; hasGeometry: boolean; intermediatePoints: Coordinate[]
}

export interface RouteStatistics {
  totalNodes: number; activeNodes: number; totalEdges: number; activeEdges: number; inactiveEdges: number
  underConstructionEdges: number; wheelchairAccessibleEdges: number; oneWayEdges: number
}

export interface MapMarker {
  id: number; entityType: LocationType; code: string; name: string; category: string; status: string
  latitude: number | null; longitude: number | null; canNavigate: boolean
}

export interface CampusMap {
  site: { id: number; name: string; centerLatitude: number | null; centerLongitude: number | null }
  buildings: MapMarker[]
  places: MapMarker[]
  navigationNodes: { id: number; entityType: string; code: string; name: string; nodeType: NodeType; latitude: number | null; longitude: number | null; isAccessible: boolean; isActive: boolean }[]
  navigationEdges: { id: number; entityType: string; code: string; startNodeId: number; endNodeId: number; distanceMeters: number; walkTimeMinutes: number | null; surfaceType: SurfaceType; isWheelchairAccessible: boolean; isBidirectional: boolean; status: EdgeStatus; geometry: Coordinate[] }[]
  summary: { totalLocations: number; activeLocations: number; inactiveLocations: number; locationsWithoutCoordinates: number }
}

/** Form drafts hold raw input strings; services convert them to DTO types. */
export interface HoursDraftRow { dayOfWeek: number; closed: boolean; opensAt: string; closesAt: string }

export interface BuildingDraft {
  siteId: string; buildingCode: string; buildingName: string; buildingNameTh: string; description: string
  totalFloors: string; areaSquareMeters: string; status: BuildingStatus
}

export interface RoomDraft {
  buildingId: string; roomNumber: string; roomName: string; floorNumber: string; roomType: RoomType | ''
  capacity: string; status: RoomStatus; facilityIds: string[]
}

export interface PlaceDraft {
  siteId: string; categoryId: string; buildingId: string; placeCode: string; placeName: string; placeNameTh: string
  description: string; floorLabel: string; phoneNumber: string; isPopular: boolean; isVisibleOnMobile: boolean; status: PlaceStatus; facilityIds: string[]
}

export interface NodeDraft {
  siteId: string; nodeCode: string; nodeName: string; nodeType: NodeType | ''; latitude: string; longitude: string
  isAccessible: boolean; isActive: boolean
}

export interface RouteDraft {
  siteId: string; edgeCode: string; startNodeId: string; endNodeId: string; distanceMeters: string; surfaceType: SurfaceType | ''
  isWheelchairAccessible: boolean; isBidirectional: boolean; status: EdgeStatus
}

export interface SiteDraft {
  siteCode: string; siteName: string; description: string; timezone: string; centerLatitude: string; centerLongitude: string; isActive: boolean
}

export interface CategoryDraft { categoryCode: string; categoryName: string; mobileGroup: MobileGroup | ''; description: string; isActive: boolean }

export interface FacilityDraft { facilityCode: string; facilityName: string; description: string; isActive: boolean }

/** One special date (holiday, event) that overrides the weekly opening hours. */
export interface ExceptionDraftRow { date: string; closed: boolean; opensAt: string; closesAt: string; reason: string }

/** CampusDestinationResponse: links a building or place to the node students are routed to. */
export interface NavigationDestination {
  id: number; siteId: number; node: NamedRef; building: NamedRef | null; place: NamedRef | null; isPrimary: boolean; isAccessibleEntrance: boolean
}

export interface DestinationDraft { nodeId: string; ownerType: 'BUILDING' | 'PLACE'; buildingId: string; placeId: string; isPrimary: boolean; isAccessibleEntrance: boolean }

export interface ValidationIssue { entityType: string; id: number | null; code: string | null; detail: string }

/** CampusNavigationValidationResponse (GET /campus/navigation/validation). */
export interface NavigationValidation {
  siteId: number | null; valid: boolean
  summary: { activeNodes: number; activeEdges: number; destinations: number; blockingIssues: number; warnings: number }
  disconnectedNodes: ValidationIssue[]; unreachableDestinations: ValidationIssue[]; invalidCoordinates: ValidationIssue[]; inactiveEdges: ValidationIssue[]
  missingPrimaryEntrances: ValidationIssue[]; missingRouteGeometry: ValidationIssue[]; accessibilityGaps: ValidationIssue[]; crossCampusErrors: ValidationIssue[]
}
