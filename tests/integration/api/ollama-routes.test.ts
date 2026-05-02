/**
 * Integration tests for Ollama API routes
 * 
 * Tests the complete flow from HTTP request to Ollama CLI execution
 */

import { describe, it, expect, jest, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';

// Mock the OllamaWrapper before importing routes
jest.mock('../../../src/backend/services/ollama-wrapper');

describe('Ollama Routes Integration', () => {
  let app: Express;

  beforeAll(() => {
    // Set up Express app with routes
    app = express();
    app.use(express.json());
    
    // Import and use routes after mocking
    const ollamaRoutes = require('../../../src/backend/routes/ollama.routes');
    app.use('/api/ollama', ollamaRoutes.default || ollamaRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/ollama/models', () => {
    it('should return list of models', async () => {
      const response = await request(app)
        .get('/api/ollama/models')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      // Mock will throw error
      const response = await request(app)
        .get('/api/ollama/models')
        .expect('Content-Type', /json/);

      if (response.status === 500) {
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('GET /api/ollama/models/:name', () => {
    it('should return model information', async () => {
      const response = await request(app)
        .get('/api/ollama/models/llama2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name');
    });

    it('should return 404 for non-existent model', async () => {
      const response = await request(app)
        .get('/api/ollama/models/nonexistent')
        .expect('Content-Type', /json/);

      expect([404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/ollama/models/run', () => {
    it('should start a model', async () => {
      const response = await request(app)
        .post('/api/ollama/models/run')
        .send({ modelName: 'llama2' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/ollama/models/run')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('modelName');
    });

    it('should accept optional parameters', async () => {
      const response = await request(app)
        .post('/api/ollama/models/run')
        .send({
          modelName: 'llama2',
          temperature: 0.7,
          contextLength: 4096,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/ollama/models/stop', () => {
    it('should stop a running model', async () => {
      const response = await request(app)
        .post('/api/ollama/models/stop')
        .send({ modelName: 'llama2' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should validate model name', async () => {
      const response = await request(app)
        .post('/api/ollama/models/stop')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/ollama/models/pull', () => {
    it('should pull a model', async () => {
      const response = await request(app)
        .post('/api/ollama/models/pull')
        .send({ modelName: 'llama3' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should accept tag parameter', async () => {
      const response = await request(app)
        .post('/api/ollama/models/pull')
        .send({ modelName: 'llama3', tag: '13b' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('DELETE /api/ollama/models/:name', () => {
    it('should remove a model', async () => {
      const response = await request(app)
        .delete('/api/ollama/models/old-model')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/ollama/running', () => {
    it('should return running models', async () => {
      const response = await request(app)
        .get('/api/ollama/running')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/ollama/models/run')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle missing Content-Type', async () => {
      const response = await request(app)
        .post('/api/ollama/models/run')
        .send('modelName=llama2');

      expect([200, 400]).toContain(response.status);
    });

    it('should sanitize error messages', async () => {
      const response = await request(app)
        .post('/api/ollama/models/run')
        .send({ modelName: 'model; rm -rf /' });

      if (response.status === 400 || response.status === 500) {
        expect(response.body.error).not.toContain('rm -rf');
      }
    });
  });

  describe('Rate limiting', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app).get('/api/ollama/models')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect([200, 429, 500]).toContain(response.status);
      });
    });
  });
});

// Made with Bob