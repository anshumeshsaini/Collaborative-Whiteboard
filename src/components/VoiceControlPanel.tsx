import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, ChevronDown, ChevronUp,
  AlertCircle, Check, HelpCircle
} from 'lucide-react';
import { useWhiteboard } from '../contexts/WhiteboardContext';
import { voiceService } from '../services/voiceService';
import { VoiceRecognitionState } from '../types';

const VoiceControlPanel: React.FC = () => {
  const { isVoiceEnabled, toggleVoice } = useWhiteboard();
  const [voiceState, setVoiceState] = useState<VoiceRecognitionState>({
    isListening: false,
    transcript: '',
    confidence: 0,
    lastCommand: null,
    error: null
  });
  const [showTranscript, setShowTranscript] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleVoiceStateUpdate = (state: VoiceRecognitionState) => {
      setVoiceState(prev => ({ ...prev, ...state }));
      
      // Auto-show transcript when receiving commands
      if (state.lastCommand) {
        setShowTranscript(true);
      }
    };

    voiceService.addListener(handleVoiceStateUpdate);
    return () => {
      voiceService.removeListener(handleVoiceStateUpdate);
    };
  }, []);

  const handleToggleVoice = () => {
    toggleVoice();
    if (!isVoiceEnabled) {
      setShowTranscript(true);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'bg-green-500';
    if (confidence > 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = () => {
    if (voiceState.error) return 'bg-red-500';
    if (voiceState.isListening) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const voiceCommands = [
    { command: "Undo", description: "Undo last action" },
    { command: "Redo", description: "Redo last action" },
    { command: "Clear all", description: "Clear the canvas" },
    { command: "Use [tool]", description: "Switch tool (pen, eraser, highlighter)" },
    { command: "Change to [color]", description: "Change brush color (red, blue, etc.)" },
    { command: "Size [number]", description: "Set brush size (1-50)" },
    { command: "Export as [format]", description: "Export canvas (PNG, JPEG, SVG)" },
    { command: "Start/Stop listening", description: "Toggle voice control" }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-80"
      >
        {/* Main Control */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleVoice}
                className={`p-3 rounded-xl transition-all duration-200 relative ${
                  isVoiceEnabled
                    ? voiceState.isListening
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
                aria-label={isVoiceEnabled ? "Disable voice control" : "Enable voice control"}
              >
                {isVoiceEnabled ? (
                  voiceState.isListening ? (
                    <Mic className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )
                ) : (
                  <MicOff className="w-6 h-6" />
                )}
                
                {/* Status indicator */}
                <motion.span
                  animate={{ 
                    scale: isHovered || voiceState.isListening ? 1.2 : 1,
                    opacity: isVoiceEnabled ? 1 : 0.5
                  }}
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor()}`}
                />
              </motion.button>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Voice Control
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowHelp(!showHelp)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      aria-label="Help"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      aria-label={showTranscript ? "Hide transcript" : "Show transcript"}
                    >
                      {showTranscript ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {voiceState.error 
                      ? "Error: " + voiceState.error
                      : voiceState.isListening 
                        ? "Listening..." 
                        : isVoiceEnabled 
                          ? "Ready" 
                          : "Disabled"}
                  </span>
                  
                  {voiceState.confidence > 0 && (
                    <div className="flex items-center">
                      <div 
                        className={`w-2 h-2 rounded-full mr-1 ${getConfidenceColor(voiceState.confidence)}`}
                      />
                      <span className="text-xs text-gray-500">
                        {Math.round(voiceState.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Panel */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 overflow-hidden"
            >
              <div className="p-4 bg-blue-50">
                <h4 className="text-sm font-medium text-blue-700 mb-3 flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Available Voice Commands
                </h4>
                <div className="space-y-2">
                  {voiceCommands.map((cmd, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start"
                    >
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mt-0.5">
                        {cmd.command}
                      </div>
                      <span className="text-xs text-gray-600 flex-1">
                        {cmd.description}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transcript Panel */}
        <AnimatePresence>
          {(showTranscript || voiceState.lastCommand) && isVoiceEnabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100"
            >
              <div className="p-4 bg-gray-50 space-y-3">
                {voiceState.transcript && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-xs font-medium text-gray-600">
                        Current Transcript
                      </h5>
                      <div className={`w-2 h-2 rounded-full ${getConfidenceColor(voiceState.confidence)}`} />
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-2 bg-white rounded border text-sm text-gray-700"
                    >
                      {voiceState.transcript}
                    </motion.div>
                  </div>
                )}

                {voiceState.lastCommand && (
                  <div>
                    <h5 className="text-xs font-medium text-gray-600 mb-1 flex items-center">
                      {voiceState.error ? (
                        <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                      ) : (
                        <Check className="w-4 h-4 text-green-500 mr-1" />
                      )}
                      Last Command
                    </h5>
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-2 rounded text-sm ${
                        voiceState.error
                          ? 'bg-red-50 border border-red-200 text-red-700'
                          : 'bg-green-50 border border-green-200 text-green-700'
                      }`}
                    >
                      {voiceState.error || voiceState.lastCommand}
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VoiceControlPanel;