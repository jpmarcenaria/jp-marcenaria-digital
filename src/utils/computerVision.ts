import { DetectedObject, PerspectiveData, Point, BoundingBox } from '@/api/fotoMagiaAPI';

// Classe principal para processamento de visão computacional
export class ComputerVisionProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Detectar objetos na imagem usando algoritmos de ML
  async detectObjects(imageElement: HTMLImageElement): Promise<DetectedObject[]> {
    this.setupCanvas(imageElement);
    
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    // Algoritmo de detecção de bordas Canny
    const edges = this.cannyEdgeDetection(imageData);
    
    // Detecção de contornos
    const contours = this.findContours(edges);
    
    // Classificação de objetos baseada em forma e contexto
    const objects = this.classifyObjects(contours, imageData);
    
    return objects;
  }

  // Analisar perspectiva da imagem
  async analyzePerspective(imageElement: HTMLImageElement): Promise<PerspectiveData> {
    this.setupCanvas(imageElement);
    
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    // Detectar linhas usando transformada de Hough
    const lines = this.houghLineTransform(imageData);
    
    // Encontrar pontos de fuga
    const vanishingPoints = this.findVanishingPoints(lines);
    
    // Calcular linha do horizonte
    const horizonLine = this.calculateHorizonLine(vanishingPoints);
    
    // Estimar ângulo de visão
    const viewAngle = this.estimateViewAngle(lines, vanishingPoints);
    
    // Calcular distorção
    const distortion = this.calculateDistortion(lines);

    return {
      vanishingPoints,
      horizonLine,
      viewAngle,
      distortion,
    };
  }

  // Adaptar móveis para nova perspectiva
  adaptFurniturePerspective(
    furniture: DetectedObject[],
    sourcePerspective: PerspectiveData,
    targetPerspective: PerspectiveData
  ): DetectedObject[] {
    return furniture.map(item => {
      const adaptedBoundingBox = this.transformBoundingBox(
        item.boundingBox,
        sourcePerspective,
        targetPerspective
      );

      return {
        ...item,
        boundingBox: adaptedBoundingBox,
        confidence: item.confidence * 0.9, // Reduz confiança após transformação
      };
    });
  }

  // Configurar canvas com a imagem
  private setupCanvas(imageElement: HTMLImageElement): void {
    this.canvas.width = imageElement.width;
    this.canvas.height = imageElement.height;
    this.ctx.drawImage(imageElement, 0, 0);
  }

  // Algoritmo de detecção de bordas Canny
  private cannyEdgeDetection(imageData: ImageData): ImageData {
    const width = imageData.width;
    const height = imageData.height;
    const data = new Uint8ClampedArray(imageData.data);
    
    // Converter para escala de cinza
    const grayscale = this.toGrayscale(data, width, height);
    
    // Aplicar filtro Gaussiano
    const blurred = this.gaussianBlur(grayscale, width, height);
    
    // Calcular gradientes
    const gradients = this.calculateGradients(blurred, width, height);
    
    // Supressão não-máxima
    const suppressed = this.nonMaximumSuppression(gradients, width, height);
    
    // Limiarização dupla
    const edges = this.doubleThresholding(suppressed, width, height);
    
    return new ImageData(edges, width, height);
  }

  // Converter para escala de cinza
  private toGrayscale(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const grayscale = new Uint8ClampedArray(width * height);
    
    for (let i = 0; i < width * height; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      grayscale[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
    
    return grayscale;
  }

  // Filtro Gaussiano
  private gaussianBlur(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const kernel = [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1]
    ];
    const kernelSum = 16;
    
    const blurred = new Uint8ClampedArray(width * height);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixel = data[(y + ky) * width + (x + kx)];
            sum += pixel * kernel[ky + 1][kx + 1];
          }
        }
        
        blurred[y * width + x] = sum / kernelSum;
      }
    }
    
    return blurred;
  }

  // Calcular gradientes (Sobel)
  private calculateGradients(data: Uint8ClampedArray, width: number, height: number): {
    magnitude: Uint8ClampedArray;
    direction: Float32Array;
  } {
    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ];
    
    const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ];
    
    const magnitude = new Uint8ClampedArray(width * height);
    const direction = new Float32Array(width * height);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixel = data[(y + ky) * width + (x + kx)];
            gx += pixel * sobelX[ky + 1][kx + 1];
            gy += pixel * sobelY[ky + 1][kx + 1];
          }
        }
        
        const index = y * width + x;
        magnitude[index] = Math.sqrt(gx * gx + gy * gy);
        direction[index] = Math.atan2(gy, gx);
      }
    }
    
    return { magnitude, direction };
  }

  // Supressão não-máxima
  private nonMaximumSuppression(
    gradients: { magnitude: Uint8ClampedArray; direction: Float32Array },
    width: number,
    height: number
  ): Uint8ClampedArray {
    const suppressed = new Uint8ClampedArray(width * height);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const index = y * width + x;
        const angle = gradients.direction[index];
        const magnitude = gradients.magnitude[index];
        
        // Determinar direção da borda
        let dx = 0, dy = 0;
        if (angle >= -Math.PI / 8 && angle < Math.PI / 8) {
          dx = 1; dy = 0;
        } else if (angle >= Math.PI / 8 && angle < 3 * Math.PI / 8) {
          dx = 1; dy = 1;
        } else if (angle >= 3 * Math.PI / 8 && angle < 5 * Math.PI / 8) {
          dx = 0; dy = 1;
        } else {
          dx = -1; dy = 1;
        }
        
        const neighbor1 = gradients.magnitude[(y + dy) * width + (x + dx)];
        const neighbor2 = gradients.magnitude[(y - dy) * width + (x - dx)];
        
        if (magnitude >= neighbor1 && magnitude >= neighbor2) {
          suppressed[index] = magnitude;
        }
      }
    }
    
    return suppressed;
  }

  // Limiarização dupla
  private doubleThresholding(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const lowThreshold = 50;
    const highThreshold = 150;
    
    const edges = new Uint8ClampedArray(width * height * 4);
    
    for (let i = 0; i < width * height; i++) {
      const value = data[i];
      let edgeValue = 0;
      
      if (value >= highThreshold) {
        edgeValue = 255; // Borda forte
      } else if (value >= lowThreshold) {
        edgeValue = 128; // Borda fraca
      }
      
      edges[i * 4] = edgeValue;     // R
      edges[i * 4 + 1] = edgeValue; // G
      edges[i * 4 + 2] = edgeValue; // B
      edges[i * 4 + 3] = 255;       // A
    }
    
    return edges;
  }

  // Encontrar contornos
  private findContours(edgeData: ImageData): Point[][] {
    const width = edgeData.width;
    const height = edgeData.height;
    const data = edgeData.data;
    const visited = new Array(width * height).fill(false);
    const contours: Point[][] = [];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        
        if (!visited[index] && data[index * 4] > 128) {
          const contour = this.traceContour(data, width, height, x, y, visited);
          if (contour.length > 10) { // Filtrar contornos muito pequenos
            contours.push(contour);
          }
        }
      }
    }
    
    return contours;
  }

  // Rastrear contorno
  private traceContour(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    startX: number,
    startY: number,
    visited: boolean[]
  ): Point[] {
    const contour: Point[] = [];
    const stack: Point[] = [{ x: startX, y: startY }];
    
    while (stack.length > 0) {
      const point = stack.pop()!;
      const index = point.y * width + point.x;
      
      if (visited[index] || data[index * 4] <= 128) continue;
      
      visited[index] = true;
      contour.push(point);
      
      // Verificar vizinhos 8-conectados
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = point.x + dx;
          const ny = point.y + dy;
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIndex = ny * width + nx;
            if (!visited[nIndex] && data[nIndex * 4] > 128) {
              stack.push({ x: nx, y: ny });
            }
          }
        }
      }
    }
    
    return contour;
  }

  // Classificar objetos baseado em contornos
  private classifyObjects(contours: Point[][], imageData: ImageData): DetectedObject[] {
    const objects: DetectedObject[] = [];
    
    contours.forEach((contour, index) => {
      const boundingBox = this.calculateBoundingBox(contour);
      const area = boundingBox.width * boundingBox.height;
      
      // Filtrar objetos muito pequenos
      if (area < 1000) return;
      
      const aspectRatio = boundingBox.width / boundingBox.height;
      const perimeter = contour.length;
      const circularity = (4 * Math.PI * area) / (perimeter * perimeter);
      
      // Classificação baseada em características geométricas
      let type: DetectedObject['type'] = 'furniture';
      let name = 'Objeto Desconhecido';
      let confidence = 0.5;
      
      if (aspectRatio > 2 && area > 5000) {
        name = 'Sofá';
        confidence = 0.8;
      } else if (aspectRatio < 0.7 && aspectRatio > 0.3 && area > 2000) {
        name = 'Mesa';
        confidence = 0.75;
      } else if (circularity > 0.7) {
        name = 'Mesa Redonda';
        confidence = 0.7;
      } else if (aspectRatio > 0.8 && aspectRatio < 1.2 && area > 3000) {
        name = 'Armário';
        confidence = 0.85;
      }
      
      objects.push({
        id: `obj-${index}`,
        type,
        name,
        boundingBox,
        confidence,
        style: 'desconhecido',
        material: 'desconhecido',
        color: this.extractDominantColor(imageData, boundingBox),
      });
    });
    
    return objects;
  }

  // Calcular bounding box de um contorno
  private calculateBoundingBox(contour: Point[]): BoundingBox {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    contour.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  // Extrair cor dominante de uma região
  private extractDominantColor(imageData: ImageData, boundingBox: BoundingBox): string {
    const colorCounts: { [key: string]: number } = {};
    
    for (let y = boundingBox.y; y < boundingBox.y + boundingBox.height; y += 5) {
      for (let x = boundingBox.x; x < boundingBox.x + boundingBox.width; x += 5) {
        const index = (y * imageData.width + x) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        
        const color = this.rgbToColorName(r, g, b);
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      }
    }
    
    return Object.keys(colorCounts).reduce((a, b) => 
      colorCounts[a] > colorCounts[b] ? a : b
    );
  }

  // Converter RGB para nome de cor
  private rgbToColorName(r: number, g: number, b: number): string {
    const brightness = (r + g + b) / 3;
    
    if (brightness < 50) return 'preto';
    if (brightness > 200) return 'branco';
    
    if (r > g && r > b) return 'vermelho';
    if (g > r && g > b) return 'verde';
    if (b > r && b > g) return 'azul';
    if (r > 150 && g > 150 && b < 100) return 'amarelo';
    if (r > 100 && g < 100 && b > 100) return 'roxo';
    if (r < 100 && g > 100 && b > 100) return 'ciano';
    
    return 'cinza';
  }

  // Transformada de Hough para detecção de linhas
  private houghLineTransform(imageData: ImageData): Point[][] {
    // Implementação simplificada da transformada de Hough
    const lines: Point[][] = [];
    
    // Esta é uma versão simplificada - em produção usaria uma implementação mais robusta
    const edges = this.cannyEdgeDetection(imageData);
    const contours = this.findContours(edges);
    
    contours.forEach(contour => {
      if (contour.length > 20) {
        const line = this.fitLineToPoints(contour);
        if (line.length >= 2) {
          lines.push(line);
        }
      }
    });
    
    return lines;
  }

  // Ajustar linha aos pontos usando regressão linear
  private fitLineToPoints(points: Point[]): Point[] {
    if (points.length < 2) return [];
    
    // Calcular regressão linear
    const n = points.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    points.forEach(point => {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumXX += point.x * point.x;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Encontrar pontos extremos da linha
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    
    return [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept }
    ];
  }

  // Encontrar pontos de fuga
  private findVanishingPoints(lines: Point[][]): Point[] {
    const vanishingPoints: Point[] = [];
    
    // Encontrar interseções entre linhas
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const intersection = this.lineIntersection(lines[i], lines[j]);
        if (intersection) {
          vanishingPoints.push(intersection);
        }
      }
    }
    
    // Agrupar pontos próximos
    const clusteredPoints = this.clusterPoints(vanishingPoints, 50);
    
    return clusteredPoints.slice(0, 3); // Máximo 3 pontos de fuga
  }

  // Calcular interseção entre duas linhas
  private lineIntersection(line1: Point[], line2: Point[]): Point | null {
    if (line1.length < 2 || line2.length < 2) return null;
    
    const [p1, p2] = line1;
    const [p3, p4] = line2;
    
    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    
    if (Math.abs(denom) < 0.001) return null; // Linhas paralelas
    
    const x = ((p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) - (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x)) / denom;
    const y = ((p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x)) / denom;
    
    return { x, y };
  }

  // Agrupar pontos próximos
  private clusterPoints(points: Point[], threshold: number): Point[] {
    const clusters: Point[][] = [];
    const used = new Array(points.length).fill(false);
    
    points.forEach((point, i) => {
      if (used[i]) return;
      
      const cluster = [point];
      used[i] = true;
      
      points.forEach((otherPoint, j) => {
        if (i !== j && !used[j]) {
          const distance = Math.sqrt(
            Math.pow(point.x - otherPoint.x, 2) + Math.pow(point.y - otherPoint.y, 2)
          );
          
          if (distance < threshold) {
            cluster.push(otherPoint);
            used[j] = true;
          }
        }
      });
      
      clusters.push(cluster);
    });
    
    // Retornar centroide de cada cluster
    return clusters.map(cluster => {
      const sumX = cluster.reduce((sum, p) => sum + p.x, 0);
      const sumY = cluster.reduce((sum, p) => sum + p.y, 0);
      return {
        x: sumX / cluster.length,
        y: sumY / cluster.length,
      };
    });
  }

  // Calcular linha do horizonte
  private calculateHorizonLine(vanishingPoints: Point[]): number {
    if (vanishingPoints.length === 0) return 0.5;
    
    const avgY = vanishingPoints.reduce((sum, p) => sum + p.y, 0) / vanishingPoints.length;
    return avgY / this.canvas.height;
  }

  // Estimar ângulo de visão
  private estimateViewAngle(lines: Point[][], vanishingPoints: Point[]): number {
    // Implementação simplificada
    return 60; // Ângulo padrão em graus
  }

  // Calcular distorção
  private calculateDistortion(lines: Point[][]): number {
    // Implementação simplificada baseada na curvatura das linhas
    return 0.1; // Distorção baixa por padrão
  }

  // Transformar bounding box entre perspectivas
  private transformBoundingBox(
    boundingBox: BoundingBox,
    sourcePerspective: PerspectiveData,
    targetPerspective: PerspectiveData
  ): BoundingBox {
    // Implementação simplificada da transformação de perspectiva
    const scaleX = targetPerspective.viewAngle / sourcePerspective.viewAngle;
    const scaleY = (1 - targetPerspective.horizonLine) / (1 - sourcePerspective.horizonLine);
    
    return {
      x: boundingBox.x * scaleX,
      y: boundingBox.y * scaleY,
      width: boundingBox.width * scaleX,
      height: boundingBox.height * scaleY,
    };
  }
}

// Instância singleton do processador
export const computerVision = new ComputerVisionProcessor();

// Utilitários auxiliares
export const CVUtils = {
  // Carregar imagem como HTMLImageElement
  loadImage: (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  },

  // Redimensionar imagem mantendo proporção
  resizeImage: (img: HTMLImageElement, maxWidth: number, maxHeight: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  },

  // Converter canvas para blob
  canvasToBlob: (canvas: HTMLCanvasElement, quality = 0.8): Promise<Blob> => {
    return new Promise(resolve => {
      canvas.toBlob(resolve as BlobCallback, 'image/jpeg', quality);
    });
  },
};