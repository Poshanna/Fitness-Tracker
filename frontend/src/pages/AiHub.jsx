import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  MessageSquare, 
  Dumbbell, 
  Apple, 
  Send, 
  Scale,
  Brain, 
  RefreshCw, 
  Activity,
  Bot,
  User,
  AlertCircle
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const AiHub = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat'); // chat, generators, insights
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Generator Workout states
  const [workoutParams, setWorkoutParams] = useState({
    age: user?.age || 25,
    gender: user?.gender || 'MALE',
    height: user?.height || 175,
    weight: user?.weight || 70,
    goal: user?.goal || 'LOSE_WEIGHT',
    fitnessLevel: 'BEGINNER',
    equipment: 'dumbbells, bodyweight',
    daysPerWeek: 3
  });
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [workoutLoading, setWorkoutLoading] = useState(false);

  // Generator Nutrition states
  const [nutritionParams, setNutritionParams] = useState({
    goal: user?.goal || 'LOSE_WEIGHT',
    calories: 2000,
    dietType: 'NON_VEGETARIAN',
    allergies: '',
    budget: 'MEDIUM'
  });
  const [generatedNutrition, setGeneratedNutrition] = useState(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);

  // Insights state
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history once on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/api/admin/chatbot-logs'); // Admins get all, users get their own in a real setup. Let's filter user's history!
        // In a real app we would have GET /api/ai/chat. But chatbot logs has user link. Let's query and filter locally.
        const userLogs = response.data.filter(log => log.userId === user.id);
        
        // Reverse history to show oldest first
        const formatted = userLogs.reverse().map(log => ({
          role: log.role === 'USER' ? 'user' : 'model',
          text: log.message
        }));

        if (formatted.length === 0) {
          setMessages([
            { role: 'model', text: "Hello! I'm Aegis, your AI Personal Coach. Ask me anything about exercises, diet targets, BMI details, or generate custom workout splits!" }
          ]);
        } else {
          setMessages(formatted);
        }
      } catch (err) {
        console.warn('Failed to load chat history:', err);
        setMessages([
          { role: 'model', text: "Hello! I'm Aegis, your AI Personal Coach. Ask me anything about exercises, diet targets, BMI details, or generate custom workout splits!" }
        ]);
      }
    };
    fetchHistory();
  }, [user]);

  // Load Insights on tab switch
  useEffect(() => {
    if (activeTab === 'insights') {
      loadProgressInsights();
    }
  }, [activeTab]);

  const loadProgressInsights = async () => {
    setInsightsLoading(true);
    try {
      const response = await api.get('/api/ai/insights');
      setInsights(response.data.insights || []);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const response = await api.post('/api/ai/chat', { message: userText });
      setMessages(prev => [...prev, { role: 'model', text: response.data.reply }]);
    } catch (err) {
      console.error('Failed to chat:', err);
      setMessages(prev => [...prev, { role: 'model', text: "Oops, I encountered a communication drift. Let's try again in a bit." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateWorkout = async (e) => {
    e.preventDefault();
    setWorkoutLoading(true);
    setGeneratedWorkout(null);
    try {
      const response = await api.post('/api/ai/workout-plan', workoutParams);
      setGeneratedWorkout(response.data);
    } catch (err) {
      console.error('Failed to generate workout plan:', err);
    } finally {
      setWorkoutLoading(false);
    }
  };

  const handleGenerateNutrition = async (e) => {
    e.preventDefault();
    setNutritionLoading(true);
    setGeneratedNutrition(null);
    try {
      const response = await api.post('/api/ai/nutrition-plan', nutritionParams);
      setGeneratedNutrition(response.data);
    } catch (err) {
      console.error('Failed to generate nutrition plan:', err);
    } finally {
      setNutritionLoading(false);
    }
  };

  const handleApplySuggestedMessage = (txt) => {
    setInputMessage(txt);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-50 tracking-tight flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
          <span>AI Coach Hub</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Consult your AI assistant, synthesize custom workout splits, and compile meal plans.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition
            ${activeTab === 'chat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-650'}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Fitness Chatbot</span>
        </button>
        <button
          onClick={() => setActiveTab('generators')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition
            ${activeTab === 'generators' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-650'}`}
        >
          <Brain className="w-4 h-4" />
          <span>Workout & Meal Builders</span>
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition
            ${activeTab === 'insights' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-655'}`}
        >
          <Activity className="w-4 h-4" />
          <span>Biometric Coach Insights</span>
        </button>
      </div>

      {/* TAB CONTENT: CHAT */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat box */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col h-[500px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex gap-3 items-start ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role !== 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100/30">
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl max-w-[80%] text-xs leading-relaxed whitespace-pre-line
                    ${m.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10' 
                      : 'bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 border rounded-tl-none border-slate-100/30'}`}
                  >
                    {m.text}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 border border-slate-850">
                      <User className="w-4.5 h-4.5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100/30">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 text-slate-400 border rounded-tl-none border-slate-100/30 text-xs">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input message form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 mt-4 border-t dark:border-zinc-800 pt-4">
              <input
                type="text"
                placeholder="Ask Aegis (e.g. 'Suggest chest exercises', 'Explain BMI')..."
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs text-slate-850 dark:text-zinc-100"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="p-3 rounded-xl bg-indigo-650 text-white hover:bg-indigo-600 disabled:opacity-50 shadow-md shadow-indigo-600/10 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Prompts Panel */}
          <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4 self-start">
            <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Suggested Topics</h4>
            <div className="flex flex-col gap-2">
              {[
                "Suggest chest exercises",
                "How do I lose fat?",
                "Create a beginner workout",
                "High-protein meal ideas",
                "Explain BMI",
                "Why am I not losing weight?"
              ].map(q => (
                <button
                  key={q}
                  onClick={() => handleApplySuggestedMessage(q)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 dark:border-zinc-800/80 hover:border-indigo-100 hover:bg-indigo-50/20 text-xs font-semibold text-slate-600 dark:text-zinc-350 dark:hover:text-white transition duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BUILDERS */}
      {activeTab === 'generators' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* AI WORKOUT BUILDER */}
          <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-850 dark:text-zinc-100 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-indigo-500" />
              <span>AI Workout Generator</span>
            </h3>
            
            <form onSubmit={handleGenerateWorkout} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fitness Level</label>
                  <select
                    value={workoutParams.fitnessLevel}
                    onChange={e => setWorkoutParams(prev => ({ ...prev, fitnessLevel: e.target.value }))}
                    className="w-full px-3 py-2 border dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 rounded-xl"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Training Days / Week</label>
                  <select
                    value={workoutParams.daysPerWeek}
                    onChange={e => setWorkoutParams(prev => ({ ...prev, daysPerWeek: e.target.value }))}
                    className="w-full px-3 py-2 border dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 rounded-xl"
                  >
                    <option value={3}>3 Days</option>
                    <option value={4}>4 Days</option>
                    <option value={5}>5 Days</option>
                    <option value={6}>6 Days</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Equipment Available</label>
                <input
                  type="text"
                  placeholder="e.g. barbell, dumbbells, full gym, bodyweight"
                  value={workoutParams.equipment}
                  onChange={e => setWorkoutParams(prev => ({ ...prev, equipment: e.target.value }))}
                  className="w-full px-3 py-2 border dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={workoutLoading}
                className="w-full py-3 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/10 transition flex items-center justify-center gap-2"
              >
                {workoutLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Training Plan</span>
                  </>
                )}
              </button>
            </form>

            {/* Generated workout split output */}
            {generatedWorkout && (
              <div className="pt-4 border-t dark:border-zinc-800 space-y-4">
                <div className="bg-indigo-50/40 border border-indigo-100/50 dark:bg-indigo-950/10 dark:border-indigo-950/30 p-4 rounded-2xl">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-50">{generatedWorkout.planName}</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{generatedWorkout.description}</p>
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider mt-2">{generatedWorkout.split}</p>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto divide-y divide-slate-50 dark:divide-zinc-800/40">
                  {generatedWorkout.weeklySchedule?.map((dayObj, dIdx) => (
                    <div key={dIdx} className="pt-3 first:pt-0">
                      <div className="flex justify-between items-baseline">
                        <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-150">{dayObj.day}</h5>
                        <span className="text-[10px] text-slate-400 font-bold capitalize">{dayObj.focus.toLowerCase()}</span>
                      </div>
                      
                      {!dayObj.isRestDay ? (
                        <div className="mt-2 space-y-1.5">
                          {dayObj.exercises?.map((ex, eIdx) => (
                            <div key={eIdx} className="text-xs flex justify-between bg-slate-50 dark:bg-zinc-950 p-2 rounded-lg">
                              <span className="font-semibold text-slate-700 dark:text-zinc-350">{ex.name}</span>
                              <span className="text-slate-400 text-[10px]">{ex.sets}x{ex.reps} • Rest: {ex.rest}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 italic mt-1">Rest Day: {dayObj.cardio || 'Recovery'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI NUTRITION BUILDER */}
          <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-850 dark:text-zinc-100 flex items-center gap-2">
              <Apple className="w-5 h-5 text-emerald-500" />
              <span>AI Nutrition Planner</span>
            </h3>
            
            <form onSubmit={handleGenerateNutrition} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Calories Target</label>
                  <input
                    type="number"
                    value={nutritionParams.calories}
                    onChange={e => setNutritionParams(prev => ({ ...prev, calories: e.target.value }))}
                    className="w-full px-3 py-2 border dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diet Type</label>
                  <select
                    value={nutritionParams.dietType}
                    onChange={e => setNutritionParams(prev => ({ ...prev, dietType: e.target.value }))}
                    className="w-full px-3 py-2 border dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 rounded-xl"
                  >
                    <option value="VEGETARIAN">Vegetarian</option>
                    <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                    <option value="VEGAN">Vegan</option>
                    <option value="KETO">Ketogenic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Allergies / Exclusions</label>
                  <input
                    type="text"
                    placeholder="e.g. peanuts, dairy, gluten"
                    value={nutritionParams.allergies}
                    onChange={e => setNutritionParams(prev => ({ ...prev, allergies: e.target.value }))}
                    className="w-full px-3 py-2 border dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget Profile</label>
                  <select
                    value={nutritionParams.budget}
                    onChange={e => setNutritionParams(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full px-3 py-2 border dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 rounded-xl"
                  >
                    <option value="LOW">Low Cost</option>
                    <option value="MEDIUM">Medium / Normal</option>
                    <option value="HIGH">Premium / Organic</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={nutritionLoading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/10 transition flex items-center justify-center gap-2"
              >
                {nutritionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Diet Template</span>
                  </>
                )}
              </button>
            </form>

            {/* Generated nutrition details */}
            {generatedNutrition && (
              <div className="pt-4 border-t dark:border-zinc-800 space-y-4">
                <div className="bg-emerald-50/40 border border-emerald-100/50 dark:bg-emerald-950/10 dark:border-emerald-950/30 p-4 rounded-2xl">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-550">{generatedNutrition.planName}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(generatedNutrition.macroSplit || {}).map(([k, v]) => (
                      <span key={k} className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border text-[9px] font-bold uppercase text-slate-650 dark:text-zinc-350">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto divide-y divide-slate-50 dark:divide-zinc-800/40">
                  {Object.entries(generatedNutrition.meals || {}).map(([mealKey, mealObj]) => (
                    <div key={mealKey} className="pt-3 first:pt-0 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">{mealKey}</span>
                        <span className="text-xs font-black text-slate-750 dark:text-zinc-100">{mealObj.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 italic">Macros: {mealObj.macros} ({mealObj.calories} kcal)</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-100/30">{mealObj.instructions}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT: INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-zinc-900 border border-slate-105 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-2 border-b dark:border-zinc-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-850 dark:text-zinc-50">Physiological Coach Insights</h3>
              <p className="text-xs text-slate-405 mt-0.5">Automated synthesis of your logged biometric progress indicators.</p>
            </div>
            <button
              onClick={loadProgressInsights}
              disabled={insightsLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-650 hover:bg-slate-50 dark:hover:bg-zinc-850"
            >
              <RefreshCw className={`w-4 h-4 ${insightsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {insightsLoading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-16 bg-slate-100 dark:bg-zinc-950 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : insights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-xs text-slate-400">
              <AlertCircle className="w-8 h-8 text-slate-300 dark:text-zinc-700 mb-2" />
              <p className="max-w-xs leading-relaxed">No progress insights logged. Complete workouts and record weight fluctuations on the dashboard to trigger biometric signals.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-2xl bg-indigo-50/20 border border-indigo-100/30 dark:bg-indigo-950/10 dark:border-indigo-950/20 flex gap-3 text-xs leading-relaxed text-slate-700 dark:text-zinc-300"
                >
                  <Bot className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AiHub;
