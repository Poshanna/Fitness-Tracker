import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Scale, 
  Target, 
  Activity, 
  UserCheck, 
  Camera, 
  Shield, 
  Bookmark,
  ActivitySquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [previewImage, setPreviewImage] = useState(user?.profilePic || null);
  const [selectedFile, setSelectedFile] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      age: user?.age || 25,
      gender: user?.gender || 'MALE',
      height: user?.height || 175,
      weight: user?.weight || 70,
      goal: user?.goal || 'MAINTAIN_WEIGHT',
      activityLevel: user?.activityLevel || 'MODERATELY_ACTIVE',
      targetWeight: user?.targetWeight || 70
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    // Build form data for Multer upload
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('age', data.age);
    formData.append('gender', data.gender);
    formData.append('height', data.height);
    formData.append('weight', data.weight);
    formData.append('goal', data.goal);
    formData.append('activityLevel', data.activityLevel);
    formData.append('targetWeight', data.targetWeight);
    if (selectedFile) {
      formData.append('profilePic', selectedFile);
    }

    const result = await updateProfile(formData);
    setIsSubmitting(false);

    if (result.success) {
      setMessage({ text: result.message || 'Profile updated successfully!', type: 'success' });
    } else {
      setMessage({ text: result.message || 'Profile update failed.', type: 'error' });
    }
  };

  const metrics = user?.calculatedMetrics || {
    bmi: 0,
    bmr: 0,
    dailyCalorieRequirement: 2000
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-55 tracking-tight flex items-center gap-2">
          <User className="w-8 h-8 text-indigo-500" />
          <span>Biometric Profile Settings</span>
        </h1>
        <p className="text-sm text-slate-505 dark:text-zinc-400">Configure physical indexes, training goals, and biological constraints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Settings Form */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-base font-extrabold text-slate-850 dark:text-zinc-150 border-b pb-3 dark:border-zinc-800">
            Edit Biometrics
          </h3>

          {message.text && (
            <div className={`p-4 rounded-xl text-xs font-semibold border 
              ${message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Avatar Selector */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full bg-slate-900 text-white text-3xl font-bold flex items-center justify-center overflow-hidden border-2 border-indigo-500/20 group">
                {previewImage ? (
                  <img src={previewImage} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Profile Picture</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">JPEG, JPG, PNG or WEBP. Max 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 outline-none text-slate-800 dark:text-zinc-150"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <span className="text-[10px] text-red-400">{errors.name.message}</span>}
              </div>

              {/* Age */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Age</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 outline-none text-slate-800 dark:text-zinc-150"
                  {...register('age', { required: 'Age is required', min: 1, max: 120 })}
                />
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Biological Sex</label>
                <select
                  className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 text-slate-700 dark:text-zinc-300"
                  {...register('gender')}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Height */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Height (cm)</label>
                <input
                  type="number"
                  step="any"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 outline-none text-slate-800 dark:text-zinc-150"
                  {...register('height', { required: 'Height is required' })}
                />
              </div>

              {/* Weight */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Weight (kg)</label>
                <input
                  type="number"
                  step="any"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 outline-none text-slate-800 dark:text-zinc-150"
                  {...register('weight', { required: 'Weight is required' })}
                />
              </div>

              {/* Target Weight */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Weight (kg)</label>
                <input
                  type="number"
                  step="any"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 outline-none text-slate-800 dark:text-zinc-150"
                  {...register('targetWeight', { required: 'Target Weight is required' })}
                />
              </div>

              {/* Goal */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Goal</label>
                <select
                  className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 text-slate-700 dark:text-zinc-300"
                  {...register('goal')}
                >
                  <option value="LOSE_WEIGHT">Lose Weight</option>
                  <option value="GAIN_MUSCLE">Gain Muscle</option>
                  <option value="MAINTAIN_WEIGHT">Maintain Weight</option>
                  <option value="INCREASE_STRENGTH">Increase Strength</option>
                  <option value="IMPROVE_ENDURANCE">Improve Endurance</option>
                  <option value="CUSTOM">Custom Goal</option>
                </select>
              </div>

              {/* Activity Level */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity Level</label>
                <select
                  className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 text-slate-700 dark:text-zinc-300"
                  {...register('activityLevel')}
                >
                  <option value="SEDENTARY">Sedentary (Little/no exercise)</option>
                  <option value="LIGHTLY_ACTIVE">Lightly Active (1-3 days/week)</option>
                  <option value="MODERATELY_ACTIVE">Moderately Active (3-5 days/week)</option>
                  <option value="VERY_ACTIVE">Very Active (6-7 days/week)</option>
                  <option value="EXTRA_ACTIVE">Extra Active (Hard labor/double splits)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t dark:border-zinc-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/10 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Synchronizing...' : 'Save Biometrics'}
              </button>
            </div>
          </form>
        </div>

        {/* Biometric Analysis Output Cards */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-150 flex items-center gap-2">
              <ActivitySquare className="w-5 h-5 text-indigo-500" />
              <span>Calculated Biometric Indices</span>
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/20 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Body Mass Index (BMI)</span>
                  <span className="text-lg font-black text-slate-800 dark:text-zinc-100">{metrics.bmi}</span>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-indigo-100 text-indigo-650 dark:bg-indigo-950 dark:text-indigo-400 uppercase">
                  {metrics.bmi < 18.5 ? 'Underweight' : metrics.bmi < 25 ? 'Normal' : metrics.bmi < 30 ? 'Overweight' : 'Obese'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/20 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Basal Metabolic Rate (BMR)</span>
                  <span className="text-lg font-black text-slate-800 dark:text-zinc-100">{metrics.bmr}</span>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-emerald-100 text-emerald-650 dark:bg-emerald-950 dark:text-emerald-400 uppercase">
                  kcal / day
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/20 dark:bg-amber-950/10 border border-amber-100/20 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Energy Requirement (TDEE)</span>
                  <span className="text-lg font-black text-slate-800 dark:text-zinc-100">{metrics.dailyCalorieRequirement}</span>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-amber-100 text-amber-650 dark:bg-amber-950 dark:text-amber-400 uppercase">
                  kcal / day
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Profile;
