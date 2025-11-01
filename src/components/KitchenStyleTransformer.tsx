import React, { useState, useRef } from 'react';
import { ChefHat, Palette, Wrench, Eye, Download, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface KitchenElement {
  id: string;
  type: 'cabinet' | 'countertop' | 'backsplash' | 'appliance' | 'hardware';
  name: string;
  currentMaterial: string;
  currentColor: string;
  position: { x: number; y: number; width: number; height: number };
}

interface StylePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  materials: {
    cabinet: string[];
    countertop: string[];
    backsplash: string[];
    hardware: string[];
  };
  colors: {
    primary: string[];
    secondary: string[];
    accent: string[];
  };
  characteristics: string[];
}

interface TransformationOptions {
  intensity: number;
  preserveLayout: boolean;
  preserveAppliances: boolean;
  customMaterials: string[];
  customColors: string[];
}

const KitchenStyleTransformer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [detectedElements, setDetectedElements] = useState<KitchenElement[]>([]);
  const [transformationOptions, setTransformationOptions] = useState<TransformationOptions>({
    intensity: 80,
    preserveLayout: true,
    preserveAppliances: true,
    customMaterials: [],
    customColors: [],
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stylePresets: StylePreset[] = [
    {
      id: 'moderno',
      name: 'Moderno',
      description: 'Linhas limpas, acabamentos minimalistas, cores neutras',
      icon: '🏢',
      materials: {
        cabinet: ['laminado_branco', 'laca_fosca', 'melamina'],
        countertop: ['quartzo_branco', 'granito_preto', 'silestone'],
        backsplash: ['vidro_temperado', 'ceramica_lisa', 'inox'],
        hardware: ['aco_escovado', 'aluminio', 'cromado'],
      },
      colors: {
        primary: ['#FFFFFF', '#F5F5F5', '#E8E8E8'],
        secondary: ['#2C2C2C', '#404040', '#666666'],
        accent: ['#007ACC', '#00A86B', '#FF6B35'],
      },
      characteristics: ['minimalista', 'funcional', 'tecnologico'],
    },
    {
      id: 'rustico',
      name: 'Rústico',
      description: 'Madeira natural, pedras, elementos orgânicos',
      icon: '🏡',
      materials: {
        cabinet: ['madeira_macica', 'carvalho', 'pinus_tratado'],
        countertop: ['granito_natural', 'madeira_butcher', 'pedra_sabao'],
        backsplash: ['tijolo_aparente', 'pedra_natural', 'ceramica_artesanal'],
        hardware: ['ferro_fundido', 'bronze', 'madeira'],
      },
      colors: {
        primary: ['#8B4513', '#A0522D', '#CD853F'],
        secondary: ['#F5DEB3', '#DEB887', '#D2B48C'],
        accent: ['#228B22', '#B22222', '#FF8C00'],
      },
      characteristics: ['natural', 'acolhedor', 'tradicional'],
    },
    {
      id: 'industrial',
      name: 'Industrial',
      description: 'Metal, concreto, tubulações aparentes',
      icon: '🏭',
      materials: {
        cabinet: ['aco_carbono', 'ferro_bruto', 'madeira_demolicao'],
        countertop: ['concreto_polido', 'aco_inox', 'ferro_fundido'],
        backsplash: ['tijolo_refratario', 'chapa_metalica', 'concreto_aparente'],
        hardware: ['ferro_preto', 'aco_carbono', 'cobre_oxidado'],
      },
      colors: {
        primary: ['#2F2F2F', '#404040', '#1C1C1C'],
        secondary: ['#708090', '#A9A9A9', '#696969'],
        accent: ['#B87333', '#CD853F', '#FF4500'],
      },
      characteristics: ['urbano', 'robusto', 'autêntico'],
    },
    {
      id: 'classico',
      name: 'Clássico',
      description: 'Elegância atemporal, detalhes refinados',
      icon: '🏛️',
      materials: {
        cabinet: ['madeira_nobre', 'mogno', 'cerejeira'],
        countertop: ['marmore_carrara', 'granito_preto', 'quartzo_calcatta'],
        backsplash: ['ceramica_subway', 'marmore_natural', 'mosaico_classico'],
        hardware: ['bronze_antigo', 'ouro_velho', 'cristal'],
      },
      colors: {
        primary: ['#F5F5DC', '#FFFAF0', '#FDF5E6'],
        secondary: ['#8B4513', '#A0522D', '#654321'],
        accent: ['#B8860B', '#DAA520', '#CD853F'],
      },
      characteristics: ['elegante', 'sofisticado', 'atemporal'],
    },
    {
      id: 'escandinavo',
      name: 'Escandinavo',
      description: 'Funcionalidade, cores claras, madeira clara',
      icon: '❄️',
      materials: {
        cabinet: ['pinus_claro', 'carvalho_branco', 'bétula'],
        countertop: ['quartzo_branco', 'madeira_clara', 'laminado_fosco'],
        backsplash: ['ceramica_branca', 'vidro_fosco', 'madeira_clara'],
        hardware: ['aco_escovado', 'madeira_clara', 'couro'],
      },
      colors: {
        primary: ['#FFFFFF', '#F8F8FF', '#F0F8FF'],
        secondary: ['#E6E6FA', '#F5F5DC', '#FFFAF0'],
        accent: ['#4682B4', '#32CD32', '#FF69B4'],
      },
      characteristics: ['funcional', 'luminoso', 'aconchegante'],
    },
    {
      id: 'contemporaneo',
      name: 'Contemporâneo',
      description: 'Tendências atuais, inovação, tecnologia',
      icon: '✨',
      materials: {
        cabinet: ['acrilico_colorido', 'vidro_temperado', 'metal_perfurado'],
        countertop: ['quartzo_engenheirado', 'superficie_solida', 'ceramica_grande'],
        backsplash: ['led_integrado', 'espelho_bronze', 'ceramica_3d'],
        hardware: ['touch_sensor', 'led_integrado', 'aco_colorido'],
      },
      colors: {
        primary: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        secondary: ['#96CEB4', '#FFEAA7', '#DDA0DD'],
        accent: ['#FD79A8', '#FDCB6E', '#6C5CE7'],
      },
      characteristics: ['inovador', 'colorido', 'tecnológico'],
    },
  ];

  const materials = {
    cabinet: [
      'Laminado Branco', 'Laca Fosca', 'Melamina', 'Madeira Maciça', 'Carvalho',
      'Pinus Tratado', 'Aço Carbono', 'Ferro Bruto', 'Madeira Demolição',
      'Madeira Nobre', 'Mogno', 'Cerejeira', 'Pinus Claro', 'Carvalho Branco',
      'Bétula', 'Acrílico Colorido', 'Vidro Temperado', 'Metal Perfurado'
    ],
    countertop: [
      'Quartzo Branco', 'Granito Preto', 'Silestone', 'Granito Natural',
      'Madeira Butcher', 'Pedra Sabão', 'Concreto Polido', 'Aço Inox',
      'Ferro Fundido', 'Mármore Carrara', 'Granito Preto', 'Quartzo Calcatta',
      'Quartzo Branco', 'Madeira Clara', 'Laminado Fosco', 'Quartzo Engenheirado',
      'Superfície Sólida', 'Cerâmica Grande'
    ],
    backsplash: [
      'Vidro Temperado', 'Cerâmica Lisa', 'Inox', 'Tijolo Aparente',
      'Pedra Natural', 'Cerâmica Artesanal', 'Tijolo Refratário',
      'Chapa Metálica', 'Concreto Aparente', 'Cerâmica Subway',
      'Mármore Natural', 'Mosaico Clássico', 'Cerâmica Branca',
      'Vidro Fosco', 'Madeira Clara', 'LED Integrado', 'Espelho Bronze',
      'Cerâmica 3D'
    ],
    hardware: [
      'Aço Escovado', 'Alumínio', 'Cromado', 'Ferro Fundido', 'Bronze',
      'Madeira', 'Ferro Preto', 'Aço Carbono', 'Cobre Oxidado',
      'Bronze Antigo', 'Ouro Velho', 'Cristal', 'Aço Escovado',
      'Madeira Clara', 'Couro', 'Touch Sensor', 'LED Integrado', 'Aço Colorido'
    ]
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      analyzeKitchen(file);
    }
  };

  const analyzeKitchen = async (file: File) => {
    setIsAnalyzing(true);
    
    // Simular análise da cozinha
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Elementos detectados simulados
    const mockElements: KitchenElement[] = [
      {
        id: 'cabinet-upper',
        type: 'cabinet',
        name: 'Armários Superiores',
        currentMaterial: 'Laminado Branco',
        currentColor: '#FFFFFF',
        position: { x: 50, y: 50, width: 400, height: 150 },
      },
      {
        id: 'cabinet-lower',
        type: 'cabinet',
        name: 'Armários Inferiores',
        currentMaterial: 'Laminado Branco',
        currentColor: '#FFFFFF',
        position: { x: 50, y: 250, width: 400, height: 200 },
      },
      {
        id: 'countertop',
        type: 'countertop',
        name: 'Bancada',
        currentMaterial: 'Granito Preto',
        currentColor: '#2C2C2C',
        position: { x: 50, y: 230, width: 400, height: 20 },
      },
      {
        id: 'backsplash',
        type: 'backsplash',
        name: 'Revestimento',
        currentMaterial: 'Cerâmica Lisa',
        currentColor: '#F5F5F5',
        position: { x: 50, y: 200, width: 400, height: 50 },
      },
    ];
    
    setDetectedElements(mockElements);
    setIsAnalyzing(false);
    toast.success('Análise da cozinha concluída!');
  };

  const transformKitchen = async () => {
    if (!selectedStyle || !selectedImage) return;
    
    setIsTransforming(true);
    
    // Simular transformação
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Em produção, aqui seria feita a transformação real
    setTransformedImage(URL.createObjectURL(selectedImage));
    setIsTransforming(false);
    toast.success('Transformação concluída!');
  };

  const resetTransformation = () => {
    setTransformedImage(null);
    setSelectedStyle('');
    setTransformationOptions({
      intensity: 80,
      preserveLayout: true,
      preserveAppliances: true,
      customMaterials: [],
      customColors: [],
    });
  };

  const downloadResult = () => {
    if (transformedImage) {
      const link = document.createElement('a');
      link.href = transformedImage;
      link.download = `cozinha-${selectedStyle}-${Date.now()}.jpg`;
      link.click();
      toast.success('Download iniciado!');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Transformação de Cozinhas
          </CardTitle>
          <CardDescription>
            Transforme sua cozinha em diferentes estilos mantendo a estrutura dos móveis planejados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="analysis">Análise</TabsTrigger>
              <TabsTrigger value="style">Estilo</TabsTrigger>
              <TabsTrigger value="result">Resultado</TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Faça upload da foto da sua cozinha
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG ou WebP até 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {selectedImage && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Cozinha selecionada"
                    className="w-full max-w-md mx-auto rounded-lg border"
                  />
                </div>
              )}
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-4">
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                  <p className="text-lg font-medium">Analisando sua cozinha...</p>
                  <p className="text-sm text-gray-500">Detectando elementos e materiais</p>
                </div>
              ) : detectedElements.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Elementos Detectados</h3>
                  <div className="grid gap-4">
                    {detectedElements.map((element) => (
                      <Card key={element.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{element.name}</h4>
                            <p className="text-sm text-gray-500">
                              {element.currentMaterial} - {element.currentColor}
                            </p>
                          </div>
                          <Badge variant="outline">{element.type}</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Faça upload de uma imagem para começar a análise</p>
                </div>
              )}
            </TabsContent>

            {/* Style Tab */}
            <TabsContent value="style" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Escolha o Estilo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stylePresets.map((style) => (
                    <Card 
                      key={style.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedStyle === style.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedStyle(style.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">{style.icon}</div>
                        <h4 className="font-semibold mb-2">{style.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{style.description}</p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {style.characteristics.map((char) => (
                            <Badge key={char} variant="secondary" className="text-xs">
                              {char}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {selectedStyle && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Opções de Transformação</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Intensidade da Transformação: {transformationOptions.intensity}%
                        </label>
                        <Slider
                          value={[transformationOptions.intensity]}
                          onValueChange={(value) => 
                            setTransformationOptions(prev => ({ ...prev, intensity: value[0] }))
                          }
                          max={100}
                          step={10}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="preserveLayout"
                            checked={transformationOptions.preserveLayout}
                            onCheckedChange={(checked) =>
                              setTransformationOptions(prev => ({ 
                                ...prev, 
                                preserveLayout: checked as boolean 
                              }))
                            }
                          />
                          <label htmlFor="preserveLayout" className="text-sm">
                            Preservar layout dos móveis
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="preserveAppliances"
                            checked={transformationOptions.preserveAppliances}
                            onCheckedChange={(checked) =>
                              setTransformationOptions(prev => ({ 
                                ...prev, 
                                preserveAppliances: checked as boolean 
                              }))
                            }
                          />
                          <label htmlFor="preserveAppliances" className="text-sm">
                            Manter eletrodomésticos
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Material Personalizado para Armários
                        </label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um material" />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.cabinet.map((material) => (
                              <SelectItem key={material} value={material}>
                                {material}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Material da Bancada
                        </label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um material" />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.countertop.map((material) => (
                              <SelectItem key={material} value={material}>
                                {material}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <Button 
                      onClick={transformKitchen}
                      size="lg"
                      disabled={!selectedImage || isTransforming}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isTransforming ? (
                        <>
                          <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                          Transformando...
                        </>
                      ) : (
                        <>
                          <Palette className="h-5 w-5 mr-2" />
                          Transformar Cozinha
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Result Tab */}
            <TabsContent value="result" className="space-y-4">
              {transformedImage ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Imagem Original</h4>
                      <img
                        src={selectedImage ? URL.createObjectURL(selectedImage) : ''}
                        alt="Original"
                        className="w-full rounded-lg border"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">
                        Estilo {stylePresets.find(s => s.id === selectedStyle)?.name}
                      </h4>
                      <img
                        src={transformedImage}
                        alt="Transformada"
                        className="w-full rounded-lg border"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button onClick={downloadResult} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Resultado
                    </Button>
                    <Button onClick={resetTransformation} variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Nova Transformação
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Complete a transformação para ver os resultados
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default KitchenStyleTransformer;