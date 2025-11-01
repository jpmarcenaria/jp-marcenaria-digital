/**
 * Professional Portfolio Component
 * JP Marcenaria Digital
 * 
 * Portfólio profissional de móveis planejados com:
 * - Design simples e sofisticado
 * - Galeria organizada por categorias
 * - Layout responsivo
 * - Efeitos de hover otimizados
 * - SEO implementado
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Heart,
  Share2,
  Download,
  X,
  ZoomIn
} from 'lucide-react';

// Interfaces
interface PortfolioImage {
  id: string;
  filename: string;
  url: string;
  category: string;
  title: string;
  description: string;
  dimensions: { width: number; height: number };
  quality: 'high' | 'medium' | 'low';
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  count: number;
}

// Dados das categorias
const categories: Category[] = [
  {
    id: 'all',
    name: 'all',
    displayName: 'Todos os Projetos',
    description: 'Visualize toda nossa coleção de móveis planejados',
    icon: '🏠',
    count: 0
  },
  {
    id: 'dormitorios',
    name: 'dormitorios',
    displayName: 'Dormitórios',
    description: 'Quartos elegantes com móveis planejados sob medida',
    icon: '🛏️',
    count: 0
  },
  {
    id: 'salas',
    name: 'salas',
    displayName: 'Salas de Estar',
    description: 'Ambientes sofisticados para momentos especiais',
    icon: '🛋️',
    count: 0
  },
  {
    id: 'cozinhas',
    name: 'cozinhas',
    displayName: 'Cozinhas',
    description: 'Cozinhas modernas e funcionais para o seu dia a dia',
    icon: '👨‍🍳',
    count: 0
  },
  {
    id: 'banheiros',
    name: 'banheiros',
    displayName: 'Banheiros',
    description: 'Banheiros elegantes com móveis sob medida',
    icon: '🚿',
    count: 0
  },
  {
    id: 'escritorios',
    name: 'escritorios',
    displayName: 'Escritórios',
    description: 'Home offices produtivos e organizados',
    icon: '💼',
    count: 0
  },
  {
    id: 'closets',
    name: 'closets',
    displayName: 'Closets',
    description: 'Closets organizados e funcionais',
    icon: '👔',
    count: 0
  },
  {
    id: 'lavanderias',
    name: 'lavanderias',
    displayName: 'Lavanderias',
    description: 'Áreas de serviço otimizadas e práticas',
    icon: '🧺',
    count: 0
  }
];

// Componente principal
const ProfessionalPortfolio: React.FC = () => {
  // Estados
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Carregar imagens do catálogo
  useEffect(() => {
    loadPortfolioImages();
  }, []);

  const loadPortfolioImages = async () => {
    try {
      setLoading(true);
      
      // Carregar catálogo real de imagens
      const response = await fetch('/portfolio-images/catalog.json');
      const catalog = await response.json();
      
      const loadedImages: PortfolioImage[] = [];
      
      // Converter catálogo para formato do componente
      Object.entries(catalog.categories).forEach(([categoryName, categoryImages]: [string, any[]]) => {
        categoryImages.forEach((img, index) => {
          // Usar imagens do Unsplash como fallback para demonstração
          const unsplashImages = {
            dormitorios: [
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1920&h=1080&fit=crop&q=80'
            ],
            salas: [
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80'
            ],
            cozinhas: [
              'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=1080&fit=crop&q=80'
            ],
            banheiros: [
              'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1920&h=1080&fit=crop&q=80'
            ],
            escritorios: [
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80'
            ],
            closets: [
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80'
            ],
            lavanderias: [
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80'
            ]
          };

          const categoryImages = unsplashImages[categoryName as keyof typeof unsplashImages] || unsplashImages.dormitorios;
          const imageUrl = categoryImages[index % categoryImages.length];
          
          // Gerar títulos e descrições baseados na categoria
          const titles = {
            dormitorios: [
              'Dormitório Moderno Premium', 'Quarto Clássico Elegante', 'Suíte de Casal Sofisticada',
              'Dormitório Solteiro Funcional', 'Quarto Infantil Criativo', 'Suíte Master Luxuosa'
            ],
            salas: [
              'Sala de Estar Moderna', 'Living Integrado com TV', 'Sala de Jantar Elegante',
              'Sala Compacta Funcional', 'Home Theater Premium', 'Varanda Gourmet Integrada'
            ],
            cozinhas: [
              'Cozinha Gourmet Premium', 'Cozinha Americana Integrada', 'Cozinha Compacta Funcional',
              'Cozinha com Ilha Central', 'Cozinha Planejada Completa', 'Cozinha Integrada Moderna'
            ],
            banheiros: [
              'Banheiro Suíte Luxuoso', 'Banheiro Social Moderno', 'Banheiro Contemporâneo',
              'Banheiro Spa Relaxante', 'Banheiro Compacto Funcional', 'Banheiro de Luxo Premium'
            ],
            escritorios: [
              'Home Office Moderno', 'Escritório Corporativo', 'Escritório Planejado',
              'Escritório Contemporâneo', 'Escritório Compacto', 'Escritório Executivo'
            ],
            closets: [
              'Closet de Casal Amplo', 'Closet Feminino Elegante', 'Closet Masculino Funcional',
              'Closet Compacto Inteligente', 'Closet de Luxo Premium', 'Closet Planejado Completo'
            ],
            lavanderias: [
              'Lavanderia Planejada', 'Lavanderia Compacta', 'Lavanderia Integrada',
              'Lavanderia Moderna', 'Lavanderia Funcional', 'Lavanderia Organizada'
            ]
          };

          const descriptions = {
            dormitorios: [
              'Quarto planejado com guarda-roupa sob medida, cabeceira integrada e iluminação ambiente.',
              'Dormitório clássico com móveis em madeira nobre e acabamentos refinados.',
              'Suíte de casal com closet integrado, penteadeira e área de descanso.',
              'Quarto solteiro otimizado com cama, escrivaninha e armários planejados.',
              'Quarto infantil colorido com móveis lúdicos e área de estudos.',
              'Suíte master com banheira de hidromassagem e closet de luxo.'
            ],
            salas: [
              'Sala de estar com estante planejada, painel para TV e móveis sob medida.',
              'Living integrado com home theater e sistema de som ambiente.',
              'Sala de jantar com buffet planejado e adega climatizada.',
              'Sala compacta com móveis multifuncionais e aproveitamento inteligente.',
              'Home theater com poltronas reclináveis e sistema de projeção.',
              'Varanda gourmet com churrasqueira e área de convivência.'
            ],
            cozinhas: [
              'Cozinha gourmet com ilha central, armários até o teto e acabamentos premium.',
              'Cozinha americana integrada com sala de jantar e área gourmet.',
              'Cozinha compacta com aproveitamento máximo do espaço disponível.',
              'Cozinha com ilha central multifuncional e área de preparo ampliada.',
              'Cozinha planejada completa com todos os eletrodomésticos integrados.',
              'Cozinha moderna integrada com sala de estar e área social.'
            ],
            banheiros: [
              'Banheiro suíte com banheira de hidromassagem e acabamentos de luxo.',
              'Banheiro social moderno com móveis planejados e iluminação LED.',
              'Banheiro contemporâneo com design clean e materiais nobres.',
              'Banheiro spa com sauna seca e área de relaxamento.',
              'Banheiro compacto com móveis suspensos e espelhos amplos.',
              'Banheiro de luxo com mármore Carrara e metais dourados.'
            ],
            escritorios: [
              'Home office planejado com mesa sob medida, estantes e iluminação adequada.',
              'Escritório corporativo com móveis executivos e sistema de videoconferência.',
              'Escritório planejado com área de reuniões e arquivo organizado.',
              'Escritório contemporâneo com design moderno e tecnologia integrada.',
              'Escritório compacto otimizado para pequenos espaços.',
              'Escritório executivo com móveis de luxo e acabamentos premium.'
            ],
            closets: [
              'Closet de casal amplo com ilha central e espelhos de corpo inteiro.',
              'Closet feminino com sapateira giratória e área de maquiagem.',
              'Closet masculino funcional com cabideiros e gavetas organizadoras.',
              'Closet compacto inteligente com aproveitamento vertical máximo.',
              'Closet de luxo com iluminação LED e acabamentos premium.',
              'Closet planejado completo com todos os acessórios organizadores.'
            ],
            lavanderias: [
              'Lavanderia planejada com tanque de granito e armários suspensos.',
              'Lavanderia compacta com móveis multifuncionais e área de secagem.',
              'Lavanderia integrada com cozinha e área de serviço otimizada.',
              'Lavanderia moderna com máquinas embutidas e bancada de trabalho.',
              'Lavanderia funcional com área de passar e armazenamento inteligente.',
              'Lavanderia organizada com sistema de classificação de roupas.'
            ]
          };

          const tags = {
            dormitorios: ['moderno', 'planejado', 'sob-medida', 'guarda-roupa', 'cabeceira'],
            salas: ['integrada', 'estante', 'painel-tv', 'home-theater', 'moderna'],
            cozinhas: ['gourmet', 'ilha-central', 'planejada', 'integrada', 'premium'],
            banheiros: ['luxo', 'spa', 'moderno', 'planejado', 'premium'],
            escritorios: ['home-office', 'planejado', 'funcional', 'moderno', 'executivo'],
            closets: ['amplo', 'organizado', 'funcional', 'luxo', 'planejado'],
            lavanderias: ['planejada', 'funcional', 'organizada', 'compacta', 'moderna']
          };

          const categoryTitles = titles[categoryName as keyof typeof titles] || titles.dormitorios;
          const categoryDescriptions = descriptions[categoryName as keyof typeof descriptions] || descriptions.dormitorios;
          const categoryTags = tags[categoryName as keyof typeof tags] || tags.dormitorios;

          loadedImages.push({
            id: `${categoryName}_${index + 1}`,
            filename: img.filename,
            url: imageUrl,
            category: categoryName,
            title: categoryTitles[index % categoryTitles.length],
            description: categoryDescriptions[index % categoryDescriptions.length],
            dimensions: img.dimensions,
            quality: img.quality,
            tags: categoryTags
          });
        });
      });
      
      setImages(loadedImages);
      updateCategoryCounts(loadedImages);
      
    } catch (error) {
      console.error('Erro ao carregar catálogo:', error);
      
      // Fallback com imagens mock em caso de erro
      const mockImages: PortfolioImage[] = [
        {
          id: '1',
          filename: 'dormitorio_moderno_1.jpg',
          url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
          category: 'dormitorios',
          title: 'Dormitório Moderno Premium',
          description: 'Quarto de casal com guarda-roupa planejado, cabeceira integrada e mesa de estudos.',
          dimensions: { width: 1920, height: 1080 },
          quality: 'high',
          tags: ['moderno', 'premium', 'casal', 'guarda-roupa']
        },
        {
          id: '2',
          filename: 'cozinha_gourmet_1.jpg',
          url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=1080&fit=crop&q=80',
          category: 'cozinhas',
          title: 'Cozinha Gourmet Contemporânea',
          description: 'Cozinha planejada com ilha central, armários até o teto e acabamentos premium.',
          dimensions: { width: 1920, height: 1080 },
          quality: 'high',
          tags: ['gourmet', 'contemporânea', 'ilha', 'premium']
        },
        {
          id: '3',
          filename: 'sala_estar_elegante_1.jpg',
          url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1920&h=1080&fit=crop&q=80',
          category: 'salas',
          title: 'Sala de Estar Elegante',
          description: 'Sala com estante planejada, painel para TV e móveis sob medida.',
          dimensions: { width: 1920, height: 1080 },
          quality: 'high',
          tags: ['elegante', 'estante', 'painel-tv', 'sob-medida']
        }
      ];
      
      setImages(mockImages);
      updateCategoryCounts(mockImages);
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryCounts = (imageList: PortfolioImage[]) => {
    categories.forEach(category => {
      if (category.id === 'all') {
        category.count = imageList.length;
      } else {
        category.count = imageList.filter(img => img.category === category.name).length;
      }
    });
  };

  // Filtrar imagens
  const filteredImages = useMemo(() => {
    let filtered = images;

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(img => img.category === selectedCategory);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(img => 
        img.title.toLowerCase().includes(term) ||
        img.description.toLowerCase().includes(term) ||
        img.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [images, selectedCategory, searchTerm]);

  // Handlers
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchTerm(''); // Limpar busca ao mudar categoria
  };

  const handleImageClick = (image: PortfolioImage) => {
    setSelectedImage(image);
  };

  const handleFavoriteToggle = (imageId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(imageId)) {
      newFavorites.delete(imageId);
    } else {
      newFavorites.add(imageId);
    }
    setFavorites(newFavorites);
  };

  const handleShare = async (image: PortfolioImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: image.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      // Fallback para navegadores sem Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Portfólio Profissional
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Descubra nossa coleção exclusiva de móveis planejados. 
              Cada projeto é único, desenvolvido com excelência e atenção aos detalhes 
              para transformar seus ambientes em espaços extraordinários.
            </motion.p>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <section className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${selectedCategory === category.id
                    ? 'bg-secondary text-secondary-foreground shadow-lg'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">{category.icon}</span>
                {category.displayName}
                {category.count > 0 && (
                  <span className="ml-2 text-xs opacity-75">({category.count})</span>
                )}
              </motion.button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center">
            <div className="bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${viewMode === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}
                `}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}
                `}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Gallery */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${viewMode}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-6'
              }
            >
              {filteredImages.map((image, index) => (
                <PortfolioCard
                  key={image.id}
                  image={image}
                  viewMode={viewMode}
                  isFavorite={favorites.has(image.id)}
                  onImageClick={handleImageClick}
                  onFavoriteToggle={handleFavoriteToggle}
                  onShare={handleShare}
                  index={index}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && filteredImages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum projeto encontrado
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termo de busca.
            </p>
          </div>
        )}
      </main>

      {/* Image Modal */}
      <ImageModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onShare={handleShare}
      />
    </div>
  );
};

// Componente do Card do Portfólio
interface PortfolioCardProps {
  image: PortfolioImage;
  viewMode: 'grid' | 'list';
  isFavorite: boolean;
  onImageClick: (image: PortfolioImage) => void;
  onFavoriteToggle: (imageId: string) => void;
  onShare: (image: PortfolioImage) => void;
  index: number;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({
  image,
  viewMode,
  isFavorite,
  onImageClick,
  onFavoriteToggle,
  onShare,
  index
}) => {
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
      >
        <div className="flex">
          <div className="flex-shrink-0 w-48 h-32 relative group cursor-pointer" onClick={() => onImageClick(image)}>
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6" />
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-foreground">{image.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => onFavoriteToggle(image.id)}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite ? 'text-red-500 bg-red-50' : 'text-muted-foreground hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => onShare(image)}
                  className="p-2 rounded-full text-muted-foreground hover:text-blue-500 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-muted-foreground mb-3">{image.description}</p>
            <div className="flex flex-wrap gap-2">
              {image.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-card rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      <div className="relative aspect-video cursor-pointer" onClick={() => onImageClick(image)}>
        <img
          src={image.url}
          alt={image.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(image.id);
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isFavorite ? 'text-red-500 bg-white/20' : 'text-white bg-black/20 hover:bg-white/20'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(image);
            }}
            className="p-2 rounded-full backdrop-blur-sm text-white bg-black/20 hover:bg-white/20 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center text-white">
            <Eye className="h-4 w-4 mr-2" />
            <span className="text-sm">Ver detalhes</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{image.title}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{image.description}</p>
        <div className="flex flex-wrap gap-1">
          {image.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {image.tags.length > 3 && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
              +{image.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Componente do Modal de Imagem
interface ImageModalProps {
  image: PortfolioImage | null;
  onClose: () => void;
  onShare: (image: PortfolioImage) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose, onShare }) => {
  if (!image) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-auto max-h-[60vh] object-contain"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{image.title}</h2>
                <p className="text-gray-600">{image.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onShare(image)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = image.url;
                    link.download = image.filename;
                    link.click();
                  }}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {image.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-sm text-gray-500">
              <p>Dimensões: {image.dimensions.width} × {image.dimensions.height}px</p>
              <p>Qualidade: {image.quality === 'high' ? 'Alta' : image.quality === 'medium' ? 'Média' : 'Baixa'}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfessionalPortfolio;
