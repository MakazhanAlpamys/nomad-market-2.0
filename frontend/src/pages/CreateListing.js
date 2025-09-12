import { useState } from 'react';
import api from '../api';

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
      setMsg('Создано!');
      setTitle(''); setDescription(''); setPrice(''); setImage(null);
    } catch (e) {
      setMsg('Ошибка');
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded border p-4">
      <form onSubmit={submit} className="space-y-3">
        <input className="border rounded p-2 w-full" placeholder="Название" value={title} onChange={e=>setTitle(e.target.value)} required />
        <textarea className="border rounded p-2 w-full" placeholder="Описание" value={description} onChange={e=>setDescription(e.target.value)} />
        <input className="border rounded p-2 w-full" placeholder="Цена (SOL)" value={price} onChange={e=>setPrice(e.target.value)} required />
        <input type="file" accept="image/*" onChange={e=>setImage(e.target.files?.[0]||null)} />
        <button className="bg-indigo-600 text-white px-3 py-2 rounded">Создать</button>
        {msg && <div className="text-sm">{msg}</div>}
      </form>
    </div>
  );
}


