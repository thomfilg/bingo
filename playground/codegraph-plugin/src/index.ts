/**
 * CodeGraph Plugin
 *
 * API Cost Optimization Plugin for Claude Code.
 * Reduces exploration costs by 40% using AST-based code graph indexing.
 *
 * @module @repo/codegraph-plugin
 */

export { CodeGraphDB } from './db.js';
export type { Symbol, Edge, FileInfo, GraphStats } from './db.js';

export { CodeParser } from './parser.js';

export { SymbolSearcher } from './searcher.js';
export type { SearchResult } from './searcher.js';

export { ImpactAnalyzer } from './impact.js';
export type { CallerInfo, ImpactReport } from './impact.js';
