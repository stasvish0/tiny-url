# Story 1.1: Backend Project Initialization

Status: done

## Story

As a **developer**,
I want **to initialize the AWS SAM backend project with TypeScript**,
so that **I have a working Lambda deployment pipeline**.

## Acceptance Criteria

1. SAM project initialized with Node.js 20 runtime
2. TypeScript configured with strict mode
3. `template.yaml` defines basic Lambda function
4. `sam build` and `sam local invoke` work
5. Project structure matches architecture spec

## Tasks / Subtasks

- [x] Task 1: Initialize SAM project (AC: #1)
  - [x] Run `sam init` with Node.js 20 and TypeScript template
  - [x] Rename/restructure to `backend/` directory
  - [x] Verify `sam build` succeeds

- [x] Task 2: Configure TypeScript (AC: #2)
  - [x] Update `tsconfig.json` with strict mode
  - [x] Configure module resolution for ES modules
  - [x] Set target to ES2022 for Node.js 20

- [x] Task 3: Create project structure (AC: #5)
  - [x] Create `src/handlers/` directory
  - [x] Create `src/lib/` directory
  - [x] Create `src/types/` directory
  - [x] Create `__tests__/` directory structure

- [x] Task 4: Configure SAM template (AC: #3)
  - [x] Define basic health check Lambda function
  - [x] Configure HTTP API Gateway
  - [x] Set environment variables structure
  - [x] Configure IAM permissions

- [x] Task 5: Verify local development (AC: #4)
  - [x] Run `sam build` successfully
  - [x] Run `sam local invoke` for health function
  - [x] Verify TypeScript compilation works

- [x] Task 6: Setup package.json (AC: #1, #2)
  - [x] Add required dependencies (@aws-sdk/*, zod, nanoid)
  - [x] Add dev dependencies (typescript, @types/*, vitest)
  - [x] Configure build and test scripts

## Dev Notes

### Architecture Compliance

**Technology Stack:**
- Runtime: Node.js 20.x LTS
- Language: TypeScript 5.x with strict mode
- IaC: AWS SAM (template.yaml)
- Package manager: npm

**SAM Initialization Command:**
```bash
sam init --runtime nodejs20.x --app-template hello-world-typescript --name backend
```

### Project Structure (MUST FOLLOW)

```
backend/
├── template.yaml              # SAM infrastructure definition
├── samconfig.toml             # Deployment configuration
├── package.json
├── tsconfig.json
├── vitest.config.ts           # Test configuration
├── .gitignore                 # Git ignore patterns
├── src/
│   ├── handlers/              # Lambda entry points (thin)
│   │   └── health.ts          # GET /api/health (start here)
│   ├── lib/                   # Business logic (testable)
│   │   └── response.ts        # API response helpers
│   └── types/
│       └── index.ts           # Shared TypeScript types
└── __tests__/
    ├── handlers/
    │   └── health.test.ts
    └── lib/
        └── response.test.ts
```

### TypeScript Configuration

**tsconfig.json requirements:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
```

### SAM Template Structure

**template.yaml must include:**
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: tiny-url backend API

Globals:
  Function:
    Timeout: 10
    Runtime: nodejs20.x
    MemorySize: 256
    Architectures:
      - arm64

Parameters:
  Environment:
    Type: String
    Default: dev
    AllowedValues:
      - dev
      - prod

Resources:
  HttpApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      StageName: !Ref Environment
      CorsConfiguration:
        AllowOrigins:
          - "*"
        AllowMethods:
          - GET
          - POST
          - OPTIONS
        AllowHeaders:
          - Content-Type

  HealthFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: dist/handlers/health.handler
      CodeUri: .
      Events:
        Health:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /api/health
            Method: GET
    Metadata:
      BuildMethod: esbuild
      BuildProperties:
        Minify: true
        Target: es2022
        EntryPoints:
          - src/handlers/health.ts

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint URL
    Value: !Sub "https://${HttpApi}.execute-api.${AWS::Region}.amazonaws.com/${Environment}"
```

### samconfig.toml Structure

```toml
version = 0.1

[default.build.parameters]
cached = true
parallel = true

[dev.deploy.parameters]
stack_name = "tiny-url-dev"
resolve_s3 = true
s3_prefix = "tiny-url-dev"
region = "us-east-1"
confirm_changeset = false
capabilities = "CAPABILITY_IAM"
parameter_overrides = "Environment=dev"

[prod.deploy.parameters]
stack_name = "tiny-url-prod"
resolve_s3 = true
s3_prefix = "tiny-url-prod"
region = "us-east-1"
confirm_changeset = true
capabilities = "CAPABILITY_IAM"
parameter_overrides = "Environment=prod"
```

### Package.json Dependencies

**Required dependencies:**
```json
{
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.x",
    "@aws-sdk/lib-dynamodb": "^3.x",
    "nanoid": "^5.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@types/aws-lambda": "^8.x",
    "@types/node": "^20.x",
    "typescript": "^5.x",
    "vitest": "^2.x",
    "esbuild": "^0.x"
  }
}
```

### Health Handler Pattern

**src/handlers/health.ts:**
```typescript
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { successResponse, errorResponse } from '../lib/response';
import { HealthResponse } from '../types';

export const handler: APIGatewayProxyHandlerV2 = async () => {
  try {
    const data: HealthResponse = { status: 'ok' };
    return successResponse(data);
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    return errorResponse('INTERNAL_ERROR', 'Something went wrong', 500);
  }
};
```

### Naming Conventions (CRITICAL)

- Files: `kebab-case.ts` (e.g., `health.ts`, `response.ts`)
- Functions: `camelCase` (e.g., `handler`, `successResponse`)
- Types: `PascalCase` (e.g., `ApiResponse`, `HealthStatus`)
- Constants: `SCREAMING_SNAKE_CASE`

### Anti-Patterns to Avoid

❌ DO NOT use CommonJS (`require`) - use ES modules (`import`)
❌ DO NOT hardcode region or environment values
❌ DO NOT skip strict mode in TypeScript
❌ DO NOT create AWS resources outside SAM template
❌ DO NOT use `console.log` with plain strings - use structured JSON

### Testing Requirements

- Create `__tests__/handlers/health.test.ts`
- Use Vitest for testing
- Test handler returns correct response format

### References

- [Source: architecture.md#Backend Starter]
- [Source: architecture.md#Technology Stack Selection]
- [Source: project-context.md#Project Structure]
- [Source: project-context.md#Lambda Handler Pattern]

---

## Dev Agent Record

### Agent Model Used

Claude (Cascade)

### Debug Log References

- TypeScript compilation: `npm run lint` - PASSED
- Unit tests: `npm test` - 11 tests passed (2 test files)
- SAM build: `sam build` - PASSED
- SAM local invoke: `sam local invoke HealthFunction` - PASSED

### Completion Notes List

- Created complete backend project structure matching architecture spec
- Configured TypeScript 5.x with strict mode, ES2022 target, ESNext modules
- Created SAM template with HTTP API Gateway and HealthFunction Lambda
- Implemented health handler following project-context.md patterns
- Created response helpers (successResponse, errorResponse) for consistent API responses
- Added comprehensive unit tests for health handler and response helpers
- All 11 tests passing
- SAM build and local invoke verified successfully

### Code Review Fixes Applied

- **[H2/H3]** Updated health handler to use try/catch error handling and response helpers
- **[M2]** Health handler now imports and uses `HealthResponse` type
- **[M3]** Tests now use properly typed mocks instead of `as any`
- **[L1]** Set vitest globals to false (tests use explicit imports)
- **[L2]** Added `.gitignore` for node_modules, dist, .aws-sam, etc.
- **[M1/M4]** Updated project structure documentation to include all files

### Change Log

- 2026-01-25: Initial implementation of backend project structure
- 2026-01-25: Code review fixes - error handling, types, test quality, gitignore

### File List

_Files created/modified during implementation:_
- [x] `backend/template.yaml`
- [x] `backend/samconfig.toml`
- [x] `backend/package.json`
- [x] `backend/tsconfig.json`
- [x] `backend/vitest.config.ts`
- [x] `backend/.gitignore`
- [x] `backend/src/handlers/health.ts`
- [x] `backend/src/lib/response.ts`
- [x] `backend/src/types/index.ts`
- [x] `backend/__tests__/handlers/health.test.ts`
- [x] `backend/__tests__/lib/response.test.ts`
