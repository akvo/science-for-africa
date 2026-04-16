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
| next-i18next | 15.4 | Internationalization framework for Next.js |
| i18next / react-i18next | 24 / 15 | i18n core and React bindings |
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
- **REST API** — authentication flows and simple single entity fetches (`/api/auth/local`, `/api/auth/local/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/send-email-confirmation`, `/api/auth/email-confirmation`) and admin operations

#### Custom REST Endpoints

Beyond Strapi's auto-generated CRUD, we will create custom endpoints with hand-written controllers. These involve business logic, side effects, or cross-entity aggregation that Strapi does not provide out of the box, Examples include:

| Endpoint | Method | Justification |
|---|---|---|
| `/api/auth/me` | `PUT` | **Custom Extension**: Profile update with custom fields (bio, orcidId, careerStage, socialLinks, notificationPreferences) beyond the standard user schema. Provided because Strapi lacks a standard "update self" endpoint. |
| `/api/auth/verify-otp` | `POST` | **Custom Extension**: Verifies email using a 6-digit number. Confirms user and returns JWT. |
| `/api/auth/resend-otp` | `POST` | **Custom Extension**: Enforced 60s cooldown and 3/hr limit. Generates new code and sends dual-path email (Link + Code). |
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
| Docker & Docker Compose | Containerised development and mimic-prod environments |
| Nginx 1.26 (Alpine) | Reverse proxy — routes `/` → frontend:3000, `/cms/` → backend:1337 with path rewrite |
| GitHub Actions | CI/CD — build, push to container registry, Kubernetes rollout |
| Mailpit | Dev-only email testing (SMTP mock on port 1025, web inspector on port 8025) |
| PgAdmin 4 | Dev-only database inspection (port 5050) |

**Dev environment defaults:** When cloud credentials are not set, the backend falls back to local alternatives automatically — Mailpit for email (no `SMTP_*` vars), and Strapi's default local upload provider (`public/uploads/`) for file storage (no `GCS_SERVICE_ACCOUNT`).

## 2. Data Model

```mermaid
erDiagram
    User ||--o| Institution : "affiliated_with"
    User ||--o{ CommunityMembership : "has"
    User ||--o{ Thread : "creates"
    User ||--o{ Post : "writes"
    User ||--o{ Report : "submits"
    User ||--o{ Notification : "receives"
    User ||--o{ SavedPost : "bookmarks"
    User ||--o{ Follow : "follows"
    User ||--o{ CollaborationMentor : "mentors"
    User ||--o{ EventRegistration : "registers"
    User ||--o{ Resource : "uploads"
    User }o--o{ Tag : "tagged_with"

    Institution ||--o{ User : "has_members"

    Community ||--o| Community : "parent"
    Community ||--o{ CommunityMembership : "has_members"
    Community ||--o{ CommunityRule : "has_rules"
    Community ||--o{ ForumCategory : "has_categories"
    Community ||--o{ CollaborationCall : "has_calls"
    Community ||--o{ Resource : "has_resources"
    Community ||--o{ Event : "hosts"
    Community }o--o{ Tag : "tagged_with"

    CommunityMembership }o--|| User : "user"
    CommunityMembership }o--|| Community : "community"

    ForumCategory ||--o| ForumCategory : "parent"
    ForumCategory ||--o{ Thread : "contains"

    Thread ||--o{ Post : "has_replies"
    Thread }o--|| ForumCategory : "in_category"
    Thread }o--|| User : "created_by"
    Thread }o--o{ Tag : "tagged_with"

    Post ||--o| Post : "reply_to"
    Post }o--|| Thread : "belongs_to"
    Post }o--|| User : "authored_by"
    Post ||--o{ Report : "reported_in"

    CollaborationCall }o--|| Community : "within"
    CollaborationCall ||--o{ CollaborationMentor : "has_mentors"

    Resource }o--|| Community : "belongs_to"
    Resource }o--|| User : "uploaded_by"
    Resource }o--o{ Tag : "tagged_with"

    Event }o--|| Community : "hosted_by"
    Event ||--o{ EventRegistration : "has_registrations"

    EventRegistration }o--|| User : "registered_by"
    EventRegistration }o--|| Event : "for_event"

    CollaborationMentor }o--|| CollaborationCall : "collaboration"
    CollaborationMentor }o--|| User : "mentor"

    SavedPost }o--|| User : "saved_by"
    SavedPost }o--|| Post : "post"

    Follow }o--|| User : "follower"
    Follow }o--|| User : "following"

    Report }o--|| User : "reported_by"

    User {
        string id PK
        string username UK
        string email UK
        string password
        string fullName
        text bio
        string orcidId
        enum careerStage
        enum educationLevel
        boolean mentorAvailability
        json notificationPreferences
        boolean confirmed
        boolean blocked
        boolean onboardingComplete
        string otpCode
        datetime otpExpiration
        datetime lastOtpSentAt
        integer otpResendCount
        datetime otpResendWindowStart
        json socialLinks
        datetime createdAt
        datetime updatedAt
    }

    Institution {
        string id PK
        string name UK
        enum type
        string country
        boolean verified
    }

    Community {
        string id PK
        string name UK
        string slug UK
        text description
        enum type
        enum privacy
        enum status
        media logo
        media banner
        integer memberCount
    }

    CommunityMembership {
        string id PK
        string user FK
        string community FK
        enum role
        datetime joinedAt
    }

    CommunityRule {
        string id PK
        string title
        text description
        integer sortOrder
    }

    ForumCategory {
        string id PK
        string name
        string slug UK
        text description
        integer sortOrder
        boolean isLocked
    }

    Thread {
        string id PK
        string title
        string slug UK
        richtext content
        boolean isPinned
        boolean isLocked
        boolean isAnswered
        integer viewCount
        integer replyCount
        datetime lastActivityAt
    }

    Post {
        string id PK
        richtext content
        enum status
        boolean isAcceptedAnswer
        string moderationReason
        integer upvoteCount
        datetime editedAt
    }

    CollaborationCall {
        string id PK
        string title
        richtext description
        datetime startDate
        datetime endDate
        enum status
        text goals
    }

    Resource {
        string id PK
        string title
        string slug UK
        richtext description
        enum resourceType
        media file
        string externalUrl
        integer downloadCount
        date publicationDate
    }

    Event {
        string id PK
        string title
        richtext description
        datetime startDatetime
        datetime endDatetime
        enum eventType
        string location
        string virtualLink
        integer maxParticipants
        boolean issuesCertificate
    }

    EventRegistration {
        string id PK
        string user FK
        string event FK
        enum status
        datetime registeredAt
        boolean certificateIssued
    }

    CollaborationMentor {
        string id PK
        string collaboration FK
        string mentor FK
        enum status
        text goals
        datetime assignedAt
    }

    Tag {
        string id PK
        string name UK
        string slug UK
        text description
        string color
        integer usageCount
    }

    Report {
        string id PK
        string reportedBy FK
        string targetPost FK
        string targetThread FK
        enum reason
        text description
        enum status
        text moderatorNotes
        datetime resolvedAt
    }

    Notification {
        string id PK
        string recipient FK
        enum type
        string subject
        text message
        enum status
        json metadata
        datetime sentAt
    }

    SavedPost {
        string id PK
        string user FK
        string post FK
        datetime savedAt
    }

    Follow {
        string id PK
        string follower FK
        string following FK
        datetime followedAt
    }
```

This section describes the domain entities, their purpose, and key design decisions.

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

**Kubernetes deployments:**
1. **nginx** — reverse proxy, routes `/` and `/cms/`
2. **frontend** — Next.js production build (Node 20 Alpine, port 3000)
3. **backend** — Strapi production build (Node 22 Alpine, port 1337)

**Data & storage:**
- **PostgreSQL** — runs as a containerised pod within the cluster (not a managed service). Configured via `DATABASE_*` env vars on the backend deployment
- **Google Cloud Storage** — file uploads via `@strapi-community/strapi-provider-upload-google-cloud-storage`, configured via `GCS_*` env vars on the backend deployment

K8s manifests are managed within Akvo's infrastructure (via the `composite-actions` repo and cluster configuration), not stored in this application repo.

### 3.2 Azure Production (Kubernetes)

Production will run on Azure Kubernetes Service (AKS), mirroring the GCP staging pattern but replacing Akvo-specific tooling with Azure-native equivalents.

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
2. **Azure Kubernetes Service (AKS)** — if an existing AKS cluster is available, deploy into a dedicated namespace; no need to provision a new cluster
3. **Azure Database for PostgreSQL Flexible Server** — managed PostgreSQL 16 (replaces in-cluster database container). Automated backups enabled with 7-day retention (default) and point-in-time restore (PITR); adjust retention period as needed
4. **Azure Blob Storage** — file uploads (swap `GCS_*` env vars for Azure equivalents, use a community Strapi Azure upload provider or mount as volume)
5. **DNS** — A-record pointing to AKS ingress controller external IP

**AKS cluster layout:**

```
Namespace: science-of-africa-namespace
├── nginx-deployment        (HPA min 1)   — reverse proxy
├── frontend-deployment     (HPA min 1)   — Next.js
├── backend-deployment      (HPA min 1)   — Strapi
├── nginx-service           (ClusterIP)
├── frontend-service        (ClusterIP)
├── backend-service         (ClusterIP)
├── ingress                 (NGINX Ingress Controller — TLS via cert-manager + Let's Encrypt)
├── configmap               (PUBLIC_URL, BACKEND_URL, EMAIL_CONFIRMATION_URL, etc.)
└── secret                  (SMTP creds, JWT keys, DB connection string, ACR pull secret)
```

**Pod resource requests and limits (initial — adjust based on observed usage via `kubectl top pods` or metrics-server):**

| Deployment | CPU Request | CPU Limit | Memory Request | Memory Limit |
|---|---|---|---|---|
| nginx | 100m | 200m | 64Mi | 128Mi |
| frontend (Next.js) | 500m | 1000m | 512Mi | 1Gi |
| backend (Strapi) | 500m | 1000m | 512Mi | 1Gi |

> **Note:** Set `NODE_OPTIONS=--max-old-space-size=768` on both frontend and backend deployments to align V8 heap limits with container memory limits and prevent OOMKills.


The three-deployment pattern (nginx, frontend, backend) matches GCP staging exactly. The only differences are infrastructure-level: managed database instead of a container, Azure Blob instead of GCS, and cert-manager for TLS.

**TLS:** Use the [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/) with [cert-manager](https://cert-manager.io/) for automatic Let's Encrypt certificates.

#### GitHub Actions production workflow

The production workflow will be a new file (e.g. `.github/workflows/deploy-prod.yml`) triggered on GitHub release publish, following the standard akvo pattern of release-based production deploys:

```
Release published
  → build-push job:
      Login to ACR (azure/docker-login action)
      Docker build + push: nginx, frontend, backend → ACR (tagged with release version)
  → deploy job (depends on build-push):
      Set AKS context (azure/aks-set-context action)
      kubectl set image: update each deployment to new image tag
      kubectl rollout status: wait for healthy rollout
```

**Secrets required:**
- `AZURE_CREDENTIALS` — service principal JSON (ACR push + AKS deploy)
- `ACR_LOGIN_SERVER` — e.g. `scienceforafrica.azurecr.io`

#### Setup steps

1. Create resource group, ACR, and managed PostgreSQL via Azure CLI or Terraform (use existing AKS cluster)
2. Attach ACR to AKS (`az aks update --attach-acr`)
3. Ensure NGINX Ingress Controller and cert-manager are available in the cluster
4. Apply K8s manifests: namespace, deployments, services, ingress, configmap, secret
5. Configure DNS A-record to point to the ingress external IP
6. Add `AZURE_CREDENTIALS` and `ACR_LOGIN_SERVER` to GitHub repo secrets
7. Create a GitHub release to trigger the first production deploy

## 4. Scaling Pathway

#### MVP — Phase 1 (current)

```mermaid
graph TB
    subgraph AKS["AKS Cluster"]
        Ingress["Nginx Ingress"]
        Frontend["Frontend<br/>Next.js<br/>(HPA 1-N)"]
        Backend["Strapi<br/>(HPA 1-N)"]

        subgraph Strapi_Modules["Strapi Logical Modules"]
            UserSvc["User Service"]
            CollabSvc["Collaboration Service"]
            EtcSvc["etc..."]
        end

        Ingress --> Frontend
        Ingress --> Backend
        Backend --- Strapi_Modules
    end

    PostgreSQL[("Azure DB for<br/>PostgreSQL<br/>(including full-text search)")]
    Blob["Azure Blob Storage<br/>(file uploads)"]
    Mailjet["Mailjet<br/>(email via SMTP)"]

    Backend --> PostgreSQL
    Backend --> Blob
    Backend --> Mailjet
```

- HPA configured from day one (min 1 replica per deployment — nginx, frontend, backend)
- Managed PostgreSQL and Blob Storage external to the cluster
- No real-time WebSockets
- PostgreSQL full-text search (no dedicated search engine)
- Synchronous email dispatch via Mailjet
- Strapi monolith handles all domain logic (User, Collaboration, Content services are logical modules within Strapi, not separate processes)

#### Phase 2 — Evolution (when load demands it)

Since Phase 1 is already on AKS, scaling is incremental — increase replica counts and deploy additional services into the same cluster.

```mermaid
graph TB
    CDN["CDN<br/>Azure Front Door / Cloudflare"]

    subgraph AKS["AKS Cluster"]
        Ingress["Nginx Ingress"]
        Frontend["Frontend<br/>Next.js<br/>(HPA)"]
        Backend["Strapi<br/>(N replicas via HPA)"]
        Search["Search Service<br/>Elasticsearch"]
        Realtime["Notification / Chat<br/>Socket.io"]
        Cache["Azure Cache<br/>for Redis"]
        Queue["RabbitMQ /<br/>Azure Service Bus"]

        Ingress --> Frontend
        Ingress --> Backend
        Backend --> Cache
        Backend --> Queue
        Queue --> Search
        Queue --> Realtime
    end

    PostgreSQL[("Azure DB for<br/>PostgreSQL")]
    Blob["Azure Blob Storage"]
    Mailjet["Mailjet<br/>(email via SMTP)"]

    CDN --> Ingress
    Backend --> PostgreSQL
    Backend --> Blob
    Queue --> Mailjet
    Search --> PostgreSQL
```

**What changes from Phase 1:**
- **Strapi horizontal scaling** — raise HPA max replicas and adjust CPU/memory thresholds as load increases. Strapi is stateless by design, so no code changes needed
- **Azure Cache for Redis** — API response caching and session cache, deployed as an Azure managed service
- **Elasticsearch** — advanced search and filtering, async indexing via message queue. Can run in-cluster or use Elastic Cloud
- **RabbitMQ / Azure Service Bus** — async processing: email dispatch, search indexing, notification fan-out
- **CDN** (Azure Front Door or Cloudflare) — static asset delivery and edge caching
- **Socket.io** — real-time events (notifications, chat — future), deployed as a new service in the cluster

**Key architectural property:** Since Phase 1 is already on K8s, Phase 2 only requires deploying additional services and scaling existing ones. No substantial migration or application code changes are needed but we still get significant scalability improvements.

## 5. Google OAuth Authentication

The platform supports seamless authentication via Google OAuth 2.0, integrated into the Strapi `users-permissions` plugin.

### 5.1 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Strapi
    participant Google

    User->>Frontend: Click "Sign in with Google"
    Frontend->>Strapi: GET /api/connect/google?redirect=...
    Strapi->>Google: Redirect to OAuth Consent
    Google-->>User: Show Consent Screen
    User->>Google: Approve
    Google-->>Frontend: Redirect to /auth/google?code=...
    Frontend->>Strapi: GET /api/auth/google/callback (SSR Handshake)
    Note right of Frontend: NextServer sends { access_token: CODE }
    Strapi-->>Frontend: { jwt, user }
    alt onboardingComplete is false
        Frontend->>User: Redirect to /onboarding
    else onboardingComplete is true
        Frontend->>User: Redirect to /
    end
```

### 5.2 Implementation Details

**Environment-Aware Redirection:**
To prevent hardcoded `localhost` redirects in production or testing environments, the backend dynamically resolves the frontend callback URL using the following environment variable priority:
1. `FRONTEND_URL`
2. `PUBLIC_URL`
3. `NEXT_PUBLIC_FRONTEND_URL` (Next.js client-available variable)
4. `http://localhost:3000` (Local development fallback)

This resolution occurs during the `bootstrap` phase and is applied to the Strapi `grant` store configuration.

**SSR Handshake:**
The frontend uses a Server-Side Rendering (SSR) handshake via `getServerSideProps` to exchange the Google `access_token` for a Strapi `jwt`. This ensures the session is established securely on the server before the initial page render.

- **Backend Configuration**: Automated via `src/index.js` bootstrap. The system synchronizes provider settings (Client ID, Secret, and Redirect URIs) using `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `NEXT_PUBLIC_FRONTEND_URL`.
- **Frontend Integration**:
    - `SocialButton`: Custom branded component following Google's identity guidelines.
    - `pages/auth/google.js`: Dedicated callback handler with "Smart Swap" logic for internal Docker networking via `NEXT_PUBLIC_BACKEND_URL`. Implements a **Frontend-Intercept** pattern where Google redirects to the app for more environment-agnostic redirection handling.
- **Bypass Logic**: Social users are automatically marked as `confirmed: true`, bypassing the email verification step required for local registrations.
- **Session Persistence**: Social login sessions are automatically persistent (30 days), matching the "Remember Me" behavior of local login.


## 6. Globalization & Localization

The platform supports multi-language content (English as default, French for launch) using a full-stack localization strategy.

### 6.1 Architecture

- **Backend (Strapi)**: Uses the `@strapi/plugin-i18n` to enable localized fields and entries. Localized content is fetched via the `locale` query parameter.
- **Frontend (Next.js)**: Uses `next-i18next` for subpath routing (`/` for English, `/fr` for French) and translation management.

### 6.2 Data Model Changes

Specific content types have localization enabled:
- **Interest**, **Institution**: Enabled for name/title and description fields. No new models were created; localization was strictly applied to the existing implementation.

### 6.3 Locale Awareness

- **API Client**: The `api-client.js` includes a request interceptor that automatically extracts the current locale from the URL subpath and appends it as a `locale` query parameter to all Strapi requests.
- **UI Switcher**: A premium `LocaleSwitcher` component in the `Navbar` allows users to toggle languages. This triggers a client-side route change via `next/router` with the new locale.
- **Fallback Logic**: The frontend implements a "Fallback-to-Default" pattern via `fetchLocalized`. If a localized dataset (e.g., Institutions) is empty in a secondary locale (like French), the system automatically defaults to the English version to prevent empty UI states.
- **Automated Synchronization**: The system's `seeder.js` automatically clones core English data (Interests, Institutions) to available secondary locales during development seeding, ensuring translation parity across the platform.
- **Locale-Aware Uniqueness**: Integrity is enforced at the application layer via `lifecycles.js` to ensure names are unique **within** a specific locale, allowing the same name (e.g., "Oxford University") to exist in multiple language records (different locales) without conflict.

### 6.4 SEO

The platform follows Google's best practices for localized sites:
- **Subpath routing**: Distinct URLs for each language.
- **HTML lang attribute**: Automatically updated by `next-i18next`.
- **SSR support**: Translations are loaded server-side using `getStaticProps` or `getServerSideProps`.
<<<<<<< HEAD
=======

>>>>>>> main
