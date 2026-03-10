---
description: Implement phase - Red-Green-Refactor with Vitest
---

1. **Prerequisite**: Proactively scan `.agent/workflows/` and use required workflows.
2. **Create a failing test in `backend/tests/` or `frontend/tests/` (TDD Enforced)**.
3. Run tests: `docker compose exec backend npm test` or `docker compose exec frontend npm test`.
4. Implement minimal code change to pass the test.
5. Refactor and verify.
6. **Document Sync**: Update `agent_docs/stories/` (Actual Time, UAC/TAC), `agent_docs/sprint-plan.md` to reflect completed state, and related `agent_docs/features/` docs simultaneously.
