/**
 * Sidebar Navigation Component
 * 
 * VS Code-style sidebar with navigation icons and collapsible functionality.
 * Provides access to different views: chat, models, analytics, and settings.
 * 
 * @module renderer/components/Sidebar
 */

import React from 'react';
import { useAppStore } from '../../store/app.store';
import './Sidebar.css';

/**
 * Navigation item interface
 */
interface NavItem {
  id: 'chat' | 'models' | 'analytics' | 'settings';
  icon: string;
  label: string;
  shortcut?: string;
}

/**
 * Navigation items configuration
 */
const NAV_ITEMS: NavItem[] = [
  { id: 'chat', icon: '💬', label: 'Chat', shortcut: 'Ctrl+1' },
  { id: 'models', icon: '🤖', label: 'Models', shortcut: 'Ctrl+2' },
  { id: 'analytics', icon: '📊', label: 'Analytics', shortcut: 'Ctrl+3' },
  { id: 'settings', icon: '⚙️', label: 'Settings', shortcut: 'Ctrl+4' },
];

/**
 * Sidebar component
 * 
 * @returns {JSX.Element} The sidebar component
 */
export const Sidebar: React.FC = () => {
  const {
    sidebarView,
    setSidebarView,
    isSidebarCollapsed,
    toggleSidebar,
    toggleTheme,
    theme,
    isMicActive,
    toggleMic,
  } = useAppStore();

  /**
   * Handle navigation item click
   */
  const handleNavClick = (viewId: typeof sidebarView) => {
    setSidebarView(viewId);
  };

  return (
    <aside className={`sidebar ${isSidebarCollapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo/Brand */}
      <div className="sidebar__header">
        <div className="sidebar__logo" title="Ollama Voice Orchestrator">
          {isSidebarCollapsed ? '🎙️' : '🎙️ OVO'}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar__nav-item ${sidebarView === item.id ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => handleNavClick(item.id)}
            title={`${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}
            aria-label={item.label}
            aria-current={sidebarView === item.id ? 'page' : undefined}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            {!isSidebarCollapsed && <span className="sidebar__nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar__footer">
        {/* Microphone Toggle */}
        <button
          className={`sidebar__action ${isMicActive ? 'sidebar__action--active' : ''}`}
          onClick={toggleMic}
          title={isMicActive ? 'Disable microphone' : 'Enable microphone'}
          aria-label={isMicActive ? 'Disable microphone' : 'Enable microphone'}
        >
          <span className="sidebar__action-icon">{isMicActive ? '🎤' : '🔇'}</span>
          {!isSidebarCollapsed && (
            <span className="sidebar__action-label">
              {isMicActive ? 'Mic On' : 'Mic Off'}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          className="sidebar__action"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          aria-label="Toggle theme"
        >
          <span className="sidebar__action-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          {!isSidebarCollapsed && (
            <span className="sidebar__action-label">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          )}
        </button>

        {/* Collapse Toggle */}
        <button
          className="sidebar__action"
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="sidebar__action-icon">{isSidebarCollapsed ? '→' : '←'}</span>
          {!isSidebarCollapsed && <span className="sidebar__action-label">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

// Made with Bob
