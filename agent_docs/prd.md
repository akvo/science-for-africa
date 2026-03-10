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

## 2. Target Users
- **Guest**: Unauthenticated users viewing public opportunities and basic platform information.
- **Member**: Standard authenticated researcher. Can participate in forums, view directory, and request Mentorship/Institutional Affiliation.
- **Institution Admin**: A designated member managing an Institution's profile, member affiliations, and organizational content.
- **Moderator (Community Admin)**: Governance role handling reported content, managing forum flow, and approving generic user submissions.
- **Platform/Super Admin**: Full platform management, global config, and oversight.

## 3. Key User Journeys
- **Registration & Onboarding**: Users define their bio, expertise, career stage, open mentor availability, and either request an **Institutional Affiliation** or link an ORCID ID.
- **Institutional Management**: An Institution Admin reviews affiliation requests from Members to build their verified directory.
- **Content Submission & Moderation**: Users submit Resources/Opportunities/Events. These enter a "Pending" queue (Draft) until an Institution Admin (if representing the org) or a Moderator approves them.
- **Community & Forum Participation**: Members browse structured Communities -> Forum Categories -> Threads. They can post Replies and Report violations.
- **Mentorship Direct Matching**: Members review the Directory for those with "Mentor Availability" and send structured connection requests.

## 4. Feature Requirements (MoSCoW)
### Must Have
- **Extended User Profiles**: Fields for Expertise, Regions, ORCID, and Roles.
- **Institutions**: Organization profiles with an "Affiliation Request" and approval loop managed by their assigned Institution Admin.
- **Resources, Opportunities & Events**: Central curated boards. Must support Strapi Draft/Publish for the moderation pipeline.
- **Communities & Forums Hierarchy**: Nested discussions (Community -> Forum Category -> Thread -> Post).
- **User Reporting System**: Peer moderation flow enabling users to flag posts/threads.
- **Unified Tagging**: Centralized taxonomy linking across all entities.

### Should Have
- **Mentorship Flow**: Direct request/approval workflows between users.
- **Real-Time Notifications**: Alerts for `@mentions` and replies.

### Won't Have (In Initial Sandbox)
- **Direct in-app messaging** outside of forum threads and initial mentorship connections.

## 5. Non-Functional Requirements
- **Security**: Strict Role-Based Access Control (RBAC). Admin UI must be heavily filtered by logical conditions (e.g., Institution Admins only see their own members).
- **Scalability**: ERD should gracefully handle relationships between unified tags and the many heavily relational content types.

## 6. Success Metrics
- 100% representation of both the Figma entities (Institution, Mentorship) and Google Docs features (Communities, Forum, Reports) in the Data Model ERD.
- MJS ERD generator runs without errors.
