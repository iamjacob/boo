import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map();

/**
 * Rate limiting configuration
 */
const RATE_LIMITS = {
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5, // 5 attempts per window
    blockDuration: 30 * 60 * 1000, // 30 minutes block
  },
  refresh: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxAttempts: 10, // 10 refresh attempts per window
    blockDuration: 10 * 60 * 1000, // 10 minutes block
  },
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxAttempts: 60, // 60 requests per minute
    blockDuration: 5 * 60 * 1000, // 5 minutes block
  }
};

/**
 * Get client identifier for rate limiting
 * @param {NextRequest} request - The request object
 * @returns {string} - Client identifier
 */
function getClientId(request) {
  // Prefer forwarded IP for production behind proxies
  const forwardedIp = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedIp?.split(',')[0] || realIp || request.ip || 'unknown';
  
  // Include user agent for additional uniqueness
  const userAgent = request.headers.get('user-agent') || '';
  const agentHash = Buffer.from(userAgent).toString('base64').slice(0, 8);
  
  return `${ip}:${agentHash}`;
}

/**
 * Clean up expired entries from rate limit store
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now && data.blockUntil < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate limiting middleware
 * @param {NextRequest} request - The request object
 * @param {string} limitType - Type of rate limit to apply ('login', 'refresh', 'api')
 * @returns {Object} - Rate limit result
 */
export function checkRateLimit(request, limitType = 'api') {
  const clientId = getClientId(request);
  const config = RATE_LIMITS[limitType];
  const now = Date.now();
  const key = `${limitType}:${clientId}`;
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to trigger cleanup
    cleanupExpiredEntries();
  }
  
  let data = rateLimitStore.get(key);
  
  if (!data) {
    // First request
    data = {
      count: 1,
      resetTime: now + config.windowMs,
      blockUntil: 0,
      firstRequest: now
    };
    rateLimitStore.set(key, data);
    
    return {
      allowed: true,
      count: 1,
      limit: config.maxAttempts,
      remaining: config.maxAttempts - 1,
      resetTime: data.resetTime,
      retryAfter: 0
    };
  }
  
  // Check if currently blocked
  if (data.blockUntil > now) {
    return {
      allowed: false,
      count: data.count,
      limit: config.maxAttempts,
      remaining: 0,
      resetTime: data.resetTime,
      retryAfter: Math.ceil((data.blockUntil - now) / 1000),
      blocked: true
    };
  }
  
  // Check if window has expired
  if (data.resetTime <= now) {
    // Reset window
    data = {
      count: 1,
      resetTime: now + config.windowMs,
      blockUntil: 0,
      firstRequest: now
    };
    rateLimitStore.set(key, data);
    
    return {
      allowed: true,
      count: 1,
      limit: config.maxAttempts,
      remaining: config.maxAttempts - 1,
      resetTime: data.resetTime,
      retryAfter: 0
    };
  }
  
  // Increment count
  data.count++;
  
  if (data.count > config.maxAttempts) {
    // Block the client
    data.blockUntil = now + config.blockDuration;
    rateLimitStore.set(key, data);
    
    return {
      allowed: false,
      count: data.count,
      limit: config.maxAttempts,
      remaining: 0,
      resetTime: data.resetTime,
      retryAfter: Math.ceil(config.blockDuration / 1000),
      blocked: true
    };
  }
  
  rateLimitStore.set(key, data);
  
  return {
    allowed: true,
    count: data.count,
    limit: config.maxAttempts,
    remaining: config.maxAttempts - data.count,
    resetTime: data.resetTime,
    retryAfter: 0
  };
}

/**
 * Higher-order function to add rate limiting to API routes
 * @param {Function} handler - The API route handler
 * @param {string} limitType - Type of rate limit ('login', 'refresh', 'api')
 * @returns {Function} - Wrapped handler with rate limiting
 */
export function withRateLimit(handler, limitType = 'api') {
  return async (request) => {
    const rateLimit = checkRateLimit(request, limitType);
    
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          error: rateLimit.blocked 
            ? 'Too many requests. You have been temporarily blocked.' 
            : 'Too many requests. Please try again later.',
          retryAfter: rateLimit.retryAfter,
          limit: rateLimit.limit,
          remaining: rateLimit.remaining
        },
        { status: 429 }
      );
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());
      response.headers.set('Retry-After', rateLimit.retryAfter.toString());
      
      return response;
    }
    
    // Call the original handler
    const response = await handler(request);
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());
    
    return response;
  };
}

/**
 * Reset rate limit for a specific client (useful for admin actions)
 * @param {NextRequest} request - The request object
 * @param {string} limitType - Type of rate limit to reset
 * @returns {boolean} - Success status
 */
export function resetRateLimit(request, limitType = 'api') {
  const clientId = getClientId(request);
  const key = `${limitType}:${clientId}`;
  
  return rateLimitStore.delete(key);
}

/**
 * Get current rate limit status for a client
 * @param {NextRequest} request - The request object
 * @param {string} limitType - Type of rate limit to check
 * @returns {Object} - Current rate limit status
 */
export function getRateLimitStatus(request, limitType = 'api') {
  const clientId = getClientId(request);
  const config = RATE_LIMITS[limitType];
  const key = `${limitType}:${clientId}`;
  const data = rateLimitStore.get(key);
  const now = Date.now();
  
  if (!data) {
    return {
      count: 0,
      limit: config.maxAttempts,
      remaining: config.maxAttempts,
      resetTime: null,
      blocked: false
    };
  }
  
  return {
    count: data.count,
    limit: config.maxAttempts,
    remaining: Math.max(0, config.maxAttempts - data.count),
    resetTime: data.resetTime,
    blocked: data.blockUntil > now,
    retryAfter: data.blockUntil > now ? Math.ceil((data.blockUntil - now) / 1000) : 0
  };
}

/**
 * Security headers middleware
 * @param {NextResponse} response - The response object
 * @returns {NextResponse} - Response with security headers
 */
export function addSecurityHeaders(response) {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Enforce HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  );
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export { RATE_LIMITS };