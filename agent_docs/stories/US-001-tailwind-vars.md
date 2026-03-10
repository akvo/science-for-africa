# Story: US-001 - Implement Custom Tailwind v4 Theme Variables

## Title
Configure Science for Africa (SFA) Design Tokens in Tailwind v4

## Description
As a developer, I need the SFA design tokens (Colors, Spacing, Radius, Stroke) available as Tailwind utility classes so that I can implement the UI components accurately and efficiently.

## Acceptance Criteria (UAC)
- [ ] `frontend/styles/globals.css` contains the `@theme` block with all SFA tokens.
- [ ] Custom spacing tokens are prefixed with `sfa-` (e.g., `p-sfa-2`).
- [ ] Custom radius tokens are prefixed with `sfa-` (e.g., `rounded-sfa-1`).
- [ ] Custom stroke widths are prefixed with `sfa-` (e.g., `border-sfa-1`).
- [ ] Brand color palettes (Green, Teal, Orange, Grey) are fully implemented from 50 to 1110.
- [ ] No regression in standard Tailwind base utilities (white, black, etc.).

## Technical Acceptance Criteria (TAC)
- [ ] Must use Tailwind v4 `@theme inline` or `@theme` block.
- [ ] Standard Tailwind variable naming conventions are followed.
- [ ] CSS variables are properly scoped within the theme.

## Effort Points
3

## Status
[x] Done
