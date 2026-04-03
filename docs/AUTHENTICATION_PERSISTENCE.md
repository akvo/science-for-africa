# Documentation: Authentication Persistence & "Remember Me"

This document outlines the architectural strategy for handling user sessions and the "Remember Me" functionality in the Science for Africa platform.

## 1. Overview

The platform uses a **context-aware session persistence** model. This balances the strict security requirements for institutional accounts with the convenience expected by individual researchers.

## 2. Persistence Mechanics

The frontend uses **Zustand** with a persistence layer that dynamically targets either `sessionStorage` or `localStorage` based on the user's explicit preference during login.

| Mode | Storage Medium | Lifecycle | Security Level |
| :--- | :--- | :--- | :--- |
| **Standard (Default)** | `sessionStorage` | Purged on tab/window close. | **Highest** (No cross-session leakage) |
| **Remember Me** | `localStorage` | Persisted for **30 days** (Strapi Default). | **Balanced** (Convenience vs XSS Risk) |

## 3. Security Trade-offs & Risks

### 🛡️ XSS (Cross-Site Scripting)
> [!WARNING]
> **Persistent JWT Risk**: When "Remember Me" is enabled, the JWT is stored in `localStorage`. This makes it accessible to any script running on the page. While we use standard sanitization, a compromised third-party library could theoretically "steal" the token.

### 🏚️ Data Hygiene (PII)
- **Onboarding Cleanup**: To mitigate risks, we explicitly purge the `onboarding-store` after completion.
- **Session Cleanup**: Users are encouraged to use the "Logout" button, which clears both `sessionStorage` and `localStorage` simultaneously.

## 4. Implementation Details

1.  **Login Flow**:
    - The `LoginForm` captures a `rememberMe` boolean.
    - This flag is passed to `useAuthStore.setAuth(user, jwt, rememberMe)`.
2.  **Store Logic**:
    - If `rememberMe` is **true**: The storage layer writes to `localStorage`.
    - If `rememberMe` is **false**: The storage layer writes to `sessionStorage`.
3.  **Boot Strapping**: On app load, the store checks both locations. If a valid JWT is found in `localStorage`, it "promotes" it to the active session.

## 5. Future Hardening (Roadmap)

To further secure the "Remember Me" flow, we plan the following improvements:

1.  **HttpOnly Cookies**: Moving the "Remember Me" token to a server-side cookie to eliminate XSS-based token theft.
    - **Status**: *Planned for Phase 2*.
2.  **Short-lived Access Tokens**: Reducing the JWT lifespan from 30 days to 24 hours.
    - **Status**: *Planned for Sprint 6*.
3.  **Refresh Token Rotation**: Implementing a rotation policy to invalidate old persistent sessions automatically.

---
**Verified March 31, 2026**
*Status: Architecture Approved*
*Security Level: Hybrid-Session*
