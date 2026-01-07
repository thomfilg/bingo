import path from 'path';
import fs from 'fs';

/**
 * Checks for ESLint bypass patterns in the codebase
 * @param {string} componentDir - Directory to scan
 * @returns {void} - Throws error if bypass patterns are found
 */
function checkEslintBypass(componentDir) {
    const bypassPatterns = [
        /\/\/\s*eslint-disable-next-line/g,
        /\/\/\s*eslint-disable/g,
        /\/\*\s*eslint-disable\s*\*\//g,
        /\/\*\s*eslint-disable-next-line\s*\*\//g,
        /@ts-ignore/g,
        /@ts-nocheck/g,
        /@ts-expect-error/g,
        /\/\/\s*@typescript-eslint\/no-explicit-any/g,
    ];

    const allowedExceptions = new Set([
        '*.test.ts',
        '*.test.tsx',
        '*.spec.ts',
        '*.spec.tsx',
        '*.stories.tsx',
        '*.stories.ts',
    ]);

    const violations = [];
    
    function scanFile(filePath) {
        // Skip test and story files
        const fileName = path.basename(filePath);
        if (allowedExceptions.has(fileName) || 
            fileName.includes('.test.') || 
            fileName.includes('.spec.') ||
            fileName.includes('.stories.')) {
            return;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            bypassPatterns.forEach(pattern => {
                if (pattern.test(line)) {
                    const match = line.match(pattern);
                    violations.push({
                        file: path.relative(process.cwd(), filePath),
                        line: index + 1,
                        content: line.trim(),
                        pattern: match[0]
                    });
                }
            });
        });
    }

    function scanDirectory(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory() && entry.name !== 'node_modules') {
                scanDirectory(fullPath);
            } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
                scanFile(fullPath);
            }
        }
    }

    // Start scanning
    scanDirectory(componentDir);

    // Report violations
    if (violations.length > 0) {
        console.error('\n❌ ESLint bypass patterns detected:');
        console.error('─'.repeat(80));
        
        violations.forEach(v => {
            console.error(`\n📁 ${v.file}:${v.line}`);
            console.error(`   Pattern: ${v.pattern}`);
            console.error(`   Line: "${v.content}"`);
        });
        
        console.error('\n─'.repeat(80));
        console.error(`Total violations: ${violations.length}`);
        console.error('\nThese patterns bypass code quality checks and should be removed.');
        console.error('If absolutely necessary, document why in a comment and get approval.');
        
        throw new Error(`Found ${violations.length} ESLint bypass patterns`);
    }
    
    console.log('  ✓ No ESLint bypass patterns found');
}

export { checkEslintBypass };