import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken, shouldRefreshToken, validateSession } from '../../lib/authService.js';
import { withRateLimit, addSecurityHeaders } from '../../lib/rateLimitMiddleware.js';

/**
 * POST /api/refresh - Refresh access token using refresh token
 */
export const POST = withRateLimit(async function(request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }
    
    // Refresh the tokens
    const tokens = await refreshAccessToken(refreshToken);
    
    // Set new tokens in cookies
    const response = NextResponse.json({
      success: true,
      accessToken: tokens.accessToken,
      accessExpiresAt: tokens.accessExpiresAt,
      tokenVersion: tokens.tokenVersion
    }, { status: 200 });
    
    // Set secure cookies
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
    
    return addSecurityHeaders(response);
    
  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}, 'refresh');

/**
 * GET /api/refresh/check - Check if token needs refresh
 */
export const GET = withRateLimit(async function(request) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        needsRefresh: true,
        reason: 'No access token found'
      });
    }
    
    const needsRefresh = shouldRefreshToken(accessToken);
    
    if (needsRefresh) {
      return NextResponse.json({
        needsRefresh: true,
        reason: 'Token expires soon'
      });
    }
    
    // Validate current session
    const sessionData = await validateSession(accessToken);
    
    if (!sessionData) {
      return NextResponse.json({
        needsRefresh: true,
        reason: 'Invalid session'
      });
    }
    
    return NextResponse.json({
      needsRefresh: false,
      user: sessionData.user,
      session: sessionData.session
    });
    
  } catch (error) {
    console.error('Token check error:', error);
    return NextResponse.json({
      needsRefresh: true,
      reason: 'Token validation failed'
    });
  }
}, 'api');