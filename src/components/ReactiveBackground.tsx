import React, { useEffect, useRef, useMemo } from 'react';
import { BackgroundType, DrawingStroke } from '../types';

interface ReactiveBackgroundProps {
  type: BackgroundType;
  width: number;
  height: number;
  strokes: DrawingStroke[];
}

const ReactiveBackground: React.FC<ReactiveBackgroundProps> = ({ 
  type, 
  width, 
  height, 
  strokes 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastRenderTimeRef = useRef<number>(0);
  const pulsePhaseRef = useRef<number>(0);

  // Memoize heatmap data to avoid recalculating on every render
  const heatMapData = useMemo(() => {
    return type === 'reactive' ? createHeatMap(strokes, width, height) : null;
  }, [type, strokes, width, height]);

  // Memoize gradient colors
  const gradientColors = useMemo(() => {
    if (type !== 'gradient' || strokes.length === 0) return null;
    const colors = strokes.map(stroke => stroke.color).filter(Boolean);
    return [...new Set(colors)];
  }, [type, strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (timestamp: number) => {
      // Throttle rendering to 60fps
      if (timestamp - lastRenderTimeRef.current < 16) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }
      lastRenderTimeRef.current = timestamp;

      ctx.clearRect(0, 0, width, height);

      switch (type) {
        case 'grid':
          drawGrid(ctx, width, height);
          break;
        case 'dots':
          drawDots(ctx, width, height);
          break;
        case 'reactive':
          drawReactiveBackground(ctx, width, height, heatMapData);
          break;
        case 'gradient':
          drawGradientBackground(ctx, width, height, gradientColors);
          break;
        case 'animated':
          pulsePhaseRef.current = (pulsePhaseRef.current || 0) + 0.005;
          drawAnimatedBackground(ctx, width, height, pulsePhaseRef.current);
          break;
        default:
          // Plain background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
      }

      if (type === 'animated') {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render(performance.now());

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [type, width, height, heatMapData, gradientColors]);

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const gridSize = 20;
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  };

  const drawDots = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const dotSize = 1.5;
    const spacing = 25;
    ctx.fillStyle = '#d1d5db';

    // Draw dots in a checkerboard pattern for better performance
    for (let y = spacing; y < h; y += spacing) {
      for (let x = spacing + (y % (spacing * 2) ? 0 : spacing / 2; x < w; x += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const drawReactiveBackground = (
    ctx: CanvasRenderingContext2D, 
    w: number, 
    h: number, 
    heatMap: number[][] | null
  ) => {
    // Draw subtle grid as base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    drawGrid(ctx, w, h);

    if (!heatMap) return;

    const cellSize = 50;
    const maxHeat = Math.max(1, ...heatMap.flat()); // Ensure we don't divide by zero

    // Draw glow effect
    ctx.globalCompositeOperation = 'lighter';
    heatMap.forEach((row, rowIndex) => {
      row.forEach((heat, colIndex) => {
        if (heat > 0) {
          const x = colIndex * cellSize;
          const y = rowIndex * cellSize;
          const alpha = (heat / maxHeat) * 0.15;

          // Create radial gradient for glow effect
          const gradient = ctx.createRadialGradient(
            x + cellSize/2, y + cellSize/2, 0,
            x + cellSize/2, y + cellSize/2, cellSize * 1.5
          );
          gradient.addColorStop(0, `rgba(99, 102, 241, ${alpha})`);
          gradient.addColorStop(1, `rgba(99, 102, 241, 0)`);

          ctx.fillStyle = gradient;
          ctx.fillRect(x - cellSize/2, y - cellSize/2, cellSize * 2, cellSize * 2);
        }
      });
    });
    ctx.globalCompositeOperation = 'source-over';
  };

  const drawGradientBackground = (
    ctx: CanvasRenderingContext2D, 
    w: number, 
    h: number, 
    colors: string[] | null
  ) => {
    if (!colors || colors.length === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      return;
    }

    // Create multi-color gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    const step = 1 / (colors.length - 1);
    
    colors.forEach((color, index) => {
      gradient.addColorStop(index * step, `${color}20`); // Add opacity
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Add subtle noise overlay
    addNoiseEffect(ctx, w, h, 0.03);
  };

  const drawAnimatedBackground = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    phase: number
  ) => {
    // Base color
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    // Animated wave pattern
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    
    const amplitude = 10;
    const frequency = 0.005;
    const waveSpacing = 40;

    for (let y = -waveSpacing; y < h + waveSpacing; y += waveSpacing) {
      ctx.beginPath();
      
      for (let x = 0; x <= w; x += 5) {
        const waveOffset = Math.sin(x * frequency + phase) * amplitude;
        const waveY = y + waveOffset;
        
        if (x === 0) {
          ctx.moveTo(x, waveY);
        } else {
          ctx.lineTo(x, waveY);
        }
      }
      
      ctx.stroke();
    }

    // Subtle particles
    addNoiseEffect(ctx, w, h, 0.02);
  };

  const addNoiseEffect = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    density: number
  ) => {
    const imageData = ctx.createImageData(w, h);
    const pixels = imageData.data;
    
    for (let i = 0; i < pixels.length; i += 4) {
      if (Math.random() < density) {
        const val = Math.floor(Math.random() * 30);
        pixels[i] = pixels[i + 1] = pixels[i + 2] = val;
        pixels[i + 3] = Math.floor(Math.random() * 10);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const createHeatMap = (strokes: DrawingStroke[], w: number, h: number) => {
    const cellSize = 50;
    const cols = Math.ceil(w / cellSize);
    const rows = Math.ceil(h / cellSize);
    const heatMap = Array(rows).fill(null).map(() => Array(cols).fill(0));

    strokes.forEach(stroke => {
      stroke.points?.forEach(point => {
        const col = Math.floor(point.x / cellSize);
        const row = Math.floor(point.y / cellSize);
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
          // Weight by stroke width
          heatMap[row][col] += stroke.width || 1;
        }
      });
    });

    return heatMap;
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
      style={{ zIndex: 0 }}
    />
  );
};

export default React.memo(ReactiveBackground);