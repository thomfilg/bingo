# /codegraph:stats

Show code graph statistics and estimated cost savings.

## Usage

```
/codegraph:stats
```

## Description

Displays comprehensive statistics about the indexed codebase and estimated API cost savings from using the code graph instead of traditional exploration.

## Instructions

When the user runs this command:

1. Use the `codegraph_stats` MCP tool
2. Present statistics including:
   - Total files indexed
   - Total symbols by type
   - Total relationships traced
   - Language distribution
   - Last indexed timestamp
   - Estimated tokens saved
   - Estimated cost savings

## Example

Response:
```
CodeGraph Statistics

Index Status:
- Last Indexed: 2025-01-26T10:30:00Z
- Database Size: 2.4 MB

Codebase Overview:
- Total Files: 156
- Total Symbols: 1,247
- Total Relationships: 3,892

By Language:
- TypeScript: 892 symbols
- JavaScript: 245 symbols
- Python: 110 symbols

By Type:
- Functions: 456
- Classes: 89
- Interfaces: 123
- Types: 234
- Methods: 267
- Variables: 78

Cost Savings Estimate:
- Tokens Saved per Session: ~157,800
- Cost Saved per Session: ~$0.47 (Sonnet pricing)
- Projected Monthly Savings: ~$14.10 (30 sessions)

The code graph reduces exploration by:
1. Eliminating redundant file scans
2. Providing instant symbol lookups
3. Pre-computing call relationships
4. Caching file structure information

Tip: Keep the index fresh by running /codegraph:index after significant changes.
```
