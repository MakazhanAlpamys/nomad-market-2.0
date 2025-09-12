import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Logo from './img/logo nomad-market.svg';
import Home from './pages/Home';
import Auth from './pages/Auth';
import CreateListing from './pages/CreateListing';
import MyListings from './pages/MyListings';
import Profile from './pages/Profile';
import Admin from './pages/admin/Admin';
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
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white/90 backdrop-blur border-b sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center" aria-label="Nomad-Market">
                <img src={Logo} alt="Nomad-Market" className="h-10 w-auto" />
              </Link>
            </div>
            <button className="md:hidden px-3 py-2 rounded border" onClick={()=>setMobileOpen(o=>!o)} aria-label="menu">☰</button>
            <div className="hidden md:flex items-center gap-2">
              {!isAdmin && <Link to="/" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full">Маркет</Link>}
              {isAuthed && !isAdmin && <Link to="/create" className="px-3 py-1.5 bg-indigo-600 text-white rounded-full shadow hover:shadow-md">Создать</Link>}
              {isAuthed && !isAdmin && <Link to="/my" className="px-3 py-1.5 bg-white border rounded-full hover:bg-gray-50">Мои объявления</Link>}
              {isAuthed && !isAdmin && <Link to="/profile" className="px-3 py-1.5 bg-white border rounded-full hover:bg-gray-50">Профиль</Link>}
              {isAuthed && !isAdmin && <button onClick={() => setWalletOpen(true)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-full shadow hover:shadow-md">Wallet</button>}
              {!isAuthed && <Link to="/auth" className="px-3 py-1.5 bg-gray-800 text-white rounded-full">Войти</Link>}
              {isAuthed && isAdmin && <Link to="/admin" className="px-3 py-1.5 bg-purple-600 text-white rounded-full shadow hover:shadow-md">Админ</Link>}
              {isAuthed && <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href='/'; }} className="px-3 py-1.5 bg-red-600 text-white rounded-full">Выйти</button>}
            </div>
          </div>
          {mobileOpen && (
            <div className="md:hidden border-t bg-white">
              <div className="max-w-6xl mx-auto px-3 py-2 flex flex-col gap-2">
                {!isAdmin && <Link onClick={()=>setMobileOpen(false)} to="/" className="px-3 py-2 bg-gray-100 rounded">Маркет</Link>}
                {isAuthed && !isAdmin && <Link onClick={()=>setMobileOpen(false)} to="/create" className="px-3 py-2 bg-indigo-600 text-white rounded">Создать</Link>}
                {isAuthed && !isAdmin && <Link onClick={()=>setMobileOpen(false)} to="/my" className="px-3 py-2 bg-white border rounded">Мои объявления</Link>}
                {isAuthed && !isAdmin && <Link onClick={()=>setMobileOpen(false)} to="/profile" className="px-3 py-2 bg-white border rounded">Профиль</Link>}
                {isAuthed && !isAdmin && <button onClick={()=>{ setWalletOpen(true); setMobileOpen(false); }} className="px-3 py-2 bg-emerald-600 text-white rounded">Wallet</button>}
                {!isAuthed && <Link onClick={()=>setMobileOpen(false)} to="/auth" className="px-3 py-2 bg-gray-800 text-white rounded">Войти</Link>}
                {isAuthed && isAdmin && <Link onClick={()=>setMobileOpen(false)} to="/admin" className="px-3 py-2 bg-purple-600 text-white rounded">Админ</Link>}
                {isAuthed && <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href='/'; }} className="px-3 py-2 bg-red-600 text-white rounded">Выйти</button>}
              </div>
            </div>
          )}
        </nav>
        <div className="max-w-6xl mx-auto p-3 sm:p-4">
          <Routes>
            <Route path="/" element={isAuthed ? (isAdmin ? <Navigate to="/admin" /> : <Home />) : <Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/create" element={<RequireAuth><CreateListing /></RequireAuth>} />
            <Route path="/my" element={<RequireAuth><MyListings /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/admin/*" element={<RequireAuth><Admin /></RequireAuth>} />
          </Routes>
        </div>
        <WalletPopup open={walletOpen} onClose={() => setWalletOpen(false)} />
        <footer className="mt-10 border-t bg-white">
          <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500 flex items-center justify-between">
            <div>© {new Date().getFullYear()} Nomad-Market</div>
            <div>Сделано для MVP. Имитация Solana.</div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
