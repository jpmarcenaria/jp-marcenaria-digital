import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:8082/";

test.describe("Portfólio de Móveis - Smoke", () => {
  test("Imagens carregam e cards são clicáveis", async ({ page }) => {
    await page.goto(BASE_URL);
    // aguarda primeira imagem visível
    const img = page.locator('img[alt]');
    await expect(img.first()).toBeVisible({ timeout: 15000 });

    // valida que a imagem possui dimensões
    const hasSize = await img.first().evaluate((el) => {
      const image = el as HTMLImageElement;
      return image.naturalWidth > 0 && image.naturalHeight > 0;
    });
    expect(hasSize).toBeTruthy();

    // tenta clicar no card
    const card = page.locator('div.relative.aspect-video').first();
    if (await card.count()) {
      await card.click({ trial: true }); // não dispara ações, valida alvo
      await card.click();
    }
  });
});
