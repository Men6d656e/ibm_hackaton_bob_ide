-- Ollama Voice Orchestrator Database Schema
-- SQLite3 Database for Session Management

-- Sessions Table
-- Stores conversation sessions with context tracking
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    model_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    context_length INTEGER DEFAULT 0,
    max_context_length INTEGER DEFAULT 4096,
    is_active BOOLEAN DEFAULT 1,
    metadata TEXT -- JSON string for additional data
);

-- Messages Table
-- Stores individual messages within sessions
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    token_count INTEGER DEFAULT 0,
    metadata TEXT, -- JSON string for additional data
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Model Usage Table
-- Tracks model usage statistics
CREATE TABLE IF NOT EXISTS model_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name TEXT NOT NULL,
    session_id TEXT,
    tokens_used INTEGER DEFAULT 0,
    execution_time_ms INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

-- Voice Commands Table
-- Logs voice commands for analytics
CREATE TABLE IF NOT EXISTS voice_commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command_text TEXT NOT NULL,
    intent TEXT NOT NULL,
    confidence REAL DEFAULT 0.0,
    session_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    execution_status TEXT CHECK(execution_status IN ('success', 'failed', 'pending')),
    error_message TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_model_usage_model ON model_usage(model_name);
CREATE INDEX IF NOT EXISTS idx_model_usage_timestamp ON model_usage(timestamp);
CREATE INDEX IF NOT EXISTS idx_voice_commands_session ON voice_commands(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_commands_timestamp ON voice_commands(timestamp);

-- Trigger to update session updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_session_timestamp 
AFTER INSERT ON messages
BEGIN
    UPDATE sessions 
    SET updated_at = CURRENT_TIMESTAMP,
        context_length = (
            SELECT COALESCE(SUM(token_count), 0) 
            FROM messages 
            WHERE session_id = NEW.session_id
        )
    WHERE id = NEW.session_id;
END;

-- Made with Bob
