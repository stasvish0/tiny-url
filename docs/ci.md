# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for continuous integration. The pipeline runs on every push to `main`/`develop` and on pull requests.

## Pipeline Structure

```
┌─────────────────┐     ┌─────────────────┐
│  backend-lint   │     │  frontend-lint  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  backend-test   │     │  frontend-test  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  backend-build  │     │  frontend-build │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
            ┌─────────────────┐
            │  quality-gate   │
            └─────────────────┘
```

## Jobs

### Backend Pipeline

| Job | Duration | Description |
|-----|----------|-------------|
| `backend-lint` | ~1 min | ESLint code quality checks |
| `backend-test` | ~2 min | Vitest unit tests (11 tests) |
| `backend-build` | ~3 min | SAM build for Lambda deployment |

### Frontend Pipeline

| Job | Duration | Description |
|-----|----------|-------------|
| `frontend-lint` | ~1 min | ESLint code quality checks |
| `frontend-test` | ~1 min | Vitest unit tests (56 tests) |
| `frontend-build` | ~1 min | Vite production build |

### Quality Gate

The `quality-gate` job runs after all other jobs pass, providing a single status check for branch protection rules.

## Running Locally

Mirror the CI pipeline locally before pushing:

```bash
./scripts/ci-local.sh
```

This runs the same stages as CI:
1. Install dependencies
2. Lint
3. Test
4. Build

## Burn-In Testing

Detect flaky tests by running multiple iterations:

```bash
# Run 10 iterations (default)
./scripts/burn-in.sh

# Run 5 iterations
./scripts/burn-in.sh 5

# Run 10 iterations, backend only
./scripts/burn-in.sh 10 backend

# Run 10 iterations, frontend only
./scripts/burn-in.sh 10 frontend
```

**Rule:** If ANY iteration fails, the test is flaky and must be fixed before merging.

## Debugging Failed CI Runs

1. **Check the failed job** in GitHub Actions
2. **Download artifacts** (test results, coverage reports)
3. **Run locally** with `./scripts/ci-local.sh`
4. **Check for environment differences** (Node version, dependencies)

## Caching

The pipeline caches:
- **npm dependencies** — keyed by `package-lock.json` hash
- **Build artifacts** — uploaded for deployment jobs

## Artifacts

| Artifact | Condition | Retention |
|----------|-----------|-----------|
| `backend-test-results` | On failure | 7 days |
| `frontend-test-results` | On failure | 7 days |
| `frontend-dist` | Always | 7 days |

## Branch Protection

Recommended settings for `main` branch:

- ✅ Require status checks to pass
- ✅ Require `quality-gate` check
- ✅ Require branches to be up to date
- ✅ Require pull request reviews

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Total pipeline | <10 min | ~5 min |
| Lint (each) | <2 min | ~1 min |
| Test (each) | <3 min | ~2 min |
| Build (each) | <3 min | ~2 min |
