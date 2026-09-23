# 03 - MCP Setup

## 1. Purpose

This specification defines the **Model Context Protocol (MCP)** setup for the frontend development workflow of:

**Smart AI University Student Assistant – Admin Web**

MCP will allow the coding agent to access the project's Figma design and use it as the primary UI design reference when implementing React pages and components.

The main MCP integration for this project is:

```text
Figma MCP
```

The agent must use the Figma design as the source of truth for:

- layouts
- page structure
- spacing
- colors
- typography
- buttons
- forms
- tables
- cards
- navigation
- component appearance
- responsive behavior where defined
- UI hierarchy

---

# 2. Figma Design Source

The official frontend Figma file is:

```text
https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=0-1&t=oByqTBMKiRUGIB3Z-1
```

Project:

```text
Smart AI Admin Web
```

Figma file key:

```text
FQhq9uVri66RJpADxECMtm
```

Root node:

```text
0:1
```

Verified login screen node:

```text
1:3
```

Verified login screen name:

```text
Login Screen
```

---

# 3. Figma Role in Frontend Development

Figma is the visual source of truth.

The frontend technology stack remains:

```text
React.js
Vite
JavaScript
Tailwind CSS
React Router
Axios
```

Figma must NOT generate a separate technology stack.

When implementing a page:

```text
Figma Design
      ↓
Read design context
      ↓
Check spec-md
      ↓
Check existing React components
      ↓
Implement React component
      ↓
Use Tailwind CSS
      ↓
Connect backend API
      ↓
Compare implementation with Figma
```

---

# 4. Source of Truth Priority

When implementing frontend features, follow this priority:

```text
1. AGENT.md
       ↓
2. Relevant spec-md file
       ↓
3. Figma design
       ↓
4. Existing project code
       ↓
5. Backend API contract
```

Each source has a different responsibility.

### AGENT.md

Defines:

- project-wide coding rules
- development workflow
- architecture
- naming conventions
- general implementation standards

### spec-md

Defines:

- feature behavior
- routes
- API contract
- validation
- permissions
- states
- acceptance criteria

### Figma

Defines:

- UI appearance
- page layout
- component positioning
- spacing
- visual hierarchy
- colors
- fonts
- visual states

### Backend

Defines:

- API endpoint
- request format
- response format
- authentication requirements
- validation rules
- backend business behavior

---

# 5. MCP Server

Use the official remote Figma MCP server.

MCP URL:

```text
https://mcp.figma.com/mcp
```

Prefer the remote MCP server instead of the local desktop server.

Architecture:

```text
Coding Agent
     |
     v
MCP Client
     |
     v
Figma Remote MCP
https://mcp.figma.com/mcp
     |
     v
Smart AI Admin Web Figma File
```

---

# 6. MCP Configuration Directory

For VS Code workspace configuration, create:

```text
.vscode/
└── mcp.json
```

Project example:

```text
smart-ai-admin-web/
├── AGENT.md
├── spec-md/
│   ├── 01-docker-set-up.md
│   ├── 02-project-structure.md
│   └── 03-mcp-set-up.md
│
├── .vscode/
│   └── mcp.json
│
├── src/
├── package.json
├── vite.config.js
└── opencode.jsonc
```

---

# 7. VS Code mcp.json

Create:

```text
.vscode/mcp.json
```

Use:

```json
{
  "inputs": [],
  "servers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

Do not add:

```text
Figma access token
API secret
password
private key
```

directly to this configuration.

Authentication should be completed using Figma's OAuth flow.

---

# 8. VS Code Figma MCP Authentication

After creating:

```text
.vscode/mcp.json
```

open VS Code.

On macOS:

```text
Command + Shift + P
```

Search:

```text
MCP: Open Workspace Folder Configuration
```

or open:

```text
.vscode/mcp.json
```

Start the Figma MCP server.

VS Code should display a:

```text
Start
```

option for the Figma server.

Select it.

A browser authentication page should open.

Sign in with the Figma account that has access to:

```text
Smart AI Admin Web
```

Approve the requested access.

After successful authentication, Figma MCP should show as connected.

---

# 9. OpenCode MCP Setup

This project may also be developed using:

```text
OpenCode
```

For OpenCode, use:

```text
opencode.jsonc
```

instead of relying only on `.vscode/mcp.json`.

Create at project root:

```text
opencode.jsonc
```

---

# 10. OpenCode Configuration

Use:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "mcp": {
    "servers": {
      "figma": {
        "type": "remote",
        "url": "https://mcp.figma.com/mcp"
      }
    }
  }
}
```

This configuration makes the Figma MCP server available to OpenCode for this project.

---

# 11. Recommended OpenCode Setup Command

Instead of manually creating the MCP server configuration, it may also be added using:

```bash
opencode mcp add figma --url https://mcp.figma.com/mcp
```

Then check configured MCP servers:

```bash
opencode mcp list
```

Expected result should contain something similar to:

```text
figma
```

and eventually:

```text
connected
```

---

# 12. OpenCode Authentication

The Figma remote MCP server uses authentication.

If OpenCode displays:

```text
needs authentication
```

open OpenCode and use:

```text
/mcps
```

Select:

```text
figma
```

Then complete the Figma authentication process in the browser.

Alternatively, depending on the installed OpenCode version:

```bash
opencode mcp auth figma
```

may be used.

Verify:

```bash
opencode mcp list
```

Expected state:

```text
figma    connected
```

---

# 13. OpenCode Project Instructions

OpenCode must also follow this project's specification files.

The agent should always read:

```text
AGENT.md
```

and the relevant files under:

```text
spec-md/
```

If OpenCode project instructions support file references, configure them so the agent has access to project instructions.

Example:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "instructions": [
    "AGENT.md",
    "spec-md/*.md",
    "spec-md/**/*.md"
  ],

  "mcp": {
    "servers": {
      "figma": {
        "type": "remote",
        "url": "https://mcp.figma.com/mcp"
      }
    }
  }
}
```

This is the recommended configuration for this project.

---

# 14. Recommended Final opencode.jsonc

Recommended complete project configuration:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "instructions": [
    "AGENT.md",
    "spec-md/*.md",
    "spec-md/**/*.md"
  ],

  "mcp": {
    "servers": {
      "figma": {
        "type": "remote",
        "url": "https://mcp.figma.com/mcp"
      }
    }
  }
}
```

---

# 15. Figma File Reference Rule

The following Figma file must be used for this project:

```text
https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web
```

File key:

```text
FQhq9uVri66RJpADxECMtm
```

When an individual screen has a node URL, use that node URL instead of using only the root file.

Example:

```text
https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=1-3
```

Node:

```text
1:3
```

corresponds to:

```text
Login Screen
```

---

# 16. Node ID Format

Figma URLs normally contain node IDs like:

```text
node-id=1-3
```

MCP tools may represent this as:

```text
1:3
```

Therefore:

```text
URL:
node-id=1-3

MCP:
1:3
```

Both represent the same Figma node.

---

# 17. Figma Inspection Workflow

Before implementing any Figma-based page, the agent must inspect the design.

Required workflow:

```text
Receive frontend feature
       ↓
Read AGENT.md
       ↓
Read module spec-md
       ↓
Find relevant Figma node
       ↓
Read Figma design context
       ↓
Inspect existing frontend code
       ↓
Identify reusable components
       ↓
Implement page
       ↓
Compare with Figma
```

Do not implement a page from assumptions when a Figma design exists.

---

# 18. Do Not Use Screenshot-Only Implementation

Do not treat the Figma page only as an image.

Use structured Figma information where available.

The agent should inspect:

- frames
- components
- component instances
- auto-layout
- text
- colors
- spacing
- dimensions
- icons
- variables
- design tokens
- images
- nested layout structure

The purpose of MCP is to provide structured design context.

---

# 19. Design-to-Code Rule

When implementing a screen from Figma:

```text
Figma component
      ↓
Check existing React component
```

If equivalent component already exists:

```text
Reuse existing React component
```

If no component exists:

```text
Create reusable React component
```

Do NOT generate a completely separate component tree for every page.

---

# 20. Existing Component Priority

Before creating:

```text
Button
Input
Select
Table
Card
Modal
Sidebar
Header
Navbar
Badge
FormField
```

check:

```text
src/components/
```

Reuse existing components whenever possible.

Example:

```text
Figma Primary Button
        ↓
Existing Button.jsx?
        ↓
YES → reuse Button.jsx
NO  → create Button.jsx
```

---

# 21. Figma Does Not Override Feature Behavior

Figma controls appearance.

Figma does NOT override:

```text
API endpoint
authentication logic
validation logic
permissions
backend behavior
business rules
routing behavior
database behavior
```

Those requirements come from:

```text
spec-md
```

and:

```text
backend API contract
```

Example:

Figma may contain:

```text
Delete User button
```

But whether this performs:

```text
hard delete
```

or:

```text
soft delete
```

must come from the feature specification/backend.

---

# 22. No Invented Figma Features

If a feature is not shown in Figma and not required by `spec-md`, do not add it automatically.

Examples:

Do not automatically add:

```text
dark mode
animations
charts
filters
sorting
pagination
export buttons
extra navigation
extra forms
extra dialogs
```

unless required.

---

# 23. Figma and Responsive Design

When Figma provides multiple responsive layouts, use them.

Example:

```text
Desktop
Tablet
Mobile
```

If only desktop design exists, implement sensible responsive behavior without significantly changing the design.

The Admin Web application should prioritize desktop screens.

---

# 24. Tailwind CSS Conversion

Figma styles should normally be implemented with:

```text
Tailwind CSS
```

Example Figma:

```text
Background:
#FFFFFF

Border radius:
8px

Padding:
24px
```

Possible React implementation:

```jsx
<div className="rounded-lg bg-white p-6">
```

Avoid generating large inline style objects when Tailwind utilities can represent the same design.

---

# 25. Exact Values

If Figma defines important exact values, preserve them where reasonable.

Examples:

```text
sidebar width
header height
card radius
primary brand color
input height
button height
major spacing
font weights
```

Do not arbitrarily replace design values.

---

# 26. Figma Colors

When colors are repeatedly used throughout the application, convert them into reusable design tokens or Tailwind theme configuration where appropriate.

Example:

```text
Figma Primary Blue
       ↓
Tailwind Project Theme
       ↓
bg-primary
text-primary
border-primary
```

Avoid repeating arbitrary hexadecimal values across many components.

---

# 27. Figma Typography

Follow Figma typography where practical.

Inspect:

```text
font family
font size
font weight
line height
letter spacing
```

Create reusable typography conventions instead of manually styling every heading differently.

---

# 28. Figma Assets

Assets required by the UI may include:

```text
logos
icons
illustrations
images
```

Store frontend assets under:

```text
src/assets/
```

Recommended:

```text
src/assets/
├── images/
├── icons/
└── logos/
```

Do not embed huge base64 assets directly into React components.

---

# 29. Rangsit University Assets

The current Figma login design includes Rangsit University branding.

Any university logo used by the implementation should be stored as a project asset.

Example:

```text
src/assets/logos/rangsit-university-logo.svg
```

or another suitable image format.

Do not redraw the official logo using CSS.

---

# 30. Login Screen Reference

The verified Figma file currently contains:

```text
Page 1
```

with:

```text
Login Screen
```

Figma node:

```text
1:3
```

The design currently includes elements such as:

```text
Rangsit University branding

SMART AI University Student Assistant

Email Address

Password

Remember me

Forgot password?

Sign In

Secure Access

Admin Only

Verified
```

The actual login implementation must later follow:

```text
spec-md authentication specification
```

for its functionality.

---

# 31. Agent Figma Prompt Rules

When asking an agent to implement a Figma screen, use a clear prompt.

Example:

```text
Implement the Login Screen for the Smart AI Admin Web.

Follow:
- AGENT.md
- spec-md authentication specification
- Figma file FQhq9uVri66RJpADxECMtm
- Figma node 1:3

Use:
- React
- JavaScript
- Tailwind CSS

Inspect existing reusable components before creating new ones.

Do not change backend business logic.

Match the Figma layout, spacing, colors and typography as closely as practical.
```

---

# 32. Module Figma References

Every module specification should contain its related Figma reference where possible.

Example:

```markdown
## Figma Design

File:

Smart AI Admin Web

File Key:

FQhq9uVri66RJpADxECMtm

Node:

1:3

URL:

https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=1-3
```

This makes it easier for coding agents to find the correct design.

---

# 33. Recommended spec-md Module Format

Feature specifications should include:

```text
# Feature Name

## Purpose

## Route

## Figma Design

## UI Requirements

## Components

## API Endpoints

## Request

## Response

## Validation

## Loading State

## Empty State

## Error State

## Success State

## Permissions

## Implementation Workflow

## Acceptance Criteria
```

---

# 34. MCP Security

Never place sensitive information inside:

```text
mcp.json
opencode.jsonc
AGENT.md
spec-md
frontend source code
```

Do NOT store:

```text
Figma password
personal access token
database password
Redis password
JWT secret
RSA private key
super admin password
production credentials
```

Use OAuth authentication for the remote Figma MCP server.

---

# 35. Do Not Commit Authentication Tokens

MCP OAuth credentials should remain managed by the MCP client.

Do not manually copy authentication tokens into:

```text
mcp.json
```

or:

```text
opencode.jsonc
```

---

# 36. Git Rules

Recommended files that MAY be committed:

```text
AGENT.md
spec-md/
.vscode/mcp.json
opencode.jsonc
```

provided they contain no secrets.

Do not commit generated authentication credentials.

---

# 37. MCP Connection Verification

For OpenCode:

```bash
opencode mcp list
```

Expected:

```text
figma    connected
```

If authentication is required:

```bash
opencode mcp auth figma
```

or use:

```text
/mcps
```

inside OpenCode.

---

# 38. Figma Access Verification

After authentication, verify that the agent can access:

```text
Smart AI Admin Web
```

File key:

```text
FQhq9uVri66RJpADxECMtm
```

The agent should be able to identify:

```text
Page 1
```

and:

```text
Login Screen
```

Node:

```text
1:3
```

---

# 39. MCP Troubleshooting

If Figma MCP cannot connect:

### Step 1

Check configuration:

```text
https://mcp.figma.com/mcp
```

### Step 2

Check MCP status.

OpenCode:

```bash
opencode mcp list
```

### Step 3

Authenticate again:

```bash
opencode mcp auth figma
```

### Step 4

Verify the Figma account has access to:

```text
Smart AI Admin Web
```

### Step 5

Restart the MCP client if required.

---

# 40. Permission Troubleshooting

If the agent reports:

```text
file not found
```

or:

```text
permission denied
```

verify that the authenticated Figma account has permission to access:

```text
https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web
```

The file may need to be shared with the authenticated account.

---

# 41. Remote vs Desktop MCP

Use:

```text
Remote Figma MCP
```

as the default.

URL:

```text
https://mcp.figma.com/mcp
```

The Figma Desktop MCP server should only be used when there is a specific reason.

Desktop endpoint:

```text
http://127.0.0.1:3845/mcp
```

Do not configure both unless required.

---

# 42. Optional Desktop Configuration

If the remote server cannot be used and the Figma desktop MCP server has been explicitly enabled, VS Code may use:

```json
{
  "inputs": [],
  "servers": {
    "figma-desktop": {
      "type": "http",
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

Remote remains preferred.

---

# 43. Never Hardcode Figma Output

Do not blindly copy generated code from Figma directly into the project.

Generated design code must be adapted to:

```text
existing React architecture
existing components
Tailwind CSS
React Router
API services
project coding conventions
```

Generated code is reference material, not automatically production-ready code.

---

# 44. Frontend Implementation Workflow

For every Figma-based frontend module:

```text
Read AGENT.md
      ↓
Read relevant spec-md
      ↓
Read Figma node
      ↓
Inspect existing project code
      ↓
Identify reusable components
      ↓
Check route
      ↓
Check backend API
      ↓
Implement React UI
      ↓
Implement Tailwind styles
      ↓
Connect API
      ↓
Handle loading/error/empty/success
      ↓
Compare with Figma
      ↓
Fix differences
      ↓
Validate acceptance criteria
```

---

# 45. Figma Design Validation

After implementation, compare:

```text
React Application
        ↕
Figma Design
```

Check:

- layout
- width
- height
- spacing
- alignment
- font sizes
- colors
- border radius
- inputs
- buttons
- icons
- cards
- navigation
- responsive behavior

Do not mark the feature complete until major visual differences are resolved.

---

# 46. Code Quality

Figma implementation must still follow project code quality standards.

Do not create:

```text
one 1,000-line page component
```

Instead separate:

```text
Page
Components
Hooks
Services
Utilities
```

where appropriate.

---

# 47. MCP Usage Scope

MCP should be used only when it provides value.

Use Figma MCP for:

```text
reading UI design
reading design structure
reading components
reading variables
reading visual information
design-to-code context
```

Do not unnecessarily invoke MCP for:

```text
simple JavaScript functions
API service code
business logic
backend code
database logic
Docker configuration
```

---

# 48. Context Management

MCP tools can add significant context.

Only inspect Figma nodes relevant to the current feature.

Example:

When implementing:

```text
Login Screen
```

inspect:

```text
Login Screen node
```

rather than importing the entire application design unnecessarily.

This keeps agent context focused.

---

# 49. Required Project Files

After MCP setup, the project should include:

```text
smart-ai-admin-web/
│
├── AGENT.md
│
├── opencode.jsonc
│
├── .vscode/
│   └── mcp.json
│
├── spec-md/
│   ├── 01-docker-set-up.md
│   ├── 02-project-structure.md
│   ├── 03-mcp-set-up.md
│   └── ...
│
├── src/
├── package.json
└── vite.config.js
```

---

# 50. Required VS Code MCP Configuration

Final:

```json
{
  "inputs": [],
  "servers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

---

# 51. Required OpenCode Configuration

Final:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "instructions": [
    "AGENT.md",
    "spec-md/*.md",
    "spec-md/**/*.md"
  ],

  "mcp": {
    "servers": {
      "figma": {
        "type": "remote",
        "url": "https://mcp.figma.com/mcp"
      }
    }
  }
}
```

---

# 52. Acceptance Criteria

MCP setup is complete when:

- `.vscode/mcp.json` exists if VS Code MCP is being used.
- `opencode.jsonc` exists when OpenCode is being used.
- Figma remote MCP is configured.
- Figma remote MCP uses:

```text
https://mcp.figma.com/mcp
```

- Figma authentication succeeds.
- The coding agent can access:

```text
Smart AI Admin Web
```

- File key is:

```text
FQhq9uVri66RJpADxECMtm
```

- The agent can identify:

```text
Page 1
```

- The agent can identify:

```text
Login Screen
```

- Login Screen node is:

```text
1:3
```

- No Figma password or secret is stored in project configuration.
- `AGENT.md` is followed.
- `spec-md` files are followed.
- Figma is treated as the visual source of truth.
- Existing React components are reused where appropriate.
- React implementation uses Tailwind CSS.
- Generated Figma code is adapted to the existing React architecture.
- Backend behavior is not inferred from Figma.
- Each feature is validated against both its specification and Figma design.

---

# 53. Final Development Rule

For every frontend module:

```text
AGENT.md
   +
spec-md
   +
Figma MCP
   +
Backend API Contract
   ↓
React Implementation
```

The agent must not implement major UI screens from assumptions when a corresponding Figma design is available.

The Smart AI Admin Web Figma file is the project's primary visual reference:

```text
https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web
```