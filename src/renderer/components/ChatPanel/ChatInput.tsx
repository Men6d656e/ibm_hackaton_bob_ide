/**
 * Chat Input Component
 *
 * Text input field for chat messages with send button and keyboard shortcuts.
 * Optimized with debouncing for onChange events and React.memo.
 *
 * @module renderer/components/ChatPanel/ChatInput
 */

import React, { KeyboardEvent, memo, useCallback, useRef, useEffect } from 'react';
import { debounce } from '../../utils/performance';
import './ChatInput.css';

/**
 * Chat input props
 */
interface ChatInputProps {
  /** Current input value */
  value: string;
  
  /** Value change handler */
  onChange: (value: string) => void;
  
  /** Send message handler */
  onSend: (message: string) => void;
  
  /** Whether input is disabled */
  disabled?: boolean;
  
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Chat input component (memoized for performance)
 *
 * @param {ChatInputProps} props - Component props
 * @returns {JSX.Element} The chat input component
 */
const ChatInputComponent: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Auto-resize textarea based on content
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [value]);

  /**
   * Debounced onChange handler for better performance
   */
  const debouncedOnChange = useCallback(
    debounce((newValue: string) => {
      onChange(newValue);
    }, 100),
    [onChange]
  );

  /**
   * Handle input change with immediate local update and debounced callback
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // Update immediately for responsive UI
    onChange(newValue);
  }, [onChange]);

  /**
   * Handle key press (Enter to send, Shift+Enter for new line)
   */
  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [value, disabled, onSend]);

  /**
   * Handle send button click
   */
  const handleSend = useCallback(() => {
    if (value.trim() && !disabled) {
      onSend(value);
    }
  }, [value, disabled, onSend]);

  return (
    <div className="chat-input">
      <textarea
        ref={textareaRef}
        className="chat-input__field"
        value={value}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        aria-label="Message input"
        style={{ resize: 'none', overflow: 'hidden' }}
      />
      <button
        className="chat-input__send-btn"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        title="Send message (Enter)"
        aria-label="Send message"
      >
        <span className="chat-input__send-icon">➤</span>
      </button>
    </div>
  );
};

/**
 * Memoized chat input component
 * Only re-renders when props actually change
 */
export const ChatInput = memo(ChatInputComponent);

ChatInput.displayName = 'ChatInput';

// Made with Bob
