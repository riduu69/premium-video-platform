import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Play, Lock, User, LogOut, Upload, Home, LayoutGrid, Search, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
          Hridoy Video Hub
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className={cn("text-sm font-medium transition-colors hover:text-red-500", location.pathname === '/' ? "text-red-500" : "text-white/70")}>Home</Link>
          <Link to="/categories" className={cn("text-sm font-medium transition-colors hover:text-red-500", location.pathname === '/categories' ? "text-red-500" : "text-white/70")}>Categories</Link>
          {user && <Link to="/dashboard" className={cn("text-sm font-medium transition-colors hover:text-red-500", location.pathname === '/dashboard' ? "text-red-500" : "text-white/70")}>My Library</Link>}
          {user?.role === 'admin' && <Link to="/admin" className={cn("text-sm font-medium transition-colors hover:text-red-500", location.pathname === '/admin' ? "text-red-500" : "text-white/70")}>Admin Panel</Link>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70 hidden sm:inline">{user.email}</span>
            <button onClick={() => { logout(); navigate('/login'); }} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-medium transition-all">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

const VideoCard = ({ video, isPurchased }: { video: any, isPurchased?: boolean, key?: any }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="group relative aspect-video rounded-xl overflow-hidden bg-zinc-900 cursor-pointer shadow-lg"
    >
      <Link to={`/video/${video.id}`}>
        <img 
          src={video.thumbnail_url || `https://picsum.photos/seed/${video.id}/640/360`} 
          alt={video.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="text-white font-semibold text-lg leading-tight">{video.title}</h3>
          <p className="text-white/60 text-xs mt-1 line-clamp-1">{video.category}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 p-2 rounded-full">
                <Play size={14} fill="white" />
              </div>
              <span className="text-xs font-medium text-white">Watch Now</span>
            </div>
            {video.is_premium && !isPurchased && (
              <div className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Lock size={10} /> Premium
              </div>
            )}
            {isPurchased && (
              <div className="bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={10} /> Unlocked
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// --- Pages ---

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/videos')
      .then(res => res.json())
      .then(data => {
        setVideos(data);
        setLoading(false);
      });
  }, []);

  const featured = videos[0];

  return (
    <div className="pt-20 pb-12 min-h-screen bg-black text-white">
      {/* Hero Section */}
      {featured && (
        <div className="relative h-[70vh] w-full overflow-hidden">
          <img 
            src={featured.thumbnail_url || `https://picsum.photos/seed/hero/1920/1080`} 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent flex flex-col justify-center px-6 md:px-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">Featured</span>
                <span className="text-white/60 text-sm">{featured.category}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">{featured.title}</h1>
              <p className="text-lg text-white/70 mb-8 line-clamp-3">{featured.description}</p>
              <div className="flex items-center gap-4">
                <Link to={`/video/${featured.id}`} className="px-8 py-3 bg-white text-black font-bold rounded-full flex items-center gap-2 hover:bg-white/90 transition-all">
                  <Play size={20} fill="black" /> Play Now
                </Link>
                <button className="px-8 py-3 bg-white/10 text-white font-bold rounded-full backdrop-blur-md hover:bg-white/20 transition-all">
                  More Info
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="px-6 md:px-16 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Trending Now</h2>
          <Link to="/categories" className="text-red-500 text-sm font-medium flex items-center gap-1 hover:underline">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-video rounded-xl bg-zinc-900 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map((video: any) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const VideoDetailPage = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [video, setVideo] = useState<any>(null);
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/videos/${id}`)
      .then(res => res.json())
      .then(data => {
        setVideo(data);
        if (user) {
          fetch('/api/user/purchases', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          .then(res => res.json())
          .then(purchases => {
            setPurchased(purchases.some((p: any) => p.id === parseInt(id!)));
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
  }, [id, user, token]);

  const handlePurchase = async () => {
    if (!user) return navigate('/login');
    const res = await fetch('/api/purchase', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ video_id: parseInt(id!) })
    });
    if (res.ok) {
      setPurchased(true);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  if (!video) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Video not found</div>;

  const canWatch = !video.is_premium || purchased || user?.role === 'admin';

  return (
    <div className="pt-20 min-h-screen bg-black text-white px-6 md:px-16 pb-20">
      <div className="max-w-6xl mx-auto">
        {canWatch ? (
          <div className="aspect-video w-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
            <video 
              controls 
              className="w-full h-full"
              poster={video.thumbnail_url}
              src={video.video_url}
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-zinc-900 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-white/5 shadow-2xl">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
              <Lock size={40} className="text-amber-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">This content is Premium</h2>
            <p className="text-white/60 mb-8 max-w-md">Unlock this video to enjoy high-quality streaming and exclusive content.</p>
            <button 
              onClick={handlePurchase}
              className="px-10 py-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full transition-all flex items-center gap-2"
            >
              Unlock Now for ${video.price || '9.99'}
            </button>
          </div>
        )}

        <div className="mt-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-red-500 font-bold uppercase tracking-widest text-xs">{video.category}</span>
                {video.is_premium && <span className="bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded text-[10px] font-bold">PREMIUM</span>}
              </div>
              <h1 className="text-4xl font-bold mb-4">{video.title}</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                <Search size={20} />
              </button>
              <button className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>
          <div className="h-px bg-white/10 my-8" />
          <p className="text-lg text-white/70 leading-relaxed max-w-4xl">{video.description}</p>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      login(data.token, data.user);
      navigate('/');
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-4 inline-block">
            Hridoy Hub
          </Link>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-white/50 mt-2">Sign in to continue streaming</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20">
            Sign In
          </button>
        </form>

        <p className="text-center mt-8 text-white/50 text-sm">
          Don't have an account? <Link to="/signup" className="text-red-500 font-bold hover:underline">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
};

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      navigate('/login');
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-4 inline-block">
            Hridoy Hub
          </Link>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-white/50 mt-2">Join our premium streaming community</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20">
            Create Account
          </button>
        </form>

        <p className="text-center mt-8 text-white/50 text-sm">
          Already have an account? <Link to="/login" className="text-red-500 font-bold hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

const DashboardPage = () => {
  const { user, token } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch('/api/user/purchases', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setPurchases(data);
        setLoading(false);
      });
    }
  }, [user, token]);

  return (
    <div className="pt-28 min-h-screen bg-black text-white px-6 md:px-16">
      <div className="flex items-center gap-6 mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-500 rounded-full flex items-center justify-center text-3xl font-bold">
          {user?.email[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user?.email}</h1>
          <p className="text-white/50">Premium Member</p>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <CheckCircle2 className="text-emerald-500" /> My Purchased Content
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-video rounded-xl bg-zinc-900 animate-pulse" />)}
          </div>
        ) : purchases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {purchases.map((video: any) => (
              <VideoCard key={video.id} video={video} isPurchased />
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-12 text-center">
            <p className="text-white/40 mb-6">You haven't purchased any premium videos yet.</p>
            <Link to="/" className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all inline-block">
              Browse Premium Content
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminPage = () => {
  const { user, token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [category, setCategory] = useState('Action');
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState('9.99');
  const [success, setSuccess] = useState(false);

  if (user?.role !== 'admin') return <div className="min-h-screen bg-black flex items-center justify-center text-white">Access Denied</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        title, 
        description, 
        thumbnail_url: thumbnailUrl, 
        video_url: videoUrl, 
        category, 
        is_premium: isPremium, 
        price: parseFloat(price) 
      })
    });
    if (res.ok) {
      setSuccess(true);
      setTitle('');
      setDescription('');
      setThumbnailUrl('');
      setVideoUrl('');
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="pt-28 min-h-screen bg-black text-white px-6 md:px-16 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <div className="bg-red-600/10 text-red-500 px-4 py-2 rounded-full text-sm font-bold border border-red-500/20">
            Admin Mode
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-10 shadow-2xl">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Upload className="text-red-500" /> Upload New Video
          </h2>

          {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl text-sm mb-8">Video uploaded successfully!</div>}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Video Title</label>
                  <input 
                    type="text" 
                    required 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Category</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                  >
                    <option>Action</option>
                    <option>Drama</option>
                    <option>Sci-Fi</option>
                    <option>Comedy</option>
                    <option>Documentary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Thumbnail URL</label>
                  <input 
                    type="url" 
                    required 
                    value={thumbnailUrl}
                    onChange={e => setThumbnailUrl(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Video URL (Direct MP4)</label>
                  <input 
                    type="url" 
                    required 
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
                  <textarea 
                    required 
                    rows={5}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all resize-none"
                  />
                </div>
                <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-white/70">Premium Content</label>
                    <input 
                      type="checkbox" 
                      checked={isPremium}
                      onChange={e => setIsPremium(e.target.checked)}
                      className="w-5 h-5 accent-red-600"
                    />
                  </div>
                  {isPremium && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-xs font-medium text-white/50 mb-2">Price (USD)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2">
              <Upload size={20} /> Publish Video
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const CategoriesPage = () => {
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Action', 'Drama', 'Sci-Fi', 'Comedy', 'Documentary'];

  useEffect(() => {
    fetch('/api/videos')
      .then(res => res.json())
      .then(data => setVideos(data));
  }, []);

  const filteredVideos = selectedCategory === 'All' 
    ? videos 
    : videos.filter((v: any) => v.category === selectedCategory);

  return (
    <div className="pt-28 min-h-screen bg-black text-white px-6 md:px-16 pb-20">
      <h1 className="text-4xl font-bold mb-10">Explore Categories</h1>
      
      <div className="flex flex-wrap gap-3 mb-12">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all border",
              selectedCategory === cat 
                ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20" 
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredVideos.map((video: any) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <div className="bg-black min-h-screen font-sans selection:bg-red-500/30">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/video/:id" element={<VideoDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
      </Routes>
      
      <footer className="bg-zinc-950 border-t border-white/5 py-12 px-6 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-2">Hridoy Video Hub</h2>
            <p className="text-white/40 text-sm">Premium streaming for the modern era.</p>
          </div>
          <div className="flex gap-8 text-white/40 text-sm">
            <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/" className="hover:text-white transition-colors">Help Center</Link>
          </div>
          <p className="text-white/20 text-xs">© 2026 Hridoy Video Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
