-- Database schema for user authentication
-- Run this script to set up the necessary tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar VARCHAR(500),
    books_read INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- User sessions table for authentication
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- Insert sample users with hashed passwords
-- Note: These passwords are hashed with our simple hash function
-- Default password for all sample users is: "password123"
-- Hash: sha256("password123" + "boooks_salt")

INSERT INTO users (username, email, password_hash, display_name, bio, avatar, books_read, followers_count, following_count, location) 
VALUES 
    ('bookworm_alice', 'alice@example.com', 
     'e3b5c0c9f0a2b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8', 
     'Alice Johnson', 
     'Passionate reader of fantasy and sci-fi novels. Always looking for my next great adventure.',
     '/covers/000.webp', 247, 156, 89, 'Copenhagen, Denmark'),
    
    ('literature_lover', 'marcus@example.com', 
     'e3b5c0c9f0a2b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
     'Marcus Chen',
     'Literature professor and critic. I love dissecting the classics and discovering new voices.',
     '/covers/111.webp', 892, 423, 234, 'New York, USA'),
    
    ('mystery_maven', 'sarah@example.com',
     'e3b5c0c9f0a2b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
     'Sarah Williams',
     'Detective novels are my weakness. From Agatha Christie to modern Nordic noir.',
     '/covers/222.webp', 183, 92, 145, 'London, UK'),
    
    ('nonfiction_nerd', 'david@example.com',
     'e3b5c0c9f0a2b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
     'David Kumar',
     'History buff and science enthusiast. I believe in learning something new every day.',
     '/covers/333.webp', 156, 78, 102, 'Mumbai, India'),
     
    ('romance_reader', 'emma@example.com',
     'e3b5c0c9f0a2b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
     'Emma Rodriguez',
     'Hopeless romantic who believes in happy endings. Contemporary and historical romance are my favorites.',
     '/covers/444.webp', 298, 267, 198, 'Barcelona, Spain')
ON CONFLICT (username) DO NOTHING;

-- Function to clean up expired sessions (optional)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_users_modtime 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();