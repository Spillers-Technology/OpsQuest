# OPS QUEST — Handoff Brief

## What this is
A choose-your-own-adventure mobile game (React Native / Expo) that trains MSP help desk skills the Duolingo way: bite-sized sessions, streaks, XP, and branching IT scenarios that test **both technical judgment and people skills**. Built by a help desk lead to share hard-won experience with their team and future hires in a playful format.

## Core design thesis (already decided — do not re-litigate)
The entire game is themed as a **ticket queue**:
- Scenarios = support tickets with priority stripes (P1 red / P2 amber / P3 blue)
- Player choices get logged as "ticket notes"
- Dual scoring on every choice: **Tech** points (cyan) and **People** points (violet) — because the right technical answer delivered badly is still a failed ticket. This dual-track scoring is the game's signature mechanic.
- Aesthetic: "NOC dashboard at 2am" — deep navy, status-light colors, monospace ticket IDs
- No react-navigation; use simple state-based screen switching to keep the dependency tree tiny and the one-shot runnable

## Current state (updated 2026-08-24 to match shipped 0.1.0 — this section was stale
since 0.0.5 and undercounted content roughly 5x; see corporate-strategy's
state/products/OpsQuest.md for how that was found)
```
ops-quest/
├── package.json          ✅ Expo SDK 53, RN 0.79.6, react 19, AsyncStorage 2.1.2
│                            ⚠ expo-asset/constants/file-system/font/keep-awake MUST stay
│                            direct dependencies — nested-under-expo deps don't autolink
│                            natively and the APK crashes on launch (bug in 0.0.1–0.0.3)
├── app.json              ✅ dark UI, navy splash, com.opsquest.app, expo-asset/font plugins
├── babel.config.js       ✅
├── App.js                ✅ state-based nav, streak on open, daily first-ticket bonus (+25 XP),
│                            Android status-bar inset at root (RN SafeAreaView is iOS-only!)
└── src/
    ├── theme.js              ✅ design tokens
    ├── storage.js            ✅ profile/streak/lastTicketDay, levelInfo
    ├── data/scenarios/*.json ✅ 20 scenario files (one JSON per scenario, registered in
    │                            data/scenarios/index.js), across the 10-value category enum —
    │                            far past the original "4 scenarios" M1 target
    ├── data/bites.js         ✅ 3 decks: networking-first-steps, ticket-craft, security-basics
    ├── data/queue.js         ✅ daily rotating 8-ticket queue (balanced P1–P4, unplayed-first,
    │                            "pull more" refresh)
    ├── data/remote.js        ✅ optional content-server client (bundled JSON stays the offline
    │                            floor; see server/README.md)
    ├── data/scenarioUtils.js ✅ shared scenario helpers
    └── screens/              ✅ Home, Scenario, Debrief (ranks + feedback mailto), Bites,
                                 DifficultyScreen (Assisted/Real Tech chooser), SettingsScreen
                                 (server URL, difficulty toggle)
```

Not reached: M2's push notifications and M3's Supabase backend/accounts/leaderboard/weekly
challenge — the live `README.md` roadmap (public trial polish, more content, shareable
results, tester feedback) reflects what's actually still planned, not the M2–M4 list below,
which predates the pivot to a content-first, backend-deferred trial. Repo has been dormant
since 2026-07-11 (no tags after v0.1.0) — see `state/products/OpsQuest.md` in
`corporate-strategy` for the current strategic read.

Build/release: APK built in Docker (`reactnativecommunity/react-native-android`; prebuild +
gradlew assembleRelease), then **verified on the local headless emulator before publishing**
(boot AVD, adb install, launch, check pidof + uiautomator dump). Emulator toolchain lives in
gitignored `.tools/`. Releases via `gh release create` with apk + sha256 + metadata.

## Data schemas (schema v2 — see AUTHORING.md, the canonical spec)
**Scenario** — one JSON file per scenario in `src/data/scenarios/`, registered in
`src/data/scenarios/index.js`, validated by `npm run validate`. Key fields beyond v1:
`hardTitle`/`hardBlurb` (Real Tech mode), `category` (10-value enum), `length`
(short/medium/long), `hint` on every choice node (Assisted mode), optional per-choice
`hint`. `maxScore` is COMPUTED from the graph (never authored). Branching is required
for medium/long — the validator rejects pure funnels (legacy files carry `"linear": true`).

**Bite deck**: `{ id, title, questions: [{ q, options: [..], answer: idx, why, hint }] }`

**Difficulty modes**: first-open chooser + settings toggle. Assisted = category chips +
hints; Real Tech = messy user-submitted titles, no hints.

**Home queue**: seeded daily random 8 (balanced P1–P4, unplayed first), "pull more" refresh.

**Content server** (`server/`, optional): Fastify; Postgres via DATABASE_URL else SQLite.
Public no-auth reads (`/v1/scenarios`, `/v1/manifest`, `/health`) consumed by the app via
Settings → server URL (bundled JSON is always the offline floor). Accounts/RBAC/OIDC/SAML
gate only the editor (`/admin`) and writes. See `server/README.md`.

## M0/M1 original content targets (historical — all superseded; kept for design-thesis
context, not as a to-do list. Actual shipped content is the 20-file `data/scenarios/` list
above, which includes all four scenarios named here plus sixteen more.)
1. **"Everything Is Down"** (P1, clinic) — triage order: one user vs site vs service? Check RMM/monitoring, ISP vs internal, UPS/power question, comms cadence, when to escalate to L2, post-incident notes.
2. **"The Password Loop"** (P3, people-heavy) — third lockout call this week, frustrated user. Verify identity BEFORE reset (security beat), root cause hunt (expired policy? cached creds on phone?), turning repeat caller into happy user, suggest MFA/SSPR.

M1 adds: "Printer Down at Dunmore & Vance" (P2, angry partner, empathy-first vs jump-to-tech, spooler vs switch), "The CEO Email" (P1 phishing/gift-card fraud: don't click, scope check, block/report, educate without shaming).

Bite decks (M1, shipped, unchanged since): Networking First Steps (ping/DNS/DHCP/ipconfig), Ticket Craft (documentation, SLA, escalation etiquette), Security Basics (phishing tells, MFA, least privilege).

## Progression (decided)
- XP: choices award points; debrief converts to XP. Level every 100 XP.
- Level titles: Intern → L1 Tech → L2 Tech → Escalations → Team Lead → vCIO
- Debrief ranks by combined score: "Senior Tech material" / "Solid L1" / "Review the runbook"
- Streak: flame + count in home header; updates on app open.

## Roadmap (agreed with owner)
- **M0 (tonight)**: playable core, 2 scenarios, streak+XP local. Success = start-to-finish on phone via Expo Go. ✅ shipped as 0.0.1/0.0.2 (note: those APKs crashed on launch — fixed in 0.0.4)
- **M1 (wk 1)**: 5–6 scenarios, 3 bite decks, debrief ranks, daily-first-ticket bonus, "this scenario felt wrong" feedback button. Share with 2–3 teammates. — shipped and exceeded well past 0.0.5: 20 scenarios (see `data/scenarios/`), 3 decks, ranks, daily bonus, feedback mailto button, difficulty modes, daily rotating queue, optional content server. 0.0.5 also fixed status-bar overlap + touch targets; 0.1.0 (latest tag, 2026-07-11) is the current release.
- **M2 (wks 2–3)**: daily quest (1 random ticket + 1 deck), XP tuning, **documented JSON authoring format so the owner writes content without code** (the real unlock), shareable results card, streak-warning push (Expo Notifications). — **partially done**: the JSON authoring format shipped (`AUTHORING.md`, schema v2, `npm run validate`) and the daily queue exists (8 tickets/day, not 1+1 deck as originally scoped); push notifications not implemented.
- **M3 (wks 4–6)**: Supabase backend — accounts, shared leaderboard, streak sync, weekly challenge ticket, 12–15 scenarios w/ difficulty tiers, choice analytics (doubles as training-gap report). — **not reached**. Difficulty tiers shipped (Assisted/Real Tech) and scenario count (20) exceeds this target, but no backend, accounts, leaderboard, or analytics exist. The live `README.md` roadmap does not mention this milestone — read as deprioritized in favor of content-first work, not merely delayed (see `state/products/OpsQuest.md` in `corporate-strategy`).
- **M4 (mo 2+)**: v1.0 via EAS Build internal distribution (TestFlight/APK), scenario every 2 wks from anonymized real tickets. Stretch: AI dynamic follow-ups / free-text "angry client" mode. — **not reached**. No tags after v0.1.0; repo dormant since 2026-07-11.

## Guardrails (owner-agreed)
- Content > features. New scenarios beat new mechanics.
- No backend before M3 — local-only keeps M0 shippable tonight.
- Anonymize any real-ticket material before it becomes content.
- Keep deps minimal; resist adding react-navigation unless M2+ genuinely needs it.

## Run
```
npm install && npx expo start   # scan QR with Expo Go
```
