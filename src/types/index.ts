export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  voiceEnabled: boolean;
  aiAssistEnabled: boolean;
  arModeEnabled: boolean;
  followMode: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

export interface DrawingStroke {
  id: string;
  points: DrawingPoint[];
  color: string;
  width: number;
  tool: DrawingTool;
  timestamp: number;
  userId: string;
  isAIGenerated?: boolean;
  originalStroke?: string; // Reference to original stroke if AI-enhanced
}

export interface Cursor {
  userId: string;
  x: number;
  y: number;
  color: string;
  name: string;
  isFollowing?: boolean;
}

export interface WhiteboardState {
  strokes: DrawingStroke[];
  cursors: Cursor[];
  history: DrawingStroke[][];
  historyIndex: number;
  templates: Template[];
  reactions: Reaction[];
  votes: Vote[];
  backgroundType: BackgroundType;
  aiSuggestions: AISuggestion[];
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  elements: TemplateElement[];
  thumbnail: string;
  isPublic: boolean;
  createdBy: string;
  usage: number;
}

export interface TemplateElement {
  type: 'shape' | 'text' | 'line' | 'group';
  x: number;
  y: number;
  width?: number;
  height?: number;
  properties: Record<string, any>;
}

export interface AISuggestion {
  id: string;
  type: 'shape_recognition' | 'template_suggestion' | 'improvement';
  confidence: number;
  suggestion: string;
  targetStrokeId?: string;
  proposedChanges?: Partial<DrawingStroke>;
  timestamp: number;
}

export interface Reaction {
  id: string;
  userId: string;
  emoji: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface Vote {
  id: string;
  question: string;
  options: VoteOption[];
  createdBy: string;
  timestamp: number;
  isActive: boolean;
}

export interface VoteOption {
  id: string;
  text: string;
  votes: string[]; // user IDs
}

export interface VersionSnapshot {
  id: string;
  timestamp: number;
  strokes: DrawingStroke[];
  description: string;
  createdBy: string;
  parentVersion?: string;
}

export type DrawingTool = 'pen' | 'eraser' | 'highlighter' | 'shape' | 'text' | 'sticky_note';
export type TemplateCategory = 'brainstorming' | 'flowchart' | 'uml' | 'wireframe' | 'timeline' | 'custom';
export type BackgroundType = 'plain' | 'grid' | 'dots' | 'reactive' | 'gradient';
export type VoiceCommand = 'undo' | 'redo' | 'clear' | 'export' | 'change_color' | 'change_tool' | 'zoom';

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

export interface WhiteboardContextType {
  state: WhiteboardState;
  currentTool: DrawingTool;
  currentColor: string;
  currentWidth: number;
  isAIEnabled: boolean;
  isVoiceEnabled: boolean;
  isTeachingMode: boolean;
  followingUser: string | null;
  setTool: (tool: DrawingTool) => void;
  setColor: (color: string) => void;
  setWidth: (width: number) => void;
  setBackgroundType: (type: BackgroundType) => void;
  addStroke: (stroke: DrawingStroke) => void;
  updateCursor: (cursor: Cursor) => void;
  addReaction: (reaction: Omit<Reaction, 'id' | 'timestamp'>) => void;
  createVote: (question: string, options: string[]) => void;
  castVote: (voteId: string, optionId: string) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  exportCanvas: (format: 'png' | 'jpeg' | 'pdf') => void;
  createSnapshot: (description: string) => void;
  loadSnapshot: (snapshotId: string) => void;
  toggleAI: () => void;
  toggleVoice: () => void;
  toggleTeachingMode: () => void;
  followUser: (userId: string | null) => void;
  processVoiceCommand: (command: string) => void;
  getAISuggestions: (strokes: DrawingStroke[]) => Promise<AISuggestion[]>;
  applyAISuggestion: (suggestionId: string) => void;
  loadTemplate: (templateId: string) => void;
  saveAsTemplate: (name: string, category: TemplateCategory) => void;
}

export interface AIShapeRecognition {
  shape: 'circle' | 'rectangle' | 'triangle' | 'arrow' | 'line';
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  confidence: number;
  lastCommand: string | null;
}