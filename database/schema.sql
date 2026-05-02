-- Ollama Voice Orchestrator Database Schema
-- SQLite3 Database for session and message storage

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    model_name TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    context_length INTEGER DEFAULT 0,
    max_context_length INTEGER DEFAULT 4096,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'archived')),
    metadata TEXT -- JSON string for additional data
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    token_count INTEGER DEFAULT 0,
    metadata TEXT, -- JSON string for additional data
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Analytics table for model usage tracking
CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    duration_ms INTEGER,
    memory_usage INTEGER,
    cpu_usage REAL,
    timestamp INTEGER NOT NULL,
    success INTEGER DEFAULT 1,
    error_message TEXT
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_model_name ON analytics(model_name);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);

-- View for session statistics
CREATE VIEW IF NOT EXISTS session_stats AS
SELECT 
    s.id,
    s.model_name,
    s.created_at,
    s.updated_at,
    s.context_length,
    s.status,
    COUNT(m.id) as message_count,
    SUM(m.token_count) as total_tokens
FROM sessions s
LEFT JOIN messages m ON s.id = m.session_id
GROUP BY s.id;

-- View for model analytics
CREATE VIEW IF NOT EXISTS model_analytics AS
SELECT 
    model_name,
    COUNT(*) as operation_count,
    AVG(duration_ms) as avg_duration_ms,
    AVG(memory_usage) as avg_memory_usage,
    AVG(cpu_usage) as avg_cpu_usage,
    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_count,
    SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as error_count
FROM analytics
GROUP BY model_name;

-- Made with Bob
