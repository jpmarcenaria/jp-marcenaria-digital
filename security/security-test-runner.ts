/**
 * Script Executor de Testes de Segurança MCP
 * JP Marcenaria Digital
 * 
 * Executa bateria completa de testes de segurança para integração Stripe
 */

import StripeSecurityTester from './stripe-security-tests';
import fs from 'fs/promises';
import path from 'path';

// Configurações por ambiente
const ENVIRONMENTS = {
  development: {
    baseUrl: 'http://localhost:3000',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY_TEST,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY_TEST,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_TEST
  },
  staging: {
    baseUrl: 'https://staging.jpmarcenaria.com',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY_STAGING,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY_STAGING,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_STAGING
  },
  production: {
    baseUrl: 'https://jpmarcenaria.com',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY_PROD,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY_PROD,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_PROD
  }
};

interface TestExecutionConfig {
  environment: keyof typeof ENVIRONMENTS;
  outputFormat: 'json' | 'html' | 'pdf' | 'console';
  includeEvidence: boolean;
  severityFilter: string[];
  generateReport: boolean;
}

class SecurityTestRunner {
  private config: TestExecutionConfig;
  private tester: StripeSecurityTester;

  constructor(config: TestExecutionConfig) {
    this.config = config;
    this.tester = new StripeSecurityTester();
  }

  async executeTests(): Promise<void> {
    console.log(`🔒 Iniciando testes de segurança MCP - Ambiente: ${this.config.environment}`);
    console.log(`📊 Formato de saída: ${this.config.outputFormat}`);
    console.log(`🎯 Filtros de severidade: ${this.config.severityFilter.join(', ')}\n`);

    try {
      // Configurar ambiente
      this.setupEnvironment();

      // Executar testes
      const results = await this.tester.runAllTests();

      // Filtrar resultados por severidade
      const filteredResults = this.filterBySeverity(results);

      // Gerar relatórios
      if (this.config.generateReport) {
        await this.generateReports(filteredResults);
      }

      // Exibir resumo
      this.displaySummary(filteredResults);

    } catch (error) {
      console.error('❌ Erro durante execução dos testes:', error);
      process.exit(1);
    }
  }

  private setupEnvironment(): void {
    const env = ENVIRONMENTS[this.config.environment];
    
    // Configurar variáveis de ambiente para os testes
    process.env.TEST_BASE_URL = env.baseUrl;
    process.env.STRIPE_PUBLISHABLE_KEY_TEST = env.stripePublishableKey;
    process.env.STRIPE_SECRET_KEY_TEST = env.stripeSecretKey;
    process.env.STRIPE_WEBHOOK_SECRET_TEST = env.webhookSecret;
  }

  private filterBySeverity(results: any[]): any[] {
    if (this.config.severityFilter.length === 0) {
      return results;
    }
    return results.filter(result => 
      this.config.severityFilter.includes(result.severity)
    );
  }

  private async generateReports(results: any[]): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportDir = path.join(__dirname, '..', 'reports', 'security');
    
    // Criar diretório se não existir
    await fs.mkdir(reportDir, { recursive: true });

    switch (this.config.outputFormat) {
      case 'json':
        await this.generateJSONReport(results, reportDir, timestamp);
        break;
      case 'html':
        await this.generateHTMLReport(results, reportDir, timestamp);
        break;
      case 'pdf':
        await this.generatePDFReport(results, reportDir, timestamp);
        break;
      default:
        console.log(this.tester.generateSecurityReport());
    }
  }

  private async generateJSONReport(results: any[], reportDir: string, timestamp: string): Promise<void> {
    const reportPath = path.join(reportDir, `security-report-${timestamp}.json`);
    
    const report = {
      metadata: {
        timestamp: new Date().toISOString(),
        environment: this.config.environment,
        totalTests: results.length,
        summary: this.generateSummary(results)
      },
      results: results
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Relatório JSON gerado: ${reportPath}`);
  }

  private async generateHTMLReport(results: any[], reportDir: string, timestamp: string): Promise<void> {
    const reportPath = path.join(reportDir, `security-report-${timestamp}.html`);
    
    const html = this.generateHTMLContent(results);
    await fs.writeFile(reportPath, html);
    console.log(`🌐 Relatório HTML gerado: ${reportPath}`);
  }

  private generateHTMLContent(results: any[]): string {
    const summary = this.generateSummary(results);
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Segurança - JP Marcenaria Digital</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #1f2937; color: white; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
        .metric { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; }
        .critical { background: #fee2e2; border-left: 4px solid #dc2626; }
        .high { background: #fef3c7; border-left: 4px solid #f59e0b; }
        .medium { background: #dbeafe; border-left: 4px solid #3b82f6; }
        .low { background: #d1fae5; border-left: 4px solid #10b981; }
        .result { margin: 10px 0; padding: 15px; border-radius: 8px; }
        .evidence { background: #f9fafb; padding: 10px; border-radius: 4px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔒 Relatório de Segurança MCP</h1>
        <p>JP Marcenaria Digital - Integração Stripe</p>
        <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        <p>Ambiente: ${this.config.environment}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Críticas</h3>
            <h2 style="color: #dc2626;">${summary.critical}</h2>
        </div>
        <div class="metric">
            <h3>Altas</h3>
            <h2 style="color: #f59e0b;">${summary.high}</h2>
        </div>
        <div class="metric">
            <h3>Médias</h3>
            <h2 style="color: #3b82f6;">${summary.medium}</h2>
        </div>
        <div class="metric">
            <h3>Baixas</h3>
            <h2 style="color: #10b981;">${summary.low}</h2>
        </div>
    </div>

    <h2>📋 Detalhes das Vulnerabilidades</h2>
    ${results.map(result => `
        <div class="result ${result.severity.toLowerCase()}">
            <h3>${result.testName}</h3>
            <p><strong>Status:</strong> ${result.status}</p>
            <p><strong>Severidade:</strong> ${result.severity}</p>
            ${result.cvssScore ? `<p><strong>CVSS:</strong> ${result.cvssScore}</p>` : ''}
            ${result.cweId ? `<p><strong>CWE:</strong> ${result.cweId}</p>` : ''}
            <p><strong>Descrição:</strong> ${result.description}</p>
            <p><strong>Recomendação:</strong> ${result.recommendation}</p>
            ${result.evidence ? `
                <details>
                    <summary>Evidências</summary>
                    <div class="evidence">${result.evidence.join('<br>')}</div>
                </details>
            ` : ''}
        </div>
    `).join('')}

    <div style="margin-top: 40px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
        <h3>📈 Próximos Passos</h3>
        <ol>
            <li>Corrigir vulnerabilidades críticas imediatamente</li>
            <li>Implementar correções para vulnerabilidades altas em 7 dias</li>
            <li>Planejar correções para vulnerabilidades médias em 30 dias</li>
            <li>Estabelecer testes contínuos de segurança</li>
        </ol>
    </div>
</body>
</html>`;
  }

  private async generatePDFReport(results: any[], reportDir: string, timestamp: string): Promise<void> {
    // Implementação futura com puppeteer ou similar
    console.log('📄 Geração de PDF será implementada em versão futura');
  }

  private generateSummary(results: any[]): any {
    return {
      critical: results.filter(r => r.severity === 'CRITICAL').length,
      high: results.filter(r => r.severity === 'HIGH').length,
      medium: results.filter(r => r.severity === 'MEDIUM').length,
      low: results.filter(r => r.severity === 'LOW').length,
      total: results.length
    };
  }

  private displaySummary(results: any[]): void {
    const summary = this.generateSummary(results);
    
    console.log('\n📊 RESUMO DOS TESTES DE SEGURANÇA');
    console.log('=====================================');
    console.log(`🔴 Vulnerabilidades Críticas: ${summary.critical}`);
    console.log(`🟠 Vulnerabilidades Altas: ${summary.high}`);
    console.log(`🟡 Vulnerabilidades Médias: ${summary.medium}`);
    console.log(`🟢 Vulnerabilidades Baixas: ${summary.low}`);
    console.log(`📈 Total de Testes: ${summary.total}`);
    
    if (summary.critical > 0) {
      console.log('\n⚠️  AÇÃO IMEDIATA NECESSÁRIA: Vulnerabilidades críticas encontradas!');
    } else if (summary.high > 0) {
      console.log('\n⚠️  Vulnerabilidades altas requerem atenção em 7 dias');
    } else {
      console.log('\n✅ Nenhuma vulnerabilidade crítica ou alta encontrada');
    }
  }
}

// CLI Interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  const config: TestExecutionConfig = {
    environment: (args[0] as keyof typeof ENVIRONMENTS) || 'development',
    outputFormat: (args[1] as any) || 'console',
    includeEvidence: args.includes('--evidence'),
    severityFilter: args.includes('--critical-only') ? ['CRITICAL'] : 
                   args.includes('--high-and-critical') ? ['CRITICAL', 'HIGH'] : [],
    generateReport: !args.includes('--no-report')
  };

  const runner = new SecurityTestRunner(config);
  await runner.executeTests();
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export default SecurityTestRunner;