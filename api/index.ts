import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

const app = express();
app.use(express.json());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// In-memory or SQLite? 
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

// Cloudinary Signature for secure frontend upload
app.get('/api/cloudinary-signature', authenticate, (req: AuthRequest, res: Response) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'hridoy_hub' },
    process.env.CLOUDINARY_API_SECRET!
  );
  
  res.json({
    signature,
    timestamp,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
  });
});

// Video Routes
app.get('/api/videos', (req: Request, res: Response) => {
  const videos = db.prepare('SELECT * FROM videos').all();
  res.json(videos);
});

app.get('/api/videos/:id', (req: Request, res: Response) => {
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found' });
  res.json(video);
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
