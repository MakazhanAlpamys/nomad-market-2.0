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
    <div className="max-w-md mx-auto bg-white rounded border p-4">
      <div className="flex gap-3 mb-4">
        <button className={`px-3 py-1.5 rounded ${mode==='login'?'bg-indigo-600 text-white':'bg-gray-100'}`} onClick={()=>setMode('login')}>Вход</button>
        <button className={`px-3 py-1.5 rounded ${mode==='register'?'bg-indigo-600 text-white':'bg-gray-100'}`} onClick={()=>setMode('register')}>Регистрация</button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        {mode==='register' && (
          <input className="border rounded p-2 w-full" placeholder="Никнейм" value={nickname} onChange={e=>setNickname(e.target.value)} required />
        )}
        <input className="border rounded p-2 w-full" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <div className="relative">
          <input className="border rounded p-2 w-full" type={showPw? 'text':'password'} placeholder="Пароль" value={password} onChange={e=>setPassword(e.target.value)} required />
          <button type="button" onClick={()=>setShowPw(s=>!s)} className="absolute right-2 top-2 text-sm text-gray-600">{showPw?'Скрыть':'Показать'}</button>
        </div>
        {mode==='register' && (
          <div className={`text-xs ${isWeak? 'text-red-600':'text-gray-500'}`}>Мин 8 символов, заглавная и строчная буквы, цифра и символ</div>
        )}
        {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 text-sm">{error}</div>}
        <button className="w-full bg-indigo-600 text-white py-2 rounded">{mode==='login'?'Войти':'Зарегистрироваться'}</button>
      </form>
    </div>
  );
}


