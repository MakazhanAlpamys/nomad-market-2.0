import api from '../api';
import SolIcon from '../img/solana.png';

export default function ListingCard({ item, onAction }) {
  async function handleBuy() {
    const token = localStorage.getItem('token');
    if (!token) {
      showBanner('Чтобы купить, войдите или зарегистрируйтесь', 'error');
      return;
    }
    const confirmed = await openConfirm(`Купить «${item.title}» за ${item.price} SOL?`);
    if (!confirmed) return;
    await api.post('/purchase', { listingId: item.id });
    showBanner('Покупка успешно подтверждена', 'success');
    onAction && onAction();
  }
  
  return (
    <div className="glass-effect rounded-2xl p-6 border border-white/10 hover:shadow-sol-hover transition-all duration-300 group card-hover">
      <div className="relative mb-4 overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-sol-purple/20 to-sol-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        <img 
          src={`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/listings/${item.id}/image`} 
          alt={item.title} 
          className="w-full h-48 object-cover rounded-xl bg-gray-800 group-hover:scale-105 transition-transform duration-300" 
          onError={(e)=>{
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMUExQTJFIi8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTMwIDEwMEgxMTBWMTMwSDkwVjEwMEg3MEwxMDAgNzBaIiBmaWxsPSIjOTk0NUZGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2NjY2IiBmb250LXNpemU9IjEyIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
          }} 
        />
        <div className="absolute top-3 right-3 z-20">
          <div className="price-tag text-sm font-bold text-white flex items-center gap-1">
            <img src={SolIcon} alt="SOL" className="w-4 h-4" />
            {item.price} SOL
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-xl text-white mb-2 line-clamp-1">{item.title}</h3>
          <p className="text-sm text-gray-300 line-clamp-2">{item.description}</p>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-gray-400 py-1 border-t border-b border-white/5">
          <div className="w-8 h-8 bg-sol-gradient rounded-full flex items-center justify-center text-white font-bold">
            {item.nickname.charAt(0).toUpperCase()}
          </div>
          <span className="opacity-80">by <span className="font-medium text-white opacity-100">{item.nickname}</span></span>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="text-2xl font-bold sol-text-gradient flex items-center gap-2">
            <img src={SolIcon} alt="SOL" className="w-6 h-6" />
            {item.price}
            <span className="text-sm text-gray-400 font-normal">SOL</span>
          </div>
          <button 
            onClick={handleBuy} 
            className="px-6 py-2 bg-sol-gradient hover:shadow-sol-glow rounded-xl font-medium transition-all duration-200 text-white"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

function openConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="glass-effect rounded-2xl shadow-2xl w-full max-w-md p-6 border border-white/20">
        <div class="text-xl font-bold text-white mb-3">Confirm Purchase</div>
        <div class="text-gray-300 mb-6">${message}</div>
        <div class="flex justify-end gap-3">
          <button id="cancelBtn" class="px-4 py-2 glass-effect rounded-lg text-white hover:bg-white/20 transition-all duration-200">Cancel</button>
          <button id="okBtn" class="px-4 py-2 bg-sol-gradient rounded-lg font-medium hover:shadow-sol-glow transition-all duration-200">Confirm</button>
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


