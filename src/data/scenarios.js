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

  {
    id: 'printer-dunmore',
    ticket: 'TKT-2503',
    title: 'Printer Down at Dunmore & Vance',
    priority: 'P2',
    client: 'Dunmore & Vance LLP',
    blurb: 'Court filing at 4 PM. Nothing on the third floor will print. The partner is calling personally.',
    maxScore: 15,
    start: 'n1',
    nodes: {
      n1: {
        text:
          '14:20. The call comes in from the main line, not the usual assistant:\n\n"This is Gordon Dunmore. My associates have a filing due at the courthouse at FOUR o\'clock and nothing on this floor will print. We pay your firm a great deal of money, and right now I am not sure why."',
        choices: [
          {
            label: '"Understood — a four o\'clock court deadline makes this my top priority, and I\'m starting on it right now. One quick question so I fix the right thing: is it every printer on the floor, or just the big copier?"',
            next: 'n2',
            tech: 1,
            people: 3,
            quality: 'best',
            feedback:
              "Name the deadline back to him, commit, THEN scope. Gordon doesn't need reassurance that printing matters — he needs to hear that you understand what 4 PM means. One sentence buys you the room to actually troubleshoot.",
          },
          {
            label: 'Put him on a brief hold and pull up the print server.',
            next: 'n2',
            tech: 1,
            people: -1,
            quality: 'ok',
            feedback:
              "Right instinct, wrong order. A senior partner who called personally just got silence and hold music. The tech work was going to take the same ninety seconds either way — spending five of them acknowledging the deadline costs nothing.",
          },
          {
            label: '"Printer issues are normally handled as lower priority, but I\'ll see what I can do."',
            next: 'n2',
            tech: 0,
            people: -3,
            quality: 'bad',
            feedback:
              'You just told a client his court deadline is "normally lower priority." Priority isn\'t about the device — it\'s about the impact. A printer blocking a legal filing is a business-down event for that team.',
          },
        ],
      },
      n2: {
        text:
          'Gordon hands you to Priya, his assistant, who actually knows the floor: every attorney on three prints to the big Canon in the copy room. Jobs say "sent," then nothing comes out. Floors two and four are printing fine.\n\nThe filing is about 300 pages across several documents.',
        choices: [
          {
            label: 'Open the print server and look at the queue for that Canon.',
            next: 'n3',
            tech: 2,
            people: 0,
            quality: 'best',
            feedback:
              'One shared printer, many users, jobs vanishing after "sent" — that lives in the server-side queue. When a whole floor shares one device, the queue is where the truth is, and you can see it in seconds without leaving your desk.',
          },
          {
            label: 'Have Priya power-cycle the Canon and wait for it to come back.',
            next: 'n3',
            tech: 0,
            people: 0,
            quality: 'ok',
            feedback:
              "Not crazy — but if the jam is server-side, the reboot changes nothing and you just spent five minutes of a hundred-minute clock waiting on a warm-up cycle. Look at the queue first; it's faster than the printer's boot screen.",
          },
          {
            label: "Remote into an associate's PC and reinstall the printer driver.",
            next: 'n3',
            tech: -2,
            people: 0,
            quality: 'bad',
            feedback:
              "Thirty people are affected. A driver on one PC cannot be the cause, so it cannot be the fix — you'd be repairing one machine out of thirty while the clock runs. Match the fix to the blast radius.",
          },
        ],
      },
      n3: {
        text:
          'The queue tells the story: 41 jobs backed up. At the top, a 600 MB scanned exhibit stuck at "Error — Printing" since 13:52. Everything behind it — including what looks like the filing documents — is just waiting in line.',
        choices: [
          {
            label: 'Cancel only the stuck job, restart the spooler, and tell Priya the queue is moving — and that whoever sent the big scan should re-send it after 4 PM, in smaller chunks.',
            next: 'n4',
            tech: 2,
            people: 1,
            quality: 'best',
            feedback:
              'Surgical. One bad job is holding 40 hostages — remove the one, keep the 40. And telling Priya what happened means the giant scan doesn\'t come right back at 3:45 and jam it again.',
          },
          {
            label: 'Purge the entire queue to clear the error and start fresh.',
            next: 'n4',
            tech: -3,
            people: 0,
            quality: 'bad',
            feedback:
              "Forty of those jobs ARE the filing. Purge the queue and the documents everyone is waiting on silently vanish — nobody gets told to re-print, and you find out at 3:50. Never destroy work you haven't identified.",
          },
          {
            label: 'Reboot the whole print server.',
            next: 'n4',
            tech: 0,
            people: 0,
            quality: 'ok',
            feedback:
              'It would probably work — and it takes printing down for the entire building for ten minutes to fix one queue. When a targeted fix and a sledgehammer both work, the sledgehammer is still the wrong tool.',
          },
        ],
      },
      n4: {
        text:
          "The queue starts draining. Two documents print... then everything stops again. Now the Canon's panel says OFFLINE, and from the server your pings to it are timing out — a few get through, most don't.\n\nThat's a different symptom than ten minutes ago.",
        choices: [
          {
            label: '"Priya — behind the Canon, can you check the network cable where it plugs into the printer and into the wall? Push both ends in firmly and tell me what you feel."',
            next: 'n5',
            tech: 2,
            people: 1,
            quality: 'best',
            feedback:
              "Intermittent ping is physical-layer language: cable, jack, or port — not software. The spooler was real and so is this; two problems can share one ticket. Remote hands can check a cable in ninety seconds.",
          },
          {
            label: 'Restart the spooler again — it worked a minute ago.',
            next: 'n5',
            tech: -2,
            people: 0,
            quality: 'bad',
            feedback:
              'The symptom changed, so the diagnosis has to change with it. Repeating the last fix because it worked once is troubleshooting by superstition — and a spooler restart cannot repair a device the network can barely reach.',
          },
          {
            label: 'Dispatch an on-site tech to look at the printer hardware.',
            next: 'n5',
            tech: 0,
            people: -1,
            quality: 'ok',
            feedback:
              "It probably IS physical — but a truck roll is forty-five minutes against a 4 PM deadline, and Priya is standing next to the printer right now. Exhaust your remote hands before you burn the drive time.",
          },
        ],
      },
      n5: {
        text:
          'Priya: "Oh — this cable is barely IN the wall. The cleaners were moving things back here last night." Click.\n\nPings go solid. The queue drains. She actually laughs: "It\'s printing so fast it\'s scaring me." 15:12 — the associates are collating.',
        choices: [
          {
            label: 'Call Gordon back directly: floor is printing, here\'s what happened, and you\'ll stay on standby until the filing is out the door. Note a follow-up to secure that cable run.',
            next: 'n6',
            tech: 1,
            people: 2,
            quality: 'best',
            feedback:
              'He escalated to you personally, so he hears the resolution personally — that symmetry is what "we pay your firm a great deal of money" wants to see. And the cable that got bumped once will get bumped again; the follow-up is the difference between a fix and a fluke.',
          },
          {
            label: 'Tell Priya it\'s all set and close the ticket.',
            next: 'n6',
            tech: 0,
            people: 0,
            quality: 'ok',
            feedback:
              "Technically resolved — but the angry partner who opened the ticket never hears the ending, so in his memory this stays \"the day IT almost cost us a filing.\" Close the loop with the person who escalated, not just the person who helped.",
          },
          {
            label: 'Close the ticket: "Resolved — cable reseated."',
            next: 'n6',
            tech: -1,
            people: -1,
            quality: 'bad',
            feedback:
              'Four words for a two-cause incident on an angry client\'s deadline. No spooler note, no root cause, no confirmation the filing made it. The next tech to touch this printer — maybe you — starts from zero.',
          },
        ],
      },
      n6: {
        text:
          'Ticket notes: two stacked issues — a 600 MB job wedging the spooler queue, then a dislodged network drop behind the device. Both fixed remotely with client hands. Filing confirmed printed 15:20; follow-up logged to secure the cable run.\n\nGordon, 16:05: "Filed with twenty minutes to spare. Good work."\n\nTicket closed.',
        end: true,
      },
    },
  },

  {
    id: 'ceo-email',
    ticket: 'TKT-2512',
    title: 'The CEO Email',
    priority: 'P1',
    client: 'Copper Kettle Restaurant Group',
    blurb: '"I think I got scammed." The CEO asked for gift cards. It wasn\'t the CEO.',
    maxScore: 14,
    start: 'n1',
    nodes: {
      n1: {
        text:
          'Tanya from Copper Kettle\'s office calls, talking fast and quiet:\n\n"I think I did something really stupid. Mike — the CEO — emailed me this morning asking me to buy gift cards for a client thank-you. Said it was urgent and confidential. I bought four hundred dollars\' worth at lunch, and I was about to email him the codes when something felt... off. Am I in trouble?"',
        choices: [
          {
            label: '"You are not in trouble — calling us was exactly right. Do NOT send those codes to anyone. Now walk me through it: forward me that email exactly as you got it."',
            next: 'n2',
            tech: 0,
            people: 3,
            quality: 'best',
            feedback:
              'First words matter: stop the loss, kill the shame. These scams are built by professionals to work on smart people — and an employee who feels safe reporting is worth more than any filter you will ever deploy.',
          },
          {
            label: '"Forward me the email and I\'ll take a look."',
            next: 'n2',
            tech: 1,
            people: 0,
            quality: 'ok',
            feedback:
              "Right ask, missing two things: an explicit \"don't send the codes\" — she was minutes from doing it — and a word of reassurance for someone who just asked if she's in trouble. Security incidents are people incidents first.",
          },
          {
            label: '"You almost emailed gift card codes to a stranger? Didn\'t you take the security training last quarter?"',
            next: 'n2',
            tech: 0,
            people: -3,
            quality: 'bad',
            feedback:
              "Congratulations: Tanya will never report anything again, and neither will anyone she tells about this call. Shame doesn't prevent the next incident — it just guarantees you hear about it later, after the money is gone.",
          },
        ],
      },
      n2: {
        text:
          'The email lands in your inbox. From: "Mike Harrelson <mharrelson@copperkettIe-group.com>" — a capital I where the l should be. Urgent tone, "keep this between us," and "I\'m in meetings all day, don\'t call."\n\nClassic. The real question is how big this is.',
        choices: [
          {
            label: 'Run a message trace: who else at Copper Kettle got mail from that lookalike domain?',
            next: 'n3',
            tech: 2,
            people: 0,
            quality: 'best',
            feedback:
              "Phishing is a campaign, not a letter. Tanya is the one who called — she's rarely the only one who received it. Scope first, exactly like an outage: you can't contain what you haven't measured.",
          },
          {
            label: 'Block the sender address and tell Tanya she\'s all set.',
            next: 'n3',
            tech: 0,
            people: 0,
            quality: 'ok',
            feedback:
              "Blocking one address treats the symptom you can see. Attackers rotate senders in minutes — and you still have no idea who else got the email or answered it. Contain after you scope, not instead of scoping.",
          },
          {
            label: 'Reply to the email to string the scammer along and waste their time.',
            next: 'n3',
            tech: -2,
            people: 0,
            quality: 'bad',
            feedback:
              "You just confirmed the mailbox is live and monitored, on company time, mid-incident. This isn't a hobby duel — every minute spent entertaining the attacker is a minute Devon in accounting might be buying cards.",
          },
        ],
      },
      n3: {
        text:
          'The trace comes back ugly: six people received it. Five ignored it. Devon in accounts payable replied "Sure — which cards and how many?" twenty minutes ago.\n\nAnd Tanya adds one more thing: "Monday I got a \'purchase approval\' link from Mike and signed in with my email password. Was that... part of this?"',
        choices: [
          {
            label: 'Treat Tanya\'s account as compromised: reset the password, revoke every active session, check her mailbox rules — and call Devon RIGHT NOW before he buys anything.',
            next: 'n4',
            tech: 3,
            people: 0,
            quality: 'best',
            feedback:
              'Phished credentials mean the attacker may be IN the mailbox now — a reset alone doesn\'t end sessions that are already open, and mailbox rules survive password changes. And Devon is an active bleed: people first, forensics second.',
          },
          {
            label: 'Reset Tanya\'s password and move on to cleanup.',
            next: 'n4',
            tech: 1,
            people: 0,
            quality: 'ok',
            feedback:
              "Necessary but not sufficient. Existing sessions keep working after a reset unless you revoke them, inbox rules persist, and Devon is still typing. A half-contained account compromise isn't contained.",
          },
          {
            label: "Kick off a full antivirus scan on Tanya's PC.",
            next: 'n4',
            tech: -2,
            people: 0,
            quality: 'bad',
            feedback:
              "Nothing was installed — her password was harvested on a fake login page. The scan will come back clean, you'll feel productive, and the attacker will still be logged into her mailbox reading everything. Match the response to the attack.",
          },
        ],
      },
      n4: {
        text:
          "Devon caught in time — he was literally in line at the store. Then you open Tanya's mailbox rules and there it is: created Monday, forwards anything containing \"invoice,\" \"payment,\" or \"gift\" to an outside Gmail address, marks it read.\n\nThat's how the fake Mike knew exactly how to sound like the real one.",
        choices: [
          {
            label: 'Remove the rule, block the lookalike domain, purge the phish from all six mailboxes — and preserve the evidence, then brief the real Mike: this is a reportable incident, not just a bad email.',
            next: 'n5',
            tech: 2,
            people: 1,
            quality: 'best',
            feedback:
              'Contain, clean, and document — in that order. Screenshots of the rule and the message headers are what the insurer, the bank, and possibly law enforcement will ask for. And the CEO learns about his impersonation from you, today, not from a client next month.',
          },
          {
            label: 'Delete the rule, block the domain, close the ticket quietly.',
            next: 'n5',
            tech: 1,
            people: -1,
            quality: 'ok',
            feedback:
              "The technical cleanup is right — but a week of silently forwarded financial email is an incident leadership needs to know about, in writing. If money or client data moved and it surfaces later, \"IT knew and closed the ticket\" is a very bad sentence.",
          },
          {
            label: 'Delete the rule and every trace of the phishing emails so nobody clicks them later.',
            next: 'n5',
            tech: -2,
            people: 0,
            quality: 'bad',
            feedback:
              'You just shredded the evidence. Headers, the rule, the sent replies — that\'s the forensic record of what the attacker saw and did. Purge malicious mail from inboxes, yes, but preserve copies first. "Clean" and "gone" are different goals.',
          },
        ],
      },
      n5: {
        text:
          'By 16:30 it\'s contained: account secured, rule documented and removed, domain blocked, Mike briefed, and the store refunded the unactivated cards.\n\nTanya, one more time: "I still feel so stupid. I talk to Mike every day. How did I not know?"',
        choices: [
          {
            label: '"That email fooled the spam filter too, and it was built from a week of reading real messages. You\'re the one who caught it — reporting it IS the win. Mind if I use it, no names, for a two-minute heads-up to the staff?"',
            next: 'n6',
            tech: 0,
            people: 3,
            quality: 'best',
            feedback:
              'Reframe the reporter as the hero, because she is — her gut feeling beat the filter. And a real, local example (anonymized) teaches the tells better than any generic training slide ever will.',
          },
          {
            label: '"Don\'t worry about it — it\'s all fixed now."',
            next: 'n6',
            tech: 0,
            people: 1,
            quality: 'ok',
            feedback:
              "Kind, but it closes the door on the teachable moment. She asked HOW she missed it — that's an invitation to show her the tells: urgency, secrecy, a payment method no CEO uses, and a domain one letter off.",
          },
          {
            label: '"Just double-check the sender address next time."',
            next: 'n6',
            tech: 0,
            people: -2,
            quality: 'bad',
            feedback:
              'That\'s blame wearing a helpful hat — and bad advice besides: the whole point of a lookalike domain is that "double-checking" fails at a glance. She needs the pattern (urgency + secrecy + weird payment), not a chore.',
          },
        ],
      },
      n6: {
        text:
          'Incident notes: lookalike-domain BEC targeting six staff. Credential phish Monday → forwarding rule → tailored gift-card fraud. Contained same day: sessions revoked, rule preserved then removed, domain blocked, zero dollars lost. Leadership briefed; staff awareness note approved.\n\nMike\'s reply: "Glad someone was paying attention. Buy Tanya lunch on the company card."\n\nTicket closed.',
        end: true,
      },
    },
  },
];
