/**
 * Portfólio Especializado em Móveis Planejados
 * JP Marcenaria Digital
 * 
 * Catálogo profissional com especificações técnicas precisas,
 * filtros especializados e visualização 3D integrada
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  ZoomIn, 
  X, 
  Ruler,
  Palette,
  Home,
  Settings,
  Download,
  Star,
  Clock,
  Shield,
  Box,
  FileText,
  Calculator,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import Viewer3D from '@/components/Viewer3D';
import furnitureCatalog from '@/data/furniture-catalog.json';

interface FurnitureItem {
  id: string;
  nome: string;
  categoria: string;
  estilo: string;
  material_principal: string;
  acabamento: string;
  dimensoes: {
    largura: number;
    altura: number;
    profundidade: number;
    unidade: string;
  };
  especificacoes: any;
  materiais: any;
  acabamentos_disponiveis: string[];
  preco_base: number;
  prazo_fabricacao: number;
  garantia: number;
  imagens: string[];
  modelo_3d: string;
  ficha_tecnica: string;
}

interface FilterState {
  categoria: string;
  estilo: string;
  material: string;
  ambiente: string;
  precoMin: number;
  precoMax: number;
  search: string;
  acabamentos: string[];
}

const FurniturePortfolio: React.FC = () => {
  // Combinar todos os móveis do catálogo
  const allFurniture = useMemo(() => {
    const items: FurnitureItem[] = [];
    Object.values(furnitureCatalog.furniture_catalog).forEach((category: any) => {
      items.push(...category);
    });
    return items;
  }, []);

  const [filteredFurniture, setFilteredFurniture] = useState<FurnitureItem[]>(allFurniture);
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedSpecs, setSelectedSpecs] = useState<FurnitureItem | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    categoria: 'all',
    estilo: 'all',
    material: 'all',
    ambiente: 'all',
    precoMin: 0,
    precoMax: 20000,
    search: '',
    acabamentos: []
  });

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...allFurniture];

    // Filtro por categoria
    if (filters.categoria !== 'all') {
      filtered = filtered.filter(item => item.categoria === filters.categoria);
    }

    // Filtro por estilo
    if (filters.estilo !== 'all') {
      filtered = filtered.filter(item => item.estilo === filters.estilo);
    }

    // Filtro por material
    if (filters.material !== 'all') {
      filtered = filtered.filter(item => item.material_principal === filters.material);
    }

    // Filtro por preço
    filtered = filtered.filter(item => 
      item.preco_base >= filters.precoMin && item.preco_base <= filters.precoMax
    );

    // Filtro por busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.nome.toLowerCase().includes(searchLower) ||
        item.categoria.toLowerCase().includes(searchLower) ||
        item.estilo.toLowerCase().includes(searchLower) ||
        item.material_principal.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por acabamentos
    if (filters.acabamentos.length > 0) {
      filtered = filtered.filter(item =>
        filters.acabamentos.some(acabamento =>
          item.acabamentos_disponiveis.includes(acabamento)
        )
      );
    }

    setFilteredFurniture(filtered);
  }, [filters, allFurniture]);

  const getCategoryIcon = (category: string) => {
    const icons = {
      cozinha: '🍳',
      dormitorio: '🛏️',
      sala: '🛋️',
      escritorio: '💼',
      banheiro: '🚿',
      closet: '👔',
      'area-gourmet': '🍖'
    };
    return icons[category as keyof typeof icons] || '🏠';
  };

  const getCategoryName = (category: string) => {
    const names = {
      cozinha: 'Cozinha',
      dormitorio: 'Dormitório',
      sala: 'Sala de Estar',
      escritorio: 'Escritório',
      banheiro: 'Banheiro',
      closet: 'Closet',
      'area-gourmet': 'Área Gourmet'
    };
    return names[category as keyof typeof names] || category;
  };

  const getStyleName = (style: string) => {
    const names = {
      moderno: 'Moderno',
      classico: 'Clássico',
      rustico: 'Rústico',
      industrial: 'Industrial',
      contemporaneo: 'Contemporâneo'
    };
    return names[style as keyof typeof names] || style;
  };

  const getMaterialName = (material: string) => {
    const names = {
      'MDF': 'MDF',
      'Madeira Maciça': 'Madeira Maciça',
      'MDF Hidrófugo': 'MDF Hidrófugo',
      'Madeira de Demolição': 'Madeira de Demolição'
    };
    return names[material as keyof typeof names] || material;
  };

  const renderAdvancedFilters = () => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Especializados
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {showFilters && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Busca */}
            <div className="lg:col-span-2">
              <Label htmlFor="search">Buscar Móveis</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome, categoria, material..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categoria/Ambiente */}
            <div>
              <Label>Ambiente</Label>
              <Select
                value={filters.categoria}
                onValueChange={(value) => setFilters(prev => ({ ...prev, categoria: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Ambientes</SelectItem>
                  <SelectItem value="cozinha">🍳 Cozinha</SelectItem>
                  <SelectItem value="dormitorio">🛏️ Dormitório</SelectItem>
                  <SelectItem value="sala">🛋️ Sala de Estar</SelectItem>
                  <SelectItem value="escritorio">💼 Escritório</SelectItem>
                  <SelectItem value="banheiro">🚿 Banheiro</SelectItem>
                  <SelectItem value="closet">👔 Closet</SelectItem>
                  <SelectItem value="area-gourmet">🍖 Área Gourmet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estilo */}
            <div>
              <Label>Estilo</Label>
              <Select
                value={filters.estilo}
                onValueChange={(value) => setFilters(prev => ({ ...prev, estilo: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Estilos</SelectItem>
                  <SelectItem value="moderno">Moderno</SelectItem>
                  <SelectItem value="classico">Clássico</SelectItem>
                  <SelectItem value="rustico">Rústico</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="contemporaneo">Contemporâneo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Material */}
            <div>
              <Label>Material Principal</Label>
              <Select
                value={filters.material}
                onValueChange={(value) => setFilters(prev => ({ ...prev, material: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Materiais</SelectItem>
                  <SelectItem value="MDF">MDF</SelectItem>
                  <SelectItem value="Madeira Maciça">Madeira Maciça</SelectItem>
                  <SelectItem value="MDF Hidrófugo">MDF Hidrófugo</SelectItem>
                  <SelectItem value="Madeira de Demolição">Madeira de Demolição</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Faixa de Preço */}
            <div className="lg:col-span-2">
              <Label>
                Faixa de Preço: R$ {filters.precoMin.toLocaleString()} - R$ {filters.precoMax.toLocaleString()}
              </Label>
              <div className="mt-2 space-y-2">
                <Slider
                  value={[filters.precoMin, filters.precoMax]}
                  onValueChange={(values) => setFilters(prev => ({ 
                    ...prev, 
                    precoMin: values[0], 
                    precoMax: values[1] 
                  }))}
                  min={0}
                  max={20000}
                  step={100}
                  className="w-full"
                />
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({
                  categoria: 'all',
                  estilo: 'all',
                  material: 'all',
                  ambiente: 'all',
                  precoMin: 0,
                  precoMax: 20000,
                  search: '',
                  acabamentos: []
                })}
              >
                Limpar Filtros
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  const renderFurnitureGrid = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Catálogo de Móveis Planejados ({filteredFurniture.length} produtos)
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <Star className="h-3 w-3 mr-1" />
            Produtos Exclusivos
          </Badge>
          <Badge variant="outline">
            <Shield className="h-3 w-3 mr-1" />
            Garantia Estendida
          </Badge>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFurniture.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all group">
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={item.imagens[0]}
                  alt={item.nome}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedItem(item)}
                      className="bg-white/90 text-black hover:bg-white"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setShow3DViewer(true);
                      }}
                      className="bg-blue-500/90 text-white hover:bg-blue-500"
                    >
                      <Box className="h-4 w-4 mr-1" />
                      3D
                    </Button>
                  </div>
                </div>
                
                <div className="absolute top-2 left-2">
                  <Badge className="bg-black/70 text-white text-xs">
                    {getCategoryIcon(item.categoria)} {getCategoryName(item.categoria)}
                  </Badge>
                </div>
                
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {getStyleName(item.estilo)}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-white/90">
                    {getMaterialName(item.material_principal)}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{item.nome}</h3>
                
                <div className="space-y-2 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-3 w-3" />
                    <span>{item.dimensoes.largura}×{item.dimensoes.altura}×{item.dimensoes.profundidade}cm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="h-3 w-3" />
                    <span>{item.acabamento}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{item.prazo_fabricacao} dias</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      R$ {item.preco_base.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.garantia} meses de garantia
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setSelectedSpecs(item)}>
                    <FileText className="h-3 w-3 mr-1" />
                    Specs
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFurniture.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all">
              <div className="flex">
                <div className="w-64 h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                  <img
                    src={item.imagens[0]}
                    alt={item.nome}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                <CardContent className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(item.categoria)}</span>
                        <h3 className="font-semibold text-lg">{item.nome}</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">Categoria</Label>
                          <p>{getCategoryName(item.categoria)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Estilo</Label>
                          <p>{getStyleName(item.estilo)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Material</Label>
                          <p>{getMaterialName(item.material_principal)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Dimensões</Label>
                          <p>{item.dimensoes.largura}×{item.dimensoes.altura}×{item.dimensoes.profundidade}cm</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">{item.acabamento}</Badge>
                        <Badge variant="outline">{item.prazo_fabricacao} dias</Badge>
                        <Badge variant="outline">{item.garantia} meses garantia</Badge>
                      </div>
                      
                      <div className="text-2xl font-bold text-green-600">
                        R$ {item.preco_base.toLocaleString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" onClick={() => setSelectedItem(item)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(item);
                          setShow3DViewer(true);
                        }}
                      >
                        <Box className="h-4 w-4 mr-2" />
                        Visualizar 3D
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedSpecs(item)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Especificações
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderDetailModal = () => {
    if (!selectedItem) return null;

    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-6xl max-h-full w-full bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">{selectedItem.nome}</h2>
              <p className="text-muted-foreground">
                {getCategoryName(selectedItem.categoria)} • {getStyleName(selectedItem.estilo)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setShow3DViewer(true);
                }}
              >
                <Box className="h-4 w-4 mr-2" />
                Visualizar 3D
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedItem(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {/* Galeria de imagens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {selectedItem.imagens.map((image, index) => (
                <div key={index} className="aspect-video overflow-hidden rounded-lg">
                  <img
                    src={image}
                    alt={`${selectedItem.nome} - ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Informações detalhadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Especificações Técnicas</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Dimensões</Label>
                      <p>{selectedItem.dimensoes.largura} × {selectedItem.dimensoes.altura} × {selectedItem.dimensoes.profundidade} cm</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Material Principal</Label>
                      <p>{selectedItem.material_principal}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Acabamento</Label>
                      <p>{selectedItem.acabamento}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Prazo de Fabricação</Label>
                      <p>{selectedItem.prazo_fabricacao} dias úteis</p>
                    </div>
                  </div>

                  {/* Especificações detalhadas */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Características</Label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(selectedItem.especificacoes).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Materiais e Acabamentos</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Materiais Utilizados</Label>
                    <div className="space-y-1 text-sm">
                      {Object.entries(selectedItem.materiais).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Acabamentos Disponíveis</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.acabamentos_disponiveis.map((acabamento, index) => (
                        <Badge key={index} variant="outline">
                          {acabamento}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Preço Base:</span>
                      <span className="text-2xl font-bold text-green-600">
                        R$ {selectedItem.preco_base.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Garantia:</span>
                      <span>{selectedItem.garantia} meses</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Prazo de Entrega:</span>
                      <span>{selectedItem.prazo_fabricacao} dias úteis</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1">
                      <Calculator className="h-4 w-4 mr-2" />
                      Solicitar Orçamento
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Ficha Técnica
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const render3DViewer = () => {
    if (!show3DViewer || !selectedItem) return null;

    return (
      <div className="fixed inset-0 z-50">
        <Viewer3D
          modelPath={selectedItem.modelo_3d}
          furniture={selectedItem}
          onClose={() => setShow3DViewer(false)}
          isFullscreen={true}
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Móveis Planejados Sob Medida</h1>
        <p className="text-muted-foreground text-lg">
          Catálogo especializado com especificações técnicas precisas e visualização 3D
        </p>
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            {allFurniture.length} produtos disponíveis
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            Visualização 3D integrada
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Garantia estendida
          </Badge>
        </div>
      </div>

      {renderAdvancedFilters()}
      {renderFurnitureGrid()}
      {renderDetailModal()}
      {render3DViewer()}
    </div>
  );
};

export default FurniturePortfolio;