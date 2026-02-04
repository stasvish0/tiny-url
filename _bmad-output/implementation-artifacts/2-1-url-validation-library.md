# Story 2.1: URL Validation Library

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **a URL validation module using Zod**,
so that **only valid URLs are accepted for shortening**.

## Acceptance Criteria

1. Zod schema validates URL format (valid scheme, host, path)
2. Rejects malformed URLs with clear error (INVALID_URL code path)
3. Validates URL length (reasonable max; align with architecture/NFRs)
4. Unit tests cover valid and invalid cases (success + error paths)
5. Located in `backend/src/lib/validation.ts`

## Tasks / Subtasks

- [x] Task 1: Add Zod dependency and create validation module (AC: #1, #5)
  - [x] Add `zod` to backend `package.json` if not present
  - [x] Create `backend/src/lib/validation.ts`
  - [x] Export URL schema and a validateUrl (or equivalent) function used by handlers
- [x] Task 2: Implement URL schema with format and length rules (AC: #1, #2, #3)
  - [x] Use `z.string().url()` or equivalent with scheme/host validation
  - [x] Enforce reasonable max length (e.g. 2048; document choice)
  - [x] Ensure malformed URLs return parse/validation errors (not 500)
- [x] Task 3: Align error with API contract (AC: #2)
  - [x] Validation failures must be mappable to INVALID_URL (400) and clear message
  - [x] Do not expose internal stack or raw Zod errors to clients
- [x] Task 4: Unit tests (AC: #4)
  - [x] Tests in `backend/__tests__/lib/validation.test.ts` (project uses `__tests__/` at backend root)
  - [x] Cover: valid HTTP/HTTPS URLs, invalid format, over-length, empty
  - [x] Use Vitest; follow existing backend test patterns

## Dev Notes

### Architecture Compliance

- **Input validation:** Architecture and project-context require Zod schemas for validation; URL validation is the first backend validation module. Same patterns will apply later for custom slug (Story 2.3).
- **API error code:** Use `INVALID_URL` (400) for URL validation failures. See project-context.md and architecture.md for response format: `{ success: false, error: { code: "INVALID_URL", message: "..." } }`.
- **Naming:** File `validation.ts` (architecture project structure). Functions camelCase (e.g. `validateUrl`), types PascalCase, constants SCREAMING_SNAKE_CASE (e.g. `MAX_URL_LENGTH`).

### Technical Requirements

- **Zod:** Use Zod for schema definition and parsing. Export a schema (e.g. `urlSchema`) and a small wrapper (e.g. `validateUrl(url: string)`) that returns parsed URL or throws/returns a result type that handlers can map to 400 + INVALID_URL.
- **URL rules:** Valid URL format (scheme, host); support at least `http` and `https`. Reject empty, malformed, or over-length input. Max length: choose a single reasonable value (e.g. 2048), document in code or Dev Notes.
- **No side effects:** Validation must be pure (no I/O, no DynamoDB). Handlers will call this before any DB or external calls.

### Library / Framework Requirements

- **Zod:** Use the version already in the repo (or add to backend). If adding, use a recent stable (e.g. 3.x). No other validation library for URL in backend.
- **TypeScript:** Strict mode. Types for parsed result (e.g. `string` or `{ url: string }`) so handlers get type-safe output.

### File Structure Requirements

- **Single file:** `backend/src/lib/validation.ts`. Do not create duplicate URL validation in handlers or elsewhere; handlers import from `lib/validation.ts`.
- **Tests:** `backend/__tests__/lib/validation.test.ts` (backend uses `__tests__/` at backend root, not `src/__tests__/`). Co-located with other backend lib tests; follow existing naming and structure (e.g. from health/response tests if present).

### Testing Requirements

- **Framework:** Vitest (per project-context and existing backend).
- **Coverage:** Valid URLs (http, https, with path/query), invalid (bad scheme, no host, malformed, empty, over max length). Both success and thrown/returned error paths.
- **No mocks needed** for this module (pure validation). Mock only if you introduce an abstraction that depends on external config.

### Project Structure Notes

- Backend already has `backend/src/lib/response.ts` and `backend/src/handlers/health.ts`. Add `backend/src/lib/validation.ts`; no changes to existing handler files in this story (handlers will use validation in Story 2.4).
- Frontend has its own `frontend/src/lib/validation.ts`; backend validation is separate. Do not reuse frontend file in backend; keep backend API validation in backend.

### Previous Story Intelligence (Epic 1)

- Story 1-4 established CI/CD (GitHub Actions, `sam deploy --config-env`). New code must pass existing PR workflow: `sam build`, backend tests, lint. Adding `validation.test.ts` will be run by the same pipeline.
- Backend layout: `backend/src/lib/` for shared logic, `backend/__tests__/` for tests (at backend root). Follow the same pattern as existing lib and tests.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — Input Validation (Zod), API Design (INVALID_URL), Naming Conventions, Project Structure (lib/validation.ts)
- [Source: _bmad-output/planning-artifacts/prd.md] — FR4 (validate URLs), NFR13 (input validation)
- [Source: _bmad-output/project-context.md] — Error codes (INVALID_URL), Zod usage, testing (Vitest, __tests__), naming conventions

## Dev Agent Record

### Agent Model Used

Create-story workflow (BMad); agent model not recorded.

### Debug Log References

(Optional)

### Completion Notes List

- Implemented `backend/src/lib/validation.ts`: `urlSchema` (Zod), `validateUrl()`, `ValidationError` (code INVALID_URL), `MAX_URL_LENGTH` (2048). HTTP/HTTPS only, length and format validated; handlers can catch ValidationError and return 400 with errorResponse(err.code, err.message, 400).
- Added `backend/__tests__/lib/validation.test.ts`: 14 Vitest tests for urlSchema and validateUrl (valid http/https, boundary 2048 chars, empty, malformed, invalid scheme, over-length, non-string; ValidationError instanceof and INVALID_URL). All tests pass; no regressions.
- Code review fixes: Dev Notes updated to correct test path (`backend/__tests__/lib/`); tests now assert `ValidationError` instanceof and added boundary, invalid-scheme, and non-string cases. Recommend committing backend changes before closing the story.

### File List

- backend/src/lib/validation.ts (new)
- backend/__tests__/lib/validation.test.ts (new)
