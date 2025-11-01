/**
 * Sistema de Monitoramento Contínuo de Segurança
 * JP Marcenaria Digital
 * 
 * Monitora continuamente a segurança da integração Stripe
 * e executa testes automatizados em intervalos regulares
 */

import StripeSecurityTester from './stripe-security-tests';
import SecurityTestRunner from './security-test-runner';
import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron';

interface MonitoringConfig {
  enabled: boolean;
  schedules: {
    full: string;        // Teste completo
    critical: string;    // Apenas testes críticos
    webhook: string;     // Monitoramento de webhook
  };
  notifications: {
    email: string[];
    slack?: string;
    discord?: string;
  };
  thresholds: {
    maxCritical: number;
    maxHigh: number;
    responseTime: number; // ms
  };
}

interface SecurityMetric {
  timestamp: string;
  testType: 'full' | 'critical' | 'webhook';
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  responseTime: number;
  status: 'healthy' | 'warning' | 'critical';
}

class ContinuousSecurityMonitor {
  private config: MonitoringConfig;
  private metrics: SecurityMetric[] = [];
  private isRunning: boolean = false;

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (!this.config.enabled) {
      console.log('⏸️  Monitoramento contínuo desabilitado');
      return;
    }

    console.log('🚀 Iniciando monitoramento contínuo de segurança...');
    this.isRunning = true;

    // Agendar testes completos
    cron.schedule(this.config.schedules.full, async () => {
      if (this.isRunning) {
        await this.runFullSecurityScan();
      }
    });

    // Agendar testes críticos
    cron.schedule(this.config.schedules.critical, async () => {
      if (this.isRunning) {
        await this.runCriticalSecurityScan();
      }
    });

    // Agendar monitoramento de webhook
    cron.schedule(this.config.schedules.webhook, async () => {
      if (this.isRunning) {
        await this.monitorWebhookSecurity();
      }
    });

    // Carregar métricas históricas
    await this.loadHistoricalMetrics();

    console.log('✅ Monitoramento contínuo iniciado com sucesso');
    console.log(`📅 Teste completo: ${this.config.schedules.full}`);
    console.log(`🔴 Testes críticos: ${this.config.schedules.critical}`);
    console.log(`🔗 Webhook: ${this.config.schedules.webhook}`);
  }

  async stop(): Promise<void> {
    console.log('⏹️  Parando monitoramento contínuo...');
    this.isRunning = false;
    
    // Salvar métricas antes de parar
    await this.saveMetrics();
    console.log('✅ Monitoramento parado e métricas salvas');
  }

  private async runFullSecurityScan(): Promise<void> {
    console.log('🔍 Executando varredura completa de segurança...');
    
    const startTime = Date.now();
    
    try {
      const tester = new StripeSecurityTester();
      const results = await tester.runAllTests();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const metric = this.createMetric('full', results, responseTime);
      this.metrics.push(metric);

      // Verificar se excedeu limites
      await this.checkThresholds(metric);

      // Salvar métricas
      await this.saveMetrics();

      console.log(`✅ Varredura completa finalizada em ${responseTime}ms`);
      
    } catch (error) {
      console.error('❌ Erro na varredura completa:', error);
      await this.sendAlert('Falha na varredura completa de segurança', error);
    }
  }

  private async runCriticalSecurityScan(): Promise<void> {
    console.log('🔴 Executando testes críticos de segurança...');
    
    const startTime = Date.now();
    
    try {
      const runner = new SecurityTestRunner({
        environment: 'production',
        outputFormat: 'json',
        includeEvidence: false,
        severityFilter: ['CRITICAL'],
        generateReport: false
      });

      // Executar apenas testes críticos
      const tester = new StripeSecurityTester();
      const allResults = await tester.runAllTests();
      const criticalResults = allResults.filter(r => r.severity === 'CRITICAL');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const metric = this.createMetric('critical', criticalResults, responseTime);
      this.metrics.push(metric);

      // Verificar se há vulnerabilidades críticas
      if (metric.vulnerabilities.critical > 0) {
        await this.sendCriticalAlert(metric);
      }

      await this.saveMetrics();
      console.log(`✅ Testes críticos finalizados em ${responseTime}ms`);
      
    } catch (error) {
      console.error('❌ Erro nos testes críticos:', error);
      await this.sendAlert('Falha nos testes críticos de segurança', error);
    }
  }

  private async monitorWebhookSecurity(): Promise<void> {
    console.log('🔗 Monitorando segurança do webhook...');
    
    const startTime = Date.now();
    
    try {
      // Testar webhook com diferentes payloads maliciosos
      const webhookTests = [
        this.testWebhookSignatureValidation(),
        this.testWebhookReplayAttack(),
        this.testWebhookPayloadInjection()
      ];

      const results = await Promise.all(webhookTests);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const metric = this.createMetric('webhook', results.flat(), responseTime);
      this.metrics.push(metric);

      await this.checkThresholds(metric);
      await this.saveMetrics();

      console.log(`✅ Monitoramento de webhook finalizado em ${responseTime}ms`);
      
    } catch (error) {
      console.error('❌ Erro no monitoramento de webhook:', error);
      await this.sendAlert('Falha no monitoramento de webhook', error);
    }
  }

  private async testWebhookSignatureValidation(): Promise<any[]> {
    // Implementar teste específico de validação de assinatura
    return [];
  }

  private async testWebhookReplayAttack(): Promise<any[]> {
    // Implementar teste de ataque de replay
    return [];
  }

  private async testWebhookPayloadInjection(): Promise<any[]> {
    // Implementar teste de injeção no payload
    return [];
  }

  private createMetric(testType: 'full' | 'critical' | 'webhook', results: any[], responseTime: number): SecurityMetric {
    const vulnerabilities = {
      critical: results.filter(r => r.severity === 'CRITICAL').length,
      high: results.filter(r => r.severity === 'HIGH').length,
      medium: results.filter(r => r.severity === 'MEDIUM').length,
      low: results.filter(r => r.severity === 'LOW').length
    };

    const status = this.determineStatus(vulnerabilities, responseTime);

    return {
      timestamp: new Date().toISOString(),
      testType,
      vulnerabilities,
      responseTime,
      status
    };
  }

  private determineStatus(vulnerabilities: any, responseTime: number): 'healthy' | 'warning' | 'critical' {
    if (vulnerabilities.critical > this.config.thresholds.maxCritical) {
      return 'critical';
    }
    
    if (vulnerabilities.high > this.config.thresholds.maxHigh || 
        responseTime > this.config.thresholds.responseTime) {
      return 'warning';
    }
    
    return 'healthy';
  }

  private async checkThresholds(metric: SecurityMetric): Promise<void> {
    if (metric.status === 'critical') {
      await this.sendCriticalAlert(metric);
    } else if (metric.status === 'warning') {
      await this.sendWarningAlert(metric);
    }
  }

  private async sendCriticalAlert(metric: SecurityMetric): Promise<void> {
    const message = `
🚨 ALERTA CRÍTICO DE SEGURANÇA 🚨

Vulnerabilidades críticas detectadas no sistema de pagamento:
- Críticas: ${metric.vulnerabilities.critical}
- Altas: ${metric.vulnerabilities.high}
- Tempo de resposta: ${metric.responseTime}ms
- Timestamp: ${metric.timestamp}

AÇÃO IMEDIATA NECESSÁRIA!
`;

    await this.sendAlert('ALERTA CRÍTICO - Vulnerabilidades de Segurança', message);
  }

  private async sendWarningAlert(metric: SecurityMetric): Promise<void> {
    const message = `
⚠️ Alerta de Segurança

Problemas de segurança detectados:
- Vulnerabilidades altas: ${metric.vulnerabilities.high}
- Tempo de resposta: ${metric.responseTime}ms
- Status: ${metric.status}
- Timestamp: ${metric.timestamp}

Recomenda-se revisão em 24h.
`;

    await this.sendAlert('Alerta de Segurança', message);
  }

  private async sendAlert(subject: string, message: string | Error): Promise<void> {
    console.log(`📧 Enviando alerta: ${subject}`);
    
    // Implementar notificações por email
    if (this.config.notifications.email.length > 0) {
      // await this.sendEmailAlert(subject, message);
    }

    // Implementar notificações Slack
    if (this.config.notifications.slack) {
      // await this.sendSlackAlert(subject, message);
    }

    // Implementar notificações Discord
    if (this.config.notifications.discord) {
      // await this.sendDiscordAlert(subject, message);
    }
  }

  private async loadHistoricalMetrics(): Promise<void> {
    try {
      const metricsPath = path.join(__dirname, '..', 'data', 'security-metrics.json');
      const data = await fs.readFile(metricsPath, 'utf-8');
      this.metrics = JSON.parse(data);
      console.log(`📊 Carregadas ${this.metrics.length} métricas históricas`);
    } catch (error) {
      console.log('📊 Nenhuma métrica histórica encontrada, iniciando nova coleta');
      this.metrics = [];
    }
  }

  private async saveMetrics(): Promise<void> {
    try {
      const dataDir = path.join(__dirname, '..', 'data');
      await fs.mkdir(dataDir, { recursive: true });
      
      const metricsPath = path.join(dataDir, 'security-metrics.json');
      
      // Manter apenas últimas 1000 métricas
      const recentMetrics = this.metrics.slice(-1000);
      
      await fs.writeFile(metricsPath, JSON.stringify(recentMetrics, null, 2));
    } catch (error) {
      console.error('❌ Erro ao salvar métricas:', error);
    }
  }

  // Métodos para análise de tendências
  async generateTrendReport(): Promise<string> {
    const last30Days = this.metrics.filter(m => {
      const metricDate = new Date(m.timestamp);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return metricDate >= thirtyDaysAgo;
    });

    const avgCritical = last30Days.reduce((sum, m) => sum + m.vulnerabilities.critical, 0) / last30Days.length;
    const avgHigh = last30Days.reduce((sum, m) => sum + m.vulnerabilities.high, 0) / last30Days.length;
    const avgResponseTime = last30Days.reduce((sum, m) => sum + m.responseTime, 0) / last30Days.length;

    return `
# RELATÓRIO DE TENDÊNCIAS DE SEGURANÇA (30 dias)

## Métricas Médias
- Vulnerabilidades Críticas: ${avgCritical.toFixed(2)}
- Vulnerabilidades Altas: ${avgHigh.toFixed(2)}
- Tempo de Resposta: ${avgResponseTime.toFixed(0)}ms

## Status Geral
- Total de Verificações: ${last30Days.length}
- Alertas Críticos: ${last30Days.filter(m => m.status === 'critical').length}
- Alertas de Aviso: ${last30Days.filter(m => m.status === 'warning').length}

## Recomendações
${avgCritical > 0 ? '⚠️ Vulnerabilidades críticas persistentes - revisar imediatamente' : '✅ Nenhuma vulnerabilidade crítica persistente'}
${avgHigh > 2 ? '⚠️ Alto número de vulnerabilidades de risco alto' : '✅ Vulnerabilidades de alto risco sob controle'}
${avgResponseTime > 5000 ? '⚠️ Tempo de resposta elevado - otimizar testes' : '✅ Tempo de resposta adequado'}
`;
  }

  // Método para dashboard em tempo real
  getCurrentStatus(): any {
    const latestMetric = this.metrics[this.metrics.length - 1];
    
    return {
      status: latestMetric?.status || 'unknown',
      lastCheck: latestMetric?.timestamp || 'never',
      vulnerabilities: latestMetric?.vulnerabilities || { critical: 0, high: 0, medium: 0, low: 0 },
      responseTime: latestMetric?.responseTime || 0,
      isMonitoring: this.isRunning
    };
  }
}

// Configuração padrão
const DEFAULT_CONFIG: MonitoringConfig = {
  enabled: true,
  schedules: {
    full: '0 2 * * *',      // Diariamente às 2h
    critical: '0 */6 * * *', // A cada 6 horas
    webhook: '*/15 * * * *'  // A cada 15 minutos
  },
  notifications: {
    email: ['security@jpmarcenaria.com', 'dev@jpmarcenaria.com']
  },
  thresholds: {
    maxCritical: 0,
    maxHigh: 2,
    responseTime: 10000 // 10 segundos
  }
};

// Exportar para uso
export { ContinuousSecurityMonitor, DEFAULT_CONFIG };
export default ContinuousSecurityMonitor;