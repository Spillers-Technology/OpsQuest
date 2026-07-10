// Bite decks: { id, title, questions: [{ q, options: [..], answer: idx, why }] }
// M1 set: Networking First Steps / Ticket Craft / Security Basics.

export const BITE_DECKS = [
  {
    id: 'networking-first-steps',
    title: 'Networking First Steps',
    blurb: 'ping, DNS, DHCP — the first five minutes of any "internet is broken" ticket.',
    questions: [
      {
        q: 'A user can\'t reach any websites. `ping 8.8.8.8` works, but `ping google.com` fails. Most likely culprit?',
        options: ['The ISP is down', 'DNS', 'A bad network cable', 'The firewall is blocking port 443'],
        answer: 1,
        why: 'Raw IP works but names don\'t resolve — that\'s DNS. If the ISP or cable were the problem, the IP ping would fail too. (Yes: it\'s always DNS.)',
      },
      {
        q: 'Which command shows a Windows PC\'s IP address, default gateway, AND DNS servers in one shot?',
        options: ['netstat -an', 'tracert', 'ipconfig /all', 'nslookup'],
        answer: 2,
        why: '`ipconfig /all` is the first command of nearly every network ticket: address, gateway, DNS, DHCP server, and lease info in one screen.',
      },
      {
        q: 'A PC shows an address of 169.254.23.7. What is it telling you?',
        options: [
          'Someone set a bad static IP',
          'It couldn\'t reach a DHCP server, so it gave itself an address',
          'DNS is misconfigured',
          'It\'s connected through a VPN',
        ],
        answer: 1,
        why: '169.254.x.x is APIPA — the "I asked for an address and nobody answered" range. Look at the DHCP server, the switch port, or the cable between them.',
      },
      {
        q: 'One user\'s internet is crawling; everyone else at the site is fine. Best first move?',
        options: [
          'Reboot the firewall',
          'Call the ISP',
          'Clear their browser cache',
          'Isolate: test their machine on a known-good port/cable, or a known-good machine at their desk',
        ],
        answer: 3,
        why: 'One affected user means the shared infrastructure is probably fine — never bounce a firewall 30 people are using for a one-person problem. Swap variables until the fault follows one of them.',
      },
      {
        q: '`ping -t 10.0.0.5` is especially handy during a fix because it…',
        options: [
          'Pings continuously — you can watch the device drop and come back in real time',
          'Traces every hop along the route',
          'Tests whether DNS is resolving',
          'Sends larger packets to test throughput',
        ],
        answer: 0,
        why: 'The -t flag pings until you stop it (Ctrl+C). Start it before you reboot a device and you\'ll see the exact moment it comes back — no guessing, no "try it now… how about now?"',
      },
    ],
  },

  {
    id: 'ticket-craft',
    title: 'Ticket Craft',
    blurb: 'Notes, SLAs, and escalations — the paperwork that makes you look like a pro.',
    questions: [
      {
        q: 'Which of these is a GOOD ticket note?',
        options: [
          '"Worked on issue."',
          '"Fixed."',
          '"User can\'t print → cleared stuck 600MB job on PRINTSRV queue, restarted spooler, user confirmed test page. Watch for repeat if large scans return."',
          '"Called user, will follow up."',
        ],
        answer: 2,
        why: 'A note is for the NEXT person who opens the ticket — maybe you, at 2 AM, six months from now. What you saw, what you changed, how you confirmed it, and what to watch for. "Worked on issue" tells them nothing.',
      },
      {
        q: 'Your P1 SLA says "respond within 15 minutes." What actually counts as responding?',
        options: [
          'Fully resolving the issue',
          'Acknowledging the client, confirming impact, and starting triage',
          'Assigning the ticket to yourself',
          'Sending an auto-reply that the ticket was received',
        ],
        answer: 1,
        why: 'Response time and resolution time are different clocks. Responding means a human acknowledged the problem, understood the impact, and started working — silently self-assigning the ticket helps you, not the client.',
      },
      {
        q: 'You\'re escalating a ticket to L2. What does a good escalation include?',
        options: [
          'Just the ticket number — L2 can read the ticket themselves',
          'What\'s affected and its scope, what you tried, the results, and what you think it might be',
          'An apology for not being able to fix it',
          'A summary of how upset the client is',
        ],
        answer: 1,
        why: 'An escalation is a handoff, not a hot potato. Scope, steps tried, results, and your working theory let L2 start from where you stopped instead of from zero. That\'s the difference between escalating and just... forwarding.',
      },
      {
        q: 'The fix worked. When is it right to close the ticket?',
        options: [
          'As soon as the fix is applied',
          'At the end of your shift',
          'After the user confirms it\'s resolved and your notes capture cause, fix, and any follow-up',
          'After 24 hours with no complaints',
        ],
        answer: 2,
        why: '"It works on my screen" isn\'t resolved — the user confirming is. And a ticket closed without cause and fix in the notes is a repeat ticket waiting for a tech with no history to work from.',
      },
      {
        q: 'A client emails you directly about a new problem instead of the help desk. Best move?',
        options: [
          'Fix it quietly — great service means no bureaucracy',
          'Tell them you can\'t help until they open a ticket properly',
          'Help them — and create the ticket yourself so the work is tracked, then gently point them to the help desk for fastest response next time',
          'Forward it to your manager',
        ],
        answer: 2,
        why: 'Untracked work is invisible work: no SLA clock, no history, no coverage when you\'re out sick. Never punish the client for asking — but always get the work into the system, and teach the faster path kindly.',
      },
    ],
  },

  {
    id: 'security-basics',
    title: 'Security Basics',
    blurb: 'Phishing tells, MFA, and the verification habits that keep you off the news.',
    questions: [
      {
        q: 'An email from the "CEO" says: urgent, confidential, buy gift cards, don\'t call me. What\'s the biggest tell?',
        options: [
          'CEOs never email staff directly',
          'The combination: urgency + secrecy + an unusual payment method + blocking verification',
          'Gift cards are never used in business',
          'The email has a typo in it',
        ],
        answer: 1,
        why: 'No single detail is proof — it\'s the pattern. Manufactured urgency, "keep this between us," a payment method leadership never uses, and a built-in excuse for why you can\'t verify. Each one exists to stop you from checking.',
      },
      {
        q: 'Why does MFA matter even if a user\'s password gets phished?',
        options: [
          'It makes passwords impossible to steal',
          'The stolen password alone isn\'t enough to log in — the attacker still needs the second factor',
          'It automatically detects phishing emails',
          'It forces the user to change their password more often',
        ],
        answer: 1,
        why: 'MFA assumes the password WILL eventually leak — and makes that survivable. The attacker with a perfect stolen password hits a second lock they don\'t hold. It\'s the single highest-value control for account takeover.',
      },
      {
        q: 'A caller asks for a password reset. What\'s a solid way to verify it\'s really them?',
        options: [
          'They know the username and employee ID',
          'The caller ID matches their extension',
          'They sound like the person you\'ve talked to before',
          'Call them back on the number already on file for their company',
        ],
        answer: 3,
        why: 'Caller ID is spoofable, voices are cloneable, and usernames aren\'t secrets. A callback to a number on file is out-of-band — the attacker would need to control the real phone, not just the call. Verify through a channel THEY don\'t choose.',
      },
      {
        q: 'What is "least privilege"?',
        options: [
          'Everyone gets local admin so IT gets fewer tickets',
          'Each account gets only the access its job requires — nothing more',
          'Only executives get admin rights',
          'Users must request permission for every file, every time',
        ],
        answer: 1,
        why: 'Every permission an account holds is something an attacker inherits the moment that account is compromised. Least privilege doesn\'t stop the phish — it shrinks the blast radius when one lands.',
      },
      {
        q: "A user gets MFA prompts on their phone that they didn't trigger. What does that mean, and what should they do?",
        options: [
          'A glitch — ignore them and they\'ll stop',
          'Approve one so the notifications stop',
          "Someone likely HAS their password and is trying to get in: deny, report it to IT, and change the password",
          'Restart the phone to clear the notifications',
        ],
        answer: 2,
        why: "An MFA prompt you didn't cause means someone passed the password check. \"Approve one to make it stop\" is exactly the fatigue attack that breached Uber. Deny, report, reset — the prompts are the alarm working.",
      },
    ],
  },
];
