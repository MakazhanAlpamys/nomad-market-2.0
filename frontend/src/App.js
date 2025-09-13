import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Logo from './img/logo nomad-market.svg';
import Home from './pages/Home';
import Auth from './pages/Auth';
import CreateListing from './pages/CreateListing';
import MyListings from './pages/MyListings';
import Profile from './pages/Profile';
import Admin from './pages/admin/Admin';
import About from './pages/About';
import WalletPopup from './components/WalletPopup';
import { useState } from 'react';

function RequireAuth({ children }) {
  const isAuthed = !!localStorage.getItem('token');
  const location = useLocation();
  if (!isAuthed) return <Navigate to="/auth" state={{ from: location }} replace />;
  return children;
}

function App() {
  const [walletOpen, setWalletOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthed = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')||'{}');
  const isAdmin = !!user?.is_admin;
  return (
    <Router>
      <div className="min-h-screen bg-sol-bg text-white">
        <nav className="glass-effect sticky top-0 z-50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center" aria-label="Nomad-Market">
                <img src={Logo} alt="Nomad-Market" className="h-12 w-auto filter brightness-0 invert" />
                <div className="ml-3 hidden sm:block">
                  <div className="text-xl font-bold sol-text-gradient">Nomad Market</div>
                  <div className="text-xs text-gray-400">Powered by Solana</div>
                </div>
              </Link>
            </div>
            <button className="md:hidden px-3 py-2 rounded-lg glass-effect text-white" onClick={()=>setMobileOpen(o=>!o)} aria-label="menu">☰</button>
            <div className="hidden md:flex items-center gap-2">
              {!isAdmin && <Link to="/" className="px-4 py-2 glass-effect hover:bg-white/20 rounded-lg transition-all duration-200">Marketplace</Link>}
              {isAuthed && !isAdmin && <Link to="/create" className="px-4 py-2 bg-sol-gradient hover:shadow-sol-glow rounded-lg font-medium transition-all duration-200">Create Listing</Link>}
              {isAuthed && !isAdmin && <Link to="/my" className="px-4 py-2 glass-effect hover:bg-white/20 rounded-lg transition-all duration-200">My Listings</Link>}
              {isAuthed && !isAdmin && <Link to="/profile" className="px-4 py-2 glass-effect hover:bg-white/20 rounded-lg transition-all duration-200">Profile</Link>}
              {isAuthed && !isAdmin && <button onClick={() => setWalletOpen(true)} className="px-4 py-2 bg-gradient-to-r from-sol-green to-sol-blue hover:shadow-sol-glow rounded-lg font-medium transition-all duration-200">Connect Wallet</button>}
              {!isAuthed && <Link to="/auth" className="px-4 py-2 bg-sol-gradient hover:shadow-sol-glow rounded-lg font-medium transition-all duration-200">Sign In</Link>}
              {isAuthed && isAdmin && <Link to="/admin" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-sol-glow rounded-lg font-medium transition-all duration-200">Admin Panel</Link>}
              <Link to="/about" className="px-4 py-2 glass-effect hover:bg-white/20 rounded-lg transition-all duration-200">О нас</Link>
              {isAuthed && <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href='/'; }} className="px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-all duration-200">Sign Out</button>}
            </div>
          </div>
          {mobileOpen && (
            <div className="md:hidden border-t border-white/10 glass-effect">
              <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
                {!isAdmin && <Link onClick={()=>setMobileOpen(false)} to="/" className="px-4 py-2 glass-effect rounded-lg">Marketplace</Link>}
                {isAuthed && !isAdmin && <Link onClick={()=>setMobileOpen(false)} to="/create" className="px-4 py-2 bg-sol-gradient rounded-lg">Create Listing</Link>}
                {isAuthed && !isAdmin && <Link onClick={()=>setMobileOpen(false)} to="/my" className="px-4 py-2 glass-effect rounded-lg">My Listings</Link>}
                {isAuthed && !isAdmin && <Link onClick={()=>setMobileOpen(false)} to="/profile" className="px-4 py-2 glass-effect rounded-lg">Profile</Link>}
                {isAuthed && !isAdmin && <button onClick={()=>{ setWalletOpen(true); setMobileOpen(false); }} className="px-4 py-2 bg-gradient-to-r from-sol-green to-sol-blue rounded-lg text-left">Connect Wallet</button>}
                {!isAuthed && <Link onClick={()=>setMobileOpen(false)} to="/auth" className="px-4 py-2 bg-sol-gradient rounded-lg">Sign In</Link>}
                {isAuthed && isAdmin && <Link onClick={()=>setMobileOpen(false)} to="/admin" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">Admin Panel</Link>}
                <Link onClick={()=>setMobileOpen(false)} to="/about" className="px-4 py-2 glass-effect rounded-lg">О нас</Link>
                {isAuthed && <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href='/'; }} className="px-4 py-2 bg-red-600/80 rounded-lg text-left">Sign Out</button>}
              </div>
            </div>
          )}
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Routes>
            <Route path="/" element={isAuthed ? (isAdmin ? <Navigate to="/admin" /> : <Home />) : <Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/create" element={<RequireAuth><CreateListing /></RequireAuth>} />
            <Route path="/my" element={<RequireAuth><MyListings /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/admin/*" element={<RequireAuth><Admin /></RequireAuth>} />
          </Routes>
        </div>
        <WalletPopup open={walletOpen} onClose={() => setWalletOpen(false)} />
        <footer className="mt-16 border-t border-white/10 glass-effect">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={Logo} alt="Nomad-Market" className="h-8 w-auto filter brightness-0 invert" />
                <div>
                  <div className="font-semibold sol-text-gradient">Nomad Market</div>
                  <div className="text-xs text-gray-400">Decentralized Marketplace on Solana</div>
                </div>
              </div>
              <div className="text-sm text-gray-400 text-center md:text-right">
                <div>© {new Date().getFullYear()} Nomad Market</div>
                <div>Built for the Solana ecosystem</div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
