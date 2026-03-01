import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FlaskConical,
  TrendingUp,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  BarChart3,
  Beaker,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navConfig: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/student' },
    { label: 'Experiments', icon: <FlaskConical size={20} />, path: '/student/experiments' },
    { label: 'My Progress', icon: <TrendingUp size={20} />, path: '/student/progress' },
  ],
  educator: [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/educator' },
    { label: 'Class Analytics', icon: <BarChart3 size={20} />, path: '/educator/class/all' },
    { label: 'Experiments', icon: <Beaker size={20} />, path: '/admin/experiments' },
  ],
  admin: [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { label: 'User Management', icon: <Users size={20} />, path: '/admin/users' },
    { label: 'Experiments', icon: <BookOpen size={20} />, path: '/admin/experiments' },
    { label: 'Analytics', icon: <BarChart3 size={20} />, path: '/educator/class/all' },
  ],
};

const roleColors: Record<UserRole, string> = {
  student: 'from-cyan-500 to-blue-600',
  educator: 'from-violet-500 to-purple-600',
  admin: 'from-orange-500 to-red-600',
};

const roleBadgeColors: Record<UserRole, string> = {
  student: 'bg-cyan-500/20 text-cyan-400',
  educator: 'bg-violet-500/20 text-violet-400',
  admin: 'bg-orange-500/20 text-orange-400',
};

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = navConfig[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-800 h-16 overflow-hidden">
        <div
          className={`w-8 h-8 min-w-[2rem] bg-gradient-to-br ${roleColors[user.role]} rounded-lg flex items-center justify-center`}
        >
          <FlaskConical size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">
              AR Physics Lab
            </p>
            <p className="text-slate-500 text-xs whitespace-nowrap">Smart Learning Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? `bg-gradient-to-r ${roleColors[user.role]} text-white shadow-lg`
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="min-w-[20px]">{item.icon}</span>
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
            <div
              className={`w-8 h-8 min-w-[2rem] bg-gradient-to-br ${roleColors[user.role]} rounded-full flex items-center justify-center`}
            >
              <span className="text-white text-xs font-bold uppercase">
                {user.fullName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.fullName}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColors[user.role]}`}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all duration-200"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
