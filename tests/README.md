# tiny-url Test Suite

Production-ready test framework using **Playwright** for E2E and API testing.

## Setup

```bash
cd tests
npm install
npx playwright install
```

Copy environment configuration:
```bash
cp .env.example .env
```

## Running Tests

```bash
# Run all tests
npm test

# Run with UI mode (interactive)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Run with debugger
npm run test:debug

# Run API tests only
npm run test:api

# Run specific browser
npm run test:chromium

# View HTML report
npm run report
```

## Project Structure

```
tests/
├── playwright.config.ts      # Playwright configuration
├── package.json              # Test dependencies
├── .env.example              # Environment template
├── e2e/                      # Test files
│   ├── health.api.spec.ts    # Health endpoint tests
│   ├── shorten.api.spec.ts   # URL shortening API tests
│   ├── redirect.api.spec.ts  # Redirect API tests
│   └── homepage.spec.ts      # UI tests
└── support/                  # Test infrastructure
    ├── fixtures/
    │   └── index.ts          # Playwright fixtures
    └── helpers/
        ├── api-client.ts     # API client wrapper
        └── url-factory.ts    # Test data factory
```

## Architecture

### Fixture Pattern

Tests use composable fixtures via `mergeTests`:

```typescript
import { test, expect } from '../support/fixtures';

test('example', async ({ apiClient }) => {
  const response = await apiClient.health();
  expect(response.success).toBe(true);
});
```

### Data Factories

Use factories for test data generation:

```typescript
import { UrlFactory } from '../support/helpers/url-factory';

const urlFactory = new UrlFactory();
const url = urlFactory.createValidUrl();
const slug = urlFactory.createCustomSlug();
```

### API Client

Typed API client for backend testing:

```typescript
const response = await apiClient.shorten({
  url: 'https://example.com',
  customSlug: 'my-link',
});
```

## Test Categories

| Category | Pattern | Description |
|----------|---------|-------------|
| API Tests | `*.api.spec.ts` | Backend API testing (no browser) |
| UI Tests | `*.spec.ts` | Browser-based E2E tests |

## Selector Strategy

Use `data-testid` attributes for reliable selectors:

```typescript
await page.locator('[data-testid="url-input"]').fill('...');
await page.click('[data-testid="shorten-button"]');
```

## CI Configuration

Tests are configured for CI with:
- Retries: 2 (CI only)
- Workers: 1 (CI only)
- Artifacts: Screenshots, videos, traces on failure

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:5173` | Frontend URL |
| `API_URL` | `http://localhost:3000` | Backend API URL |
| `CI` | `false` | CI environment flag |

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Data Factories**: Use factories for test data, not hardcoded values
3. **Selectors**: Always use `data-testid` attributes
4. **Assertions**: Use explicit assertions, not implicit waits
5. **Cleanup**: Fixtures handle cleanup automatically

## Knowledge Base References

- Fixture Architecture: `_bmad/bmm/testarch/knowledge/fixture-architecture.md`
- Data Factories: `_bmad/bmm/testarch/knowledge/data-factories.md`
- Test Levels: `_bmad/bmm/testarch/knowledge/test-levels-framework.md`
