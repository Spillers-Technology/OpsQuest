# OpsQuest Scenario Authoring Guide (schema v2)

Scenarios are plain JSON — no code required. One file per scenario in
`src/data/scenarios/`, registered with one line in `src/data/scenarios/index.js`.
Run `npm run validate` after writing; it catches every structural mistake and
computes the score ceiling for you.

## The game in one paragraph

The player is an MSP help-desk tech working a ticket queue. Every scenario is a
ticket; every choice is something you'd actually say or do; every choice scores
**Tech** (technical judgment, cyan) and **People** (client handling, violet) —
because the right fix delivered badly is still a failed ticket. The teaching
happens in the `feedback` line after each choice. Aesthetic: "NOC dashboard at
2am" — terse, real, a little dry-funny. Never corporate-brochure voice.

## File format

```json
{
  "id": "printer-dunmore",
  "schema": 2,
  "ticket": "TKT-3107",
  "title": "Printer Down at Dunmore & Vance",
  "hardTitle": "RE: RE: FW: printer???",
  "priority": "P2",
  "category": "printers",
  "length": "short",
  "client": "Dunmore & Vance LLP",
  "blurb": "Senior partner can't print, court filing at 3pm.",
  "hardBlurb": "the printer thing is happening again. someone needs to call janet ASAP",
  "start": "n1",
  "nodes": {
    "n1": {
      "text": "Situation prose. Second person, present tense. Quote the client verbatim when they speak.",
      "hint": "Easy-mode nudge. REQUIRED on every node that has choices.",
      "choices": [
        {
          "label": "\"What you actually say\" or what you actually do.",
          "hint": "Optional per-choice easy-mode hint.",
          "next": "n2",
          "tech": 2,
          "people": 1,
          "quality": "best",
          "feedback": "The teaching line: WHY this was the right/wrong call."
        }
      ]
    },
    "end_good": { "text": "How the ticket closes. No choices.", "end": true }
  }
}
```

### Field rules

| Field | Rules |
|---|---|
| `id` | kebab-case, unique across all scenarios, matches the filename (`<id>.json`) |
| `schema` | always `2` |
| `ticket` | `TKT-` + 4 digits, unique across all scenarios |
| `title` | Clean, descriptive. What a *good* dispatcher would title it. |
| `hardTitle` | What the ticket ACTUALLY looks like: raw user-submitted subject. "HELP, JOHN", "RE: RE: FW: printer???", "URGENT!!! (not urgent)", "phones". Shown in Real Tech mode. |
| `priority` | `P1` critical / `P2` high / `P3` normal / `P4` routine change-management & judgment calls |
| `category` | one of: `networking` `security` `printers` `email` `hardware` `change-mgmt` `comms` `backup` `escalation` `onboarding` |
| `length` | `short` = 3–4 choice nodes · `medium` = 5–7 · `long` = 9–12 |
| `blurb` | One punchy line for the queue card (easy mode). |
| `hardBlurb` | Optional. The raw text the user typed. Falls back to `blurb`. |
| `hint` (node) | Required on every choice node. See "Hints" below. |
| `hint` (choice) | Optional; use sparingly on genuinely tricky choices. |
| `tech` / `people` | Integers, usually −2..+3. Negatives are allowed and encouraged for bad calls. |
| `quality` | `best` (the pro move) / `ok` (defensible but suboptimal) / `bad` (teachable mistake). Exactly one `best` per node. |
| `feedback` | 1–3 sentences. The most important text in the game — the hard-won lesson. Always explain the WHY, never just "correct!". |
| `maxScore` | **Do not author it.** Computed from the graph by the loader/validator. |

## BRANCHING — the whole point

Choices must have **consequences**, not just scores. This is the #1 tester
complaint we are fixing: the old scenarios were funnels (every choice led to
the same next node). Rules:

- `medium` and `long` scenarios MUST have at least two genuinely divergent
  paths — different nodes the player only sees on that path — and should have
  2–3 distinct endings (e.g. `end_clean`, `end_messy`, `end_escalated`).
  The validator rejects pure funnels at these lengths.
- Bad choices should *cost time or trust in the story*, not just points: the
  client gets angrier, the outage spreads, you burn 20 minutes on the wrong
  box — and the path reflects it. A bad early call can lock you into the messy
  ending.
- `short` scenarios may converge more, but even one branch beat helps.
- Dead ends are fine as story (the `end` node says how it went); every path
  must reach SOME end node.

## Hints (easy mode / "Assisted")

A hint makes the decision *easier to reason about* — it is NOT the answer.
Good hint: "Think about blast radius: who else might be affected before you
touch anything?" Bad hint: "Pick the first option." Frame the mental model a
senior tech would use: scope-first, verify-identity-before-reset, empathy
before diagnostics, change windows, blast radius, rollback plans.

## Real Tech mode (hard)

Hard mode hides categories and hints and shows `hardTitle` / `hardBlurb` —
tickets look like they actually arrive: vague, misrouted, mistyped, wrong
contact attached, three forwards deep. Write `hardTitle` for every scenario.
Long/hard scenarios can bake realistic confusion into the STORY too: the
ticket's contact card is the wrong person, the user reports the wrong thing
("email is down" = one bounced message), the site name is stale after an
office move.

## Voice & content rules

- Second person, present tense. Client dialogue in quotes, verbatim tone.
- Real MSP texture: RMM dashboards, patch windows, spooler services, M365
  admin center, UPS beeping, ISP hold music, change-approval boards.
- Both skill tracks in every scenario: at least one node where the *people*
  call matters more than the tech call.
- P4 scenarios are judgment calls, not emergencies: "is this change safe to
  make right now, for THIS kind of client?" (e.g. firewall firmware midday is
  fine for a 10-seat SMB on a wire, reckless for an enterprise where security
  signatures and change control matter).
- Anonymize: no real client names, no real people, invented company names.
- Feedback lines teach; they never shame. Wry is fine, mean is not.

## Checklist before you're done

1. File is `src/data/scenarios/<id>.json`, `id` matches.
2. Every choice node has a `hint`; every node reaches an end.
3. Exactly one `best` choice per node; scores make sense (best path should
   feel earned, not maxed by accident).
4. `hardTitle` written. Branching rules met for the length tier.
5. Added one `require` line to `src/data/scenarios/index.js`.
6. `npm run validate` passes.
