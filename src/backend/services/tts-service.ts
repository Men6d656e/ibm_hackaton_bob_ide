/**
 * IBM Watson Text-to-Speech Service
 * 
 * @description Provides text-to-speech synthesis using IBM Watson TTS
 * with voice response variations
 * 
 * @module backend/services/tts-service
 */

import TextToSpeechV1 from 'ibm-watson/text-to-speech/v1';
import { IamAuthenticator } from 'ibm-watson/auth';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

/**
 * Voice configuration
 */
export interface VoiceConfig {
  voice: string;
  language: string;
  gender: 'male' | 'female';
}

/**
 * Synthesis options
 */
export interface SynthesisOptions {
  voice?: string;
  accept?: string;
  rate?: string;
  pitch?: string;
  volume?: string;
}

/**
 * Synthesis result
 */
export interface SynthesisResult {
  audio: Buffer;
  contentType: string;
  duration?: number;
}

/**
 * Wake word response variations
 */
const WAKE_WORD_RESPONSES = [
  "Yes sir, I am here. What would you like to do?",
  "Hello! I'm ready to help. What can I do for you?",
  "At your service! How may I assist you today?",
  "I'm listening. What would you like me to do?",
  "Ready and waiting! What's your command?",
  "Yes, I'm here! What do you need?",
  "Hello there! How can I help you?",
  "I'm all ears! What would you like?",
  "Standing by! What's your request?",
  "Present and accounted for! What can I do?",
];

/**
 * IBM Watson TTS Service Class
 * 
 * @class TTSService
 * @description Handles text-to-speech synthesis with voice variations
 */
export class TTSService {
  private client: TextToSpeechV1;
  private defaultVoice: string;
  private availableVoices: VoiceConfig[];

  /**
   * Creates an instance of TTSService
   * 
   * @param {string} apiKey - IBM Watson TTS API key
   * @param {string} serviceUrl - IBM Watson TTS service URL
   * @param {string} [defaultVoice='en-US_MichaelV3Voice'] - Default voice to use
   */
  constructor(
    apiKey: string,
    serviceUrl: string,
    defaultVoice: string = 'en-US_MichaelV3Voice'
  ) {
    this.client = new TextToSpeechV1({
      authenticator: new IamAuthenticator({
        apikey: apiKey,
      }),
      serviceUrl,
    });

    this.defaultVoice = defaultVoice;
    this.availableVoices = this.getAvailableVoices();
    
    logger.info('Watson TTS service initialized', { voice: defaultVoice });
  }

  /**
   * Get list of available voices
   * 
   * @returns {VoiceConfig[]} Array of available voice configurations
   * @private
   */
  private getAvailableVoices(): VoiceConfig[] {
    return [
      { voice: 'en-US_MichaelV3Voice', language: 'en-US', gender: 'male' },
      { voice: 'en-US_AllisonV3Voice', language: 'en-US', gender: 'female' },
      { voice: 'en-US_LisaV3Voice', language: 'en-US', gender: 'female' },
      { voice: 'en-US_EmilyV3Voice', language: 'en-US', gender: 'female' },
      { voice: 'en-US_HenryV3Voice', language: 'en-US', gender: 'male' },
      { voice: 'en-US_KevinV3Voice', language: 'en-US', gender: 'male' },
      { voice: 'en-US_OliviaV3Voice', language: 'en-US', gender: 'female' },
    ];
  }

  /**
   * Synthesize text to speech
   * 
   * @param {string} text - Text to synthesize
   * @param {SynthesisOptions} [options] - Synthesis options
   * @returns {Promise<SynthesisResult>} Audio buffer and metadata
   * @throws {Error} If synthesis fails
   * 
   * @example
   * const result = await tts.synthesize("Hello, how can I help you?");
   * fs.writeFileSync('output.mp3', result.audio);
   */
  async synthesize(
    text: string,
    options: SynthesisOptions = {}
  ): Promise<SynthesisResult> {
    try {
      logger.info('Synthesizing text to speech', { 
        textLength: text.length,
        voice: options.voice || this.defaultVoice 
      });

      const startTime = Date.now();

      const params = {
        text,
        voice: options.voice || this.defaultVoice,
        accept: options.accept || 'audio/mp3',
      };

      const response = await this.client.synthesize(params);
      const audio = await this.client.repairWavHeaderStream(response.result as any);
      
      // Convert stream to buffer
      const audioBuffer = await this.streamToBuffer(audio);
      
      const duration = Date.now() - startTime;

      const result: SynthesisResult = {
        audio: audioBuffer,
        contentType: params.accept,
        duration,
      };

      logger.info('Text synthesized successfully', { 
        duration,
        audioSize: audioBuffer.length 
      });

      return result;
    } catch (error) {
      logger.error('Failed to synthesize text', { error, text });
      throw new Error(`TTS synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a random wake word response
   * 
   * @returns {string} Random wake word response text
   * 
   * @example
   * const response = tts.getRandomWakeWordResponse();
   * // Returns: "Yes sir, I am here. What would you like to do?"
   */
  getRandomWakeWordResponse(): string {
    const randomIndex = Math.floor(Math.random() * WAKE_WORD_RESPONSES.length);
    return WAKE_WORD_RESPONSES[randomIndex];
  }

  /**
   * Synthesize a random wake word response
   * 
   * @param {SynthesisOptions} [options] - Synthesis options
   * @returns {Promise<SynthesisResult>} Audio buffer with wake word response
   * 
   * @example
   * const result = await tts.synthesizeWakeWordResponse();
   */
  async synthesizeWakeWordResponse(
    options: SynthesisOptions = {}
  ): Promise<SynthesisResult> {
    const responseText = this.getRandomWakeWordResponse();
    logger.info('Synthesizing wake word response', { response: responseText });
    return await this.synthesize(responseText, options);
  }

  /**
   * Synthesize text and save to file
   * 
   * @param {string} text - Text to synthesize
   * @param {string} outputPath - Path to save audio file
   * @param {SynthesisOptions} [options] - Synthesis options
   * @returns {Promise<string>} Path to saved audio file
   * 
   * @example
   * const filePath = await tts.synthesizeToFile("Hello world", "./output.mp3");
   */
  async synthesizeToFile(
    text: string,
    outputPath: string,
    options: SynthesisOptions = {}
  ): Promise<string> {
    try {
      const result = await this.synthesize(text, options);
      
      // Ensure output directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write audio to file
      fs.writeFileSync(outputPath, result.audio);
      
      logger.info('Audio saved to file', { path: outputPath, size: result.audio.length });
      
      return outputPath;
    } catch (error) {
      logger.error('Failed to save audio to file', { error, path: outputPath });
      throw error;
    }
  }

  /**
   * Synthesize text to base64 encoded string
   * 
   * @param {string} text - Text to synthesize
   * @param {SynthesisOptions} [options] - Synthesis options
   * @returns {Promise<string>} Base64 encoded audio
   * 
   * @example
   * const base64Audio = await tts.synthesizeToBase64("Hello");
   */
  async synthesizeToBase64(
    text: string,
    options: SynthesisOptions = {}
  ): Promise<string> {
    const result = await this.synthesize(text, options);
    return result.audio.toString('base64');
  }

  /**
   * Get list of available voices
   * 
   * @returns {Promise<VoiceConfig[]>} Array of available voices
   * 
   * @example
   * const voices = await tts.listVoices();
   */
  async listVoices(): Promise<VoiceConfig[]> {
    try {
      const response = await this.client.listVoices();
      const voices = response.result.voices || [];
      
      return voices
        .filter((v: any) => v.language.startsWith('en'))
        .map((v: any) => ({
          voice: v.name,
          language: v.language,
          gender: v.gender as 'male' | 'female',
        }));
    } catch (error) {
      logger.error('Failed to list voices', { error });
      return this.availableVoices;
    }
  }

  /**
   * Convert readable stream to buffer with timeout
   *
   * @param {any} stream - Input stream
   * @param {number} [timeoutMs=30000] - Timeout in milliseconds (default: 30 seconds)
   * @returns {Promise<Buffer>} Buffer containing stream data
   * @throws {Error} If stream times out or encounters an error
   * @private
   */
  private streamToBuffer(stream: any, timeoutMs: number = 30000): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      let timeoutId: NodeJS.Timeout;
      let isResolved = false;

      // Set up timeout
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          if (stream.destroy && typeof stream.destroy === 'function') {
            stream.destroy();
          }
          reject(new Error(`Stream timeout after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      // Clean up timeout
      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
      
      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      stream.on('end', () => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve(Buffer.concat(chunks));
        }
      });
      
      stream.on('error', (error: Error) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          reject(error);
        }
      });
    });
  }

  /**
   * Get estimated synthesis cost
   * 
   * @param {number} characterCount - Number of characters to synthesize
   * @returns {number} Estimated cost in USD
   */
  getEstimatedCost(characterCount: number): number {
    // Watson TTS pricing: $0.02 per 1000 characters
    return (characterCount / 1000) * 0.02;
  }

  /**
   * Validate text length
   * 
   * @param {string} text - Text to validate
   * @returns {boolean} True if text length is within limits
   */
  isValidTextLength(text: string): boolean {
    // Watson TTS has a limit of 5000 characters per request
    return text.length > 0 && text.length <= 5000;
  }

  /**
   * Split long text into chunks
   * 
   * @param {string} text - Text to split
   * @param {number} [maxLength=4500] - Maximum chunk length
   * @returns {string[]} Array of text chunks
   */
  splitText(text: string, maxLength: number = 4500): string[] {
    if (text.length <= maxLength) {
      return [text];
    }

    const chunks: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}

/**
 * Create and export a singleton instance
 */
let ttsInstance: TTSService | null = null;

/**
 * Get or create TTS service instance
 * 
 * @returns {TTSService} Singleton instance
 * @throws {Error} If required environment variables are missing
 */
export function getTTSService(): TTSService {
  if (!ttsInstance) {
    const apiKey = process.env.WATSON_TTS_API_KEY;
    const serviceUrl = process.env.WATSON_TTS_URL;

    if (!apiKey || !serviceUrl) {
      throw new Error('WATSON_TTS_API_KEY and WATSON_TTS_URL must be set in environment variables');
    }

    ttsInstance = new TTSService(apiKey, serviceUrl);
  }

  return ttsInstance;
}

export default TTSService;

// Made with Bob
