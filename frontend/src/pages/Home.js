import { useEffect, useState } from 'react';
import api from '../api';
import ListingCard from '../components/ListingCard';
import SolIcon from '../img/solana.png';

export default function Home() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  function load() {
    api.get('/listings', { params: { q, minPrice, maxPrice } }).then(r => setItems(r.data));
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="sol-text-gradient">Nomad Market</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          The premier decentralized marketplace on Solana. Trade, discover, and own unique digital assets with lightning-fast transactions.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-sol-green rounded-full animate-pulse"></div>
            <span>Solana Network</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-sol-blue rounded-full animate-pulse"></div>
            <span>Fast & Secure</span>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="glass-effect p-6 rounded-2xl shadow-sol-card border border-white/10">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center glass-effect rounded-xl px-4 flex-1 min-w-[280px] border border-white/10">
            <span className="text-gray-400 mr-3">🔍</span>
            <input 
              className="p-3 flex-1 outline-none bg-transparent text-white placeholder-gray-400" 
              placeholder="Search listings by title or description..." 
              value={q} 
              onChange={e=>setQ(e.target.value)} 
              onKeyDown={(e)=>{ if(e.key==='Enter') load(); }} 
            />
          </div>
          <div className="flex items-center glass-effect rounded-xl px-4 border border-white/10">
            <span className="text-gray-400 mr-2">⬇</span>
            <input 
              className="p-3 w-28 outline-none bg-transparent text-white placeholder-gray-400" 
              placeholder="Min SOL" 
              value={minPrice} 
              onChange={e=>setMinPrice(e.target.value)} 
            />
          </div>
          <div className="flex items-center glass-effect rounded-xl px-4 border border-white/10">
            <span className="text-gray-400 mr-2">⬆</span>
            <input 
              className="p-3 w-28 outline-none bg-transparent text-white placeholder-gray-400" 
              placeholder="Max SOL" 
              value={maxPrice} 
              onChange={e=>setMaxPrice(e.target.value)} 
            />
          </div>
          <button 
            onClick={load} 
            className="px-6 py-3 bg-sol-gradient hover:shadow-sol-glow rounded-xl font-medium transition-all duration-200"
          >
            Search
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map(it => (
          <ListingCard key={it.id} item={it} onAction={load} />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-2xl font-semibold text-gray-300 mb-2">No listings found</h3>
          <p className="text-gray-400">Be the first to create a listing on our marketplace!</p>
        </div>
      )}
    </div>
  );
}


