# Story 2.2: Short Code Generation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **a short code generator using nanoid**,
so that **unique 7-character codes are created for URLs**.

## Acceptance Criteria

1. Uses nanoid with 7-character length
2. Uses default nanoid alphabet (A-Za-z0-9_-)
3. Function is pure and testable (no side effects, no I/O)
4. Unit tests verify format and uniqueness
5. Located in `backend/src/lib/shortcode.ts`

## Tasks / Subtasks

- [x] Task 1: Add nanoid dependency and create shortcode module (AC: #1, #5)
  - [x] Add `nanoid` to backend `package.json` if not present
  - [x] Create `backend/src/lib/shortcode.ts`
  - [x] Export `generateShortCode()` function
- [x] Task 2: Implement short code generation with correct length and alphabet (AC: #1, #2, #3)
  - [x] Use `nanoid(7)` for 7-character codes
  - [x] Use default nanoid alphabet (A-Za-z0-9_-) — do NOT customize
  - [x] Export `SHORT_CODE_LENGTH` constant for reuse
  - [x] Ensure function is pure (no database calls, no side effects)
- [x] Task 3: Unit tests (AC: #4)
  - [x] Tests in `backend/__tests__/lib/shortcode.test.ts`
  - [x] Test: generated code is exactly 7 characters
  - [x] Test: generated code matches expected alphabet pattern `/^[A-Za-z0-9_-]+$/`
  - [x] Test: multiple calls produce different codes (uniqueness)
  - [x] Use Vitest; follow existing backend test patterns from validation.test.ts

## Dev Notes

### Architecture Compliance

- **Short Code Generation:** Architecture specifies nanoid with 7-character length and default alphabet (A-Za-z0-9_-). This is the collision-resistant code generator for URLs without custom slugs.
- **Collision handling:** The shortcode module itself does NOT handle collisions. Collision retry logic belongs in the shorten handler (Story 2.4) which will call DynamoDB with `ConditionExpression: 'attribute_not_exists(shortCode)'` and retry on failure.
- **Naming:** File `shortcode.ts` (architecture project structure). Function `generateShortCode` (camelCase), constant `SHORT_CODE_LENGTH` (SCREAMING_SNAKE_CASE).

### Technical Requirements

- **nanoid:** Use the `nanoid` package (latest stable). Import as `import { nanoid } from 'nanoid';`
- **Length:** Exactly 7 characters. Export constant `SHORT_CODE_LENGTH = 7` for consistency.
- **Alphabet:** Use nanoid's default alphabet (A-Za-z0-9_-). Do NOT customize the alphabet — the default provides 64 URL-safe characters with good collision resistance.
- **Pure function:** `generateShortCode()` must be pure — no I/O, no database calls, no side effects. It simply returns a new random string each call.

### Library / Framework Requirements

- **nanoid:** Add to backend `package.json` if not present. Use latest stable version (e.g., `^5.x`). nanoid is ESM-only in v4+; ensure backend tsconfig/bundling supports ESM imports.
- **TypeScript:** Strict mode. Return type is `string`.

### File Structure Requirements

- **Single file:** `backend/src/lib/shortcode.ts`. Do not create duplicate short code generation elsewhere; handlers import from `lib/shortcode.ts`.
- **Tests:** `backend/__tests__/lib/shortcode.test.ts` (backend uses `__tests__/` at backend root). Follow existing pattern from `validation.test.ts`.

### Testing Requirements

- **Framework:** Vitest (per project-context and existing backend).
- **Coverage:**
  - Generated code is exactly 7 characters
  - Generated code matches alphabet pattern `/^[A-Za-z0-9_-]+$/`
  - Multiple calls produce different codes (call 10+ times, verify all unique)
- **No mocks needed** for this module (pure function). Do not mock nanoid itself.

### Previous Story Intelligence (Story 2-1)

- Story 2-1 established the validation module pattern in `backend/src/lib/validation.ts`:
  - Export constants at top (e.g., `MAX_URL_LENGTH`)
  - Export main function with clear JSDoc
  - Tests in `backend/__tests__/lib/` with Vitest
- Follow the same file structure and test organization.
- Existing validation module exports `ValidationError` class; shortcode module is simpler (no errors to throw, just returns string).

### Project Structure Notes

- Backend already has `backend/src/lib/validation.ts` and `backend/src/lib/response.ts`. Add `backend/src/lib/shortcode.ts` alongside them.
- This module will be consumed by the shorten handler (Story 2.4) which handles collision retry.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Short Code Generation] — nanoid, 7 chars, default alphabet
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — Collision handling via retry
- [Source: _bmad-output/planning-artifacts/prd.md] — FR3 (generate unique short codes)
- [Source: _bmad-output/project-context.md] — nanoid(7), testing (Vitest, __tests__), naming conventions

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4 (Cascade)

### Debug Log References

N/A

### Completion Notes List

- Implementation already existed in `backend/src/lib/shortcode.ts` with correct pattern:
  - Exports `SHORT_CODE_LENGTH = 7` constant
  - Exports `generateShortCode()` function using `nanoid(SHORT_CODE_LENGTH)`
  - Pure function with no side effects
- Tests already existed in `backend/__tests__/lib/shortcode.test.ts` with 5 test cases:
  - Verifies SHORT_CODE_LENGTH is 7
  - Verifies generated code is exactly 7 characters
  - Verifies alphabet pattern `/^[A-Za-z0-9_-]+$/`
  - Verifies uniqueness across 100 iterations
  - Verifies consistency across 50 iterations
- All 31 backend tests pass (including 6 shortcode tests)
- nanoid `^5.0.9` already in package.json dependencies

**Code Review Fixes (2026-02-02):**
- Added JSDoc documentation to `generateShortCode()` function
- Added `ShortCode` type alias export for better type documentation
- Added JSDoc to `SHORT_CODE_LENGTH` constant
- Added test for `ShortCode` type assignability
- Renamed uniqueness test to clarify it's probabilistic

### File List

- backend/src/lib/shortcode.ts (modified - added JSDoc, ShortCode type)
- backend/__tests__/lib/shortcode.test.ts (modified - added type test, clarified test name)

