import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

// In-memory or SQLite? 
// For Vercel, SQLite is tricky. I'll use a simple file-based one but warn.
// On Vercel, /tmp is writable but not persistent.
const dbPath = process.env.VERCEL ? '/tmp/database.sqlite' : 'database.sqlite';
const db = new Database(dbPath);

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hridoy.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Initialize Database
db.exec(`
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
`);

// Seed Admin Logic (We use env vars for login, but we can still seed a user table if needed)
// For this rebuild, I'll use the env vars directly for the /api/login endpoint as requested.

// Seed initial videos if empty
const videoCount = db.prepare('SELECT COUNT(*) as count FROM videos').get() as { count: number };
if (videoCount.count === 0) {
  const sampleVideos = [
    {
      title: 'Cosmic Journey: Beyond the Stars',
      description: 'Explore the mysteries of the universe in this breathtaking documentary.',
      thumbnail_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1920&h=1080',
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      category: 'Trending',
      is_premium: 0,
      price: 0
    },
    {
      title: 'Neon Nights: Cyberpunk 2077',
      description: 'A high-octane action thriller set in a dystopian future.',
      thumbnail_url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=1920&h=1080',
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      category: 'Premium',
      is_premium: 1,
      price: 14.99
    },
    {
      title: 'The Last Stand',
      description: 'One soldier must make the ultimate sacrifice.',
      thumbnail_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920&h=1080',
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      category: 'Free',
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

// Auth Middleware
interface AuthRequest extends Request {
  user?: any;
}

const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Login Endpoint
app.post('/api/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET);
    return res.json({ token, user: { email, role: 'admin' } });
  }
  
  res.status(401).json({ error: 'Invalid credentials' });
});

// Video Routes
app.get('/api/videos', (req: Request, res: Response) => {
  const videos = db.prepare('SELECT * FROM videos').all();
  res.json(videos);
});

app.post('/api/videos', authenticate, (req: AuthRequest, res: Response) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  
  const { title, description, thumbnail_url, video_url, category, is_premium, price } = req.body;
  const result = db.prepare(`
    INSERT INTO videos (title, description, thumbnail_url, video_url, category, is_premium, price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(title, description, thumbnail_url, video_url, category, is_premium ? 1 : 0, price || 0);
  
  res.json({ id: result.lastInsertRowid });
});

app.delete('/api/videos/:id', authenticate, (req: AuthRequest, res: Response) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  
  db.prepare('DELETE FROM videos WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
