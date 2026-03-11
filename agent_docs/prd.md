# Product Requirements Document (PRD)
**Project**: Science for Africa - External Platform
**Status**: Refined (Merged Figma & Google Docs)

## 1. Vision & Goals
The Science for Africa (SfA) external platform aims to create a central Community of Practice (CoP) hub for research managers across Africa. It facilitates collaboration, knowledge sharing, and professional growth across the African scientific ecosystem.

**Primary Goals:**
- Connect individuals with relevant scientific **Institutions** and peers.
- Provide a central repository for resources, tools, and impact stories.
- Surface opportunities (funding, jobs, scholarships) logically and accessibly.
- Drive engagement through structured, moderated community forums and **Mentorship**.

## 2. Target Users (Roles)
Based on Figma [Collaboration & Community](https://www.figma.com/board/Chk297BVmFWcw4zJjuqX5F/Science-for-Africa--External-?node-id=55-3793), the following roles are defined:
- **Guest**: Unauthenticated. Read-only access to public threads, expert profiles, collaboration calls, and events.
- **Individual User (No Org)**: Authenticated but not affiliated. Can participate in public forums and request mentorship.
- **Community Member (Org Affiliated)**: Authenticated and affiliated with an Institution. Full participation in organization-scoped communities.
- **Expert (Verified Member)**: Can offer/accept mentorship and create expert-led events.
- **Institution Admin**: Manages their organization's workspace, members, and content.
- **Community Admin (Moderator)**: Oversees forum content (lock/merge threads, remove content).
- **Platform Admin (Strapi Superadmin)**: Full system control.

## 3. Key User Journeys
- **Registration & Detailed Onboarding**:
    - Sign-up with Email/Password -> Email Verification.
    - Onboarding flow: Role selection (Individual vs Institutional) -> Expertise/Interests selection -> Education/Career progress.
    - **Institutional Affiliation**: Search for existing Institution to join (Pending Admin approval) or trigger "Create New Institution" flow.
    - **ORCID Integration**: Linking and validating ORCID ID during onboarding or profile edit.
- **Identity & Profile Management**:
    - Centralized dashboard for personal info, expertise, roles, and institutional status.
    - Upload profile photo and manage notification preferences.
- **Community Interaction**:
    - **Discussion Forums**: Community -> Category -> Thread -> Post. Includes "Follow Thread" and "Reply" features.
    - **Mentorship**: Browse Expert Directory -> Filter by Expertise/Region -> Send Mentorship Request (Pending Expert approval).
    - **Events**: Browse Calendar -> Filter by Type -> Register/Sign up for events.
- **Resource Management**: (See Section 5).

## 4. Feature Requirements (MoSCoW)
### Must Have
- **Expanded Identity System**: RBAC for the 6 roles identified.
- **Onboarding Flow**: Multi-step flow including Institutional Affiliation requests.
- **ORCID Validation**: Backend integration for ORCID verification.
- **Community & Forums Hierarchy**: Public vs Private communities.
- **Resource submission & Moderation**: (Figma Section 5).

## 5. Phase 1 MVP Scope (Expanded)
The Phase 1 MVP is now split into three core pillars: **Identity**, **Community**, and **Resources**.

### 5.1 Identity & Onboarding (Foundation)
- **Login/Sign-up**: Email-based auth with verification.
- **Structured Onboarding**: Capturing career stage, expertise, and institutional status.
- **Institutional Request Loop**: Workflow for members to request affiliation and admins to approve/reject.
- **ORCID Linkage**: Ability to associate verified research ID.

### 5.2 Community & Collaboration
- **Discussion Forums**: Core discussion engine with threading and basic moderation (Lock/Merge).
- **Expert Directory**: Publicly browsable directory of experts for mentorship discovery.
- **Mentorship Requests**: Simple request/approval flow between members and experts.
- **Events Listing**: Public calendar for Conferences, Workshops, and Webinars.

### 5.3 Resource Management (from Figma 17:1217)
- **Public Browsing**: Filtering by category/keyword.
- **Moderated Submission**: Member upload -> Moderator review -> Publish.
- **Draft/Publish Pipeline**: Strapi-native workflow for content quality control.

## 6. Non-Functional Requirements
- **Security**: Strict Role-Based Access Control (RBAC). Admin UI must be heavily filtered by logical conditions (e.g., Institution Admins only see their own members).
- **Scalability**: ERD should gracefully handle relationships between unified tags and the many heavily relational content types.

## 6. Success Metrics
- 100% representation of both the Figma entities (Institution, Mentorship) and Google Docs features (Communities, Forum, Reports) in the Data Model ERD.
- MJS ERD generator runs without errors.
