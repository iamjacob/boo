import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

// Database connection configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'boooks_db',
  user: process.env.DB_USER || 'boooks',
  password: process.env.DB_PASSWORD || 'boooks_pass',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * Authentication middleware to verify user sessions
 * @param {NextRequest} request - The incoming request
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
export async function verifyAuth(request) {
  let client;
  
  try {
    // Get session token from cookies or Authorization header
    let sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7);
      }
    }

    if (!sessionToken) {
      return { user: null, error: 'No session token provided' };
    }

    client = await pool.connect();

    // Verify session token and get user data
    const sessionResult = await client.query(`
      SELECT s.*, u.id as user_id, u.username, u.email, u.display_name, 
             u.avatar, u.bio, u.books_read, u.followers_count, 
             u.following_count, u.location, u.created_at, u.is_active
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = $1 AND s.expires_at > NOW() AND u.is_active = true
    `, [sessionToken]);

    if (sessionResult.rows.length === 0) {
      return { user: null, error: 'Invalid or expired session' };
    }

    const session = sessionResult.rows[0];

    // Update session last access time (optional)
    await client.query(
      'UPDATE user_sessions SET created_at = NOW() WHERE session_token = $1',
      [sessionToken]
    );

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
        joinDate: session.created_at,
        sessionToken: sessionToken
      },
      error: null
    };

  } catch (error) {
    console.error('Auth verification error:', error);
    return { user: null, error: 'Authentication service error' };
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Higher-order function to create protected API routes
 * @param {Function} handler - The API route handler function
 * @returns {Function} - Wrapped handler with authentication
 */
export function withAuth(handler) {
  return async (request) => {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Add user to request for handler to use
    request.user = user;
    
    return handler(request);
  };
}

/**
 * Role-based authentication wrapper
 * @param {Function} handler - The API route handler function
 * @param {Array|string} allowedRoles - Allowed roles for this route
 * @returns {Function} - Wrapped handler with role-based authentication
 */
export function withRoleAuth(handler, allowedRoles = []) {
  return async (request) => {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    // If roles are specified, check user role
    if (allowedRoles.length > 0) {
      const userRoles = user.roles || [];
      const hasPermission = allowedRoles.some(role => userRoles.includes(role));
      
      if (!hasPermission) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    request.user = user;
    return handler(request);
  };
}

/**
 * Optional authentication wrapper - allows both authenticated and guest users
 * @param {Function} handler - The API route handler function
 * @returns {Function} - Wrapped handler with optional authentication
 */
export function withOptionalAuth(handler) {
  return async (request) => {
    const { user } = await verifyAuth(request);
    
    // Add user to request (will be null if not authenticated)
    request.user = user;
    
    return handler(request);
  };
}

/**
 * Utility function to refresh session expiry
 * @param {string} sessionToken - The session token to refresh
 * @returns {Promise<boolean>} - Success status
 */
export async function refreshSession(sessionToken) {
  let client;
  
  try {
    client = await pool.connect();
    
    const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const result = await client.query(
      'UPDATE user_sessions SET expires_at = $1 WHERE session_token = $2 AND expires_at > NOW()',
      [newExpiry, sessionToken]
    );
    
    return result.rowCount > 0;
  } catch (error) {
    console.error('Session refresh error:', error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Utility function to logout user from all devices
 * @param {number} userId - The user ID
 * @returns {Promise<boolean>} - Success status
 */
export async function logoutAllSessions(userId) {
  let client;
  
  try {
    client = await pool.connect();
    
    await client.query(
      'DELETE FROM user_sessions WHERE user_id = $1',
      [userId]
    );
    
    return true;
  } catch (error) {
    console.error('Logout all sessions error:', error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}