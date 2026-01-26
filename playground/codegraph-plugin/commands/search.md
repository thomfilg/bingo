# /codegraph:search

Search for symbols in the code graph.

## Usage

```
/codegraph:search <query> [--type=function|class|interface|type|all]
```

## Description

Fast semantic search across all indexed symbols. Supports:

- Exact name matching
- Partial/prefix matching
- Semantic search (camelCase/snake_case aware)
- Type filtering

Much faster and cheaper than grep for finding code symbols.

## Instructions

When the user runs this command:

1. Extract the search query from the arguments
2. Use the `codegraph_search` MCP tool
3. Present results in a clear format showing:
   - Symbol name and type
   - File location (path:line)
   - Signature if available
   - Whether it's exported

## Example

User: `/codegraph:search handleUser`

Response:
```
Found 3 symbols matching "handleUser":

1. function handleUserLogin
   Location: src/auth/login.ts:42
   Signature: async function handleUserLogin(credentials: Credentials): Promise<User>
   Exported: Yes

2. function handleUserLogout
   Location: src/auth/logout.ts:15
   Signature: function handleUserLogout(userId: string): void
   Exported: Yes

3. method handleUserUpdate
   Location: src/services/UserService.ts:78
   Signature: async handleUserUpdate(id: string, data: UpdateData): Promise<User>
   Exported: No (class method)
```
