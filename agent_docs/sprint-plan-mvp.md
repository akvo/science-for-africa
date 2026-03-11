# Sprint Plan: Phase 1 MVP (Identity, Community & Resources)

**Sprint Goal**: Establish the core research identity system, community collaboration hubs, and a moderated resource pipeline.

## 1. Stories & Tasks Scope

### 🛠️ Backend (Strapi v5)
| ID | Title | Points | Status |
|----|-------|--------|--------|
| [US-003-B](stories/US-003-identity-onboarding.md) | User Schema Extension & Auth Config | 2 | [x] Done |
| [US-004-B](stories/US-004-institutional-affiliation.md) | Institution Relations & Admin Hooks | 3 | [ ] Todo |
| [US-005-B](stories/US-005-orcid-validation.md) | ORCID API Integration Service | 2 | [ ] Todo |
| [US-006-B](stories/US-006-forum-hierarchy.md) | Forum Collections & Recursive Relations | 3 | [ ] Todo |
| [US-007-B](stories/US-007-mentorship-discovery.md) | Mentorship Join Table & Status Logic | 2 | [ ] Todo |
| [US-008-B](stories/US-008-resource-moderation.md) | Resource Draft/Publish & Review Pipeline | 3 | [ ] Todo |

### 🎨 Frontend (Next.js 15)
| ID | Title | Points | Status |
|----|-------|--------|--------|
| [US-003-F](stories/US-003-identity-onboarding.md) | Multi-step Registration & Onboarding UI | 3 | [ ] Todo |
| [US-004-F](stories/US-004-institutional-affiliation.md) | Institution Search & Admin Dashboard UI | 2 | [ ] Todo |
| [US-005-F](stories/US-005-orcid-validation.md) | ORCID Linkage UI & Validation Feedback | 1 | [ ] Todo |
| [US-006-F](stories/US-006-forum-hierarchy.md) | Community/Forum Browse & Threading UI | 3 | [ ] Todo |
| [US-007-F](stories/US-007-mentorship-discovery.md) | Expert Directory & Mentorship Request UI | 2 | [ ] Todo |
| [US-008-F](stories/US-008-resource-moderation.md) | Resource Submission Form & Detail Pages | 3 | [ ] Todo |

## 2. Team Allocation
- **Backend Developer**: Strapi Architecture & API Logic.
- **Frontend Developer**: UI Components, State Management & API Integration.
- **Total Points**: 26
- **Sprint Duration**: 2 Weeks (Proposed)
- **Primary Team**: Amelia (Dev), Bob (SM), Winston (Arch)

## 3. Roles & Permissions Matrix (Sprint MVP)
- **Identity Foundation**: RBAC for the 6 roles (Platform Admin, Community Admin, Institution Admin, Expert, Member, Individual).
- **Access Control**: Public (Guest) vs Private (Member) content visibility.

## 4. Dependencies
- Strapi v5 Backend Configuration - REQUIRED
- Registration API endpoints - REQUIRED
- Mentorship & Institutional join tables - REQUIRED

## 5. Definition of Done (DoD)
- [ ] Code follows project standards (TDD).
- [ ] Requirements from Figma boards are 100% matched.
- [ ] Unit & Integration tests passing.
- [ ] Documentation updated in `agent_docs/features/`.
