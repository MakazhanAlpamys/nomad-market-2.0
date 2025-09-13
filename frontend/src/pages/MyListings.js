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
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold sol-text-gradient mb-2">My Listings</h1>
        <p className="text-gray-400">Manage your marketplace listings</p>
      </div>
      
      {message && (
        <div className={`p-3 rounded-lg border text-sm ${
          message.includes('Error') || message.includes('Ошибка')
            ? 'text-red-400 bg-red-500/10 border-red-500/20'
            : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        }`}>
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map(it => (
          <div key={it.id} className="glass-effect rounded-2xl p-6 border border-white/20 shadow-sol-card">
            {editingId === it.id ? (
              <div className="space-y-4">
                <input 
                  className="w-full p-3 glass-effect rounded-xl border border-white/20 bg-transparent text-white placeholder-gray-400 focus:border-sol-purple outline-none" 
                  value={form.title} 
                  onChange={e=>setForm(s=>({ ...s, title: e.target.value }))} 
                />
                <textarea 
                  className="w-full p-3 glass-effect rounded-xl border border-white/20 bg-transparent text-white placeholder-gray-400 focus:border-sol-purple outline-none resize-none" 
                  rows={3} 
                  value={form.description} 
                  onChange={e=>setForm(s=>({ ...s, description: e.target.value }))} 
                />
                <input 
                  className="w-full p-3 glass-effect rounded-xl border border-white/20 bg-transparent text-white placeholder-gray-400 focus:border-sol-purple outline-none" 
                  value={form.price} 
                  onChange={e=>setForm(s=>({ ...s, price: e.target.value }))} 
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e=>setForm(s=>({ ...s, image: e.target.files?.[0] || null }))} 
                  className="w-full p-3 glass-effect rounded-xl border border-white/20 bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sol-gradient file:text-white"
                />
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={()=>saveEdit(it.id)} 
                    className="px-4 py-2 bg-sol-gradient rounded-lg font-medium hover:shadow-sol-glow transition-all duration-200"
                  >
                    Save
                  </button>
                  <button 
                    onClick={cancelEdit} 
                    className="px-4 py-2 glass-effect rounded-lg hover:bg-white/20 transition-all duration-200 text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={()=>setDeleteId(it.id)} 
                    className="px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-all duration-200 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative mb-4">
                  <img 
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/listings/${it.id}/image`} 
                    alt={it.title} 
                    className="w-full h-48 object-cover rounded-xl bg-gray-800" 
                    onError={(e)=>{
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMUExQTJFIi8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTMwIDEwMEgxMTBWMTMwSDkwVjEwMEg3MEwxMDAgNzBaIiBmaWxsPSIjOTk0NUZGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2NjY2IiBmb250LXNpemU9IjEyIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
                    }} 
                  />
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                    <div className="text-sm font-bold text-white">{it.price} SOL</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1">{it.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{it.description}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={()=>startEdit(it)} 
                      className="flex-1 px-3 py-2 bg-amber-500/80 hover:bg-amber-500 text-white rounded-lg transition-all duration-200 text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={()=>setDeleteId(it.id)} 
                      className="flex-1 px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all duration-200 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {deleteId === it.id && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="glass-effect rounded-2xl shadow-2xl w-full max-w-md p-6 border border-white/20">
                  <div className="text-xl font-bold text-white mb-3">Delete Listing?</div>
                  <div className="text-gray-300 mb-6">This action cannot be undone.</div>
                  <div className="flex justify-end gap-3">
                    <button 
                      className="px-4 py-2 glass-effect rounded-lg text-white hover:bg-white/20 transition-all duration-200" 
                      onClick={()=>setDeleteId(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200" 
                      onClick={()=>confirmDelete(it.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-2xl font-semibold text-gray-300 mb-2">No listings yet</h3>
          <p className="text-gray-400 mb-6">Create your first listing to get started!</p>
          <a 
            href="/create" 
            className="inline-block px-6 py-3 bg-sol-gradient rounded-xl font-medium hover:shadow-sol-glow transition-all duration-200"
          >
            Create Listing
          </a>
        </div>
      )}
    </div>
  );
}


