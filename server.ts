import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';

const db = new Database('database.sqlite');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    thumbnail_url TEXT,
    video_url TEXT,
    category TEXT,
    is_premium BOOLEAN DEFAULT 0,
    price REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    video_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(video_id) REFERENCES videos(id)
  );
`);

// Seed Admin if not exists
const adminEmail = 'admin@hridoy.com';
const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)').run(adminEmail, hashedPassword, 'admin');
}

// Seed initial videos if empty
const videoCount = db.prepare('SELECT COUNT(*) as count FROM videos').get() as { count: number };
if (videoCount.count === 0) {
  const sampleVideos = [
    {
      title: 'Cosmic Journey: Beyond the Stars',
      description: 'Explore the mysteries of the universe in this breathtaking documentary about deep space exploration and the future of humanity among the stars.',
      thumbnail_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1920&h=1080',
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      category: 'Documentary',
      is_premium: 0,
      price: 0
    },
    {
      title: 'Neon Nights: Cyberpunk 2077',
      description: 'A high-octane action thriller set in a dystopian future where technology and crime collide in the neon-lit streets of Night City.',
      thumbnail_url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=1920&h=1080',
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      category: 'Sci-Fi',
      is_premium: 1,
      price: 14.99
    },
    {
      title: 'The Last Stand',
      description: 'In a world ravaged by war, one soldier must make the ultimate sacrifice to save what remains of his family and his country.',
      thumbnail_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920&h=1080',
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      category: 'Action',
      is_premium: 1,
      price: 9.99
    },
    {
      title: 'Urban Legends: The Silent City',
      description: 'A psychological drama about a woman who discovers that the city she lives in is not what it seems, and the people around her are hiding a dark secret.',
      thumbnail_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1920&h=1080',
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      category: 'Drama',
      is_premium: 0,
      price: 0
    }
  ];

  const insertVideo = db.prepare(`
    INSERT INTO videos (title, description, thumbnail_url, video_url, category, is_premium, price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  sampleVideos.forEach(v => {
    insertVideo.run(v.title, v.description, v.thumbnail_url, v.video_url, v.category, v.is_premium, v.price);
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  };

  // Auth Routes
  app.post('/api/auth/signup', (req, res) => {
    const { email, password } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, hashedPassword);
      res.json({ id: result.lastInsertRowid });
    } catch (err) {
      res.status(400).json({ error: 'Email already exists' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  });

  // Video Routes
  app.get('/api/videos', (req, res) => {
    const videos = db.prepare('SELECT * FROM videos').all();
    res.json(videos);
  });

  app.get('/api/videos/:id', (req, res) => {
    const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
    res.json(video);
  });

  app.post('/api/videos', authenticate, isAdmin, (req, res) => {
    const { title, description, thumbnail_url, video_url, category, is_premium, price } = req.body;
    const result = db.prepare(`
      INSERT INTO videos (title, description, thumbnail_url, video_url, category, is_premium, price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title, description, thumbnail_url, video_url, category, is_premium ? 1 : 0, price || 0);
    res.json({ id: result.lastInsertRowid });
  });

  // Purchase Routes
  app.post('/api/purchase', authenticate, (req: any, res) => {
    const { video_id } = req.body;
    const user_id = req.user.id;
    // Check if already purchased
    const existing = db.prepare('SELECT * FROM purchases WHERE user_id = ? AND video_id = ?').get(user_id, video_id);
    if (existing) return res.json({ message: 'Already purchased' });

    db.prepare('INSERT INTO purchases (user_id, video_id) VALUES (?, ?)').run(user_id, video_id);
    res.json({ success: true });
  });

  app.get('/api/user/purchases', authenticate, (req: any, res) => {
    const purchases = db.prepare(`
      SELECT v.* FROM videos v
      JOIN purchases p ON v.id = p.video_id
      WHERE p.user_id = ?
    `).all(req.user.id);
    res.json(purchases);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
