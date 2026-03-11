# US-008: Moderated Resource Publishing Workflow

**Role**: Member / Moderator
**Objective**: Share research resources (toolkits, stories, training) while ensuring quality control.

## Acceptance Criteria (UAC)
- [ ] Members can submit a Resource via a multi-step form (Title, Category, Tags, File).
- [ ] User must select a "Target Community" for the resource.
- [ ] Submissions are hidden from public view until Approved.
- [ ] Moderators can review the pending queue and Publish or Reject content.
- [ ] Rejected content is returned to the author with notes for editing.

## Technical Acceptance Criteria (TAC)

### 🛠️ Backend (Strapi)
- [ ] Enable Draft/Publish on `Resource` collection.
- [ ] Add `status` enum: `Draft`, `Pending`, `Published`, `Rejected`.
- [ ] Implement relationship `Resource` belongs to `Community`.

### 🎨 Frontend (Next.js)
- [ ] Build 3-step Resource Submission form (Meta -> Community -> File).
- [ ] Build "Moderator Review" dashboard for `Community Admin` roles.
- [ ] Build public Resource Discovery page with search and filtering.
