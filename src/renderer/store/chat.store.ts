/**
 * Chat State Store
 *
 * Manages chat messages, conversation history, and message operations.
 * Integrated with backend API for real-time session management.
 *
 * @module renderer/store/chat.store
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getApiService, type Session, type Message, type SessionStatistics } from '../services/api-service';

/**
 * Message role type
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Chat message interface
 */
export interface ChatMessage {
  /** Unique message ID */
  id: string;
  
  /** Message role */
  role: MessageRole;
  
  /** Message content */
  content: string;
  
  /** Timestamp */
  timestamp: Date;
  
  /** Whether message is from voice input */
  isVoice?: boolean;
  
  /** Processing time in ms */
  processingTime?: number;
  
  /** Error if any */
  error?: string;
}

/**
 * Chat state interface
 */
interface ChatState {
  /** All messages in current session */
  messages: ChatMessage[];
  
  /** Whether a message is being processed */
  isLoading: boolean;
  
  /** Current input text */
  inputText: string;
  
  /** Current active session */
  currentSession: Session | null;
  
  /** Session statistics */
  sessionStats: SessionStatistics | null;
  
  /** Context usage percentage */
  contextUsage: number;
  
  /** Whether context is full */
  isContextFull: boolean;
}

/**
 * Chat actions interface
 */
interface ChatActions {
  /** Add a message to the chat */
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  
  /** Send a user message and get response */
  sendMessage: (content: string, isVoice?: boolean) => Promise<void>;
  
  /** Clear all messages */
  clearMessages: () => void;
  
  /** Set input text */
  setInputText: (text: string) => void;
  
  /** Set loading state */
  setLoading: (isLoading: boolean) => void;
  
  /** Create new session */
  createSession: (title: string, modelName: string) => Promise<void>;
  
  /** Load session */
  loadSession: (sessionId: string) => Promise<void>;
  
  /** Load messages from backend */
  loadMessages: (sessionId: string) => Promise<void>;
  
  /** Update session statistics */
  updateStatistics: () => Promise<void>;
  
  /** Check context status */
  checkContextStatus: () => Promise<void>;
  
  /** Clear current session */
  clearSession: () => void;
}

/**
 * Combined store type
 */
type ChatStore = ChatState & ChatActions;

/**
 * Generate unique message ID
 */
const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Chat store hook
 * 
 * @example
 * ```tsx
 * const { messages, sendMessage } = useChatStore();
 * ```
 */
export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      messages: [],
      isLoading: false,
      inputText: '',
      currentSession: null,
      sessionStats: null,
      contextUsage: 0,
      isContextFull: false,

      // Actions
      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: generateMessageId(),
          timestamp: new Date(),
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      sendMessage: async (content, isVoice = false) => {
        const { addMessage, currentSession, updateStatistics, checkContextStatus } = get();
        const api = getApiService();
        
        // Check if we have an active session
        if (!currentSession) {
          console.error('No active session');
          addMessage({
            role: 'assistant',
            content: 'Please create a session first.',
            error: 'No active session',
          });
          return;
        }

        // Add user message
        addMessage({
          role: 'user',
          content,
          isVoice,
        });

        // Set loading state
        set({ isLoading: true });

        try {
          const startTime = Date.now();

          // Save user message to backend
          const userMessageResponse = await api.addMessage(currentSession.id, {
            role: 'user',
            content,
            token_count: Math.ceil(content.length / 4), // Rough estimate
          });

          if (!userMessageResponse.success) {
            throw new Error(userMessageResponse.error?.message || 'Failed to save message');
          }

          // Process message with backend (using text command for now)
          const processResponse = await api.processTextCommand({
            text: content,
            conversationHistory: get().messages.map(m => ({
              role: m.role,
              content: m.content,
            })),
          });

          const processingTime = Date.now() - startTime;

          if (processResponse.success && processResponse.data) {
            const { response } = processResponse.data;

            // Save assistant response to backend
            await api.addMessage(currentSession.id, {
              role: 'assistant',
              content: response,
              token_count: Math.ceil(response.length / 4),
            });

            // Add assistant response to UI
            addMessage({
              role: 'assistant',
              content: response,
              processingTime,
            });

            // Update statistics and context status
            await updateStatistics();
            await checkContextStatus();
          } else {
            throw new Error(processResponse.error?.message || 'Failed to process message');
          }
        } catch (error) {
          console.error('Failed to send message:', error);
          // Add error message
          addMessage({
            role: 'assistant',
            content: 'Sorry, I encountered an error processing your request.',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      setInputText: (text) => {
        set({ inputText: text });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      createSession: async (title, modelName) => {
        const api = getApiService();
        
        try {
          const response = await api.createSession({
            title,
            model_name: modelName,
            max_context_length: 4096, // Default context length
          });

          if (response.success && response.data) {
            set({
              currentSession: response.data,
              messages: [],
              sessionStats: null,
              contextUsage: 0,
              isContextFull: false,
            });
          } else {
            throw new Error(response.error?.message || 'Failed to create session');
          }
        } catch (error) {
          console.error('Failed to create session:', error);
          throw error;
        }
      },

      loadSession: async (sessionId) => {
        const api = getApiService();
        
        try {
          const sessionResponse = await api.getSession(sessionId);
          
          if (sessionResponse.success && sessionResponse.data) {
            set({ currentSession: sessionResponse.data });
            
            // Load messages for this session
            await get().loadMessages(sessionId);
            
            // Update statistics
            await get().updateStatistics();
            await get().checkContextStatus();
          } else {
            throw new Error(sessionResponse.error?.message || 'Failed to load session');
          }
        } catch (error) {
          console.error('Failed to load session:', error);
          throw error;
        }
      },

      loadMessages: async (sessionId) => {
        const api = getApiService();
        
        try {
          const response = await api.getMessages(sessionId);
          
          if (response.success && response.data) {
            // Convert backend messages to chat messages
            const chatMessages: ChatMessage[] = response.data.map((msg: Message) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.created_at),
              isVoice: false,
            }));
            
            set({ messages: chatMessages });
          } else {
            throw new Error(response.error?.message || 'Failed to load messages');
          }
        } catch (error) {
          console.error('Failed to load messages:', error);
          throw error;
        }
      },

      updateStatistics: async () => {
        const { currentSession } = get();
        if (!currentSession) return;

        const api = getApiService();
        
        try {
          const response = await api.getSessionStatistics(currentSession.id);
          
          if (response.success && response.data) {
            set({
              sessionStats: response.data,
              contextUsage: response.data.context_usage_percentage,
            });
          }
        } catch (error) {
          console.error('Failed to update statistics:', error);
        }
      },

      checkContextStatus: async () => {
        const { currentSession } = get();
        if (!currentSession) return;

        const api = getApiService();
        
        try {
          const response = await api.checkContextStatus(currentSession.id);
          
          if (response.success && response.data) {
            set({ isContextFull: response.data.is_full });
          }
        } catch (error) {
          console.error('Failed to check context status:', error);
        }
      },

      clearSession: () => {
        set({
          currentSession: null,
          messages: [],
          sessionStats: null,
          contextUsage: 0,
          isContextFull: false,
        });
      },
    }),
    { name: 'OVO-ChatStore' }
  )
);

// Made with Bob
