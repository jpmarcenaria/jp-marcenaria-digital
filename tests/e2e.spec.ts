import { test, expect } from '@playwright/test';
import { checkWcagAA } from './utils/a11y';
import { saveCoverage } from './utils/coverage';
import { clickAllInteractive, stubExternalOpen, stubSupabaseRoutes } from './utils/interactions';

test.describe.configure({ mode: 'serial' });

test.describe('Fluxo completo do site', () => {
  test('Navegação principal via Navbar e acessibilidade', async ({ page }) => {
    await stubExternalOpen(page);
    await page.goto('/');
    await checkWcagAA(page, 'Home');
    await saveCoverage(page, 'home');

    await page.getByRole('navigation').getByRole('link', { name: 'Portfólio' }).first().click();
    await expect(page).toHaveURL(/\/portfolio/);
    await checkWcagAA(page, 'Portfolio');
    await saveCoverage(page, 'portfolio');

    await page.getByRole('navigation').getByRole('link', { name: /Para Arquitetos/i }).first().click();
    await expect(page).toHaveURL(/\/arquitetos/);
    await checkWcagAA(page, 'Arquitetos');
    await saveCoverage(page, 'arquitetos');

    await page.getByRole('navigation').getByRole('link', { name: /Materiais/i }).first().click();
    await expect(page).toHaveURL(/\/materiais/);
    await checkWcagAA(page, 'Materiais');
    await saveCoverage(page, 'materiais');

    await page.getByRole('navigation').getByRole('link', { name: /Enviar Briefing/i }).first().click();
    await expect(page).toHaveURL(/\/briefing/);
    await checkWcagAA(page, 'Briefing');
    await saveCoverage(page, 'briefing');
  });

  test('Clicar elementos interativos em Home', async ({ page }) => {
    await page.goto('/');
    await clickAllInteractive(page);
    await saveCoverage(page, 'home-interactions');
  });

  test('Formulário Briefing - inválido e válido', async ({ page }) => {
    await stubExternalOpen(page);
    await stubSupabaseRoutes(page);
    await page.goto('/briefing');

    // Submissão inválida
    await page.getByRole('textbox', { name: /Nome/i }).fill('A');
    await page.getByRole('textbox', { name: /Telefone/i }).fill('');
    await page.getByRole('button', { name: /Enviar/i }).click();
    // Erros esperados (baseados em zod/rhf)
    await expect(page.getByText(/Erro|inválido|obrigatório/i)).toBeVisible();

    // Submissão válida
    await page.getByRole('textbox', { name: /Nome/i }).fill('João da Silva');
    await page.getByRole('textbox', { name: /Telefone/i }).fill('11987654321');
    const emailField = page.getByRole('textbox', { name: /E-mail/i });
    if (await emailField.count()) {
      await emailField.fill('joao@example.com');
    }
    // selecionar alguns materiais/ambientes se presentes
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    for (const c of checkboxes.slice(0, 3)) { await c.check().catch(() => {}); }
    await page.getByRole('button', { name: /Enviar/i }).click();
    await expect(page.getByText(/Briefing enviado!/i)).toBeVisible();
    await saveCoverage(page, 'briefing-submit');
  });

  test('Formulário Orçamento - inválido e válido', async ({ page }) => {
    await stubSupabaseRoutes(page);
    await page.goto('/orcamento');

    // inválido
    const nome = page.getByRole('textbox', { name: /Nome/i });
    await nome.fill('A');
    const telefone = page.getByRole('textbox', { name: /Telefone/i });
    await telefone.fill('');
    await page.getByRole('button', { name: /Enviar|Solicitar/i }).click();
    await expect(page.getByText(/Erro|inválido|obrigatório/i)).toBeVisible();

    // válido
    await nome.fill('Cliente Teste');
    await telefone.fill('11999999999');
    const email = page.getByRole('textbox', { name: /E-mail/i });
    if (await email.count()) { await email.fill('cliente@teste.com'); }
    await page.getByRole('button', { name: /Enviar|Solicitar/i }).click();
    await expect(page.getByText(/Orçamento solicitado!/i)).toBeVisible();
    await saveCoverage(page, 'orcamento-submit');
  });

  test('Página 404 NotFound', async ({ page }) => {
    await page.goto('/rota-que-nao-existe', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/não encontrada|404/i)).toBeVisible();
    await checkWcagAA(page, 'NotFound');
    await saveCoverage(page, 'notfound');
  });

  test('WhatsApp CTA - formatação, codificação e URLs', async ({ page }) => {
    await stubSupabaseRoutes(page);
    await page.goto('/orcamento');
    const link = page.getByRole('link', { name: /Abrir WhatsApp/i });
    await expect(link).toBeVisible();

    const href = await link.getAttribute('href');
    const appUrl = await link.getAttribute('data-whatsapp-app-url');

    // Número e mensagem padrão codificados corretamente
    await expect(href || '').toContain('https://api.whatsapp.com/send?phone=5513974146380');
    await expect(href || '').toContain('text=vim%20atrav%C3%A9s%20do%20Seu%20web%20site!');

    // Protocolo de app presente (para mobile)
    await expect(appUrl || '').toContain('whatsapp://send?phone=5513974146380');
    await expect(appUrl || '').toContain('text=vim%20atrav%C3%A9s%20do%20Seu%20web%20site!');

    await saveCoverage(page, 'whatsapp-cta');
  });
});
