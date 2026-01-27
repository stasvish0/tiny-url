# Story 1.4: CI/CD Pipeline Setup

Status: done

## Story

As a **developer**,
I want **GitHub Actions workflows for deployment**,
so that **code changes automatically deploy to dev/prod**.

## Acceptance Criteria

1. `deploy-dev.yml` deploys on push to `dev` branch
2. `deploy-prod.yml` deploys on push to `main` branch
3. PR workflow runs tests only
4. AWS credentials configured via GitHub secrets
5. Deployment uses `sam deploy --config-env`

## Tasks / Subtasks

- [x] Task 1: Create samconfig.toml for environment configuration (AC: #5)
  - [x] Create `backend/samconfig.toml` file (already existed, updated)
  - [x] Configure `[dev.deploy.parameters]` section with stack_name and parameter_overrides
  - [x] Configure `[prod.deploy.parameters]` section with stack_name and parameter_overrides
  - [x] Set s3_bucket, region, and capabilities

- [x] Task 2: Create deploy-dev.yml workflow (AC: #1, #4, #5)
  - [x] Create `.github/workflows/deploy-dev.yml`
  - [x] Trigger on push to `dev` branch
  - [x] Configure AWS credentials from GitHub secrets
  - [x] Run `sam build` in backend directory
  - [x] Run `sam deploy --config-env dev --no-confirm-changeset`

- [x] Task 3: Create deploy-prod.yml workflow (AC: #2, #4, #5)
  - [x] Create `.github/workflows/deploy-prod.yml`
  - [x] Trigger on push to `main` branch
  - [x] Configure AWS credentials from GitHub secrets
  - [x] Run `sam build` in backend directory
  - [x] Run `sam deploy --config-env prod --no-confirm-changeset`

- [x] Task 4: Create PR workflow for tests (AC: #3)
  - [x] Create `.github/workflows/pr-check.yml`
  - [x] Trigger on pull_request to `dev` and `main` branches
  - [x] Run `sam validate` for backend
  - [x] Run `sam build` for backend
  - [x] Run backend tests (if any exist)
  - [x] Run frontend lint and tests (if any exist)

- [x] Task 5: Document required GitHub secrets (AC: #4)
  - [x] Document `AWS_ACCESS_KEY_ID` secret requirement
  - [x] Document `AWS_SECRET_ACCESS_KEY` secret requirement
  - [x] Add setup instructions to docs/DEPLOYMENT.md

- [x] Task 6: Validate workflows locally (AC: #1, #2, #3)
  - [x] Verify YAML syntax is valid
  - [ ] Test `sam deploy --config-env dev` locally (optional)
  - [ ] Commit and push to verify workflow triggers

## Dev Notes

### Architecture Compliance

**CI/CD Decision (from architecture.md):**

>| Category | Decision | Rationale |
>|----------|----------|-----------|
>| CI/CD | GitHub Actions + SAM | Free, native AWS integration |

**Deployment Commands (from project-context.md):**

>```bash
>sam deploy --config-env dev   # Deploy to dev
>sam deploy --config-env prod  # Deploy to prod
>```

### SAM Configuration Pattern

**samconfig.toml structure (from architecture.md):**

```toml
[dev.deploy.parameters]
stack_name = "tiny-url-dev"
parameter_overrides = "Environment=dev"

[prod.deploy.parameters]
stack_name = "tiny-url-prod"
parameter_overrides = "Environment=prod"
```

**Additional recommended settings:**
```toml
[default.deploy.parameters]
capabilities = "CAPABILITY_IAM"
confirm_changeset = false
resolve_s3 = true
```

### GitHub Actions Workflow Pattern

**Deploy workflow structure:**
```yaml
name: Deploy to Dev
on:
  push:
    branches: [dev]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/setup-sam@v2
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: sam build
        working-directory: backend
      - run: sam deploy --config-env dev --no-confirm-changeset
        working-directory: backend
```

**PR check workflow structure:**
```yaml
name: PR Check
on:
  pull_request:
    branches: [dev, main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/setup-sam@v2
      - run: sam validate
        working-directory: backend
      - run: sam build
        working-directory: backend
```

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | IAM user access key with deployment permissions |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |

**IAM Permissions needed:**
- CloudFormation (create/update stacks)
- Lambda (create/update functions)
- API Gateway (create/update APIs)
- DynamoDB (create/update tables)
- IAM (create/update roles)
- S3 (upload deployment artifacts)

### Current Project State

The `backend/` directory now has:
- ✅ `template.yaml` (SAM template with Lambda, API Gateway, DynamoDB)
- ✅ `samconfig.toml` (dev and prod configurations)

The `.github/workflows/` directory now has:
- ✅ `deploy-dev.yml` (deploys on push to dev branch)
- ✅ `deploy-prod.yml` (deploys on push to main branch)
- ✅ `pr-check.yml` (validates PRs to dev and main)

### Anti-Patterns to Avoid

❌ DO NOT hardcode AWS credentials in workflow files
❌ DO NOT use `--guided` flag in CI/CD (requires interactive input)
❌ DO NOT skip `--no-confirm-changeset` (blocks pipeline)
❌ DO NOT deploy prod on every push (only main branch)

### Testing Considerations

- Workflow YAML syntax can be validated with `yamllint`
- GitHub Actions can be tested locally with `act` tool (optional)
- First deployment may require manual `sam deploy --guided` to create S3 bucket
- No unit tests needed for this story (infrastructure/config only)

### Previous Story Learnings (from 1-3-dynamodb-table-setup)

**Patterns Established:**
- Use `DeletionPolicy: Retain` for stateful resources
- Add Tags for cost tracking
- Keep documentation in sync with actual implementation
- Verify all tasks are actually complete before marking done

**Code Review Insights:**
- Don't add unnecessary IAM permissions
- Update Dev Notes when implementation state changes
- Document what will be done in future stories vs current story

### References

- [Source: architecture.md#Infrastructure as Code]
- [Source: architecture.md#CI/CD Decision]
- [Source: project-context.md#Deployment]
- [Source: epics.md#Story 1.4]

---

## Dev Agent Record

### Agent Model Used

Claude (Cascade)

### Debug Log References

- `sam validate` - PASSED: "template.yaml is a valid SAM Template"
- YAML syntax validation - PASSED for all workflow files

### Completion Notes List

- Updated `backend/samconfig.toml` with dev and prod configurations (removed profile reference for CI/CD compatibility)
- Created `deploy-dev.yml` workflow - triggers on push to `dev` branch
- Created `deploy-prod.yml` workflow - triggers on push to `main` branch
- Created `pr-check.yml` workflow - validates backend (sam validate, sam build) and frontend (lint, test) on PRs
- Created `docs/DEPLOYMENT.md` with comprehensive deployment documentation including GitHub secrets setup
- All workflows use `aws-actions/configure-aws-credentials@v4` for secure credential handling
- Added `--no-fail-on-empty-changeset` flag to prevent failures when no changes exist
- No unit tests needed (infrastructure/config only story)

### Change Log

- 2026-01-27: Created CI/CD pipeline with GitHub Actions workflows
- 2026-01-27: Created deployment documentation
- 2026-01-27: Code review fixes - set confirm_changeset=false for prod, removed unused permissions block, used env variable for AWS_REGION, set disable_rollback=false, improved formatting

### File List

_Files created/modified during implementation:_
- [x] `backend/samconfig.toml` (modified - removed profile, already had dev/prod configs)
- [x] `.github/workflows/deploy-dev.yml` (created - dev deployment workflow)
- [x] `.github/workflows/deploy-prod.yml` (created - prod deployment workflow)
- [x] `.github/workflows/pr-check.yml` (created - PR validation workflow)
- [x] `docs/DEPLOYMENT.md` (created - deployment documentation)
