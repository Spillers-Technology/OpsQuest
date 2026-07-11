import AsyncStorage from '@react-native-async-storage/async-storage';
import { isPlayableScenario, withMaxScore } from './scenarioUtils';

// Optional content server sync. The bundled JSON set is always the floor;
// anything fetched from the server is cached and merged on top (by id).
// No accounts, no tokens — set the URL and forget.

const CACHE_KEY = 'opsquest.remoteScenarios.v1';

export async function getCachedRemote() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter(isPlayableScenario) : [];
  } catch {
    return [];
  }
}

// Fetch /v1/scenarios from the configured server. Returns
// { ok: true, count } or { ok: false, error } — never throws.
export async function syncRemote(baseUrl) {
  const url = `${String(baseUrl).replace(/\/+$/, '')}/v1/scenarios`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return { ok: false, error: `server said ${res.status}` };
    const list = await res.json();
    if (!Array.isArray(list)) return { ok: false, error: 'unexpected response shape' };
    const playable = list.filter(isPlayableScenario);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(playable));
    return { ok: true, count: playable.length };
  } catch (e) {
    return { ok: false, error: e.name === 'AbortError' ? 'timed out' : 'unreachable' };
  } finally {
    clearTimeout(timer);
  }
}

// Bundled + remote, remote wins on id collisions. Remote scenarios get their
// maxScore computed here, same as bundled ones do at require-time.
export function mergeScenarios(bundled, remote) {
  const byId = new Map(bundled.map((s) => [s.id, s]));
  for (const sc of remote) byId.set(sc.id, withMaxScore(sc));
  return [...byId.values()];
}
