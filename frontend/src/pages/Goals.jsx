import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  X,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import api from '../services/api.js';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [goalType, setGoalType] = useState('LOSE_WEIGHT');
  const [targetValue, setTargetValue] = useState('');
  const [currentValue, setCurrentValue] = useState('0');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');

  // Editing progress state
  const [editingGoalProgressId, setEditingGoalProgressId] = useState(null);
  const [newProgressValue, setNewProgressValue] = useState('');

  const fetchGoals = async () => {
    try {
      const response = await api.get('/api/goals');
      setGoals(response.data);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!targetValue || isNaN(targetValue) || parseFloat(targetValue) <= 0) {
      alert('Please enter a valid target value');
      return;
    }

    try {
      await api.post('/api/goals', {
        type: goalType,
        targetValue: parseFloat(targetValue),
        currentValue: parseFloat(currentValue) || 0.0,
        description,
        endDate: endDate ? new Date(endDate) : null
      });

      // Notification
      await api.post('/api/notifications', {
        title: 'New Goal Created',
        message: `Your new goal to "${goalType.replace('_', ' ').toLowerCase()}" has been set!`,
        type: 'GENERAL'
      });

      setShowModal(false);
      setTargetValue('');
      setCurrentValue('0');
      setDescription('');
      setEndDate('');
      fetchGoals();
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  const handleUpdateProgress = async (id) => {
    if (!newProgressValue || isNaN(newProgressValue)) return;
    try {
      const parsedVal = parseFloat(newProgressValue);
      const goal = goals.find(g => g.id === id);
      
      const payload = {
        currentValue: parsedVal
      };

      // If reached target, mark completed
      if (parsedVal >= goal.targetValue) {
        payload.status = 'COMPLETED';
        // Add complete alert
        await api.post('/api/notifications', {
          title: 'Goal Accomplished!',
          message: `Congratulations! You hit your goal target of ${goal.targetValue}.`,
          type: 'GENERAL'
        });
      }

      await api.put(`/api/goals/${id}`, payload);
      setEditingGoalProgressId(null);
      setNewProgressValue('');
      fetchGoals();
    } catch (err) {
      console.error('Failed to update goal progress:', err);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.delete(`/api/goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const getGoalUnit = (type) => {
    if (type.includes('WEIGHT')) return 'kg';
    if (type.includes('STRENGTH')) return 'kg (max lift)';
    if (type.includes('ENDURANCE')) return 'mins or km';
    return 'pts';
  };

  const getGoalColor = (status) => {
    if (status === 'COMPLETED') return 'bg-emerald-500';
    if (status === 'ABANDONED') return 'bg-red-500';
    return 'bg-gradient-to-r from-violet-600 to-indigo-650';
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-50 tracking-tight">Fitness Targets</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Establish and monitor goals, updating progress indexes incrementally.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-655 hover:bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/10 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="h-44 bg-slate-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-slate-105 dark:border-zinc-800 rounded-3xl p-8 max-w-lg mx-auto">
          <Target className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">No fitness goals declared yet</h4>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
            Setting clear targets is the first step to progress. Log weight goals, strength targets, or custom markers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(g => (
            <motion.div
              key={g.id}
              layout
              className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider">
                      {g.type.replace('_', ' ')}
                    </span>
                    <h4 className="text-base font-black text-slate-850 dark:text-zinc-100 mt-2">{g.description || 'Target Metric'}</h4>
                  </div>
                  
                  {/* Goal Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar info */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-black text-slate-800 dark:text-zinc-100">
                      {g.currentValue} / {g.targetValue} {getGoalUnit(g.type)} ({g.progress}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-950 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${getGoalColor(g.status)}`}
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Progress Update Forms */}
              <div className="flex justify-between items-center pt-2 border-t dark:border-zinc-800 text-xs">
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  {g.endDate ? `Target: ${new Date(g.endDate).toLocaleDateString()}` : 'No deadline'}
                </span>

                {g.status === 'COMPLETED' ? (
                  <span className="flex items-center gap-1 text-emerald-500 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </span>
                ) : editingGoalProgressId === g.id ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="New Value"
                      value={newProgressValue}
                      onChange={e => setNewProgressValue(e.target.value)}
                      className="w-20 px-2 py-1 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-center text-xs"
                    />
                    <button
                      onClick={() => handleUpdateProgress(g.id)}
                      className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingGoalProgressId(null)}
                      className="px-2 py-1 rounded border hover:bg-slate-50 text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingGoalProgressId(g.id);
                      setNewProgressValue(g.currentValue.toString());
                    }}
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Log Progress
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl shadow-2xl p-6"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black text-slate-800 dark:text-zinc-50 mb-6">Create Fitness Target</h3>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                {/* Goal Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Goal Type</label>
                  <select
                    value={goalType}
                    onChange={e => setGoalType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300"
                  >
                    <option value="LOSE_WEIGHT">Lose Weight</option>
                    <option value="GAIN_MUSCLE">Gain Muscle</option>
                    <option value="MAINTAIN_WEIGHT">Maintain Weight</option>
                    <option value="INCREASE_STRENGTH">Increase Strength</option>
                    <option value="IMPROVE_ENDURANCE">Improve Endurance</option>
                    <option value="CUSTOM">Custom Target</option>
                  </select>
                </div>

                {/* Target Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Squat 100kg for 5 reps, Lose 5kg of fat"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 text-slate-800 dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Current Value */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Value</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={currentValue}
                      onChange={e => setCurrentValue(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 text-slate-800 dark:text-zinc-100"
                    />
                  </div>
                  {/* Target Value */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Value</label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 80"
                      value={targetValue}
                      onChange={e => setTargetValue(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 text-slate-800 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 text-slate-800 dark:text-zinc-100"
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-2 pt-4 border-t dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border hover:bg-slate-50 text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/10"
                  >
                    Set Target
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Goals;
