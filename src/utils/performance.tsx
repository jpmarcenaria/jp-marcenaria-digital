// Utilitários de performance para JP Marcenaria Digital
import React from 'react';

// Lazy loading de componentes
export const lazyLoad = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  FallbackComponent?: React.ComponentType
) => {
  const LazyComponent = React.lazy(importFunc);
  const Fallback = FallbackComponent || (() => <div>Carregando...</div>);
  
  const Component = (props: React.ComponentProps<T>) => (
    <React.Suspense fallback={<Fallback />}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
  
  return Component;
};

// Debounce para otimizar inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle para eventos de scroll
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// Intersection Observer para lazy loading de imagens
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
}

// Componente de imagem otimizada
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  quality?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+',
  quality = 80,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const isInView = useIntersectionObserver(imgRef, { threshold: 0.1 });

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => setHasError(true);

  return (
    <div ref={imgRef} className="relative overflow-hidden">
      {!isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm"
        />
      )}
      
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
      
      {hasError && (
        <div className="flex items-center justify-center bg-gray-200 text-gray-500">
          Erro ao carregar imagem
        </div>
      )}
    </div>
  );
};

// Web Vitals monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Medir Core Web Vitals
  measureWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.set('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.metrics.set('FID', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.set('CLS', clsValue);
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Medir tempo de carregamento de recursos
  measureResourceTiming() {
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources.filter((resource: any) => 
      resource.duration > 1000
    );
    
    if (slowResources.length > 0) {
      console.warn('Recursos lentos detectados:', slowResources);
    }
  }

  // Enviar métricas para analytics
  sendMetrics() {
    const metricsData = Object.fromEntries(this.metrics);
    
    // Enviar para Google Analytics, Sentry, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', metricsData);
    }
    
    console.log('Performance Metrics:', metricsData);
  }

  // Detectar dispositivos com baixa performance
  isLowEndDevice(): boolean {
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;

    return (
      (connection && connection.effectiveType === 'slow-2g') ||
      (memory && memory < 4) ||
      (cores && cores < 4)
    );
  }
}

// Hook para monitoramento de performance
export function usePerformanceMonitor() {
  React.useEffect(() => {
    const monitor = PerformanceMonitor.getInstance();
    monitor.measureWebVitals();
    monitor.measureResourceTiming();

    // Enviar métricas após 5 segundos
    const timer = setTimeout(() => {
      monitor.sendMetrics();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);
}

// Preload de recursos críticos
export function preloadResource(href: string, as: string, type?: string) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  document.head.appendChild(link);
}

// Prefetch de rotas
export function prefetchRoute(route: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
}

// Service Worker registration
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', registration);
      return registration;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  }
}