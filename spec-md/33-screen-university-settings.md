# University Settings — frontend implementation

## Source and scope

- [Figma university setting screen, node 130:10974](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=130-10974&m=dev).
- Visually inspected in the browser on 2026-10-13.
- Frontend only, existing APIs only, no browser-local record persistence.
- Protected route: `/admin/university-settings`.
- Sidebar: **Settings → University Settings**.

## Observed Figma design

### Header and categories

- Heading: **University Settings**.
- Subtitle: **Configure your institution, academic calendar, AI behaviour, and security policies**.
- Dark **Save Changes** action at the right.
- White header with icon tabs: **General**, **Academic**, **AI**, **Notifications**, **Security**.
- General is selected with a dark underline. Other category contents are not shown in the supplied frame.

### Institution Identity

A narrow white bordered card is centered on the pale content area. Header: **Institution Identity**, with subtitle **Core information displayed across the admin portal and student app**.

Fields appear in this order:

1. **University Name** — single-line input.
2. **University Logo** — image placeholder and outlined **Upload Logo** action. Guidance: **Recommended: 256×256 PNG or SVG, transparent background**.
3. Divider.
4. **Address** — multiline input.
5. **Phone Number** and **Email Address** — paired columns.
6. **Website URL** — full-width input.

The reference includes Rangsit University and sample contact details. These are design values, not verified saved institution settings. A second **Save Changes** button sits outside the card at the lower right. No file picker, save feedback, validation state or additional category panel is shown.

## Implementation files

| File | Responsibility |
| --- | --- |
| `src/components/settings/UniversitySettingsContent.tsx` | Header, category strip, identity form, unavailable-data explanation and save controls |
| `src/pages/settings/UniversitySettingsPage.jsx` | Existing admin layout, authentication/session and logout integration |
| `src/data/navigation.ts` | Connect University Settings sidebar item |
| `src/routes/AppRoutes.jsx` | Register protected route |
| `src/components/navigation/TopNav.tsx` | Settings label/icon and current-page link |

Reuses the existing fonts, palette, controls and rounded borders. The identity panel is centered in a maximum-width 700px wrapper. Phone/email fields stack on narrow screens; category labels and header actions wrap. Fields use native labels and input types. General has tab/panel semantics; unsupported tabs are disabled. The unavailable-data explanation is exposed as a status message and referenced by disabled controls.

## API boundary and differences from the populated design

Read-only inspection of backend controllers found no institution-settings or university-logo endpoint. Accordingly:

- Saved identity fields are blank with explicit unavailable placeholders, not prefilled from Figma or the branding asset.
- Logo upload and both save actions are disabled.
- General is the displayed category. Academic, AI, Notifications and Security are disabled because their panel designs and compatible APIs are unavailable.
- No simulated save result, upload, speculative request, local persistence or policy mutation occurs.
- The general information form remains visible to communicate the intended design and field structure.

Real integration needs a compatible API for reading/updating institutional identity and logo upload/storage, with supported formats, validation, authorization and error contracts. Additional categories require their own designs and contracts. Existing academic resources and authentication configuration do not constitute a university-settings API.

This delivers the design-based General screen with unavailable-data handling, not working settings persistence or exact parity with the populated reference. No backend source, database, authentication or permission changes are required.

## Verification and deployment

- Lint, TypeScript and all 32 existing frontend tests passed.
- Docker production build passed with the existing large-bundle advisory.
- Tracked integration-file whitespace checks passed.
- Rebuilt/recreated Docker `admin-web`; `/admin/university-settings` returned HTTP 200 on localhost:3000. The served `/assets/index-DpmMNYH4.js` bundle includes the University Settings screen.
- Authenticated visual and keyboard verification remains pending normal sign-in.
