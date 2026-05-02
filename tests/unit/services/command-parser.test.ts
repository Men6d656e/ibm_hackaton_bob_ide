/**
 * Unit tests for CommandParser service
 * 
 * Tests the command parsing and function calling functionality
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { CommandParser } from '../../../src/backend/services/command-parser';

describe('CommandParser', () => {
  let parser: CommandParser;

  beforeEach(() => {
    parser = new CommandParser();
    jest.clearAllMocks();
  });

  describe('parseCommand', () => {
    it('should parse list models command', async () => {
      const input = 'list all available models';
      
      const result = await parser.parseCommand(input);

      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('function');
      expect(result.function).toBe('list_models');
    });

    it('should parse run model command with model name', async () => {
      const input = 'run llama2 model';
      
      const result = await parser.parseCommand(input);

      expect(result.function).toBe('run_model');
      expect(result.parameters).toHaveProperty('modelName');
      expect(result.parameters.modelName).toContain('llama2');
    });

    it('should parse stop model command', async () => {
      const input = 'stop the running model';
      
      const result = await parser.parseCommand(input);

      expect(result.function).toBe('stop_model');
    });

    it('should parse pull model command', async () => {
      const input = 'download llama3 model';
      
      const result = await parser.parseCommand(input);

      expect(result.function).toBe('pull_model');
      expect(result.parameters).toHaveProperty('modelName');
    });

    it('should parse remove model command', async () => {
      const input = 'delete old-model';
      
      const result = await parser.parseCommand(input);

      expect(result.function).toBe('remove_model');
      expect(result.parameters).toHaveProperty('modelName');
    });

    it('should handle ambiguous commands', async () => {
      const input = 'do something';
      
      const result = await parser.parseCommand(input);

      expect(result).toHaveProperty('intent');
      expect(result.confidence).toBeLessThan(0.8);
    });

    it('should extract parameters from natural language', async () => {
      const input = 'run llama2 with temperature 0.7 and context length 4096';
      
      const result = await parser.parseCommand(input);

      expect(result.parameters).toHaveProperty('temperature', 0.7);
      expect(result.parameters).toHaveProperty('contextLength', 4096);
    });
  });

  describe('getFunctionDefinitions', () => {
    it('should return all available function definitions', () => {
      const definitions = parser.getFunctionDefinitions();

      expect(Array.isArray(definitions)).toBe(true);
      expect(definitions.length).toBeGreaterThan(0);
      expect(definitions[0]).toHaveProperty('name');
      expect(definitions[0]).toHaveProperty('description');
      expect(definitions[0]).toHaveProperty('parameters');
    });

    it('should include list_models function', () => {
      const definitions = parser.getFunctionDefinitions();
      
      const listModels = definitions.find(d => d.name === 'list_models');
      expect(listModels).toBeDefined();
      expect(listModels?.description).toContain('list');
    });

    it('should include run_model function with parameters', () => {
      const definitions = parser.getFunctionDefinitions();
      
      const runModel = definitions.find(d => d.name === 'run_model');
      expect(runModel).toBeDefined();
      expect(runModel?.parameters).toHaveProperty('modelName');
    });
  });

  describe('validateParameters', () => {
    it('should validate required parameters', () => {
      const params = { modelName: 'llama2' };
      const required = ['modelName'];

      const isValid = parser.validateParameters(params, required);

      expect(isValid).toBe(true);
    });

    it('should reject missing required parameters', () => {
      const params = {};
      const required = ['modelName'];

      const isValid = parser.validateParameters(params, required);

      expect(isValid).toBe(false);
    });

    it('should allow optional parameters', () => {
      const params = { modelName: 'llama2', temperature: 0.7 };
      const required = ['modelName'];

      const isValid = parser.validateParameters(params, required);

      expect(isValid).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid input gracefully', async () => {
      const input = '';
      
      await expect(parser.parseCommand(input)).rejects.toThrow();
    });

    it('should handle null input', async () => {
      const input = null as any;
      
      await expect(parser.parseCommand(input)).rejects.toThrow();
    });

    it('should sanitize malicious input', async () => {
      const input = 'run model; rm -rf /';
      
      const result = await parser.parseCommand(input);

      expect(result.parameters.modelName).not.toContain(';');
      expect(result.parameters.modelName).not.toContain('rm');
    });
  });

  describe('Confidence scoring', () => {
    it('should return high confidence for clear commands', async () => {
      const input = 'list all models';
      
      const result = await parser.parseCommand(input);

      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should return low confidence for unclear commands', async () => {
      const input = 'maybe do something with models';
      
      const result = await parser.parseCommand(input);

      expect(result.confidence).toBeLessThan(0.6);
    });
  });
});

// Made with Bob