import { useEffect, useState } from 'react';
import api from '../api';

export default function MyListings() {
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
  const [items, setItems] = useState([]);

  function load() {
    api.get('/listings', { params: { owner: userId } }).then(r => setItems(r.data));
  }

  useEffect(() => { load(); }, []);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', price: '', image: null });
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState('');

  function startEdit(it) {
    setEditingId(it.id);
    setForm({ title: it.title, description: it.description || '', price: it.price, image: null });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ title: '', description: '', price: '', image: null });
  }

  async function saveEdit(id) {
    try {
      if (form.image) {
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('price', form.price);
        fd.append('image', form.image);
        await api.put(`/listings/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.put(`/listings/${id}`, { title: form.title, description: form.description, price: form.price });
      }
      setMessage('Объявление сохранено');
      setTimeout(() => setMessage(''), 2000);
      cancelEdit();
      load();
    } catch {
      setMessage('Ошибка сохранения');
      setTimeout(() => setMessage(''), 2500);
    }
  }

  async function confirmDelete(id) {
    try {
      await api.delete(`/listings/${id}`);
      setDeleteId(null);
      setMessage('Объявление удалено');
      setTimeout(() => setMessage(''), 2000);
      load();
    } catch {
      setMessage('Ошибка удаления');
      setTimeout(() => setMessage(''), 2500);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold mb-2">Мои объявления</div>
      {message && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2">{message}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {items.map(it => (
          <div key={it.id} className="border rounded-lg p-3 bg-white shadow-glow">
            {editingId === it.id ? (
              <div className="space-y-2">
                <input className="border rounded p-2 w-full" value={form.title} onChange={e=>setForm(s=>({ ...s, title: e.target.value }))} />
                <textarea className="border rounded p-2 w-full" rows={3} value={form.description} onChange={e=>setForm(s=>({ ...s, description: e.target.value }))} />
                <input className="border rounded p-2 w-full" value={form.price} onChange={e=>setForm(s=>({ ...s, price: e.target.value }))} />
                <input type="file" accept="image/*" onChange={e=>setForm(s=>({ ...s, image: e.target.files?.[0] || null }))} />
                <div className="flex gap-2 justify-end">
                  <button onClick={()=>saveEdit(it.id)} className="px-3 py-1.5 bg-indigo-600 text-white rounded">Сохранить</button>
                  <button onClick={cancelEdit} className="px-3 py-1.5 bg-gray-100 rounded">Отмена</button>
                  <button onClick={()=>setDeleteId(it.id)} className="px-3 py-1.5 bg-red-600 text-white rounded">Удалить</button>
                </div>
              </div>
            ) : (
              <>
                <div className="font-semibold mb-1">{it.title}</div>
                <div className="text-sm text-gray-600 line-clamp-2">{it.description}</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-lg font-bold">{it.price} SOL</div>
                  <div className="flex gap-2">
                    <button onClick={()=>startEdit(it)} className="px-3 py-1.5 bg-amber-500 text-white rounded">Редактировать</button>
                    <button onClick={()=>setDeleteId(it.id)} className="px-3 py-1.5 bg-red-600 text-white rounded">Удалить</button>
                  </div>
                </div>
              </>
            )}
            {deleteId === it.id && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-4">
                  <div className="text-lg font-semibold mb-2">Удалить объявление?</div>
                  <div className="text-sm text-gray-700 mb-4">Действие необратимо.</div>
                  <div className="flex justify-end gap-2">
                    <button className="px-3 py-1.5 bg-gray-100 rounded" onClick={()=>setDeleteId(null)}>Отмена</button>
                    <button className="px-3 py-1.5 bg-red-600 text-white rounded" onClick={()=>confirmDelete(it.id)}>Удалить</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


