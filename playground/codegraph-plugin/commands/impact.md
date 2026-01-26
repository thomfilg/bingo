# /codegraph:impact

Analyze the impact of changing a symbol.

## Usage

```
/codegraph:impact <symbol-name> [--include-tests] [--depth=2]
```

## Description

Before making changes, understand the blast radius. This command traces:

- Direct callers (who calls this symbol)
- Indirect callers (who calls the callers)
- Affected files
- Affected test files
- Risk level assessment

## Instructions

When the user runs this command:

1. Extract the symbol name from the arguments
2. Use the `codegraph_impact_analysis` MCP tool
3. Present a comprehensive impact report showing:
   - Symbol details
   - Risk level (low/medium/high/critical)
   - List of direct callers with locations
   - List of affected files
   - Test files that may need updating
   - Summary with recommendations

## Example

User: `/codegraph:impact validateEmail`

Response:
```
Impact Analysis: validateEmail

Symbol Details:
- Type: function
- Location: src/utils/validation.ts:23
- Exported: Yes

Risk Level: MEDIUM

Direct Callers (4):
1. handleUserRegistration (src/auth/register.ts:45)
2. handleUserUpdate (src/services/UserService.ts:89)
3. validateContactForm (src/forms/contact.ts:12)
4. processImportRow (src/import/csv.ts:67)

Affected Files (5):
- src/utils/validation.ts (definition)
- src/auth/register.ts
- src/services/UserService.ts
- src/forms/contact.ts
- src/import/csv.ts

Test Files (2):
- src/utils/__tests__/validation.test.ts
- src/auth/__tests__/register.test.ts

Summary:
Changing "validateEmail" has MEDIUM risk. 4 direct callers across 5 files.
2 test files may need updating. Symbol is exported (may affect external consumers).

Recommendations:
1. Update all 4 caller locations if changing the signature
2. Run tests in affected test files
3. Consider deprecation notice if this is a breaking change
```
