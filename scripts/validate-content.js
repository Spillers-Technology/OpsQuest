#!/usr/bin/env node
// Content validator for OpsQuest scenario JSON (schema v2). Plain node, no deps.
// Usage: npm run validate   (exit 1 on any error; warnings don't fail the run)

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'src', 'data', 'scenarios');
const INDEX = path.join(DIR, 'index.js');

const PRIORITIES = ['P1', 'P2', 'P3', 'P4'];
const CATEGORIES = [
  'networking', 'security', 'printers', 'email', 'hardware',
  'change-mgmt', 'comms', 'backup', 'escalation', 'onboarding',
];
const LENGTHS = ['short', 'medium', 'long'];
const QUALITIES = ['best', 'ok', 'bad'];
// choice-node count expectations per length tier (branching inflates totals,
// so ranges are a bit wider than per-path depth)
const LENGTH_NODES = { short: [2, 5], medium: [5, 9], long: [9, 15] };

const errors = [];
const warnings = [];
const err = (f, msg) => errors.push(`${f}: ${msg}`);
const warn = (f, msg) => warnings.push(`${f}: ${msg}`);

// CommonJS copy of src/data/scenarioUtils.js computeMaxScore (keep in sync)
function computeMaxScore(sc) {
  const memo = {};
  const visiting = new Set();
  const walk = (id) => {
    const node = sc.nodes[id];
    if (!node) return -Infinity;
    if (node.end) return 0;
    if (id in memo) return memo[id];
    if (visiting.has(id)) return -Infinity;
    visiting.add(id);
    let best = -Infinity;
    for (const c of node.choices ?? []) {
      const rest = walk(c.next);
      if (rest > -Infinity) best = Math.max(best, c.tech + c.people + rest);
    }
    visiting.delete(id);
    memo[id] = best;
    return best;
  };
  return walk(sc.start);
}

function validateScenario(file, sc) {
  const f = path.basename(file);

  // Top-level fields
  if (sc.schema !== 2) err(f, `schema must be 2 (got ${sc.schema})`);
  if (typeof sc.id !== 'string' || !/^[a-z0-9-]+$/.test(sc.id)) err(f, 'id must be kebab-case');
  if (sc.id && f !== `${sc.id}.json`) err(f, `filename must match id (${sc.id}.json)`);
  if (typeof sc.ticket !== 'string' || !/^TKT-\d{4}$/.test(sc.ticket)) err(f, `ticket must be TKT-#### (got ${sc.ticket})`);
  for (const k of ['title', 'hardTitle', 'client', 'blurb']) {
    if (typeof sc[k] !== 'string' || !sc[k].trim()) err(f, `missing/empty ${k}`);
  }
  if ('maxScore' in sc) err(f, 'maxScore must NOT be authored (it is computed)');
  if (!PRIORITIES.includes(sc.priority)) err(f, `priority must be one of ${PRIORITIES}`);
  if (!CATEGORIES.includes(sc.category)) err(f, `category must be one of: ${CATEGORIES.join(', ')}`);
  if (!LENGTHS.includes(sc.length)) err(f, `length must be one of ${LENGTHS}`);
  if (!sc.nodes || typeof sc.nodes !== 'object') return err(f, 'missing nodes');
  if (!sc.nodes[sc.start]) return err(f, `start node "${sc.start}" not found`);

  const nodeIds = Object.keys(sc.nodes);
  let choiceNodes = 0;
  let endNodes = 0;
  let funnel = true;

  for (const [nid, node] of Object.entries(sc.nodes)) {
    const at = `${f} [${nid}]`;
    if (typeof node.text !== 'string' || !node.text.trim()) err(at, 'missing/empty text');
    if (node.end) {
      endNodes++;
      if (node.choices) err(at, 'end node must not have choices');
      continue;
    }
    choiceNodes++;
    if (typeof node.hint !== 'string' || !node.hint.trim()) err(at, 'choice node missing hint (required for easy mode)');
    if (!Array.isArray(node.choices) || node.choices.length < 2) {
      err(at, 'needs >= 2 choices');
      continue;
    }
    const nexts = new Set();
    let bests = 0;
    for (const [i, c] of node.choices.entries()) {
      const cat = `${at} choice ${i}`;
      if (typeof c.label !== 'string' || !c.label.trim()) err(cat, 'missing label');
      if (!sc.nodes[c.next]) err(cat, `next "${c.next}" does not exist`);
      if (!Number.isInteger(c.tech) || !Number.isInteger(c.people)) err(cat, 'tech/people must be integers');
      if (!QUALITIES.includes(c.quality)) err(cat, `quality must be one of ${QUALITIES}`);
      if (typeof c.feedback !== 'string' || !c.feedback.trim()) err(cat, 'missing feedback');
      if (c.quality === 'best') bests++;
      nexts.add(c.next);
    }
    if (bests !== 1) err(at, `must have exactly one "best" choice (got ${bests})`);
    if (nexts.size > 1) funnel = false;
  }

  if (endNodes === 0) err(f, 'no end node');

  // Reachability + every path must reach an end
  const reached = new Set();
  const stack = [sc.start];
  while (stack.length) {
    const id = stack.pop();
    if (reached.has(id) || !sc.nodes[id]) continue;
    reached.add(id);
    for (const c of sc.nodes[id].choices ?? []) stack.push(c.next);
  }
  for (const nid of nodeIds) {
    if (!reached.has(nid)) warn(f, `node "${nid}" is unreachable from start`);
  }
  const max = computeMaxScore(sc);
  if (max === -Infinity) err(f, 'no path from start reaches an end node (cycle or dead graph)');

  // Branching rules: funnels are the old sin we're stamping out
  if (funnel) {
    const msg = 'pure funnel (every choice leads to the same next node everywhere)';
    if (sc.linear === true) warn(f, `${msg} — allowed because "linear": true (legacy)`);
    else if (sc.length === 'short') warn(f, msg);
    else err(f, `${msg} — medium/long scenarios must branch (or set "linear": true if truly intentional)`);
  }

  // Length tier vs choice-node count
  const [lo, hi] = LENGTH_NODES[sc.length] ?? [0, Infinity];
  if (choiceNodes < lo || choiceNodes > hi) {
    warn(f, `${choiceNodes} choice nodes is outside the "${sc.length}" range ${lo}-${hi}`);
  }

  return { id: sc.id, ticket: sc.ticket, priority: sc.priority, category: sc.category, length: sc.length, choiceNodes, endNodes, maxScore: max, branches: !funnel };
}

// ---- run ----
const files = fs.readdirSync(DIR).filter((x) => x.endsWith('.json')).sort();
if (files.length === 0) { console.error('no scenario JSON files found'); process.exit(1); }

const indexSrc = fs.readFileSync(INDEX, 'utf8');
const indexed = [...indexSrc.matchAll(/require\('\.\/([\w-]+\.json)'\)/g)].map((m) => m[1]);

const seenIds = new Map();
const seenTickets = new Map();
const rows = [];

for (const file of files) {
  let sc;
  try {
    sc = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
  } catch (e) {
    err(file, `invalid JSON: ${e.message}`);
    continue;
  }
  const row = validateScenario(file, sc);
  if (row) rows.push(row);
  if (sc.id) {
    if (seenIds.has(sc.id)) err(file, `duplicate id (also in ${seenIds.get(sc.id)})`);
    seenIds.set(sc.id, file);
  }
  if (sc.ticket) {
    if (seenTickets.has(sc.ticket)) err(file, `duplicate ticket (also in ${seenTickets.get(sc.ticket)})`);
    seenTickets.set(sc.ticket, file);
  }
  if (!indexed.includes(file)) err(file, 'not registered in scenarios/index.js');
}
for (const file of indexed) {
  if (!files.includes(file)) err('index.js', `requires ${file} which does not exist`);
}

if (rows.length) {
  console.log('\n  id                        ticket    pri cat          len     nodes br  max');
  for (const r of rows) {
    console.log(
      `  ${r.id.padEnd(25)} ${r.ticket}  ${r.priority}  ${r.category.padEnd(12)} ${r.length.padEnd(7)} ${String(r.choiceNodes).padStart(2)}+${r.endNodes}e ${r.branches ? ' Y' : ' -'}  ${r.maxScore}`
    );
  }
  console.log(`\n  ${rows.length} scenarios`);
}
for (const w of warnings) console.log(`  WARN  ${w}`);
for (const e of errors) console.log(`  ERROR ${e}`);
console.log(errors.length ? `\n${errors.length} error(s).` : '\nAll content valid.');
process.exit(errors.length ? 1 : 0);
