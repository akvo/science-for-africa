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

## 6. Pre-Development Checklist

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
