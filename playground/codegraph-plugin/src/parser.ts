/**
 * CodeGraph Parser
 *
 * Tree-sitter based parser for extracting symbols and relationships from source code.
 * Supports TypeScript, JavaScript, and Python.
 */

import Parser from 'tree-sitter';
import { glob } from 'glob';
import { readFileSync, statSync } from 'fs';
import { createHash } from 'crypto';
import { relative, extname, basename } from 'path';
import type { CodeGraphDB, Symbol } from './db.js';

interface LanguageConfig {
  extensions: string[];
  parser: Parser.Language;
  queries: {
    functions: string;
    classes: string;
    interfaces?: string;
    types?: string;
    imports: string;
    exports: string;
    calls: string;
  };
}

interface ParseResult {
  filesIndexed: number;
  symbolsFound: number;
  edgesFound: number;
  errors: string[];
  duration: number;
}

export class CodeParser {
  private parser: Parser;
  private languages: Map<string, LanguageConfig> = new Map();

  constructor() {
    this.parser = new Parser();
    this.initLanguages();
  }

  private async initLanguages(): Promise<void> {
    // Languages will be loaded dynamically when needed
    // This avoids hard dependency on all language parsers at startup
  }

  private async getLanguageConfig(language: string): Promise<LanguageConfig | undefined> {
    if (this.languages.has(language)) {
      return this.languages.get(language);
    }

    try {
      let parserModule: { default: Parser.Language };
      let config: LanguageConfig;

      switch (language) {
        case 'typescript':
          parserModule = await import('tree-sitter-typescript');
          config = {
            extensions: ['.ts', '.tsx'],
            parser: (parserModule as unknown as { typescript: Parser.Language }).typescript,
            queries: {
              functions: `
                (function_declaration name: (identifier) @name) @function
                (arrow_function) @arrow
                (method_definition name: (property_identifier) @name) @method
              `,
              classes: `
                (class_declaration name: (type_identifier) @name) @class
              `,
              interfaces: `
                (interface_declaration name: (type_identifier) @name) @interface
              `,
              types: `
                (type_alias_declaration name: (type_identifier) @name) @type
              `,
              imports: `
                (import_statement source: (string) @source) @import
                (import_specifier name: (identifier) @name) @specifier
              `,
              exports: `
                (export_statement) @export
                (export_specifier name: (identifier) @name) @specifier
              `,
              calls: `
                (call_expression function: (identifier) @callee) @call
                (call_expression function: (member_expression property: (property_identifier) @callee)) @call
              `,
            },
          };
          break;

        case 'javascript':
          parserModule = await import('tree-sitter-javascript');
          config = {
            extensions: ['.js', '.jsx', '.mjs', '.cjs'],
            parser: parserModule.default,
            queries: {
              functions: `
                (function_declaration name: (identifier) @name) @function
                (arrow_function) @arrow
                (method_definition name: (property_identifier) @name) @method
              `,
              classes: `
                (class_declaration name: (identifier) @name) @class
              `,
              imports: `
                (import_statement source: (string) @source) @import
                (import_specifier name: (identifier) @name) @specifier
              `,
              exports: `
                (export_statement) @export
                (export_specifier name: (identifier) @name) @specifier
              `,
              calls: `
                (call_expression function: (identifier) @callee) @call
                (call_expression function: (member_expression property: (property_identifier) @callee)) @call
              `,
            },
          };
          break;

        case 'python':
          parserModule = await import('tree-sitter-python');
          config = {
            extensions: ['.py'],
            parser: parserModule.default,
            queries: {
              functions: `
                (function_definition name: (identifier) @name) @function
              `,
              classes: `
                (class_definition name: (identifier) @name) @class
              `,
              imports: `
                (import_statement name: (dotted_name) @name) @import
                (import_from_statement module_name: (dotted_name) @module) @import_from
              `,
              exports: `
                (expression_statement (assignment left: (identifier) @name)) @export
              `,
              calls: `
                (call function: (identifier) @callee) @call
                (call function: (attribute attribute: (identifier) @callee)) @call
              `,
            },
          };
          break;

        default:
          return undefined;
      }

      this.languages.set(language, config);
      return config;
    } catch (error) {
      console.error(`Failed to load ${language} parser:`, error);
      return undefined;
    }
  }

  private getLanguageFromExt(ext: string): string | undefined {
    const extToLang: Record<string, string> = {
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.mjs': 'javascript',
      '.cjs': 'javascript',
      '.py': 'python',
    };
    return extToLang[ext];
  }

  async indexDirectory(dirPath: string, languages: string[], db: CodeGraphDB): Promise<ParseResult> {
    const startTime = Date.now();
    const result: ParseResult = {
      filesIndexed: 0,
      symbolsFound: 0,
      edgesFound: 0,
      errors: [],
      duration: 0,
    };

    // Build glob patterns for requested languages
    const extensions: string[] = [];
    for (const lang of languages) {
      const config = await this.getLanguageConfig(lang);
      if (config) {
        extensions.push(...config.extensions);
      }
    }

    if (extensions.length === 0) {
      result.errors.push('No valid languages specified');
      return result;
    }

    // Find all matching files
    const patterns = extensions.map((ext) => `**/*${ext}`);
    const ignorePatterns = ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**', '**/coverage/**', '**/__pycache__/**'];

    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: dirPath,
        ignore: ignorePatterns,
        absolute: true,
      });
      files.push(...matches);
    }

    // Process each file
    const symbolMap = new Map<string, number>(); // qualifiedName -> symbolId

    for (const filePath of files) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const stats = statSync(filePath);
        const hash = createHash('md5').update(content).digest('hex');
        const relativePath = relative(dirPath, filePath);
        const ext = extname(filePath);
        const language = this.getLanguageFromExt(ext);

        if (!language) continue;

        // Check if file needs re-indexing
        const existingFile = db.getFile(relativePath);
        if (existingFile && existingFile.hash === hash) {
          continue; // File hasn't changed
        }

        // Delete old symbols for this file
        db.deleteFileSymbols(relativePath);

        // Parse the file
        const config = await this.getLanguageConfig(language);
        if (!config) continue;

        this.parser.setLanguage(config.parser);
        const tree = this.parser.parse(content);

        const symbols = this.extractSymbols(tree.rootNode, content, relativePath, language);

        // Insert symbols
        for (const symbol of symbols) {
          const symbolId = db.insertSymbol(symbol);
          symbolMap.set(symbol.qualifiedName, symbolId);
          result.symbolsFound++;
        }

        // Extract and insert edges (relationships)
        const edges = this.extractEdges(tree.rootNode, content, relativePath, symbolMap);
        for (const edge of edges) {
          db.insertEdge(edge);
          result.edgesFound++;
        }

        // Record file
        db.insertFile({
          path: relativePath,
          language,
          size: stats.size,
          hash,
          symbolCount: symbols.length,
          lastIndexed: new Date().toISOString(),
        });

        result.filesIndexed++;
      } catch (error) {
        result.errors.push(`Error parsing ${filePath}: ${error}`);
      }
    }

    // Update stats
    db.setStat('last_indexed', new Date().toISOString());

    result.duration = Date.now() - startTime;
    return result;
  }

  private extractSymbols(node: Parser.SyntaxNode, content: string, filePath: string, language: string): Omit<Symbol, 'id'>[] {
    const symbols: Omit<Symbol, 'id'>[] = [];
    const now = new Date().toISOString();

    const traverse = (node: Parser.SyntaxNode, parentName?: string): void => {
      const nodeType = node.type;
      let symbol: Omit<Symbol, 'id'> | null = null;

      // Function declarations
      if (nodeType === 'function_declaration' || nodeType === 'function_definition') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          const name = nameNode.text;
          symbol = {
            name,
            qualifiedName: parentName ? `${parentName}.${name}` : name,
            type: 'function',
            filePath,
            startLine: node.startPosition.row + 1,
            endLine: node.endPosition.row + 1,
            startColumn: node.startPosition.column,
            endColumn: node.endPosition.column,
            sourceCode: content.slice(node.startIndex, node.endIndex),
            language,
            isExported: this.isExported(node),
            createdAt: now,
            updatedAt: now,
          };
          // Add docstring if present
          symbol.docstring = this.extractDocstring(node, content);
          symbol.signature = this.extractSignature(node, content);
        }
      }

      // Method definitions
      if (nodeType === 'method_definition') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          const name = nameNode.text;
          symbol = {
            name,
            qualifiedName: parentName ? `${parentName}.${name}` : name,
            type: 'method',
            filePath,
            startLine: node.startPosition.row + 1,
            endLine: node.endPosition.row + 1,
            startColumn: node.startPosition.column,
            endColumn: node.endPosition.column,
            sourceCode: content.slice(node.startIndex, node.endIndex),
            language,
            isExported: false, // Methods inherit export status from class
            createdAt: now,
            updatedAt: now,
          };
        }
      }

      // Class declarations
      if (nodeType === 'class_declaration' || nodeType === 'class_definition') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          const name = nameNode.text;
          symbol = {
            name,
            qualifiedName: parentName ? `${parentName}.${name}` : name,
            type: 'class',
            filePath,
            startLine: node.startPosition.row + 1,
            endLine: node.endPosition.row + 1,
            startColumn: node.startPosition.column,
            endColumn: node.endPosition.column,
            sourceCode: content.slice(node.startIndex, node.endIndex),
            language,
            isExported: this.isExported(node),
            createdAt: now,
            updatedAt: now,
          };
          symbol.docstring = this.extractDocstring(node, content);
        }
      }

      // Interface declarations (TypeScript)
      if (nodeType === 'interface_declaration') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          const name = nameNode.text;
          symbol = {
            name,
            qualifiedName: parentName ? `${parentName}.${name}` : name,
            type: 'interface',
            filePath,
            startLine: node.startPosition.row + 1,
            endLine: node.endPosition.row + 1,
            startColumn: node.startPosition.column,
            endColumn: node.endPosition.column,
            sourceCode: content.slice(node.startIndex, node.endIndex),
            language,
            isExported: this.isExported(node),
            createdAt: now,
            updatedAt: now,
          };
        }
      }

      // Type alias declarations (TypeScript)
      if (nodeType === 'type_alias_declaration') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          const name = nameNode.text;
          symbol = {
            name,
            qualifiedName: parentName ? `${parentName}.${name}` : name,
            type: 'type',
            filePath,
            startLine: node.startPosition.row + 1,
            endLine: node.endPosition.row + 1,
            startColumn: node.startPosition.column,
            endColumn: node.endPosition.column,
            sourceCode: content.slice(node.startIndex, node.endIndex),
            language,
            isExported: this.isExported(node),
            createdAt: now,
            updatedAt: now,
          };
        }
      }

      // Variable declarations with arrow functions
      if (nodeType === 'variable_declarator' || nodeType === 'lexical_declaration') {
        const declarators = node.type === 'lexical_declaration' ? node.namedChildren.filter((c) => c.type === 'variable_declarator') : [node];

        for (const declarator of declarators) {
          const nameNode = declarator.childForFieldName('name');
          const valueNode = declarator.childForFieldName('value');

          if (nameNode && valueNode && valueNode.type === 'arrow_function') {
            const name = nameNode.text;
            symbol = {
              name,
              qualifiedName: parentName ? `${parentName}.${name}` : name,
              type: 'function',
              filePath,
              startLine: declarator.startPosition.row + 1,
              endLine: declarator.endPosition.row + 1,
              startColumn: declarator.startPosition.column,
              endColumn: declarator.endPosition.column,
              sourceCode: content.slice(declarator.startIndex, declarator.endIndex),
              language,
              isExported: this.isExported(node.parent || node),
              createdAt: now,
              updatedAt: now,
            };
          }
        }
      }

      if (symbol) {
        symbols.push(symbol);
      }

      // Recurse into children with context
      const newParent = symbol?.type === 'class' ? symbol.qualifiedName : parentName;
      for (const child of node.namedChildren) {
        traverse(child, newParent);
      }
    };

    traverse(node);
    return symbols;
  }

  private extractEdges(
    node: Parser.SyntaxNode,
    content: string,
    filePath: string,
    symbolMap: Map<string, number>
  ): Array<{ sourceId: number; targetId: number; type: 'calls' | 'imports' | 'extends' | 'implements' | 'uses'; filePath: string; line: number; column: number }> {
    const edges: Array<{
      sourceId: number;
      targetId: number;
      type: 'calls' | 'imports' | 'extends' | 'implements' | 'uses';
      filePath: string;
      line: number;
      column: number;
    }> = [];

    const traverse = (node: Parser.SyntaxNode, currentFunction?: string): void => {
      const nodeType = node.type;

      // Track current function context
      if (nodeType === 'function_declaration' || nodeType === 'function_definition' || nodeType === 'method_definition') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          currentFunction = nameNode.text;
        }
      }

      // Function calls
      if (nodeType === 'call_expression' || nodeType === 'call') {
        const funcNode = node.childForFieldName('function');
        if (funcNode && currentFunction) {
          let calleeName: string | undefined;

          if (funcNode.type === 'identifier') {
            calleeName = funcNode.text;
          } else if (funcNode.type === 'member_expression') {
            const propNode = funcNode.childForFieldName('property');
            if (propNode) {
              calleeName = propNode.text;
            }
          }

          if (calleeName) {
            const sourceId = symbolMap.get(currentFunction);
            const targetId = symbolMap.get(calleeName);

            if (sourceId && targetId) {
              edges.push({
                sourceId,
                targetId,
                type: 'calls',
                filePath,
                line: node.startPosition.row + 1,
                column: node.startPosition.column,
              });
            }
          }
        }
      }

      // Class inheritance
      if (nodeType === 'class_declaration' || nodeType === 'class_definition') {
        const nameNode = node.childForFieldName('name');
        const className = nameNode?.text;

        if (className) {
          // Check for extends
          const heritageNode = node.childForFieldName('superclass') || node.children.find((c) => c.type === 'class_heritage');

          if (heritageNode) {
            const extendsNode = heritageNode.type === 'identifier' ? heritageNode : heritageNode.children.find((c) => c.type === 'extends_clause');

            if (extendsNode) {
              const parentName = extendsNode.type === 'identifier' ? extendsNode.text : extendsNode.namedChildren.find((c) => c.type === 'identifier')?.text;

              if (parentName) {
                const sourceId = symbolMap.get(className);
                const targetId = symbolMap.get(parentName);

                if (sourceId && targetId) {
                  edges.push({
                    sourceId,
                    targetId,
                    type: 'extends',
                    filePath,
                    line: node.startPosition.row + 1,
                    column: node.startPosition.column,
                  });
                }
              }
            }
          }
        }
      }

      // Recurse
      for (const child of node.namedChildren) {
        traverse(child, currentFunction);
      }
    };

    traverse(node);
    return edges;
  }

  private isExported(node: Parser.SyntaxNode): boolean {
    // Check if parent is export statement
    let parent = node.parent;
    while (parent) {
      if (parent.type === 'export_statement' || parent.type === 'export_default_declaration') {
        return true;
      }
      parent = parent.parent;
    }
    return false;
  }

  private extractDocstring(node: Parser.SyntaxNode, content: string): string | undefined {
    // Look for preceding comment
    let sibling = node.previousNamedSibling;
    if (sibling && sibling.type === 'comment') {
      const text = content.slice(sibling.startIndex, sibling.endIndex);
      // Clean up comment markers
      return text.replace(/^\/\*\*?\s*|\s*\*\/$|^\/\/\s*/gm, '').trim();
    }

    // For functions, check for JSDoc inside
    const bodyNode = node.childForFieldName('body');
    if (bodyNode && bodyNode.firstNamedChild?.type === 'expression_statement') {
      const exprNode = bodyNode.firstNamedChild.firstNamedChild;
      if (exprNode?.type === 'string') {
        return exprNode.text.replace(/^['"`]|['"`]$/g, '').trim();
      }
    }

    return undefined;
  }

  private extractSignature(node: Parser.SyntaxNode, content: string): string | undefined {
    // Get just the first line (signature) of functions
    const fullText = content.slice(node.startIndex, node.endIndex);
    const firstLine = fullText.split('\n')[0];
    if (firstLine && firstLine.length < 200) {
      return firstLine.trim();
    }
    return undefined;
  }
}
