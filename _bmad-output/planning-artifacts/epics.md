# Epics & User Stories - tiny-url

**Source:** PRD (prd.md)
**Date:** 2026-01-25

---

## Epic 1: Project Setup & Infrastructure

**Objective:** Establish the foundational project structure, AWS SAM infrastructure, and development environment.

**Business Value:** Enable all subsequent development with a solid, deployable foundation.

### Story 1.1: Backend Project Initialization

**As a** developer,
**I want** to initialize the AWS SAM backend project with TypeScript,
**so that** I have a working Lambda deployment pipeline.

**Acceptance Criteria:**
- [ ] SAM project initialized with Node.js 20 runtime
- [ ] TypeScript configured with strict mode
- [ ] `template.yaml` defines basic Lambda function
- [ ] `sam build` and `sam local invoke` work
- [ ] Project structure matches architecture spec

**Source:** [architecture.md#Backend Starter]

---

### Story 1.2: Frontend Project Initialization

**As a** developer,
**I want** to initialize the React frontend with Vite and TypeScript,
**so that** I have a working SPA development environment.

**Acceptance Criteria:**
- [ ] Vite + React + TypeScript project created
- [ ] Tailwind CSS configured
- [ ] shadcn/ui initialized
- [ ] `npm run dev` starts development server
- [ ] Project structure matches architecture spec

**Source:** [architecture.md#Frontend Starter]

---

### Story 1.3: DynamoDB Table Setup

**As a** developer,
**I want** to define the DynamoDB table in SAM template,
**so that** URL mappings can be stored and retrieved.

**Acceptance Criteria:**
- [ ] DynamoDB table defined in `template.yaml`
- [ ] Partition key is `shortCode` (String)
- [ ] On-demand billing mode configured
- [ ] Table name includes environment suffix
- [ ] `sam deploy` creates table successfully

**Source:** [architecture.md#DynamoDB Table Design]

---

### Story 1.4: CI/CD Pipeline Setup

**As a** developer,
**I want** GitHub Actions workflows for deployment,
**so that** code changes automatically deploy to dev/prod.

**Acceptance Criteria:**
- [ ] `deploy-dev.yml` deploys on push to `dev` branch
- [ ] `deploy-prod.yml` deploys on push to `main` branch
- [ ] PR workflow runs tests only
- [ ] AWS credentials configured via GitHub secrets
- [ ] Deployment uses `sam deploy --config-env`

**Source:** [architecture.md#Infrastructure]

---

## Epic 2: URL Shortening API

**Objective:** Build the core URL shortening functionality as Lambda endpoints.

**Business Value:** Enable users to create short URLs (FR1-FR7).

### Story 2.1: URL Validation Library

**As a** developer,
**I want** a URL validation module using Zod,
**so that** only valid URLs are accepted for shortening.

**Acceptance Criteria:**
- [ ] Zod schema validates URL format
- [ ] Rejects malformed URLs with clear error
- [ ] Validates URL length (reasonable max)
- [ ] Unit tests cover valid and invalid cases
- [ ] Located in `src/lib/validation.ts`

**Source:** [PRD FR4, architecture.md#Custom Slug Validation]

---

### Story 2.2: Short Code Generation

**As a** developer,
**I want** a short code generator using nanoid,
**so that** unique 7-character codes are created for URLs.

**Acceptance Criteria:**
- [ ] Uses nanoid with 7-character length
- [ ] Uses default nanoid alphabet (A-Za-z0-9_-)
- [ ] Function is pure and testable
- [ ] Unit tests verify format and uniqueness
- [ ] Located in `src/lib/shortcode.ts`

**Source:** [PRD FR3, architecture.md#Short Code Generation]

---

### Story 2.3: Custom Slug Validation

**As a** developer,
**I want** custom slug validation with reserved word checking,
**so that** users can create memorable, valid slugs.

**Acceptance Criteria:**
- [ ] Validates slug format: a-z, A-Z, 0-9, hyphen only
- [ ] Enforces length: 3-50 characters
- [ ] Rejects reserved slugs: api, health, admin, static, assets
- [ ] Returns specific error codes for each failure
- [ ] Unit tests cover all validation rules

**Source:** [PRD FR2, FR5, FR6, architecture.md#Custom Slug Validation]

---

### Story 2.4: Shorten Lambda Handler

**As a** developer,
**I want** a POST /api/shorten endpoint,
**so that** users can submit URLs and receive short codes.

**Acceptance Criteria:**
- [ ] Accepts JSON body with `url` and optional `customSlug`
- [ ] Validates URL using validation library
- [ ] Generates short code or validates custom slug
- [ ] Stores mapping in DynamoDB
- [ ] Returns `{ success: true, data: { shortUrl } }`
- [ ] Returns appropriate error responses
- [ ] Handles collision retry for generated codes

**Source:** [PRD FR1-FR7, architecture.md#API Design]

---

### Story 2.5: DynamoDB Client Module

**As a** developer,
**I want** a DynamoDB client module with get/put operations,
**so that** handlers can store and retrieve URL mappings.

**Acceptance Criteria:**
- [ ] Creates DynamoDB Document Client singleton
- [ ] `getMapping(shortCode)` returns URL or null
- [ ] `putMapping(shortCode, originalUrl)` stores with timestamp
- [ ] Uses conditional write to prevent overwrites
- [ ] Table name from environment variable
- [ ] Located in `src/lib/dynamodb.ts`

**Source:** [architecture.md#DynamoDB Operations, project-context.md]

---

## Epic 3: URL Redirect Service

**Objective:** Build the high-performance redirect endpoint.

**Business Value:** Enable short URLs to redirect users to destinations (FR8-FR11).

### Story 3.1: Redirect Lambda Handler

**As a** developer,
**I want** a GET /{shortCode} endpoint,
**so that** short URLs redirect to their destinations.

**Acceptance Criteria:**
- [ ] Extracts shortCode from path parameter
- [ ] Looks up URL in DynamoDB
- [ ] Returns 301 redirect with Location header
- [ ] Returns 404 for non-existent codes
- [ ] Logs redirect for debugging
- [ ] Target latency < 100ms

**Source:** [PRD FR8-FR11, architecture.md#API Design]

---

### Story 3.2: Health Check Endpoint

**As a** developer,
**I want** a GET /api/health endpoint,
**so that** monitoring can verify the service is running.

**Acceptance Criteria:**
- [ ] Returns `{ status: "ok" }` with 200
- [ ] Responds in < 50ms
- [ ] No database dependency for basic health
- [ ] Defined in SAM template

**Source:** [PRD FR20, architecture.md#API Design]

---

## Epic 4: Web User Interface

**Objective:** Build the React SPA for URL shortening.

**Business Value:** Provide users a clean, responsive interface (FR12-FR18).

### Story 4.1: URL Input Component

**As a** user,
**I want** a text input field for pasting my long URL,
**so that** I can submit it for shortening.

**Acceptance Criteria:**
- [ ] Large, prominent input field
- [ ] Placeholder text guides user
- [ ] Validates URL format on blur
- [ ] Shows inline validation error
- [ ] Accessible with proper labels
- [ ] Mobile-responsive

**Source:** [PRD FR12, FR4, ux-design-specification.md]

---

### Story 4.2: Custom Slug Input Component

**As a** user,
**I want** an optional field to enter a custom slug,
**so that** I can create memorable short URLs.

**Acceptance Criteria:**
- [ ] Collapsible/optional field
- [ ] Shows character constraints
- [ ] Validates format in real-time
- [ ] Indicates availability (future: API check)
- [ ] Clear error messaging

**Source:** [PRD FR13, FR5, FR6, ux-design-specification.md]

---

### Story 4.3: Shorten Button & API Integration

**As a** user,
**I want** to click "Shorten" and see my short URL,
**so that** I can use it immediately.

**Acceptance Criteria:**
- [ ] Button disabled until valid URL entered
- [ ] Shows loading state during API call
- [ ] Calls POST /api/shorten
- [ ] Displays result on success
- [ ] Shows error toast on failure
- [ ] Keyboard accessible (Enter to submit)

**Source:** [PRD FR14, FR15, FR17]

---

### Story 4.4: Result Card with Copy Button

**As a** user,
**I want** to see my short URL with a copy button,
**so that** I can easily share it.

**Acceptance Criteria:**
- [ ] Displays short URL prominently
- [ ] One-click copy to clipboard
- [ ] Visual feedback on copy (checkmark, toast)
- [ ] "Shorten Another" option to reset
- [ ] Accessible copy button

**Source:** [PRD FR15, FR16, ux-design-specification.md]

---

### Story 4.5: Responsive Layout & Styling

**As a** user,
**I want** the interface to work on my phone, tablet, or desktop,
**so that** I can shorten URLs from any device.

**Acceptance Criteria:**
- [ ] Mobile: single column, full-width input
- [ ] Tablet: centered card layout
- [ ] Desktop: centered card, max-width container
- [ ] Tailwind breakpoints implemented
- [ ] Touch-friendly button sizes on mobile

**Source:** [PRD FR18, ux-design-specification.md#Responsive Design]

---

### Story 4.6: Error Handling & User Feedback

**As a** user,
**I want** clear error messages when something goes wrong,
**so that** I know how to fix the problem.

**Acceptance Criteria:**
- [ ] Invalid URL: inline error message
- [ ] Slug taken: specific error with suggestion
- [ ] Network error: toast notification
- [ ] Rate limited: friendly message with wait time
- [ ] All errors are accessible (announced to screen readers)

**Source:** [PRD FR17, architecture.md#Error Codes]

---

## Epic 5: Production Readiness

**Objective:** Ensure the system is production-ready with logging, monitoring, and performance.

**Business Value:** Meet NFRs for reliability, performance, and observability.

### Story 5.1: Structured Logging

**As a** developer,
**I want** structured JSON logging in all Lambda handlers,
**so that** I can debug issues in CloudWatch.

**Acceptance Criteria:**
- [ ] All handlers use structured JSON format
- [ ] Logs include: level, message, timestamp, context
- [ ] Redirect logs include shortCode
- [ ] Shorten logs include result (success/error)
- [ ] No sensitive data in logs

**Source:** [PRD FR19, architecture.md#Logging]

---

### Story 5.2: API Response Helpers

**As a** developer,
**I want** standardized API response helper functions,
**so that** all endpoints return consistent formats.

**Acceptance Criteria:**
- [ ] `successResponse(data)` returns `{ success: true, data }`
- [ ] `errorResponse(code, message, status)` returns error format
- [ ] Helpers set correct HTTP status codes
- [ ] Located in `src/lib/response.ts`

**Source:** [architecture.md#API Response Format, project-context.md]

---

### Story 5.3: Frontend Deployment to S3/CloudFront

**As a** developer,
**I want** the frontend deployed to S3 with CloudFront,
**so that** users can access the SPA globally with low latency.

**Acceptance Criteria:**
- [ ] S3 bucket configured for static hosting
- [ ] CloudFront distribution with HTTPS
- [ ] Build output uploaded on deploy
- [ ] Cache invalidation on deploy
- [ ] Infrastructure defined in SAM template

**Source:** [architecture.md#AWS Deployment Architecture]

---

### Story 5.4: End-to-End Testing

**As a** developer,
**I want** end-to-end tests for the core user journey,
**so that** I can verify the system works as expected.

**Acceptance Criteria:**
- [ ] Test: shorten URL → copy → redirect works
- [ ] Test: custom slug creation works
- [ ] Test: invalid URL shows error
- [ ] Test: 404 for non-existent code
- [ ] Tests run in CI pipeline

**Source:** [PRD Success Criteria]

---

## Story Summary

| Epic | Stories | Focus |
|------|---------|-------|
| **1. Project Setup** | 4 | Infrastructure, CI/CD |
| **2. URL Shortening API** | 5 | Core backend logic |
| **3. Redirect Service** | 2 | Performance-critical path |
| **4. Web UI** | 6 | User-facing SPA |
| **5. Production Readiness** | 4 | Logging, deployment, testing |

**Total Stories:** 21

---

## Implementation Order (Recommended)

1. **Epic 1** — Foundation must come first
2. **Epic 2** — Core API enables testing
3. **Epic 3** — Complete backend
4. **Epic 4** — Build UI against working API
5. **Epic 5** — Polish for production
