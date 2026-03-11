# Research Finding: Strapi v5 Architectural Mapping
**Date**: 2026-03-11
**Status**: Finalized
**Subject**: Technical mapping of the Logical ERD to Strapi v5 Native Features

## 1. Overview
This document outlines how the logical data model defined in `agent_docs/architecture.md` maps directly to **Strapi v5**'s native capabilities, ensuring a high-fidelity implementation.

## 2. Technical Mapping

### 2.1 Core Identity (Users-Permissions)
*   **Logical Entity**: `USER`
*   **Strapi Implementation**: Extends `plugin::users-permissions.user`.
*   **Custom Attributes**: `careerStage` (Enum), `expertise` (String/Relation), `orcidId`, etc.
*   **Role Logic**: Maps to Strapi's native RBAC (Role-Based Access Control).

### 2.2 Content Moderation (Draft/Publish)
*   **Entities**: `RESOURCE`, `OPPORTUNITY`, `EVENT`, `COURSE`.
*   **Workflow**: Leverages Strapi v5's **Draft/Publish** system.
*   **State Mapping**: 
    - `Pending` (Logic) -> `Draft` (Strapi)
    - `Published` (Logic) -> `Published` (Strapi)
*   **Benefit**: Eliminates the need for custom state machine code.

### 2.3 Hierarchical Forums
*   **Collections**: `Community`, `Forum_Category`, `Thread`, `Post`.
*   **Nesting**: Recursive parent-child relations for `POST` use Strapi's one-way relational fields.
*   **Slugs**: All public entities use Strapi's `UID` field type for SEO-friendly URLs.

### 2.4 Unified Taxonomy (Tag System)
*   **Implementation**: A single `TAG` collection with a `tagGroup` enum.
*   **Performance**: Use native **Many-to-Many** relations to facilitate high-speed filtering across multiple content types (Resources + Opportunities + Events).

### 2.5 Media & Assets
*   **Implementation**: All media fields (`profilePhoto`, `featuredImage`, `thumbnail`) map to the native Strapi **Media Library**.
*   **Optimization**: Automatic image resizing and resizing via Strapi's upload provider.

## 3. Implementation Guardrails
1.  **Slugs**: Every entry must have a unique UID field based on the `title` or `name`.
2.  **RBAC**: Institution Admins must be restricted via custom Strapi Policies to only manage content belonging to their specific Institution.
3.  **Components**: Complex fields (like `Eligibility Criteria`) should be modeled as **Strapi Components** for better data structure in the Next.js frontend.

## 4. Conclusion
The current ERD is 100% "Strapi-ready." No major structural changes are required to begin the backend construction phase.
