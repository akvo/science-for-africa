# Localization (i18n) — Implementation Specification

## 📊 Overview

### Purpose
To enable the Science for Africa platform to serve content and user interface in multiple languages, starting with English and French. This ensures accessibility for a diverse linguistic audience across Africa and international stakeholders.

### Key Principle
**SEO-Standard Subpath Routing**: Use URL subpaths (e.g., `/fr/communities`) for better indexing by search engines and a consistent user experience.

### User Experience
Users will land on the site in English by default. A language switcher in the navbar allows them to switch to French. Upon switching, the URL updates to include the `/fr` prefix, and both the UI strings (buttons, labels) and the content refresh to show the French version. To ensure a seamless experience, missing French content automatically falls back to English.

---

## 🎯 Design Principles
- **Native Integration**: Leverage Strapi's built-in `i18n` plugin rather than a custom solution for content management.
- **App-Router Ready (Page Router implementation)**: Use `next-i18next` to manage Page Router i18n while keeping components ready for future migration.
- **Fall-back to English**: If a localized version of a shared entity (e.g., Interest name) is missing, the system defaults to English instead of showing empty content.
- **ID Parity**: Synchronize records across locales to ensure core entities (Interests, Institutions) share specific Document IDs across translations.

---

## 📐 Architecture Design

### Data Flow / Logic Flow
```mermaid
flowchart TD
    User(["User"]) -->|Visit /fr/communities| NextJS["Next.js Page Router"]
    NextJS -->|Detect Locale: fr| Locales["public/locales/fr/common.json"]
    NextJS -->|Fetch with locale: fr| Strapi["Strapi CMS"]
    Strapi -->|Filter by Locale| DB[(PostgreSQL)]
    DB -->|Localized Content| Strapi
    Strapi -->|REST/GraphQL Response| NextJS
    Locales -->|UI Strings| NextJS
    NextJS -->|Render Localized Page| User
```

### Database Schema / Data Structure
- **Strapi i18n**: No schema changes required on PostgreSQL. Strapi models handles translation entries internally using a `locale` field and `localizations` relation for documents.
- **Frontend Dictionaries**: JSON files in `public/locales/[locale]/common.json`.

---

## ✅ Acceptance Criteria

### User Acceptance Criteria (User AC)
- [ ] User can switch between English and French via a navbar dropdown.
- [ ] Switching language updates the URL subpath (e.g., from `/` to `/fr`).
- [ ] All primary UI elements (Navbar, Footer, Buttons) update to the selected language.
- [ ] Content from Strapi is displayed in the selected language if a translation exists.
- [ ] Site-wide search returns results relevant to the current locale.

### Content Strategy
All core content entities now include localization support:
- **Interests**: `name` and `category` localized (for expertise filtering).
- **Institutions**: `name` and `country` localized.

### UI Strategy
- **Navbar**: All links and login/signup flows translated.
- **Footer**: Company info and links translated.
- **Search**: Auto-filters based on current locale with English fallback enabled for critical data.
- **Fallback Guard**: UI components use `fetchLocalized` to ensure empty states are avoided for curated lists.

---

## 🛠️ Fallback & Synchronization Strategy

### 🌐 Hybrid Localization (Fallback-to-Default)
For curated collections like **Interests** and **Institutions**, the platform utilizes a hybrid approach:
1. **Frontend Request**: Components call `fetchLocalized(endpoint, locale)`.
2. **Preference**: It attempts to fetch content for the requested locale.
3. **Fallback**: If the result set is empty and the locale is not English, it automatically executes a second request for the English (`en`) version.
4. **Resilience**: This ensures that as we scale translations, the UI remains populated with the best available data.

### 🏗️ Automated Data Synchronization
To maintain a high-quality baseline, the system automatically synchronizes translations for core collections:
- **Seeder Sync**: During backend initialization (`seeder.js`), the system iterates through all English Interests and Institutions.
- **Draft Creation**: If a French translation is missing, it clones the English record (maintaining ID parity) to the French locale.
- **Locale-Aware Uniqueness**: Integrity is enforced via `lifecycles.js` to ensure names are unique **within** a specific locale, allowing the same name (e.g., "Oxford University") to exist in multiple language records without conflict.

---

## Technical Appendix

### API Locale Injection
The `apiClient` automatically extracts the locale from the frontend subpath (e.g., `/fr`) and appends it to all Strapi requests:
```javascript
// Example: /fr/onboarding -> sends ?locale=fr
config.params = { ...config.params, locale: currentLocale };
```

### Technical Acceptance Criteria (Tech AC)
- [ ] Next.js handles routing for `/` and `/fr` prefixes automatically.
- [ ] API calls to Strapi include the `locale` query parameter.
- [ ] `next-i18next` configuration correctly loads JSON bundles from `public/locales`.
- [ ] `hreflang` tags are correctly generated in the `<head>` for SEO.
- [ ] Strapi `config-sync` successfully captures the enabled locales.

---

## 🔧 Implementation Details

### Phase 1: Backend Foundation
- [x] Enable `@strapi/plugin-i18n` (Installed as core dependency)
- [x] Add Locales: `English (en)`, `French (fr)` via Strapi Settings
- [ ] Enable localization in `schema.json` for: `Community`, `ForumCategory`, `Resource`, `Tag` (Pending entity creation)
- [x] Export configuration to `config/sync/`

### Phase 2: Frontend Foundation
- [x] Install `next-i18next` and `i18next`
- [x] Configure `next.config.mjs` with `i18n` settings
- [x] Create directory structure for `public/locales/`
- [x] Implement `appWithTranslation` in `_app.jsx`

### Phase 3: Premium UI Switcher
- [x] Design `LocaleSwitcher` component using shadcn/ui and Radix.
- [x] Integrate switcher into the main Navbar.
- [x] Implement smooth transition/loading state during locale switch.
- [x] Implement `fetchLocalized` patterns for fallback-to-default behavior.
- [x] Refine seeder for automated draft synchronization and ID parity.

### Phase 4: Data Fetching Overhaul
- [x] Update `axios` interceptor/wrapper to include `locale` query param.
- [x] Update GraphQL queries to include `locale` variable.

---

## 📡 API Reference

### Localized Strapi Fetch
All content fetches should append the `locale` parameter.
- **Method**: `GET`
- **Path**: `/api/communities?locale=fr`
- **Response**: `200 OK` (returns entries in French)

---

## ✅ Implementation Checklist
- [x] Subpath routing works for all pages (e.g., `/fr/reset-password`)
- [x] UI strings correctly load from `common.json`
- [x] Strapi content filters correctly by locale
- [x] SEO tags (`hreflang`) are automatically injected by Next.js
- [x] Verification email links preserve the user's selected locale

---

## 📊 Example Scenarios

### Scenario 1: User switches from English to French on a Community page
- **Input**: User clicks "Français" in the `LocaleSwitcher`.
- **Processing**: Next.js redirects to `/fr/communities/[slug]`. `useTranslation` hook reloads with French dictionary. API call to Strapi includes `locale=fr`.
- **Expected Output**: Page reloads with "Communautés" header and French community description.

---

## 🔮 Future Enhancements
- **Auto-Translation Integration**: Use AI to provide initial drafts of translations for user threads.
- **More Locales**: Add Swahili and Arabic support.
