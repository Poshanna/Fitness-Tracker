import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Dumbbell, 
  Utensils, 
  Droplet, 
  Footprints, 
  Scale, 
  Calendar,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import api from '../services/api.js';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [weightLogs, setWeightLogs] = useState([]);
  const [weightDuration, setWeightDuration] = useState('monthly');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/analytics');
      setAnalyticsData(response.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const fetchWeightLogs = async () => {
    try {
      const response = await api.get(`/api/progress?duration=${weightDuration}`);
      setWeightLogs(response.data);
    } catch (err) {
      console.error('Failed to fetch weight logs:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchAnalytics(), fetchWeightLogs()]);
      setLoading(false);
    };
    loadAll();
  }, [weightDuration]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 dark:bg-zinc-800 rounded-3xl animate-pulse" />
          <div className="h-96 bg-slate-200 dark:bg-zinc-800 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  const weeklyProgress = analyticsData?.weeklyProgress || [];
  const exerciseDistribution = analyticsData?.exerciseDistribution || [];
  const summary = analyticsData?.dailySummary || {};

  // Formatted weight logs for Recharts
  const formattedWeightData = weightLogs.map(log => ({
    date: new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    weight: log.weight,
    bodyFat: log.bodyFat || 0,
    muscleMass: log.muscleMass || 0
  }));

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-50 tracking-tight">Fitness Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Deep-dive reports, physiological indices, and logging distributions.</p>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Weight & Body Fat Trend */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-850 dark:text-zinc-550 flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-500" />
                <span>Weight & Mass Trend</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Monitor change in weight over time.</p>
            </div>
            
            {/* Range Selectors */}
            <div className="flex gap-1.5 p-1 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 text-[10px] font-bold">
              {['weekly', 'monthly', 'yearly'].map(dur => (
                <button
                  key={dur}
                  onClick={() => setWeightDuration(dur)}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wide transition-all
                    ${weightDuration === dur 
                      ? 'bg-white dark:bg-zinc-850 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                      : 'text-slate-505 dark:text-zinc-400 hover:text-slate-800'}`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72">
            {formattedWeightData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedWeightData}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={['dataMin - 3', 'dataMax + 3']} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" name="Weight (kg)" dataKey="weight" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
                  {formattedWeightData.some(d => d.bodyFat > 0) && (
                    <Line type="monotone" name="Body Fat %" dataKey="bodyFat" stroke="#10b981" strokeWidth={2} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400 border border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl">
                No weight logs recorded for this period.
              </div>
            )}
          </div>
        </div>

        {/* Calories Burned vs Consumed Area Chart */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-850 dark:text-zinc-550 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <span>Energy Balance Area</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Visualizing surplus vs deficit over the past 7 days.</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBurned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" name="Calories Consumed" dataKey="caloriesConsumed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorConsumed)" />
                <Area type="monotone" name="Calories Burned" dataKey="caloriesBurned" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorBurned)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exercise Muscle Group Distribution Radar Chart */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-850 dark:text-zinc-550 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-indigo-500" />
              <span>Muscle Group Split (Past 30 Days)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Radar chart showing trained muscle frequency distribution.</p>
          </div>

          <div className="h-72 flex justify-center items-center">
            {exerciseDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="70%" data={exerciseDistribution}>
                  <PolarGrid stroke="#e2e8f0" dark:stroke="#334155" />
                  <PolarAngleAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <PolarRadiusAxis stroke="#94a3b8" fontSize={9} />
                  <Radar name="Sets Logged" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 text-center py-20 border border-dashed border-slate-105 dark:border-zinc-800 rounded-2xl w-full">
                No exercise data available in the last 30 days.
              </div>
            )}
          </div>
        </div>

        {/* Hydration & Steps Weekly Log (Combo Bar Chart) */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-850 dark:text-zinc-550 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-blue-500" />
              <span>Water Log vs Daily Steps</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Checking baseline parameters together.</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#6366f1" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar yAxisId="left" dataKey="waterIntake" name="Water (ml)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar yAxisId="right" dataKey="steps" name="Steps" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
