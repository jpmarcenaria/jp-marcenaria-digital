import { Page } from '@playwright/test';

export async function clickAllInteractive(page: Page) {
  const links = await page.getByRole('link').all();
  for (const link of links) {
    const href = await link.getAttribute('href');
    if (!href || href.startsWith('#')) continue;
    try { await link.scrollIntoViewIfNeeded(); await link.click({ force: true }); } catch {}
    await page.waitForLoadState('domcontentloaded');
    await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
  }

  const buttons = await page.getByRole('button').all();
  for (const btn of buttons) {
    try { await btn.scrollIntoViewIfNeeded(); await btn.click({ force: true }); } catch {}
  }

  const inputs = await page.getByRole('textbox').all();
  for (const input of inputs) {
    try { await input.fill('Teste'); } catch {}
  }
}

export async function stubExternalOpen(page: Page) {
  await page.addInitScript(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).open = () => undefined;
  });
}

export async function stubSupabaseRoutes(page: Page) {
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.includes('.supabase.co') || url.includes('/rest/v1/')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {}, error: null }) });
    }
    return route.continue();
  });
}

