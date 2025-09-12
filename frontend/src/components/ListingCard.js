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
    <div className="border rounded-lg p-3 bg-white flex gap-3">
      <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/listings/${item.id}/image`} alt="" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded bg-gray-100" onError={(e)=>{e.currentTarget.style.display='none'}} />
      <div className="flex-1">
        <div className="font-semibold">{item.title}</div>
        <div className="text-sm text-gray-600 line-clamp-2">{item.description}</div>
        <div className="text-sm text-gray-500 mt-1">Продавец: {item.nickname} ({item.email})</div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-lg font-bold flex items-center gap-1">
            <img src={SolIcon} alt="SOL" className="w-4 h-4" />
            {item.price} SOL
          </div>
          <button onClick={handleBuy} className="px-3 py-1.5 rounded bg-emerald-600 text-white">Купить</button>
        </div>
      </div>
    </div>
  );
}

function openConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm p-4">
        <div class="text-lg font-semibold mb-2">Подтверждение</div>
        <div class="text-sm text-gray-700 mb-4">${message}</div>
        <div class="flex justify-end gap-2">
          <button id="cancelBtn" class="px-3 py-1.5 bg-gray-100 rounded">Отмена</button>
          <button id="okBtn" class="px-3 py-1.5 bg-emerald-600 text-white rounded">Подтвердить</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#cancelBtn').onclick = () => { document.body.removeChild(modal); resolve(false); };
    modal.querySelector('#okBtn').onclick = () => { document.body.removeChild(modal); resolve(true); };
  });
}

function showBanner(text, type) {
  const el = document.createElement('div');
  el.className = `fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow text-white z-50 ${type==='success'?'bg-emerald-600':'bg-red-600'}`;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => { el.remove(); }, 2500);
}


