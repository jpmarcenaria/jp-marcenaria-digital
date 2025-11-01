/**
 * Visualizador 3D Simplificado para Móveis Planejados
 * JP Marcenaria Digital
 * 
 * Componente para visualização interativa de móveis (versão simplificada)
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move3D, 
  Palette, 
  Ruler, 
  Download,
  X,
  Settings,
  Eye,
  Lightbulb,
  Box
} from 'lucide-react';

interface Viewer3DProps {
  modelPath?: string;
  furniture: any;
  onClose?: () => void;
  isFullscreen?: boolean;
}

const Viewer3D: React.FC<Viewer3DProps> = ({ 
  modelPath = '/models/default-furniture.glb', 
  furniture, 
  onClose,
  isFullscreen = false 
}) => {
  const [modelScale, setModelScale] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState('original');
  const [lightIntensity, setLightIntensity] = useState(1);
  const [showDimensions, setShowDimensions] = useState(false);
  const [currentView, setCurrentView] = useState('perspective');

  const materialOptions = [
    { value: 'original', label: 'Original', color: '#8B4513' },
    { value: 'white', label: 'Branco', color: '#FFFFFF' },
    { value: 'black', label: 'Preto', color: '#000000' },
    { value: 'wood', label: 'Madeira Natural', color: '#DEB887' },
    { value: 'gray', label: 'Cinza', color: '#808080' },
    { value: 'blue', label: 'Azul', color: '#4169E1' }
  ];

  const viewOptions = [
    { value: 'perspective', label: 'Perspectiva' },
    { value: 'front', label: 'Frontal' },
    { value: 'side', label: 'Lateral' },
    { value: 'top', label: 'Superior' }
  ];

  const resetView = () => {
    setModelScale(1);
    setCurrentView('perspective');
  };

  const downloadModel = () => {
    // Simular download do modelo 3D
    const link = document.createElement('a');
    link.href = modelPath;
    link.download = `${furniture.nome.replace(/\s+/g, '_')}.glb`;
    link.click();
  };

  const renderControls = () => (
    <Card className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Controles 3D
          </CardTitle>
          {onClose && (
            <Button size="sm" variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles de Visualização */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Visualização</Label>
          <div className="flex gap-2 mb-2">
            <Button size="sm" variant="outline" onClick={resetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setModelScale(prev => Math.min(prev * 1.2, 3))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setModelScale(prev => Math.max(prev * 0.8, 0.3))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant={showDimensions ? "default" : "outline"} 
              onClick={() => setShowDimensions(!showDimensions)}
            >
              <Ruler className="h-4 w-4" />
            </Button>
          </div>
          
          <Select value={currentView} onValueChange={setCurrentView}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {viewOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Escala do Modelo */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Escala: {Math.round(modelScale * 100)}%
          </Label>
          <Slider
            value={[modelScale]}
            onValueChange={(value) => setModelScale(value[0])}
            min={0.3}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Material */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Material</Label>
          <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {materialOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: option.color }}
                    />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Iluminação */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Iluminação: {Math.round(lightIntensity * 100)}%
          </Label>
          <Slider
            value={[lightIntensity]}
            onValueChange={(value) => setLightIntensity(value[0])}
            min={0.2}
            max={2}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Download */}
        <Button onClick={downloadModel} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Baixar Modelo 3D
        </Button>
      </CardContent>
    </Card>
  );

  const renderDimensions = () => {
    if (!showDimensions || !furniture.dimensoes) return null;

    return (
      <Card className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Dimensões
          </h4>
          <div className="space-y-1 text-sm">
            <div>Largura: {furniture.dimensoes.largura}cm</div>
            <div>Altura: {furniture.dimensoes.altura}cm</div>
            <div>Profundidade: {furniture.dimensoes.profundidade}cm</div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderInfo = () => (
    <Card className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm max-w-sm">
      <CardContent className="p-4">
        <h4 className="font-semibold mb-2">{furniture.nome}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{furniture.categoria}</Badge>
            <Badge variant="outline">{furniture.estilo}</Badge>
          </div>
          <div>
            <strong>Material:</strong> {furniture.material_principal}
          </div>
          <div>
            <strong>Acabamento:</strong> {furniture.acabamento}
          </div>
          <div>
            <strong>Preço:</strong> R$ {furniture.preco_base?.toLocaleString('pt-BR')}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const render3DPlaceholder = () => (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center p-8">
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <Box className="h-16 w-16 text-white animate-pulse" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Visualizador 3D</h3>
        <p className="text-muted-foreground mb-4">
          Modelo 3D interativo do {furniture.nome}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-center gap-2">
            <Eye className="h-4 w-4" />
            <span>Vista: {viewOptions.find(v => v.value === currentView)?.label}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Material: {materialOptions.find(m => m.value === selectedMaterial)?.label}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ZoomIn className="h-4 w-4" />
            <span>Escala: {Math.round(modelScale * 100)}%</span>
          </div>
        </div>
        <div className="mt-6 p-4 bg-white/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 Use os controles à direita para ajustar a visualização
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-96'} bg-gradient-to-b from-gray-100 to-gray-200 flex`}>
      {render3DPlaceholder()}
      
      {/* Controles UI */}
      {renderControls()}
      {renderDimensions()}
      {renderInfo()}

      {/* Indicador de Visualização 3D */}
      <div className="absolute top-4 left-4">
        <Badge className="bg-green-500 text-white">
          <Lightbulb className="h-3 w-3 mr-1" />
          Visualização 3D Ativa
        </Badge>
      </div>
    </div>
  );
};

export default Viewer3D;