# Room Rental frontend — role-separated structure

Built from the original `src(7).zip` source.

## Applications

- **Admin / Super Admin** → existing global administration workspace (`/dashboard/*`).
- **Shop Owner** → location-scoped owner workspace (`/owner/*`).
- **Staff** → location-scoped staff workspace (`/staff/*`).
- **User** → normal user workspace (`/user/*`).

Each role has its own pages and its own feature UI components. Management forms/dialogs are not imported from another role's component folder.

## Availability

Availability is the only page-level feature shared by roles, and it is intentionally split into two pages:

- `/availability/hourly` → hourly time-slot availability
- `/availability/daily` → monthly/daily availability and multi-day reservation flow

## Page rule

Each feature has one page entry point. Create, update, detail, role/permission, translation, and similar actions are dialogs/modals instead of separate routes/pages.
