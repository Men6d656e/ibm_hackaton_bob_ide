/**
 * Main Layout Component
 * 
 * VS Code-style layout with sidebar, main content area, and status bar.
 * Implements responsive design and collapsible sidebar.
 * 
 * @module renderer/components/Layout
 */

import React from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { ChatPanel } from '../ChatPanel/ChatPanel';
import { AudioVisualizer } from '../AudioVisualizer/AudioVisualizer';
import { AnalyticsDashboard } from '../AnalyticsDashboard/AnalyticsDashboard';
import { StatusBar } from '../StatusBar/StatusBar';
import { useAppStore } from '../../store/app.store';
import './Layout.css';

/**
 * Main layout component
 * 
 * @returns {JSX.Element} The layout component
 */
export const Layout: React.FC = () => {
  const { sidebarView, isSidebarCollapsed, theme } = useAppStore();

  return (
    <div className={`layout layout--${theme}`} data-sidebar-collapsed={isSidebarCollapsed}>
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="layout__main">
        {/* Audio Visualizer - Always visible at top */}
        <div className="layout__visualizer">
          <AudioVisualizer />
        </div>

        {/* Content based on sidebar view */}
        <div className="layout__content">
          {sidebarView === 'chat' && <ChatPanel />}
          {sidebarView === 'analytics' && <AnalyticsDashboard />}
          {sidebarView === 'models' && (
            <div className="placeholder">
              <h2>Models Management</h2>
              <p>Model management interface coming in Phase 7</p>
            </div>
          )}
          {sidebarView === 'settings' && (
            <div className="placeholder">
              <h2>Settings</h2>
              <p>Settings interface coming in Phase 7</p>
            </div>
          )}
        </div>
      </main>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

// Made with Bob
