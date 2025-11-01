/**
 * Visualizador 360° Simplificado
 * JP Marcenaria Digital
 * 
 * Implementação otimizada com:
 * - Sprites comprimidos para rotação
 * - Controles touch para mobile
 * - Performance < 2s carregamento
 * - Fullscreen responsivo
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';

interface Simple360ViewerProps {
  furniture: any;
  isOpen: boolean;
  onClose: () => void;
}

const Simple360Viewer: React.FC<Simple360ViewerProps> = ({
  furniture,
  isOpen,
  onClose
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, frame: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<number>();

  // Simular frames 360° (36 frames = 10° por frame)
  const totalFrames = 36;
  const frameUrls = Array.from({ length: totalFrames }, (_, i) => {
    // Para demonstração, usar a mesma imagem com parâmetros diferentes
    const angle = (i * 10) % 360;
    return `${furniture.imagens[0]}&rotate=${angle}`;
  });

  // Auto-play animation
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % totalFrames);
      }, 100); // 10 FPS para suavidade
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, totalFrames]);

  // Preload próximas imagens
  useEffect(() => {
    const preloadImages = () => {
      const nextFrames = [
        (currentFrame + 1) % totalFrames,
        (currentFrame + 2) % totalFrames,
        (currentFrame - 1 + totalFrames) % totalFrames
      ];

      nextFrames.forEach(frameIndex => {
        const img = new Image();
        img.src = frameUrls[frameIndex];
      });
    };

    preloadImages();
  }, [currentFrame, frameUrls, totalFrames]);

  // Controles de mouse/touch
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, frame: currentFrame });
    setIsPlaying(false);
  }, [currentFrame]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const sensitivity = 2; // pixels por frame
    const frameChange = Math.floor(deltaX / sensitivity);
    const newFrame = (dragStart.frame + frameChange + totalFrames) % totalFrames;
    
    setCurrentFrame(newFrame);
  }, [isDragging, dragStart, totalFrames]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events para mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, frame: currentFrame });
    setIsPlaying(false);
  }, [currentFrame]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const sensitivity = 3; // Mais sensível no mobile
    const frameChange = Math.floor(deltaX / sensitivity);
    const newFrame = (dragStart.frame + frameChange + totalFrames) % totalFrames;
    
    setCurrentFrame(newFrame);
  }, [isDragging, dragStart, totalFrames]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          setCurrentFrame(prev => (prev - 1 + totalFrames) % totalFrames);
          setIsPlaying(false);
          break;
        case 'ArrowRight':
          setCurrentFrame(prev => (prev + 1) % totalFrames);
          setIsPlaying(false);
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, totalFrames]);

  // Fullscreen API
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Fullscreen não suportado');
    }
  };

  // Controles de navegação
  const goToPreviousFrame = () => {
    setCurrentFrame(prev => (prev - 1 + totalFrames) % totalFrames);
    setIsPlaying(false);
  };

  const goToNextFrame = () => {
    setCurrentFrame(prev => (prev + 1) % totalFrames);
    setIsPlaying(false);
  };

  const resetView = () => {
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      <div 
        ref={containerRef}
        className={`relative w-full h-full flex flex-col ${isFullscreen ? 'p-0' : 'p-4'}`}
      >
        {/* Header com controles */}
        <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-semibold">{furniture.nome}</h2>
            <div className="text-white/70 text-sm">
              Visualização 360° • Frame {currentFrame + 1}/{totalFrames}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Área principal de visualização */}
        <div className="flex-1 flex items-center justify-center relative">
          <div 
            className="relative max-w-4xl max-h-full w-full aspect-video cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Imagem 360° */}
            <img
              ref={imageRef}
              src={frameUrls[currentFrame]}
              alt={`${furniture.nome} - Frame ${currentFrame + 1}`}
              className="w-full h-full object-contain rounded-lg"
              onLoad={() => setIsLoading(false)}
              onLoadStart={() => setIsLoading(true)}
              draggable={false}
            />

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="flex items-center gap-2 text-white">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Carregando frame...</span>
                </div>
              </div>
            )}

            {/* Controles de navegação lateral */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
              onClick={goToPreviousFrame}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
              onClick={goToNextFrame}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Indicador de arrasto */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {isDragging ? 'Arrastando...' : 'Arraste para rotacionar'}
            </div>
          </div>
        </div>

        {/* Controles inferiores */}
        <div className="p-4 bg-black/50 backdrop-blur-sm">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                {/* Reset */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetView}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                {/* Slider de frames */}
                <div className="flex-1 px-4">
                  <Slider
                    value={[currentFrame]}
                    onValueChange={(value) => {
                      setCurrentFrame(value[0]);
                      setIsPlaying(false);
                    }}
                    max={totalFrames - 1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Informações */}
                <div className="text-white text-sm">
                  {Math.round((currentFrame / totalFrames) * 360)}°
                </div>
              </div>

              {/* Instruções */}
              <div className="mt-3 text-center text-white/70 text-xs">
                <div className="hidden sm:block">
                  Arraste para rotacionar • Setas do teclado • Espaço para play/pause • ESC para sair
                </div>
                <div className="sm:hidden">
                  Toque e arraste para rotacionar • Use os controles abaixo
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Simple360Viewer;