# OpsQuest

**The IT support simulator you want to answer.**

OpsQuest is a bite-sized training game for help desk teams, MSPs, and anyone learning how to handle real support tickets with both technical judgment and people skills.

![OpsQuest product preview](docs/assets/opsquest-hero.png)

[View the landing page](docs/) | [Download the Android APK](https://github.com/Spillers-Technology/OpsQuest/releases) | [Request trial access](mailto:help@spillerstech.us?subject=OpsQuest%20public%20trial%20access)

## Public Trial

OpsQuest is preparing for its first Play Store release. Email [help@spillerstech.us](mailto:help@spillerstech.us) to request access to the public trial and help us qualify OpsQuest for the Play Store launch.

## What It Is

OpsQuest turns help desk training into playable branching tickets. Players triage outages, calm frustrated callers, verify identity before password resets, write useful ticket notes, and learn when to escalate.

Every decision is scored across two tracks:

- **Tech**: troubleshooting order, risk control, escalation judgment, and root-cause thinking.
- **People**: empathy, urgency, clear communication, security confidence, and follow-through.

Because the technically correct answer delivered badly is still a failed ticket.

## Inside 0.0.5

- **Ticket Queue Scenarios**: playable support tickets with priority levels, client context, branching choices, and coaching feedback.
- **Dual Scoring**: separate Tech and People points make the soft skills visible without watering down the technical work.
- **Skill Bites**: short quiz drills for fundamentals, ticket craft, and security habits.
- **XP, Streaks, and a Daily Bonus**: lightweight progression, a streak flame, and +25 XP for the first ticket you close each day.
- **Feedback Loop**: every debrief has a "this ticket felt wrong? tell us" link that opens a pre-addressed email.
- **Local-First**: no account required, no backend, minimal dependency footprint.

### Screenshots

<p align="center">
  <img src="docs/assets/screens/home.png" alt="Ticket queue home screen" width="24%" />
  <img src="docs/assets/screens/scenario.png" alt="Scenario play with branching choices" width="24%" />
  <img src="docs/assets/screens/note.png" alt="Ticket note coaching feedback" width="24%" />
  <img src="docs/assets/screens/debrief.png" alt="Ticket debrief with dual scores" width="24%" />
</p>

### Ticket queue (4 scenarios)

- **Everything Is Down** (P1): a clinic outage with patients in the lobby, dead agents, a failed UPS, and a very real communication clock.
- **The Password Loop** (P3): a repeat lockout call where identity verification, stale mobile credentials, and empathy all matter.
- **Printer Down at Dunmore & Vance** (P2): a 4 PM court deadline, an angry partner, a jammed spooler queue, and a cable the cleaners knocked loose.
- **The CEO Email** (P1): a gift-card phishing incident — scope the campaign, contain the compromised mailbox, and coach the reporter without shaming her.

### Skill Bite decks (3)

- **Networking First Steps**: ping, DNS, DHCP, APIPA — the first five minutes of an "internet is broken" call.
- **Ticket Craft**: notes worth reading, SLA response vs. resolution, escalations that aren't hot potatoes.
- **Security Basics**: phishing tells, MFA, least privilege, callback verification.

## Who It Is For

OpsQuest is for new help desk technicians, MSP service teams, team leads building training habits, and anyone who wants support practice that feels closer to the queue than a slide deck.

It is especially useful for teaching:

- How to scope incidents before touching the keyboard.
- How to communicate during urgent outages.
- Why password resets need identity verification.
- How to turn repeat tickets into root-cause fixes.
- What useful ticket notes actually look like.

## Android Release

Android APKs are available from GitHub Releases:

- Package: `com.opsquest.app`
- Current version name: `0.0.5`
- Current version code: `5`
- Releases: <https://github.com/Spillers-Technology/OpsQuest/releases>

## Run Locally

OpsQuest is built with Expo and React Native.

```bash
npm install
npx expo start
```

Then scan the QR code with Expo Go, or run on Android:

```bash
npx expo start --android
```

## Website

The product landing page lives in [`docs/`](docs/) for GitHub Pages.

When Pages is enabled for the public repo, it is intended to publish from the `docs` folder.

## Roadmap

Near-term work is focused on more ticket content, better scoring balance, and public trial feedback.

Planned next steps:

- More MSP-flavored scenarios across networking, printing, phishing, access, and escalation.
- More Skill Bite decks for networking, ticket craft, and security basics.
- Shareable results and lightweight feedback from testers.
- Public trial polish for the Play Store path.

## Contributing

Worked a real support queue? Scenario, coaching, accessibility, and app
contributions are welcome. [CONTRIBUTING.md](CONTRIBUTING.md) explains the
content principles, fictional-data requirement, and review steps.

## License

OpsQuest is released under the [MIT License](LICENSE).
