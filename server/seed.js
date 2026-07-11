import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './src/config.js';
import { createDatabase } from './src/db/index.js';
import { findDuplicateTicket, validateScenario } from './src/validate.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(root, '..', 'src', 'data', 'scenarios');
const config = loadConfig(console);
const db = await createDatabase(config);

try {
  const files = (await fs.readdir(source)).filter((name) => name.endsWith('.json')).sort();
  const scenarios = await Promise.all(files.map(async (name) => JSON.parse(await fs.readFile(path.join(source, name), 'utf8'))));
  let failed = false;
  for (const scenario of scenarios) {
    const result = validateScenario(scenario, `${scenario.id}.json`);
    const duplicate = findDuplicateTicket(scenario, scenarios);
    if (duplicate) result.errors.push(duplicate);
    result.warnings.forEach((message) => console.warn(`WARN ${message}`));
    if (result.errors.length) {
      failed = true;
      result.errors.forEach((message) => console.error(`ERROR ${message}`));
      continue;
    }
    await db.upsertScenario(scenario, null);
    console.log(`Seeded ${scenario.id}`);
  }
  if (failed) process.exitCode = 1;
} finally {
  await db.close();
}
