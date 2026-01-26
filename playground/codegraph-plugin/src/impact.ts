/**
 * CodeGraph Impact Analyzer
 *
 * Analyzes the impact/blast radius of changing a symbol.
 * Traces callers, callees, and dependency chains.
 */

import type { CodeGraphDB, Symbol, Edge } from './db.js';

export interface CallerInfo {
  symbol: Symbol;
  callSite: {
    file: string;
    line: number;
    column: number;
  };
  depth: number;
}

export interface ImpactReport {
  symbol: Symbol;
  directCallers: CallerInfo[];
  indirectCallers: CallerInfo[];
  directCallees: CallerInfo[];
  affectedFiles: string[];
  affectedTests: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
}

export class ImpactAnalyzer {
  private db: CodeGraphDB;

  constructor(db: CodeGraphDB) {
    this.db = db;
  }

  /**
   * Get all symbols that call the given symbol
   */
  getCallers(symbolName: string, maxDepth = 1): CallerInfo[] {
    const symbol = this.db.getSymbol(symbolName);
    if (!symbol) return [];

    const callers: CallerInfo[] = [];
    const visited = new Set<number>();

    const traverse = (symbolId: number, depth: number): void => {
      if (depth > maxDepth || visited.has(symbolId)) return;
      visited.add(symbolId);

      const callerEdges = this.db.getCallers(symbolId);

      for (const { symbol: caller, edge } of callerEdges) {
        callers.push({
          symbol: caller,
          callSite: {
            file: edge.filePath,
            line: edge.line,
            column: edge.column,
          },
          depth,
        });

        // Recurse to find indirect callers
        if (depth < maxDepth) {
          traverse(caller.id, depth + 1);
        }
      }
    };

    traverse(symbol.id, 1);
    return callers;
  }

  /**
   * Get all symbols that the given symbol calls
   */
  getCallees(symbolName: string, maxDepth = 1): CallerInfo[] {
    const symbol = this.db.getSymbol(symbolName);
    if (!symbol) return [];

    const callees: CallerInfo[] = [];
    const visited = new Set<number>();

    const traverse = (symbolId: number, depth: number): void => {
      if (depth > maxDepth || visited.has(symbolId)) return;
      visited.add(symbolId);

      const calleeEdges = this.db.getCallees(symbolId);

      for (const { symbol: callee, edge } of calleeEdges) {
        callees.push({
          symbol: callee,
          callSite: {
            file: edge.filePath,
            line: edge.line,
            column: edge.column,
          },
          depth,
        });

        // Recurse to find indirect callees
        if (depth < maxDepth) {
          traverse(callee.id, depth + 1);
        }
      }
    };

    traverse(symbol.id, 1);
    return callees;
  }

  /**
   * Analyze the full impact of changing a symbol
   */
  analyzeImpact(symbolName: string, includeTests = true): ImpactReport {
    const symbol = this.db.getSymbol(symbolName);
    if (!symbol) {
      return {
        symbol: {
          id: 0,
          name: symbolName,
          qualifiedName: symbolName,
          type: 'function',
          filePath: 'unknown',
          startLine: 0,
          endLine: 0,
          startColumn: 0,
          endColumn: 0,
          sourceCode: '',
          language: 'unknown',
          isExported: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        directCallers: [],
        indirectCallers: [],
        directCallees: [],
        affectedFiles: [],
        affectedTests: [],
        riskLevel: 'low',
        summary: `Symbol "${symbolName}" not found in code graph`,
      };
    }

    // Get direct and indirect callers (2 levels deep)
    const allCallers = this.getCallers(symbolName, 3);
    const directCallers = allCallers.filter((c) => c.depth === 1);
    const indirectCallers = allCallers.filter((c) => c.depth > 1);

    // Get callees
    const directCallees = this.getCallees(symbolName, 1);

    // Collect affected files
    const affectedFilesSet = new Set<string>();
    affectedFilesSet.add(symbol.filePath);
    for (const caller of allCallers) {
      affectedFilesSet.add(caller.symbol.filePath);
    }
    const affectedFiles = Array.from(affectedFilesSet);

    // Identify test files
    const testPatterns = ['.test.', '.spec.', '__tests__', '_test.', 'test_'];
    const affectedTests = includeTests ? affectedFiles.filter((f) => testPatterns.some((p) => f.includes(p))) : [];

    // Calculate risk level
    const riskLevel = this.calculateRiskLevel(symbol, directCallers.length, indirectCallers.length, affectedFiles.length);

    // Generate summary
    const summary = this.generateSummary(symbol, directCallers.length, indirectCallers.length, affectedFiles.length, affectedTests.length, riskLevel);

    return {
      symbol,
      directCallers,
      indirectCallers,
      directCallees,
      affectedFiles,
      affectedTests,
      riskLevel,
      summary,
    };
  }

  private calculateRiskLevel(symbol: Symbol, directCallers: number, indirectCallers: number, affectedFiles: number): 'low' | 'medium' | 'high' | 'critical' {
    // Exported symbols have higher risk
    const exportMultiplier = symbol.isExported ? 1.5 : 1;

    // Calculate base risk score
    const score = (directCallers * 2 + indirectCallers * 0.5 + affectedFiles) * exportMultiplier;

    if (score >= 20) return 'critical';
    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  }

  private generateSummary(
    symbol: Symbol,
    directCallers: number,
    indirectCallers: number,
    affectedFiles: number,
    affectedTests: number,
    riskLevel: string
  ): string {
    const parts: string[] = [];

    parts.push(`Changing "${symbol.name}" (${symbol.type}) has ${riskLevel} risk.`);

    if (directCallers > 0) {
      parts.push(`${directCallers} direct caller${directCallers !== 1 ? 's' : ''}.`);
    }

    if (indirectCallers > 0) {
      parts.push(`${indirectCallers} indirect caller${indirectCallers !== 1 ? 's' : ''}.`);
    }

    parts.push(`${affectedFiles} file${affectedFiles !== 1 ? 's' : ''} affected.`);

    if (affectedTests > 0) {
      parts.push(`${affectedTests} test file${affectedTests !== 1 ? 's' : ''} to update.`);
    }

    if (symbol.isExported) {
      parts.push('Symbol is exported (may affect external consumers).');
    }

    return parts.join(' ');
  }

  /**
   * Find all paths between two symbols
   */
  findPaths(fromSymbol: string, toSymbol: string, maxDepth = 5): Array<Symbol[]> {
    const from = this.db.getSymbol(fromSymbol);
    const to = this.db.getSymbol(toSymbol);

    if (!from || !to) return [];

    const paths: Array<Symbol[]> = [];
    const currentPath: Symbol[] = [from];
    const visited = new Set<number>([from.id]);

    const dfs = (current: Symbol, depth: number): void => {
      if (depth > maxDepth) return;

      if (current.id === to.id) {
        paths.push([...currentPath]);
        return;
      }

      const callees = this.db.getCallees(current.id);

      for (const { symbol: callee } of callees) {
        if (!visited.has(callee.id)) {
          visited.add(callee.id);
          currentPath.push(callee);
          dfs(callee, depth + 1);
          currentPath.pop();
          visited.delete(callee.id);
        }
      }
    };

    dfs(from, 0);
    return paths;
  }

  /**
   * Get dependency graph for a symbol
   */
  getDependencyGraph(symbolName: string, depth = 2): { nodes: Symbol[]; edges: Array<{ from: number; to: number; type: string }> } {
    const symbol = this.db.getSymbol(symbolName);
    if (!symbol) return { nodes: [], edges: [] };

    const nodes: Map<number, Symbol> = new Map();
    const edges: Array<{ from: number; to: number; type: string }> = [];
    const visited = new Set<number>();

    const traverse = (symbolId: number, currentDepth: number): void => {
      if (currentDepth > depth || visited.has(symbolId)) return;
      visited.add(symbolId);

      const sym = this.db.getSymbolById(symbolId);
      if (!sym) return;

      nodes.set(symbolId, sym);

      // Get callers
      const callers = this.db.getCallers(symbolId);
      for (const { symbol: caller, edge } of callers) {
        nodes.set(caller.id, caller);
        edges.push({ from: caller.id, to: symbolId, type: edge.type });
        traverse(caller.id, currentDepth + 1);
      }

      // Get callees
      const callees = this.db.getCallees(symbolId);
      for (const { symbol: callee, edge } of callees) {
        nodes.set(callee.id, callee);
        edges.push({ from: symbolId, to: callee.id, type: edge.type });
        traverse(callee.id, currentDepth + 1);
      }
    };

    traverse(symbol.id, 0);

    return {
      nodes: Array.from(nodes.values()),
      edges,
    };
  }
}
