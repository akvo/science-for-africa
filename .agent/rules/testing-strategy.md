---
trigger: model_decision
description: When writing tests, designing test strategy, or implementing TDD cycle
---

## Testing Strategy

### Test Pyramid

**Unit Tests (70% of tests):**
- Test domain logic in isolation with mocked dependencies
- Speed: Fast (<100ms per test)
- Backend: `docker compose exec backend npm test`
- Frontend: `docker compose exec frontend npm test`
- Coverage Goal: >85% of domain logic

**Integration Tests (20% of tests):**
- Test component interaction with infrastructure (database, APIs)
- Speed: Medium (100ms-5s per test)
- Coverage Goal: All adapter implementations

**End-to-End Tests (10% of tests):**
- Test complete user journeys through all layers
- Speed: Slow (5s-30s per test)
- Coverage Goal: Happy paths, critical business flows

### Test-Driven Development (TDD)

**Red-Green-Refactor Cycle:**

1. **Red:** Write a failing test for the next bit of functionality
2. **Green:** Write minimal code to make test pass
3. **Refactor:** Clean up code while keeping tests green
4. **Repeat:** Next test

### Test Organization

**Backend (Jest/Supertest):**
- Co-locate in `/backend/__tests__/` directory
- Naming: `*.test.js` (Unit), `*.test.js` (Integration)
- Use describe blocks for test grouping: `describe('FeatureName', () => {`

**Frontend (Next.js/Jest):**
- Co-locate tests next to components
- Naming: `*.spec.ts` (Unit), `*.integration.spec.ts` (Integration)
- Use React Testing Library for component tests

### Test Quality Standards

**AAA Pattern (Arrange-Act-Assert):**
```javascript
// Arrange: Set up test data
const userData = { email: "test@example.com", name: "Test User" };

// Act: Execute the code under test
const result = await createUser(userData);

// Assert: Verify expected outcome
expect(result.email).toBe("test@example.com");
```

**Test Naming:**
- Descriptive: `should [expected behavior] when [condition]`
- Backend: `should return 404 when user not found`
- Frontend: `should render error when API fails`

**Coverage Requirements:**
- Unit tests: >85% code coverage
- Integration tests: All adapter implementations
- E2E tests: Critical user journeys

### Related Rules
- Strapi Backend @strapi-backend.md
- NextJS Frontend @nextjs-frontend.md
- Error Handling @error-handling.md
