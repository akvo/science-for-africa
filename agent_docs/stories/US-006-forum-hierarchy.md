# US-006: Discussion Forum Engine & Hierarchy

**Role**: Member / Moderator
**Objective**: Participate in topical or regional discussions with peers.

## Time Tracking
| Domain | Est. (h) | Act. (h) | Status |
|--------|----------|----------|--------|
| Backend | 8 | 0 | [ ] Todo |
| Frontend | 8 | 0 | [ ] Todo |

## Acceptance Criteria (UAC)
- [ ] Users can browse Communities -> Forum Categories -> Threads.
- [ ] Users can create new Threads in open categories.
- [ ] Users can Reply to threads (nested replies supported).
- [ ] Users can "Follow" a thread to receive notifications.
- [ ] Moderators can Lock or Merge threads.

## Technical Acceptance Criteria (TAC)

### 🛠️ Backend (Strapi)
- [ ] Implement collections: `Community`, `ForumCategory`, `Thread`, `Post`.
- [ ] Set up recursive `parentPost` relation on `Post` (One-to-Many self-referencing).
- [ ] Configure `find` permissions: Public vs Private communities (via Strapi Policies).
- [ ] Implement "Follow Thread" many-to-many relation with `User`.

### 🎨 Frontend (Next.js)
- [ ] Build the hierarchical navigation: Community -> Category -> Thread List.
- [ ] Implement Thread detailed view with recursive Reply component.
- [ ] build "Create Thread" and "Reply" modals/forms.
