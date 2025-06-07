import React, { useState } from 'react';
import { 
  Pen, Eraser, Highlighter, Undo2, Redo2, 
  Trash2, Download, Palette, Settings, 
  Minus, Plus, Image, Copy
} from 'lucide-react';
import { useWhiteboard } from '../contexts/WhiteboardContext';
import { DrawingTool } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Toolbar: React.FC = () => {
  const {
    currentTool,
    currentColor,
    currentWidth,
    setTool,
    setColor,
    setWidth,
    undo,
    redo,
    clear,
    exportCanvas,
    copyCanvasToClipboard,
    state
  } = useWhiteboard();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const colors = [
    '#000000', '#ffffff', '#ef4444', '#10b981', '#3b82f6',
    '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#7c3aed',
    '#ec4899', '#64748b', '#1e40af', '#065f46', '#9f1239'
  ];

  const brushSizes = [2, 4, 6, 8, 12, 16, 24, 32];

  const tools = [
    { id: 'pen', icon: <Pen size={20} />, label: 'Pen' },
    { id: 'highlighter', icon: <Highlighter size={20} />, label: 'Highlighter' },
    { id: 'eraser', icon: <Eraser size={20} />, label: 'Eraser' }
  ];

  const handleExport = (format: 'png' | 'jpeg' | 'svg') => {
    exportCanvas(format);
    setShowExportMenu(false);
  };

  const handleCopyToClipboard = () => {
    copyCanvasToClipboard();
    setShowExportMenu(false);
  };

  const handleWidthChange = (change: number) => {
    const newWidth = Math.max(1, Math.min(50, currentWidth + change));
    setWidth(newWidth);
  };

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Section - Drawing Tools */}
        <div className="flex items-center space-x-4">
          {/* Tools */}
          <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-lg">
            {tools.map((tool) => (
              <motion.button
                key={tool.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTool(tool.id)}
                className={`p-2 rounded-md transition-colors ${
                  currentTool === tool.id
                    ? 'bg-white shadow-md text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={tool.label}
              >
                {tool.icon}
              </motion.button>
            ))}
          </div>

          {/* Color Picker */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1 rounded-md border-2 border-gray-200"
              style={{ backgroundColor: currentColor }}
              title="Select color"
            >
              <Palette 
                size={20} 
                className={currentColor === '#ffffff' ? 'text-gray-800' : 'text-white'} 
              />
            </motion.button>

            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {colors.map((color) => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setColor(color);
                          setShowColorPicker(false);
                        }}
                        className={`w-6 h-6 rounded-full border-2 ${
                          currentColor === color
                            ? 'border-gray-800 scale-110'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer mr-2"
                      title="Custom color"
                    />
                    <span className="text-xs text-gray-600">
                      {currentColor}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Brush Size */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleWidthChange(-1)}
              disabled={currentWidth <= 1}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Decrease size"
            >
              <Minus size={16} />
            </button>
            
            <div className="relative flex items-center justify-center w-10 h-10">
              <div 
                className="rounded-full bg-current"
                style={{
                  width: `${Math.min(currentWidth * 1.5, 32)}px`,
                  height: `${Math.min(currentWidth * 1.5, 32)}px`
                }}
              />
              <span className="absolute text-xs font-medium text-gray-600">
                {currentWidth}px
              </span>
            </div>
            
            <button
              onClick={() => handleWidthChange(1)}
              disabled={currentWidth >= 50}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Increase size"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
          {/* Undo/Redo */}
          <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-lg">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={undo}
              disabled={!canUndo}
              className={`p-2 rounded-md ${
                canUndo
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title="Undo"
            >
              <Undo2 size={20} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={redo}
              disabled={!canRedo}
              className={`p-2 rounded-md ${
                canRedo
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title="Redo"
            >
              <Redo2 size={20} />
            </motion.button>
          </div>

          {/* Clear */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clear}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
            title="Clear canvas"
          >
            <Trash2 size={20} />
          </motion.button>

          {/* Export */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              title="Export options"
            >
              <Download size={20} />
            </motion.button>

            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Copy size={16} className="mr-2" />
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={() => handleExport('png')}
                    className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Image size={16} className="mr-2" />
                    Export as PNG
                  </button>
                  <button
                    onClick={() => handleExport('jpeg')}
                    className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Image size={16} className="mr-2" />
                    Export as JPEG
                  </button>
                  <button
                    onClick={() => handleExport('svg')}
                    className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                  >
                    <Image size={16} className="mr-2" />
                    Export as SVG
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-md ${
              showSettings ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Settings"
          >
            <Settings size={20} />
          </motion.button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Canvas Settings
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center text-sm text-gray-600">
                    <input 
                      type="checkbox" 
                      className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                    />
                    Show Grid
                  </label>
                  <label className="flex items-center text-sm text-gray-600">
                    <input 
                      type="checkbox" 
                      className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                    />
                    Dark Mode
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Toolbar;