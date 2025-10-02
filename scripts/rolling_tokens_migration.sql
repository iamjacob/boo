-- Migration script to add rolling token support
-- Run this after the initial setup_auth_tables.sql

-- Add new columns to user_sessions table for rolling tokens
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS refresh_token VARCHAR(255);
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 1;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS last_refreshed TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessions_token_version ON user_sessions(token_version);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active);

-- Function to generate secure tokens
CREATE OR REPLACE FUNCTION generate_session_token()
RETURNS VARCHAR(255) AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to rotate session tokens
CREATE OR REPLACE FUNCTION rotate_session_token(
    p_session_token VARCHAR(255)
)
RETURNS TABLE(
    new_access_token VARCHAR(255),
    new_refresh_token VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_user_id INTEGER;
    v_new_access_token VARCHAR(255);
    v_new_refresh_token VARCHAR(255);
    v_new_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if session exists and is active
    SELECT user_id INTO v_user_id 
    FROM user_sessions 
    WHERE session_token = p_session_token 
    AND expires_at > NOW() 
    AND is_active = true;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired session token';
    END IF;
    
    -- Generate new tokens
    v_new_access_token := generate_session_token();
    v_new_refresh_token := generate_session_token();
    v_new_expires_at := NOW() + INTERVAL '15 minutes'; -- Short-lived access token
    
    -- Update the session with new tokens
    UPDATE user_sessions 
    SET 
        session_token = v_new_access_token,
        refresh_token = v_new_refresh_token,
        expires_at = v_new_expires_at,
        token_version = token_version + 1,
        last_refreshed = NOW()
    WHERE session_token = p_session_token;
    
    -- Return new tokens
    RETURN QUERY SELECT v_new_access_token, v_new_refresh_token, v_new_expires_at;
END;
$$ LANGUAGE plpgsql;

-- Function to create new session with refresh token
CREATE OR REPLACE FUNCTION create_session_with_refresh(
    p_user_id INTEGER,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE(
    access_token VARCHAR(255),
    refresh_token VARCHAR(255),
    access_expires_at TIMESTAMP WITH TIME ZONE,
    refresh_expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_access_token VARCHAR(255);
    v_refresh_token VARCHAR(255);
    v_access_expires_at TIMESTAMP WITH TIME ZONE;
    v_refresh_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Generate tokens
    v_access_token := generate_session_token();
    v_refresh_token := generate_session_token();
    v_access_expires_at := NOW() + INTERVAL '15 minutes'; -- Short-lived access token
    v_refresh_expires_at := NOW() + INTERVAL '7 days'; -- Long-lived refresh token
    
    -- Insert new session
    INSERT INTO user_sessions (
        user_id, 
        session_token, 
        refresh_token, 
        expires_at, 
        ip_address, 
        user_agent,
        token_version,
        last_refreshed,
        is_active
    ) VALUES (
        p_user_id, 
        v_access_token, 
        v_refresh_token, 
        v_access_expires_at, 
        p_ip_address, 
        p_user_agent,
        1,
        NOW(),
        true
    );
    
    -- Return tokens
    RETURN QUERY SELECT v_access_token, v_refresh_token, v_access_expires_at, v_refresh_expires_at;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh access token using refresh token
CREATE OR REPLACE FUNCTION refresh_access_token(
    p_refresh_token VARCHAR(255)
)
RETURNS TABLE(
    new_access_token VARCHAR(255),
    new_refresh_token VARCHAR(255),
    access_expires_at TIMESTAMP WITH TIME ZONE,
    refresh_expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_session_id INTEGER;
    v_user_id INTEGER;
    v_new_access_token VARCHAR(255);
    v_new_refresh_token VARCHAR(255);
    v_access_expires_at TIMESTAMP WITH TIME ZONE;
    v_refresh_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if refresh token exists and is valid
    SELECT id, user_id INTO v_session_id, v_user_id
    FROM user_sessions 
    WHERE refresh_token = p_refresh_token 
    AND expires_at > NOW() -- This checks the refresh token expiry
    AND is_active = true;
    
    IF v_session_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired refresh token';
    END IF;
    
    -- Generate new tokens
    v_new_access_token := generate_session_token();
    v_new_refresh_token := generate_session_token();
    v_access_expires_at := NOW() + INTERVAL '15 minutes';
    v_refresh_expires_at := NOW() + INTERVAL '7 days';
    
    -- Update session with new tokens
    UPDATE user_sessions 
    SET 
        session_token = v_new_access_token,
        refresh_token = v_new_refresh_token,
        expires_at = v_refresh_expires_at, -- Update to refresh token expiry
        token_version = token_version + 1,
        last_refreshed = NOW()
    WHERE id = v_session_id;
    
    -- Return new tokens
    RETURN QUERY SELECT v_new_access_token, v_new_refresh_token, v_access_expires_at, v_refresh_expires_at;
END;
$$ LANGUAGE plpgsql;

-- Function to revoke all sessions for a user
CREATE OR REPLACE FUNCTION revoke_all_user_sessions(p_user_id INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE user_sessions 
    SET is_active = false 
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to cleanup expired sessions (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-sessions', '*/5 * * * *', 'SELECT cleanup_expired_sessions();');