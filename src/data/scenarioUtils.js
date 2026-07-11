// Shared scenario helpers. maxScore is computed from the graph, never authored —
// best combined (tech+people) total over any start→end path.
// (scripts/validate-content.js keeps a plain-CommonJS copy of this walk.)

export function computeMaxScore(scenario) {
  const memo = {};
  const visiting = new Set();
  const walk = (nodeId) => {
    const node = scenario.nodes[nodeId];
    if (!node) return -Infinity;
    if (node.end) return 0;
    if (nodeId in memo) return memo[nodeId];
    if (visiting.has(nodeId)) return -Infinity; // cycle guard
    visiting.add(nodeId);
    let best = -Infinity;
    for (const c of node.choices ?? []) {
      const rest = walk(c.next);
      if (rest > -Infinity) best = Math.max(best, c.tech + c.people + rest);
    }
    visiting.delete(nodeId);
    memo[nodeId] = best;
    return best;
  };
  const score = walk(scenario.start);
  return score > -Infinity ? score : 0;
}

export function withMaxScore(scenario) {
  return { ...scenario, maxScore: computeMaxScore(scenario) };
}

// Light structural check for scenarios arriving from a remote server —
// enough to guarantee the ScenarioScreen engine can't crash on it.
export function isPlayableScenario(sc) {
  if (!sc || typeof sc !== 'object') return false;
  if (typeof sc.id !== 'string' || typeof sc.title !== 'string') return false;
  if (!sc.nodes || typeof sc.nodes !== 'object') return false;
  const node = sc.nodes[sc.start];
  if (!node) return false;
  for (const n of Object.values(sc.nodes)) {
    if (typeof n.text !== 'string') return false;
    if (n.end) continue;
    if (!Array.isArray(n.choices) || n.choices.length === 0) return false;
    for (const c of n.choices) {
      if (typeof c.label !== 'string' || !sc.nodes[c.next]) return false;
      if (!Number.isFinite(c.tech) || !Number.isFinite(c.people)) return false;
    }
  }
  return true;
}
