import { NextRequest, NextResponse } from 'next/server';
import { validateSession, refreshAccessToken, shouldRefreshToken } from './authService.js';

/**
 * Enhanced authentication middleware with rolling token support
 * @param {NextRequest} request - The incoming request
 * @param {Object} options - Configuration options
 * @returns {Promise<{user: Object|null, error: string|null, refreshed: boolean}>}
 */
export async function verifyAuth(request, options = {}) {
  try {
    // Get access token from cookies or Authorization header
    let accessToken = request.cookies.get('access_token')?.value;
    
    if (!accessToken) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }
    }

    if (!accessToken) {
      return { user: null, error: 'No access token provided', refreshed: false };
    }

    // First, try to validate the current token
    let sessionData = await validateSession(accessToken);
    let refreshed = false;

    // If token is invalid but we have auto-refresh enabled, try to refresh
    if (!sessionData && options.autoRefresh !== false) {
      const refreshToken = request.cookies.get('refresh_token')?.value;
      
      if (refreshToken) {
        try {
          const tokens = await refreshAccessToken(refreshToken);
          sessionData = await validateSession(tokens.accessToken);
          refreshed = true;
          
          // Add new tokens to response headers for the calling function to set cookies
          if (sessionData) {
            request._newTokens = tokens;
          }
        } catch (refreshError) {
          console.error('Auto-refresh failed:', refreshError);
        }
      }
    }

    if (!sessionData) {
      return { user: null, error: 'Invalid or expired session', refreshed: false };
    }

    // Check if token should be proactively refreshed (within 5 minutes of expiry)
    if (!refreshed && sessionData.session && shouldRefreshToken(accessToken, sessionData.session.lastRefreshed) && options.autoRefresh !== false) {
      const refreshToken = request.cookies.get('refresh_token')?.value;
      
      if (refreshToken) {
        try {
          const tokens = await refreshAccessToken(refreshToken);
          request._newTokens = tokens;
          refreshed = true;
        } catch (refreshError) {
          console.error('Proactive refresh failed:', refreshError);
          // Continue with current session since it's still valid
        }
      }
    }

    return {
      user: sessionData.user,
      session: sessionData.session,
      error: null,
      refreshed
    };

  } catch (error) {
    console.error('Auth verification error:', error);
    return { user: null, error: 'Authentication service error', refreshed: false };
  }
}

/**
 * Higher-order function to create protected API routes with rolling token support
 * @param {Function} handler - The API route handler function
 * @param {Object} options - Configuration options
 * @returns {Function} - Wrapped handler with authentication
 */
export function withAuth(handler, options = {}) {
  return async (request) => {
    const authResult = await verifyAuth(request, options);
    
    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Add user to request for handler to use
    request.user = authResult.user;
    request.session = authResult.session;
    
    // Call the handler
    const response = await handler(request);
    
    // If tokens were refreshed, update cookies
    if (authResult.refreshed && request._newTokens) {
      const tokens = request._newTokens;
      
      response.cookies.set('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 // 15 minutes
      });
      
      response.cookies.set('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });
    }
    
    return response;
  };
}

/**
 * Role-based authentication wrapper with rolling token support
 * @param {Function} handler - The API route handler function
 * @param {Array|string} allowedRoles - Allowed roles for this route
 * @param {Object} options - Configuration options
 * @returns {Function} - Wrapped handler with role-based authentication
 */
export function withRoleAuth(handler, allowedRoles = [], options = {}) {
  return async (request) => {
    const authResult = await verifyAuth(request, options);
    
    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication required' },
        { status: 401 }
      );
    }

    // If roles are specified, check user role
    if (allowedRoles.length > 0) {
      const userRoles = authResult.user.roles || [];
      const hasPermission = allowedRoles.some(role => userRoles.includes(role));
      
      if (!hasPermission) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    request.user = authResult.user;
    request.session = authResult.session;
    
    const response = await handler(request);
    
    // Handle token refresh
    if (authResult.refreshed && request._newTokens) {
      const tokens = request._newTokens;
      
      response.cookies.set('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60
      });
      
      response.cookies.set('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60
      });
    }
    
    return response;
  };
}

/**
 * Optional authentication wrapper - allows both authenticated and guest users
 * @param {Function} handler - The API route handler function
 * @param {Object} options - Configuration options
 * @returns {Function} - Wrapped handler with optional authentication
 */
export function withOptionalAuth(handler, options = {}) {
  return async (request) => {
    const authResult = await verifyAuth(request, options);
    
    // Add user to request (will be null if not authenticated)
    request.user = authResult.user;
    request.session = authResult.session;
    
    const response = await handler(request);
    
    // Handle token refresh for authenticated users
    if (authResult.user && authResult.refreshed && request._newTokens) {
      const tokens = request._newTokens;
      
      response.cookies.set('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60
      });
      
      response.cookies.set('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60
      });
    }
    
    return response;
  };
}

// Legacy utility functions - use authService.js for new implementations

/**
 * Utility function to refresh session expiry (deprecated - use authService)
 * @param {string} sessionToken - The session token to refresh
 * @returns {Promise<boolean>} - Success status
 * @deprecated Use refreshAccessToken from authService instead
 */
export async function refreshSession(sessionToken) {
  console.warn('refreshSession is deprecated. Use refreshAccessToken from authService instead.');
  return false;
}

/**
 * Utility function to logout user from all devices (deprecated - use authService)
 * @param {number} userId - The user ID
 * @returns {Promise<boolean>} - Success status
 * @deprecated Use revokeAllUserSessions from authService instead
 */
export async function logoutAllSessions(userId) {
  console.warn('logoutAllSessions is deprecated. Use revokeAllUserSessions from authService instead.');
  return false;
}