# Processo de Depuração Sistemático
## JP Marcenaria Digital

Este documento descreve o processo completo de depuração utilizando logs estruturados e testes end-to-end (E2E) para identificar e corrigir problemas no sistema.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Sistema de Logs Estruturados](#sistema-de-logs-estruturados)
3. [Testes End-to-End](#testes-end-to-end)
4. [Processo de Depuração](#processo-de-depuração)
5. [Monitoramento e Alertas](#monitoramento-e-alertas)
6. [Reprodução e Correção de Erros](#reprodução-e-correção-de-erros)
7. [Ferramentas e Integração](#ferramentas-e-integração)

## 🎯 Visão Geral

O sistema de depuração implementado oferece:

- **Logs estruturados** com níveis hierárquicos e contexto transacional
- **Testes E2E abrangentes** cobrindo todos os fluxos críticos
- **Monitoramento em tempo real** com Grafana e Prometheus
- **Alertas automatizados** baseados em métricas e logs
- **Processo padronizado** para reprodução e correção de erros

## 📊 Sistema de Logs Estruturados

### Níveis de Log

```typescript
enum LogLevel {
  DEBUG = 0,    // Informações detalhadas para desenvolvimento
  INFO = 1,     // Informações gerais sobre operações
  WARNING = 2,  // Situações que requerem atenção
  ERROR = 3,    // Erros que não impedem o funcionamento
  CRITICAL = 4  // Erros críticos que requerem ação imediata
}
```

### Contexto Transacional

Cada operação é rastreada com:

- **Transaction ID**: Identificador único da operação
- **Session ID**: Identificador da sessão do usuário
- **Module**: Módulo do sistema responsável
- **Operation**: Tipo de operação sendo executada
- **Timestamp**: Momento exato da ocorrência
- **Duration**: Tempo de execução da operação
- **Metadata**: Informações contextuais relevantes

### Exemplo de Uso

```typescript
import { useEnhancedLogging } from '@/utils/enhanced-logging';

const logger = useEnhancedLogging('portfolio');

// Iniciar transação
const transactionId = logger.startTransaction('load_portfolio', {
  category: 'kitchen',
  userId: 'user123'
});

try {
  // Operação
  const data = await loadPortfolioData();
  
  logger.info('Portfolio loaded successfully', {
    itemCount: data.length
  }, transactionId);
  
  // Finalizar transação com sucesso
  logger.endTransaction(transactionId, true, { itemCount: data.length });
  
} catch (error) {
  logger.error('Failed to load portfolio', error, {
    category: 'kitchen'
  }, transactionId);
  
  // Finalizar transação com erro
  logger.endTransaction(transactionId, false, { error: error.message });
}
```

## 🧪 Testes End-to-End

### Cobertura de Testes

Os testes E2E cobrem:

1. **Navegação e Interface**
   - Carregamento de páginas
   - Responsividade
   - Acessibilidade (WCAG AA)

2. **Funcionalidades Principais**
   - Visualização de portfólio
   - Filtros e busca
   - Formulários de contato

3. **Integrações Externas**
   - Supabase (banco de dados)
   - Stripe (pagamentos)
   - APIs de terceiros

4. **Performance**
   - Tempos de carregamento
   - Otimização de recursos
   - Web Vitals

5. **Cenários de Erro**
   - Falhas de rede
   - Páginas não encontradas
   - Validação de formulários

### Executando Testes

```bash
# Todos os testes E2E
npx playwright test

# Testes específicos
npx playwright test comprehensive-e2e.spec.ts

# Com interface gráfica
npx playwright test --ui

# Gerar relatório
npx playwright show-report
```

## 🔍 Processo de Depuração

### 1. Identificação do Problema

#### Via Logs
1. Acesse o dashboard de monitoramento
2. Filtre por nível de log (ERROR/CRITICAL)
3. Identifique o Transaction ID relacionado
4. Trace toda a operação usando o ID

#### Via Testes E2E
1. Execute os testes relacionados à funcionalidade
2. Analise falhas específicas
3. Verifique logs gerados durante os testes

### 2. Análise Detalhada

#### Contexto do Erro
```typescript
// Exemplo de log de erro estruturado
{
  "level": "ERROR",
  "message": "Payment processing failed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "transactionId": "tx_abc123",
  "module": "payment",
  "operation": "process_payment",
  "duration": 5000,
  "context": {
    "amount": 1500.00,
    "paymentMethod": "credit_card",
    "userId": "user_456"
  },
  "error": {
    "code": "CARD_DECLINED",
    "message": "Insufficient funds",
    "stack": "..."
  }
}
```

#### Métricas Relacionadas
- Taxa de erro do módulo
- Tempo de resposta médio
- Volume de transações
- Padrões temporais

### 3. Reprodução do Erro

#### Ambiente de Desenvolvimento
```bash
# 1. Configurar ambiente
npm run dev

# 2. Executar teste específico
npx playwright test --grep "payment processing"

# 3. Verificar logs em tempo real
tail -f logs/application.log
```

#### Dados de Teste
```typescript
// Usar dados que reproduzem o erro
const testData = {
  userId: "user_456",
  amount: 1500.00,
  paymentMethod: "credit_card_declined"
};
```

### 4. Correção e Validação

#### Implementar Correção
1. Identificar causa raiz
2. Implementar fix
3. Adicionar logs adicionais se necessário
4. Atualizar testes E2E

#### Validar Correção
```bash
# 1. Executar testes afetados
npx playwright test --grep "payment"

# 2. Verificar métricas
# - Taxa de erro deve diminuir
# - Tempo de resposta deve melhorar

# 3. Monitorar em produção
# - Alertas devem parar
# - Logs de erro devem diminuir
```

## 📈 Monitoramento e Alertas

### Dashboard Grafana

Acesse: `http://localhost:3000/d/jp-marcenaria`

**Painéis Principais:**
- Taxa de logs por segundo
- Taxa de erro por módulo
- Tempo de resposta (percentis)
- Operações de pagamento
- Métricas de performance

### Alertas Configurados

1. **Taxa de Erro Alta**
   - Condição: > 10% em 5 minutos
   - Severidade: Warning
   - Ação: Notificação por email

2. **Taxa de Erro Crítica**
   - Condição: > 50% em 2 minutos
   - Severidade: Critical
   - Ação: Notificação imediata + SMS

3. **Tempo de Resposta Lento**
   - Condição: P95 > 5 segundos por 10 minutos
   - Severidade: Warning
   - Ação: Investigação de performance

4. **Falha em Pagamento**
   - Condição: Qualquer erro de pagamento
   - Severidade: Critical
   - Ação: Notificação imediata

## 🛠️ Reprodução e Correção de Erros

### Template de Reprodução

```markdown
## Erro: [TÍTULO DO ERRO]

### Informações Básicas
- **Transaction ID**: tx_abc123
- **Timestamp**: 2024-01-15T10:30:00.000Z
- **Módulo**: payment
- **Usuário**: user_456

### Contexto
- **Operação**: Processamento de pagamento
- **Valor**: R$ 1.500,00
- **Método**: Cartão de crédito

### Logs Relacionados
```json
{
  "level": "ERROR",
  "message": "Payment processing failed",
  // ... resto do log
}
```

### Passos para Reprodução
1. Acessar página de checkout
2. Preencher dados do cartão (usar cartão de teste com saldo insuficiente)
3. Clicar em "Finalizar Pagamento"
4. Observar erro

### Correção Implementada
- Melhorar tratamento de erro de cartão recusado
- Adicionar mensagem mais clara para o usuário
- Implementar retry automático para erros temporários

### Validação
- [ ] Teste E2E atualizado
- [ ] Logs verificados
- [ ] Métricas monitoradas
- [ ] Deploy em staging
- [ ] Validação em produção
```

### Checklist de Correção

- [ ] **Identificação**
  - [ ] Transaction ID localizado
  - [ ] Contexto completo coletado
  - [ ] Impacto avaliado

- [ ] **Análise**
  - [ ] Causa raiz identificada
  - [ ] Logs relacionados analisados
  - [ ] Métricas verificadas

- [ ] **Reprodução**
  - [ ] Ambiente configurado
  - [ ] Dados de teste preparados
  - [ ] Erro reproduzido consistentemente

- [ ] **Correção**
  - [ ] Fix implementado
  - [ ] Logs adicionais adicionados
  - [ ] Testes atualizados

- [ ] **Validação**
  - [ ] Testes E2E passando
  - [ ] Métricas melhoradas
  - [ ] Alertas resolvidos
  - [ ] Documentação atualizada

## 🔧 Ferramentas e Integração

### Desenvolvimento Local

```bash
# Iniciar ambiente completo
docker-compose up -d

# Acessar serviços
# - Aplicação: http://localhost:8080
# - Grafana: http://localhost:3000
# - Prometheus: http://localhost:9090
```

### Comandos Úteis

```bash
# Visualizar logs em tempo real
tail -f logs/application.log | jq '.'

# Filtrar logs por nível
grep "ERROR\|CRITICAL" logs/application.log

# Buscar por Transaction ID
grep "tx_abc123" logs/application.log

# Executar testes com logs detalhados
DEBUG=1 npx playwright test

# Gerar relatório de cobertura
npm run test:coverage
```

### Integração CI/CD

```yaml
# .github/workflows/test.yml
name: Tests and Monitoring

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run E2E tests
        run: npx playwright test
        
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## 📞 Suporte e Contato

Para dúvidas sobre o processo de depuração:

- **Documentação**: `/docs/debugging-process.md`
- **Logs**: `/logs/application.log`
- **Monitoramento**: http://localhost:3000
- **Testes**: `npx playwright test --ui`

---

**Última atualização**: Janeiro 2024  
**Versão**: 1.0.0