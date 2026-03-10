# Research Findings: Strapi Mapping & Limited Admin UI
**Project**: Science for Africa - External Platform
**Phase**: Analyze (v1)

## 1. Gap Analysis: Figma to Strapi Entities

### Current Workflow (Figma implied)
- Users register -> Choose Role -> Connect to Institution or remain standalone.
- Users see a unified feed of Opportunities, Resources, and Forums.
- "Moderation" is required for some content.

### Strapi Architecture Mapping (Desired State)
- **Plugin Overrides**: We will need to heavily extend the `plugin::users-permissions.user` collection to add fields like `Institution` (Relation), `Expertise`, `ORCID`, etc.
- **Content Moderation**: Strapi's Draft & Publish feature is perfect for the Moderation pipeline.
  - `Draft` = Pending (Only visible to the Author in the frontend, and Admins in the backend).
  - `Published` = Approved (Visible publicly).

## 2. Limited Admin UI Constraints
The requirement is to "build a limited admin ui using that interface - how to limit access to different entities and fields by role."

### Admin Roles Needed in Strapi
Strapi differentiates between *End Users* (Frontend/Users-Permissions plugin) and *Admin Users* (Backend/Admin panel).
To achieve the "Institution Admin" and "Community Admin" workflows via the **Strapi Admin Panel**, we must create Custom Admin Roles:

1. **Super Admin**: Built-in. Full access.
2. **Community Admin**:
   - Has `Read/Update/Publish` on all `Resources`, `Events`, `ForumThreads`.
   - Cannot manage Admin users.
3. **Institution Admin**:
   - Needs *Condition-based* access. In Strapi v4/v5 Enterprise, RBAC supports conditions (e.g., "Is Creator", or custom conditions like "Is Same Institution").
   - If using Community Edition, Institutional Admins might not be able to use the standard Strapi Admin Panel effectively without custom admin controllers, OR they manage their institution via the *Frontend* Next.js app, acting as End-Users rather than Strapi Admins.
   - *Recommendation for Architecture*: Define the Institution Admin workflow entirely on the Frontend via REST APIs to avoid Strapi Enterprise licensing for custom RBAC conditions, OR clearly define that "Institution Admins" are actually Strapi Admin users with a strict "Creator-only" policy on specific content types.

## 3. Recommended Data Relationships

- `User` *Belongs To* `Institution`
- `Resource` *Belongs To* `User` (Author)
- `Resource` *Belongs To* `Institution`
- `Opportunity` -> Standalone (Managed by Platform Admins)
- `ForumThread` *Has Many* `ForumPost`
- `ForumPost` *Belongs To* `User`
