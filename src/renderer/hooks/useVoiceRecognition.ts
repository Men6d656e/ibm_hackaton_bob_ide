/**
 * Voice Recognition Hook
 * 
 * React hook for integrating voice recognition with application state.
 * Manages wake word detection, voice commands, and audio feedback.
 * 
 * @module renderer/hooks/useVoiceRecognition
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAppStore } from '../store/app.store';
import { useChatStore } from '../store/chat.store';
import {
  getVoiceRecognitionService,
  VoiceRecognitionService,
  VoiceRecognitionResult,
  WakeWordResult,
} from '../services/voice-recognition';
import { getAudioService, AudioService } from '../services/audio-service';

/**
 * Voice recognition hook options
 */
export interface UseVoiceRecognitionOptions {
  /** Wake word to listen for (default: "ollama") */
  wakeWord?: string;
  
  /** Language code (default: "en-US") */
  language?: string;
  
  /** Enable automatic listening on mount */
  autoStart?: boolean;
  
  /** Enable audio feedback for wake word */
  enableAudioFeedback?: boolean;
  
  /** Backend API base URL */
  apiBaseUrl?: string;
}

/**
 * Voice recognition hook return type
 */
export interface UseVoiceRecognitionReturn {
  /** Whether voice recognition is active */
  isListening: boolean;
  
  /** Whether waiting for command after wake word */
  isWaitingForCommand: boolean;
  
  /** Current interim transcript */
  interimTranscript: string;
  
  /** Whether Web Speech API is supported */
  isSupported: boolean;
  
  /** Start listening for wake word */
  startListening: () => void;
  
  /** Stop listening */
  stopListening: () => void;
  
  /** Toggle listening state */
  toggleListening: () => void;
  
  /** Process voice command manually */
  processVoiceCommand: (audioData: string, filename: string) => Promise<void>;
  
  /** Last error if any */
  error: Error | null;
}

/**
 * Voice recognition hook
 * 
 * @example
 * ```tsx
 * const { isListening, startListening, stopListening } = useVoiceRecognition({
 *   wakeWord: 'ollama',
 *   autoStart: true,
 * });
 * ```
 */
export function useVoiceRecognition(
  options: UseVoiceRecognitionOptions = {}
): UseVoiceRecognitionReturn {
  const {
    wakeWord = 'ollama',
    language = 'en-US',
    autoStart = false,
    enableAudioFeedback = true,
    apiBaseUrl = 'http://localhost:3000/api',
  } = options;

  // Store hooks
  const { isMicActive, setProcessingVoice, setError: setAppError } = useAppStore();
  const { sendMessage } = useChatStore();

  // Local state
  const [isListening, setIsListening] = useState(false);
  const [isWaitingForCommand, setIsWaitingForCommand] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);

  // Service refs
  const voiceServiceRef = useRef<VoiceRecognitionService | null>(null);
  const audioServiceRef = useRef<AudioService | null>(null);

  // Check if Web Speech API is supported
  const isSupported = VoiceRecognitionService.isSupported();

  /**
   * Initialize services
   */
  useEffect(() => {
    if (!isSupported) {
      setError(new Error('Web Speech API is not supported in this browser'));
      return;
    }

    try {
      voiceServiceRef.current = getVoiceRecognitionService({
        wakeWord,
        language,
        continuous: true,
        interimResults: true,
      });

      audioServiceRef.current = getAudioService();

      setupEventHandlers();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize voice recognition');
      setError(error);
      setAppError(error.message);
    }

    return () => {
      if (voiceServiceRef.current) {
        voiceServiceRef.current.dispose();
      }
    };
  }, [wakeWord, language, isSupported]);

  /**
   * Setup voice recognition event handlers
   */
  const setupEventHandlers = useCallback(() => {
    if (!voiceServiceRef.current) return;

    voiceServiceRef.current.setHandlers({
      onStart: () => {
        setIsListening(true);
        setError(null);
      },

      onEnd: () => {
        setIsListening(false);
      },

      onWakeWord: async (result: WakeWordResult) => {
        console.log('Wake word detected:', result);
        setIsWaitingForCommand(true);
        setInterimTranscript('');

        // Play audio feedback if enabled
        if (enableAudioFeedback) {
          try {
            const response = await fetch(`${apiBaseUrl}/voice/wake-word-response`);
            const data = await response.json();
            
            if (data.success && audioServiceRef.current) {
              await audioServiceRef.current.playAudio(data.data.audio, {
                volume: 0.7,
              });
            }
          } catch (err) {
            console.error('Failed to play wake word response:', err);
          }
        }
      },

      onCommand: async (result: VoiceRecognitionResult) => {
        console.log('Command received:', result);
        setIsWaitingForCommand(false);
        setInterimTranscript('');
        setProcessingVoice(true);

        try {
          // Send command to backend for processing
          const response = await fetch(`${apiBaseUrl}/voice/process-text`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: result.transcript,
              conversationHistory: [], // TODO: Get from chat store
            }),
          });

          const data = await response.json();

          if (data.success) {
            // Add user message
            await sendMessage(result.transcript, true);

            // Play audio response
            if (data.data.audioResponse && audioServiceRef.current) {
              await audioServiceRef.current.playAudio(data.data.audioResponse, {
                volume: 0.8,
              });
            }
          } else {
            throw new Error(data.error?.message || 'Failed to process command');
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to process voice command');
          setError(error);
          setAppError(error.message);
        } finally {
          setProcessingVoice(false);
        }
      },

      onInterim: (result: VoiceRecognitionResult) => {
        setInterimTranscript(result.transcript);
      },

      onError: (err: Error) => {
        console.error('Voice recognition error:', err);
        setError(err);
        setAppError(err.message);
        setIsWaitingForCommand(false);
      },

      onNoSpeech: () => {
        console.log('No speech detected');
        setIsWaitingForCommand(false);
        setInterimTranscript('');
      },

      onAudioStart: () => {
        console.log('Audio input started');
      },

      onAudioEnd: () => {
        console.log('Audio input ended');
      },
    });
  }, [enableAudioFeedback, apiBaseUrl, sendMessage, setProcessingVoice, setAppError]);

  /**
   * Start listening for wake word
   */
  const startListening = useCallback(() => {
    if (!voiceServiceRef.current || !isSupported) {
      setError(new Error('Voice recognition not available'));
      return;
    }

    try {
      voiceServiceRef.current.startListening();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start listening');
      setError(error);
      setAppError(error.message);
    }
  }, [isSupported, setAppError]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (!voiceServiceRef.current) return;

    try {
      voiceServiceRef.current.stopListening();
      setIsWaitingForCommand(false);
      setInterimTranscript('');
    } catch (err) {
      console.error('Failed to stop listening:', err);
    }
  }, []);

  /**
   * Toggle listening state
   */
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  /**
   * Process voice command from audio data
   */
  const processVoiceCommand = useCallback(
    async (audioData: string, filename: string) => {
      setProcessingVoice(true);

      try {
        const response = await fetch(`${apiBaseUrl}/voice/process-command`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audioData,
            filename,
            conversationHistory: [], // TODO: Get from chat store
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Add user message with transcript
          await sendMessage(data.data.transcript, true);

          // Play audio response
          if (data.data.audioResponse && audioServiceRef.current) {
            await audioServiceRef.current.playAudio(data.data.audioResponse, {
              volume: 0.8,
            });
          }
        } else {
          throw new Error(data.error?.message || 'Failed to process command');
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to process voice command');
        setError(error);
        setAppError(error.message);
      } finally {
        setProcessingVoice(false);
      }
    },
    [apiBaseUrl, sendMessage, setProcessingVoice, setAppError]
  );

  /**
   * Auto-start listening if enabled
   */
  useEffect(() => {
    if (autoStart && isSupported && !isListening) {
      startListening();
    }
  }, [autoStart, isSupported, isListening, startListening]);

  /**
   * Sync with app store mic state
   */
  useEffect(() => {
    if (isMicActive && !isListening) {
      startListening();
    } else if (!isMicActive && isListening) {
      stopListening();
    }
  }, [isMicActive, isListening, startListening, stopListening]);

  return {
    isListening,
    isWaitingForCommand,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    processVoiceCommand,
    error,
  };
}

// Made with Bob