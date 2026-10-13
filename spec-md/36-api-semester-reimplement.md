# 08 - Semester Management Frontend API Integration

## 1. Module Information

### Module Name

```text
Semester Management
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
Frontend CRUD API integration only.
```

This module connects the existing Semester Management frontend UI to the already completed Semester Management backend APIs.

---

# 2. Critical Rule

## DO NOT MODIFY BACKEND CODE

The Semester backend feature is already implemented and tested before frontend implementation.

Therefore:

```text
BACKEND = EXISTING WORKING SOURCE OF TRUTH
```

Frontend must adapt to the backend.

Do NOT modify:

```text
Controller
Service
ServiceImpl
Repository
Entity
DTO
Mapper
Validation
Exception Handling
Authentication
Authorization
Security
Flyway
Database Schema
Redis
API Response Structure
Existing Endpoint Paths
```

If frontend API integration fails:

```text
Frontend fails
      ↓
Compare with successful Postman request
      ↓
Check frontend endpoint
      ↓
Check HTTP method
      ↓
Check token
      ↓
Check request body
      ↓
Check data types
      ↓
Check response mapping
```

Do NOT immediately modify backend code.

---

# 3. Existing Backend Status

Semester backend should already support CRUD operations.

Expected functional scope:

```text
Create Semester
Get Semester List
Get Semester by ID
Update Semester
Delete Semester
```

The exact backend behavior must be verified using:

```text
Existing backend source
Existing Postman request
Existing Postman response
```

Frontend implementation must match these existing contracts.

---

# 4. Semester Domain

The Semester module contains semester information such as:

```text
id
semesterNameTh
semesterNameEn
status
isDeleted
createdBy
createdAt
updatedBy
updatedAt
```

The exact field names must follow the existing backend DTO.

Do not rename backend fields in requests.

Do not add frontend fields that do not exist in the backend API.

---

# 5. Backend-Managed Fields

Fields such as:

```text
id
isDeleted
createdBy
createdAt
updatedBy
updatedAt
```

should normally be backend-managed.

Frontend should not include them in Create or Update requests unless the existing backend DTO explicitly requires them.

Do not create form inputs for audit fields.

---

# 6. Frontend Responsibilities

Semester Management frontend must support:

```text
Semester List
Semester Detail
Create Semester
Update Semester
Delete Semester
Search / filter only if backend already supports it
Pagination only if backend already supports it
```

---

# 7. Existing UI Rule

If Semester Management screens already exist:

```text
DO NOT REDESIGN THEM.
```

Do not change:

```text
Page layout
Sidebar
Navbar
Colors
Typography
Spacing
Buttons
Table styles
Modal styles
Form design
Responsive behavior
Card styles
Status badge styles
```

Only implement the required API integration and frontend state.

---

# 8. Figma Rule

If Semester Management exists in the project Figma file:

```text
Figma controls appearance.
Backend controls data and behavior.
```

Implementation workflow:

```text
Existing Figma/UI
       +
Existing Backend API
       ↓
React Integration
```

Do not change the design to make API integration easier.

---

# 9. Recommended Routes

Use existing routes if already defined.

Recommended structure:

```text
/admin/semesters
/admin/semesters/create
/admin/semesters/:id
/admin/semesters/:id/edit
```

All Semester routes must remain protected.

---

# 10. Protected Route Requirement

Semester Management belongs inside:

```text
/admin/*
```

Therefore it must reuse the existing:

```text
AuthContext
ProtectedRoute
AdminLayout
Access Token Interceptor
```

Do not implement separate authentication for Semester Management.

---

# 11. Recommended Frontend Structure

Recommended:

```text
src/
├── components/
│   └── semesters/
│       ├── SemesterForm.jsx
│       ├── SemesterTable.jsx
│       ├── SemesterDetail.jsx
│       ├── SemesterStatusBadge.jsx
│       └── DeleteSemesterModal.jsx
│
├── pages/
│   └── semesters/
│       ├── SemesterListPage.jsx
│       ├── SemesterCreatePage.jsx
│       ├── SemesterDetailPage.jsx
│       └── SemesterEditPage.jsx
│
└── services/
    └── semesterService.js
```

Before creating these files:

```text
Inspect existing code first.
```

Reuse common components such as:

```text
Button
Input
Select
Table
Modal
Pagination
StatusBadge
LoadingSpinner
PageHeader
```

Do not duplicate shared UI components.

---

# 12. API Base URL

Use the project's existing centralized API client.

Admin API base:

```text
/api/v1/admin
```

Do not write:

```text
http://localhost:8080
```

inside Semester pages or components.

Reuse:

```text
src/api/apiClient.js
```

---

# 13. Semester Service

Create or update:

```text
src/services/semesterService.js
```

All Semester API requests must be centralized here.

Architecture:

```text
Semester Page
     ↓
semesterService
     ↓
apiClient
     ↓
Authentication Interceptor
     ↓
Spring Boot Backend
```

---

# 14. Existing Backend Endpoints

Use the exact existing backend endpoints.

If the backend follows:

```http
POST   /api/v1/admin/semesters
GET    /api/v1/admin/semesters
GET    /api/v1/admin/semesters/{id}
PUT    /api/v1/admin/semesters/{id}
DELETE /api/v1/admin/semesters/{id}
```

use them.

However:

```text
Do not create or rename backend endpoints.
```

Before implementation, inspect the existing Semester Controller and successful Postman requests.

---

# 15. semesterService Example

Recommended frontend pattern:

```javascript
import apiClient from "../api/apiClient";

export const createSemester = async (payload) => {
  const response = await apiClient.post(
    "/semesters",
    payload
  );

  return response.data;
};

export const getSemesters = async (params = {}) => {
  const response = await apiClient.get(
    "/semesters",
    {
      params,
    }
  );

  return response.data;
};

export const getSemesterById = async (id) => {
  const response = await apiClient.get(
    `/semesters/${id}`
  );

  return response.data;
};

export const updateSemester = async (
  id,
  payload
) => {
  const response = await apiClient.put(
    `/semesters/${id}`,
    payload
  );

  return response.data;
};

export const deleteSemester = async (id) => {
  const response = await apiClient.delete(
    `/semesters/${id}`
  );

  return response.data;
};
```

This is only the recommended frontend structure.

Use the actual existing backend endpoint paths.

---

# 16. Create Semester Request

The exact request must follow the existing backend DTO.

Expected example:

```json
{
  "semesterNameTh": "ภาคการศึกษาที่ 1",
  "semesterNameEn": "Semester 1",
  "status": "ACTIVE"
}
```

This is an example only.

Before coding:

```text
Check successful Postman Create Semester request.
```

Use the exact:

```text
field names
data types
status values
required fields
nullable fields
```

already supported by the backend.

---

# 17. Semester Form Fields

Expected frontend fields:

```text
Semester Name TH
Semester Name EN
Status
```

Corresponding possible backend fields:

```text
semesterNameTh
semesterNameEn
status
```

Do not change these names in the API request if they already match the backend DTO.

---

# 18. Create Form State

Example:

```javascript
const initialFormData = {
  semesterNameTh: "",
  semesterNameEn: "",
  status: "ACTIVE",
};
```

If the backend uses different fields, adapt this state accordingly.

---

# 19. Semester Name TH

Frontend label:

```text
Semester Name (Thai)
```

Possible backend field:

```text
semesterNameTh
```

Example:

```text
ภาคการศึกษาที่ 1
```

Validation must match backend requirements.

If required:

```text
Semester name in Thai is required.
```

Do not invent max lengths unless the backend already defines them.

---

# 20. Semester Name EN

Frontend label:

```text
Semester Name (English)
```

Possible backend field:

```text
semesterNameEn
```

Example:

```text
Semester 1
```

If required:

```text
Semester name in English is required.
```

Backend validation remains authoritative.

---

# 21. Semester Status

The frontend must use the exact status values supported by the backend.

Example:

```text
ACTIVE
```

Other values may exist, but they must come from the backend contract.

Do not invent statuses such as:

```text
OPEN
CLOSED
FINISHED
CURRENT
UPCOMING
```

unless they already exist in backend code.

---

# 22. Status Dropdown

If the current UI uses a dropdown:

```text
Display value
       ↓
Submit exact backend enum value
```

Example:

```text
UI:
Active

Request:
ACTIVE
```

The visual label can be user-friendly, but the submitted value must match the backend.

---

# 23. Create Semester Workflow

```text
/admin/semesters/create
       ↓
Existing Create Semester Page
       ↓
Enter Semester data
       ↓
Frontend validation
       ↓
Build exact backend payload
       ↓
semesterService.createSemester()
       ↓
POST existing API
       ↓
Backend response
       ↓
Success?
   ┌──────┴──────┐
   YES            NO
   ↓              ↓
Success UI     Show safe error
   ↓
Navigate /admin/semesters
```

---

# 24. Create Loading State

During creation:

```javascript
isSubmitting = true;
```

Disable the existing submit button.

Possible text:

```text
Creating...
```

Do not change button styling.

Do not allow duplicate requests.

---

# 25. Create Success

After backend returns successful creation:

```text
Show existing success notification
       ↓
Navigate to Semester List
```

Recommended:

```text
/admin/semesters
```

If the existing design uses a modal instead, preserve that flow.

---

# 26. Semester List

Route:

```text
/admin/semesters
```

Workflow:

```text
SemesterListPage
       ↓
isLoading = true
       ↓
semesterService.getSemesters()
       ↓
GET existing backend endpoint
       ↓
Read backend response
       ↓
Map data
       ↓
Render existing Semester table
       ↓
isLoading = false
```

---

# 27. Semester Table

Use the existing UI.

Possible columns:

```text
ID
Semester Name TH
Semester Name EN
Status
Created At
Actions
```

Display only fields available from the backend.

Do not fabricate values.

---

# 28. Table Actions

Existing actions may include:

```text
View
Edit
Delete
```

Each action must use the proper backend-connected route or operation.

---

# 29. Response Mapping

Do not assume that:

```javascript
response.data
```

is directly the Semester array.

The backend may return:

```json
{
  "success": true,
  "message": "Semesters retrieved successfully",
  "data": []
}
```

or a paginated wrapper.

Inspect the successful Postman response.

Examples of possible mappings:

```javascript
response.data.data
```

or:

```javascript
response.data.content
```

Use the actual backend contract.

---

# 30. Pagination

If the Semester API supports backend pagination:

```text
use server-side pagination.
```

Possible parameters:

```text
page
size
sort
```

Example:

```javascript
getSemesters({
  page,
  size,
});
```

Do not implement fake client-side pagination if the backend already paginates.

---

# 31. Pagination UI

Keep the current pagination design unchanged.

Workflow:

```text
User changes page
       ↓
Update page parameter
       ↓
Call GET Semester API
       ↓
Render returned page
```

---

# 32. Search

If Semester Management already includes a search field:

```text
connect it only if the backend already supports Semester search.
```

Example:

```text
Search query
      ↓
Existing backend query parameter
```

Do not add backend search code.

---

# 33. Filter by Status

If UI contains status filtering:

```text
Status Filter
      ↓
Existing backend status parameter
```

Only implement it if already supported by the backend.

Do not change backend endpoint behavior.

---

# 34. Semester Detail

Route:

```text
/admin/semesters/:id
```

Workflow:

```text
SemesterDetailPage
       ↓
Read route ID
       ↓
semesterService.getSemesterById(id)
       ↓
GET existing backend API
       ↓
Receive Semester
       ↓
Populate existing detail UI
```

---

# 35. Semester ID Handling

Use:

```javascript
const { id } = useParams();
```

If backend uses numeric IDs:

```javascript
const semesterId = Number(id);
```

Do not call API using:

```text
undefined
NaN
empty string
```

---

# 36. Semester Detail Loading State

While loading:

```text
Loading semester...
```

Use the existing application loading UI.

Do not display another Semester's cached data while waiting unless the project intentionally supports caching.

---

# 37. Semester Not Found

If backend returns:

```http
404 Not Found
```

show:

```text
Semester not found.
```

using the existing UI pattern.

Do not change backend exception handling.

---

# 38. Semester Edit

Route:

```text
/admin/semesters/:id/edit
```

Workflow:

```text
Open Edit Page
      ↓
Read ID
      ↓
GET Semester by ID
      ↓
Populate existing form
      ↓
User edits allowed values
      ↓
Validate
      ↓
Build exact update payload
      ↓
PUT existing endpoint
      ↓
Success
```

---

# 39. Edit Form Population

Example:

```javascript
setFormData({
  semesterNameTh:
    semester.semesterNameTh ?? "",

  semesterNameEn:
    semester.semesterNameEn ?? "",

  status:
    semester.status ?? "ACTIVE",
});
```

Use actual backend response fields.

---

# 40. Create and Update DTO Rule

Do not assume:

```text
CreateSemesterRequest
=
UpdateSemesterRequest
```

They may be different.

Before implementing Update:

```text
Check working Postman Update request.
```

Only send fields accepted by the existing backend update DTO.

---

# 41. Update Payload

Example only:

```json
{
  "semesterNameTh": "ภาคการศึกษาที่ 2",
  "semesterNameEn": "Semester 2",
  "status": "ACTIVE"
}
```

Use exact backend fields.

---

# 42. Update Loading State

During update:

```javascript
isUpdating = true;
```

Disable Update button.

Possible existing label:

```text
Updating...
```

Do not redesign the button.

---

# 43. Update Success

After successful update:

```text
Show success feedback
       ↓
Refetch Semester data
```

or navigate according to existing frontend behavior.

Possible route:

```text
/admin/semesters
```

---

# 44. Delete Semester

Use the existing Delete action.

Workflow:

```text
Semester Table
      ↓
Delete Button
      ↓
Existing Confirmation Modal
      ↓
User confirms
      ↓
semesterService.deleteSemester(id)
      ↓
DELETE existing endpoint
      ↓
Backend performs existing delete logic
      ↓
Refresh Semester List
```

---

# 45. Never Delete Immediately

Do not send the DELETE request on the initial Delete button click.

Use confirmation first.

Example:

```text
Are you sure you want to delete this semester?
```

Buttons:

```text
Cancel
Delete
```

Use existing modal design.

---

# 46. Delete Behavior Is Backend Responsibility

The backend may use:

```text
Soft Delete
isDeleted = true
```

Frontend must not manually send:

```json
{
  "isDeleted": true
}
```

unless that is actually the existing backend delete API.

If DELETE endpoint already works in Postman:

```text
Call the DELETE endpoint only.
```

---

# 47. isDeleted

`isDeleted` should normally not appear in:

```text
Create Form
Edit Form
Normal Semester UI
```

unless explicitly required.

The backend manages deletion status.

---

# 48. Audit Fields

Do not allow users to edit:

```text
createdBy
createdAt
updatedBy
updatedAt
```

These fields are controlled by backend auditing.

They may be displayed in Semester Detail if the backend returns them and the existing design includes them.

---

# 49. Related Course/Section Usage

Semester data may later be used by:

```text
Courses
Course Sections
Enrollments
Academic Management
```

This Semester frontend module must not modify those other modules.

Its responsibility is only Semester CRUD integration.

---

# 50. Dropdown Usage by Other Modules

Other frontend modules may load Semesters to display:

```text
Semester dropdown
```

Example:

```text
Course Section Form
      ↓
GET Semesters
      ↓
Display semesterNameEn / semesterNameTh
      ↓
Submit semesterId
```

Semester Management itself should expose data through the existing backend API.

Do not introduce frontend hardcoded Semester IDs.

---

# 51. No Academic Year Addition

Do not add an:

```text
academicYear
```

field unless the existing Semester backend explicitly contains it.

Do not introduce fields because another university system normally uses them.

Follow the existing backend contract only.

---

# 52. Status Badge

If the existing table displays Semester status badges:

```text
ACTIVE
```

map the backend status into the existing visual component.

Do not change its existing style.

Example:

```text
Backend:
ACTIVE

UI:
Active Badge
```

---

# 53. Centralized Authentication

Semester API calls must reuse:

```text
apiClient
```

and the existing token interceptor.

Do not manually attach access tokens inside every Semester service function.

---

# 54. 401 Unauthorized

If backend returns:

```http
401
```

reuse the existing global Authentication behavior:

```text
401
 ↓
apiClient response interceptor
 ↓
Clear invalid authentication
 ↓
Redirect /login
```

Do not add Semester-specific authentication handling.

---

# 55. 403 Forbidden

If backend returns:

```http
403
```

do not:

```text
change backend role
change security configuration
bypass permission
```

Show the application's existing access-denied behavior.

---

# 56. 400 Bad Request

Display backend validation errors safely.

Possible examples:

```text
Semester name is required.
Invalid status.
```

Do not show Java exception details.

---

# 57. 404 Not Found

For Detail/Edit:

```text
Semester not found.
```

Use existing UI.

---

# 58. 409 Conflict

If backend prevents duplicate Semester records and returns:

```http
409 Conflict
```

show the safe backend response.

Example:

```text
Semester already exists.
```

Do not alter the entered values automatically.

---

# 59. 500 Server Error

Display:

```text
Unable to complete the request. Please try again.
```

Never expose:

```text
SQL errors
Hibernate errors
Java exception names
database information
stack traces
```

---

# 60. Network Error

If the frontend cannot reach the backend:

```text
Unable to connect to the server. Please try again.
```

Do not change backend code because of a frontend network configuration problem.

First inspect:

```text
Vite proxy
Nginx proxy
API base URL
Docker network
Backend availability
```

---

# 61. Vite Development API

During development:

```text
Frontend:
http://localhost:5173

Request:
/api/v1/admin/semesters
       ↓
Vite Proxy
       ↓
Backend:
localhost:8080
```

Follow:

```text
spec-md/01-docker-set-up.md
```

Do not hardcode backend URL in Semester components.

---

# 62. Docker API Flow

Production-like Docker flow:

```text
Browser
   ↓
Frontend / Nginx
   ↓
/api/v1/admin/semesters
   ↓
backend:8080
   ↓
Spring Boot
```

---

# 63. Loading States

All API operations require loading state.

Examples:

```text
Loading semesters...
Loading semester...
Creating...
Updating...
Deleting...
```

Keep existing design.

---

# 64. Empty State

If GET returns zero records:

```text
No semesters found.
```

Use existing empty-state layout.

Do not display fake Semester records.

---

# 65. Remove Mock Data

After API integration:

```text
REMOVE MOCK SEMESTER DATA.
```

Do not keep:

```javascript
const semesters = [
  {
    id: 1,
    semesterNameEn: "Semester 1",
  },
];
```

as the real page data source.

---

# 66. Refresh After Create

After create success:

```text
POST Semester
      ↓
Success
      ↓
Navigate /admin/semesters
      ↓
GET Semester List
      ↓
New Semester appears
```

---

# 67. Refresh After Update

After update:

```text
PUT Semester
     ↓
Success
     ↓
Refetch relevant Semester data
```

The screen must show backend-returned current data.

---

# 68. Refresh After Delete

After delete:

```text
DELETE Semester
      ↓
Success
      ↓
Refetch Semester List
      ↓
Deleted/soft-deleted record no longer appears
```

according to backend behavior.

---

# 69. Important Postman Rule

The backend is already verified through Postman.

Therefore:

```text
Successful Postman Request
           ↓
Frontend Request
           ↓
Must Match
```

Compare:

```text
URL
HTTP method
Authorization
Request headers
Request JSON
Field names
Field types
Status values
Query parameters
```

---

# 70. If Frontend Fails but Postman Works

Check these items first:

```text
Wrong endpoint
Wrong HTTP method
Wrong API base path
Missing access token
Wrong request wrapper
Wrong property name
Wrong response.data mapping
Wrong status string
Sending null incorrectly
Sending empty strings
String ID instead of numeric ID
CORS/proxy issue
```

Do NOT modify the working backend first.

---

# 71. Example Debugging

Suppose Postman successfully sends:

```json
{
  "semesterNameTh": "ภาคการศึกษาที่ 1",
  "semesterNameEn": "Semester 1",
  "status": "ACTIVE"
}
```

but frontend gets `400`.

Check whether React actually sent:

```json
{
  "semester_name_th": "...",
  "semesterNameEnglish": "...",
  "status": "Active"
}
```

If yes:

```text
Frontend mapping is wrong.
```

Fix frontend.

Do not modify backend DTO to accept frontend mistakes.

---

# 72. Read-Only Backend Inspection

The frontend agent may inspect backend files to understand API contracts.

Allowed:

```text
Read Controller
Read DTO
Read response classes
Read enum
Read successful Postman examples
```

Not allowed:

```text
Edit Controller
Edit DTO
Edit Entity
Edit Service
Edit Repository
Edit Flyway
```

---

# 73. Frontend CRUD Architecture

```text
                  Semester Management
                          |
          +---------------+---------------+
          |               |               |
          v               v               v
        CREATE           READ            UPDATE
          |               |               |
          v               v               v
   SemesterForm      SemesterTable    SemesterForm
          |               |               |
          v               v               v
 semesterService    semesterService   semesterService
          |               |               |
          +---------------+---------------+
                          |
                          v
                       apiClient
                          |
                          v
                Existing Spring Boot API
                          |
                          v
                       DELETE
```

---

# 74. Create Flow

```text
SemesterCreatePage
       ↓
SemesterForm
       ↓
Validate
       ↓
Normalize payload
       ↓
POST existing API
       ↓
Backend
       ↓
Success/Error
```

---

# 75. Read Flow

```text
SemesterListPage
       ↓
GET existing API
       ↓
Backend Response
       ↓
Map actual response
       ↓
SemesterTable
```

---

# 76. Detail Flow

```text
SemesterDetailPage
       ↓
Route ID
       ↓
GET /semesters/{id}
       ↓
Backend Response
       ↓
Existing detail UI
```

---

# 77. Update Flow

```text
SemesterEditPage
       ↓
GET Semester
       ↓
Populate Form
       ↓
User changes data
       ↓
PUT existing API
       ↓
Success
```

---

# 78. Delete Flow

```text
Semester List
      ↓
Delete
      ↓
Confirmation Modal
      ↓
DELETE existing API
      ↓
Backend delete logic
      ↓
Refetch
```

---

# 79. Manual Test - List

### Given

Administrator is authenticated.

### When

Open:

```text
/admin/semesters
```

### Then

```text
GET Semester API runs.
Loading state appears.
Backend data displays.
Mock data is not used.
```

---

# 80. Manual Test - Create

### Given

Administrator opens:

```text
/admin/semesters/create
```

### When

Valid Semester data is submitted.

### Then

```text
POST existing endpoint
      ↓
Success
      ↓
Frontend displays success feedback
      ↓
Returns to Semester List
```

Backend remains unchanged.

---

# 81. Manual Test - Required Fields

Submit an empty required field.

Expected:

```text
Frontend validation displays.
POST request is not sent until basic validation passes.
```

Backend still performs final validation.

---

# 82. Manual Test - Invalid Status

If backend accepts only:

```text
ACTIVE
INACTIVE
```

and frontend sends:

```text
Active
```

this is a frontend error.

Fix the frontend value.

Do not modify backend enum.

---

# 83. Manual Test - Detail

Open:

```text
/admin/semesters/{id}
```

Expected:

```text
GET Semester by ID
      ↓
Backend data
      ↓
Existing detail UI
```

---

# 84. Manual Test - Edit

Open:

```text
/admin/semesters/{id}/edit
```

Expected:

```text
GET Semester
      ↓
Populate fields
      ↓
Update
      ↓
PUT existing endpoint
      ↓
Success
```

---

# 85. Manual Test - Delete

Click Delete.

Expected:

```text
Confirmation first.
```

After confirming:

```text
DELETE existing endpoint
      ↓
Success
      ↓
Refresh list
```

---

# 86. Manual Test - 404

Request invalid Semester ID.

If backend returns:

```text
404
```

show:

```text
Semester not found.
```

---

# 87. Manual Test - Unauthorized

Without authentication, open:

```text
/admin/semesters
```

Expected:

```text
redirect /login
```

using existing authentication behavior.

---

# 88. Manual Test - Backend Failure

If backend returns:

```text
500
```

frontend must:

```text
show safe error
keep page usable
not expose server internals
```

---

# 89. Implementation Order

Follow this exact order:

```text
1. Read AGENT.md
       ↓
2. Read Semester frontend specification
       ↓
3. Inspect existing Semester UI
       ↓
4. Inspect existing Semester backend Controller
       ↓
5. Inspect request/response DTOs
       ↓
6. Verify successful Postman requests
       ↓
7. Do NOT modify backend
       ↓
8. Create/reuse semesterService.js
       ↓
9. Connect Semester List
       ↓
10. Connect Semester Detail
       ↓
11. Connect Create Semester
       ↓
12. Connect Update Semester
       ↓
13. Connect Delete Semester
       ↓
14. Connect pagination/search/filter only if backend supports them
       ↓
15. Handle loading/error/empty/success
       ↓
16. Remove mock Semester data
       ↓
17. Test frontend against the same backend API
```

---

# 90. Agent Implementation Prompt

Use this prompt when implementing:

```text
Implement Semester Management frontend API integration.

IMPORTANT:
The Semester backend is already implemented and tested successfully with Postman.

DO NOT MODIFY BACKEND CODE.

Backend is the source of truth.

Do not modify:
- Controller
- Service
- ServiceImpl
- Repository
- Entity
- DTO
- Mapper
- Validation
- Exception handling
- Authentication
- Authorization
- Security configuration
- Flyway migrations
- Database schema
- Existing endpoint paths
- Existing API response structure

Frontend requirements:

1. Read AGENT.md.
2. Read the Semester Management frontend specification.
3. Inspect the existing Semester frontend UI.
4. Keep the existing UI/Figma design unchanged.
5. Inspect existing Semester backend files in read-only mode.
6. Review successful Postman Semester requests/responses.
7. Reuse the centralized apiClient.
8. Reuse the existing authentication interceptor.
9. Create or update semesterService.js.
10. Connect Semester List to the existing GET API.
11. Connect Semester Detail to the existing GET-by-ID API.
12. Connect Create Semester to the existing POST API.
13. Connect Edit Semester to the existing PUT API.
14. Connect Delete Semester to the existing DELETE API.
15. Use the exact backend request property names.
16. Use exact backend-supported status values.
17. Do not send backend-managed audit fields unless the backend DTO requires them.
18. Correctly map the existing response wrapper.
19. Connect backend pagination/search/filter only if already supported.
20. Handle loading, empty, success and error states.
21. Remove hardcoded/mock Semester data.
22. Refetch relevant data after Create/Update/Delete.
23. Do not modify unrelated frontend modules.
24. If frontend fails while Postman succeeds, debug the frontend request first.
25. Never change working backend code just to satisfy frontend implementation.
```

---

# 91. Acceptance Criteria

Semester frontend API integration is complete when:

```text
Backend code remains unchanged.
Existing Postman tests still pass.
Existing Semester UI design remains unchanged.
Semester List reads real backend data.
Create Semester uses existing POST endpoint.
Semester Detail uses existing GET-by-ID endpoint.
Update Semester uses existing PUT endpoint.
Delete Semester uses existing DELETE endpoint.
Central apiClient is reused.
Authentication interceptor is reused.
No second Axios client exists.
Exact backend request field names are used.
Exact backend status values are used.
Backend response wrapper is correctly mapped.
Backend-managed audit fields are not incorrectly sent.
Loading state works.
Empty state works.
Create success works.
Update success works.
Delete success works.
400 errors are handled safely.
401 uses centralized authentication.
403 permissions are not bypassed.
404 Semester Not Found is handled.
409 conflicts are handled if backend uses them.
500 errors are displayed safely.
No server internals are exposed.
No Semester mock data remains on connected screens.
No unnecessary backend features are added.
No unrelated frontend modules are modified.
```

---

# 92. Final Rule

```text
BACKEND TESTED WITH POSTMAN
          ↓
BACKEND ALREADY WORKS
          ↓
FRONTEND MUST MATCH THE BACKEND CONTRACT
          ↓
DO NOT CHANGE BACKEND CODE
```

Final architecture:

```text
Existing Semester UI
        ↓
React
        ↓
semesterService.js
        ↓
apiClient.js
        ↓
Existing Authentication
        ↓
Existing Spring Boot Semester API
        ↓
Existing Database / Flyway Logic
```

Core rule:

```text
FRONTEND API INTEGRATION ONLY.

KEEP THE EXISTING DESIGN.

USE THE EXISTING WORKING BACKEND.

DO NOT MODIFY BACKEND CODE.
```