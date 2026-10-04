# 06 - Admin User Management CRUD Integration

## 1. Module Information

### Module Name

```text
Admin User Management
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

This specification covers:

```text
Frontend CRUD API integration only.
```

The implementation must connect the existing User Management UI to the existing backend APIs.

---

# 2. Critical Rules

## DO NOT Change the Existing Design

The existing frontend/Figma design must remain unchanged.

Do not modify:

- layout
- colors
- typography
- spacing
- cards
- tables
- buttons
- input appearance
- sidebar
- navbar
- modal styling
- responsive design
- page hierarchy

Only add the frontend logic required to connect the current UI to the backend APIs.

---

## DO NOT Modify Backend Code

The frontend implementation must NOT modify:

```text
Backend controllers
Backend services
Backend service implementations
Backend repositories
Backend entities
Backend DTOs
Backend records
Backend mappers
Backend validation
Backend authentication
Backend authorization
Flyway migrations
Database schema
Redis configuration
Security configuration
JWT implementation
```

The backend is treated as an existing external API.

If the frontend encounters an API contract mismatch, report the mismatch instead of modifying the backend.

---

# 3. Primary Objective

Connect the existing Admin User Management frontend pages to the backend CRUD APIs.

Required operations:

```text
Create Admin User
Get Admin User List
Get Admin User by ID
Update Admin User
Delete / Deactivate Admin User
```

Frontend flow:

```text
Existing UI
   ↓
React Event
   ↓
User Service
   ↓
Central API Client
   ↓
Existing Spring Boot API
   ↓
Response
   ↓
Update Existing UI State
```

---

# 4. Authentication Requirement

All Admin User Management APIs are protected.

The implementation must reuse the existing authentication setup from:

```text
spec-md/05-authentication.md
```

Do not create a second authentication system.

Protected request flow:

```text
User Management Page
       ↓
userService
       ↓
apiClient
       ↓
Existing Authentication Interceptor
       ↓
Access Token
       ↓
Spring Boot API
```

The exact authentication header must use the existing backend contract.

Do not manually attach a different access token header inside every component.

---

# 5. Recommended Frontend Structure

Use or adapt the existing project structure.

Recommended:

```text
src/
├── api/
│   └── apiClient.js
│
├── components/
│   └── users/
│       ├── UserForm.jsx
│       ├── UserTable.jsx
│       ├── UserDetail.jsx
│       ├── UserStatusBadge.jsx
│       └── DeleteUserModal.jsx
│
├── pages/
│   └── users/
│       ├── UserListPage.jsx
│       ├── UserCreatePage.jsx
│       ├── UserDetailPage.jsx
│       └── UserEditPage.jsx
│
├── services/
│   └── userService.js
│
└── routes/
    └── AppRoutes.jsx
```

Do not create duplicate files if equivalent components already exist.

---

# 6. Existing Design Priority

Before creating new components:

```text
Inspect existing User Management UI
        ↓
Check existing reusable components
        ↓
Reuse current layout and components
        ↓
Add API behavior only
```

Examples of existing UI that should be reused:

```text
User table
Create user form
Edit user form
User detail screen
Status badge
Delete confirmation modal
Pagination
Search box
Role selector
Department selector
```

Do not redesign these components.

---

# 7. Recommended Routes

Use the existing application routes if already implemented.

Recommended route structure:

```text
/admin/users
/admin/users/create
/admin/users/:id
/admin/users/:id/edit
```

These routes must remain protected by:

```text
ProtectedRoute
```

Do not create public User Management routes.

---

# 8. Admin User Create Payload

The backend create request must use this structure:

```json
{
  "employeeId": "RSU-ADMIN-001",
  "phoneNumber": "+66 81 234 5678",
  "firstName": "John",
  "lastName": "Derrick",
  "email": "john.admin@rsu.ac.th",
  "departmentId": null,
  "accountStatus": "ACTIVE",
  "roleId": 2,
  "temporaryPassword": "67Htoo0060Admin!",
  "confirmPassword": "67Htoo0060Admin!",
  "forcePasswordChange": false
}
```

Do not rename request fields.

Use exactly:

```text
employeeId
phoneNumber
firstName
lastName
email
departmentId
accountStatus
roleId
temporaryPassword
confirmPassword
forcePasswordChange
```

unless the backend API contract is changed separately.

---

# 9. Create User Field Types

Frontend representation:

| Field | Type | Required |
|---|---|---:|
| employeeId | string | yes |
| phoneNumber | string | yes |
| firstName | string | yes |
| lastName | string | yes |
| email | string | yes |
| departmentId | number or null | backend dependent |
| accountStatus | string / enum | yes |
| roleId | number | yes |
| temporaryPassword | string | yes |
| confirmPassword | string | yes |
| forcePasswordChange | boolean | yes |

Example:

```javascript
const formData = {
  employeeId: "",
  phoneNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  departmentId: null,
  accountStatus: "ACTIVE",
  roleId: null,
  temporaryPassword: "",
  confirmPassword: "",
  forcePasswordChange: false,
};
```

---

# 10. departmentId Handling

`departmentId` may be:

```json
null
```

Example:

```json
{
  "departmentId": null
}
```

Do not convert `null` into:

```text
0
""
"null"
undefined
```

when the backend expects `null`.

If no department is selected:

```javascript
departmentId: null
```

If a department is selected:

```javascript
departmentId: Number(selectedDepartmentId)
```

---

# 11. roleId Handling

`roleId` must be sent as a number.

Example:

```json
{
  "roleId": 2
}
```

Do not send:

```json
{
  "roleId": "2"
}
```

unless the backend explicitly accepts strings.

When receiving values from an HTML `<select>`, convert:

```javascript
roleId: Number(value)
```

---

# 12. forcePasswordChange Handling

This field must be boolean.

Valid:

```json
{
  "forcePasswordChange": false
}
```

or:

```json
{
  "forcePasswordChange": true
}
```

Do not send:

```text
"false"
"true"
0
1
```

unless required by the backend.

---

# 13. accountStatus

Example backend value:

```text
ACTIVE
```

The frontend must send the exact enum/string value supported by the backend.

Possible values must come from the backend contract.

Do not invent extra account statuses.

Example:

```javascript
accountStatus: "ACTIVE"
```

---

# 14. Password Confirmation

Before sending the create request:

```text
temporaryPassword
```

must match:

```text
confirmPassword
```

Frontend validation:

```javascript
temporaryPassword === confirmPassword
```

If they do not match:

```text
Passwords do not match.
```

Do not submit the API request until this validation passes.

Backend validation remains authoritative.

---

# 15. Password Security

Never log:

```text
temporaryPassword
confirmPassword
```

Never store these values in:

```text
localStorage
sessionStorage
cookies
browser cache logic
global application state
```

Passwords should exist only in the form state required to submit the request.

Clear password state after successful creation.

---

# 16. CRUD API Service

Create or reuse:

```text
src/services/userService.js
```

All Admin User API calls should be located here.

Do not write duplicate Axios requests inside multiple pages.

---

# 17. API Base Path

Use the application's centralized API client.

Expected admin base:

```text
/api/v1/admin
```

Example API client:

```text
apiClient
```

already configured with:

```text
/api/v1/admin
```

Therefore user service paths may use:

```text
/users
```

instead of repeating the complete URL.

---

# 18. CRUD Endpoints

Use the existing backend endpoints.

If the backend currently follows the standard Admin User CRUD contract, use:

```http
POST /api/v1/admin/users
GET /api/v1/admin/users
GET /api/v1/admin/users/{id}
PUT /api/v1/admin/users/{id}
DELETE /api/v1/admin/users/{id}
```

If the backend uses different existing endpoint names, use those existing endpoint names.

Do not modify the backend just to match this recommended path.

---

# 19. userService Example

Recommended structure:

```javascript
import apiClient from "../api/apiClient";

export const createUser = async (payload) => {
  const response = await apiClient.post("/users", payload);
  return response.data;
};

export const getUsers = async (params = {}) => {
  const response = await apiClient.get("/users", {
    params,
  });

  return response.data;
};

export const getUserById = async (id) => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id, payload) => {
  const response = await apiClient.put(
    `/users/${id}`,
    payload
  );

  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(
    `/users/${id}`
  );

  return response.data;
};
```

This is frontend service structure only.

Adapt endpoint names to the actual existing backend contract.

---

# 20. Create User Workflow

Frontend workflow:

```text
User Management
      ↓
Add User
      ↓
Existing Create Form
      ↓
User enters information
      ↓
Frontend validation
      ↓
Build exact backend payload
      ↓
userService.createUser()
      ↓
POST existing backend API
      ↓
Success?
 ┌────┴────┐
 YES       NO
 ↓          ↓
Success    Show safe
message    API error
 ↓
Return to user list
or follow current UI behavior
```

---

# 21. Create User Request Mapping

Example form values:

```javascript
{
  employeeId: "RSU-ADMIN-001",
  phoneNumber: "+66 81 234 5678",
  firstName: "John",
  lastName: "Derrick",
  email: "john.admin@rsu.ac.th",
  departmentId: null,
  accountStatus: "ACTIVE",
  roleId: 2,
  temporaryPassword: "67Htoo0060Admin!",
  confirmPassword: "67Htoo0060Admin!",
  forcePasswordChange: false
}
```

Send directly according to the backend request structure.

Do not add frontend-only values to the request.

---

# 22. Create Form Validation

Before POST:

```text
employeeId required
firstName required
lastName required
email required
valid email format
phoneNumber required if backend requires it
roleId required
accountStatus required
temporaryPassword required
confirmPassword required
passwords must match
```

`departmentId` may remain:

```text
null
```

if backend allows no department.

---

# 23. Create Loading State

When submitting:

```text
isSubmitting = true
```

Existing Create button should become disabled.

Example label:

```text
Creating...
```

or preserve the existing loading UI if already designed.

Do not redesign the button.

Prevent duplicate requests.

---

# 24. Create Success

After successful creation:

```text
Show existing success feedback
```

Then follow existing UX.

Recommended:

```text
redirect to /admin/users
```

or:

```text
refresh current User List
```

Do not introduce a new success page unless already designed.

---

# 25. User List Workflow

When:

```text
/admin/users
```

opens:

```text
UserListPage
     ↓
isLoading = true
     ↓
userService.getUsers()
     ↓
GET backend users endpoint
     ↓
Response
     ↓
Map backend data to existing table
     ↓
isLoading = false
```

Do not replace the existing User Management table design.

---

# 26. User List Data

Map the backend response to the existing table fields.

Possible UI fields include:

```text
Employee ID
Name
Email
Phone Number
Department
Role
Account Status
Actions
```

Use only fields returned by the backend.

Do not fabricate data.

---

# 27. Backend Response Wrappers

The backend may return:

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": []
}
```

or another wrapper.

Do not assume:

```javascript
response.data
```

is always the actual user array.

Inspect the real backend response and map it correctly.

Examples:

```javascript
response.data.data
```

or:

```javascript
response.data.content
```

depending on the actual API.

---

# 28. Pagination

If the existing backend User API is paginated, use its existing pagination parameters.

Possible example:

```text
page
size
sort
```

Do not add frontend-only pagination behavior that conflicts with the backend.

Existing pagination UI:

```text
must remain visually unchanged.
```

On page change:

```text
Existing pagination
      ↓
update API parameters
      ↓
GET users
      ↓
update table
```

---

# 29. Search

If User Management already has a search field and the backend supports search:

```text
Search Input
     ↓
Search parameter
     ↓
GET users API
```

Use the backend-supported query parameter.

Do not create a new backend search API.

If backend does not support search, do not change backend code.

---

# 30. Filters

If the existing UI includes:

```text
Role filter
Account Status filter
Department filter
```

connect them only when the backend already supports equivalent API query parameters.

Do not change the existing filter design.

Do not add new backend filtering endpoints.

---

# 31. User Detail Workflow

When the user selects:

```text
View
```

navigate according to the existing route:

```text
/admin/users/:id
```

Then:

```text
UserDetailPage
      ↓
read route id
      ↓
userService.getUserById(id)
      ↓
GET existing backend API
      ↓
render backend data
```

Do not redesign the detail page.

---

# 32. ID Handling

Route ID should be validated before making API requests.

Example:

```javascript
const { id } = useParams();
```

If backend user IDs are numeric:

```javascript
const userId = Number(id);
```

Do not send invalid IDs such as:

```text
undefined
NaN
""
```

---

# 33. User Detail Loading

While API request is running:

```text
show the existing loading state
```

Do not display stale user information.

---

# 34. User Not Found

If backend returns:

```http
404 Not Found
```

show an appropriate message within the existing UI.

Example:

```text
User not found.
```

Do not create a new backend endpoint.

---

# 35. Edit User Workflow

Edit route:

```text
/admin/users/:id/edit
```

Workflow:

```text
Open Edit Page
     ↓
GET user by ID
     ↓
Populate existing form
     ↓
User changes fields
     ↓
Validate
     ↓
Build backend update payload
     ↓
PUT existing backend API
     ↓
Success
     ↓
Update UI / return according to existing design
```

---

# 36. Edit Form Population

Never use hardcoded user values.

Populate from:

```text
GET /users/{id}
```

Example:

```javascript
setFormData({
  employeeId: user.employeeId ?? "",
  phoneNumber: user.phoneNumber ?? "",
  firstName: user.firstName ?? "",
  lastName: user.lastName ?? "",
  email: user.email ?? "",
  departmentId: user.departmentId ?? null,
  accountStatus: user.accountStatus ?? "ACTIVE",
  roleId: user.roleId ?? null,
  forcePasswordChange:
    user.forcePasswordChange ?? false,
});
```

Actual mapping must follow the real backend response.

---

# 37. Update Payload

Do not automatically send:

```text
temporaryPassword
confirmPassword
```

during update unless the existing backend update endpoint requires or supports them.

The create and update APIs may use different request structures.

The frontend must inspect the existing backend update contract.

Do not modify backend DTOs to make create/update payloads identical.

---

# 38. Update Workflow Rule

Only send fields supported by the existing update endpoint.

Example:

```javascript
const updatePayload = {
  employeeId,
  phoneNumber,
  firstName,
  lastName,
  email,
  departmentId,
  accountStatus,
  roleId,
  forcePasswordChange,
};
```

This is an example only.

Use the exact existing backend contract.

---

# 39. Update Loading State

When saving:

```text
isUpdating = true
```

Disable the existing Update button.

Use existing design.

Possible text:

```text
Updating...
```

Do not create a new button style.

---

# 40. Delete User Workflow

Use the existing Delete action.

Never delete immediately when the button is first clicked.

Workflow:

```text
Delete button
     ↓
Existing confirmation modal
     ↓
User confirms
     ↓
userService.deleteUser(id)
     ↓
DELETE existing backend API
     ↓
Success
     ↓
Close modal
     ↓
Refresh list
```

Do not redesign the modal.

---

# 41. Delete Behavior

The frontend does not decide whether deletion is:

```text
hard delete
soft delete
deactivation
```

That behavior belongs to the backend.

The frontend should simply call the existing delete endpoint.

Do not implement separate soft-delete logic in React.

---

# 42. Delete Success

After successful delete:

```text
remove item from current table state
```

or:

```text
refetch user list
```

Prefer refetching if the backend may apply additional filtering or status changes.

---

# 43. Delete Failure

If the backend rejects delete:

```text
keep the user visible
keep modal/error state consistent
show backend-safe message
```

Do not remove the row optimistically unless the project explicitly uses optimistic updates.

---

# 44. Related Reference Data

Create User may require:

```text
roles
departments
```

If these are provided by backend APIs:

```text
load them from existing endpoints
```

Do not hardcode production role IDs or department IDs when backend lookup APIs exist.

Example UI:

```text
Role dropdown
      ↓
GET roles API
```

```text
Department dropdown
      ↓
GET departments API
```

Do not modify those backend endpoints.

---

# 45. Role Dropdown

Display role name to users:

```text
Admin
Manager
...
```

but submit:

```text
roleId
```

Example:

```text
UI:
Admin

Request:
roleId: 2
```

Do not submit the display label when the API expects an ID.

---

# 46. Department Dropdown

Display:

```text
Department Name
```

but submit:

```text
departmentId
```

When none is selected:

```javascript
departmentId: null
```

if allowed by backend.

---

# 47. Account Status Dropdown

Display status according to the existing design.

Example values must come from backend.

Example:

```text
ACTIVE
INACTIVE
SUSPENDED
```

Do not add values that the backend enum does not support.

---

# 48. User Status Badges

Keep the existing status badge design unchanged.

Only map backend value to existing badge UI.

Example:

```text
ACTIVE
    ↓
existing Active badge
```

Do not change colors or styling.

---

# 49. Form State

Recommended create form state:

```javascript
const initialFormData = {
  employeeId: "",
  phoneNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  departmentId: null,
  accountStatus: "ACTIVE",
  roleId: null,
  temporaryPassword: "",
  confirmPassword: "",
  forcePasswordChange: false,
};
```

If the project already uses another form state pattern, reuse it.

---

# 50. Request Transformation

Before API submission, normalize fields.

Example:

```javascript
const payload = {
  employeeId: formData.employeeId.trim(),
  phoneNumber: formData.phoneNumber.trim(),
  firstName: formData.firstName.trim(),
  lastName: formData.lastName.trim(),
  email: formData.email.trim(),
  departmentId:
    formData.departmentId === null ||
    formData.departmentId === ""
      ? null
      : Number(formData.departmentId),
  accountStatus: formData.accountStatus,
  roleId: Number(formData.roleId),
  temporaryPassword: formData.temporaryPassword,
  confirmPassword: formData.confirmPassword,
  forcePasswordChange:
    Boolean(formData.forcePasswordChange),
};
```

Do not transform fields in ways that change backend meaning.

---

# 51. Error Handling

Handle API failures without changing page design.

Possible responses:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

---

# 52. 400 Bad Request

Display backend validation errors near existing form fields where possible.

Examples:

```text
Employee ID is required.
Email is invalid.
Role is required.
```

Do not expose raw Java exception output.

---

# 53. 401 Unauthorized

Existing authentication handling from:

```text
05-authentication.md
```

must manage this centrally.

Expected:

```text
401
 ↓
clear invalid authentication
 ↓
redirect /login
```

Do not add a second local 401 system inside User Management.

---

# 54. 403 Forbidden

Do not change backend permissions.

Show safe access-denied behavior using the current application architecture.

Do not try to bypass the API permission.

---

# 55. 404 Not Found

For user detail/edit:

```text
User not found.
```

Keep existing page structure.

---

# 56. 409 Conflict

Possible situations:

```text
Employee ID already exists
Email already exists
Phone number already exists
```

Display the backend-provided safe validation message.

Example:

```text
A user with this email already exists.
```

Do not automatically generate a different email or employee ID.

---

# 57. 500 Server Error

Display:

```text
Unable to complete the request. Please try again.
```

Do not display:

```text
Java stack trace
SQL error
Hibernate exception
internal database information
```

---

# 58. Loading States

Every CRUD request must have a loading state.

Examples:

```text
Loading users...
Loading user...
Creating...
Updating...
Deleting...
```

Use the existing UI/loading design.

Do not redesign tables or buttons.

---

# 59. Empty State

If GET users returns no records:

```text
render the existing empty state
```

Example content if the existing design has no defined copy:

```text
No users found.
```

Do not redesign the table.

---

# 60. Refresh After Mutation

After:

```text
create
update
delete
```

ensure UI data reflects backend state.

Recommended:

```text
Mutation success
      ↓
refetch affected data
```

or update local state if already supported by the project.

---

# 61. No Hardcoded API Data

Do not leave test data such as:

```javascript
const users = [
  {
    id: 1,
    name: "John Derrick"
  }
];
```

once API integration is complete.

Mock data should be removed from the connected page.

---

# 62. Do Not Hardcode Admin Payload

The following payload is an example of the backend create contract:

```json
{
  "employeeId": "RSU-ADMIN-001",
  "phoneNumber": "+66 81 234 5678",
  "firstName": "John",
  "lastName": "Derrick",
  "email": "john.admin@rsu.ac.th",
  "departmentId": null,
  "accountStatus": "ACTIVE",
  "roleId": 2,
  "temporaryPassword": "67Htoo0060Admin!",
  "confirmPassword": "67Htoo0060Admin!",
  "forcePasswordChange": false
}
```

Do not submit these same example values for every new user.

Values must come from the existing Create User form.

---

# 63. Do Not Change Figma Implementation

The agent must NOT use this feature request to:

```text
move components
change sidebar width
change navbar
replace fonts
change user table columns
change colors
change form spacing
replace buttons
change modal style
modify responsive layout
```

unless necessary to fix a functional defect preventing API integration.

If UI changes are required, they must be requested separately.

---

# 64. Do Not Change Backend

Strict rule:

```text
FRONTEND ONLY
```

If API integration fails because:

```text
endpoint differs
request field differs
response differs
validation fails
CORS fails
permission fails
```

first inspect and report the existing backend behavior.

Do not automatically modify backend source code.

---

# 65. CRUD Workflow Summary

```text
                    Admin User Management
                              |
          +-------------------+--------------------+
          |                   |                    |
          v                   v                    v
        CREATE               READ                UPDATE
          |                   |                    |
          v                   v                    v
  Existing Create Form   Existing Table     Existing Edit Form
          |                   |                    |
          v                   v                    v
    Validate Fields       GET Users          GET User by ID
          |                   |                    |
          v                   v                    v
     POST User           Render Data          Populate Form
          |                                        |
          v                                        v
    API Response                             Validate Changes
                                                   |
                                                   v
                                              PUT User
                                                   |
                                                   v
                                             API Response


                              DELETE
                                 |
                                 v
                       Existing Delete Button
                                 |
                                 v
                      Existing Confirm Modal
                                 |
                                 v
                          DELETE User API
                                 |
                                 v
                          Refresh User List
```

---

# 66. Create User Complete Workflow

```text
/admin/users/create
        ↓
Existing Create User UI
        ↓
Load roles if required
        ↓
Load departments if required
        ↓
Enter form fields
        ↓
Validate frontend fields
        ↓
temporaryPassword === confirmPassword?
        ↓
YES
        ↓
Normalize IDs / nullable fields
        ↓
Build request
        ↓
POST existing backend API
        ↓
Success
        ↓
Clear sensitive password state
        ↓
Show existing success UI
        ↓
Navigate /admin/users
```

---

# 67. Get User List Complete Workflow

```text
/admin/users
      ↓
GET existing users API
      ↓
Loading
      ↓
Response
      ↓
Extract backend data
      ↓
Map to existing User Table
      ↓
Render rows
```

---

# 68. Get User Detail Workflow

```text
/admin/users/:id
       ↓
Read id
       ↓
GET existing user detail API
       ↓
Response
       ↓
Populate existing detail UI
```

---

# 69. Update Workflow

```text
/admin/users/:id/edit
       ↓
GET user
       ↓
Populate existing edit form
       ↓
Modify allowed fields
       ↓
Validate
       ↓
Build existing backend update request
       ↓
PUT existing API
       ↓
Success
       ↓
Show existing success behavior
```

---

# 70. Delete Workflow

```text
Existing User Table
       ↓
Delete
       ↓
Existing Confirmation
       ↓
Confirm
       ↓
DELETE existing backend API
       ↓
Success
       ↓
Refetch users
```

---

# 71. Testing - Create User

Test using a valid payload equivalent to:

```json
{
  "employeeId": "RSU-ADMIN-001",
  "phoneNumber": "+66 81 234 5678",
  "firstName": "John",
  "lastName": "Derrick",
  "email": "john.admin@rsu.ac.th",
  "departmentId": null,
  "accountStatus": "ACTIVE",
  "roleId": 2,
  "temporaryPassword": "67Htoo0060Admin!",
  "confirmPassword": "67Htoo0060Admin!",
  "forcePasswordChange": false
}
```

Verify:

```text
Correct request body
Correct content type
Authentication header included
Success response handled
User list updated
Password not persisted
```

---

# 72. Testing - Create with Department

Test:

```json
{
  "departmentId": 5
}
```

Verify frontend sends:

```text
number
```

not:

```text
"5"
```

---

# 73. Testing - Create Without Department

Test:

```json
{
  "departmentId": null
}
```

Verify frontend sends actual:

```text
null
```

---

# 74. Testing - Password Mismatch

Example:

```text
temporaryPassword:
Password123!

confirmPassword:
Password456!
```

Expected:

```text
Do not call backend API.

Show:
Passwords do not match.
```

---

# 75. Testing - Duplicate User

If backend returns conflict:

```text
409
```

expected:

```text
Remain on form.
Display safe backend message.
Do not clear the entire form unnecessarily.
```

---

# 76. Testing - User List

Verify:

```text
GET request runs when page loads.
Loading state appears.
Backend data appears in existing table.
No mock user data remains.
```

---

# 77. Testing - Edit

Verify:

```text
Correct user loads.
Existing form is populated.
Update API receives correct fields.
UI remains unchanged.
```

---

# 78. Testing - Delete

Verify:

```text
Delete does not run before confirmation.
Correct user ID is sent.
List refreshes after success.
```

---

# 79. Testing - Unauthorized

Remove/expire authentication.

Open:

```text
/admin/users
```

Expected:

```text
redirect to /login
```

according to existing authentication implementation.

---

# 80. Testing - API Error

Stop backend or simulate server failure.

Expected:

```text
Existing page remains usable.
Safe error message displays.
No Java/server error details are exposed.
```

---

# 81. Agent Implementation Instructions

Use this instruction when implementing the feature:

```text
Implement Admin User Management CRUD API integration in the frontend.

IMPORTANT:
- Frontend implementation only.
- Do not modify backend code.
- Do not modify backend APIs.
- Do not modify database schema.
- Do not modify Flyway.
- Do not modify backend DTOs.
- Do not modify authentication or security backend code.
- Do not change the existing Figma/UI design.
- Do not redesign components.

Follow:
- AGENT.md
- spec-md/05-authentication.md
- spec-md/06-admin-user-management.md

Tasks:

1. Inspect the existing User Management frontend.
2. Keep all current UI styling and layout unchanged.
3. Inspect the existing backend User Management API contract.
4. Reuse the central apiClient.
5. Reuse the current authentication/access-token interceptor.
6. Create or update userService.js.
7. Connect the existing User List page to GET users API.
8. Connect the existing User Detail page to GET user-by-ID API.
9. Connect the existing Create User form to POST user API.
10. Connect the existing Edit User form to PUT user API.
11. Connect the existing Delete action to DELETE user API.
12. Load role and department reference data from existing APIs if required.
13. Handle nullable departmentId correctly.
14. Send roleId as a number.
15. Send forcePasswordChange as a boolean.
16. Validate temporaryPassword and confirmPassword before create.
17. Never store or log passwords.
18. Handle loading, success and error states using the existing UI.
19. Remove mock user data after successful API connection.
20. Refetch/update list data after mutations.
21. Do not modify unrelated frontend modules.
22. Do not modify backend source code even if integration errors occur.
```

---

# 82. Acceptance Criteria

Implementation is complete when:

- Existing User Management design remains unchanged.
- No Figma/UI redesign was performed.
- Backend source code remains unchanged.
- Database/Flyway remains unchanged.
- User List loads from backend API.
- User Detail loads from backend API.
- Create User sends backend-compatible request.
- Update User uses existing backend update contract.
- Delete User calls existing backend delete endpoint.
- Protected requests use existing authentication.
- `employeeId` is sent correctly.
- `phoneNumber` is sent correctly.
- `firstName` is sent correctly.
- `lastName` is sent correctly.
- `email` is sent correctly.
- `departmentId` supports `null`.
- Selected `departmentId` is numeric.
- `accountStatus` uses backend-supported value.
- `roleId` is numeric.
- `temporaryPassword` is handled securely.
- `confirmPassword` is validated.
- `forcePasswordChange` is boolean.
- Passwords are not persisted.
- Passwords are not logged.
- Loading states work.
- Backend validation errors display safely.
- 401 uses existing centralized authentication behavior.
- 404 User Not Found is handled.
- 409 duplicate data is handled.
- 500 errors are handled safely.
- Create success refreshes/navigates according to existing UI.
- Update success refreshes relevant data.
- Delete success refreshes User List.
- No mock user data remains on connected screens.
- No duplicate Axios/API client was introduced.
- No unrelated frontend module was changed.

---

# 83. Final Architecture

```text
                Existing User Management UI
                          |
                          v
                    React Pages
                          |
                          v
                    userService.js
                          |
                          v
                      apiClient
                          |
                  Existing Auth Token
                          |
                          v
              Existing Spring Boot API
                          |
          +---------------+---------------+
          |               |               |
          v               v               v
        CREATE           READ            UPDATE
          |               |               |
          +---------------+---------------+
                          |
                          v
                        DELETE
```

Core rule:

```text
CONNECT THE FRONTEND TO THE EXISTING API.

DO NOT CHANGE THE UI DESIGN.

DO NOT CHANGE BACKEND CODE.
```