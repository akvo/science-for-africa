# US-007: Expert Directory & Mentorship Requests

**Role**: Mentee / Expert
**Objective**: Find a mentor or offer guidance to junior researchers.

## Time Tracking
| Domain | Est. (h) | Act. (h) | Status |
|--------|----------|----------|--------|
| Backend | 4 | 0 | [ ] Todo |
| Frontend | 6 | 0 | [ ] Todo |

## Acceptance Criteria (UAC)
- [ ] Users can browse the Expert Directory (publicly available).
- [ ] Users can filter experts by Expertise (Tags) and Region.
- [ ] Mentees can send a structured request message to an Expert.
- [ ] Experts can Accept or Decline requests from their dashboard.

## Technical Acceptance Criteria (TAC)

### 🛠️ Backend (Strapi)
- [ ] Implement `MentorshipConnection` collection with `status` (Pending, Accepted, Declined).
- [ ] Add `mentorAvailability` (boolean) to User schema.
- [ ] Configure Strapi Webhooks or lifecycle hooks for local notifications on request.

### 🎨 Frontend (Next.js)
- [ ] Build Expert Directory page with Tag-based filtering.
- [ ] Create "Request Mentorship" modal with message input.
- [ ] Build Mentorship Management view in User Dashboard for Experts.
