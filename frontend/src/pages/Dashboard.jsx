import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Utensils, 
  Droplet, 
  Footprints, 
  Scale, 
  TrendingUp, 
  Sparkles, 
  Calendar,
  CheckCircle,
  Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waterAdding, setWaterAdding] = useState(false);
  const [stepsInput, setStepsInput] = useState('');
  const [loggingSteps, setLoggingSteps] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/analytics');
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddWater = async (amount) => {
    setWaterAdding(true);
    try {
      await api.post('/api/water', { amount });
      
      // Auto-trigger a reminder notification if hydration threshold reached or logged!
      // In a real app we could post to notifications, let's create a notification reminder.
      await api.post('/api/notifications', {
        title: 'Hydration Tracked',
        message: `Successfully logged ${amount}ml of water! Stay hydrated.`,
        type: 'WATER'
      });
      
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to log water:', err);
    } finally {
      setWaterAdding(false);
    }
  };

  const handleLogSteps = async (e) => {
    e.preventDefault();
    if (!stepsInput || isNaN(stepsInput) || parseInt(stepsInput) <= 0) return;
    
    setLoggingSteps(true);
    try {
      await api.post('/api/steps', { steps: parseInt(stepsInput) });
      setStepsInput('');
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to log steps:', err);
    } finally {
      setLoggingSteps(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 bg-slate-200 dark:bg-zinc-800 rounded-3xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-zinc-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  const summary = data?.dailySummary || {
    caloriesBurned: 0,
    caloriesConsumed: 0,
    waterIntake: 0,
    steps: 0,
    weight: user?.weight || 70,
    targetWeight: user?.targetWeight || 70,
    calculatedMetrics: { bmi: 0, bmr: 0, dailyCalorieRequirement: 2000 },
    workoutStreak: 0,
    goalCompletionPercentage: 0
  };

  // Water Goal Target
  const waterGoal = 3000; // 3L
  const waterProgress = Math.min(100, Math.round((summary.waterIntake / waterGoal) * 100));

  // Calories consumed vs allowance
  const calorieAllowance = summary.calculatedMetrics?.dailyCalorieRequirement || 2000;
  const calorieProgress = Math.min(100, Math.round((summary.caloriesConsumed / calorieAllowance) * 100));

  const stats = [
    { 
      name: 'Streak', 
      value: `${summary.workoutStreak} Days`, 
      sub: 'Consecutive active days', 
      icon: Flame, 
      color: 'from-orange-500 to-red-500', 
      shadow: 'shadow-orange-500/10' 
    },
    { 
      name: 'Hydration', 
      value: `${summary.waterIntake}ml`, 
      sub: `Goal: ${waterGoal}ml (${waterProgress}%)`, 
      icon: Droplet, 
      color: 'from-blue-500 to-sky-500', 
      shadow: 'shadow-blue-500/10' 
    },
    { 
      name: 'Calorie Intake', 
      value: `${summary.caloriesConsumed} kcal`, 
      sub: `Target: ${calorieAllowance} kcal`, 
      icon: Utensils, 
      color: 'from-emerald-500 to-teal-500', 
      shadow: 'shadow-emerald-500/10' 
    },
    { 
      name: 'Daily Burn', 
      value: `${summary.caloriesBurned} kcal`, 
      sub: 'From completed workouts', 
      icon: Flame, 
      color: 'from-rose-500 to-pink-500', 
      shadow: 'shadow-rose-500/10' 
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Header and Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-50 tracking-tight">
            Overview Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Real-time biometric signals and wellness tracking indices.
          </p>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
            <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Current Weight</p>
            <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{summary.weight} kg</p>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-md ${stat.shadow} relative overflow-hidden group`}
            >
              {/* Decorative background glow on hover */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-tr ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-full blur-xl`} />

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{stat.name}</p>
                  <h3 className="text-2xl font-black text-slate-850 dark:text-zinc-50 mt-2">{stat.value}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{stat.sub}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-tr ${stat.color} text-white shadow-lg`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Middle Grid - Charts and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weekly Activity Chart (Recharts) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-850 dark:text-zinc-50">Energy Intake vs Expenditure</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500">Weekly comparison of calories burned and consumed.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Consumed
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Burned
              </span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.weeklyProgress || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                />
                <Bar dataKey="caloriesConsumed" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="caloriesBurned" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Loggers Card */}
        <div className="flex flex-col gap-6">
          {/* Water Quick Logger */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-zinc-50">Hydration Assistant</h3>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-2xl h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-sky-500 h-full transition-all duration-500"
                style={{ width: `${waterProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>{summary.waterIntake}ml logged</span>
              <span>{waterProgress}% of daily goal</span>
            </div>
            
            {/* Quick Add Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { label: '+250ml', value: 250 },
                { label: '+500ml', value: 500 },
                { label: '+750ml', value: 750 },
                { label: '+1L', value: 1000 }
              ].map(btn => (
                <button
                  key={btn.label}
                  disabled={waterAdding}
                  onClick={() => handleAddWater(btn.value)}
                  className="py-2.5 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 text-xs font-bold text-slate-700 hover:text-indigo-600 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/40 dark:text-zinc-300 dark:hover:text-white transition-all duration-200"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Steps Quick Logger */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-850 dark:text-zinc-50">Steps Counter</h3>
              <Footprints className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800 dark:text-zinc-50">{summary.steps}</span>
              <span className="text-xs text-slate-400">steps today</span>
            </div>

            <form onSubmit={handleLogSteps} className="flex gap-2">
              <input
                type="number"
                placeholder="Add steps (e.g. 1500)"
                value={stepsInput}
                onChange={e => setStepsInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-zinc-100"
              />
              <button
                type="submit"
                disabled={loggingSteps}
                className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Today's Workout and calculated index panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Today's Workout Details */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-slate-850 dark:text-zinc-50">Today's Workout Program</h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-50 dark:bg-zinc-850 text-slate-500">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {data?.todayWorkout ? (
            <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 dark:bg-indigo-950/10 dark:border-indigo-950/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-zinc-50">{data.todayWorkout.name}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {data.todayWorkout.exercises?.length || 0} exercises • {data.todayWorkout.duration || 0} mins
                </p>
                <p className="text-[11px] text-indigo-500 dark:text-indigo-400 font-semibold italic mt-1">
                  {data.todayWorkout.notes || 'No notes added'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${data.todayWorkout.completed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {data.todayWorkout.completed ? 'Completed' : 'Planned'}
                </span>
                {data.todayWorkout.completed && <CheckCircle className="w-5 h-5 text-emerald-500" />}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
              <Calendar className="w-8 h-8 text-slate-300 dark:text-zinc-700 mb-2" />
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">No workout logged for today.</p>
              <Link
                to="/workouts"
                className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Log a workout now →
              </Link>
            </div>
          )}
        </div>

        {/* Biometrics Index Panel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm space-y-6">
          <h3 className="text-sm font-extrabold text-slate-850 dark:text-zinc-50">Biometric Indicators</h3>
          
          <div className="divide-y divide-slate-50 dark:divide-zinc-800/50">
            <div className="py-3 flex justify-between">
              <span className="text-xs text-slate-500 dark:text-zinc-400">Body Mass Index (BMI)</span>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-50">{summary.calculatedMetrics?.bmi || 'N/A'}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-xs text-slate-500 dark:text-zinc-400">Basal Metabolic Rate (BMR)</span>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-50">{summary.calculatedMetrics?.bmr || 'N/A'} kcal</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-xs text-slate-500 dark:text-zinc-400">Energy Requirement (TDEE)</span>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-50">{summary.calculatedMetrics?.dailyCalorieRequirement || 'N/A'} kcal</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
            BMI/BMR index signals calculated using the Mifflin-St Jeor formula based on active profile metrics. Make sure to keep profile metrics updated.
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
