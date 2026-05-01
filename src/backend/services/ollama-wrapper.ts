/**
 * Ollama CLI Wrapper Service
 * 
 * @description Provides a TypeScript interface to Ollama CLI commands with error handling,
 * retry logic, and type safety. This service wraps all Ollama operations and provides
 * a clean API for the rest of the application.
 * 
 * @module backend/services/ollama-wrapper
 * @author OVO Team
 * @version 1.0.0
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Interface representing an Ollama model
 * 
 * @interface IOllamaModel
 */
export interface IOllamaModel {
  /** Model name (e.g., "llama2", "mistral") */
  name: string;
  /** Model size in human-readable format (e.g., "3.8GB") */
  size: string;
  /** Last modified timestamp */
  modified: Date;
  /** Model digest/hash */
  digest: string;
  /** Model parameters (e.g., "7B", "13B") */
  parameters?: string;
  /** Quantization method (e.g., "Q4_0", "Q8_0") */
  quantization?: string;
  /** Model family (e.g., "llama", "mistral") */
  family?: string;
}

/**
 * Interface for running model information
 * 
 * @interface IRunningModel
 */
export interface IRunningModel {
  /** Model name */
  name: string;
  /** Process ID */
  pid: number;
  /** Memory usage in MB */
  memory: number;
  /** Uptime in seconds */
  uptime: number;
}

/**
 * Interface for model run options
 * 
 * @interface IModelRunOptions
 */
export interface IModelRunOptions {
  /** Temperature for generation (0.0 - 1.0) */
  temperature?: number;
  /** Context length */
  contextLength?: number;
  /** Additional parameters */
  [key: string]: any;
}

/**
 * Custom error class for Ollama-related errors
 * 
 * @class OllamaError
 * @extends Error
 */
export class OllamaError extends Error {
  /**
   * Creates an instance of OllamaError
   * 
   * @param {string} message - Error message
   * @param {Error} [cause] - Original error that caused this error
   */
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'OllamaError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Ollama CLI Wrapper Class
 * 
 * @class OllamaWrapper
 * @description Provides methods to interact with Ollama CLI
 * 
 * @example
 * ```typescript
 * const ollama = new OllamaWrapper();
 * const models = await ollama.listModels();
 * console.log(models);
 * ```
 */
export class OllamaWrapper {
  private readonly ollamaCommand: string;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  /**
   * Creates an instance of OllamaWrapper
   * 
   * @param {string} [ollamaCommand='ollama'] - Path to ollama CLI command
   * @param {number} [maxRetries=3] - Maximum number of retry attempts
   * @param {number} [retryDelay=1000] - Delay between retries in milliseconds
   */
  constructor(
    ollamaCommand: string = 'ollama',
    maxRetries: number = 3,
    retryDelay: number = 1000
  ) {
    this.ollamaCommand = ollamaCommand;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * Executes an Ollama CLI command with retry logic
   * 
   * @private
   * @param {string} command - Command to execute
   * @param {number} [attempt=1] - Current attempt number
   * @returns {Promise<string>} Command output
   * @throws {OllamaError} If command fails after all retries
   */
  private async executeCommand(command: string, attempt: number = 1): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('Pulling')) {
        console.warn(`Ollama warning: ${stderr}`);
      }
      
      return stdout.trim();
    } catch (error) {
      if (attempt < this.maxRetries) {
        console.log(`Retry attempt ${attempt}/${this.maxRetries} for command: ${command}`);
        await this.delay(this.retryDelay);
        return this.executeCommand(command, attempt + 1);
      }
      
      throw new OllamaError(
        `Failed to execute Ollama command after ${this.maxRetries} attempts`,
        error as Error
      );
    }
  }

  /**
   * Delays execution for specified milliseconds
   * 
   * @private
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Checks if Ollama CLI is available
   * 
   * @returns {Promise<boolean>} True if Ollama is available
   * 
   * @example
   * ```typescript
   * const isAvailable = await ollama.isAvailable();
   * if (!isAvailable) {
   *   console.error('Ollama is not installed');
   * }
   * ```
   */
  async isAvailable(): Promise<boolean> {
    try {
      await execAsync(`${this.ollamaCommand} --version`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lists all installed Ollama models
   * 
   * @returns {Promise<IOllamaModel[]>} Array of installed models
   * @throws {OllamaError} If Ollama CLI is not available or command fails
   * 
   * @example
   * ```typescript
   * const models = await ollama.listModels();
   * models.forEach(model => {
   *   console.log(`${model.name} - ${model.size}`);
   * });
   * ```
   */
  async listModels(): Promise<IOllamaModel[]> {
    const output = await this.executeCommand(`${this.ollamaCommand} list`);
    
    // Parse the output (format: NAME    SIZE    MODIFIED    DIGEST)
    const lines = output.split('\n').slice(1); // Skip header
    
    return lines
      .filter((line) => line.trim())
      .map((line) => {
        const parts = line.trim().split(/\s+/);
        return {
          name: parts[0],
          size: parts[1] || 'Unknown',
          modified: new Date(parts[2] || Date.now()),
          digest: parts[3] || '',
        };
      });
  }

  /**
   * Shows detailed information about a specific model
   * 
   * @param {string} modelName - Name of the model
   * @returns {Promise<IOllamaModel>} Model information
   * @throws {OllamaError} If model not found or command fails
   * 
   * @example
   * ```typescript
   * const modelInfo = await ollama.showModel('llama2');
   * console.log(`Parameters: ${modelInfo.parameters}`);
   * ```
   */
  async showModel(modelName: string): Promise<IOllamaModel> {
    const output = await this.executeCommand(`${this.ollamaCommand} show ${modelName}`);
    
    // Parse model information from output
    const model: IOllamaModel = {
      name: modelName,
      size: 'Unknown',
      modified: new Date(),
      digest: '',
    };
    
    // Extract information from output
    const lines = output.split('\n');
    lines.forEach((line) => {
      if (line.includes('parameters')) {
        model.parameters = line.split(':')[1]?.trim();
      }
      if (line.includes('quantization')) {
        model.quantization = line.split(':')[1]?.trim();
      }
      if (line.includes('family')) {
        model.family = line.split(':')[1]?.trim();
      }
    });
    
    return model;
  }

  /**
   * Runs a model (starts the model server)
   * 
   * @param {string} modelName - Name of the model to run
   * @param {IModelRunOptions} [options] - Optional run parameters
   * @returns {Promise<void>}
   * @throws {OllamaError} If model fails to start
   * 
   * @example
   * ```typescript
   * await ollama.runModel('llama2', {
   *   temperature: 0.7,
   *   contextLength: 4096
   * });
   * ```
   */
  async runModel(modelName: string, options?: IModelRunOptions): Promise<void> {
    let command = `${this.ollamaCommand} run ${modelName}`;
    
    if (options) {
      // Add options to command if provided
      if (options.temperature) {
        command += ` --temperature ${options.temperature}`;
      }
      if (options.contextLength) {
        command += ` --context-length ${options.contextLength}`;
      }
    }
    
    await this.executeCommand(command);
  }

  /**
   * Stops a running model
   * 
   * @param {string} modelName - Name of the model to stop
   * @returns {Promise<void>}
   * @throws {OllamaError} If model fails to stop
   * 
   * @example
   * ```typescript
   * await ollama.stopModel('llama2');
   * ```
   */
  async stopModel(modelName: string): Promise<void> {
    await this.executeCommand(`${this.ollamaCommand} stop ${modelName}`);
  }

  /**
   * Pulls (downloads) a model from the registry
   * 
   * @param {string} modelName - Name of the model to pull
   * @param {string} [tag='latest'] - Model tag/version
   * @returns {Promise<void>}
   * @throws {OllamaError} If download fails
   * 
   * @example
   * ```typescript
   * await ollama.pullModel('llama3', 'latest');
   * console.log('Model downloaded successfully');
   * ```
   */
  async pullModel(modelName: string, tag: string = 'latest'): Promise<void> {
    const fullName = tag === 'latest' ? modelName : `${modelName}:${tag}`;
    await this.executeCommand(`${this.ollamaCommand} pull ${fullName}`);
  }

  /**
   * Removes an installed model
   * 
   * @param {string} modelName - Name of the model to remove
   * @returns {Promise<void>}
   * @throws {OllamaError} If removal fails
   * 
   * @example
   * ```typescript
   * await ollama.removeModel('old-model');
   * console.log('Model removed successfully');
   * ```
   */
  async removeModel(modelName: string): Promise<void> {
    await this.executeCommand(`${this.ollamaCommand} rm ${modelName}`);
  }

  /**
   * Lists all currently running models
   * 
   * @returns {Promise<IRunningModel[]>} Array of running models
   * @throws {OllamaError} If command fails
   * 
   * @example
   * ```typescript
   * const running = await ollama.getRunningModels();
   * console.log(`${running.length} models are running`);
   * ```
   */
  async getRunningModels(): Promise<IRunningModel[]> {
    const output = await this.executeCommand(`${this.ollamaCommand} ps`);
    
    // Parse the output (format: NAME    PID    MEMORY    UPTIME)
    const lines = output.split('\n').slice(1); // Skip header
    
    return lines
      .filter((line) => line.trim())
      .map((line) => {
        const parts = line.trim().split(/\s+/);
        return {
          name: parts[0],
          pid: parseInt(parts[1], 10),
          memory: this.parseMemory(parts[2]),
          uptime: this.parseUptime(parts[3]),
        };
      });
  }

  /**
   * Copies a model to a new name
   * 
   * @param {string} source - Source model name
   * @param {string} destination - Destination model name
   * @returns {Promise<void>}
   * @throws {OllamaError} If copy fails
   * 
   * @example
   * ```typescript
   * await ollama.copyModel('llama2', 'llama2-backup');
   * ```
   */
  async copyModel(source: string, destination: string): Promise<void> {
    await this.executeCommand(`${this.ollamaCommand} cp ${source} ${destination}`);
  }

  /**
   * Parses memory string to MB
   * 
   * @private
   * @param {string} memoryStr - Memory string (e.g., "2.1GB", "512MB")
   * @returns {number} Memory in MB
   */
  private parseMemory(memoryStr: string): number {
    const match = memoryStr.match(/^([\d.]+)([A-Z]+)$/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'GB':
        return value * 1024;
      case 'MB':
        return value;
      case 'KB':
        return value / 1024;
      default:
        return value;
    }
  }

  /**
   * Parses uptime string to seconds
   * 
   * @private
   * @param {string} uptimeStr - Uptime string (e.g., "00:15:32")
   * @returns {number} Uptime in seconds
   */
  private parseUptime(uptimeStr: string): number {
    const parts = uptimeStr.split(':').map((p) => parseInt(p, 10));
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  }
}

/**
 * Default export - singleton instance
 */
export default new OllamaWrapper();

// Made with Bob
