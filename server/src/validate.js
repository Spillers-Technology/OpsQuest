export const PRIORITIES = ['P1', 'P2', 'P3', 'P4'];
export const CATEGORIES = ['networking', 'security', 'printers', 'email', 'hardware', 'change-mgmt', 'comms', 'backup', 'escalation', 'onboarding'];
export const LENGTHS = ['short', 'medium', 'long'];
export const QUALITIES = ['best', 'ok', 'bad'];
export const LENGTH_NODES = { short: [2, 4], medium: [5, 8], long: [9, 14] };

export function validateScenario(sc, label = 'scenario') {
  const errors = [];
  const warnings = [];
  const err = (where, message) => errors.push(`${where}: ${message}`);
  const warn = (where, message) => warnings.push(`${where}: ${message}`);

  if (!sc || typeof sc !== 'object' || Array.isArray(sc)) return { errors: [`${label}: body must be a JSON object`], warnings };
  if (sc.schema !== 2) err(label, `schema must be 2 (got ${sc.schema})`);
  if (typeof sc.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sc.id)) err(label, 'id must be kebab-case');
  if (typeof sc.ticket !== 'string' || !/^TKT-\d{4}$/.test(sc.ticket)) err(label, `ticket must be TKT-#### (got ${sc.ticket})`);
  for (const key of ['title', 'hardTitle', 'client', 'blurb']) {
    if (typeof sc[key] !== 'string' || !sc[key].trim()) err(label, `missing/empty ${key}`);
  }
  if ('maxScore' in sc) err(label, 'maxScore must NOT be authored (it is computed)');
  if (!PRIORITIES.includes(sc.priority)) err(label, `priority must be one of ${PRIORITIES.join(', ')}`);
  if (!CATEGORIES.includes(sc.category)) err(label, `category must be one of: ${CATEGORIES.join(', ')}`);
  if (!LENGTHS.includes(sc.length)) err(label, `length must be one of ${LENGTHS.join(', ')}`);
  if (!sc.nodes || typeof sc.nodes !== 'object' || Array.isArray(sc.nodes)) {
    err(label, 'missing nodes');
    return { errors, warnings };
  }
  if (!sc.nodes[sc.start]) {
    err(label, `start node "${sc.start}" not found`);
    return { errors, warnings };
  }

  const nodeIds = Object.keys(sc.nodes);
  let choiceNodes = 0;
  let endNodes = 0;
  let funnel = true;

  for (const [nodeId, node] of Object.entries(sc.nodes)) {
    const at = `${label} [${nodeId}]`;
    if (!node || typeof node !== 'object' || Array.isArray(node)) { err(at, 'node must be an object'); continue; }
    if (typeof node.text !== 'string' || !node.text.trim()) err(at, 'missing/empty text');
    if (node.end === true) {
      endNodes++;
      if ('choices' in node) err(at, 'end node must not have choices');
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
    node.choices.forEach((choice, index) => {
      const cat = `${at} choice ${index}`;
      if (!choice || typeof choice !== 'object') { err(cat, 'choice must be an object'); return; }
      if (typeof choice.label !== 'string' || !choice.label.trim()) err(cat, 'missing label');
      if (typeof choice.next !== 'string' || !sc.nodes[choice.next]) err(cat, `next "${choice.next}" does not exist`);
      if (!Number.isInteger(choice.tech) || !Number.isInteger(choice.people)) err(cat, 'tech/people must be integers');
      if (!QUALITIES.includes(choice.quality)) err(cat, `quality must be one of ${QUALITIES.join(', ')}`);
      if (typeof choice.feedback !== 'string' || !choice.feedback.trim()) err(cat, 'missing feedback');
      if (choice.quality === 'best') bests++;
      if (typeof choice.next === 'string') nexts.add(choice.next);
    });
    if (bests !== 1) err(at, `must have exactly one "best" choice (got ${bests})`);
    if (nexts.size > 1) funnel = false;
  }

  if (endNodes === 0) err(label, 'no end node');

  const reached = new Set();
  const stack = [sc.start];
  while (stack.length) {
    const id = stack.pop();
    if (reached.has(id) || !sc.nodes[id]) continue;
    reached.add(id);
    for (const choice of sc.nodes[id].choices || []) if (choice?.next) stack.push(choice.next);
  }
  for (const nodeId of nodeIds) if (!reached.has(nodeId)) warn(label, `node "${nodeId}" is unreachable from start`);

  const canReachEnd = new Set(nodeIds.filter((id) => sc.nodes[id]?.end === true));
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of nodeIds) {
      if (canReachEnd.has(id)) continue;
      const choices = sc.nodes[id]?.choices;
      if (Array.isArray(choices) && choices.some((choice) => canReachEnd.has(choice?.next))) {
        canReachEnd.add(id); changed = true;
      }
    }
  }
  for (const id of reached) {
    if (!canReachEnd.has(id)) err(`${label} [${id}]`, 'no path from this reachable node reaches an end (dead cycle or dead graph)');
  }
  // A single escapable cycle still permits an infinite authored path. Reject every cycle reachable from start.
  const color = new Map();
  const visit = (id) => {
    if (!reached.has(id) || sc.nodes[id]?.end) return;
    if (color.get(id) === 1) { err(`${label} [${id}]`, 'reachable cycle allows a path that never reaches an end'); return; }
    if (color.get(id) === 2) return;
    color.set(id, 1);
    for (const choice of sc.nodes[id]?.choices || []) if (sc.nodes[choice?.next]) visit(choice.next);
    color.set(id, 2);
  };
  visit(sc.start);

  if (funnel) warn(label, `pure funnel (every choice leads to the same next node everywhere)${sc.linear === true ? ' — marked linear' : ''}`);
  const [lo, hi] = LENGTH_NODES[sc.length] || [0, Infinity];
  if (choiceNodes < lo || choiceNodes > hi) warn(label, `${choiceNodes} choice nodes is outside the "${sc.length}" range ${lo}-${hi}`);
  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

export function findDuplicateTicket(sc, scenarios) {
  const match = scenarios.find((other) => other.id !== sc.id && other.ticket === sc.ticket);
  return match ? `scenario: duplicate ticket ${sc.ticket} (also used by ${match.id})` : null;
}
