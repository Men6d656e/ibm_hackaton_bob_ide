/**
 * Keyboard Shortcuts Help Modal
 * 
 * @description Displays available keyboard shortcuts in a modal dialog
 * Triggered by Ctrl+? or from settings menu
 * 
 * @module renderer/components/ShortcutsHelp
 */

import React, { useEffect, useState } from 'react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import './ShortcutsHelp.css';

/**
 * Shortcuts help modal props
 */
interface ShortcutsHelpProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
}

/**
 * Shortcuts help modal component
 * 
 * @param {ShortcutsHelpProps} props - Component props
 * @returns {JSX.Element} The shortcuts help modal
 */
export const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({ isOpen, onClose }) => {
  const { getShortcuts } = useKeyboardShortcuts();
  const shortcuts = getShortcuts();

  /**
   * Handle escape key to close modal
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  /**
   * Handle backdrop click to close modal
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="shortcuts-help-backdrop" onClick={handleBackdropClick}>
      <div className="shortcuts-help-modal">
        {/* Header */}
        <div className="shortcuts-help-header">
          <h2 className="shortcuts-help-title">⌨️ Keyboard Shortcuts</h2>
          <button
            className="shortcuts-help-close"
            onClick={onClose}
            aria-label="Close"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="shortcuts-help-content">
          <div className="shortcuts-help-list">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="shortcuts-help-item">
                <kbd className="shortcuts-help-keys">{shortcut.keys}</kbd>
                <span className="shortcuts-help-description">{shortcut.description}</span>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="shortcuts-help-footer">
            <p className="shortcuts-help-tip">
              💡 <strong>Tip:</strong> Press <kbd>Ctrl+?</kbd> anytime to view this help
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Made with Bob