# 04 - Login Screen

## 1. Module Information

### Module Name

```text
Login Screen
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

### Route

```text
/login
```

### Page Component

```text
src/pages/auth/LoginPage.jsx
```

---

# 2. Purpose

The Login Screen provides secure access to the administration web application.

Only authorized university administrative staff should use this interface.

The screen must:

- allow an administrator to enter email
- allow an administrator to enter password
- allow password visibility toggle
- provide Remember Me option
- provide Forgot Password action
- submit login credentials
- display loading state
- display validation errors
- display backend authentication errors
- redirect authenticated users to the admin dashboard
- visually match the Figma design

---

# 3. Required Specifications

Before implementation, the agent must read:

```text
AGENT.md
spec-md/01-docker-set-up.md
spec-md/02-project-structure.md
spec-md/03-mcp-set-up.md
spec-md/04-login-screen.md
```

If a separate authentication API specification exists, it must also be read before implementing API integration.

---

# 4. Figma Design

## Figma File

```text
Smart AI Admin Web
```

## File Key

```text
FQhq9uVri66RJpADxECMtm
```

## User Provided Figma Node

```text
1:10
```

URL:

```text
https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=1-10&m=dev
```

Node `1:10` represents the subtle background overlay layer.

## Complete Login Screen Node

```text
1:3
```

Use node `1:3` when retrieving the complete Login Screen implementation context.

The agent must use the project's Figma MCP integration to inspect the design before implementing this page.

---

# 5. Figma Design Hierarchy

The Login Screen follows approximately this hierarchy:

```text
Login Screen
│
├── Background
│   ├── Light Gray Page Background
│   ├── Top Left Decorative Glow
│   ├── Bottom Right Decorative Glow
│   └── Background Overlay - Node 1:10
│
└── Login Content
    │
    ├── University Branding
    │   ├── Rangsit University Logo
    │   └── Rangsit University Badge
    │
    ├── Page Heading
    │   ├── SMART AI University Student Assistant
    │   └── Login Description
    │
    ├── Login Card
    │   ├── Email Input
    │   ├── Password Input
    │   ├── Remember Me
    │   ├── Forgot Password
    │   ├── Sign In Button
    │   ├── Secure Access Divider
    │   └── Security Indicators
    │
    ├── Staff Only Notice
    │
    └── Footer
```

---

# 6. Page Background

Main background color from Figma:

```text
#F7F8FC
```

Recommended Tailwind:

```jsx
bg-[#F7F8FC]
```

The page must occupy the full viewport.

Recommended structure:

```jsx
min-h-screen
w-full
overflow-hidden
relative
```

The content should be centered horizontally.

Do not reproduce the fixed Figma artboard dimensions directly as a fixed browser page.

Figma dimensions are design reference dimensions.

The implementation must remain responsive.

---

# 7. Background Decorative Elements

The Figma design contains decorative background glows.

## Top Left Glow

Approximate Figma design:

```text
Position:
top-left outside viewport/content boundary

Size:
~496px × 496px

Primary Color:
#01A2E5

Effect:
Radial gradient fading to transparent

Opacity:
Very low/subtle
```

This element is decorative only.

It must:

```text
pointer-events-none
aria-hidden
```

---

## Bottom Right Glow

Approximate design:

```text
Size:
~415px × 415px

Color:
#273238

Effect:
Radial gradient fading to transparent

Opacity:
Very subtle
```

It should partially extend beyond the page boundary.

---

# 8. Background Overlay - Figma Node 1:10

The Figma link supplied for this feature points directly to:

```text
Node ID:
1:10

Name:
Container
```

This node is a full-page background overlay.

Figma reference:

```text
Width:
1823px

Height:
1165px

Opacity:
~2%
```

The layer contains subtle gradient treatment based on:

```text
#273238
```

Do not make this overlay visually strong.

It should remain almost invisible and only provide subtle depth.

Implementation may use an absolutely positioned decorative layer.

Example concept:

```jsx
<div
  className="
    pointer-events-none
    absolute
    inset-0
    opacity-[0.02]
  "
/>
```

Do not create this as an interactive component.

---

# 9. Main Login Container

Figma desktop content width:

```text
440px
```

Recommended implementation:

```jsx
w-full
max-w-[440px]
```

The container should be:

```text
centered horizontally
responsive vertically
above decorative background layers
```

Recommended page container:

```jsx
relative
z-10
mx-auto
w-full
max-w-[440px]
```

On small screens provide page padding:

```jsx
px-4
sm:px-6
```

---

# 10. University Logo Section

The page displays the official Rangsit University logo.

Do not recreate the university logo using HTML or CSS.

Store the exported design asset under:

```text
src/assets/logos/
```

Recommended:

```text
src/assets/logos/rangsit-university-logo.png
```

or:

```text
src/assets/logos/rangsit-university-logo.svg
```

depending on the exported asset format.

The Figma logo area is approximately:

```text
184.7px × 72px
```

The enclosing logo card uses:

```text
Background:
#FFFFFF

Border:
#E5E8F0

Border Radius:
16px

Horizontal Padding:
16px

Vertical Padding:
12px
```

Approximate shadow:

```text
0px 4px 8px rgba(39, 50, 56, 0.08)
```

---

# 11. University Badge

Below the logo is a badge containing:

```text
RANGSIT UNIVERSITY
```

Design:

```text
Background:
#273238

Text:
#FFFFFF

Border Radius:
Fully rounded

Horizontal Padding:
16px

Vertical Padding:
6px
```

A small white circular indicator appears before the text.

Indicator:

```text
6px × 6px
white
~80% opacity
```

Text:

```text
Font:
Plus Jakarta Sans

Weight:
700 / Bold

Size:
11px

Letter Spacing:
2.2px

Transform:
Uppercase
```

---

# 12. Main Heading

Heading content:

```text
SMART AI University Student Assistant
```

Figma typography:

```text
Font Family:
Plus Jakarta Sans

Weight:
Extra Bold / 800

Size:
~25.6px

Line Height:
~38.4px

Color:
#17213C

Alignment:
Center

Letter Spacing:
~ -0.64px
```

Recommended responsive implementation:

```jsx
text-center
font-extrabold
text-[#17213C]
```

Do not force the heading onto one line on small screens.

---

# 13. Description

Content:

```text
Sign in to manage university services
and administrative workflows.
```

Typography:

```text
Font:
Inter

Weight:
400

Size:
14px

Color:
#68728A

Line Height:
~22.75px

Alignment:
Center
```

Desktop design uses two lines.

Allow natural responsive wrapping.

---

# 14. Login Card

The login form is inside a white card.

Figma:

```text
Width:
440px

Background:
#FFFFFF

Border Radius:
24px

Padding:
32px
```

Approximate shadow:

```text
0px 4px 12px rgba(15, 39, 76, 0.08)
```

Recommended:

```jsx
w-full
rounded-[24px]
bg-white
p-8
shadow-[0_4px_12px_rgba(15,39,76,0.08)]
```

For smaller mobile screens padding may reduce slightly.

Example:

```jsx
p-6 sm:p-8
```

---

# 15. Login Form

Recommended component:

```text
src/components/auth/LoginForm.jsx
```

The form contains:

```text
Email
Password
Remember Me
Forgot Password
Sign In
```

Use a real:

```jsx
<form>
```

element.

Submit using:

```jsx
onSubmit
```

Do not perform authentication using a normal button `onClick` only.

---

# 16. Email Input

Placeholder:

```text
Email Address
```

Use:

```html
type="email"
```

Figma dimensions:

```text
Height:
~56px

Width:
100%

Border Radius:
16px
```

Colors:

```text
Background:
#FFFFFF

Border:
#E5E8F0

Placeholder:
#9CA3AF
```

Typography:

```text
Inter
Medium
14px
```

The input contains an email icon on the left.

Approximate icon size:

```text
18px × 18px
```

Recommended component:

```text
src/components/ui/Input.jsx
```

if a shared Input component already exists.

---

# 17. Email Validation

Validate email before submitting.

Required conditions:

```text
Email must not be empty.
Email must have a valid email format.
```

Example user messages:

```text
Email address is required.

Please enter a valid email address.
```

Do not depend only on HTML browser validation.

The backend remains the final validation authority.

---

# 18. Password Input

Placeholder:

```text
Password
```

Use:

```html
type="password"
```

unless password visibility is enabled.

Figma styling matches the email input:

```text
Height:
~56px

Border:
#E5E8F0

Border Radius:
16px

Placeholder:
#9CA3AF
```

The field contains:

```text
lock/password icon on left
visibility toggle icon on right
```

Icon size:

```text
18px × 18px
```

---

# 19. Password Visibility Toggle

Provide a button inside the password input.

Default:

```text
Password hidden
```

When selected:

```text
Password visible
```

Implementation state:

```javascript
const [showPassword, setShowPassword] = useState(false);
```

Input:

```jsx
type={showPassword ? "text" : "password"}
```

The toggle must use:

```html
type="button"
```

so it does not submit the login form.

Accessibility:

```text
Show password

Hide password
```

must be available through an aria-label.

---

# 20. Password Validation

At minimum:

```text
Password must not be empty.
```

Display:

```text
Password is required.
```

Additional validation rules must come from the backend authentication specification.

Do not invent password policy requirements inside the Login Screen.

---

# 21. Input Focus State

The visual focus state must remain consistent with the application design.

Recommended behavior:

```text
Border changes to primary dark color.

Optional subtle focus ring.
```

Use:

```text
#273238
```

as the dark UI accent where appropriate.

Do not use the browser's uncontrolled default blue outline without styling.

Keep accessible focus indication.

---

# 22. Remember Me

The design contains:

```text
Remember me
```

with a custom checkbox.

Figma checkbox:

```text
18px × 18px

Background:
White

Border:
2px solid #E5E8F0

Border Radius:
5px
```

Label:

```text
Font:
Inter

Weight:
400

Size:
~13.5px

Color:
#68728A
```

Use a real:

```html
<input type="checkbox">
```

even if visually styled.

---

# 23. Remember Me Behavior

Remember Me must not independently store the user's raw password.

Never save:

```text
plain text password
```

to:

```text
localStorage
sessionStorage
cookies
```

Authentication persistence must follow the backend authentication specification.

The checkbox may control the intended persistence behavior if supported by the authentication API.

---

# 24. Forgot Password

Text:

```text
Forgot password?
```

Figma style:

```text
Font:
Inter

Weight:
600

Size:
~13.5px

Color:
#273238
```

Place on the right side of the Remember Me row.

Recommended future route:

```text
/forgot-password
```

If Forgot Password has not yet been implemented, do not invent the complete workflow.

The implementation may leave the route integration pending according to the relevant specification.

---

# 25. Sign In Button

Button text:

```text
Sign In
```

The button spans the full available form width.

Figma:

```text
Width:
100%

Height:
~54.5px

Border Radius:
16px
```

Gradient:

```text
#273238
to
#1A2329
```

Text:

```text
Color:
#FFFFFF

Font:
Plus Jakarta Sans

Weight:
600

Size:
15px
```

The button contains a right-facing login/arrow icon.

Approximate icon:

```text
16px × 16px
```

Approximate shadow:

```text
0px 8px 24px rgba(24, 42, 90, 0.32)
```

Recommended Tailwind concept:

```jsx
bg-gradient-to-br
from-[#273238]
to-[#1A2329]
rounded-[16px]
text-white
```

---

# 26. Sign In Button States

Implement:

```text
Default
Hover
Focus
Loading
Disabled
```

Loading example:

```text
Signing in...
```

During login:

```text
disable button
prevent duplicate submission
```

Optional loading spinner may appear.

Do not change layout size when entering loading state.

---

# 27. Secure Access Divider

Below the form is:

```text
SECURE ACCESS
```

with horizontal lines on both sides.

Text:

```text
Font:
Inter

Weight:
600

Size:
~10.5px

Color:
#D1D5DB

Letter Spacing:
~1.05px
```

Divider:

```text
#E5E8F0
1px
```

Layout:

```text
line
SECURE ACCESS
line
```

---

# 28. Security Indicators

Three small status items appear below the divider.

### Indicator 1

```text
256-bit SSL
```

Dot:

```text
#273238
```

### Indicator 2

```text
Admin Only
```

Dot:

```text
#22C55E
```

### Indicator 3

```text
Verified
```

Dot:

```text
#D80255
```

Dot size:

```text
6px × 6px
```

Text:

```text
Font:
Inter

Size:
12px

Weight:
400

Color:
#9CA3AF
```

These elements are informational and not clickable.

---

# 29. Staff Only Notice

Below the Login Card is a warning/information banner.

Content:

```text
Staff only. Students — use the SMART AI mobile app.
```

Container:

```text
Background:
#FFFBEB

Border:
#FDE68A

Border Radius:
16px

Horizontal Padding:
16px

Vertical Padding:
12px
```

Text:

```text
Color:
#92400E
```

Typography approximately:

```text
12.5px
```

Important emphasis:

```text
Staff only.
```

uses semi-bold weight.

```text
SMART AI mobile app
```

uses medium weight.

Include the icon from the Figma asset rather than drawing a replacement unless an existing project icon is visually identical.

---

# 30. Footer

Footer text:

```text
© 2026 Rangsit University · All rights reserved · IT Support
```

Typography:

```text
Font:
Inter

Weight:
400

Size:
12px

Color:
#9CA3AF
```

`IT Support` uses:

```text
#273238
```

and may be interactive if an IT support route/contact is later specified.

Do not invent a destination without a specification.

---

# 31. Fonts

The Figma screen uses:

```text
Plus Jakarta Sans
Inter
```

Use these font families in the frontend.

Recommended:

```text
Plus Jakarta Sans:
headings
branding
primary action button

Inter:
form
description
supporting content
```

The fonts should be configured globally rather than imported independently by every component.

---

# 32. Primary Design Colors

Use the following Figma colors:

```text
Page Background:
#F7F8FC

Primary Dark:
#273238

Primary Dark Gradient End:
#1A2329

Heading:
#17213C

Secondary Text:
#68728A

Placeholder:
#9CA3AF

Light Text:
#D1D5DB

Border:
#E5E8F0

Card:
#FFFFFF

Success:
#22C55E

Verified Accent:
#D80255

Warning Background:
#FFFBEB

Warning Border:
#FDE68A

Warning Text:
#92400E

Decorative Blue:
#01A2E5
```

If project design tokens already exist, map these values into the project's token system rather than duplicating raw hex values everywhere.

---

# 33. Suggested Component Structure

Recommended:

```text
src/
├── pages/
│   └── auth/
│       └── LoginPage.jsx
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── LoginBranding.jsx
│   │   ├── SecurityIndicators.jsx
│   │   └── StaffOnlyNotice.jsx
│   │
│   └── ui/
│       ├── Input.jsx
│       ├── Checkbox.jsx
│       └── Button.jsx
│
├── services/
│   └── authService.js
│
├── hooks/
│
├── assets/
│   ├── icons/
│   └── logos/
│
└── pages/
```

Do not create duplicate shared UI components if equivalent components already exist.

---

# 34. Component Responsibility

## LoginPage

Responsible for:

```text
page layout
background decorations
branding
LoginForm composition
staff notice
footer
```

## LoginForm

Responsible for:

```text
email
password
remember me
forgot password
form validation
form submission
loading
form errors
```

## authService

Responsible for:

```text
backend login request
```

The page must not contain large Axios request implementations directly.

---

# 35. Authentication API

Admin authentication API base path:

```text
/api/v1/admin
```

Login endpoint should follow the backend authentication specification.

Expected project path:

```text
POST /api/v1/admin/auth/login
```

Before implementing the actual API request, inspect the backend authentication specification to verify:

```text
request field names
response structure
access token field
refresh token field if applicable
error response format
remember-me behavior
```

Do not invent missing backend contract fields.

---

# 36. API Service

Recommended:

```text
src/services/authService.js
```

Concept:

```javascript
export const login = async (credentials) => {
  return apiClient.post("/auth/login", credentials);
};
```

The application's centralized Axios instance must already provide:

```text
/api/v1/admin
```

as its base URL according to the project configuration.

---

# 37. Login Request

Frontend form contains:

```text
email
password
rememberMe
```

However, the actual backend request payload must use the exact backend contract.

For example, only if the backend specification confirms it:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Do not automatically send `rememberMe` unless the backend API supports it.

---

# 38. Successful Login

After successful authentication:

```text
1. Read authentication response.
2. Store authentication information according to auth specification.
3. Update authentication state.
4. Redirect to admin dashboard.
```

Target route:

```text
/admin/dashboard
```

Use React Router navigation.

Example concept:

```javascript
navigate("/admin/dashboard");
```

---

# 39. Failed Login

If credentials are invalid, show a visible message inside the Login Card.

Possible UI message:

```text
Invalid email or password.
```

Use the backend message if it is safe and appropriate.

Do not expose:

```text
stack traces
database errors
internal exception names
security implementation details
```

---

# 40. Authentication Error State

Recommended error area:

```text
inside Login Card
above inputs
```

or another location consistent with the design without disrupting the card layout.

Use accessible status semantics.

Example:

```jsx
role="alert"
```

---

# 41. Loading State

When submitting:

```text
isLoading = true
```

The button should display:

```text
Signing in...
```

and be disabled.

Inputs may remain visible.

Do not clear email/password fields simply because the API request started.

---

# 42. Network Error

If backend cannot be reached:

```text
Unable to connect to the server. Please try again.
```

Do not show:

```text
AxiosError
ECONNREFUSED
Java exception
```

to users.

---

# 43. Already Authenticated User

If a valid authenticated user opens:

```text
/login
```

the app should redirect them to:

```text
/admin/dashboard
```

The exact behavior must follow the authentication architecture.

---

# 44. Responsive Behavior

The Figma design is desktop focused.

The frontend must also behave correctly on smaller screens.

### Desktop

```text
Login content centered.

Maximum content width:
440px
```

### Tablet

```text
Maintain centered layout.
Keep card width responsive.
```

### Mobile

```text
Use page horizontal padding.
Card width becomes 100%.
Reduce outer spacing where necessary.
Allow security indicators to wrap if required.
Allow footer to wrap.
```

Do not create horizontal scrolling.

---

# 45. Height Handling

The Figma artboard height is approximately:

```text
1165px
```

Do not use:

```jsx
h-[1165px]
```

as the final application page height.

Use:

```jsx
min-h-screen
```

and appropriate vertical padding.

The page should work on:

```text
small laptop screens
desktop monitors
tablet screens
mobile screens
```

---

# 46. Asset Handling

Figma MCP asset URLs are temporary and must not be used as permanent production URLs.

When implementing:

```text
download/export required Figma assets
store them in src/assets
reference local project assets
```

Required visual assets include:

```text
Rangsit University logo
email icon
password icon
password visibility icon
sign-in arrow icon
staff notice icon
```

If an existing project icon is visually identical, reuse it.

Do not manually redraw Figma icons using custom SVG paths.

---

# 47. Accessibility

The Login Screen must include:

```text
semantic form
proper input types
keyboard navigation
visible focus states
button labels
password toggle aria-label
form error announcements
checkbox label connection
meaningful image alt text where appropriate
```

University logo alt:

```text
Rangsit University
```

Decorative background elements:

```text
aria-hidden="true"
```

---

# 48. Security Requirements

Never store:

```text
raw password
database password
JWT signing secret
private key
Redis password
backend secret
```

inside React.

Do not persist the user's password for Remember Me.

Do not log credentials:

```javascript
console.log(email, password);
```

must never remain in production code.

---

# 49. Implementation Restrictions

Do not:

```text
install another CSS framework
replace Tailwind CSS
install a UI library only for this page
use Bootstrap
use Material UI
copy raw Figma-generated React code directly
use fixed desktop-only absolute positioning for the whole form
hardcode localhost API URLs throughout the component
create duplicate shared components
invent additional login methods
add Google login
add Facebook login
add registration
add student login
add unnecessary animation
```

unless another project specification requires them.

---

# 50. Figma Generated Code Rule

Figma-generated React/Tailwind output is a reference only.

Do not copy patterns such as:

```text
absolute left-[691.5px]
top-[171.95px]
w-[1823px]
h-[1165px]
```

directly for the page layout.

Those values represent the design artboard.

Convert them into responsive React layout using:

```text
flexbox
max-width
min-height
responsive padding
relative positioning
```

Preserve visual appearance without making the implementation dependent on one screen resolution.

---

# 51. Recommended Page Layout

Conceptual implementation:

```text
LoginPage
│
├── BackgroundDecorations
│
└── Main
    │
    └── LoginContainer
        │
        ├── LoginBranding
        ├── Heading
        ├── Description
        ├── LoginForm
        ├── StaffOnlyNotice
        └── Footer
```

Use normal document/flex layout for the central column.

Use absolute positioning only for decorative background elements.

---

# 52. Suggested State

Login form may use:

```javascript
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [rememberMe, setRememberMe] = useState(false);
const [errors, setErrors] = useState({});
const [isLoading, setIsLoading] = useState(false);
const [authError, setAuthError] = useState("");
```

If the project later uses React Hook Form, follow the project's updated form architecture instead.

Do not introduce a form library only for this page unless required.

---

# 53. Implementation Workflow

The coding agent must follow this workflow:

```text
Read AGENT.md
       ↓
Read 04-login-screen.md
       ↓
Inspect existing frontend project
       ↓
Use project Figma MCP
       ↓
Inspect node 1:3
       ↓
Inspect node 1:10 for background overlay
       ↓
Identify existing reusable components
       ↓
Export/save required Figma assets
       ↓
Create responsive LoginPage
       ↓
Create/reuse LoginForm
       ↓
Implement validation
       ↓
Connect authentication service
       ↓
Implement loading/error states
       ↓
Implement successful redirect
       ↓
Run application
       ↓
Compare visually with Figma
       ↓
Fix major differences
       ↓
Validate acceptance criteria
```

---

# 54. Agent Implementation Prompt

When implementing this module, follow:

```text
Implement the Smart AI Admin Web Login Screen.

Read and follow:
- AGENT.md
- spec-md/04-login-screen.md
- authentication API specification if available

Figma:
File Key: FQhq9uVri66RJpADxECMtm
Complete Login Screen Node: 1:3
Background Overlay Node: 1:10

Technology:
- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Axios

Use the project's local Figma MCP server to inspect the design before coding.

Do not copy the Figma-generated absolute desktop layout directly.

Convert the design into a responsive React layout.

Reuse existing shared components before creating new ones.

Keep API logic inside the service layer.

Match the Figma design closely.

Do not modify unrelated features.
```

---

# 55. Acceptance Criteria

The feature is complete when:

- `/login` renders successfully.
- The Login Screen visually matches Figma node `1:3`.
- Background treatment includes the subtle node `1:10` overlay.
- Page background matches `#F7F8FC`.
- Rangsit University logo displays correctly.
- University badge displays correctly.
- Heading displays correctly.
- Description displays correctly.
- Login Card is responsive.
- Email input matches the Figma style.
- Password input matches the Figma style.
- Password visibility toggle works.
- Remember Me checkbox works.
- Forgot Password text is displayed.
- Sign In button matches the Figma design.
- Loading state prevents duplicate submissions.
- Validation errors display correctly.
- API authentication errors display correctly.
- Successful authentication redirects to `/admin/dashboard`.
- Secure Access divider is displayed.
- All three security indicators are displayed.
- Staff Only notice matches the Figma design.
- Footer matches the Figma design.
- No horizontal scrolling occurs.
- Mobile layout remains usable.
- Figma temporary asset URLs are not used as permanent production dependencies.
- No raw passwords are stored.
- No credentials are logged.
- No backend secrets exist in frontend code.
- Existing shared components are reused where appropriate.
- The page uses React and Tailwind CSS.
- No unrelated feature is modified.

---

# 56. Final Design Reference

```text
Figma File:
Smart AI Admin Web

File Key:
FQhq9uVri66RJpADxECMtm

Full Login Screen:
1:3

Background Overlay:
1:10
```

The implementation must use the complete Login Screen node `1:3` as the main visual reference while preserving node `1:10` as part of its background treatment.