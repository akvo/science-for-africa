# Feature: RBAC & User Architecture

## 1. Overview
Science for Africa (SfA) utilizes a two-tier user architecture provided by Strapi v5. This distinction is critical for maintaining security, scalability, and a premium user experience.

## 2. The Two-Tier Model

| Tier | System Table | Primary Access Point | Primary Roles |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin_users` | Strapi Admin (`/admin`) | Platform Admins (Super Admins), Developers |
| **Platform User** | `up_users` | Next.js Frontend Dashboard | Scientists, Mentors, Institution Admins, Community Admins |

## 3. Architecture Logic

### 3.1 Strapi Admin Panel (`admin_users`)
*   **Purpose**: Content Modeling, System Configuration, and Global Moderation.
*   **Access Control**: Strictly restricted to internal personnel.
*   **Why**: Exposing the Strapi Admin UI to external partners (like Institution Admins) introduces unnecessary security risk and a complex, unbranded UI.

### 3.2 Next.js "App Admin" Dashboard (`up_users`)
*   **Purpose**: Business-level administration and community management.
*   **Access Control**: Role-based access within the Next.js frontend (e.g., `/dashboard/institution`).
*   **Key Journeys**:
    *   **Institution Admins**: Approve/Reject affiliation requests from researchers.
    *   **Community Admins**: Moderate forum content and manage community settings.
*   **Why**: Provides a high-fidelity, branded experience tailored to specific user tasks.

## 4. Implementation Details
*   **Authentication**: Both systems use JWT based on their respective Strapi endpoints.
*   **Permissions**: `up_users` permissions are programmatically managed via the `users-permissions` plugin as detailed in [API Authentication & RBAC Mapping](file:///Users/galihpratama/Sites/science-for-africa/agent_docs/features/api-auth-rbac.md).
