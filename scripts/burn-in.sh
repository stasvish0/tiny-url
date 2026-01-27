#!/bin/bash
# Burn-in loop for flaky test detection
# Usage: ./scripts/burn-in.sh [iterations] [target]
# Examples:
#   ./scripts/burn-in.sh           # 10 iterations, all tests
#   ./scripts/burn-in.sh 5         # 5 iterations, all tests
#   ./scripts/burn-in.sh 10 backend  # 10 iterations, backend only
#   ./scripts/burn-in.sh 10 frontend # 10 iterations, frontend only

set -e

ITERATIONS=${1:-10}
TARGET=${2:-all}

echo "🔥 Burn-in Test Loop"
echo "===================="
echo "Iterations: $ITERATIONS"
echo "Target: $TARGET"
echo ""

run_backend_tests() {
  cd backend
  npm test
  cd ..
}

run_frontend_tests() {
  cd frontend
  npm test
  cd ..
}

FAILED=0

for i in $(seq 1 $ITERATIONS); do
  echo ""
  echo "🔥 Iteration $i/$ITERATIONS"
  echo "-------------------"
  
  if [ "$TARGET" = "all" ] || [ "$TARGET" = "backend" ]; then
    echo "→ Backend tests..."
    if ! run_backend_tests; then
      echo "❌ Backend tests failed on iteration $i"
      FAILED=1
      break
    fi
  fi
  
  if [ "$TARGET" = "all" ] || [ "$TARGET" = "frontend" ]; then
    echo "→ Frontend tests..."
    if ! run_frontend_tests; then
      echo "❌ Frontend tests failed on iteration $i"
      FAILED=1
      break
    fi
  fi
  
  echo "✓ Iteration $i passed"
done

echo ""
if [ $FAILED -eq 0 ]; then
  echo "✅ Burn-in complete: $ITERATIONS iterations passed"
  echo "   No flaky tests detected!"
  exit 0
else
  echo "❌ Burn-in failed: Flaky test detected"
  echo "   Review test output above for details"
  exit 1
fi
