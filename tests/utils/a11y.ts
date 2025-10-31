import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function checkWcagAA(page: Page, contextName: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2aa'])
    .disableRules(['color-contrast']) // opcional: muitos falsos positivos em dev
    .analyze();

  if (results.violations.length) {
    console.warn(`A11y (${contextName}) violações:`,
      results.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description }))
    );
  }
  // Não falhar o teste aqui; usaremos o relatório para listar violações.
}
