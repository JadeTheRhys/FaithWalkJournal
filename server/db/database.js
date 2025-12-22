const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../../data/faithwalk.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

function initializeDatabase() {
  // Posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      approval_status TEXT DEFAULT 'pending' CHECK(approval_status IN ('pending', 'approved', 'rejected')),
      flagged_words TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Moderation log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS moderation_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      admin_username TEXT NOT NULL,
      reason TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
  `);

  // Word filters table
  db.exec(`
    CREATE TABLE IF NOT EXISTS word_filters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT UNIQUE NOT NULL,
      severity TEXT DEFAULT 'medium' CHECK(severity IN ('low', 'medium', 'high')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Admin users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default word filters
  const insertFilter = db.prepare('INSERT OR IGNORE INTO word_filters (word, severity) VALUES (?, ?)');
  const defaultFilters = [
    // High severity - immediate rejection
    ['damn', 'high'],
    ['hell', 'high'],
    ['hate', 'high'],
    ['kill', 'high'],
    ['die', 'high'],
    ['suicide', 'high'],
    ['death', 'medium'],
    // Medium severity - flag for review
    ['angry', 'low'],
    ['mad', 'low'],
    ['upset', 'low']
  ];
  
  const transaction = db.transaction(() => {
    for (const [word, severity] of defaultFilters) {
      insertFilter.run(word, severity);
    }
  });
  
  transaction();

  // Create default admin user if none exists (username: admin, password: changeme123)
  const adminExists = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
  if (adminExists.count === 0) {
    const hashedPassword = bcrypt.hashSync('changeme123', 10);
    db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', hashedPassword);
    console.log('Default admin user created: username=admin, password=changeme123');
    console.log('IMPORTANT: Please change the default password immediately!');
  }
}

// Initialize database on first require
initializeDatabase();

module.exports = db;
