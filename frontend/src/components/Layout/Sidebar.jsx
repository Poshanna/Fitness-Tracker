import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Apple, 
  Target, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  ShieldAlert, 
  User, 
  LogOut,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Workouts', path: '/workouts', icon: Dumbbell },
    { name: 'Nutrition & Water', path: '/nutrition', icon: Apple },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'AI Fitness Hub', path: '/ai-hub', icon: Sparkles },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Profile Settings', path: '/profile', icon: User }
  ];

  if (user?.role === 'ADMIN') {
    links.push({ name: 'Admin Control', path: '/admin', icon: ShieldAlert });
  }

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 border-r transition-transform duration-300 lg:translate-x-0 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          bg-slate-900 text-slate-100 border-slate-800 dark:bg-zinc-950 dark:border-zinc-900`}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800 dark:border-zinc-900">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-lg shadow-indigo-500/20">
            <Flame className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              AegisFit
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">AI Coached</p>
          </div>
        </div>

        {/* User Mini Profile Card */}
        <div className="p-4 mx-4 my-6 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-md dark:bg-zinc-900/30 dark:border-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 border-indigo-500/30">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate text-white">{user?.name || 'Fitness Enthusiast'}</h4>
              <p className="text-[11px] text-slate-400 truncate capitalize">{user?.goal?.replace('_', ' ').toLowerCase() || 'No active goal'}</p>
            </div>
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => isOpen && toggleSidebar()}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-indigo-400 border-l-4 border-indigo-500 pl-3' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'}`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 
                  ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-100'}`} 
                />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800 dark:border-zinc-900">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
