# Authentication Persistence & "Remember Me" — Implementation Specification

## 📊 Overview

### Purpose
To handle user sessions and "Remember Me" functionality securely while balancing the strict security requirements for institutional accounts with the convenience expected by individual researchers.

### Key Principle
**Context-Aware Session Persistence**: Dynamically target either `sessionStorage` or `localStorage` based on the user's explicit preference during login, or automatically for social providers.

### User Experience
- **Email/Password Login**:
    - If "Remember Me" is selected, the login persists for 30 days via `localStorage`.
    - If not selected, the session expires upon closing the tab/window (`sessionStorage`).
- **Google OAuth Login**:
    - The session **automatically** persists for 30 days (equivalent to a "Remember Me" state) without requiring manual selection.

---

## 🎯 Design Principles
- **Data Hygiene**: Mitigate PII leaks by actively purging sensitive onboarding stores.
- **Convenience vs Risk Management**: Use appropriate persistence layers intelligently based on user behavior and provider type.

---

## 📐 Architecture Design

### Data Flow / Logic Flow
```mermaid
graph TD
    A[Login Payload] --> B{Provider Type?}
    B -->|Email/Password| C{Remember Me checked?}
    B -->|Google OAuth| D[Persist JWT in localStorage - 30 days]
    C -->|Yes| D
    C -->|No| E[Persist JWT in sessionStorage]
    D --> F[Store Promotion on Boot]
    E --> F
```

### Database Schema / Data Structure
- **Storage Mediums**: Zustand storage dynamically swaps between `window.sessionStorage` and `window.localStorage`.
- **JWT Lifespan**: Backend (Strapi) must be configured to issue JWTs valid for 30 days (`2592000` seconds).

---

## 🔧 Implementation Details

### Phase 1: Login Flow & Storage
- [ ] `LoginForm` captures `rememberMe` boolean flag for local accounts.
- [ ] Google OAuth callback automatically triggers `localStorage` persistence.
- [ ] Flag passed via `useAuthStore.setAuth(user, jwt, rememberMe)`.

### Phase 2: Bootstrapping & Lifecycle
- [ ] On app load, check both locations to "promote" JWT to the active session.
- [ ] Logout functionality correctly clears both storage endpoints.

---

## 📡 API Reference

### Storage Layer (Client-Side)
- No explicit backend API endpoints are managed by this persistence layer.

---

## ✅ Implementation Checklist
- [ ] Setup unified session validation checking at load.
- [ ] Implement explicit onboarding cleanup to strip PII.
- [ ] Ensure the logout button targets and wipes `sessionStorage` and `localStorage` simultaneously.
- [ ] Confirm Strapi JWT expiration is set to 30 days globally or specifically for OAuth.

---

## 📊 Example Scenarios

### Scenario 1: Standard Session Protection (Local)
1. User logs in from a library computer without checking "Remember Me".
2. JWT saved into `sessionStorage`.
3. User closes browser. JWT is destroyed, ensuring institutional data is safe.

### Scenario 2: Remember Me Flow (Local)
1. User logs in from personal laptop, checks "Remember Me".
2. JWT saved to `localStorage`.
3. User closes and reopens browser over the next 29 days; remains logged in.

### Scenario 3: Google OAuth Flow
1. User clicks "Sign in with Google".
2. After successful callback, JWT is **automatically** saved to `localStorage`.
3. User remains logged in for 30 days seamlessly across browser restarts.

---

## 🔮 Future Enhancements
- **HttpOnly Cookies**: Moving the "Remember Me" token to a server-side cookie to eliminate XSS-based token theft (Planned for Phase 2).
- **Short-lived Access Tokens**: Reducing the JWT lifespan from 30 days to 24 hours (Planned for Sprint 6).
- **Refresh Token Rotation**: Implementing a rotation policy to invalidate old persistent sessions automatically.
