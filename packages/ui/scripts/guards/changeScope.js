import { execSync } from 'child_process';

const denyGlobs = [
  /(^|\/)\.storybook\//i,
  /(^|\/)storybook\//i,
  /storybook\.test-runner\.(js|cjs|mjs|ts)$/i,
  /playwright(\.|-).*\.([cm]?js|ts)$/i,
  /vitest(\.|-).*\.([cm]?js|ts)$/i,
  /jest(\.|-).*\.([cm]?js|ts)$/i,
  /tsup\.config\.ts$/i,
  /eslint(\.|-).*\.([cm]?js|ts|json|yaml|yml)$/i,
];

export function assertAllowedChangeScope() {
  const run = (cmd) =>
    execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] })
      .toString()
      .trim();

  try {
    execSync('git fetch --quiet origin main');
  } catch {}

  let base = '';
  try {
    base = run('git merge-base HEAD origin/main');
  } catch {
  }

  const changed = base
    ? run(`git diff --name-only ${base}...HEAD`).split('\n').filter(Boolean)
    : run('git ls-files').split('\n').filter(Boolean);

  const isDenied = (f) => f.trim() !== "" && denyGlobs.some((re) => {
    const match = re.test(f);
    return match;
  });

  const violations = changed.filter((f) => isDenied(f));
  if (violations.length) {
    console.error('Change-scope violations:\n' + violations.map((v) => ' - ' + v).join('\n'));
    process.exit(1);
  }
}
