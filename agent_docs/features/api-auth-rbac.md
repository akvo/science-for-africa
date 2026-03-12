# Feature: API Authentication & RBAC Mapping

## 1. Overview
This document outlines the required API permissions to align the Science for Africa (SfA) platform with the roles defined in the Figma designs and PRD.

**Status**: Implemented & Verified (2026-03-12)

---

## 2. Implementation State
API permissions are programmatically synchronized via `backend/src/utils/permissions.js`. This logic is integrated into:
1.  **Server Bootstrap**: Ensures permissions are sync'd every time the Strapi server starts.
2.  **Data Seeder**: Applies permissions automatically during environment setup.

---

## 3. Reference Role Mapping (Figma Aligned)

### 3.1 Public (Guest / Unauthenticated)
| API | Actions |
|-----|---------|
| `api::resource.resource` | `find`, `findOne` |
| `api::community.community` | `find`, `findOne` |
| `api::institution.institution` | `find`, `findOne` |
| `api::forum-category.forum-category` | `find`, `findOne` |

### 3.2 Member / Individual
| API | Actions |
|-----|---------|
| `api::resource.resource` | `find`, `findOne` |
| `api::community.community` | `find`, `findOne` |
| `api::institution.institution` | `find`, `findOne` |
| `api::forum-category.forum-category` | `find`, `findOne` |
| `api::thread.thread` | `find`, `findOne`, `create` |
| `api::post.post` | `find`, `findOne`, `create` |
| `api::mentorship-request.mentorship-request` | `create` |

### 3.3 Expert
*Includes all Member permissions plus:*
| API | Actions |
|-----|---------|
| `api::resource.resource` | `create` |
| `api::mentorship-request.mentorship-request` | `find`, `findOne` |

### 3.4 Community Admin (Moderator)
| API | Actions |
|-----|---------|
| `api::community.community` | `find`, `findOne`, `create`, `update`, `delete` |
| `api::forum-category.forum-category` | `find`, `findOne`, `create`, `update`, `delete` |
| `api::thread.thread` | `find`, `findOne`, `create`, `update`, `delete` |
| `api::post.post` | `find`, `findOne`, `create`, `update`, `delete` |

### 3.5 Institution Admin
| API | Actions |
|-----|---------|
| `api::institution.institution` | `find`, `findOne`, `update` |
| `plugin::users-permissions.user` | `find`, `findOne` |

### 3.6 Platform Admin
| API | Actions |
|-----|---------|
| `api::community.community` | `all` (`find`, `findOne`, `create`, `update`, `delete`) |
| `api::forum-category.forum-category` | `all` |
| `api::thread.thread` | `all` |
| `api::post.post` | `all` |
| `api::resource.resource` | `all` |
| `api::institution.institution` | `all` |

---

## 4. Verification Check
To verify permissions are correctly applied, run:
```bash
docker compose exec db psql -U akvo -d science_of_africa -c "SELECT r.name as role, p.action FROM up_roles r JOIN up_permissions_role_lnk l ON r.id = l.role_id JOIN up_permissions p ON l.permission_id = p.id WHERE p.action LIKE 'api::%' ORDER BY r.name, p.action;"
```
