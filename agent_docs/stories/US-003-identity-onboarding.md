# US-003: User Registration & Detailed Onboarding

**Role**: New Researcher
**Objective**: Create an account and set up my professional profile to access community features.

## Time Tracking
| Domain | Est. (h) | Act. (h) | Status |
|--------|----------|----------|--------|
| Backend | 4 | 6 | [x] Done |
| Frontend | 8 | 0 | [ ] Todo |

## Acceptance Criteria (UAC)
- [ ] User can sign up with Email, Password, First Name, and Last Name.
- [ ] System sends a verification email upon signup.
- [ ] Onboarding flow triggers after first login/verification.
- [ ] User can select their primary Role (Individual or Institutional).
- [ ] User can pick Expertise and interests from the unified Tag system.
- [ ] User can enter their Career Stage and Expertise.

## Technical Acceptance Criteria (TAC)

### 🛠️ Backend (Strapi)
- [x] Extend `plugin::users-permissions.user` schema with `careerStage`, `expertise`, `orcidId`, and `mentorAvailability`. [x]
- [x] Ensure `enum role` matches the 6 Figma-defined roles in Strapi settings. [x]
- [ ] Configure email provider in Strapi for the verification flow.
- [x] Create a custom register/onboarding endpoint or lifecycle hook if needed to track onboarding state. [x]

### 🎨 Frontend (Next.js)
- [ ] Implement multi-step onboarding form using React Hook Form & Zustand for state.
- [ ] Build UI for Role Selection, Career Stage (Enum), and Expertise (Searchable Tag selector).
- [ ] Implement Route Guard to redirect un-onboarded users to the `/onboarding` flow.
