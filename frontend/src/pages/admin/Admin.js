import { Link, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Listings from './Listings';
import Users from './Users';

export default function Admin() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  if (!user.is_admin) return <Navigate to="/" replace />;
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold sol-text-gradient mb-2">Admin Panel</h1>
        <p className="text-gray-400">Manage marketplace listings and users</p>
      </div>
      
      <div className="flex justify-center">
        <div className="flex gap-2 p-1 glass-effect rounded-xl">
          <Link 
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 text-white hover:bg-white/20" 
            to="/admin/listings"
          >
            Listings
          </Link>
          <Link 
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 text-white hover:bg-white/20" 
            to="/admin/users"
          >
            Users
          </Link>
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


