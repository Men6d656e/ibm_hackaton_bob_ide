/**
 * Audio Service
 * 
 * Manages microphone access, audio recording, and audio playback.
 * Provides a centralized interface for all audio operations in the application.
 * 
 * @module renderer/services/audio-service
 */

/**
 * Audio recording options
 */
export interface AudioRecordingOptions {
  /** Sample rate in Hz (default: 16000 for Whisper) */
  sampleRate?: number;
  
  /** Number of audio channels (default: 1 for mono) */
  channelCount?: number;
  
  /** Maximum recording duration in milliseconds */
  maxDuration?: number;
  
  /** Enable echo cancellation */
  echoCancellation?: boolean;
  
  /** Enable noise suppression */
  noiseSuppression?: boolean;
  
  /** Enable auto gain control */
  autoGainControl?: boolean;
}

/**
 * Audio recording result
 */
export interface AudioRecordingResult {
  /** Audio data as base64 string */
  audioData: string;
  
  /** Audio blob */
  blob: Blob;
  
  /** Recording duration in milliseconds */
  duration: number;
  
  /** Sample rate used */
  sampleRate: number;
  
  /** MIME type */
  mimeType: string;
}

/**
 * Audio playback options
 */
export interface AudioPlaybackOptions {
  /** Volume level (0.0 to 1.0) */
  volume?: number;
  
  /** Playback rate (0.5 to 2.0) */
  playbackRate?: number;
  
  /** Callback when playback ends */
  onEnded?: () => void;
  
  /** Callback on playback error */
  onError?: (error: Error) => void;
}

/**
 * Audio service class
 */
export class AudioService {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingStartTime: number = 0;
  private isRecording: boolean = false;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  /**
   * Check if microphone is available
   */
  async isMicrophoneAvailable(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Failed to check microphone availability:', error);
      return false;
    }
  }

  /**
   * Request microphone permission
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  /**
   * Initialize audio context and analyser for visualization
   */
  async initializeAudioContext(): Promise<AnalyserNode | null> {
    try {
      if (!this.mediaStream) {
        throw new Error('No active media stream');
      }

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
      
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyserNode);
      
      return this.analyserNode;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return null;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(options: AudioRecordingOptions = {}): Promise<void> {
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    const {
      sampleRate = 16000,
      channelCount = 1,
      echoCancellation = true,
      noiseSuppression = true,
      autoGainControl = true,
    } = options;

    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate,
          channelCount,
          echoCancellation,
          noiseSuppression,
          autoGainControl,
        },
      });

      // Initialize audio context for visualization
      await this.initializeAudioContext();

      // Determine supported MIME type
      const mimeType = this.getSupportedMimeType();
      
      // Create media recorder
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType,
      });

      // Reset audio chunks
      this.audioChunks = [];

      // Handle data available event
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start();
      this.recordingStartTime = Date.now();
      this.isRecording = true;

      // Handle max duration
      if (options.maxDuration) {
        setTimeout(() => {
          if (this.isRecording) {
            this.stopRecording();
          }
        }, options.maxDuration);
      }
    } catch (error) {
      this.cleanup();
      throw new Error(`Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop recording and return audio data
   */
  async stopRecording(): Promise<AudioRecordingResult> {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('No recording in progress');
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Media recorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const duration = Date.now() - this.recordingStartTime;
          const blob = new Blob(this.audioChunks, { type: this.mediaRecorder!.mimeType });
          
          // Convert blob to base64
          const audioData = await this.blobToBase64(blob);
          
          const result: AudioRecordingResult = {
            audioData,
            blob,
            duration,
            sampleRate: 16000, // Default sample rate
            mimeType: this.mediaRecorder!.mimeType,
          };

          this.cleanup();
          resolve(result);
        } catch (error) {
          this.cleanup();
          reject(error);
        }
      };

      this.mediaRecorder.stop();
      this.isRecording = false;
    });
  }

  /**
   * Cancel recording without returning data
   */
  cancelRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
    this.cleanup();
  }

  /**
   * Play audio from base64 data
   */
  async playAudio(audioData: string, options: AudioPlaybackOptions = {}): Promise<void> {
    const {
      volume = 1.0,
      playbackRate = 1.0,
      onEnded,
      onError,
    } = options;

    return new Promise((resolve, reject) => {
      try {
        // Stop any currently playing audio
        this.stopAudio();

        // Create audio element
        this.currentAudio = new Audio(`data:audio/mp3;base64,${audioData}`);
        this.currentAudio.volume = Math.max(0, Math.min(1, volume));
        this.currentAudio.playbackRate = Math.max(0.5, Math.min(2, playbackRate));

        // Handle events
        this.currentAudio.onended = () => {
          if (onEnded) onEnded();
          resolve();
        };

        this.currentAudio.onerror = (error) => {
          const err = new Error('Failed to play audio');
          if (onError) onError(err);
          reject(err);
        };

        // Play audio
        this.currentAudio.play().catch(reject);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to play audio');
        if (onError) onError(err);
        reject(err);
      }
    });
  }

  /**
   * Stop currently playing audio
   */
  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Get analyser node for visualization
   */
  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  /**
   * Check if currently recording
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get current recording duration
   */
  getRecordingDuration(): number {
    if (!this.isRecording) return 0;
    return Date.now() - this.recordingStartTime;
  }

  /**
   * Get supported MIME type for recording
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }

  /**
   * Convert blob to base64 string
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    // Stop all tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Reset state
    this.mediaRecorder = null;
    this.analyserNode = null;
    this.audioChunks = [];
    this.isRecording = false;
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.cancelRecording();
    this.stopAudio();
    this.cleanup();
  }
}

/**
 * Singleton instance
 */
let audioServiceInstance: AudioService | null = null;

/**
 * Get audio service instance
 */
export function getAudioService(): AudioService {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService();
  }
  return audioServiceInstance;
}

// Made with Bob