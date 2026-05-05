# Feature Specification: Language List & Dropdown Update

## 📊 Overview
### Purpose
Update the platform's available languages to include English, Arabic, French, Swahili, and Portuguese, and redesign the language switcher dropdown to a grid-based layout for better accessibility and premium feel.

### Key Principle
- **Expanded Reach**: Support core languages for the African continent.
- **Premium UI**: Use a grid layout for the language switcher as per the design mockup.

---

## ✅ Acceptance Criteria

### User Acceptance Criteria (User AC)
- [ ] Language switcher in the navbar shows "ENG" (active locale code) with a Globe icon.
- [ ] Dropdown displays 5 languages: English, Arabic, French, Swahili, Portuguese.
- [ ] Dropdown layout is a 2-column grid.
- [ ] Clicking a language switches the site to that locale and updates the URL subpath.
- [ ] New locales (`ar`, `sw`, `pt`) are functional (initially with English fallback/placeholder translations).

### Technical Acceptance Criteria (Tech AC)
- [ ] `next.config.js` and `next-i18next.config.js` updated with new locales.
- [ ] `frontend/public/locales/` directory contains `ar`, `sw`, and `pt` folders.
- [ ] `LocaleSwitcher.js` component refactored to use a grid layout and `lucide-react` Globe icon.
- [ ] Backend `config-sync` files created for the new locales.

---

## 📐 Architecture Design

### Component Structure
- `LocaleSwitcher.js`:
  - Trigger: `Globe` + `CODE` + `ChevronDown`.
  - Content: `div` with `grid grid-cols-2`.

---

## 🛠️ Implementation Plan
1. **Config Update**: Add `ar`, `sw`, `pt` to Next.js i18n configs.
2. **Assets**: Create locale directories and copy existing `en` JSONs.
3. **UI Refactor**: Update `LocaleSwitcher.js` styling and logic.
4. **Backend Sync**: Add locale JSONs to `backend/config/sync/`.
