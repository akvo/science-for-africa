## Strapi Backend

### Core Philosophy
- **TypeScript-First**: All custom code (controllers, services, middlewares) should be written in TypeScript.
- **Document Service**: Use the Strapi v5 Document Service API (`strapi.documents`) instead of the legacy Entity Service.
# Strapi v5 Backend

## Core Principles

1. **Strapi v5 First**: This stack is aligned with Strapi v5 features (Document Service API, Blocks editor, etc.).
2. **PostgreSQL focus**: All database operations must target PostgreSQL 16.
3. **Decoupled Architecture**: Backend is strictly a headless CMS providing JSON APIs.

### Content Modeling
- **Single Types**: Use for unique pages (e.g., Homepage, Global Settings).
- **Collection Types**: Use for repeatable content (e.g., News, Projects, Users).
- **Components**: Group fields into reusable parts (e.g., `shared.slider`, `shared.seo`).
- **Dynamic Zones**: Use to create flexible page builders.

### Coding Standards
- **Controllers**: Keep logic thin; delegate complexity to services.
- **Services**: Contain the core business logic and database queries.
- **Validation**: Use Pydantic-like validation or standard Strapi validation hooks.
- **Testing**: Use **TDD**. Write Vitest/Jest tests for custom logic.

### Environment & Config
- Use `strapi-plugin-config-sync` to version control schemas.
- All secrets MUST be in `.env`.
