/**
 * New Session Dialog Component
 * 
 * Modal dialog for creating new chat sessions with model selection.
 * Provides form for session title and model configuration.
 * 
 * @module renderer/components/NewSessionDialog
 */

import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/chat.store';
import { useAppStore } from '../../store/app.store';
import { getApiService, type OllamaModel } from '../../services/api-service';
import './NewSessionDialog.css';

/**
 * New session dialog props
 */
interface NewSessionDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;
  
  /** Callback when dialog closes */
  onClose: () => void;
  
  /** Callback when session is created */
  onSessionCreated?: (sessionId: string) => void;
}

/**
 * New session dialog component
 * 
 * @returns {JSX.Element} The new session dialog component
 */
export const NewSessionDialog: React.FC<NewSessionDialogProps> = ({
  isOpen,
  onClose,
  onSessionCreated,
}) => {
  const [title, setTitle] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createSession } = useChatStore();
  const { setActiveSession, setError: setAppError } = useAppStore();

  /**
   * Load available models
   */
  useEffect(() => {
    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  /**
   * Load models from backend
   */
  const loadModels = async () => {
    setIsLoadingModels(true);
    setError(null);

    try {
      const api = getApiService();
      const response = await api.listModels();

      if (response.success && response.data) {
        setModels(response.data);
        
        // Select first model by default
        if (response.data.length > 0 && !selectedModel) {
          setSelectedModel(response.data[0].name);
        }
      } else {
        throw new Error(response.error?.message || 'Failed to load models');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load models';
      setError(errorMessage);
      setAppError(errorMessage);
    } finally {
      setIsLoadingModels(false);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a session title');
      return;
    }

    if (!selectedModel) {
      setError('Please select a model');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createSession(title.trim(), selectedModel);
      
      // Get the created session ID from store
      const { currentSession } = useChatStore.getState();
      
      if (currentSession) {
        setActiveSession(currentSession.id);
        
        if (onSessionCreated) {
          onSessionCreated(currentSession.id);
        }
      }

      // Reset form and close
      setTitle('');
      setSelectedModel('');
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      setAppError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    if (!isLoading) {
      setTitle('');
      setSelectedModel('');
      setError(null);
      onClose();
    }
  };

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="new-session-dialog__backdrop" onClick={handleBackdropClick}>
      <div className="new-session-dialog">
        <div className="new-session-dialog__header">
          <h2 className="new-session-dialog__title">New Session</h2>
          <button
            className="new-session-dialog__close"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form className="new-session-dialog__form" onSubmit={handleSubmit}>
          {error && (
            <div className="new-session-dialog__error">
              <span className="new-session-dialog__error-icon">⚠️</span>
              <span className="new-session-dialog__error-text">{error}</span>
            </div>
          )}

          <div className="new-session-dialog__field">
            <label htmlFor="session-title" className="new-session-dialog__label">
              Session Title
            </label>
            <input
              id="session-title"
              type="text"
              className="new-session-dialog__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Code Review Session"
              disabled={isLoading}
              autoFocus
              required
            />
            <span className="new-session-dialog__hint">
              Give your session a descriptive name
            </span>
          </div>

          <div className="new-session-dialog__field">
            <label htmlFor="model-select" className="new-session-dialog__label">
              Model
            </label>
            {isLoadingModels ? (
              <div className="new-session-dialog__loading">
                <span className="new-session-dialog__spinner" />
                <span>Loading models...</span>
              </div>
            ) : models.length > 0 ? (
              <>
                <select
                  id="model-select"
                  className="new-session-dialog__select"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={isLoading}
                  required
                >
                  <option value="">Select a model</option>
                  {models.map((model) => (
                    <option key={model.name} value={model.name}>
                      {model.name}
                      {model.details?.parameter_size && ` (${model.details.parameter_size})`}
                    </option>
                  ))}
                </select>
                <span className="new-session-dialog__hint">
                  Choose the Ollama model for this session
                </span>
              </>
            ) : (
              <div className="new-session-dialog__no-models">
                <span className="new-session-dialog__no-models-icon">📦</span>
                <p className="new-session-dialog__no-models-text">
                  No models available. Please install Ollama models first.
                </p>
                <button
                  type="button"
                  className="new-session-dialog__retry"
                  onClick={loadModels}
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          <div className="new-session-dialog__actions">
            <button
              type="button"
              className="new-session-dialog__button new-session-dialog__button--secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="new-session-dialog__button new-session-dialog__button--primary"
              disabled={isLoading || isLoadingModels || models.length === 0}
            >
              {isLoading ? (
                <>
                  <span className="new-session-dialog__spinner" />
                  Creating...
                </>
              ) : (
                'Create Session'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Made with Bob