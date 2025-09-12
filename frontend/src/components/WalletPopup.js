import { useEffect, useState } from 'react';
import api from '../api';
import SolIcon from '../img/solana.png';

export default function WalletPopup({ open, onClose }) {
  const [data, setData] = useState(null);
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;

  useEffect(() => {
    if (!open || !userId) return;
    api.get(`/wallet/${userId}`).then(r => setData(r.data.user)).catch(() => setData(null));
  }, [open, userId]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Phantom Wallet (Mock)</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        {data ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Адрес</div>
            <div className="font-mono break-all text-sm bg-gray-50 p-2 rounded">{data.wallet_address}</div>
            <div className="text-sm text-gray-600 mt-2">Баланс</div>
            <div className="text-2xl font-bold flex items-center gap-2">
              <img src={SolIcon} alt="SOL" className="w-5 h-5" />
              {Number(data.balance).toFixed(2)} SOL
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Загрузка...</div>
        )}
      </div>
    </div>
  );
}


