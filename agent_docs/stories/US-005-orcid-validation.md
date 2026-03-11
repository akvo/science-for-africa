# US-005: ORCID ID Linkage & Validation

**Role**: Researcher
**Objective**: Connect my ORCID iD to prove my scientific identity and pull public research data.

## Time Tracking
| Domain | Est. (h) | Act. (h) | Status |
|--------|----------|----------|--------|
| Backend | 4 | 0 | [ ] Todo |
| Frontend | 4 | 0 | [ ] Todo |

## Acceptance Criteria (UAC)
- [ ] User can enter their ORCID iD during onboarding or in profile edit.
- [ ] Platform validates the ID format and existence via ORCID public API.
- [ ] Verified ORCID badge appears on the user's public profile.
- [ ] (Future) Option to sync publications from ORCID.

## Technical Acceptance Criteria (TAC)

### 🛠️ Backend (Strapi)
- [ ] Add `orcidId` field (string) to the User collection.
- [ ] Implement a Strapi service to call the ORCID Public API (`pub.orcid.org/v3.0/`) for ID validation.
- [ ] Create a custom endpoint or hook to trigger validation on profile update.

### 🎨 Frontend (Next.js)
- [ ] Add ORCID ID field to user profile/onboarding form with regex validation.
- [ ] Implement visual success/failure states for verified ORCID status.
