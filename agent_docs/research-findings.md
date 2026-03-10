# Research Findings: Strapi Mapping & Limited Admin UI
**Project**: Science for Africa - External Platform
**Phase**: Analyze (v2 - Google Docs Update)

## 1. Gap Analysis: Platform Specifications to Strapi Entities

### Current Workflow (Google Docs Specification)
- The platform functions as a "Community of Practice" (CoP).
- Users join specific "Communities" (Thematic, Regional, Programme).
- Conversations happen in a Hierarchy: Community -> Forum Category -> Thread -> Post.
- Moderation relies on a robust "Reporting" system, allowing Members to flag posts/threads and Moderators to hide/dismiss them.
- A single unified Tag taxonomy is used heavily across Opportunities, Resources, Threads, and Users.

### Strapi Architecture Mapping (Desired State)

*   **Plugin Overrides**: We must extend the `plugin::users-permissions.user` collection extensively (Expertise, Career Stage, Region, Mentor toggle).
*   **Hierarchical Forums**:
    *   Strapi doesn't natively support deep arbitrary nesting well without custom plugins. We will explicitly model relations: `Thread` belongs to `ForumCategory` which belongs to `Community`.
    *   `Post` replies might be threaded. A self-referencing relationship (`parent_post` pointing to `Post`) handles nested replies.
*   **Polymorphic Reporting**:
    *   The `Report` entity must link to either a `Thread` or a `Post`. Strapi handles polymorphic relations via components or dynamic zones, but for simple ERDs, we can use two nullable relational fields: `reported_post` and `reported_thread`.
*   **Moderation state**:
    *   Instead of just Draft/Publish, Forums need explicit statuses (e.g. `status: open, closed, archived` for Threads and `status: published, hidden, flagged` for Posts). An enumeration (enum) field is best suited for this.

## 2. Limited Admin UI & Moderator Access Restrictions

1. **Platform Admin**: Superadmin. Full access.
2. **Community Admin (Moderators)**:
   - Needs access to the "Reports" collection to moderate users.
   - Needs `Read/Update` on all `Posts` and `Threads` to apply "Hidden" or "Locked" statuses.
3. **Contributor**:
   - Needs `Create` access for `Opportunities` and `Resources`, but their default state will map to "Draft" in Strapi (unseen by Guests/Members).

## 3. Recommended Data Relationships Update

*   `User` *Many-to-Many* `Community` (As Members)
*   `Community` *Has-Many* `ForumCategory`
*   `ForumCategory` *Has-Many* `Thread`
*   `Thread` *Has-Many* `Post`
*   `Post` *Belongs-To* `Post` (Optional: Parent Reply)
*   `Report` *Belongs-To* `User` (Reporter)
*   `Report` *Belongs-To* `Post` OR `Thread`
*   `Tag` *Many-to-Many* `User`, `Opportunity`, `Resource`, `Thread`, `Event`
