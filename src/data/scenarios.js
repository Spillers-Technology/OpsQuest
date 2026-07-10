// Scenario node graphs. Schema: see HANDOFF.md.
// quality: 'best' | 'ok' | 'bad' → feedback tint green/amber/red.
// maxScore = sum of (tech + people) along the best choice at every node.

export const SCENARIOS = [
  {
    id: 'everything-down',
    ticket: 'TKT-2481',
    title: 'Everything Is Down',
    priority: 'P1',
    client: 'Lakeside Family Medicine',
    blurb: 'Whole clinic dark at open. Patients in the lobby. Go.',
    maxScore: 16,
    start: 'n1',
    nodes: {
      n1: {
        text:
          "07:58. Your phone rings before you've even sat down. It's Renee, the office manager at Lakeside Family Medicine:\n\n\"NOTHING is working. No computers, no schedule, nothing — and patients are already checking in. I need this fixed NOW.\"",
        choices: [
          {
            label: '"Okay — first question: is it just your computer, or is everyone affected?"',
            next: 'n2',
            tech: 2,
            people: 1,
            quality: 'best',
            feedback:
              'Scope first, always. One user, one site, or one service — everything about your next ten minutes depends on that answer, and it costs five seconds to ask.',
          },
          {
            label: '"Let me remote into your PC right now and take a look."',
            next: 'n2',
            tech: 0,
            people: 1,
            quality: 'ok',
            feedback:
              "Action feels good and Renee hears urgency — but you're about to diagnose one machine before you know the blast radius. If the whole site is down, her PC tells you nothing.",
          },
          {
            label: '"Whoa, slow down. Open a ticket and we\'ll get to it in order."',
            next: 'n2',
            tech: 0,
            people: -2,
            quality: 'bad',
            feedback:
              "A clinic-wide outage with a lobby full of patients IS the front of the queue. Matching your urgency to theirs is a people skill — and this answer tells the client you don't get it.",
          },
        ],
      },
      n2: {
        text:
          'Renee checks around: front desk, both exam wings, the billing office — every screen is locked out of everything.\n\n"It\'s everyone. The whole building."',
        choices: [
          {
            label: "Pull up the RMM dashboard and check Lakeside's agents.",
            next: 'n3',
            tech: 2,
            people: 0,
            quality: 'best',
            feedback:
              'Monitoring answers in seconds what phone calls answer in minutes. Every agent offline at one site = site-wide, and almost certainly network or power — not thirty broken PCs.',
          },
          {
            label: 'Ask Renee to check the cables behind her PC.',
            next: 'n3',
            tech: -1,
            people: -1,
            quality: 'bad',
            feedback:
              "Her desk cables can't take out three departments. You're pattern-matching to the wrong scale — and burning the goodwill of your only pair of hands on site.",
          },
          {
            label: 'Escalate to L2 immediately — a whole site down is above L1.',
            next: 'n3',
            tech: 0,
            people: 0,
            quality: 'ok',
            feedback:
              'Escalating a site-wide P1 is never wrong — but escalating with zero triage means L2 starts from scratch. Spend three minutes gathering facts first and you hand them a running start.',
          },
        ],
      },
      n3: {
        text:
          "RMM: every Lakeside agent has been offline since 07:41. You try the clinic's firewall from outside — no response to ping.\n\nSo: internet out? Firewall dead? Something else?",
        choices: [
          {
            label: '"Renee — are the desk phones working? And is anything beeping in the closet where the network gear lives?"',
            next: 'n4',
            tech: 2,
            people: 1,
            quality: 'best',
            feedback:
              'Dead agents + dead firewall + (maybe) dead VoIP points at power or the edge device, not the ISP. The customer is your remote hands — good techs use them early and kindly.',
          },
          {
            label: 'Call the ISP and open an outage ticket.',
            next: 'n4',
            tech: 1,
            people: 0,
            quality: 'ok',
            feedback:
              'Reasonable guess — but from the outside, a firewall killed by a power blip looks identical to an ISP outage. Rule out the closet first; the ISP hold queue will eat 20 minutes either way.',
          },
          {
            label: 'Start restoring the firewall config from last backup.',
            next: 'n4',
            tech: -2,
            people: 0,
            quality: 'bad',
            feedback:
              "You've diagnosed nothing and you're already doing surgery. Never reach for the most invasive fix before you know what's actually broken — you can turn a 30-minute outage into a 3-hour one.",
          },
        ],
      },
      n4: {
        text:
          'Renee walks to the closet. "There\'s a black box making a horrible beeping noise, and none of the little lights I usually see are on."\n\nThe UPS failed overnight — and when the power blipped at 07:41, it took the firewall and switch down with it.',
        choices: [
          {
            label: 'Guide her through moving the firewall and switch onto wall power, give her a plain-English ETA, and log it in the ticket.',
            next: 'n5',
            tech: 2,
            people: 2,
            quality: 'best',
            feedback:
              "Bypassing a dead UPS is a safe, reversible bridge fix that's within L1 reach. Pairing it with an ETA in normal human words and a ticket note — that's the whole job in one move.",
          },
          {
            label: 'Tell her to hold the UPS power button until the beeping stops.',
            next: 'n5',
            tech: -1,
            people: 0,
            quality: 'bad',
            feedback:
              "That silences the alarm, not the outage — the gear still has no power. And a failing UPS mid-fault can behave unpredictably. Fix the outage first; deal with the noise after.",
          },
          {
            label: "Wait for L2 — you shouldn't be directing someone around power equipment.",
            next: 'n5',
            tech: 0,
            people: -1,
            quality: 'ok',
            feedback:
              'Caution has its place, but "unplug from the dead box, plug into the wall" is safe and standard. A clinic lobby filling with patients is not the place for wait-and-see.',
          },
        ],
      },
      n5: {
        text:
          '08:22. Gear is on wall power. Agents are coming back online one by one, and you can hear the front desk unfreezing in the background.\n\nRenee: "Okay, the schedule is loading… are we good?"',
        choices: [
          {
            label: 'Confirm each department is back, tell Renee you\'ll check in again in 30 minutes, and flag the dead UPS for replacement.',
            next: 'n6',
            tech: 2,
            people: 2,
            quality: 'best',
            feedback:
              "An outage isn't over when things turn on — it's over when the client hears you say so and the root cause has a follow-up. That UPS WILL fail again; today it's a line item, next month it's another P1.",
          },
          {
            label: '"You\'re good! Closing the ticket."',
            next: 'n6',
            tech: -1,
            people: -1,
            quality: 'bad',
            feedback:
              'Close it now and the next power blip is a repeat P1 with a angrier opening call. No recovery confirmation, no root-cause note, no follow-up — three misses in four words.',
          },
          {
            label: 'Escalate the UPS replacement to L2 and move on to your next ticket.',
            next: 'n6',
            tech: 1,
            people: 0,
            quality: 'ok',
            feedback:
              'The follow-up instinct is right — but leaving without closing the loop with Renee leaves the ticket emotionally open even though it\'s technically resolved. Thirty seconds of "we\'re good, here\'s what happened" buys months of trust.',
          },
        ],
      },
      n6: {
        text:
          "You write it up: timeline, root cause (failed UPS), fix (bypassed to wall power), follow-up (replacement quote to the account manager).\n\nRenee's last message: \"Thank you — you kept us calm.\"\n\nTicket closed.",
        end: true,
      },
    },
  },

  {
    id: 'password-loop',
    ticket: 'TKT-2497',
    title: 'The Password Loop',
    priority: 'P3',
    client: 'Kettler & Boone Insurance',
    blurb: 'Third lockout this week. He is NOT happy about it.',
    maxScore: 19,
    start: 'n1',
    nodes: {
      n1: {
        text:
          'The queue note reads: "Dale — locked out AGAIN. Third time this week."\n\nHe answers on the first ring: "Let me guess. You\'re going to reset it and tell me to be more careful. THIRD TIME. And I have a client meeting in twenty minutes."',
        choices: [
          {
            label: '"You\'re right — three lockouts in a week isn\'t normal, and it\'s not on you. Let\'s get you into that meeting first, then I want to find what\'s actually causing this."',
            next: 'n2',
            tech: 1,
            people: 3,
            quality: 'best',
            feedback:
              "Acknowledge the pattern before touching the keyboard. Dale isn't angry at the password — he's angry that nobody has treated ticket #3 any differently than ticket #1.",
          },
          {
            label: '"No problem, resetting it right now."',
            next: 'n2',
            tech: 0,
            people: 0,
            quality: 'ok',
            feedback:
              "Fast, polite… and exactly what happened the last two times. If you change nothing about the call, you've just scheduled the fourth one.",
          },
          {
            label: '"Have you been typing it with caps lock on?"',
            next: 'n2',
            tech: 0,
            people: -2,
            quality: 'bad',
            feedback:
              "You just told a frustrated repeat caller that he's the problem — before checking a single log. Even when user error IS the cause, leading with the accusation guarantees a fight.",
          },
        ],
      },
      n2: {
        text: '"Fine. Just reset it." You pull up his account. Locked, as advertised.',
        choices: [
          {
            label: '"Before I reset anything I need to verify you — I\'m going to call you right back on the number we have on file for Kettler & Boone."',
            next: 'n3',
            tech: 3,
            people: 0,
            quality: 'best',
            feedback:
              '"Reset my password" is the oldest social-engineering move in the book. Verification isn\'t distrust of Dale — it\'s protection FOR Dale, and skipping it because the caller is annoyed is exactly what an attacker counts on.',
          },
          {
            label: "He sounds like Dale and it's his extension calling — good enough, reset it.",
            next: 'n3',
            tech: -3,
            people: 0,
            quality: 'bad',
            feedback:
              'Caller ID is spoofable and voices can be cloned. If this account ever gets breached, "he sounded right" in the ticket notes is a resume-updating event.',
          },
          {
            label: '"Email me from your work account to confirm it\'s you."',
            next: 'n3',
            tech: -2,
            people: 0,
            quality: 'bad',
            feedback:
              "He's locked out of that account — and an attacker who already owns the mailbox passes this check instantly. Verification has to be out-of-band: a callback to the number on file.",
          },
        ],
      },
      n3: {
        text:
          'Verified. You reset the password and he\'s back in with five minutes to spare.\n\n"Great. Bye." You could close the ticket right now and nobody would blink.',
        choices: [
          {
            label: '"One more minute, Dale — when does it usually lock you out? First thing in the morning? After you\'ve been out of the office?"',
            next: 'n4',
            tech: 2,
            people: 2,
            quality: 'best',
            feedback:
              'Three lockouts is a pattern, and patterns have root causes. The questions cost sixty seconds; ticket #4 costs an hour of everyone\'s time and the last of Dale\'s patience.',
          },
          {
            label: 'Close the ticket — he got what he asked for.',
            next: 'n4',
            tech: -2,
            people: -1,
            quality: 'bad',
            feedback:
              "He got what he asked for, not what he needed. Ticket #4 is now booked for Thursday, and it opens with \"FOURTH TIME.\"",
          },
          {
            label: "Set his account so the password never expires — that'll stop it.",
            next: 'n4',
            tech: -3,
            people: 0,
            quality: 'bad',
            feedback:
              "That weakens security policy to silence a symptom — and it wouldn't even work. Expiry isn't what locks an account; failed logon attempts are. Something is still trying a bad password.",
          },
        ],
      },
      n4: {
        text:
          '"…Now that you mention it, it always seems to happen after I\'ve been out at client sites."\n\nThere it is. His phone\'s mail app still has the OLD password saved — it\'s been retrying every few minutes, and five failures trips the lockout policy. Every time he leaves the building, his own pocket locks him out.',
        choices: [
          {
            label: 'Walk him through updating the saved password on his phone, and stay on the line until mail syncs clean.',
            next: 'n5',
            tech: 2,
            people: 2,
            quality: 'best',
            feedback:
              'Root cause found AND fixed in one call. Stale cached credentials — phones, mapped drives, saved sessions — cause a huge share of "mystery" lockouts. Always ask: what else knows the old password?',
          },
          {
            label: 'Tell him to keep his phone off the office Wi-Fi.',
            next: 'n5',
            tech: -2,
            people: 0,
            quality: 'bad',
            feedback:
              "The mail app retries over cellular too. This \"fix\" just makes the lockouts look random instead of predictable — which is worse, because now nobody will ever find it.",
          },
          {
            label: 'Explain the cause and let him update the phone himself after his meeting.',
            next: 'n5',
            tech: 1,
            people: -1,
            quality: 'ok',
            feedback:
              '"Later" means the old password fails again at 5pm and he starts tomorrow locked out. You are one password field away from done — finish it while you have him.',
          },
        ],
      },
      n5: {
        text:
          'Phone updated, mail syncing, account clean.\n\nDale, in a completely different tone: "Huh. Nobody ever explained WHY it kept happening. Thanks."',
        choices: [
          {
            label: '"Glad we found it. One thought — self-service reset and MFA would let your whole office fix this kind of thing in seconds. Mind if I pass your ticket to our account manager as the example?"',
            next: 'n6',
            tech: 2,
            people: 2,
            quality: 'best',
            feedback:
              'A closed loop plus a proactive suggestion turns your worst repeat caller into the guy who tells his office "IT finally fixed it." Real tickets like this are exactly how good MSPs sell the right projects.',
          },
          {
            label: '"No problem. Have a good meeting!"',
            next: 'n6',
            tech: 0,
            people: 1,
            quality: 'ok',
            feedback:
              'A perfectly pleasant close — but you had a warm lead on a real improvement (SSPR/MFA) and let it walk. Tickets teach you things the account manager needs to know.',
          },
          {
            label: '"Just be careful where you save your passwords from now on."',
            next: 'n6',
            tech: 0,
            people: -2,
            quality: 'bad',
            feedback:
              "You just undid the entire call. He didn't \"save it wrong\" — a stale credential hammered the lockout policy. Don't hand the blame back to the client on your way out the door.",
          },
        ],
      },
      n6: {
        text:
          'Ticket notes: root cause — stale cached credential in mobile mail app. Fixed on call. Identity verified via callback. SSPR/MFA recommendation sent to account manager with client buy-in.\n\nDale\'s follow-up email to your boss: "Give this guy a raise."\n\nTicket closed.',
        end: true,
      },
    },
  },
];
