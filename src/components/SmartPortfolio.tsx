/**
 * Componente de Portfólio Inteligente
 * JP Marcenaria Digital
 * 
 * Sistema completo de portfólio com coleta automática de imagens,
 * categorização inteligente e visualização profissional
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Eye, 
  ZoomIn, 
  X, 
  Play, 
  Pause, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Settings,
  Image as ImageIcon,
  Tag,
  Calendar,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ImageCollector, { ImageMetadata, CollectionConfig, DEFAULT_COLLECTION_CONFIG } from '@/utils/imageCollector';

interface FilterState {
  category: string;
  style: string;
  furnitureType: string;
  quality: string;
  search: string;
}

interface ViewState {
  mode: 'grid' | 'list';
  selectedImage: ImageMetadata | null;
  isFullscreen: boolean;
}

const SmartPortfolio: React.FC = () => {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageMetadata[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionProgress, setCollectionProgress] = useState(0);
  const [currentCollecting, setCurrentCollecting] = useState<ImageMetadata | null>(null);
  const [collector] = useState(() => new ImageCollector(DEFAULT_COLLECTION_CONFIG));
  const [config, setConfig] = useState<CollectionConfig>(DEFAULT_COLLECTION_CONFIG);
  const [stats, setStats] = useState<any>({});
  
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    style: 'all',
    furnitureType: 'all',
    quality: 'all',
    search: ''
  });

  const [view, setView] = useState<ViewState>({
    mode: 'grid',
    selectedImage: null,
    isFullscreen: false
  });

  // Iniciar coleta automática ao montar o componente
  useEffect(() => {
    startAutomaticCollection();
  }, []);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    applyFilters();
  }, [images, filters]);

  /**
   * Inicia a coleta automática de imagens
   */
  const startAutomaticCollection = async () => {
    setIsCollecting(true);
    setCollectionProgress(0);
    
    toast.info('🔍 Iniciando coleta automática de imagens de marcenaria...');

    try {
      const collectedImages = await collector.collectImages(
        (progress, current) => {
          setCollectionProgress(progress);
          setCurrentCollecting(current);
        }
      );

      setImages(collectedImages);
      setStats(collector.getCollectionStats());
      
      toast.success(`✅ Coleta concluída! ${collectedImages.length} imagens coletadas e validadas`);
    } catch (error) {
      toast.error('❌ Erro durante a coleta de imagens');
      console.error('Erro na coleta:', error);
    } finally {
      setIsCollecting(false);
      setCurrentCollecting(null);
    }
  };

  /**
   * Aplica filtros às imagens
   */
  const applyFilters = useCallback(() => {
    let filtered = [...images];

    // Filtro por categoria
    if (filters.category !== 'all') {
      filtered = filtered.filter(img => img.category === filters.category);
    }

    // Filtro por estilo
    if (filters.style !== 'all') {
      filtered = filtered.filter(img => img.style === filters.style);
    }

    // Filtro por tipo de móvel
    if (filters.furnitureType !== 'all') {
      filtered = filtered.filter(img => img.furnitureType === filters.furnitureType);
    }

    // Filtro por qualidade
    if (filters.quality !== 'all') {
      filtered = filtered.filter(img => img.quality === filters.quality);
    }

    // Filtro por busca textual
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(img => 
        img.title.toLowerCase().includes(searchLower) ||
        img.description.toLowerCase().includes(searchLower) ||
        img.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    setFilteredImages(filtered);
  }, [images, filters]);

  /**
   * Abre imagem em tela cheia
   */
  const openFullscreen = (image: ImageMetadata) => {
    setView(prev => ({
      ...prev,
      selectedImage: image,
      isFullscreen: true
    }));
  };

  /**
   * Fecha visualização em tela cheia
   */
  const closeFullscreen = () => {
    setView(prev => ({
      ...prev,
      selectedImage: null,
      isFullscreen: false
    }));
  };

  /**
   * Renderiza o progresso da coleta
   */
  const renderCollectionProgress = () => {
    if (!isCollecting) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Coletando Imagens Automaticamente
          </CardTitle>
          <CardDescription>
            Buscando e validando imagens de marcenaria arquitetônica...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={collectionProgress} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{Math.round(collectionProgress)}% concluído</span>
              <span>{images.length} imagens coletadas</span>
            </div>
            
            {currentCollecting && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{currentCollecting.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentCollecting.dimensions.width}x{currentCollecting.dimensions.height} • 
                    {currentCollecting.quality} qualidade • 
                    {currentCollecting.source}
                  </p>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {currentCollecting.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {currentCollecting.style}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-xs text-green-600">Validada</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * Renderiza estatísticas da coleta
   */
  const renderStats = () => {
    if (Object.keys(stats).length === 0) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total de Imagens</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.byQuality?.alta || 0}
            </div>
            <div className="text-sm text-muted-foreground">Alta Qualidade</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(stats.byCategory || {}).length}
            </div>
            <div className="text-sm text-muted-foreground">Categorias</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.averageResolution ? 
                `${stats.averageResolution.width}x${stats.averageResolution.height}` : 
                'N/A'
              }
            </div>
            <div className="text-sm text-muted-foreground">Resolução Média</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Renderiza controles de filtro
   */
  const renderFilters = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros e Busca
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Busca textual */}
          <div className="lg:col-span-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por título, descrição ou tags..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtro por categoria */}
          <div>
            <Label>Categoria</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="residencial">Residencial</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
                <SelectItem value="corporativo">Corporativo</SelectItem>
                <SelectItem value="hospitalar">Hospitalar</SelectItem>
                <SelectItem value="educacional">Educacional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por estilo */}
          <div>
            <Label>Estilo</Label>
            <Select
              value={filters.style}
              onValueChange={(value) => setFilters(prev => ({ ...prev, style: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="moderno">Moderno</SelectItem>
                <SelectItem value="classico">Clássico</SelectItem>
                <SelectItem value="rustico">Rústico</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="minimalista">Minimalista</SelectItem>
                <SelectItem value="contemporaneo">Contemporâneo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por tipo de móvel */}
          <div>
            <Label>Tipo de Móvel</Label>
            <Select
              value={filters.furnitureType}
              onValueChange={(value) => setFilters(prev => ({ ...prev, furnitureType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="cozinha">Cozinha</SelectItem>
                <SelectItem value="sala">Sala</SelectItem>
                <SelectItem value="quarto">Quarto</SelectItem>
                <SelectItem value="escritorio">Escritório</SelectItem>
                <SelectItem value="banheiro">Banheiro</SelectItem>
                <SelectItem value="area-gourmet">Área Gourmet</SelectItem>
                <SelectItem value="closet">Closet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="grid-mode"
                checked={view.mode === 'grid'}
                onCheckedChange={(checked) => 
                  setView(prev => ({ ...prev, mode: checked ? 'grid' : 'list' }))
                }
              />
              <Label htmlFor="grid-mode" className="flex items-center gap-2">
                {view.mode === 'grid' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                {view.mode === 'grid' ? 'Grade' : 'Lista'}
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({
                category: 'all',
                style: 'all',
                furnitureType: 'all',
                quality: 'all',
                search: ''
              })}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={startAutomaticCollection}
              disabled={isCollecting}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isCollecting ? 'animate-spin' : ''}`} />
              Recarregar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Renderiza galeria de imagens
   */
  const renderGallery = () => {
    if (filteredImages.length === 0) {
      return (
        <Card className="p-12 text-center">
          <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma imagem encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Ajuste os filtros ou inicie uma nova coleta de imagens.
          </p>
          <Button onClick={startAutomaticCollection} disabled={isCollecting}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Iniciar Coleta
          </Button>
        </Card>
      );
    }

    if (view.mode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    onClick={() => openFullscreen(image)}
                    className="bg-white/90 text-black hover:bg-white"
                  >
                    <ZoomIn className="h-4 w-4 mr-2" />
                    Ampliar
                  </Button>
                </div>
                
                {/* Badges de qualidade */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {image.quality === 'alta' && (
                    <Badge className="bg-green-500 text-white text-xs">HD</Badge>
                  )}
                  {image.copyrightFree && (
                    <Badge className="bg-blue-500 text-white text-xs">Livre</Badge>
                  )}
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{image.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {image.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {image.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {image.style}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {image.furnitureType.replace('-', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{image.dimensions.width}x{image.dimensions.height}</span>
                  <span>{image.quality}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    // Modo lista
    return (
      <div className="space-y-4">
        {filteredImages.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="flex">
              <div className="w-48 h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              
              <CardContent className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{image.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {image.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary">{image.category}</Badge>
                      <Badge variant="outline">{image.style}</Badge>
                      <Badge variant="outline">{image.furnitureType.replace('-', ' ')}</Badge>
                      <Badge className={image.quality === 'alta' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {image.quality}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{image.dimensions.width}x{image.dimensions.height}</span>
                      <span>{image.source}</span>
                      <span>{new Date(image.collectedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => openFullscreen(image)}
                    className="ml-4"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  /**
   * Renderiza modal de visualização em tela cheia
   */
  const renderFullscreenModal = () => {
    if (!view.isFullscreen || !view.selectedImage) return null;

    const image = view.selectedImage;

    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-7xl max-h-full w-full">
          {/* Controles */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.open(image.url, '_blank')}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={closeFullscreen}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Imagem */}
          <div className="bg-white rounded-lg overflow-hidden">
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
            
            {/* Informações */}
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{image.title}</h2>
              <p className="text-muted-foreground mb-4">{image.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Categoria</Label>
                  <p className="font-medium">{image.category}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Estilo</Label>
                  <p className="font-medium">{image.style}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <p className="font-medium">{image.furnitureType.replace('-', ' ')}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Resolução</Label>
                  <p className="font-medium">{image.dimensions.width}x{image.dimensions.height}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {image.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Portfólio Inteligente</h1>
        <p className="text-muted-foreground">
          Sistema automático de coleta e organização de imagens de marcenaria arquitetônica
        </p>
      </div>

      {renderCollectionProgress()}
      {renderStats()}
      {renderFilters()}
      
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Galeria ({filteredImages.length} {filteredImages.length === 1 ? 'imagem' : 'imagens'})
        </h2>
      </div>

      {renderGallery()}
      {renderFullscreenModal()}
    </div>
  );
};

export default SmartPortfolio;