/**
 * Session Model
 * 
 * @description Manages conversation sessions with context tracking
 * @module backend/models/session
 */

import { v4 as uuidv4 } from 'uuid';
import { getDatabase, getOne, getAll, runQuery } from '../database/connection';

/**
 * Default maximum context length for sessions
 */
const DEFAULT_MAX_CONTEXT_LENGTH = 4096;

/**
 * Session interface
 */
export interface ISession {
  id: string;
  title: string;
  model_name: string;
  created_at: string;
  updated_at: string;
  context_length: number;
  max_context_length: number;
  is_active: boolean;
  metadata?: string;
}

/**
 * Message interface
 */
export interface IMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  token_count: number;
  metadata?: string;
}

/**
 * Session creation data
 */
export interface ICreateSessionData {
  title: string;
  model_name: string;
  max_context_length?: number;
  metadata?: Record<string, any>;
}

/**
 * Session update data
 */
export interface IUpdateSessionData {
  title?: string;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Session Model Class
 */
export class SessionModel {
  /**
   * Create a new session
   * 
   * @param {ICreateSessionData} data - Session creation data
   * @returns {Promise<ISession>} Created session
   */
  static async create(data: ICreateSessionData): Promise<ISession> {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    const sql = `
      INSERT INTO sessions (id, title, model_name, created_at, updated_at, max_context_length, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const maxContextLength = data.max_context_length || DEFAULT_MAX_CONTEXT_LENGTH;
    const metadataJson = data.metadata ? JSON.stringify(data.metadata) : null;

    const params = [
      id,
      data.title,
      data.model_name,
      now,
      now,
      maxContextLength,
      metadataJson,
    ];

    await runQuery(db, sql, params);

    // Return the created session directly using known values
    return {
      id,
      title: data.title,
      model_name: data.model_name,
      created_at: now,
      updated_at: now,
      context_length: 0,
      max_context_length: maxContextLength,
      is_active: true,
      metadata: metadataJson || undefined,
    };
  }

  /**
   * Find session by ID
   * 
   * @param {string} id - Session ID
   * @returns {Promise<ISession | undefined>} Session or undefined
   */
  static async findById(id: string): Promise<ISession | undefined> {
    const db = getDatabase();
    const sql = 'SELECT * FROM sessions WHERE id = ?';
    return await getOne<ISession>(db, sql, [id]);
  }

  /**
   * Find all sessions
   * 
   * @param {boolean} activeOnly - Return only active sessions
   * @returns {Promise<ISession[]>} Array of sessions
   */
  static async findAll(activeOnly: boolean = false): Promise<ISession[]> {
    const db = getDatabase();
    const sql = activeOnly
      ? 'SELECT * FROM sessions WHERE is_active = 1 ORDER BY updated_at DESC'
      : 'SELECT * FROM sessions ORDER BY updated_at DESC';
    
    return await getAll<ISession>(db, sql);
  }

  /**
   * Update session
   * 
   * @param {string} id - Session ID
   * @param {IUpdateSessionData} data - Update data
   * @returns {Promise<ISession>} Updated session
   */
  static async update(id: string, data: IUpdateSessionData): Promise<ISession> {
    const db = getDatabase();
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }

    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(data.is_active ? 1 : 0);
    }

    if (data.metadata !== undefined) {
      updates.push('metadata = ?');
      params.push(JSON.stringify(data.metadata));
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());

    params.push(id);

    const sql = `UPDATE sessions SET ${updates.join(', ')} WHERE id = ?`;
    await runQuery(db, sql, params);

    const session = await this.findById(id);
    if (!session) {
      throw new Error('Session not found after update');
    }

    return session;
  }

  /**
   * Delete session
   * 
   * @param {string} id - Session ID
   * @returns {Promise<void>}
   */
  static async delete(id: string): Promise<void> {
    const db = getDatabase();
    const sql = 'DELETE FROM sessions WHERE id = ?';
    await runQuery(db, sql, [id]);
  }

  /**
   * Add message to session
   * 
   * @param {string} sessionId - Session ID
   * @param {Omit<IMessage, 'id' | 'session_id' | 'timestamp'>} messageData - Message data
   * @returns {Promise<IMessage>} Created message
   */
  static async addMessage(
    sessionId: string,
    messageData: Omit<IMessage, 'id' | 'session_id' | 'timestamp'>
  ): Promise<IMessage> {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    const sql = `
      INSERT INTO messages (id, session_id, role, content, timestamp, token_count, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const metadataJson = messageData.metadata ? JSON.stringify(messageData.metadata) : undefined;

    const params = [
      id,
      sessionId,
      messageData.role,
      messageData.content,
      now,
      messageData.token_count,
      metadataJson || null,
    ];

    await runQuery(db, sql, params);

    // Return the created message directly using known values
    return {
      id,
      session_id: sessionId,
      role: messageData.role,
      content: messageData.content,
      timestamp: now,
      token_count: messageData.token_count,
      metadata: metadataJson,
    };
  }

  /**
   * Get messages for a session
   * 
   * @param {string} sessionId - Session ID
   * @param {number} limit - Maximum number of messages to return
   * @returns {Promise<IMessage[]>} Array of messages
   */
  static async getMessages(sessionId: string, limit?: number): Promise<IMessage[]> {
    const db = getDatabase();
    let sql = 'SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC';
    
    if (limit) {
      // Validate limit is a positive integer to prevent SQL injection
      const validLimit = Math.floor(Math.abs(Number(limit)));
      if (!isFinite(validLimit) || validLimit <= 0) {
        throw new Error('Invalid limit parameter: must be a positive integer');
      }
      sql += ` LIMIT ${validLimit}`;
    }

    return await getAll<IMessage>(db, sql, [sessionId]);
  }

  /**
   * Check if session context is full
   * 
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>} True if context is full
   */
  static async isContextFull(sessionId: string): Promise<boolean> {
    const session = await this.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    return session.context_length >= session.max_context_length;
  }

  /**
   * Get session statistics
   * 
   * @param {string} sessionId - Session ID
   * @returns {Promise<object>} Session statistics
   */
  static async getStatistics(sessionId: string): Promise<{
    total_messages: number;
    total_tokens: number;
    context_usage_percent: number;
  }> {
    const db = getDatabase();
    const session = await this.findById(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    const sql = `
      SELECT 
        COUNT(*) as total_messages,
        COALESCE(SUM(token_count), 0) as total_tokens
      FROM messages
      WHERE session_id = ?
    `;

    const stats = await getOne<{ total_messages: number; total_tokens: number }>(
      db,
      sql,
      [sessionId]
    );

    return {
      total_messages: stats?.total_messages || 0,
      total_tokens: stats?.total_tokens || 0,
      context_usage_percent: (session.context_length / session.max_context_length) * 100,
    };
  }

  /**
   * Clear session messages
   * 
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  static async clearMessages(sessionId: string): Promise<void> {
    const db = getDatabase();
    const sql = 'DELETE FROM messages WHERE session_id = ?';
    await runQuery(db, sql, [sessionId]);

    // Reset context length
    await runQuery(
      db,
      'UPDATE sessions SET context_length = 0, updated_at = ? WHERE id = ?',
      [new Date().toISOString(), sessionId]
    );
  }
}

// Made with Bob