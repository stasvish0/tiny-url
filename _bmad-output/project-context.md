# Project Context for AI Agents

_Critical rules and patterns that AI agents must follow when implementing code in tiny-url. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React | 18.x |
| **Frontend Build** | Vite | 6.x |
| **Frontend Styling** | Tailwind CSS | 4.x |
| **Frontend Components** | shadcn/ui | latest |
| **Backend Runtime** | Node.js | 20.x LTS |
| **Backend Framework** | AWS Lambda | - |
| **Language** | TypeScript | 5.x |
| **Database** | DynamoDB | - |
| **Validation** | Zod | latest |
| **Short Code Generation** | nanoid | latest |
| **IaC** | AWS SAM | latest |

---

## Critical Implementation Rules

### 1. Naming Conventions (MUST FOLLOW)

**TypeScript Files:**
- Files: `kebab-case.ts` (e.g., `url-validation.ts`, `short-code.ts`)
- Functions: `camelCase` (e.g., `generateShortCode`, `validateUrl`)
- Types/Interfaces: `PascalCase` (e.g., `ShortenRequest`, `UrlMapping`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `RESERVED_SLUGS`, `MAX_URL_LENGTH`)

**DynamoDB:**
- Table name: `tiny-url-mappings-{env}` (kebab-case with environment suffix)
- Attributes: `camelCase` (e.g., `shortCode`, `originalUrl`, `createdAt`)

**API:**
- Endpoints: lowercase with hyphens (`/api/shorten`)
- Path parameters: `camelCase` (`/{shortCode}`)

### 2. API Response Format (MUST USE)

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

**Error Codes:**
- `INVALID_URL` (400) — URL format invalid
- `SLUG_TAKEN` (409) — Custom slug already exists
- `NOT_FOUND` (404) — Short code doesn't exist
- `RATE_LIMITED` (429) — Too many requests

### 3. Lambda Handler Pattern (MUST FOLLOW)

```typescript
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    // Business logic here
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: { ... } }),
    };
  } catch (error) {
    console.error('Handler error:', JSON.stringify({ level: 'error', message: error.message, stack: error.stack }));
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } }),
    };
  }
};
```

### 4. Logging Format (MUST USE)

**Structured JSON logging for CloudWatch:**
```typescript
console.log(JSON.stringify({
  level: 'info',
  message: 'URL shortened',
  shortCode: 'abc1234',
  timestamp: new Date().toISOString()
}));
```

**Log Levels:** `error` > `warn` > `info` > `debug`

### 5. Short Code Generation

```typescript
import { nanoid } from 'nanoid';

const SHORT_CODE_LENGTH = 7;
const generateShortCode = () => nanoid(SHORT_CODE_LENGTH);
```

- Length: 7 characters
- Alphabet: a-z, A-Z, 0-9 (lowercase only)
- Collision handling: Retry with new code if exists

### 6. Custom Slug Validation

```typescript
import { z } from 'zod';

const RESERVED_SLUGS = ['api', 'health', 'admin', 'static', 'assets'];

const slugSchema = z.string()
  .min(3)
  .max(50)
  .regex(/^[a-zA-Z0-9-]+$/, 'Only letters, numbers, and hyphens allowed')
  .refine(slug => !RESERVED_SLUGS.includes(slug), 'This slug is reserved');
```

### 7. DynamoDB Operations

**Get Item (Redirect):**
```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const result = await client.send(new GetCommand({
  TableName: process.env.TABLE_NAME,
  Key: { shortCode },
}));
```

**Put Item (Shorten):**
```typescript
await client.send(new PutCommand({
  TableName: process.env.TABLE_NAME,
  Item: {
    shortCode,
    originalUrl,
    createdAt: Date.now(),
  },
  ConditionExpression: 'attribute_not_exists(shortCode)',
}));
```

---

## Project Structure

### Backend (`/backend`)
```
src/
├── handlers/           # Lambda entry points (thin, delegate to lib)
│   ├── shorten.ts      # POST /api/shorten
│   ├── redirect.ts     # GET /{shortCode}
│   └── health.ts       # GET /api/health
├── lib/                # Business logic (testable, reusable)
│   ├── dynamodb.ts     # DynamoDB client singleton
│   ├── shortcode.ts    # nanoid generation
│   ├── validation.ts   # Zod schemas
│   └── response.ts     # API response helpers
├── types/
│   └── index.ts        # Shared TypeScript types
└── __tests__/          # Unit tests
```

### Frontend (`/frontend`)
```
src/
├── components/         # UI components (kebab-case files)
│   ├── url-input.tsx
│   ├── result-card.tsx
│   ├── copy-button.tsx
│   └── custom-slug-input.tsx
├── hooks/
│   └── use-shorten.ts  # API integration hook
├── lib/
│   ├── api.ts          # Fetch wrapper
│   └── validation.ts   # Client-side Zod schemas
├── types/
│   └── index.ts
└── App.tsx
```

---

## Anti-Patterns to Avoid

❌ **DO NOT** use `snake_case` for TypeScript variables or DynamoDB attributes
❌ **DO NOT** return raw error messages to clients (security risk)
❌ **DO NOT** hardcode environment values (use `process.env`)
❌ **DO NOT** create AWS resources manually (use SAM template)
❌ **DO NOT** use `console.log` with plain strings (use structured JSON)
❌ **DO NOT** skip input validation on any endpoint
❌ **DO NOT** use Redux or complex state management (use React hooks)
❌ **DO NOT** add comments unless explicitly asked

---

## Testing Requirements

- Unit tests in `__tests__/` folders (co-located)
- Test file naming: `{module}.test.ts`
- Use Vitest for testing
- Mock DynamoDB client in tests
- Test both success and error paths

---

## Infrastructure as Code

**All AWS resources MUST be defined in SAM template:**
- Lambda functions
- API Gateway HTTP API
- DynamoDB table
- IAM roles and policies

**Deployment:**
```bash
sam deploy --config-env dev   # Deploy to dev
sam deploy --config-env prod  # Deploy to prod
```

---

## Quick Reference

| What | How |
|------|-----|
| Generate short code | `nanoid(7)` |
| Validate URL | Zod schema with URL regex |
| Validate custom slug | `^[a-zA-Z0-9-]+$`, 3-50 chars |
| API success | `{ success: true, data: {...} }` |
| API error | `{ success: false, error: { code, message } }` |
| Log format | Structured JSON with level, message, timestamp |
| Redirect | 301 status code |
