import { useEffect, useState } from 'react';
import api from '../../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [activeTx, setActiveTx] = useState([]);

  function load() {
    api.get('/admin/users').then(r => setUsers(r.data));
  }
  useEffect(() => { load(); }, []);

  async function showTx(id) {
    const r = await api.get(`/admin/users/${id}/transactions`);
    setActiveTx(r.data);
  }

  async function removeUser(id) {
    const ok = window.confirm('Удалить пользователя? Действие необратимо.');
    if (!ok) return;
    await api.delete(`/admin/users/${id}`);
    load();
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="border rounded p-3 bg-white flex items-center justify-between">
            <div>
              <div className="font-semibold">{u.nickname} {u.is_admin && <span className="text-xs text-purple-700 bg-purple-100 rounded px-2 py-0.5 ml-2">admin</span>}</div>
              <div className="text-sm text-gray-600">{u.email}</div>
              <div className="text-sm text-gray-600">{u.wallet_address}</div>
              <div className="font-medium">{Number(u.balance).toFixed(2)} SOL</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>showTx(u.id)} className="px-3 py-1.5 bg-gray-100 rounded">Транзакции</button>
              {!u.is_admin && <button onClick={()=>removeUser(u.id)} className="px-3 py-1.5 bg-red-600 text-white rounded">Удалить</button>}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white border rounded p-3">
        <div className="font-semibold mb-2">Транзакции пользователя</div>
        <div className="space-y-2 max-h-[70vh] overflow-auto">
          {activeTx.map(t => (
            <div key={t.id} className="text-sm border rounded p-2">
              <div>Сумма: {t.amount} SOL</div>
              <div className="font-mono break-all">{t.tx_hash}</div>
              <div className="text-gray-500">{new Date(t.created_at).toLocaleString()}</div>
            </div>
          ))}
          {!activeTx.length && <div className="text-gray-500 text-sm">Выберите пользователя</div>}
        </div>
      </div>
    </div>
  );
}


