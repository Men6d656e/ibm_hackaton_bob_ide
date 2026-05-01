/**
 * Application State Store
 * 
 * Global state management using Zustand for the OVO application.
 * Manages application initialization, UI state, and cross-component data.
 * 
 * @module renderer/store/app.store
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Application state interface
 */
interface AppState {
  /** Whether the application has been initialized */
  isInitialized: boolean;
  
  /** Current active session ID */
  activeSessionId: string | null;
  
  /** Whether the microphone is active */
  isMicActive: boolean;
  
  /** Whether voice is currently being processed */
  isProcessingVoice: boolean;
  
  /** Current sidebar view */
  sidebarView: 'chat' | 'models' | 'analytics' | 'settings';
  
  /** Whether sidebar is collapsed */
  isSidebarCollapsed: boolean;
  
  /** Current theme */
  theme: 'dark' | 'light';
  
  /** Error message if any */
  error: string | null;
}

/**
 * Application actions interface
 */
interface AppActions {
  /** Initialize the application */
  initialize: () => void;
  
  /** Set active session */
  setActiveSession: (sessionId: string | null) => void;
  
  /** Toggle microphone state */
  toggleMic: () => void;
  
  /** Set voice processing state */
  setProcessingVoice: (isProcessing: boolean) => void;
  
  /** Change sidebar view */
  setSidebarView: (view: AppState['sidebarView']) => void;
  
  /** Toggle sidebar collapsed state */
  toggleSidebar: () => void;
  
  /** Toggle theme */
  toggleTheme: () => void;
  
  /** Set error message */
  setError: (error: string | null) => void;
  
  /** Clear error */
  clearError: () => void;
}

/**
 * Combined store type
 */
type AppStore = AppState & AppActions;

/**
 * Initial state
 */
const initialState: AppState = {
  isInitialized: false,
  activeSessionId: null,
  isMicActive: false,
  isProcessingVoice: false,
  sidebarView: 'chat',
  isSidebarCollapsed: false,
  theme: 'dark',
  error: null,
};

/**
 * Application store hook
 * 
 * @example
 * ```tsx
 * const { isMicActive, toggleMic } = useAppStore();
 * ```
 */
export const useAppStore = create<AppStore>()(
  devtools(
    (set) => ({
      ...initialState,

      initialize: () => {
        // Load saved preferences from localStorage
        const savedTheme = localStorage.getItem('ovo-theme') as 'dark' | 'light' | null;
        const savedSidebarState = localStorage.getItem('ovo-sidebar-collapsed');
        
        set({
          isInitialized: true,
          theme: savedTheme || 'dark',
          isSidebarCollapsed: savedSidebarState === 'true',
        });
      },

      setActiveSession: (sessionId) => {
        set({ activeSessionId: sessionId });
      },

      toggleMic: () => {
        set((state) => ({ isMicActive: !state.isMicActive }));
      },

      setProcessingVoice: (isProcessing) => {
        set({ isProcessingVoice: isProcessing });
      },

      setSidebarView: (view) => {
        set({ sidebarView: view });
      },

      toggleSidebar: () => {
        set((state) => {
          const newState = !state.isSidebarCollapsed;
          localStorage.setItem('ovo-sidebar-collapsed', String(newState));
          return { isSidebarCollapsed: newState };
        });
      },

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          localStorage.setItem('ovo-theme', newTheme);
          return { theme: newTheme };
        });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'OVO-AppStore' }
  )
);

// Made with Bob
