# QA Guide: Create Collaboration Call Flow

## Prerequisites

1. **Backend running:** `cd backend && npm run develop` (or `docker compose up`)
2. **Frontend running:** `cd frontend && npm run dev`
3. **Seeder ran successfully:** Check backend logs for `Granting api::collaboration-call...` on first start
4. **At least one registered user:** You need a verified account to test

## Step-by-step Testing

### 1. Open the Community Page

- Navigate to `http://localhost:3000/community/any-slug`
- You should see the community detail page with tabs

### 2. Click "Create post"

- There are two "Create post" buttons:
  - One in the **community header** (top right, outline style)
  - One next to the **sort button** (teal, with + icon)
- Both should open the same collaboration creation dialog

### 3. Step 1 — Select Topics

- Dialog opens with title: "What topic will your collaboration be dedicated to?"
- Subtitle: "Choose a topic to help find your community."
- Select one or more topic chips (they turn teal when selected)
- "Next" button is disabled until at least one topic is selected
- Close (X) button in top-right corner works

### 4. Step 2 — Create Collaboration Space

- Select a community from the dropdown
- Enter a title (max 200 chars)
- Enter a description (max 275 chars) — character counter shows at bottom right
- Cosmetic toolbar (Bold, Italic, Underline, List, Link) is visible but non-functional
- Validation: all three fields required, character limits enforced
- "Back" returns to Step 1, "Next" proceeds

### 5. Step 3 — Select Due Date

- Two side-by-side calendars with navigation arrows on each
- Left sidebar with presets: Today, This week, This month, Last month, This year, All time
- Click a preset to auto-select a date range
- Or click directly on calendars to select start/end dates
- Selected range shown in date pill inputs at bottom left
- Calendar colors should be primary green (#005850)
- "Back" returns to Step 2, "Next" proceeds

### 6. Step 4 — Assign Mentor

- Title: "Assign a mentor"
- Subtitle: "The following users have access to this project:"
- **How to populate mentors:** The select dropdown fetches all registered users from `/users` API. To have users in the list:
  1. Register multiple accounts via `http://localhost:3000/signup`
  2. Verify emails via Mailpit at `http://localhost:8025`
  3. Complete onboarding for each user
  4. They will appear in the mentor dropdown
- Select a user from the dropdown — they appear in a card below with:
  - Initials avatar (teal background)
  - Full name
  - Orange "Mentor" badge
  - Position (if set during onboarding)
  - Red "Remove" button
- You can add multiple mentors
- "Back" returns to Step 3, "Next" proceeds

### 7. Step 5 — Invite Users and Collaborators

- Title: "Invite users and collaborators"
- Subtitle: "Your new collaboration has been created. Invite colleagues to collaborate on this project."
- Two email input fields with mail icon (left) and info icon (right)
- Click "+ Add another" to add more email fields
- Enter valid email addresses
- **"Skip"** — creates the collaboration WITHOUT sending invite emails, proceeds to success
- **"Send invites"** — creates the collaboration AND sends invitation emails to all entered addresses
- Both buttons trigger the `POST /api/collaboration-calls/create-with-invites` API

### 8. Step 6 — Success

- Confirmation screen with green checkmark
- Shows the collaboration title
- "Manage" button closes the dialog
- "Access page" button closes dialog and navigates to `/community`

## Verifying Backend Data

### Check Database

After creating a collaboration:

```sql
-- Check collaboration_calls table
SELECT id, title, description, status, topics, community_name FROM collaboration_calls;

-- Check collaboration_invites table
SELECT id, email, status, role, collaboration_call_id FROM collaboration_invites;
```

### Check Emails (Mailpit)

- Open `http://localhost:8025`
- You should see branded invitation emails for each invitee
- Email contains:
  - Title: "Collaboration Invitation"
  - Role label (Collaborator or Mentor)
  - Collaboration title and description
  - "Accept Invitation" button linking to `/collaboration/invite/:id/accept`

### Check Accept Invite Page

- Click the "Accept Invitation" link in the email
- Or navigate to `http://localhost:3000/collaboration/invite/1/accept`
- Shows a placeholder "coming soon" page (expected)

## Troubleshooting

### 403 Forbidden on API call

The seeder needs to grant permissions. After pulling this code:

1. **Restart the backend** — the seeder runs on every bootstrap
2. Check backend logs for: `Granting api::collaboration-call.collaboration-call.createWithInvites to authenticated...`
3. If still failing, delete the `.tmp` folder in `backend/` and restart

### No users in mentor dropdown

- Register at least 2 users and complete their onboarding
- The `/users` endpoint requires the `plugin::users-permissions.user.find` permission (granted by seeder)

### Calendars not side-by-side

- Ensure `react-day-picker` and `date-fns` are installed: `cd frontend && npm install`
- The dialog uses the `xl` size variant for the date step

### Select dropdown clipped by dialog

- The dialog uses `overflow-visible` to prevent clipping of dropdowns
