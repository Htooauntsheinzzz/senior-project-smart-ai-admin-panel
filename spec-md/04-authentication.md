# 05 - Authentication

## 1. Module Information

### Module Name

```text
Authentication
```

### Project

```text
Smart AI University Student Assistant – Admin Web
```

### Frontend Technology

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
Spring Boot
```

### Admin API Base Path

```text
/api/v1/admin
```

---

# 2. Purpose

The Authentication module controls access to the Smart AI Admin Web application.

The module is responsible for:

- administrator login
- credential validation
- calling the backend login API
- handling authentication responses
- storing authentication state
- attaching the access token to protected API requests
- protecting admin routes
- redirecting authenticated users
- redirecting unauthenticated users
- restoring authentication after page refresh
- handling expired or invalid authentication
- logout
- clearing authentication information securely

---

# 3. Related Specifications

Before implementing authentication, read:

```text
AGENT.md

spec-md/01-docker-set-up.md
spec-md/02-project-structure.md
spec-md/03-mcp-set-up.md
spec-md/04-login-screen.md
spec-md/05-authentication.md
```

Authentication UI must follow:

```text
spec-md/04-login-screen.md
```

---

# 4. Authentication Workflow

Main authentication workflow:

```text
User opens /login
       ↓
LoginPage
       ↓
Enter email + password
       ↓
Validate fields
       ↓
POST /api/v1/admin/auth/login
       ↓
Backend validates credentials
       ↓
Authentication success?
       │
       ├── NO
       │    ↓
       │  Show login error
       │
       └── YES
            ↓
       Read authentication response
            ↓
       Store required authentication state
            ↓
       Update AuthContext
            ↓
       Redirect
            ↓
       /admin/dashboard
```

---

# 5. Login Route

Public login route:

```text
/login
```

Component:

```text
src/pages/auth/LoginPage.jsx
```

This route must be available without authentication.

---

# 6. Dashboard Route

After successful login redirect to:

```text
/admin/dashboard
```

Dashboard must be a protected route.

Unauthenticated users must not be able to access:

```text
/admin/dashboard
```

directly.

---

# 7. Backend Login Endpoint

Authentication endpoint:

```http
POST /api/v1/admin/auth/login
```

Full local development request through the frontend proxy:

```text
/api/v1/admin/auth/login
```

Do not hardcode:

```text
http://localhost:8080/api/v1/admin/auth/login
```

inside React components.

The API client must use the existing centralized configuration.

---

# 8. Login Request

The login form contains:

```text
email
password
rememberMe
```

The actual request body must follow the backend API contract.

Expected example:

```json
{
  "email": "admin@rsu.ac.th",
  "password": "password"
}
```

Do not include:

```json
{
  "rememberMe": true
}
```

unless the backend login API explicitly supports this field.

---

# 9. Login Form State

Recommended state:

```javascript
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [rememberMe, setRememberMe] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [authError, setAuthError] = useState("");
```

If the project later introduces a form library, follow the project-wide form architecture instead.

---

# 10. Login Validation

Validate before sending the API request.

## Email

Required:

```text
Email is required.
```

Invalid email:

```text
Please enter a valid email address.
```

## Password

Required:

```text
Password is required.
```

Do not invent password-strength requirements for the login form.

Password policy belongs to account creation/password-change specifications.

---

# 11. Login Submission

Recommended workflow:

```text
handleSubmit
     ↓
preventDefault()
     ↓
clear previous authentication error
     ↓
validate input
     ↓
isLoading = true
     ↓
authService.login()
     ↓
process response
     ↓
update authentication state
     ↓
navigate("/admin/dashboard")
```

The form should use:

```jsx
<form onSubmit={handleSubmit}>
```

instead of placing all login logic inside a button `onClick`.

---

# 12. Login Service

Create:

```text
src/services/authService.js
```

Responsibility:

```text
Authentication-related backend API communication
```

Example architecture:

```text
LoginPage
    ↓
AuthContext
    ↓
authService
    ↓
apiClient
    ↓
Spring Boot Backend
```

Recommended service concept:

```javascript
import apiClient from "../api/apiClient";

export const login = async (credentials) => {
  const response = await apiClient.post(
    "/auth/login",
    credentials
  );

  return response.data;
};
```

Do not place large Axios calls directly inside:

```text
LoginPage.jsx
```

---

# 13. API Client

Use:

```text
src/api/apiClient.js
```

Recommended base URL:

```text
/api/v1/admin
```

Example:

```javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "/api/v1/admin",

  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
```

Environment:

```env
VITE_API_BASE_URL=/api/v1/admin
```

---

# 14. Authentication Response

The frontend must follow the actual Spring Boot authentication response.

The implementation must inspect the backend contract before assuming response property names.

A possible response could look like:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "...",
    "user": {
      "id": 1,
      "email": "admin@rsu.ac.th"
    }
  }
}
```

However:

```text
Do not hardcode this example unless the backend returns this exact structure.
```

Before implementation verify:

```text
access token field name
token type
expiration field
user data
role data
response wrapper
error response
refresh token behavior
```

---

# 15. Authentication State

Create:

```text
src/context/AuthContext.jsx
```

The context should expose authentication state and actions.

Recommended structure:

```javascript
{
  user,
  accessToken,
  isAuthenticated,
  isAuthLoading,
  login,
  logout
}
```

Example usage:

```javascript
const {
  user,
  isAuthenticated,
  login,
  logout
} = useAuth();
```

---

# 16. Auth Provider

Create:

```text
src/context/AuthProvider.jsx
```

or combine provider and context inside:

```text
src/context/AuthContext.jsx
```

depending on existing project conventions.

Wrap application routing:

```text
main.jsx
   ↓
AuthProvider
   ↓
App
   ↓
AppRoutes
```

Example concept:

```jsx
<AuthProvider>
  <App />
</AuthProvider>
```

---

# 17. Recommended Authentication Structure

```text
src/
├── api/
│   └── apiClient.js
│
├── context/
│   └── AuthContext.jsx
│
├── hooks/
│   └── useAuth.js
│
├── pages/
│   └── auth/
│       └── LoginPage.jsx
│
├── routes/
│   ├── AppRoutes.jsx
│   └── ProtectedRoute.jsx
│
├── services/
│   └── authService.js
│
└── utils/
    └── tokenStorage.js
```

Do not duplicate authentication logic across multiple pages.

---

# 18. useAuth Hook

Recommended:

```text
src/hooks/useAuth.js
```

Purpose:

```text
Provide an easy and consistent way to access AuthContext.
```

Example concept:

```javascript
const {
  user,
  login,
  logout,
  isAuthenticated
} = useAuth();
```

---

# 19. Access Token Handling

If the backend returns an access token, authentication must centralize its management.

Do not manually read and attach the token separately inside each service.

Bad:

```javascript
const token = localStorage.getItem("token");

axios.get("/users", {
  headers: {
    Authorization: token,
  },
});
```

repeated throughout the project.

Instead:

```text
Token Storage
      ↓
Axios Request Interceptor
      ↓
Protected API Request
```

---

# 20. Token Storage

Create:

```text
src/utils/tokenStorage.js
```

The exact storage strategy must follow the backend security architecture.

If the backend returns an access token for browser storage, centralize storage operations.

Example methods:

```javascript
setAccessToken()
getAccessToken()
removeAccessToken()
```

Do not access:

```javascript
localStorage.getItem(...)
```

from many unrelated components.

---

# 21. Storage Security Rule

Never store:

```text
email password
raw password
backend secret
JWT signing key
RSA private key
Redis password
database credentials
```

in browser storage.

Only authentication information explicitly designed for browser use may be stored.

---

# 22. Remember Me

The Login Screen includes:

```text
Remember me
```

This must NEVER mean:

```text
save username + password
```

or:

```text
save password
```

If the backend supports persistent authentication, use Remember Me according to that API contract.

If not yet supported, the frontend may treat the checkbox as UI state until backend behavior is defined.

Do not invent insecure persistence logic.

---

# 23. Axios Authentication Interceptor

When an access token exists, protected API requests should automatically receive it.

Example architecture:

```text
React Component
      ↓
Service
      ↓
apiClient
      ↓
Request Interceptor
      ↓
Attach Access Token
      ↓
Backend
```

The exact authentication header must match the Spring Boot backend.

Examples of possible contracts include:

```http
Authorization: Bearer <token>
```

or a custom backend-defined header.

Do not assume `Bearer` if the backend uses a different format.

---

# 24. Request Interceptor

Recommended location:

```text
src/api/apiClient.js
```

Concept:

```javascript
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      // Attach token using the exact
      // backend-required header.
    }

    return config;
  }
);
```

Token header configuration must exist in one place.

---

# 25. 401 Unauthorized Handling

If the backend returns:

```http
401 Unauthorized
```

for a protected API:

```text
API response
    ↓
Axios response interceptor
    ↓
Authentication invalid
    ↓
Clear authentication state
    ↓
Redirect to /login
```

The application should not remain on a protected page with an invalid session.

---

# 26. 403 Forbidden Handling

If backend returns:

```http
403 Forbidden
```

this generally means:

```text
User is authenticated
but does not have permission.
```

Do not automatically treat every `403` as logout.

Recommended future handling:

```text
403
 ↓
Show access denied page/message
```

Possible route:

```text
/403
```

Only introduce this page if required by the project.

---

# 27. Protected Route

Create:

```text
src/routes/ProtectedRoute.jsx
```

Purpose:

```text
Prevent unauthenticated access to admin pages.
```

Protected routes include:

```text
/admin/dashboard
/admin/users
/admin/users/create
/admin/users/:id
/admin/users/:id/edit
```

and all future:

```text
/admin/*
```

routes unless explicitly marked public.

---

# 28. Protected Route Logic

Workflow:

```text
User requests protected route
          ↓
Check authentication initialization
          ↓
Still checking?
          │
          ├── YES
          │    ↓
          │  Loading state
          │
          └── NO
               ↓
        Authenticated?
          │
          ├── YES
          │    ↓
          │  Render protected page
          │
          └── NO
               ↓
          Redirect /login
```

---

# 29. ProtectedRoute Example Structure

Concept:

```jsx
function ProtectedRoute({ children }) {
  const {
    isAuthenticated,
    isAuthLoading,
  } = useAuth();

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

Adapt to the project's routing pattern.

---

# 30. App Routes

Recommended:

```text
src/routes/AppRoutes.jsx
```

Conceptual routing:

```jsx
<Routes>

  <Route
    path="/login"
    element={<LoginPage />}
  />

  <Route
    path="/admin"
    element={
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    }
  >
    <Route
      path="dashboard"
      element={<DashboardPage />}
    />
  </Route>

</Routes>
```

Do not duplicate `ProtectedRoute` unnecessarily for every child if the parent admin layout can protect the entire admin route tree.

---

# 31. Admin Route Protection

Recommended architecture:

```text
/admin
   ↓
ProtectedRoute
   ↓
AdminLayout
   ↓
Outlet
   ├── dashboard
   ├── users
   ├── ...
```

This ensures future admin modules automatically require authentication.

---

# 32. Successful Login Redirect

On successful authentication:

```javascript
navigate("/admin/dashboard", {
  replace: true,
});
```

Using:

```text
replace: true
```

is recommended so the Login page does not remain unnecessarily in browser history after successful authentication.

---

# 33. Login Success Workflow

Complete workflow:

```text
POST login API
     ↓
200 / successful response
     ↓
Read access token/session
     ↓
Read authenticated user
     ↓
Persist permitted auth information
     ↓
Set AuthContext
     ↓
isAuthenticated = true
     ↓
navigate("/admin/dashboard")
```

---

# 34. Prevent Login Page for Authenticated User

If the user is already authenticated and navigates to:

```text
/login
```

redirect to:

```text
/admin/dashboard
```

Workflow:

```text
/login
   ↓
Check authentication
   ↓
Already authenticated?
   │
   ├── YES
   │    ↓
   │  /admin/dashboard
   │
   └── NO
        ↓
      LoginPage
```

---

# 35. Authentication Initialization

When the application starts or refreshes:

```text
App starts
    ↓
AuthProvider initializes
    ↓
Check existing authentication information
    ↓
Determine authentication state
    ↓
isAuthLoading = false
```

During initialization, do not immediately redirect before the authentication check finishes.

Otherwise refresh may cause:

```text
protected page
    ↓
temporary /login redirect
    ↓
dashboard
```

which creates visual flickering.

---

# 36. Authentication Loading State

Use:

```text
isAuthLoading
```

to distinguish:

```text
Authentication has not yet been checked.
```

from:

```text
User is not authenticated.
```

These are not the same state.

Initial:

```javascript
isAuthLoading = true
```

After initialization:

```javascript
isAuthLoading = false
```

---

# 37. Login Loading State

While login API is processing:

```text
Sign In
```

changes to:

```text
Signing in...
```

Button must be disabled.

Example:

```jsx
<button
  type="submit"
  disabled={isLoading}
>
  {isLoading ? "Signing in..." : "Sign In"}
</button>
```

Do not allow multiple login requests from repeated clicks.

---

# 38. Invalid Credentials

If the backend rejects credentials:

Possible message:

```text
Invalid email or password.
```

Use the actual safe backend message if available.

Do not indicate sensitive account information such as:

```text
This email exists but password is incorrect.
```

unless the backend intentionally provides that behavior.

---

# 39. Login API Error Mapping

Handle common states.

## 400

```text
Invalid request / validation error
```

Show safe validation information.

## 401

```text
Invalid credentials
```

Show login failure.

## 403

```text
Account not permitted / access denied
```

Display the safe backend-provided message.

## 429

```text
Too many attempts
```

If backend supports rate limiting, show:

```text
Too many login attempts. Please try again later.
```

## 500

```text
Server error
```

Display:

```text
Unable to sign in right now. Please try again.
```

Do not expose backend exception information.

---

# 40. Network Failure

If the backend cannot be reached:

```text
Unable to connect to the server. Please try again.
```

Do not show technical implementation details such as:

```text
AxiosError
ECONNREFUSED
ERR_NETWORK
```

to end users.

---

# 41. Logout

Authentication module must provide:

```javascript
logout()
```

Logout behavior:

```text
User selects Logout
      ↓
Call backend logout endpoint if required
      ↓
Clear local authentication information
      ↓
Clear AuthContext
      ↓
Redirect /login
```

---

# 42. Logout Endpoint

The exact backend logout endpoint must follow the backend authentication specification.

Possible example:

```http
POST /api/v1/admin/auth/logout
```

Do not implement this URL unless confirmed by the backend API.

If logout is server-managed through Redis/session invalidation, the frontend must call the backend logout endpoint.

---

# 43. Logout Redirect

After logout:

```javascript
navigate("/login", {
  replace: true,
});
```

After logout, protected routes must immediately become inaccessible.

---

# 44. Redis Relationship

Redis belongs to the backend.

Frontend architecture:

```text
React
   ↓
Spring Boot Authentication API
   ↓
Redis
```

React must never:

```text
connect directly to Redis
know Redis password
read Redis keys
write Redis values
```

Redis session/cache behavior remains backend responsibility.

---

# 45. User Information

If login response returns authenticated administrator data, AuthContext may contain:

```javascript
user = {
  id,
  employeeId,
  email,
  role
}
```

Use only fields actually returned by the backend.

Do not fabricate missing account information.

---

# 46. Role Handling

If the authenticated user has a role, save it as part of authentication state if needed.

Example:

```text
ADMIN
SUPER_ADMIN
```

The exact roles must follow the backend.

Frontend role checks improve UI behavior but are not security enforcement.

Backend must always enforce authorization.

---

# 47. Frontend Authorization Rule

Never rely only on frontend route protection for security.

Example:

```text
Hide "User Management"
```

does not make the API secure.

The backend must validate:

```text
token
user
role
permission
```

for protected endpoints.

---

# 48. Dashboard Requirement

After successful login, the Dashboard page must exist at:

```text
/admin/dashboard
```

If full Dashboard development has not started yet, create a temporary minimal page so authentication redirect can be verified.

Example:

```text
Dashboard

Welcome to Smart AI Admin Web
```

Do not implement the complete Dashboard UI until its own specification is available.

---

# 49. Dashboard Page Component

Recommended:

```text
src/pages/dashboard/DashboardPage.jsx
```

Route:

```text
/admin/dashboard
```

This component must render inside:

```text
AdminLayout
```

after that layout module is implemented.

---

# 50. Route Flow

Expected routing:

```text
/
│
├── /login
│      ↓
│   LoginPage
│
└── /admin
       ↓
   ProtectedRoute
       ↓
   AdminLayout
       ↓
   /admin/dashboard
       ↓
   DashboardPage
```

---

# 51. Root Route

Recommended root behavior:

```text
/
```

should determine authentication status.

If authenticated:

```text
/admin/dashboard
```

If unauthenticated:

```text
/login
```

Example:

```text
/
 ↓
Authenticated?
 ├── YES → /admin/dashboard
 └── NO  → /login
```

---

# 52. Browser Refresh

Refreshing:

```text
/admin/dashboard
```

must:

```text
NOT show 404
NOT automatically lose valid authentication
NOT immediately redirect before auth initialization finishes
```

Docker/Nginx SPA fallback must already be configured through:

```text
spec-md/01-docker-set-up.md
```

---

# 53. API Authentication Failure

For protected APIs:

```text
GET /api/v1/admin/...
```

if token/session expires:

```text
Backend returns 401
        ↓
Response interceptor
        ↓
Clear authentication
        ↓
Redirect /login
```

The frontend must not continue using an expired token.

---

# 54. Response Interceptor

Recommended:

```javascript
apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      // Clear authentication.
      // Redirect to login if appropriate.
    }

    return Promise.reject(error);
  }
);
```

Avoid creating circular imports between:

```text
apiClient
AuthContext
router
```

Design the redirect mechanism carefully.

---

# 55. Token Expiration

If the backend returns token expiry information, the frontend may use it for session management.

The backend remains the authoritative source.

Never manually modify JWT expiration or generate tokens in React.

---

# 56. Refresh Token

If backend authentication later supports:

```text
refresh token
```

create a separate specification for token refreshing.

Do not invent a refresh-token implementation unless the backend already supports one.

---

# 57. Password Security

The frontend must never:

```text
log passwords
store passwords
send passwords through query parameters
put passwords inside URLs
persist passwords in browser storage
```

Credentials should only be transmitted in the secure login API request body.

---

# 58. Console Logging

Remove authentication debugging such as:

```javascript
console.log(password);
console.log(accessToken);
console.log(loginResponse);
```

before production.

Do not expose access tokens unnecessarily through console output.

---

# 59. Environment Variables

Frontend environment configuration may contain:

```env
VITE_API_BASE_URL=/api/v1/admin
```

Do not place:

```env
JWT_SECRET=
PRIVATE_KEY=
DATABASE_PASSWORD=
REDIS_PASSWORD=
SUPER_ADMIN_PASSWORD=
```

inside frontend environment variables.

Vite environment variables are browser-visible after build.

---

# 60. Authentication Files

Expected project files after implementation:

```text
src/
├── api/
│   └── apiClient.js
│
├── context/
│   └── AuthContext.jsx
│
├── hooks/
│   └── useAuth.js
│
├── pages/
│   ├── auth/
│   │   └── LoginPage.jsx
│   │
│   └── dashboard/
│       └── DashboardPage.jsx
│
├── routes/
│   ├── AppRoutes.jsx
│   └── ProtectedRoute.jsx
│
├── services/
│   └── authService.js
│
└── utils/
    └── tokenStorage.js
```

Only create files actually required by the current project architecture.

---

# 61. Implementation Order

Implement authentication in this order:

```text
1. Check backend login API
       ↓
2. Create API client
       ↓
3. Create authService
       ↓
4. Create token/session helper
       ↓
5. Create AuthContext
       ↓
6. Create useAuth
       ↓
7. Connect LoginPage
       ↓
8. Create ProtectedRoute
       ↓
9. Configure /login
       ↓
10. Configure /admin/dashboard
       ↓
11. Redirect after successful login
       ↓
12. Restore authentication after refresh
       ↓
13. Handle 401
       ↓
14. Implement logout
       ↓
15. Test complete flow
```

---

# 62. Complete Login Flow

Expected final behavior:

```text
Open application
      ↓
Not authenticated
      ↓
/login
      ↓
Enter credentials
      ↓
POST /api/v1/admin/auth/login
      ↓
Authentication successful
      ↓
Save allowed session/token information
      ↓
AuthContext updated
      ↓
/admin/dashboard
      ↓
ProtectedRoute allows access
```

---

# 63. Failed Login Flow

```text
/login
   ↓
Enter wrong credentials
   ↓
POST login
   ↓
Backend rejects request
   ↓
Remain on /login
   ↓
Display safe error message
```

The user must not be redirected to Dashboard after failed authentication.

---

# 64. Unauthorized Dashboard Flow

```text
User manually enters:
/admin/dashboard
        ↓
ProtectedRoute
        ↓
Authenticated?
        ↓
NO
        ↓
/login
```

---

# 65. Authenticated Login Route Flow

```text
Authenticated user
      ↓
opens /login
      ↓
redirect
      ↓
/admin/dashboard
```

---

# 66. Logout Flow

```text
/admin/dashboard
      ↓
Logout
      ↓
Invalidate backend session/token if required
      ↓
Clear frontend auth state
      ↓
/login
```

---

# 67. Testing Requirements

Test at minimum:

```text
Valid email + valid password
Invalid email
Empty email
Empty password
Incorrect password
Backend unavailable
Backend 401
Successful redirect
Direct dashboard access without login
Dashboard refresh after login
Logout
Access dashboard after logout
Login route while already authenticated
```

---

# 68. Manual Test Case - Successful Login

### Given

```text
Administrator is on /login.
```

### When

```text
Valid email and password are entered.
Sign In is clicked.
```

### Then

```text
Login API is called.
Authentication succeeds.
Authentication state is stored.
User is redirected to /admin/dashboard.
Dashboard renders.
```

---

# 69. Manual Test Case - Invalid Login

### Given

```text
Administrator is on /login.
```

### When

```text
Incorrect credentials are submitted.
```

### Then

```text
User stays on /login.
Error message appears.
Password is not logged.
Dashboard is not accessible.
```

---

# 70. Manual Test Case - Protected Route

### Given

```text
User is not logged in.
```

### When

User opens:

```text
/admin/dashboard
```

### Then

User is redirected to:

```text
/login
```

---

# 71. Manual Test Case - Existing Authentication

### Given

```text
Administrator has valid authentication.
```

### When

Administrator refreshes:

```text
/admin/dashboard
```

### Then

```text
Authentication state is restored.
Dashboard remains accessible.
User is not incorrectly redirected to login.
```

---

# 72. Manual Test Case - Logout

### Given

```text
Administrator is logged in.
```

### When

```text
Logout is selected.
```

### Then

```text
Authentication information is cleared.
User is redirected to /login.
Protected pages become inaccessible.
```

---

# 73. Do Not Implement

Do not add the following unless another specification requires them:

```text
Google authentication
Facebook authentication
Microsoft authentication
student authentication
self-registration
public registration
OTP login
biometric authentication
magic links
refresh token logic without backend support
password reset implementation
multi-factor authentication
```

This specification covers the existing Admin Web authentication flow.

---

# 74. Implementation Restrictions

Do not:

```text
hardcode access tokens
hardcode admin credentials
hardcode localhost API URLs inside pages
store raw passwords
duplicate API client instances
duplicate token handling code
perform login requests directly from multiple components
allow unauthenticated /admin routes
invent backend request fields
invent response fields
change backend authentication logic
connect React directly to Redis
```

---

# 75. Agent Implementation Prompt

Use this instruction when implementing authentication:

```text
Implement frontend authentication for Smart AI Admin Web.

Follow:
- AGENT.md
- spec-md/04-login-screen.md
- spec-md/05-authentication.md
- backend authentication API contract

Requirements:

1. Use the existing React + Vite + JavaScript + Tailwind project.
2. Connect LoginPage to POST /api/v1/admin/auth/login.
3. Do not invent request or response fields; inspect the backend contract.
4. Create a centralized authService.
5. Create centralized authentication state using AuthContext.
6. Create ProtectedRoute.
7. Protect /admin/*.
8. After successful login redirect to /admin/dashboard.
9. If unauthenticated user opens /admin/dashboard, redirect to /login.
10. If authenticated user opens /login, redirect to /admin/dashboard.
11. Restore valid authentication after browser refresh.
12. Attach the access token/session information using the exact backend-required header.
13. Handle 401 responses centrally.
14. Do not store passwords.
15. Do not expose backend secrets.
16. Implement logout according to the backend contract.
17. Reuse existing project files and components where possible.
18. Do not modify unrelated features.
```

---

# 76. Acceptance Criteria

Authentication implementation is complete when:

- `/login` is public.
- Login form validates email.
- Login form validates password.
- Login calls the backend authentication endpoint.
- Login button displays loading state.
- Duplicate login submissions are prevented.
- Invalid credentials display an error.
- Network failures display a safe error.
- Authentication response is processed according to the backend contract.
- Access token/session handling is centralized.
- Raw passwords are never persisted.
- AuthContext manages authenticated state.
- `useAuth()` is available.
- `/admin/*` routes are protected.
- `/admin/dashboard` requires authentication.
- Successful login redirects to `/admin/dashboard`.
- Unauthenticated dashboard access redirects to `/login`.
- Authenticated access to `/login` redirects to `/admin/dashboard`.
- Valid authentication survives browser refresh when supported by the backend architecture.
- Expired/invalid authentication is handled.
- `401` is handled centrally.
- Logout clears frontend authentication state.
- Logout redirects to `/login`.
- Dashboard cannot be accessed after logout.
- Authentication API requests use the centralized API client.
- Backend secrets are not exposed.
- Redis is never accessed directly from React.
- No unrelated functionality is changed.

---

# 77. Final Authentication Architecture

```text
                    React App
                        |
                        v
                  React Router
                        |
            +-----------+-----------+
            |                       |
            v                       v
         /login                  /admin/*
            |                       |
            |                 ProtectedRoute
            |                       |
            v                       v
       LoginPage                 AdminLayout
            |                       |
            v                       v
       AuthContext              Dashboard
            |
            v
       authService
            |
            v
        apiClient
            |
            v
POST /api/v1/admin/auth/login
            |
            v
      Spring Boot Backend
            |
            v
 Authentication / Redis
```

Successful authentication:

```text
/login
   ↓
Login Successful
   ↓
AuthContext
   ↓
/admin/dashboard
```

Unauthenticated protected access:

```text
/admin/dashboard
       ↓
ProtectedRoute
       ↓
Not Authenticated
       ↓
/login
```