# GFGP Module — Implementation Plan

> **Status:** Pre-contract estimate — 2026-05-05. ±30% variance until questionnaire and final requirements are confirmed.

## 1. Phasing

### Phase 1 — Self-Assessment Loop

A complete and deployable product. Institutions register, pay, self-assess, and submit. Platform Admin receives submissions and manages the auditor panel. No auditor-side workflow.

**Delivers:** Institution registration → payment → self-assessment → submission → admin dashboard (without auditor matching and certificate).

### Phase 2 — Full Pipeline

Adds the auditor workflow: selection, negotiation, side-by-side review, report submission, certificate generation.

**Delivers:** Complete end-to-end pipeline including certificate issuance.

### Phase 3 — Enhancements (post-launch)

- Advanced assessment level (if not in Phase 1)
- Automatic payment provider (Flutterwave)
- In-app notification badges
- Analytics dashboard
- `akvo-form-print` PDF email attachment (if client requires attachment vs link)

---

## 2. Effort Estimates

All figures are **person-weeks**. Divide by team size for calendar time. Assumes ±30% variance.

### Backend

| Feature | Size | Person-weeks | Phase |
|---|---|---|---|
| GFGP content types (11 schemas) | S | 1–2 | 1 |
| Custom API + controllers (state machine, assignments, submissions) | L | 3–4 | 1+2 |
| Email notifications (10 event types + templates) | M | 2 | 1+2 |
| Payment plugin (agnostic architecture + manual provider) | M | 1.5–2 | 1 |
| Role setup + permission matrix | S | 0.5 | 1 |
| Flutterwave provider | M | 2–3 | 3 |
| `akvo-form-print` PDF sidecar (if attachment email required) | M | 2 | 3 |
| **Backend total (Phase 1+2)** | | **~10–12w** | |

### Frontend

| Feature | Size | Person-weeks | Phase |
|---|---|---|---|
| GFGP portal shell (routes, layout, role-gating) | S | 1 | 1 |
| Institution registration + member/role management | M | 2 | 1 |
| Resource module (standards library) | S | 0.5–1 | 1 |
| Assessment selection + payment gate UI | M | 1.5–2 | 1 |
| Self-assessment UI (`akvo-react-form` integration + topic assignment) | M–L | 2–3 | 1 |
| Auditor selection + structured negotiation (Option B) | M | 2 | 2 |
| **Auditor side-by-side view** | **L** | **3–4** | 2 |
| Platform Admin `/gfgp/admin` (full suite) | L–XL | 4–6 | 1+2 |
| PDF download via `akvo-react-document` | S | 1 | 2 |
| **Frontend total (Phase 1+2)** | | **~17–21w** | |

### Cross-cutting

| Feature | Size | Person-weeks |
|---|---|---|
| Testing (state machine critical, component tests) | M–L | 3–4 |
| QA + bug fix buffer | M | 2–3 |
| **Total** | | **~5–7w** |

---

## 3. Summary

| Scenario | Person-weeks | Notes |
|---|---|---|
| **Phase 1 only** (self-assessment loop, manual payment) | ~18–22w | ~4–5 months at 2 devs |
| **Phase 1 + 2** (full pipeline with auditor + certificate) | ~32–40w | ~8–10 months at 1 dev / ~4–5 months at 2 devs |
| **Add Flutterwave** | +2–3w | On top of either scenario |
| **Add PDF email attachment** (`akvo-form-print`) | +2w | On top of either scenario |

---

## 4. Top Risks

### 1. Auditor side-by-side UI
Custom UI, no precedent in SfA, no library handles this. Could expand from 3→5w if UX requirements shift mid-build. **Mitigate:** Lock down the auditor review UX spec before development starts.

### 2. Assessment state machine scope changes
State transitions are the most expensive to rework. If the client changes the workflow mid-build (e.g. adds an additional review step), cost is high. **Mitigate:** Treat the state machine as a fixed contract deliverable — changes are a change order.

### 3. Questionnaire arriving late or unstructured
If the full GFGP questionnaire arrives as a Word document instead of structured data, manual modeling into akvo-react-form JSON is content work that blocks development. **Mitigate:** Request structured format (CSV/Excel) before sprint 1 and set as a contract prerequisite.

### 4. akvo-react-form edge cases
The library is proven for surveys but per-topic-submission and dynamic disabled logic are non-standard usage patterns. **Mitigate:** Run a spike week in sprint 1 to validate the integration before committing the full estimate.

### 5. `akvo-form-print` Python sidecar (if required)
Adding a Python service to a Node.js/K8s stack adds container management overhead. **Mitigate:** Default to link-in-email for MVP (no sidecar needed); add sidecar only if client explicitly requires PDF attachment.

---

## 5. What to Fix in the Contract

- **State machine** — document all states and transitions; changes post-sign are a change order
- **Payment scope** — manual provider only; automatic provider (Flutterwave) is a separate line item
- **PDF email** — link-in-email is MVP default; PDF attachment is optional line item
- **Assessment level scope** — confirm which levels are in scope for Phase 1
- **Questionnaire prerequisite** — structured questionnaire content must be provided by client before sprint 1

---

## 6. File Map

Shows which files will be **created** (`+`) or **modified** (`~`) per phase. Strapi content types follow a consistent structure — the pattern is shown once, then only names are listed.

### Strapi content-type pattern (applies to all `gfgp-*` types)

```
backend/src/api/gfgp-{name}/
  content-types/gfgp-{name}/
    schema.json          ← field definitions
  controllers/
    gfgp-{name}.js       ← custom business logic (overrides or extends Strapi defaults)
  routes/
    gfgp-{name}.js       ← route definitions + middleware
  services/
    gfgp-{name}.js       ← reusable service methods
```

---

### Phase 1 — Self-Assessment Loop

```
backend/
  src/
    api/
+     gfgp-institution/         ← institution registration
+     gfgp-assessment/          ← assessment record + state machine
+     gfgp-assessment-template/ ← versioned questionnaire (formJson)
+     gfgp-topic-assignment/    ← topic → user assignment
+     gfgp-response/            ← institution member answers
+     gfgp-payment/             ← payment record (content type)

+   gfgp-payment/               ← payment plugin (provider-agnostic)
      providers/
+       manual.js               ← MVP: admin confirms manually
+       flutterwave.js          ← Phase 3: plug in via env var
+     index.js                  ← provider factory
+     service.js                ← provider-agnostic logic
+     routes/
+       initiate.js             ← POST /api/gfgp/payment/initiate
+       confirm.js              ← POST /api/gfgp/payment/confirm
+       webhook.js              ← POST /api/gfgp/payment/webhook

    extensions/
~     users-permissions/        ← seed gfgp_* roles on bootstrap

~   index.js                    ← register GFGP roles + permissions on startup
~   config/plugins.js           ← register gfgp-payment plugin config

    utils/
+     gfgp-notifications.js     ← shared email dispatch helpers for GFGP events

frontend/
  pages/
    gfgp/
+     index.js                  ← role-based redirect entry point
+     dashboard/                ← institution admin
+       index.js                ← overview: sections progress, submit button
+       members.js              ← invite + assign roles
+       topics.js               ← assign topics to members
+     assess/
+       index.js                ← member view: assigned vs view-only topics
+       [topicId].js            ← akvo-react-form renderer for a topic
+     admin/
+       index.js                ← action queue (daily driver)
+       assessments/
+         index.js              ← all assessments list + filters
+         [id].js               ← assessment detail + lifecycle view
+       auditors/
+         index.js              ← approved auditor panel list
+         [id].js               ← auditor profile
+       questionnaire/
+         index.js              ← topic + question CRUD
+         [topicId].js          ← questions within a topic
+       payments/
+         index.js              ← payment records + manual confirm UI

  components/
    gfgp/
+     AssessmentProgress.js     ← section completion tracker
+     TopicCard.js              ← topic row (assigned / view-only state)
+     PaymentGate.js            ← payment status guard wrapper
+     RoleGuard.js              ← role-based route protection component

  lib/
+   gfgp-api.js                 ← GFGP-specific API client methods
```

---

### Phase 2 — Full Pipeline (adds to Phase 1)

```
backend/
  src/
    api/
+     gfgp-auditor/             ← approved auditor panel entries
+     gfgp-audit-engagement/    ← institution ↔ auditor match + negotiation state
+     gfgp-auditor-response/    ← auditor answers (side-by-side)
+     gfgp-report/              ← auditor draft report
+     gfgp-certificate/         ← issued certificate record

frontend/
  pages/
    gfgp/
+     audit/
+       index.js                ← auditor: pending institution tasks
+       [assessmentId].js       ← side-by-side review + auditor response entry
+     dashboard/
~       index.js                ← add: auditor selection + negotiation UI
+       auditor-select.js       ← browse panel, select auditor, propose dates
+       auditor-confirm.js      ← confirm counter-proposal
+     admin/
~       assessments/[id].js     ← add: confirm match, set timeline, trigger certificate
+       certificates/
+         index.js              ← issued certificates list + resend/revoke

  components/
    gfgp/
+     AuditorSideBySide.js      ← custom side-by-side review UI (hardest piece)
+     AuditorCard.js            ← auditor panel entry display
+     NegotiationForm.js        ← structured date proposal form
+     CertificateDownload.js    ← akvo-react-document wrapper for certificate PDF
+     ReportDownload.js         ← akvo-react-document wrapper for report PDF
```

---

### Phase 3 — Enhancements (adds to Phase 2)

```
backend/
  src/
    gfgp-payment/
      providers/
~       flutterwave.js          ← implement (was scaffolded in Phase 1)

+   gfgp-form-print/            ← Python sidecar integration (if PDF attachment required)
+     client.js                 ← Node.js HTTP client calling akvo-form-print service

frontend/
  pages/
    gfgp/
      admin/
+       analytics/
+         index.js              ← completion rates, revenue, certificate counts
```

---

### Files never touched by GFGP

```
backend/src/api/
  auth/           ← shared, no changes
  community/      ← SfA-only, no changes
  institution/    ← SfA institution, no changes
  resource/       ← SfA resource, no changes
  ...             ← all other SfA content types untouched

frontend/pages/
  communities/    ← SfA-only, no changes
  profile/        ← SfA-only, no changes
  onboarding/     ← SfA-only, no changes
```

---

## 7. akvo-react-form Schema Model

The `GfgpAssessmentTemplate.formJson` field stores a standard akvo-react-form JSON definition. This section shows the exact shape we plan to use.

### Template structure

```json
{
  "name": "GFGP Fundamentals Assessment",
  "version": "1.0",
  "question_group": [
    {
      "id": "finance",
      "label": "Finance & Bank Reconciliation",
      "order": 1,
      "question": []
    },
    {
      "id": "risk",
      "label": "Risk Management",
      "order": 2,
      "question": []
    }
  ]
}
```

Each `question_group` maps to a **GFGP topic** — the unit that gets assigned to a department member.

---

### Question pattern — option + conditional comment

Every GFGP question is two sibling questions inside the group:

```json
{
  "id": "finance",
  "label": "Finance & Bank Reconciliation",
  "order": 1,
  "question": [
    {
      "id": "fin_01",
      "order": 1,
      "name": "As per the standard, you are supposed to do weekly bank reconciliations. Do you do weekly bank reconciliations?",
      "tooltip": "Refer to GFGP Standard Section 3.1 — Financial Controls",
      "type": "option",
      "required": true,
      "option": [
        { "name": "Yes",                    "value": "yes"        },
        { "name": "No",                     "value": "no"         },
        { "name": "In the process to start","value": "in_process" }
      ]
    },
    {
      "id": "fin_01_comment",
      "order": 2,
      "name": "Comment",
      "type": "text",
      "dependency": [
        { "id": "fin_01", "options": ["no", "in_process"] }
      ]
    },
    {
      "id": "fin_02",
      "order": 3,
      "name": "As per the standard, you are supposed to maintain a cash book updated daily. Do you maintain a daily cash book?",
      "tooltip": "Refer to GFGP Standard Section 3.2 — Cash Management",
      "type": "option",
      "required": true,
      "option": [
        { "name": "Yes",                    "value": "yes"        },
        { "name": "No",                     "value": "no"         },
        { "name": "In the process to start","value": "in_process" }
      ]
    },
    {
      "id": "fin_02_comment",
      "order": 4,
      "name": "Comment",
      "type": "text",
      "dependency": [
        { "id": "fin_02", "options": ["no", "in_process"] }
      ]
    }
  ]
}
```

**Rules:**
- Every answer question `id` follows pattern `{topic}_{nn}`
- Its paired comment always has `id` `{topic}_{nn}_comment`
- Comment is hidden by default; the `dependency` reveals it only when answer is `no` or `in_process`
- `tooltip` holds the standard clause reference — read-only context for the respondent

---

### Read-only enforcement at render time

Before passing `formJson` to `<Webform>`, unassigned groups are disabled in-place:

```js
// frontend/pages/gfgp/assess/[topicId].js

const assignedGroupIds = user.assignedTopics.map(t => t.groupId);

const accessibleForm = {
  ...template.formJson,
  question_group: template.formJson.question_group.map(group => ({
    ...group,
    question: group.question.map(q => ({
      ...q,
      disabled: !assignedGroupIds.includes(group.id),
    })),
  })),
};

<Webform
  forms={accessibleForm}
  initialValue={savedResponses}
  onChange={onAutoSave}
  onFinish={onSectionSubmit}
/>
```

---

### Saved draft — `initialValue` shape

When a member reopens a topic with prior answers, responses are loaded from `GfgpResponse` and transformed into the `initialValue` array:

```js
// lib/gfgp-api.js

export function toInitialValue(responses) {
  // responses: GfgpResponse[] from API
  return responses.flatMap(r => {
    const entries = [{ question: r.question, value: r.answer }];
    if (r.comment) {
      entries.push({ question: `${r.question}_comment`, value: r.comment });
    }
    return entries;
  });
}

// Produces:
// [
//   { question: "fin_01",         value: "no"                        },
//   { question: "fin_01_comment", value: "We are setting this up..." },
//   { question: "fin_02",         value: "yes"                       }
// ]
```

---

### On-change auto-save

Each keystroke / selection is persisted immediately to avoid data loss:

```js
const onAutoSave = async (questionId, value) => {
  await gfgpApi.saveResponse({
    assessmentId,
    question: questionId,
    value,
  });
};
```

Strapi upserts the `GfgpResponse` record (find-by `assessment + question`, update or create).

---

### Section submit

When the member clicks submit on a topic, the whole group is marked done:

```js
const onSectionSubmit = async (formValues) => {
  await gfgpApi.submitTopic({ assessmentId, groupId: topicId, formValues });
  // backend: sets GfgpTopicAssignment.submittedAt = now()
  //          checks if ALL assignments are submitted → notifies institution admin
};
```

---

### Auditor side-by-side — data shape

The auditor view does **not** use `<Webform>`. It reads both response sets and renders a custom component:

```js
// frontend/components/gfgp/AuditorSideBySide.js

// Props:
// questions    — flat list of GFGP questions from formJson (no comment siblings)
// institution  — Map<questionId, GfgpResponse>
// auditor      — Map<questionId, GfgpAuditorResponse> (may be empty on first load)
// onSave       — (questionId, answer, comment) => void

const AuditorSideBySide = ({ questions, institution, auditor, onSave }) => (
  <table>
    <thead>
      <tr>
        <th>Question</th>
        <th>Institution Answer</th>
        <th>Auditor Assessment</th>
      </tr>
    </thead>
    <tbody>
      {questions.map(q => (
        <tr key={q.id}>
          <td>{q.name}</td>
          <td>
            {/* read-only institution response */}
            <Badge value={institution.get(q.id)?.answer} />
            <p>{institution.get(q.id)?.comment}</p>
          </td>
          <td>
            {/* auditor input */}
            <AnswerSelect
              value={auditor.get(q.id)?.answer}
              onChange={answer => onSave(q.id, answer, auditor.get(q.id)?.comment)}
            />
            <Textarea
              value={auditor.get(q.id)?.comment}
              onChange={comment => onSave(q.id, auditor.get(q.id)?.answer, comment)}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
```

This is the only screen that bypasses `akvo-react-form` entirely — it needs full layout control for the two-column structure.

---

## 8. Response Storage — How Answers Reach Strapi

`akvo-react-form` delivers data through two callbacks. Both POST to custom Strapi endpoints — standard Strapi CRUD is not used here because every save needs business-rule enforcement (assignment check, submission lock, state guard).

```js
<Webform
  forms={accessibleForm}
  initialValue={savedResponses}
  onChange={debounce(onAutoSave, 1000)}   // draft save (every field change)
  onFinish={onSectionSubmit}              // section submit (user clicks Submit)
/>
```

---

### Strapi schemas

#### `GfgpResponse` — `backend/src/api/gfgp-response/content-types/gfgp-response/schema.json`

One row per GFGP question per assessment. The `answer` + `comment` live together in the same row — not split across two rows (one for the option question, one for the comment text).

```json
{
  "kind": "collectionType",
  "collectionName": "gfgp_responses",
  "info": {
    "singularName": "gfgp-response",
    "pluralName": "gfgp-responses",
    "displayName": "GFGP Response"
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "assessment":   { "type": "relation", "relation": "manyToOne", "target": "api::gfgp-assessment.gfgp-assessment" },
    "question":     { "type": "string",   "required": true },
    "answer":       { "type": "enumeration", "enum": ["YES", "NO", "IN_PROCESS"], "required": true },
    "comment":      { "type": "text" },
    "respondedBy":  { "type": "relation", "relation": "manyToOne", "target": "plugin::users-permissions.user" },
    "savedAt":      { "type": "datetime" },
    "submittedAt":  { "type": "datetime" }
  }
}
```

#### `GfgpTopicAssignment` — `backend/src/api/gfgp-topic-assignment/content-types/gfgp-topic-assignment/schema.json`

Tracks which user owns which topic and whether they have submitted it.

```json
{
  "kind": "collectionType",
  "collectionName": "gfgp_topic_assignments",
  "info": {
    "singularName": "gfgp-topic-assignment",
    "pluralName": "gfgp-topic-assignments",
    "displayName": "GFGP Topic Assignment"
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "assessment":   { "type": "relation", "relation": "manyToOne", "target": "api::gfgp-assessment.gfgp-assessment" },
    "topic":        { "type": "string", "required": true },
    "assignedTo":   { "type": "relation", "relation": "manyToOne", "target": "plugin::users-permissions.user" },
    "submittedAt":  { "type": "datetime" }
  }
}
```

---

### Draft save (`onChange`) — upsert logic

`akvo-react-form` gives us flat form values including both `fin_01` (the option) and `fin_01_comment` (the text). The controller pairs them into a single `GfgpResponse` row before upserting:

```js
// backend/src/api/gfgp-response/controllers/gfgp-response.js

async bulkSave(ctx) {
  const { assessmentId, topicId, responses } = ctx.request.body;
  const userId = ctx.state.user.id;

  // Guard: topic must be assigned to this user
  const assignment = await strapi.db.query('api::gfgp-topic-assignment.gfgp-topic-assignment').findOne({
    where: { assessment: assessmentId, topic: topicId, assignedTo: userId, submittedAt: null },
  });
  if (!assignment) return ctx.forbidden('Topic not assigned or already submitted');

  // Separate option values from comment values
  const answers  = responses.filter(r => !r.question.endsWith('_comment'));
  const comments = Object.fromEntries(
    responses.filter(r => r.question.endsWith('_comment'))
             .map(r => [r.question.replace('_comment', ''), r.value])
  );

  // Upsert one GfgpResponse per GFGP question
  for (const { question, value } of answers) {
    const existing = await strapi.db.query('api::gfgp-response.gfgp-response').findOne({
      where: { assessment: assessmentId, question },
    });

    const data = {
      answer:      value.toUpperCase(),          // "no" → "NO"
      comment:     comments[question] ?? null,
      respondedBy: userId,
      savedAt:     new Date(),
    };

    if (existing) {
      await strapi.db.query('api::gfgp-response.gfgp-response').update({ where: { id: existing.id }, data });
    } else {
      await strapi.db.query('api::gfgp-response.gfgp-response').create({ data: { ...data, assessment: assessmentId, question } });
    }
  }

  ctx.body = { ok: true };
},
```

**Resulting DB row after saving `fin_01 = "no"` + `fin_01_comment = "Still setting up"`:**

| id | assessment | question | answer | comment | submittedAt |
|---|---|---|---|---|---|
| 1 | `<FK>` | `fin_01` | `NO` | `Still setting up` | `null` |

---

### Section submit (`onFinish`)

```js
// backend/src/api/gfgp-topic-assignment/controllers/gfgp-topic-assignment.js

async submit(ctx) {
  const { id } = ctx.params;                       // GfgpTopicAssignment id
  const { assessmentId, formValues } = ctx.request.body;

  // 1. Final upsert of all responses (same logic as bulkSave)
  await strapi.service('api::gfgp-response.gfgp-response').bulkUpsert(assessmentId, formValues);

  // 2. Stamp responses as submitted
  await strapi.db.query('api::gfgp-response.gfgp-response').updateMany({
    where: { assessment: assessmentId, respondedBy: ctx.state.user.id },
    data:  { submittedAt: new Date() },
  });

  // 3. Lock the assignment
  await strapi.db.query('api::gfgp-topic-assignment.gfgp-topic-assignment').update({
    where: { id },
    data:  { submittedAt: new Date() },
  });

  // 4. Check if all assignments are now submitted → notify institution admin
  const pending = await strapi.db.query('api::gfgp-topic-assignment.gfgp-topic-assignment').count({
    where: { assessment: assessmentId, submittedAt: null },
  });
  if (pending === 0) {
    await strapi.service('gfgp-notifications').allSectionsComplete(assessmentId);
  }

  ctx.body = { ok: true };
},
```

**After submit, the `GfgpTopicAssignment` row looks like:**

| id | assessment | topic | assignedTo | submittedAt |
|---|---|---|---|---|
| 5 | `<FK>` | `finance` | `<FK user>` | `2026-07-15T10:32:00Z` |

A `submittedAt` that is not `null` = section locked. The Institution Admin's unlock endpoint clears it back to `null`.

---

### Loading saved responses (`initialValue`)

```
GET /api/gfgp/assessments/:id/responses
→ GfgpResponse[] scoped to this user's assigned topics
```

Returned as `[{ question, answer, comment }]`, then converted by `toInitialValue()` (Section 7) before being passed to `<Webform initialValue={...} />`.

---

### Custom endpoint registration

```js
// backend/src/api/gfgp-response/routes/gfgp-response.js
module.exports = {
  routes: [
    { method: 'POST', path: '/gfgp/responses/bulk-save',         handler: 'gfgp-response.bulkSave'     },
    { method: 'GET',  path: '/gfgp/assessments/:id/responses',   handler: 'gfgp-response.listForUser'  },
  ],
};

// backend/src/api/gfgp-topic-assignment/routes/gfgp-topic-assignment.js
module.exports = {
  routes: [
    { method: 'POST', path: '/gfgp/topic-assignments/:id/submit', handler: 'gfgp-topic-assignment.submit' },
    { method: 'POST', path: '/gfgp/topic-assignments/:id/unlock', handler: 'gfgp-topic-assignment.unlock' },
  ],
};
```

---

### Endpoint summary

| Endpoint | Purpose | Key guards |
|---|---|---|
| `POST /api/gfgp/responses/bulk-save` | Upsert draft responses from `onChange` | Topic assigned to caller, section not locked, assessment `IN_PROGRESS` |
| `POST /api/gfgp/topic-assignments/:id/submit` | Lock section, stamp `submittedAt` | Same + checks all-submitted for admin notification |
| `POST /api/gfgp/topic-assignments/:id/unlock` | Re-open for correction | `gfgp_institution_admin` role only |
| `GET /api/gfgp/assessments/:id/responses` | Load saved responses for `initialValue` | Scoped to caller's assigned topics |

---

## 9. Server-Side PDF via `akvo-form-print` (Phase 3 — if required)

**Default (MVP):** institution downloads PDF via browser using `akvo-react-document`. Email contains a link to the portal page. No server-side infrastructure.

**Phase 3 trigger:** client explicitly requires a PDF file attached to the email (e.g. to forward to funders without logging in). Only then is this section relevant.

---

### What `akvo-form-print` is

`akvo-form-print` is a **Python rendering library** (not a pre-built HTTP service). It wraps WeasyPrint and converts structured form JSON — including the Akvo React Forms (ARF) format we use for `GfgpAssessmentTemplate.formJson` — into PDF, HTML, or DOCX.

Because it is a library, we must wrap it in a small HTTP service before Strapi can call it.

---

### Wrapper service

A minimal FastAPI app exposes one endpoint. It accepts the form definition and the institution's responses, renders HTML from the ARF schema, then converts to PDF via WeasyPrint:

```python
# services/gfgp-form-print/main.py

from fastapi import FastAPI
from fastapi.responses import Response
from AkvoFormPrint.stylers.weasyprint_styler import WeasyPrintStyler

app = FastAPI()

@app.post("/pdf")
async def generate_pdf(payload: dict):
    # payload: { "form": <GfgpAssessmentTemplate.formJson>, "responses": [...] }
    styler = WeasyPrintStyler(
        orientation="portrait",
        parser_type="arf",              # Akvo React Forms schema
        add_section_numbering=True,
        add_question_numbering=True,
        raw_json=payload["form"],
        # responses are merged into the form JSON before passing in
    )
    pdf_bytes = styler.render_pdf()
    return Response(content=pdf_bytes, media_type="application/pdf")
```

**System dependencies** required in the container image (Ubuntu/Debian):

```dockerfile
# services/gfgp-form-print/Dockerfile
FROM python:3.12-slim
RUN apt-get update && apt-get install -y \
    libcairo2 libpango-1.0-0 libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 libffi-dev shared-mime-info
COPY requirements.txt .
RUN pip install akvo-form-print fastapi uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

---

### Strapi calls the wrapper

```js
// backend/src/gfgp-form-print/client.js

const axios = require('axios');

const FORM_PRINT_URL = process.env.FORM_PRINT_SERVICE_URL || 'http://localhost:8080';

async function generateAssessmentPdf({ formJson, responses }) {
  const { data } = await axios.post(`${FORM_PRINT_URL}/pdf`, {
    form:      formJson,    // GfgpAssessmentTemplate.formJson
    responses,              // GfgpResponse[] for this assessment
  }, {
    responseType: 'arraybuffer',
    timeout: 30_000,
  });
  return Buffer.from(data);  // PDF bytes → attach to email or upload to storage
}

module.exports = { generateAssessmentPdf };
```

This client is called from the email notification service when a certificate or report needs to be sent as an attachment:

```js
// backend/src/utils/gfgp-notifications.js (Phase 3 branch)

const { generateAssessmentPdf } = require('../gfgp-form-print/client');

async function sendCertificateEmail(assessmentId) {
  const { formJson, responses } = await loadAssessmentData(assessmentId);

  if (process.env.PDF_DELIVERY === 'attachment') {
    const pdfBuffer = await generateAssessmentPdf({ formJson, responses });
    await mailer.sendWithAttachment({ ..., attachment: pdfBuffer, filename: 'gfgp-certificate.pdf' });
  } else {
    await mailer.sendWithLink({ ..., portalUrl: `${process.env.PORTAL_URL}/gfgp/certificate/${assessmentId}` });
  }
}
```

The switch is environment-variable-driven (`PDF_DELIVERY=attachment`), so the MVP (link) and Phase 3 (attachment) share the same code path.

---

### Deployment

The project already runs each concern as a **separate named service** — frontend, backend, db, mailpit, pgadmin all get their own container in both `compose.yml` and K8s. `gfgp-form-print` follows the exact same pattern: one new service, never a sidecar.

#### Local dev — add to `compose.yml`

```yaml
# compose.yml  (Phase 3 addition — alongside existing services)

  gfgp-form-print:
    build:
      context: ./services/gfgp-form-print
    ports:
      - 8080:8080
    environment:
      PORT: 8080

  backend:
    # existing backend service — add one env var:
    environment:
      FORM_PRINT_SERVICE_URL: http://gfgp-form-print:8080
      PDF_DELIVERY: ${PDF_DELIVERY:-link}        # override to "attachment" when testing
      # ... all existing env vars unchanged
```

Docker Compose puts all services on a shared network by default. `backend` reaches `gfgp-form-print` by service name — no hostname configuration needed.

#### Prod mimic — add to `compose.mimic-prod.yml`

```yaml
# compose.mimic-prod.yml  (Phase 3 addition)

  gfgp-form-print:
    image: sfa-prod-gfgp-form-print
    build: ./services/gfgp-form-print
    environment:
      PORT: 8080

  backend:
    environment:
      FORM_PRINT_SERVICE_URL: http://gfgp-form-print:8080
      # ... all existing env vars unchanged
```

#### Production (Kubernetes) — separate Deployment + ClusterIP Service

```yaml
# k8s/gfgp-form-print-deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: gfgp-form-print
spec:
  replicas: 1
  selector:
    matchLabels: { app: gfgp-form-print }
  template:
    metadata:
      labels: { app: gfgp-form-print }
    spec:
      containers:
        - name: gfgp-form-print
          image: sfa/gfgp-form-print:latest
          ports:
            - containerPort: 8080
          resources:
            requests: { memory: "256Mi", cpu: "100m" }
            limits:   { memory: "512Mi", cpu: "500m" }
---
apiVersion: v1
kind: Service
metadata:
  name: gfgp-form-print-svc
spec:
  selector: { app: gfgp-form-print }
  ports:
    - port: 8080
      targetPort: 8080
  type: ClusterIP          # internal only — Strapi calls it, never exposed externally
```

Strapi's K8s Deployment gets one new env var:

```yaml
env:
  - name: FORM_PRINT_SERVICE_URL
    value: "http://gfgp-form-print-svc:8080"
  - name: PDF_DELIVERY
    valueFrom:
      secretKeyRef:
        name: gfgp-secrets
        key: pdf-delivery     # "link" or "attachment"
```

#### How Strapi finds the service in each environment

| Environment | `FORM_PRINT_SERVICE_URL` value | Resolved by |
|---|---|---|
| Local dev (`compose.yml`) | `http://gfgp-form-print:8080` | Docker Compose internal DNS |
| Prod mimic | `http://gfgp-form-print:8080` | Docker Compose internal DNS |
| Kubernetes | `http://gfgp-form-print-svc:8080` | K8s ClusterIP DNS |

The Node.js client (`gfgp-form-print/client.js`) reads `process.env.FORM_PRINT_SERVICE_URL` — the same code works in all three environments.

---

### Why not Puppeteer / Chromium

Puppeteer requires a full Chromium binary inside the container. Under current K8s pod memory limits it causes OOMKill on PDF generation. WeasyPrint (used by `akvo-form-print`) renders from HTML/CSS directly without a browser process — safe under the same limits.

---

### File additions (Phase 3)

```
services/
+ gfgp-form-print/
+   main.py             ← FastAPI wrapper
+   Dockerfile
+   requirements.txt

backend/src/
+ gfgp-form-print/
+   client.js           ← Node.js HTTP client
~   utils/gfgp-notifications.js  ← add PDF_DELIVERY branch
~   config/plugins.js             ← add FORM_PRINT_SERVICE_URL env
```

---

## 10. Compressed Plan — 12-Day MVP (1 Developer)

> **Scenario:** Contract signed, one developer, 12 working days × 8 hr = 96 hours. Delivers a **Phase 1 Lite** — the core self-assessment loop end-to-end, demonstrable and production-deployable. Everything in Phase 2 and most of Phase 1's "nice-to-have" is explicitly deferred.

### What this plan ships

| Included | Explicitly deferred |
|---|---|
| Institution registration + member invite (email only) | Auditor workflow (all of Phase 2) |
| Role setup: `gfgp_institution_admin`, `gfgp_member`, `gfgp_platform_admin` | Advanced level (Fundamentals only) |
| Manual payment: admin clicks Confirm (no receipt upload) | Payment receipt file upload |
| Self-assessment via `akvo-react-form` (Fundamentals) | Questionnaire CRUD in admin (use seeded data) |
| Topic assignment + read-only enforcement | Resource/standards library |
| Draft auto-save + section submit + unlock | Co-owner role |
| Full assessment submission by Institution Admin | In-app notification badges |
| State machine: `DRAFT → PAID → IN_PROGRESS → SUBMITTED` | Certificate, PDF download |
| Minimal `/gfgp/admin`: payment queue + submissions list | Full admin suite (auditor panel, questionnaire, certificates) |
| 3 critical email notifications | All 10 notification events |

The akvo-react-form spike is folded into Day 5 — no separate spike week. If the integration hits a blocker, the fallback is a plain HTML form for the demo; the API contracts stay identical.

---

### Day-by-day schedule

#### Week 1

**Day 1 — Foundation: Strapi schemas + roles**
- Create all 6 Phase 1 Lite content types: `gfgp-institution`, `gfgp-assessment`, `gfgp-assessment-template`, `gfgp-topic-assignment`, `gfgp-response`, `gfgp-payment`
- Seed `gfgp_institution_admin`, `gfgp_member`, `gfgp_platform_admin` roles via bootstrap script
- Set permission matrix (which role can call which endpoint)
- End of day: Strapi starts with all schemas migrated, roles seeded

**Day 2 — Portal shell + institution registration**
- `/gfgp/` entry point with role-based redirect
- `RoleGuard` component (blocks wrong-role access)
- Institution registration form → creates `GfgpInstitution` + assigns `gfgp_institution_admin`
- End of day: a user can register a GFGP institution and land on `/gfgp/dashboard`

**Day 3 — Member management + topic assignment**
- Member invite by email (Strapi email + link, creates user account with `gfgp_member`)
- Institution Admin assigns topics to members (`GfgpTopicAssignment` create/delete)
- Member dashboard: shows assigned topics vs view-only topics
- End of day: admin can invite members and assign topics; members see their dashboard

**Day 4 — Manual payment**
- `GfgpPayment` record created on "Start Assessment" → status `PENDING`
- Portal shows bank account details + reference number
- `/gfgp/admin` payment queue: list pending payments → admin clicks Confirm → `CONFIRMED`, assessment unlocks to `IN_PROGRESS`
- Email: "Payment confirmed — your assessment is now unlocked" (1 of 3 emails)
- End of day: full payment gate works; assessment unlocks after admin confirmation

**Day 5 — Self-assessment UI (akvo-react-form integration)**
- Seed one `GfgpAssessmentTemplate` (Fundamentals) with hardcoded `formJson` covering 2–3 topics and ~10 questions in the paired pattern
- `/gfgp/assess/[topicId]` page: renders `<Webform>` with access-controlled form (unassigned groups disabled)
- `POST /api/gfgp/responses/bulk-save` endpoint + controller (upsert with `_comment` pairing)
- `onChange` → debounced auto-save wired up
- End of day: member opens a topic and answers questions; answers persist

#### Week 2

**Day 6 — Draft resume + section submit**
- `GET /api/gfgp/assessments/:id/responses` endpoint + `toInitialValue()` → form opens pre-filled
- `POST /api/gfgp/topic-assignments/:id/submit` → stamps `submittedAt`, locks section
- `POST /api/gfgp/topic-assignments/:id/unlock` → admin unlocks for correction
- Section completion indicator on member dashboard
- End of day: members can save, resume, and submit topics; submitted sections are locked

**Day 7 — All-sections-complete + assessment submission**
- All-sections-complete check in submit controller → email to Institution Admin (2 of 3 emails)
- Institution Admin review page: read-only view of all responses grouped by topic
- "Submit to Platform" button → assessment status → `SUBMITTED`
- Email to Platform Admin: "New assessment submitted" (3 of 3 emails)
- End of day: full self-assessment loop is closed

**Day 8 — Platform Admin dashboard (minimal)**
- `/gfgp/admin` action queue: pending payments + new submissions
- Assessments list: filter by status, click through to detail
- Assessment detail: read-only view of all responses + current status
- End of day: Platform Admin has a working operational view

**Day 9 — State machine hardening + guards**
- Enforce all state transitions server-side (can't submit if not `IN_PROGRESS`, can't save if `SUBMITTED`, etc.)
- Protect all custom routes with auth middleware + role checks
- Prevent members saving to topics they are not assigned to
- End of day: all API endpoints are guarded; no state can be bypassed from the client

**Day 10 — Integration pass + bug fixes**
- Walk the full golden path end-to-end: register → invite → assign → pay → assess → submit → admin sees it
- Fix breakage found during walkthrough
- End of day: golden path is clean

**Day 11 — Polish + edge cases**
- Empty states (no topics assigned, no members yet, no assessments)
- Error handling on API failures (toast notifications)
- Loading states on all async actions
- Responsive layout check
- End of day: UI is presentable

**Day 12 — Buffer + handover**
- Fix any remaining Day 10–11 issues
- Document environment variables added (for ops)
- Verify `compose.yml` and `compose.mimic-prod.yml` start cleanly
- End of day: deployable, documented, handed over

---

### Critical path

```
Day 1 (schemas) → Day 2 (shell + registration) → Day 3 (members + topics)
  → Day 4 (payment) → Day 5 (akvo-react-form) → Day 6 (save + submit)
  → Day 7 (loop closed) → Day 8 (admin) → Day 9 (guards)
  → Day 10–11 (QA) → Day 12 (buffer)
```

Every day depends on the previous. There is no slack. If Day 5 (akvo-react-form) blocks, fall back to a plain HTML form for the demo — the API contracts are identical and the form can be swapped in later without touching the backend.

---

### What 12 days does NOT deliver

A client demo on Day 12 will show the full self-assessment loop but no auditor workflow, no certificate, and no live payment gateway. These are Phase 2 items:

- Auditor selection, negotiation, side-by-side review
- Certificate generation + PDF download
- Flutterwave integration
- Advanced assessment level
- Full admin suite (questionnaire CRUD, auditor panel, analytics)
- In-app notification badges

Estimated additional time for Phase 2: ~20–28 days at the same pace (1 developer, 8 hr/day).

---

## 11. Pre-Development Checklist

Before any code is written:

- [ ] Contract signed
- [ ] Full GFGP questionnaire received in structured format
- [ ] Fundamentals vs Advanced relationship clarified (shared questions or separate?)
- [ ] Payment gateway decision confirmed (manual-only MVP or include Flutterwave)
- [ ] Email PDF format confirmed (link vs attachment)
- [ ] Primary target countries confirmed
- [ ] Platform Admin sub-roles clarified (single admin or team with sub-roles?)
- [ ] Certificate validity period confirmed (expires or perpetual?)
- [ ] akvo-react-form spike completed and integration validated
