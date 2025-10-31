import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import libCoverage from 'istanbul-lib-coverage';

const COVERAGE_DIR = path.resolve(new URL('../coverage', import.meta.url).pathname);
const MIN_THRESHOLD = Number(process.env.PLAYWRIGHT_COVERAGE_THRESHOLD ?? '80');

test('Cobertura mínima de código', async () => {
  if (!fs.existsSync(COVERAGE_DIR)) {
    console.warn('Diretório de cobertura não encontrado; pulando verificação.');
    return;
  }
  const files = fs.readdirSync(COVERAGE_DIR).filter(f => f.endsWith('.json'));
  if (!files.length) {
    console.warn('Nenhum arquivo de cobertura encontrado; pulando verificação.');
    return;
  }
  const { createCoverageMap } = libCoverage as unknown as { createCoverageMap: (obj: unknown) => any };
  const map = createCoverageMap({});
  for (const f of files) {
    const content = fs.readFileSync(path.join(COVERAGE_DIR, f), 'utf-8');
    map.merge(JSON.parse(content));
  }
  const summary = map.getCoverageSummary();
  const pct = summary.lines.pct || 0;
  console.log(`Cobertura de linhas: ${pct}% (mínimo ${MIN_THRESHOLD}%)`);
  expect(pct).toBeGreaterThanOrEqual(MIN_THRESHOLD);
});
