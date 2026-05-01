/**
 * Whisper Speech-to-Text Service
 * 
 * @description Provides speech-to-text transcription using OpenAI's Whisper API
 * 
 * @module backend/services/whisper-service
 */

import OpenAI from 'openai';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import logger from '../utils/logger';

/**
 * Transcription result
 */
export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  confidence?: number;
}

/**
 * Transcription options
 */
export interface TranscriptionOptions {
  language?: string;
  prompt?: string;
  temperature?: number;
  model?: 'whisper-1';
}

/**
 * Whisper Service Class
 * 
 * @class WhisperService
 * @description Handles audio transcription using OpenAI Whisper API
 */
export class WhisperService {
  private client: OpenAI;
  private model: string;

  /**
   * Creates an instance of WhisperService
   * 
   * @param {string} apiKey - OpenAI API key
   * @param {string} [model='whisper-1'] - Whisper model to use
   */
  constructor(apiKey: string, model: string = 'whisper-1') {
    this.client = new OpenAI({
      apiKey,
    });
    this.model = model;
    
    logger.info('Whisper STT service initialized', { model });
  }

  /**
   * Transcribe audio from a file path
   * 
   * @param {string} audioFilePath - Path to the audio file
   * @param {TranscriptionOptions} [options] - Transcription options
   * @returns {Promise<TranscriptionResult>} Transcription result
   * @throws {Error} If transcription fails
   * 
   * @example
   * const result = await whisper.transcribeFile('/path/to/audio.mp3');
   * console.log(result.text);
   */
  async transcribeFile(
    audioFilePath: string,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    try {
      logger.info('Transcribing audio file', { file: audioFilePath });

      if (!fs.existsSync(audioFilePath)) {
        throw new Error(`Audio file not found: ${audioFilePath}`);
      }

      const startTime = Date.now();

      // Create a read stream from the file
      const audioStream = fs.createReadStream(audioFilePath);

      // Transcribe using Whisper API
      const transcription = await this.client.audio.transcriptions.create({
        file: audioStream,
        model: this.model,
        language: options.language,
        prompt: options.prompt,
        temperature: options.temperature || 0,
        response_format: 'verbose_json',
      });

      const duration = Date.now() - startTime;

      const result: TranscriptionResult = {
        text: transcription.text,
        language: transcription.language,
        duration,
      };

      logger.info('Audio transcribed successfully', { 
        duration,
        textLength: result.text.length,
        language: result.language 
      });

      return result;
    } catch (error) {
      logger.error('Failed to transcribe audio file', { error, file: audioFilePath });
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transcribe audio from a buffer
   * 
   * @param {Buffer} audioBuffer - Audio data buffer
   * @param {string} filename - Filename with extension (e.g., 'audio.mp3')
   * @param {TranscriptionOptions} [options] - Transcription options
   * @returns {Promise<TranscriptionResult>} Transcription result
   * @throws {Error} If transcription fails
   * 
   * @example
   * const result = await whisper.transcribeBuffer(audioBuffer, 'recording.wav');
   */
  async transcribeBuffer(
    audioBuffer: Buffer,
    filename: string,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    try {
      logger.info('Transcribing audio buffer', { size: audioBuffer.length, filename });

      const startTime = Date.now();

      // Create a readable stream from buffer
      const audioStream = Readable.from(audioBuffer);
      
      // Add filename property to the stream (required by OpenAI API)
      (audioStream as any).path = filename;

      // Transcribe using Whisper API
      const transcription = await this.client.audio.transcriptions.create({
        file: audioStream as any,
        model: this.model,
        language: options.language,
        prompt: options.prompt,
        temperature: options.temperature || 0,
        response_format: 'verbose_json',
      });

      const duration = Date.now() - startTime;

      const result: TranscriptionResult = {
        text: transcription.text,
        language: transcription.language,
        duration,
      };

      logger.info('Audio buffer transcribed successfully', { 
        duration,
        textLength: result.text.length 
      });

      return result;
    } catch (error) {
      logger.error('Failed to transcribe audio buffer', { error });
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transcribe audio from base64 encoded string
   * 
   * @param {string} base64Audio - Base64 encoded audio data
   * @param {string} filename - Filename with extension
   * @param {TranscriptionOptions} [options] - Transcription options
   * @returns {Promise<TranscriptionResult>} Transcription result
   * 
   * @example
   * const result = await whisper.transcribeBase64(base64String, 'audio.mp3');
   */
  async transcribeBase64(
    base64Audio: string,
    filename: string,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    try {
      // Convert base64 to buffer
      const audioBuffer = Buffer.from(base64Audio, 'base64');
      return await this.transcribeBuffer(audioBuffer, filename, options);
    } catch (error) {
      logger.error('Failed to transcribe base64 audio', { error });
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save audio buffer to temporary file and transcribe
   * 
   * @param {Buffer} audioBuffer - Audio data buffer
   * @param {string} [format='mp3'] - Audio format
   * @param {TranscriptionOptions} [options] - Transcription options
   * @returns {Promise<TranscriptionResult>} Transcription result
   * @private
   */
  private async transcribeWithTempFile(
    audioBuffer: Buffer,
    format: string = 'mp3',
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    const tempDir = path.join(process.cwd(), 'temp');
    const tempFile = path.join(tempDir, `audio_${Date.now()}.${format}`);

    try {
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Write buffer to temp file
      fs.writeFileSync(tempFile, audioBuffer);

      // Transcribe the file
      const result = await this.transcribeFile(tempFile, options);

      return result;
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  /**
   * Validate audio file format
   * 
   * @param {string} filename - Filename to validate
   * @returns {boolean} True if format is supported
   */
  isSupportedFormat(filename: string): boolean {
    const supportedFormats = [
      '.mp3', '.mp4', '.mpeg', '.mpga',
      '.m4a', '.wav', '.webm'
    ];
    
    const ext = path.extname(filename).toLowerCase();
    return supportedFormats.includes(ext);
  }

  /**
   * Get estimated transcription cost
   * 
   * @param {number} durationSeconds - Audio duration in seconds
   * @returns {number} Estimated cost in USD
   */
  getEstimatedCost(durationSeconds: number): number {
    // Whisper API pricing: $0.006 per minute
    const minutes = durationSeconds / 60;
    return minutes * 0.006;
  }
}

/**
 * Create and export a singleton instance
 */
let whisperInstance: WhisperService | null = null;

/**
 * Get or create Whisper service instance
 * 
 * @returns {WhisperService} Singleton instance
 * @throws {Error} If WHISPER_API_KEY is not set
 */
export function getWhisperService(): WhisperService {
  if (!whisperInstance) {
    const apiKey = process.env.WHISPER_API_KEY;

    if (!apiKey) {
      throw new Error('WHISPER_API_KEY must be set in environment variables');
    }

    whisperInstance = new WhisperService(apiKey);
  }

  return whisperInstance;
}

export default WhisperService;

// Made with Bob
