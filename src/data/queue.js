// The daily ticket queue: a seeded, balanced random slice of the scenario pool.
// Same seed (queueDay + queueNonce) → same queue, so it's stable all day and
// only changes when the day rolls or the player pulls more tickets.

export const QUEUE_SIZE = 8;

// How many of each priority we aim to show (sums to QUEUE_SIZE).
const TARGET = { P1: 1, P2: 3, P3: 2, P4: 2 };

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PRIORITY_ORDER = { P1: 0, P2: 1, P3: 2, P4: 3 };

export function buildQueue(scenarios, profile) {
  if (scenarios.length <= QUEUE_SIZE) {
    return [...scenarios].sort(
      (a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
    );
  }
  const rng = mulberry32(hashSeed(`${profile.queueDay ?? ''}:${profile.queueNonce ?? 0}`));

  // Per-priority buckets, unplayed ahead of completed, random within each half.
  const buckets = {};
  for (const pri of Object.keys(TARGET)) {
    const pool = shuffle(scenarios.filter((s) => s.priority === pri), rng);
    const unplayed = pool.filter((s) => profile.completed[s.id] == null);
    const played = pool.filter((s) => profile.completed[s.id] != null);
    buckets[pri] = [...unplayed, ...played];
  }

  const picked = [];
  for (const [pri, want] of Object.entries(TARGET)) {
    picked.push(...buckets[pri].splice(0, want));
  }
  // Short buckets (not enough of a priority)? Backfill from whatever is left.
  const leftovers = shuffle(Object.values(buckets).flat(), rng);
  const leftoverUnplayed = leftovers.filter((s) => profile.completed[s.id] == null);
  const leftoverPlayed = leftovers.filter((s) => profile.completed[s.id] != null);
  for (const s of [...leftoverUnplayed, ...leftoverPlayed]) {
    if (picked.length >= QUEUE_SIZE) break;
    picked.push(s);
  }

  // Guarantee at least one long ticket when the pool has one.
  if (!picked.some((s) => s.length === 'long')) {
    const long = leftovers.find((s) => s.length === 'long');
    if (long) {
      const swapIdx = picked.findIndex(
        (s) => s.length === 'short' && s.priority === long.priority
      );
      picked[swapIdx >= 0 ? swapIdx : picked.length - 1] = long;
    }
  }

  return picked.sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
  );
}
