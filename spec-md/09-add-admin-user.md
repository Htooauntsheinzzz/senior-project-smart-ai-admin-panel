# Smart AI Admin Portal — Add Admin User

## Source and scope

- [Figma design: Smart Ai Admin Web, node 42:4481](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=42-4481&m=dev)
- Inspected on 2026-09-29 using Figma design context and its rendered screenshot.
- The root frame is named `Dashboard`, but the visible screen is **Add Admin User**, with **User Management** selected in the sidebar.
- Deliverable: this implementation guide. Application implementation remains a subsequent task.
- Implement this screen and its shared shell. Other sidebar destinations are outside this screen's scope.

Measurements, copy, colors, and initial states below come from the selected node. Responsive behavior, validation feedback, component boundaries, and service integration are implementation proposals where the design does not specify them.

## Existing project

The repository contains a JavaScript React 19 starter using Vite 7 and Tailwind CSS 4. `vite.config.js` already configures `@tailwindcss/vite`; `src/index.css` already imports Tailwind. No component library, router, backend integration, font files, or design assets were found in the inspected project files. Inter is declared as a font family but is not loaded as a font asset.

Use the existing stack and JavaScript conventions. Retain `src/main.jsx` as the entry point and replace the starter content in `src/App.jsx` when implementing. Do not install another styling framework. No Code Connect component mappings were supplied in the retrieved context.

## Layout and visual tokens

Build the shell with flexbox and the form with CSS grid. Figma's generated fixed cell widths and absolute text positions describe the reference geometry; do not copy them into a rigid page layout.

| Element | Reference value / implementation direction |
| --- | --- |
| Sidebar | Approximately 252px wide, white, right border; brand header at least 64px tall |
| Top navigation | 64px tall, white, 24px horizontal padding, 16px item gap |
| Main area | Page background; 28px horizontal and 24px vertical padding |
| Content column | 900px maximum width, aligned left rather than centered across the remaining viewport |
| Heading to form | 24px |
| Form sections | White cards, 24px padding, 16px radius, 20px vertical separation |
| Section heading to fields | 20px |
| Field grid | Two equal flexible columns, 16px horizontal and vertical gap |
| Label to control | 6px |
| Inputs and selects | Approximately 41.5px high, 12px radius, 14px horizontal padding |
| Borders | Figma reports 0.625px, color `#E5E8F0`; retain for initial comparison and evaluate rasterization at the reference viewport |
| Footer actions | Right aligned, 12px gap, 20px top and 16px bottom padding |
| Buttons | 12px radius, 24px horizontal and 10px vertical padding |
| Primary action shadow | `0 4px 7px rgba(39, 50, 56, 0.22)` |

Define reusable theme values in `src/index.css`, using Tailwind 4's CSS-first theme support where appropriate:

| Token | Value | Use |
| --- | --- | --- |
| Canvas | `#F7F8FC` | Main page and secondary surfaces |
| Surface | `#FFFFFF` | Sidebar, top navigation, cards, controls |
| Primary | `#273238` | Selected navigation, main action, avatars, checked checkbox |
| Text | `#17213C` | Headings, labels, entered text |
| Muted | `#68728A` | Descriptions and inactive navigation |
| Border | `#E5E8F0` | Cards, fields, separators |
| Accent | `#D80255` | Required markers and notification dot |
| Navigation caption | `#B0B8CC` | NAVIGATION label |
| Select placeholder | `#9CA3AF` | Unselected department and role |
| Input placeholder | `rgba(23, 33, 60, 0.5)` | Input hints |

Load **Plus Jakarta Sans** for headings, navigation, and branding; load **Inter** for form labels, controls, descriptions, and actions. Prefer local licensed font assets. Font loading is necessary for a meaningful visual comparison.

| Typography | Size / line height | Weight |
| --- | --- | --- |
| Page title | 22px / 33px, letter spacing -0.55px | 700, Plus Jakarta Sans |
| Section title | 15.5px / 23.25px | 700, Plus Jakarta Sans |
| Main navigation | 13px / 19.5px | 500, Plus Jakarta Sans |
| Nested navigation | 12.5px / 18.75px | 500, Plus Jakarta Sans |
| Field labels | 13px / 19.5px | 600, Inter |
| Controls and action text | 13.5px; action line height 20.25px | 400 controls, 600 actions, Inter |
| Section description | 13px / 19.5px | 400, Inter |
| Page subtitle | 13.5px / 20.25px | 400, Inter |

## Shared shell

### Sidebar — node 42:4482

Show the Rangsit University logo beside `SMART AI` and `ADMIN PORTAL`, followed by a collapse button. Place the `NAVIGATION` caption above the menu. The selected User Management item has a dark primary background and white text/icon; item padding is 10px and radius is 12px.

Preserve this visible order and initial expansion state:

1. Dashboard
2. User Management — selected
3. Students
4. Academic Management — expanded: Faculties, Departments, Programs & Majors, Courses, Course Sections, Enrollments
5. Timetable
6. Academic Activities — collapsed
7. Campus Management — collapsed
8. AI Management — collapsed
9. Communication — collapsed
10. Reports & Analytics
11. Settings — expanded: University Settings, Audit Logs

Expanded groups use a light vertical guide and small circular markers. Anchor the account panel to the bottom: square `A` avatar, `Admin User`, and `Super Administrator`. Allow the navigation region to scroll at shorter heights so this panel and menu remain accessible.

### Top navigation — node 42:4710

Include the search field with placeholder `Search students, courses, rooms…` (maximum width 384px), a User Management context button, flexible space, a bell with a pink notification dot, and a circular `AD` avatar with a chevron. Use the supplied icon variants; the top navigation's users icon differs from the selected sidebar icon.

### Page heading — node 42:4745

Place a 36px square outlined back button before the heading group:

- **Add Admin User**
- `Create a new staff account with administrative access.`

## Form content

Use one semantic `<form>` containing three named sections. Required fields have a pink asterisk and native required semantics. Placeholders must not replace visible labels.

### Personal Information — node 42:4758

Description: `Basic identity details for the staff member.`

| Row / span | Label | Name | Control | Placeholder | Required |
| --- | --- | --- | --- | --- | --- |
| 1 / left | Employee ID | `employeeId` | Text | `e.g. RSU-001` | Yes |
| 1 / right | Phone Number | `phoneNumber` | Telephone | `+66 81 234 5678` | No |
| 2 / left | First Name | `firstName` | Text | `First name` | Yes |
| 2 / right | Last Name | `lastName` | Text | `Last name` | Yes |
| 3 / full | Email Address | `email` | Email | `staff@rsu.ac.th` | Yes |

### Administrative Access — node 42:4812

Description: `Department assignment, role, and initial account status.`

| Row / span | Label | Name | Initial display | Required |
| --- | --- | --- | --- | --- |
| 1 / left | Department | `departmentId` | `Select department` | Yes |
| 1 / right | Account Status | `status` | `Active` | No required marker |
| 2 / full | Role | `roleId` | `Select a role` | Yes |

Use select controls. The design does not reveal department options, role options, additional status values, or backend identifiers. Obtain these from the service contract; any prototype fixtures must be explicitly marked as mock data.

### Security — node 42:4854

Description: `Set a temporary password. The user will be required to change it on first login.`

| Row / span | Label | Name | Placeholder | Required |
| --- | --- | --- | --- | --- |
| 1 / left | Temporary Password | `temporaryPassword` | `Min. 8 characters` | Yes |
| 1 / right | Confirm Password | `confirmPassword` | `Re-enter password` | Yes |

Each password input has its own trailing eye button. The second row spans both columns and contains a **checked by default** checkbox named `forcePasswordChange`:

- Label: `Force password change on first login`
- Helper: `The user will be required to set a new password immediately after their first successful sign-in.`

The checkbox is 20px square with a 5px radius, dark fill, and supplied check asset. Keep the helper text associated with the checkbox.

### Actions — node 42:4907

Below the Security card, place the outlined **Cancel** button followed by the dark **Create Admin User** button with its user-plus icon. Keep this row in document flow; the design does not establish a sticky action footer.

## Proposed component and file structure

```text
src/
  App.jsx                       # Compose the shell and selected screen
  index.css                     # Fonts, design tokens, shared styles
  components/
    AdminLayout.jsx             # Sidebar, top navigation, main content
    Sidebar.jsx                 # Menu configuration and expansion state
    TopNav.jsx                  # Search, context, notifications, account
    FormSection.jsx             # Card heading, description, fields
    FormField.jsx               # Label, required marker, hint, error
    PasswordField.jsx           # Password input and visibility toggle
  pages/
    AddAdminUser.jsx             # Form state, validation, submission
  services/
    adminUsers.js                # Service adapter once contract is known
public/
  assets/figma/                  # Downloaded original Figma assets
  fonts/                        # Local font files where available
```

This is a proposed structure, not a list of existing files. Keep routing optional until the surrounding application's navigation contract is defined. Pass navigation and submission callbacks into the screen so it can run independently without inventing production endpoints.

## Asset handoff

Re-fetch design context at implementation time and download the original assets through the method provided by the Figma tooling. Temporary asset URLs expire and must not be referenced by production code. The reference screenshot is a comparison target, never a background image or substitute for implementation.

| Figma asset identifier | Required slot(s) |
| --- | --- |
| `54314.png` | Rangsit University logo, approximately 102.63 × 40px wrapper |
| `e517e.svg` | Sidebar collapse control |
| `3bfe2.svg`, `ec93d.svg`, `9c037.svg` | Dashboard, selected User Management, Students |
| `db3d0.svg`, `b0dd0.svg` | Academic Management icon and sidebar group chevrons |
| `3b8e1.svg`, `646a9.svg`, `14af3.svg` | Timetable, Academic Activities, Campus Management |
| `1d45f.svg`, `af5e6.svg`, `5d063.svg`, `4f373.svg` | AI Management, Communication, Reports & Analytics, Settings |
| `bef91.svg`, `a76d0.svg`, `258e2.svg` | Header search, User Management context, notifications |
| `bd3f9.svg`, `139ae.svg` | Account chevron, page back control |
| `31dd8.svg` | Both password visibility controls |
| `fb6c0.svg`, `bfb30.svg` | Checked checkbox, Create Admin User action |

Most sidebar icon wrappers are approximately 17px square; password eyes are 16px, the bell is 20px, and the create icon is 15px. Check each downloaded SVG's intrinsic root dimensions and preserve them. Do not apply blanket image sizing, redraw assets, or replace them with a different icon library. Use descriptive local filenames and maintain their slot mapping. Assets have not been downloaded as part of this Markdown-only deliverable.

## Proposed interaction and integration requirements

1. Maintain controlled form state. Start text fields empty, department and role unselected, status Active, both password values masked, and force-password-change checked.
2. Validate required fields, email format, password length of at least eight characters, and exact confirmation matching. Trim appropriate identity text; do not trim passwords. Do not infer an email-domain restriction or strict employee-ID/phone pattern from placeholder examples.
3. Associate inline errors with fields using `aria-describedby` and `aria-invalid`. On failed submission, focus the first invalid field. Error styling is an implementation extension because the selected frame only shows the initial state.
4. Make eye buttons `type="button"`, with independent visibility state and accessible Show/Hide labels. Use `autoComplete="new-password"` for both password inputs.
5. Use a submit button for creation. Prevent duplicate requests while pending, preserve values on failure, announce feedback, and clear sensitive values after confirmed success. Do not log or persist passwords in browser storage. Confirmation is client-side validation data and should be omitted from the service payload unless the actual contract requires it.
6. Wire Cancel and Back to a supplied User Management destination/callback. Navigation destinations are not established by this frame. Do not silently discard a dirty form; a discard prompt is a proposed behavior.
7. Make sidebar expansion and collapse keyboard operable, preserve the selected item, and expose `aria-expanded` / `aria-current`. Only populate group contents supported by actual destination data.
8. Search, notifications, and account controls require surrounding application integrations. For a standalone prototype, explicitly identify unavailable functionality rather than imply a successful backend action.
9. Server-side authorization, uniqueness checks, account creation, permitted role assignments, and first-login password-change enforcement require backend support. The visual design does not define those contracts.

## Responsive and accessibility extensions

Only the desktop layout was supplied. Proposed behavior to verify during implementation:

- Preserve the 252px sidebar and 900px content maximum at wide desktop sizes; allow the content column to shrink using `min-width: 0` and `width: 100%`.
- Below a proposed 1024px breakpoint, replace the sidebar with a dismissible drawer. Restore focus to its trigger when closed and support Escape.
- Below a proposed 640px breakpoint, stack form fields in reading order, reduce page/card padding to 16px, and allow header controls and action buttons to reflow without horizontal scrolling.
- Let descriptions wrap and the page scroll vertically. Do not carry over Figma's overflow clipping if it hides fields or actions.
- Use visible focus indicators, semantic navigation and headings, associated labels, accessible names for icon-only controls, and meaningful logo alternative text. Decorative icons should have empty alt text.
- Check text contrast and touch target sizes; expand hit areas around small icons without distorting the assets.

## Implementation sequence

1. Refresh the Figma context, retrieve assets, load fonts, and define shared tokens.
2. Build the shell and heading, matching sidebar selection and expanded groups.
3. Build reusable field/card components, then reproduce all three sections and action buttons with exact copy.
4. Add form state, validation, visibility controls, navigation callbacks, and an explicitly mocked or real service adapter.
5. Add the responsive and accessible states described above.
6. Run the existing production build, exercise the meaningful interactions, and compare the implemented screen against a fresh Figma screenshot at the same viewport and scale.

## Acceptance checklist

- [ ] All visible labels, placeholders, navigation items, required markers, and default states match the selected node.
- [ ] Sidebar width, header height, content alignment, section spacing, typography, colors, and borders match the reference.
- [ ] The three cards use two-column grids on desktop; Email Address, Role, and the checkbox row span both columns.
- [ ] Every static asset exists locally, is non-empty, uses the correct variant and slot, and preserves its intended rendered geometry.
- [ ] Fonts load successfully; production code contains no temporary Figma asset URLs.
- [ ] Keyboard navigation, labels, checkbox, independent password toggles, and focus/error handling work.
- [ ] Empty required values, invalid email, short password, and mismatched confirmation prevent submission.
- [ ] Submission has tested pending, success, and failure behavior; duplicate submissions are blocked.
- [ ] Cancel/Back and integrated shell controls behave according to supplied callbacks.
- [ ] Narrow viewports and short screens do not clip fields, navigation, or actions.
- [ ] `npm run build` passes once application implementation is complete.
- [ ] Compare only this requested screen against Figma and document unresolved integration assumptions or intentional responsive deviations.

## Remaining integration decisions

Before production integration, establish the department/role/status datasets, user-management route, create-user request and response contract, error codes, authorization rules, and header control services. These details are not available in the selected Figma frame or current starter repository. They do not prevent building the visual screen with clearly identified mock data.
