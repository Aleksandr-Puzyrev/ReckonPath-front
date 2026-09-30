'use strict';

// PreToolUse hook for Bash. When the command is a `git commit` inside this
// repository, runs the mandatory checks (.claude/rules/17-rule-lint-and-typecheck.md)
// and denies the commit if any of them fails: npm run lint, typecheck, format:check, test
// (each only when the script exists in package.json).

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GIT_COMMIT_PATTERN = /(^|[;&|]|\s)git\s+commit\b/;

function allow() {
  process.exit(0);
}

function deny(reason) {
  const payload = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  };
  console.log(JSON.stringify(payload));
  process.exit(0);
}

function readPayload() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return null;
  }
}

function isInside(root, dir) {
  const rel = path.relative(root, dir);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function readScripts(root) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    return pkg.scripts || {};
  } catch {
    return null;
  }
}

function tail(text, maxLines) {
  return (text || '').split(/\r?\n/).filter(Boolean).slice(-maxLines).join('\n');
}

function main() {
  const payload = readPayload();
  if (!payload) return allow();

  const command = payload.tool_input && payload.tool_input.command;
  if (payload.tool_name !== 'Bash' || typeof command !== 'string' || !GIT_COMMIT_PATTERN.test(command)) {
    return allow();
  }

  const root = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..');
  const cwd = payload.cwd || process.cwd();
  if (!isInside(root, cwd)) return allow();

  const scripts = readScripts(root);
  if (!scripts) return allow();

  // The same npm scripts a developer runs (rule 17); a missing script is skipped.
  const steps = ['lint', 'typecheck', 'format:check', 'test']
    .filter((name) => typeof scripts[name] === 'string')
    .map((name) => ({ label: `npm run ${name}`, command: `npm run --silent ${name}` }));

  // The shell's default Node may differ from the project's (.nvmrc) — switch via nvm when available.
  const nvmScript = path.join(process.env.NVM_DIR || path.join(os.homedir(), '.nvm'), 'nvm.sh');
  const useProjectNode = fs.existsSync(path.join(root, '.nvmrc')) && fs.existsSync(nvmScript)
    ? `. "${nvmScript}" && nvm use >/dev/null && `
    : '';

  for (const step of steps) {
    const result = spawnSync(useProjectNode + step.command, { cwd: root, shell: '/bin/bash', encoding: 'utf8', env: { ...process.env, CI: '1' } });
    if (result.status !== 0) {
      return deny(`"${step.label}" failed — commit blocked.\n${tail(result.stdout + result.stderr, 25)}`);
    }
  }

  return allow();
}

main();
