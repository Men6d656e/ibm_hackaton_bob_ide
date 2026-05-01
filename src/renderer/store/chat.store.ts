/**
 * Chat State Store
 * 
 * Manages chat messages, conversation history, and message operations.
 * 
 * @module renderer/store/chat.store
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
        const { addMessage } = get();
        
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

          // TODO: Call backend API to process message
          // For now, simulate a response
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const processingTime = Date.now() - startTime;

          // Add assistant response
          addMessage({
            role: 'assistant',
            content: `I received your message: "${content}". This is a placeholder response. Backend integration coming in Phase 7.`,
            processingTime,
          });
        } catch (error) {
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
    }),
    { name: 'OVO-ChatStore' }
  )
);

// Made with Bob
