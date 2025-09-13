import { useEffect, useState } from 'react';
import api from '../api';
import SolIcon from '../img/solana.png';

export default function WalletPopup({ open, onClose }) {
  const [data, setData] = useState(null);
  const [solanaPrice, setSolanaPrice] = useState({ usd: 0, kzt: 0 });
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
  const [loading, setLoading] = useState(true);

  // Фиксированный курс доллара к тенге
  const USD_TO_KZT_RATE = 540.1;

  useEffect(() => {
    if (!open || !userId) return;
    
    // Загрузка данных кошелька
    setLoading(true);
    api.get(`/wallet/${userId}`)
      .then(r => setData(r.data.user))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    
    // Загрузка текущего курса Solana только в USD
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
      .then(res => res.json())
      .then(data => {
        if (data?.solana) {
          const usdPrice = data.solana.usd;
          // Рассчитываем курс в тенге используя фиксированный курс доллара
          const kztPrice = usdPrice * USD_TO_KZT_RATE;
          
          setSolanaPrice({
            usd: usdPrice,
            kzt: kztPrice.toFixed(2)
          });
        }
      })
      .catch(err => console.error('Error fetching Solana price:', err));
  }, [open, userId]);

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass-effect rounded-2xl shadow-sol-card w-full max-w-md p-8 border border-white/20 animate-scaleIn">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sol-gradient rounded-xl flex items-center justify-center shadow-sol-glow">
              <span className="text-white text-xl">👻</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold sol-text-gradient">Phantom Wallet</h3>
              <p className="text-xs text-gray-400">Powered by Solana</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full glass-effect hover:bg-white/20 text-gray-400 hover:text-white transition-all duration-200"
          >
            ✕
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="loading-spinner mx-auto mb-4"></div>
            <div className="text-gray-300">Подключение к кошельку...</div>
          </div>
        ) : data ? (
          <div className="space-y-8">
            <div className="glass-effect rounded-xl p-5 border border-white/10">
              <div className="text-sm text-gray-400 mb-2">Wallet Address</div>
              <div className="relative">
                <div className="font-mono break-all text-sm text-white bg-black/30 p-3 rounded-lg border border-white/10">
                  {data.wallet_address}
                </div>
                <button 
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(data.wallet_address);
                    showTooltip('Скопировано!');
                  }}
                >
                  📋
                </button>
              </div>
            </div>
            
            <div className="text-center py-4">
              <div className="text-sm text-gray-400 mb-3">Баланс кошелька</div>
              <div className="text-5xl font-bold flex items-center justify-center gap-3 sol-text-gradient">
                <img src={SolIcon} alt="SOL" className="w-10 h-10" />
                {Number(data.balance).toFixed(2)}
              </div>
              <div className="text-lg font-medium text-white mt-1">
                SOL
              </div>
              {solanaPrice.usd > 0 && (
                <div className="flex justify-center gap-3 mt-3">
                  <div className="badge badge-secondary">
                    ≈ ${(Number(data.balance) * solanaPrice.usd).toFixed(2)} USD
                  </div>
                  <div className="badge badge-secondary">
                    ≈ {(Number(data.balance) * solanaPrice.kzt).toFixed(0)} ₸
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <button className="flex-1 py-3 px-4 bg-sol-gradient hover:shadow-sol-glow rounded-xl font-medium transition-all duration-200 flex items-center justify-center">
                <span className="mr-2">↑</span> Отправить
              </button>
              <button className="flex-1 py-3 px-4 glass-effect hover:bg-white/20 rounded-xl font-medium transition-all duration-200 text-white flex items-center justify-center">
                <span className="mr-2">↓</span> Получить
              </button>
            </div>
            
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Последнее обновление:</span>
                <span className="text-gray-300">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔄</div>
            <div className="text-xl font-semibold text-gray-300 mb-2">Не удалось загрузить кошелек</div>
            <p className="text-gray-400 mb-6">Пожалуйста, попробуйте снова позже</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-sol-gradient hover:shadow-sol-glow rounded-xl font-medium transition-all duration-200"
            >
              Обновить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function showTooltip(message) {
  const tooltip = document.createElement('div');
  tooltip.className = 'fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white text-sm rounded-lg z-[100] animate-fadeIn';
  tooltip.textContent = message;
  document.body.appendChild(tooltip);
  
  setTimeout(() => {
    tooltip.classList.add('animate-fadeOut');
    setTimeout(() => tooltip.remove(), 300);
  }, 2000);
}


