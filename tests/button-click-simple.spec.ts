/**
 * Teste E2E Simplificado - Clique no Botão "Móveis Planejados"
 * JP Marcenaria Digital
 */

import { test, expect } from "@playwright/test";

test.describe("Teste de Clique - Botão Móveis Planejados", () => {
  test("Deve clicar no botão Móveis Planejados e verificar carregamento completo", async ({ page }) => {
    console.log("🚀 Iniciando teste de clique no botão Móveis Planejados");

    // 1. IDENTIFICAÇÃO CLARA DO ELEMENTO ALVO
    console.log("📍 Passo 1: Identificação do elemento alvo");
    
    // Navegar para a página do portfólio
    await page.goto("/portfolio");
    await page.waitForLoadState("networkidle");
    console.log("✅ Página carregada: /portfolio");

    // Identificar o elemento alvo pelo seletor específico
    const targetButton = page.locator("button[role=\"tab\"]").filter({ 
      hasText: "Móveis Planejados" 
    });

    // Verificar se o elemento existe e está visível
    await expect(targetButton).toBeVisible({ timeout: 10000 });
    console.log("✅ Elemento alvo identificado e visível");

    // 2. CAPTURA DE EVIDÊNCIA VISUAL ANTES DO CLIQUE
    console.log("📸 Passo 2: Captura de evidência visual antes do clique");
    
    await page.screenshot({ 
      path: "test-results/before-click-moveis-planejados.png",
      fullPage: true 
    });
    console.log("✅ Screenshot antes do clique salvo");

    // Verificar estado inicial
    const initialUrl = page.url();
    const initialTitle = await page.title();
    console.log(`📊 Estado inicial - URL: ${initialUrl}, Título: ${initialTitle}`);

    // Verificar se o elemento está habilitado
    await expect(targetButton).toBeEnabled();
    console.log("✅ Elemento está habilitado");

    // Verificar atributos específicos do botão
    const initialAriaSelected = await targetButton.getAttribute("aria-selected");
    const initialDataState = await targetButton.getAttribute("data-state");
    console.log(`📊 Estado inicial do botão - aria-selected: ${initialAriaSelected}, data-state: ${initialDataState}`);

    // 3. AÇÃO DE CLIQUE SIMULANDO INTERAÇÃO DO USUÁRIO
    console.log("🖱️ Passo 3: Executando clique no botão");
    
    const clickStartTime = Date.now();
    await targetButton.click();
    const clickDuration = Date.now() - clickStartTime;
    
    console.log(`✅ Clique executado em ${clickDuration}ms`);

    // 4. VERIFICAÇÃO DO CARREGAMENTO COMPLETO DA PÁGINA
    console.log("⏳ Passo 4: Verificando carregamento completo");
    
    const loadStartTime = Date.now();
    
    try {
      // Aguardar carregamento completo com timeout de 30 segundos
      await page.waitForLoadState("networkidle", { timeout: 30000 });
      await page.waitForLoadState("domcontentloaded", { timeout: 30000 });
      
      const loadDuration = Date.now() - loadStartTime;
      console.log(`✅ Carregamento completo em ${loadDuration}ms`);
      
    } catch (error) {
      const actualDuration = Date.now() - loadStartTime;
      console.error(`❌ Timeout no carregamento após ${actualDuration}ms`);
      throw error;
    }

    // 5. VERIFICAÇÃO DA URL E ESTADO DA PÁGINA
    console.log("🔍 Passo 5: Verificando estado final da página");
    
    const finalUrl = page.url();
    const finalTitle = await page.title();
    console.log(`📊 Estado final - URL: ${finalUrl}, Título: ${finalTitle}`);

    // Verificar se o botão agora está ativo (selecionado)
    const finalAriaSelected = await targetButton.getAttribute("aria-selected");
    const finalDataState = await targetButton.getAttribute("data-state");
    console.log(`📊 Estado final do botão - aria-selected: ${finalAriaSelected}, data-state: ${finalDataState}`);

    // Assertions para verificar mudança de estado
    await expect(targetButton).toHaveAttribute("aria-selected", "true");
    await expect(targetButton).toHaveAttribute("data-state", "active");
    console.log("✅ Estado do botão alterado corretamente");

    // 6. VERIFICAÇÃO DE RECURSOS CARREGADOS
    console.log("🖼️ Passo 6: Verificando recursos da página");
    
    // Verificar se imagens foram carregadas
    const images = page.locator("img");
    const imageCount = await images.count();
    console.log(`📊 Total de imagens encontradas: ${imageCount}`);
    
    if (imageCount > 0) {
      await expect(images.first()).toBeVisible({ timeout: 15000 });
      console.log("✅ Primeira imagem carregada e visível");
    }

    // Verificar se o conteúdo do portfólio está visível
    const portfolioContent = page.locator("[data-testid=\"portfolio\"], .portfolio-content, main");
    await expect(portfolioContent.first()).toBeVisible();
    console.log("✅ Conteúdo do portfólio visível");

    // 7. VERIFICAÇÃO DE ERROS NO CONSOLE
    console.log("🔍 Passo 7: Verificando erros no console");
    
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      } else if (msg.type() === "warning") {
        consoleWarnings.push(msg.text());
      }
    });

    // Aguardar um pouco para capturar possíveis erros
    await page.waitForTimeout(2000);
    
    console.log(`📊 Console - Erros: ${consoleErrors.length}, Avisos: ${consoleWarnings.length}`);
    
    if (consoleErrors.length > 0) {
      console.log("⚠️ Erros encontrados no console:", consoleErrors);
      
      // Filtrar erros críticos (ignorar favicon, 404 de recursos não críticos)
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes("favicon") && 
        !error.includes("404") &&
        !error.includes("net::ERR_INTERNET_DISCONNECTED")
      );
      
      if (criticalErrors.length > 0) {
        console.error("❌ Erros críticos encontrados:", criticalErrors);
        expect(criticalErrors.length).toBe(0);
      }
    }

    // 8. CAPTURA DE EVIDÊNCIA VISUAL APÓS O CLIQUE
    console.log("📸 Passo 8: Captura de evidência visual após o clique");
    
    await page.screenshot({ 
      path: "test-results/after-click-moveis-planejados.png",
      fullPage: true 
    });
    console.log("✅ Screenshot após o clique salvo");

    // 9. VERIFICAÇÕES FINAIS DE PERFORMANCE
    console.log("⚡ Passo 9: Verificando métricas de performance");
    
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName("first-paint")[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName("first-contentful-paint")[0]?.startTime || 0
      };
    });

    console.log("📊 Métricas de performance:", performanceMetrics);

    // Verificar se o tempo de carregamento está dentro do aceitável (< 5 segundos)
    expect(performanceMetrics.loadTime).toBeLessThan(5000);
    console.log("✅ Performance dentro do aceitável");

    // 10. RESUMO FINAL DO TESTE
    console.log("🎉 Passo 10: Resumo final do teste");
    
    const testSummary = {
      elementFound: true,
      clickExecuted: true,
      pageLoaded: true,
      noConsoleErrors: consoleErrors.length === 0,
      performanceOk: performanceMetrics.loadTime < 5000,
      evidencesCaptured: true,
      buttonStateChanged: finalAriaSelected === "true" && finalDataState === "active"
    };

    console.log("📊 Resumo do teste:", testSummary);

    // Verificações finais de assertion
    expect(await targetButton.getAttribute("aria-selected")).toBe("true");
    expect(await targetButton.getAttribute("data-state")).toBe("active");
    expect(performanceMetrics.loadTime).toBeLessThan(5000);

    console.log("🎉 Teste concluído com sucesso!");
  });
});