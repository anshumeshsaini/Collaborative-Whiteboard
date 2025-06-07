import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { 
  WhiteboardState, 
  WhiteboardContextType, 
  DrawingStroke, 
  Cursor, 
  DrawingTool, 
  BackgroundType,
  AISuggestion,
  Reaction,
  VersionSnapshot
} from '../types';
import { aiService } from '../services/aiService';
import { voiceService } from '../services/voiceService';
import { templateService } from '../services/templateService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const initialState: WhiteboardState = {
  strokes: [],
  cursors: [],
  history: [[]],
  historyIndex: 0,
  templates: [],
  reactions: [],
  votes: [],
  backgroundType: 'plain',
  aiSuggestions: []
};

const WhiteboardContext = createContext<WhiteboardContextType | undefined>(undefined);

interface WhiteboardProviderProps {
  children: ReactNode;
}

export const WhiteboardProvider: React.FC<WhiteboardProviderProps> = ({ children }) => {
  const [state, setState] = useState<WhiteboardState>(initialState);
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const [currentWidth, setCurrentWidth] = useState<number>(2);
  const [isAIEnabled, setIsAIEnabled] = useState<boolean>(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(false);
  const [isTeachingMode, setIsTeachingMode] = useState<boolean>(false);
  const [followingUser, setFollowingUser] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);

  // Initialize services
  useEffect(() => {
    aiService.initialize();
    voiceService.initialize().then(success => {
      if (!success) {
        console.warn('Voice recognition not available');
      }
    });
  }, []);

  // Voice command listener
  useEffect(() => {
    const handleVoiceCommand = (event: CustomEvent) => {
      const { command, transcript } = event.detail;
      processVoiceCommand(transcript);
    };

    window.addEventListener('voiceCommand', handleVoiceCommand as EventListener);
    return () => {
      window.removeEventListener('voiceCommand', handleVoiceCommand as EventListener);
    };
  }, []);

  const setTool = useCallback((tool: DrawingTool) => {
    setCurrentTool(tool);
  }, []);

  const setColor = useCallback((color: string) => {
    setCurrentColor(color);
  }, []);

  const setWidth = useCallback((width: number) => {
    setCurrentWidth(width);
  }, []);

  const setBackgroundType = useCallback((type: BackgroundType) => {
    setState(prevState => ({
      ...prevState,
      backgroundType: type
    }));
  }, []);

  const addStroke = useCallback(async (stroke: DrawingStroke) => {
    setState(prevState => {
      const newStrokes = [...prevState.strokes, stroke];
      const newHistory = prevState.history.slice(0, prevState.historyIndex + 1);
      newHistory.push(newStrokes);
      
      return {
        ...prevState,
        strokes: newStrokes,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });

    // Generate AI suggestions if enabled
    if (isAIEnabled) {
      try {
        const suggestions = await aiService.generateSuggestions([stroke]);
        if (suggestions.length > 0) {
          setState(prevState => ({
            ...prevState,
            aiSuggestions: [...prevState.aiSuggestions, ...suggestions]
          }));
        }
      } catch (error) {
        console.error('Failed to generate AI suggestions:', error);
      }
    }
  }, [isAIEnabled]);

  const updateCursor = useCallback((cursor: Cursor) => {
    setState(prevState => {
      const existingCursorIndex = prevState.cursors.findIndex(c => c.userId === cursor.userId);
      let newCursors;
      
      if (existingCursorIndex >= 0) {
        newCursors = [...prevState.cursors];
        newCursors[existingCursorIndex] = cursor;
      } else {
        newCursors = [...prevState.cursors, cursor];
      }
      
      return {
        ...prevState,
        cursors: newCursors
      };
    });
  }, []);

  const addReaction = useCallback((reaction: Omit<Reaction, 'id' | 'timestamp'>) => {
    const newReaction: Reaction = {
      ...reaction,
      id: `reaction_${Date.now()}`,
      timestamp: Date.now()
    };

    setState(prevState => ({
      ...prevState,
      reactions: [...prevState.reactions, newReaction]
    }));

    // Remove reaction after 3 seconds
    setTimeout(() => {
      setState(prevState => ({
        ...prevState,
        reactions: prevState.reactions.filter(r => r.id !== newReaction.id)
      }));
    }, 3000);
  }, []);

  const createVote = useCallback((question: string, options: string[]) => {
    const newVote = {
      id: `vote_${Date.now()}`,
      question,
      options: options.map(option => ({
        id: `option_${Date.now()}_${Math.random()}`,
        text: option,
        votes: []
      })),
      createdBy: 'current_user', // Replace with actual user ID
      timestamp: Date.now(),
      isActive: true
    };

    setState(prevState => ({
      ...prevState,
      votes: [...prevState.votes, newVote]
    }));
  }, []);

  const castVote = useCallback((voteId: string, optionId: string) => {
    setState(prevState => ({
      ...prevState,
      votes: prevState.votes.map(vote => {
        if (vote.id === voteId) {
          return {
            ...vote,
            options: vote.options.map(option => {
              if (option.id === optionId) {
                return {
                  ...option,
                  votes: [...option.votes, 'current_user'] // Replace with actual user ID
                };
              }
              return option;
            })
          };
        }
        return vote;
      })
    }));
  }, []);

  const undo = useCallback(() => {
    setState(prevState => {
      if (prevState.historyIndex > 0) {
        const newIndex = prevState.historyIndex - 1;
        return {
          ...prevState,
          strokes: prevState.history[newIndex],
          historyIndex: newIndex
        };
      }
      return prevState;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prevState => {
      if (prevState.historyIndex < prevState.history.length - 1) {
        const newIndex = prevState.historyIndex + 1;
        return {
          ...prevState,
          strokes: prevState.history[newIndex],
          historyIndex: newIndex
        };
      }
      return prevState;
    });
  }, []);

  const clear = useCallback(() => {
    setState(prevState => {
      const newHistory = [...prevState.history, []];
      return {
        ...prevState,
        strokes: [],
        history: newHistory,
        historyIndex: newHistory.length - 1,
        aiSuggestions: []
      };
    });
  }, []);

  const exportCanvas = useCallback(async (format: 'png' | 'jpeg' | 'pdf') => {
    try {
      const canvasContainer = document.querySelector('.konvajs-content canvas') as HTMLCanvasElement;
      if (!canvasContainer) {
        console.error('Canvas not found');
        return;
      }

      if (format === 'pdf') {
        const pdf = new jsPDF();
        const dataUrl = canvasContainer.toDataURL('image/png');
        pdf.addImage(dataUrl, 'PNG', 10, 10, 190, 0);
        pdf.save('whiteboard.pdf');
      } else {
        const dataUrl = canvasContainer.toDataURL(`image/${format}`);
        const link = document.createElement('a');
        link.download = `whiteboard.${format}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, []);

  const createSnapshot = useCallback((description: string) => {
    const snapshot: VersionSnapshot = {
      id: `snapshot_${Date.now()}`,
      timestamp: Date.now(),
      strokes: [...state.strokes],
      description,
      createdBy: 'current_user' // Replace with actual user ID
    };

    setSnapshots(prev => [...prev, snapshot]);
  }, [state.strokes]);

  const loadSnapshot = useCallback((snapshotId: string) => {
    const snapshot = snapshots.find(s => s.id === snapshotId);
    if (snapshot) {
      setState(prevState => {
        const newHistory = [...prevState.history, snapshot.strokes];
        return {
          ...prevState,
          strokes: snapshot.strokes,
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      });
    }
  }, [snapshots]);

  const toggleAI = useCallback(() => {
    setIsAIEnabled(prev => !prev);
  }, []);

  const toggleVoice = useCallback(() => {
    setIsVoiceEnabled(prev => {
      const newValue = !prev;
      if (newValue) {
        voiceService.startListening();
      } else {
        voiceService.stopListening();
      }
      return newValue;
    });
  }, []);

  const toggleTeachingMode = useCallback(() => {
    setIsTeachingMode(prev => !prev);
  }, []);

  const followUser = useCallback((userId: string | null) => {
    setFollowingUser(userId);
  }, []);

  const processVoiceCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('undo')) {
      undo();
    } else if (lowerCommand.includes('redo')) {
      redo();
    } else if (lowerCommand.includes('clear')) {
      clear();
    } else if (lowerCommand.includes('export') || lowerCommand.includes('save')) {
      exportCanvas('png');
    } else if (lowerCommand.includes('pen') || lowerCommand.includes('brush')) {
      setTool('pen');
    } else if (lowerCommand.includes('eraser')) {
      setTool('eraser');
    } else if (lowerCommand.includes('highlighter')) {
      setTool('highlighter');
    } else {
      // Check for color commands
      const color = voiceService.getColorFromTranscript(lowerCommand);
      if (color) {
        setColor(color);
      }
    }
  }, [undo, redo, clear, exportCanvas, setTool, setColor]);

  const getAISuggestions = useCallback(async (strokes: DrawingStroke[]): Promise<AISuggestion[]> => {
    if (!isAIEnabled) return [];
    return await aiService.generateSuggestions(strokes);
  }, [isAIEnabled]);

  const applyAISuggestion = useCallback((suggestionId: string) => {
    setState(prevState => {
      const suggestion = prevState.aiSuggestions.find(s => s.id === suggestionId);
      if (!suggestion || !suggestion.targetStrokeId || !suggestion.proposedChanges) {
        return prevState;
      }

      const updatedStrokes = prevState.strokes.map(stroke => {
        if (stroke.id === suggestion.targetStrokeId) {
          return { ...stroke, ...suggestion.proposedChanges, isAIGenerated: true };
        }
        return stroke;
      });

      const newHistory = [...prevState.history, updatedStrokes];

      return {
        ...prevState,
        strokes: updatedStrokes,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        aiSuggestions: prevState.aiSuggestions.filter(s => s.id !== suggestionId)
      };
    });
  }, []);

  const loadTemplate = useCallback((templateId: string) => {
    const template = templateService.getTemplate(templateId);
    if (!template) return;

    // Convert template elements to strokes
    const templateStrokes: DrawingStroke[] = template.elements.map((element, index) => ({
      id: `template_${templateId}_${index}`,
      points: [
        { x: element.x, y: element.y },
        { x: element.x + (element.width || 100), y: element.y + (element.height || 50) }
      ],
      color: element.properties.stroke || '#000000',
      width: element.properties.strokeWidth || 2,
      tool: 'pen',
      timestamp: Date.now(),
      userId: 'template'
    }));

    setState(prevState => {
      const newStrokes = [...prevState.strokes, ...templateStrokes];
      const newHistory = [...prevState.history, newStrokes];
      
      return {
        ...prevState,
        strokes: newStrokes,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });

    templateService.incrementUsage(templateId);
  }, []);

  const saveAsTemplate = useCallback((name: string, category: any) => {
    if (state.strokes.length === 0) return;

    const elements = state.strokes.map(stroke => ({
      type: 'line' as const,
      x: Math.min(...stroke.points.map(p => p.x)),
      y: Math.min(...stroke.points.map(p => p.y)),
      properties: {
        points: stroke.points,
        stroke: stroke.color,
        strokeWidth: stroke.width
      }
    }));

    templateService.saveTemplate({
      name,
      category,
      elements,
      thumbnail: '', // Would generate thumbnail in real implementation
      isPublic: false,
      createdBy: 'current_user' // Replace with actual user ID
    });
  }, [state.strokes]);

  const value: WhiteboardContextType = {
    state,
    currentTool,
    currentColor,
    currentWidth,
    isAIEnabled,
    isVoiceEnabled,
    isTeachingMode,
    followingUser,
    setTool,
    setColor,
    setWidth,
    setBackgroundType,
    addStroke,
    updateCursor,
    addReaction,
    createVote,
    castVote,
    undo,
    redo,
    clear,
    exportCanvas,
    createSnapshot,
    loadSnapshot,
    toggleAI,
    toggleVoice,
    toggleTeachingMode,
    followUser,
    processVoiceCommand,
    getAISuggestions,
    applyAISuggestion,
    loadTemplate,
    saveAsTemplate
  };

  return (
    <WhiteboardContext.Provider value={value}>
      {children}
    </WhiteboardContext.Provider>
  );
};

export const useWhiteboard = (): WhiteboardContextType => {
  const context = useContext(WhiteboardContext);
  if (context === undefined) {
    throw new Error('useWhiteboard must be used within a WhiteboardProvider');
  }
  return context;
};