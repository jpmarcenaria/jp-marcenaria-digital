/**
 * Teste E2E - Clique no Botão "Móveis Planejados"
 * JP Marcenaria Digital
 * 
 * Teste específico para validar o clique no botão "Móveis Planejados"
 * com verificações completas de carregamento e evidências visuais.
 */

import { test, expect, Page } from "@playwright/test";
import { enhancedLogger } from "../src/utils/enhanced-logging";

test.describe("Teste de Clique - Botão Móveis Planejados", () => {
  let transactionId: string;

  test.beforeEach(async ({ page }) => {
    // Iniciar transação de teste
    transactionId = enhancedLogger.startTransaction("button-click-test", "moveis-planejados", {
      testName: "Clique no botão Móveis Planejados",
      url: page.url()
    });
  });

  test.afterEach(async ({ page }) => {
    // Finalizar transação
    if (transactionId) {
      enhancedLogger.endTransaction(transactionId, true);
    }
  });

  test("Deve clicar no botão Móveis Planejados e verificar carregamento completo", async ({ page }) => {
    // 1. IDENTIFICAÇÃO CLARA DO ELEMENTO ALVO
    enhancedLogger.info("Iniciando teste de clique no botão Móveis Planejados", {
      step: "1-identificacao-elemento"
    }, transactionId);

    // Navegar para a página inicial
    await page.goto("/portfolio");
    await page.waitForLoadState("networkidle");

    // Identificar o elemento alvo pelo seletor específico
    const targetButton = page.locator("button[role=\"tab\"]").filter({ 
      hasText: "Móveis Planejados" 
    });

    // Verificar se o elemento existe
    await expect(targetButton).toBeVisible({ timeout: 10000 });
    
    enhancedLogger.info("Elemento alvo identificado com sucesso", {
      selector: "button[role=\"tab\"] com texto \"Móveis Planejados\"",
      isVisible: await targetButton.isVisible(),
      isEnabled: await targetButton.isEnabled()
    }, transactionId);

    // 2. CAPTURA DE EVIDÊNCIA VISUAL ANTES DO CLIQUE
    enhancedLogger.info("Capturando evidência visual antes do clique", {
      step: "2-evidencia-antes"
    }, transactionId);

    await page.screenshot({ 
      path: "test-results/before-click-moveis-planejados.png",
      fullPage: true 
    });

    // Verificar estado inicial
    const initialUrl = page.url();
    const initialTitle = await page.title();
    
    enhancedLogger.info("Estado inicial capturado", {
      initialUrl,
      initialTitle,
      screenshotPath: "test-results/before-click-moveis-planejados.png"
    }, transactionId);

    // Verificar se o elemento está visível e habilitado
    await expect(targetButton).toBeVisible();
    await expect(targetButton).toBeEnabled();
    
    // Verificar atributos específicos do botão
    const buttonAttributes = {
      role: await targetButton.getAttribute("role"),
      ariaSelected: await targetButton.getAttribute("aria-selected"),
      dataState: await targetButton.getAttribute("data-state"),
      tabindex: await targetButton.getAttribute("tabindex")
    };

    enhancedLogger.info("Atributos do botão verificados", {
      attributes: buttonAttributes
    }, transactionId);

    // 3. AÇÃO DE CLIQUE SIMULANDO INTERAÇÃO DO USUÁRIO
    enhancedLogger.info("Executando clique no botão", {
      step: "3-acao-clique"
    }, transactionId);

    // Registrar tempo de início do clique
    const clickStartTime = Date.now();

    // Executar o clique
    await targetButton.click();

    const clickDuration = Date.now() - clickStartTime;
    
    enhancedLogger.info("Clique executado com sucesso", {
      clickDuration: `${clickDuration}ms`,
      timestamp: new Date().toISOString()
    }, transactionId);

    // 4. VERIFICAÇÃO DO CARREGAMENTO COMPLETO DA PÁGINA
    enhancedLogger.info("Verificando carregamento completo da página", {
      step: "4-verificacao-carregamento"
    }, transactionId);

    // Aguardar carregamento completo com timeout de 30 segundos
    const loadStartTime = Date.now();
    
    try {
      await page.waitForLoadState("networkidle", { timeout: 30000 });
      await page.waitForLoadState("domcontentloaded", { timeout: 30000 });
      
      const loadDuration = Date.now() - loadStartTime;
      
      enhancedLogger.info("Carregamento completo verificado", {
        loadDuration: `${loadDuration}ms`,
        maxTimeout: "30000ms"
      }, transactionId);

    } catch (error) {
      enhancedLogger.error("Timeout no carregamento da página", error, {
        maxTimeout: "30000ms",
        actualDuration: `${Date.now() - loadStartTime}ms`
      }, transactionId);
      throw error;
    }

    // 5. VERIFICAÇÃO DA URL E ESTADO DA PÁGINA
    const finalUrl = page.url();
    const finalTitle = await page.title();
    
    // Verificar se a URL mudou ou se o estado do botão mudou
    const finalButtonState = {
      ariaSelected: await targetButton.getAttribute("aria-selected"),
      dataState: await targetButton.getAttribute("data-state")
    };

    enhancedLogger.info("Estado final da página verificado", {
      finalUrl,
      finalTitle,
      urlChanged: finalUrl !== initialUrl,
      buttonState: finalButtonState
    }, transactionId);

    // Verificar se o botão agora está ativo (selecionado)
    await expect(targetButton).toHaveAttribute("aria-selected", "true");
    await expect(targetButton).toHaveAttribute("data-state", "active");

    // 6. VERIFICAÇÃO DE RECURSOS CARREGADOS
    enhancedLogger.info("Verificando recursos da página", {
      step: "6-verificacao-recursos"
    }, transactionId);

    // Verificar se imagens foram carregadas
    const images = page.locator("img");
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Aguardar pelo menos uma imagem carregar
      await expect(images.first()).toBeVisible({ timeout: 15000 });
      
      enhancedLogger.info("Imagens verificadas", {
        totalImages: imageCount,
        firstImageVisible: await images.first().isVisible()
      }, transactionId);
    }

    // Verificar se o conteúdo específico dos móveis planejados está visível
    const portfolioContent = page.locator("[data-testid=\"portfolio\"], .portfolio-content, main");
    await expect(portfolioContent.first()).toBeVisible();

    // 7. VERIFICAÇÃO DE ERROS NO CONSOLE
    enhancedLogger.info("Verificando erros no console", {
      step: "7-verificacao-console"
    }, transactionId);

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

    enhancedLogger.info("Verificação de console concluída", {
      consoleErrors: consoleErrors.length,
      consoleWarnings: consoleWarnings.length,
      errors: consoleErrors,
      warnings: consoleWarnings
    }, transactionId);

    // Falhar o teste se houver erros críticos no console
    if (consoleErrors.length > 0) {
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes("favicon") && 
        !error.includes("404") &&
        !error.includes("net::ERR_INTERNET_DISCONNECTED")
      );
      
      if (criticalErrors.length > 0) {
        enhancedLogger.error("Erros críticos encontrados no console", null, {
          criticalErrors
        }, transactionId);
        
        expect(criticalErrors.length).toBe(0);
      }
    }

    // 8. CAPTURA DE EVIDÊNCIA VISUAL APÓS O CLIQUE
    enhancedLogger.info("Capturando evidência visual após o clique", {
      step: "8-evidencia-depois"
    }, transactionId);

    await page.screenshot({ 
      path: "test-results/after-click-moveis-planejados.png",
      fullPage: true 
    });

    // 9. VERIFICAÇÕES FINAIS DE PERFORMANCE
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName("first-paint")[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName("first-contentful-paint")[0]?.startTime || 0
      };
    });

    enhancedLogger.info("Métricas de performance capturadas", {
      performanceMetrics,
      screenshotAfterPath: "test-results/after-click-moveis-planejados.png"
    }, transactionId);

    // Verificar se o tempo de carregamento está dentro do aceitável (< 5 segundos)
    expect(performanceMetrics.loadTime).toBeLessThan(5000);

    // 10. RESUMO FINAL DO TESTE
    enhancedLogger.info("Teste de clique concluído com sucesso", {
      step: "10-resumo-final",
      summary: {
        elementFound: true,
        clickExecuted: true,
        pageLoaded: true,
        noConsoleErrors: consoleErrors.length === 0,
        performanceOk: performanceMetrics.loadTime < 5000,
        evidencesCaptured: true
      }
    }, transactionId);

    // Verificações finais de assertion
    expect(await targetButton.getAttribute("aria-selected")).toBe("true");
    expect(await targetButton.getAttribute("data-state")).toBe("active");
    expect(performanceMetrics.loadTime).toBeLessThan(5000);
  });
});
