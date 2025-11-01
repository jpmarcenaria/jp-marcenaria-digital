import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Camera, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Move3D, 
  Eye, 
  Smartphone,
  Monitor,
  Maximize,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface ViewerControls {
  rotation: { x: number; y: number; z: number };
  zoom: number;
  position: { x: number; y: number; z: number };
  lighting: {
    ambient: number;
    directional: number;
    shadows: boolean;
  };
}

interface ARMarker {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  model: string;
  material: string;
}

const AR3DViewer: React.FC<{
  imageUrl?: string;
  transformedImageUrl?: string;
  onARModeChange?: (enabled: boolean) => void;
}> = ({ imageUrl, transformedImageUrl, onARModeChange }) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'ar'>('2d');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controls, setControls] = useState<ViewerControls>({
    rotation: { x: 0, y: 0, z: 0 },
    zoom: 1,
    position: { x: 0, y: 0, z: 0 },
    lighting: {
      ambient: 0.4,
      directional: 0.8,
      shadows: true,
    },
  });
  const [arMarkers, setArMarkers] = useState<ARMarker[]>([]);
  const [isARSupported, setIsARSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Verificar suporte a WebXR/AR
    checkARSupport();
    
    // Inicializar visualizador 3D
    if (viewMode === '3d') {
      initialize3DViewer();
    }
  }, [viewMode]);

  const checkARSupport = async () => {
    try {
      if ('xr' in navigator) {
        const xr = (navigator as any).xr;
        const supported = await xr.isSessionSupported('immersive-ar');
        setIsARSupported(supported);
      }
    } catch (error) {
      console.log('AR não suportado:', error);
      setIsARSupported(false);
    }
  };

  const initialize3DViewer = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Configurar canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Renderizar cena 3D simulada
    render3DScene(ctx, canvas.width, canvas.height);
  };

  const render3DScene = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    // Fundo gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#f0f0f0');
    gradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Simular perspectiva 3D
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = controls.zoom;

    // Desenhar grid de perspectiva
    drawPerspectiveGrid(ctx, centerX, centerY, scale);

    // Desenhar móveis 3D simulados
    drawFurniture3D(ctx, centerX, centerY, scale);

    // Aplicar transformações de rotação
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((controls.rotation.y * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    // Restaurar contexto
    ctx.restore();
  };

  const drawPerspectiveGrid = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number) => {
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;

    // Linhas horizontais
    for (let i = -5; i <= 5; i++) {
      const y = centerY + (i * 40 * scale);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(centerX * 2, y);
      ctx.stroke();
    }

    // Linhas verticais com perspectiva
    for (let i = -5; i <= 5; i++) {
      const x = centerX + (i * 40 * scale);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, centerY * 2);
      ctx.stroke();
    }
  };

  const drawFurniture3D = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number) => {
    // Simular móveis em 3D usando formas geométricas

    // Armário superior
    drawCuboid(ctx, centerX - 100, centerY - 150, 200, 80, 40, '#f5f5f5', scale);
    
    // Armário inferior
    drawCuboid(ctx, centerX - 100, centerY + 50, 200, 100, 60, '#f0f0f0', scale);
    
    // Bancada
    drawCuboid(ctx, centerX - 110, centerY + 40, 220, 20, 65, '#2c2c2c', scale);
    
    // Eletrodomésticos
    drawCuboid(ctx, centerX + 120, centerY - 50, 60, 120, 60, '#e8e8e8', scale);
  };

  const drawCuboid = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number,
    color: string,
    scale: number
  ) => {
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const scaledDepth = depth * scale * 0.5; // Perspectiva

    // Face frontal
    ctx.fillStyle = color;
    ctx.fillRect(x, y, scaledWidth, scaledHeight);
    ctx.strokeStyle = '#999';
    ctx.strokeRect(x, y, scaledWidth, scaledHeight);

    // Face superior (perspectiva)
    ctx.fillStyle = lightenColor(color, 20);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + scaledDepth, y - scaledDepth);
    ctx.lineTo(x + scaledWidth + scaledDepth, y - scaledDepth);
    ctx.lineTo(x + scaledWidth, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Face lateral direita
    ctx.fillStyle = darkenColor(color, 20);
    ctx.beginPath();
    ctx.moveTo(x + scaledWidth, y);
    ctx.lineTo(x + scaledWidth + scaledDepth, y - scaledDepth);
    ctx.lineTo(x + scaledWidth + scaledDepth, y + scaledHeight - scaledDepth);
    ctx.lineTo(x + scaledWidth, y + scaledHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const lightenColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const darkenColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
  };

  const handleRotation = (axis: 'x' | 'y' | 'z', delta: number) => {
    setControls(prev => ({
      ...prev,
      rotation: {
        ...prev.rotation,
        [axis]: prev.rotation[axis] + delta,
      },
    }));
  };

  const handleZoom = (delta: number) => {
    setControls(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(3, prev.zoom + delta)),
    }));
  };

  const resetView = () => {
    setControls({
      rotation: { x: 0, y: 0, z: 0 },
      zoom: 1,
      position: { x: 0, y: 0, z: 0 },
      lighting: {
        ambient: 0.4,
        directional: 0.8,
        shadows: true,
      },
    });
  };

  const startARSession = async () => {
    if (!isARSupported) {
      toast.error('AR não é suportado neste dispositivo');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular inicialização de sessão AR
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setViewMode('ar');
      onARModeChange?.(true);
      toast.success('Sessão AR iniciada!');
    } catch (error) {
      toast.error('Erro ao iniciar AR');
    } finally {
      setIsLoading(false);
    }
  };

  const stopARSession = () => {
    setViewMode('3d');
    onARModeChange?.(false);
    toast.success('Sessão AR encerrada');
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && viewerRef.current) {
      viewerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Re-renderizar quando controles mudarem
  useEffect(() => {
    if (viewMode === '3d' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        render3DScene(ctx, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [controls, viewMode]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Box className="h-5 w-5" />
          Visualização 3D/AR
        </CardTitle>
        <CardDescription>
          Visualize suas transformações em 2D, 3D ou Realidade Aumentada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="2d" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              2D
            </TabsTrigger>
            <TabsTrigger value="3d" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              3D
            </TabsTrigger>
            <TabsTrigger 
              value="ar" 
              className="flex items-center gap-2"
              disabled={!isARSupported}
            >
              <Smartphone className="h-4 w-4" />
              AR
              {!isARSupported && <Badge variant="secondary" className="ml-1 text-xs">N/A</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* Visualização 2D */}
          <TabsContent value="2d" className="space-y-4">
            <div 
              ref={viewerRef}
              className="relative bg-gray-100 rounded-lg overflow-hidden"
              style={{ height: '400px' }}
            >
              {transformedImageUrl ? (
                <div className="grid grid-cols-2 h-full">
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      Original
                    </div>
                  </div>
                  <div className="relative">
                    <img
                      src={transformedImageUrl}
                      alt="Transformada"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      Transformada
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma imagem para visualizar</p>
                  </div>
                </div>
              )}
              
              <Button
                onClick={toggleFullscreen}
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Visualização 3D */}
          <TabsContent value="3d" className="space-y-4">
            <div 
              ref={viewerRef}
              className="relative bg-gray-100 rounded-lg overflow-hidden"
              style={{ height: '400px' }}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
              />
              
              {/* Controles 3D */}
              <div className="absolute top-4 left-4 space-y-2">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleRotation('y', -15)}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCw className="h-4 w-4 transform rotate-180" />
                  </Button>
                  <Button
                    onClick={() => handleRotation('y', 15)}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleZoom(-0.1)}
                    variant="outline"
                    size="sm"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleZoom(0.1)}
                    variant="outline"
                    size="sm"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={resetView}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Reset
                </Button>
              </div>

              {/* Controles de iluminação */}
              <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg space-y-3 w-48">
                <h4 className="font-medium text-sm">Controles</h4>
                
                <div>
                  <label className="text-xs text-gray-600">Zoom: {controls.zoom.toFixed(1)}x</label>
                  <Slider
                    value={[controls.zoom]}
                    onValueChange={(value) => setControls(prev => ({ ...prev, zoom: value[0] }))}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Rotação Y: {controls.rotation.y}°</label>
                  <Slider
                    value={[controls.rotation.y]}
                    onValueChange={(value) => setControls(prev => ({ 
                      ...prev, 
                      rotation: { ...prev.rotation, y: value[0] }
                    }))}
                    min={-180}
                    max={180}
                    step={15}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-600">Sombras</label>
                  <Switch
                    checked={controls.lighting.shadows}
                    onCheckedChange={(checked) => setControls(prev => ({
                      ...prev,
                      lighting: { ...prev.lighting, shadows: checked }
                    }))}
                  />
                </div>
              </div>

              <Button
                onClick={toggleFullscreen}
                variant="outline"
                size="sm"
                className="absolute bottom-4 right-4"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Visualização AR */}
          <TabsContent value="ar" className="space-y-4">
            <div 
              className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center"
              style={{ height: '400px' }}
            >
              {viewMode === 'ar' ? (
                <div className="text-center text-white">
                  <Camera className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Modo AR Ativo</h3>
                  <p className="text-gray-300 mb-6">
                    Aponte a câmera para o ambiente e veja a transformação em tempo real
                  </p>
                  <Button onClick={stopARSession} variant="outline">
                    Sair do AR
                  </Button>
                </div>
              ) : (
                <div className="text-center text-white">
                  <Smartphone className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Realidade Aumentada</h3>
                  <p className="text-gray-300 mb-6">
                    Visualize as transformações sobrepostas ao ambiente real
                  </p>
                  {isARSupported ? (
                    <Button 
                      onClick={startARSession}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? 'Iniciando...' : 'Iniciar AR'}
                    </Button>
                  ) : (
                    <div>
                      <p className="text-red-400 mb-4">AR não suportado neste dispositivo</p>
                      <Badge variant="secondary">Requer WebXR</Badge>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isARSupported && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Requisitos para AR:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Dispositivo móvel com suporte a WebXR</li>
                  <li>• Navegador compatível (Chrome, Edge)</li>
                  <li>• Conexão HTTPS</li>
                  <li>• Permissão de câmera</li>
                </ul>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AR3DViewer;