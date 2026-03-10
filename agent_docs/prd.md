# Product Requirements Document (PRD)
**Project**: Science for Africa - External Platform
**Status**: Refined (Phase 2)

## 1. Vision & Goals
The Science for Africa external platform aims to create a central hub for researchers, institutions, and community members. It will facilitate collaboration, knowledge sharing, and professional growth across the African scientific ecosystem.

**Primary Goals:**
- To connect individuals with relevant scientific institutions.
- To provide a central repository for resources, tools, and impact stories.
- To surface opportunities logically (funding, jobs, scholarships).
- To foster community discussion and structured mentorship.

## 2. Target Users
- **Individual Researchers / Community Members**: Looking for opportunities, resources, discussions, and mentorship.
- **Institution Admins**: Managing their organization's presence, approving member affiliations, and moderating institutional content.
- **Platform/Community Admins**: Overseeing the health of the community, moderating global content, and managing platform-wide settings.

## 3. Key User Journeys
- **Registration & Onboarding**:
  - *Acceptance*: Users must be able to sign up, specify Expertise, and optionally request affiliation with an Institution or link an ORCID ID.
- **Content Submission & Moderation**:
  - *Acceptance*: A user submits a new Resource or Event. It must enter a "Draft/Pending" state and remain invisible on the frontend until an Admin publishes it.
- **Mentorship Flow**:
  - *Acceptance*: A Mentee can request a connection with a Mentor. The Mentor must be able to Accept or Decline.
- **Community Engagement**:
  - *Acceptance*: Users can participate in categorized forum threads.

## 4. Feature Requirements (MoSCoW)
### Must Have
- **User Profiles**: Distinct fields for Expertise, Interests, and Roles.
- **Institutions**: Organization profiles with member management and affiliation workflows.
- **Resources & Events**: User-submitted content with a moderation pipeline (Draft/Pending/Approved - using Strapi Draft/Publish feature).
- **Opportunities**: Centralized board for funding, jobs, and scholarships.
- **Role-Based Access Control**: Granular permissions.
  - *Acceptance*: Admin UI access must be restricted. Community Admins can moderate globally; Institution Admins can only govern their own members/content via custom RBAC conditions or a bespoke frontend view.

### Should Have
- **Community Forums**: Categorized threaded discussions.
- **Mentorship Matching**: Direct request/approval workflows between users.

### Could Have
- **Advanced Integration**: Direct ORCID API syncing.

### Won't Have (In Initial Sandbox)
- **Direct in-app messaging** outside of forum threads and initial mentorship requests.

## 5. Non-Functional Requirements
- **Security**: Strict access control limiting the Admin UI visibility based on the user's role. Field-level permissions must hide moderation statuses from regular users.
- **Scalability**: Data model should cleanly support high volumes of forum posts and relationship connections without N+1 query problems in Strapi.

## 6. Success Metrics
- 100% test coverage for the MJS ERD generator tool.
- Accurate mapping of all Figma entities to Strapi collections.

## 7. Out of Scope
- Implementation of the frontend or the Strapi backend controllers. (Scope is strictly defining the Data Model and generating the MJS ERD documentation).
