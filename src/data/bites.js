// Bite decks: { id, title, questions: [{ q, options: [..], answer: idx, why }] }
// One starter deck ships in M0 so the Bites section is playable; the full
// three-deck set (Networking / Ticket Craft / Security) lands in M1.

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
];
