/**
 * Chat Message Component
 * 
 * Displays individual chat messages with role-based styling.
 * 
 * @module renderer/components/ChatPanel/ChatMessage
 */

import React from 'react';
import type { ChatMessage as ChatMessageType } from '../../store/chat.store';
import './ChatMessage.css';

/**
 * Chat message props
 */
interface ChatMessageProps {
  /** Message data */
  message: ChatMessageType;
}

/**
 * Format timestamp to readable string
 */
const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Chat message component
 * 
 * @param {ChatMessageProps} props - Component props
 * @returns {JSX.Element} The chat message component
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { role, content, timestamp, isVoice, processingTime, error } = message;

  return (
    <div className={`chat-message chat-message--${role}`} data-voice={isVoice}>
      {/* Avatar */}
      <div className="chat-message__avatar">
        {role === 'user' ? '👤' : role === 'assistant' ? '🤖' : 'ℹ️'}
      </div>

      {/* Content */}
      <div className="chat-message__content">
        {/* Header */}
        <div className="chat-message__header">
          <span className="chat-message__role">
            {role === 'user' ? 'You' : role === 'assistant' ? 'Ollama' : 'System'}
          </span>
          <span className="chat-message__time">{formatTime(timestamp)}</span>
          {isVoice && (
            <span className="chat-message__badge" title="Voice input">
              🎙️
            </span>
          )}
        </div>

        {/* Message Text */}
        <div className="chat-message__text">{content}</div>

        {/* Metadata */}
        {(processingTime || error) && (
          <div className="chat-message__meta">
            {processingTime && (
              <span className="chat-message__processing-time">
                ⏱️ {(processingTime / 1000).toFixed(2)}s
              </span>
            )}
            {error && (
              <span className="chat-message__error" title={error}>
                ⚠️ Error
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Made with Bob
