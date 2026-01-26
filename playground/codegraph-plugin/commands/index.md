# /codegraph:index

Index the codebase to build the code graph for fast exploration.

## Usage

```
/codegraph:index [path] [--languages=ts,js,py]
```

## Description

This command parses your codebase using tree-sitter and builds a local SQLite database containing:

- All symbols (functions, classes, interfaces, types, variables)
- Relationships between symbols (calls, imports, extends, implements)
- Full-text search index for fast querying
- File metadata for change detection

The index is stored in `.codegraph/graph.db` and is 100% local - no data leaves your machine.

## Instructions

When the user runs this command:

1. Use the `codegraph_index` MCP tool to index the codebase
2. Report the results including:
   - Number of files indexed
   - Number of symbols found
   - Number of relationships traced
   - Time taken
   - Estimated cost savings

If no MCP server is available, inform the user they need to:
1. Install the plugin: `pnpm install` in the plugin directory
2. Build the plugin: `pnpm build`
3. Restart Claude Code to load the MCP server

## Example Response

After indexing, provide a summary like:

```
CodeGraph Index Complete

Indexed 42 files in 1.2 seconds:
- 156 functions
- 23 classes
- 45 interfaces
- 89 type aliases
- 234 relationships traced

Estimated savings: ~47,000 tokens ($0.14) per exploration session

The code graph is now available. Use `/codegraph:search` to find symbols
or let Claude use it automatically during exploration.
```
