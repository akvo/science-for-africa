# Product Requirements Document (PRD)
**Project**: Science for Africa - External Platform
**Status**: Refined (Google Docs Phase)

## 1. Vision & Goals
The Science for Africa (SfA) external platform aims to create a central Community of Practice (CoP) hub for research managers across Africa. It facilitates collaboration, knowledge sharing, and professional growth across the African scientific ecosystem.

**Primary Goals:**
- Connect individuals with relevant scientific institutions and peers.
- Provide a central repository for resources, tools, and impact stories.
- Surface opportunities (funding, jobs, scholarships) logically and accessibly.
- Drive engagement through structured, moderated community forums and mentorship.

## 2. Target Users
- **Guest**: Unauthenticated users viewing public opportunities and basic platform information.
- **Member**: Standard authenticated researcher or research manager. Can participate in forums, view directory, save opportunities.
- **Contributor**: Privileged user from partner institutions. Can upload resources and post opportunities for approval.
- **Moderator (Community Admin)**: Governance role handling reported content, managing forum flow, and approving user submissions.
- **Platform Admin**: Superadmin managing system config, tags, roles, and global communities.

## 3. Key User Journeys
- **Comprehensive Onboarding**: Users sign up defining their bio, institution, region, expertise, career stage, and ORCID ID.
- **Content Submission & Moderation**: Contributors submit Resources/Opportunities to a "Draft/Pending" queue. Moderators approve/publish them.
- **Community & Forum Participation**: Members join specific Communities (Thematic, Regional, etc.), browse Forum Categories, create Threads, and post Replies.
- **Peer Moderation**: Any Member can Report a Post/Thread for violations, queuing it in a Moderator Dashboard.

## 4. Feature Requirements (MoSCoW)
### Must Have
- **Extended User Profiles**: Fields for Career Stage, Mentor Availability, Region, and extensive Expertise mapping.
- **Communities & Forums Hierarchy**: Community -> Forum Category -> Thread -> Post tracking.
- **Opportunity & Resource Boards**: Curated lists with rich categorization (Types, Deadlines, Visibility).
- **Tagging Taxonomy**: A unified Tag entity to link Users, Opportunities, Resources, and Threads.
- **User Reporting System**: Ability to flag posts/threads and generate a Report for moderators.

### Should Have
- **Mentorship Direct Matching**: Direct "Mentor Availability" toggle with request/approval workflows.
- **Real-Time Notifications**: Alerts for `@mentions` and replies to owned threads.
- **Granular Moderator Dashboard**: Interface specifically for Moderators to dismiss, resolve, or hide reported content.

### Won't Have (In Initial Sandbox)
- **Direct in-app messaging** outside of forum threads and initial mentorship connections.

## 5. Non-Functional Requirements
- **Security**: Strict Role-Based Access Control (RBAC). Moderators must only see specific moderation queues; Contributors only see their own drafts.
- **Data Integrity**: Polymorphic relations or clear structural mapping for the "Report" entity (e.g., capable of linking to either a Thread or a Post).

## 6. Success Metrics
- 100% representation of the Google Docs hierarchical forum design in the Strapi Data Model ERD.
- MJS ERD generator runs without errors.
