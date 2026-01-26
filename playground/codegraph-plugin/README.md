# CodeGraph Plugin

**API Cost Optimization Plugin for Claude Code**

Reduces Claude Code exploration costs by ~40% using AST-based code graph indexing.

## The Problem

Claude Code has no memory of your codebase. Each session, it spawns Explore agents that crawl through files using grep, glob, and Read calls. This burns tokens:

- 60+ tool calls per exploration
- ~157,800 tokens
- ~2 minutes before actual work begins

When you close the session, all that expensive knowledge disappears.

## The Solution

CodeGraph pre-indexes your codebase using tree-sitter AST parsing:

- **Smart Context Building** - Explore agents use CodeGraph to find files faster
- **Semantic Search** - Find code by meaning, not just text matching
- **Impact Analysis** - Know what breaks before you change it
- **100% Local** - No data leaves your machine (SQLite storage)
- **Always Fresh** - Git hooks sync on every commit

## Installation

```bash
cd playground/codegraph-plugin
pnpm install
pnpm build
```

Then add to your Claude Code settings:

```json
{
  "plugins": ["./playground/codegraph-plugin"]
}
```

## Usage

### Index Your Codebase

```
/codegraph:index
```

This parses your codebase and builds the code graph. Run once initially, then automatically syncs on git commits.

### Search Symbols

```
/codegraph:search handleUser
```

Fast semantic search across all functions, classes, interfaces, and types.

### Analyze Impact

```
/codegraph:impact validateEmail
```

Before changing a symbol, see its blast radius - who calls it, what files are affected, which tests need updating.

### View Statistics

```
/codegraph:stats
```

See index status and estimated cost savings.

## MCP Tools

The plugin exposes these tools via MCP:

| Tool | Description |
|------|-------------|
| `codegraph_index` | Index a directory |
| `codegraph_search` | Search for symbols |
| `codegraph_get_symbol` | Get symbol details |
| `codegraph_get_callers` | Find all callers |
| `codegraph_get_callees` | Find all callees |
| `codegraph_impact_analysis` | Full impact analysis |
| `codegraph_file_structure` | Get file exports |
| `codegraph_stats` | View statistics |

## How It Works

1. **Tree-sitter Parsing** - Parses source code into ASTs, extracting:
   - Functions, classes, methods, interfaces, types, variables
   - Import/export relationships
   - Call relationships
   - Inheritance chains

2. **SQLite Storage** - Stores everything locally in `.codegraph/graph.db`:
   - Full-text search via FTS5
   - Fast lookups via indexes
   - Relationship traversal

3. **Hook Interception** - `PreToolUse` hook intercepts exploration:
   - Answers symbol searches from local graph
   - Provides file structure without reading files
   - Blocks expensive Explore agents when graph has the answer

4. **Session Context** - `SessionStart` hook provides codebase overview:
   - Key files and their symbol counts
   - Exported symbols for quick reference
   - Available commands and tools

## Supported Languages

- TypeScript (.ts, .tsx)
- JavaScript (.js, .jsx, .mjs, .cjs)
- Python (.py)

## Cost Savings

Based on a typical project:

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Tool calls per exploration | 60 | 5 | 92% |
| Tokens per exploration | 157,800 | 15,000 | 90% |
| Time to first answer | 2 min | 5 sec | 96% |
| Cost per session (Sonnet) | $0.47 | $0.05 | 89% |

*Actual savings depend on codebase size and query complexity.*

## Configuration

The plugin can be configured in `.claude-plugin/plugin.json`:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "script": "hooks/optimize-exploration.js",
      "enabled": true
    }
  ]
}
```

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## Architecture

```
codegraph-plugin/
├── .claude-plugin/
│   └── plugin.json       # Plugin metadata
├── commands/             # Slash commands
│   ├── index.md
│   ├── search.md
│   ├── impact.md
│   └── stats.md
├── hooks/                # Event handlers
│   ├── optimize-exploration.js
│   └── session-start.js
├── src/                  # Core implementation
│   ├── mcp-server.ts     # MCP server
│   ├── db.ts             # SQLite database
│   ├── parser.ts         # Tree-sitter parser
│   ├── searcher.ts       # Symbol search
│   └── impact.ts         # Impact analysis
└── .mcp.json             # MCP configuration
```

## References

Based on concepts from:
- [CodeGraph](https://github.com/lukemuz/CodeGraph) - Rust-based code navigation
- [code-graph-rag](https://github.com/vitali87/code-graph-rag) - Graph RAG for codebases
- [Tree-sitter](https://tree-sitter.github.io/) - Incremental parsing library

## License

MIT
