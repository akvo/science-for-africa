# Research Findings: Strapi Mapping & Limited Admin UI
**Project**: Science for Africa - External Platform
**Phase**: Analyze (v3 - Merged Figma & Google Docs)

## 1. Gap Analysis: Platform Specifications to Strapi Entities

### Current Workflow (Merged Overview)
- The platform functions as a "Community of Practice" (CoP) but anchors heavily on **Institutional Affiliation** (Figma).
- Users join specific "Communities" (Thematic, Regional) and participate in a Hierarchy: Community -> Forum Category -> Thread -> Post (Google Docs).
- **Mentorship** is a first-class citizen with direct user-to-user connection requests (Figma).
- Moderation relies on a robust "Reporting" system (Google Docs) and granular Admin roles for Institutions (Figma).

### Strapi Architecture Mapping (Desired State)

*   **User Extensions**: `plugin::users-permissions.user` needs `Institution` (Many-to-One), `Expertise`, `Career Stage`, and `MentorAvailability` (Boolean).
*   **Hierarchical Forums**:
    *   Strapi doesn't natively support deep arbitrary nesting well. We model relations: `Thread` belongs to `ForumCategory` which belongs to `Community`.
    *   `Post` replies are threaded via a self-referencing relationship (`parent_post`).
*   **Institutional Workflows**:
    *   `Institution` acts as a tenant for standard members. The `AffiliationStatus` controls whether users are officially linked.
*   **Polymorphic Reporting**:
    *   `Report` entity links to either a `Thread` or a `Post` using nullable relational fields (`reported_post`, `reported_thread`).

## 2. Limited Admin UI & Moderator Access Restrictions

1. **Platform Admin**: Superadmin. Full access.
2. **Community Admin (Moderators)**:
   - Needs access to the "Reports" collection to moderate users.
   - Needs `Read/Update` on all `Posts` and `Threads` to apply "Hidden" or "Locked" statuses.
3. **Institution Admin**:
   - Needs `Read/Update` specifically filtered to their `Institution` and its affiliated members. Often implemented via custom conditions in Strapi Enterprise, or via dedicated Frontend views querying only their institution's data.

## 3. Recommended Data Relationships Update

*   `User` *Many-to-One* `Institution` (Affiliation)
*   `User` *Many-to-Many* `Community` (As Members)
*   `User` *Many-to-Many* `MentorshipConnection` (Mentor/Mentee)
*   `Community` *Has-Many* `ForumCategory`
*   `ForumCategory` *Has-Many* `Thread`
*   `Thread` *Has-Many* `Post`
*   `Report` *Belongs-To* `Post` OR `Thread`
*   `Tag` *Many-to-Many* `User`, `Opportunity`, `Resource`, `Thread`, `Event`
