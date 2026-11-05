# Lecturer Management Frontend API Integration

## 1. Module Information

### Module Name

```text
Lecturer Management
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
Frontend API integration only.
```

This module connects the existing Lecturer Management frontend UI to the already completed backend Lecturer APIs.

---

# 2. Critical Backend Rule

## DO NOT MODIFY BACKEND CODE

The Lecturer backend feature is already implemented and has already been tested successfully using Postman.

Therefore:

```text
BACKEND IS THE SOURCE OF TRUTH.
```

The frontend must adapt to the existing backend API.

The frontend implementation must NOT modify:

```text
Controller
Service
ServiceImpl
Repository
Entity
DTO
Mapper
Validation
Security
Authentication
Authorization
Flyway migrations
Database schema
Redis
Exception handling
API response structure
Existing endpoint paths
```

If frontend integration discovers a mismatch:

```text
STOP frontend assumption
        ↓
Inspect existing backend API
        ↓
Adapt frontend request/response mapping
```

Do NOT modify backend code to make frontend integration easier.

---

# 3. Existing Backend Status

Before frontend implementation:

```text
Lecturer Backend
      ↓
CRUD implemented
      ↓
Tested with Postman
      ↓
Working correctly
```

Therefore frontend development should only:

```text
Call existing endpoints
Send existing request structure
Read existing response structure
Display data in existing UI
```

---

# 4. Lecturer Entity Fields

Lecturer backend currently contains fields such as:

```text
id
lectureNameTh
lectureNameEn
lectureNickname
status
facultyId
departmentId
isDeleted
createdBy
createdAt
updatedBy
updatedAt
```

The exact frontend request and response field names must follow the actual backend DTO.

Do not rename backend fields in the API request.

---

# 5. Frontend Responsibility

Frontend Lecturer Management must support:

```text
Create Lecturer
View Lecturer List
View Lecturer Detail
Update Lecturer
Delete Lecturer
```

If backend delete uses soft delete:

```text
Frontend calls DELETE API only.
Backend decides soft-delete behavior.
```

Frontend must not implement its own delete logic.

---

# 6. Recommended Routes

Use the existing routes if already created.

Recommended:

```text
/admin/lecturers
/admin/lecturers/create
/admin/lecturers/:id
/admin/lecturers/:id/edit
```

All Lecturer Management routes must remain protected.

They must reuse:

```text
ProtectedRoute
AuthContext
Existing admin layout
```

---

# 7. Recommended Frontend Structure

Recommended structure:

```text
src/
├── components/
│   └── lecturers/
│       ├── LecturerForm.jsx
│       ├── LecturerTable.jsx
│       ├── LecturerDetail.jsx
│       ├── LecturerStatusBadge.jsx
│       └── DeleteLecturerModal.jsx
│
├── pages/
│   └── lecturers/
│       ├── LecturerListPage.jsx
│       ├── LecturerCreatePage.jsx
│       ├── LecturerDetailPage.jsx
│       └── LecturerEditPage.jsx
│
└── services/
    └── lecturerService.js
```

Before creating new components:

```text
Inspect existing project
      ↓
Reuse existing components
```

Do not create duplicate common components.

---

# 8. Existing UI Rule

If Lecturer Management UI already exists:

```text
DO NOT REDESIGN IT.
```

Do not change:

```text
layout
colors
spacing
fonts
buttons
table appearance
forms
modals
sidebar
navbar
responsive design
```

Only connect API logic.

If Lecturer UI is based on Figma:

```text
Figma remains the visual source of truth.
```

---

# 9. API Base URL

Reuse the existing centralized API client.

Admin base URL:

```text
/api/v1/admin
```

Do not directly use:

```text
http://localhost:8080
```

inside Lecturer components.

Use:

```text
apiClient
```

from:

```text
src/api/apiClient.js
```

---

# 10. Lecturer API Service

Create or reuse:

```text
src/services/lecturerService.js
```

All Lecturer API requests must go through this service.

Do not place Axios calls directly inside multiple page components.

---

# 11. Existing Lecturer Endpoints

Use the exact endpoints already implemented by the backend.

If the backend currently follows:

```http
POST   /api/v1/admin/lecturers
GET    /api/v1/admin/lecturers
GET    /api/v1/admin/lecturers/{id}
PUT    /api/v1/admin/lecturers/{id}
DELETE /api/v1/admin/lecturers/{id}
```

then use these paths.

However:

```text
DO NOT create or rename backend endpoints.
```

Before coding, inspect the existing backend Controller or Postman collection and use the exact paths already working in Postman.

---

# 12. lecturerService Example

Example frontend structure:

```javascript
import apiClient from "../api/apiClient";

export const createLecturer = async (payload) => {
  const response = await apiClient.post(
    "/lecturers",
    payload
  );

  return response.data;
};

export const getLecturers = async (params = {}) => {
  const response = await apiClient.get(
    "/lecturers",
    {
      params,
    }
  );

  return response.data;
};

export const getLecturerById = async (id) => {
  const response = await apiClient.get(
    `/lecturers/${id}`
  );

  return response.data;
};

export const updateLecturer = async (
  id,
  payload
) => {
  const response = await apiClient.put(
    `/lecturers/${id}`,
    payload
  );

  return response.data;
};

export const deleteLecturer = async (id) => {
  const response = await apiClient.delete(
    `/lecturers/${id}`
  );

  return response.data;
};
```

This is only a frontend service pattern.

Use the actual endpoint paths from the existing backend.

---

# 13. Create Lecturer Request

The frontend must send the exact backend request DTO.

Expected Lecturer fields may include:

```json
{
  "lectureNameTh": "อาจารย์ จอห์น",
  "lectureNameEn": "John Derrick",
  "lectureNickname": "John",
  "status": "ACTIVE",
  "facultyId": 1,
  "departmentId": 2
}
```

This example must not override the real backend DTO.

Before implementation:

```text
Check Postman request
      ↓
Check backend request DTO
      ↓
Use exact fields
```

Do not add frontend-only fields to the request.

---

# 14. Field Mapping Rules

Frontend fields should map directly to backend API fields.

Example:

```text
Thai Lecturer Name
        ↓
lectureNameTh
```

```text
English Lecturer Name
        ↓
lectureNameEn
```

```text
Nickname
        ↓
lectureNickname
```

```text
Faculty
        ↓
facultyId
```

```text
Department
        ↓
departmentId
```

```text
Status
        ↓
status
```

---

# 15. ID Type Handling

HTML select values normally arrive as strings.

Backend IDs should be sent as numbers if the backend DTO uses numeric IDs.

Example:

```javascript
facultyId: Number(formData.facultyId),
departmentId: Number(formData.departmentId),
```

Do not send:

```json
{
  "facultyId": "1",
  "departmentId": "2"
}
```

when backend expects numbers.

---

# 16. Null Handling

If `departmentId` can be nullable according to the backend:

```javascript
departmentId:
  formData.departmentId === ""
    ? null
    : Number(formData.departmentId)
```

Do not send:

```text
"null"
0
undefined
```

unless the backend explicitly expects them.

The real backend DTO is authoritative.

---

# 17. Status Handling

Lecturer `status` must use an existing backend-supported value.

Example:

```text
ACTIVE
```

Do not invent:

```text
ENABLED
DISABLED
AVAILABLE
```

unless those values exist in the backend.

Frontend dropdown values must match the backend enum/string exactly.

---

# 18. Create Lecturer Workflow

```text
/admin/lecturers/create
        ↓
Existing Lecturer Form
        ↓
Load Faculty options
        ↓
Load Department options
        ↓
Enter Lecturer data
        ↓
Frontend validation
        ↓
Build exact backend payload
        ↓
lecturerService.createLecturer()
        ↓
POST existing backend API
        ↓
Success
        ↓
Show existing success feedback
        ↓
Navigate /admin/lecturers
```

---

# 19. Lecturer Form State

Example:

```javascript
const initialFormData = {
  lectureNameTh: "",
  lectureNameEn: "",
  lectureNickname: "",
  status: "ACTIVE",
  facultyId: null,
  departmentId: null,
};
```

Use the actual backend contract.

Do not add unnecessary fields.

---

# 20. Create Validation

Frontend validation should improve user experience.

Possible rules:

```text
Thai lecturer name required if backend requires it
English lecturer name required
nickname required if backend requires it
faculty required
department required if backend requires it
status required
```

Do not create validation rules that conflict with backend validation.

Backend remains authoritative.

---

# 21. Lecturer List Workflow

Route:

```text
/admin/lecturers
```

Workflow:

```text
LecturerListPage
       ↓
isLoading = true
       ↓
lecturerService.getLecturers()
       ↓
GET existing backend endpoint
       ↓
Read API response
       ↓
Map lecturer records
       ↓
Render existing table
       ↓
isLoading = false
```

---

# 22. Lecturer List Table

Use the existing UI.

Possible displayed columns:

```text
Lecturer ID
Lecturer Name TH
Lecturer Name EN
Nickname
Faculty
Department
Status
Actions
```

Use only values returned by the backend.

Do not fabricate faculty or department names.

---

# 23. Response Mapping

Backend may return:

```json
{
  "success": true,
  "message": "Lecturers retrieved successfully",
  "data": []
}
```

or:

```json
{
  "content": [],
  "page": 0,
  "size": 10
}
```

Do not assume the response structure.

Inspect the API response already verified in Postman.

Map the frontend to that exact response.

---

# 24. Pagination

If backend Lecturer List API is paginated:

```text
use backend pagination
```

Possible parameters:

```text
page
size
sort
```

Do not implement separate fake client-side pagination if server pagination already exists.

Example:

```javascript
lecturerService.getLecturers({
  page,
  size,
});
```

---

# 25. Search

If existing frontend contains Lecturer search:

```text
Search input
      ↓
Backend-supported query parameter
```

Only connect search if backend already supports it.

Do not modify backend to add search for frontend convenience.

If backend has no Lecturer search endpoint:

```text
keep current feature limited to existing backend behavior
```

---

# 26. Filters

If the UI contains:

```text
Faculty filter
Department filter
Status filter
```

connect them only to existing backend-supported query parameters.

Do not create backend endpoints.

---

# 27. Lecturer Detail Workflow

Route:

```text
/admin/lecturers/:id
```

Workflow:

```text
Read Lecturer ID
      ↓
lecturerService.getLecturerById(id)
      ↓
GET existing backend API
      ↓
Receive lecturer data
      ↓
Populate existing detail design
```

---

# 28. Lecturer ID Validation

Read:

```javascript
const { id } = useParams();
```

If backend IDs are numeric:

```javascript
const lecturerId = Number(id);
```

Do not call API with:

```text
undefined
NaN
""
```

---

# 29. Lecturer Not Found

If backend returns:

```http
404 Not Found
```

show:

```text
Lecturer not found.
```

using the existing UI pattern.

Do not change backend exception handling.

---

# 30. Edit Lecturer Workflow

Route:

```text
/admin/lecturers/:id/edit
```

Workflow:

```text
Open Edit Lecturer
      ↓
GET lecturer by ID
      ↓
Populate existing form
      ↓
User modifies data
      ↓
Validate
      ↓
Build backend update payload
      ↓
lecturerService.updateLecturer()
      ↓
PUT existing API
      ↓
Success
      ↓
Return according to existing UI
```

---

# 31. Populate Edit Form

Example:

```javascript
setFormData({
  lectureNameTh:
    lecturer.lectureNameTh ?? "",

  lectureNameEn:
    lecturer.lectureNameEn ?? "",

  lectureNickname:
    lecturer.lectureNickname ?? "",

  status:
    lecturer.status ?? "ACTIVE",

  facultyId:
    lecturer.facultyId ?? null,

  departmentId:
    lecturer.departmentId ?? null,
});
```

Use actual response field names.

---

# 32. Update Request

Create and update DTOs may differ.

Do not assume:

```text
Create Lecturer Request
=
Update Lecturer Request
```

Inspect the already working backend update request from Postman.

Send only fields accepted by the existing update endpoint.

---

# 33. Update Loading State

While updating:

```text
isUpdating = true
```

Use the existing button design.

Possible label:

```text
Updating...
```

Prevent duplicate submission.

---

# 34. Delete Lecturer Workflow

Existing frontend flow:

```text
Lecturer Table
      ↓
Delete Action
      ↓
Existing Confirmation Modal
      ↓
Confirm
      ↓
lecturerService.deleteLecturer(id)
      ↓
DELETE existing backend API
      ↓
Success
      ↓
Close modal
      ↓
Refresh Lecturer List
```

---

# 35. Delete Behavior Is Backend Responsibility

The backend may implement:

```text
soft delete
isDeleted = true
```

or another delete mechanism.

Frontend must NOT manually set:

```javascript
isDeleted = true
```

unless the existing backend API explicitly requires an update request for deletion.

If backend DELETE endpoint already works:

```text
Call DELETE endpoint only.
```

---

# 36. isDeleted Field

`isDeleted` is normally backend-managed.

Frontend should not include it in Create Lecturer payload unless backend request DTO explicitly requires it.

Do not expose it as a normal form field.

---

# 37. Audit Fields

Fields such as:

```text
createdBy
createdAt
updatedBy
updatedAt
```

must normally remain backend-managed.

Do not send them from frontend unless the backend DTO explicitly requires them.

The authenticated user should be determined through the existing backend security context.

---

# 38. Faculty Data

Lecturer belongs to:

```text
facultyId
```

The Faculty dropdown must use the existing Faculty API.

Architecture:

```text
Create/Edit Lecturer
       ↓
GET existing Faculty API
       ↓
Display facultyName
       ↓
User selects Faculty
       ↓
Send facultyId
```

Do not hardcode production Faculty IDs.

---

# 39. Department Data

Lecturer belongs to:

```text
departmentId
```

Use the existing Department API.

Architecture:

```text
Create/Edit Lecturer
       ↓
GET existing Department API
       ↓
Display department name
       ↓
User selects Department
       ↓
Send departmentId
```

Do not hardcode production Department IDs.

---

# 40. Faculty and Department Relationship

If existing backend behavior requires departments to be filtered by faculty:

```text
Select Faculty
      ↓
Load/filter Departments
```

implement this using existing backend capabilities only.

Do not add or modify backend logic.

---

# 41. Dropdown Display vs Request

Faculty dropdown:

```text
Displayed:
Faculty of Information Technology

Submitted:
facultyId: 1
```

Department dropdown:

```text
Displayed:
Computer Science

Submitted:
departmentId: 2
```

Do not submit faculty/department names if backend expects IDs.

---

# 42. Authentication Integration

All Lecturer APIs must reuse:

```text
apiClient
```

with the existing authentication interceptor.

Do not manually repeat:

```javascript
Authorization: `Bearer ${token}`
```

inside every Lecturer API call.

Use the centralized API client.

---

# 43. 401 Unauthorized

If backend returns:

```http
401
```

reuse the existing Authentication module behavior:

```text
401
 ↓
Authentication interceptor
 ↓
Clear invalid authentication
 ↓
Redirect /login
```

Do not create special Lecturer authentication logic.

---

# 44. 403 Forbidden

If backend returns:

```http
403
```

frontend must:

```text
display safe access denied behavior
```

Do not:

```text
change backend roles
change permissions
bypass authorization
```

---

# 45. 400 Bad Request

If backend validation fails:

```text
Read safe backend validation message
      ↓
Display in existing form UI
```

Examples:

```text
Lecturer name is required.
Faculty is required.
Invalid status.
```

Do not expose stack traces.

---

# 46. 404 Not Found

For detail/edit:

```text
Lecturer not found.
```

Keep current design.

---

# 47. 409 Conflict

If backend returns a conflict:

```text
display backend safe message
```

Example:

```text
Lecturer already exists.
```

Do not automatically modify input values.

---

# 48. 500 Server Error

Display:

```text
Unable to complete the request. Please try again.
```

Do not expose:

```text
Java stack trace
SQL exception
Hibernate error
internal class names
```

---

# 49. Loading States

Required CRUD loading states:

```text
Loading lecturers...
Loading lecturer...
Creating...
Updating...
Deleting...
```

Use existing UI design.

Do not redesign loading components.

---

# 50. Empty State

If Lecturer API returns no data:

```text
No lecturers found.
```

Use the existing empty-state design if available.

---

# 51. Mutation Refresh

After successful:

```text
Create
Update
Delete
```

ensure the UI reflects backend state.

Recommended:

```text
Success
   ↓
Refetch lecturer data
```

or navigate according to current application flow.

---

# 52. Remove Mock Data

After API connection succeeds:

```text
remove hardcoded Lecturer mock data
```

Do not leave arrays such as:

```javascript
const lecturers = [
  {
    id: 1,
    lectureNameEn: "John Derrick",
  },
];
```

as the production data source.

---

# 53. Backend Contract Validation Before Coding

Before implementation, inspect:

```text
Existing Lecturer Controller
Existing Lecturer DTOs
Existing Postman requests
Existing Postman responses
Existing endpoint URLs
Existing pagination parameters
Existing status values
```

This inspection is read-only.

Do not edit backend files.

---

# 54. Important Postman Rule

Because the backend already works in Postman:

```text
Postman working request
        ↓
Frontend request must match it
```

When frontend fails but Postman succeeds:

```text
compare:
URL
HTTP method
headers
authentication
query parameters
request JSON
data types
```

Do not immediately conclude that backend needs modification.

---

# 55. Common Frontend Integration Problems

Check frontend first for:

```text
wrong endpoint
wrong HTTP method
wrong field name
string ID instead of number
missing Authorization header
wrong response mapping
wrong API base URL
sending empty string instead of null
incorrect enum value
incorrect nested response path
```

Backend should remain unchanged if Postman is already working.

---

# 56. Example Integration Debugging

If this works in Postman:

```http
POST /api/v1/admin/lecturers
```

with:

```json
{
  "lectureNameTh": "อาจารย์ จอห์น",
  "lectureNameEn": "John Derrick",
  "lectureNickname": "John",
  "status": "ACTIVE",
  "facultyId": 1,
  "departmentId": 2
}
```

but frontend receives `400`:

Check:

```text
Did React send facultyId as "1"?

Did React send departmentId as "2"?

Did React send status as "Active" instead of "ACTIVE"?

Did React rename lectureNameEn?

Did React send empty string instead of null?
```

Fix frontend mapping.

Do not modify backend DTO.

---

# 57. Do Not Modify Backend to Fix CORS Automatically

If browser requests fail because of CORS:

```text
first verify existing project proxy setup
```

The project already defines:

```text
Vite /api proxy
Nginx /api proxy
```

Use those according to:

```text
spec-md/01-docker-set-up.md
```

Do not modify backend CORS configuration unless separately required and explicitly approved.

---

# 58. Frontend API Architecture

```text
LecturerPage
     ↓
Lecturer Components
     ↓
lecturerService.js
     ↓
apiClient.js
     ↓
Existing Authentication
     ↓
Existing Spring Boot Lecturer API
```

---

# 59. Create Lecturer API Flow

```text
LecturerCreatePage
       ↓
LecturerForm
       ↓
Validate
       ↓
Normalize IDs
       ↓
lecturerService.createLecturer()
       ↓
POST existing API
       ↓
Backend
       ↓
Response
       ↓
Existing success UI
```

---

# 60. List Lecturer API Flow

```text
LecturerListPage
       ↓
lecturerService.getLecturers()
       ↓
GET existing API
       ↓
Backend response
       ↓
Map exact response
       ↓
Existing LecturerTable
```

---

# 61. Detail Lecturer API Flow

```text
LecturerDetailPage
       ↓
Route ID
       ↓
lecturerService.getLecturerById(id)
       ↓
GET existing API
       ↓
Existing Detail UI
```

---

# 62. Update Lecturer API Flow

```text
LecturerEditPage
       ↓
GET Lecturer
       ↓
Populate form
       ↓
Edit
       ↓
Validate
       ↓
PUT existing API
       ↓
Backend response
       ↓
Existing success behavior
```

---

# 63. Delete Lecturer API Flow

```text
LecturerTable
       ↓
Delete
       ↓
Confirmation
       ↓
DELETE existing API
       ↓
Backend performs existing delete behavior
       ↓
Refetch Lecturer List
```

---

# 64. Manual Test - Lecturer List

### Given

Administrator is authenticated.

### When

Administrator opens:

```text
/admin/lecturers
```

### Then

```text
GET Lecturer API is called.
Loading state displays.
Backend records render.
No mock Lecturer data is used.
```

---

# 65. Manual Test - Create Lecturer

### Given

Administrator opens:

```text
/admin/lecturers/create
```

### When

Valid Lecturer information is submitted.

### Then

```text
POST existing Lecturer API
      ↓
Backend returns success
      ↓
Frontend displays success
      ↓
Lecturer list is refreshed
```

Backend source remains unchanged.

---

# 66. Manual Test - Edit Lecturer

### Given

Existing Lecturer ID is available.

### When

Administrator opens:

```text
/admin/lecturers/{id}/edit
```

### Then

```text
GET existing Lecturer API
      ↓
Populate form
      ↓
Modify data
      ↓
PUT existing Lecturer API
      ↓
Success
```

---

# 67. Manual Test - Delete Lecturer

### Given

Lecturer exists.

### When

Administrator confirms Delete.

### Then

```text
DELETE existing Lecturer API
      ↓
Backend performs existing delete logic
      ↓
Frontend refreshes list
```

---

# 68. Manual Test - Invalid Lecturer ID

Open:

```text
/admin/lecturers/999999
```

If backend returns:

```text
404
```

frontend shows:

```text
Lecturer not found.
```

No backend changes.

---

# 69. Manual Test - Unauthorized

Without valid authentication:

```text
/admin/lecturers
```

Expected:

```text
Redirect /login
```

according to the existing Authentication module.

---

# 70. Manual Test - Backend Already Working

Before frontend implementation, confirm an existing Postman request still succeeds.

After frontend implementation:

```text
Frontend request
```

must match:

```text
working Postman request
```

in:

```text
HTTP method
endpoint
headers
payload
types
query parameters
```

---

# 71. Implementation Order

Follow:

```text
1. Read AGENT.md
       ↓
2. Read Lecturer specification
       ↓
3. Inspect existing frontend Lecturer UI
       ↓
4. Inspect existing backend Lecturer Controller
       ↓
5. Review successful Postman request/response
       ↓
6. Do NOT edit backend
       ↓
7. Create/reuse lecturerService
       ↓
8. Connect GET list
       ↓
9. Connect GET detail
       ↓
10. Connect POST create
       ↓
11. Connect PUT update
       ↓
12. Connect DELETE
       ↓
13. Connect Faculty lookup
       ↓
14. Connect Department lookup
       ↓
15. Handle loading/error/success
       ↓
16. Remove mock data
       ↓
17. Test frontend against same backend APIs
```

---

# 72. Agent Implementation Prompt

Use this when implementing Lecturer Management:

```text
Implement Lecturer Management frontend API integration.

IMPORTANT:
The Lecturer backend is already completed and tested successfully using Postman.

DO NOT MODIFY BACKEND CODE.

Do not modify:
- Controller
- Service
- ServiceImpl
- Repository
- Entity
- DTO
- Mapper
- Validation
- Flyway
- Database schema
- Authentication
- Authorization
- Security configuration
- Existing API endpoints

Frontend must adapt to the backend.

Follow:
- AGENT.md
- Authentication specification
- Lecturer Management frontend specification
- Existing frontend design
- Existing working backend API contract

Tasks:

1. Inspect existing Lecturer frontend UI.
2. Do not change the current design.
3. Inspect existing Lecturer backend endpoints in read-only mode.
4. Compare with successful Postman requests.
5. Create/reuse lecturerService.js.
6. Reuse centralized apiClient.
7. Reuse existing access-token interceptor.
8. Connect Lecturer List to existing GET API.
9. Connect Lecturer Detail to existing GET by ID API.
10. Connect Create Lecturer to existing POST API.
11. Connect Edit Lecturer to existing PUT API.
12. Connect Delete Lecturer to existing DELETE API.
13. Use existing Faculty API for faculty dropdown.
14. Use existing Department API for department dropdown.
15. Send IDs using the exact backend data type.
16. Send status using backend-supported values.
17. Correctly handle nullable values according to backend DTO.
18. Handle loading, empty, success and error states.
19. Remove Lecturer mock data after API integration.
20. Refetch data after successful mutations.
21. Do not modify unrelated modules.
22. If frontend request fails while Postman works, debug frontend request first.
23. Never modify working backend code to fix frontend integration.
```

---

# 73. Acceptance Criteria

Lecturer frontend integration is complete when:

- Backend Lecturer code remains unchanged.
- Existing Postman Lecturer tests still work.
- Existing UI design remains unchanged.
- `/admin/lecturers` loads backend Lecturer data.
- Lecturer List uses existing GET endpoint.
- Lecturer Detail uses existing GET-by-ID endpoint.
- Create Lecturer uses existing POST endpoint.
- Update Lecturer uses existing PUT endpoint.
- Delete Lecturer uses existing DELETE endpoint.
- Lecturer API calls use centralized `apiClient`.
- Existing authentication is reused.
- No duplicate Axios client is created.
- Faculty dropdown uses backend Faculty data when required.
- Department dropdown uses backend Department data when required.
- `facultyId` uses the correct data type.
- `departmentId` uses the correct data type/null behavior.
- `status` matches backend-supported values.
- Existing API response structure is correctly mapped.
- Loading states work.
- Empty state works.
- Validation/API errors display safely.
- 401 is handled centrally.
- 403 is handled without bypassing permissions.
- 404 Lecturer Not Found is handled.
- 409 conflicts are handled if backend uses them.
- 500 errors do not expose server internals.
- Mock Lecturer data is removed from connected screens.
- Create success updates Lecturer List.
- Update success shows current backend data.
- Delete success refreshes Lecturer List.
- Backend entities/DTOs/controllers/services were not modified.
- Database/Flyway was not modified.
- No unrelated frontend module was changed.

---

# 74. Final Rule

```text
POSTMAN BACKEND TEST PASSES
          ↓
BACKEND IS ALREADY WORKING
          ↓
FRONTEND MUST MATCH BACKEND
          ↓
DO NOT CHANGE BACKEND
```

Final architecture:

```text
Existing Lecturer UI
        ↓
React
        ↓
lecturerService
        ↓
apiClient
        ↓
Existing JWT Authentication
        ↓
Existing Spring Boot Lecturer API
        ↓
Existing Database Logic
```

Core implementation rule:

```text
CONNECT FRONTEND ONLY.

KEEP THE CURRENT DESIGN.

USE THE EXISTING WORKING API.

DO NOT CHANGE BACKEND CODE.
```