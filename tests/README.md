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

### Quick Start Commands

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

---

## 🏠 Local Testing (SAM Local)

Test API endpoints against a local AWS SAM emulator. **Requires Docker.**

### Prerequisites

- Docker Desktop installed and running
- AWS SAM CLI installed (`brew install aws-sam-cli`)
- DynamoDB Local (via Docker)

### Step-by-Step Local Setup

**1. Start DynamoDB Local**
```bash
# Start DynamoDB Local in Docker (keep running)
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local

# Create local table
aws dynamodb create-table \
  --table-name tiny-url-mappings-local \
  --attribute-definitions AttributeName=shortCode,AttributeType=S \
  --key-schema AttributeName=shortCode,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000
```

**2. Create Environment Configuration**

Create `backend/env.json`:
```json
{
  "ShortenFunction": {
    "TABLE_NAME": "tiny-url-mappings-local",
    "AWS_ENDPOINT_URL": "http://host.docker.internal:8000"
  },
  "HealthFunction": {
    "TABLE_NAME": "tiny-url-mappings-local"
  }
}
```

**3. Build and Start SAM Local**
```bash
cd backend

# Build Lambda functions
sam build

# Start local API Gateway on port 3000
sam local start-api --port 3000 --env-vars ../tests/backend/env.json
```

**Expected Output:**
```
Mounting HealthFunction at http://127.0.0.1:3000/api/health [GET]
Mounting ShortenFunction at http://127.0.0.1:3000/api/shorten [POST]
```

**4. Verify Local API is Running**
```bash
# In a new terminal, test health endpoint
curl http://localhost:3000/api/health
# Should return: {"success":true,"data":{"status":"ok"}}
```

**5. Run Tests Against Local API**
```bash
cd tests

# API tests will use http://localhost:3000 by default
npm run test:api

# Or run specific test file
npx playwright test shorten.api.spec.ts --project=api
```

### Local Testing Caveats

⚠️ **Known Limitations:**
- **Slow Cold Starts**: First Lambda invocation takes 5-10 seconds (Docker container initialization)
- **Docker Required**: All Lambdas run in Docker containers
- **DynamoDB Required**: API tests that write data will fail without DynamoDB Local
- **Port Conflicts**: Ensure ports 3000 and 8000 are available

### Troubleshooting Local Tests

**Error: ECONNREFUSED ::1:3000**
- SAM Local API is not running
- Start SAM Local in another terminal (see Step 3 above)
- Check if port 3000 is in use: `lsof -i :3000`

**Error: Docker daemon not running**
```bash
# macOS: Open Docker Desktop
open /Applications/Docker.app

# Verify Docker is running
docker ps
```

**Error: ResourceNotFoundException (DynamoDB)**
- DynamoDB Local not running or table not created
- Follow Step 1 above to start DynamoDB Local and create table

---

## ☁️ Remote Testing (AWS Deployed Environment)

Test against real deployed AWS infrastructure (dev, staging, prod).

### Deploy Backend to AWS

```bash
cd backend

# Build
sam build

# Deploy to dev environment
sam deploy --config-env dev

# Get the API URL from CloudFormation outputs
aws cloudformation describe-stacks \
  --stack-name tiny-url-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text
```

**Example Output:**
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com
```

### Configure API URL

**Option A: Environment Variable**
```bash
export API_URL="https://your-api-id.execute-api.region.amazonaws.com"
```

**Option B: Update `.env` file**
```bash
cd tests
echo "API_URL=https://your-api-id.execute-api.region.amazonaws.com" > .env
```

### Run Tests Against Remote

```bash
cd tests

# Run all API tests
npm run test:api

# Run with specific environment
API_URL=https://staging-api.example.com npm run test:api

# Run only shorten tests
npx playwright test shorten.api.spec.ts --project=api
```

### Remote Testing Benefits

✅ **Advantages:**
- **Fast**: No cold starts, real AWS performance
- **Real Environment**: Tests actual deployment configuration
- **DynamoDB**: Uses real AWS DynamoDB (no local setup)
- **CI/CD Ready**: Same commands work in pipelines

---

## 🎯 Local vs Remote Testing Comparison

| Aspect | Local (SAM Local) | Remote (AWS) |
|--------|-------------------|--------------|
| **Speed** | ❌ Slow (5-10s cold start) | ✅ Fast (< 1s) |
| **Setup** | ❌ Complex (Docker, DynamoDB Local) | ✅ Simple (just deploy) |
| **Cost** | ✅ Free | 💰 AWS charges apply |
| **Debugging** | ✅ Easy (local breakpoints) | ❌ Harder (CloudWatch logs) |
| **Realism** | ❌ Emulated environment | ✅ Real AWS services |
| **Internet** | ✅ Works offline | ❌ Requires connection |
| **CI/CD** | ❌ Complex setup | ✅ Native fit |

### When to Use Each

**Use Local Testing When:**
- 🔧 Rapid development iteration
- 🐛 Debugging Lambda logic
- 💸 Minimizing AWS costs during development
- ✈️ Working offline or on unstable network

**Use Remote Testing When:**
- ✅ Validating deployment configuration
- 🚀 Pre-production validation
- 🤖 Running in CI/CD pipelines
- 📊 Testing real AWS performance
- 🔐 Validating IAM permissions and policies

**Recommended Workflow:**
1. **Development**: Use local testing for quick iterations
2. **Pre-commit**: Run remote tests against dev environment
3. **CI/CD**: Always use remote testing in pipelines
4. **Pre-release**: Run full test suite against staging environment

---

## 🧪 Test Coverage

### API Integration Tests

#### `shorten.api.spec.ts` - 24 Test Scenarios

**Success Cases (4 tests)**
- ✅ Valid URL with generated 7-char code
- ✅ Custom slug acceptance
- ✅ Very long URLs (500+ characters)
- ✅ URLs with special characters, query params, fragments

**URL Validation (6 tests)**
- ✅ Invalid URL format → 400 INVALID_URL
- ✅ Missing URL field → 400 INVALID_REQUEST
- ✅ Non-string URL type → 400 INVALID_REQUEST
- ✅ Malformed JSON body → 400
- ✅ URL without protocol → 400 INVALID_URL
- ✅ Empty URL → 400

**Slug Validation (6 tests)**
- ✅ Reserved slugs (api, health, admin) → 400 INVALID_SLUG
- ✅ Slug too short (< 3 chars) → 400 INVALID_SLUG
- ✅ Invalid characters in slug → 400 INVALID_SLUG
- ✅ Non-string customSlug → 400 INVALID_REQUEST
- ✅ Empty string customSlug → generates code instead
- ✅ Slug too long (> 50 chars) → 400 INVALID_SLUG

**Collision Handling (2 tests)**
- ✅ Duplicate custom slug → 409 SLUG_TAKEN (CRITICAL TEST)
- ✅ Generated code collision retry mechanism

**API Contract (2 tests)**
- ✅ Success response format validation
- ✅ Error response format validation

#### `health.api.spec.ts` - 1 Test
- ✅ Health check returns ok status

#### `redirect.api.spec.ts` - Pending
🚧 Blocked by Story 3.1 (Redirect Lambda Handler)

### UI E2E Tests

#### `homepage.spec.ts` - Pending
🚧 Blocked by Epic 4 (Web User Interface)

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

## CI/CD Integration

### GitHub Actions Example

Tests are configured for CI with:
- Retries: 2 (CI only)
- Workers: 1 (CI only)
- Artifacts: Screenshots, videos, traces on failure

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd tests
          npm ci
          npx playwright install --with-deps

      - name: Deploy to test environment
        run: |
          cd backend
          sam build
          sam deploy --config-env test --no-confirm-changeset

      - name: Run API tests
        env:
          API_URL: ${{ secrets.TEST_API_URL }}
        run: |
          cd tests
          npm run test:api

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: tests/test-results/
```

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
