## NextJS Frontend

### Core Philosophy
- **App Router**: Use Next.js 15 App Router conventions.
- **Server Components (RSC)**: Fetch data in server components by default.
- **Visual WOW**: Adhere to the UX Design Specification (Premium aesthetics, dark mode, animations).

### Data Fetching
- **Server Actions**: Use for mutations (form submissions).
- **Type Safety**: Use TypeScript for all props and data models.
- **Caching**: Leverage Next.js built-in fetch cache and `revalidatePath`.

### Styling & Components
- **Tailwind CSS**: Use utility classes for rapid, consistent styling.
- **Glassmorphism**: Implement using `backdrop-blur` and semi-transparent borders.
- **Framer Motion**: Use for page transitions and micro-animations.

### Testing
- **TDD**: Write Vitest tests for utility functions and complex components.
- **Playwright/Cypress**: Use for critical end-to-end user flows.
