# US-004: Institutional Affiliation & Admin Approval

**Role**: Member / Institution Admin
**Objective**: Link my profile to my research institution for verified collaboration.

## Time Tracking
| Domain | Est. (h) | Act. (h) | Status |
|--------|----------|----------|--------|
| Backend | 6 | 0 | [ ] Todo |
| Frontend | 6 | 0 | [ ] Todo |

## Acceptance Criteria (UAC)
- [ ] Users can search for existing Institutions during or after onboarding.
- [ ] Users can request affiliation with a selected institution.
- [ ] Institution Admins receive a notification/see a pending list of affiliation requests.
- [ ] Institution Admins can Approve or Reject requests.
- [ ] Approved users' profile shows the verified institution badge/link.

## Technical Acceptance Criteria (TAC)

### 🛠️ Backend (Strapi)
- [ ] Create/Update Many-to-One relation between `User` and `Institution`.
- [ ] Implement `affiliationStatus` enum (Pending, Approved, Rejected) on the relation attribute.
- [ ] Create a custom controller or policy to allow `Institution Admin` to update only their affiliated users' status.

### 🎨 Frontend (Next.js)
- [ ] Build "Search Institution" component with debounced API requests.
- [ ] Build "Join Institution" request button and pending state UI.
- [ ] Build "Manage Members" dashboard view for users with `Institution Admin` role.
