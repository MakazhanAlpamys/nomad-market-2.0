import { useState } from 'react';
import api from '../api';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const isWeak = mode === 'register' && password && !passwordRegex.test(password);

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'register' && !passwordRegex.test(password)) {
        setError('Пароль слабый.');
        return;
      }
      const url = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' ? { email, password } : { email, password, nickname };
      const r = await api.post(url, body);
      localStorage.setItem('token', r.data.token);
      localStorage.setItem('user', JSON.stringify(r.data.user));
      window.location.href = '/';
    } catch (e) {
      setError(e?.response?.data?.error || 'Ошибка');
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold sol-text-gradient mb-2">Welcome Back</h1>
        <p className="text-gray-400">Connect to the Solana marketplace</p>
      </div>
      
      <div className="glass-effect rounded-2xl p-8 border border-white/20 shadow-sol-card">
        <div className="flex gap-2 mb-6 p-1 glass-effect rounded-xl">
          <button 
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              mode==='login'
                ? 'bg-sol-gradient text-white shadow-sol-glow' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`} 
            onClick={()=>setMode('login')}
          >
            Sign In
          </button>
          <button 
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              mode==='register'
                ? 'bg-sol-gradient text-white shadow-sol-glow' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`} 
            onClick={()=>setMode('register')}
          >
            Sign Up
          </button>
        </div>
        
        <form onSubmit={submit} className="space-y-4">
          {mode==='register' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nickname</label>
              <input 
                className="w-full p-3 glass-effect rounded-xl border border-white/20 bg-transparent text-white placeholder-gray-400 focus:border-sol-purple focus:ring-1 focus:ring-sol-purple outline-none transition-all duration-200" 
                placeholder="Enter your nickname" 
                value={nickname} 
                onChange={e=>setNickname(e.target.value)} 
                required 
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input 
              className="w-full p-3 glass-effect rounded-xl border border-white/20 bg-transparent text-white placeholder-gray-400 focus:border-sol-purple focus:ring-1 focus:ring-sol-purple outline-none transition-all duration-200" 
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input 
                className="w-full p-3 glass-effect rounded-xl border border-white/20 bg-transparent text-white placeholder-gray-400 focus:border-sol-purple focus:ring-1 focus:ring-sol-purple outline-none transition-all duration-200" 
                type={showPw? 'text':'password'} 
                placeholder="Enter your password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button" 
                onClick={()=>setShowPw(s=>!s)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                {showPw ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          {mode==='register' && (
            <div className={`text-xs p-3 rounded-lg border ${
              isWeak 
                ? 'text-red-400 bg-red-500/10 border-red-500/20' 
                : 'text-gray-400 bg-gray-500/10 border-gray-500/20'
            }`}>
              Password must contain: 8+ characters, uppercase, lowercase, number, and special character
            </div>
          )}
          
          {error && (
            <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}
          
          <button 
            type="submit"
            className="w-full py-3 bg-sol-gradient hover:shadow-sol-glow rounded-xl font-medium transition-all duration-200 text-white"
          >
            {mode==='login' ? 'Sign In to Marketplace' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}


