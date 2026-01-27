#!/bin/bash
# Mirror CI execution locally for debugging
# Usage: ./scripts/ci-local.sh

set -e

echo "🔍 Running CI pipeline locally..."
echo ""

# Backend
echo "📦 Backend Pipeline"
echo "==================="

cd backend

echo "→ Installing dependencies..."
npm ci

echo "→ Running linter..."
npm run lint

echo "→ Running tests..."
npm test

echo "→ Building with SAM..."
sam build

cd ..

echo ""
echo "🎨 Frontend Pipeline"
echo "===================="

cd frontend

echo "→ Installing dependencies..."
npm ci

echo "→ Running linter..."
npm run lint

echo "→ Running tests..."
npm test

echo "→ Building..."
npm run build

cd ..

echo ""
echo "✅ Local CI pipeline passed!"
