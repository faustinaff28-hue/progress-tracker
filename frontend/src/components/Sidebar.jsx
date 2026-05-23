import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, BarChart2, Trophy, Shield, LogOut } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  ];

  if (user?.role === 'admin') {
    links.push({ to: '/admin', icon: Shield, label: 'Admin' });
  }

  return (
    <div className="w-64 glass-panel border-r-0 border-l-0 border-t-0 border-b-0 rounded-none h-screen fixed left-0 top-0 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPurple">
          Progress Tracker
        </h2>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-neonBlue/10 text-neonBlue border border-neonBlue/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <link.icon size={20} />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4 px-4">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 truncate">{user?.rank}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
