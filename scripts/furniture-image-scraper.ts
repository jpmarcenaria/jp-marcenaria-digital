/**
 * Furniture Image Scraper
 * JP Marcenaria Digital
 * 
 * Automação Playwright para captura de imagens de móveis planejados
 * - Exclusivamente móveis planejados
 * - Ambientes sofisticados e bem decorados
 * - Sem marcas d'água ou logotipos
 * - Qualidade mínima 1920x1080 pixels
 */

import { chromium, Browser, Page } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

interface ImageSource {
  name: string;
  baseUrl: string;
  searchQueries: string[];
  selectors: {
    imageContainer: string;
    image: string;
    nextButton?: string;
  };
}

interface ScrapedImage {
  url: string;
  category: string;
  filename: string;
  dimensions: { width: number; height: number };
  quality: 'high' | 'medium' | 'low';
}

class FurnitureImageScraper {
  private browser: Browser | null = null;
  private outputDir: string;
  private categories = [
    'dormitorios',
    'salas',
    'cozinhas',
    'banheiros',
    'escritorios',
    'closets',
    'lavanderias'
  ];

  private imageSources: ImageSource[] = [
    {
      name: 'Unsplash',
      baseUrl: 'https://unsplash.com/s/photos/',
      searchQueries: [
        'modern-kitchen-cabinets',
        'luxury-bedroom-wardrobe',
        'contemporary-living-room-furniture',
        'custom-bathroom-vanity',
        'home-office-built-in',
        'walk-in-closet-design',
        'laundry-room-cabinets'
      ],
      selectors: {
        imageContainer: '[data-test="photo-grid"] figure',
        image: 'img[srcset]',
        nextButton: 'a[aria-label="Next"]'
      }
    },
    {
      name: 'Pexels',
      baseUrl: 'https://www.pexels.com/search/',
      searchQueries: [
        'modern kitchen design',
        'luxury bedroom furniture',
        'contemporary living room',
        'bathroom vanity design',
        'home office furniture',
        'walk in closet',
        'laundry room design'
      ],
      selectors: {
        imageContainer: 'article[data-testid="photo"]',
        image: 'img[srcset]',
        nextButton: 'a[aria-label="Next page"]'
      }
    }
  ];

  constructor() {
    this.outputDir = path.join(process.cwd(), 'public', 'portfolio-images');
  }

  async initialize(): Promise<void> {
    console.log('🚀 Inicializando scraper de imagens de móveis...');
    
    // Criar diretórios de saída
    await this.createOutputDirectories();
    
    // Inicializar browser
    this.browser = await chromium.launch({
      headless: false, // Visível para debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('✅ Browser inicializado');
  }

  private async createOutputDirectories(): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });
    
    for (const category of this.categories) {
      await fs.mkdir(path.join(this.outputDir, category), { recursive: true });
    }
    
    console.log('📁 Diretórios criados:', this.categories);
  }

  async scrapeImages(maxImagesPerCategory: number = 20): Promise<ScrapedImage[]> {
    if (!this.browser) {
      throw new Error('Browser não inicializado');
    }

    const allImages: ScrapedImage[] = [];
    
    for (let i = 0; i < this.categories.length; i++) {
      const category = this.categories[i];
      console.log(`\n📸 Coletando imagens para categoria: ${category}`);
      
      const categoryImages = await this.scrapeCategory(category, maxImagesPerCategory);
      allImages.push(...categoryImages);
      
      // Delay entre categorias para evitar rate limiting
      await this.delay(2000);
    }

    return allImages;
  }

  private async scrapeCategory(category: string, maxImages: number): Promise<ScrapedImage[]> {
    const images: ScrapedImage[] = [];
    const categoryIndex = this.categories.indexOf(category);
    
    for (const source of this.imageSources) {
      if (images.length >= maxImages) break;
      
      const query = source.searchQueries[categoryIndex] || source.searchQueries[0];
      console.log(`🔍 Buscando em ${source.name}: ${query}`);
      
      try {
        const sourceImages = await this.scrapeFromSource(source, query, category, maxImages - images.length);
        images.push(...sourceImages);
      } catch (error) {
        console.error(`❌ Erro ao buscar em ${source.name}:`, error.message);
      }
    }

    return images;
  }

  private async scrapeFromSource(
    source: ImageSource, 
    query: string, 
    category: string, 
    maxImages: number
  ): Promise<ScrapedImage[]> {
    const page = await this.browser!.newPage();
    const images: ScrapedImage[] = [];
    
    try {
      // Configurar viewport para desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Navegar para a página de busca
      const searchUrl = `${source.baseUrl}${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle' });
      
      // Aguardar carregamento das imagens
      await page.waitForSelector(source.selectors.imageContainer, { timeout: 10000 });
      
      let attempts = 0;
      const maxAttempts = 5;
      
      while (images.length < maxImages && attempts < maxAttempts) {
        // Coletar imagens visíveis
        const pageImages = await this.extractImagesFromPage(page, source, category);
        
        // Filtrar e validar imagens
        for (const img of pageImages) {
          if (images.length >= maxImages) break;
          
          const isValid = await this.validateImage(img.url);
          if (isValid) {
            images.push(img);
            console.log(`✅ Imagem válida coletada: ${img.filename}`);
          }
        }
        
        // Tentar carregar mais imagens (scroll ou próxima página)
        await this.loadMoreImages(page, source);
        attempts++;
        
        await this.delay(1500);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao processar ${source.name}:`, error.message);
    } finally {
      await page.close();
    }

    return images;
  }

  private async extractImagesFromPage(
    page: Page, 
    source: ImageSource, 
    category: string
  ): Promise<ScrapedImage[]> {
    return await page.evaluate((selectors, cat) => {
      const containers = document.querySelectorAll(selectors.imageContainer);
      const images: any[] = [];
      
      containers.forEach((container, index) => {
        const img = container.querySelector(selectors.image) as HTMLImageElement;
        if (!img) return;
        
        // Extrair URL de alta qualidade
        let imageUrl = img.src;
        if (img.srcset) {
          const srcsetEntries = img.srcset.split(',');
          const highResEntry = srcsetEntries
            .map(entry => {
              const [url, descriptor] = entry.trim().split(' ');
              const width = descriptor ? parseInt(descriptor.replace('w', '')) : 0;
              return { url, width };
            })
            .sort((a, b) => b.width - a.width)[0];
          
          if (highResEntry && highResEntry.width >= 1920) {
            imageUrl = highResEntry.url;
          }
        }
        
        // Verificar se não tem marcas d'água óbvias
        const alt = img.alt?.toLowerCase() || '';
        const hasWatermark = alt.includes('watermark') || 
                           alt.includes('logo') || 
                           alt.includes('brand') ||
                           imageUrl.includes('watermark');
        
        if (!hasWatermark && imageUrl.startsWith('http')) {
          const filename = `${cat}_${Date.now()}_${index}.jpg`;
          images.push({
            url: imageUrl,
            category: cat,
            filename,
            dimensions: { width: img.naturalWidth || 1920, height: img.naturalHeight || 1080 },
            quality: img.naturalWidth >= 1920 ? 'high' : 'medium'
          });
        }
      });
      
      return images;
    }, source.selectors, category);
  }

  private async validateImage(url: string): Promise<boolean> {
    try {
      const page = await this.browser!.newPage();
      
      // Verificar se a imagem carrega e tem dimensões adequadas
      const response = await page.goto(url, { timeout: 10000 });
      
      if (!response || !response.ok()) {
        await page.close();
        return false;
      }
      
      // Verificar dimensões da imagem
      const dimensions = await page.evaluate(() => {
        const img = document.querySelector('img');
        return img ? { width: img.naturalWidth, height: img.naturalHeight } : null;
      });
      
      await page.close();
      
      return dimensions && dimensions.width >= 1920 && dimensions.height >= 1080;
      
    } catch (error) {
      return false;
    }
  }

  private async loadMoreImages(page: Page, source: ImageSource): Promise<void> {
    try {
      // Tentar scroll para carregar mais imagens
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await this.delay(2000);
      
      // Tentar clicar no botão "próxima página" se existir
      if (source.selectors.nextButton) {
        const nextButton = await page.$(source.selectors.nextButton);
        if (nextButton) {
          await nextButton.click();
          await page.waitForLoadState('networkidle');
        }
      }
    } catch (error) {
      // Ignorar erros de carregamento adicional
    }
  }

  async downloadImages(images: ScrapedImage[]): Promise<void> {
    console.log(`\n📥 Baixando ${images.length} imagens...`);
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`📥 Baixando ${i + 1}/${images.length}: ${image.filename}`);
      
      try {
        await this.downloadSingleImage(image);
        console.log(`✅ Download concluído: ${image.filename}`);
      } catch (error) {
        console.error(`❌ Erro no download de ${image.filename}:`, error.message);
      }
      
      // Delay entre downloads
      await this.delay(500);
    }
  }

  private async downloadSingleImage(image: ScrapedImage): Promise<void> {
    const page = await this.browser!.newPage();
    
    try {
      const response = await page.goto(image.url, { timeout: 15000 });
      
      if (!response || !response.ok()) {
        throw new Error(`Falha ao carregar imagem: ${response?.status()}`);
      }
      
      const buffer = await response.body();
      const filePath = path.join(this.outputDir, image.category, image.filename);
      
      await fs.writeFile(filePath, buffer);
      
    } finally {
      await page.close();
    }
  }

  async generateImageCatalog(images: ScrapedImage[]): Promise<void> {
    console.log('\n📋 Gerando catálogo de imagens...');
    
    const catalog = {
      generated: new Date().toISOString(),
      totalImages: images.length,
      categories: {} as Record<string, any[]>
    };
    
    // Organizar por categoria
    for (const image of images) {
      if (!catalog.categories[image.category]) {
        catalog.categories[image.category] = [];
      }
      
      catalog.categories[image.category].push({
        filename: image.filename,
        url: `/portfolio-images/${image.category}/${image.filename}`,
        dimensions: image.dimensions,
        quality: image.quality
      });
    }
    
    // Salvar catálogo
    const catalogPath = path.join(this.outputDir, 'catalog.json');
    await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2));
    
    console.log(`✅ Catálogo salvo: ${catalogPath}`);
    console.log(`📊 Total de imagens por categoria:`);
    
    for (const [category, categoryImages] of Object.entries(catalog.categories)) {
      console.log(`   ${category}: ${categoryImages.length} imagens`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser fechado');
    }
  }
}

// Função principal para executar o scraper
async function main() {
  const scraper = new FurnitureImageScraper();
  
  try {
    await scraper.initialize();
    
    // Coletar imagens (15 por categoria)
    const images = await scraper.scrapeImages(15);
    
    if (images.length > 0) {
      // Baixar imagens
      await scraper.downloadImages(images);
      
      // Gerar catálogo
      await scraper.generateImageCatalog(images);
      
      console.log(`\n🎉 Scraping concluído! ${images.length} imagens coletadas.`);
    } else {
      console.log('❌ Nenhuma imagem foi coletada.');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o scraping:', error);
  } finally {
    await scraper.cleanup();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { FurnitureImageScraper, ScrapedImage };