'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Mic, Settings, Activity, Brain, History, Search, Plus, Trash2, 
  Stethoscope, Pill, Utensils, AlertTriangle, FileText, User, Calendar, 
  Shield, TrendingUp, CheckCircle, AlertCircle, Info, Upload, File, 
  Image, X, Download, Sparkles, Heart, Zap, Star, Award, Loader2,
  Paperclip, Camera, FileImage, FileType, Eye, EyeOff, LogOut,
  ChevronRight, ChevronLeft, ArrowRight, ArrowLeft, Droplets, Moon,
  Coffee, Cigarette, Wine, Target, Scale
} from 'lucide-react';
import { marked } from 'marked';
import { useRouter } from 'next/navigation';

// Firebase imports
import { doc, getDoc } from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebase-config';

// Cookie utilities for session persistence
import { 
  saveUserToCookies, 
  getUserFromCookies, 
  clearUserCookies 
} from '@/app/lib/auth-cookies';

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

// Enhanced Medical floating particles background
function MedicalParticles() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 60; i++) {
      newParticles.push({
        id: i,
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        animateX: Math.random() * 100,
        animateY: Math.random() * 100,
        duration: Math.random() * 40 + 30,
        delay: Math.random() * 15,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) {
    return <div className="absolute inset-0 overflow-hidden" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size + 'px',
            height: particle.size + 'px',
            background: `linear-gradient(45deg, rgba(59, 130, 246, ${particle.opacity}), rgba(147, 51, 234, ${particle.opacity * 0.7}))`,
            left: particle.initialX + '%',
            top: particle.initialY + '%',
          }}
          animate={{
            x: [(particle.animateX - particle.initialX) + 'vw',
                 (particle.initialX - particle.animateX) + 'vw',
                (particle.animateX - particle.initialX) + 'vw'],
            y: [(particle.animateY - particle.initialY) + 'vh',
                (particle.initialY - particle.animateY) + 'vh',
                 (particle.animateY - particle.initialY) + 'vh'],
            scale: [1, 1.3, 1, 0.7, 1],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity * 0.8, particle.opacity * 1.2, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear",
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0">
        <MedicalParticles />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
        >
          <Stethoscope className="w-12 h-12 text-white" />
        </motion.div>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"
        />
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Prompt Biotics
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-lg"
        >
          Loading your health profile...
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-1 mt-4"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            className="w-2 h-2 bg-blue-500 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            className="w-2 h-2 bg-blue-500 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            className="w-2 h-2 bg-blue-500 rounded-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// AUTHENTICATION COMPONENT
// ============================================================================

function AuthenticationFlow({ onAuthComplete }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      const userInfo = { 
        uid: user.uid,
        name: userData?.name || user.displayName || email.split('@')[0], 
        email: user.email 
      };
  
      // Save UID to cookies
      saveUserToCookies(user.uid);
      
      onAuthComplete(userInfo);
    } catch (error) {
      console.error('Login error:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection');
          break;
        default:
          setError('Login failed. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
        surveyCompleted: false
      });

      saveUserToCookies(user.uid);

      onAuthComplete({ 
        uid: user.uid,
        name: name, 
        email: email 
      });
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0">
        <MedicalParticles />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            >
              <Stethoscope className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Prompt Biotics</h1>
            <p className="text-sm text-gray-400">Advanced Medical Decision Support</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-900/60 rounded-xl">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all duration-300 ${
                isLogin 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all duration-300 ${
                !isLogin 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </motion.button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSignup}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// SURVEY COMPONENTS (Keep all your existing Step components)
// ============================================================================

// [Include all your Step components here: Step1BasicInfo, Step2Activity, Step3Medical, Step4Dietary, Step5Habits, Step6Additional]
// They should remain exactly as you have them

// Step 1: Basic Information
function Step1BasicInfo({ surveyData, updateSurveyData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-blue-500/20 border border-blue-500/40">
          <User className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Basic Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Age <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={surveyData.age || ''}
            onChange={(e) => updateSurveyData('age', e.target.value)}
            placeholder="Years"
            min="1"
            max="120"
            className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Gender <span className="text-red-400">*</span>
          </label>
          <select
            value={surveyData.gender || ''}
            onChange={(e) => updateSurveyData('gender', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Height (cm) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={surveyData.height || ''}
            onChange={(e) => updateSurveyData('height', e.target.value)}
            placeholder="170"
            min="50"
            max="250"
            className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Weight (kg) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={surveyData.weight || ''}
            onChange={(e) => updateSurveyData('weight', e.target.value)}
            placeholder="70"
            min="20"
            max="300"
            className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Target Weight Goal</label>
        <select
          value={surveyData.weightGoal || ''}
          onChange={(e) => updateSurveyData('weightGoal', e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
        >
          <option value="">Select goal</option>
          <option value="lose">Lose Weight</option>
          <option value="maintain">Maintain Weight</option>
          <option value="gain">Gain Weight</option>
        </select>
      </div>
    </div>
  );
}

// Step 2: Activity & Lifestyle
function Step2Activity({ surveyData, updateSurveyData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-emerald-500/20 border border-emerald-500/40">
          <Activity className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Activity & Lifestyle</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Activity Level <span className="text-red-400">*</span>
        </label>
        <select
          value={surveyData.activityLevel || ''}
          onChange={(e) => updateSurveyData('activityLevel', e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
        >
          <option value="">Select</option>
          <option value="sedentary">Sedentary (little to no exercise)</option>
          <option value="light">Light (1-3 days/week)</option>
          <option value="moderate">Moderate (3-5 days/week)</option>
          <option value="active">Active (6-7 days/week)</option>
          <option value="veryActive">Very Active (intense daily training)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Sleep Duration</label>
        <select
          value={surveyData.sleepDuration || ''}
          onChange={(e) => updateSurveyData('sleepDuration', e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
        >
          <option value="">Select average hours</option>
          <option value="<5">Less than 5 hours</option>
          <option value="5-6">5-6 hours</option>
          <option value="6-7">6-7 hours</option>
          <option value="7-8">7-8 hours</option>
          <option value="8+">8+ hours</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Occupation Type</label>
        <select
          value={surveyData.occupationType || ''}
          onChange={(e) => updateSurveyData('occupationType', e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
        >
          <option value="">Select</option>
          <option value="desk">Desk Job</option>
          <option value="standing">Standing/Walking</option>
          <option value="physical">Physical Labor</option>
          <option value="mixed">Mixed</option>
          <option value="student">Student</option>
          <option value="retired">Retired</option>
        </select>
      </div>
    </div>
  );
}

// Step 3: Medical Conditions
function Step3Medical({ surveyData, updateSurveyData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-red-500/20 border border-red-500/40">
          <Stethoscope className="w-6 h-6 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Medical History</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Existing Medical Conditions</label>
        <div className="space-y-2">
          {['Diabetes', 'Hypertension', 'Heart Disease', 'Thyroid Issues', 'PCOS', 'None'].map(condition => (
            <label key={condition} className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg hover:bg-slate-900/60 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={(surveyData.medicalConditions || []).includes(condition)}
                onChange={(e) => {
                  const current = surveyData.medicalConditions || [];
                  if (e.target.checked) {
                    updateSurveyData('medicalConditions', [...current, condition]);
                  } else {
                    updateSurveyData('medicalConditions', current.filter(c => c !== condition));
                  }
                }}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-sm text-gray-300">{condition}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Food Allergies or Intolerances</label>
        <textarea
          value={surveyData.allergies || ''}
          onChange={(e) => updateSurveyData('allergies', e.target.value)}
          placeholder="List any food allergies or intolerances (e.g., nuts, dairy, gluten)"
          rows={3}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none"
        />
      </div>
    </div>
  );
}

// Step 4: Dietary Preferences
function Step4Dietary({ surveyData, updateSurveyData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-orange-500/20 border border-orange-500/40">
          <Utensils className="w-6 h-6 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Dietary Preferences</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Diet Pattern <span className="text-red-400">*</span>
        </label>
        <select
          value={surveyData.dietPattern || ''}
          onChange={(e) => updateSurveyData('dietPattern', e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
        >
          <option value="">Select</option>
          <option value="omnivore">Omnivore (No restrictions)</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="pescatarian">Pescatarian</option>
          <option value="keto">Keto</option>
          <option value="paleo">Paleo</option>
          <option value="mediterranean">Mediterranean</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Meals Per Day</label>
        <select
          value={surveyData.mealsPerDay || ''}
          onChange={(e) => updateSurveyData('mealsPerDay', e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
        >
          <option value="">Select</option>
          <option value="2">2 meals</option>
          <option value="3">3 meals</option>
          <option value="4">4-5 meals</option>
          <option value="6+">6+ small meals</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Food Dislikes</label>
        <textarea
          value={surveyData.foodDislikes || ''}
          onChange={(e) => updateSurveyData('foodDislikes', e.target.value)}
          placeholder="List foods you dislike or prefer to avoid"
          rows={3}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none"
        />
      </div>
    </div>
  );
}

// Step 5: Current Habits
function Step5Habits({ surveyData, updateSurveyData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-purple-500/20 border border-purple-500/40">
          <Coffee className="w-6 h-6 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Current Habits</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Water Intake (Daily)</label>
        <select
          value={surveyData.waterIntake || ''}
          onChange={(e) => updateSurveyData('waterIntake', e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
        >
          <option value="">Select liters</option>
          <option value="<1">Less than 1 liter</option>
          <option value="1-2">1-2 liters</option>
          <option value="2-3">2-3 liters</option>
          <option value="3+">3+ liters</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Alcohol Consumption</label>
        <select
          value={surveyData.alcoholConsumption || ''}
          onChange={(e) => updateSurveyData('alcoholConsumption', e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
        >
          <option value="">Select</option>
          <option value="none">None</option>
          <option value="occasional">Occasional (1-2/week)</option>
          <option value="moderate">Moderate (3-4/week)</option>
          <option value="frequent">Frequent (daily)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Caffeine Intake (Daily)</label>
        <select
          value={surveyData.caffeineIntake || ''}
          onChange={(e) => updateSurveyData('caffeineIntake', e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
        >
          <option value="">Select cups</option>
          <option value="0">None</option>
          <option value="1-2">1-2 cups</option>
          <option value="3-4">3-4 cups</option>
          <option value="5+">5+ cups</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Cooking Frequency</label>
        <select
          value={surveyData.cookingFrequency || ''}
          onChange={(e) => updateSurveyData('cookingFrequency', e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
        >
          <option value="">Select</option>
          <option value="daily">Daily</option>
          <option value="often">Often (4-6 times/week)</option>
          <option value="sometimes">Sometimes (2-3 times/week)</option>
          <option value="rarely">Rarely</option>
          <option value="never">Never</option>
        </select>
      </div>
    </div>
  );
}

// Step 6: Additional Information
function Step6Additional({ surveyData, updateSurveyData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-amber-500/20 border border-amber-500/40">
          <Target className="w-6 h-6 text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Additional Information</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Current Medications</label>
        <textarea
          value={surveyData.medications || ''}
          onChange={(e) => updateSurveyData('medications', e.target.value)}
          placeholder="List any medications you're currently taking"
          rows={3}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Stress Level</label>
        <select
          value={surveyData.stressLevel || ''}
          onChange={(e) => updateSurveyData('stressLevel', e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
        >
          <option value="">Select</option>
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
          <option value="veryHigh">Very High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Digestive Issues</label>
        <textarea
          value={surveyData.digestiveIssues || ''}
          onChange={(e) => updateSurveyData('digestiveIssues', e.target.value)}
          placeholder="Describe any digestive issues or concerns"
          rows={3}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Specific Health Goals</label>
        <textarea
          value={surveyData.healthGoals || ''}
          onChange={(e) => updateSurveyData('healthGoals', e.target.value)}
          placeholder="What are your main health and nutrition goals?"
          rows={4}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none"
        />
      </div>
    </div>
  );
}

// ============================================================================
// MEDICAL SURVEY COMPONENT
// ============================================================================

function MedicalSurvey({ user, onSurveyComplete, onLogout }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [surveyData, setSurveyData] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const updateSurveyData = (field, value) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    const requiredFields = {
      1: ['age', 'gender', 'height', 'weight'],
      2: ['activityLevel'],
      3: [],
      4: ['dietPattern'],
      5: [],
      6: []
    };

    const required = requiredFields[currentStep] || [];
    for (const field of required) {
      if (!surveyData[field]) {
        setError(`Please fill in all required fields`);
        return false;
      }
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setSaving(true);
    setError('');

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        surveyData: surveyData,
        surveyCompleted: true,
        surveyCompletedAt: new Date().toISOString()
      });

      onSurveyComplete({ ...surveyData, user });
    } catch (error) {
      console.error('Error saving survey:', error);
      setError('Failed to save survey data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0">
        <MedicalParticles />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header with User Info */}
        <div className="p-6 bg-gradient-to-r from-slate-900/95 to-slate-900/90 backdrop-blur-xl border-b border-slate-700/60 shadow-xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{user.name}</h2>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 text-gray-300 rounded-xl transition-all duration-300 border border-slate-700/60"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </div>
        </div>

        {/* Survey Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-3">Medical & Dietary Assessment</h1>
              <p className="text-gray-400">Please provide detailed information to help us create your personalized diet plan</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-gray-400">{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full h-2 bg-slate-800/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-slate-800/60 to-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-8 shadow-xl"
              >
                {currentStep === 1 && (
                  <Step1BasicInfo surveyData={surveyData} updateSurveyData={updateSurveyData} />
                )}
                {currentStep === 2 && (
                  <Step2Activity surveyData={surveyData} updateSurveyData={updateSurveyData} />
                )}
                {currentStep === 3 && (
                  <Step3Medical surveyData={surveyData} updateSurveyData={updateSurveyData} />
                )}
                {currentStep === 4 && (
                  <Step4Dietary surveyData={surveyData} updateSurveyData={updateSurveyData} />
                )}
                {currentStep === 5 && (
                  <Step5Habits surveyData={surveyData} updateSurveyData={updateSurveyData} />
                )}
                {currentStep === 6 && (
                  <Step6Additional surveyData={surveyData} updateSurveyData={updateSurveyData} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={prevStep}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-800/60 hover:bg-slate-700/60 text-white rounded-xl transition-all duration-300 border border-slate-700/60 font-medium disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </motion.button>
              )}
              {currentStep < totalSteps ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextStep}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-medium disabled:opacity-50"
                >
                  Next Step
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 font-medium disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Complete Survey
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP COMPONENT WITH PROTECTED ROUTES
// ============================================================================

function ClinicalCDSSWithAuth() {
  const [appState, setAppState] = useState('loading'); // 'loading', 'auth', 'survey', 'chat'
  const [currentUser, setCurrentUser] = useState(null);
  const [surveyData, setSurveyData] = useState(null);
  const router = useRouter();

  // Check for existing session on component mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const savedUid = getUserFromCookies();
        
        if (!savedUid) {
          setAppState('auth');
          return;
        }

        // Verify user exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', savedUid));
        
        if (!userDoc.exists()) {
          clearUserCookies();
          setAppState('auth');
          return;
        }

        const userData = userDoc.data();
        const userInfo = {
          uid: savedUid,
          name: userData.name,
          email: userData.email
        };

        setCurrentUser(userInfo);

        // Check if survey is completed
        if (userData.surveyCompleted) {
          setAppState('chat');
          setSurveyData(userData.surveyData || {});
        } else {
          setAppState('survey');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        clearUserCookies();
        setAppState('auth');
      }
    };

    checkAuthState();
  }, []);

  const handleAuthComplete = (user) => {
    setCurrentUser(user);
    setAppState('survey');
  };

  const handleSurveyComplete = (data) => {
    setSurveyData(data);
    setAppState('chat');
    // Here you would typically redirect to your chat interface
    router.push('/chat');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      clearUserCookies();
      setCurrentUser(null);
      setSurveyData(null);
      setAppState('auth');
    }
  };

  // Render appropriate component based on app state
  if (appState === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <AnimatePresence mode="wait">
      {appState === 'auth' && (
        <AuthenticationFlow key="auth" onAuthComplete={handleAuthComplete} />
      )}
      {appState === 'survey' && currentUser && (
        <MedicalSurvey 
          key="survey"
          user={currentUser} 
          onSurveyComplete={handleSurveyComplete}
          onLogout={handleLogout}
        />
      )}
      {appState === 'chat' && (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-slate-800/60 to-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-8 shadow-xl"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Survey Completed!</h2>
              <p className="text-gray-400 mb-6">Redirecting to chat interface...</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/chat')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
              >
                Go to Chat
              </motion.button>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ClinicalCDSSWithAuth;