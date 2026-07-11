import { withMaxScore } from '../scenarioUtils';

// The bundled "offline start" content set. Register every scenario JSON here —
// one require per file (Metro needs static requires). `npm run validate` checks
// this list matches the directory.
const FILES = [
  // legacy set (0.0.x)
  require('./everything-down.json'),
  require('./password-loop.json'),
  require('./printer-dunmore.json'),
  require('./ceo-email.json'),
  // wave 1
  require('./bsod-loop.json'),
  require('./dead-laptop-keynote.json'),
  require('./help-john.json'),
  require('./local-admin-request.json'),
  require('./midday-firmware.json'),
  require('./monday-new-hire.json'),
  require('./phones-down.json'),
  require('./ransomware-friday.json'),
  require('./restore-roulette.json'),
  require('./retention-request.json'),
  require('./rogue-switch.json'),
  require('./scan-to-email-broken.json'),
  require('./status-call-meltdown.json'),
  require('./vanishing-emails.json'),
  require('./vendor-blame-game.json'),
  require('./vpn-down-two-sites.json'),
];

export const SCENARIOS = FILES.map(withMaxScore);
