# Research Log: Reset Password 400 on Test Site

## Context
A 400 Bad Request error is occurring on the test site during the "setup new password" (password reset) flow, while it works correctly in local development.

## Findings

### 1. API Client Locale Injection
The `frontend/lib/api-client.js` contains a request interceptor that automatically appends a `locale` query parameter to most requests. There is a skip list for public authentication endpoints, but it has some weaknesses:
- **Incomplete List**: Several custom auth endpoints are missing from the `publicAuthEndpoints` list:
  - `/auth/verify-otp`
  - `/auth/resend-otp`
  - `/auth/registration-status`
- **Rigid Matching**: The matching logic `config.url?.includes(endpoint)` might fail if the environment's `baseURL` or the way `config.url` is passed results in a mismatch (e.g., missing leading slashes or unexpected prefixes).
- **Hardcoded Path Detection**: The locale detection logic `window.location.pathname.split("/")` assumes the locale is at index 1, which might fail if the site is hosted on a subpath in the test environment.

### 2. Strapi v5 Strictness
Strapi v5 and the `users-permissions` plugin are sensitive to unexpected query parameters. If `?locale=en` or `?locale=fr` is appended to a POST request for `/api/auth/reset-password`, the built-in controller might reject it with a 400 error.

### 3. Backend Logging
The backend `backend/src/index.js` has a custom trace middleware that logs authentication requests and their results, including the error body for status codes >= 400. This is extremely helpful for debugging if server logs are accessible.

## Internal References
- Follows pattern for locale skipping found in `frontend/lib/api-client.js`.
- Custom auth endpoints are defined in `backend/src/api/auth/routes/auth.js`.

## Hypothesis
The test environment triggers a locale injection into the `/api/auth/reset-password` request due to a mismatch in the `isPublicAuthEndpoint` detection logic or because of the site's path structure. This injected `locale` parameter causes Strapi v5 to return a 400 Bad Request.

## Proposed Fixes
1. Expand the `publicAuthEndpoints` list to include all auth-related endpoints.
2. Normalize the `config.url` and `endpoint` strings before matching to ensure robustness.
3. Enhance the locale detection to be more flexible.
4. Add client-side logging to the interceptor to help diagnose environment-specific behaviors.
