---
name: debugging-protocol
description: Systematic protocol for debugging common issues in the Strapi-NextJS stack.
---

# Debugging Protocol

Follow these steps when encountering issues in the Strapi-NextJS stack.

## 1. Check Service Status

```bash
docker compose ps
```
Ensure all services (`backend`, `frontend`, `db`) are `running`.

## 2. Inspect Logs

- **Backend (Strapi)**: `docker compose logs backend`
- **Frontend (Next.js)**: `docker compose logs frontend`
- **Database**: `docker compose logs db`

Look for database connection errors, Strapi startup failures, or Next.js build errors.

## 3. Diagnose Common Issues

### Database Connection
- If Strapi fails to start, verify that the `db` service is healthy and the `.env` credentials match the Postgres setup.

### Next.js Data Fetching
- Ensure `NEXT_PUBLIC_STRAPI_API_URL` is correctly set and the backend is reachable from the frontend container.

### Config-Sync Failures
- If schemas are not syncing, check `docker compose exec backend npm run config-sync export/import` for errors.

## 4. Run Tests

```bash
docker compose exec backend npm test
docker compose exec frontend npm test
```
Run tests to isolate the component failing.
