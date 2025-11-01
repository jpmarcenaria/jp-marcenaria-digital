/**
 * Padrões e Templates de Log
 * JP Marcenaria Digital
 * 
 * Padronização de mensagens de log para facilitar análise e debugging:
 * - Templates consistentes por tipo de operação
 * - Contexto padronizado por módulo
 * - Formatação estruturada para ferramentas de análise
 * - Classificação automática de severidade
 */

import { LogLevel } from './enhanced-logging';

// Tipos de operação padronizados
export enum OperationType {
  USER_ACTION = 'user_action',
  API_CALL = 'api_call',
  DATABASE_OPERATION = 'database_operation',
  FILE_OPERATION = 'file_operation',
  AUTHENTICATION = 'authentication',
  PAYMENT_PROCESSING = 'payment_processing',
  EMAIL_SENDING = 'email_sending',
  IMAGE_PROCESSING = 'image_processing',
  FORM_SUBMISSION = 'form_submission',
  NAVIGATION = 'navigation',
  ERROR_HANDLING = 'error_handling',
  PERFORMANCE_MONITORING = 'performance_monitoring'
}

// Módulos do sistema
export enum SystemModule {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  DATABASE = 'database',
  AUTH = 'auth',
  PAYMENT = 'payment',
  EMAIL = 'email',
  STORAGE = 'storage',
  API = 'api',
  UI = 'ui',
  PORTFOLIO = 'portfolio',
  FORMS = 'forms',
  MONITORING = 'monitoring'
}

// Status de operação
export enum OperationStatus {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
  RETRY = 'retry'
}

// Interface para contexto padronizado
export interface StandardLogContext {
  module: SystemModule;
  operation: OperationType;
  status: OperationStatus;
  userId?: string;
  sessionId?: string;
  transactionId?: string;
  duration?: number;
  metadata?: Record<string, any>;
  error?: {
    code?: string;
    message?: string;
    stack?: string;
    type?: string;
  };
  performance?: {
    startTime?: number;
    endTime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: any;
    ip?: string;
    userAgent?: string;
  };
  response?: {
    statusCode?: number;
    headers?: Record<string, string>;
    body?: any;
    size?: number;
  };
}

// Templates de mensagens padronizadas
export class LogMessageTemplates {
  // Template para ações do usuário
  static userAction(action: string, context: Partial<StandardLogContext> = {}): { message: string; context: StandardLogContext } {
    return {
      message: `User action: ${action}`,
      context: {
        module: SystemModule.FRONTEND,
        operation: OperationType.USER_ACTION,
        status: OperationStatus.COMPLETED,
        ...context
      }
    };
  }

  // Template para chamadas de API
  static apiCall(endpoint: string, method: string, context: Partial<StandardLogContext> = {}): { message: string; context: StandardLogContext } {
    return {
      message: `API call: ${method} ${endpoint}`,
      context: {
        module: SystemModule.API,
        operation: OperationType.API_CALL,
        status: OperationStatus.STARTED,
        request: {
          method,
          url: endpoint,
          ...context.request
        },
        ...context
      }
    };
  }

  // Template para operações de banco de dados
  static databaseOperation(operation: string, table: string, context: Partial<StandardLogContext> = {}): { message: string; context: StandardLogContext } {
    return {
      message: `Database operation: ${operation} on ${table}`,
      context: {
        module: SystemModule.DATABASE,
        operation: OperationType.DATABASE_OPERATION,
        status: OperationStatus.STARTED,
        metadata: {
          table,
          operation,
          ...context.metadata
        },
        ...context
      }
    };
  }

  // Template para autenticação
  static authentication(action: string, context: Partial<StandardLogContext> = {}): { message: string; context: StandardLogContext } {
    return {
      message: `Authentication: ${action}`,
      context: {
        module: SystemModule.AUTH,
        operation: OperationType.AUTHENTICATION,
        status: OperationStatus.STARTED,
        ...context
      }
    };
  }

  // Template para processamento de pagamento
  static paymentProcessing(action: string, amount?: number, context: Partial<StandardLogContext> = {}): { message: string; context: StandardLogContext } {
    return {
      message: `Payment processing: ${action}${amount ? ` - R$ ${amount}` : ''}`,
      context: {
        module: SystemModule.PAYMENT,
        operation: OperationType.PAYMENT_PROCESSING,
        status: OperationStatus.STARTED,
        metadata: {
          amount,
          ...context.metadata
        },
        ...context
      }
    };
  }

  // Template para envio de email
  static emailSending(recipient: string, subject: string, context: Partial<StandardLogContext> = {}): { message: string; context: StandardLogContext } {
    return {
      message: `Email sending: ${subject} to ${recipient}`,
      context: {
        module: SystemModule.EMAIL,
        operation: OperationType.EMAIL_SENDING,
        status: OperationStatus.STARTED,
        metadata: {
          recipient,
          subject,
          ...context.metadata
        },
        ...context
      }
    };
  }

  // Template para submissão de formulário
  static formSubmission(formType: string, context: Partial<StandardLogContext> = {}): { message: string; context: StandardLogContext } {
    return {
      message: `Form submission: ${formType}`,
      context: {
        module: SystemModule.FORMS,
        operation: OperationType.FORM_SUBMISSION,
        status: OperationStatus.STARTED,
        metadata: {
          formType,
          ...context.metadata
        },
        ...context
      }
    };
  }

  // Template para navegação
  static navigation(from: string, to: string, context: Partial<StandardLogContext> = {}): { message: string; context: StandardLogContext } {
    return {
      message: `Navigation: ${from} → ${to}`,
      context: {
        module: SystemModule.UI,
        operation: OperationType.NAVIGATION,
        status: OperationStatus.COMPLETED,
        metadata: {
          from,
          to,
          ...context.metadata
        },
        ...context
      }
    };
  }

  // Template para tratamento de erro
  static errorHandling(error: Error | string, context: Partial<StandardLogContext> = {}): { message: string; context: StandardLogContext } {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'object' ? error.stack : undefined;
    
    return {
      message: `Error handled: ${errorMessage}`,
      context: {
        module: SystemModule.FRONTEND,
        operation: OperationType.ERROR_HANDLING,
        status: OperationStatus.FAILED,
        error: {
          message: errorMessage,
          stack: errorStack,
          type: typeof error === 'object' ? error.constructor.name : 'String',
          ...context.error
        },
        ...context
      }
    };
  }

  // Template para monitoramento de performance
  static performanceMonitoring(metric: string, value: number, context: Partial<StandardLogContext> = {}): { message: string; context: StandardLogContext } {
    return {
      message: `Performance metric: ${metric} = ${value}`,
      context: {
        module: SystemModule.MONITORING,
        operation: OperationType.PERFORMANCE_MONITORING,
        status: OperationStatus.COMPLETED,
        performance: {
          ...context.performance
        },
        metadata: {
          metric,
          value,
          ...context.metadata
        },
        ...context
      }
    };
  }
}

// Utilitários para padronização de logs
export class LogStandardsUtils {
  // Determinar nível de log baseado no contexto
  static determineLogLevel(context: StandardLogContext): LogLevel {
    // Erros críticos
    if (context.status === OperationStatus.FAILED && 
        (context.operation === OperationType.PAYMENT_PROCESSING || 
         context.operation === OperationType.AUTHENTICATION)) {
      return LogLevel.CRITICAL;
    }

    // Erros gerais
    if (context.status === OperationStatus.FAILED || 
        context.status === OperationStatus.TIMEOUT) {
      return LogLevel.ERROR;
    }

    // Avisos
    if (context.status === OperationStatus.RETRY || 
        context.status === OperationStatus.CANCELLED) {
      return LogLevel.WARNING;
    }

    // Operações importantes
    if (context.operation === OperationType.PAYMENT_PROCESSING ||
        context.operation === OperationType.AUTHENTICATION ||
        context.operation === OperationType.FORM_SUBMISSION) {
      return LogLevel.INFO;
    }

    // Debug para o resto
    return LogLevel.DEBUG;
  }

  // Sanitizar dados sensíveis
  static sanitizeContext(context: StandardLogContext): StandardLogContext {
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard', 'ssn', 'cpf'];
    const sanitized = { ...context };

    // Sanitizar metadata
    if (sanitized.metadata) {
      sanitized.metadata = this.sanitizeObject(sanitized.metadata, sensitiveFields);
    }

    // Sanitizar request body
    if (sanitized.request?.body) {
      sanitized.request.body = this.sanitizeObject(sanitized.request.body, sensitiveFields);
    }

    // Sanitizar response body
    if (sanitized.response?.body) {
      sanitized.response.body = this.sanitizeObject(sanitized.response.body, sensitiveFields);
    }

    return sanitized;
  }

  // Sanitizar objeto recursivamente
  private static sanitizeObject(obj: any, sensitiveFields: string[]): any {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        (sanitized as any)[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        (sanitized as any)[key] = this.sanitizeObject(value, sensitiveFields);
      } else {
        (sanitized as any)[key] = value;
      }
    }

    return sanitized;
  }

  // Gerar tags para categorização
  static generateTags(context: StandardLogContext): string[] {
    const tags: string[] = [];

    tags.push(`module:${context.module}`);
    tags.push(`operation:${context.operation}`);
    tags.push(`status:${context.status}`);

    if (context.userId) {
      tags.push(`user:${context.userId}`);
    }

    if (context.error) {
      tags.push('has_error');
      if (context.error.type) {
        tags.push(`error_type:${context.error.type}`);
      }
    }

    if (context.performance) {
      tags.push('has_performance');
    }

    return tags;
  }

  // Formatar duração em formato legível
  static formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${Math.round(milliseconds)}ms`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
      return `${minutes}m ${seconds}s`;
    }
  }

  // Validar contexto de log
  static validateContext(context: StandardLogContext): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!context.module) {
      errors.push('Module is required');
    }

    if (!context.operation) {
      errors.push('Operation is required');
    }

    if (!context.status) {
      errors.push('Status is required');
    }

    if (context.status === OperationStatus.FAILED && !context.error) {
      errors.push('Error context is required for failed operations');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Classe para métricas de log
export class LogMetrics {
  private static metrics: Map<string, number> = new Map();

  // Incrementar contador de métrica
  static increment(metric: string, value: number = 1): void {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + value);
  }

  // Obter valor de métrica
  static get(metric: string): number {
    return this.metrics.get(metric) || 0;
  }

  // Obter todas as métricas
  static getAll(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Resetar métricas
  static reset(): void {
    this.metrics.clear();
  }

  // Registrar log com métricas
  static recordLog(context: StandardLogContext): void {
    this.increment(`logs.total`);
    this.increment(`logs.module.${context.module}`);
    this.increment(`logs.operation.${context.operation}`);
    this.increment(`logs.status.${context.status}`);

    if (context.error) {
      this.increment(`errors.total`);
      this.increment(`errors.module.${context.module}`);
    }

    if (context.duration) {
      const durationBucket = this.getDurationBucket(context.duration);
      this.increment(`duration.${durationBucket}`);
    }
  }

  // Determinar bucket de duração
  private static getDurationBucket(duration: number): string {
    if (duration < 100) return 'fast';
    if (duration < 1000) return 'medium';
    if (duration < 5000) return 'slow';
    return 'very_slow';
  }
}

export default {
  LogMessageTemplates,
  LogStandardsUtils,
  LogMetrics,
  OperationType,
  SystemModule,
  OperationStatus
};