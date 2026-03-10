## Docker Commands

**All commands MUST be executed via `docker compose exec`. Never run bare commands outside Docker.**

### Service Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Strapi Admin | http://localhost:1337/admin |
| pgAdmin | http://localhost:5050 |
| Mailpit (Web) | http://localhost:8025 |
| Production Entry | http://localhost (via Nginx) |
| Production CMS | http://localhost/cms (via Nginx) |

### Environment Management

```bash
docker compose up -d           # Start all services
docker compose down            # Stop all services
docker compose ps              # View running services
docker compose logs -f         # Follow all logs
docker compose logs backend    # View specific service logs
```

### Backend Commands (Strapi)

```bash
docker compose exec backend npm test                        # Run backend tests
docker compose exec backend npm run strapi admin:create    # Create admin user
docker compose exec backend npm run config-sync import      # Sync CMS config
docker compose exec backend bash                            # Open shell
```

### Frontend Commands (Next.js)

```bash
docker compose exec frontend npx prettier --write .         # Format code
docker compose exec frontend bash                           # Open shell
docker compose exec frontend npm run dev                    # Start dev server
docker compose exec frontend npm run lint                   # Run ESLint
docker compose exec frontend npm test                       # Run tests
```

### Rules

1. **Never run `npm`, `npx`, or `node` directly** — always prefix with `docker compose exec backend` or `docker compose exec frontend`
2. **Database health** is managed by Docker Compose dependencies.
3. **Hot reload** is enabled for all development services via volumes.
4. **Environment variables** go in `.env` file (based on `.env.example`)
