/**
 * Analytics Dashboard Component
 * 
 * Displays model metrics, memory usage, and system statistics.
 * 
 * @module renderer/components/AnalyticsDashboard
 */

import React, { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';

/**
 * Model metrics interface
 */
interface ModelMetrics {
  name: string;
  size: string;
  modified: string;
  family: string;
}

/**
 * System metrics interface
 */
interface SystemMetrics {
  memoryUsage: number;
  cpuUsage: number;
  activeModels: number;
  totalModels: number;
}

/**
 * Analytics dashboard component
 * 
 * @returns {JSX.Element} The analytics dashboard component
 */
export const AnalyticsDashboard: React.FC = () => {
  const [models, setModels] = useState<ModelMetrics[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    memoryUsage: 0,
    cpuUsage: 0,
    activeModels: 0,
    totalModels: 0,
  });

  /**
   * Fetch metrics data
   */
  useEffect(() => {
    // TODO: Fetch real data from backend in Phase 7
    // Simulated data for now
    setModels([
      { name: 'llama2', size: '3.8GB', modified: '2 days ago', family: 'llama' },
      { name: 'mistral', size: '4.1GB', modified: '1 week ago', family: 'mistral' },
    ]);

    setSystemMetrics({
      memoryUsage: 45,
      cpuUsage: 23,
      activeModels: 1,
      totalModels: 2,
    });
  }, []);

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="analytics-dashboard__header">
        <h2>Analytics Dashboard</h2>
        <button className="analytics-dashboard__refresh-btn" title="Refresh metrics">
          🔄 Refresh
        </button>
      </div>

      {/* System Metrics */}
      <div className="analytics-dashboard__section">
        <h3>System Metrics</h3>
        <div className="analytics-dashboard__metrics-grid">
          {/* Memory Usage */}
          <div className="analytics-dashboard__metric-card">
            <div className="analytics-dashboard__metric-icon">💾</div>
            <div className="analytics-dashboard__metric-content">
              <div className="analytics-dashboard__metric-label">Memory Usage</div>
              <div className="analytics-dashboard__metric-value">{systemMetrics.memoryUsage}%</div>
              <div className="analytics-dashboard__metric-bar">
                <div
                  className="analytics-dashboard__metric-bar-fill"
                  style={{ width: `${systemMetrics.memoryUsage}%` }}
                />
              </div>
            </div>
          </div>

          {/* CPU Usage */}
          <div className="analytics-dashboard__metric-card">
            <div className="analytics-dashboard__metric-icon">⚡</div>
            <div className="analytics-dashboard__metric-content">
              <div className="analytics-dashboard__metric-label">CPU Usage</div>
              <div className="analytics-dashboard__metric-value">{systemMetrics.cpuUsage}%</div>
              <div className="analytics-dashboard__metric-bar">
                <div
                  className="analytics-dashboard__metric-bar-fill"
                  style={{ width: `${systemMetrics.cpuUsage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Models */}
          <div className="analytics-dashboard__metric-card">
            <div className="analytics-dashboard__metric-icon">🤖</div>
            <div className="analytics-dashboard__metric-content">
              <div className="analytics-dashboard__metric-label">Active Models</div>
              <div className="analytics-dashboard__metric-value">
                {systemMetrics.activeModels} / {systemMetrics.totalModels}
              </div>
            </div>
          </div>

          {/* Total Models */}
          <div className="analytics-dashboard__metric-card">
            <div className="analytics-dashboard__metric-icon">📦</div>
            <div className="analytics-dashboard__metric-content">
              <div className="analytics-dashboard__metric-label">Total Models</div>
              <div className="analytics-dashboard__metric-value">{systemMetrics.totalModels}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Model List */}
      <div className="analytics-dashboard__section">
        <h3>Installed Models</h3>
        <div className="analytics-dashboard__model-list">
          {models.length === 0 ? (
            <div className="analytics-dashboard__empty">
              <p>No models installed</p>
            </div>
          ) : (
            <table className="analytics-dashboard__table">
              <thead>
                <tr>
                  <th>Model Name</th>
                  <th>Size</th>
                  <th>Family</th>
                  <th>Modified</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model, index) => (
                  <tr key={index}>
                    <td>{model.name}</td>
                    <td>{model.size}</td>
                    <td>{model.family}</td>
                    <td>{model.modified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Info Note */}
      <div className="analytics-dashboard__note">
        <p>
          📊 Real-time metrics will be available after backend integration in Phase 7.
          Currently showing simulated data.
        </p>
      </div>
    </div>
  );
};

// Made with Bob
