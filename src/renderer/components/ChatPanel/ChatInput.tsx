/**
 * Chat Input Component
 * 
 * Text input field for chat messages with send button and keyboard shortcuts.
 * 
 * @module renderer/components/ChatPanel/ChatInput
 */

import React, { KeyboardEvent } from 'react';
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
 * Chat input component
 * 
 * @param {ChatInputProps} props - Component props
 * @returns {JSX.Element} The chat input component
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}) => {
  /**
   * Handle key press (Enter to send, Shift+Enter for new line)
   */
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Handle send button click
   */
  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value);
    }
  };

  return (
    <div className="chat-input">
      <textarea
        className="chat-input__field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        aria-label="Message input"
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

// Made with Bob
