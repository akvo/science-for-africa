# Research Finding: ERD Comparison & Audit
**Date**: 2026-03-11
**Status**: Finalized
**Subject**: Comparison between New Architectural ERD and Legacy Diagram

## 1. Overview
This document records the audit performed to ensure 100% alignment between the system architecture and the project's source requirements (Figma site map and Google Doc data models).

## 2. Comparison Summary
We compared the newly refined ERD in `agent_docs/architecture.md` (v3) against the legacy `docs/diagrams/entity-relationship.mmd`.

| Entity/Module | Legacy (GitHub) | Current (architecture.md) | Alignment Status |
| :--- | :--- | :--- | :--- |
| **Institution** | String field only | Full Entity with Affiliation Workflow | **Aligned** |
| **Opportunities** | Missing | Full Entity (Funding, Jobs, etc.) | **Aligned** |
| **Courses** | Missing | Full Entity (Internal/Partner) | **Aligned** |
| **Career Stages**| Missing | Enum (Early, Mid, Senior, Executive) | **Aligned** |
| **Resources** | Placeholder Enums | Source-aligned Enums (Policy Brief, etc.) | **Aligned** |
| **Events** | Missing Types | Specific Enums (Webinar, Workshop, etc.) | **Aligned** |
| **Reporting** | Post-only | Polymorphic (Threads & Posts) | **Aligned** |

## 3. Key Improvements in Current Version
1. **Source Fidelity**: Every field and enum in the current version is derived directly from the Figma site map or Google Doc specifications.
2. **Business Logic**: The current ERD captures the actual workflows (e.g., Institutional Affiliation, Mentorship availability toggles) rather than just static data structures.
3. **Unified Taxonomy**: The central `TAG` system correctly links across all content types (Threads, Resources, Opportunities, Events, Courses).

## 4. Conclusion & Decision
The legacy `docs/diagrams/entity-relationship.mmd` is considered **depreciated**. All development and implementation tasks (Phase 2+) must strictly follow the schema defined in `agent_docs/architecture.md`.

> [!IMPORTANT]
> The legacy diagram should either be updated to match the new architecture or removed to prevent developer confusion.
