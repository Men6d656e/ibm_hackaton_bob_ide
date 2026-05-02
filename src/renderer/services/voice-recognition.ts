/**
 * Voice Recognition Service
 *
 * Implements wake word detection and continuous voice recognition using Web Speech API.
 * Provides real-time voice command processing with configurable wake words.
 *
 * @module renderer/services/voice-recognition
 */

/// <reference path="../types/speech-recognition.d.ts" />

import { getAudioService } from './audio-service';

/**
 * Voice recognition options
 */
export interface VoiceRecognitionOptions {
  /** Wake word to listen for (default: "ollama") */
  wakeWord?: string;
  
  /** Language code (default: "en-US") */
  language?: string;
  
  /** Enable continuous recognition */
  continuous?: boolean;
  
  /** Enable interim results */
  interimResults?: boolean;
  
  /** Maximum number of alternative results */
  maxAlternatives?: number;
  
  /** Confidence threshold (0.0 to 1.0) */
  confidenceThreshold?: number;
  
  /** Timeout for command after wake word (ms) */
  commandTimeout?: number;
}

/**
 * Voice recognition result
 */
export interface VoiceRecognitionResult {
  /** Recognized transcript */
  transcript: string;
  
  /** Confidence score (0.0 to 1.0) */
  confidence: number;
  
  /** Whether this is a final result */
  isFinal: boolean;
  
  /** Timestamp */
  timestamp: Date;
  
  /** Alternative transcripts */
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

/**
 * Wake word detection result
 */
export interface WakeWordResult {
  /** Whether wake word was detected */
  detected: boolean;
  
  /** Full transcript including wake word */
  transcript: string;
  
  /** Confidence score */
  confidence: number;
  
  /** Timestamp */
  timestamp: Date;
}

/**
 * Voice recognition event handlers
 */
export interface VoiceRecognitionHandlers {
  /** Called when wake word is detected */
  onWakeWord?: (result: WakeWordResult) => void;
  
  /** Called when voice command is recognized */
  onCommand?: (result: VoiceRecognitionResult) => void;
  
  /** Called for interim results */
  onInterim?: (result: VoiceRecognitionResult) => void;
  
  /** Called when recognition starts */
  onStart?: () => void;
  
  /** Called when recognition ends */
  onEnd?: () => void;
  
  /** Called on recognition error */
  onError?: (error: Error) => void;
  
  /** Called when no speech is detected */
  onNoSpeech?: () => void;
  
  /** Called when audio starts */
  onAudioStart?: () => void;
  
  /** Called when audio ends */
  onAudioEnd?: () => void;
}

/**
 * Voice recognition service class
 */
export class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private isWaitingForCommand: boolean = false;
  private commandTimeoutId: number | null = null;
  private options: Required<VoiceRecognitionOptions>;
  private handlers: VoiceRecognitionHandlers = {};
  private audioService = getAudioService();

  constructor(options: VoiceRecognitionOptions = {}) {
    this.options = {
      wakeWord: options.wakeWord || 'ollama',
      language: options.language || 'en-US',
      continuous: options.continuous !== false,
      interimResults: options.interimResults !== false,
      maxAlternatives: options.maxAlternatives || 3,
      confidenceThreshold: options.confidenceThreshold || 0.7,
      commandTimeout: options.commandTimeout || 10000,
    };

    this.initializeRecognition();
  }

  /**
   * Initialize Web Speech API recognition
   */
  private initializeRecognition(): void {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Web Speech API is not supported in this browser');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.options.language;
    this.recognition.continuous = this.options.continuous;
    this.recognition.interimResults = this.options.interimResults;
    this.recognition.maxAlternatives = this.options.maxAlternatives;

    this.setupEventHandlers();
  }

  /**
   * Setup recognition event handlers
   */
  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.handlers.onStart) {
        this.handlers.onStart();
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      
      // Restart if continuous mode and not waiting for command
      if (this.options.continuous && !this.isWaitingForCommand) {
        this.startListening();
      }
      
      if (this.handlers.onEnd) {
        this.handlers.onEnd();
      }
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.handleRecognitionResult(event);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const error = new Error(`Speech recognition error: ${event.error}`);
      
      if (this.handlers.onError) {
        this.handlers.onError(error);
      }

      // Handle specific errors
      if (event.error === 'no-speech' && this.handlers.onNoSpeech) {
        this.handlers.onNoSpeech();
      }

      // Restart on certain errors
      if (event.error === 'network' || event.error === 'aborted') {
        setTimeout(() => this.startListening(), 1000);
      }
    };

    this.recognition.onaudiostart = () => {
      if (this.handlers.onAudioStart) {
        this.handlers.onAudioStart();
      }
    };

    this.recognition.onaudioend = () => {
      if (this.handlers.onAudioEnd) {
        this.handlers.onAudioEnd();
      }
    };

    this.recognition.onnomatch = () => {
      console.log('No speech match found');
    };
  }

  /**
   * Handle recognition result
   */
  private handleRecognitionResult(event: SpeechRecognitionEvent): void {
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript.trim().toLowerCase();
    const confidence = result[0].confidence;
    const isFinal = result.isFinal;

    // Build alternatives array
    const alternatives = Array.from(result).map((alt: SpeechRecognitionAlternative) => ({
      transcript: alt.transcript.trim(),
      confidence: alt.confidence,
    }));

    const recognitionResult: VoiceRecognitionResult = {
      transcript: result[0].transcript.trim(),
      confidence,
      isFinal,
      timestamp: new Date(),
      alternatives,
    };

    // Check if we're waiting for a command after wake word
    if (this.isWaitingForCommand) {
      if (isFinal && confidence >= this.options.confidenceThreshold) {
        this.clearCommandTimeout();
        this.isWaitingForCommand = false;
        
        if (this.handlers.onCommand) {
          this.handlers.onCommand(recognitionResult);
        }
      } else if (!isFinal && this.handlers.onInterim) {
        this.handlers.onInterim(recognitionResult);
      }
      return;
    }

    // Check for wake word
    if (this.detectWakeWord(transcript)) {
      const wakeWordResult: WakeWordResult = {
        detected: true,
        transcript: result[0].transcript.trim(),
        confidence,
        timestamp: new Date(),
      };

      this.isWaitingForCommand = true;
      this.startCommandTimeout();

      if (this.handlers.onWakeWord) {
        this.handlers.onWakeWord(wakeWordResult);
      }
    } else if (!isFinal && this.handlers.onInterim) {
      // Pass interim results even when not waiting for command
      this.handlers.onInterim(recognitionResult);
    }
  }

  /**
   * Detect wake word in transcript
   */
  private detectWakeWord(transcript: string): boolean {
    const wakeWord = this.options.wakeWord.toLowerCase();
    const words = transcript.split(/\s+/);
    
    // Check if wake word appears in the transcript
    return words.some(word => {
      // Exact match
      if (word === wakeWord) return true;
      
      // Fuzzy match (allow for slight variations)
      const similarity = this.calculateSimilarity(word, wakeWord);
      return similarity > 0.8;
    });
  }

  /**
   * Calculate string similarity (Levenshtein distance based)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Start command timeout
   */
  private startCommandTimeout(): void {
    this.clearCommandTimeout();
    
    this.commandTimeoutId = window.setTimeout(() => {
      this.isWaitingForCommand = false;
      if (this.handlers.onNoSpeech) {
        this.handlers.onNoSpeech();
      }
    }, this.options.commandTimeout);
  }

  /**
   * Clear command timeout
   */
  private clearCommandTimeout(): void {
    if (this.commandTimeoutId !== null) {
      window.clearTimeout(this.commandTimeoutId);
      this.commandTimeoutId = null;
    }
  }

  /**
   * Start listening for wake word and commands
   */
  startListening(): void {
    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    if (!this.recognition) {
      throw new Error('Speech recognition not initialized');
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      if (this.handlers.onError) {
        this.handlers.onError(error instanceof Error ? error : new Error('Failed to start recognition'));
      }
    }
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (!this.isListening || !this.recognition) {
      return;
    }

    this.clearCommandTimeout();
    this.isWaitingForCommand = false;
    
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Failed to stop recognition:', error);
    }
  }

  /**
   * Abort recognition immediately
   */
  abort(): void {
    if (!this.recognition) return;
    
    this.clearCommandTimeout();
    this.isWaitingForCommand = false;
    
    try {
      this.recognition.abort();
    } catch (error) {
      console.error('Failed to abort recognition:', error);
    }
  }

  /**
   * Set event handlers
   */
  setHandlers(handlers: VoiceRecognitionHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Update options
   */
  updateOptions(options: Partial<VoiceRecognitionOptions>): void {
    this.options = { ...this.options, ...options };
    
    if (this.recognition) {
      if (options.language) {
        this.recognition.lang = options.language;
      }
      if (options.continuous !== undefined) {
        this.recognition.continuous = options.continuous;
      }
      if (options.interimResults !== undefined) {
        this.recognition.interimResults = options.interimResults;
      }
      if (options.maxAlternatives !== undefined) {
        this.recognition.maxAlternatives = options.maxAlternatives;
      }
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Check if waiting for command after wake word
   */
  getIsWaitingForCommand(): boolean {
    return this.isWaitingForCommand;
  }

  /**
   * Get current options
   */
  getOptions(): Required<VoiceRecognitionOptions> {
    return { ...this.options };
  }

  /**
   * Check if Web Speech API is supported
   */
  static isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.stopListening();
    this.clearCommandTimeout();
    this.recognition = null;
    this.handlers = {};
  }
}

/**
 * Singleton instance
 */
let voiceRecognitionInstance: VoiceRecognitionService | null = null;

/**
 * Get voice recognition service instance
 */
export function getVoiceRecognitionService(options?: VoiceRecognitionOptions): VoiceRecognitionService {
  if (!voiceRecognitionInstance) {
    voiceRecognitionInstance = new VoiceRecognitionService(options);
  }
  return voiceRecognitionInstance;
}

/**
 * Reset voice recognition service instance
 */
export function resetVoiceRecognitionService(): void {
  if (voiceRecognitionInstance) {
    voiceRecognitionInstance.dispose();
    voiceRecognitionInstance = null;
  }
}

// Made with Bob