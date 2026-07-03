import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Flame, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setError('');
    setIsSubmitting(true);
    const result = await authRegister(data.email, data.password, data.name);
    setIsSubmitting(false);

    if (result.success) {
      // Guide user to complete their profile setup on successful registration
      navigate('/profile');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md z-10">
        
        {/* Brand Banner */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-xl shadow-indigo-500/20 mb-3">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            AegisFit
          </h2>
          <p className="text-sm text-slate-400 mt-1">Start Your Health Journey Today</p>
        </div>

        {/* Register Card */}
        <div className="bg-slate-800/40 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Create Account</h3>

          {error && (
            <div className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name field */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-900/50 border text-white text-sm outline-none transition-all duration-200
                    ${errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              {errors.name && <span className="text-[10px] text-red-400 font-medium">{errors.name.message}</span>}
            </div>

            {/* Email field */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-900/50 border text-white text-sm outline-none transition-all duration-200
                    ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                />
              </div>
              {errors.email && <span className="text-[10px] text-red-400 font-medium">{errors.email.message}</span>}
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-900/50 border text-white text-sm outline-none transition-all duration-200
                    ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />
              </div>
              {errors.password && <span className="text-[10px] text-red-400 font-medium">{errors.password.message}</span>}
            </div>

            {/* Confirm Password field */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-900/50 border text-white text-sm outline-none transition-all duration-200
                    ${errors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                />
              </div>
              {errors.confirmPassword && <span className="text-[10px] text-red-400 font-medium">{errors.confirmPassword.message}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all duration-300 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-t-white border-white/30 rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-bold hover:underline">
              Log in here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
