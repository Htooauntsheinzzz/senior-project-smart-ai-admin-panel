# 09 - Campus Management Frontend Implementation & Backend API Integration

## 1. Module Information

### Module Name

```text
Campus Management
```

### Project

```text
Smart AI University Student Assistant – Admin Web
```

### Frontend Stack

```text
React.js
Vite
JavaScript
Tailwind CSS
React Router
Axios
```

### Backend

```text
Spring Boot REST API
```

### Scope

```text
Frontend implementation + existing backend API integration only.
```

---

# 2. CRITICAL RULE — BACKEND MUST NOT BE MODIFIED

The Campus Management backend has already been completed and tested before frontend implementation.

Therefore:

```text
THE EXISTING BACKEND IS THE SOURCE OF TRUTH.
```

The frontend implementation must NOT modify:

```text
Controller
Service
ServiceImpl
Repository
Entity
DTO
Mapper
Enum
Validation
Exception Handling
Security Configuration
JWT Authentication
Authorization
Redis
Flyway
Database Schema
API Endpoint Paths
Request DTO
Response DTO
Backend Business Logic
```

If an API call works in Postman but fails from React:

```text
DO NOT CHANGE BACKEND.
```

Instead check:

```text
Frontend URL
HTTP method
Request body
Query parameters
Request field names
Request data types
Authentication token
Axios configuration
Response mapping
Null handling
Enum values
Vite/Nginx proxy
```

---

# 3. Figma Design Source

## Figma File

```text
Smart Ai Admin Web
```

## File Key

```text
FQhq9uVri66RJpADxECMtm
```

## Main Campus Management Figma URL

```text
https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=121-2466&m=dev
```

---

# 4. Campus Management Figma Screens

The Campus Management section contains five screens.

| Screen | Figma Node |
|---|---|
| Campus Map | `121:2466` |
| Buildings | `121:2` |
| Rooms | `121:3054` |
| Campus Places | `121:3861` |
| Navigation Routes | `121:5185` |

These Figma screens are the visual source of truth.

Do not redesign them.

---

# 5. Campus Management Sidebar

Figma Campus Management submenu contains:

```text
Campus Management
    ├── Campus Map
    ├── Buildings
    ├── Rooms
    ├── Campus Places
    └── Navigation Routes
```

Keep this structure unchanged.

Recommended frontend routes:

```text
/admin/campus/map

/admin/campus/buildings

/admin/campus/rooms

/admin/campus/places

/admin/campus/navigation-routes
```

If the project already has equivalent routes, reuse them instead of creating duplicates.

---

# 6. Authentication

All Campus Management routes are protected.

Reuse the existing:

```text
AuthContext
ProtectedRoute
apiClient
JWT Access Token
Axios Interceptor
AdminLayout
```

Do not create another authentication implementation.

Expected architecture:

```text
Campus Page
    ↓
Campus Service
    ↓
apiClient
    ↓
Existing JWT Interceptor
    ↓
Existing Spring Boot API
```

---

# 7. API Contract Discovery — Mandatory

Before writing Campus API integration code, inspect the already-working backend.

The frontend agent is allowed to READ:

```text
Campus Controllers
Building Controller
Room Controller
Campus Place Controller
Navigation Controller
Request DTOs
Response DTOs
Enums
Existing Postman examples
```

The agent must NOT edit those files.

Required workflow:

```text
Read backend Controller
        ↓
Read Request DTO
        ↓
Read Response DTO
        ↓
Check existing Postman request
        ↓
Check existing Postman response
        ↓
Implement matching frontend request
```

Do not invent endpoint names or request properties.

---

# 8. Endpoint Rule

The exact backend API paths must come from the existing Spring Boot controllers.

For example, if the backend currently exposes something similar to:

```text
/api/v1/admin/campus/...
```

use that exact existing structure.

Do not create a different frontend assumption such as:

```text
/api/v1/admin-web/campus/...
```

unless that is actually what the backend uses.

---

# 9. Backend/Postman Rule

If this succeeds:

```text
Postman
   ↓
Existing Campus API
   ↓
200 OK
```

then the frontend must reproduce the same:

```text
HTTP Method
URL
Authorization
Headers
Query Parameters
Request JSON
Data Types
```

Frontend integration failure does NOT automatically mean backend failure.

---

# 10. Recommended Frontend Structure

```text
src/
├── pages/
│   └── campus/
│       ├── CampusMapPage.jsx
│       ├── BuildingListPage.jsx
│       ├── BuildingCreatePage.jsx
│       ├── BuildingDetailPage.jsx
│       ├── BuildingEditPage.jsx
│       ├── RoomListPage.jsx
│       ├── RoomCreatePage.jsx
│       ├── RoomDetailPage.jsx
│       ├── RoomEditPage.jsx
│       ├── CampusPlacesPage.jsx
│       └── NavigationRoutesPage.jsx
│
├── components/
│   └── campus/
│       ├── CampusMap.jsx
│       ├── CampusMarker.jsx
│       ├── CampusMapSidebar.jsx
│       ├── BuildingTable.jsx
│       ├── BuildingForm.jsx
│       ├── RoomTable.jsx
│       ├── RoomForm.jsx
│       ├── CampusPlaceCard.jsx
│       ├── CampusPlaceTable.jsx
│       ├── CampusPlaceForm.jsx
│       ├── NavigationGraph.jsx
│       ├── NavigationRouteTable.jsx
│       └── DeleteConfirmModal.jsx
│
└── services/
    ├── campusMapService.js
    ├── buildingService.js
    ├── roomService.js
    ├── campusPlaceService.js
    └── navigationRouteService.js
```

Do not create these files blindly.

First inspect existing frontend files and reuse existing components.

---

# 11. Shared UI Rule

Reuse existing application components such as:

```text
AdminLayout
Sidebar
TopNav
PageHeader
SearchInput
Button
Input
Select
Table
StatusBadge
Pagination
Modal
LoadingSpinner
EmptyState
ErrorState
```

Do not recreate them specifically for Campus Management if they already exist.

---

# 12. Design Rule

Do not change:

```text
Sidebar design
Top navigation
Typography
Colors
Spacing
Card styles
Button styles
Status badge styles
Table styles
Search field styles
Pagination styles
Modal styles
Responsive behavior
```

The implementation task is:

```text
FIGMA UI
    +
EXISTING BACKEND API
    =
WORKING CAMPUS MANAGEMENT
```

---

# 13. Screen 1 — Campus Map

## Figma

```text
Node:
121:2466

Name:
Campus Map Screen
```

---

# 14. Campus Map Design

The Figma Campus Map screen contains:

```text
Campus Management header

Interactive campus map

Add Location button

Manage Routes button

Search locations

Map Layers panel

Filter by Type

Navigation Nodes

Walking Routes

Location categories

Summary panel

Map markers

Zoom controls

Compass

Map scale

Campus name

Location details interaction
```

---

# 15. Campus Map Header

Figma description:

```text
Interactive map for mobile navigation data management
```

Primary actions:

```text
Add Location

Manage Routes
```

Keep these labels and design unchanged unless existing UI code already represents them.

---

# 16. Campus Map Search

Figma contains:

```text
Search locations…
```

Search should operate on backend Campus Location data.

If backend supports a search query parameter:

```text
Search Input
    ↓
Backend Search Parameter
    ↓
GET Campus Locations
```

If backend does not support search, do not modify backend simply to add it.

---

# 17. Campus Map Layers

Figma contains map layer controls for concepts such as:

```text
Navigation Nodes

Walking Routes
```

Layer visibility is frontend display state unless the backend explicitly stores user layer preference.

Example state:

```javascript
const [showNavigationNodes, setShowNavigationNodes] = useState(true);
const [showWalkingRoutes, setShowWalkingRoutes] = useState(true);
```

Do not persist this to the backend unless an existing API supports it.

---

# 18. Campus Map Location Categories

The Figma design includes categories such as:

```text
All

Academic Building

Library

Cafeteria

Registrar

Student Affairs

Health Center

Parking

Sports Center
```

The actual backend category values remain authoritative.

Do not hardcode these Figma demo category counts as backend data.

---

# 19. Campus Map Summary

The Figma design displays:

```text
Total Locations

Active

Inactive
```

Example design data shows:

```text
Total Locations: 12
Active: 11
Inactive: 1
```

These are Figma sample values.

Do NOT hardcode:

```javascript
totalLocations = 12
```

Production values must come from backend data or be calculated from backend results.

---

# 20. Campus Map Markers

Each marker must be generated from actual backend location data.

Concept:

```text
GET Campus Locations
        ↓
Location records
        ↓
Coordinates
        ↓
Map markers
```

Possible data requirements may include:

```text
id
name
type
latitude / longitude
x / y map coordinates
status
building reference
floor reference
```

Use the exact fields returned by the backend.

Do not invent coordinate properties if backend uses a different structure.

---

# 21. Campus Map Marker Interaction

Figma indicates:

```text
Click a marker to view location details
```

Expected behavior:

```text
Click marker
     ↓
Select location
     ↓
Show existing detail UI / popup / panel
```

Use the Figma interaction style.

Do not navigate to an unrelated new page unless required by the backend/frontend design.

---

# 22. Map Technology Rule

Do not automatically add:

```text
Google Maps
Mapbox
Leaflet
OpenStreetMap
```

just because the page is called Campus Map.

First inspect the existing frontend implementation and backend coordinate format.

The Figma design uses a custom campus map style.

If the project already has a mapping library, reuse it.

If it does not, do not introduce a large map dependency without a separate requirement.

---

# 23. Add Location

The Figma Campus Map contains:

```text
Add Location
```

The action must connect to the existing backend location-create API.

Workflow:

```text
Add Location
     ↓
Existing Add Location UI
     ↓
Enter location information
     ↓
Validate
     ↓
POST existing backend endpoint
     ↓
Success
     ↓
Refresh Campus Map
```

The exact request fields must come from the backend request DTO.

---

# 24. Manage Routes

Figma contains:

```text
Manage Routes
```

This should navigate to:

```text
/admin/campus/navigation-routes
```

or the existing equivalent route.

Do not create another route-management system.

---

# 25. Screen 2 — Buildings

## Figma

```text
Node:
121:2

Name:
Buildings Screen
```

---

# 26. Buildings Page Header

Figma title:

```text
Campus Buildings
```

Description:

```text
Manage university building information used by the campus navigation system
```

Primary action:

```text
Add Building
```

Keep design unchanged.

---

# 27. Building Statistics

Figma contains:

```text
Total Buildings

Active

Under Renovation

Total Rooms
```

The design example shows:

```text
12 Total Buildings

10 Active

1 Under Renovation

526 Total Rooms
```

These values must NOT be hardcoded.

Load real values from backend.

If backend provides a summary endpoint, use it.

Otherwise calculate from returned backend records only when appropriate.

---

# 28. Building Search

Figma contains:

```text
Search buildings…
```

If backend supports search:

```text
search query
     ↓
GET Building API
```

Use server-side search when available.

Do not add backend search functionality from frontend implementation.

---

# 29. Building Status Filter

Figma contains:

```text
All Statuses
```

Use exact backend-supported Building status values.

Example Figma values include:

```text
Active

Under Renovation
```

The backend enum is authoritative.

Do not invent additional status values.

---

# 30. Building Table

Figma table columns:

```text
Building Code

Building Name

Floors

Opening Hours

Status

Actions
```

The Figma rows also visually include information such as:

```text
building area
room count
building code
building name
floor count
opening hours
status
```

Map backend values into the existing table.

---

# 31. Building Example Design Data

Figma includes examples such as:

```text
AVB
Avebury Building

RSB
Rangsit Building

LIB
Henry Luce III Library

SCB
Science Building

MDB
Medical Building

EGB
Engineering Building

LAB
Liberal Arts Building

SPB
Sports Complex Building
```

These are design examples.

Do not hardcode them as production records after API integration.

---

# 32. Building CRUD

Required frontend integration:

```text
Get Building List

Get Building by ID

Create Building

Update Building

Delete / Deactivate Building
```

The exact endpoints must be read from the existing backend controller.

---

# 33. Building Create Workflow

```text
Add Building
     ↓
Existing Building Form
     ↓
Validate
     ↓
Build exact backend request DTO
     ↓
POST existing backend API
     ↓
Success
     ↓
Refresh Building List
```

Do not send backend-managed audit properties unless the backend request DTO requires them.

---

# 34. Building Update Workflow

```text
Actions
   ↓
Edit
   ↓
GET Building by ID
   ↓
Populate form
   ↓
Update fields
   ↓
PUT/PATCH existing backend endpoint
   ↓
Success
   ↓
Refresh
```

Use whichever HTTP method the existing backend actually implements.

Do not change backend PUT to PATCH or vice versa.

---

# 35. Building Delete Workflow

```text
Actions
   ↓
Delete
   ↓
Existing confirmation UI
   ↓
DELETE existing API
   ↓
Backend handles delete behavior
   ↓
Refresh Building List
```

The frontend does not decide whether deletion is:

```text
hard delete
soft delete
status change
```

That is backend responsibility.

---

# 36. Building Service

Create or reuse:

```text
src/services/buildingService.js
```

Required logical methods:

```javascript
getBuildings(params)

getBuildingById(id)

createBuilding(payload)

updateBuilding(id, payload)

deleteBuilding(id)
```

Each method must use the exact existing backend endpoint.

---

# 37. Screen 3 — Rooms

## Figma

```text
Node:
121:3054

Name:
Rooms Screen
```

---

# 38. Rooms Page Header

Figma description:

```text
Manage classroom, lab, and office room data for campus navigation
```

Primary action:

```text
Add Room
```

---

# 39. Room Statistics

Figma displays:

```text
Total Rooms

Available

Occupied

Maintenance
```

Sample design values:

```text
18 Total Rooms

9 Available

4 Occupied

2 Maintenance
```

These are sample UI values only.

Use actual backend data.

---

# 40. Room Search

Figma contains:

```text
Search rooms…
```

Connect to backend room search if already supported.

---

# 41. Room Filters

The Figma Rooms screen contains:

```text
All Buildings

All Floors

All Types

All Statuss
```

Preserve the existing wording/design unless separately correcting UI copy.

These filters should use backend-supported values.

---

# 42. Building Filter

Building filter should load actual backend Building data.

Display:

```text
Avebury Building
```

Submit:

```text
buildingId
```

if the existing backend Room API expects a Building ID.

Do not hardcode Building IDs.

---

# 43. Floor Filter

Use backend room floor data.

Do not assume floor is numeric if backend uses values such as:

```text
G
B1
F1
F2
```

Use exact backend format.

---

# 44. Room Type Filter

Figma shows examples such as:

```text
Classroom

Computer Lab

Laboratory

Lecture Hall

Meeting Room

Study Room
```

Use backend-supported room type values.

Do not create frontend-only enums that conflict with the backend.

---

# 45. Room Status

Figma contains statuses such as:

```text
Available

Occupied

Reserved

Under Maintenance
```

Again:

```text
BACKEND ENUM = SOURCE OF TRUTH
```

---

# 46. Room Table

Figma columns:

```text
Room Number

Room Name

Building

Floor

Type

Capacity

Status

Facilities

Actions
```

Keep the table appearance unchanged.

---

# 47. Room Facilities

Figma shows facility icons such as:

```text
Projector

Air Conditioning

Other room facilities
```

The frontend should map backend facility values to the existing design.

Do not invent facility records.

---

# 48. Room CRUD

Required integration:

```text
Get Rooms

Get Room by ID

Create Room

Update Room

Delete Room
```

Use existing backend endpoints only.

---

# 49. Room Create Workflow

```text
Add Room
    ↓
Existing Room Form
    ↓
Load Buildings
    ↓
Enter room data
    ↓
Validate
    ↓
POST existing Room API
    ↓
Success
    ↓
Refresh Room List
```

---

# 50. Room Building Relationship

If backend Room request contains:

```text
buildingId
```

send the numeric backend ID.

Do not send:

```text
"Avebury Building"
```

when backend expects:

```text
buildingId: 1
```

---

# 51. Room Service

Create or reuse:

```text
src/services/roomService.js
```

Logical methods:

```javascript
getRooms(params)

getRoomById(id)

createRoom(payload)

updateRoom(id, payload)

deleteRoom(id)
```

Use actual backend routes.

---

# 52. Screen 4 — Campus Places

## Figma

```text
Node:
121:3861

Name:
Campus Places Screen
```

---

# 53. Campus Places Header

Figma description:

```text
Points of interest and campus facilities for the student mobile navigation app
```

Primary action:

```text
Add Campus Place
```

---

# 54. Campus Place View Modes

The Figma design contains:

```text
⊞ Cards

☰ Table
```

Implement view switching with frontend state.

Example:

```javascript
const [viewMode, setViewMode] = useState("cards");
```

Changing view mode should not require backend changes.

Both views display the same backend Campus Place data.

---

# 55. Campus Place Statistics

Figma includes:

```text
Total Places

Open

Closed

Popular
```

Sample values:

```text
15 Total Places

14 Open

1 Closed

7 Popular
```

Do not hardcode these numbers.

---

# 56. Campus Place Categories

Figma filters include categories such as:

```text
All

Library

Cafeteria

Registrar

Student Affairs

Health Center

ATM

Parking

Sports Center

Main Gate
```

Use actual backend category/type values.

---

# 57. Campus Place Search

Figma contains:

```text
Search places…
```

Connect to the existing backend API search/filter behavior.

---

# 58. Campus Place Status Filter

Figma contains:

```text
All Statuses
```

Example status labels include:

```text
Open

Temporarily Closed
```

Use exact backend-supported values.

---

# 59. Campus Place Card

The Figma card design displays information such as:

```text
Place name

Status

Description

Building

Floor

Hours

Phone

Popular indicator

Actions
```

Keep this design.

---

# 60. Campus Place Example

Figma contains example cards such as:

```text
Henry Luce III Library

RSU Cafeteria Central

Registrar Office

Student Affairs Office

Health Center

ATM — Kasikorn Bank

Parking Zone A

RSU Sports Complex

Main Gate
```

These are sample Figma data.

Do not use them as hardcoded production data after integration.

---

# 61. Campus Place Detail Fields

The actual backend DTO determines the fields.

The Figma visual design expects concepts such as:

```text
name
category
description
status
building
floor
openingHours
phone
popular
location
```

Do not assume these exact property names.

Map the actual backend response into these UI slots.

---

# 62. Campus Place CRUD

Required integration:

```text
Get Campus Places

Get Campus Place by ID

Create Campus Place

Update Campus Place

Delete Campus Place
```

Use existing backend endpoints.

---

# 63. Campus Place Service

Create or reuse:

```text
src/services/campusPlaceService.js
```

Logical methods:

```javascript
getCampusPlaces(params)

getCampusPlaceById(id)

createCampusPlace(payload)

updateCampusPlace(id, payload)

deleteCampusPlace(id)
```

---

# 64. Campus Place Card/Table Synchronization

Both:

```text
Cards View
```

and:

```text
Table View
```

must use the same API state.

Do NOT perform two separate backend requests solely because the display mode changed.

Example:

```text
GET Campus Places
      ↓
campusPlaces state
      ↓
Cards OR Table
```

---

# 65. Screen 5 — Navigation Routes

## Figma

```text
Node:
121:5185

Name:
Navigation Screen
```

---

# 66. Navigation Page Purpose

Figma description:

```text
Manage campus walking graph — nodes and paths used by the student mobile navigation
```

Primary actions:

```text
Add Node

Connect Nodes
```

This screen manages the campus navigation graph used by the student application.

---

# 67. Navigation Summary

Figma shows:

```text
Total Routes

Active

Accessible

Under Construction
```

Sample values:

```text
18 Total Routes

16 Active

15 Accessible

1 Under Construction
```

Do not hardcode these values.

---

# 68. Navigation Route Filters

Figma includes:

```text
Filter Routes:

All

Active

Inactive

♿ Accessible
```

Filter using existing backend-supported parameters when available.

---

# 69. Navigation Graph

The screen visually displays Campus Nodes connected by route lines.

Example Figma nodes include:

```text
Main Gate

North Gate

AVB

RSB

LIB

CAF

ADM

MDB

SPT

SCB

JCT-A

JCT-B

JCT-C

PKA

HLT
```

These are sample design labels.

Load real backend Navigation Node data.

---

# 70. Navigation Node API

The frontend may require existing backend operations similar to:

```text
Get Navigation Nodes

Get Navigation Node by ID

Create Navigation Node

Update Navigation Node

Delete Navigation Node
```

Only implement operations that already exist in the backend.

Do NOT create new backend node endpoints.

---

# 71. Add Node

Figma action:

```text
Add Node
```

Workflow:

```text
Add Node
   ↓
Existing node form/modal
   ↓
Enter backend-required values
   ↓
POST existing Navigation Node API
   ↓
Success
   ↓
Refetch Navigation Graph
```

---

# 72. Connect Nodes

Figma action:

```text
Connect Nodes
```

This creates a navigation route/edge between nodes.

Workflow:

```text
Connect Nodes
      ↓
Select Start Node
      ↓
Select End Node
      ↓
Enter route information
      ↓
POST existing Route API
      ↓
Refetch graph and route list
```

Exact request structure comes from the backend DTO.

---

# 73. Route Table

Figma table columns:

```text
ID

Start Node

End Node

Distance

Walk Time

Surface

Status

Actions
```

Keep this table structure.

---

# 74. Route Example Values

Figma contains examples such as:

```text
R01

Main Gate

Junction C

180 m

2 min

Covered Walkway

Active
```

Other Figma surface examples include:

```text
Paved

Gravel
```

These are sample values only.

Use backend data.

---

# 75. Route Accessibility

Figma displays accessibility information:

```text
♿ Accessible
```

The exact backend property may be:

```text
accessible
isAccessible
accessibilityStatus
```

or another structure.

Inspect the backend DTO.

Do not guess the property name.

---

# 76. Route Status

Example Figma statuses:

```text
Active

Inactive

Under Construction
```

Use backend enum values.

---

# 77. Navigation Route CRUD

Required frontend integration according to existing backend capabilities:

```text
Get Routes

Get Route by ID

Create Route

Update Route

Delete Route
```

Do not implement frontend-only routes disconnected from backend persistence.

---

# 78. Navigation Service

Create or reuse:

```text
src/services/navigationRouteService.js
```

Logical methods:

```javascript
getNavigationNodes(params)

getNavigationNodeById(id)

createNavigationNode(payload)

updateNavigationNode(id, payload)

deleteNavigationNode(id)

getRoutes(params)

getRouteById(id)

createRoute(payload)

updateRoute(id, payload)

deleteRoute(id)
```

Use exact backend endpoints discovered from the Spring Boot controllers.

---

# 79. Route Graph Update

After:

```text
Create Node

Update Node

Delete Node

Create Route

Update Route

Delete Route
```

refetch:

```text
Navigation Nodes

Navigation Routes
```

so both graph and table remain synchronized.

---

# 80. Do Not Implement Pathfinding in React

Do not create algorithms such as:

```text
Dijkstra

A*

Shortest Path
```

inside the Admin frontend unless explicitly required by the backend/frontend specification.

Campus Management frontend is responsible for managing navigation data.

Routing/pathfinding logic should remain where the existing architecture defines it.

---

# 81. Service Architecture

Recommended:

```text
CampusMapPage
      ↓
campusMapService

BuildingsPage
      ↓
buildingService

RoomsPage
      ↓
roomService

CampusPlacesPage
      ↓
campusPlaceService

NavigationRoutesPage
      ↓
navigationRouteService

All Services
      ↓
apiClient
      ↓
Existing Spring Boot APIs
```

---

# 82. Central API Client

Reuse:

```text
src/api/apiClient.js
```

Do not create:

```text
campusAxios.js
buildingAxios.js
roomAxios.js
```

unless the entire project architecture already intentionally uses separate clients.

---

# 83. Authorization Header

Reuse the existing authentication interceptor.

Do NOT repeatedly write:

```javascript
headers: {
  Authorization: `Bearer ${token}`
}
```

inside every Campus service function.

Expected:

```text
service
   ↓
apiClient
   ↓
interceptor
   ↓
Authorization
```

---

# 84. Response Mapping

Do not assume backend returns:

```javascript
response.data
```

as the direct array.

Backend might use:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

or pagination such as:

```json
{
  "content": [],
  "page": 0,
  "size": 10,
  "totalElements": 100
}
```

Inspect the actual Postman response.

---

# 85. Pagination

Figma Buildings and Rooms screens contain pagination.

Examples include:

```text
Showing 1–8 of 12

Showing 1–10 of 18
```

If backend pagination exists, use it.

Workflow:

```text
Pagination UI
      ↓
page / size
      ↓
GET backend API
      ↓
Backend page
      ↓
Render table
```

Do not load every record and fake server pagination if the backend already paginates.

---

# 86. Search Debounce

Search fields should not call the backend for every keystroke without control.

If server-side search is used, a small debounce may be used.

Example architecture:

```text
User types
   ↓
debounce
   ↓
GET backend search
```

Do not add an unnecessary dependency solely for debounce.

---

# 87. Loading States

Each screen must handle loading.

Examples:

```text
Loading campus locations...

Loading buildings...

Loading rooms...

Loading campus places...

Loading navigation routes...
```

Use the existing application loading design.

Do not redesign the screen.

---

# 88. Empty States

Examples:

```text
No campus locations found.

No buildings found.

No rooms found.

No campus places found.

No navigation routes found.
```

Use existing empty-state components.

---

# 89. Create Loading State

When Create is running:

```text
isSubmitting = true
```

Disable the submit button.

Do not allow duplicate POST requests.

---

# 90. Update Loading State

When Update is running:

```text
isUpdating = true
```

Disable the update action until request finishes.

---

# 91. Delete Loading State

When Delete is running:

```text
isDeleting = true
```

Do not allow repeated DELETE requests.

---

# 92. Delete Confirmation

Never immediately delete when the user first selects Delete.

Workflow:

```text
Delete
   ↓
Confirmation modal
   ↓
Confirm
   ↓
DELETE API
```

Use the existing modal design.

---

# 93. Error Handling

Handle:

```text
400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

500 Internal Server Error

Network Error
```

---

# 94. 400 Validation Error

Display safe backend validation messages.

Example:

```text
Building code is required.

Room number is required.

Invalid campus place status.
```

Do not expose Java stack traces.

---

# 95. 401 Unauthorized

Reuse global authentication handling.

Expected:

```text
401
 ↓
apiClient interceptor
 ↓
clear authentication
 ↓
/login
```

Do not create Campus-specific login handling.

---

# 96. 403 Forbidden

Do not attempt to bypass backend permissions.

Show the application's existing access denied behavior.

---

# 97. 404 Not Found

Examples:

```text
Building not found.

Room not found.

Campus place not found.

Navigation route not found.
```

Use existing page/error UI.

---

# 98. 409 Conflict

Possible examples:

```text
Building code already exists.

Room number already exists.

Navigation connection already exists.
```

Use backend-safe response messages.

Do not automatically change the user's data.

---

# 99. 500 Error

Display:

```text
Unable to complete the request. Please try again.
```

Never display:

```text
SQL exception

Hibernate error

Java stack trace

Database information

Internal class names
```

---

# 100. Network Error

Display:

```text
Unable to connect to the server. Please try again.
```

Check frontend infrastructure before changing backend:

```text
Vite proxy

Nginx proxy

Docker

API base URL

Backend container status
```

---

# 101. Mock Data Rule

The Figma screens contain sample data.

After API integration, remove hardcoded production mock arrays such as:

```javascript
const buildings = [...]
const rooms = [...]
const campusPlaces = [...]
const navigationRoutes = [...]
```

Backend data must become the source.

---

# 102. Do Not Hardcode Figma Statistics

Do not leave:

```javascript
totalBuildings = 12;
totalRooms = 18;
totalPlaces = 15;
totalRoutes = 18;
```

These are Figma display examples only.

Use backend values.

---

# 103. Frontend Data Types

IDs received from HTML `<select>` elements may initially be strings.

If backend requires numeric IDs:

```javascript
Number(value)
```

must be used before request submission.

Example:

```javascript
buildingId:
  formData.buildingId === ""
    ? null
    : Number(formData.buildingId)
```

Use this only where backend DTO expects a numeric ID.

---

# 104. Null Handling

Do not convert:

```text
null
```

into:

```text
"null"
0
undefined
```

unless backend requires it.

Follow existing DTO behavior.

---

# 105. Enum Handling

Frontend labels may be user-friendly:

```text
Under Renovation
```

while backend might expect:

```text
UNDER_RENOVATION
```

Submit backend enum value.

Display Figma-friendly label.

Example:

```text
Backend:
UNDER_RENOVATION

UI:
Under Renovation
```

---

# 106. Audit Fields

Do not manually submit fields such as:

```text
createdBy

createdAt

updatedBy

updatedAt

isDeleted
```

unless the backend request DTO explicitly requires them.

Backend auditing remains backend responsibility.

---

# 107. Campus Map API State

Recommended page state may include:

```javascript
locations
selectedLocation
selectedType
searchTerm
showNavigationNodes
showWalkingRoutes
isLoading
error
```

Do not put server data into unnecessary global state unless other modules need it globally.

---

# 108. Buildings API State

Recommended:

```javascript
buildings
page
pageSize
search
status
totalElements
isLoading
error
```

Match backend pagination contract.

---

# 109. Rooms API State

Recommended:

```javascript
rooms
page
pageSize
search
buildingId
floor
roomType
status
totalElements
isLoading
error
```

Only send supported backend query parameters.

---

# 110. Campus Places API State

Recommended:

```javascript
campusPlaces
viewMode
category
status
search
isLoading
error
```

`viewMode` is frontend-only.

---

# 111. Navigation API State

Recommended:

```javascript
nodes
routes
selectedRoute
routeFilter
isLoadingNodes
isLoadingRoutes
error
```

Keep graph and route table based on the same backend data.

---

# 112. Figma Assets

Use Figma assets exactly where required.

Do not permanently reference temporary Figma MCP URLs.

Export/download necessary icons/assets into:

```text
src/assets/
```

Reuse existing project assets when they are exact visual matches.

---

# 113. Responsive Design

The Figma Campus screens are desktop Admin Web designs.

Preserve desktop appearance.

For smaller widths:

```text
table may scroll horizontally
filters may wrap
cards may wrap
map panel should remain usable
sidebar behavior follows existing AdminLayout
```

Do not create an unrelated mobile admin design.

---

# 114. Campus Map Responsive Rule

The map should maintain useful visible area.

Do not force Figma's exact:

```text
1757px
```

screen width into the browser.

Use responsive layout.

Figma dimensions are design references, not fixed browser dimensions.

---

# 115. Building Responsive Rule

Building table may use:

```text
overflow-x-auto
```

inside the existing table container when necessary.

Do not alter table column design unnecessarily.

---

# 116. Room Responsive Rule

Room filters may wrap responsively while preserving their design order.

---

# 117. Campus Place Responsive Rule

Card mode should use responsive grid behavior.

Do not change card content hierarchy.

---

# 118. Navigation Responsive Rule

The navigation graph and route table may stack vertically on smaller admin widths if necessary.

Desktop layout must remain faithful to Figma.

---

# 119. Campus Management Route Architecture

```text
/admin/campus
      |
      ├── map
      |
      ├── buildings
      |
      ├── rooms
      |
      ├── places
      |
      └── navigation-routes
```

All routes sit inside:

```text
ProtectedRoute
    ↓
AdminLayout
```

---

# 120. Example AppRoutes Structure

Concept only:

```jsx
<Route
  path="/admin/campus"
  element={
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route
    path="map"
    element={<CampusMapPage />}
  />

  <Route
    path="buildings"
    element={<BuildingListPage />}
  />

  <Route
    path="rooms"
    element={<RoomListPage />}
  />

  <Route
    path="places"
    element={<CampusPlacesPage />}
  />

  <Route
    path="navigation-routes"
    element={<NavigationRoutesPage />}
  />
</Route>
```

Adapt to existing router structure.

---

# 121. Backend API Mapping Checklist

Before connecting each service, verify:

```text
Controller base path

HTTP method

Endpoint suffix

Path variable type

Request body DTO

Response DTO

Pagination parameters

Search parameters

Filter parameters

Supported enums

Nullable fields

Authorization requirements

Success HTTP status

Error response format
```

---

# 122. Example Service Pattern

Do not hardcode guessed paths.

Use this pattern after reading the actual Controller:

```javascript
import apiClient from "../api/apiClient";

export const getBuildings = async (params) => {
  const response = await apiClient.get(
    EXISTING_BACKEND_BUILDING_LIST_ENDPOINT,
    { params }
  );

  return response.data;
};
```

Replace:

```text
EXISTING_BACKEND_BUILDING_LIST_ENDPOINT
```

with the actual existing Spring Boot endpoint.

---

# 123. Backend Mismatch Rule

If frontend expects:

```text
buildingId
```

but backend DTO actually expects:

```text
buildingCode
```

or another field:

```text
CHANGE FRONTEND MAPPING.
```

Do NOT change backend DTO.

---

# 124. Postman Comparison Workflow

When integration fails:

```text
Open successful Postman request
        ↓
Compare URL
        ↓
Compare HTTP method
        ↓
Compare Authorization
        ↓
Compare Content-Type
        ↓
Compare body
        ↓
Compare field types
        ↓
Compare query params
        ↓
Fix frontend
```

---

# 125. Campus Map Testing

Verify:

```text
Map page loads.

Location API runs.

Markers use backend records.

Search works according to backend support.

Type filtering works.

Marker detail interaction works.

Add Location uses existing backend API.

Manage Routes opens Navigation screen.

Map statistics are not hardcoded.
```

---

# 126. Building Testing

Verify:

```text
Building list loads.

Search works when backend supports it.

Status filter works.

Pagination works.

Create Building works.

Edit Building works.

Delete Building works.

Statistics use backend values.

No hardcoded Figma records remain.
```

---

# 127. Room Testing

Verify:

```text
Room list loads.

Building filter uses backend Buildings.

Floor filter works if backend supports it.

Room Type filter works.

Status filter works.

Create Room works.

Edit Room works.

Delete Room works.

Facilities render correctly.

No mock room records remain.
```

---

# 128. Campus Places Testing

Verify:

```text
Campus Places load.

Card view works.

Table view works.

Changing view does not cause unnecessary API requests.

Category filter works.

Status filter works.

Search works.

Create Campus Place works.

Edit Campus Place works.

Delete Campus Place works.

Backend data replaces Figma mock data.
```

---

# 129. Navigation Testing

Verify:

```text
Navigation nodes load.

Routes load.

Graph uses backend nodes/routes.

Add Node works.

Connect Nodes works.

Route filters work.

Route table matches backend data.

Edit Route works.

Delete Route works.

Graph refreshes after mutation.

Table refreshes after mutation.
```

---

# 130. Authentication Testing

Without a valid access token:

```text
/admin/campus/map
```

must not be accessible.

Expected:

```text
redirect /login
```

according to existing Authentication implementation.

---

# 131. Backend Regression Rule

After frontend integration, existing Postman requests must continue working exactly as before.

Frontend implementation must not break:

```text
Campus APIs
Building APIs
Room APIs
Campus Place APIs
Navigation APIs
```

because backend source must remain untouched.

---

# 132. Implementation Order

Follow this order:

```text
1. Read AGENT.md

2. Read 09-campus-management.md

3. Inspect existing AdminLayout

4. Inspect existing Campus frontend code

5. Inspect Figma Campus Map node 121:2466

6. Inspect Figma Buildings node 121:2

7. Inspect Figma Rooms node 121:3054

8. Inspect Figma Campus Places node 121:3861

9. Inspect Figma Navigation node 121:5185

10. Inspect backend Campus Controllers in read-only mode

11. Inspect Request DTOs

12. Inspect Response DTOs

13. Compare successful Postman requests

14. DO NOT modify backend

15. Create/reuse Campus services

16. Implement Campus Map API integration

17. Implement Buildings API integration

18. Implement Rooms API integration

19. Implement Campus Places API integration

20. Implement Navigation Nodes API integration

21. Implement Navigation Routes API integration

22. Connect search/filter/pagination supported by backend

23. Implement loading/error/empty states

24. Remove mock Figma data

25. Test against same backend used by Postman

26. Compare each screen with Figma

27. Fix frontend differences only
```

---

# 133. Agent Implementation Prompt

Use this prompt when implementing the feature:

```text
Implement the complete Campus Management frontend module.

IMPORTANT:

The Campus Management backend is already completed and tested successfully with Postman.

DO NOT MODIFY BACKEND CODE.

DO NOT modify:

- Controllers
- Services
- ServiceImpl classes
- Repositories
- Entities
- DTOs
- Mappers
- Enums
- Validation
- Exception handling
- Authentication
- Authorization
- JWT
- Redis
- Flyway
- Database schema
- Existing API endpoints
- Existing response structure

Use the existing backend as the source of truth.

Figma:

File:
FQhq9uVri66RJpADxECMtm

Campus Map:
121:2466

Buildings:
121:2

Rooms:
121:3054

Campus Places:
121:3861

Navigation Routes:
121:5185

Frontend stack:

- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Axios

Implementation requirements:

1. Read AGENT.md.
2. Read spec-md/09-campus-management.md.
3. Use the project Figma MCP to inspect all five Campus Management screens.
4. Keep the Figma design unchanged.
5. Reuse existing AdminLayout, Sidebar and TopNav.
6. Reuse existing shared UI components.
7. Inspect the existing backend Campus controllers in READ-ONLY mode.
8. Inspect existing request and response DTOs.
9. Review the successful Postman requests and responses.
10. Never invent endpoint paths when the backend already defines them.
11. Reuse the centralized apiClient.
12. Reuse the current authentication interceptor.
13. Implement Campus Map with actual backend location data.
14. Implement Buildings list/create/detail/edit/delete.
15. Implement Rooms list/create/detail/edit/delete.
16. Implement Campus Places API integration with Card/Table view.
17. Implement Navigation Node API integration.
18. Implement Navigation Route API integration.
19. Connect backend-supported search.
20. Connect backend-supported filters.
21. Connect backend-supported pagination.
22. Correctly map IDs, nullable fields and enums.
23. Do not hardcode Figma sample statistics.
24. Remove mock data after backend integration.
25. Refetch affected data after create/update/delete.
26. Handle loading, empty, success and error states.
27. Handle 401 through the existing centralized authentication.
28. Do not bypass 403 permissions.
29. Do not expose backend exceptions to users.
30. Do not implement new backend functionality.
31. If Postman succeeds but frontend fails, debug frontend first.
32. Do not modify unrelated modules.
```

---

# 134. Acceptance Criteria

Campus Management frontend implementation is complete when:

```text
All five Campus Management screens are implemented.

Campus Map matches Figma node 121:2466.

Buildings matches Figma node 121:2.

Rooms matches Figma node 121:3054.

Campus Places matches Figma node 121:3861.

Navigation Routes matches Figma node 121:5185.

Existing Sidebar design is unchanged.

Existing TopNav design is unchanged.

Backend code remains unchanged.

Existing Postman API tests continue to work.

Campus Map uses real backend data.

Map markers are not hardcoded.

Building List uses real backend data.

Building CRUD uses existing APIs.

Room List uses real backend data.

Room CRUD uses existing APIs.

Campus Places use real backend data.

Campus Place CRUD uses existing APIs.

Card/Table switching works.

Navigation Nodes use real backend data.

Navigation Routes use real backend data.

Add Node uses existing API.

Connect Nodes uses existing API.

Navigation graph refreshes correctly.

Route table refreshes correctly.

Search uses existing backend support.

Filters use existing backend support.

Pagination uses existing backend support.

Figma example statistics are not hardcoded.

Mock data is removed from production screens.

IDs use backend-required types.

Nullable fields are correctly handled.

Enums match backend values.

apiClient is reused.

Authentication interceptor is reused.

No duplicate Axios client is introduced.

401 is handled centrally.

403 permissions are not bypassed.

404 errors are handled.

409 conflicts are handled when returned.

500 errors display safe messages.

No backend stack trace is exposed.

No backend Controller was modified.

No backend Service was modified.

No backend Repository was modified.

No backend DTO was modified.

No backend Entity was modified.

No Flyway migration was modified.

No database schema was modified.

No unrelated frontend module was modified.
```

---

# 135. Final Architecture

```text
                         CAMPUS MANAGEMENT
                                |
        +-----------------------+-----------------------+
        |               |              |               |
        v               v              v               v
   Campus Map       Buildings        Rooms        Campus Places
        |               |              |               |
        |               |              |               |
        +---------------+------+-------+---------------+
                               |
                               v
                       Navigation Routes
                               |
                               v
                       Frontend Services
                               |
                               v
                          apiClient.js
                               |
                               v
                   Existing JWT Interceptor
                               |
                               v
                  Existing Spring Boot APIs
                               |
                               v
                   Existing PostgreSQL Data
```

Final development rule:

```text
FIGMA = VISUAL SOURCE OF TRUTH

BACKEND = API/BUSINESS SOURCE OF TRUTH

FRONTEND = CONNECT BOTH
```

Most important rule:

```text
BACKEND ALREADY WORKS WITH POSTMAN.

DO NOT CHANGE THE BACKEND.

MAKE THE FRONTEND MATCH THE EXISTING BACKEND API.
```