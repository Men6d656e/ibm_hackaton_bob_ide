/**
 * Command Parser Service
 * 
 * @description Orchestrates voice command processing pipeline:
 * Audio → Whisper STT → watsonx.ai → Ollama CLI → Watson TTS
 * 
 * @module backend/services/command-parser
 */

import { getWatsonxService, CommandResult } from './watsonx-service';
import { getWhisperService, TranscriptionResult } from './whisper-service';
import { getTTSService, SynthesisResult } from './tts-service';
import { OllamaWrapper } from './ollama-wrapper';
import logger from '../utils/logger';

/**
 * Voice command processing result
 */
export interface VoiceCommandResult {
  transcript: string;
  intent: string;
  function: string;
  parameters: Record<string, any>;
  executionResult: any;
  responseText: string;
  responseAudio: Buffer;
  processingTime: number;
}

/**
 * Command execution error
 */
export class CommandExecutionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CommandExecutionError';
  }
}

/**
 * Command Parser Service Class
 * 
 * @class CommandParser
 * @description Orchestrates the complete voice command processing pipeline
 */
export class CommandParser {
  private watsonx: ReturnType<typeof getWatsonxService>;
  private whisper: ReturnType<typeof getWhisperService>;
  private tts: ReturnType<typeof getTTSService>;
  private ollama: OllamaWrapper;

  /**
   * Creates an instance of CommandParser
   */
  constructor() {
    this.watsonx = getWatsonxService();
    this.whisper = getWhisperService();
    this.tts = getTTSService();
    this.ollama = new OllamaWrapper();
    
    logger.info('Command Parser initialized');
  }

  /**
   * Process a complete voice command from audio to response
   * 
   * @param {Buffer} audioBuffer - Audio data buffer
   * @param {string} filename - Audio filename with extension
   * @param {string} [conversationHistory] - Optional conversation context
   * @returns {Promise<VoiceCommandResult>} Complete processing result
   * @throws {CommandExecutionError} If any step fails
   * 
   * @example
   * const result = await parser.processVoiceCommand(audioBuffer, 'command.wav');
   * console.log(result.responseText);
   */
  async processVoiceCommand(
    audioBuffer: Buffer,
    filename: string,
    conversationHistory?: string
  ): Promise<VoiceCommandResult> {
    const startTime = Date.now();

    try {
      logger.info('Starting voice command processing pipeline');

      // Step 1: Transcribe audio to text
      const transcription = await this.transcribeAudio(audioBuffer, filename);
      logger.info('Transcription complete', { text: transcription.text });

      // Step 2: Parse command and extract intent
      const commandResult = await this.parseCommand(transcription.text, conversationHistory);
      logger.info('Command parsed', { 
        intent: commandResult.intent,
        function: commandResult.function 
      });

      // Step 3: Execute the command
      const executionResult = await this.executeCommand(
        commandResult.function,
        commandResult.parameters
      );
      logger.info('Command executed successfully');

      // Step 4: Generate natural language response
      const responseText = await this.generateResponse(
        commandResult.function,
        executionResult
      );
      logger.info('Response generated', { response: responseText });

      // Step 5: Synthesize response to audio
      const responseAudio = await this.synthesizeResponse(responseText);
      logger.info('Response synthesized to audio');

      const processingTime = Date.now() - startTime;

      return {
        transcript: transcription.text,
        intent: commandResult.intent,
        function: commandResult.function,
        parameters: commandResult.parameters,
        executionResult,
        responseText,
        responseAudio: responseAudio.audio,
        processingTime,
      };
    } catch (error) {
      logger.error('Voice command processing failed', { error });
      throw new CommandExecutionError(
        'Failed to process voice command',
        'PROCESSING_ERROR',
        error
      );
    }
  }

  /**
   * Process text command (skip STT step)
   * 
   * @param {string} text - Text command
   * @param {string} [conversationHistory] - Optional conversation context
   * @returns {Promise<VoiceCommandResult>} Processing result
   * 
   * @example
   * const result = await parser.processTextCommand("list all models");
   */
  async processTextCommand(
    text: string,
    conversationHistory?: string
  ): Promise<Omit<VoiceCommandResult, 'transcript'>> {
    const startTime = Date.now();

    try {
      logger.info('Processing text command', { text });

      const commandResult = await this.parseCommand(text, conversationHistory);
      const executionResult = await this.executeCommand(
        commandResult.function,
        commandResult.parameters
      );
      const responseText = await this.generateResponse(
        commandResult.function,
        executionResult
      );
      const responseAudio = await this.synthesizeResponse(responseText);

      const processingTime = Date.now() - startTime;

      return {
        intent: commandResult.intent,
        function: commandResult.function,
        parameters: commandResult.parameters,
        executionResult,
        responseText,
        responseAudio: responseAudio.audio,
        processingTime,
      };
    } catch (error) {
      logger.error('Text command processing failed', { error });
      throw new CommandExecutionError(
        'Failed to process text command',
        'PROCESSING_ERROR',
        error
      );
    }
  }

  /**
   * Transcribe audio to text using Whisper
   * 
   * @param {Buffer} audioBuffer - Audio data
   * @param {string} filename - Audio filename
   * @returns {Promise<TranscriptionResult>} Transcription result
   * @private
   */
  private async transcribeAudio(
    audioBuffer: Buffer,
    filename: string
  ): Promise<TranscriptionResult> {
    try {
      return await this.whisper.transcribeBuffer(audioBuffer, filename, {
        language: 'en',
        prompt: 'Ollama model management commands',
      });
    } catch (error) {
      throw new CommandExecutionError(
        'Audio transcription failed',
        'TRANSCRIPTION_ERROR',
        error
      );
    }
  }

  /**
   * Parse command using watsonx.ai
   * 
   * @param {string} text - Command text
   * @param {string} [conversationHistory] - Conversation context
   * @returns {Promise<CommandResult>} Parsed command
   * @private
   */
  private async parseCommand(
    text: string,
    conversationHistory?: string
  ): Promise<CommandResult> {
    try {
      return await this.watsonx.processCommand(text, conversationHistory);
    } catch (error) {
      throw new CommandExecutionError(
        'Command parsing failed',
        'PARSING_ERROR',
        error
      );
    }
  }

  /**
   * Execute Ollama command
   * 
   * @param {string} functionName - Function to execute
   * @param {Record<string, any>} parameters - Function parameters
   * @returns {Promise<any>} Execution result
   * @private
   */
  private async executeCommand(
    functionName: string,
    parameters: Record<string, any>
  ): Promise<any> {
    try {
      logger.info('Executing Ollama command', { function: functionName, parameters });

      switch (functionName) {
        case 'list_models':
          return await this.ollama.listModels();

        case 'show_model':
          if (!parameters.model_name) {
            throw new Error('model_name parameter is required');
          }
          return await this.ollama.showModel(parameters.model_name);

        case 'run_model':
          if (!parameters.model_name) {
            throw new Error('model_name parameter is required');
          }
          return await this.ollama.runModel(parameters.model_name, {
            prompt: parameters.prompt,
          });

        case 'stop_model':
          if (!parameters.model_name) {
            throw new Error('model_name parameter is required');
          }
          return await this.ollama.stopModel(parameters.model_name);

        case 'pull_model':
          if (!parameters.model_name) {
            throw new Error('model_name parameter is required');
          }
          return await this.ollama.pullModel(parameters.model_name);

        case 'remove_model':
          if (!parameters.model_name) {
            throw new Error('model_name parameter is required');
          }
          return await this.ollama.removeModel(parameters.model_name);

        case 'get_running_models':
          return await this.ollama.getRunningModels();

        case 'copy_model':
          if (!parameters.source_model || !parameters.destination_model) {
            throw new Error('source_model and destination_model parameters are required');
          }
          return await this.ollama.copyModel(
            parameters.source_model,
            parameters.destination_model
          );

        case 'none':
        case 'unknown':
          return {
            message: 'I understand you want to do something, but I need more specific information. Could you please rephrase your request?',
          };

        default:
          throw new Error(`Unknown function: ${functionName}`);
      }
    } catch (error) {
      throw new CommandExecutionError(
        `Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EXECUTION_ERROR',
        error
      );
    }
  }

  /**
   * Generate natural language response
   * 
   * @param {string} functionName - Executed function name
   * @param {any} result - Execution result
   * @returns {Promise<string>} Natural language response
   * @private
   */
  private async generateResponse(
    functionName: string,
    result: any
  ): Promise<string> {
    try {
      // Use watsonx.ai to generate natural response
      return await this.watsonx.generateResponse(functionName, result);
    } catch (error) {
      // Fallback to simple response
      logger.warn('Failed to generate AI response, using fallback', { error });
      return this.getFallbackResponse(functionName, result);
    }
  }

  /**
   * Get fallback response when AI generation fails
   * 
   * @param {string} functionName - Function name
   * @param {any} result - Execution result
   * @returns {string} Fallback response
   * @private
   */
  private getFallbackResponse(functionName: string, result: any): string {
    switch (functionName) {
      case 'list_models':
        const modelCount = Array.isArray(result) ? result.length : 0;
        return `I found ${modelCount} installed model${modelCount !== 1 ? 's' : ''}.`;

      case 'show_model':
        return `Here's the information about the model.`;

      case 'run_model':
        return `The model has been started successfully.`;

      case 'stop_model':
        return `The model has been stopped.`;

      case 'pull_model':
        return `The model download has been initiated.`;

      case 'remove_model':
        return `The model has been removed.`;

      case 'get_running_models':
        const runningCount = Array.isArray(result) ? result.length : 0;
        return `There ${runningCount === 1 ? 'is' : 'are'} ${runningCount} model${runningCount !== 1 ? 's' : ''} currently running.`;

      case 'copy_model':
        return `The model has been copied successfully.`;

      default:
        return `Operation completed successfully.`;
    }
  }

  /**
   * Synthesize response text to audio
   * 
   * @param {string} text - Response text
   * @returns {Promise<SynthesisResult>} Audio synthesis result
   * @private
   */
  private async synthesizeResponse(text: string): Promise<SynthesisResult> {
    try {
      return await this.tts.synthesize(text);
    } catch (error) {
      throw new CommandExecutionError(
        'Response synthesis failed',
        'SYNTHESIS_ERROR',
        error
      );
    }
  }

  /**
   * Generate wake word response audio
   * 
   * @returns {Promise<Buffer>} Audio buffer with wake word response
   * 
   * @example
   * const audio = await parser.getWakeWordResponse();
   */
  async getWakeWordResponse(): Promise<Buffer> {
    try {
      const result = await this.tts.synthesizeWakeWordResponse();
      return result.audio;
    } catch (error) {
      logger.error('Failed to generate wake word response', { error });
      throw new CommandExecutionError(
        'Wake word response generation failed',
        'WAKE_WORD_ERROR',
        error
      );
    }
  }
}

/**
 * Create and export a singleton instance
 */
let parserInstance: CommandParser | null = null;

/**
 * Get or create command parser instance
 * 
 * @returns {CommandParser} Singleton instance
 */
export function getCommandParser(): CommandParser {
  if (!parserInstance) {
    parserInstance = new CommandParser();
  }
  return parserInstance;
}

export default CommandParser;

// Made with Bob
