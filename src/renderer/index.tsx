/**
 * Renderer Process Entry Point
 * 
 * Main entry point for the Electron renderer process.
 * Initializes React and mounts the application.
 * 
 * @module renderer/index
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

/**
 * Initialize and mount the React application
 */
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found. Make sure index.html has a div with id="root"');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hot Module Replacement (HMR) for development
if (import.meta.hot) {
  import.meta.hot.accept();
}

// Made with Bob
