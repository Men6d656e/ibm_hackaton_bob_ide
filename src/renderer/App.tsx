/**
 * Main Application Component
 * 
 * Root component for the Ollama Voice Orchestrator renderer process.
 * Implements VS Code-style layout with side panel, chat interface, and analytics.
 * 
 * @module renderer/App
 */

import React, { useEffect } from 'react';
import { Layout } from './components/Layout/Layout';
import { useAppStore } from './store/app.store';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import './styles/global.css';

/**
 * Main application component
 *
 * @returns {JSX.Element} The root application component
 */
export const App: React.FC = () => {
  const { initialize, isInitialized, setError } = useAppStore();

  // Initialize voice recognition
  const {
    isSupported: isVoiceSupported,
    error: voiceError,
  } = useVoiceRecognition({
    wakeWord: 'ollama',
    autoStart: true,
    enableAudioFeedback: true,
  });

  useEffect(() => {
    // Initialize application state
    initialize();
  }, [initialize]);

  // Handle voice recognition errors
  useEffect(() => {
    if (voiceError) {
      setError(voiceError.message);
    }
  }, [voiceError, setError]);

  // Show warning if voice recognition is not supported
  useEffect(() => {
    if (!isVoiceSupported) {
      console.warn('Web Speech API is not supported in this browser');
    }
  }, [isVoiceSupported]);

  if (!isInitialized) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Initializing Ollama Voice Orchestrator...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Layout />
    </div>
  );
};

export default App;

// Made with Bob
