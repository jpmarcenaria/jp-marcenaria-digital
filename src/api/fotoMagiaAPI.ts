import { toast } from 'sonner';

// Tipos para a API
export interface ImageAnalysis {
  objects: DetectedObject[];
  perspective: PerspectiveData;
  roomType: string;
  confidence: number;
}

export interface DetectedObject {
  id: string;
  type: 'furniture' | 'appliance' | 'decoration' | 'structural';
  name: string;
  boundingBox: BoundingBox;
  confidence: number;
  style?: string;
  material?: string;
  color?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PerspectiveData {
  vanishingPoints: Point[];
  horizonLine: number;
  viewAngle: number;
  distortion: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface TransformationRequest {
  imageData: string;
  targetStyle: string;
  preserveStructure: boolean;
  customOptions?: CustomOptions;
}

export interface CustomOptions {
  materials?: string[];
  colors?: string[];
  intensity?: number;
  preserveObjects?: string[];
}

export interface TransformationResult {
  id: string;
  originalImage: string;
  transformedImage: string;
  style: string;
  confidence: number;
  processingTime: number;
  analysis: ImageAnalysis;
  appliedChanges: AppliedChange[];
}

export interface AppliedChange {
  objectId: string;
  changeType: 'material' | 'color' | 'style' | 'position';
  before: string;
  after: string;
  confidence: number;
}

// Configuração da API Nano Banana
const NANO_BANANA_API_URL = 'https://api.nanobanana.ai/v1';
const API_KEY = process.env.VITE_NANO_BANANA_API_KEY || 'demo-key';

class FotoMagiaAPI {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = NANO_BANANA_API_URL;
    this.apiKey = API_KEY;
  }

  // Análise de imagem com visão computacional
  async analyzeImage(imageFile: File): Promise<ImageAnalysis> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('analysis_type', 'furniture_detection');
      formData.append('include_perspective', 'true');

      const response = await fetch(`${this.baseURL}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro na análise: ${response.statusText}`);
      }

      const data = await response.json();
      return this.processAnalysisResponse(data);
    } catch (error) {
      console.error('Erro na análise de imagem:', error);
      // Retorna dados simulados para demonstração
      return this.getMockAnalysis();
    }
  }

  // Transformação de estilo
  async transformStyle(request: TransformationRequest): Promise<TransformationResult> {
    try {
      const payload = {
        image: request.imageData,
        target_style: request.targetStyle,
        preserve_structure: request.preserveStructure,
        options: request.customOptions || {},
      };

      const response = await fetch(`${this.baseURL}/transform`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro na transformação: ${response.statusText}`);
      }

      const data = await response.json();
      return this.processTransformationResponse(data);
    } catch (error) {
      console.error('Erro na transformação:', error);
      // Retorna dados simulados para demonstração
      return this.getMockTransformation(request);
    }
  }

  // Comparação de ambientes
  async compareEnvironments(emptyRoom: File, furnishedRoom: File): Promise<{
    adaptationSuggestions: AdaptationSuggestion[];
    compatibilityScore: number;
  }> {
    try {
      const formData = new FormData();
      formData.append('empty_room', emptyRoom);
      formData.append('furnished_room', furnishedRoom);

      const response = await fetch(`${this.baseURL}/compare`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro na comparação: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro na comparação:', error);
      return this.getMockComparison();
    }
  }

  // Adaptação de móveis para ambiente vazio
  async adaptFurniture(
    emptyRoom: File,
    furnitureItems: DetectedObject[],
    targetPerspective: PerspectiveData
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('empty_room', emptyRoom);
      formData.append('furniture_data', JSON.stringify(furnitureItems));
      formData.append('perspective_data', JSON.stringify(targetPerspective));

      const response = await fetch(`${this.baseURL}/adapt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro na adaptação: ${response.statusText}`);
      }

      const data = await response.json();
      return data.adapted_image;
    } catch (error) {
      console.error('Erro na adaptação:', error);
      throw error;
    }
  }

  // Processamento em lote
  async processBatch(images: File[], style: string): Promise<TransformationResult[]> {
    const results: TransformationResult[] = [];
    
    for (const image of images) {
      try {
        const imageData = await this.fileToBase64(image);
        const result = await this.transformStyle({
          imageData,
          targetStyle: style,
          preserveStructure: true,
        });
        results.push(result);
      } catch (error) {
        console.error(`Erro ao processar ${image.name}:`, error);
        toast.error(`Erro ao processar ${image.name}`);
      }
    }

    return results;
  }

  // Utilitários
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private processAnalysisResponse(data: any): ImageAnalysis {
    return {
      objects: data.objects?.map((obj: any) => ({
        id: obj.id,
        type: obj.type,
        name: obj.name,
        boundingBox: obj.bounding_box,
        confidence: obj.confidence,
        style: obj.style,
        material: obj.material,
        color: obj.color,
      })) || [],
      perspective: data.perspective || {
        vanishingPoints: [],
        horizonLine: 0.5,
        viewAngle: 60,
        distortion: 0.1,
      },
      roomType: data.room_type || 'unknown',
      confidence: data.confidence || 0.8,
    };
  }

  private processTransformationResponse(data: any): TransformationResult {
    return {
      id: data.id || `transform-${Date.now()}`,
      originalImage: data.original_image,
      transformedImage: data.transformed_image,
      style: data.style,
      confidence: data.confidence || 0.85,
      processingTime: data.processing_time || 2.5,
      analysis: data.analysis || this.getMockAnalysis(),
      appliedChanges: data.applied_changes || [],
    };
  }

  // Dados simulados para demonstração
  private getMockAnalysis(): ImageAnalysis {
    return {
      objects: [
        {
          id: 'obj-1',
          type: 'furniture',
          name: 'Sofá',
          boundingBox: { x: 100, y: 150, width: 300, height: 200 },
          confidence: 0.92,
          style: 'moderno',
          material: 'tecido',
          color: 'cinza',
        },
        {
          id: 'obj-2',
          type: 'furniture',
          name: 'Mesa de Centro',
          boundingBox: { x: 200, y: 300, width: 150, height: 80 },
          confidence: 0.88,
          style: 'moderno',
          material: 'madeira',
          color: 'marrom',
        },
      ],
      perspective: {
        vanishingPoints: [{ x: 400, y: 200 }],
        horizonLine: 0.4,
        viewAngle: 65,
        distortion: 0.05,
      },
      roomType: 'sala_estar',
      confidence: 0.89,
    };
  }

  private getMockTransformation(request: TransformationRequest): TransformationResult {
    return {
      id: `transform-${Date.now()}`,
      originalImage: request.imageData,
      transformedImage: request.imageData, // Em produção seria a imagem transformada
      style: request.targetStyle,
      confidence: 0.87,
      processingTime: 3.2,
      analysis: this.getMockAnalysis(),
      appliedChanges: [
        {
          objectId: 'obj-1',
          changeType: 'material',
          before: 'tecido',
          after: 'couro',
          confidence: 0.91,
        },
        {
          objectId: 'obj-2',
          changeType: 'color',
          before: 'marrom',
          after: 'preto',
          confidence: 0.85,
        },
      ],
    };
  }

  private getMockComparison() {
    return {
      adaptationSuggestions: [
        {
          furniture: 'Sofá 3 lugares',
          position: { x: 0.3, y: 0.6 },
          scale: 0.8,
          rotation: 15,
          confidence: 0.92,
        },
        {
          furniture: 'Mesa de centro',
          position: { x: 0.5, y: 0.7 },
          scale: 0.6,
          rotation: 0,
          confidence: 0.88,
        },
      ],
      compatibilityScore: 0.85,
    };
  }
}

export interface AdaptationSuggestion {
  furniture: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  confidence: number;
}

// Instância singleton da API
export const fotoMagiaAPI = new FotoMagiaAPI();

// Estilos disponíveis com configurações específicas
export const AVAILABLE_STYLES = {
  moderno: {
    name: 'Moderno',
    description: 'Linhas limpas, cores neutras, acabamentos minimalistas',
    materials: ['vidro', 'metal', 'laminado'],
    colors: ['branco', 'cinza', 'preto', 'bege'],
    characteristics: ['minimalista', 'funcional', 'geometrico'],
  },
  rustico: {
    name: 'Rústico',
    description: 'Madeira natural, pedras, elementos orgânicos',
    materials: ['madeira_macica', 'pedra', 'ferro'],
    colors: ['marrom', 'bege', 'verde_musgo', 'terracota'],
    characteristics: ['natural', 'acolhedor', 'organico'],
  },
  industrial: {
    name: 'Industrial',
    description: 'Metal, concreto, tubulações aparentes',
    materials: ['aco', 'concreto', 'ferro_fundido'],
    colors: ['cinza_escuro', 'preto', 'cobre', 'chumbo'],
    characteristics: ['urbano', 'robusto', 'metalico'],
  },
  classico: {
    name: 'Clássico',
    description: 'Elegância atemporal, detalhes refinados',
    materials: ['madeira_nobre', 'marmore', 'bronze'],
    colors: ['dourado', 'marrom_escuro', 'creme', 'vinho'],
    characteristics: ['elegante', 'tradicional', 'refinado'],
  },
  escandinavo: {
    name: 'Escandinavo',
    description: 'Funcionalidade, cores claras, madeira clara',
    materials: ['pinus', 'carvalho_claro', 'linho'],
    colors: ['branco', 'bege_claro', 'azul_claro', 'cinza_claro'],
    characteristics: ['funcional', 'aconchegante', 'luminoso'],
  },
  contemporaneo: {
    name: 'Contemporâneo',
    description: 'Tendências atuais, inovação, tecnologia',
    materials: ['acrilico', 'fibra_carbono', 'ceramica'],
    colors: ['cores_vibrantes', 'metalicos', 'gradientes'],
    characteristics: ['inovador', 'tecnologico', 'artistico'],
  },
};

export default FotoMagiaAPI;