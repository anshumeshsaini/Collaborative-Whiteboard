import * as tf from '@tensorflow/tfjs';
import { DrawingStroke, AISuggestion, AIShapeRecognition } from '../types';

class AIService {
  private model: tf.LayersModel | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // In a real implementation, you would load a pre-trained model
      // For demo purposes, we'll simulate AI functionality
      await tf.ready();
      this.isInitialized = true;
      console.log('AI Service initialized');
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
    }
  }

  async recognizeShape(stroke: DrawingStroke): Promise<AIShapeRecognition | null> {
    if (!this.isInitialized) await this.initialize();
    
    // Simulate shape recognition with basic geometric analysis
    const points = stroke.points;
    if (points.length < 3) return null;

    const boundingBox = this.calculateBoundingBox(points);
    const shape = this.analyzeGeometry(points, boundingBox);
    
    return {
      shape: shape.type,
      confidence: shape.confidence,
      boundingBox
    };
  }

  async generateSuggestions(strokes: DrawingStroke[]): Promise<AISuggestion[]> {
    if (!this.isInitialized) await this.initialize();
    
    const suggestions: AISuggestion[] = [];
    
    // Analyze recent strokes for shape recognition
    const recentStrokes = strokes.slice(-5);
    for (const stroke of recentStrokes) {
      const shapeRecognition = await this.recognizeShape(stroke);
      if (shapeRecognition && shapeRecognition.confidence > 0.7) {
        suggestions.push({
          id: `shape_${stroke.id}`,
          type: 'shape_recognition',
          confidence: shapeRecognition.confidence,
          suggestion: `Convert to clean ${shapeRecognition.shape}`,
          targetStrokeId: stroke.id,
          timestamp: Date.now()
        });
      }
    }

    // Template suggestions based on stroke patterns
    const templateSuggestion = this.analyzeForTemplates(strokes);
    if (templateSuggestion) {
      suggestions.push(templateSuggestion);
    }

    return suggestions;
  }

  private calculateBoundingBox(points: { x: number; y: number }[]) {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  }

  private analyzeGeometry(points: { x: number; y: number }[], boundingBox: any) {
    const { width, height } = boundingBox;
    const aspectRatio = width / height;
    
    // Simple heuristics for shape recognition
    if (this.isCircular(points, boundingBox)) {
      return { type: 'circle' as const, confidence: 0.85 };
    }
    
    if (this.isRectangular(points, boundingBox)) {
      return { type: 'rectangle' as const, confidence: 0.8 };
    }
    
    if (this.isLinear(points)) {
      return { type: 'line' as const, confidence: 0.9 };
    }
    
    if (this.isArrowLike(points)) {
      return { type: 'arrow' as const, confidence: 0.75 };
    }
    
    return { type: 'rectangle' as const, confidence: 0.3 };
  }

  private isCircular(points: { x: number; y: number }[], boundingBox: any): boolean {
    const { x, y, width, height } = boundingBox;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2;
    
    let circularPoints = 0;
    for (const point of points) {
      const distance = Math.sqrt(
        Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
      );
      if (Math.abs(distance - radius) < radius * 0.3) {
        circularPoints++;
      }
    }
    
    return circularPoints / points.length > 0.6;
  }

  private isRectangular(points: { x: number; y: number }[], boundingBox: any): boolean {
    // Check if points roughly follow rectangle edges
    const { x, y, width, height } = boundingBox;
    const tolerance = Math.min(width, height) * 0.1;
    
    let edgePoints = 0;
    for (const point of points) {
      const nearLeftEdge = Math.abs(point.x - x) < tolerance;
      const nearRightEdge = Math.abs(point.x - (x + width)) < tolerance;
      const nearTopEdge = Math.abs(point.y - y) < tolerance;
      const nearBottomEdge = Math.abs(point.y - (y + height)) < tolerance;
      
      if (nearLeftEdge || nearRightEdge || nearTopEdge || nearBottomEdge) {
        edgePoints++;
      }
    }
    
    return edgePoints / points.length > 0.5;
  }

  private isLinear(points: { x: number; y: number }[]): boolean {
    if (points.length < 2) return false;
    
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    
    let linearPoints = 0;
    for (const point of points) {
      const distance = this.pointToLineDistance(point, firstPoint, lastPoint);
      if (distance < 20) { // 20px tolerance
        linearPoints++;
      }
    }
    
    return linearPoints / points.length > 0.8;
  }

  private isArrowLike(points: { x: number; y: number }[]): boolean {
    // Simple arrow detection - look for a main line with branches at the end
    if (points.length < 10) return false;
    
    const mainLineEnd = Math.floor(points.length * 0.7);
    const mainLine = points.slice(0, mainLineEnd);
    const arrowHead = points.slice(mainLineEnd);
    
    return this.isLinear(mainLine) && arrowHead.length > 3;
  }

  private pointToLineDistance(
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number }
  ): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    const param = dot / lenSq;
    
    let xx, yy;
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private analyzeForTemplates(strokes: DrawingStroke[]): AISuggestion | null {
    if (strokes.length < 3) return null;
    
    // Analyze stroke patterns for template suggestions
    const hasHorizontalLines = strokes.some(stroke => 
      this.isLinear(stroke.points) && this.isHorizontal(stroke.points)
    );
    
    const hasVerticalLines = strokes.some(stroke => 
      this.isLinear(stroke.points) && this.isVertical(stroke.points)
    );
    
    if (hasHorizontalLines && hasVerticalLines) {
      return {
        id: `template_${Date.now()}`,
        type: 'template_suggestion',
        confidence: 0.8,
        suggestion: 'Consider using a flowchart template',
        timestamp: Date.now()
      };
    }
    
    if (hasHorizontalLines) {
      return {
        id: `template_${Date.now()}`,
        type: 'template_suggestion',
        confidence: 0.7,
        suggestion: 'Consider using a timeline template',
        timestamp: Date.now()
      };
    }
    
    return null;
  }

  private isHorizontal(points: { x: number; y: number }[]): boolean {
    if (points.length < 2) return false;
    const yVariance = Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y));
    const xRange = Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x));
    return yVariance < xRange * 0.2;
  }

  private isVertical(points: { x: number; y: number }[]): boolean {
    if (points.length < 2) return false;
    const xVariance = Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x));
    const yRange = Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y));
    return xVariance < yRange * 0.2;
  }
}

export const aiService = new AIService();