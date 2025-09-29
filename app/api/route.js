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

// Simple password hashing (in production, use bcrypt)
function simpleHash(password) {
  // This is a basic hash - in production use bcrypt
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password + 'boooks_salt').digest('hex');
}

function verifyPassword(inputPassword, hashedPassword) {
  return simpleHash(inputPassword) === hashedPassword;
}

// Generate simple session token
function generateSessionToken() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

// POST /api/login - User login endpoint
export async function POST(request) {
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
    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store session in database
    await client.query(
      'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
      [user.id, sessionToken, expiresAt]
    );

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
      sessionToken
    };

    // Set session cookie
    const response = NextResponse.json(responseData, { status: 200 });
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;

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
}

// GET /api/verify-session - Verify session token
export async function GET(request) {
  let client;
  
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token provided' },
        { status: 401 }
      );
    }

    client = await pool.connect();

    // Check if session exists and is valid
    const sessionResult = await client.query(`
      SELECT s.*, u.username, u.email, u.display_name, u.avatar, u.bio, 
             u.books_read, u.followers_count, u.following_count, u.location, u.created_at
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = $1 AND s.expires_at > NOW()
    `, [sessionToken]);

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const session = sessionResult.rows[0];

    return NextResponse.json({
      success: true,
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
      }
    });

  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

// DELETE /api/logout - User logout
export async function DELETE(request) {
  let client;
  
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token provided' },
        { status: 401 }
      );
    }

    client = await pool.connect();

    // Delete session from database
    await client.query(
      'DELETE FROM user_sessions WHERE session_token = $1',
      [sessionToken]
    );

    // Clear session cookie
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.set('session_token', '', {
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
  } finally {
    if (client) {
      client.release();
    }
  }
}
