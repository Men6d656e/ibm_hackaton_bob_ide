/**
 * Status Bar Component
 * 
 * Bottom status bar displaying connection status, active session, and quick actions.
 * 
 * @module renderer/components/StatusBar
 */

import React from 'react';
import { useAppStore } from '../../store/app.store';
import './StatusBar.css';

/**
 * Status bar component
 * 
 * @returns {JSX.Element} The status bar component
 */
export const StatusBar: React.FC = () => {
  const { activeSessionId, isMicActive, isProcessingVoice, toggleMic } = useAppStore();

  return (
    <footer className="status-bar">
      {/* Left Section - Connection Status */}
      <div className="status-bar__section status-bar__section--left">
        <div className="status-bar__item" title="Backend connection status">
          <span className="status-bar__indicator status-bar__indicator--connected"></span>
          <span className="status-bar__text">Connected</span>
        </div>
        
        {activeSessionId && (
          <div className="status-bar__item" title={`Active session: ${activeSessionId}`}>
            <span className="status-bar__icon">💬</span>
            <span className="status-bar__text">Session: {activeSessionId.slice(0, 8)}...</span>
          </div>
        )}
      </div>

      {/* Center Section - Voice Status */}
      <div className="status-bar__section status-bar__section--center">
        <button
          className={`status-bar__mic-btn ${isMicActive ? 'status-bar__mic-btn--active' : ''}`}
          onClick={toggleMic}
          title={isMicActive ? 'Deactivate microphone' : 'Activate microphone'}
          aria-label={isMicActive ? 'Deactivate microphone' : 'Activate microphone'}
        >
          <span className="status-bar__mic-icon">
            {isProcessingVoice ? '🎤' : isMicActive ? '🎙️' : '🔇'}
          </span>
          <span className="status-bar__mic-text">
            {isProcessingVoice
              ? 'Processing...'
              : isMicActive
                ? 'Listening'
                : 'Click to activate'}
          </span>
        </button>
      </div>

      {/* Right Section - System Info */}
      <div className="status-bar__section status-bar__section--right">
        <div className="status-bar__item" title="Ollama version">
          <span className="status-bar__icon">🤖</span>
          <span className="status-bar__text">Ollama v0.1.0</span>
        </div>
        
        <div className="status-bar__item" title="Application version">
          <span className="status-bar__icon">ℹ️</span>
          <span className="status-bar__text">OVO v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};

// Made with Bob
