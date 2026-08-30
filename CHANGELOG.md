# Changelog

All notable changes to OpsQuest are documented in this file. Versions and
dates below are reconstructed from git tags and commit history
(`git log`, `git tag`); this file starts from that history rather than a
running log kept during development, so early entries are coarser than
later ones will be.

The project uses the version name in `package.json` / `app.json`
(`0.1.0`, Android version code `6`), tagged in git as `v0.1.0`.

## [Unreleased]

- Internal documentation upkeep: refreshed `HANDOFF.md` to match the
  shipped 0.1.0 state and marked an obsolete backend guardrail note as
  historical (2026-08-23).

## [0.1.0] - 2026-07-11

- Added a contributor on-ramp (`CONTRIBUTING.md`) and a screenshot
  lightbox for the docs/website.
- First release described as feature-complete for the initial content
  wave: 20 branching scenarios across 10 categories and four priority
  tiers, a daily-rotating ticket queue, Assisted and Real Tech difficulty
  modes, dual Tech/People scoring, animated ticket play and debrief,
  Skill Bite quiz decks, XP/streaks/daily bonus, local-first/server-optional
  play, and JSON scenario authoring with a validator.

## [0.0.5] - 2026-07-10

- Fixed Android status-bar overlap and touch-target sizing issues.
- Refreshed docs and the project website.

## [0.0.4] - 2026-07-10

- Fixed a startup crash on Android by hoisting Expo native modules
  (`expo-asset`, `expo-constants`, `expo-file-system`, `expo-font`,
  `expo-keep-awake`) into direct dependencies — nested-under-expo
  dependencies don't autolink natively and had been crashing the APK on
  launch since 0.0.1.

## [0.0.3] - 2026-07-10

- Added the first wave-1 scenario content and core game mechanics.
- Hardened Android startup.
- Added the project website.
- Note: no `v0.0.2` was tagged; the Android startup-hardening work
  referenced as "for 0.0.2" in commit history shipped as part of this
  release instead.

## [0.0.1] - 2026-07-09

- Initial MVP release: project scaffold and core playable loop.
