/**
 * Setup Global para Testes E2E
 * JP Marcenaria Digital
 */

import { chromium, FullConfig } from '@playwright/test';
import { enhancedLogger } from '../../src/utils/enhanced-logging';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Iniciando setup global dos testes E2E...');
  
  // Inicializar logger para testes
  enhancedLogger.setUser('test-user');
  
  const testSessionId = enhancedLogger.startTransaction('e2e-test-session', 'global-setup', {
    testDir: config.testDir,
    projects: config.projects.map(p => p.name),
    baseURL: config.use?.baseURL
  });

  try {
    // Verificar se o servidor está rodando
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    console.log('🔍 Verificando disponibilidade do servidor...');
    await page.goto(config.use?.baseURL || 'http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // Verificar elementos essenciais
    const hasNav = await page.locator('nav').count() > 0;
    const hasMain = await page.locator('main').count() > 0;
    
    if (!hasNav || !hasMain) {
      throw new Error('Elementos essenciais não encontrados na página');
    }
    
    await browser.close();
    
    enhancedLogger.info('Server health check passed', {
      hasNav,
      hasMain,
      url: config.use?.baseURL
    }, testSessionId);
    
    // Configurar variáveis de ambiente para testes
    process.env.TEST_SESSION_ID = testSessionId;
    process.env.E2E_LOGGING_ENABLED = 'true';
    
    enhancedLogger.endTransaction(testSessionId, true, {
      serverHealthy: true,
      projectsCount: config.projects.length
    });
    
    console.log('✅ Setup global concluído com sucesso');
    
  } catch (error) {
    enhancedLogger.error('Global setup failed', error, {}, testSessionId);
    enhancedLogger.endTransaction(testSessionId, false, { error: error.message });
    
    console.error('❌ Falha no setup global:', error);
    throw error;
  }
}

export default globalSetup;