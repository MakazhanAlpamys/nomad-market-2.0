import { useEffect, useState } from 'react';
import api from '../../api';

export default function Listings() {
  const [items, setItems] = useState([]);
  const [reason, setReason] = useState('Нарушение правил');

  function load() {
    api.get('/admin/listings').then(r => setItems(r.data));
  }
  useEffect(() => { load(); }, []);

  async function remove(id) {
    const ok = await openConfirm('Удалить объявление?');
    if (!ok) return;
    await api.delete(`/admin/listings/${id}`, { params: { reason } });
    showBanner('Объявление удалено', 'success');
    load();
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <input className="border rounded p-2 flex-1" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Причина удаления" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(it => (
          <div key={it.id} className="border rounded p-3 bg-white">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm text-gray-600">{it.description}</div>
            <div className="text-sm text-gray-500 mt-1">Автор: {it.nickname} ({it.email})</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="font-bold">{it.price} SOL</div>
              <button onClick={()=>remove(it.id)} className="px-3 py-1.5 bg-red-600 text-white rounded">Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function openConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm p-4">
        <div class="text-lg font-semibold mb-2">Подтверждение</div>
        <div class="text-sm text-gray-700 mb-4">${message}</div>
        <div class="flex justify-end gap-2">
          <button id="cancelBtn" class="px-3 py-1.5 bg-gray-100 rounded">Отмена</button>
          <button id="okBtn" class="px-3 py-1.5 bg-red-600 text-white rounded">Удалить</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#cancelBtn').onclick = () => { document.body.removeChild(modal); resolve(false); };
    modal.querySelector('#okBtn').onclick = () => { document.body.removeChild(modal); resolve(true); };
  });
}

function showBanner(text, type) {
  const el = document.createElement('div');
  el.className = `fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow text-white z-50 ${type==='success'?'bg-emerald-600':'bg-red-600'}`;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => { el.remove(); }, 2500);
}


