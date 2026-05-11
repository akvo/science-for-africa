# Feature Specification: Privacy Policy Page

## 1. Overview
The Science for Africa (SFA) platform requires a dedicated Privacy Policy page to inform users about data collection, processing, and their rights. This page is part of the "legal pages" suite, which also includes Terms of Use and Community Guidelines.

## 2. User Stories
- **As a user**, I want to read the Privacy Policy so that I understand how my data is being used.
- **As a user**, I want to navigate between different legal documents (Privacy Policy, Terms of Use, Community Guidelines) easily.
- **As a user**, I want the legal information to be available in my preferred language (EN, FR, AR, PT, SW).

## 3. Design Specifications
- **Layout:** Full-width hero background with centered content. The body content is centered in a single-column layout.
- **Typography:**
    - Title: `text-display-lg` (Centered).
    - Section Headings: `text-brand-teal-900` (Title Case).
    - Body: Standard body text with proper line height, wrapped in `max-w-4xl`.
- **Hero Section:** Light gray background (`#F9FAFB`) spanning the full width of the viewport.

## 4. Technical Implementation
- **Route:** `/privacy-policy` (Single page containing all three sections).
- **Layout Architecture:** Refactored `AppLayout` and `MainLayout` to support a `noContainer` prop for full-width background sections.
- **Data Source:** Text derived from the "Content for the COP Platform" Google Doc.
- **Localization:**
    - Locale file: `frontend/public/locales/{lang}/privacy-policy.json`.
    - Integrated with `serverSideTranslations`.

## 5. Content Structure (English)
The content follows Section 3 of the source document:
- 3.1 Privacy Policy (Points a to k)
- 3.2 Terms of Use (Points a to h)
- 3.3 Community Guidelines (Points a to e)

## 6. Acceptance Criteria
- [x] Privacy Policy page is accessible at `/privacy-policy`.
- [x] Page layout matches Figma design (Centered single-column content).
- [x] All text is localized (starting with EN, structure ready for FR, AR, PT, SW).
- [x] SEO meta tags are correctly implemented.
