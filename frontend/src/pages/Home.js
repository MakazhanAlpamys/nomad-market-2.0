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
    <div className="space-y-4">
      <div className="bg-white p-3 rounded border shadow-glow">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center border rounded px-2 flex-1 min-w-[220px]">
            <span className="text-gray-500 mr-1">🔍</span>
            <input className="p-2 flex-1 outline-none" placeholder="Поиск по названию/описанию" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') load(); }} />
          </div>
          <div className="flex items-center border rounded px-2">
            <span className="text-gray-500 mr-1">⏷</span>
            <input className="p-2 w-24 outline-none" placeholder="Мин" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
          </div>
          <div className="flex items-center border rounded px-2">
            <span className="text-gray-500 mr-1">⏷</span>
            <input className="p-2 w-24 outline-none" placeholder="Макс" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
          </div>
          <button onClick={load} className="px-3 py-2 bg-indigo-600 text-white rounded">Искать</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {items.map(it => (
          <ListingCard key={it.id} item={it} onAction={load} />
        ))}
      </div>
    </div>
  );
}


