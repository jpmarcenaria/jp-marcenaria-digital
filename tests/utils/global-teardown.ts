/**
 * Teardown Global para Testes E2E
 * JP Marcenaria Digital
 */

import { FullConfig } from '@playwright/test';
import { enhancedLogger } from '../../src/utils/enhanced-logging';
import { LogMetrics } from '../../src/utils/log-standards';
import fs from 'fs/promises';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🏁 Iniciando teardown global dos testes E2E...');
  
  const testSessionId = process.env.TEST_SESSION_ID;
  const teardownTransactionId = enhancedLogger.startTransaction('e2e-test-session', 'global-teardown');

  try {
    // Coletar métricas finais dos testes
    const metrics = LogMetrics.getAll();
    const performanceMetrics = enhancedLogger.getPerformanceMetrics();
    
    enhancedLogger.info('Test session completed', {
      metrics,
      performanceMetrics,
      testSessionId
    }, teardownTransactionId);

    // Gerar relatório de logs dos testes
    const testReport = {
      sessionId: testSessionId,
      timestamp: new Date().toISOString(),
      metrics,
      performanceMetrics,
      config: {
        testDir: config.testDir,
        timeout: config.timeout,
        projects: config.projects.map(p => ({
          name: p.name,
          testDir: p.testDir
        }))
      }
    };

    // Salvar relatório
    const reportPath = path.join('test-results', 'logging-report.json');
    await fs.mkdir('test-results', { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(testReport, null, 2));
    
    console.log(`📊 Relatório de logs salvo em: ${reportPath}`);

    // Gerar resumo no console
    console.log('\n📈 Resumo dos Testes:');
    console.log(`   Total de logs: ${metrics['logs.total'] || 0}`);
    console.log(`   Erros: ${metrics['errors.total'] || 0}`);
    console.log(`   Transações ativas: ${performanceMetrics.activeTransactions || 0}`);
    console.log(`   Buffer de logs: ${performanceMetrics.bufferSize || 0}`);

    // Finalizar logger
    enhancedLogger.endTransaction(teardownTransactionId, true, {
      reportPath,
      metricsCount: Object.keys(metrics).length
    });
    
    // Cleanup final
    enhancedLogger.destroy();
    LogMetrics.reset();
    
    console.log('✅ Teardown global concluído com sucesso');
    
  } catch (error) {
    enhancedLogger.error('Global teardown failed', error, {}, teardownTransactionId);
    enhancedLogger.endTransaction(teardownTransactionId, false, { error: error.message });
    
    console.error('❌ Falha no teardown global:', error);
    // Não lançar erro para não falhar os testes
  }
}

export default globalTeardown;