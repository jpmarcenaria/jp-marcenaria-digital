/**
 * Componente de Portfólio Real
 * JP Marcenaria Digital
 * 
 * Exibe portfólio com imagens reais coletadas e projetos exemplares
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  ZoomIn, 
  X, 
  MapPin,
  Calendar,
  Ruler,
  Users,
  Palette,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import portfolioData from '@/data/portfolio-data.json';

interface FurnitureImage {
  id: string;
  url: string;
  title: string;
  category: string;
  style: string;
  description: string;
  materials: string[];
  dimensions?: string;
  source: string;
  quality: string;
  resolution: { width: number; height: number };
}

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  images: string[];
  materials: string[];
  area_m2?: number;
  prazo_dias?: number;
  cliente?: string;
  arquiteto?: string;
  cidade?: string;
}

const RealPortfolio: React.FC = () => {
  const [images] = useState<FurnitureImage[]>(portfolioData.images);
  const [projects] = useState<Project[]>(portfolioData.projects);
  const [filteredImages, setFilteredImages] = useState<FurnitureImage[]>(images);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [selectedImage, setSelectedImage] = useState<FurnitureImage | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [filters, setFilters] = useState({
    category: 'all',
    style: 'all',
    search: ''
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...images];

    if (filters.category !== 'all') {
      filtered = filtered.filter(img => img.category === filters.category);
    }

    if (filters.style !== 'all') {
      filtered = filtered.filter(img => img.style === filters.style);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(img => 
        img.title.toLowerCase().includes(searchLower) ||
        img.description.toLowerCase().includes(searchLower) ||
        img.materials.some(material => material.toLowerCase().includes(searchLower))
      );
    }

    setFilteredImages(filtered);

    // Filtrar projetos também
    let filteredProj = [...projects];
    if (filters.category !== 'all') {
      filteredProj = filteredProj.filter(proj => proj.category === filters.category);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProj = filteredProj.filter(proj => 
        proj.title.toLowerCase().includes(searchLower) ||
        proj.description.toLowerCase().includes(searchLower)
      );
    }
    setFilteredProjects(filteredProj);
  }, [filters, images, projects]);

  const openImageModal = (image: FurnitureImage, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const nextIndex = (currentImageIndex + 1) % filteredImages.length;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(filteredImages[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = currentImageIndex === 0 ? filteredImages.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(filteredImages[prevIndex]);
  };

  const getImageById = (id: string): FurnitureImage | undefined => {
    return images.find(img => img.id === id);
  };

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
      minimalista: 'Minimalista',
      contemporaneo: 'Contemporâneo'
    };
    return names[style as keyof typeof names] || style;
  };

  const renderFilters = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Busca
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar projetos..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

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
                <SelectItem value="all">Todas as Categorias</SelectItem>
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
                <SelectItem value="all">Todos os Estilos</SelectItem>
                <SelectItem value="moderno">Moderno</SelectItem>
                <SelectItem value="classico">Clássico</SelectItem>
                <SelectItem value="rustico">Rústico</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="minimalista">Minimalista</SelectItem>
                <SelectItem value="contemporaneo">Contemporâneo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ category: 'all', style: 'all', search: '' })}
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
    </Card>
  );

  const renderImageGallery = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Galeria de Projetos ({filteredImages.length} imagens)
        </h2>
        <Badge variant="secondary" className="text-sm">
          {portfolioData.totalImages} imagens coletadas
        </Badge>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image, index) => (
            <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    onClick={() => openImageModal(image, index)}
                    className="bg-white/90 text-black hover:bg-white"
                  >
                    <ZoomIn className="h-4 w-4 mr-2" />
                    Ampliar
                  </Button>
                </div>
                
                <div className="absolute top-2 left-2">
                  <Badge className="bg-black/70 text-white text-xs">
                    {getCategoryIcon(image.category)} {getCategoryName(image.category)}
                  </Badge>
                </div>
                
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {image.quality === 'alta' ? '4K' : 'HD'}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{image.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {image.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {getStyleName(image.style)}
                  </Badge>
                  {image.dimensions && (
                    <Badge variant="outline" className="text-xs">
                      {image.dimensions}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{image.resolution.width}x{image.resolution.height}</span>
                  <span>{image.source}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredImages.map((image, index) => (
            <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-all">
              <div className="flex">
                <div className="w-64 h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                <CardContent className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(image.category)}</span>
                        <h3 className="font-semibold text-lg">{image.title}</h3>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {image.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">{getCategoryName(image.category)}</Badge>
                        <Badge variant="outline">{getStyleName(image.style)}</Badge>
                        {image.dimensions && (
                          <Badge variant="outline">{image.dimensions}</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>📐 {image.resolution.width}x{image.resolution.height}</span>
                        <span>📸 {image.source}</span>
                        <span>⭐ {image.quality === 'alta' ? 'Alta Qualidade' : 'Qualidade Padrão'}</span>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => openImageModal(image, index)}
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
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Projetos Executados ({filteredProjects.length} projetos)
        </h2>
        <Badge variant="secondary" className="text-sm">
          {portfolioData.totalProjects} projetos concluídos
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-xl transition-all">
            <div className="relative">
              {/* Galeria de imagens do projeto */}
              <div className="grid grid-cols-2 gap-1 aspect-video">
                {project.images.slice(0, 4).map((imageId, index) => {
                  const image = getImageById(imageId);
                  if (!image) return null;
                  
                  return (
                    <div 
                      key={imageId} 
                      className={`relative overflow-hidden ${
                        index === 0 && project.images.length === 1 ? 'col-span-2' :
                        index === 0 && project.images.length === 2 ? 'col-span-1' :
                        index === 0 && project.images.length >= 3 ? 'col-span-2 row-span-2' : ''
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => setSelectedProject(project)}
                      />
                      {index === 3 && project.images.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                          +{project.images.length - 4} fotos
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="absolute top-4 left-4">
                <Badge className="bg-black/70 text-white">
                  {getCategoryIcon(project.category)} {getCategoryName(project.category)}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-2">{project.title}</h3>
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {project.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                {project.area_m2 && (
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-blue-500" />
                    <span>{project.area_m2}m²</span>
                  </div>
                )}
                {project.prazo_dias && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span>{project.prazo_dias} dias</span>
                  </div>
                )}
                {project.cliente && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>{project.cliente}</span>
                  </div>
                )}
                {project.cidade && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span>{project.cidade}</span>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <Label className="text-xs text-muted-foreground mb-2 block">Materiais Utilizados</Label>
                <div className="flex flex-wrap gap-1">
                  {project.materials.slice(0, 4).map((material, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {material}
                    </Badge>
                  ))}
                  {project.materials.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.materials.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => setSelectedProject(project)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Projeto Completo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderImageModal = () => {
    if (!selectedImage) return null;

    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-7xl max-h-full w-full">
          {/* Controles */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={prevImage}
              disabled={filteredImages.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={nextImage}
              disabled={filteredImages.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={closeImageModal}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Contador */}
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-black/70 text-white">
              {currentImageIndex + 1} de {filteredImages.length}
            </Badge>
          </div>

          {/* Imagem */}
          <div className="bg-white rounded-lg overflow-hidden">
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
            
            {/* Informações */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedImage.title}</h2>
                  <p className="text-muted-foreground">{selectedImage.description}</p>
                </div>
                <div className="flex gap-2">
                  <Badge>{getCategoryName(selectedImage.category)}</Badge>
                  <Badge variant="outline">{getStyleName(selectedImage.style)}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Resolução</Label>
                  <p className="font-medium">{selectedImage.resolution.width}x{selectedImage.resolution.height}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Qualidade</Label>
                  <p className="font-medium">{selectedImage.quality === 'alta' ? 'Alta (4K)' : 'Padrão (HD)'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fonte</Label>
                  <p className="font-medium">{selectedImage.source}</p>
                </div>
                {selectedImage.dimensions && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Dimensões</Label>
                    <p className="font-medium">{selectedImage.dimensions}</p>
                  </div>
                )}
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Materiais</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedImage.materials.map((material, index) => (
                    <Badge key={index} variant="outline">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProjectModal = () => {
    if (!selectedProject) return null;

    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-6xl max-h-full w-full bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">{selectedProject.title}</h2>
              <p className="text-muted-foreground">{selectedProject.cliente} • {selectedProject.cidade}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedProject(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Conteúdo */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {/* Galeria de imagens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {selectedProject.images.map((imageId) => {
                const image = getImageById(imageId);
                if (!image) return null;
                
                return (
                  <div key={imageId} className="aspect-video overflow-hidden rounded-lg">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => {
                        const index = filteredImages.findIndex(img => img.id === imageId);
                        if (index !== -1) {
                          openImageModal(image, index);
                          setSelectedProject(null);
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Informações do projeto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Descrição do Projeto</h3>
                <p className="text-muted-foreground mb-4">{selectedProject.description}</p>
                
                <h3 className="font-semibold mb-3">Especificações Técnicas</h3>
                <div className="space-y-2">
                  {selectedProject.area_m2 && (
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-blue-500" />
                      <span>Área: {selectedProject.area_m2}m²</span>
                    </div>
                  )}
                  {selectedProject.prazo_dias && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span>Prazo de Execução: {selectedProject.prazo_dias} dias</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span>Arquiteto: {selectedProject.arquiteto}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Materiais Utilizados</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedProject.materials.map((material, index) => (
                    <Badge key={index} variant="outline">
                      {material}
                    </Badge>
                  ))}
                </div>

                <h3 className="font-semibold mb-3">Informações do Cliente</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>{selectedProject.cliente}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span>{selectedProject.cidade}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-orange-500" />
                    <span>{getCategoryName(selectedProject.category)}</span>
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Portfólio Profissional</h1>
        <p className="text-muted-foreground text-lg">
          Projetos reais executados com excelência e acabamento premium
        </p>
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            {portfolioData.totalImages} imagens de alta qualidade
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            {portfolioData.totalProjects} projetos concluídos
          </Badge>
        </div>
      </div>

      {renderFilters()}

      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Galeria de Imagens
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Projetos Executados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery">
          {renderImageGallery()}
        </TabsContent>

        <TabsContent value="projects">
          {renderProjects()}
        </TabsContent>
      </Tabs>

      {renderImageModal()}
      {renderProjectModal()}
    </div>
  );
};

export default RealPortfolio;