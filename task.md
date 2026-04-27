# Tasks: Institution Membership & Education Refactor

## Phase 1: Schema Updates
- [ ] Create `api::institution-membership` content-type
    - `backend/src/api/institution-membership/content-types/institution-membership/schema.json`
- [ ] Update `plugin::users-permissions.user` schema
    - `backend/src/extensions/users-permissions/content-types/user/schema.json`
    - Add `highestEducationInstitution` relation
    - Remove old fields: `institution`, `institutionName`, `affiliationStatus`, `verificationStatus`, `educationInstitutionName`

## Phase 2: Backfill Logic
- [ ] Create migration script `backend/src/bootstrap/migrations/backfill-institutions.js`
- [ ] Register migration in `backend/src/index.js` bootstrap
- [ ] Ensure idempotency (run once only)

## Phase 3: Controller & Integration Updates
- [ ] Update Profile controller `backend/src/api/auth/controllers/profile.js`
    - Update `findUsers` to populate new fields
    - Update `update` to handle new fields
- [ ] Update user lifecycles in `backend/src/index.js`
    - Remove old field mapping logic
    - Add new logic for membership creation if needed (though mostly handled by profile update)

## Phase 4: Verification
- [ ] Run Strapi locally and verify "Akvo" backfill
- [ ] Verify user profiles via API/Admin panel
