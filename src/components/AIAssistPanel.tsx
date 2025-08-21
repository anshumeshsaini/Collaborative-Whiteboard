import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
 
  Lightbulb, 
  CheckCircle,  
  Sparkles,
  Zap,
  ChevronRight,
  ChevronLeft,
  Settings,
  Wand2,
  Shapes,
  Rocket,
} from 'lucide-react';
import { useWhiteboard } from '../contexts/WhiteboardContext';
import { AISuggestion } from '../types';
import Button from './Ai'

const AIAssistPanel: React.FC = () => {
  const { 
    state, 
    isAIEnabled, 
    toggleAI, 
    applyAISuggestion,
    getAISuggestions 
  } = useWhiteboard();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [processingStrokes, setProcessingStrokes] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'settings'>('suggestions');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [lastProcessedStrokeId, setLastProcessedStrokeId] = useState<string | null>(null);

  useEffect(() => {
    if (isAIEnabled && state.strokes.length > 0) {
      const lastStroke = state.strokes[state.strokes.length - 1];
      
      // Only process if it's a new, non-AI stroke
      if (!lastStroke.isAIGenerated && lastStroke.id !== lastProcessedStrokeId) {
        setProcessingStrokes(true);
        setAiProcessing(true);
        setLastProcessedStrokeId(lastStroke.id);
        
        getAISuggestions([lastStroke])
          .finally(() => {
            setProcessingStrokes(false);
            setTimeout(() => setAiProcessing(false), 500); // Smooth out the animation
          });
      }
    }
  }, [state.strokes, isAIEnabled, getAISuggestions, lastProcessedStrokeId]);

  const handleApplySuggestion = (suggestionId: string) => {
    applyAISuggestion(suggestionId);
    // Show feedback animation
    setAiProcessing(true);
    setTimeout(() => setAiProcessing(false), 300);
  };

  const getSuggestionIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'shape_recognition':
        return <Shapes className="w-4 h-4" />;
      case 'template_suggestion':
        return <Wand2 className="w-4 h-4" />;
      case 'improvement':
        return <Rocket className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getSuggestionColor = (type: AISuggestion['type']) => {
    switch (type) {
      case 'shape_recognition':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-600',
          border: 'border-purple-200',
          button: 'hover:bg-purple-100'
        };
      case 'template_suggestion':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          border: 'border-blue-200',
          button: 'hover:bg-blue-100'
        };
      case 'improvement':
        return {
          bg: 'bg-green-50',
          text: 'text-green-600',
          border: 'border-green-200',
          button: 'hover:bg-green-100'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-600',
          border: 'border-gray-200',
          button: 'hover:bg-gray-100'
        };
    }
  };

  const getSuggestionTypeLabel = (type: AISuggestion['type']) => {
    switch (type) {
      case 'shape_recognition':
        return 'Shape Detected';
      case 'template_suggestion':
        return 'Template Match';
      case 'improvement':
        return 'Enhancement';
      default:
        return 'Suggestion';
    }
  };

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden backdrop-blur-sm bg-opacity-90"
        style={{ width: isExpanded ? '360px' : '60px' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-xl transition-all duration-300 ${
                isAIEnabled 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600'
              } relative`}
            >
              <Button  />
              {aiProcessing && (
                <motion.span 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>
            
            {isExpanded && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-semibold text-gray-800">AI Assistant</h2>
                  {processingStrokes && (
                    <motion.div 
                      className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('suggestions')}
                    className={`p-1 rounded-md transition-colors ${activeTab === 'suggestions' ? 'bg-gray-100 text-purple-600' : 'text-gray-500'}`}
                  >
                    <Lightbulb className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`p-1 rounded-md transition-colors ${activeTab === 'settings' ? 'bg-gray-100 text-purple-600' : 'text-gray-500'}`}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleAI}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex items-center px-1 ${
                    isAIEnabled ? 'bg-purple-500 justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <motion.div
                    layout
                    className={`w-4 h-4 bg-white rounded-full shadow-sm`}
                  />
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              key="panel-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="max-h-[500px] overflow-y-auto">
                {activeTab === 'suggestions' ? (
                  <div className="p-4">
                    {!isAIEnabled ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8"
                      >
                        <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-gray-700 mb-1">
                          AI Assistant Paused
                        </h3>
                        <p className="text-xs text-gray-500 max-w-[240px] mx-auto">
                          Enable AI to get real-time suggestions as you draw
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={toggleAI}
                          className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium rounded-lg shadow-sm"
                        >
                          Activate AI
                        </motion.button>
                      </motion.div>
                    ) : state.aiSuggestions.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8"
                      >
                        <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-gray-700 mb-1">
                          No Suggestions Yet
                        </h3>
                        <p className="text-xs text-gray-500 max-w-[240px] mx-auto">
                          {processingStrokes 
                            ? "Analyzing your drawing..." 
                            : "Start drawing to see AI-powered suggestions"}
                        </p>
                      </motion.div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-800">
                            Smart Suggestions
                          </h3>
                          <span className="text-xs text-gray-500">
                            {state.aiSuggestions.length} found
                          </span>
                        </div>
                        
                        {state.aiSuggestions.map((suggestion) => {
                          const colors = getSuggestionColor(suggestion.type);
                          return (
                            <motion.div
                              key={suggestion.id}
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              whileHover={{ y: -2 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className={`p-3 rounded-lg border ${colors.bg} ${colors.border} transition-all duration-200`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className={`p-1 rounded-md ${colors.bg}`}>
                                    {getSuggestionIcon(suggestion.type)}
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium ${colors.text}">
                                      {getSuggestionTypeLabel(suggestion.type)}
                                    </span>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                      <div 
                                        className={`h-1.5 rounded-full ${colors.bg.replace('50', '400')}`}
                                        style={{ width: `${Math.round(suggestion.confidence * 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleApplySuggestion(suggestion.id)}
                                  className={`p-1.5 rounded-md ${colors.button} transition-colors`}
                                  title="Apply suggestion"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </motion.button>
                              </div>
                              <p className="text-sm text-gray-800 mt-2">
                                {suggestion.suggestion}
                              </p>
                             
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4">AI Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span className="text-sm text-gray-700">AI Assistance</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={toggleAI}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex items-center px-1 ${
                            isAIEnabled ? 'bg-purple-500 justify-end' : 'bg-gray-300 justify-start'
                          }`}
                        >
                          <motion.div
                            layout
                            className={`w-4 h-4 bg-white rounded-full shadow-sm`}
                          />
                        </motion.button>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">Suggestion Types</label>
                        <div className="space-y-2">
                          {['shape_recognition', 'template_suggestion', 'improvement'].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <input 
                                type="checkbox" 
                                id={`type-${type}`}
                                defaultChecked
                                className="rounded text-purple-500 focus:ring-purple-500"
                              />
                              <label htmlFor={`type-${type}`} className="text-xs text-gray-700 capitalize">
                                {type.split('_').join(' ')}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium rounded-lg shadow-sm"
                        >
                          Save Preferences
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {isExpanded && (
          <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">Powered by</span>
              <span className="text-xs font-medium text-purple-600">AI Whiteboard</span>
            </div>
            <motion.button
              whileHover={{ x: -2 }}
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Collapse panel"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </motion.div>
      
      {/* Collapsed state indicator */}
      {!isExpanded && (
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => setIsExpanded(true)}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 bg-white p-1 rounded-full shadow-sm border border-gray-200 text-gray-500 hover:text-purple-500 transition-colors"
          title="Expand AI panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );
};

export default AIAssistPanel;