import { Platform } from 'react-native';

// Ops Quest design tokens — "NOC dashboard at 2am" palette.
// Everything on screen is a ticket, a status light, or a log line.
export const C = {
  bg: '#0B1220',        // deep navy — the room the monitors live in
  panel: '#131C2E',     // card / ticket surface
  panelHi: '#1B2740',   // raised surface, pressed states
  line: '#243352',      // hairline borders
  text: '#E6EDF7',      // primary text
  dim: '#8DA0BF',       // secondary text
  faint: '#5A6B8C',     // metadata, ticket IDs

  green: '#4ADE80',     // healthy / correct / streak
  amber: '#FBBF24',     // warning / P2 / partial credit
  red: '#F87171',       // P1 / wrong answer
  blue: '#60A5FA',      // P3 / info / links
  violet: '#A78BFA',    // people-skill accent
  cyan: '#22D3EE',      // tech-skill accent
};

export const PRIORITY = {
  P1: { color: C.red, label: 'P1 · CRITICAL' },
  P2: { color: C.amber, label: 'P2 · HIGH' },
  P3: { color: C.blue, label: 'P3 · NORMAL' },
};

export const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export const S = {
  radius: 14,
  pad: 16,
};
