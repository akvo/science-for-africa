## Security Mandate

**Security is a foundational requirement, not a feature.**

### Universal Security Principles

1. **Never trust user input:** All data from users, APIs, or external sources must be validated server-side.
2. **Deny by default:** Require explicit permission grants, never assume access.
3. **Fail securely:** When errors occur, fail closed rather than open.
4. **Defense in depth:** Multiple layers of security, never rely on a single control.

### Strapi Backend Specifics

- Use **Role-Based Access Control (RBAC)** for all content types — ensure "Public" role is strictly scoped.
- Validate all custom inputs in controllers/services.
- Use **Environment Variables** for all secrets (`APP_KEYS`, `JWT_SECRET`, etc.).
- Enable **API Token** authentication for programmatic access.
- Secure the Admin Panel with multi-factor authentication if possible.

### Next.js Frontend Specifics

- Sanitize all user-rendered content (e.g., Markdown) to prevent XSS.
- Never expose API keys or secrets in client-side code (use `NEXT_PUBLIC_` only for public URLs).
- Use server-side validation for form submissions.
- Implement secure session management via `next-auth` or Strapi's JWT.
