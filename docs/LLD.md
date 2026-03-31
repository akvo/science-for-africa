# Low-Level Design (LLD): Science for Africa

## System Summary
The Science for Africa platform is a full-stack application leveraging **Strapi v5** for the backend and **Next.js 16** for the frontend. The project follows a headless CMS architecture where Strapi acts as the single source of truth for content and authentication, while Next.js provides a high-performance, SEO-friendly user interface.

**Tech Stack:**
- **Backend:** Strapi v5 (Node.js 20+)
- **Frontend:** Next.js 16 (Page Router), React 19
- **Styling:** Tailwind 4, shadcn/ui
- **Database:** PostgreSQL (Production), SQLite (Local Development)
- **Infrastructure:** Docker Compose (Nginx, Postgres, pgAdmin)

## Module Decomposition

### `/backend` (Strapi v5)
- `config/`: Application, database, plugin, and server configurations.
- `src/api/`: Custom content types, controllers, services, and routes.
- `src/extensions/`: Extensions to core Strapi plugins (e.g., `users-permissions`).
- `src/middlewares/`: Custom global and route-specific middlewares (e.g., `two-factor-lock`).
- `src/index.js`: Initialization scripts and lifecycle hooks.
- `src/api/auth/`: Custom authentication extensions for 2FA.

### `/frontend` (Next.js 16)
- `pages/`: Application routes following the Page Router convention.
- `styles/`: Global CSS and Tailwind 4 configuration.
- `components/`: UI components (including shadcn/ui primitives).
- `lib/`: Utility functions and API clients.

## Data Architecture
Strapi manages the data layer. For the Authentication and Onboarding flow, the **Unified User Entity** will extend the default `users-permissions` User content type with additional profile fields.

**Core Entities:**
- **User**: Extended with:
    - `firstName`, `lastName` (String)
    - `fullName` (Computed via lifecycle)
    - `interests` (Component: `user.interest`, Max 5)
    - `educationTopic` (String)
    - `educationLevel` (Enum: `Bachelors`, `Masters`, `PhD`, etc.)
    - `institution` (Relation: Many-to-One with Institution)
    - `affiliationStatus` (Enum: `Pending`, `Approved`, `Rejected`)
    - `orcidId` (String, 16-digit regex)
    - `onboardingComplete` (Boolean)
    - `twoFactorSecret` (String, Private)
    - `twoFactorEnabled` (Boolean)
- **Institution**:
    - `name` (String, Unique)
    - `country` (String)
    - `type` (Enum: `Academic`, `Research`, `NGO`, `Government`, `Private`)
    - `verified` (Boolean)

## Integration Points
- **Email Service**: Configured via `@strapi/provider-email-nodemailer` for verification and recovery links.
- **Storage**: Configured via `@strapi-community/strapi-provider-upload-google-cloud-storage`.
- **Frontend-Backend**: Next.js uses rewrites to proxy `/api/*` requests to the Strapi backend.

## Security & Safety
- **Authentication**: JWT-based session management managed by Strapi.
- **2FA Flow (ADR-001)**:
    1. User authenticates via password.
    2. Server detects `twoFactorEnabled: true`.
    3. Server issues a "Partial JWT" (restricted scope).
    4. Client presents TOTP challenge.
    5. Server verifies TOTP and issues "Full Access JWT".
- **Protection**: `two-factor-lock` middleware blocks access to protected routes for users with a Partial JWT or unverified onboarding.
- **Case Sensitivity**: Unique fields (e.g., names) will enforce case-insensitive uniqueness at the database/lifecycle level.
