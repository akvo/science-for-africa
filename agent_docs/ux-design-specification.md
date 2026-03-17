# UX Design Specification: SFA Design System (Tokens)

**Design System**: Science for Africa (SFA) Foundation
**Status**: Finalized Mapping

## 1. Color Palette (Semantic Mapping)

The SFA design system uses a custom brand palette. Unlike standard Tailwind Green, the SFA Green is a deep teal-influenced scale.

### Primary Scale (SFA Green)
| Token Name | Hex Value | Usage |
|------------|-----------|-------|
| `green-50` | `#e6eeee` | Very light backgrounds, input focus states |
| `green-500`| `#005850` | Primary brand color, headers, CTAs |
| `green-600`| `#005049` | Hover states for primary buttons |
| `green-900`| `#002522` | Deep contrast, dark mode accents |

### Functional Scales
- **Teal**: Supportive brand color for specific thematic modules.
- **Orange**: Warning states, urgent CTAs, and accent highlights.
- **Grey**: Typography, borders, and neutral backgrounds.

## 2. Spacing System
Standardized spacing enables a consistent rhythm. We use the `sfa-` prefix to avoid collisions with standard Tailwind base-unit numbers.

- `sfa-0`: 4px
- `sfa-1`: 8px
- `sfa-2`: 16px
- `sfa-3`: 24px
- `sfa-4`: 32px
- `sfa-5`: 40px
- `sfa-6`: 48px
- `sfa-7`: 64px
- `sfa-8`: 80px
- `sfa-9`: 96px
- `sfa-10`: 112px

## 3. Shape & Border (Radius & Stroke)

### Corner Radius
Applied to buttons, cards, and containers.
- `radius-sfa-1`: 8px (Small components)
- `radius-sfa-2`: 16px (Standard cards)
- `radius-sfa-4`: 32px (Large sections)
- `radius-sfa-full`: 999px (Pills/Circles)

### 4.2 Specialized Patterns: Identity
- **ORCID Login Button**: Branded button (`#A6CE39`) with ORCID logo.
- **Verified Badge**: Teal (`green-500`) checkmark next to ORCID ID on profiles.
- **Unverified State**: Orange (`orange-500`) alert icon for self-declared IDs awaiting OAuth linkage.

---

## 5. Mobile Considerations
- **OAuth Redirects**: Ensure the OAuth flow opens in the same tab or a well-managed popup to avoid session loss on mobile browsers.
- **Touch Targets**: All "Link ORCID" CTAs must be at least `sfa-6` (48px) in height.
