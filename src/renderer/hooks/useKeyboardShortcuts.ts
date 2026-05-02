/**
 * Keyboard Shortcuts Hook
 * 
 * @description Provides keyboard shortcut functionality for the application
 * Supports common actions like new session, send message, toggle voice, etc.
 * 
 * @module renderer/hooks/useKeyboardShortcuts
 */

import { useEffect, useCallback } from 'react';
import { useChatStore } from '../store/chat.store';
import { useAppStore } from '../store/app.store';

/**
 * Keyboard shortcut configuration
 */
interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

/**
 * Hook for managing keyboard shortcuts
 * 
 * @returns {Object} Keyboard shortcut utilities
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { shortcuts, registerShortcut } = useKeyboardShortcuts();
 *   
 *   useEffect(() => {
 *     registerShortcut({
 *       key: 'k',
 *       ctrl: true,
 *       action: () => console.log('Custom shortcut'),
 *       description: 'Custom action'
 *     });
 *   }, []);
 * }
 * ```
 */
export function useKeyboardShortcuts() {
  const { createNewSession, sendMessage, clearMessages } = useChatStore();
  const { toggleSidebar, toggleVoice } = useAppStore();

  /**
   * Default keyboard shortcuts
   */
  const defaultShortcuts: ShortcutConfig[] = [
    {
      key: 'n',
      ctrl: true,
      action: createNewSession,
      description: 'Create new session',
      preventDefault: true,
    },
    {
      key: 'k',
      ctrl: true,
      action: clearMessages,
      description: 'Clear messages',
      preventDefault: true,
    },
    {
      key: 'b',
      ctrl: true,
      action: toggleSidebar,
      description: 'Toggle sidebar',
      preventDefault: true,
    },
    {
      key: 'v',
      ctrl: true,
      shift: true,
      action: toggleVoice,
      description: 'Toggle voice input',
      preventDefault: true,
    },
    {
      key: 'Enter',
      ctrl: true,
      action: () => {
        // Send message - handled by ChatInput component
      },
      description: 'Send message',
      preventDefault: false,
    },
    {
      key: 'Escape',
      action: () => {
        // Close modals/dialogs
        const event = new CustomEvent('closeModal');
        window.dispatchEvent(event);
      },
      description: 'Close modal/dialog',
      preventDefault: true,
    },
    {
      key: '/',
      ctrl: true,
      action: () => {
        // Focus search/command palette
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        searchInput?.focus();
      },
      description: 'Focus search',
      preventDefault: true,
    },
    {
      key: ',',
      ctrl: true,
      action: () => {
        // Open settings
        const event = new CustomEvent('openSettings');
        window.dispatchEvent(event);
      },
      description: 'Open settings',
      preventDefault: true,
    },
  ];

  /**
   * Checks if a keyboard event matches a shortcut configuration
   */
  const matchesShortcut = useCallback((event: KeyboardEvent, shortcut: ShortcutConfig): boolean => {
    const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
    const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
    const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
    const altMatches = shortcut.alt ? event.altKey : !event.altKey;

    return keyMatches && ctrlMatches && shiftMatches && altMatches;
  }, []);

  /**
   * Handles keyboard events
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.isContentEditable;

    for (const shortcut of defaultShortcuts) {
      if (matchesShortcut(event, shortcut)) {
        // Allow some shortcuts even in input fields
        const allowInInput = shortcut.key === 'Enter' && shortcut.ctrl;
        
        if (!isInputField || allowInInput) {
          if (shortcut.preventDefault) {
            event.preventDefault();
          }
          shortcut.action();
          break;
        }
      }
    }
  }, [defaultShortcuts, matchesShortcut]);

  /**
   * Set up keyboard event listeners
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  /**
   * Get all available shortcuts for display
   */
  const getShortcuts = useCallback(() => {
    return defaultShortcuts.map(shortcut => ({
      keys: [
        shortcut.ctrl && 'Ctrl',
        shortcut.shift && 'Shift',
        shortcut.alt && 'Alt',
        shortcut.meta && 'Cmd',
        shortcut.key.toUpperCase(),
      ].filter(Boolean).join('+'),
      description: shortcut.description,
    }));
  }, [defaultShortcuts]);

  /**
   * Format shortcut for display
   */
  const formatShortcut = useCallback((shortcut: ShortcutConfig): string => {
    const keys: string[] = [];
    
    if (shortcut.ctrl) keys.push('Ctrl');
    if (shortcut.shift) keys.push('Shift');
    if (shortcut.alt) keys.push('Alt');
    if (shortcut.meta) keys.push('Cmd');
    keys.push(shortcut.key.toUpperCase());

    return keys.join('+');
  }, []);

  return {
    shortcuts: defaultShortcuts,
    getShortcuts,
    formatShortcut,
  };
}

/**
 * Hook for displaying keyboard shortcuts help
 */
export function useShortcutsHelp() {
  const { getShortcuts } = useKeyboardShortcuts();

  const showHelp = useCallback(() => {
    const shortcuts = getShortcuts();
    const helpText = shortcuts
      .map(s => `${s.keys}: ${s.description}`)
      .join('\n');

    // Could show in a modal or toast
    console.log('Keyboard Shortcuts:\n' + helpText);
  }, [getShortcuts]);

  // Show help with Ctrl+?
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === '?') {
        event.preventDefault();
        showHelp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHelp]);

  return { showHelp, shortcuts: getShortcuts() };
}

// Made with Bob