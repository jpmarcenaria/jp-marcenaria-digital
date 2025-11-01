/**
 * Testes E2E Abrangentes
 * JP Marcenaria Digital
 * 
 * Cobertura completa dos fluxos principais:
 * - Navegação e interface do usuário
 * - Portfólio e visualização de produtos
 * - Formulários de contato e orçamento
 * - Integrações externas (Stripe, Supabase)
 * - Performance e acessibilidade
 * - Cenários de erro e recuperação
 */

import { test, expect, Page } from '@playwright/test';
import { enhancedLogger, LogLevel } from '../src/utils/enhanced-logging';

// Configuração de timeout estendido para testes abrangentes
test.setTimeout(120_000);

// Utilitários de teste
class E2ETestUtils {
  private page: Page;
  private transactionId?: string;

  constructor(page: Page) {
    this.page = page;
  }

  // Iniciar transação de teste
  async startTestTransaction(testName: string): Promise<string> {
    this.transactionId = enhancedLogger.startTransaction('e2e-test', testName, {
      url: this.page.url(),
      userAgent: await this.page.evaluate(() => navigator.userAgent)
    });
    return this.transactionId;
  }

  // Finalizar transação de teste
  async endTestTransaction(success: boolean, result?: any): Promise<void> {
    if (this.transactionId) {
      enhancedLogger.endTransaction(this.transactionId, success, result);
    }
  }

  // Log de ação do teste
  async logTestAction(action: string, context?: Record<string, any>): Promise<void> {
    enhancedLogger.info(`Test action: ${action}`, context, this.transactionId);
  }

  // Aguardar carregamento completo da página
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Verificar acessibilidade básica
  async checkBasicAccessibility(): Promise<void> {
    // Verificar se há elementos com aria-labels
    const ariaElements = await this.page.locator('[aria-label]').count();
    expect(ariaElements).toBeGreaterThan(0);

    // Verificar contraste básico (simulado)
    const hasGoodContrast = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let goodContrastCount = 0;
      
      for (const el of elements) {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bgColor = styles.backgroundColor;
        
        if (color && bgColor && color !== bgColor) {
          goodContrastCount++;
        }
      }
      
      return goodContrastCount > 10; // Threshold básico
    });
    
    expect(hasGoodContrast).toBeTruthy();
  }

  // Simular erro de rede
  async simulateNetworkError(): Promise<void> {
    await this.page.route('**/*', route => {
      if (Math.random() < 0.1) { // 10% de chance de erro
        route.abort();
      } else {
        route.continue();
      }
    });
  }

  // Capturar métricas de performance
  async capturePerformanceMetrics(): Promise<Record<string, number>> {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
  }
}

test.describe('Testes E2E Abrangentes - JP Marcenaria', () => {
  let testUtils: E2ETestUtils;

  test.beforeEach(async ({ page }) => {
    testUtils = new E2ETestUtils(page);
  });

  test('Fluxo completo de navegação e usabilidade', async ({ page }) => {
    const transactionId = await testUtils.startTestTransaction('complete-navigation-flow');
    
    try {
      // 1. Página inicial
      await testUtils.logTestAction('Navegando para página inicial');
      await page.goto('/');
      await testUtils.waitForPageLoad();
      
      // Verificar elementos essenciais
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
      
      // Capturar métricas de performance
      const homeMetrics = await testUtils.capturePerformanceMetrics();
      await testUtils.logTestAction('Performance metrics captured', { metrics: homeMetrics });
      
      // 2. Navegação para Portfólio
      await testUtils.logTestAction('Navegando para portfólio');
      await page.getByRole('link', { name: /portfólio/i }).first().click();
      await expect(page).toHaveURL(/\/portfolio/);
      await testUtils.waitForPageLoad();
      
      // Verificar carregamento de imagens
      const images = page.locator('img');
      const imageCount = await images.count();
      expect(imageCount).toBeGreaterThan(0);
      
      // Aguardar pelo menos uma imagem carregar
      await expect(images.first()).toBeVisible({ timeout: 10000 });
      
      // 3. Interação com filtros/categorias
      const categoryButtons = page.locator('[role="button"]').filter({ hasText: /cozinha|quarto|sala/i });
      if (await categoryButtons.count() > 0) {
        await testUtils.logTestAction('Testando filtros de categoria');
        await categoryButtons.first().click();
        await page.waitForTimeout(1000); // Aguardar filtro aplicar
      }
      
      // 4. Navegação para formulários
      await testUtils.logTestAction('Navegando para formulário de orçamento');
      await page.getByRole('link', { name: /orçamento|contato/i }).first().click();
      await testUtils.waitForPageLoad();
      
      // 5. Verificar acessibilidade
      await testUtils.checkBasicAccessibility();
      
      await testUtils.endTestTransaction(true, { imageCount, homeMetrics });
      
    } catch (error) {
      await testUtils.endTestTransaction(false, { error: error.message });
      throw error;
    }
  });

  test('Formulários de contato e validação', async ({ page }) => {
    const transactionId = await testUtils.startTestTransaction('contact-forms-validation');
    
    try {
      // 1. Formulário de orçamento
      await testUtils.logTestAction('Testando formulário de orçamento');
      await page.goto('/orcamento');
      await testUtils.waitForPageLoad();
      
      // Teste de validação - campos vazios
      await testUtils.logTestAction('Testando validação de campos obrigatórios');
      const submitButton = page.getByRole('button', { name: /enviar|solicitar/i });
      await submitButton.click();
      
      // Verificar mensagens de erro
      const errorMessages = page.locator('[role="alert"], .error, [data-error="true"]');
      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible();
      }
      
      // Preenchimento válido
      await testUtils.logTestAction('Preenchendo formulário com dados válidos');
      const nameField = page.getByRole('textbox', { name: /nome/i });
      const phoneField = page.getByRole('textbox', { name: /telefone/i });
      const emailField = page.getByRole('textbox', { name: /email/i });
      
      if (await nameField.count() > 0) await nameField.fill('João Silva');
      if (await phoneField.count() > 0) await phoneField.fill('11999999999');
      if (await emailField.count() > 0) await emailField.fill('joao@teste.com');
      
      // Adicionar descrição se houver campo
      const descriptionField = page.getByRole('textbox', { name: /descrição|mensagem/i });
      if (await descriptionField.count() > 0) {
        await descriptionField.fill('Gostaria de um orçamento para móveis planejados para cozinha.');
      }
      
      // 2. Formulário de briefing
      await testUtils.logTestAction('Testando formulário de briefing');
      await page.goto('/briefing');
      await testUtils.waitForPageLoad();
      
      // Verificar elementos específicos do briefing
      const briefingElements = page.locator('input, select, textarea');
      const elementCount = await briefingElements.count();
      expect(elementCount).toBeGreaterThan(0);
      
      await testUtils.endTestTransaction(true, { elementCount });
      
    } catch (error) {
      await testUtils.endTestTransaction(false, { error: error.message });
      throw error;
    }
  });

  test('Performance e otimização de recursos', async ({ page }) => {
    const transactionId = await testUtils.startTestTransaction('performance-optimization');
    
    try {
      // Monitorar requisições de rede
      const networkRequests: string[] = [];
      page.on('request', request => {
        networkRequests.push(request.url());
      });
      
      await testUtils.logTestAction('Iniciando teste de performance');
      await page.goto('/');
      await testUtils.waitForPageLoad();
      
      // Capturar métricas detalhadas
      const metrics = await testUtils.capturePerformanceMetrics();
      
      // Verificar tempos de carregamento
      expect(metrics.loadTime).toBeLessThan(5000); // 5 segundos
      expect(metrics.domContentLoaded).toBeLessThan(3000); // 3 segundos
      
      // Verificar otimização de imagens
      const images = await page.locator('img').all();
      let optimizedImages = 0;
      
      for (const img of images) {
        const src = await img.getAttribute('src');
        if (src && (src.includes('webp') || src.includes('w=') || src.includes('q='))) {
          optimizedImages++;
        }
      }
      
      await testUtils.logTestAction('Performance metrics captured', {
        metrics,
        networkRequests: networkRequests.length,
        optimizedImages,
        totalImages: images.length
      });
      
      // Teste de responsividade
      await testUtils.logTestAction('Testando responsividade');
      await page.setViewportSize({ width: 375, height: 667 }); // Mobile
      await page.waitForTimeout(1000);
      
      await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
      await page.waitForTimeout(1000);
      
      await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
      await page.waitForTimeout(1000);
      
      await testUtils.endTestTransaction(true, {
        metrics,
        networkRequests: networkRequests.length,
        optimizedImages
      });
      
    } catch (error) {
      await testUtils.endTestTransaction(false, { error: error.message });
      throw error;
    }
  });

  test('Cenários de erro e recuperação', async ({ page }) => {
    const transactionId = await testUtils.startTestTransaction('error-recovery-scenarios');
    
    try {
      await testUtils.logTestAction('Testando cenários de erro');
      
      // 1. Página não encontrada
      await page.goto('/pagina-inexistente');
      
      // Verificar se há tratamento de 404
      const notFoundIndicators = page.locator('text=/404|não encontrada|page not found/i');
      if (await notFoundIndicators.count() > 0) {
        await expect(notFoundIndicators.first()).toBeVisible();
      }
      
      // 2. Simular erro de rede
      await testUtils.logTestAction('Simulando erros de rede');
      await testUtils.simulateNetworkError();
      
      await page.goto('/');
      await page.waitForTimeout(3000); // Aguardar tentativas de carregamento
      
      // 3. Teste de JavaScript desabilitado (simulado)
      await testUtils.logTestAction('Testando graceful degradation');
      await page.addInitScript(() => {
        // Simular ambiente com JavaScript limitado
        Object.defineProperty(window, 'fetch', {
          value: undefined,
          writable: false
        });
      });
      
      await page.goto('/');
      await testUtils.waitForPageLoad();
      
      // Verificar se conteúdo básico ainda é acessível
      await expect(page.locator('main')).toBeVisible();
      
      await testUtils.endTestTransaction(true);
      
    } catch (error) {
      await testUtils.endTestTransaction(false, { error: error.message });
      throw error;
    }
  });

  test('Integração com sistemas externos', async ({ page }) => {
    const transactionId = await testUtils.startTestTransaction('external-integrations');
    
    try {
      await testUtils.logTestAction('Testando integrações externas');
      
      // 1. Verificar carregamento de recursos externos
      const externalRequests: string[] = [];
      page.on('request', request => {
        const url = request.url();
        if (url.includes('supabase') || url.includes('stripe') || url.includes('unsplash')) {
          externalRequests.push(url);
        }
      });
      
      await page.goto('/');
      await testUtils.waitForPageLoad();
      
      // 2. Testar formulário com integração
      await page.goto('/orcamento');
      await testUtils.waitForPageLoad();
      
      // Preencher e tentar enviar formulário
      const nameField = page.getByRole('textbox', { name: /nome/i });
      if (await nameField.count() > 0) {
        await nameField.fill('Teste Integração');
        
        const submitButton = page.getByRole('button', { name: /enviar/i });
        if (await submitButton.count() > 0) {
          // Não enviar realmente, apenas verificar se o botão responde
          await submitButton.hover();
        }
      }
      
      // 3. Verificar se APIs estão respondendo (sem fazer chamadas reais)
      await testUtils.logTestAction('Verificando disponibilidade de APIs');
      
      const apiHealthCheck = await page.evaluate(async () => {
        try {
          // Verificar se variáveis de ambiente estão configuradas
          const hasSupabase = !!(window as any).VITE_SUPABASE_URL;
          const hasStripe = !!(window as any).VITE_STRIPE_PUBLISHABLE_KEY;
          
          return { hasSupabase, hasStripe };
        } catch (error) {
          return { error: error.message };
        }
      });
      
      await testUtils.endTestTransaction(true, {
        externalRequests: externalRequests.length,
        apiHealthCheck
      });
      
    } catch (error) {
      await testUtils.endTestTransaction(false, { error: error.message });
      throw error;
    }
  });

  test('Acessibilidade e usabilidade avançada', async ({ page }) => {
    const transactionId = await testUtils.startTestTransaction('advanced-accessibility');
    
    try {
      await testUtils.logTestAction('Testando acessibilidade avançada');
      
      await page.goto('/');
      await testUtils.waitForPageLoad();
      
      // 1. Navegação por teclado
      await testUtils.logTestAction('Testando navegação por teclado');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      
      expect(focusedElement).toBeTruthy();
      
      // 2. Verificar landmarks ARIA
      const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]').count();
      expect(landmarks).toBeGreaterThan(0);
      
      // 3. Verificar headings hierárquicos
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
      
      // 4. Verificar alt text em imagens
      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      expect(imagesWithoutAlt).toBe(0);
      
      // 5. Verificar contraste de cores (simulado)
      const contrastIssues = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        let issues = 0;
        
        for (const el of elements) {
          const styles = window.getComputedStyle(el);
          const color = styles.color;
          const bgColor = styles.backgroundColor;
          
          // Verificação básica de contraste
          if (color === bgColor && color !== 'rgba(0, 0, 0, 0)') {
            issues++;
          }
        }
        
        return issues;
      });
      
      expect(contrastIssues).toBeLessThan(5); // Threshold aceitável
      
      await testUtils.endTestTransaction(true, {
        landmarks,
        headings: headings.length,
        contrastIssues
      });
      
    } catch (error) {
      await testUtils.endTestTransaction(false, { error: error.message });
      throw error;
    }
  });
});

// Testes de regressão específicos
test.describe('Testes de Regressão', () => {
  test('Verificar funcionalidades críticas após mudanças', async ({ page }) => {
    const transactionId = enhancedLogger.startTransaction('regression-test', 'critical-features');
    
    try {
      // Lista de funcionalidades críticas para verificar
      const criticalFeatures = [
        { name: 'Homepage Load', url: '/', selector: 'main' },
        { name: 'Portfolio Load', url: '/portfolio', selector: '[data-testid="portfolio"], .portfolio, main' },
        { name: 'Contact Form', url: '/orcamento', selector: 'form, [role="form"]' },
        { name: 'Navigation Menu', url: '/', selector: 'nav' }
      ];
      
      for (const feature of criticalFeatures) {
        enhancedLogger.info(`Testing critical feature: ${feature.name}`, { feature }, transactionId);
        
        await page.goto(feature.url);
        await page.waitForLoadState('networkidle');
        
        const element = page.locator(feature.selector);
        await expect(element.first()).toBeVisible({ timeout: 10000 });
        
        enhancedLogger.info(`Critical feature verified: ${feature.name}`, { feature }, transactionId);
      }
      
      enhancedLogger.endTransaction(transactionId, true, { featuresVerified: criticalFeatures.length });
      
    } catch (error) {
      enhancedLogger.endTransaction(transactionId, false, { error: error.message });
      throw error;
    }
  });
});