import React, { useState } from 'react';
import api from '../api';

export default function DeleteUserModal({ user, onClose, onDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  
  async function handleDelete() {
    if (!user || !user.id) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      await api.delete(`/admin/users/${user.id}`);
      onDeleted && onDeleted(user.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось удалить пользователя');
    } finally {
      setIsDeleting(false);
    }
  }
  
  if (!user) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl p-6 border border-white/20 shadow-sol-card w-full max-w-md animate-scaleIn">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-red-500/30 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mt-4">Удалить пользователя</h2>
          <p className="text-gray-300 mt-2">
            Вы уверены, что хотите удалить пользователя <span className="font-medium text-white">{user.nickname}</span>?
          </p>
        </div>
        
        <div className="bg-black/20 border border-white/10 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sol-gradient rounded-xl flex items-center justify-center text-white font-bold">
              {user.nickname?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-white">{user.nickname}</div>
              <div className="text-sm text-gray-400">{user.email}</div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-5 text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 glass-effect hover:bg-white/20 rounded-lg transition-all duration-200 text-white"
          >
            Отмена
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-medium"
          >
            {isDeleting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                Удаление...
              </span>
            ) : (
              'Удалить'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
