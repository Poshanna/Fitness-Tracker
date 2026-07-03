import React, { useEffect, useState } from 'react';
import { 
  Users, 
  ShieldAlert, 
  Trash2, 
  MessageSquare, 
  Layers, 
  Database,
  User,
  Scale
} from 'lucide-react';
import api from '../services/api.js';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [chatLogs, setChatLogs] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalWorkouts: 0, totalMeals: 0, totalWaterLogs: 0, totalStepsLogs: 0 });
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('users'); // users, chatLogs

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, chatRes, statsRes] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/admin/chatbot-logs'),
        api.get('/api/admin/analytics')
      ]);
      setUsers(usersRes.data);
      setChatLogs(chatRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? All their logs will be deleted.')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert(err.response?.data?.message || 'Error occurred while deleting user.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 bg-slate-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-55 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
          <span>Admin Control Center</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Moderate chatbot session logs, manage active user folders, and audit metrics.</p>
      </div>

      {/* Aggregate System Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Accounts', value: stats.totalUsers, color: 'text-indigo-650' },
          { label: 'Logged Workouts', value: stats.totalWorkouts, color: 'text-emerald-600' },
          { label: 'Logged Meals', value: stats.totalMeals, color: 'text-orange-500' },
          { label: 'Hydration Logs', value: stats.totalWaterLogs, color: 'text-blue-500' }
        ].map(item => (
          <div key={item.label} className="p-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{item.label}</span>
            <span className={`text-2xl font-black block mt-1.5 ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Content Selector */}
      <div className="flex border-b border-slate-100 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 border-b-2 transition
            ${activeSubTab === 'users' ? 'border-indigo-600 text-indigo-650' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <Users className="w-4 h-4" />
          <span>Users Directory ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('chatLogs')}
          className={`flex items-center gap-2 px-5 py-2.5 border-b-2 transition
            ${activeSubTab === 'chatLogs' ? 'border-indigo-600 text-indigo-650' : 'border-transparent text-slate-400 hover:text-slate-650'}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chatbot Logs ({chatLogs.length})</span>
        </button>
      </div>

      {/* SUB-TAB: USER DIRECTORY */}
      {activeSubTab === 'users' && (
        <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3">Name</th>
                <th className="py-3">Email Address</th>
                <th className="py-3">Primary Goal</th>
                <th className="py-3">Permission Role</th>
                <th className="py-3">Created Date</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-zinc-850 text-xs text-slate-700 dark:text-zinc-300">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/10">
                  <td className="py-3.5 font-bold text-slate-805 dark:text-zinc-200">{u.name}</td>
                  <td className="py-3.5 text-slate-500">{u.email}</td>
                  <td className="py-3.5 font-medium capitalize">{u.goal?.replace('_', ' ').toLowerCase() || 'None'}</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase
                      ${u.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 text-slate-400 hover:text-red-650 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB: CHATBOT AUDIT LOGS */}
      {activeSubTab === 'chatLogs' && (
        <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
          <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-50 dark:divide-zinc-800/60 pr-2">
            {chatLogs.map(log => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row justify-between items-start gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{log.user?.name || 'Unknown User'}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({log.user?.email || 'N/A'})</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-100/50 mt-1">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[10px] uppercase block mb-1">
                      {log.role === 'USER' ? 'Asked:' : 'Aegis Replied:'}
                    </span>
                    {log.message}
                  </p>
                </div>
                <span className="text-[9px] text-slate-400 shrink-0 self-end sm:self-start">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
