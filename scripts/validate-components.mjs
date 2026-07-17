#!/usr/bin/env node
/**
 * @file
 * Component schema/Twig consistency validator.
 *
 * Each Single Directory Component declares its props in `<id>.component.yml`
 * and consumes them in `<id>.twig`. The two can silently drift — a prop gets
 * renamed in the schema but not in the template, an example goes missing, a
 * stylesheet is left behind. This script walks every directory under
 * `components/` and asserts, with zero runtime dependencies:
 *
 *   1. `<id>.component.yml`, `<id>.twig` and `<id>.css` all exist, and every
 *      CSS/JS asset in the directory follows the `<id>.*` auto-attach naming
 *      convention Drupal relies on.
 *   2. Every `props.properties` key is referenced at least once in the Twig
 *      (declared-but-unused props are drift).
 *   3. Every root `{{ variable }}` used in the Twig resolves to a declared
 *      prop, a declared slot, a `{% set %}` local, a `{% for %}` loop variable
 *      or a known Twig built-in (undeclared props are drift).
 *   4. Every `required` prop exists in `properties` and — for scalar props —
 *      ships at least one `examples` entry so the schema is self-documenting.
 *
 * Violations are printed one per line as `component:token — reason` and the
 * process exits non-zero when any are found.
 *
 * Usage: `node scripts/validate-components.mjs` (or `npm run validate`).
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const COMPONENTS_DIR = join(ROOT, 'components');

/* ------------------------------------------------------------------ *
 * Minimal, indentation-based YAML subset reader (no dependencies).
 *
 * SDC `.component.yml` files are regular block YAML with 2-space indents:
 * `props:` is a top-level key, `properties:`/`required:` sit one level in,
 * and each prop's attributes sit one level deeper again. We only need to
 * pull out a handful of well-defined fields, so a tiny targeted reader is
 * safer (and lighter) than pulling in a parser.
 * ------------------------------------------------------------------ */

const indentOf = (line) => line.match(/^(\s*)/)[1].length;
const isSkippable = (line) => {
  const t = line.trim();
  return t === '' || t.startsWith('#');
};
const unquote = (value) => value.trim().replace(/^['"]|['"]$/g, '');

/**
 * Find the index of the first line at `indent` whose text matches `keyRe`,
 * searching only within the block owned by `parentIndent` (a line at or below
 * the parent indent ends the block).
 */
function findKeyLine(lines, fromIdx, parentIndent, indent, keyRe) {
  for (let i = fromIdx; i < lines.length; i += 1) {
    const line = lines[i];
    if (isSkippable(line)) continue;
    const ind = indentOf(line);
    if (ind <= parentIndent) return -1;
    if (ind === indent && keyRe.test(line.trim())) return i;
  }
  return -1;
}

/** Collect direct-child mapping keys of the block that opens at `parentIdx`. */
function childKeys(lines, parentIdx) {
  const parentIndent = indentOf(lines[parentIdx]);
  const keys = [];
  let childIndent = null;
  for (let i = parentIdx + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (isSkippable(line)) continue;
    const ind = indentOf(line);
    if (ind <= parentIndent) break;
    if (childIndent === null) childIndent = ind;
    if (ind !== childIndent) continue;
    const m = line.trim().match(/^([\w-]+):/);
    if (m) keys.push(m[1]);
  }
  return keys;
}

/** Collect direct-child sequence items (`- value`) of the block at `parentIdx`. */
function childList(lines, parentIdx) {
  const parentIndent = indentOf(lines[parentIdx]);
  const items = [];
  let childIndent = null;
  for (let i = parentIdx + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (isSkippable(line)) continue;
    const ind = indentOf(line);
    if (ind <= parentIndent) break;
    if (childIndent === null) childIndent = ind;
    if (ind !== childIndent) continue;
    const m = line.trim().match(/^-\s*(.+)$/);
    if (m) items.push(unquote(m[1]));
  }
  return items;
}

/**
 * Parse the parts of a `.component.yml` this validator cares about:
 * { propKeys: string[], required: string[], slots: string[],
 *   propMeta: { [name]: { type: string|null, hasExamples: boolean } } }
 */
function readSchema(src) {
  const lines = src.split(/\r?\n/);

  // Locate `props:` (top level) and its `properties:` / `required:` children.
  const propsIdx = findKeyLine(lines, 0, -1, 0, /^props:/);
  let propKeys = [];
  let required = [];
  const propMeta = {};

  if (propsIdx !== -1) {
    const propsIndent = indentOf(lines[propsIdx]); // 0
    const propertiesIdx = findKeyLine(lines, propsIdx + 1, propsIndent, propsIndent + 2, /^properties:/);
    const requiredIdx = findKeyLine(lines, propsIdx + 1, propsIndent, propsIndent + 2, /^required:/);

    if (requiredIdx !== -1) required = childList(lines, requiredIdx);

    if (propertiesIdx !== -1) {
      propKeys = childKeys(lines, propertiesIdx);
      const propIndent = propsIndent + 4;
      // For each prop key, scan its own sub-block for `type:` and `examples:`.
      for (let i = propertiesIdx + 1; i < lines.length; i += 1) {
        const line = lines[i];
        if (isSkippable(line)) continue;
        const ind = indentOf(line);
        if (ind <= propsIndent + 2) break; // left the properties block
        if (ind !== propIndent) continue;
        const keyMatch = line.trim().match(/^([\w-]+):/);
        if (!keyMatch) continue;
        const name = keyMatch[1];
        let type = null;
        let hasExamples = false;
        for (let j = i + 1; j < lines.length; j += 1) {
          const sub = lines[j];
          if (isSkippable(sub)) continue;
          const subInd = indentOf(sub);
          if (subInd <= propIndent) break; // next prop / end of block
          if (subInd !== propIndent + 2) continue;
          const t = sub.trim();
          const typeMatch = t.match(/^type:\s*(\S.*)$/);
          if (typeMatch) type = unquote(typeMatch[1]);
          if (/^examples:/.test(t)) hasExamples = true;
        }
        propMeta[name] = { type, hasExamples };
      }
    }
  }

  // Top-level `slots:` keys.
  const slotsIdx = findKeyLine(lines, 0, -1, 0, /^slots:/);
  const slots = slotsIdx !== -1 ? childKeys(lines, slotsIdx) : [];

  return { propKeys, required, slots, propMeta };
}

/* ------------------------------------------------------------------ *
 * Twig analysis.
 * ------------------------------------------------------------------ */

const TWIG_KEYWORDS = new Set([
  'true',
  'false',
  'null',
  'none',
  'and',
  'or',
  'not',
  'in',
  'is',
  'as',
  'matches',
  'starts',
  'ends',
]);

/**
 * Extract the local variable names a template introduces itself:
 * `{% set x = ... %}` locals and `{% for x[, y] in ... %}` loop variables
 * (plus the implicit `loop` object).
 */
function twigLocals(twig) {
  const locals = new Set(['loop', 'attributes']);
  for (const m of twig.matchAll(/\{%-?\s*set\s+([a-zA-Z_]\w*)/g)) locals.add(m[1]);
  for (const m of twig.matchAll(/\{%-?\s*for\s+([a-zA-Z_]\w*)\s*(?:,\s*([a-zA-Z_]\w*))?\s+in\b/g)) {
    locals.add(m[1]);
    if (m[2]) locals.add(m[2]);
  }
  return locals;
}

/**
 * Extract the root variables referenced inside `{{ ... }}` print statements.
 * The "root" is the leading identifier of an expression, so `item.title`
 * yields `item`, `classes|join(' ')` yields `classes`. Property accesses
 * (`.foo`), filter/function names (`|foo`, `foo(`), string literals and Twig
 * keywords are excluded.
 */
function twigRoots(twig) {
  const roots = new Set();
  for (const m of twig.matchAll(/\{\{-?([\s\S]*?)-?\}\}/g)) {
    // Drop string literals so identifiers inside them are never treated as vars.
    const expr = m[1]
      .replace(/'(?:[^'\\]|\\.)*'/g, ' ')
      .replace(/"(?:[^"\\]|\\.)*"/g, ' ');
    for (const idMatch of expr.matchAll(/[a-zA-Z_]\w*/g)) {
      const name = idMatch[0];
      const start = idMatch.index;
      const prev = start > 0 ? expr[start - 1] : '';
      if (prev === '.' || prev === '|') continue; // property access / filter name
      const rest = expr.slice(start + name.length);
      const nextChar = (rest.match(/^\s*(\S)/) || [])[1] || '';
      if (nextChar === '(') continue; // function / filter call
      if (TWIG_KEYWORDS.has(name)) continue;
      roots.add(name);
    }
  }
  return roots;
}

/* ------------------------------------------------------------------ */

function validateComponent(id, dir) {
  const violations = [];
  const add = (token, reason) => violations.push(`${id}:${token} — ${reason}`);

  const ymlPath = join(dir, `${id}.component.yml`);
  const twigPath = join(dir, `${id}.twig`);
  const cssPath = join(dir, `${id}.css`);

  // 1. Required structural files.
  if (!existsSync(ymlPath)) add(`${id}.component.yml`, 'schema file is missing');
  if (!existsSync(twigPath)) add(`${id}.twig`, 'Twig template is missing');
  if (!existsSync(cssPath)) add(`${id}.css`, 'stylesheet is missing');

  // 1b. Every CSS/JS asset must follow the `<id>.*` auto-attach convention,
  // otherwise Drupal will not pick it up.
  for (const file of readdirSync(dir)) {
    if (/\.(css|js)$/.test(file) && file !== `${id}.css` && file !== `${id}.js`) {
      add(file, `asset does not follow the ${id}.* naming convention (will not auto-attach)`);
    }
  }

  if (!existsSync(ymlPath) || !existsSync(twigPath)) return violations;

  const schema = readSchema(readFileSync(ymlPath, 'utf8'));
  const twig = readFileSync(twigPath, 'utf8');

  // 2. Every declared prop is used somewhere in the Twig.
  for (const prop of schema.propKeys) {
    const re = new RegExp(`\\b${prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    if (!re.test(twig)) add(prop, 'declared in schema but never used in the Twig');
  }

  // 3. Every root variable printed in the Twig is accounted for.
  const known = new Set([...schema.propKeys, ...schema.slots, ...twigLocals(twig)]);
  for (const root of twigRoots(twig)) {
    if (!known.has(root)) add(root, 'used in the Twig but not a declared prop, slot or local');
  }

  // 4. Required props exist and scalar ones carry examples.
  for (const prop of schema.required) {
    const meta = schema.propMeta[prop];
    if (!meta) {
      add(prop, 'listed under required but not declared in properties');
      continue;
    }
    const complex = meta.type === 'array' || meta.type === 'object';
    if (!complex && !meta.hasExamples) {
      add(prop, 'required prop is missing examples');
    }
  }

  return violations;
}

function main() {
  if (!existsSync(COMPONENTS_DIR)) {
    console.error(`components/ directory not found at ${COMPONENTS_DIR}`);
    process.exit(1);
  }

  const dirs = readdirSync(COMPONENTS_DIR)
    .filter((name) => statSync(join(COMPONENTS_DIR, name)).isDirectory())
    .sort();

  const allViolations = [];
  for (const id of dirs) {
    allViolations.push(...validateComponent(id, join(COMPONENTS_DIR, id)));
  }

  if (allViolations.length > 0) {
    console.error(`✖ ${allViolations.length} violation(s) found:\n`);
    for (const v of allViolations) console.error(`  ${v}`);
    console.error('');
    process.exit(1);
  }

  console.log(`✓ ${dirs.length} component(s) valid: ${dirs.join(', ')}`);
}

main();
