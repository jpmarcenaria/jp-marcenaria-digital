import React, { useState, useRef } from 'react';
import { 
  Palette, 
  Sliders, 
  Download, 
  Share2, 
  Save, 
  RotateCw, 
  Move, 
  ZoomIn,
  Contrast,
  Sun,
  Droplets,
  Brush,
  Layers,
  Eye,
  EyeOff,
  Undo,
  Redo,
  Settings,
  Image as ImageIcon,
  FileImage,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface AdjustmentSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  temperature: number;
  tint: number;
  exposure: number;
  highlights: number;
  shadows: number;
  clarity: number;
  vibrance: number;
  opacity: number;
}

interface LayerSettings {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: string;
  locked: boolean;
}

interface ExportSettings {
  format: 'jpg' | 'png' | 'webp' | 'pdf';
  quality: number;
  resolution: '1080p' | '4k' | 'original';
  watermark: boolean;
  metadata: boolean;
}

const ManualAdjustments: React.FC<{
  imageUrl?: string;
  transformedImageUrl?: string;
  onAdjustmentChange?: (settings: AdjustmentSettings) => void;
  onExport?: (settings: ExportSettings) => void;
}> = ({ imageUrl, transformedImageUrl, onAdjustmentChange, onExport }) => {
  const [adjustments, setAdjustments] = useState<AdjustmentSettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    temperature: 0,
    tint: 0,
    exposure: 0,
    highlights: 0,
    shadows: 0,
    clarity: 0,
    vibrance: 0,
    opacity: 100,
  });

  const [layers, setLayers] = useState<LayerSettings[]>([
    { id: '1', name: 'Fundo Original', visible: true, opacity: 100, blendMode: 'normal', locked: false },
    { id: '2', name: 'Transformação', visible: true, opacity: 100, blendMode: 'normal', locked: false },
    { id: '3', name: 'Ajustes de Cor', visible: true, opacity: 80, blendMode: 'overlay', locked: false },
    { id: '4', name: 'Iluminação', visible: true, opacity: 60, blendMode: 'soft-light', locked: false },
  ]);

  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'jpg',
    quality: 90,
    resolution: '1080p',
    watermark: true,
    metadata: true,
  });

  const [history, setHistory] = useState<AdjustmentSettings[]>([adjustments]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleAdjustmentChange = (key: keyof AdjustmentSettings, value: number) => {
    const newAdjustments = { ...adjustments, [key]: value };
    setAdjustments(newAdjustments);
    
    // Adicionar ao histórico
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newAdjustments);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    onAdjustmentChange?.(newAdjustments);
  };

  const handleLayerToggle = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  };

  const handleLayerOpacity = (layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, opacity }
        : layer
    ));
  };

  const handleLayerBlendMode = (layerId: string, blendMode: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, blendMode }
        : layer
    ));
  };

  const resetAdjustments = () => {
    const resetSettings: AdjustmentSettings = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      temperature: 0,
      tint: 0,
      exposure: 0,
      highlights: 0,
      shadows: 0,
      clarity: 0,
      vibrance: 0,
      opacity: 100,
    };
    
    setAdjustments(resetSettings);
    onAdjustmentChange?.(resetSettings);
    
    // Adicionar ao histórico
    const newHistory = [...history, resetSettings];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    toast.success('Ajustes resetados');
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setAdjustments(history[newIndex]);
      onAdjustmentChange?.(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setAdjustments(history[newIndex]);
      onAdjustmentChange?.(history[newIndex]);
    }
  };

  const applyPreset = (preset: string) => {
    let presetSettings: Partial<AdjustmentSettings> = {};
    
    switch (preset) {
      case 'vivid':
        presetSettings = { saturation: 20, vibrance: 15, contrast: 10 };
        break;
      case 'warm':
        presetSettings = { temperature: 15, tint: 5, highlights: -10 };
        break;
      case 'cool':
        presetSettings = { temperature: -15, tint: -5, shadows: 10 };
        break;
      case 'dramatic':
        presetSettings = { contrast: 25, clarity: 20, shadows: -15, highlights: -10 };
        break;
      case 'soft':
        presetSettings = { clarity: -15, highlights: 10, shadows: 5 };
        break;
      default:
        break;
    }
    
    const newAdjustments = { ...adjustments, ...presetSettings };
    setAdjustments(newAdjustments);
    onAdjustmentChange?.(newAdjustments);
    
    toast.success(`Preset "${preset}" aplicado`);
  };

  const handleExport = async () => {
    setIsProcessing(true);
    
    try {
      // Simular processamento de exportação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onExport?.(exportSettings);
      
      // Simular download
      const link = document.createElement('a');
      link.href = transformedImageUrl || imageUrl || '';
      link.download = `foto-magia-ia-${Date.now()}.${exportSettings.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Imagem exportada com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar imagem');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && transformedImageUrl) {
      try {
        await navigator.share({
          title: 'Foto Magia IA - Transformação',
          text: 'Confira esta incrível transformação feita com IA!',
          url: window.location.href,
        });
      } catch (error) {
        // Fallback para copiar link
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copiado para a área de transferência');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência');
    }
  };

  const generateCSS = () => {
    return `filter: 
      brightness(${1 + adjustments.brightness / 100}) 
      contrast(${1 + adjustments.contrast / 100}) 
      saturate(${1 + adjustments.saturation / 100}) 
      hue-rotate(${adjustments.hue}deg) 
      opacity(${adjustments.opacity / 100});`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sliders className="h-5 w-5" />
          Ajustes Manuais e Exportação
        </CardTitle>
        <CardDescription>
          Refine sua transformação com controles precisos e exporte nos formatos desejados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="adjustments" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="adjustments">Ajustes</TabsTrigger>
            <TabsTrigger value="layers">Camadas</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="export">Exportar</TabsTrigger>
          </TabsList>

          {/* Aba de Ajustes */}
          <TabsContent value="adjustments" className="space-y-6">
            {/* Controles de Histórico */}
            <div className="flex items-center gap-2">
              <Button
                onClick={undo}
                disabled={historyIndex === 0}
                variant="outline"
                size="sm"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                variant="outline"
                size="sm"
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button onClick={resetAdjustments} variant="outline" size="sm">
                Reset
              </Button>
              <Badge variant="secondary" className="ml-auto">
                {historyIndex + 1}/{history.length}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ajustes Básicos */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Exposição e Luz
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Brilho: {adjustments.brightness}</Label>
                    <Slider
                      value={[adjustments.brightness]}
                      onValueChange={(value) => handleAdjustmentChange('brightness', value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Contraste: {adjustments.contrast}</Label>
                    <Slider
                      value={[adjustments.contrast]}
                      onValueChange={(value) => handleAdjustmentChange('contrast', value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Exposição: {adjustments.exposure}</Label>
                    <Slider
                      value={[adjustments.exposure]}
                      onValueChange={(value) => handleAdjustmentChange('exposure', value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Realces: {adjustments.highlights}</Label>
                    <Slider
                      value={[adjustments.highlights]}
                      onValueChange={(value) => handleAdjustmentChange('highlights', value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Sombras: {adjustments.shadows}</Label>
                    <Slider
                      value={[adjustments.shadows]}
                      onValueChange={(value) => handleAdjustmentChange('shadows', value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Ajustes de Cor */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Cor e Saturação
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Saturação: {adjustments.saturation}</Label>
                    <Slider
                      value={[adjustments.saturation]}
                      onValueChange={(value) => handleAdjustmentChange('saturation', value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Vibrance: {adjustments.vibrance}</Label>
                    <Slider
                      value={[adjustments.vibrance]}
                      onValueChange={(value) => handleAdjustmentChange('vibrance', value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Matiz: {adjustments.hue}°</Label>
                    <Slider
                      value={[adjustments.hue]}
                      onValueChange={(value) => handleAdjustmentChange('hue', value[0])}
                      min={-180}
                      max={180}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Temperatura: {adjustments.temperature}</Label>
                    <Slider
                      value={[adjustments.temperature]}
                      onValueChange={(value) => handleAdjustmentChange('temperature', value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Tint: {adjustments.tint}</Label>
                    <Slider
                      value={[adjustments.tint]}
                      onValueChange={(value) => handleAdjustmentChange('tint', value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Clareza: {adjustments.clarity}</Label>
                    <Slider
                      value={[adjustments.clarity]}
                      onValueChange={(value) => handleAdjustmentChange('clarity', value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview CSS */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <Label className="text-sm font-medium">CSS Gerado:</Label>
              <code className="block text-xs mt-1 bg-white p-2 rounded border">
                {generateCSS()}
              </code>
            </div>
          </TabsContent>

          {/* Aba de Camadas */}
          <TabsContent value="layers" className="space-y-4">
            <div className="space-y-3">
              {layers.map((layer) => (
                <div key={layer.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleLayerToggle(layer.id)}
                        variant="ghost"
                        size="sm"
                      >
                        {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <span className="font-medium">{layer.name}</span>
                    </div>
                    <Badge variant={layer.visible ? "default" : "secondary"}>
                      {layer.opacity}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Opacidade</Label>
                      <Slider
                        value={[layer.opacity]}
                        onValueChange={(value) => handleLayerOpacity(layer.id, value[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Modo de Mesclagem</Label>
                      <Select
                        value={layer.blendMode}
                        onValueChange={(value) => handleLayerBlendMode(layer.id, value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="multiply">Multiplicar</SelectItem>
                          <SelectItem value="screen">Tela</SelectItem>
                          <SelectItem value="overlay">Sobreposição</SelectItem>
                          <SelectItem value="soft-light">Luz Suave</SelectItem>
                          <SelectItem value="hard-light">Luz Forte</SelectItem>
                          <SelectItem value="color-dodge">Subexposição de Cor</SelectItem>
                          <SelectItem value="color-burn">Superexposição de Cor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Aba de Presets */}
          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'vivid', name: 'Vívido', description: 'Cores intensas e vibrantes' },
                { id: 'warm', name: 'Quente', description: 'Tons dourados e aconchegantes' },
                { id: 'cool', name: 'Frio', description: 'Tons azulados e frescos' },
                { id: 'dramatic', name: 'Dramático', description: 'Alto contraste e clareza' },
                { id: 'soft', name: 'Suave', description: 'Aparência delicada e suave' },
                { id: 'natural', name: 'Natural', description: 'Cores equilibradas e naturais' },
              ].map((preset) => (
                <Card 
                  key={preset.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => applyPreset(preset.id)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium">{preset.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{preset.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Aba de Exportação */}
          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Configurações de Exportação</h4>
                
                <div>
                  <Label>Formato</Label>
                  <Select
                    value={exportSettings.format}
                    onValueChange={(value: any) => setExportSettings(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpg">JPEG (.jpg)</SelectItem>
                      <SelectItem value="png">PNG (.png)</SelectItem>
                      <SelectItem value="webp">WebP (.webp)</SelectItem>
                      <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Resolução</Label>
                  <Select
                    value={exportSettings.resolution}
                    onValueChange={(value: any) => setExportSettings(prev => ({ ...prev, resolution: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1080p">Full HD (1920x1080)</SelectItem>
                      <SelectItem value="4k">4K (3840x2160)</SelectItem>
                      <SelectItem value="original">Resolução Original</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Qualidade: {exportSettings.quality}%</Label>
                  <Slider
                    value={[exportSettings.quality]}
                    onValueChange={(value) => setExportSettings(prev => ({ ...prev, quality: value[0] }))}
                    min={10}
                    max={100}
                    step={5}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Marca d'água</Label>
                    <Switch
                      checked={exportSettings.watermark}
                      onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, watermark: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Incluir metadados</Label>
                    <Switch
                      checked={exportSettings.metadata}
                      onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, metadata: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Ações</h4>
                
                <div className="space-y-2">
                  <Button 
                    onClick={handleExport}
                    disabled={isProcessing || !transformedImageUrl}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Exportando...' : 'Baixar Imagem'}
                  </Button>
                  
                  <Button 
                    onClick={handleShare}
                    variant="outline"
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                </div>

                <Separator />

                <div className="text-sm text-gray-600">
                  <h5 className="font-medium mb-2">Informações do Arquivo:</h5>
                  <ul className="space-y-1">
                    <li>Formato: {exportSettings.format.toUpperCase()}</li>
                    <li>Resolução: {exportSettings.resolution}</li>
                    <li>Qualidade: {exportSettings.quality}%</li>
                    <li>Tamanho estimado: ~{Math.round(exportSettings.quality * 0.05)}MB</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ManualAdjustments;