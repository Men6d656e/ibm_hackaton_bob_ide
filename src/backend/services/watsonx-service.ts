/**
 * IBM watsonx.ai Service
 * 
 * @description Provides AI-powered command processing using IBM watsonx.ai
 * with function calling capabilities for Ollama operations
 * 
 * @module backend/services/watsonx-service
 */

import WatsonxAI from '@ibm-cloud/watsonx-ai';
import logger from '../utils/logger';

/**
 * Function tool definition for Ollama operations
 */
interface FunctionTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, any>;
      required: string[];
    };
  };
}

/**
 * Command processing result
 */
export interface CommandResult {
  intent: string;
  function: string;
  parameters: Record<string, any>;
  confidence: number;
  rawResponse: string;
}

/**
 * watsonx.ai Service Class
 * 
 * @class WatsonxService
 * @description Handles AI-powered natural language processing and function calling
 */
export class WatsonxService {
  private client: any;
  private projectId: string;
  private tools: FunctionTool[];

  /**
   * Creates an instance of WatsonxService
   * 
   * @param {string} apiKey - IBM Cloud API key
   * @param {string} projectId - watsonx.ai project ID
   * @param {string} [serviceUrl] - Optional service URL
   */
  constructor(apiKey: string, projectId: string, serviceUrl?: string) {
    this.projectId = projectId;
    
    // Initialize watsonx.ai client
    this.client = WatsonxAI.newInstance({
      version: '2024-05-31',
      serviceUrl: serviceUrl || 'https://us-south.ml.cloud.ibm.com',
      authenticator: new WatsonxAI.IamAuthenticator({
        apikey: apiKey,
      }),
    });

    // Define function tools for Ollama operations
    this.tools = this.defineTools();
    
    logger.info('watsonx.ai service initialized');
  }

  /**
   * Define function tools for Ollama command operations
   * 
   * @returns {FunctionTool[]} Array of function tool definitions
   * @private
   */
  private defineTools(): FunctionTool[] {
    return [
      {
        type: 'function',
        function: {
          name: 'list_models',
          description: 'List all installed Ollama models on the system',
          parameters: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'show_model',
          description: 'Show detailed information about a specific Ollama model',
          parameters: {
            type: 'object',
            properties: {
              model_name: {
                type: 'string',
                description: 'The name of the model to show information for',
              },
            },
            required: ['model_name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'run_model',
          description: 'Run an Ollama model with an optional prompt',
          parameters: {
            type: 'object',
            properties: {
              model_name: {
                type: 'string',
                description: 'The name of the model to run',
              },
              prompt: {
                type: 'string',
                description: 'Optional prompt to send to the model',
              },
            },
            required: ['model_name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'stop_model',
          description: 'Stop a currently running Ollama model',
          parameters: {
            type: 'object',
            properties: {
              model_name: {
                type: 'string',
                description: 'The name of the model to stop',
              },
            },
            required: ['model_name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'pull_model',
          description: 'Download and install a new Ollama model from the registry',
          parameters: {
            type: 'object',
            properties: {
              model_name: {
                type: 'string',
                description: 'The name of the model to download (e.g., llama2, mistral)',
              },
            },
            required: ['model_name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'remove_model',
          description: 'Remove/delete an installed Ollama model',
          parameters: {
            type: 'object',
            properties: {
              model_name: {
                type: 'string',
                description: 'The name of the model to remove',
              },
            },
            required: ['model_name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_running_models',
          description: 'Get a list of currently running Ollama models',
          parameters: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'copy_model',
          description: 'Create a copy of an existing model with a new name',
          parameters: {
            type: 'object',
            properties: {
              source_model: {
                type: 'string',
                description: 'The name of the model to copy from',
              },
              destination_model: {
                type: 'string',
                description: 'The new name for the copied model',
              },
            },
            required: ['source_model', 'destination_model'],
          },
        },
      },
    ];
  }

  /**
   * Process a natural language command and extract intent with function calling
   * 
   * @param {string} userCommand - The user's natural language command
   * @param {string} [conversationHistory] - Optional conversation context
   * @returns {Promise<CommandResult>} Parsed command with function and parameters
   * @throws {Error} If command processing fails
   * 
   * @example
   * const result = await watsonx.processCommand("show me all installed models");
   * // Returns: { intent: "list_models", function: "list_models", parameters: {}, ... }
   */
  async processCommand(
    userCommand: string,
    conversationHistory?: string
  ): Promise<CommandResult> {
    try {
      logger.info('Processing command with watsonx.ai', { command: userCommand });

      const systemPrompt = `You are an AI assistant for Ollama Voice Orchestrator. 
Your role is to understand user commands related to Ollama model management and call the appropriate function.
Be concise and helpful. Always use function calling when the user wants to perform an action.

Available operations:
- List models: Show all installed models
- Show model: Display details about a specific model
- Run model: Execute a model with optional prompt
- Stop model: Stop a running model
- Pull/Download model: Install a new model
- Remove/Delete model: Uninstall a model
- Get running models: Show currently active models
- Copy model: Duplicate a model with a new name`;

      const messages = [
        { role: 'system', content: systemPrompt },
      ];

      if (conversationHistory) {
        messages.push({ role: 'assistant', content: conversationHistory });
      }

      messages.push({ role: 'user', content: userCommand });

      // Call watsonx.ai with function calling
      const response = await this.client.generateText({
        projectId: this.projectId,
        modelId: 'meta-llama/llama-3-70b-instruct',
        input: messages,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
        },
        tools: this.tools,
        tool_choice: 'auto',
      });

      // Parse the response
      const result = this.parseResponse(response, userCommand);
      
      logger.info('Command processed successfully', { 
        intent: result.intent,
        function: result.function 
      });

      return result;
    } catch (error) {
      logger.error('Failed to process command', { error, command: userCommand });
      throw new Error(`Command processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse watsonx.ai response and extract function call information
   * 
   * @param {any} response - The raw response from watsonx.ai
   * @param {string} originalCommand - The original user command
   * @returns {CommandResult} Parsed command result
   * @private
   */
  private parseResponse(response: any, originalCommand: string): CommandResult {
    // Extract function call from response
    const toolCalls = response.results?.[0]?.tool_calls || [];
    
    if (toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      const functionName = toolCall.function.name;
      const parameters = JSON.parse(toolCall.function.arguments || '{}');

      return {
        intent: functionName,
        function: functionName,
        parameters,
        confidence: 0.9, // High confidence when function is called
        rawResponse: response.results?.[0]?.generated_text || '',
      };
    }

    // Fallback: parse from generated text if no function call
    const generatedText = response.results?.[0]?.generated_text || '';
    return this.fallbackParse(generatedText, originalCommand);
  }

  /**
   * Fallback parser when no function call is detected
   * 
   * @param {string} text - Generated text from AI
   * @param {string} command - Original command
   * @returns {CommandResult} Best-effort parsed result
   * @private
   */
  private fallbackParse(text: string, command: string): CommandResult {
    const lowerCommand = command.toLowerCase();
    
    // Simple keyword matching as fallback
    if (lowerCommand.includes('list') || lowerCommand.includes('show all')) {
      return {
        intent: 'list_models',
        function: 'list_models',
        parameters: {},
        confidence: 0.6,
        rawResponse: text,
      };
    }
    
    if (lowerCommand.includes('running')) {
      return {
        intent: 'get_running_models',
        function: 'get_running_models',
        parameters: {},
        confidence: 0.6,
        rawResponse: text,
      };
    }

    // Default: treat as general query
    return {
      intent: 'unknown',
      function: 'none',
      parameters: { query: command },
      confidence: 0.3,
      rawResponse: text,
    };
  }

  /**
   * Generate a natural language response based on command result
   * 
   * @param {string} functionName - The function that was executed
   * @param {any} result - The result from the function execution
   * @returns {Promise<string>} Natural language response
   * 
   * @example
   * const response = await watsonx.generateResponse("list_models", modelsArray);
   */
  async generateResponse(functionName: string, result: any): Promise<string> {
    try {
      const prompt = `Generate a concise, natural response for the user based on this Ollama operation:

Function: ${functionName}
Result: ${JSON.stringify(result, null, 2)}

Provide a friendly, conversational response in 1-2 sentences. Be specific about what was done.`;

      const response = await this.client.generateText({
        projectId: this.projectId,
        modelId: 'meta-llama/llama-3-70b-instruct',
        input: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
        },
      });

      return response.results?.[0]?.generated_text || 'Operation completed successfully.';
    } catch (error) {
      logger.error('Failed to generate response', { error });
      return 'Operation completed.';
    }
  }
}

/**
 * Create and export a singleton instance
 */
let watsonxInstance: WatsonxService | null = null;

/**
 * Get or create watsonx.ai service instance
 * 
 * @returns {WatsonxService} Singleton instance
 * @throws {Error} If required environment variables are missing
 */
export function getWatsonxService(): WatsonxService {
  if (!watsonxInstance) {
    const apiKey = process.env.WATSONX_API_KEY;
    const projectId = process.env.WATSONX_PROJECT_ID;

    if (!apiKey || !projectId) {
      throw new Error('WATSONX_API_KEY and WATSONX_PROJECT_ID must be set in environment variables');
    }

    watsonxInstance = new WatsonxService(apiKey, projectId);
  }

  return watsonxInstance;
}

export default WatsonxService;

// Made with Bob
