import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Initialize database schema
export const initializeDatabase = async () => {
  try {
    const client = await pool.connect();

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date DATE,
        location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'planning',
        max_participants INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        event_id INTEGER REFERENCES events(id),
        status VARCHAR(50) DEFAULT 'pending',
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        user1_id INTEGER REFERENCES users(id),
        user2_id INTEGER REFERENCES users(id),
        event_id INTEGER REFERENCES events(id),
        match_score NUMERIC,
        shared_interests JSONB,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(255),
        user_id INTEGER REFERENCES users(id),
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS polls (
        id VARCHAR(36) PRIMARY KEY,
        admin_token VARCHAR(32) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        duration VARCHAR(255),
        expected INTEGER DEFAULT 0,
        open_access BOOLEAN DEFAULT true,
        date1 VARCHAR(255) NOT NULL,
        time1 VARCHAR(5),
        date2 VARCHAR(255) NOT NULL,
        time2 VARCHAR(5),
        date3 VARCHAR(255) NOT NULL,
        time3 VARCHAR(5),
        timer_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS invites (
        id SERIAL PRIMARY KEY,
        poll_id VARCHAR(36) NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        poll_id VARCHAR(36) NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        voter_name VARCHAR(255) NOT NULL,
        choice VARCHAR(50) NOT NULL,
        alt_date VARCHAR(255),
        voter_token VARCHAR(255),
        submitted_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(poll_id, voter_token)
      );
    `);

    client.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export default pool;
