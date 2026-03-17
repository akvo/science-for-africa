# Science of Africa (SFA) - Low Level Design (LLD)

**Version**: 9.0 | **Status**: Final Specification | **Alignment**: Manager Template v1 & BMAD Audit v8

---

## 1. Introduction

The Science for Africa (SFA) Foundation Community of Practice (CoP) platform is a digital ecosystem designed to unify the African research landscape. Its primary goal is to foster collaboration, facilitate mentorship, and centralize high-fidelity research resources across all AU member states. The platform utilizes a "Clean Slate" architecture to ensure zero legacy debt and total scalability.

### Strategic Roadmap
- **Phase 1 (Core)**: Identity (ORCID), Institutional Affiliation, Knowledge Base, and Peer Mentorship.
- **Phase 2 (Growth)**: Polymorphic Moderation, Private Collaboration Spaces, and Opportunity Registries (Funding/Jobs).

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| Next.js | 16.1.0 | React framework with SSR/App Router |
| React | 19.2.3 | UI logic and component rendering |
| Tailwind CSS | 4.0.0 | Utility-first styling with custom SFA tokens |
| Axios | 1.13.2 | HTTP client for API communication |

### Backend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| Strapi | 5.33.0 | Headless CMS (Document Service API) |
| Node.js | 20 (Alpine) | Server-side runtime environment |
| PostgreSQL | 16 | Primary transactional database |
| Nodemailer | 5.33.1 | Transactional email delivery |

### Infrastructure & DevTools
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| Docker | Latest | Containerization and orchestration |
| Mailpit | v1.21 | Local SMTP testing and email interception |
| pgAdmin | 8 | Database administration interface |
| GCS Provider | 5.0.5 | Google Cloud Storage asset persistence |

---

## 3. Data Model

### Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    %% Identity & Institutions
    USER ||--o| INSTITUTION : "Affiliated with"
    USER ||--o{ MENTORSHIP_REQUEST : "Sends"
    USER ||--o{ MENTORSHIP_REQUEST : "Receives"
    USER ||--o{ THREAD : "Author"
    USER ||--o{ POST : "Author"
    USER ||--o{ RESOURCE : "Author"

    %% Community & Forums
    COMMUNITY ||--o{ FORUM_CATEGORY : "Contains"
    FORUM_CATEGORY ||--o{ THREAD : "Organizes"
    THREAD ||--o{ POST : "Contains"
    POST |o--o{ POST : "Replies to"

    %% Moderation
    REPORT }|--|| USER : "Filed by"
    REPORT }|--o| POST : "Targets"

    USER {
        string email
        string orcidId
        enum careerStage
        boolean orcidVerified
    }
    INSTITUTION {
        string name
        string country
    }
    RESOURCE {
        string title
        enum category
    }
```

### Entity Descriptions

#### `USER` (Extended Identity)
- **Type**: Collection Type (`plugin::users-permissions.user`)
- **Description**: Central identity entity with ORCID verification and professional profiling.
- **Key Fields**: `orcidId`, `orcidVerified`, `careerStage`, `institution`.

#### `COMMUNITY` (Collaboration Hub)
- **Type**: Collection Type
- **Description**: Thematic research circles (e.g., Genomics, Policy).
- **Key Fields**: `name`, `isPrivate`, `forumCategories`.

#### `RESOURCE` (Document Registry)
- **Type**: Collection Type
- **Description**: Moderated repository for toolkits, datasets, and stories.
- **Key Fields**: `title`, `category`, `reviewStatus`, `attachment`.

---

## 4. Architecture Overview

### System Architecture Diagram

```mermaid
flowchart TB
    subgraph Client
        Browser[Web Browser]
    end
    subgraph Frontend
        NextJS[Next.js 16 App]
    end
    subgraph Backend
        Strapi[Strapi v5 CMS]
        REST[REST API]
    end
    subgraph Database
        PostgreSQL[(PostgreSQL 16)]
        GCS[Google Cloud Storage]
    end
    subgraph DevTools
        Mailpit[Mailpit SMTP]
    end

    Browser --> NextJS
    NextJS --> REST
    REST --> Strapi
    Strapi --> PostgreSQL
    Strapi --> GCS
    Strapi -.-> Mailpit
```

### Key Architectural Decisions
1.  **Programmatic RBAC**: Permissions are synced via code (`permissions.js`) instead of manual DB config.
2.  **Decoupled Validation**: ORCID checks run as background lifecycle hooks to prevent API latency.
3.  **Clean Slate Model**: Models are extended programmatically in `backend/src/index.js` for version resilience.

---

## 5. API Documentation

### REST API
- **Standard**: Strapi automatically generates REST endpoints for all content types.
- **Auth**: JWT Bearer token required for protected routes.
- **Base URL**: `http://localhost:1337/api`

### API Reference Shapes
- **Resource Object**:
```json
{
  "data": { "id": 1, "attributes": { "title": "Framework", "category": "Toolkit" } }
}
```

---

## 6. Local Development Setup

### Prerequisites
- Docker Desktop and Node.js 20+

### Getting Started
```bash
# Start all services (Frontend, Backend, DB, Mailpit)
docker compose up --build -d

# Seed the environment with African personas
docker compose exec backend npm run seed

# Run tests
docker compose exec backend npm test
```

### Available Services
| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend** | `http://localhost:3000` | SFA Consumer Application |
| **Backend** | `http://localhost:1337/admin` | Strapi Admin Dashboard |
| **Database UI** | `http://localhost:5050` | pgAdmin 4 |
| **Email Tester** | `http://localhost:8025` | Mailpit Web Interface |

---

## 7. Deployment

### CI/CD Pipeline
- **Engine**: GitHub Actions (`deploy-test.yml`).
- **Trigger**: Automatic on `push` to `main` branch.
- **Flow**: Lint -> Build Frontend -> Build Backend -> Integration Tests -> Deployment.

### Environment Strategy
| Environment | Trigger | Infrastructure |
| :--- | :--- | :--- |
| **Staging/Test** | Push to main | Docker Cloud / VM |
| **Production** | Release Tag | Managed Cluster (Cloud) |

---

## 8. Self-Hosted Deployment Guide

### Server Requirements
- **OS**: Ubuntu 22.04 LTS (Recommended).
- **Resources**: 4GB RAM, 2 vCPUs minimum.
- **Software**: Docker Engine + Docker Compose v2.

### Deployment Steps
1. Clone repository: `git clone <repo-url>`
2. Configure environment: `cp .env.example .env`
3. Edit `.env` with production secrets (JWT, DB_PASS).
4. Launch: `docker compose -f compose.yml up -d`

---

## 9. Environment Variables Reference

### Required Variables
| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_PASSWORD` | PostgreSQL password | `********` |
| `JWT_SECRET` | Strapi token signing key | `openssl rand -base64 32` |
| `APP_KEYS` | Strapi application session keys | `key1,key2` |

### Optional Variables
| Variable | Description | Default |
| :--- | :--- | :--- |
| `GCS_BUCKET_NAME` | Cloud storage bucket for assets | NULL |
| `SMTP_HOST` | External mail server | NULL |

---

## 10. Additional Technical Notes

### Industrial Validation Protocols
1.  **Slugs**: Strictly derived using `kebab-case`.
2.  **Temporal Data**: Mandatory ISO 8601 UTC format.
3.  **Identity**: ORCID IDs must match 19-digit pattern.

### BMAD Team Audit Log (Final Sign-off)
The final design has been verified by the full BMAD Agent Team:
- **PM John**: KPI & Strategic Alignment ✅
- **Analyst Mary**: Data Integrity ✅
- **Architect Winston**: Structural Patterns ✅
- **UX Sally**: Journey Flows ✅
- **Tester Murat**: Validation Hardening ✅
- **Writer Paige**: Professional Documentation ✅
