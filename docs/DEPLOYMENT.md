# Deployment Guide

This document describes how to deploy the tiny-url application using GitHub Actions CI/CD pipelines.

## Prerequisites

1. AWS Account with appropriate permissions
2. GitHub repository with Actions enabled
3. AWS IAM user with deployment permissions

## Required GitHub Secrets

Configure the following secrets in your GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | IAM user access key ID |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret access key |

### Setting up GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add `AWS_ACCESS_KEY_ID` with your IAM access key
5. Add `AWS_SECRET_ACCESS_KEY` with your IAM secret key

### Required IAM Permissions

The IAM user needs the following permissions:

- **CloudFormation**: Create, update, delete stacks
- **Lambda**: Create, update, delete functions
- **API Gateway**: Create, update APIs
- **DynamoDB**: Create, update tables
- **IAM**: Create, update roles and policies
- **S3**: Create buckets, upload deployment artifacts

A recommended approach is to use the `AdministratorAccess` policy for the deployment user, or create a custom policy with the minimum required permissions.

## CI/CD Workflows

### Deploy to Dev (`deploy-dev.yml`)

- **Trigger**: Push to `dev` branch
- **Actions**:
  1. Checkout code
  2. Setup SAM CLI
  3. Configure AWS credentials
  4. Build SAM application
  5. Deploy to dev environment

### Deploy to Production (`deploy-prod.yml`)

- **Trigger**: Push to `main` branch
- **Actions**:
  1. Checkout code
  2. Setup SAM CLI
  3. Configure AWS credentials
  4. Build SAM application
  5. Deploy to production environment

### PR Check (`pr-check.yml`)

- **Trigger**: Pull request to `dev` or `main` branch
- **Actions**:
  1. Validate SAM template
  2. Build SAM application
  3. Run frontend linter
  4. Run frontend tests

## Manual Deployment

For local deployment, use the SAM CLI:

```bash
# Deploy to dev
cd backend
sam build
sam deploy --config-env dev

# Deploy to production
cd backend
sam build
sam deploy --config-env prod
```

## First-Time Setup

Before the first CI/CD deployment, you may need to run `sam deploy --guided` locally to:

1. Create the S3 bucket for deployment artifacts
2. Confirm the initial stack creation

```bash
cd backend
sam build
sam deploy --guided
```

Follow the prompts to configure your deployment settings.

## Environment Configuration

The `backend/samconfig.toml` file contains environment-specific configurations:

- **dev**: `tiny-url-dev` stack with `Environment=dev`
- **prod**: `tiny-url-prod` stack with `Environment=prod`

## Troubleshooting

### Deployment Fails with "No changes to deploy"

This is normal if no changes were made. The workflow uses `--no-fail-on-empty-changeset` to handle this gracefully.

### Credentials Error

Ensure your GitHub secrets are correctly configured and the IAM user has the required permissions.

### SAM Build Fails

Check that all dependencies are correctly specified in `package.json` and the TypeScript code compiles without errors.
