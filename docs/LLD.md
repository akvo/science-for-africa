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
- `src/middlewares/`: Custom global and route-specific middlewares.
- `src/index.js`: Initialization scripts and lifecycle hooks.

### `/frontend` (Next.js 16)
- `pages/`: Application routes following the Page Router convention.
- `styles/`: Global CSS and Tailwind 4 configuration.
- `components/`: UI components (including shadcn/ui primitives).
- `lib/`: Utility functions and API clients.

## Data Architecture
Strapi manages the data layer. For the Authentication and Onboarding flow, the **Unified User Entity** will extend the default `users-permissions` User content type with additional profile fields.

**Core Entities:**
- **User**: Extended with `firstName`, `lastName`, `fullName`, `interests`, `educationTopic`, `educationLevel`, `institution`, `affiliationStatus`, `orcidId`, `orcidVerified`, `onboardingComplete`.
- **Institution**: (To be defined) Collection type for institutional selection.

## Integration Points
- **Email Service**: Configured via `@strapi/provider-email-nodemailer` for verification and recovery links.
- **Storage**: Configured via `@strapi-community/strapi-provider-upload-google-cloud-storage`.
- **Frontend-Backend**: Next.js uses rewrites to proxy `/api/*` requests to the Strapi backend.

## Security & Safety
- **Authentication**: JWT-based session management managed by Strapi.
- **2FA**: Mandatory Authenticator App setup for all users.
- **Protection**: Middleware blocks access to protected routes for unverified or non-2FA users.
- **Case Sensitivity**: Unique fields (e.g., names) will enforce case-insensitive uniqueness at the database/lifecycle level.
