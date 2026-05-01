/**
 * Ollama API Routes
 * 
 * @description Express routes for Ollama model operations
 * @module backend/routes/ollama
 */

import { Router, type Request, type Response } from 'express';
import { OllamaWrapper } from '../services/ollama-wrapper';
import logger from '../utils/logger';

const router = Router();
const ollama = new OllamaWrapper();

/**
 * GET /api/ollama/models
 * List all installed Ollama models
 */
router.get('/models', async (_req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const models = await ollama.listModels();
    const duration = Date.now() - startTime;

    logger.info('Listed Ollama models', { count: models.length, duration });

    return res.status(200).json({
      success: true,
      data: models,
      meta: {
        count: models.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Failed to list models', { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'MODEL_LIST_FAILED',
        message: error instanceof Error ? error.message : 'Failed to list models',
      },
    });
  }
});

/**
 * GET /api/ollama/models/:name
 * Get details of a specific model
 */
router.get('/models/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const modelName = Array.isArray(name) ? name[0] : name;
    const startTime = Date.now();
    const model = await ollama.showModel(modelName);
    const duration = Date.now() - startTime;

    logger.info('Retrieved model details', { modelName: name, duration });

    return res.status(200).json({
      success: true,
      data: model,
    });
  } catch (error) {
    logger.error('Failed to get model details', { modelName: req.params.name, error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'MODEL_DETAILS_FAILED',
        message: error instanceof Error ? error.message : 'Failed to get model details',
      },
    });
  }
});

/**
 * POST /api/ollama/models/run
 * Run a model with optional prompt
 */
router.post('/models/run', async (req: Request, res: Response) => {
  try {
    const { modelName, prompt, context, temperature, stream } = req.body;

    if (!modelName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'modelName is required',
        },
      });
    }

    const startTime = Date.now();
    const result = await ollama.runModel(modelName, {
      prompt,
      context,
      temperature,
      stream,
    });
    const duration = Date.now() - startTime;

    logger.info('Model executed', { modelName, duration });

    return res.status(200).json({
      success: true,
      data: result,
      meta: {
        executionTime: duration,
      },
    });
  } catch (error) {
    logger.error('Failed to run model', { modelName: req.body.modelName, error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'MODEL_RUN_FAILED',
        message: error instanceof Error ? error.message : 'Failed to run model',
      },
    });
  }
});

/**
 * POST /api/ollama/models/stop
 * Stop a running model
 */
router.post('/models/stop', async (req: Request, res: Response) => {
  try {
    const { modelName } = req.body;

    if (!modelName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'modelName is required',
        },
      });
    }

    const startTime = Date.now();
    const result = await ollama.stopModel(modelName);
    const duration = Date.now() - startTime;

    logger.info('Model stopped', { modelName, duration });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Failed to stop model', { modelName: req.body.modelName, error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'MODEL_STOP_FAILED',
        message: error instanceof Error ? error.message : 'Failed to stop model',
      },
    });
  }
});

/**
 * POST /api/ollama/models/pull
 * Download a model from Ollama registry
 */
router.post('/models/pull', async (req: Request, res: Response) => {
  try {
    const { modelName } = req.body;

    if (!modelName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'modelName is required',
        },
      });
    }

    const startTime = Date.now();
    const result = await ollama.pullModel(modelName);
    const duration = Date.now() - startTime;

    logger.info('Model pulled', { modelName, duration });

    return res.status(200).json({
      success: true,
      data: result,
      meta: {
        downloadTime: duration,
      },
    });
  } catch (error) {
    logger.error('Failed to pull model', { modelName: req.body.modelName, error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'MODEL_PULL_FAILED',
        message: error instanceof Error ? error.message : 'Failed to pull model',
      },
    });
  }
});

/**
 * DELETE /api/ollama/models/:name
 * Remove an installed model
 */
router.delete('/models/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const modelName = Array.isArray(name) ? name[0] : name;
    const startTime = Date.now();
    const result = await ollama.removeModel(modelName);
    const duration = Date.now() - startTime;

    logger.info('Model removed', { modelName: name, duration });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Failed to remove model', { modelName: req.params.name, error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'MODEL_REMOVE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to remove model',
      },
    });
  }
});

/**
 * GET /api/ollama/models/running
 * Get list of currently running models
 */
router.get('/models/running', async (_req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const models = await ollama.getRunningModels();
    const duration = Date.now() - startTime;

    logger.info('Retrieved running models', { count: models.length, duration });

    return res.status(200).json({
      success: true,
      data: models,
      meta: {
        count: models.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Failed to get running models', { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'RUNNING_MODELS_FAILED',
        message: error instanceof Error ? error.message : 'Failed to get running models',
      },
    });
  }
});

/**
 * POST /api/ollama/models/copy
 * Copy a model to a new name
 */
router.post('/models/copy', async (req: Request, res: Response) => {
  try {
    const { source, destination } = req.body;

    if (!source || !destination) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'source and destination are required',
        },
      });
    }

    const startTime = Date.now();
    const result = await ollama.copyModel(source, destination);
    const duration = Date.now() - startTime;

    logger.info('Model copied', { source, destination, duration });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Failed to copy model', { 
      source: req.body.source, 
      destination: req.body.destination, 
      error 
    });
    return res.status(500).json({
      success: false,
      error: {
        code: 'MODEL_COPY_FAILED',
        message: error instanceof Error ? error.message : 'Failed to copy model',
      },
    });
  }
});

export default router;

// Made with Bob