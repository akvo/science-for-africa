# Individual Role Migration

## Overview
Standardizing user roles by migrating from hardcoded strings to a relational database model. This allows for better data integrity, administrative control via Strapi, and easier expansion of role types.

## Implementation Details

### Data Model
- **Collection Name:** `individual-role`
- **Fields:**
  - `name` (String, Required, Localized)
  - `isActive` (Boolean, Default: true)
  - `sortOrder` (Integer, Default: 0)
- **Relation:** `User.roleType` (Many-to-One)

### Security
- **Delete Protection:** The `IndividualRole` controller is overridden to block all `delete` requests, returning a `403 Forbidden` response. This prevents accidental deletion of standard roles that are referenced by users.

### Seeding & Bootstrap
- **Seeder:** Initial roles are seeded automatically on system bootstrap via `prod-seeder.js`.
- **Migration:** A bootstrap hook automatically backfills existing users by mapping their legacy string roles to the new relational records.

### API Changes
- **Endpoint:** `GET /api/individual-roles`
- **Controller Refactor:** The `auth/me` update controller has been migrated to use `strapi.db.query` instead of the Document Service for the update phase to ensure stability in Strapi v5 when handling relational links.

## User Roles (Standardized)
1. Knowledge Consumer
2. Knowledge Contributor
3. Working Group Member
4. Working Group Lead / Facilitator
5. Mentor
6. Mentee
7. Event Organiser / Host
8. Reviewer / Expert Advisor
9. Institutional Representative
10. Observer
