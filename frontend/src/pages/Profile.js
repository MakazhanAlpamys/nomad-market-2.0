import { useEffect, useState } from 'react';
import api from '../api';
import SolIcon from '../img/solana.png';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

export default function Profile() {
  const [data, setData] = useState(null);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;

  function load() {
    api.get(`/wallet/${userId}`).then(r => {
      setData(r.data);
      setEmail(r.data.user.email);
      setNickname(r.data.user.nickname);
    });
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setMsg(''); setErr('');
    if (password && !passwordRegex.test(password)) { setErr('Слабый пароль: aA1! и от 8 символов'); return; }
    try {
      const r = await api.put('/profile', { email, nickname, password: password || undefined });
      localStorage.setItem('user', JSON.stringify(r.data.user));
      setPassword('');
      setMsg('Пароль/профиль успешно сохранены');
      load();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Ошибка сохранения');
    }
  }

  if (!data) return <div>Загрузка...</div>;
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-4">
        <div className="bg-white rounded border p-3">
          <div className="font-semibold mb-2">Профиль</div>
          <div className="space-y-2">
            <input className="border rounded p-2 w-full" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="border rounded p-2 w-full" value={nickname} onChange={e=>setNickname(e.target.value)} />
            <div className="relative">
              <input className="border rounded p-2 w-full" type={showPw?'text':'password'} placeholder="Новый пароль (необязательно)" value={password} onChange={e=>setPassword(e.target.value)} />
              <button type="button" onClick={()=>setShowPw(s=>!s)} className="absolute right-2 top-2 text-sm text-gray-600">{showPw?'Скрыть':'Показать'}</button>
            </div>
            {password && !passwordRegex.test(password) && (
              <div className="text-xs text-red-600">Пароль слабый: минимум 8 символов, одна заглавная, одна строчная, цифра и символ</div>
            )}
            {msg && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2">{msg}</div>}
            {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{err}</div>}
            <button onClick={save} className="px-3 py-2 bg-indigo-600 text-white rounded">Сохранить</button>
          </div>
        </div>
        <div className="bg-white rounded border p-3">
          <div className="font-semibold mb-2">Транзакции</div>
          <div className="space-y-2 max-h-80 overflow-auto">
            {data.transactions.map(t => (
              <div key={t.id} className="text-sm border p-2 rounded">
                <div>Сумма: {t.amount} SOL</div>
                <div className="font-mono break-all">{t.tx_hash}</div>
                <div className="text-gray-500">{new Date(t.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-white rounded border p-3">
          <div className="text-sm text-gray-600">Адрес</div>
          <div className="font-mono break-all text-sm bg-gray-50 p-2 rounded">{data.user.wallet_address}</div>
          <div className="text-sm text-gray-600 mt-2">Баланс</div>
          <div className="text-2xl font-bold flex items-center gap-2">
            <img src={SolIcon} alt="SOL" className="w-5 h-5" />
            {Number(data.user.balance).toFixed(2)} SOL
          </div>
        </div>
        <div className="bg-white rounded border p-3">
          <div className="font-semibold mb-2">Мои токены</div>
          <div className="space-y-2 max-h-80 overflow-auto">
            {data.tokens.map(t => (
              <div key={t.id} className="text-sm border p-2 rounded">
                <div>Токен #{t.id} — {t.title}</div>
                <div>Цена: {t.price} SOL</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded border p-3">
          <div className="font-semibold mb-2">Уведомления</div>
          <div className="space-y-2 max-h-60 overflow-auto">
            {data.notifications.map(n => (
              <div key={n.id} className="text-sm border p-2 rounded">{n.message}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


