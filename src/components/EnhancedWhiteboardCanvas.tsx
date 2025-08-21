import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Line, Text, Circle } from 'react-konva';
import { motion } from 'framer-motion';
import { useWhiteboard } from '../contexts/WhiteboardContext';
import { useAuth } from '../contexts/AuthContext';
import { DrawingStroke, DrawingPoint } from '../types';

const EnhancedWhiteboardCanvas: React.FC = () => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [toolPreview, setToolPreview] = useState<{ visible: boolean; x: number; y: number }>({ 
    visible: false, 
    x: 0, 
    y: 0 
  });
  
  const { user } = useAuth();
  const {
    state,
    currentTool,
    currentColor,
    currentWidth,
    followingUser,
    addStroke,
    updateCursor
  } = useWhiteboard();

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
    return () => window.removeEventListener('resize', debouncedResize);
  }, []);

  // Follow user functionality
  useEffect(() => {
    if (followingUser && state.cursors.length > 0) {
      const targetCursor = state.cursors.find(c => c.userId === followingUser);
      if (targetCursor && stageRef.current) {
        const stage = stageRef.current;
        const newPos = {
          x: stageSize.width / 2 - targetCursor.x * zoom,
          y: stageSize.height / 2 - targetCursor.y * zoom
        };
        stage.position(newPos);
        setStagePos(newPos);
      }
    }
  }, [followingUser, state.cursors, zoom, stageSize]);

  const handleMouseDown = useCallback((e: any) => {
    if (!user || followingUser) return;
    
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    if (pos) {
      const adjustedPos = {
        x: (pos.x - stagePos.x) / zoom,
        y: (pos.y - stagePos.y) / zoom
      };
      setCurrentStroke([adjustedPos]);
    }
  }, [user, followingUser, stagePos, zoom]);

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
      updateCursor({
        userId: user.id,
        x: adjustedPos.x,
        y: adjustedPos.y,
        color: currentColor,
        name: user.name,
        isFollowing: !!followingUser
      });

      if (isDrawing && !followingUser) {
        setCurrentStroke(prev => [...prev, adjustedPos]);
      }

      // Show tool preview when not drawing
      if (!isDrawing) {
        setToolPreview({
          visible: true,
          x: pos.x,
          y: pos.y
        });
      }
    }
  }, [user, currentColor, updateCursor, isDrawing, followingUser, stagePos, zoom]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !user || currentStroke.length === 0 || followingUser) return;
    
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
  }, [isDrawing, user, currentStroke, currentTool, currentColor, currentWidth, addStroke, followingUser]);

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

  const handleMouseLeave = useCallback(() => {
    setToolPreview({ visible: false, x: 0, y: 0 });
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
        />
      );
    }
    
    return gridLines;
  };

  const renderToolPreview = () => {
    if (!toolPreview.visible || isDrawing || followingUser) return null;
    
    const previewSize = currentTool === 'highlighter' ? currentWidth * 2 : currentWidth;
    const previewColor = currentTool === 'eraser' ? '#FFFFFF' : currentColor;
    
    return (
      <Circle
        x={toolPreview.x}
        y={toolPreview.y}
        radius={previewSize / 2}
        fill={previewColor}
        opacity={currentTool === 'highlighter' ? 0.5 : 0.7}
        listening={false}
        globalCompositeOperation={currentTool === 'eraser' ? 'destination-out' : 'source-over'}
      />
    );
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
          text={cursor.name + (cursor.isFollowing ? ' (Following)' : '')}
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
      {/* Main Canvas */}
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
        className={`${followingUser ? 'cursor-not-allowed' : 'cursor-crosshair'} touch-none`}
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
              perfectDrawEnabled={false}
            />
          ))}
          
          {/* Render current stroke being drawn */}
          {isDrawing && currentStroke.length > 0 && !followingUser && (
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
          
          {/* Tool preview */}
          {renderToolPreview()}
          
          {/* Cursor indicators for other users */}
          {state.cursors
            .filter(cursor => cursor.userId !== user?.id)
            .map(renderCursorIndicator)}
        </Layer>
      </Stage>

      {/* Floating Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white bg-opacity-90 rounded-lg shadow-lg p-2">
        <button 
          onClick={() => setShowGrid(!showGrid)}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          title="Toggle Grid"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button 
          onClick={() => {
            if (stageRef.current) {
              setZoom(1);
              stageRef.current.scale({ x: 1, y: 1 });
              stageRef.current.position({ x: 0, y: 0 });
              setStagePos({ x: 0, y: 0 });
            }
          }}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 border-t border-gray-200 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: currentColor }} />
            <span className="text-sm font-medium text-gray-700">
              {currentTool.charAt(0).toUpperCase() + currentTool.slice(1)}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Size: {currentWidth}px
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-700">
            {Math.round(zoom * 100)}%
          </div>
          <div className="text-sm text-gray-500">
            {Math.round(cursorPosition.x - stagePos.x)}px, {Math.round(cursorPosition.y - stagePos.y)}px
          </div>
        </div>
      </div>

      {/* Follow mode indicator */}
      {followingUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <span>Following {state.cursors.find(c => c.userId === followingUser)?.name} - Drawing disabled</span>
        </motion.div>
      )}
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

export default EnhancedWhiteboardCanvas;