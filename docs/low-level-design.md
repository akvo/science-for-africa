# Low-Level Design: Science for Africa Platform

Please note that this document outlines parts of the solution beyond the MVP delivery. This holistic view gives more context to the design of the MVP and indicates the likely evolution pathway.

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
| PostgreSQL | 16 | Primary data store (all environments) |
| users-permissions plugin | 5.33 | Authentication, JWT, registration |
| config-sync plugin | 3.2 | Version-controlled Strapi configuration |
| documentation plugin | 5.33 | Auto-generated OpenAPI 3.0.0 docs |
| `@strapi/provider-email-nodemailer` | 5.33 | Email delivery |
| `@strapi-community/strapi-provider-upload-google-cloud-storage` | 5 | Cloud file storage |
| Jest + Supertest | 30 / 7 | Backend API testing |

### 1.3 API Layer

Strapi can auto-generate both REST and GraphQL APIs from content-type schemas. The frontend will use a mix:

- **GraphQL API** — primary data fetching for content pages when nested queries are required (communities, threads, resources, events)
- **REST API** — authentication flows and simple single entity fetches (`/api/auth/local`, `/api/auth/local/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/email-confirmation`) and admin operations

#### Custom REST Endpoints

Beyond Strapi's auto-generated CRUD, we will create custom endpoints with hand-written controllers. These involve business logic, side effects, or cross-entity aggregation that Strapi does not provide out of the box, Examples include:

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
SMTP_HOST + SMTP_USERNAME + SMTP_PASSWORD configured → Mailjet (production)
Otherwise → Mailpit (host: mailpit, port: 1025, no TLS/auth)
```

This is configured in `backend/config/plugins.js`. The fallback is automatic based on whether SMTP credentials are present.

**Production provider:** [Mailjet](https://www.mailjet.com/) via SMTP relay. Nodemailer connects to Mailjet's SMTP endpoint — no Mailjet-specific SDK required.

**Environment variables** (production):

| Variable | Example (Mailjet) |
|---|---|
| `SMTP_HOST` | `in-v3.mailjet.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USERNAME` | Mailjet API key |
| `SMTP_PASSWORD` | Mailjet Secret key |
| `SMTP_FROM` | Verified sender address |

**Dev environment:** Mailpit runs as a Docker Compose service — SMTP on port 1025, web UI on port 8025 for inspecting sent emails.

### 1.5 Notifications

All notifications are email-only and dispatched synchronously via the Strapi email plugin. No real-time push or WebSocket notifications in MVP.

**Example Notification triggers:**

| Trigger | Recipient | Content |
|---|---|---|
| Email verification | New user | Clickable verification link AND a copyable OTP code (dual-path: user can click the link in email or paste OTP into verification page) |
| Password reset | User | Reset link with token |
| Post moderation result | Post author | Approval or decline with reason |
| Collaboration invite | Invitee | Link to collaboration call |
| Mentorship request | Potential mentor | Collaboration details with accept/decline link |
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

### 2.1 Entity Overview (this will be extended as we add more features)

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
| **CollaborationCall** | Time-bounded opportunities within a community. Active / Completed status |
| **CollaborationMentor** | Join table: User + CollaborationCall. Supports multiple mentors per collaboration with individual status and goals |
| **Resource** | Shared files/links (Publication, Training, Toolkit, Dataset) with download tracking |
| **Event** | Community events (Webinar / Workshop / In-person). Capacity limits, certificate issuance |
| **EventRegistration** | User + Event + status (registered / waitlisted / attended) |
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

### 3.2 Azure Production (Kubernetes)

Production runs on Azure Kubernetes Service (AKS), mirroring the GCP staging pattern but replacing Akvo-specific tooling with Azure-native equivalents.

#### What changes from GCP staging

The GCP staging pipeline uses Akvo's private `composite-actions` repo for Docker builds, pushes to Google Container Registry, and K8s rollouts. These are Akvo-internal and tied to GCP service accounts. For Azure production:

| GCP Staging (Akvo) | Azure Production | Notes |
|---|---|---|
| Google Container Registry (GCR) | Azure Container Registry (ACR) | `az acr login` replaces `gcloud auth configure-docker` |
| `akvo/composite-actions/docker-build` | `docker/build-push-action` | Standard GitHub Action, no private repo dependency |
| `akvo/composite-actions/docker-push` | `docker/build-push-action` (with push: true) | Build + push in one step |
| `akvo/composite-actions/k8s-rollout` | `azure/k8s-deploy` | Official Azure GitHub Action for K8s deployments |
| `GCLOUD_SERVICE_ACCOUNT_REGISTRY` | `AZURE_CREDENTIALS` (service principal) | Single credential for ACR + AKS access |
| `GCLOUD_SERVICE_ACCOUNT_K8S` | (same service principal) | Azure service principal covers both registry and cluster |
| `GH_PAT` (composite-actions access) | Not needed | No private action repos required |

#### Azure infrastructure setup

**Prerequisites:**
1. **Azure Container Registry (ACR)** — stores Docker images for nginx, frontend, backend
2. **Azure Kubernetes Service (AKS)** — runs the cluster (minimum: 2-node pool, Standard_B2s for MVP)
3. **Azure Database for PostgreSQL Flexible Server** — managed PostgreSQL 16 (replaces in-cluster database container)
4. **Azure Blob Storage** — file uploads (swap `GCS_*` env vars for Azure equivalents, use a community Strapi Azure upload provider or mount as volume)
5. **DNS** — A-record pointing to AKS ingress controller external IP

**AKS cluster layout:**

```
Namespace: science-of-africa
├── nginx-deployment        (1 replica)   — reverse proxy
├── frontend-deployment     (1 replica)   — Next.js
├── backend-deployment      (1 replica)   — Strapi
├── nginx-service           (ClusterIP)
├── frontend-service        (ClusterIP)
├── backend-service         (ClusterIP)
├── ingress                 (NGINX Ingress Controller — TLS via cert-manager + Let's Encrypt)
├── configmap               (PUBLIC_URL, BACKEND_URL, EMAIL_CONFIRMATION_URL, etc.)
└── secret                  (SMTP creds, JWT keys, DB connection string, ACR pull secret)
```

The three-deployment pattern (nginx, frontend, backend) matches GCP staging exactly. The only differences are infrastructure-level: managed database instead of a container, Azure Blob instead of GCS, and cert-manager for TLS instead of Traefik.

**TLS:** Use the [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/) with [cert-manager](https://cert-manager.io/) for automatic Let's Encrypt certificates. This replaces Traefik (which is used in the self-hosted Docker Compose pattern but is not needed in K8s).

#### GitHub Actions production workflow

The production workflow will be a new file (e.g. `.github/workflows/deploy-prod.yml`) triggered on GitHub release publish, following the same pattern as climate-think-and-do-tank's release-based production deploys:

```
Release published
  → build-push job:
      Login to ACR (azure/docker-login action)
      Docker build + push: nginx, frontend, backend → ACR
      Tag with release version
  → deploy job (depends on build-push):
      Set AKS context (azure/aks-set-context action)
      kubectl set image: update each deployment to new image tag
      kubectl rollout status: wait for healthy rollout
```

**Secrets required:**
- `AZURE_CREDENTIALS` — service principal JSON (ACR push + AKS deploy)
- `ACR_LOGIN_SERVER` — e.g. `scienceforafrica.azurecr.io`

#### Setup steps

1. Create resource group, ACR, AKS cluster, and managed PostgreSQL via Azure CLI or Terraform
2. Attach ACR to AKS (`az aks update --attach-acr`)
3. Install NGINX Ingress Controller and cert-manager in the cluster
4. Apply K8s manifests: namespace, deployments, services, ingress, configmap, secret
5. Configure DNS A-record to point to the ingress external IP
6. Add `AZURE_CREDENTIALS` and `ACR_LOGIN_SERVER` to GitHub repo secrets
7. Create a GitHub release to trigger the first production deploy

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
│  │ Azure DB for │  │ Azure Blob Storage        │   │
│  │ PostgreSQL   │  │ (file uploads)            │   │
│  │ (full-text   │  │                           │   │
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
| `GCS_SERVICE_ACCOUNT`, `GCS_BUCKET_NAME`, `GCS_BASE_PATH`, `GCS_BASE_URL`, `GCS_PUBLIC_FILES`, `GCS_UNIFORM` | Backend (uploads) | GCP staging (optional — falls back to local) |
| Azure Blob Storage credentials (TBD — depends on Strapi upload provider chosen) | Backend (uploads) | Azure production |
| `HOST`, `PORT` | Backend (server) | All environments |
| `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET` | Backend (security) | All environments |
| `DATABASE_CLIENT`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` | Backend (database) | Production |
| `AZURE_CREDENTIALS` | GitHub Actions | Production CI/CD |
| `ACR_LOGIN_SERVER` | GitHub Actions | Production CI/CD |
