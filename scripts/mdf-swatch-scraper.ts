/*
  Playwright Swatch Scraper (MDF)
  - Captura swatches 120x120 para Arauco (Arquivo de Cores)
  - Prepara pipeline para PDFs (Duratex/Eucatex) e páginas com gate (Guararapes)

  Uso (recomendado executar com tsx ou ts-node):
    npx tsx scripts/mdf-swatch-scraper.ts --brand=arauco --limit=10

  Saída:
    - Imagens em public/swatches/{brand}/{pattern_id}.png
    - Atualiza src/data/mdf-swatches.json preenchendo swatch_url quando gerar imagem
*/

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

type Swatch = {
  brand: string;
  line: string;
  finish: string;
  pattern_id: string;
  pattern_name: string;
  hydro: boolean;
  swatch_url: string;
  catalog_url: string;
  notes?: string;
};

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.resolve(ROOT, '../public');
const SWATCH_DIR = (brand: string) => path.join(PUBLIC_DIR, 'swatches', brand.toLowerCase());
const JSON_PATH = path.resolve(ROOT, '../src/data/mdf-swatches.json');

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function loadSwatches(): Swatch[] {
  const raw = fs.readFileSync(JSON_PATH, 'utf8');
  return JSON.parse(raw);
}

function saveSwatches(swatches: Swatch[]) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(swatches, null, 2) + '\n', 'utf8');
}

function updateSwatchUrl(swatches: Swatch[], brand: string, patternId: string, relPath: string) {
  const idx = swatches.findIndex(
    (s) => s.brand.toLowerCase() === brand.toLowerCase() && s.pattern_id === patternId
  );
  if (idx >= 0) {
    swatches[idx].swatch_url = relPath;
  }
}

async function scrapeArauco(limit?: number) {
  const brand = 'arauco';
  const baseUrl = 'https://arauco.com.br/categoria/cores/';

  ensureDir(SWATCH_DIR(brand));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('article a, .wp-block-post a, .c-card a');
  const items = await page.$$eval('article a, .wp-block-post a, .c-card a', (els) =>
    els
      .map((e) => ({ name: (e.textContent || '').trim(), href: (e as HTMLAnchorElement).href }))
      .filter((i) => i.name && i.href)
  );

  const swatches = loadSwatches();
  let count = 0;

  for (const item of items) {
    if (limit && count >= limit) break;
    const nameSlug = slugify(item.name);
    const patternId = nameSlug; // padrão: usar nome como id quando não houver schema específico
    const relPath = `/swatches/${brand}/${patternId}.png`;
    const outPath = path.join(SWATCH_DIR(brand), `${patternId}.png`);

    const p = await browser.newPage();
    try {
      await p.goto(item.href, { waitUntil: 'domcontentloaded' });
      // Tenta localizar a imagem principal do padrão
      const img = p.locator('main img, article img, .wp-block-image img').first();
      await img.waitFor({ state: 'visible', timeout: 10_000 });
      await img.screenshot({ path: outPath });

      // Atualiza JSON somente se o padrão existir no arquivo
      updateSwatchUrl(swatches, brand, patternId, relPath);
      count++;
      console.log(`Saved ${relPath}`);
    } catch (err) {
      console.warn(`Skip ${item.href}: ${(err as Error).message}`);
    } finally {
      await p.close();
    }
  }

  saveSwatches(swatches);
  await browser.close();
}

// Stubs para PDF brands: Duratex/Eucatex
async function parseDuratexPDF() {
  // TODO: usar pdf-parse ou pdfjs-dist para extrair nomes/linhas
  // Gerar swatches neutros temporários (120x120) com sharp se necessário
  // Marcar hydro=true quando line contém "Ultra"
}

async function parseEucatexPDF() {
  // TODO: estratégia similar ao Duratex, extraindo pattern_name, line, finish
}

async function processGuararapes() {
  // TODO: quando downloads públicos exibirem cards sem gate, tirar prints dos cards
  // Caso contrário, usar PDF espelho para nomes e gerar swatches neutros temporários
}

async function main() {
  const brandArg = process.argv.find((a) => a.startsWith('--brand='));
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const brand = brandArg ? brandArg.split('=')[1] : 'arauco';
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;

  if (brand === 'arauco') {
    await scrapeArauco(limit);
  } else if (brand === 'duratex') {
    await parseDuratexPDF();
  } else if (brand === 'eucatex') {
    await parseEucatexPDF();
  } else if (brand === 'guararapes') {
    await processGuararapes();
  } else {
    console.error('Brand não suportada:', brand);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

