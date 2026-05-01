/**
 * Session API Routes
 * 
 * @description Express routes for session management
 * @module backend/routes/session
 */

import { Router, type Request, type Response } from 'express';
import { SessionModel } from '../models/session.model';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /api/sessions
 * Create a new session
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, model_name, max_context_length, metadata } = req.body;

    if (!title || !model_name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'title and model_name are required',
        },
      });
    }

    const session = await SessionModel.create({
      title,
      model_name,
      max_context_length,
      metadata,
    });

    logger.info('Session created', { sessionId: session.id, modelName: model_name });

    return res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    logger.error('Failed to create session', { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'SESSION_CREATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to create session',
      },
    });
  }
});

/**
 * GET /api/sessions
 * Get all sessions
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active === 'true';
    const sessions = await SessionModel.findAll(activeOnly);

    logger.info('Retrieved sessions', { count: sessions.length, activeOnly });

    return res.status(200).json({
      success: true,
      data: sessions,
      meta: {
        count: sessions.length,
        activeOnly,
      },
    });
  } catch (error) {
    logger.error('Failed to retrieve sessions', { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'SESSION_RETRIEVE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to retrieve sessions',
      },
    });
  }
});

/**
 * GET /api/sessions/:id
 * Get session by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionId = Array.isArray(id) ? id[0] : id;
    const session = await SessionModel.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found',
        },
      });
    }

    logger.info('Retrieved session', { sessionId: id });

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    logger.error('Failed to retrieve session', { sessionId: req.params.id, error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'SESSION_RETRIEVE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to retrieve session',
      },
    });
  }
});

/**
 * PUT /api/sessions/:id
 * Update session
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionId = Array.isArray(id) ? id[0] : id;
    const { title, is_active, metadata } = req.body;

    const session = await SessionModel.update(sessionId, {
      title,
      is_active,
      metadata,
    });

    logger.info('Session updated', { sessionId: id });

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    logger.error('Failed to update session', { sessionId: req.params.id, error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'SESSION_UPDATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to update session',
      },
    });
  }
});

/**
 * DELETE /api/sessions/:id
 * Delete session
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionId = Array.isArray(id) ? id[0] : id;
    await SessionModel.delete(sessionId);

    logger.info('Session deleted', { sessionId: id });

    return res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete session', { sessionId: req.params.id, error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'SESSION_DELETE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to delete session',
      },
    });
  }
});

/**
 * POST /api/sessions/:id/messages
 * Add message to session
 */
router.post('/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionId = Array.isArray(id) ? id[0] : id;
    const { role, content, token_count, metadata } = req.body;

    if (!role || !content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'role and content are required',
        },
      });
    }

    const message = await SessionModel.addMessage(sessionId, {
      role,
      content,
      token_count: token_count || 0,
      metadata,
    });

    logger.info('Message added to session', { sessionId: id, messageId: message.id });

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    logger.error('Failed to add message', { sessionId: req.params.id, error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'MESSAGE_ADD_FAILED',
        message: error instanceof Error ? error.message : 'Failed to add message',
      },
    });
  }
});

/**
 * GET /api/sessions/:id/messages
 * Get messages for session
 */
router.get('/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionId = Array.isArray(id) ? id[0] : id;
    const parsedLimit = req.query.limit ? parseInt(req.query.limit as string) : NaN;
    const limit = !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined;
    
    const messages = await SessionModel.getMessages(sessionId, limit);

    logger.info('Retrieved session messages', { sessionId: id, count: messages.length });

    return res.status(200).json({
      success: true,
      data: messages,
      meta: {
        count: messages.length,
      },
    });
  } catch (error) {
    logger.error('Failed to retrieve messages', { sessionId: req.params.id, error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'MESSAGES_RETRIEVE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to retrieve messages',
      },
    });
  }
});

/**
 * GET /api/sessions/:id/statistics
 * Get session statistics
 */
router.get('/:id/statistics', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionId = Array.isArray(id) ? id[0] : id;
    const stats = await SessionModel.getStatistics(sessionId);

    logger.info('Retrieved session statistics', { sessionId: id });

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to retrieve statistics', { sessionId: req.params.id, error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'STATISTICS_RETRIEVE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to retrieve statistics',
      },
    });
  }
});

/**
 * DELETE /api/sessions/:id/messages
 * Clear session messages
 */
router.delete('/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionId = Array.isArray(id) ? id[0] : id;
    await SessionModel.clearMessages(sessionId);

    logger.info('Session messages cleared', { sessionId: id });

    return res.status(200).json({
      success: true,
      message: 'Session messages cleared successfully',
    });
  } catch (error) {
    logger.error('Failed to clear messages', { sessionId: req.params.id, error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'MESSAGES_CLEAR_FAILED',
        message: error instanceof Error ? error.message : 'Failed to clear messages',
      },
    });
  }
});

/**
 * GET /api/sessions/:id/context-status
 * Check if session context is full
 */
router.get('/:id/context-status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionId = Array.isArray(id) ? id[0] : id;
    const isFull = await SessionModel.isContextFull(sessionId);

    return res.status(200).json({
      success: true,
      data: {
        is_full: isFull,
      },
    });
  } catch (error) {
    logger.error('Failed to check context status', { sessionId: req.params.id, error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'CONTEXT_CHECK_FAILED',
        message: error instanceof Error ? error.message : 'Failed to check context status',
      },
    });
  }
});

export default router;

// Made with Bob