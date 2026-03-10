---
description: Verify phase - run full validation suite
---

1. Run all backend tests: `docker compose exec backend npm test`.
2. Run all frontend tests: `docker compose exec frontend npm test`.
3. Check code style: `docker compose exec frontend npm run lint`.
4. Perform manual UI check if applicable.
