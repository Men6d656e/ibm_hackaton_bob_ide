/**
 * Voice Processing Routes
 * 
 * @description API endpoints for voice command processing, transcription, and synthesis
 * 
 * @module backend/routes/voice.routes
 */

import { Router, Request, Response } from 'express';
import { getCommandParser } from '../services/command-parser';
import { getWhisperService } from '../services/whisper-service';
import { getTTSService } from '../services/tts-service';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /api/voice/process-command
 * Process a complete voice command from audio to response
 */
router.post('/process-command', async (req: Request, res: Response) => {
  try {
    const { audioData, filename, conversationHistory } = req.body;

    if (!audioData || !filename) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'audioData and filename are required',
        },
      });
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');

    const parser = getCommandParser();
    const result = await parser.processVoiceCommand(
      audioBuffer,
      filename,
      conversationHistory
    );

    logger.info('Voice command processed', {
      intent: result.intent,
      processingTime: result.processingTime,
    });

    return res.status(200).json({
      success: true,
      data: {
        transcript: result.transcript,
        intent: result.intent,
        function: result.function,
        parameters: result.parameters,
        result: result.executionResult,
        response: result.responseText,
        audioResponse: result.responseAudio.toString('base64'),
        processingTime: result.processingTime,
      },
    });
  } catch (error) {
    logger.error('Failed to process voice command', { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'VOICE_PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'Failed to process voice command',
      },
    });
  }
});

/**
 * POST /api/voice/process-text
 * Process a text command (skip STT)
 */
router.post('/process-text', async (req: Request, res: Response) => {
  try {
    const { text, conversationHistory } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'text is required',
        },
      });
    }

    const parser = getCommandParser();
    const result = await parser.processTextCommand(text, conversationHistory);

    logger.info('Text command processed', {
      intent: result.intent,
      processingTime: result.processingTime,
    });

    return res.status(200).json({
      success: true,
      data: {
        intent: result.intent,
        function: result.function,
        parameters: result.parameters,
        result: result.executionResult,
        response: result.responseText,
        audioResponse: result.responseAudio.toString('base64'),
        processingTime: result.processingTime,
      },
    });
  } catch (error) {
    logger.error('Failed to process text command', { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'TEXT_PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'Failed to process text command',
      },
    });
  }
});

/**
 * POST /api/voice/transcribe
 * Transcribe audio to text using Whisper
 */
router.post('/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioData, filename, language, prompt } = req.body;

    if (!audioData || !filename) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'audioData and filename are required',
        },
      });
    }

    const audioBuffer = Buffer.from(audioData, 'base64');
    const whisper = getWhisperService();

    const result = await whisper.transcribeBuffer(audioBuffer, filename, {
      language,
      prompt,
    });

    logger.info('Audio transcribed', {
      textLength: result.text.length,
      duration: result.duration,
    });

    return res.status(200).json({
      success: true,
      data: {
        text: result.text,
        language: result.language,
        duration: result.duration,
      },
    });
  } catch (error) {
    logger.error('Failed to transcribe audio', { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'TRANSCRIPTION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to transcribe audio',
      },
    });
  }
});

/**
 * POST /api/voice/synthesize
 * Convert text to speech using Watson TTS
 */
router.post('/synthesize', async (req: Request, res: Response) => {
  try {
    const { text, voice, format } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'text is required',
        },
      });
    }

    const tts = getTTSService();

    // Validate text length
    if (!tts.isValidTextLength(text)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TEXT_LENGTH',
          message: 'Text must be between 1 and 5000 characters',
        },
      });
    }

    const result = await tts.synthesize(text, {
      voice,
      accept: format || 'audio/mp3',
    });

    logger.info('Text synthesized', {
      textLength: text.length,
      audioSize: result.audio.length,
    });

    return res.status(200).json({
      success: true,
      data: {
        audio: result.audio.toString('base64'),
        contentType: result.contentType,
        duration: result.duration,
      },
    });
  } catch (error) {
    logger.error('Failed to synthesize text', { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'SYNTHESIS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to synthesize text',
      },
    });
  }
});

/**
 * GET /api/voice/wake-word-response
 * Get a random wake word response audio
 */
router.get('/wake-word-response', async (_req: Request, res: Response) => {
  try {
    const parser = getCommandParser();
    const audioBuffer = await parser.getWakeWordResponse();

    logger.info('Wake word response generated');

    return res.status(200).json({
      success: true,
      data: {
        audio: audioBuffer.toString('base64'),
        contentType: 'audio/mp3',
      },
    });
  } catch (error) {
    logger.error('Failed to generate wake word response', { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'WAKE_WORD_ERROR',
        message: error instanceof Error ? error.message : 'Failed to generate wake word response',
      },
    });
  }
});

/**
 * GET /api/voice/available-voices
 * Get list of available TTS voices
 */
router.get('/available-voices', async (_req: Request, res: Response) => {
  try {
    const tts = getTTSService();
    const voices = await tts.listVoices();

    return res.status(200).json({
      success: true,
      data: voices,
    });
  } catch (error) {
    logger.error('Failed to list voices', { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'VOICE_LIST_ERROR',
        message: error instanceof Error ? error.message : 'Failed to list voices',
      },
    });
  }
});

/**
 * POST /api/voice/estimate-cost
 * Estimate cost for transcription and synthesis
 */
router.post('/estimate-cost', async (req: Request, res: Response) => {
  try {
    const { audioDurationSeconds, textLength } = req.body;

    const whisper = getWhisperService();
    const tts = getTTSService();

    const transcriptionCost = audioDurationSeconds
      ? whisper.getEstimatedCost(audioDurationSeconds)
      : 0;

    const synthesisCost = textLength ? tts.getEstimatedCost(textLength) : 0;

    return res.status(200).json({
      success: true,
      data: {
        transcriptionCost,
        synthesisCost,
        totalCost: transcriptionCost + synthesisCost,
        currency: 'USD',
      },
    });
  } catch (error) {
    logger.error('Failed to estimate cost', { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'COST_ESTIMATION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to estimate cost',
      },
    });
  }
});

export default router;

// Made with Bob
