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
    <div className="space-y-6">
      <div className="glass-effect rounded-2xl p-6 border border-white/20">
        <label className="block text-sm font-medium text-gray-300 mb-2">Deletion Reason</label>
        <input 
          className="w-full p-3 glass-effect rounded-xl border border-white/20 bg-transparent text-white placeholder-gray-400 focus:border-sol-purple focus:ring-1 focus:ring-sol-purple outline-none transition-all duration-200" 
          value={reason} 
          onChange={e=>setReason(e.target.value)} 
          placeholder="Enter reason for deletion..." 
        />
      </div>
      
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map(it => (
          <div key={it.id} className="glass-effect rounded-2xl p-6 border border-white/20 shadow-sol-card">
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
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-6 h-6 bg-sol-gradient rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {it.nickname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-white text-sm">{it.nickname}</div>
                  <div className="text-gray-500 text-xs">{it.email}</div>
                </div>
              </div>
              
              <button 
                onClick={()=>remove(it.id)} 
                className="w-full px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all duration-200 font-medium"
              >
                Delete Listing
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-2xl font-semibold text-gray-300 mb-2">No listings found</h3>
          <p className="text-gray-400">All listings have been processed or none exist yet.</p>
        </div>
      )}
    </div>
  );
}

function openConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="glass-effect rounded-2xl shadow-2xl w-full max-w-md p-6 border border-white/20">
        <div class="text-xl font-bold text-white mb-3">Confirm Action</div>
        <div class="text-gray-300 mb-6">${message}</div>
        <div class="flex justify-end gap-3">
          <button id="cancelBtn" class="px-4 py-2 glass-effect rounded-lg text-white hover:bg-white/20 transition-all duration-200">Cancel</button>
          <button id="okBtn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200">Delete</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#cancelBtn').onclick = () => { document.body.removeChild(modal); resolve(false); };
    modal.querySelector('#okBtn').onclick = () => { document.body.removeChild(modal); resolve(true); };
  });
}

function showBanner(text, type) {
  const el = document.createElement('div');
  el.className = `fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl text-white z-50 font-medium backdrop-blur-sm ${type==='success'?'bg-emerald-500/90':'bg-red-500/90'}`;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => { el.remove(); }, 2500);
}


