/**
 * Unit tests for OllamaWrapper service
 * 
 * Tests the Ollama CLI wrapper functionality including:
 * - Model listing
 * - Model running
 * - Model stopping
 * - Error handling
 * - Retry logic
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';
import { OllamaWrapper, OllamaError, IOllamaModel, IRunningModel } from '../../../src/backend/services/ollama-wrapper';

// Mock child_process
jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

jest.mock('util', () => ({
  promisify: jest.fn((fn) => fn),
}));

describe('OllamaWrapper', () => {
  let wrapper: OllamaWrapper;
  let mockExec: jest.MockedFunction<typeof exec>;

  beforeEach(() => {
    wrapper = new OllamaWrapper();
    mockExec = exec as jest.MockedFunction<typeof exec>;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('isAvailable', () => {
    it('should return true when Ollama is available', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'ollama version 0.1.0', stderr: '' });
        return {} as any;
      });

      const result = await wrapper.isAvailable();

      expect(result).toBe(true);
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('ollama --version'),
        expect.any(Function)
      );
    });

    it('should return false when Ollama is not available', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('Command not found'), null);
        return {} as any;
      });

      const result = await wrapper.isAvailable();

      expect(result).toBe(false);
    });
  });

  describe('listModels', () => {
    it('should return array of models when Ollama is available', async () => {
      const mockOutput = `NAME                    SIZE      MODIFIED       DIGEST
llama2:latest          3.8GB     2 days ago     abc123
codellama:latest       7.2GB     1 week ago     def456`;

      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: mockOutput, stderr: '' });
        return {} as any;
      });

      const models = await wrapper.listModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(2);
      expect(models[0]).toHaveProperty('name', 'llama2:latest');
      expect(models[0]).toHaveProperty('size', '3.8GB');
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('ollama list'),
        expect.any(Function)
      );
    });

    it('should return empty array when no models installed', async () => {
      const mockOutput = `NAME                    SIZE      MODIFIED       DIGEST`;

      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: mockOutput, stderr: '' });
        return {} as any;
      });

      const models = await wrapper.listModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(0);
    });

    it('should throw OllamaError when command fails', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('Command failed'), null);
        return {} as any;
      });

      await expect(wrapper.listModels()).rejects.toThrow(OllamaError);
    });

    it('should retry on temporary failures', async () => {
      let callCount = 0;
      mockExec.mockImplementation((cmd, callback: any) => {
        callCount++;
        if (callCount < 3) {
          callback(new Error('Temporary error'), null);
        } else {
          callback(null, { stdout: 'NAME\nllama2:latest 3.8GB 1day abc123', stderr: '' });
        }
        return {} as any;
      });

      const models = await wrapper.listModels();

      expect(models.length).toBeGreaterThan(0);
      expect(mockExec).toHaveBeenCalledTimes(3);
    });
  });

  describe('showModel', () => {
    it('should return model information', async () => {
      const mockOutput = `Model: llama2:latest
parameters: 7B
quantization: Q4_0
family: llama`;

      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: mockOutput, stderr: '' });
        return {} as any;
      });

      const model = await wrapper.showModel('llama2:latest');

      expect(model).toHaveProperty('name', 'llama2:latest');
      expect(model).toHaveProperty('parameters', '7B');
      expect(model).toHaveProperty('quantization', 'Q4_0');
      expect(model).toHaveProperty('family', 'llama');
    });

    it('should handle model not found error', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('Model not found'), null);
        return {} as any;
      });

      await expect(wrapper.showModel('nonexistent')).rejects.toThrow(OllamaError);
    });
  });

  describe('runModel', () => {
    it('should successfully run a model without options', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'Model started', stderr: '' });
        return {} as any;
      });

      await expect(wrapper.runModel('llama2:latest')).resolves.not.toThrow();
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('ollama run llama2:latest'),
        expect.any(Function)
      );
    });

    it('should run model with options', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'Model started', stderr: '' });
        return {} as any;
      });

      await wrapper.runModel('llama2:latest', {
        temperature: 0.7,
        contextLength: 4096,
      });

      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('--temperature 0.7'),
        expect.any(Function)
      );
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('--context-length 4096'),
        expect.any(Function)
      );
    });

    it('should handle model not found error', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('Model not found'), null);
        return {} as any;
      });

      await expect(wrapper.runModel('nonexistent')).rejects.toThrow(OllamaError);
    });
  });

  describe('stopModel', () => {
    it('should successfully stop a running model', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'Model stopped', stderr: '' });
        return {} as any;
      });

      await expect(wrapper.stopModel('llama2:latest')).resolves.not.toThrow();
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('ollama stop llama2:latest'),
        expect.any(Function)
      );
    });

    it('should handle error when stopping model', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('Model not running'), null);
        return {} as any;
      });

      await expect(wrapper.stopModel('llama2:latest')).rejects.toThrow(OllamaError);
    });
  });

  describe('getRunningModels', () => {
    it('should return list of running models', async () => {
      const mockOutput = `NAME                    PID       MEMORY    UPTIME
llama2:latest          12345     2048MB    1h30m
codellama:latest       67890     4096MB    30m`;

      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: mockOutput, stderr: '' });
        return {} as any;
      });

      const models = await wrapper.getRunningModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(2);
      expect(models[0]).toHaveProperty('name', 'llama2:latest');
      expect(models[0]).toHaveProperty('pid', 12345);
    });

    it('should return empty array when no models running', async () => {
      const mockOutput = `NAME                    PID       MEMORY    UPTIME`;

      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: mockOutput, stderr: '' });
        return {} as any;
      });

      const models = await wrapper.getRunningModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(0);
    });
  });

  describe('pullModel', () => {
    it('should successfully pull a model with default tag', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'Pulling model...', stderr: 'Pulling...' });
        return {} as any;
      });

      await expect(wrapper.pullModel('llama3')).resolves.not.toThrow();
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('ollama pull llama3'),
        expect.any(Function)
      );
    });

    it('should pull model with specific tag', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'Pulling model...', stderr: 'Pulling...' });
        return {} as any;
      });

      await wrapper.pullModel('llama3', '13b');

      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('ollama pull llama3:13b'),
        expect.any(Function)
      );
    });

    it('should handle network errors during pull', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('Network error'), null);
        return {} as any;
      });

      await expect(wrapper.pullModel('llama3')).rejects.toThrow(OllamaError);
    });
  });

  describe('removeModel', () => {
    it('should successfully remove a model', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'Model removed', stderr: '' });
        return {} as any;
      });

      await expect(wrapper.removeModel('llama2:latest')).resolves.not.toThrow();
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('ollama rm llama2:latest'),
        expect.any(Function)
      );
    });

    it('should handle removing non-existent model', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('Model not found'), null);
        return {} as any;
      });

      await expect(wrapper.removeModel('nonexistent')).rejects.toThrow(OllamaError);
    });
  });

  describe('copyModel', () => {
    it('should successfully copy a model', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'Model copied', stderr: '' });
        return {} as any;
      });

      await expect(wrapper.copyModel('llama2', 'llama2-backup')).resolves.not.toThrow();
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('ollama cp llama2 llama2-backup'),
        expect.any(Function)
      );
    });

    it('should handle copy errors', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('Copy failed'), null);
        return {} as any;
      });

      await expect(wrapper.copyModel('source', 'dest')).rejects.toThrow(OllamaError);
    });
  });

  describe('Error handling', () => {
    it('should create OllamaError with cause', () => {
      const originalError = new Error('Original error');
      const ollamaError = new OllamaError('Wrapped error', originalError);

      expect(ollamaError.name).toBe('OllamaError');
      expect(ollamaError.message).toBe('Wrapped error');
      expect(ollamaError.cause).toBe(originalError);
    });

    it('should handle stderr warnings without throwing', async () => {
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'NAME\nllama2 3.8GB 1day abc', stderr: 'Warning: something' });
        return {} as any;
      });

      const models = await wrapper.listModels();

      expect(models.length).toBeGreaterThan(0);
    });
  });
});

// Made with Bob