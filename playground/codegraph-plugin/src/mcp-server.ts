#!/usr/bin/env node
/**
 * CodeGraph MCP Server
 *
 * Provides AST-based code analysis through the Model Context Protocol.
 * Reduces Claude Code exploration costs by pre-indexing the codebase structure.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { CodeGraphDB } from './db.js';
import { CodeParser } from './parser.js';
import { SymbolSearcher } from './searcher.js';
import { ImpactAnalyzer } from './impact.js';

const db = new CodeGraphDB();
const parser = new CodeParser();
const searcher = new SymbolSearcher(db);
const impactAnalyzer = new ImpactAnalyzer(db);

const server = new Server(
  {
    name: 'codegraph',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'codegraph_index',
      description: 'Index a directory to build the code graph. Run this first to enable fast code exploration.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Directory path to index (defaults to current directory)',
          },
          languages: {
            type: 'array',
            items: { type: 'string' },
            description: 'Languages to parse (typescript, javascript, python). Defaults to all supported.',
          },
        },
      },
    },
    {
      name: 'codegraph_search',
      description: 'Search for symbols (functions, classes, types) in the code graph. Much faster than grep for understanding code structure.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query - can be symbol name, partial match, or semantic concept',
          },
          type: {
            type: 'string',
            enum: ['function', 'class', 'interface', 'type', 'variable', 'import', 'export', 'all'],
            description: 'Filter by symbol type',
          },
          limit: {
            type: 'number',
            description: 'Maximum results to return (default: 20)',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'codegraph_get_symbol',
      description: 'Get detailed information about a specific symbol including its source code, references, and relationships.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Full symbol name (e.g., "MyClass.myMethod" or "myFunction")',
          },
          file: {
            type: 'string',
            description: 'Optional file path to disambiguate symbols with the same name',
          },
        },
        required: ['name'],
      },
    },
    {
      name: 'codegraph_get_callers',
      description: 'Find all locations that call/use a specific symbol. Essential for impact analysis.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Symbol name to find callers for',
          },
          depth: {
            type: 'number',
            description: 'How many levels deep to trace (default: 1)',
          },
        },
        required: ['name'],
      },
    },
    {
      name: 'codegraph_get_callees',
      description: 'Find all symbols that a function/method calls. Useful for understanding dependencies.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Symbol name to find callees for',
          },
          depth: {
            type: 'number',
            description: 'How many levels deep to trace (default: 1)',
          },
        },
        required: ['name'],
      },
    },
    {
      name: 'codegraph_impact_analysis',
      description: 'Analyze what would be affected by changing a symbol. Shows blast radius before making changes.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Symbol name to analyze impact for',
          },
          includeTests: {
            type: 'boolean',
            description: 'Include test files in analysis (default: true)',
          },
        },
        required: ['name'],
      },
    },
    {
      name: 'codegraph_file_structure',
      description: 'Get the structure of a file - all its exports, classes, functions, etc.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'File path to analyze',
          },
        },
        required: ['path'],
      },
    },
    {
      name: 'codegraph_stats',
      description: 'Get statistics about the indexed code graph and estimated cost savings.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],
}));

// Tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'codegraph_index': {
      const path = (args?.path as string) || process.cwd();
      const languages = (args?.languages as string[]) || ['typescript', 'javascript', 'python'];

      const result = await parser.indexDirectory(path, languages, db);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case 'codegraph_search': {
      const query = args?.query as string;
      const type = (args?.type as string) || 'all';
      const limit = (args?.limit as number) || 20;

      const results = searcher.search(query, type, limit);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }

    case 'codegraph_get_symbol': {
      const symbolName = args?.name as string;
      const file = args?.file as string | undefined;

      const symbol = db.getSymbol(symbolName, file);
      if (!symbol) {
        return {
          content: [{ type: 'text', text: `Symbol "${symbolName}" not found in code graph` }],
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(symbol, null, 2) }],
      };
    }

    case 'codegraph_get_callers': {
      const symbolName = args?.name as string;
      const depth = (args?.depth as number) || 1;

      const callers = impactAnalyzer.getCallers(symbolName, depth);
      return {
        content: [{ type: 'text', text: JSON.stringify(callers, null, 2) }],
      };
    }

    case 'codegraph_get_callees': {
      const symbolName = args?.name as string;
      const depth = (args?.depth as number) || 1;

      const callees = impactAnalyzer.getCallees(symbolName, depth);
      return {
        content: [{ type: 'text', text: JSON.stringify(callees, null, 2) }],
      };
    }

    case 'codegraph_impact_analysis': {
      const symbolName = args?.name as string;
      const includeTests = (args?.includeTests as boolean) ?? true;

      const impact = impactAnalyzer.analyzeImpact(symbolName, includeTests);
      return {
        content: [{ type: 'text', text: JSON.stringify(impact, null, 2) }],
      };
    }

    case 'codegraph_file_structure': {
      const filePath = args?.path as string;

      const structure = db.getFileStructure(filePath);
      return {
        content: [{ type: 'text', text: JSON.stringify(structure, null, 2) }],
      };
    }

    case 'codegraph_stats': {
      const stats = db.getStats();
      return {
        content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Resource handlers for code graph data
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'codegraph://symbols',
      name: 'All Symbols',
      description: 'List of all indexed symbols in the codebase',
      mimeType: 'application/json',
    },
    {
      uri: 'codegraph://files',
      name: 'Indexed Files',
      description: 'List of all indexed files',
      mimeType: 'application/json',
    },
    {
      uri: 'codegraph://graph',
      name: 'Code Graph',
      description: 'Full code graph with relationships',
      mimeType: 'application/json',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case 'codegraph://symbols':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(db.getAllSymbols(), null, 2),
          },
        ],
      };

    case 'codegraph://files':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(db.getAllFiles(), null, 2),
          },
        ],
      };

    case 'codegraph://graph':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(db.getGraph(), null, 2),
          },
        ],
      };

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('CodeGraph MCP server running on stdio');
}

main().catch(console.error);
