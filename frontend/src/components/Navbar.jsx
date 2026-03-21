import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: '🏠 Dashboard' },
    { to: '/match', label: '🎯 Skill Match' },
    { to: '/compare', label: '⚖️ Compare' },
    { to: '/tracker', label: '📊 My Tracker' },
    { to: '/roadmap', label: '🤖 AI Roadmap' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold text-indigo-600">
        🎯 InternInsight
      </Link>

      {/* Nav Links */}
      <div className="flex gap-1">
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
              pathname === l.to
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:text-indigo-500 hover:bg-gray-50'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{user?.name}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="text-sm bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-100"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}