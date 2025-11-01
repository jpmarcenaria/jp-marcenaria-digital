/**
 * Sistema de Logging Aprimorado
 * JP Marcenaria Digital
 * 
 * Sistema estruturado de logs com:
 * - Níveis hierárquicos (debug, info, warning, error, critical)
 * - Contexto transacional com IDs únicos
 * - Informações de módulo e stack trace
 * - Integração com monitoramento em tempo real
 * - Formatação padronizada para análise
 */

// Função simples para gerar IDs únicos
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Níveis de log hierárquicos
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  CRITICAL = 4
}

// Interface para contexto transacional
export interface TransactionContext {
  transactionId: string;
  userId?: string;
  sessionId: string;
  module: string;
  operation: string;
  startTime: number;
  metadata?: Record<string, any>;
}

// Interface para entrada de log estruturada
export interface StructuredLogEntry {
  level: LogLevel;
  levelName: string;
  message: string;
  timestamp: string;
  transactionId: string;
  userId?: string;
  sessionId: string;
  module: string;
  operation?: string;
  duration?: number;
  context?: Record<string, any>;
  stack?: string;
  userAgent?: string;
  url?: string;
  ip?: string;
  tags?: string[];
  environment: string;
}

// Configuração do logger aprimorado
export interface EnhancedLoggerConfig {
  minLevel: LogLevel;
  environment: 'development' | 'staging' | 'production';
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  bufferSize: number;
  flushInterval: number;
  enableStackTrace: boolean;
  enablePerformanceTracking: boolean;
  sensitiveFields: string[];
}

// Classe principal do logger aprimorado
export class EnhancedLogger {
  private config: EnhancedLoggerConfig;
  private logBuffer: StructuredLogEntry[] = [];
  private activeTransactions: Map<string, TransactionContext> = new Map();
  private flushTimer?: NodeJS.Timeout;
  private sessionId: string;

  constructor(config: Partial<EnhancedLoggerConfig> = {}) {
    this.config = {
      minLevel: LogLevel.DEBUG,
      environment: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ENVIRONMENT) || 'development',
      enableConsole: (typeof import.meta !== 'undefined' && import.meta.env?.DEV) || false,
      enableRemote: true,
      remoteEndpoint: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) 
        ? import.meta.env.VITE_SUPABASE_URL + '/functions/v1/logging' 
        : 'http://localhost:54321/functions/v1/logging',
      bufferSize: 100,
      flushInterval: 30000, // 30 segundos
      enableStackTrace: true,
      enablePerformanceTracking: true,
      sensitiveFields: ['password', 'token', 'apiKey', 'secret', 'creditCard'],
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.setupAutoFlush();
    this.setupBeforeUnload();
  }

  // Gerar ID de sessão único
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Iniciar transação com contexto
  public startTransaction(module: string, operation: string, metadata?: Record<string, any>): string {
    const transactionId = generateUniqueId();
    const context: TransactionContext = {
      transactionId,
      sessionId: this.sessionId,
      module,
      operation,
      startTime: performance.now(),
      metadata: this.sanitizeData(metadata)
    };

    this.activeTransactions.set(transactionId, context);
    
    this.log(LogLevel.DEBUG, `Transaction started: ${operation}`, {
      transactionId,
      module,
      operation,
      metadata
    });

    return transactionId;
  }

  // Finalizar transação
  public endTransaction(transactionId: string, success: boolean = true, result?: any): void {
    const context = this.activeTransactions.get(transactionId);
    if (!context) {
      this.log(LogLevel.WARNING, `Transaction not found: ${transactionId}`);
      return;
    }

    const duration = performance.now() - context.startTime;
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    
    this.log(level, `Transaction ${success ? 'completed' : 'failed'}: ${context.operation}`, {
      transactionId,
      module: context.module,
      operation: context.operation,
      duration,
      success,
      result: this.sanitizeData(result)
    });

    this.activeTransactions.delete(transactionId);
  }

  // Métodos de logging por nível
  public debug(message: string, context?: Record<string, any>, transactionId?: string): void {
    this.log(LogLevel.DEBUG, message, context, transactionId);
  }

  public info(message: string, context?: Record<string, any>, transactionId?: string): void {
    this.log(LogLevel.INFO, message, context, transactionId);
  }

  public warning(message: string, context?: Record<string, any>, transactionId?: string): void {
    this.log(LogLevel.WARNING, message, context, transactionId);
  }

  public error(message: string, error?: Error | any, context?: Record<string, any>, transactionId?: string): void {
    const errorContext = {
      ...context,
      error: error?.message,
      stack: error?.stack,
      name: error?.name
    };
    this.log(LogLevel.ERROR, message, errorContext, transactionId);
  }

  public critical(message: string, error?: Error | any, context?: Record<string, any>, transactionId?: string): void {
    const errorContext = {
      ...context,
      error: error?.message,
      stack: error?.stack,
      name: error?.name
    };
    this.log(LogLevel.CRITICAL, message, errorContext, transactionId);
  }

  // Log principal estruturado
  private log(level: LogLevel, message: string, context?: Record<string, any>, transactionId?: string): void {
    if (level < this.config.minLevel) return;

    // Obter contexto da transação se disponível
    let transactionContext: TransactionContext | undefined;
    if (transactionId) {
      transactionContext = this.activeTransactions.get(transactionId);
    }

    // Criar entrada de log estruturada
    const logEntry: StructuredLogEntry = {
      level,
      levelName: LogLevel[level],
      message,
      timestamp: new Date().toISOString(),
      transactionId: transactionId || 'no-transaction',
      sessionId: this.sessionId,
      module: transactionContext?.module || 'unknown',
      operation: transactionContext?.operation,
      duration: transactionContext ? performance.now() - transactionContext.startTime : undefined,
      context: this.sanitizeData(context),
      environment: this.config.environment,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      tags: this.generateTags(level, transactionContext?.module)
    };

    // Adicionar stack trace para erros
    if (level >= LogLevel.ERROR && this.config.enableStackTrace) {
      logEntry.stack = new Error().stack;
    }

    // Log no console em desenvolvimento
    if (this.config.enableConsole) {
      this.consoleLog(logEntry);
    }

    // Adicionar ao buffer para envio remoto
    if (this.config.enableRemote) {
      this.logBuffer.push(logEntry);
      
      // Flush imediato para logs críticos
      if (level >= LogLevel.CRITICAL) {
        this.flush();
      } else if (this.logBuffer.length >= this.config.bufferSize) {
        this.flush();
      }
    }
  }

  // Sanitizar dados sensíveis
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data };
    
    for (const field of this.config.sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  // Gerar tags para categorização
  private generateTags(level: LogLevel, module?: string): string[] {
    const tags: string[] = [];
    
    tags.push(`level:${LogLevel[level].toLowerCase()}`);
    
    if (module) {
      tags.push(`module:${module}`);
    }
    
    tags.push(`env:${this.config.environment}`);
    
    return tags;
  }

  // Log formatado no console
  private consoleLog(entry: StructuredLogEntry): void {
    const color = this.getConsoleColor(entry.level);
    const prefix = `[${entry.levelName}] ${entry.timestamp} [${entry.module}]`;
    
    console.log(
      `%c${prefix}%c ${entry.message}`,
      `color: ${color}; font-weight: bold`,
      'color: inherit',
      entry.context || {}
    );
  }

  // Cores para console por nível
  private getConsoleColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '#6B7280';
      case LogLevel.INFO: return '#3B82F6';
      case LogLevel.WARNING: return '#F59E0B';
      case LogLevel.ERROR: return '#EF4444';
      case LogLevel.CRITICAL: return '#DC2626';
      default: return '#000000';
    }
  }

  // Configurar flush automático
  private setupAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // Configurar cleanup antes de sair
  private setupBeforeUnload(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush(true);
      });
    }
  }

  // Enviar logs para servidor
  private async flush(isBeforeUnload: boolean = false): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logs = [...this.logBuffer];
    this.logBuffer = [];

    try {
      const payload = {
        logs,
        session_id: this.sessionId,
        environment: this.config.environment,
        timestamp: new Date().toISOString()
      };

      if (isBeforeUnload && 'sendBeacon' in navigator) {
        navigator.sendBeacon(
          this.config.remoteEndpoint!,
          JSON.stringify(payload)
        );
      } else {
        await fetch(this.config.remoteEndpoint!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      }
    } catch (error) {
      // Re-adicionar logs ao buffer em caso de erro
      this.logBuffer.unshift(...logs);
      console.error('Failed to send logs:', error);
    }
  }

  // Definir usuário atual
  public setUser(userId: string): void {
    this.activeTransactions.forEach(context => {
      context.userId = userId;
    });
  }

  // Obter métricas de performance
  public getPerformanceMetrics(): Record<string, any> {
    const activeTransactionCount = this.activeTransactions.size;
    const bufferSize = this.logBuffer.length;
    
    return {
      activeTransactions: activeTransactionCount,
      bufferSize,
      sessionId: this.sessionId,
      environment: this.config.environment
    };
  }

  // Cleanup
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
    this.activeTransactions.clear();
    this.logBuffer = [];
  }
}

// Instância global do logger aprimorado
export const enhancedLogger = new EnhancedLogger();

// Hook React para logging estruturado
export function useEnhancedLogging(module: string) {
  return {
    startTransaction: (operation: string, metadata?: Record<string, any>) => 
      enhancedLogger.startTransaction(module, operation, metadata),
    endTransaction: enhancedLogger.endTransaction.bind(enhancedLogger),
    debug: (message: string, context?: Record<string, any>, transactionId?: string) => 
      enhancedLogger.debug(message, { ...context, module }, transactionId),
    info: (message: string, context?: Record<string, any>, transactionId?: string) => 
      enhancedLogger.info(message, { ...context, module }, transactionId),
    warning: (message: string, context?: Record<string, any>, transactionId?: string) => 
      enhancedLogger.warning(message, { ...context, module }, transactionId),
    error: (message: string, error?: Error | any, context?: Record<string, any>, transactionId?: string) => 
      enhancedLogger.error(message, error, { ...context, module }, transactionId),
    critical: (message: string, error?: Error | any, context?: Record<string, any>, transactionId?: string) => 
      enhancedLogger.critical(message, error, { ...context, module }, transactionId)
  };
}

export default enhancedLogger;