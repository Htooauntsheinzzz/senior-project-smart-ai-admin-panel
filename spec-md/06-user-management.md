# User Management – Admin Users

## Project
Smart AI University Student Assistant – Admin Portal

## Frontend Stack
- Vite
- React
- TypeScript
- Tailwind CSS

## Figma Reference

Figma file:
Smart AI Admin Web

Target frame:
User Management

Node ID:
22:1695

---

# 1. Objective

Implement the **User Management** page based on the provided Figma design.

For this implementation phase:

- Implement **Admin Users** only.
- Keep **Roles & Permissions** visible in the User Management navigation.
- Do NOT implement Roles & Permissions functionality yet.
- When Roles & Permissions is selected, display:

> Not available right now

The implementation must match the existing Figma design and must NOT redesign the current application layout.

---

# 2. Important Design Rule

The Figma design is the visual source of truth.

Do NOT change:

- Existing sidebar
- Existing header
- Rangsit University logo
- SMART AI / ADMIN PORTAL branding
- Theme colors
- Typography
- Sidebar width
- Header height
- Main page background
- Existing spacing system
- Border radius style
- Existing navigation icons
- Existing profile/avatar style
- Existing notification button
- Existing search bar style

Reuse the components already created for the Dashboard whenever possible.

Do not rebuild shared components if they already exist.

---

# 3. Sidebar State

When the user opens User Management:

`User Management` must be the active sidebar item.

The active sidebar appearance must match the Figma design.

Expected active style:

- Dark background
- White icon
- White text
- Rounded corners

Other sidebar items remain unchanged.

Navigation structure should remain consistent with the existing project.

---

# 4. Top Header

Reuse the existing application header.

The header should continue to contain the existing elements such as:

- Current page/navigation area
- Search
- Notification icon
- Admin profile/avatar
- Admin name or initials
- Existing dropdown behavior if already implemented

Do NOT create another independent header specifically for User Management.

---

# 5. User Management Navigation

Inside the User Management section provide two options:

- Admin Users
- Roles & Permissions

Default selected option:

`Admin Users`

The navigation style must follow the Figma design.

## Admin Users

When selected:

Show the complete Admin Users interface.

## Roles & Permissions

Keep this option visible because it belongs to User Management.

However, it is NOT part of the current implementation.

When clicked, show a simple unavailable state.

Example:

### Roles & Permissions

Not available right now.

Do not create:

- Roles table
- Permission table
- Permission editor
- Role creation form
- Role assignment interface
- Permission matrix
- Backend calls for permissions

---

# 6. Admin Users Page

Implement the Admin Users page according to the Figma design.

The page should contain the major areas below.

---

# 7. Page Header

Display the page title and supporting information exactly following the Figma layout.

Example structure:

Admin Users

Manage administrator accounts and their access to the Smart AI Admin Portal.

Do not introduce a different page-header design.

---

# 8. Page Actions

Include the actions shown in the Figma design.

The Admin Users page includes actions such as:

- Download
- Add Admin

Use the same:

- Button height
- Padding
- Border
- Border radius
- Icon size
- Text size
- Alignment
- Hover behavior

as the Figma design.

---

# 9. Download Button

Create the Download button based on the Figma design.

Use the download icon shown in the design.

For the current frontend implementation, this may work with mock data.

Recommended behavior:

Clicking Download exports the currently displayed admin user data.

CSV is acceptable for the temporary frontend implementation.

Example filename:

`admin-users.csv`

Do not connect this to a backend endpoint unless an endpoint already exists in the project.

---

# 10. Add Admin Button

Create the `Add Admin` button.

Use the user-plus icon shown in Figma.

For this implementation phase, the button should be functional at frontend level.

If an Add Admin modal or form already exists in the project, reuse it.

Otherwise create a simple modal matching the existing design system.

Suggested fields:

- Full Name
- Email
- Role
- Status

Example roles:

- Super Admin
- Admin

Example statuses:

- Active
- Inactive

Buttons:

- Cancel
- Add Admin

Frontend mock data may be used until backend integration is implemented.

---

# 11. Search

Create the Admin Users search input exactly according to Figma.

Include the search icon.

Suggested placeholder:

`Search admin users...`

Search should filter users using:

- Name
- Email
- Role

Search should update the displayed table immediately.

Do not require backend integration yet.

---

# 12. Admin Users Table

Create the admin users table according to the Figma design.

Match the exact visual hierarchy from Figma.

The table should contain the admin account information represented by the design.

Recommended data structure:

```ts
interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "Super Admin" | "Admin";
  status: "Active" | "Inactive";
  createdAt: string;
}