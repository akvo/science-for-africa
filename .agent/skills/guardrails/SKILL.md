---
name: guardrails
description: Pre-flight and post-implementation checklist for code quality and security.
---

# Guardrails

Self-review protocol to be followed before notifying the user.

## Pre-flight (Before Implementation)

- [ ] Does this follow the approved `implementation_plan.md`?
- [ ] Is the Content Type schema defined in Strapi?
- [ ] Are relations and components correctly modeled for scalability?

## Post-implementation (Self-Review)

### Security
- [ ] No hardcoded API keys or secrets in source code.
- [ ] Strapi API permissions are correctly configured for "Public" vs "Authenticated".
- [ ] Inputs are validated in custom controllers.

### Code Quality
- [ ] Code is formatted and linted (`npm run lint`).
- [ ] Baseline tests pass (`npm test`).
- [ ] `config-sync` has been run if schemas were changed.
- [ ] New functionality is documented in a walkthrough.

### Visual Excellence
- [ ] UI matches the UX Design Specification.
- [ ] Premium aesthetics (glassmorphism, animations) are implemented.
- [ ] Layout is responsive.
