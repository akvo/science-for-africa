# Feature: API Authentication & RBAC Mapping

## 1. Overview
This document outlines the required API permissions to align the Science for Africa (SfA) platform with the roles defined in the Figma designs and PRD. 

**Status**: Audit Completed (Remediation Pending)

---

## 2. Current Gap Analysis
An audit performed on 2026-03-12 revealed that while roles are created in the database, **permissions are not yet assigned** to the business APIs. All core collection types (Resources, Communities, etc.) are currently restricted (403 Forbidden).

---

## 3. Reference Role Mapping (Figma Aligned)

### 3.1 Public (Guest / Unauthenticated)
| API | Actions | Reasoning |
|-----|---------|-----------|
| `api::resource.resource` | `find`, `findOne` | Publicly searchable toolkits and stories. |
| `api::community.community` | `find`, `findOne` | Browse communities (filtered by `isPrivate: false`). |
| `api::institution.institution` | `find`, `findOne` | View participating institutions. |
| `api::forum-category.forum-category` | `find`, `findOne` | Read public forum categories. |

### 3.2 Member (Individual / Institutional)
*Includes all Public permissions plus:*
| API | Actions | Reasoning |
|-----|---------|-----------|
| `api::thread.thread` | `find`, `findOne`, `create` | Start new discussions. |
| `api::post.post` | `find`, `findOne`, `create` | Reply to threads. |
| `api::mentorship-request.mentorship-request` | `create` | Request mentorship from Experts. |

### 3.3 Expert
*Includes all Member permissions plus:*
| API | Actions | Reasoning |
|-----|---------|-----------|
| `api::mentorship-request.mentorship-request` | `find`, `findOne` | Manage incoming requests. |
| `api::resource.resource` | `create` | Contribute toolkits and stories. |

### 3.4 Community Admin (Moderator)
*Includes full CRUD for Community & Forum entities:*
| API | Actions |
|-----|---------|
| `api::community.community` | `all` |
| `api::forum-category.forum-category` | `all` |
| `api::thread.thread` | `all` |
| `api::post.post` | `all` |

---

## 4. Implementation Strategy
Permissions should be managed programmatically to ensure consistency across environments.

1. **Permission Seeder**: A script to apply these settings using the Strapi Query API.
2. **Bootstrap Sync**: Logic in `src/index.js` to ensure required permissions exist on startup.
3. **Policies**: Implementation of more complex logic (e.g., "author-only edit") via Strapi Policies or Middlewares.
