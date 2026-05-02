/**
 * Context Monitor Component
 * 
 * Displays context length usage and warnings when approaching limits.
 * Provides visual feedback for token usage in the current session.
 * 
 * @module renderer/components/ContextMonitor
 */

import React, { useEffect } from 'react';
import { useChatStore } from '../../store/chat.store';
import './ContextMonitor.css';

/**
 * Context monitor component
 * 
 * @returns {JSX.Element} The context monitor component
 */
export const ContextMonitor: React.FC = () => {
  const {
    currentSession,
    contextUsage,
    isContextFull,
    sessionStats,
    updateStatistics,
    checkContextStatus,
  } = useChatStore();

  /**
   * Update statistics periodically
   */
  useEffect(() => {
    if (!currentSession) return;

    // Update immediately
    updateStatistics();
    checkContextStatus();

    // Update every 30 seconds
    const interval = setInterval(() => {
      updateStatistics();
      checkContextStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [currentSession, updateStatistics, checkContextStatus]);

  // Don't render if no session
  if (!currentSession) {
    return null;
  }

  /**
   * Get status color based on usage
   */
  const getStatusColor = (): string => {
    if (isContextFull || contextUsage >= 95) return 'critical';
    if (contextUsage >= 80) return 'warning';
    if (contextUsage >= 60) return 'caution';
    return 'normal';
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (): string => {
    if (isContextFull || contextUsage >= 95) return '🔴';
    if (contextUsage >= 80) return '🟡';
    if (contextUsage >= 60) return '🟠';
    return '🟢';
  };

  /**
   * Get status text
   */
  const getStatusText = (): string => {
    if (isContextFull) return 'Context Full';
    if (contextUsage >= 95) return 'Almost Full';
    if (contextUsage >= 80) return 'High Usage';
    if (contextUsage >= 60) return 'Moderate';
    return 'Normal';
  };

  const statusColor = getStatusColor();
  const statusIcon = getStatusIcon();
  const statusText = getStatusText();

  return (
    <div className={`context-monitor context-monitor--${statusColor}`}>
      <div className="context-monitor__icon" title={statusText}>
        {statusIcon}
      </div>
      
      <div className="context-monitor__info">
        <div className="context-monitor__label">Context</div>
        <div className="context-monitor__value">
          {contextUsage.toFixed(1)}%
        </div>
      </div>

      <div className="context-monitor__bar">
        <div
          className={`context-monitor__fill context-monitor__fill--${statusColor}`}
          style={{ width: `${Math.min(contextUsage, 100)}%` }}
        />
      </div>

      {sessionStats && (
        <div className="context-monitor__details">
          <span className="context-monitor__stat">
            {sessionStats.total_tokens.toLocaleString()} / {currentSession.max_context_length.toLocaleString()} tokens
          </span>
          <span className="context-monitor__separator">•</span>
          <span className="context-monitor__stat">
            {sessionStats.total_messages} messages
          </span>
        </div>
      )}

      {isContextFull && (
        <div className="context-monitor__warning">
          <span className="context-monitor__warning-icon">⚠️</span>
          <span className="context-monitor__warning-text">
            Context limit reached. Start a new session to continue.
          </span>
        </div>
      )}
    </div>
  );
};

// Made with Bob