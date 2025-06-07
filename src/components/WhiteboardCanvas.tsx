import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { Stage, Layer, Line, Text, Circle } from 'react-konva';
import { useWhiteboard } from '../contexts/WhiteboardContext';
import { useAuth } from '../contexts/AuthContext';
import { DrawingStroke, DrawingPoint } from '../types';
import { throttle } from 'lodash';

const WhiteboardCanvas: React.FC = () => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  
  const { user } = useAuth();
  const {
    state,
    currentTool,
    currentColor,
    currentWidth,
    addStroke,
    updateCursor,
    clearCursor
  } = useWhiteboard();

  // Throttled cursor update
  const throttledUpdateCursor = useMemo(
    () => throttle(updateCursor, 100),
    [updateCursor]
  );

  // Update stage size on window resize with debounce
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateSize();
    
    const debouncedResize = debounce(updateSize, 100);
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      throttledUpdateCursor.cancel();
    };
  }, [throttledUpdateCursor]);

  // Clear cursor when unmounting
  useEffect(() => {
    return () => {
      if (user) {
        clearCursor(user.id);
      }
    };
  }, [user, clearCursor]);

  const handleMouseDown = useCallback((e: any) => {
    if (!user) return;
    
    setIsDrawing(true);
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    if (pos) {
      const adjustedPos = {
        x: (pos.x - stagePos.x) / zoom,
        y: (pos.y - stagePos.y) / zoom
      };
      setCurrentStroke([adjustedPos]);
    }
  }, [user, stagePos, zoom]);

  const handleMouseMove = useCallback((e: any) => {
    if (!user) return;
    
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    if (pos && user) {
      const adjustedPos = {
        x: (pos.x - stagePos.x) / zoom,
        y: (pos.y - stagePos.y) / zoom
      };

      // Update cursor position
      setCursorPosition({ x: pos.x, y: pos.y });

      // Update cursor position for other users to see
      throttledUpdateCursor({
        userId: user.id,
        x: adjustedPos.x,
        y: adjustedPos.y,
        color: currentColor,
        name: user.name
      });

      if (isDrawing) {
        setCurrentStroke(prev => [...prev, adjustedPos]);
      }
    }
  }, [user, currentColor, throttledUpdateCursor, isDrawing, stagePos, zoom]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !user || currentStroke.length === 0) return;
    
    const stroke: DrawingStroke = {
      id: `${user.id}-${Date.now()}`,
      points: currentStroke,
      color: currentTool === 'eraser' ? '#FFFFFF' : currentColor,
      width: currentWidth,
      tool: currentTool,
      timestamp: Date.now(),
      userId: user.id
    };
    
    addStroke(stroke);
    setIsDrawing(false);
    setCurrentStroke([]);
  }, [isDrawing, user, currentStroke, currentTool, currentColor, currentWidth, addStroke]);

  const handleMouseLeave = useCallback(() => {
    if (user) {
      clearCursor(user.id);
    }
  }, [user, clearCursor]);

  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    
    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));
    
    setZoom(clampedScale);
    
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };
    
    stage.scale({ x: clampedScale, y: clampedScale });
    stage.position(newPos);
    setStagePos(newPos);
  }, []);

  const getStrokeProps = (stroke: DrawingStroke) => {
    const baseProps = {
      points: stroke.points.flatMap(p => [p.x, p.y]),
      stroke: stroke.color,
      strokeWidth: stroke.width,
      tension: 0.5,
      lineCap: 'round' as const,
      lineJoin: 'round' as const,
      shadowColor: stroke.tool === 'highlighter' ? stroke.color : undefined,
      shadowBlur: stroke.tool === 'highlighter' ? 10 : undefined,
      shadowOpacity: stroke.tool === 'highlighter' ? 0.3 : undefined,
      perfectDrawEnabled: false,
    };

    switch (stroke.tool) {
      case 'highlighter':
        return {
          ...baseProps,
          opacity: 0.6,
          strokeWidth: stroke.width * 2,
          globalCompositeOperation: 'multiply',
        };
      case 'eraser':
        return {
          ...baseProps,
          globalCompositeOperation: 'destination-out',
          strokeWidth: stroke.width * 1.5,
        };
      default:
        return baseProps;
    }
  };

  const renderGrid = () => {
    if (!showGrid) return null;
    
    const gridSize = 20 * zoom;
    const gridLines = [];
    const gridColor = '#e5e7eb';
    
    // Vertical lines
    for (let i = 0; i < stageSize.width / gridSize; i++) {
      gridLines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSize, 0, i * gridSize, stageSize.height]}
          stroke={gridColor}
          strokeWidth={1}
          listening={false}
        />
      );
    }
    
    // Horizontal lines
    for (let i = 0; i < stageSize.height / gridSize; i++) {
      gridLines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSize, stageSize.width, i * gridSize]}
          stroke={gridColor}
          strokeWidth={1}
          listening={false}
        />
      );
    }
    
    return gridLines;
  };

  const renderCursorIndicator = (cursor: any) => {
    const adjustedX = cursor.x * zoom + stagePos.x;
    const adjustedY = cursor.y * zoom + stagePos.y;
    
    return (
      <React.Fragment key={cursor.userId}>
        <Circle
          x={adjustedX}
          y={adjustedY}
          radius={8}
          fill={cursor.color}
          stroke="#fff"
          strokeWidth={2}
          listening={false}
        />
        <Text
          x={adjustedX + 12}
          y={adjustedY - 12}
          text={cursor.name}
          fontSize={12}
          fontFamily="Arial"
          fill={cursor.color}
          padding={5}
          align="left"
          listening={false}
        />
      </React.Fragment>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-gray-100 relative overflow-hidden"
      style={{ height: 'calc(100vh - 140px)' }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        draggable={!isDrawing}
        className="cursor-crosshair touch-none"
        scaleX={zoom}
        scaleY={zoom}
        x={stagePos.x}
        y={stagePos.y}
      >
        <Layer>
          {/* Grid Background */}
          {renderGrid()}
          
          {/* Render existing strokes */}
          {state.strokes.map((stroke) => (
            <Line
              key={stroke.id}
              {...getStrokeProps(stroke)}
            />
          ))}
          
          {/* Render current stroke being drawn */}
          {isDrawing && currentStroke.length > 0 && (
            <Line
              points={currentStroke.flatMap(p => [p.x, p.y])}
              stroke={currentTool === 'eraser' ? '#FFFFFF' : currentColor}
              strokeWidth={currentTool === 'highlighter' ? currentWidth * 2 : currentWidth}
              opacity={currentTool === 'highlighter' ? 0.6 : 1}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={currentTool === 'eraser' ? 'destination-out' : 'source-over'}
              shadowColor={currentTool === 'highlighter' ? currentColor : undefined}
              shadowBlur={currentTool === 'highlighter' ? 10 : undefined}
              shadowOpacity={currentTool === 'highlighter' ? 0.3 : undefined}
            />
          )}
          
          {/* Cursor indicators for other users */}
          {state.cursors
            .filter(cursor => cursor.userId !== user?.id)
            .map(renderCursorIndicator)}
        </Layer>
      </Stage>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg shadow-md px-3 py-2 flex items-center">
        <button 
          onClick={() => setZoom(prev => Math.max(0.1, prev - 0.1))}
          className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded"
        >
          -
        </button>
        <span className="mx-2 text-sm font-medium text-gray-700 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button 
          onClick={() => setZoom(prev => Math.min(5, prev + 0.1))}
          className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded"
        >
          +
        </button>
        <button 
          onClick={() => {
            setZoom(1);
            if (stageRef.current) {
              stageRef.current.scale({ x: 1, y: 1 });
              stageRef.current.position({ x: 0, y: 0 });
              setStagePos({ x: 0, y: 0 });
            }
          }}
          className="ml-2 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
        >
          Reset
        </button>
      </div>

      {/* Grid Toggle */}
      <button
        onClick={() => setShowGrid(!showGrid)}
        className={`absolute bottom-4 right-4 p-2 rounded-full shadow-md ${
          showGrid ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
        }`}
        title="Toggle Grid"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>

      {/* Position Indicator */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg shadow-md px-3 py-1 text-sm text-gray-700">
        X: {Math.round(cursorPosition.x - stagePos.x)}px, Y: {Math.round(cursorPosition.y - stagePos.y)}px
      </div>
    </div>
  );
};

// Simple debounce function
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default WhiteboardCanvas;