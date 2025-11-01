/**
 * Integração com Monitoramento
 * JP Marcenaria Digital
 * 
 * Integração dos logs estruturados com ferramentas de monitoramento:
 * - Exportação de métricas para Prometheus
 * - Dashboards automatizados para Grafana
 * - Alertas baseados em logs
 * - Agregação de dados em tempo real
 */

import { enhancedLogger, LogLevel, StructuredLogEntry } from './enhanced-logging';
import { LogMetrics, StandardLogContext, OperationType, SystemModule, OperationStatus } from './log-standards';

// Interface para métricas do Prometheus
export interface PrometheusMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  help: string;
  labels?: Record<string, string>;
  value: number;
  timestamp?: number;
}

// Interface para configuração de alertas
export interface AlertRule {
  name: string;
  condition: string;
  threshold: number;
  duration: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
  runbook?: string;
}

// Configuração da integração de monitoramento
export interface MonitoringIntegrationConfig {
  prometheusEndpoint?: string;
  grafanaEndpoint?: string;
  alertmanagerEndpoint?: string;
  enableMetricsExport: boolean;
  enableAlerting: boolean;
  metricsInterval: number; // em segundos
  retentionPeriod: number; // em dias
  customLabels?: Record<string, string>;
}

// Classe principal para integração de monitoramento
export class MonitoringIntegration {
  private config: MonitoringIntegrationConfig;
  private metricsBuffer: PrometheusMetric[] = [];
  private alertRules: AlertRule[] = [];
  private metricsTimer?: NodeJS.Timeout;
  private lastFlush: number = Date.now();

  constructor(config: Partial<MonitoringIntegrationConfig> = {}) {
    this.config = {
      prometheusEndpoint: import.meta.env.VITE_PROMETHEUS_ENDPOINT || 'http://localhost:9090',
      grafanaEndpoint: import.meta.env.VITE_GRAFANA_ENDPOINT || 'http://localhost:3000',
      alertmanagerEndpoint: import.meta.env.VITE_ALERTMANAGER_ENDPOINT || 'http://localhost:9093',
      enableMetricsExport: true,
      enableAlerting: true,
      metricsInterval: 30, // 30 segundos
      retentionPeriod: 30, // 30 dias
      customLabels: {
        service: 'jp-marcenaria-digital',
        environment: import.meta.env.VITE_ENVIRONMENT || 'development'
      },
      ...config
    };

    this.setupDefaultAlertRules();
    this.startMetricsCollection();
  }

  // Configurar regras de alerta padrão
  private setupDefaultAlertRules(): void {
    this.alertRules = [
      {
        name: 'HighErrorRate',
        condition: 'rate(jp_errors_total[5m]) > 0.1',
        threshold: 0.1,
        duration: '5m',
        severity: 'warning',
        description: 'Taxa de erro alta detectada'
      },
      {
        name: 'CriticalErrorRate',
        condition: 'rate(jp_errors_total[5m]) > 0.5',
        threshold: 0.5,
        duration: '2m',
        severity: 'critical',
        description: 'Taxa de erro crítica detectada'
      },
      {
        name: 'SlowResponseTime',
        condition: 'histogram_quantile(0.95, jp_request_duration_seconds) > 5',
        threshold: 5,
        duration: '10m',
        severity: 'warning',
        description: 'Tempo de resposta lento detectado'
      },
      {
        name: 'PaymentProcessingFailure',
        condition: 'increase(jp_payment_failures_total[5m]) > 0',
        threshold: 0,
        duration: '1m',
        severity: 'critical',
        description: 'Falha no processamento de pagamento'
      },
      {
        name: 'AuthenticationFailures',
        condition: 'increase(jp_auth_failures_total[5m]) > 10',
        threshold: 10,
        duration: '5m',
        severity: 'warning',
        description: 'Múltiplas falhas de autenticação'
      }
    ];
  }

  // Iniciar coleta de métricas
  private startMetricsCollection(): void {
    if (!this.config.enableMetricsExport) return;

    this.metricsTimer = setInterval(() => {
      this.collectAndExportMetrics();
    }, this.config.metricsInterval * 1000);
  }

  // Processar entrada de log para métricas
  public processLogEntry(entry: StructuredLogEntry): void {
    // Registrar métricas básicas
    LogMetrics.recordLog(entry as any);

    // Converter para métricas do Prometheus
    const metrics = this.convertLogToMetrics(entry);
    this.metricsBuffer.push(...metrics);

    // Verificar alertas
    if (this.config.enableAlerting) {
      this.checkAlerts(entry);
    }
  }

  // Converter log para métricas do Prometheus
  private convertLogToMetrics(entry: StructuredLogEntry): PrometheusMetric[] {
    const metrics: PrometheusMetric[] = [];
    const baseLabels = {
      ...this.config.customLabels,
      module: entry.module,
      level: entry.levelName.toLowerCase()
    };

    // Contador total de logs
    metrics.push({
      name: 'jp_logs_total',
      type: 'counter',
      help: 'Total number of log entries',
      labels: baseLabels,
      value: 1,
      timestamp: new Date(entry.timestamp).getTime()
    });

    // Contador de erros
    if (entry.level >= LogLevel.ERROR) {
      metrics.push({
        name: 'jp_errors_total',
        type: 'counter',
        help: 'Total number of errors',
        labels: {
          ...baseLabels,
          error_type: entry.context?.error?.type || 'unknown'
        },
        value: 1,
        timestamp: new Date(entry.timestamp).getTime()
      });
    }

    // Duração de operações
    if (entry.duration) {
      metrics.push({
        name: 'jp_operation_duration_seconds',
        type: 'histogram',
        help: 'Duration of operations in seconds',
        labels: {
          ...baseLabels,
          operation: entry.operation || 'unknown'
        },
        value: entry.duration / 1000, // converter para segundos
        timestamp: new Date(entry.timestamp).getTime()
      });
    }

    // Métricas específicas por módulo
    if (entry.module === 'payment') {
      metrics.push({
        name: 'jp_payment_operations_total',
        type: 'counter',
        help: 'Total payment operations',
        labels: {
          ...baseLabels,
          status: entry.context?.status || 'unknown'
        },
        value: 1,
        timestamp: new Date(entry.timestamp).getTime()
      });
    }

    if (entry.module === 'auth') {
      metrics.push({
        name: 'jp_auth_operations_total',
        type: 'counter',
        help: 'Total authentication operations',
        labels: {
          ...baseLabels,
          status: entry.context?.status || 'unknown'
        },
        value: 1,
        timestamp: new Date(entry.timestamp).getTime()
      });
    }

    return metrics;
  }

  // Verificar regras de alerta
  private checkAlerts(entry: StructuredLogEntry): void {
    // Verificar alertas baseados em logs individuais
    if (entry.level >= LogLevel.CRITICAL) {
      this.triggerAlert({
        name: 'CriticalLogEntry',
        condition: 'critical_log_detected',
        threshold: 0,
        duration: '0s',
        severity: 'critical',
        description: `Critical log detected: ${entry.message}`,
        runbook: 'Check application logs and system status'
      }, {
        message: entry.message,
        module: entry.module,
        transactionId: entry.transactionId
      });
    }

    // Verificar falhas de pagamento
    if (entry.module === 'payment' && entry.level >= LogLevel.ERROR) {
      this.triggerAlert({
        name: 'PaymentFailure',
        condition: 'payment_error_detected',
        threshold: 0,
        duration: '0s',
        severity: 'critical',
        description: 'Payment processing failure detected'
      }, {
        transactionId: entry.transactionId,
        error: entry.context?.error
      });
    }
  }

  // Disparar alerta
  private triggerAlert(rule: AlertRule, context: Record<string, any> = {}): void {
    const alert = {
      alertname: rule.name,
      severity: rule.severity,
      description: rule.description,
      runbook: rule.runbook,
      timestamp: new Date().toISOString(),
      labels: {
        ...this.config.customLabels,
        alertname: rule.name,
        severity: rule.severity
      },
      annotations: {
        description: rule.description,
        runbook_url: rule.runbook,
        context: JSON.stringify(context)
      }
    };

    // Enviar para Alertmanager
    this.sendToAlertmanager([alert]);

    // Log do alerta
    enhancedLogger.critical(`Alert triggered: ${rule.name}`, null, {
      alert,
      rule,
      context
    });
  }

  // Coletar e exportar métricas
  private async collectAndExportMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    try {
      // Agregar métricas por nome e labels
      const aggregatedMetrics = this.aggregateMetrics(this.metricsBuffer);
      
      // Exportar para Prometheus
      await this.exportToPrometheus(aggregatedMetrics);
      
      // Limpar buffer
      this.metricsBuffer = [];
      this.lastFlush = Date.now();

      enhancedLogger.debug('Metrics exported successfully', {
        metricsCount: aggregatedMetrics.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      enhancedLogger.error('Failed to export metrics', error, {
        metricsCount: this.metricsBuffer.length
      });
    }
  }

  // Agregar métricas similares
  private aggregateMetrics(metrics: PrometheusMetric[]): PrometheusMetric[] {
    const aggregated = new Map<string, PrometheusMetric>();

    for (const metric of metrics) {
      const key = `${metric.name}_${JSON.stringify(metric.labels || {})}`;
      
      if (aggregated.has(key)) {
        const existing = aggregated.get(key)!;
        existing.value += metric.value;
      } else {
        aggregated.set(key, { ...metric });
      }
    }

    return Array.from(aggregated.values());
  }

  // Exportar métricas para Prometheus
  private async exportToPrometheus(metrics: PrometheusMetric[]): Promise<void> {
    if (!this.config.prometheusEndpoint) return;

    const prometheusFormat = this.formatForPrometheus(metrics);
    
    try {
      await fetch(`${this.config.prometheusEndpoint}/api/v1/write`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: prometheusFormat
      });
    } catch (error) {
      console.error('Failed to send metrics to Prometheus:', error);
    }
  }

  // Formatar métricas para Prometheus
  private formatForPrometheus(metrics: PrometheusMetric[]): string {
    let output = '';

    for (const metric of metrics) {
      // Help line
      output += `# HELP ${metric.name} ${metric.help}\n`;
      
      // Type line
      output += `# TYPE ${metric.name} ${metric.type}\n`;
      
      // Metric line
      const labels = metric.labels ? 
        '{' + Object.entries(metric.labels).map(([k, v]) => `${k}="${v}"`).join(',') + '}' : '';
      
      output += `${metric.name}${labels} ${metric.value}`;
      
      if (metric.timestamp) {
        output += ` ${metric.timestamp}`;
      }
      
      output += '\n';
    }

    return output;
  }

  // Enviar alertas para Alertmanager
  private async sendToAlertmanager(alerts: any[]): Promise<void> {
    if (!this.config.alertmanagerEndpoint) return;

    try {
      await fetch(`${this.config.alertmanagerEndpoint}/api/v1/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alerts)
      });
    } catch (error) {
      console.error('Failed to send alerts to Alertmanager:', error);
    }
  }

  // Gerar configuração do Grafana
  public generateGrafanaDashboard(): any {
    return {
      dashboard: {
        id: null,
        title: 'JP Marcenaria Digital - Monitoring',
        tags: ['jp-marcenaria', 'monitoring'],
        timezone: 'browser',
        panels: [
          {
            id: 1,
            title: 'Total Logs',
            type: 'stat',
            targets: [{
              expr: 'rate(jp_logs_total[5m])',
              legendFormat: 'Logs/sec'
            }],
            gridPos: { h: 8, w: 12, x: 0, y: 0 }
          },
          {
            id: 2,
            title: 'Error Rate',
            type: 'stat',
            targets: [{
              expr: 'rate(jp_errors_total[5m])',
              legendFormat: 'Errors/sec'
            }],
            gridPos: { h: 8, w: 12, x: 12, y: 0 }
          },
          {
            id: 3,
            title: 'Response Time',
            type: 'graph',
            targets: [{
              expr: 'histogram_quantile(0.95, jp_operation_duration_seconds)',
              legendFormat: '95th percentile'
            }],
            gridPos: { h: 8, w: 24, x: 0, y: 8 }
          },
          {
            id: 4,
            title: 'Logs by Module',
            type: 'piechart',
            targets: [{
              expr: 'sum by (module) (jp_logs_total)',
              legendFormat: '{{module}}'
            }],
            gridPos: { h: 8, w: 12, x: 0, y: 16 }
          },
          {
            id: 5,
            title: 'Payment Operations',
            type: 'graph',
            targets: [{
              expr: 'rate(jp_payment_operations_total[5m])',
              legendFormat: '{{status}}'
            }],
            gridPos: { h: 8, w: 12, x: 12, y: 16 }
          }
        ],
        time: {
          from: 'now-1h',
          to: 'now'
        },
        refresh: '30s'
      }
    };
  }

  // Obter estatísticas de monitoramento
  public getMonitoringStats(): Record<string, any> {
    return {
      metricsBufferSize: this.metricsBuffer.length,
      lastFlush: new Date(this.lastFlush).toISOString(),
      alertRulesCount: this.alertRules.length,
      config: this.config,
      logMetrics: LogMetrics.getAll()
    };
  }

  // Cleanup
  public destroy(): void {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }
    
    // Flush final das métricas
    this.collectAndExportMetrics();
  }
}

// Instância global da integração de monitoramento
export const monitoringIntegration = new MonitoringIntegration();

// Integrar com o logger aprimorado
if (typeof window !== 'undefined') {
  // Interceptar logs do enhanced logger
  const originalLog = enhancedLogger.constructor.prototype.log;
  enhancedLogger.constructor.prototype.log = function(level: LogLevel, message: string, context?: Record<string, any>, transactionId?: string) {
    // Chamar método original
    const result = originalLog.call(this, level, message, context, transactionId);
    
    // Processar para monitoramento
    const logEntry: StructuredLogEntry = {
      level,
      levelName: LogLevel[level],
      message,
      timestamp: new Date().toISOString(),
      transactionId: transactionId || 'no-transaction',
      sessionId: this.sessionId,
      module: context?.module || 'unknown',
      operation: context?.operation,
      context,
      environment: this.config.environment
    };
    
    monitoringIntegration.processLogEntry(logEntry);
    
    return result;
  };
}

export default monitoringIntegration;