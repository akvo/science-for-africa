# GFGP Module — Documentation Index

**Good Financial Grant Practice (GFGP)** is a compliance certification module built as a standalone extension of the Science for Africa (SfA) platform. It shares the same authentication, user identity, and profile system as SfA but operates as a separate, independently navigable portal.

## What this module does

A structured pipeline that takes an African institution from self-assessment → auditor review → certification against the Good Financial Grant Practice standards.

Four actors participate:

| Actor | Portal entry |
|---|---|
| Institution Admin | `/gfgp/dashboard` |
| Department Member (Risk Officer, Finance Officer, etc.) | `/gfgp/assess` |
| Auditor | `/gfgp/audit` |
| Platform Admin (Akvo/SfA staff) | `/gfgp/admin` |

## High-level pipeline

```
Institution registers → Pays → Self-assessment → Submits
  → Selects auditor → Negotiates timeline → Auditor reviews on-site
  → Auditor submits report → Certificate issued (or reassessment)
```

## Docs in this folder

| File | Contents |
|---|---|
| [requirements.md](requirements.md) | Functional requirements, user journeys, notification matrix, state machine, open questions |
| [design.md](design.md) | Architecture decisions, data model, questionnaire structure, payment plugin, PDF approach |
| [implementation-plan.md](implementation-plan.md) | Phasing, effort estimates, risks, contract framing |

## Status

> Pre-contract brainstorm — 2026-05-05. Do not begin implementation until contract is signed.

## Key questions still open

1. Full GFGP questionnaire document not yet received — needed before finalizing data model
2. Payment gateway preference and existing merchant accounts
3. Whether email-with-PDF-attachment is required or email-with-link is acceptable
4. Whether Fundamentals and Advanced share questions or are fully separate questionnaires
5. Primary target countries (affects payment gateway coverage needs)
