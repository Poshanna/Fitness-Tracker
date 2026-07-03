import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Filter, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Flame,
  Info
} from 'lucide-react';
import api from '../services/api.js';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Workout Logs
  const [workoutMuscleFilter, setWorkoutMuscleFilter] = useState('');
  
  // Exercise Library Search/Filter
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryMuscle, setLibraryMuscle] = useState('');
  const [libraryDifficulty, setLibraryDifficulty] = useState('');

  // Modals / Form State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');
  const [formDuration, setFormDuration] = useState(45);
  const [formCalories, setFormCalories] = useState(250);
  const [formCompleted, setFormCompleted] = useState(false);
  const [formExercises, setFormExercises] = useState([]);

  // Selected exercise detail popup
  const [activeExerciseDetail, setActiveExerciseDetail] = useState(null);

  const fetchWorkouts = async () => {
    try {
      const q = workoutMuscleFilter ? `?muscleGroup=${workoutMuscleFilter}` : '';
      const response = await api.get(`/api/workouts${q}`);
      setWorkouts(response.data);
    } catch (err) {
      console.error('Failed to load workouts:', err);
    }
  };

  const fetchExercises = async () => {
    try {
      const params = new URLSearchParams();
      if (librarySearch) params.append('search', librarySearch);
      if (libraryMuscle) params.append('muscleGroup', libraryMuscle);
      if (libraryDifficulty) params.append('difficulty', libraryDifficulty);

      const response = await api.get(`/api/exercises?${params.toString()}`);
      setExercises(response.data);
    } catch (err) {
      console.error('Failed to load exercises:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchWorkouts(), fetchExercises()]);
      setLoading(false);
    };
    loadAll();
  }, [workoutMuscleFilter]);

  useEffect(() => {
    fetchExercises();
  }, [librarySearch, libraryMuscle, libraryDifficulty]);

  const handleOpenCreate = () => {
    setEditingWorkout(null);
    setFormName('Morning Strength');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setFormDuration(45);
    setFormCalories(250);
    setFormCompleted(false);
    setFormExercises([]);
    setShowFormModal(true);
  };

  const handleOpenEdit = (workout) => {
    setEditingWorkout(workout);
    setFormName(workout.name);
    setFormDate(new Date(workout.date).toISOString().split('T')[0]);
    setFormNotes(workout.notes || '');
    setFormDuration(workout.duration || 0);
    setFormCalories(workout.caloriesBurned || 0);
    setFormCompleted(workout.completed);
    
    // Map existing exercises to form structure
    setFormExercises(workout.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      muscleGroup: ex.muscleGroup,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      restTime: ex.restTime || 60,
      notes: ex.notes || ''
    })));
    setShowFormModal(true);
  };

  const handleAddExerciseToForm = (ex) => {
    setFormExercises(prev => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: 3,
        reps: 10,
        weight: 20,
        restTime: 60,
        notes: ''
      }
    ]);
  };

  const handleRemoveExerciseFromForm = (idx) => {
    setFormExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateFormExerciseValue = (idx, key, val) => {
    setFormExercises(prev => prev.map((item, i) => {
      if (i === idx) {
        return { ...item, [key]: val };
      }
      return item;
    }));
  };

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workout log?')) return;
    try {
      await api.delete(`/api/workouts/${id}`);
      fetchWorkouts();
    } catch (err) {
      console.error('Failed to delete workout:', err);
    }
  };

  const handleToggleComplete = async (workout) => {
    try {
      await api.put(`/api/workouts/${workout.id}`, {
        ...workout,
        completed: !workout.completed
      });
      fetchWorkouts();
    } catch (err) {
      console.error('Failed to toggle workout completion status:', err);
    }
  };

  const handleSubmitWorkoutForm = async (e) => {
    e.preventDefault();
    if (formExercises.length === 0) {
      alert('Please add at least one exercise to this workout!');
      return;
    }

    const payload = {
      name: formName,
      date: new Date(formDate),
      notes: formNotes,
      duration: parseInt(formDuration) || 0,
      caloriesBurned: parseInt(formCalories) || 0,
      completed: formCompleted,
      exercises: formExercises
    };

    try {
      if (editingWorkout) {
        await api.put(`/api/workouts/${editingWorkout.id}`, payload);
      } else {
        await api.post('/api/workouts', payload);
        
        // Push notification reminder confirmation
        await api.post('/api/notifications', {
          title: 'Workout Logged',
          message: `Great job! You logged "${formName}" for ${formDate}.`,
          type: 'WORKOUT'
        });
      }
      setShowFormModal(false);
      fetchWorkouts();
    } catch (err) {
      console.error('Failed to save workout:', err);
      alert(err.response?.data?.message || 'Error occurred while saving workout.');
    }
  };

  const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body'];

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-50 tracking-tight">Workout Logs & Database</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Log workout sessions, customize sets, and browse your exercises library.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Workout</span>
        </button>
      </div>

      {/* Main Grid: Left = Logged Workouts, Right = Exercise Library */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Workout Logs List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-indigo-500" />
              <span>Workout History</span>
            </h3>
            
            {/* Filter by Muscle Group */}
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 px-3 py-1.5 rounded-xl shadow-sm text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={workoutMuscleFilter}
                onChange={e => setWorkoutMuscleFilter(e.target.value)}
                className="bg-transparent border-none outline-none font-semibold text-slate-600 dark:text-zinc-300 pr-4"
              >
                <option value="">All Muscles</option>
                {muscleGroups.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Workouts Feed */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(n => (
                <div key={n} className="h-48 bg-slate-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : workouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-8">
              <Dumbbell className="w-12 h-12 text-slate-350 dark:text-zinc-700 mb-3" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">No workouts logged yet</h4>
              <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-xs mt-1">Get started by clicking the "Log Workout" button or search exercises on the right.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {workouts.map(w => (
                <motion.div
                  key={w.id}
                  layout
                  className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-extrabold text-slate-800 dark:text-zinc-50">{w.name}</h4>
                        <button
                          onClick={() => handleToggleComplete(w)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase transition-colors
                            ${w.completed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}
                        >
                          {w.completed ? 'Completed' : 'Planned'}
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(w.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {w.duration} mins</span>
                        <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {w.caloriesBurned} kcal</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(w)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 rounded-xl transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkout(w.id)}
                        className="p-2 text-slate-400 hover:text-red-650 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {w.notes && (
                    <p className="text-xs text-slate-500 dark:text-zinc-405 italic bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-100/50 dark:border-zinc-900/50">
                      Coach Note: {w.notes}
                    </p>
                  )}

                  {/* Exercises Details Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-2">Exercise</th>
                          <th className="py-2">Muscle</th>
                          <th className="py-2 text-center">Sets</th>
                          <th className="py-2 text-center">Reps</th>
                          <th className="py-2 text-right">Weight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/40 text-xs text-slate-700 dark:text-zinc-350">
                        {w.exercises?.map(ex => (
                          <tr key={ex.id} className="hover:bg-slate-50/40 dark:hover:bg-zinc-800/10">
                            <td className="py-2.5 font-bold text-slate-800 dark:text-zinc-200">{ex.exerciseName}</td>
                            <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px]">{ex.muscleGroup}</span></td>
                            <td className="py-2.5 text-center font-semibold">{ex.sets}</td>
                            <td className="py-2.5 text-center font-semibold">{ex.reps}</td>
                            <td className="py-2.5 text-right font-black text-indigo-500">{ex.weight} kg</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Exercise Database Side Panel */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6 self-start">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-50">Exercise Library</h3>
            <p className="text-xs text-slate-400 mt-1">Select movements to quickly include in your logs.</p>
          </div>

          {/* Search Inputs */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={librarySearch}
                onChange={e => setLibrarySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={libraryMuscle}
                onChange={e => setLibraryMuscle(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl text-xs outline-none text-slate-600 dark:text-zinc-300"
              >
                <option value="">All Muscles</option>
                {muscleGroups.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={libraryDifficulty}
                onChange={e => setLibraryDifficulty(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl text-xs outline-none text-slate-600 dark:text-zinc-300"
              >
                <option value="">Difficulty</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          {/* Exercises Library Items */}
          <div className="space-y-3 max-h-96 overflow-y-auto divide-y divide-slate-50 dark:divide-zinc-800/40">
            {exercises.map(ex => (
              <div key={ex.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 group">
                <div className="overflow-hidden">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate group-hover:text-indigo-600 transition-colors">
                    {ex.name}
                  </h5>
                  <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                    {ex.muscleGroup.toLowerCase()} • {ex.difficulty.toLowerCase()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setActiveExerciseDetail(ex)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
                    title="View details"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleAddExerciseToForm(ex)}
                    className="p-1.5 text-indigo-600 hover:text-white hover:bg-indigo-600 dark:text-indigo-400 dark:hover:text-white rounded-lg transition"
                    title="Add to workout form"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* WORKOUT CREATE/EDIT MODAL */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowFormModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-black text-slate-800 dark:text-zinc-50 mb-6">
                {editingWorkout ? 'Edit Workout Session' : 'Record Workout Session'}
              </h2>

              <form onSubmit={handleSubmitWorkoutForm} className="space-y-6 flex-1 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Workout Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workout Name</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      required
                      placeholder="e.g. Morning Cardio, Push Day"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-150 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workout Date</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-150 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={formDuration}
                      onChange={e => setFormDuration(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-150 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  {/* Calories Burned */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calories Burned (kcal)</label>
                    <input
                      type="number"
                      value={formCalories}
                      onChange={e => setFormCalories(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-150 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Coach / Workout Notes</label>
                  <textarea
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    placeholder="Form hints, hydration state, or general notes..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-150 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm resize-none"
                  />
                </div>

                {/* Exercises Form List */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Logged Movements</h3>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      Select exercises from library on the side →
                    </span>
                  </div>

                  {formExercises.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl">
                      <p className="text-xs text-slate-400">No movements added. Select from the Exercise Library on the right sidebar of the screen or click library items.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formExercises.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-55 dark:bg-zinc-950 border dark:border-zinc-800/80 flex flex-col md:flex-row gap-3 items-center">
                          <div className="flex-1 text-xs font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px]">{idx+1}</span>
                            <span>{item.exerciseName}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                            <div>
                              <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Sets</label>
                              <input
                                type="number"
                                value={item.sets}
                                onChange={e => handleUpdateFormExerciseValue(idx, 'sets', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-white dark:bg-zinc-900 border text-xs text-center"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Reps</label>
                              <input
                                type="number"
                                value={item.reps}
                                onChange={e => handleUpdateFormExerciseValue(idx, 'reps', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-white dark:bg-zinc-900 border text-xs text-center"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Weight(kg)</label>
                              <input
                                type="number"
                                value={item.weight}
                                onChange={e => handleUpdateFormExerciseValue(idx, 'weight', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-white dark:bg-zinc-900 border text-xs text-center"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveExerciseFromForm(idx)}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mark completed checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="formCompleted"
                    checked={formCompleted}
                    onChange={e => setFormCompleted(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-305 rounded"
                  />
                  <label htmlFor="formCompleted" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Mark workout completed immediately
                  </label>
                </div>

                {/* Footer Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-5 py-2.5 rounded-xl border hover:bg-slate-50 text-xs font-semibold text-slate-600 dark:border-zinc-850 dark:hover:bg-zinc-800 dark:text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20"
                  >
                    Save Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXERCISE DETAIL VIEW MODAL */}
      <AnimatePresence>
        {activeExerciseDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl shadow-2xl p-6"
            >
              <button
                onClick={() => setActiveExerciseDetail(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                    {activeExerciseDetail.muscleGroup}
                  </span>
                  <h3 className="text-lg font-black text-slate-800 dark:text-zinc-50 mt-1">{activeExerciseDetail.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Difficulty</span>
                    <span className="font-bold text-slate-700 dark:text-zinc-300 capitalize">{activeExerciseDetail.difficulty.toLowerCase()}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Equipment</span>
                    <span className="font-bold text-slate-700 dark:text-zinc-300">{activeExerciseDetail.equipment}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">Description</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{activeExerciseDetail.description}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">Instructions</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl whitespace-pre-line border border-slate-100/30">
                    {activeExerciseDetail.instructions}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Workouts;
