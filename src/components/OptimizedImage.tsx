/**
 * Componente de Imagem Otimizada
 * JP Marcenaria Digital
 * 
 * Sistema de carregamento progressivo com:
 * - Compressão automática para 1920x1080
 * - Formato WebP com fallback JPEG
 * - Lazy loading com placeholders
 * - Performance otimizada
 */

import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder = 'blur',
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Gerar URLs otimizadas
  const generateOptimizedUrl = (originalUrl: string, format: 'webp' | 'jpeg' = 'webp') => {
    // Para Unsplash, adicionar parâmetros de otimização
    if (originalUrl.includes('unsplash.com')) {
      const baseUrl = originalUrl.split('?')[0];
      const params = new URLSearchParams({
        w: '1920',
        h: '1080',
        fit: 'crop',
        fm: format,
        q: '80',
        auto: 'format,compress'
      });
      return `${baseUrl}?${params.toString()}`;
    }
    
    // Para outras URLs, retornar original
    return originalUrl;
  };

  const webpSrc = generateOptimizedUrl(src, 'webp');
  const jpegSrc = generateOptimizedUrl(src, 'jpeg');
  const [currentSrc, setCurrentSrc] = useState<string>(webpSrc);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    // Tentar fallback para JPEG se WebP falhar
    if (currentSrc === webpSrc) {
      setHasError(false);
      setIsLoading(true);
      setCurrentSrc(jpegSrc);
      return;
    }
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const renderPlaceholder = () => {
    if (placeholder === 'empty') {
      return (
        <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      );
    }

    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          <span className="text-xs text-gray-500">Carregando...</span>
        </div>
      </div>
    );
  };

  const renderError = () => (
    <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-2 text-gray-400">
        <ImageIcon className="h-8 w-8" />
        <span className="text-xs">Erro ao carregar</span>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder durante carregamento */}
      {isLoading && !hasError && renderPlaceholder()}
      
      {/* Erro de carregamento */}
      {hasError && renderError()}
      
      {/* Imagem otimizada com fallback automático */}
      {isInView && !hasError && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          className={`
            transition-opacity duration-300
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            ${className}
          `}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      )}
      
      {/* Overlay de carregamento */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
    </div>
  );
};

export default OptimizedImage;
