# ADR: User Model Unification (Strapi v5)
**Date**: 2026-03-11
**Status**: Approved
**Subject**: Deciding between Unified User Model vs. Split User/Profile Tables

## 1. The Context
In the legacy ERD (`docs/diagrams/entity-relationship.mmd`), the data model followed a **Split Approach**:
*   `User`: Handled only authentication (email, password, roles).
*   `UserProfile`: Handled application data (bio, expertise, institution).

For the current **Science for Africa** platform architectural update, we have moved to a **Unified Approach**, extending the native Strapi User model directly.

## 2. Comparison of Approaches

### A. Split Approach (Legacy)
| Pros | Cons |
| :--- | :--- |
| Strict separation of Auth vs. Application data. | Increased query complexity (requires joins/population). |
| Easier to expose a public "Profile" endpoint uniquely. | Slower frontend performance in Next.js Server Components. |
| Database normalization (Third Normal Form). | Dual-table management for a 1:1 relationship. |

### B. Unified Approach (Current)
| Pros | Cons |
| :--- | :--- |
| **High Velocity**: Simplest implementation in Strapi v5. | Main `User` table becomes "wider" with more columns. |
| **Performance**: Zero-join lookups for profiles in Next.js. | Requires careful RBAC filtering in the API layer. |
| **Logic Integrity**: Mentorship links are direct User-to-User. | |
| **Native Extensions**: Leverages Strapi v5's best practices. | |

## 3. Technical Rationale for Unified Approach

### 3.1 Strapi v5 Native Extension System
Strapi v5 is designed to be "plug-and-play." By extending the `plugin::users-permissions.user` content type via the `src/extensions/` system, we maintain 100% of the core security features (password hashing, JWT handling, email confirmation) while gaining the convenience of a flat data structure.

### 3.2 Frontend Developer Experience (DX)
In our Next.js 15 frontend, displaying a Member Directory or a User Dashboard requires a single fetch request. Amelia (Developer) can access `user.bio` and `user.careerStage` without the overhead of Strapi's deep population (`?populate=user_profile`), which significantly reduces API response times and client-side logic complexity.

### 3.3 Relational Logic (Mentorship & Content)
The **Science for Africa** platform relies heavily on peer-to-peer relationships (Mentors/Mentees) and content authorship.
*   **Logical Link**: A `Thread` is authored by a `User`.
*   **Direct Access**: Displaying the author's expertise next to their forum post is instantaneous when the expertise is on the `User` object itself.

## 4. Security Mitigations
To ensure the unified approach remains secure, we implement:
*   **Field-Level Permissions**: Using Strapi's `sanitizedEntity` helper to ensure sensitive fields (passwords, reset tokens) are NEVER exposed to the frontend.
*   **Custom Policies**: Ensuring that only the account owner or a Platform Admin can modify profile-specific fields.

## 5. Conclusion
The **Unified User Model** was selected to maximize **Developer Velocity** and **Runtime Performance** while maintaining the full security suite of the Strapi v5 `users-permissions` plugin. It is the architecturally superior choice for the high-engagement, highly relational nature of the SFA Scientific Community platform.
