# Product Requirements Document (PRD)
**Project**: Science for Africa - External Platform
**Status**: Clean Slate Initialized (Figma Aligned)

## 1. Vision & Goals
The Science for Africa (SfA) external platform aims to create a central Community of Practice (CoP) hub for research managers across Africa. It facilitates collaboration, knowledge sharing, and professional growth across the African scientific ecosystem.

**Primary Goals:**
- Connect individuals with relevant scientific **Institutions** and peers.
- Provide a central repository for resources, tools, and impact stories (**Knowledge Base**).
- Surface opportunities (funding, jobs, scholarships) logically and accessibly.
- Drive engagement through moderated community forums and **Mentorship**.

## 2. Target Users (Roles)
Based on Figma [Collaboration & Community](https://www.figma.com/board/Chk297BVmFWcw4zJjuqX5F/Science-for-Africa--External-?node-id=55-3793), roles are partitioned into two tiers (Detailed in [RBAC & User Architecture](file:///Users/galihpratama/Sites/science-for-africa/agent_docs/features/RBAC-User-Architecture.md)):

### 2.1 Platform Users (Via Next.js Frontend Dashboard)
- **Guest**: Unauthenticated. Read-only access to public content.
- **Member (Individual)**: Authenticated. Can participate in public forums and request mentorship.
- **Member (Institutional)**: Authenticated and affiliated with an Institution.
- **Expert**: Verified member who can offer mentorship.
- **Institution Admin**: Manages organization affiliation and members.
- **Moderator/Community Admin**: Oversees forum content and reports.

### 2.2 System Administrators (Via Strapi Admin Panel)
- **Platform Admin / Developer**: Full system control and content modeling.

## 3. Key User Journeys
- **Registration & Onboarding**:
    - Sign-up with Email/Password -> Email Verification.
    - **ORCID OAuth 2.0**: Sign-up or sign-in directly using ORCID identity (Verified ownership).
    - **Institutional Affiliation**: Search/Join Institution (Pending Admin approval).
- **Community Interaction**:
    - **Forums**: Community -> Category -> Thread -> Post.
    - **Mentorship**: Discover Experts -> Send Mentorship Request.
- **Knowledge Base**:
    - Browse and search Resources & Opportunities.
    - Moderated submission workflow for affiliated members.

## 4. Feature Requirements (Pillars)

### 4.1 Identity (Foundation)
- RBAC for the identified roles.
- Institutional affiliation workflow.
- **ORCID OAuth 2.0**: Mandatory for "Verified" researcher status.

### 4.2 Community
- Hierarchical discussion engine (Threaded).
- Peer reporting (Flagging) and moderator dashboard.
- Expert directory for mentorship discovery.

### 4.3 Knowledge Base (Resource & Opportunities)
- Categorized resource repository with draft/publish workflow.
- Opportunity listing (Grants, Jobs, etc.) with unified tagging.

## 5. Success Metrics
- 100% representation of FIGMA user flows in the data model.
- Successful generation of ERD from the Clean Slate schema.
- Verification that all legacy LLD "debt" has been removed or justified by fresh requirements.
