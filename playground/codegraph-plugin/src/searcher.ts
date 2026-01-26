/**
 * CodeGraph Symbol Searcher
 *
 * Full-text search with semantic understanding of code symbols.
 */

import type { CodeGraphDB, Symbol } from './db.js';

export interface SearchResult {
  symbol: Symbol;
  score: number;
  matchType: 'exact' | 'prefix' | 'fuzzy' | 'semantic';
  context?: string;
}

export class SymbolSearcher {
  private db: CodeGraphDB;

  constructor(db: CodeGraphDB) {
    this.db = db;
  }

  /**
   * Search for symbols by query string
   *
   * @param query - Search query (symbol name, partial match, or concept)
   * @param type - Filter by symbol type
   * @param limit - Maximum results to return
   * @returns Ranked search results
   */
  search(query: string, type = 'all', limit = 20): SearchResult[] {
    const results: SearchResult[] = [];

    // Try exact match first
    const exactMatches = this.exactSearch(query, type);
    results.push(...exactMatches.map((s) => ({ symbol: s, score: 1.0, matchType: 'exact' as const })));

    // If not enough results, try FTS
    if (results.length < limit) {
      const ftsMatches = this.db.searchSymbols(query, type !== 'all' ? type : undefined, limit - results.length);
      const existingIds = new Set(results.map((r) => r.symbol.id));

      for (const symbol of ftsMatches) {
        if (!existingIds.has(symbol.id)) {
          results.push({
            symbol,
            score: this.calculateScore(symbol, query),
            matchType: 'fuzzy' as const,
          });
        }
      }
    }

    // Semantic search (camelCase/snake_case conversion)
    if (results.length < limit) {
      const semanticMatches = this.semanticSearch(query, type, limit - results.length);
      const existingIds = new Set(results.map((r) => r.symbol.id));

      for (const match of semanticMatches) {
        if (!existingIds.has(match.symbol.id)) {
          results.push(match);
        }
      }
    }

    // Sort by score and return
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private exactSearch(query: string, type: string): Symbol[] {
    const allSymbols = this.db.getAllSymbols();
    return allSymbols.filter((s) => {
      const matchesType = type === 'all' || s.type === type;
      const matchesName = s.name === query || s.qualifiedName === query || s.name.toLowerCase() === query.toLowerCase();
      return matchesType && matchesName;
    });
  }

  private semanticSearch(query: string, type: string, limit: number): SearchResult[] {
    const results: SearchResult[] = [];
    const queryTerms = this.tokenize(query.toLowerCase());

    const allSymbols = this.db.getAllSymbols();

    for (const symbol of allSymbols) {
      if (type !== 'all' && symbol.type !== type) continue;

      const symbolTerms = this.tokenize(symbol.name.toLowerCase());
      const qualifiedTerms = this.tokenize(symbol.qualifiedName.toLowerCase());

      // Check if query terms are a subset of symbol terms
      let matchCount = 0;
      for (const term of queryTerms) {
        if (symbolTerms.some((st) => st.includes(term)) || qualifiedTerms.some((st) => st.includes(term))) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        const score = matchCount / queryTerms.length;
        results.push({
          symbol,
          score: score * 0.8, // Semantic matches score lower than exact
          matchType: 'semantic',
        });
      }

      if (results.length >= limit * 2) break; // Collect more than needed for sorting
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Tokenize a string into meaningful parts
   * Handles camelCase, PascalCase, snake_case, etc.
   */
  private tokenize(str: string): string[] {
    // Split on common separators and case changes
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase -> camel Case
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // XMLParser -> XML Parser
      .replace(/[_\-\.]/g, ' ') // snake_case -> snake case
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 1);
  }

  /**
   * Calculate relevance score for a symbol against a query
   */
  private calculateScore(symbol: Symbol, query: string): number {
    const lowerQuery = query.toLowerCase();
    const lowerName = symbol.name.toLowerCase();
    const lowerQualified = symbol.qualifiedName.toLowerCase();

    // Exact name match
    if (lowerName === lowerQuery) return 1.0;

    // Qualified name exact match
    if (lowerQualified === lowerQuery) return 0.95;

    // Name starts with query
    if (lowerName.startsWith(lowerQuery)) return 0.9;

    // Qualified name starts with query
    if (lowerQualified.startsWith(lowerQuery)) return 0.85;

    // Name contains query
    if (lowerName.includes(lowerQuery)) return 0.7;

    // Qualified name contains query
    if (lowerQualified.includes(lowerQuery)) return 0.6;

    // Token match
    const queryTokens = this.tokenize(lowerQuery);
    const nameTokens = this.tokenize(lowerName);
    const matchedTokens = queryTokens.filter((qt) => nameTokens.some((nt) => nt.includes(qt)));

    if (matchedTokens.length > 0) {
      return (matchedTokens.length / queryTokens.length) * 0.5;
    }

    return 0.1; // Low score for FTS matches without clear pattern
  }

  /**
   * Find symbols similar to the given one
   */
  findSimilar(symbolName: string, limit = 5): SearchResult[] {
    const symbol = this.db.getSymbol(symbolName);
    if (!symbol) return [];

    const tokens = this.tokenize(symbol.name);
    const results: SearchResult[] = [];

    for (const token of tokens) {
      const matches = this.search(token, symbol.type, limit);
      for (const match of matches) {
        if (match.symbol.id !== symbol.id) {
          const existing = results.find((r) => r.symbol.id === match.symbol.id);
          if (existing) {
            existing.score = Math.max(existing.score, match.score);
          } else {
            results.push(match);
          }
        }
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
