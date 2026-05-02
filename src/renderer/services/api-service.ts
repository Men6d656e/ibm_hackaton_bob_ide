/**
 * API Service
 * 
 * Centralized service for all backend API communication.
 * Provides type-safe methods for Ollama, session, and voice operations.
 * 
 * @module renderer/services/api-service
 */

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: Record<string, any>;
}

/**
 * Ollama model interface
 */
export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
  details?: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

/**
 * Session interface
 */
export interface Session {
  id: string;
  title: string;
  model_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  max_context_length: number;
  current_token_count: number;
  metadata?: Record<string, any>;
}

/**
 * Message interface
 */
export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  token_count: number;
  created_at: string;
  metadata?: Record<string, any>;
}

/**
 * Session statistics interface
 */
export interface SessionStatistics {
  total_messages: number;
  total_tokens: number;
  user_messages: number;
  assistant_messages: number;
  average_response_time: number;
  context_usage_percentage: number;
}

/**
 * Voice processing result interface
 */
export interface VoiceProcessingResult {
  transcript: string;
  intent: string;
  function: string;
  parameters: Record<string, any>;
  result: any;
  response: string;
  audioResponse: string;
  processingTime: number;
}

/**
 * API configuration
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

/**
 * API Service class
 */
export class ApiService {
  private config: ApiConfig;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:3000/api',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
    };
  }

  /**
   * Make HTTP request with error handling and retries
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      // Retry on network errors
      if (retryCount < this.config.retries && this.isRetryableError(error)) {
        await this.delay(Math.pow(2, retryCount) * 1000);
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      };
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    return (
      error.name === 'AbortError' ||
      error.message.includes('fetch') ||
      error.message.includes('network')
    );
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== Ollama API Methods ====================

  /**
   * List all installed Ollama models
   */
  async listModels(): Promise<ApiResponse<OllamaModel[]>> {
    return this.request<OllamaModel[]>('/ollama/models');
  }

  /**
   * Get details of a specific model
   */
  async getModel(name: string): Promise<ApiResponse<OllamaModel>> {
    return this.request<OllamaModel>(`/ollama/models/${encodeURIComponent(name)}`);
  }

  /**
   * Run a model with optional prompt
   */
  async runModel(params: {
    modelName: string;
    prompt?: string;
    context?: number[];
    temperature?: number;
    stream?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request('/ollama/models/run', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Stop a running model
   */
  async stopModel(modelName: string): Promise<ApiResponse<any>> {
    return this.request('/ollama/models/stop', {
      method: 'POST',
      body: JSON.stringify({ modelName }),
    });
  }

  /**
   * Pull a model from Ollama registry
   */
  async pullModel(modelName: string): Promise<ApiResponse<any>> {
    return this.request('/ollama/models/pull', {
      method: 'POST',
      body: JSON.stringify({ modelName }),
    });
  }

  /**
   * Remove an installed model
   */
  async removeModel(name: string): Promise<ApiResponse<any>> {
    return this.request(`/ollama/models/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get list of currently running models
   */
  async getRunningModels(): Promise<ApiResponse<OllamaModel[]>> {
    return this.request<OllamaModel[]>('/ollama/models/running');
  }

  /**
   * Copy a model to a new name
   */
  async copyModel(source: string, destination: string): Promise<ApiResponse<any>> {
    return this.request('/ollama/models/copy', {
      method: 'POST',
      body: JSON.stringify({ source, destination }),
    });
  }

  // ==================== Session API Methods ====================

  /**
   * Create a new session
   */
  async createSession(params: {
    title: string;
    model_name: string;
    max_context_length?: number;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<Session>> {
    return this.request<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Get all sessions
   */
  async getSessions(activeOnly = false): Promise<ApiResponse<Session[]>> {
    const query = activeOnly ? '?active=true' : '';
    return this.request<Session[]>(`/sessions${query}`);
  }

  /**
   * Get session by ID
   */
  async getSession(id: string): Promise<ApiResponse<Session>> {
    return this.request<Session>(`/sessions/${id}`);
  }

  /**
   * Update session
   */
  async updateSession(
    id: string,
    params: {
      title?: string;
      is_active?: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<ApiResponse<Session>> {
    return this.request<Session>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  /**
   * Delete session
   */
  async deleteSession(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Add message to session
   */
  async addMessage(
    sessionId: string,
    params: {
      role: 'user' | 'assistant' | 'system';
      content: string;
      token_count?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<ApiResponse<Message>> {
    return this.request<Message>(`/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Get messages for session
   */
  async getMessages(sessionId: string, limit?: number): Promise<ApiResponse<Message[]>> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<Message[]>(`/sessions/${sessionId}/messages${query}`);
  }

  /**
   * Get session statistics
   */
  async getSessionStatistics(sessionId: string): Promise<ApiResponse<SessionStatistics>> {
    return this.request<SessionStatistics>(`/sessions/${sessionId}/statistics`);
  }

  /**
   * Clear session messages
   */
  async clearMessages(sessionId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/sessions/${sessionId}/messages`, {
      method: 'DELETE',
    });
  }

  /**
   * Check if session context is full
   */
  async checkContextStatus(sessionId: string): Promise<ApiResponse<{ is_full: boolean }>> {
    return this.request<{ is_full: boolean }>(`/sessions/${sessionId}/context-status`);
  }

  // ==================== Voice API Methods ====================

  /**
   * Process voice command from audio
   */
  async processVoiceCommand(params: {
    audioData: string;
    filename: string;
    conversationHistory?: any[];
  }): Promise<ApiResponse<VoiceProcessingResult>> {
    return this.request<VoiceProcessingResult>('/voice/process-command', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Process text command (skip STT)
   */
  async processTextCommand(params: {
    text: string;
    conversationHistory?: any[];
  }): Promise<ApiResponse<VoiceProcessingResult>> {
    return this.request<VoiceProcessingResult>('/voice/process-text', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Transcribe audio to text
   */
  async transcribeAudio(params: {
    audioData: string;
    filename: string;
    language?: string;
    prompt?: string;
  }): Promise<ApiResponse<{ text: string; language: string; duration: number }>> {
    return this.request('/voice/transcribe', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Synthesize text to speech
   */
  async synthesizeText(params: {
    text: string;
    voice?: string;
    format?: string;
  }): Promise<ApiResponse<{ audio: string; contentType: string; duration: number }>> {
    return this.request('/voice/synthesize', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Get wake word response audio
   */
  async getWakeWordResponse(): Promise<ApiResponse<{ audio: string; contentType: string }>> {
    return this.request('/voice/wake-word-response');
  }

  /**
   * Get available TTS voices
   */
  async getAvailableVoices(): Promise<ApiResponse<any[]>> {
    return this.request('/voice/available-voices');
  }

  /**
   * Estimate cost for voice operations
   */
  async estimateCost(params: {
    audioDurationSeconds?: number;
    textLength?: number;
  }): Promise<ApiResponse<{
    transcriptionCost: number;
    synthesisCost: number;
    totalCost: number;
    currency: string;
  }>> {
    return this.request('/voice/estimate-cost', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ==================== Utility Methods ====================

  /**
   * Update API configuration
   */
  updateConfig(config: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiConfig {
    return { ...this.config };
  }
}

/**
 * Singleton instance
 */
let apiServiceInstance: ApiService | null = null;

/**
 * Get API service instance
 */
export function getApiService(config?: Partial<ApiConfig>): ApiService {
  if (!apiServiceInstance) {
    apiServiceInstance = new ApiService(config);
  } else if (config) {
    apiServiceInstance.updateConfig(config);
  }
  return apiServiceInstance;
}

/**
 * Reset API service instance
 */
export function resetApiService(): void {
  apiServiceInstance = null;
}

// Made with Bob