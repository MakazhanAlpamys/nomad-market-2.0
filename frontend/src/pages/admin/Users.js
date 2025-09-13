import { useEffect, useState } from 'react';
import api from '../../api';
import DeleteUserModal from '../../components/DeleteUserModal';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [activeTx, setActiveTx] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  function load() {
    api.get('/admin/users').then(r => setUsers(r.data));
  }
  useEffect(() => { load(); }, []);

  async function showTx(id) {
    const r = await api.get(`/admin/users/${id}/transactions`);
    setActiveTx(r.data);
  }

  function handleDeleteUser(id) {
    const user = users.find(u => u.id === id);
    if (user) {
      setSelectedUser(user);
    }
  }
  
  function handleUserDeleted(userId) {
    setUsers(users.filter(u => u.id !== userId));
    // Если были открыты транзакции этого пользователя, очищаем их
    if (selectedUser?.id === userId) {
      setActiveTx([]);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {selectedUser && (
        <DeleteUserModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onDeleted={handleUserDeleted} 
        />
      )}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">Users</h2>
        {users.map(u => (
          <div key={u.id} className="glass-effect rounded-2xl p-6 border border-white/20 shadow-sol-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sol-gradient rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {u.nickname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-lg">{u.nickname}</span>
                    {u.is_admin && (
                      <span className="text-xs text-purple-300 bg-purple-500/20 rounded-full px-2 py-1 border border-purple-500/30">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{u.email}</div>
                  <div className="text-xs text-gray-500 font-mono">{u.wallet_address}</div>
                  <div className="text-lg font-bold text-sol-green mt-1">
                    {Number(u.balance).toFixed(2)} SOL
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={()=>showTx(u.id)} 
                  className="px-4 py-2 glass-effect rounded-lg hover:bg-white/20 transition-all duration-200 text-white text-sm"
                >
                  View Transactions
                </button>
                {!u.is_admin && (
                  <button 
                    onClick={() => handleDeleteUser(u.id)} 
                    className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all duration-200 text-sm"
                  >
                    Delete User
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {users.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-semibold text-gray-300 mb-2">No users found</h3>
            <p className="text-gray-400">No registered users in the system yet.</p>
          </div>
        )}
      </div>
      
      <div className="glass-effect rounded-2xl p-6 border border-white/20 shadow-sol-card">
        <h2 className="text-xl font-bold text-white mb-4">User Transactions</h2>
        <div className="space-y-3 max-h-[70vh] overflow-auto">
          {activeTx.map(t => (
            <div key={t.id} className="glass-effect rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-bold">{t.amount} SOL</div>
                <div className="text-xs text-gray-400">{new Date(t.created_at).toLocaleString()}</div>
              </div>
              <div className="font-mono text-xs text-gray-500 break-all bg-black/30 p-2 rounded border border-white/10">
                {t.tx_hash}
              </div>
            </div>
          ))}
          {activeTx.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-gray-400 text-sm">Select a user to view their transactions</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}