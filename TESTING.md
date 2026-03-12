# Testing Guide

This document provides comprehensive guidance on testing in this project.

## Table of Contents
- [Overview](#overview)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses a comprehensive testing setup:

| Component | Framework | Libraries |
|-----------|-----------|-----------|
| Backend (Strapi) | Jest | Supertest, Strapi test utilities |
| Frontend (Next.js) | Jest | React Testing Library, user-event |

### Quick Reference

```bash
# Backend (Recommended: Docker for stable Postgres/Isolation)
docker compose exec backend npm test           # Run all tests
docker compose exec backend npm run test:watch # Watch mode (sequential)

# Frontend
cd frontend && npm test
```

> [!TIP]
> While `test:watch` is available, we recommend running it via Docker to ensure it uses the correct Postgres environment. Note that watch mode in the backend is configured to run sequentially to prevent database connection exhaustion.

> [!IMPORTANT]
> Backend tests should be run with `--runInBand` and `--forceExit` (included in `npm test`) to ensure stable database connections and clean process termination.

## Backend Testing

### Configuration

The backend uses Jest with a configuration optimized for Strapi:

**File:** `backend/jest.config.js`
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['./__tests__/helpers/setup.js'],
  testTimeout: 30000,
};
```

### Test Structure

```
backend/__tests__/
├── helpers/
│   ├── setup.js          # Environment setup
│   └── strapi.js         # Strapi utilities
├── api/
│   ├── health.test.js    # Health check tests
│   └── auth.test.js      # Authentication tests
├── controllers/
│   └── example.test.js   # Controller tests
└── models/
    └── example.test.js   # Model/Service tests
```

### Testing Strapi APIs

#### Setting Up Strapi Instance

We use a **singleton pattern** for Strapi in our tests to optimize performance and prevent database connection exhaustion. `setupStrapi` boots the instance once and ensures isolation (clearing users/permissions) on every call.

```javascript
const { setupStrapi, getStrapi } = require('../helpers/strapi');

describe('My API', () => {
  let strapi;

  beforeAll(async () => {
    strapi = await setupStrapi();
  });

  it('should work', () => {
    // Your tests here using strapi or getStrapi()
  });
});
```

> [!NOTE]
> `teardownStrapi` is now a no-op for sequential runs. We rely on Jest's `--forceExit` flag for final cleanup.

#### Testing Endpoints with Supertest

```javascript
const request = require('supertest');
const { setupStrapi } = require('../helpers/strapi');

describe('GET /api/articles', () => {
  let strapi;
  beforeAll(async () => {
    strapi = await setupStrapi();
  });

  it('should return articles list', async () => {
    const response = await request(strapi.server.httpServer)
      .get('/api/articles')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data).toBeInstanceOf(Array);
  });
});
```

#### Testing with Authentication

```javascript
const { createMockUser, generateJwtToken } = require('../helpers/strapi');

it('should access protected route', async () => {
  const user = await createMockUser({
    username: 'testuser',
    email: 'test@example.com',
  });

  const token = generateJwtToken(user);

  const response = await request(strapi.server.httpServer)
    .get('/api/users/me')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  expect(response.body.email).toBe('test@example.com');
});
```

#### Testing with Documents API (Strapi v5)

Strapi v5 uses the **Documents API** instead of the Entity Service for most operations.

```javascript
it('should create an article', async () => {
  const strapi = getStrapi();

  const article = await strapi.documents('api::article.article').create({
    data: {
      title: 'Test Article',
      content: 'Test content',
    },
    status: 'published', // Critical for v5 Draft & Publish
  });

  expect(article.documentId).toBeDefined();
  expect(article.title).toBe('Test Article');
});
```

### Adding Tests for New Content Types

1. Create a new test file in `__tests__/api/`:

```javascript
// __tests__/api/article.test.js
const request = require('supertest');
const { setupStrapi, teardownStrapi, getStrapi } = require('../helpers/strapi');

describe('Article API', () => {
  beforeAll(async () => await setupStrapi());
  afterAll(async () => await teardownStrapi());

  describe('GET /api/articles', () => {
    it('should return empty array initially', async () => {
      const strapi = getStrapi();
      const response = await request(strapi.server.httpServer)
        .get('/api/articles')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('POST /api/articles', () => {
    it('should create a new article', async () => {
      const strapi = getStrapi();
      const response = await request(strapi.server.httpServer)
        .post('/api/articles')
        .send({
          data: {
            title: 'New Article',
            content: 'Article content',
          },
        })
        .expect(200);

      expect(response.body.data.attributes.title).toBe('New Article');
    });
  });
});
```

## Frontend Testing

### Configuration

The frontend uses Jest with Next.js integration:

**File:** `frontend/jest.config.js`
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
});
```

### Test Structure

```
frontend/__tests__/
├── components/
│   ├── Button.test.jsx          # Unit tests
│   ├── Card.snapshot.test.jsx   # Snapshot tests
│   └── Form.interaction.test.jsx # Interaction tests
├── lib/
│   ├── strapi.test.js           # API utility tests
│   └── test-utils.jsx           # Custom utilities
└── pages/
    └── Home.test.jsx            # Page tests
```

### Testing Components

#### Basic Component Test

```jsx
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Hello" />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

#### Testing User Interactions

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Button', () => {
  it('handles click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<Button>Focusable</Button>);

    await user.tab();

    expect(screen.getByRole('button')).toHaveFocus();
  });
});
```

#### Testing Forms

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ContactForm', () => {
  it('submits with valid data', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();

    render(<ContactForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();
    render(<ContactForm onSubmit={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });
});
```

### Snapshot Testing

```tsx
import { render } from '@testing-library/react';

describe('Card Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <Card title="Test" description="Description" />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
```

To update snapshots when UI changes intentionally:
```bash
npm run test:update
```

### Mocking

#### Mocking API Calls

```tsx
global.fetch = jest.fn();

beforeEach(() => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ data: [{ id: 1, name: 'Test' }] }),
  });
});

afterEach(() => {
  jest.clearAllMocks();
});
```

#### Mocking Next.js Router

The `jest.setup.js` includes router mocks. To customize:

```tsx
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
  pathname: '/custom-path',
});
```

## Writing Tests

### Naming Conventions

- Test files: `*.test.js(x)` or `*.spec.js(x)`
- Test descriptions: Use clear, behavior-focused language

```jsx
// Good
describe('UserProfile', () => {
  it('displays user name when loaded', () => {});
  it('shows loading spinner while fetching', () => {});
  it('handles network errors gracefully', () => {});
});

// Avoid
describe('UserProfile', () => {
  it('test 1', () => {});
  it('works', () => {});
});
```

### Testing Patterns

#### Arrange-Act-Assert (AAA)

```jsx
it('increments counter on click', async () => {
  // Arrange
  const user = userEvent.setup();
  render(<Counter initialValue={0} />);

  // Act
  await user.click(screen.getByRole('button', { name: /increment/i }));

  // Assert
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

#### Testing Async Operations

```tsx
it('loads data on mount', async () => {
  render(<DataLoader />);

  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});
```

## Best Practices

### Do's
- Test behavior, not implementation
- Use accessible queries (getByRole, getByLabelText)
- Keep tests focused and independent
- Use meaningful test descriptions
- Clean up after tests (afterEach, afterAll)

### Don'ts
- Don't test implementation details
- Don't share state between tests
- Don't use arbitrary timeouts (use waitFor)
- Don't test third-party libraries
- Don't duplicate coverage unnecessarily

### Query Priority (React Testing Library)

1. **Accessible queries** (recommended):
   - `getByRole`, `getByLabelText`, `getByPlaceholderText`, `getByText`

2. **Semantic queries**:
   - `getByAltText`, `getByTitle`

3. **Test IDs** (last resort):
   - `getByTestId`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test

on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: cd backend && npm ci

      - name: Run tests
        run: cd backend && npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: backend/coverage

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: cd frontend && npm ci

      - name: Run tests
        run: cd frontend && npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: frontend/coverage
```

### Coverage Thresholds

Add to `jest.config.js` to enforce coverage:

```javascript
module.exports = {
  // ... other config
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## Troubleshooting

### Common Issues

#### "Cannot find module" errors
- Ensure path aliases are configured in `jest.config.js`
- Check `jsconfig.json` paths match Jest configuration

#### Tests timing out
- Increase timeout: `jest.setTimeout(60000)`
- Check for unresolved promises
- Ensure async operations are properly awaited

#### Snapshot mismatches
- Review changes carefully
- Update if intentional: `npm run test:update`
- Check for environmental differences (dates, random values)

#### React Testing Library queries failing
- Use `screen.debug()` to see current DOM
- Check for async loading states
- Verify element visibility

### Debug Mode

```bash
# Run specific test file
npm test -- path/to/test.js

# Run tests matching pattern
npm test -- -t "button click"

# Debug with verbose output
npm test -- --verbose

# Run single test in watch mode
npm test -- --watch path/to/test.js
```

### Useful Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Supertest](https://github.com/visionmedia/supertest)
- [Strapi Testing Guide](https://docs.strapi.io/dev-docs/testing)
