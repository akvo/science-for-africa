# Story: US-004-customize-user-list

**Title**: Customize Strapi Admin User List Columns
**Role**: Platform Admin
**Objective**: I want to see relevant user information (Role, Institution) in the user list table by default so that I don't have to manually configure columns every time.

## Business Value
Improves efficiency for platform administrators by surfacing critical user metadata directly in the main list view.

## User Acceptance Criteria (UAC)
1. [x] When navigating to the Users list in Strapi Admin, the "Role" column is visible by default.
2. [x] When navigating to the Users list in Strapi Admin, the "Institution" column is visible by default.
3. [x] The columns are correctly populated with data. (Verified by presence in config)
4. [x] The settings are persistent across server restarts and new environments.

## Technical Acceptance Criteria (TAC)
1. [x] Implementation is done programmatically in `backend/src/index.js` (bootstrap).
2. [x] Uses the Strapi `content-manager` configuration service or `strapi.store` API.
3. [x] Does not break existing admin panel functionality.

## Estimation
- **Story Points**: 2
- **Actual Time**: 1h
