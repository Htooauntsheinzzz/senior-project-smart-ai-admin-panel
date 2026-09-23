# AGENT.md

## 1. Project Overview

This repository contains the frontend application for the:

**Smart AI University Student Assistant – Admin Web**

The frontend is responsible for providing the administration interface for managing users, university data, system configuration, and other modules used by the Smart AI University Student Assistant platform.

The frontend communicates with the Spring Boot backend through REST APIs.

Backend base URL during local development:

```text
http://localhost:8080
```

Admin API base path:

```text
/api/v1/admin
```

Example:

```text
http://localhost:8080/api/v1/admin/auth/login
```

---

# 2. Frontend Technology Stack

Use the following technologies unless a module specification explicitly requires otherwise.

- React.js
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Axios
- React Hooks
- Context API when global state is small
- TanStack Query may be introduced later for server-state management
- ESLint
- npm

Do not introduce another framework or major library without a clear requirement.

Do not convert the project to TypeScript unless the project specification is updated to require TypeScript.

---

# 3. Specification-Driven Development

All frontend implementation must follow the specifications stored inside:

```text
spec-md/
```

The `spec-md` directory is the primary source of implementation requirements.

Each feature or module must have its own Markdown specification file.

Example:

```text
spec-md/
├── 00-project-setup.md
├── 01-authentication.md
├── 02-admin-layout.md
├── 03-dashboard.md
├── 04-admin-user-management.md
├── 05-user-create.md
├── 06-user-list.md
├── 07-user-detail.md
├── 08-user-update.md
└── 09-user-delete.md
```

Before implementing any module:

1. Read `AGENT.md`.
2. Read the relevant Markdown file inside `spec-md/`.
3. Understand the required UI.
4. Understand the API endpoints.
5. Understand request and response structures.
6. Understand validation rules.
7. Understand loading, empty, success, and error states.
8. Implement only after reviewing the specification.

Do not ignore requirements defined in `spec-md`.

If `AGENT.md` and a module specification appear to conflict, use the module specification for module-specific behavior while continuing to follow the general project standards defined here.

---

# 4. Module Development Workflow

Every frontend module should follow this workflow.

## Step 1 — Read Specification

Find the appropriate specification.

Example:

```text
spec-md/04-admin-user-management.md
```

Read the entire file before writing code.

---

## Step 2 — Identify Module Requirements

Determine:

- page name
- route
- UI layout
- components
- API endpoint
- HTTP method
- request payload
- response payload
- authentication requirements
- validation rules
- permissions
- loading state
- error state
- empty state
- success behavior

---

## Step 3 — Check Existing Components

Before creating a new component, check whether an existing reusable component already exists.

Examples:

```text
Button
Input
Select
Modal
Table
Pagination
LoadingSpinner
Alert
ConfirmDialog
PageHeader
FormField
StatusBadge
```

Avoid creating duplicate components.

---

## Step 4 — Implement UI

Build the UI according to the module specification.

The UI must:

- use Tailwind CSS
- follow the existing design system
- work on common desktop screen sizes
- avoid unnecessary inline styles
- reuse common components
- maintain consistent spacing
- maintain consistent typography
- maintain consistent button styles
- maintain consistent form styles

---

## Step 5 — Integrate API

API calls must not be written directly throughout page components.

Use centralized API service files.

Example:

```text
src/services/authService.js
src/services/userService.js
```

Example service:

```javascript
import apiClient from "./apiClient";

export const getUsers = () => {
  return apiClient.get("/api/v1/admin/users");
};
```

---

## Step 6 — Handle States

Each API-based page must consider:

### Loading

Show a loading state while waiting for API responses.

### Success

Display returned data correctly.

### Empty

Display a useful empty state when no records exist.

### Error

Display a clear error message when the API fails.

### Unauthorized

If the server returns:

```text
401 Unauthorized
```

the application should handle the authentication failure appropriately.

---

## Step 7 — Validate

After implementation verify:

- page renders correctly
- route works
- API works
- form validation works
- API validation errors are displayed
- loading state works
- empty state works
- error state works
- success behavior works
- responsive layout works
- protected routes work

---

# 5. Recommended Project Structure

Use the following general structure.

```text
src/
├── api/
│   └── apiClient.js
│
├── assets/
│
├── components/
│   ├── common/
│   ├── forms/
│   ├── layout/
│   └── ui/
│
├── constants/
│
├── context/
│
├── hooks/
│
├── layouts/
│   └── AdminLayout.jsx
│
├── pages/
│   ├── auth/
│   ├── dashboard/
│   └── users/
│
├── routes/
│   ├── AppRoutes.jsx
│   └── ProtectedRoute.jsx
│
├── services/
│   ├── authService.js
│   └── userService.js
│
├── utils/
│
├── App.jsx
├── main.jsx
└── index.css
```

The structure may expand as modules are added.

Do not put all logic inside `App.jsx`.

---

# 6. Component Rules

Components should be small and focused.

Good:

```text
UserTable.jsx
UserForm.jsx
UserStatusBadge.jsx
DeleteUserModal.jsx
```

Avoid very large components containing:

- API logic
- form logic
- table rendering
- modal rendering
- navigation
- validation

all inside one file.

Break complex screens into reusable components.

---

# 7. Naming Convention

## React Components

Use PascalCase.

```text
LoginPage.jsx
AdminLayout.jsx
UserTable.jsx
UserForm.jsx
```

---

## JavaScript Files

Use camelCase when the file is not a component.

```text
authService.js
userService.js
apiClient.js
tokenStorage.js
```

---

## Variables

Use camelCase.

```javascript
const userList = [];
const accessToken = "";
const isLoading = false;
```

---

## Constants

Use uppercase snake case when appropriate.

```javascript
const API_BASE_URL = "http://localhost:8080";
```

---

## Functions

Use descriptive names.

Good:

```javascript
handleLogin()
handleSubmit()
fetchUsers()
createUser()
updateUser()
deleteUser()
```

Avoid:

```javascript
doIt()
run()
process()
dataFunc()
```

---

# 8. Routing Rules

Use React Router for frontend navigation.

Recommended routes:

```text
/login

/admin/dashboard

/admin/users
/admin/users/create
/admin/users/:id
/admin/users/:id/edit
```

Authenticated pages must use a protected route.

Example:

```text
/admin/*
```

should not be accessible without valid authentication.

---

# 9. Authentication Rules

Authentication functionality must follow:

```text
spec-md/01-authentication.md
```

The backend authentication endpoint will use the admin API path.

Example:

```text
POST /api/v1/admin/auth/login
```

Do not hardcode authentication logic inside multiple components.

Authentication should be centralized.

Possible structure:

```text
src/context/AuthContext.jsx
src/services/authService.js
src/utils/tokenStorage.js
src/routes/ProtectedRoute.jsx
```

---

# 10. API Client Rules

Create a centralized Axios client.

Recommended:

```text
src/api/apiClient.js
```

Example:

```javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
```

Environment variable:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Do not repeatedly write:

```text
http://localhost:8080
```

inside components.

---

# 11. Access Token Handling

Protected backend requests must include the access token according to the backend authentication specification.

The exact header format must follow:

```text
spec-md/01-authentication.md
```

Use Axios request interceptors when appropriate.

Example responsibility:

```text
apiClient
   ↓
attach access token
   ↓
send request
```

Do not manually attach the access token independently in every page.

---

# 12. API Service Layer

Pages should not contain large amounts of HTTP implementation logic.

Use:

```text
Page
 ↓
Service
 ↓
Axios Client
 ↓
Backend
```

Example:

```text
UserListPage
     ↓
userService.getUsers()
     ↓
apiClient
     ↓
Spring Boot API
```

---

# 13. Tailwind CSS Rules

Use Tailwind CSS as the main styling solution.

Prefer:

```jsx
<div className="rounded-lg bg-white p-6 shadow-sm">
```

Avoid unnecessary custom CSS.

Custom CSS may be used for:

- application-wide styles
- complex animations
- styles difficult to express cleanly with Tailwind
- third-party library customization

Do not mix multiple CSS frameworks.

---

# 14. Admin Design System

Keep the frontend visually consistent.

Recommended application style:

### Main Background

```text
Light gray
```

Example:

```text
bg-gray-50
```

### Cards

```text
White
```

Example:

```text
bg-white
```

### Primary Actions

Use the project's blue primary color.

### Delete / Dangerous Actions

Use red.

### Success

Use green.

### Warning / Pending

Use orange or amber.

### Disabled

Use neutral gray.

Do not randomly introduce different colors for the same action type.

---

# 15. Form Rules

Every form should provide:

- label
- input
- required indicator when necessary
- validation message
- disabled submit state
- loading state
- API error state

Example:

```text
Email
[________________________]

Password
[________________________]

[ Login ]
```

Never silently fail when validation fails.

---

# 16. Validation Rules

Frontend validation improves user experience but does not replace backend validation.

Validate fields before submitting when appropriate.

Possible validation includes:

- required fields
- email format
- minimum length
- maximum length
- numeric values
- allowed selection values

Backend validation errors must also be handled.

---

# 17. Button Rules

Use consistent button types.

Examples:

```text
Primary
Secondary
Danger
Cancel
```

Primary:

```text
Save
Create
Update
Login
```

Danger:

```text
Delete
Deactivate
```

Do not use red buttons for normal actions.

---

# 18. Table Rules

For management modules, tables should support relevant states.

Example:

```text
------------------------------------------------------------
Employee ID | Name | Email | Role | Status | Actions
------------------------------------------------------------
RSU-001     | ...  | ...   | ...  | Active | View Edit
------------------------------------------------------------
```

Where required by the specification, support:

- pagination
- search
- filtering
- sorting
- action buttons
- status badges

Do not implement unnecessary table functionality if it is not part of the module specification.

---

# 19. Delete Workflow

Never immediately delete a record when the user clicks a delete button.

Use confirmation.

Example:

```text
Are you sure you want to delete this user?

[Cancel] [Delete]
```

The exact delete behavior must follow the backend specification.

If the backend uses soft delete, the frontend should treat deletion as the backend defines it.

---

# 20. Loading Rules

Avoid blank pages during API requests.

Use:

- spinner
- skeleton
- table loading state

depending on the module.

Buttons making API requests should normally be disabled while the request is running.

Example:

```text
Saving...
```

---

# 21. Error Handling

Do not only write API errors to:

```javascript
console.log(error);
```

Display useful messages to users.

Examples:

```text
Unable to load users.
Please try again.
```

For validation:

```text
Email already exists.
```

Do not expose sensitive backend stack traces.

---

# 22. Empty States

When an API returns no records, display a proper empty state.

Bad:

```text
blank table
```

Better:

```text
No users found.

Create your first admin user to get started.
```

---

# 23. Environment Configuration

Environment-specific settings must use environment variables.

Example:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Use:

```javascript
import.meta.env.VITE_API_BASE_URL
```

Do not commit sensitive credentials.

---

# 24. Security Rules

Never put the following inside frontend source code:

- database passwords
- private keys
- backend secrets
- JWT signing secrets
- Redis passwords
- production credentials
- super admin passwords

Frontend applications are visible to users.

Only public configuration appropriate for browser applications may exist in frontend environment variables.

---

# 25. Backend Contract

Do not invent API endpoints when the backend API has already been specified.

Use the APIs defined in the relevant `spec-md` file.

Example:

```text
POST /api/v1/admin/auth/login
GET /api/v1/admin/users
POST /api/v1/admin/users
GET /api/v1/admin/users/{id}
PUT /api/v1/admin/users/{id}
DELETE /api/v1/admin/users/{id}
```

The exact endpoints must match the module specification.

---

# 26. API Response Handling

Do not assume every API returns only raw data.

Read the module specification and backend response format.

Possible response:

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": []
}
```

Use the actual API contract.

---

# 27. Code Quality Rules

Before considering a module complete:

- remove unused imports
- remove unused variables
- remove debugging logs
- check ESLint
- ensure component names are meaningful
- keep code readable
- avoid duplicate logic
- avoid extremely large components
- reuse utility functions
- reuse common UI components

---

# 28. Do Not Over-Engineer

Implement what the current specification requires.

Do not automatically add:

- Redux
- Zustand
- complex state machines
- WebSockets
- micro-frontends
- unnecessary animation libraries
- unnecessary UI libraries

unless a future specification requires them.

Keep the architecture simple and scalable.

---

# 29. Development Order

The frontend should generally be implemented in the following order.

```text
1. Project Setup
       ↓
2. Tailwind CSS Setup
       ↓
3. Project Folder Structure
       ↓
4. Routing
       ↓
5. API Client
       ↓
6. Authentication
       ↓
7. Protected Routes
       ↓
8. Admin Layout
       ↓
9. Dashboard
       ↓
10. Admin User Management
       ↓
11. Other Admin Modules
```

Do not build dependent modules before their required foundation exists.

---

# 30. Module Specification Format

Every feature specification inside `spec-md/` should preferably contain:

```text
# Module Name

## Purpose

## Route

## UI Requirements

## Components

## API Endpoints

## Request

## Response

## Validation

## Loading State

## Empty State

## Error State

## Success Behavior

## Permissions

## Implementation Workflow

## Acceptance Criteria
```

This helps keep all feature implementations consistent.

---

# 31. Example Specification Mapping

Example:

```text
spec-md/
├── 00-project-setup.md
├── 01-authentication.md
├── 02-admin-layout.md
├── 03-dashboard.md
└── admin-user/
    ├── 00-admin-user-overview.md
    ├── 01-user-create.md
    ├── 02-user-list.md
    ├── 03-user-detail.md
    ├── 04-user-update.md
    └── 05-user-delete.md
```

The directory can grow as the project grows.

---

# 32. Feature Implementation Rule

When asked to implement a feature such as:

```text
Implement Admin User List
```

the agent must first locate and follow:

```text
spec-md/admin-user/02-user-list.md
```

Then:

```text
Read specification
      ↓
Inspect existing implementation
      ↓
Identify reusable components
      ↓
Implement required UI
      ↓
Implement API integration
      ↓
Handle states
      ↓
Validate against acceptance criteria
```

---

# 33. Do Not Modify Unrelated Features

When working on one feature:

Do not unnecessarily change:

- authentication
- dashboard
- unrelated services
- unrelated components
- unrelated routes

Changes should stay focused on the requested module unless a dependency must be updated.

---

# 34. Existing Code Has Priority

Before creating:

```text
new component
new service
new helper
new route
new utility
```

inspect the existing project.

Reuse existing implementation where practical.

Do not create duplicates such as:

```text
apiClient.js
axiosClient.js
httpClient.js
```

when one centralized client is enough.

---

# 35. Completion Criteria

A module is complete only when:

- specification requirements are implemented
- page route works
- API integration works
- validation works
- loading state exists
- error handling exists
- empty state exists when applicable
- success behavior works
- UI follows project design
- code follows project structure
- no unnecessary code remains
- acceptance criteria from the module specification are satisfied

---

# 36. Agent Instruction Summary

Always follow this order:

```text
Read AGENT.md
      ↓
Read relevant spec-md file
      ↓
Inspect existing frontend code
      ↓
Understand backend API contract
      ↓
Reuse existing architecture
      ↓
Implement the feature
      ↓
Handle loading/error/empty/success states
      ↓
Validate against specification
      ↓
Finish only requested scope
```

The `spec-md` directory is the implementation specification for this project.

**Do not implement a frontend module without checking its specification first.**

When Changes please add in **00-changes-and-decision.md**