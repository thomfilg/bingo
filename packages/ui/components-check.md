# Component Verification and Enhancement Instructions for AI Agents — Final

**This edition applies the clarity review and unifies checks via `pnpm check:component`.**

> **Component Guidelines**: For detailed component definitions, requirements, and templates, see [components-guidelines.md](./components-guidelines.md)

---

## Quickstart (TL;DR)

1. **Claim work** in `components.tasks.md`:

   ```
   - ComponentName (working) (omega-[n]):  - YYYY-MM-DD HH:MM
   ```

2. **Create `track.md`** in the component folder with sections: Props, Lint, Type Errors, Testing Scenarios, Storybook Tests (planned/working/completed/error), and **Current** plan (timestamp in BRL).
3. **Run component check** from `packages/ui` until it passes:

   ```bash
   pnpm check:component <category> <ComponentName>
   ```

4. **Verify tests in Storybook** (do **not** start/stop it): open `http://192.168.166.133:6008`, navigate to `Category/ComponentName/Tests`, ensure each test shows **PASS**, update `tests.md`.
5. **Commit from repo root**:

   ```bash
   git add packages/ui/src/components/<category>/<ComponentName>/ packages/ui/components-check.md components.tasks.md
   git commit -m "feat(<ComponentName>): complete comprehensive testing and verification"
   ```

> Conventions: `{category}` is **kebab-case** (e.g., `form`, `navigation`); `ComponentName` is **PascalCase**.

---

## Overview

Systematic instructions for AI agents to verify, enhance, and test React components in a TypeScript/React codebase with Storybook integration.

> **Important**: Component structure, requirements, and templates are defined in [components-guidelines.md](./components-guidelines.md). This document focuses on agent-specific workflow and execution instructions.

## Prerequisites

- Component name provided as `[COMPONENT_NAME]`
- Component path pattern: `packages/ui/src/components/{category}/{ComponentName}/`
- See [components-guidelines.md](./components-guidelines.md) for categories and structure details
- **Package manager:** pnpm (enforced by `"preinstall": "npx only-allow pnpm"`)
- **Storybook is already running. Do not start/stop it. Access at:** `http://192.168.166.133:6008`

## Critical Agent Instructions

### Agent Naming & Tracking

- Your agent name prefix is: `omega-[number]` (e.g., omega-1, omega-2, ...)
- Always include your agent name when updating `components.tasks.md`.
- Format: `- omega-[number]: ComponentName (status) - YYYY-MM-DD HH:MM`

### Storybook Access — Do Not Start New Instances

- Do **not** run `npm run storybook`, `npx storybook dev`, or any Storybook start commands.
- Do **not** kill or restart the Storybook process.
- Do **not** access `localhost`.
- Always use the running instance at: `http://192.168.166.133:6008`.
- No browser installation: do **not** run `npx playwright install` or related browser installers.

### Before Starting Any Component

1. Read `components.tasks.md` to see what is taken.
2. Choose an untaken component.
3. Update `components.tasks.md` immediately with your agent name and `(working)` status.
4. Create a `track.md` in your component directory following the template in [components-guidelines.md](./components-guidelines.md#development-tracking-trackmd).

> **Concurrency note:** If multiple agents edit `components.tasks.md`, use append‑only edits and commit frequently. On conflict, `git pull --rebase`, resolve, and re‑apply your line. Keep your omega tag consistent across `track.md`, `tests.md`, and `components.tasks.md`.

---

## Step-by-Step Verification Process

### Phase 1: Documentation Review

1. Read main frontend docs:

   ```bash
   Read packages/ui/frontend.md
   ```

2. Read component docs:

   ```bash
   Read packages/ui/src/components/{category}/{ComponentName}/{ComponentName}.md
   ```

### Phase 2: Implementation Verification

1. Analyze implementation files:

   ```bash
   Read packages/ui/src/components/{category}/{ComponentName}/{ComponentName}.tsx
   Read packages/ui/src/components/{category}/{ComponentName}/{ComponentName}.types.ts
   Read packages/ui/src/components/{category}/{ComponentName}/index.ts
   ```

2. Verify against requirements (see [components-guidelines.md](./components-guidelines.md#implementation-requirements) for complete checklist)

3. Ensure implementation follows the guidelines defined in components-guidelines.md

---

## Component Validation

All component validation is done through a single command:

```bash
cd packages/ui
pnpm check:component <category> <ComponentName>
```

**Examples:**

```bash
pnpm check:component utility AspectRatio
pnpm check:component navigation Breadcrumbs
```

**What it validates (14 checks):**

- Documentation catalog listing
- components.tasks.md entry
- Change scope guard
- Test bypass patterns
- Storybook reachability
- TypeScript compilation
- ESLint (fix then verify)
- Component build (tsup)
- Folder structure
- Barrel exports
- Stories coverage
- Design tokens usage
- Responsive stories
- Accessibility coverage
- track.md freshness
- Storybook interaction tests

> **IMPORTANT**: Never run individual commands like `tsc`, `eslint`, or `tsup` directly. Always use `pnpm check:component`.

---

## Phase 3: Storybook Stories Coverage

1. Read existing stories

   ```bash
   Read packages/ui/src/components/{category}/{ComponentName}/{ComponentName}.stories.tsx
   ```

2. Required scenarios - see [components-guidelines.md](./components-guidelines.md#story-requirements) for complete list

3. Story template structure - see [components-guidelines.md](./components-guidelines.md#story-template-structure) for template

---

## Phase 4: Component Quality Validation

Run `pnpm check:component` to validate all quality aspects:

- TypeScript compilation
- ESLint compliance
- Build success
- All other validation checks

If any check fails, fix the issues and re-run until all checks pass.

---

## Phase 6: Storybook Testing (Manual in UI)

**Do not start Storybook.** Use the running server at `http://192.168.166.133:6008`.

1. Navigate to the component stories in the running instance.
2. Open the **Tests** section (ComponentName/Tests).
3. See [components-guidelines.md](./components-guidelines.md#test-pass-criteria) for test pass criteria.

4. Update `tests.md` accordingly.

> **Direct Links**: open each test story and **copy the URL from the browser** into `tests.md`. Do not guess slugs.

---

## Phase 7: Comprehensive Storybook Tests

### 7.0 Create Tests Tracking File (`tests.md`)

Create `packages/ui/src/components/{category}/{ComponentName}/tests.md` using the template from [components-guidelines.md](./components-guidelines.md#test-tracking-testsmd).

### 7.1 Create or Update Test Stories File

Check existence and create/update as needed:

```bash
ls packages/ui/src/components/{category}/{ComponentName}/{ComponentName}.test.stories.tsx
```

Use the base structure from [components-guidelines.md](./components-guidelines.md#test-file-structure).

### 7.2 Interaction Tests

Use the provided templates (interaction, form interaction, state change) and adapt selectors/assertions to your component.

### 7.3 Accessibility Tests

Use the keyboard navigation, screen reader, and focus management templates; include WCAG‑related assertions.

### 7.4 Visual Tests

Use responsive design, theme variation, and visual state templates; verify viewport parameters and assertions.

### 7.5 Performance Tests

Use the performance template; adjust thresholds and items as needed.

### 7.6 Edge Cases Tests

Use the edge-cases template; align with validation rules and constraints.

### 7.7 Integration Tests

Compose with related components where applicable.

### 7.8 Running and Verifying Tests (Optional Runner)

If the test runner exists, you may target the existing server (do **not** start a new one):

```bash
npx test-storybook --url http://192.168.166.133:6008
# Or filter a single component (example):
npx test-storybook --url http://192.168.166.133:6008 --stories-filter="**/ComponentName.test.stories.tsx"
```

Avoid installing browsers.

---

## Verification Checklist Summary

See [components-guidelines.md](./components-guidelines.md) for complete verification requirements.

---

## Common Issues and Solutions

### Port or URL Mismatch

- Ensure you target `http://192.168.166.133:6008`.

### Type Errors

See [components-guidelines.md](./components-guidelines.md#typescript-requirements) for type error solutions.

### Storybook Not Loading

- Do not start/stop the server yourself.
- If you see errors in the running instance, fix component code and re-run `pnpm check:component`.

---

## Component Categories

See [components-guidelines.md](./components-guidelines.md#component-categories-reference) for category definitions.

## Component Status Tracking

Read and update `components.tasks.md`.

> **components-check.md (repo root)**: global ledger of component verification runs (who, when, result). Always include it in commits when you touch a component. Use the same omega tag used in `components.tasks.md`.

---

## Agent Post-Completion Instructions

When you finish a component:

1. **Ensure all checks pass**

   ```bash
   cd packages/ui
   pnpm check:component {category} {ComponentName}
   ```

   The command must complete successfully (all 14 checks pass).

2. **Stage changes (from repo root)**

   ```bash
   git add packages/ui/src/components/{category}/{ComponentName}/ packages/ui/components-check.md components.tasks.md
   ```

3. **Commit with semantic message**

   ```bash
   # New features/enhancements
   git commit -m "feat({ComponentName}): complete comprehensive testing and verification"

   # Bug fixes
   git commit -m "fix({ComponentName}): resolve lint errors and add comprehensive test stories"

   # Documentation updates
   git commit -m "docs({ComponentName}): update component status and testing coverage"

   # Test story additions
   git commit -m "test({ComponentName}): add comprehensive interaction and accessibility tests"

   # Type/Lint fixes
   git commit -m "fix({ComponentName}): resolve TypeScript and lint issues"

   # Status-only updates
   git commit -m "docs: mark {ComponentName} component as completed in status tracking"
   ```

4. **Do not** push or open PRs automatically.

---

## Tooling Reference

- **Script location**: `packages/ui/scripts/check-component.js`
- **Command**: `pnpm check:component <category> <ComponentName>`
- **Purpose**: Validates all aspects of component quality in a single command
- **Result**: Must pass all 14 checks for component to be considered ready

---

## Optional: Pre-commit hook (quality gate)

Run `pnpm check:component` automatically when files under a component are staged.

```bash
# .husky/pre-commit (example)
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

changed=$(git diff --name-only --cached | grep '^packages/ui/src/components/' | cut -d'/' -f5,6 | sort -u)
for pair in $changed; do
  category=$(echo "$pair" | cut -d'/' -f1)
  component=$(echo "$pair" | cut -d'/' -f2)
  (cd packages/ui && pnpm check:component "$category" "$component") || exit 1
done
```
