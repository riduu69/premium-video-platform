import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Play, Lock, LogOut, Upload, Home, LayoutGrid, Search, ChevronRight, CheckCircle2, Trash2, CreditCard, Smartphone, Loader2, Plus } from 'lucide-react';
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
          Hridoy Hub
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className={cn("text-sm font-medium transition-colors hover:text-red-500", location.pathname === '/' ? "text-red-500" : "text-white/70")}>Home</Link>
          <Link to="/categories" className={cn("text-sm font-medium transition-colors hover:text-red-500", location.pathname === '/categories' ? "text-red-500" : "text-white/70")}>Categories</Link>
          {user?.role === 'admin' && <Link to="/admin" className={cn("text-sm font-medium transition-colors hover:text-red-500", location.pathname === '/admin' ? "text-red-500" : "text-white/70")}>Admin Panel</Link>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user?.role === 'admin' ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70 hidden sm:inline">Admin</span>
            <button onClick={() => { logout(); navigate('/'); }} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-white/30 hover:text-white/60 text-xs transition-colors">Admin Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

const VideoCard = ({ video, onDelete }: { video: any, onDelete?: (id: number) => void, key?: any }) => {
  const { user } = useAuth();
  
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="group relative aspect-video rounded-xl overflow-hidden bg-zinc-900 cursor-pointer shadow-lg border border-white/5"
    >
      <Link to={`/video/${video.id}`}>
        <img 
          src={video.thumbnail_url || `https://picsum.photos/seed/${video.id}/640/360`} 
          alt={video.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play size={24} fill="white" className="ml-1" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-white font-semibold text-sm md:text-base leading-tight group-hover:text-red-500 transition-colors">{video.title}</h3>
          <div className="flex items-center justify-between mt-2">
            <p className="text-white/60 text-[10px] uppercase tracking-wider">{video.category}</p>
            {video.is_premium === 1 && (
              <div className="bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Lock size={8} /> Premium
              </div>
            )}
          </div>
        </div>
      </Link>
      {user?.role === 'admin' && onDelete && (
        <button 
          onClick={(e) => { e.preventDefault(); onDelete(video.id); }}
          className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
        >
          <Trash2 size={14} />
        </button>
      )}
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

  const categories = ['Trending', 'Premium', 'Free'];

  return (
    <div className="pt-20 pb-12 min-h-screen bg-black text-white">
      {/* Hero Section */}
      {videos.length > 0 && (
        <div className="relative h-[70vh] w-full overflow-hidden">
          <img 
            src={videos[0].thumbnail_url || `https://picsum.photos/seed/hero/1920/1080`} 
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
                <span className="text-white/60 text-sm">{videos[0].category}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">{videos[0].title}</h1>
              <p className="text-lg text-white/70 mb-8 line-clamp-3">{videos[0].description}</p>
              <div className="flex items-center gap-4">
                <Link to={`/video/${videos[0].id}`} className="px-8 py-3 bg-white text-black font-bold rounded-full flex items-center gap-2 hover:bg-white/90 transition-all">
                  <Play size={20} fill="black" /> Play Now
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Rows */}
      <div className="px-6 md:px-16 -mt-20 relative z-10 space-y-16">
        {categories.map(cat => {
          const catVideos = videos.filter((v: any) => v.category === cat || (cat === 'Premium' && v.is_premium === 1) || (cat === 'Free' && v.is_premium === 0));
          if (catVideos.length === 0) return null;
          
          return (
            <div key={cat}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-red-600 rounded-full" />
                {cat}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {catVideos.map((video: any) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const VideoDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/videos/${id}`)
      .then(res => res.json())
      .then(data => {
        setVideo(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  if (!video) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Video not found</div>;

  const isLocked = video.is_premium === 1 && user?.role !== 'admin';

  return (
    <div className="pt-20 min-h-screen bg-black text-white px-6 md:px-16 pb-20">
      <div className="max-w-6xl mx-auto">
        {isLocked ? (
          <div className="aspect-video w-full bg-zinc-900 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <img src={video.thumbnail_url} className="w-full h-full object-cover blur-xl" />
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Lock size={40} className="text-amber-500" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Premium Content Locked</h2>
              <p className="text-white/60 mb-8 max-w-md mx-auto">To unlock this video, please complete the payment of <span className="text-amber-500 font-bold">${video.price}</span>.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center font-bold">b</div>
                    <span className="font-bold">bKash Payment</span>
                  </div>
                  <p className="text-xs text-white/50 mb-2">Send Money to:</p>
                  <p className="text-sm font-mono text-pink-500 font-bold">017XX-XXXXXX</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center font-bold">n</div>
                    <span className="font-bold">Nagad Payment</span>
                  </div>
                  <p className="text-xs text-white/50 mb-2">Send Money to:</p>
                  <p className="text-sm font-mono text-orange-500 font-bold">019XX-XXXXXX</p>
                </div>
              </div>
              
              <p className="text-xs text-white/30 italic">After payment, please contact support with your transaction ID to unlock.</p>
            </div>
          </div>
        ) : (
          <div className="aspect-video w-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
            <video 
              controls 
              autoPlay
              className="w-full h-full"
              poster={video.thumbnail_url}
              src={video.video_url}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        <div className="mt-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-red-500 font-bold uppercase tracking-widest text-xs">{video.category}</span>
                {video.is_premium === 1 && <span className="bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded text-[10px] font-bold">PREMIUM</span>}
              </div>
              <h1 className="text-4xl font-bold mb-4">{video.title}</h1>
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
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      login(data.token, data.user);
      navigate('/admin');
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
          <h2 className="text-2xl font-bold text-white">Admin Login</h2>
          <p className="text-white/50 mt-2">Manage your video library</p>
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
              placeholder="admin@hridoy.com"
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
      </motion.div>
    </div>
  );
};

const AdminPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Trending');
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState('9.99');
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/login');
    } else {
      fetchVideos();
    }
  }, [user, navigate]);

  const fetchVideos = () => {
    fetch('/api/videos')
      .then(res => res.json())
      .then(data => setVideos(data));
  };

  const uploadToCloudinary = async (file: File, resourceType: 'image' | 'video') => {
    // 1. Get signature from our API
    const sigRes = await fetch('/api/cloudinary-signature', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const { signature, timestamp, cloud_name, api_key } = await sigRes.json();

    // 2. Upload directly to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', api_key);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', 'hridoy_hub');

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`, {
      method: 'POST',
      body: formData
    });
    const uploadData = await uploadRes.json();
    return uploadData.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnailInputRef.current?.files?.[0] || !videoInputRef.current?.files?.[0]) {
      alert('Please select both thumbnail and video files');
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      // Upload Thumbnail
      setUploadProgress(20);
      const thumbnailUrl = await uploadToCloudinary(thumbnailInputRef.current.files[0], 'image');
      
      // Upload Video
      setUploadProgress(50);
      const videoUrl = await uploadToCloudinary(videoInputRef.current.files[0], 'video');
      
      setUploadProgress(90);
      
      // Save to Database
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
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';
        fetchVideos();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Check console for details.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    const res = await fetch(`/api/videos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchVideos();
    }
  };

  if (user?.role !== 'admin') return null;

  return (
    <div className="pt-28 min-h-screen bg-black text-white px-6 md:px-16 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <div className="bg-red-600/10 text-red-500 px-4 py-2 rounded-full text-sm font-bold border border-red-500/20">
            Admin Mode
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 shadow-2xl sticky top-28">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Upload className="text-red-500" size={20} /> Upload Video
              </h2>

              {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl text-sm mb-6">Published!</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Title"
                  required 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <option>Trending</option>
                  <option>Premium</option>
                  <option>Free</option>
                  <option>Action</option>
                  <option>Drama</option>
                </select>
                
                <div className="space-y-2">
                  <label className="text-xs text-white/50 block ml-1">Thumbnail Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    required 
                    ref={thumbnailInputRef}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/50 block ml-1">Video File (.mp4)</label>
                  <input 
                    type="file" 
                    accept="video/mp4"
                    required 
                    ref={videoInputRef}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                  />
                </div>

                <textarea 
                  placeholder="Description"
                  required 
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                />
                <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
                  <span className="text-sm text-white/70">Premium?</span>
                  <input 
                    type="checkbox" 
                    checked={isPremium}
                    onChange={e => setIsPremium(e.target.checked)}
                    className="w-5 h-5 accent-red-600"
                  />
                </div>
                {isPremium && (
                  <input 
                    type="number" 
                    step="0.01"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                )}
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Uploading {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Publish Video
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6">Manage Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {videos.map((video: any) => (
                <VideoCard key={video.id} video={video} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoriesPage = () => {
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Trending', 'Premium', 'Free', 'Action', 'Drama'];

  useEffect(() => {
    fetch('/api/videos')
      .then(res => res.json())
      .then(data => setVideos(data));
  }, []);

  const filteredVideos = selectedCategory === 'All' 
    ? videos 
    : videos.filter((v: any) => v.category === selectedCategory || (selectedCategory === 'Premium' && v.is_premium === 1) || (selectedCategory === 'Free' && v.is_premium === 0));

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
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
      </Routes>
      
      <footer className="bg-zinc-950 border-t border-white/5 py-12 px-6 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-2">Hridoy Hub</h2>
            <p className="text-white/40 text-sm">Premium streaming for the modern era.</p>
          </div>
          <p className="text-white/20 text-xs">© 2026 Hridoy Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
