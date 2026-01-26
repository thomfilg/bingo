/**
 * CodeGraph Database
 *
 * SQLite-based storage for the code graph with FTS5 full-text search.
 * 100% local - no data leaves your machine.
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export interface Symbol {
  id: number;
  name: string;
  qualifiedName: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'variable' | 'import' | 'export' | 'method' | 'property';
  filePath: string;
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
  sourceCode: string;
  docstring?: string;
  signature?: string;
  parentId?: number;
  language: string;
  exportedAs?: string;
  isExported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Edge {
  id: number;
  sourceId: number;
  targetId: number;
  type: 'calls' | 'imports' | 'extends' | 'implements' | 'uses' | 'exports' | 'contains';
  filePath: string;
  line: number;
  column: number;
}

export interface FileInfo {
  id: number;
  path: string;
  language: string;
  size: number;
  hash: string;
  symbolCount: number;
  lastIndexed: string;
}

export interface GraphStats {
  totalFiles: number;
  totalSymbols: number;
  totalEdges: number;
  byLanguage: Record<string, number>;
  byType: Record<string, number>;
  lastIndexed: string;
  estimatedTokensSaved: number;
  estimatedCostSaved: string;
}

export class CodeGraphDB {
  private db: Database.Database;
  private dbPath: string;

  constructor(projectPath?: string) {
    const basePath = projectPath || process.cwd();
    const codegraphDir = join(basePath, '.codegraph');

    if (!existsSync(codegraphDir)) {
      mkdirSync(codegraphDir, { recursive: true });
    }

    this.dbPath = join(codegraphDir, 'graph.db');
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(`
      -- Files table
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE NOT NULL,
        language TEXT NOT NULL,
        size INTEGER NOT NULL,
        hash TEXT NOT NULL,
        symbol_count INTEGER DEFAULT 0,
        last_indexed TEXT NOT NULL
      );

      -- Symbols table
      CREATE TABLE IF NOT EXISTS symbols (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        qualified_name TEXT NOT NULL,
        type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        start_line INTEGER NOT NULL,
        end_line INTEGER NOT NULL,
        start_column INTEGER NOT NULL,
        end_column INTEGER NOT NULL,
        source_code TEXT,
        docstring TEXT,
        signature TEXT,
        parent_id INTEGER REFERENCES symbols(id),
        language TEXT NOT NULL,
        exported_as TEXT,
        is_exported INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Edges table (relationships between symbols)
      CREATE TABLE IF NOT EXISTS edges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_id INTEGER NOT NULL REFERENCES symbols(id) ON DELETE CASCADE,
        target_id INTEGER NOT NULL REFERENCES symbols(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        line INTEGER NOT NULL,
        column INTEGER NOT NULL,
        UNIQUE(source_id, target_id, type, line, column)
      );

      -- Full-text search for symbols
      CREATE VIRTUAL TABLE IF NOT EXISTS symbols_fts USING fts5(
        name,
        qualified_name,
        docstring,
        source_code,
        content='symbols',
        content_rowid='id'
      );

      -- Indexes for fast lookups
      CREATE INDEX IF NOT EXISTS idx_symbols_name ON symbols(name);
      CREATE INDEX IF NOT EXISTS idx_symbols_qualified_name ON symbols(qualified_name);
      CREATE INDEX IF NOT EXISTS idx_symbols_type ON symbols(type);
      CREATE INDEX IF NOT EXISTS idx_symbols_file_path ON symbols(file_path);
      CREATE INDEX IF NOT EXISTS idx_symbols_parent ON symbols(parent_id);
      CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_id);
      CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_id);
      CREATE INDEX IF NOT EXISTS idx_edges_type ON edges(type);
      CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);

      -- Triggers to keep FTS in sync
      CREATE TRIGGER IF NOT EXISTS symbols_ai AFTER INSERT ON symbols BEGIN
        INSERT INTO symbols_fts(rowid, name, qualified_name, docstring, source_code)
        VALUES (new.id, new.name, new.qualified_name, new.docstring, new.source_code);
      END;

      CREATE TRIGGER IF NOT EXISTS symbols_ad AFTER DELETE ON symbols BEGIN
        INSERT INTO symbols_fts(symbols_fts, rowid, name, qualified_name, docstring, source_code)
        VALUES ('delete', old.id, old.name, old.qualified_name, old.docstring, old.source_code);
      END;

      CREATE TRIGGER IF NOT EXISTS symbols_au AFTER UPDATE ON symbols BEGIN
        INSERT INTO symbols_fts(symbols_fts, rowid, name, qualified_name, docstring, source_code)
        VALUES ('delete', old.id, old.name, old.qualified_name, old.docstring, old.source_code);
        INSERT INTO symbols_fts(rowid, name, qualified_name, docstring, source_code)
        VALUES (new.id, new.name, new.qualified_name, new.docstring, new.source_code);
      END;

      -- Stats table for tracking indexing metrics
      CREATE TABLE IF NOT EXISTS stats (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }

  // File operations
  insertFile(file: Omit<FileInfo, 'id'>): number {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO files (path, language, size, hash, symbol_count, last_indexed)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(file.path, file.language, file.size, file.hash, file.symbolCount, file.lastIndexed);
    return result.lastInsertRowid as number;
  }

  getFile(path: string): FileInfo | undefined {
    const stmt = this.db.prepare('SELECT * FROM files WHERE path = ?');
    const row = stmt.get(path) as Record<string, unknown> | undefined;
    if (!row) return undefined;
    return {
      id: row.id as number,
      path: row.path as string,
      language: row.language as string,
      size: row.size as number,
      hash: row.hash as string,
      symbolCount: row.symbol_count as number,
      lastIndexed: row.last_indexed as string,
    };
  }

  getAllFiles(): FileInfo[] {
    const stmt = this.db.prepare('SELECT * FROM files ORDER BY path');
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map((row) => ({
      id: row.id as number,
      path: row.path as string,
      language: row.language as string,
      size: row.size as number,
      hash: row.hash as string,
      symbolCount: row.symbol_count as number,
      lastIndexed: row.last_indexed as string,
    }));
  }

  deleteFileSymbols(filePath: string): void {
    this.db.prepare('DELETE FROM symbols WHERE file_path = ?').run(filePath);
    this.db.prepare('DELETE FROM files WHERE path = ?').run(filePath);
  }

  // Symbol operations
  insertSymbol(symbol: Omit<Symbol, 'id'>): number {
    const stmt = this.db.prepare(`
      INSERT INTO symbols (
        name, qualified_name, type, file_path, start_line, end_line,
        start_column, end_column, source_code, docstring, signature,
        parent_id, language, exported_as, is_exported, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      symbol.name,
      symbol.qualifiedName,
      symbol.type,
      symbol.filePath,
      symbol.startLine,
      symbol.endLine,
      symbol.startColumn,
      symbol.endColumn,
      symbol.sourceCode,
      symbol.docstring || null,
      symbol.signature || null,
      symbol.parentId || null,
      symbol.language,
      symbol.exportedAs || null,
      symbol.isExported ? 1 : 0,
      symbol.createdAt,
      symbol.updatedAt
    );
    return result.lastInsertRowid as number;
  }

  getSymbol(name: string, filePath?: string): Symbol | undefined {
    let stmt;
    let row;

    if (filePath) {
      stmt = this.db.prepare('SELECT * FROM symbols WHERE (name = ? OR qualified_name = ?) AND file_path = ?');
      row = stmt.get(name, name, filePath) as Record<string, unknown> | undefined;
    } else {
      stmt = this.db.prepare('SELECT * FROM symbols WHERE name = ? OR qualified_name = ?');
      row = stmt.get(name, name) as Record<string, unknown> | undefined;
    }

    if (!row) return undefined;
    return this.rowToSymbol(row);
  }

  getSymbolById(id: number): Symbol | undefined {
    const stmt = this.db.prepare('SELECT * FROM symbols WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    if (!row) return undefined;
    return this.rowToSymbol(row);
  }

  getAllSymbols(): Symbol[] {
    const stmt = this.db.prepare('SELECT * FROM symbols ORDER BY file_path, start_line');
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map((row) => this.rowToSymbol(row));
  }

  searchSymbols(query: string, type?: string, limit = 20): Symbol[] {
    let sql = `
      SELECT s.* FROM symbols s
      JOIN symbols_fts fts ON s.id = fts.rowid
      WHERE symbols_fts MATCH ?
    `;

    const params: (string | number)[] = [query + '*'];

    if (type && type !== 'all') {
      sql += ' AND s.type = ?';
      params.push(type);
    }

    sql += ' ORDER BY rank LIMIT ?';
    params.push(limit);

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as Record<string, unknown>[];
    return rows.map((row) => this.rowToSymbol(row));
  }

  getFileStructure(filePath: string): Symbol[] {
    const stmt = this.db.prepare(`
      SELECT * FROM symbols
      WHERE file_path = ?
      ORDER BY start_line
    `);
    const rows = stmt.all(filePath) as Record<string, unknown>[];
    return rows.map((row) => this.rowToSymbol(row));
  }

  private rowToSymbol(row: Record<string, unknown>): Symbol {
    return {
      id: row.id as number,
      name: row.name as string,
      qualifiedName: row.qualified_name as string,
      type: row.type as Symbol['type'],
      filePath: row.file_path as string,
      startLine: row.start_line as number,
      endLine: row.end_line as number,
      startColumn: row.start_column as number,
      endColumn: row.end_column as number,
      sourceCode: row.source_code as string,
      docstring: row.docstring as string | undefined,
      signature: row.signature as string | undefined,
      parentId: row.parent_id as number | undefined,
      language: row.language as string,
      exportedAs: row.exported_as as string | undefined,
      isExported: (row.is_exported as number) === 1,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  // Edge operations
  insertEdge(edge: Omit<Edge, 'id'>): number {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO edges (source_id, target_id, type, file_path, line, column)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(edge.sourceId, edge.targetId, edge.type, edge.filePath, edge.line, edge.column);
    return result.lastInsertRowid as number;
  }

  getCallers(symbolId: number): Array<{ symbol: Symbol; edge: Edge }> {
    const stmt = this.db.prepare(`
      SELECT s.*, e.id as edge_id, e.type as edge_type, e.file_path as edge_file_path,
             e.line as edge_line, e.column as edge_column
      FROM symbols s
      JOIN edges e ON s.id = e.source_id
      WHERE e.target_id = ?
    `);
    const rows = stmt.all(symbolId) as Record<string, unknown>[];
    return rows.map((row) => ({
      symbol: this.rowToSymbol(row),
      edge: {
        id: row.edge_id as number,
        sourceId: row.id as number,
        targetId: symbolId,
        type: row.edge_type as Edge['type'],
        filePath: row.edge_file_path as string,
        line: row.edge_line as number,
        column: row.edge_column as number,
      },
    }));
  }

  getCallees(symbolId: number): Array<{ symbol: Symbol; edge: Edge }> {
    const stmt = this.db.prepare(`
      SELECT s.*, e.id as edge_id, e.type as edge_type, e.file_path as edge_file_path,
             e.line as edge_line, e.column as edge_column
      FROM symbols s
      JOIN edges e ON s.id = e.target_id
      WHERE e.source_id = ?
    `);
    const rows = stmt.all(symbolId) as Record<string, unknown>[];
    return rows.map((row) => ({
      symbol: this.rowToSymbol(row),
      edge: {
        id: row.edge_id as number,
        sourceId: symbolId,
        targetId: row.id as number,
        type: row.edge_type as Edge['type'],
        filePath: row.edge_file_path as string,
        line: row.edge_line as number,
        column: row.edge_column as number,
      },
    }));
  }

  getGraph(): { symbols: Symbol[]; edges: Edge[] } {
    const symbols = this.getAllSymbols();
    const edgesStmt = this.db.prepare('SELECT * FROM edges');
    const edgeRows = edgesStmt.all() as Record<string, unknown>[];
    const edges = edgeRows.map((row) => ({
      id: row.id as number,
      sourceId: row.source_id as number,
      targetId: row.target_id as number,
      type: row.type as Edge['type'],
      filePath: row.file_path as string,
      line: row.line as number,
      column: row.column as number,
    }));
    return { symbols, edges };
  }

  // Stats operations
  getStats(): GraphStats {
    const filesCount = (this.db.prepare('SELECT COUNT(*) as count FROM files').get() as { count: number }).count;
    const symbolsCount = (this.db.prepare('SELECT COUNT(*) as count FROM symbols').get() as { count: number }).count;
    const edgesCount = (this.db.prepare('SELECT COUNT(*) as count FROM edges').get() as { count: number }).count;

    const byLanguageRows = this.db.prepare('SELECT language, COUNT(*) as count FROM symbols GROUP BY language').all() as Array<{
      language: string;
      count: number;
    }>;
    const byLanguage: Record<string, number> = {};
    byLanguageRows.forEach((row) => {
      byLanguage[row.language] = row.count;
    });

    const byTypeRows = this.db.prepare('SELECT type, COUNT(*) as count FROM symbols GROUP BY type').all() as Array<{
      type: string;
      count: number;
    }>;
    const byType: Record<string, number> = {};
    byTypeRows.forEach((row) => {
      byType[row.type] = row.count;
    });

    const lastIndexedRow = this.db.prepare("SELECT value FROM stats WHERE key = 'last_indexed'").get() as { value: string } | undefined;
    const lastIndexed = lastIndexedRow?.value || 'never';

    // Estimate tokens saved: each symbol lookup saves ~200 tokens vs grep+read
    // Each edge traversal saves ~100 tokens vs manual exploration
    const estimatedTokensSaved = symbolsCount * 200 + edgesCount * 100;

    // Claude pricing: ~$3 per 1M input tokens (Sonnet)
    const estimatedCostSaved = `$${((estimatedTokensSaved / 1_000_000) * 3).toFixed(2)}`;

    return {
      totalFiles: filesCount,
      totalSymbols: symbolsCount,
      totalEdges: edgesCount,
      byLanguage,
      byType,
      lastIndexed,
      estimatedTokensSaved,
      estimatedCostSaved,
    };
  }

  setStat(key: string, value: string): void {
    this.db.prepare('INSERT OR REPLACE INTO stats (key, value) VALUES (?, ?)').run(key, value);
  }

  close(): void {
    this.db.close();
  }
}
