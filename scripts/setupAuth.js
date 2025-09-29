const { Pool } = require('pg');
const crypto = require('crypto');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'boooks_db',
  user: process.env.DB_USER || 'boooks',
  password: process.env.DB_PASSWORD || 'boooks_pass',
});

// Simple password hashing function (matches the one in route.js)
function simpleHash(password) {
  return crypto.createHash('sha256').update(password + 'boooks_salt').digest('hex');
}

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Setting up authentication database...');
    
    // Create tables
    await client.query(`
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
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        ip_address INET,
        user_agent TEXT
      );
    `);
    
    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);');
    
    console.log('✅ Tables created successfully');
    
    // Insert sample users with properly hashed passwords
    const defaultPassword = 'password123';
    const hashedPassword = simpleHash(defaultPassword);
    
    const sampleUsers = [
      {
        username: 'bookworm_alice',
        email: 'alice@example.com',
        displayName: 'Alice Johnson',
        bio: 'Passionate reader of fantasy and sci-fi novels. Always looking for my next great adventure.',
        avatar: '/covers/000.webp',
        booksRead: 247,
        followers: 156,
        following: 89,
        location: 'Copenhagen, Denmark'
      },
      {
        username: 'literature_lover',
        email: 'marcus@example.com',
        displayName: 'Marcus Chen',
        bio: 'Literature professor and critic. I love dissecting the classics and discovering new voices.',
        avatar: '/covers/111.webp',
        booksRead: 892,
        followers: 423,
        following: 234,
        location: 'New York, USA'
      },
      {
        username: 'mystery_maven',
        email: 'sarah@example.com',
        displayName: 'Sarah Williams',
        bio: 'Detective novels are my weakness. From Agatha Christie to modern Nordic noir.',
        avatar: '/covers/222.webp',
        booksRead: 183,
        followers: 92,
        following: 145,
        location: 'London, UK'
      }
    ];
    
    for (const user of sampleUsers) {
      try {
        await client.query(`
          INSERT INTO users (username, email, password_hash, display_name, bio, avatar, 
                           books_read, followers_count, following_count, location)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (username) DO UPDATE SET
            email = EXCLUDED.email,
            display_name = EXCLUDED.display_name,
            bio = EXCLUDED.bio,
            avatar = EXCLUDED.avatar,
            books_read = EXCLUDED.books_read,
            followers_count = EXCLUDED.followers_count,
            following_count = EXCLUDED.following_count,
            location = EXCLUDED.location
        `, [
          user.username, user.email, hashedPassword, user.displayName, 
          user.bio, user.avatar, user.booksRead, user.followers, 
          user.following, user.location
        ]);
        console.log(`✅ User ${user.username} created/updated`);
      } catch (error) {
        console.error(`❌ Error creating user ${user.username}:`, error.message);
      }
    }
    
    console.log('🎉 Database setup complete!');
    console.log('📝 Sample users created with password: "password123"');
    console.log('🔑 You can login with:');
    console.log('   - Username: bookworm_alice, Password: password123');
    console.log('   - Username: literature_lover, Password: password123');
    console.log('   - Username: mystery_maven, Password: password123');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the setup
setupDatabase().catch(console.error);