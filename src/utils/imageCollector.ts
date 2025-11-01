/**
 * Sistema de Coleta Automática de Imagens para Portfólio
 * JP Marcenaria Digital
 * 
 * Simula a coleta automática de imagens de marcenaria arquitetônica
 * com verificação de qualidade e direitos autorais
 */

export interface ImageMetadata {
  id: string;
  url: string;
  title: string;
  category: 'residencial' | 'comercial' | 'corporativo' | 'hospitalar' | 'educacional';
  style: 'moderno' | 'classico' | 'rustico' | 'industrial' | 'minimalista' | 'contemporaneo';
  furnitureType: 'cozinha' | 'sala' | 'quarto' | 'escritorio' | 'banheiro' | 'area-gourmet' | 'closet';
  dimensions: {
    width: number;
    height: number;
  };
  quality: 'alta' | 'media' | 'baixa';
  hasWatermark: boolean;
  copyrightFree: boolean;
  description: string;
  tags: string[];
  collectedAt: string;
  source: string;
}

export interface CollectionConfig {
  maxImages: number;
  minQuality: 'alta' | 'media';
  categories: string[];
  styles: string[];
  requireCopyrightFree: boolean;
  minResolution: {
    width: number;
    height: number;
  };
}

export class ImageCollector {
  private config: CollectionConfig;
  private collectedImages: ImageMetadata[] = [];
  private isCollecting: boolean = false;

  constructor(config: CollectionConfig) {
    this.config = config;
  }

  /**
   * Simula a coleta automática de imagens de marcenaria
   */
  async collectImages(onProgress?: (progress: number, current: ImageMetadata) => void): Promise<ImageMetadata[]> {
    this.isCollecting = true;
    this.collectedImages = [];

    console.log('🔍 Iniciando coleta automática de imagens de marcenaria...');

    // Simular fontes de imagens livres de direitos autorais
    const imageSources = this.getImageSources();
    
    for (let i = 0; i < this.config.maxImages && this.isCollecting; i++) {
      const imageData = await this.simulateImageCollection(i, imageSources);
      
      // Verificar qualidade e direitos autorais
      if (await this.validateImage(imageData)) {
        this.collectedImages.push(imageData);
        
        if (onProgress) {
          onProgress((i + 1) / this.config.maxImages * 100, imageData);
        }
      }

      // Simular delay de coleta
      await this.delay(500 + Math.random() * 1000);
    }

    console.log(`✅ Coleta concluída: ${this.collectedImages.length} imagens coletadas`);
    return this.collectedImages;
  }

  /**
   * Simula a coleta de uma imagem individual
   */
  private async simulateImageCollection(index: number, sources: any[]): Promise<ImageMetadata> {
    const source = sources[Math.floor(Math.random() * sources.length)];
    const categories: ImageMetadata['category'][] = ['residencial', 'comercial', 'corporativo', 'hospitalar', 'educacional'];
    const styles: ImageMetadata['style'][] = ['moderno', 'classico', 'rustico', 'industrial', 'minimalista', 'contemporaneo'];
    const furnitureTypes: ImageMetadata['furnitureType'][] = ['cozinha', 'sala', 'quarto', 'escritorio', 'banheiro', 'area-gourmet', 'closet'];

    const category = categories[Math.floor(Math.random() * categories.length)];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const furnitureType = furnitureTypes[Math.floor(Math.random() * furnitureTypes.length)];

    // Simular diferentes resoluções
    const resolutions = [
      { width: 1920, height: 1080 },
      { width: 1600, height: 900 },
      { width: 1280, height: 720 },
      { width: 2560, height: 1440 },
      { width: 3840, height: 2160 }
    ];
    const resolution = resolutions[Math.floor(Math.random() * resolutions.length)];

    return {
      id: `img_${Date.now()}_${index}`,
      url: `${source.baseUrl}/${resolution.width}x${resolution.height}?random=${Date.now() + index}`,
      title: this.generateTitle(category, style, furnitureType),
      category,
      style,
      furnitureType,
      dimensions: resolution,
      quality: this.determineQuality(resolution),
      hasWatermark: Math.random() < 0.1, // 10% chance de ter marca d'água
      copyrightFree: Math.random() < 0.9, // 90% chance de ser livre de direitos
      description: this.generateDescription(category, style, furnitureType),
      tags: this.generateTags(category, style, furnitureType),
      collectedAt: new Date().toISOString(),
      source: source.name
    };
  }

  /**
   * Valida se a imagem atende aos critérios de qualidade
   */
  private async validateImage(image: ImageMetadata): Promise<boolean> {
    // Verificar resolução mínima
    if (image.dimensions.width < this.config.minResolution.width || 
        image.dimensions.height < this.config.minResolution.height) {
      console.log(`❌ Imagem rejeitada: resolução muito baixa (${image.dimensions.width}x${image.dimensions.height})`);
      return false;
    }

    // Verificar qualidade mínima
    if (this.config.minQuality === 'alta' && image.quality !== 'alta') {
      console.log(`❌ Imagem rejeitada: qualidade insuficiente (${image.quality})`);
      return false;
    }

    // Verificar marca d'água
    if (image.hasWatermark) {
      console.log(`❌ Imagem rejeitada: contém marca d'água`);
      return false;
    }

    // Verificar direitos autorais
    if (this.config.requireCopyrightFree && !image.copyrightFree) {
      console.log(`❌ Imagem rejeitada: não é livre de direitos autorais`);
      return false;
    }

    // Simular verificação de conteúdo adequado
    if (!(await this.checkContentAppropriate(image))) {
      console.log(`❌ Imagem rejeitada: conteúdo inadequado para portfólio profissional`);
      return false;
    }

    console.log(`✅ Imagem aprovada: ${image.title}`);
    return true;
  }

  /**
   * Verifica se o conteúdo é adequado para portfólio profissional
   */
  private async checkContentAppropriate(image: ImageMetadata): Promise<boolean> {
    // Simular análise de conteúdo
    await this.delay(100);
    
    // Critérios para conteúdo adequado:
    // - Imagem de qualidade profissional
    // - Relacionada à marcenaria/arquitetura
    // - Sem elementos inadequados
    
    return Math.random() < 0.95; // 95% de aprovação
  }

  /**
   * Determina a qualidade baseada na resolução
   */
  private determineQuality(resolution: { width: number; height: number }): 'alta' | 'media' | 'baixa' {
    const totalPixels = resolution.width * resolution.height;
    
    if (totalPixels >= 3840 * 2160) return 'alta'; // 4K+
    if (totalPixels >= 1920 * 1080) return 'alta'; // Full HD+
    if (totalPixels >= 1280 * 720) return 'media'; // HD
    return 'baixa';
  }

  /**
   * Gera título descritivo para a imagem
   */
  private generateTitle(category: string, style: string, furnitureType: string): string {
    const templates = [
      `${this.capitalize(furnitureType)} ${this.capitalize(style)} - Projeto ${this.capitalize(category)}`,
      `Marcenaria ${this.capitalize(style)} para ${this.capitalize(furnitureType)}`,
      `${this.capitalize(category)}: ${this.capitalize(furnitureType)} em Estilo ${this.capitalize(style)}`,
      `Projeto de ${this.capitalize(furnitureType)} - Design ${this.capitalize(style)}`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Gera descrição detalhada
   */
  private generateDescription(category: string, style: string, furnitureType: string): string {
    const descriptions = {
      cozinha: [
        'Cozinha planejada com acabamentos premium e funcionalidade otimizada.',
        'Design moderno com ilha central e sistema de iluminação integrado.',
        'Marcenaria sob medida com materiais de alta qualidade.'
      ],
      sala: [
        'Sala de estar com painel de TV e estantes integradas.',
        'Ambiente aconchegante com móveis planejados e design harmonioso.',
        'Projeto completo com rack, estantes e mesa de centro coordenados.'
      ],
      quarto: [
        'Quarto de casal com guarda-roupa planejado e cabeceira integrada.',
        'Design funcional com aproveitamento máximo do espaço.',
        'Móveis sob medida com acabamentos refinados.'
      ],
      escritorio: [
        'Home office com mesa planejada e sistema de organização.',
        'Ambiente produtivo com móveis ergonômicos e funcionais.',
        'Projeto corporativo com design profissional.'
      ],
      banheiro: [
        'Banheiro planejado com móveis resistentes à umidade.',
        'Design elegante com aproveitamento inteligente do espaço.',
        'Marcenaria especializada para ambientes úmidos.'
      ],
      'area-gourmet': [
        'Área gourmet com churrasqueira e bancada integrada.',
        'Espaço de entretenimento com móveis para área externa.',
        'Projeto completo para lazer e confraternização.'
      ],
      closet: [
        'Closet organizado com sistema de gavetas e cabideiros.',
        'Aproveitamento máximo do espaço com design inteligente.',
        'Móveis planejados para organização perfeita.'
      ]
    };

    const furnitureDescriptions = descriptions[furnitureType as keyof typeof descriptions] || descriptions.sala;
    return furnitureDescriptions[Math.floor(Math.random() * furnitureDescriptions.length)];
  }

  /**
   * Gera tags relevantes
   */
  private generateTags(category: string, style: string, furnitureType: string): string[] {
    const baseTags = ['marcenaria', 'móveis planejados', 'design de interiores'];
    const categoryTags = {
      residencial: ['casa', 'residência', 'lar'],
      comercial: ['loja', 'comércio', 'varejo'],
      corporativo: ['escritório', 'empresa', 'corporativo'],
      hospitalar: ['hospital', 'clínica', 'saúde'],
      educacional: ['escola', 'universidade', 'educação']
    };
    
    const styleTags = {
      moderno: ['contemporâneo', 'clean', 'minimalista'],
      classico: ['tradicional', 'elegante', 'atemporal'],
      rustico: ['madeira natural', 'rústico', 'aconchegante'],
      industrial: ['metal', 'concreto', 'urbano'],
      minimalista: ['simples', 'funcional', 'clean'],
      contemporaneo: ['atual', 'inovador', 'tendência']
    };

    return [
      ...baseTags,
      ...(categoryTags[category as keyof typeof categoryTags] || []),
      ...(styleTags[style as keyof typeof styleTags] || []),
      furnitureType.replace('-', ' '),
      style,
      category
    ];
  }

  /**
   * Fontes simuladas de imagens livres de direitos autorais
   */
  private getImageSources() {
    return [
      {
        name: 'Unsplash',
        baseUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
        description: 'Imagens de alta qualidade livres de direitos'
      },
      {
        name: 'Pexels',
        baseUrl: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        description: 'Banco de imagens gratuitas'
      },
      {
        name: 'Pixabay',
        baseUrl: 'https://cdn.pixabay.com/photo/2017/03/28/12/10/chairs-2181947_1280.jpg',
        description: 'Imagens livres de direitos autorais'
      }
    ];
  }

  /**
   * Utilitários
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Para a coleta em andamento
   */
  stopCollection(): void {
    this.isCollecting = false;
    console.log('⏹️ Coleta de imagens interrompida');
  }

  /**
   * Retorna estatísticas da coleta
   */
  getCollectionStats(): any {
    const stats = {
      total: this.collectedImages.length,
      byCategory: {} as Record<string, number>,
      byStyle: {} as Record<string, number>,
      byFurnitureType: {} as Record<string, number>,
      byQuality: {} as Record<string, number>,
      averageResolution: { width: 0, height: 0 }
    };

    this.collectedImages.forEach(img => {
      stats.byCategory[img.category] = (stats.byCategory[img.category] || 0) + 1;
      stats.byStyle[img.style] = (stats.byStyle[img.style] || 0) + 1;
      stats.byFurnitureType[img.furnitureType] = (stats.byFurnitureType[img.furnitureType] || 0) + 1;
      stats.byQuality[img.quality] = (stats.byQuality[img.quality] || 0) + 1;
    });

    if (this.collectedImages.length > 0) {
      stats.averageResolution.width = Math.round(
        this.collectedImages.reduce((sum, img) => sum + img.dimensions.width, 0) / this.collectedImages.length
      );
      stats.averageResolution.height = Math.round(
        this.collectedImages.reduce((sum, img) => sum + img.dimensions.height, 0) / this.collectedImages.length
      );
    }

    return stats;
  }

  /**
   * Exporta as imagens coletadas
   */
  exportCollection(): ImageMetadata[] {
    return [...this.collectedImages];
  }
}

// Configuração padrão para coleta
export const DEFAULT_COLLECTION_CONFIG: CollectionConfig = {
  maxImages: 50,
  minQuality: 'media',
  categories: ['residencial', 'comercial', 'corporativo'],
  styles: ['moderno', 'classico', 'contemporaneo'],
  requireCopyrightFree: true,
  minResolution: {
    width: 1280,
    height: 720
  }
};

export default ImageCollector;