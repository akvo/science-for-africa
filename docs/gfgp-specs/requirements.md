# GFGP Module — Requirements

## 1. Actors

| Actor | Description |
|---|---|
| **Institution Admin** | Registers the institution, invites members, assigns topics, monitors progress, submits the assessment, selects auditor |
| **Co-owner** | Shares admin rights with the Institution Admin (succession/failsafe) |
| **Department Member** | Assigned specific assessment topics to respond to (e.g. Risk Officer, Finance Officer) |
| **Auditor** | Approved panel member who conducts on-site review and provides responses alongside the institution's answers |
| **Platform Admin** | Akvo/SfA staff — manages auditor panel, confirms auditor matches, sets timelines, triggers certificates |

## 2. Functional Requirements

### Institution Registration

- A user shall be able to register a GFGP institution (separate from SfA institution)
- The registering user becomes the Institution Admin
- The admin shall be able to invite members and assign roles (Risk Officer, Finance Officer, etc.)
- The admin shall be able to designate a co-owner during or after registration

### Portal Access

- Registered institutions log in via the shared SfA authentication system
- The GFGP portal is accessible at `/gfgp/` with role-gated sub-routes

### Resource Module

- A read-only library of Good Financial Grant Practice standards documents
- Accessible to all authenticated GFGP users

### Assessment Selection and Payment

- The institution shall choose between two assessment levels: **Fundamentals** or **Advanced**
- Payment must be completed before the assessment is unlocked
- Payment is processed through the GFGP payment plugin (see design.md)

### Assessment Structure

- The assessment consists of a questionnaire organised by **topics**
- Each topic contains questions in the format: "As per the standard, you are supposed to [X]. Do you [X]?"
- Each question has answer options: **Yes** / **No** / **In the process to start**
- Each question has a **comment field** (free text, shown conditionally on No or In Process)

### Topic Assignment

- The Institution Admin assigns each topic to a specific department/user
- Users see all topics but can only respond to topics assigned to them
- Unassigned topics are visible in read-only mode

### Section Submission

- Each user submits their assigned topics upon completion
- Partial saves are supported (progress is preserved between sessions)
- A user cannot edit a submitted section unless the admin unlocks it

### Assessment Completion and Submission

- Once all sections are submitted, the Institution Admin receives an alert
- The admin reviews the full assessment and submits it to the platform

### Auditor Selection

- After submission, the institution immediately sees the approved auditor panel in the portal
- The institution selects a preferred auditor
- The institution proposes preferred date windows (structured negotiation — one round)
- The auditor receives the proposal and accepts or proposes alternative dates
- The institution confirms
- The Platform Admin receives an alert, formally confirms the match, and sets the official timeline

### Auditor Review

- The auditor logs in and sees the institution as a pending task
- The auditor views the institution's completed assessment
- For each question, the auditor provides their own response **alongside** the institution's answer (side-by-side view)
- The auditor conducts an on-site assessment; findings are recorded in the platform
- The auditor submits the final draft report to the Platform Admin

### Certificate and Result

- If all assessment questions are answered affirmatively (Yes) — by the auditor's determination — a GFGP certificate is generated
- The institution is notified and can download the certificate
- If not all affirmative, the institution receives a failure notification
- The institution may close the assessment or request a second assessment from a different auditor (same cycle restarts)

### Report Download and Email

- The institution can download the assessment report as PDF
- The institution can email the report (as PDF or link — to be confirmed with client)

## 3. User Journeys

### Institution Admin

```
1. Register institution (shared SfA account)
2. Invite members + assign roles
3. Optionally designate co-owner
4. Choose assessment level (Fundamentals / Advanced)
5. Complete payment
6. Assign topics to department members
7. Monitor section completion
8. Receive alert: all sections complete
9. Review full assessment
10. Submit to platform
11. Browse auditor panel
12. Select auditor + propose date windows
13. Confirm agreed dates
14. Wait for audit completion
15. Receive certificate or failure notification
16. Download/email report PDF
17. Close or request second assessment
```

### Department Member

```
1. Accept invitation to institution
2. View dashboard: assigned sections vs view-only sections
3. Open assigned topic → answer questions (answers pre-loaded if previously saved)
4. Save progress at any point
5. Submit section when complete
```

### Auditor

```
1. Exists on approved auditor panel (onboarded separately)
2. Receive notification: institution has selected and proposed dates
3. Accept or counter-propose dates
4. Receive confirmation: match confirmed + official timeline
5. Log in → see institution as pending task
6. View institution's completed assessment (side-by-side view)
7. For each question: enter auditor response next to institution's answer
8. Conduct on-site assessment; record findings
9. Submit final draft report to Platform Admin
```

### Platform Admin

```
1. Receive alert: institution submitted assessment (awareness only)
2. Receive alert: auditor selected + dates agreed
3. Formally confirm match + set official timeline
4. Receive alert: auditor submits draft report
5. Review report
6. Trigger certificate or issue failure notification
7. Day-to-day: work from Action Queue in /gfgp/admin
```

## 4. Assessment State Machine

```
DRAFT
  → (payment confirmed) → PAID
  → (institution completes & submits) → SUBMITTED
  → (auditor selected + dates agreed + admin confirms) → AUDITOR_MATCHED
  → (auditor completes review) → AUDITOR_REVIEWED
  → (admin triggers outcome) → CERTIFICATE_ISSUED
                            → FAILED
  → (institution requests second assessment) → REASSESSMENT_REQUESTED → PAID (new cycle)
  → (institution closes) → CLOSED
```

Each transition triggers one or more notifications (see Section 5).

## 5. Notification Matrix

| Trigger | Sender | Recipients | Channel |
|---|---|---|---|
| All sections submitted | System | Institution Admin | Email + in-app |
| Institution submits assessment | System | Platform Admin | Email + in-app |
| Assessment submitted (auditor panel visible) | System | Institution Admin | Email |
| Institution selects auditor + proposes dates | System | Platform Admin | Email + in-app |
| Institution selects auditor + proposes dates | System | Auditor | Email |
| Auditor accepts/counter-proposes | System | Institution Admin | Email |
| Dates confirmed by institution | System | Platform Admin | Email + in-app |
| Match confirmed + timeline set | Platform Admin action | Institution Admin + Auditor | Email |
| Auditor submits draft report | System | Platform Admin | Email + in-app |
| Certificate generated | System | Institution Admin | Email (+ download link) |
| Assessment failed | System | Institution Admin | Email + in-app |
| Payment confirmed (manual) | Platform Admin action | Institution Admin | Email |

> **MVP:** Email-only notifications. In-app badges are Phase 2.

## 6. Open Questions for Client

1. **Fundamentals vs Advanced**: Do they share questions, or are they entirely separate questionnaires? Is Advanced a superset of Fundamentals?
2. **Standards versioning**: If standards are updated, does a reassessment use the new version or the version the institution originally assessed against?
3. **Payment**: Which countries are primary targets? Is payment in USD or local currencies? Does SfA have an existing merchant account?
4. **Email format**: Is a PDF attachment in the email required, or is a link to the portal acceptable?
5. **Certificate validity**: Does the certificate expire? Can it be revoked?
6. **Auditor onboarding**: How do auditors get added to the approved panel — is there a formal onboarding flow or admin-only entry?
7. **Multi-admin**: Is there more than one Platform Admin? Do they have sub-roles?
8. **Questionnaire content**: Can the client provide the full GFGP questionnaire in a structured format (CSV/Excel)?
9. **Auditor negotiation — pricing**: Is auditor fee negotiated through the platform or off-platform?
10. **Second assessment**: When an institution requests a reassessment, do they start fresh or can they see and copy prior responses?
