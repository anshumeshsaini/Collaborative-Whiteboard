import { Template, TemplateCategory, TemplateElement } from '../types';

class TemplateService {
  private templates: Template[] = [];

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    this.templates = [
      {
        id: 'brainstorm-1',
        name: 'Mind Map',
        category: 'brainstorming',
        elements: [
          {
            type: 'shape',
            x: 400,
            y: 300,
            width: 120,
            height: 60,
            properties: { shape: 'ellipse', fill: '#e3f2fd', stroke: '#1976d2', text: 'Main Topic' }
          },
          {
            type: 'shape',
            x: 200,
            y: 200,
            width: 100,
            height: 50,
            properties: { shape: 'rectangle', fill: '#f3e5f5', stroke: '#7b1fa2', text: 'Idea 1' }
          },
          {
            type: 'shape',
            x: 600,
            y: 200,
            width: 100,
            height: 50,
            properties: { shape: 'rectangle', fill: '#e8f5e8', stroke: '#388e3c', text: 'Idea 2' }
          },
          {
            type: 'line',
            x: 350,
            y: 280,
            properties: { endX: 250, endY: 225, stroke: '#666' }
          },
          {
            type: 'line',
            x: 450,
            y: 280,
            properties: { endX: 650, endY: 225, stroke: '#666' }
          }
        ],
        thumbnail: '/templates/mindmap.png',
        isPublic: true,
        createdBy: 'system',
        usage: 1250
      },
      {
        id: 'flowchart-1',
        name: 'Basic Flowchart',
        category: 'flowchart',
        elements: [
          {
            type: 'shape',
            x: 400,
            y: 100,
            width: 120,
            height: 60,
            properties: { shape: 'ellipse', fill: '#e8f5e8', stroke: '#4caf50', text: 'Start' }
          },
          {
            type: 'shape',
            x: 400,
            y: 200,
            width: 120,
            height: 60,
            properties: { shape: 'rectangle', fill: '#e3f2fd', stroke: '#2196f3', text: 'Process' }
          },
          {
            type: 'shape',
            x: 400,
            y: 300,
            width: 120,
            height: 60,
            properties: { shape: 'diamond', fill: '#fff3e0', stroke: '#ff9800', text: 'Decision?' }
          },
          {
            type: 'shape',
            x: 400,
            y: 400,
            width: 120,
            height: 60,
            properties: { shape: 'ellipse', fill: '#ffebee', stroke: '#f44336', text: 'End' }
          }
        ],
        thumbnail: '/templates/flowchart.png',
        isPublic: true,
        createdBy: 'system',
        usage: 980
      },
      {
        id: 'timeline-1',
        name: 'Project Timeline',
        category: 'timeline',
        elements: [
          {
            type: 'line',
            x: 100,
            y: 300,
            properties: { endX: 700, endY: 300, stroke: '#333', strokeWidth: 3 }
          },
          {
            type: 'shape',
            x: 150,
            y: 280,
            width: 80,
            height: 40,
            properties: { shape: 'rectangle', fill: '#e8f5e8', stroke: '#4caf50', text: 'Phase 1' }
          },
          {
            type: 'shape',
            x: 300,
            y: 280,
            width: 80,
            height: 40,
            properties: { shape: 'rectangle', fill: '#e3f2fd', stroke: '#2196f3', text: 'Phase 2' }
          },
          {
            type: 'shape',
            x: 450,
            y: 280,
            width: 80,
            height: 40,
            properties: { shape: 'rectangle', fill: '#fff3e0', stroke: '#ff9800', text: 'Phase 3' }
          },
          {
            type: 'shape',
            x: 600,
            y: 280,
            width: 80,
            height: 40,
            properties: { shape: 'rectangle', fill: '#ffebee', stroke: '#f44336', text: 'Launch' }
          }
        ],
        thumbnail: '/templates/timeline.png',
        isPublic: true,
        createdBy: 'system',
        usage: 756
      },
      {
        id: 'wireframe-1',
        name: 'Mobile App Wireframe',
        category: 'wireframe',
        elements: [
          {
            type: 'shape',
            x: 350,
            y: 50,
            width: 200,
            height: 400,
            properties: { shape: 'rectangle', fill: '#fafafa', stroke: '#333', strokeWidth: 2 }
          },
          {
            type: 'shape',
            x: 370,
            y: 70,
            width: 160,
            height: 30,
            properties: { shape: 'rectangle', fill: '#e0e0e0', stroke: '#666', text: 'Header' }
          },
          {
            type: 'shape',
            x: 370,
            y: 120,
            width: 160,
            height: 200,
            properties: { shape: 'rectangle', fill: '#f5f5f5', stroke: '#999', text: 'Content Area' }
          },
          {
            type: 'shape',
            x: 370,
            y: 340,
            width: 160,
            height: 40,
            properties: { shape: 'rectangle', fill: '#e0e0e0', stroke: '#666', text: 'Navigation' }
          }
        ],
        thumbnail: '/templates/wireframe.png',
        isPublic: true,
        createdBy: 'system',
        usage: 432
      },
      {
        id: 'empathy-map',
        name: 'Empathy Map',
        category: 'brainstorming',
        elements: [
          {
            type: 'shape',
            x: 300,
            y: 200,
            width: 200,
            height: 200,
            properties: { shape: 'rectangle', fill: '#fff9c4', stroke: '#f57f17', strokeWidth: 2 }
          },
          {
            type: 'text',
            x: 400,
            y: 300,
            properties: { text: 'USER', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }
          },
          {
            type: 'shape',
            x: 200,
            y: 100,
            width: 150,
            height: 80,
            properties: { shape: 'rectangle', fill: '#e8f5e8', stroke: '#4caf50', text: 'THINKS & FEELS' }
          },
          {
            type: 'shape',
            x: 450,
            y: 100,
            width: 150,
            height: 80,
            properties: { shape: 'rectangle', fill: '#e3f2fd', stroke: '#2196f3', text: 'SEES' }
          },
          {
            type: 'shape',
            x: 200,
            y: 420,
            width: 150,
            height: 80,
            properties: { shape: 'rectangle', fill: '#fff3e0', stroke: '#ff9800', text: 'SAYS & DOES' }
          },
          {
            type: 'shape',
            x: 450,
            y: 420,
            width: 150,
            height: 80,
            properties: { shape: 'rectangle', fill: '#ffebee', stroke: '#f44336', text: 'PAIN POINTS' }
          }
        ],
        thumbnail: '/templates/empathy-map.png',
        isPublic: true,
        createdBy: 'system',
        usage: 324
      }
    ];
  }

  getTemplates(category?: TemplateCategory): Template[] {
    if (category) {
      return this.templates.filter(template => template.category === category);
    }
    return this.templates;
  }

  getTemplate(id: string): Template | null {
    return this.templates.find(template => template.id === id) || null;
  }

  saveTemplate(template: Omit<Template, 'id' | 'usage'>): Template {
    const newTemplate: Template = {
      ...template,
      id: `custom_${Date.now()}`,
      usage: 0
    };
    
    this.templates.push(newTemplate);
    return newTemplate;
  }

  incrementUsage(templateId: string): void {
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      template.usage++;
    }
  }

  getPopularTemplates(limit: number = 5): Template[] {
    return [...this.templates]
      .sort((a, b) => b.usage - a.usage)
      .slice(0, limit);
  }

  searchTemplates(query: string): Template[] {
    const lowercaseQuery = query.toLowerCase();
    return this.templates.filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  suggestTemplates(strokes: any[]): Template[] {
    // Analyze drawing patterns to suggest relevant templates
    if (strokes.length === 0) return this.getPopularTemplates(3);

    // Simple heuristics for template suggestions
    const hasCircles = strokes.some((stroke: any) => this.isCircular(stroke.points));
    const hasRectangles = strokes.some((stroke: any) => this.isRectangular(stroke.points));
    const hasLines = strokes.some((stroke: any) => this.isLinear(stroke.points));

    if (hasCircles && hasLines) {
      return this.getTemplates('brainstorming').slice(0, 2);
    }

    if (hasRectangles && hasLines) {
      return this.getTemplates('flowchart').slice(0, 2);
    }

    if (hasLines) {
      return this.getTemplates('timeline').slice(0, 2);
    }

    return this.getPopularTemplates(3);
  }

  private isCircular(points: { x: number; y: number }[]): boolean {
    // Simplified circular detection
    if (points.length < 10) return false;
    
    const first = points[0];
    const last = points[points.length - 1];
    const distance = Math.sqrt(
      Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2)
    );
    
    return distance < 30; // Close to starting point
  }

  private isRectangular(points: { x: number; y: number }[]): boolean {
    // Simplified rectangular detection
    if (points.length < 8) return false;
    
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    
    return width > 50 && height > 30; // Reasonable rectangle size
  }

  private isLinear(points: { x: number; y: number }[]): boolean {
    // Simplified linear detection
    if (points.length < 3) return false;
    
    const first = points[0];
    const last = points[points.length - 1];
    const totalDistance = Math.sqrt(
      Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2)
    );
    
    return totalDistance > 100; // Reasonable line length
  }
}

export const templateService = new TemplateService();