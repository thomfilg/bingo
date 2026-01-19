#!/usr/bin/env bash
# Pre-Task-Complete Hook
# This hook BLOCKS task completion until quality-checker agent approves

set -e

# Color codes for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verification state file
# Support task-specific verification via TASK_ID env var
TASK_ID="${TASK_ID:-default}"
VERIFICATION_FILE=".task-verification-approved-${TASK_ID}"

echo ""
echo -e "${YELLOW}⚠️  TASK COMPLETION ENFORCEMENT CHECK${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Base requirements
echo -e "${GREEN}📋 BASE REQUIREMENTS (ALWAYS):${NC}"
echo "  1. ✅ Run pnpm lint (show actual output)"
echo "  2. ✅ Run pnpm typecheck (show actual output)"
echo "  3. ✅ Run pnpm test (show actual output)"
echo ""

# Detect context-specific requirements
CI_CHANGED=false
UNIT_TESTS_EXIST=false
E2E_TESTS_EXIST=false
INTEGRATION_TESTS_EXIST=false
SMOKE_TESTS_EXIST=false

# Check if CI configuration files changed
if git diff --name-only HEAD 2>/dev/null | grep -qE '\.github/workflows/|\.gitlab-ci\.yml|\.circleci/|jenkinsfile|\.drone\.yml'; then
    CI_CHANGED=true
fi

# Check for test files in changes or workspace
if git diff --name-only HEAD 2>/dev/null | grep -qE '\.test\.|\.spec\.|\/__tests__\/|\/tests?\/'; then
    UNIT_TESTS_EXIST=true
fi

# Check for e2e tests in **/tests/e2e
if find . -type d -path "*/tests/e2e" 2>/dev/null | grep -q .; then
    E2E_TESTS_EXIST=true
fi

# Check for integration tests in **/tests/integration
if find . -type d -path "*/tests/integration" 2>/dev/null | grep -q .; then
    INTEGRATION_TESTS_EXIST=true
fi

# Check for smoke tests in **/tests/smoke
if find . -type d -path "*/tests/smoke" 2>/dev/null | grep -q .; then
    SMOKE_TESTS_EXIST=true
fi

# CI-specific requirements
if [ "$CI_CHANGED" = true ]; then
    echo -e "${YELLOW}🔧 CI CONFIGURATION CHANGED - ADDITIONAL REQUIREMENTS:${NC}"
    echo "  4. ✅ Verify CI pipeline passes (check GitHub Actions/GitLab CI/etc)"
    echo "  5. ✅ Monitor CI build output for failures"
    echo "  6. ✅ Fix any CI failures and re-run until all checks pass"
    echo "  7. ✅ Show CI success output/screenshots as proof"
    echo ""
fi

# Unit test requirements
if [ "$UNIT_TESTS_EXIST" = true ]; then
    echo -e "${GREEN}🧪 UNIT TESTS DETECTED - ADDITIONAL REQUIREMENTS:${NC}"
    echo "  • Run unit tests for ALL changed files"
    echo "  • Command: pnpm test <changed-file>.test.ts"
    echo "  • Show test output with ✅ X/X tests passed"
    echo "  • Verify 100% of affected unit tests pass"
    echo ""
fi

# E2E test requirements
if [ "$E2E_TESTS_EXIST" = true ]; then
    echo -e "${GREEN}🎯 E2E TESTS DETECTED (**/tests/e2e) - ADDITIONAL REQUIREMENTS:${NC}"
    echo "  • Run pnpm test:e2e - show output"
    echo "  • Verify ALL e2e tests pass with proof"
    echo "  • If any test fails, debug and fix before completion"
    echo ""
fi

# Integration test requirements
if [ "$INTEGRATION_TESTS_EXIST" = true ]; then
    echo -e "${GREEN}🔗 INTEGRATION TESTS DETECTED (**/tests/integration) - ADDITIONAL REQUIREMENTS:${NC}"
    echo "  • Run pnpm test:integration:ci - show output"
    echo "  • Verify ALL integration tests pass with proof"
    echo "  • If any test fails, debug and fix before completion"
    echo ""
fi

# Smoke test requirements
if [ "$SMOKE_TESTS_EXIST" = true ]; then
    echo -e "${GREEN}💨 SMOKE TESTS DETECTED (**/tests/smoke) - ADDITIONAL REQUIREMENTS:${NC}"
    echo "  • Run pnpm test:smoke:ci - show output"
    echo "  • Verify ALL smoke tests pass with proof"
    echo "  • If any test fails, debug and fix before completion"
    echo ""
fi

# Final requirements
echo -e "${RED}🚨 FINAL REQUIREMENTS (MANDATORY):${NC}"
echo "  ✅ Call quality-checker agent with proof object:"
echo "     {
       proof: {
         lint_output: \"actual pnpm lint output\",
         typecheck_output: \"actual pnpm typecheck output\",
         test_output: \"actual test command output\",
         ci_status: \"passing\" (if CI changed),
         unit_test_output: \"output\" (if unit tests exist),
         e2e_test_output: \"output\" (if e2e tests exist),
         integration_test_output: \"output\" (if integration tests exist),
         smoke_test_output: \"output\" (if smoke tests exist),
         exit_codes: [0, 0, 0, ...]
       }
     }"
echo ""
echo "  ✅ Get agent approval with verification"
echo ""

echo -e "${RED}❌ TASK COMPLETION BLOCKED UNTIL VERIFICATION PASSES!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for verification approval file
if [ ! -f "$VERIFICATION_FILE" ]; then
    echo -e "${RED}🚫 BLOCKING: Task completion requires quality-checker approval!${NC}"
    echo ""
    echo -e "${BLUE}To complete this task, you MUST:${NC}"
    echo "  1. Run ALL required quality checks (lint, typecheck, tests)"
    echo "  2. Call quality-checker agent with proof"
    echo "  3. Get agent approval - it will create $VERIFICATION_FILE"
    echo "  4. Only then can you mark the task as complete"
    echo ""
    echo -e "${YELLOW}After verification passes, the agent creates: $VERIFICATION_FILE${NC}"
    echo ""
    exit 1
fi

# Check if verification file is recent (within last 24 hours / 1 day)
if [ "$(find "$VERIFICATION_FILE" -mmin +1440 2>/dev/null)" ]; then
    echo -e "${RED}🚫 BLOCKING: Verification approval is stale (>24 hours old)!${NC}"
    echo ""
    echo -e "${YELLOW}Re-run quality-checker agent to refresh approval.${NC}"
    echo ""
    rm -f "$VERIFICATION_FILE"
    exit 1
fi

# Verification passed
echo -e "${GREEN}✅ VERIFICATION APPROVED - Task completion allowed!${NC}"
echo ""
echo -e "${BLUE}Verification file found: $VERIFICATION_FILE${NC}"
echo ""

# Clean up verification file after successful completion
rm -f "$VERIFICATION_FILE"

exit 0
