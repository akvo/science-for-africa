---
name: strapi-nextjs-patterns
description: Core patterns and best practices for developing with Strapi v5 and Next.js 15.
---

# Strapi-NextJS Patterns

## 1. Backend: Modular Strapi v5

### Content Modeling
- **Components over Flat Fields**: Always prefer components for repeatable blocks (e.g., `shared.slider`).
- **Dynamic Zones**: Use Dynamic Zones in Single Types to create flexible page builders.

### Custom Logic
- **Service-First**: Put all database logic and complex business rules in Services.
- **Controller-Thin**: Controllers should only handle request parsing and response formatting.

### Config versioning
- **Git as Source of Truth**: Always run `config-sync export` after changing schemas in the Admin panel and commit the resulting JSON files.

## 2. Frontend: High-Fidelity Next.js

### Data Fetching
- **Server Components**: Fetch Strapi data directly in Server Components using `fetch` with appropriate revalidation tags.
- **Population**: Use specific `populate` queries to avoid over-fetching data.

### Styling
- **Design Tokens**: Use the Tailwind theme colors defined in `tailwind.config.js`.
- **Glassmorphism**: Combine `bg-opacity`, `backdrop-blur`, and `border-white/10`.

### Animations
- **Framer Motion**: Use `layout` and `animatePresence` for smooth layout transitions.
- **Enter/Exit**: Always add subtle entrance animations to new components.
