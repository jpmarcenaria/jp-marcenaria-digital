import React, { useState, useCallback, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Wand2, 
  Download, 
  Sparkles, 
  Eye, 
  Settings,
  Palette,
  Home,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Box,
  Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import AR3DViewer from '@/components/AR3DViewer';
import ManualAdjustments from '@/components/ManualAdjustments';

interface ProcessingResult {
  id: string;
  originalImage: string;
  transformedImage: string;
  style: string;
  confidence: number;
  processingTime: number;
}

const FotoMagiaIA: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('moderno');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [isARMode, setIsARMode] = useState(false);
  const [currentStep, setCurrentStep] = useState('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = [
    { id: 'moderno', name: 'Moderno', icon: '🏢', description: 'Linhas limpas, cores neutras, acabamentos minimalistas' },
    { id: 'rustico', name: 'Rústico', icon: '🏡', description: 'Madeira natural, pedras, elementos orgânicos' },
    { id: 'industrial', name: 'Industrial', icon: '🏭', description: 'Metal, concreto, tubulações aparentes' },
    { id: 'classico', name: 'Clássico', icon: '🏛️', description: 'Elegância atemporal, detalhes refinados' },
    { id: 'escandinavo', name: 'Escandinavo', icon: '❄️', description: 'Funcionalidade, cores claras, madeira clara' },
    { id: 'contemporaneo', name: 'Contemporâneo', icon: '✨', description: 'Tendências atuais, inovação, tecnologia' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      toast.error('Alguns arquivos foram ignorados. Apenas imagens são aceitas.');
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    toast.success(`${validFiles.length} imagem(ns) adicionada(s)`);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const simulateProcessing = useCallback(() => {
    if (!selectedStyle || selectedFiles.length === 0) return;
    
    setIsProcessing(true);
    setCurrentStep('processing');
    setProcessingProgress(0);
    
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setCurrentStep('results');
          
          // Simular resultados
          const mockResults = selectedFiles.map((file, index) => ({
            id: `result-${index}`,
            originalUrl: URL.createObjectURL(file),
            transformedUrl: `https://picsum.photos/800/600?random=${Date.now() + index}`,
            confidence: 85 + Math.random() * 10,
            processingTime: 2.5 + Math.random() * 2,
            objectsDetected: Math.floor(Math.random() * 8) + 3,
            style: selectedStyle
          }));
          
          setResults(mockResults);
          toast.success('Transformação concluída com sucesso!');
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  }, [selectedStyle, selectedFiles]);

  const downloadResult = (result: ProcessingResult) => {
    const link = document.createElement('a');
    link.href = result.transformedImage;
    link.download = `foto-magia-${result.style}-${result.id}.jpg`;
    link.click();
    toast.success('Download iniciado!');
  };

  return (
    <div
      className="min-h-screen bg-black hover:bg-black active:bg-black focus:bg-black"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Header */}
      <div className="bg-black shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-xl font-bold text-white">FOTO MAGIA IA</h1>
                  <p className="text-sm text-gray-300">Transformação Inteligente de Ambientes</p>
                </div>
              </div>
            </div>
            
            {/* Status do Processamento */}
            <div className="flex items-center gap-4">
              {isProcessing && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                  <span className="text-sm text-gray-600">Processando...</span>
                </div>
              )}
              {results.length > 0 && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {results.length} resultado{results.length > 1 ? 's' : ''}
                </Badge>
              )}
              {isARMode && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Box className="h-3 w-3 mr-1" />
                  Modo AR Ativo
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegação por Etapas */}
         <div className="mb-8">
           <div className="flex items-center justify-center space-x-8">
             {[
               { id: 'upload', label: 'Upload', icon: Upload },
               { id: 'style', label: 'Estilo', icon: Palette },
               { id: 'processing', label: 'Processamento', icon: Wand2 },
               { id: 'results', label: 'Resultados', icon: Eye },
             ].map((step, index) => {
               const Icon = step.icon;
               const isActive = currentStep === step.id;
               const isCompleted = ['upload', 'style', 'processing'].indexOf(step.id) < ['upload', 'style', 'processing', 'results'].indexOf(currentStep);
               
               return (
                 <div key={step.id} className="flex items-center">
                   <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                     isActive 
                       ? 'border-purple-600 bg-purple-600 text-white' 
                       : isCompleted 
                         ? 'border-green-600 bg-green-600 text-white'
                         : 'border-gray-300 bg-white text-gray-400'
                   }`}>
                     {isCompleted ? (
                       <CheckCircle className="h-5 w-5" />
                     ) : (
                       <Icon className="h-5 w-5" />
                     )}
                   </div>
                   <span className={`ml-2 text-sm font-medium ${
                     isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                   }`}>
                     {step.label}
                   </span>
                   {index < 3 && (
                     <div className={`w-16 h-0.5 mx-4 ${
                       isCompleted ? 'bg-green-600' : 'bg-gray-300'
                     }`} />
                   )}
                 </div>
               );
             })}
           </div>
         </div>

         {/* Conteúdo Principal */}
         <Tabs value={currentStep} className="w-full">

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Upload de Imagens
                </CardTitle>
                <CardDescription>
                  Faça upload das fotos do ambiente que deseja transformar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Área de Upload */}
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Arraste suas fotos aqui ou clique para selecionar
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Suporte para JPG, PNG, WebP até 10MB cada
                    </p>
                    <Button>
                      Selecionar Arquivos
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Preview das Imagens */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Imagens Selecionadas ({selectedFiles.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                              <Button
                                onClick={() => removeFile(index)}
                                variant="destructive"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Remover
                              </Button>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-end">
                         <Button 
                           onClick={() => setCurrentStep('style')}
                           disabled={selectedFiles.length === 0}
                         >
                           Continuar para Seleção de Estilo
                         </Button>
                       </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Styles Tab */}
          <TabsContent value="style" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Seleção de Estilo
                </CardTitle>
                <CardDescription>
                  Escolha o estilo de transformação para sua cozinha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {styles.map((style) => (
                    <Card 
                      key={style.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedStyle === style.id 
                          ? 'ring-2 ring-purple-600 shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedStyle(style.id)}
                    >
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-3xl mb-2">{style.icon}</div>
                          <h3 className="font-semibold text-lg mb-2">{style.name}</h3>
                          <p className="text-sm text-gray-600">{style.description}</p>
                          {selectedStyle === style.id && (
                            <Badge className="mt-2 bg-purple-500">Selecionado</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {selectedStyle && (
                   <div className="flex justify-between mt-6">
                     <Button 
                       variant="outline"
                       onClick={() => setCurrentStep('upload')}
                     >
                       Voltar
                     </Button>
                     <Button onClick={simulateProcessing}>
                       Iniciar Transformação
                     </Button>
                   </div>
                 )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Processing Tab */}
          <TabsContent value="processing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 animate-spin" />
                  Processamento em Andamento
                </CardTitle>
                <CardDescription>
                  Nossa IA está analisando e transformando suas imagens...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold mb-2">Aplicando Magia IA</h3>
                  <p className="text-gray-600 mb-4">
                    Detectando objetos, analisando perspectiva e aplicando o estilo {selectedStyle}...
                  </p>
                  <Progress value={processingProgress} className="w-full max-w-md mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">{processingProgress}% concluído</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium">Visão Computacional</h4>
                    <p className="text-sm text-gray-600">Identificando móveis e estruturas</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <Settings className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium">Análise de Perspectiva</p>
                    <p className="text-sm text-gray-600">Calculando proporções e ângulos</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium">Transformação IA</h4>
                    <p className="text-sm text-gray-600">Aplicando estilo selecionado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {results.length > 0 && (
              <>
                {/* Visualização Principal */}
                 <AR3DViewer
                   imageUrl={results[0]?.originalUrl}
                   transformedImageUrl={results[0]?.transformedUrl}
                   onARModeChange={setIsARMode}
                 />
 
                 {/* Ajustes Manuais */}
                 <ManualAdjustments
                   imageUrl={results[0]?.originalUrl}
                   transformedImageUrl={results[0]?.transformedUrl}
                   onAdjustmentChange={(settings) => {
                     console.log('Ajustes aplicados:', settings);
                     toast.success('Ajustes aplicados com sucesso!');
                   }}
                   onExport={(settings) => {
                     console.log('Configurações de exportação:', settings);
                     toast.success('Imagem exportada com sucesso!');
                   }}
                 />

                {/* Galeria de Resultados */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Galeria de Resultados
                    </CardTitle>
                    <CardDescription>
                      Visualize todas as transformações geradas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {results.map((result) => (
                        <div key={result.id} className="border rounded-lg p-6 bg-white">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Imagem Original */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Home className="h-4 w-4" />
                                Imagem Original
                              </h4>
                              <img
                                 src={result.originalUrl}
                                 alt="Original"
                                 className="w-full h-64 object-cover rounded-lg border"
                               />
                             </div>
 
                             {/* Imagem Transformada */}
                             <div>
                               <h4 className="font-medium mb-3 flex items-center gap-2">
                                 <Sparkles className="h-4 w-4" />
                                 Estilo {styles.find(s => s.id === result.style)?.name}
                               </h4>
                               <img
                                 src={result.transformedUrl}
                                 alt="Transformada"
                                 className="w-full h-64 object-cover rounded-lg border"
                               />
                            </div>
                          </div>

                          {/* Métricas e Ações */}
                           <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                             <div className="flex gap-4">
                               <Badge variant="secondary">
                                 Confiança: {result.confidence.toFixed(1)}%
                               </Badge>
                               <Badge variant="outline">
                                 Tempo: {result.processingTime.toFixed(1)}s
                               </Badge>
                               <Badge variant="outline">
                                 Objetos: {result.objectsDetected}
                               </Badge>
                             </div>
                            <div className="space-x-2">
                              <Button
                                onClick={() => downloadResult(result)}
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Baixar
                              </Button>
                              <Button variant="outline" className="flex items-center gap-2">
                                <Sliders className="h-4 w-4" />
                                Ajustar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSelectedFiles([]);
                          setResults([]);
                          setCurrentStep('upload');
                        }}
                      >
                        Nova Transformação
                      </Button>
                      <div className="space-x-2">
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar Todas
                        </Button>
                        <Button>
                          <Settings className="h-4 w-4 mr-2" />
                          Ajustes Avançados
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FotoMagiaIA;
