# Low-Level Design: Science for Africa Platform

## 1. Tech Stack

### 1.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | Page Router, SSR/SSG framework |
| React | 19 | UI component library |
| Tailwind CSS | 4 | Utility-first styling |
| shadcn/ui | 4.1 | Accessible component primitives (via `@base-ui/react`) |
| Zustand | 5 | Lightweight client state management |
| react-hook-form + Zod | 4.x / 4.3 | Form handling and schema validation |
| axios | - | HTTP client for API calls |
| Embla Carousel | - | Content carousels |
| Sonner | 2 | Toast notifications |
| Jest + React Testing Library | 30 / - | Unit and integration testing |

### 1.2 Backend

| Technology | Version | Purpose |
|---|---|---|
| Strapi | 5.33 | Headless CMS on Node.js 20+ |
| PostgreSQL | 16 | Primary data store (production) |
| SQLite | - | Local development database |
| users-permissions plugin | 5.33 | Authentication, JWT, registration |
| config-sync plugin | 3.2 | Version-controlled Strapi configuration |
| documentation plugin | 5.33 | Auto-generated OpenAPI 3.0.0 docs |
| `@strapi/provider-email-nodemailer` | 5.33 | Email delivery |
| `@strapi-community/strapi-provider-upload-google-cloud-storage` | 5 | Cloud file storage |
| Jest + Supertest | 30 / 7 | Backend API testing |

### 1.3 API Layer

Strapi auto-generates both REST and GraphQL APIs from content-type schemas. The frontend uses:

- **GraphQL API** — primary data fetching for content pages (communities, threads, resources, events)
- **REST API** — authentication flows (`/api/auth/local`, `/api/auth/local/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/email-confirmation`) and admin operations

#### Custom REST Endpoints

Beyond Strapi's auto-generated CRUD, these custom endpoints require hand-written controllers because they involve business logic, side effects, or cross-entity aggregation that Strapi does not provide out of the box:

| Endpoint | Method | Justification |
|---|---|---|
| `/api/auth/me` | `PUT` | Profile update with custom fields (bio, orcidId, careerStage, socialLinks, notificationPreferences) beyond the standard user schema |
| `/api/posts/:id/moderate` | `PUT` | Moderation action (approve/decline) — wraps status update + notification trigger to post author |
| `/api/communities/:id/join` | `POST` | Join community — side effects: increment memberCount, create CommunityMembership with `member` role, notify community admins |
| `/api/communities/:id/leave` | `DELETE` | Leave community — decrement memberCount, remove CommunityMembership |
| `/api/search` | `GET` | Cross-entity search aggregation (users, communities, threads, resources) before Elasticsearch is introduced |
| `/api/notifications/dispatch` | `POST` | Internal endpoint for lifecycle hooks to trigger email notifications via Strapi email plugin |

### 1.4 Email

Email delivery uses `@strapi/provider-email-nodemailer` with automatic environment detection:

```
SMTP_HOST + SMTP_USERNAME + SMTP_PASSWORD configured → external SMTP provider
Otherwise → Mailpit (host: mailpit, port: 1025, no TLS/auth)
```

This is configured in `backend/config/plugins.js`. No `PLUGIN_PROVIDERS` env var is needed — the fallback is automatic based on whether SMTP credentials are present.

**Environment variables** (production):

| Variable | Purpose |
|---|---|
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port |
| `SMTP_USERNAME` | SMTP auth username |
| `SMTP_PASSWORD` | SMTP auth password |
| `SMTP_FROM` | Default sender address (also used as `defaultReplyTo`) |

**Dev environment:** Mailpit runs as a Docker Compose service — SMTP on port 1025, web UI on port 8025 for inspecting sent emails.

### 1.5 Notifications

All notifications are email-only and dispatched synchronously via the Strapi email plugin. No real-time push or WebSocket notifications in MVP.

**Notification triggers:**

| Trigger | Recipient | Content |
|---|---|---|
| Email verification | New user | Clickable verification link AND a copyable OTP code (dual-path: user can click the link in email or paste OTP into verification page) |
| Password reset | User | Reset link with token |
| Post moderation result | Post author | Approval or decline with reason |
| Collaboration invite | Invitee | Link to collaboration call |
| Event reminder | Registered attendees | Upcoming event details |
| Mentorship request | Potential mentor | Request details with accept/decline link |
| New member joined | Community admins | Member name and community |

The email verification flow: after registration, the user lands on a verification page. Strapi sends an email containing both a clickable confirmation link and a plain OTP code. The user can either click the link (which redirects back to the app) or paste the OTP directly into the verification page — avoiding the need to open a new browser tab.

### 1.6 Infrastructure & Tooling

| Tool | Purpose |
|---|---|
| Docker & Docker Compose | Containerised development, mimic-prod, and self-hosted environments |
| Nginx 1.26 (Alpine) | Reverse proxy in dev/staging — routes `/` → frontend:3000, `/cms/` → backend:1337 with path rewrite |
| Traefik v3.3 | Self-hosted reverse proxy with automatic HTTPS via Let's Encrypt ACME |
| Google Cloud Storage | Production file uploads (swappable — falls back to local if `GCS_SERVICE_ACCOUNT` not set) |
| GitHub Actions | CI/CD — build, push to GCR, Kubernetes rollout |
| Mailpit | Dev email testing (SMTP mock + web inspector) |
| PgAdmin 4 | Dev database inspection (port 5050) |

## 2. Data Model

The full entity-relationship diagram is in [`docs/diagrams/data-model.mmd`](diagrams/data-model.mmd). This section describes the domain entities, their purpose, and key design decisions.

All entities use Strapi's `documentId` as primary key and include automatic `createdAt` / `updatedAt` timestamps.

### 2.1 Entity Overview

| Entity | Purpose |
|---|---|
| **User** | Extended Strapi user: bio, orcidId, careerStage, educationLevel, mentorAvailability, notificationPreferences, socialLinks |
| **Institution** | Organisations (Academic / Research / NGO / Government / Private); users affiliated via relation |
| **Community** | Top-level communities and sub-communities. Self-referential `parent` field for hierarchy. Privacy, type, branding |
| **CommunityMembership** | Explicit join table: User + Community + role (admin / moderator / curator / member) |
| **CommunityRule** | Rules per community with sort order |
| **ForumCategory** | Organises threads within a community. Self-referential parent for nesting |
| **Thread** | Discussion topics: title, content, pinned/locked/answered flags, view/reply counts |
| **Post** | Replies within threads. Self-referential for nested replies. Moderation status (pending / approved / declined) |
| **CollaborationCall** | Time-bounded opportunities within a community. Mentor assignments. Active / Completed status |
| **Resource** | Shared files/links (Publication, Training, Toolkit, Dataset) with download tracking |
| **Event** | Community events (Webinar / Workshop / In-person). Capacity limits, certificate issuance |
| **EventRegistration** | User + Event + status (registered / waitlisted / attended) |
| **MentorshipRelation** | Mentor-mentee pairs with status lifecycle and goals |
| **Tag** | Cross-entity taxonomy (expertise, region, topic) — applied to Resources, Threads, Users, Communities |
| **Report** | Content flagging for moderation (Spam / Harassment / Misinformation / Other) |
| **Notification** | Email notification log with delivery status |
| **SavedPost** | User bookmarks |
| **Follow** | User-to-user following |

### 2.2 Key Design Decisions

**Community hierarchy via self-reference.** The `Community.parent` relation enables sub-communities without schema changes. A sub-community is simply a Community whose `parent` points to another Community. Future evolution: a `CommunityParent` join table will allow a sub-community to belong to multiple parent communities — this requires only a new content-type, not a schema migration on Community itself.

**CommunityMembership as explicit join table.** Strapi's default many-to-many relation doesn't support extra fields on the join. By modelling CommunityMembership as its own content-type with `user`, `community`, and `role` fields, we can assign granular roles (admin, moderator, curator, member) and track join timestamps — all queryable through Strapi's standard APIs.

**Post moderation via status enum.** Posts carry a `status` field (`pending | approved | declined`) rather than a separate moderation queue table. This keeps the data model flat and allows filtering by status in standard queries. The custom `/api/posts/:id/moderate` endpoint wraps the status update with a notification side effect.

**Tags are polymorphic.** A single `Tag` entity is related to Resources, Threads, Users, and Communities via separate Strapi relation fields. This avoids duplicating tag tables per entity while keeping each relation queryable.

**Notification as a log table.** The `Notification` entity records every email sent (type, subject, recipient, delivery status). This is for auditability — it does not drive delivery. Delivery is synchronous via the email plugin at the time of the triggering event.

**Institution as a standalone entity.** Rather than storing institution as a string on User, Institution is a first-class entity with type and country. This enables institution-level queries (e.g., "all users from University X") and admin verification workflows.

### 2.3 User Story Coverage

Every user story maps to at least one entity in the data model:

| Feature Area | Entities Used |
|---|---|
| Registration & onboarding | User, Institution |
| Profile management | User (extended fields), Tag, Follow |
| Communities | Community, CommunityMembership, CommunityRule |
| Forum discussions | ForumCategory, Thread, Post, Tag |
| Content moderation | Post (status), Report |
| Resources & knowledge sharing | Resource, Tag |
| Events | Event, EventRegistration |
| Mentorship | MentorshipRelation, User (mentorAvailability) |
| Collaboration | CollaborationCall |
| Notifications | Notification |
| Bookmarks & following | SavedPost, Follow |

## 3. Deployment & Infrastructure

### 3.1 GCP Staging (Kubernetes)

Automated deployment on every push to `main` via GitHub Actions (`.github/workflows/deploy-test.yml`):

```
Push to main
  → build-push job:
      Docker build: nginx, frontend, backend images
      Docker push: → Google Container Registry (via Akvo composite-actions)
  → rollout job (depends on build-push):
      k8s-rollout: nginx-deployment, frontend-deployment, backend-deployment
      Namespace: science-of-africa-namespace
```

**Secrets required:**
- `GCLOUD_SERVICE_ACCOUNT_REGISTRY` — push to GCR
- `GCLOUD_SERVICE_ACCOUNT_K8S` — Kubernetes rollout
- `GH_PAT` — access to `akvo/composite-actions` repo

**Three Kubernetes deployments:**
1. **nginx** — reverse proxy, routes `/` and `/cms/`
2. **frontend** — Next.js production build (Node 20 Alpine, port 3000)
3. **backend** — Strapi production build (Node 22 Alpine, port 1337)

### 3.2 Self-Hosted / Client Infrastructure

Following the pattern established in [climate-think-and-do-tank](https://github.com/akvo/climate-think-and-do-tank), a `self-hosted/` directory will contain everything needed to deploy on any VM with Docker:

```
self-hosted/
├── compose.yml                         # PostgreSQL, backend, frontend, Traefik
├── .env.example                        # Environment variable template
├── update.sh                           # git pull && docker compose build --no-cache && restart
└── helper/
    └── generate_dynamic_config.sh      # Generates Traefik routing from WEBDOMAIN env var
```

**compose.yml services:**

| Service | Image | Purpose |
|---|---|---|
| db | postgres:17-alpine | PostgreSQL with persistent volume, health checks |
| backend | Built from `../backend` | Strapi CMS, depends on healthy db |
| frontend | Built from `../frontend` | Next.js app, depends on backend |
| traefik | traefik:v3.3 | Reverse proxy, automatic HTTPS via Let's Encrypt |

**Traefik routing** (auto-generated by `generate_dynamic_config.sh` from `WEBDOMAIN` env var):
- `https://{WEBDOMAIN}/` → frontend:3000
- `https://{WEBDOMAIN}/cms/` → backend:1337 (with `/cms` prefix stripped)
- HTTP → HTTPS permanent redirect
- Let's Encrypt TLS certificates via ACME challenge

**Deployment flow:**
1. GitHub Actions → SSH into VM → run `update.sh`
2. `update.sh`: `git pull && docker compose build --no-cache && docker compose up -d`

**Persistent volumes:** `pg-data` (database), `traefik-certificates` (Let's Encrypt), `strapi-data` (uploads)

### 3.3 Azure Setup

The self-hosted pattern is cloud-agnostic. For Azure specifically:

**Minimum requirements:** Azure VM (Ubuntu 22.04+), Docker installed, DNS A-record pointing to VM IP.

**Steps:**
1. Provision Azure VM, install Docker and Docker Compose
2. Clone repo, `cd self-hosted/`
3. Copy `.env.example` → `.env`, configure:
   - `WEBDOMAIN` — public domain name
   - `SMTP_*` — email delivery credentials
   - `DATABASE_*` — PostgreSQL credentials (internal to compose network)
   - `APP_KEYS`, `JWT_SECRET`, etc. — Strapi security keys
4. Run `./helper/generate_dynamic_config.sh` to create Traefik routing config
5. `docker compose up -d` — Traefik handles Let's Encrypt automatically

**Optional Azure-managed upgrades:**
- **Azure Database for PostgreSQL** — replace the `db` container with a managed instance; update `DATABASE_*` env vars to point externally
- **Azure Blob Storage** — swap upload provider from GCS to Azure Blob (requires a community Strapi upload provider for Azure)

### 3.4 Scaling Pathway

#### MVP — Phase 1 (current)

```
┌─────────────────────────────────────────────────────┐
│  Single Server                                      │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Frontend  │  │  Nginx/  │  │     Strapi       │  │
│  │ Next.js   │  │ Traefik  │  │  ┌────────────┐  │  │
│  └──────────┘  └──────────┘  │  │User Service │  │  │
│                              │  │Collab Service│  │  │
│                              │  │Content Service│ │  │
│                              │  └────────────┘  │  │
│                              └──────────────────┘  │
│                                                     │
│  ┌──────────────┐  ┌───────────────────────────┐   │
│  │ PostgreSQL   │  │ Cloud Object Storage      │   │
│  │ (full-text   │  │ (GCS or Azure Blob)       │   │
│  │  search)     │  │                           │   │
│  └──────────────┘  └───────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

- Single server instance running all containers
- No real-time WebSockets
- PostgreSQL full-text search (no dedicated search engine)
- Synchronous email dispatch
- Strapi monolith handles all domain logic (User, Collaboration, Content services are logical modules within Strapi, not separate processes)

#### Phase 2 — Evolution (when load demands it)

```
┌───────────┐
│   CDN     │  Cloudflare / Akamai — static assets, edge caching
└─────┬─────┘
      │
┌─────▼──────────┐
│  API Gateway   │  Load balancing, routing, rate limiting
└─────┬──────────┘
      │
┌─────▼──────────────────────────────────────────┐
│  Application Services                          │
│  ┌──────────────────────────────────────────┐  │
│  │  Strapi (horizontal replicas)            │  │
│  │  Stateless — add replicas behind LB      │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌────────────────┐  ┌──────────────────────┐  │
│  │ Search Service │  │ Notification/Chat    │  │
│  │ Elasticsearch  │  │ Socket.io            │  │
│  └────────────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────┘
      │              │              │
┌─────▼───┐  ┌──────▼────┐  ┌─────▼──────┐
│ RabbitMQ│  │   Redis   │  │ PostgreSQL │
│ async   │  │ session + │  │ primary DB │
│ email,  │  │ API cache │  │            │
│ indexing│  │           │  │            │
└─────────┘  └───────────┘  └────────────┘
```

**Additions over Phase 1:**
- **CDN** — static asset delivery and edge caching
- **API Gateway** — load balancing, routing, rate limiting
- **Strapi horizontal scaling** — Strapi is stateless by design; add replicas behind a load balancer with no code changes
- **Redis** — session/API cache with cache invalidation
- **Elasticsearch** — advanced search and filtering, async indexing via message queue
- **RabbitMQ** — async processing: email dispatch, search indexing, notification fan-out
- **Socket.io** — real-time events (notifications, chat — future)

**Key architectural property:** Strapi's stateless design means Phase 1 → Phase 2 requires **no application code changes** — only infrastructure additions. The Strapi instances themselves remain unchanged; new services (Redis, Elasticsearch, RabbitMQ) are added alongside them.

### 3.5 Environment Variables Summary

| Variable | Used By | Required In |
|---|---|---|
| `PUBLIC_URL` | Root | All environments |
| `BACKEND_URL` | Backend (Strapi `url`) | Production, mimic-prod |
| `EMAIL_CONFIRMATION_URL` | Backend | All environments |
| `PASSWORD_RESET_URL` | Backend | All environments |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM` | Backend (email) | Production (optional in dev — falls back to Mailpit) |
| `GCS_SERVICE_ACCOUNT`, `GCS_BUCKET_NAME`, `GCS_BASE_PATH`, `GCS_BASE_URL`, `GCS_PUBLIC_FILES`, `GCS_UNIFORM` | Backend (uploads) | Production with GCS (optional — falls back to local) |
| `HOST`, `PORT` | Backend (server) | All environments |
| `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET` | Backend (security) | All environments |
| `DATABASE_CLIENT`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` | Backend (database) | Production |
| `WEBDOMAIN` | Traefik (self-hosted) | Self-hosted only |
