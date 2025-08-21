import { VoiceCommand, VoiceRecognitionState } from '../types';

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isInitialized = false;
  private listeners: ((state: VoiceRecognitionState) => void)[] = [];
  private currentState: VoiceRecognitionState = {
    isListening: false,
    transcript: '',
    confidence: 0,
    lastCommand: null
  };

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.updateState({ isListening: true });
    };

    this.recognition.onend = () => {
      this.updateState({ isListening: false });
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          this.processCommand(transcript, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      this.updateState({
        transcript: finalTranscript || interimTranscript,
        confidence: event.results[event.results.length - 1][0].confidence || 0
      });
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.updateState({ isListening: false });
    };

    this.isInitialized = true;
    return true;
  }

  startListening(): void {
    if (this.recognition && !this.currentState.isListening) {
      this.recognition.start();
    }
  }

  stopListening(): void {
    if (this.recognition && this.currentState.isListening) {
      this.recognition.stop();
    }
  }

  addListener(callback: (state: VoiceRecognitionState) => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (state: VoiceRecognitionState) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private updateState(updates: Partial<VoiceRecognitionState>): void {
    this.currentState = { ...this.currentState, ...updates };
    this.listeners.forEach(listener => listener(this.currentState));
  }

  private processCommand(transcript: string, confidence: number): void {
    const command = this.parseCommand(transcript.toLowerCase());
    if (command && confidence > 0.7) {
      this.updateState({ lastCommand: command });
      
      // Dispatch custom event for command processing
      window.dispatchEvent(new CustomEvent('voiceCommand', {
        detail: { command, transcript, confidence }
      }));
    }
  }

  private parseCommand(transcript: string): VoiceCommand | null {
    const commands: Record<string, VoiceCommand> = {
      'undo': 'undo',
      'undo last': 'undo',
      'undo that': 'undo',
      'redo': 'redo',
      'redo last': 'redo',
      'clear': 'clear',
      'clear all': 'clear',
      'clear canvas': 'clear',
      'export': 'export',
      'export canvas': 'export',
      'save': 'export',
      'zoom in': 'zoom',
      'zoom out': 'zoom',
      'pen': 'change_tool',
      'brush': 'change_tool',
      'eraser': 'change_tool',
      'highlighter': 'change_tool',
      'red': 'change_color',
      'blue': 'change_color',
      'green': 'change_color',
      'black': 'change_color',
      'white': 'change_color',
      'yellow': 'change_color'
    };

    for (const [phrase, command] of Object.entries(commands)) {
      if (transcript.includes(phrase)) {
        return command;
      }
    }

    return null;
  }

  getColorFromTranscript(transcript: string): string | null {
    const colorMap: Record<string, string> = {
      'red': '#ff0000',
      'blue': '#0000ff',
      'green': '#00ff00',
      'black': '#000000',
      'white': '#ffffff',
      'yellow': '#ffff00',
      'orange': '#ffa500',
      'purple': '#800080',
      'pink': '#ffc0cb',
      'brown': '#a52a2a',
      'gray': '#808080',
      'grey': '#808080'
    };

    for (const [colorName, colorValue] of Object.entries(colorMap)) {
      if (transcript.includes(colorName)) {
        return colorValue;
      }
    }

    return null;
  }

  getToolFromTranscript(transcript: string): string | null {
    const toolMap: Record<string, string> = {
      'pen': 'pen',
      'brush': 'pen',
      'pencil': 'pen',
      'eraser': 'eraser',
      'highlighter': 'highlighter',
      'marker': 'highlighter'
    };

    for (const [toolName, toolValue] of Object.entries(toolMap)) {
      if (transcript.includes(toolName)) {
        return toolValue;
      }
    }

    return null;
  }
}

export const voiceService = new VoiceService();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}