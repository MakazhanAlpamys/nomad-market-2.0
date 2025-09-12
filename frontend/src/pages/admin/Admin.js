import { Link, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Listings from './Listings';
import Users from './Users';

export default function Admin() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  if (!user.is_admin) return <Navigate to="/" replace />;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-bold">Админ-панель</div>
        <div className="flex gap-2">
          <Link className="px-3 py-1.5 bg-gray-100 rounded" to="/admin/listings">Объявления</Link>
          <Link className="px-3 py-1.5 bg-gray-100 rounded" to="/admin/users">Пользователи</Link>
        </div>
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/listings" replace />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/users" element={<Users />} />
      </Routes>
    </div>
  );
}


