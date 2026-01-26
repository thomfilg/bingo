#!/usr/bin/env node
/**
 * CodeGraph Session Start Hook
 *
 * Loads the code graph into memory on session start and provides
 * Claude with pre-indexed codebase context.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CODEGRAPH_DB = join(process.cwd(), '.codegraph', 'graph.db');

/**
 * Generate codebase context from the code graph
 */
async function generateContext() {
  if (!existsSync(CODEGRAPH_DB)) {
    return {
      decision: 'allow',
      message: `[CodeGraph] No code graph found. Run \`/codegraph:index\` to build the index for faster exploration.`,
    };
  }

  try {
    // Dynamic import for ESM compatibility
    const Database = (await import('better-sqlite3')).default;
    const db = new Database(CODEGRAPH_DB, { readonly: true });

    // Get stats
    const fileCount = db.prepare('SELECT COUNT(*) as count FROM files').get().count;
    const symbolCount = db.prepare('SELECT COUNT(*) as count FROM symbols').get().count;
    const edgeCount = db.prepare('SELECT COUNT(*) as count FROM edges').get().count;

    // Get language distribution
    const languages = db.prepare('SELECT language, COUNT(*) as count FROM symbols GROUP BY language').all();

    // Get type distribution
    const types = db.prepare('SELECT type, COUNT(*) as count FROM symbols GROUP BY type ORDER BY count DESC').all();

    // Get top-level exports (main entry points)
    const exports = db.prepare('SELECT name, type, file_path FROM symbols WHERE is_exported = 1 ORDER BY file_path LIMIT 50').all();

    // Get key files (most symbols)
    const keyFiles = db
      .prepare(
        `
      SELECT file_path, COUNT(*) as symbol_count
      FROM symbols
      GROUP BY file_path
      ORDER BY symbol_count DESC
      LIMIT 10
    `
      )
      .all();

    db.close();

    // Build context message
    let context = `## CodeGraph Index Loaded

This codebase has been pre-indexed for fast exploration.

### Statistics
- **Files**: ${fileCount}
- **Symbols**: ${symbolCount}
- **Relationships**: ${edgeCount}

### Languages
${languages.map((l) => `- ${l.language}: ${l.count} symbols`).join('\n')}

### Symbol Types
${types.map((t) => `- ${t.type}: ${t.count}`).join('\n')}

### Key Files (by symbol count)
${keyFiles.map((f) => `- ${f.file_path} (${f.symbol_count} symbols)`).join('\n')}

### Exported Symbols (sample)
${exports
  .slice(0, 20)
  .map((e) => `- ${e.type} \`${e.name}\` from ${e.file_path}`)
  .join('\n')}

---

**Available CodeGraph Commands:**
- \`/codegraph:search <query>\` - Search for symbols by name
- \`/codegraph:impact <symbol>\` - Analyze change impact
- \`/codegraph:stats\` - View index statistics

**MCP Tools Available:**
- \`codegraph_search\` - Fast symbol search
- \`codegraph_get_symbol\` - Get detailed symbol info
- \`codegraph_get_callers\` - Find all callers
- \`codegraph_get_callees\` - Find all callees
- \`codegraph_impact_analysis\` - Full impact analysis
- \`codegraph_file_structure\` - Get file exports/structure

Use these tools instead of grep/glob for faster, cheaper code exploration.
`;

    return {
      decision: 'allow',
      message: context,
    };
  } catch (error) {
    return {
      decision: 'allow',
      message: `[CodeGraph] Error loading code graph: ${error.message}`,
    };
  }
}

// Process hook event
async function main() {
  const input = readFileSync(0, 'utf-8');

  try {
    const event = JSON.parse(input);

    if (event.event === 'SessionStart') {
      const result = await generateContext();
      console.log(JSON.stringify(result));
    } else {
      console.log(JSON.stringify({ decision: 'allow' }));
    }
  } catch (error) {
    console.error('[codegraph] Error:', error.message);
    console.log(JSON.stringify({ decision: 'allow' }));
  }
}

main();
