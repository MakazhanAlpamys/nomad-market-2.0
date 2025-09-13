import { useState } from 'react';
import api from '../api';
import SolIcon from '../img/solana.png';

export default function CreateListing() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
    fd.append('price', price);
    if (image) fd.append('image', image);
    try {
      await api.post('/listings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('Listing created successfully!');
      setTitle(''); setDescription(''); setPrice(''); setImage(null);
    } catch (e) {
      setMsg('Error creating listing');
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold sol-text-gradient mb-2">Create Listing</h1>
        <p className="text-gray-400">List your item on the Solana marketplace</p>
      </div>
      
      <div className="glass-effect rounded-2xl p-8 border border-white/20 shadow-sol-card">
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input 
              className="w-full p-3 glass-effect rounded-xl border border-white/20 bg-transparent text-white placeholder-gray-400 focus:border-sol-purple focus:ring-1 focus:ring-sol-purple outline-none transition-all duration-200" 
              placeholder="Enter listing title" 
              value={title} 
              onChange={e=>setTitle(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea 
              className="w-full p-3 glass-effect rounded-xl border border-white/20 bg-transparent text-white placeholder-gray-400 focus:border-sol-purple focus:ring-1 focus:ring-sol-purple outline-none transition-all duration-200 resize-none" 
              placeholder="Describe your item..." 
              rows={4}
              value={description} 
              onChange={e=>setDescription(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Price (SOL)</label>
            <div className="relative">
              <input 
                className="w-full p-3 pl-12 glass-effect rounded-xl border border-white/20 bg-transparent text-white placeholder-gray-400 focus:border-sol-purple focus:ring-1 focus:ring-sol-purple outline-none transition-all duration-200" 
                placeholder="0.00" 
                type="number" 
                step="0.01" 
                min="0" 
                value={price} 
                onChange={e=>setPrice(e.target.value)} 
                required 
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <img src={SolIcon} alt="SOL" className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Image</label>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={e=>setImage(e.target.files?.[0]||null)} 
                className="w-full p-3 glass-effect rounded-xl border border-white/20 bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sol-gradient file:text-white file:font-medium hover:file:shadow-sol-glow transition-all duration-200"
              />
            </div>
          </div>
          
          {msg && (
            <div className={`p-3 rounded-lg border text-sm ${
              msg.includes('Error') || msg.includes('Ошибка')
                ? 'text-red-400 bg-red-500/10 border-red-500/20'
                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            }`}>
              {msg}
            </div>
          )}
          
          <button 
            type="submit"
            className="w-full py-3 bg-sol-gradient hover:shadow-sol-glow rounded-xl font-medium transition-all duration-200 text-white"
          >
            Create Listing
          </button>
        </form>
      </div>
    </div>
  );
}