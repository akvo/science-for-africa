# Google OAuth — Implementation Specification

## 📊 Overview

### Purpose
Provide a seamless, one-click authentication experience for users using their Google accounts. This reduces barrier to entry and leverages Google's security for user identity.

### Key Principle
**Dynamic Adaptability**: The OAuth flow must automatically adapt to local, test, and production environments for both callback redirects and backend connectivity.

### User Experience
1. User lands on the Login page and clicks "Sign in with Google".
2. User is redirected to the Google Consent screen.
3. Upon approval, Google redirects the user back to the platform.
4. The platform verifies the token and checks the user's profile status.
5. **New Users**: Redirected to `/onboarding` to complete their profile.
6. **Existing Users**: Redirected directly to the Dashboard or Home page.

### 📖 Official Reference
This implementation follows the **[Strapi Users & Permissions Provider](https://docs.strapi.io/cms/configurations/users-and-permissions-providers/google)** documentation.

> [!NOTE]
> **Provider Differentiation**: We use the *Users & Permissions* provider (for frontend platform users) rather than the *SSO Provider* (which is for Strapi Admin Panel administrators). This ensures that researchers and external users can authenticate without requiring administrative access to the CMS.

---

## 🎯 Design Principles
- **Stateless Integration**: Leverage Strapi's built-in `users-permissions` providers to keep the integration standard and maintainable.
- **Environment Agnostic**: All callback URLs and secrets must be driven by environment variables.
- **Branding Compliance**: The "Sign in with Google" button must strictly follow [Google's Branding Guidelines](https://developers.google.com/identity/branding-guidelines) regarding logo, colors, and typography.
- **Session Persistence**: Automated 30-day persistence is handled via the [Authentication Persistence](AUTHENTICATION_PERSISTENCE.md) logic.

---

## 📐 Architecture Design

### Data Flow / Logic Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Strapi
    participant Google

    User->>Frontend: Click "Sign in with Google"
    Frontend->>Strapi: GET /api/connect/google
    Strapi->>Google: Redirect to OAuth Consent
    Google-->>User: Show Consent Screen
    User->>Google: Approve
    Google-->>Strapi: GET /api/connect/google/callback
    Strapi->>Strapi: Generate/Retrieve User + JWT
    Strapi-->>Frontend: Redirect to /auth/google?access_token=...
    Frontend->>Strapi: GET /api/users/me (with JWT)
    Strapi-->>Frontend: User Object (onboardingComplete: bool)
    alt onboardingComplete is false
        Frontend->>User: Redirect to /onboarding
    else onboardingComplete is true
        Frontend->>User: Redirect to /
    end
```

### Database Schema / Data Structure
- **User Entity (Existing)**:
    - `onboardingComplete` (Boolean): Flag to determine redirect logic.
    - `email` (String, UK): Used for matching Google account to existing local accounts.
    - `provider` (String): Will be set to "google" for users created via this flow.

---

## ✅ Acceptance Criteria

### User Acceptance Criteria (User AC)
- [ ] User can click the "Sign in with Google" button on the Login page and be redirected to the Google Consent screen.
- [ ] If the user is logging in for the first time via Google (Sign up), they are redirected to the `/onboarding` flow to complete their profile setup.
- [ ] If the user has already completed onboarding (Sign in), they are bypassed directly to the `/dashboard` or home page.

### Technical Acceptance Criteria (Tech AC)
- [ ] Strapi `users-permissions` plugin is configured to handle Google OAuth via `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- [ ] Redirect URIs are dynamically constructed based on `NEXT_PUBLIC_FRONTEND_URL` and `BACKEND_URL`.
- [ ] Google Sign-In button adheres to official branding (Logo, White background with `#dadce0` border, "Sign in with Google" text).
- [ ] Frontend handles the `id_token` or `access_token` exchange securely.

---

## 🔧 Implementation Details

### Phase 0: Google Cloud Console Setup
- [ ] Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
- [ ] Configure the **OAuth Consent Screen** (User type: External, App name: Science for Africa).
- [ ] Create **OAuth 2.0 Client IDs** (Web application).
- [ ] Add Authorized Redirect URIs:
    - **Development**: `http://localhost:1337/api/connect/google/callback`
    - **Staging/Prod**: `https://api.yourdomain.com/api/connect/google/callback`
- [ ] Obtain `CLIENT_ID` and `CLIENT_SECRET`.

### Phase 1: Backend Setup
- [ ] Enable Google Provider in Strapi admin or via `config-sync`.
- [ ] Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`.

### Phase 2: Frontend Integration
- [ ] Update `SocialAuth` component to link to Strapi OAuth endpoint.
- [ ] Create `/auth/google` callback page.
- [ ] Implement redirect logic based on `onboardingComplete` status.

---

## 📡 API Reference

### Connect with Google
- **Method**: `GET`
- **Path**: `/api/connect/google`
- **Description**: Redirects the user to Google OAuth.

### Auth Callback
- **Method**: `GET`
- **Path**: `/api/auth/google/callback`
- **Description**: Endpoint Google redirects to, which then redirects to the Frontend with tokens.

---

## ✅ Implementation Checklist
- [ ] Unit tests cover redirect logic.
- [ ] Integration tests verify the flow from button click to profile status check.
- [ ] `docs/LLD.md` updated with OAuth flow details.
- [ ] `README.md` updated with required Google Cloud Console steps.

---

## 📊 Example Scenarios

### Scenario 1: New User Signup
- **Input**: User clicks Google button, consents at Google.
- **Processing**: Strapi creates user with `onboardingComplete: false`.
- **Output**: Frontend redirects to `/onboarding`.

### Scenario 2: Returning User Login
- **Input**: User clicks Google button, consents at Google.
- **Processing**: Strapi finds existing user with `onboardingComplete: true`.
- **Output**: Frontend redirects to `/`.

---

## 🔮 Future Enhancements
- One-Tap Sign-In integration.
- Link account functionality for existing local users.
