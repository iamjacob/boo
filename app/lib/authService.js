import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Pool } from 'pg';

// Database connection configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'boooks_db',
  user: process.env.DB_USER || 'boooks',
  password: process.env.DB_PASSWORD || 'boooks_pass',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Token configuration
const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate secure random tokens
 * @returns {Object} - Object containing access and refresh tokens
 */
export function generateTokens() {
  const accessToken = crypto.randomBytes(32).toString('hex');
  const refreshToken = crypto.randomBytes(32).toString('hex');
  
  return { accessToken, refreshToken };
}

/**
 * Generate a single secure token
 * @returns {string} - Secure random token
 */
export function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - Verification result
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Create a new session with rolling tokens
 * @param {number} userId - User ID
 * @param {Object} sessionData - Additional session data
 * @returns {Promise<Object>} - Session tokens and expiry info
 */
export async function createSession(userId, sessionData = {}) {
  let client;
  
  try {
    client = await pool.connect();
    
    // Generate unique session ID and token version
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tokenVersion = 1;
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens();
    
    // Calculate expiry times
    const accessExpiresAt = new Date(Date.now() + ACCESS_TOKEN_EXPIRY);
    const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
    
    // Store session in database
    await client.query(`
      INSERT INTO user_sessions (
        user_id, session_token, refresh_token, expires_at, 
        token_version, last_refreshed, is_active, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, NOW(), true, $6, $7)
    `, [
      userId, 
      accessToken, 
      refreshToken, 
      refreshExpiresAt, // Store refresh token expiry as main expiry
      tokenVersion,
      sessionData.ipAddress || null,
      sessionData.userAgent || null
    ]);
    
    return {
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
      tokenVersion,
      sessionId
    };
    
  } catch (error) {
    console.error('Session creation error:', error);
    throw new Error('Failed to create session');
  } finally {
    if (client) client.release();
  }
}

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Valid refresh token
 * @returns {Promise<Object>} - New tokens and expiry info
 */
export async function refreshAccessToken(refreshToken) {
  let client;
  
  try {
    client = await pool.connect();
    
    // Check if session exists and refresh token matches
    const sessionResult = await client.query(`
      SELECT * FROM user_sessions 
      WHERE refresh_token = $1 AND is_active = true AND expires_at > NOW()
    `, [refreshToken]);
    
    if (sessionResult.rows.length === 0) {
      throw new Error('Session not found or inactive');
    }
    
    const session = sessionResult.rows[0];
    
    // Generate new tokens with incremented version
    const newTokenVersion = session.token_version + 1;
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens();
    
    // Calculate new expiry times
    const accessExpiresAt = new Date(Date.now() + ACCESS_TOKEN_EXPIRY);
    const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
    
    // Update session with new tokens
    await client.query(`
      UPDATE user_sessions 
      SET session_token = $1, refresh_token = $2, expires_at = $3, 
          token_version = $4, last_refreshed = NOW()
      WHERE id = $5
    `, [newAccessToken, newRefreshToken, refreshExpiresAt, newTokenVersion, session.id]);
    
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessExpiresAt,
      refreshExpiresAt,
      tokenVersion: newTokenVersion
    };
    
  } catch (error) {
    console.error('Token refresh error:', error);
    throw new Error('Failed to refresh token');
  } finally {
    if (client) client.release();
  }
}

/**
 * Validate access token and get user session
 * @param {string} accessToken - Access token
 * @returns {Promise<Object|null>} - User session data or null
 */
export async function validateSession(accessToken) {
  let client;
  
  try {
    client = await pool.connect();
    
    // Get session and user data, check if access token is still valid
    const result = await client.query(`
      SELECT s.*, u.username, u.email, u.display_name, u.avatar, u.bio,
             u.books_read, u.followers_count, u.following_count, u.location, u.created_at,
             s.created_at as session_created, s.expires_at as session_expires
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = $1 AND s.is_active = true AND u.is_active = true
    `, [accessToken]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const session = result.rows[0];
    
    // Check if access token has expired (15 minutes from session creation/refresh)
    const accessTokenExpiry = new Date(session.last_refreshed.getTime() + ACCESS_TOKEN_EXPIRY);
    if (new Date() > accessTokenExpiry) {
      return null; // Access token expired
    }
    
    return {
      user: {
        id: session.user_id,
        username: session.username,
        email: session.email,
        displayName: session.display_name,
        avatar: session.avatar,
        bio: session.bio,
        booksRead: session.books_read,
        followers: session.followers_count,
        following: session.following_count,
        location: session.location,
        joinDate: session.created_at
      },
      session: {
        id: session.id,
        tokenVersion: session.token_version,
        lastRefreshed: session.last_refreshed,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        accessExpiresAt: accessTokenExpiry
      }
    };
    
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  } finally {
    if (client) client.release();
  }
}

/**
 * Revoke session (logout)
 * @param {string} accessToken - Current access token
 * @returns {Promise<boolean>} - Success status
 */
export async function revokeSession(accessToken) {
  let client;
  
  try {
    client = await pool.connect();
    
    // Deactivate session
    const result = await client.query(`
      UPDATE user_sessions 
      SET is_active = false 
      WHERE session_token = $1
    `, [accessToken]);
    
    return result.rowCount > 0;
    
  } catch (error) {
    console.error('Session revocation error:', error);
    return false;
  } finally {
    if (client) client.release();
  }
}

/**
 * Revoke all sessions for a user
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} - Success status
 */
export async function revokeAllUserSessions(userId) {
  let client;
  
  try {
    client = await pool.connect();
    
    await client.query(`
      UPDATE user_sessions 
      SET is_active = false 
      WHERE user_id = $1
    `, [userId]);
    
    return true;
    
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    return false;
  } finally {
    if (client) client.release();
  }
}

/**
 * Check if access token is close to expiry and needs refresh
 * @param {string} accessToken - Access token
 * @param {Date} lastRefreshed - When the token was last refreshed
 * @returns {boolean} - True if token should be refreshed
 */
export function shouldRefreshToken(accessToken, lastRefreshed) {
  try {
    if (!lastRefreshed) return true;
    
    const tokenAge = Date.now() - new Date(lastRefreshed).getTime();
    const refreshThreshold = ACCESS_TOKEN_EXPIRY - (5 * 60 * 1000); // 5 minutes before expiry
    
    return tokenAge > refreshThreshold;
  } catch (error) {
    return true; // If we can't determine age, assume it needs refresh
  }
}

export { pool };