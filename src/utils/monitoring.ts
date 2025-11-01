// Sistema de Monitoramento e Logging
// JP Marcenaria Digital

import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

// Configuração do monitoramento
interface MonitoringConfig {
  apiEndpoint: string;
  environment: 'development' | 'staging' | 'production';
  enableConsoleLogging: boolean;
  enableWebVitals: boolean;
  enableErrorTracking: boolean;
  enablePerformanceTracking: boolean;
  sampleRate: number;
}

// Tipos de log
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  stack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
}

// Classe principal de monitoramento
class MonitoringService {
  private config: MonitoringConfig;
  private sessionId: string;
  private userId?: string;
  private logQueue: LogEntry[] = [];
  private flushInterval: number = 30000; // 30 segundos
  private maxQueueSize: number = 100;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      apiEndpoint: import.meta.env.VITE_SUPABASE_URL + '/functions/v1/analytics',
      environment: (import.meta.env.VITE_ENVIRONMENT as any) || 'development',
      enableConsoleLogging: import.meta.env.DEV,
      enableWebVitals: true,
      enableErrorTracking: true,
      enablePerformanceTracking: true,
      sampleRate: 1.0,
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private initialize() {
    // Configurar Web Vitals
    if (this.config.enableWebVitals) {
      this.setupWebVitals();
    }

    // Configurar rastreamento de erros
    if (this.config.enableErrorTracking) {
      this.setupErrorTracking();
    }

    // Configurar rastreamento de performance
    if (this.config.enablePerformanceTracking) {
      this.setupPerformanceTracking();
    }

    // Configurar flush automático
    this.setupAutoFlush();

    // Configurar cleanup na saída
    this.setupBeforeUnload();
  }

  // Gerar ID de sessão único
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Configurar Web Vitals
  private setupWebVitals() {
    const sendToAnalytics = (metric: Metric) => {
      this.trackEvent('web_vital', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id
      });
    };

    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
  }

  // Configurar rastreamento de erros
  private setupErrorTracking() {
    // Erros JavaScript
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });

    // Erros de recursos
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.logError('Resource Error', {
          tagName: (event.target as any)?.tagName,
          source: (event.target as any)?.src || (event.target as any)?.href,
          message: 'Failed to load resource'
        });
      }
    }, true);
  }

  // Configurar rastreamento de performance
  private setupPerformanceTracking() {
    // Navigation Timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        this.trackEvent('page_load_performance', {
          dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp_connection: navigation.connectEnd - navigation.connectStart,
          request_response: navigation.responseEnd - navigation.requestStart,
          dom_processing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
          load_complete: navigation.loadEventEnd - navigation.navigationStart,
          total_load_time: navigation.loadEventEnd - navigation.navigationStart
        });
      }, 0);
    });

    // Resource Timing
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          
          // Apenas recursos importantes
          if (resource.duration > 100) {
            this.trackEvent('slow_resource', {
              name: resource.name,
              duration: resource.duration,
              size: resource.transferSize,
              type: this.getResourceType(resource.name)
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  // Configurar flush automático
  private setupAutoFlush() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  // Configurar cleanup antes de sair
  private setupBeforeUnload() {
    window.addEventListener('beforeunload', () => {
      this.flush(true);
    });

    // Page Visibility API
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush(true);
      }
    });
  }

  // Métodos públicos de logging
  public debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  public info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  public warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  public error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }

  public critical(message: string, context?: Record<string, any>) {
    this.log('critical', message, context);
  }

  // Log de erro com stack trace
  public logError(message: string, error: any) {
    this.log('error', message, {
      ...error,
      stack: error?.stack || new Error().stack
    });
  }

  // Rastrear eventos customizados
  public trackEvent(eventName: string, properties?: Record<string, any>) {
    if (Math.random() > this.config.sampleRate) {
      return; // Sample rate
    }

    const event = {
      event_name: eventName,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      session_id: this.sessionId,
      user_id: this.userId,
      properties: {
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        screen: {
          width: screen.width,
          height: screen.height
        },
        ...properties
      }
    };

    this.sendToAnalytics(event);
  }

  // Definir usuário
  public setUser(userId: string, userProperties?: Record<string, any>) {
    this.userId = userId;
    this.trackEvent('user_identified', userProperties);
  }

  // Log interno
  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId
    };

    // Console logging em desenvolvimento
    if (this.config.enableConsoleLogging) {
      const consoleMethod = level === 'critical' ? 'error' : level;
      console[consoleMethod](`[${level.toUpperCase()}]`, message, context);
    }

    // Adicionar à fila
    this.logQueue.push(logEntry);

    // Flush se a fila estiver cheia ou for crítico
    if (this.logQueue.length >= this.maxQueueSize || level === 'critical') {
      this.flush();
    }
  }

  // Enviar logs para o servidor
  private async flush(isBeforeUnload = false) {
    if (this.logQueue.length === 0) return;

    const logs = [...this.logQueue];
    this.logQueue = [];

    try {
      const payload = {
        logs,
        session_id: this.sessionId,
        user_id: this.userId,
        environment: this.config.environment,
        timestamp: new Date().toISOString()
      };

      if (isBeforeUnload && 'sendBeacon' in navigator) {
        // Usar sendBeacon para envios antes de sair
        navigator.sendBeacon(
          this.config.apiEndpoint,
          JSON.stringify(payload)
        );
      } else {
        // Fetch normal
        await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      }
    } catch (error) {
      // Re-adicionar logs à fila em caso de erro
      this.logQueue.unshift(...logs);
      console.error('Failed to send logs:', error);
    }
  }

  // Enviar para analytics
  private async sendToAnalytics(event: any) {
    try {
      await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  // Utilitários
  private getResourceType(url: string): string {
    if (url.match(/\.(js|mjs)$/)) return 'script';
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }
}

// Instância global
export const monitoring = new MonitoringService();

// Hook React para monitoramento
export function useMonitoring() {
  return {
    debug: monitoring.debug.bind(monitoring),
    info: monitoring.info.bind(monitoring),
    warn: monitoring.warn.bind(monitoring),
    error: monitoring.error.bind(monitoring),
    critical: monitoring.critical.bind(monitoring),
    trackEvent: monitoring.trackEvent.bind(monitoring),
    setUser: monitoring.setUser.bind(monitoring),
    logError: monitoring.logError.bind(monitoring)
  };
}

// Utilitários de performance
export class PerformanceTracker {
  private static marks: Map<string, number> = new Map();

  static startTiming(name: string) {
    this.marks.set(name, performance.now());
  }

  static endTiming(name: string, properties?: Record<string, any>) {
    const startTime = this.marks.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      monitoring.trackEvent('performance_timing', {
        name,
        duration,
        ...properties
      });
      this.marks.delete(name);
      return duration;
    }
    return null;
  }

  static measureFunction<T extends (...args: any[]) => any>(
    fn: T,
    name: string
  ): T {
    return ((...args: any[]) => {
      this.startTiming(name);
      try {
        const result = fn(...args);
        if (result instanceof Promise) {
          return result.finally(() => this.endTiming(name));
        }
        this.endTiming(name);
        return result;
      } catch (error) {
        this.endTiming(name);
        throw error;
      }
    }) as T;
  }
}

// Decorator para métodos
export function trackPerformance(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const trackingName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      PerformanceTracker.startTiming(trackingName);
      try {
        const result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
          return result.finally(() => PerformanceTracker.endTiming(trackingName));
        }
        PerformanceTracker.endTiming(trackingName);
        return result;
      } catch (error) {
        PerformanceTracker.endTiming(trackingName);
        throw error;
      }
    };

    return descriptor;
  };
}

// Exportar para uso global
declare global {
  interface Window {
    monitoring: MonitoringService;
  }
}

if (typeof window !== 'undefined') {
  window.monitoring = monitoring;
}