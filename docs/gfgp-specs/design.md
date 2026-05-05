# GFGP Module — Technical Design

## 1. Architecture Overview

GFGP is built **in the same repo** as SfA with clean namespace separation. It shares the auth/identity system but has no data coupling with SfA's community, thread, or collaboration entities.

```
Shared:         Strapi users-permissions (auth, JWT, user profiles)
GFGP backend:   backend/src/api/gfgp-*/  (prefixed content types)
GFGP frontend:  frontend/pages/gfgp/     (prefixed routes)
```

The Strapi admin panel is **developer/ops only** — no client-facing staff access it. All operational and content management for GFGP happens through the Next.js portal at `/gfgp/admin`.

## 2. Role Structure

Single account type — all users are Strapi Users & Permissions users, differentiated by role:

| Role | Portal access | Capabilities |
|---|---|---|
| `gfgp_platform_admin` | `/gfgp/admin/*` | Full: questionnaire management, auditor panel, assessment review, payment confirmation, certificate trigger |
| `gfgp_institution_admin` | `/gfgp/dashboard/*` | Own institution scope: member management, topic assignment, assessment submit, auditor selection |
| `gfgp_member` | `/gfgp/assess/*` | Assigned topics only: view all, respond to assigned |
| `gfgp_auditor` | `/gfgp/audit/*` | Assigned institution only: view assessment, enter auditor responses, submit report |

Fine-grained business rules (e.g. "member can only respond to assigned topics") are enforced as controller-level guard clauses, not as RBAC configuration.

## 3. Data Model

### New GFGP entities (all prefixed `gfgp-`)

```
GfgpInstitution         — separate from SfA Institution; the entity being assessed
GfgpInstitutionMember   — user + institution + role (admin / co-owner / member)
GfgpAssessment          — one assessment record per institution per attempt
GfgpAssessmentTemplate  — versioned questionnaire definition (level + version)
GfgpTopic               — a section of the assessment (maps to akvo-react-form question_group)
GfgpQuestion            — individual question within a topic
GfgpTopicAssignment     — links topic → user within an institution assessment
GfgpResponse            — institution member's answer to a question
GfgpAuditorResponse     — auditor's answer alongside the institution's (side-by-side)
GfgpAuditor             — approved auditor panel entry (linked to shared user)
GfgpAuditEngagement     — match record: institution ↔ auditor + timeline + negotiation state
GfgpPayment             — payment record per assessment attempt
GfgpCertificate         — issued certificate record
GfgpReport              — auditor's final draft report
```

### GfgpInstitution

```
id
name
type          enum    NGO | Research | Government | Private
country       string
registeredBy  FK User
createdAt
updatedAt
```

> **Decision — Option B:** GFGP institution is a separate entity from SfA's `Institution`. SfA institutions are researcher community anchors; GFGP institutions are entities undergoing financial compliance audit. Different semantics, separate tables, same user account as the link.

### GfgpAssessment

```
id
institution   FK GfgpInstitution
template      FK GfgpAssessmentTemplate   ← pins the questionnaire version
level         enum    FUNDAMENTALS | ADVANCED
status        enum    DRAFT | PAID | IN_PROGRESS | SUBMITTED | AUDITOR_MATCHED
                      | AUDITOR_REVIEWED | CERTIFICATE_ISSUED | FAILED
                      | REASSESSMENT_REQUESTED | CLOSED
submittedAt   datetime
createdAt
updatedAt
```

### GfgpAssessmentTemplate

```
id
level         enum    FUNDAMENTALS | ADVANCED
version       string  e.g. "1.0", "1.1"
isActive      boolean (only one active per level at a time)
formJson      JSON    akvo-react-form compatible form definition
publishedAt   datetime
```

The `formJson` field stores the full akvo-react-form JSON. Assessments reference the template version they were created against — standards updates do not retroactively affect in-progress assessments.

### GfgpTopicAssignment

```
id
assessment    FK GfgpAssessment
topic         string  (topic/group id within formJson)
assignedTo    FK User
submittedAt   datetime   (null until section submitted)
```

### GfgpResponse

```
id
assessment    FK GfgpAssessment
question      string  (question id within formJson)
answer        enum    YES | NO | IN_PROCESS
comment       text
respondedBy   FK User
savedAt       datetime
submittedAt   datetime
```

### GfgpAuditorResponse

```
id
assessment    FK GfgpAssessment
question      string
answer        enum    YES | NO | IN_PROCESS
comment       text
auditor       FK User
savedAt       datetime
submittedAt   datetime
```

### GfgpPayment

```
id
assessment    FK GfgpAssessment
institution   FK GfgpInstitution
amount        decimal
currency      string
provider      enum    MANUAL | FLUTTERWAVE | STRIPE
providerRef   string  (null for manual)
status        enum    PENDING | CONFIRMED | FAILED | REFUNDED
proofUrl      media   (manual: uploaded receipt)
confirmedBy   FK User (manual: admin who confirmed)
confirmedAt   datetime
metadata      JSON    (provider-specific raw response)
```

### GfgpAuditEngagement

```
id
assessment         FK GfgpAssessment
auditor            FK GfgpAuditor
status             enum  SELECTED | NEGOTIATING | CONFIRMED | COMPLETED
institutionDates   JSON  proposed date windows from institution
auditorDates       JSON  counter-proposal from auditor (null if accepted)
officialTimeline   JSON  confirmed start/end dates (set by platform admin)
confirmedAt        datetime
```

### GfgpCertificate

```
id
assessment    FK GfgpAssessment
institution   FK GfgpInstitution
issuedAt      datetime
validUntil    datetime  (null if no expiry — TBD with client)
downloadUrl   string
revokedAt     datetime  (null unless revoked)
```

## 4. Questionnaire Structure

### Template model with versioning

Questions are managed through the `/gfgp/admin` portal UI, not the Strapi admin panel. The Platform Admin CRUDs topics and questions; publishing a new version creates a new `GfgpAssessmentTemplate` record with `isActive: true` (previous version becomes inactive for new assessments, existing in-progress assessments retain their version).

### akvo-react-form integration

The `formJson` stored in `GfgpAssessmentTemplate` is an **akvo-react-form compatible JSON definition**. This means:

- The self-assessment UI renders using the `<Webform>` component from `akvo-react-form`
- Topics map to `question_group` entries
- Each GFGP question is **two sibling questions** in the JSON:
  - An `option` question (Yes / No / In the process to start)
  - A `text` question for the comment, with a dependency that shows it only when answer is No or In Process

```json
[
  {
    "id": "q1",
    "name": "As per the standard, you are supposed to do weekly bank reconciliations. Do you do weekly bank reconciliations?",
    "type": "option",
    "required": true,
    "option": [
      { "name": "Yes", "value": "yes" },
      { "name": "No", "value": "no" },
      { "name": "In the process to start", "value": "in_process" }
    ]
  },
  {
    "id": "q1_comment",
    "name": "Comment",
    "type": "text",
    "dependency": [{ "id": "q1", "options": ["no", "in_process"] }]
  }
]
```

### Read-only enforcement for unassigned sections

The form definition object is mutated before rendering based on the user's topic assignments:

```js
const assignedTopicIds = user.assignedTopics.map(t => t.id);

const formWithAccess = {
  ...formTemplate.formJson,
  question_group: formTemplate.formJson.question_group.map(group => ({
    ...group,
    question: group.question.map(q => ({
      ...q,
      disabled: !assignedTopicIds.includes(group.id)
    }))
  }))
};
```

### Partial save and resume

Saved responses are loaded as `initialValue` on form open:

```js
<Webform
  forms={formWithAccess}
  initialValue={savedResponses}  // [{ question: "q1", value: "no" }, ...]
  onChange={onAutoSave}
  onFinish={onSectionSubmit}
/>
```

### Auditor side-by-side view

The auditor review screen is a **custom UI** — not the standard akvo-react-form renderer. It displays institution answers and auditor input in parallel columns:

```
┌─────────────────────────────┬──────────────────────────────┐
│ INSTITUTION                 │ AUDITOR                      │
├─────────────────────────────┼──────────────────────────────┤
│ Q: Do weekly reconciliations│ Q: (same question)           │
│ A: Yes                      │ A: [Yes / No / In Process ▾] │
│ Comment: —                  │ Comment: [_________________] │
└─────────────────────────────┴──────────────────────────────┘
```

This view is built as a custom React component. Institution responses are read-only; auditor inputs the right-column answers.

## 5. Payment Plugin

The payment system is provider-agnostic. Core logic does not change when switching providers.

### Provider interface

```js
{
  initiate(paymentData)  → { reference, redirectUrl, instructions }
  verify(reference)      → { status: 'CONFIRMED' | 'PENDING' | 'FAILED' }
  handleWebhook(payload) → { reference, status }
}
```

### Provider selection

```js
// backend/config/plugins.js
gfgpPayment: {
  provider: process.env.PAYMENT_PROVIDER || 'manual',
  providerOptions: { apiKey: process.env.PAYMENT_API_KEY }
}
```

### File structure

```
backend/src/gfgp-payment/
  providers/
    manual.js        ← MVP: admin confirms manually
    flutterwave.js   ← plug in when ready
  index.js           ← provider factory
  service.js         ← provider-agnostic business logic
  routes/
    webhook.js       ← POST /api/gfgp/payment/webhook
    initiate.js      ← POST /api/gfgp/payment/initiate
    confirm.js       ← POST /api/gfgp/payment/confirm  (manual only)
```

### Manual payment flow

```
Institution initiates → payment record PENDING → portal shows bank account + reference
  → Institution transfers off-platform → optionally uploads proof
  → Platform Admin sees pending queue in /gfgp/admin → confirms
  → Assessment unlocked
```

### Automatic payment flow (Flutterwave recommended when ready)

```
Institution initiates → provider.initiate() → redirect to hosted checkout
  → Flutterwave calls webhook → provider.handleWebhook() → CONFIRMED
  → Assessment auto-unlocked
```

Payment must always be confirmed server-side via webhook before assessment unlocks — never on client redirect.

## 6. Auditor Negotiation (Option B — Structured Proposal)

One structured round of back-and-forth. No open-ended messaging.

```
Institution selects auditor → proposes 2-3 preferred date windows (structured form)
  → Auditor notified → accepts OR proposes alternative dates
  → Institution confirms
  → Platform Admin notified → formally confirms match + sets official timeline
  → Both parties notified with official timeline
```

`GfgpAuditEngagement.status` transitions: `SELECTED → NEGOTIATING → CONFIRMED`

Auditor fee negotiation is **off-platform** — auditor pricing is visible on their panel profile (fixed or listed). Variable fee negotiation is out of scope.

## 7. PDF Generation

Two use cases with different approaches:

| Use case | Approach | Infra impact |
|---|---|---|
| Institution downloads report | `akvo-react-document` (browser print) | None — frontend only |
| Institution downloads certificate | `akvo-react-document` (browser print) | None — frontend only |
| System emails certificate/report | Email with **link to portal page** (MVP) | None |
| System emails PDF attachment | `akvo-form-print` Python sidecar (if required) | +1 container |

**MVP decision:** Email contains a link to the portal page. The institution downloads the PDF themselves via `akvo-react-document`. This eliminates all server-side PDF infrastructure.

If the client requires PDF as an email attachment (e.g. to forward to funders without logging in), `akvo-form-print` (Python/WeasyPrint service) is the correct solution — it understands akvo-react-form JSON and avoids Puppeteer/Chromium entirely.

**Puppeteer is explicitly ruled out** — Chromium in K8s containers causes OOMKill issues under current pod memory limits.

## 8. Admin Dashboard (`/gfgp/admin`)

### Action Queue — primary daily view

Pending items requiring Platform Admin decision, sorted by urgency:

- Manual payment proof uploaded → **[Confirm Payment]**
- Institution selected auditor + dates agreed → **[Set Official Timeline]**
- Auditor draft report submitted → **[Review → Certificate / Failure]**

### Supporting sections

| Section | Purpose |
|---|---|
| Assessments | All assessments list, filterable by state/level/date. Click-through to full lifecycle detail |
| Auditor Panel | Add/remove approved auditors, view profile and active engagements |
| Questionnaire | CRUD topics + questions, manage template versions (publish new version) |
| Payments | All payment records, manual confirmation UI with proof viewer |
| Certificates | Issued certificates, resend/revoke capability |

Analytics (completion rates, revenue) are Phase 2.

## 9. Monorepo Separation

```
backend/src/api/
  gfgp-institution/
  gfgp-assessment/
  gfgp-assessment-template/
  gfgp-topic-assignment/
  gfgp-response/
  gfgp-auditor-response/
  gfgp-auditor/
  gfgp-audit-engagement/
  gfgp-payment/
  gfgp-certificate/
  gfgp-report/

backend/src/gfgp-payment/     ← payment plugin (provider-agnostic)

frontend/pages/gfgp/
  index.js                    ← portal entry / role redirect
  dashboard/                  ← institution admin
  assess/                     ← department members
  audit/                      ← auditors
  admin/                      ← platform admin
```

All Strapi content types prefixed `gfgp-`. All Next.js routes under `/gfgp/`. No coupling with SfA's community, thread, or collaboration content types.

## 10. Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Institution model | Separate `GfgpInstitution` (Option B) | Different semantics from SfA institution; cleaner separation |
| Admin access | Portal role `gfgp_platform_admin`, not Strapi admin panel | Consistent UX, purpose-built operational interface, no Strapi upgrade risk |
| Questionnaire rendering | `akvo-react-form` with dynamic disabled logic | Internal tool, proven schema, multilingual, covers all GFGP needs |
| Questionnaire storage | Template model with version pinning | Standards will evolve; certificates must reference the version assessed against |
| Auditor negotiation | Structured one-round proposal (Option B) | Captures timeline in structured data without building a messaging system |
| Payment | Provider-agnostic plugin, Manual as default | Zero integration risk at MVP; swap provider via env var |
| PDF generation | `akvo-react-document` + link-in-email | No server-side PDF infra; uses internal Akvo tool |
| Notifications | Email-only at MVP | Consistent with SfA MVP; in-app badges are Phase 2 |
| RBAC | No custom RBAC | Strapi Users & Permissions for coarse roles; controller guards for business rules |
