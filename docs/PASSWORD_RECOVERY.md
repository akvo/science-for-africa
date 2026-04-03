# Feature Specification: Password Recovery Flow

## Overview
Password recovery allows users to reset their forgotten passwords securely using an email-based flow. This implementation uses standard Strapi v5 authentication endpoints from the `users-permissions` plugin.

## User Persona
- **Registered User**: Has an account but cannot log in due to a forgotten password.

## Flow & Requirements

### 1. Forgot Password Request
- **Route**: `/forgot-password`
- **Backend Endpoint**: `POST /api/auth/forgot-password`
- **UI**: Email input field, CSRF/Rate-limit protection (handled by Strapi).
- **Process**:
  - User submits email.
  - Request is sent to Strapi's standard endpoint which generates a token and sends an email.
  - Frontend displays a success state: "If an account exists for this email, you will receive a reset link shortly."

### 2. Reset Password Submission
- **Route**: `/reset-password?code=...`
- **Backend Endpoint**: `POST /api/auth/reset-password`
- **UI**: New Password, Confirm Password inputs.
- **Process**:
  - User follows link from email.
  - Frontend extracts `code` from the URL.
  - User enters new password.
  - Frontend validates:
    - Match: "Passwords do not match."
    - Strength: (Shared project standard).

### Authentication Endpoints
The application uses standard Strapi `users-permissions` plugin endpoints:
- `POST /api/auth/local` (Login)
- `POST /api/auth/local/register` (Registration)
- `POST /api/auth/forgot-password` (Forgot Password)
- `POST /api/auth/reset-password` (Reset Password)
- `POST /api/auth/send-email-confirmation` (Email Verification)

## UI Designs
Refer to Figma node [101:24452](https://www.figma.com/design/9pJSajNx54DrJ1rafYOr6e/Science-for-Africa?node-id=101-24452).

## Tech AC
- Uses `apiClient` (Axios) for all HTTP calls.
- `strapi.js` updated with unified `/auth/` paths.
- Forms built with React Hook Form + Zod.
- Full TDD coverage for the `strapi.js` library methods.
