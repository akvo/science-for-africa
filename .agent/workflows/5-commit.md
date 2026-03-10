---
description: Ship phase - Commit changes using Conventional Commits
---

1. Prefix commit with issue number: `[#ISSUE-ID] feat(scope): message`.
2. Sync config: `docker compose exec backend npm run config-sync export`.
3. Audit artifacts in `agent_docs/`.
4. Notify the user of successful completion.
