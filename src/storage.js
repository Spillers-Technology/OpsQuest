import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'opsquest.profile.v1';

const DEFAULT_PROFILE = {
  xp: 0,
  streak: 0,
  lastOpen: null, // 'YYYY-MM-DD', local time
  completed: {},  // scenarioId -> best combined score
};

function normalizeProfile(value) {
  const profile = value && typeof value === 'object' ? value : {};
  return {
    ...DEFAULT_PROFILE,
    ...profile,
    xp: Number.isFinite(profile.xp) ? profile.xp : DEFAULT_PROFILE.xp,
    streak: Number.isFinite(profile.streak) ? profile.streak : DEFAULT_PROFILE.streak,
    lastOpen: typeof profile.lastOpen === 'string' ? profile.lastOpen : DEFAULT_PROFILE.lastOpen,
    completed:
      profile.completed && typeof profile.completed === 'object' && !Array.isArray(profile.completed)
        ? profile.completed
        : DEFAULT_PROFILE.completed,
  };
}

export async function getProfile() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return normalizeProfile(raw ? JSON.parse(raw) : null);
  } catch (e) {
    return { ...DEFAULT_PROFILE };
  }
}

export async function saveProfile(profile) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(profile));
  } catch (e) {
    // local-only app: a failed save just means the next open starts a hair behind
  }
}

function dayString(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// Same day = no-op, yesterday = +1, anything else = reset to 1.
export function applyStreak(profile, now = new Date()) {
  profile = normalizeProfile(profile);
  const today = dayString(now);
  if (profile.lastOpen === today) return profile;
  const yesterday = dayString(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const streak = profile.lastOpen === yesterday ? profile.streak + 1 : 1;
  return { ...profile, streak, lastOpen: today };
}

export const LEVEL_TITLES = ['Intern', 'L1 Tech', 'L2 Tech', 'Escalations', 'Team Lead', 'vCIO'];
export const XP_PER_LEVEL = 100;

export function levelInfo(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL);
  return {
    level: level + 1,
    title: LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)],
    intoLevel: xp % XP_PER_LEVEL,
    toNext: XP_PER_LEVEL,
  };
}
