/**
 * Electron Preload Script
 * 
 * @description Exposes safe APIs to the renderer process via context bridge
 * @module preload/index
 */

import { contextBridge, ipcRenderer } from 'electron';

/**
 * Exposed API for renderer process
 */
const api = {
  /**
   * Get backend server URL
   */
  getBackendUrl: (): Promise<string> => {
    return ipcRenderer.invoke('get-backend-url');
  },

  /**
   * Get application version
   */
  getAppVersion: (): Promise<string> => {
    return ipcRenderer.invoke('app-version');
  },

  /**
   * Platform information
   */
  platform: process.platform,
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', api);

// Type definitions for TypeScript
export type ElectronAPI = typeof api;

// Made with Bob
