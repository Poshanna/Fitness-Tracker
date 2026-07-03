import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, Check, Trash } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/workouts': return 'Workouts';
      case '/nutrition': return 'Nutrition & Water';
      case '/goals': return 'Goals Tracker';
      case '/analytics': return 'Progress Analytics';
      case '/ai-hub': return 'AI Fitness Coach';
      case '/calendar': return 'Workout Calendar';
      case '/profile': return 'Profile Settings';
      case '/admin': return 'Admin Control Center';
      default: return 'AegisFit';
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 60s
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b 
      bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-slate-100 dark:border-zinc-900 transition-colors duration-200">
      
      {/* Mobile Toggle & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-900 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-50 leading-none">
            {getPageTitle()}
          </h2>
          <p className="text-[11px] text-slate-400 hidden sm:block mt-1">
            Welcome back, {user?.name || 'User'}!
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 text-slate-500 rounded-xl hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-all duration-200"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" /> : <Moon className="w-5 h-5 text-indigo-500" />}
        </button>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-xl transition-all duration-200 
              ${showNotifications ? 'bg-slate-100 dark:bg-zinc-900 text-indigo-600' : 'text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-900'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto rounded-2xl border shadow-xl z-50 flex flex-col
                bg-white border-slate-100 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Reminders & Alerts</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-zinc-800/50">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <Bell className="w-8 h-8 text-slate-300 dark:text-zinc-700 mb-2" />
                      <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">All caught up! No reminders.</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-4 transition-colors ${n.read ? 'opacity-65' : 'bg-slate-50/50 dark:bg-zinc-900/30'}`}>
                        <div className="flex justify-between items-start gap-2">
                          <h5 className={`text-xs font-bold ${n.read ? 'text-slate-600 dark:text-zinc-400' : 'text-slate-800 dark:text-zinc-100'}`}>
                            {n.title}
                          </h5>
                          {!n.read && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 p-0.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{n.message}</p>
                        <span className="text-[9px] text-slate-400 block mt-2">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-100 dark:border-zinc-900">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
            {user?.profilePic ? (
              <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : 'U'
            )}
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 hidden md:block max-w-[80px] truncate">
            {user?.name || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
