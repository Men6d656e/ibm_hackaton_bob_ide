/**
 * Electron Main Process Entry Point
 * 
 * @description Manages application lifecycle, window creation, and IPC communication
 * @module main/index
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

const BACKEND_PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Create the main application window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
    title: 'Ollama Voice Orchestrator',
    backgroundColor: '#1e1e1e',
    show: false,
  });

  // Load the app
  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Start the Express backend server
 */
function startBackend(): Promise<void> {
  return new Promise((resolve, reject) => {
    const backendPath = path.join(__dirname, '../backend/server.js');
    
    backendProcess = spawn('node', [backendPath], {
      env: { ...process.env, PORT: String(BACKEND_PORT) },
      stdio: 'inherit',
    });

    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
      reject(error);
    });

    // Give backend time to start
    setTimeout(() => {
      console.log(`Backend server started on port ${BACKEND_PORT}`);
      resolve();
    }, 2000);
  });
}

/**
 * Stop the backend server
 */
function stopBackend(): void {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

// App lifecycle events
app.whenReady().then(async () => {
  try {
    await startBackend();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopBackend();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

// IPC Handlers
ipcMain.handle('get-backend-url', () => {
  return `http://localhost:${BACKEND_PORT}`;
});

ipcMain.handle('app-version', () => {
  return app.getVersion();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// Made with Bob
