// validators/tokens.js (ESM)
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Allowed animation durations (ms) from Motion & Animation
const ALLOWED_DURATIONS = new Set([0, 150, 250, 350, 500, 700]); // instant, fast, normal, slow, slower, slowest
const DURATION_RE = /(-?[\d.]+)m?s\b/gi; // finds "200ms" or "0.2s"
const HEX_COLOR_RE = /#[0-9a-fA-F]{3,8}\b/g;
const VAR_COLOR_RE = /var\(--color-[a-z0-9-]+\)/i;
const Z_INDEX_ALLOWED = new Set([1000, 1020, 1030, 1040, 1050, 1060, 1070, 1080, 1090]); // appendices scale

function listTextFiles(dir) {
  const out = execSync(
    `git ls-files -z "${dir.replace(/\\/g, '/')}/**/*.{ts,tsx,js,jsx,css,scss}"`,
    { stdio: ['ignore', 'pipe', 'pipe'] },
  ).toString();
  return out ? out.split('\0').filter(Boolean) : [];
}

export function assertDesignTokensUsage(componentDirAbs) {
  const files = listTextFiles(componentDirAbs);
  const problems = [];

  for (const f of files) {
    const txt = fs.readFileSync(f, 'utf8');

    // 1) Colors: forbid hard-coded hex unless also using CSS vars
    const hasHex = HEX_COLOR_RE.test(txt);
    const hasVar = VAR_COLOR_RE.test(txt);
    if (hasHex && !hasVar) {
      problems.push(`${f}: uses raw hex colors; use design tokens (CSS variables).`);
    }

    // 2) Animation durations: only allow documented scale
    let m;
    while ((m = DURATION_RE.exec(txt))) {
      const raw = m[1];
      let ms = 0;
      if (m[0].toLowerCase().endsWith('ms')) ms = Number(raw);
      else if (m[0].toLowerCase().endsWith('s')) ms = Number(raw) * 1000;
      if (!ALLOWED_DURATIONS.has(ms)) {
        problems.push(`${f}: animation duration ${m[0]} not in allowed scale.`);
      }
    }

    // 3) Z-index: only named scale values
    const zMatches = txt.match(/z-index\s*:\s*(-?\d+)/gi) || [];
    zMatches.forEach((zline) => {
      const num = Number((zline.match(/(-?\d+)/) || [])[1]);
      if (!Z_INDEX_ALLOWED.has(num)) {
        problems.push(`${f}: z-index ${num} not in approved scale.`);
      }
    });
  }

  if (problems.length) {
    console.error('Design token violations:\n' + problems.map((p) => ' - ' + p).join('\n'));
    process.exit(1);
  }
}
