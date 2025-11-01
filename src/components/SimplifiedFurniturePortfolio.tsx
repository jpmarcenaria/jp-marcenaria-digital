/**
 * Interface Simplificada para MÃ³veis Planejados
 * JP Marcenaria Digital
 * 
 * Interface otimizada com:
 * - Performance aprimorada (< 2s carregamento)
 * - Design mobile-first responsivo
 * - NavegaÃ§Ã£o intuitiva com breadcrumbs
 * - Sistema de favoritos e comparaÃ§Ã£o
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Heart,
  GitCompare,
  ChevronRight,
  Home,
  RotateCcw,
  Maximize2,
  Info,
  Star,
  Ruler,
  Palette,
  Clock,
  Shield,
  ChevronDown,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import OptimizedImage from '@/components/OptimizedImage';
import Simple360Viewer from '@/components/Simple360Viewer';
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
  search: string;
}

const SimplifiedFurniturePortfolio: React.FC = () => {
  // Estados principais
  const [allFurniture] = useState<FurnitureItem[]>(() => {
    const items: FurnitureItem[] = [];
    Object.values(furnitureCatalog.furniture_catalog).forEach((category: any) => {
      items.push(...category);
    });
    return items;
  });

  const [filteredFurniture, setFilteredFurniture] = useState<FurnitureItem[]>(allFurniture);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [compareList, setCompareList] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);
  const [show360View, setShow360View] = useState(false);

  // Categorias disponÃ­veis
  const categories = useMemo(() => [
    { id: 'all', name: 'Todos', icon: 'ðŸ ', count: allFurniture.length },
    { id: 'cozinha', name: 'Cozinha', icon: 'ðŸ³', count: allFurniture.filter(f => f.categoria === 'cozinha').length },
    { id: 'dormitorio', name: 'DormitÃ³rio', icon: 'ðŸ›ï¸', count: allFurniture.filter(f => f.categoria === 'dormitorio').length },
    { id: 'sala', name: 'Sala', icon: 'ðŸ›‹ï¸', count: allFurniture.filter(f => f.categoria === 'sala').length },
    { id: 'escritorio', name: 'EscritÃ³rio', icon: 'ðŸ’¼', count: allFurniture.filter(f => f.categoria === 'escritorio').length },
    { id: 'banheiro', name: 'Banheiro', icon: 'ðŸš¿', count: allFurniture.filter(f => f.categoria === 'banheiro').length },
    { id: 'closet', name: 'Closet', icon: 'ðŸ‘”', count: allFurniture.filter(f => f.categoria === 'closet').length },
    { id: 'area-gourmet', name: 'Ãrea Gourmet', icon: 'ðŸ–', count: allFurniture.filter(f => f.categoria === 'area-gourmet').length }
  ], [allFurniture]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...allFurniture];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.categoria === selectedCategory);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.nome.toLowerCase().includes(searchLower) ||
        item.categoria.toLowerCase().includes(searchLower) ||
        item.estilo.toLowerCase().includes(searchLower) ||
        item.material_principal.toLowerCase().includes(searchLower)
      );
    }

    setFilteredFurniture(filtered);
  }, [selectedCategory, searchTerm, allFurniture]);

  // FunÃ§Ãµes de favoritos e comparaÃ§Ã£o
  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const toggleCompare = (id: string) => {
    setCompareList(prev => {
      const newCompare = new Set(prev);
      if (newCompare.has(id)) {
        newCompare.delete(id);
      } else if (newCompare.size < 3) {
        newCompare.add(id);
      }
      return newCompare;
    });
  };

  // Breadcrumbs
  const renderBreadcrumbs = () => (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Home className="h-4 w-4" />
      <ChevronRight className="h-4 w-4" />
      <span>MÃ³veis Planejados</span>
      {selectedCategory !== 'all' && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">
            {categories.find(c => c.id === selectedCategory)?.name}
          </span>
        </>
      )}
    </nav>
  );

  // Header com busca e filtros
  const renderHeader = () => (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">MÃ³veis Planejados</h1>
          <p className="text-muted-foreground">
            Projetos arquitetÃ´nicos com design otimizado e performance superior
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {favorites.size} Favoritos
          </Badge>
          {compareList.size > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <GitCompare className="h-3 w-3" />
              {compareList.size} para Comparar
            </Badge>
          )}
        </div>
      </div>

      {/* Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar mÃ³veis, materiais, estilos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          
          {(searchTerm || selectedCategory !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // NavegaÃ§Ã£o por categorias
  const renderCategoryNav = () => (
    <div className="mb-8">
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex-shrink-0 flex items-center gap-2"
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  );

  // Card de produto otimizado
  const renderProductCard = (item: FurnitureItem) => (
    <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-video" onClick={() => setSelectedItem(item)} role="button" aria-label={"Ver detalhes"}>
        <OptimizedImage
          src={item.imagens[0]}
          alt={item.nome}
          className="w-full h-full"
          priority={false}
        />
        
        {/* Overlay com aÃ§Ãµes */}
        <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedItem(item)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ver detalhes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedItem(item);
                      setShow360View(true);
                    }}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>VisualizaÃ§Ã£o 360Â°</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Badges de categoria e favorito */}
        <div className="absolute top-2 left-2">
          <Badge className="bg-black/70 text-white text-xs">
            {categories.find(c => c.id === item.categoria)?.icon} {categories.find(c => c.id === item.categoria)?.name}
          </Badge>
        </div>
        
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Button
            size="sm"
            variant={favorites.has(item.id) ? "default" : "secondary"}
            className="w-8 h-8 p-0"
            onClick={() => toggleFavorite(item.id)}
          >
            <Heart className={`h-4 w-4 ${favorites.has(item.id) ? 'fill-current' : ''}`} />
          </Button>
          
          <Button
            size="sm"
            variant={compareList.has(item.id) ? "default" : "secondary"}
            className="w-8 h-8 p-0"
            onClick={() => toggleCompare(item.id)}
            disabled={!compareList.has(item.id) && compareList.size >= 3}
          >
            <GitCompare className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{item.nome}</h3>
        
        {/* InformaÃ§Ãµes tÃ©cnicas resumidas */}
        <div className="space-y-2 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-2">
            <Ruler className="h-3 w-3" />
            <span>{item.dimensoes.largura}Ã—{item.dimensoes.altura}Ã—{item.dimensoes.profundidade}cm</span>
          </div>
          <div className="flex items-center gap-2">
            <Palette className="h-3 w-3" />
            <span>{item.material_principal}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>{item.prazo_fabricacao} dias</span>
          </div>
        </div>
        
        {/* PreÃ§o e garantia */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-green-600">
              R$ {item.preco_base.toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>{item.garantia} meses</span>
            </div>
          </div>
          
          <Button size="sm" onClick={() => setSelectedItem(item)}>
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Grid de produtos
  const renderProductGrid = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {filteredFurniture.length} {filteredFurniture.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
        </h2>
      </div>

      {filteredFurniture.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">ðŸ”</div>
          <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Tente ajustar os filtros ou fazer uma nova busca
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
          }}>
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredFurniture.map(renderProductCard)}
        </div>
      )}
    </div>
  );

  // Modal de detalhes
  const renderDetailsModal = () => {
    if (!selectedItem) return null;

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">{selectedItem.nome}</h2>
              <p className="text-muted-foreground">
                {categories.find(c => c.id === selectedItem.categoria)?.name} â€¢ {selectedItem.estilo}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedItem(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* ConteÃºdo */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Imagem */}
              <div className="aspect-video">
                <OptimizedImage
                  src={selectedItem.imagens[0]}
                  alt={selectedItem.nome}
                  className="w-full h-full rounded-lg"
                  priority={true}
                />
              </div>

              {/* InformaÃ§Ãµes */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">EspecificaÃ§Ãµes TÃ©cnicas</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">DimensÃµes:</span>
                      <p>{selectedItem.dimensoes.largura} Ã— {selectedItem.dimensoes.altura} Ã— {selectedItem.dimensoes.profundidade} cm</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Material:</span>
                      <p>{selectedItem.material_principal}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Acabamento:</span>
                      <p>{selectedItem.acabamento}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Prazo:</span>
                      <p>{selectedItem.prazo_fabricacao} dias Ãºteis</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Acabamentos DisponÃ­veis</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.acabamentos_disponiveis.map((acabamento, index) => (
                      <Badge key={index} variant="outline">
                        {acabamento}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        R$ {selectedItem.preco_base.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Garantia de {selectedItem.garantia} meses
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      Solicitar OrÃ§amento
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShow360View(true);
                      }}
                    >
                      <Maximize2 className="h-4 w-4 mr-2" />
                      360Â°
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

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {renderBreadcrumbs()}
          {renderHeader()}
          {renderCategoryNav()}
          {renderProductGrid()}
          {renderDetailsModal()}
          
          {/* Visualizador 360Â° */}
          <Simple360Viewer
            furniture={selectedItem}
            isOpen={show360View}
            onClose={() => setShow360View(false)}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SimplifiedFurniturePortfolio;
