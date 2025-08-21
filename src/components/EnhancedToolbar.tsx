import React, { useState } from 'react';
import { 
  Pen, 
  Eraser, 
  Highlighter, 
  Undo2, 
  Redo2, 
  Trash2, 
  Download,
  Brain,
} from 'lucide-react';
import { useWhiteboard } from '../contexts/WhiteboardContext';
import { DrawingTool, BackgroundType } from '../types';
import TemplateGallery from './TemplateGallery';

const EnhancedToolbar: React.FC = () => {
  const {
    currentTool,
    currentColor,
    currentWidth,
    state,
    isAIEnabled,
    setTool,
    setColor,
    setWidth,
    setBackgroundType,
    undo,
    redo,
    clear,
    exportCanvas,
    toggleAI,

  } = useWhiteboard();

  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showBackgroundOptions, setShowBackgroundOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const colors = [
    '#000000', '#ADD8E6', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#ffc0cb', '#a52a2a', '#808080', '#000080', '#008000'
  ];

  const brushSizes = [1, 2, 4, 8, 12, 16, 24];

  const tools: { id: DrawingTool; icon: React.ReactNode; label: string }[] = [
    { id: 'pen', icon: <Pen size={20} />, label: 'Pen' },
    { id: 'highlighter', icon: <Highlighter size={20} />, label: 'Highlighter' },
    { id: 'eraser', icon: <Eraser size={20} />, label: 'Eraser' }
  ];

  const backgroundTypes: { id: BackgroundType; label: string }[] = [
   
  ];

  const handleExport = (format: 'png' | 'jpeg' | 'pdf') => {
    exportCanvas(format);
    setShowExportOptions(false);
  };



  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left Section - Drawing Tools */}
          <div className="flex items-center space-x-6">
            {/* Drawing Tools */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Tools:</span>
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setTool(tool.id)}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    currentTool === tool.id
                      ? 'bg-blue-100 border-2 border-blue-500 text-blue-700 shadow-md'
                      : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                  title={tool.label}
                >
                  {tool.icon}
                </button>
              ))}
            </div>

            {/* Color Palette */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Color:</span>
              <div className="flex items-center space-x-1">
                {colors.slice(0, 8).map((color) => (
                  <button
                    key={color}
                    onClick={() => setColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      currentColor === color
                        ? 'border-gray-800 scale-110 shadow-lg'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <div className="relative">
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                    title="Custom color"
                  />
                </div>
              </div>
            </div>

            {/* Brush Size */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Size:</span>
              <div className="flex items-center space-x-1">
                {brushSizes.slice(0, 6).map((size) => (
                  <button
                    key={size}
                    onClick={() => setWidth(size)}
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                      currentWidth === size
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    title={`Size ${size}px`}
                  >
                    <div
                      className="rounded-full bg-gray-800"
                      style={{
                        width: `${Math.min(size * 2, 16)}px`,
                        height: `${Math.min(size * 2, 16)}px`
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Actions and Features */}
          <div className="flex items-center space-x-4">
            {/* AI Features */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleAI}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isAIEnabled
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="AI Assistant"
              >
                <Brain size={20} />
              </button>

              

            </div>

            {/* Background Options */}
            <div className="relative">
              
              
              {showBackgroundOptions && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                  {backgroundTypes.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => {
                        setBackgroundType(bg.id);
                        setShowBackgroundOptions(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Templates */}
          
            {/* History Actions */}
            <div className="flex items-center space-x-1 border-l border-gray-200 pl-4">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  canUndo
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title="Undo"
              >
                <Undo2 size={20} />
              </button>
              
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  canRedo
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title="Redo"
              >
                <Redo2 size={20} />
              </button>

            

              <button
                onClick={clear}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Clear canvas"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Export */}
            <div className="relative">
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                title="Export"
              >
                <Download size={20} />
              </button>
              
              {showExportOptions && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleExport('png')}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                  >
                    Export as PNG
                  </button>
                  <button
                    onClick={() => handleExport('jpeg')}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Export as JPEG
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg"
                  >
                    Export as PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TemplateGallery 
        isOpen={showTemplateGallery} 
        onClose={() => setShowTemplateGallery(false)} 
      />
    </>
  );
};

export default EnhancedToolbar;