import type { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const COVERAGE_DIR = path.resolve(new URL('../../coverage', import.meta.url).pathname);

export async function saveCoverage(page: Page, tag: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coverage = await page.evaluate(() => (window as any).__coverage__);
  if (!coverage) return;
  if (!fs.existsSync(COVERAGE_DIR)) fs.mkdirSync(COVERAGE_DIR, { recursive: true });
  const file = path.join(COVERAGE_DIR, `coverage-${Date.now()}-${tag}.json`);
  fs.writeFileSync(file, JSON.stringify(coverage));
}
