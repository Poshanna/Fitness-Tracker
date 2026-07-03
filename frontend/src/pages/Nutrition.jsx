import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Apple, 
  Plus, 
  Trash2, 
  Droplet, 
  Utensils, 
  PieChart as ChartIcon, 
  ChevronRight, 
  Calendar,
  X
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import api from '../services/api.js';

const Nutrition = () => {
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState([]);
  const [waterData, setWaterData] = useState({ logs: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);

  // Meal modal state
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealType, setMealType] = useState('BREAKFAST');
  const [foodItems, setFoodItems] = useState([{ name: '', calories: 150, protein: 10, carbs: 20, fat: 5, fiber: 2 }]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const dateParam = `?date=${activeDate}`;
      const [mealsRes, waterRes] = await Promise.all([
        api.get(`/api/meals${dateParam}`),
        api.get(`/api/water${dateParam}`)
      ]);
      setMeals(mealsRes.data);
      setWaterData(waterRes.data);
    } catch (err) {
      console.error('Failed to fetch nutrition data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeDate]);

  // Aggregate daily totals
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  meals.forEach(m => {
    m.foods.forEach(f => {
      totalCalories += f.calories;
      totalProtein += f.protein;
      totalCarbs += f.carbs;
      totalFat += f.fat;
      totalFiber += f.fiber;
    });
  });

  const handleAddFoodField = () => {
    setFoodItems(prev => [...prev, { name: '', calories: 150, protein: 10, carbs: 20, fat: 5, fiber: 2 }]);
  };

  const handleRemoveFoodField = (idx) => {
    if (foodItems.length === 1) return;
    setFoodItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFoodValueChange = (idx, key, val) => {
    setFoodItems(prev => prev.map((item, i) => {
      if (i === idx) {
        return { ...item, [key]: val };
      }
      return item;
    }));
  };

  const handleSaveMeal = async (e) => {
    e.preventDefault();
    if (foodItems.some(f => !f.name.trim())) {
      alert('Please enter a name for all food items');
      return;
    }

    try {
      await api.post('/api/meals', {
        date: new Date(activeDate),
        type: mealType,
        foods: foodItems
      });

      // Push reminder notification
      await api.post('/api/notifications', {
        title: 'Meal Logged',
        message: `Successfully logged your ${mealType.toLowerCase()} foods.`,
        type: 'MEAL'
      });

      setShowMealModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save meal:', err);
    }
  };

  const handleDeleteMeal = async (id) => {
    if (!window.confirm('Delete this logged meal?')) return;
    try {
      await api.delete(`/api/meals/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
  };

  const handleQuickAddWater = async (amount) => {
    try {
      await api.post('/api/water', {
        amount,
        date: new Date(activeDate)
      });
      fetchData();
    } catch (err) {
      console.error('Failed to log water:', err);
    }
  };

  // Recharts Pie Chart Data
  const macroChartData = [
    { name: 'Protein (g)', value: Math.round(totalProtein), color: '#3b82f6' },
    { name: 'Carbs (g)', value: Math.round(totalCarbs), color: '#10b981' },
    { name: 'Fat (g)', value: Math.round(totalFat), color: '#f59e0b' }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];
  const hasMacros = totalProtein > 0 || totalCarbs > 0 || totalFat > 0;

  return (
    <div className="space-y-8">
      
      {/* Header with Date Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-50 tracking-tight">Nutrition & Hydration</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Log meals, track macronutrients, and monitor water intake.</p>
        </div>
        
        {/* Date Picker */}
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 px-4 py-2.5 rounded-2xl shadow-sm">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <input
            type="date"
            value={activeDate}
            onChange={e => setActiveDate(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 dark:text-zinc-300"
          />
        </div>
      </div>

      {/* Grid: Left = Nutrition Logs, Right = Chart Summary & Water Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Meal Logger */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-slate-850 dark:text-zinc-100 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-indigo-500" />
              <span>Meals Feed</span>
            </h3>
            <button
              onClick={() => {
                setMealType('BREAKFAST');
                setFoodItems([{ name: '', calories: 150, protein: 10, carbs: 20, fat: 5, fiber: 2 }]);
                setShowMealModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Meal</span>
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(n => (
                <div key={n} className="h-32 bg-slate-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : meals.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-8">
              <Apple className="w-12 h-12 text-slate-350 dark:text-zinc-700 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">No meals logged for this day</h4>
              <p className="text-xs text-slate-400 dark:text-zinc-550 max-w-xs mx-auto mt-1">
                Add breakfast, lunch, dinner, or snacks to track calorie intake and nutritional macros.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map(m => {
                const mealCals = m.foods.reduce((sum, f) => sum + f.calories, 0);
                const mealPro = m.foods.reduce((sum, f) => sum + f.protein, 0);
                const mealCarbs = m.foods.reduce((sum, f) => sum + f.carbs, 0);
                const mealFat = m.foods.reduce((sum, f) => sum + f.fat, 0);
                return (
                  <motion.div
                    key={m.id}
                    layout
                    className="p-5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider">
                          {m.type}
                        </span>
                        <span className="text-xs font-black text-slate-700 dark:text-zinc-300">
                          {Math.round(mealCals)} kcal
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                        P: {Math.round(mealPro)}g • C: {Math.round(mealCarbs)}g • F: {Math.round(mealFat)}g
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {m.foods.map((food, fIdx) => (
                          <span key={fIdx} className="px-2.5 py-1 bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800/40 border text-xs rounded-xl font-medium">
                            {food.name} ({Math.round(food.calories)} kcal)
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMeal(m.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-xl transition"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Panel: Daily Charts & Water Logger */}
        <div className="space-y-8">
          
          {/* Nutrition Summary (Macros distribution) */}
          <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-550 flex items-center gap-2">
                <ChartIcon className="w-4 h-4 text-indigo-500" />
                <span>Daily Calories & Macros</span>
              </h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-slate-855 dark:text-zinc-50">{Math.round(totalCalories)}</span>
                <span className="text-xs text-slate-400">kcal today</span>
              </div>
            </div>

            {hasMacros ? (
              <div className="space-y-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {macroChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Custom Legend */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {macroChartData.map(item => (
                    <div key={item.name} className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100/50 dark:border-zinc-900/50">
                      <span className="block font-bold text-slate-800 dark:text-zinc-100">{item.value}g</span>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase mt-0.5">{item.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-slate-400 dark:text-zinc-500 border border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl">
                No food logged today to display breakdown.
              </div>
            )}
          </div>

          {/* Water Tracker */}
          <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-50 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-blue-500" />
                <span>Water Balance</span>
              </h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-slate-800 dark:text-zinc-50">{waterData.totalAmount}</span>
                <span className="text-xs text-slate-400">ml of 3000ml</span>
              </div>
            </div>

            {/* Quick Add */}
            <div className="grid grid-cols-4 gap-2">
              {[250, 500, 750, 1000].map(amt => (
                <button
                  key={amt}
                  onClick={() => handleQuickAddWater(amt)}
                  className="py-2 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-500 border dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 transition-colors"
                >
                  +{amt >= 1000 ? '1L' : `${amt}`}
                </button>
              ))}
            </div>

            {/* Logs List */}
            {waterData.logs?.length > 0 && (
              <div className="space-y-2 pt-2 border-t dark:border-zinc-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Log History</p>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {waterData.logs.map((log, lIdx) => (
                    <div key={lIdx} className="flex justify-between items-center text-xs p-2 rounded bg-slate-50 dark:bg-zinc-950">
                      <span className="text-slate-500">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="font-bold text-blue-500">+{log.amount}ml</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* MEAL MODAL */}
      <AnimatePresence>
        {showMealModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto flex flex-col"
            >
              <button
                onClick={() => setShowMealModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-650 dark:hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-black text-slate-800 dark:text-zinc-50 mb-6">Log Food Intake</h2>

              <form onSubmit={handleSaveMeal} className="space-y-6 flex-1 flex flex-col">
                
                {/* Meal Type Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Meal Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setMealType(type)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all duration-200
                          ${mealType === type 
                            ? 'bg-indigo-600 border-indigo-650 text-white shadow-md' 
                            : 'border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400'}`}
                      >
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Foods List */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Food Items & Nutrition</h3>
                    <button
                      type="button"
                      onClick={handleAddFoodField}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {foodItems.map((food, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 flex flex-col gap-3 relative">
                        {foodItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFoodField(idx)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Food Name */}
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Food Item Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Scrambled Eggs, Whole Wheat Bread"
                            value={food.name}
                            onChange={e => handleFoodValueChange(idx, 'name', e.target.value)}
                            className="w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-zinc-900"
                          />
                        </div>

                        {/* Nutrition Fields */}
                        <div className="grid grid-cols-5 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-450 font-bold uppercase block text-center">Calories (kcal)</label>
                            <input
                              type="number"
                              required
                              value={food.calories}
                              onChange={e => handleFoodValueChange(idx, 'calories', e.target.value)}
                              className="w-full px-2 py-1 text-xs border rounded text-center bg-white dark:bg-zinc-900"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-450 font-bold uppercase block text-center">Protein (g)</label>
                            <input
                              type="number"
                              required
                              value={food.protein}
                              onChange={e => handleFoodValueChange(idx, 'protein', e.target.value)}
                              className="w-full px-2 py-1 text-xs border rounded text-center bg-white dark:bg-zinc-900"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-450 font-bold uppercase block text-center">Carbs (g)</label>
                            <input
                              type="number"
                              required
                              value={food.carbs}
                              onChange={e => handleFoodValueChange(idx, 'carbs', e.target.value)}
                              className="w-full px-2 py-1 text-xs border rounded text-center bg-white dark:bg-zinc-900"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-450 font-bold uppercase block text-center">Fat (g)</label>
                            <input
                              type="number"
                              required
                              value={food.fat}
                              onChange={e => handleFoodValueChange(idx, 'fat', e.target.value)}
                              className="w-full px-2 py-1 text-xs border rounded text-center bg-white dark:bg-zinc-900"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-450 font-bold uppercase block text-center">Fiber (g)</label>
                            <input
                              type="number"
                              required
                              value={food.fiber}
                              onChange={e => handleFoodValueChange(idx, 'fiber', e.target.value)}
                              className="w-full px-2 py-1 text-xs border rounded text-center bg-white dark:bg-zinc-900"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowMealModal(false)}
                    className="px-5 py-2.5 rounded-xl border hover:bg-slate-50 text-xs font-semibold text-slate-600 dark:border-zinc-850 dark:hover:bg-zinc-800 dark:text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg"
                  >
                    Save Meal
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

export default Nutrition;
