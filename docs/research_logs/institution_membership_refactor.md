# Research Log: Institution Membership & Education Refactor

## 📅 Date: 2026-04-27
## 👤 Author: Antigravity (AI Developer)

## 📋 Context
The project requires a more flexible way to manage user affiliations with institutions. Currently, users have a direct `manyToOne` relationship with an `institution` and a string field for `educationInstitutionName`.
The new requirements demand:
1. A join table for memberships (allowing multiple affiliations in the future).
2. Metadata on the membership (type: member/owner, verificationStatus).
3. A formal foreign key for the highest education institution.
4. Data backfill for existing staging accounts.

## 🔍 Workspace Analysis
- **User Schema**: `backend/src/extensions/users-permissions/content-types/user/schema.json`
    - Current: `institution` (relation), `affiliationStatus` (enum), `verificationStatus` (enum), `institutionName` (string), `educationInstitutionName` (string).
- **Institution Schema**: `backend/src/api/institution/content-types/institution/schema.json`
    - Current: `name`, `type`, `country`, `verified`, `users` (relation).
- **Profile Controller**: `backend/src/api/auth/controllers/profile.js`
    - Populates `institution`. Needs update.
- **Seeder**: `backend/src/utils/seeder.js`
    - Seeds institutions but doesn't handle memberships.

## 🛠️ Technical Plan

### 1. Schema Updates
- **New Collection**: `api::institution-membership.institution-membership` (or `affiliation`)
    - `user`: `plugin::users-permissions.user` (manyToOne)
    - `institution`: `api::institution.institution` (manyToOne)
    - `type`: enumeration `["member", "owner"]`
    - `verificationStatus`: boolean
- **User Schema Changes**:
    - Add `highestEducationInstitution`: `api::institution.institution` (manyToOne)
    - Remove `institution` (relation)
    - Remove `institutionName` (string)
    - Remove `affiliationStatus` (enum)
    - Remove `verificationStatus` (enum)
    - Remove `educationInstitutionName` (string)

### 2. Backfill Mechanism (Strapi v5 Best Practice)
Since Strapi doesn't have a native data migration system, I will implement a "One-Time Bootstrap Task":
- **Location**: `backend/src/bootstrap/migrations.js` (to be created and imported in `index.js`).
- **Logic**:
    1. Check if a migration flag exists in a new `api::internal-config` or simply check if any user has the new fields populated.
    2. Alternatively, use a file-based lock in `backend/migrations/.completed`.
    3. **The "Akvo" Backfill**:
        - Ensure "Akvo" institution exists (using name).
        - For all users:
            - Create an `institution-membership` record:
                - `user`: user.id
                - `institution`: Akvo.id
                - `type`: "member"
                - `verificationStatus`: `user.verificationStatus === 'verified'`
            - Update user:
                - `highestEducationInstitution`: Akvo.id

### 3. Integration Updates
- Update `backend/src/api/auth/controllers/profile.js` to populate `institution-memberships` and `highestEducationInstitution`.
- Update `backend/src/index.js` lifecycles if they rely on the old fields.

## ⚠️ Potential Gotchas
- **Strapi v5 Document Service**: Ensure migrations use the Document Service if possible, or `strapi.db.query` for low-level tasks.
- **Data Integrity**: Ensure the backfill doesn't run twice or overwrite manual changes if the script is re-run.
- **Environment**: "Must only run once" is critical for staging/production.

## 🚀 Next Steps
1. Invoke Winston (Architect) to approve the ADR.
2. Invoke Bob (Scrum Master) to create the sprint plan and stories.
