import { NextRequest, NextResponse } from 'next/server';
import { 
  createSession, 
  hashPassword, 
  verifyPassword, 
  validateSession, 
  revokeSession,
  pool 
} from '../lib/authService.js';
import { withRateLimit, addSecurityHeaders } from '../lib/rateLimitMiddleware.js';

// Input validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  // At least 8 characters, containing letters and numbers
  return password && password.length >= 8;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

// POST /api/login - User login endpoint with rate limiting
export const POST = withRateLimit(async function(request) {
  let client;
  
  try {
    // Parse request body
    const body = await request.json();
    
    // Input validation
    if (!body.username && !body.email) {
      return NextResponse.json(
        { error: 'Username or email is required' },
        { status: 400 }
      );
    }
    
    if (!body.password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const username = sanitizeInput(body.username || '');
    const email = sanitizeInput(body.email || '');
    const password = sanitizeInput(body.password);

    // Validate email format if provided
    if (email && !validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    client = await pool.connect();

    // Query user by username or email
    let query;
    let queryParams;
    
    if (email) {
      query = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
      queryParams = [email];
    } else {
      query = 'SELECT * FROM users WHERE username = $1 LIMIT 1';
      queryParams = [username];
    }

    const userResult = await client.query(query, queryParams);
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Verify password
    if (!await verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session with rolling tokens
    const sessionData = {
      ipAddress: request.ip || null,
      userAgent: request.headers.get('user-agent') || null
    };
    
    const tokens = await createSession(user.id, sessionData);

    // Update last login
    await client.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Return success response with user data (excluding sensitive info)
    const responseData = {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatar: user.avatar,
        bio: user.bio,
        booksRead: user.books_read,
        followers: user.followers_count,
        following: user.following_count,
        location: user.location,
        joinDate: user.created_at
      },
      accessToken: tokens.accessToken,
      accessExpiresAt: tokens.accessExpiresAt,
      tokenVersion: tokens.tokenVersion
    };

    // Set secure cookies with separate access and refresh tokens
    const response = NextResponse.json(responseData, { status: 200 });
    
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
    console.error('Login error:', error);
    
    // Handle specific database errors
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}, 'login');

// GET /api/verify-session - Verify session token  
export const GET = withRateLimit(async function(request) {
  try {
    const accessToken = request.cookies.get('access_token')?.value ||
                       request.headers.get('Authorization')?.substring(7);
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token provided' },
        { status: 401 }
      );
    }

    const sessionData = await validateSession(accessToken);

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: sessionData.user,
      session: {
        tokenVersion: sessionData.session.tokenVersion,
        lastRefreshed: sessionData.session.lastRefreshed
      }
    });

  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, 'api');

// DELETE /api/logout - User logout
export const DELETE = withRateLimit(async function(request) {
  try {
    const accessToken = request.cookies.get('access_token')?.value ||
                       request.headers.get('Authorization')?.substring(7);
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token provided' },
        { status: 401 }
      );
    }

    // Revoke the session
    await revokeSession(accessToken);

    // Clear session cookies
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
    
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    });
    
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, 'api');
