/**
 * Chat Panel Component
 * 
 * Main chat interface for voice and text interactions with Ollama.
 * Displays conversation history and handles user input.
 * 
 * @module renderer/components/ChatPanel
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChatStore } from '../../store/chat.store';
import { useAppStore } from '../../store/app.store';
import './ChatPanel.css';

/**
 * Chat panel component
 * 
 * @returns {JSX.Element} The chat panel component
 */
export const ChatPanel: React.FC = () => {
  const { messages, isLoading, sendMessage, clearMessages } = useChatStore();
  const { activeSessionId, isMicActive } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  /**
   * Scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Handle send message
   */
  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setInputValue('');
    await sendMessage(text);
  };

  /**
   * Handle clear chat
   */
  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      clearMessages();
    }
  };

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-panel__header">
        <div className="chat-panel__title">
          <h2>Chat</h2>
          {activeSessionId && (
            <span className="chat-panel__session-id" title={`Session: ${activeSessionId}`}>
              Session: {activeSessionId.slice(0, 8)}...
            </span>
          )}
        </div>
        <div className="chat-panel__actions">
          <button
            className="chat-panel__action-btn"
            onClick={handleClear}
            disabled={messages.length === 0}
            title="Clear chat history"
            aria-label="Clear chat"
          >
            🗑️ Clear
          </button>
          <button
            className="chat-panel__action-btn"
            onClick={() => {/* TODO: New session */}}
            title="Start new session"
            aria-label="New session"
          >
            ➕ New Session
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="chat-panel__messages">
        {messages.length === 0 ? (
          <div className="chat-panel__empty">
            <div className="chat-panel__empty-icon">🎙️</div>
            <h3>Welcome to Ollama Voice Orchestrator</h3>
            <p>Say "Ollama" to activate voice commands or type your message below.</p>
            <div className="chat-panel__suggestions">
              <h4>Try asking:</h4>
              <ul>
                <li>"Show me installed models"</li>
                <li>"Run llama2 model"</li>
                <li>"Download mistral model"</li>
                <li>"What models are running?"</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="chat-panel__loading">
            <div className="chat-panel__loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Processing...</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat-panel__input-container">
        {isMicActive && (
          <div className="chat-panel__mic-indicator">
            <span className="chat-panel__mic-pulse"></span>
            Listening...
          </div>
        )}
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          disabled={isLoading}
          placeholder={isMicActive ? 'Listening for voice input...' : 'Type a message or say "Ollama"...'}
        />
      </div>
    </div>
  );
};

// Made with Bob
