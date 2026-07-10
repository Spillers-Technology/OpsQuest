# OPS QUEST — Handoff Brief for Claude Code

## What this is
A choose-your-own-adventure mobile game (React Native / Expo) that trains MSP help desk skills the Duolingo way: bite-sized sessions, streaks, XP, and branching IT scenarios that test **both technical judgment and people skills**. Built by a help desk lead to share hard-won experience with their team and future hires in a playful format.

## Core design thesis (already decided — do not re-litigate)
The entire game is themed as a **ticket queue**:
- Scenarios = support tickets with priority stripes (P1 red / P2 amber / P3 blue)
- Player choices get logged as "ticket notes"
- Dual scoring on every choice: **Tech** points (cyan) and **People** points (violet) — because the right technical answer delivered badly is still a failed ticket. This dual-track scoring is the game's signature mechanic.
- Aesthetic: "NOC dashboard at 2am" — deep navy, status-light colors, monospace ticket IDs
- No react-navigation; use simple state-based screen switching to keep the dependency tree tiny and the one-shot runnable

## Current state — files already written
```
ops-quest/
├── package.json          ✅ Expo SDK 53, RN 0.79.5, react 19, AsyncStorage 2.1.2 (minimal deps, intentional)
├── app.json              ✅ dark UI, navy splash, com.opsquest.app
├── babel.config.js       ✅
└── src/
    └── theme.js          ✅ full design tokens (colors, priority map, mono font, radius/pad)
```

## Files still to build (M0 scope — tonight)
```
App.js                        # root: load profile, update streak on open, state-based nav (home | scenario | bites | debrief)
src/storage.js                # AsyncStorage: getProfile/saveProfile; streak logic: same day = no-op, yesterday = +1, else reset to 1
src/data/scenarios.js         # node-graph format (schema below)
src/data/bites.js             # quiz decks (schema below)
src/screens/HomeScreen.js     # streak flame + count, XP/level, ticket queue (scenario cards w/ priority stripe), bites section
src/screens/ScenarioScreen.js # plays nodes, feedback rendered as "ticket note" after each choice, running Tech/People tally
src/screens/DebriefScreen.js  # end-of-ticket score, rank title, XP award, replay/back
src/screens/BitesScreen.js    # 5-question quiz, immediate feedback + explanation, XP
```

## Data schemas (decided)
**Scenario** — node graph:
```js
{
  id: 'printer-dunmore',
  title: 'Printer Down at Dunmore & Vance',
  priority: 'P2',              // P1 | P2 | P3
  client: 'Dunmore & Vance LLP',
  start: 'n1',
  nodes: {
    n1: {
      text: 'Situation prose...',
      choices: [
        { label: 'What you say/do', next: 'n2',
          tech: 0, people: 2,          // points, can be negative
          quality: 'best',             // best | ok | bad → feedback tint green/amber/red
          feedback: 'Why this matters — the teaching line.' }
      ]
    },
    // end nodes: { text, end: true }
  }
}
```
**Bite deck**: `{ id, title, questions: [{ q, options: [..], answer: idx, why }] }`

## M0 content to write (2 scenarios, ~5–7 nodes, 3 choices each)
1. **"Everything Is Down"** (P1, clinic) — triage order: one user vs site vs service? Check RMM/monitoring, ISP vs internal, UPS/power question, comms cadence, when to escalate to L2, post-incident notes.
2. **"The Password Loop"** (P3, people-heavy) — third lockout call this week, frustrated user. Verify identity BEFORE reset (security beat), root cause hunt (expired policy? cached creds on phone?), turning repeat caller into happy user, suggest MFA/SSPR.

M1 adds: "Printer Down at Dunmore & Vance" (P2, angry partner, empathy-first vs jump-to-tech, spooler vs switch), "The CEO Email" (P1 phishing/gift-card fraud: don't click, scope check, block/report, educate without shaming).

Bite decks (M1): Networking First Steps (ping/DNS/DHCP/ipconfig), Ticket Craft (documentation, SLA, escalation etiquette), Security Basics (phishing tells, MFA, least privilege).

## Progression (decided)
- XP: choices award points; debrief converts to XP. Level every 100 XP.
- Level titles: Intern → L1 Tech → L2 Tech → Escalations → Team Lead → vCIO
- Debrief ranks by combined score: "Senior Tech material" / "Solid L1" / "Review the runbook"
- Streak: flame + count in home header; updates on app open.

## Roadmap (agreed with owner)
- **M0 (tonight)**: playable core, 2 scenarios, streak+XP local. Success = start-to-finish on phone via Expo Go. ✅ shipped as 0.0.1/0.0.2
- **M1 (wk 1)**: 5–6 scenarios, 3 bite decks, debrief ranks, daily-first-ticket bonus, "this scenario felt wrong" feedback button. Share with 2–3 teammates. — mostly done: 4 scenarios (everything-down, password-loop, printer-dunmore, ceo-email), 3 decks, ranks, daily bonus, feedback mailto button. Remaining: 1–2 more scenarios, teammate share.
- **M2 (wks 2–3)**: daily quest (1 random ticket + 1 deck), XP tuning, **documented JSON authoring format so the owner writes content without code** (the real unlock), shareable results card, streak-warning push (Expo Notifications).
- **M3 (wks 4–6)**: Supabase backend — accounts, shared leaderboard, streak sync, weekly challenge ticket, 12–15 scenarios w/ difficulty tiers, choice analytics (doubles as training-gap report).
- **M4 (mo 2+)**: v1.0 via EAS Build internal distribution (TestFlight/APK), scenario every 2 wks from anonymized real tickets. Stretch: AI dynamic follow-ups / free-text "angry client" mode.

## Guardrails (owner-agreed)
- Content > features. New scenarios beat new mechanics.
- No backend before M3 — local-only keeps M0 shippable tonight.
- Anonymize any real-ticket material before it becomes content.
- Keep deps minimal; resist adding react-navigation unless M2+ genuinely needs it.

## Run
```
npm install && npx expo start   # scan QR with Expo Go
```
