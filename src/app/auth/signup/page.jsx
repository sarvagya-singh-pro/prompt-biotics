'use client';


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, Activity, ShieldAlert, ArrowRight, ArrowLeft,
  CheckCircle2, Loader2, Database, User, FileText,
  Utensils, Moon, AlertCircle, Zap, Coffee, Target, Scale,
  Pill, Wine, Droplets, Info, LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- FIREBASE & UTILS IMPORTS ---
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase-config';
import { 
  saveUserToCookies, 
  getUserFromCookies, 
  clearUserCookies 
} from '@/app/lib/auth-cookies';

// --- THEME CONSTANTS ---
const THEME = {
  acid: '#D9FF00', // Primary Accent
  cyan: '#00F0FF', // Secondary Accent
  void: '#050505',
  dark: '#0A0A0A',
};

// --- VISUAL COMPONENTS ---

const NoiseOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04] mix-blend-overlay"
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }} 
  />
);

const MedicalParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 40; i++) {
      newParticles.push({
        id: i,
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: `linear-gradient(45deg, ${THEME.acid}, ${THEME.cyan})`,
            left: `${p.initialX}%`,
            top: `${p.initialY}%`,
            opacity: p.opacity
          }}
          animate={{
            y: [0, -100],
            opacity: [0, p.opacity, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay
          }}
        />
      ))}
    </div>
  );
};

// --- FORM UI COMPONENTS ---

const InputField = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase flex items-center gap-2">
      {Icon && <Icon className="w-3 h-3 text-[#D9FF00]" />} {label}
    </label>
    <div className="relative group">
      {/* FIXED: pointer-events-none prevents clicks from being blocked */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#D9FF00] to-transparent opacity-0 group-focus-within:opacity-10 transition-opacity rounded-lg blur-sm pointer-events-none" />
      <input 
        className={`relative z-10 w-full bg-[#111] border ${error ? 'border-red-500' : 'border-[#333]'} text-white px-4 py-3 rounded-lg font-mono text-sm focus:outline-none focus:border-[#D9FF00] transition-colors placeholder:text-gray-700`}
        {...props} 
      />
    </div>
    {error && <span className="text-xs text-red-400 font-mono">{error}</span>}
  </div>
);

const SelectField = ({ label, icon: Icon, options, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase flex items-center gap-2">
      {Icon && <Icon className="w-3 h-3 text-[#00F0FF]" />} {label}
    </label>
    <select 
      className="w-full bg-[#111] border border-[#333] text-white px-4 py-3 rounded-lg font-mono text-sm focus:outline-none focus:border-[#00F0FF] transition-colors appearance-none cursor-pointer"
      {...props}
    >
      <option value="">SELECT_OPTION...</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const AcidButton = ({ children, onClick, loading, disabled, variant = 'primary', className = "" }) => (
  <motion.button
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    disabled={loading || disabled}
    type={onClick ? "button" : "submit"} // Auto-detect type
    className={`
      w-full py-4 rounded-lg font-mono text-xs font-bold uppercase tracking-widest transition-all
      flex items-center justify-center gap-2
      ${variant === 'primary' 
        ? 'bg-[#D9FF00] text-black hover:bg-white hover:shadow-[0_0_20px_rgba(217,255,0,0.3)]' 
        : 'bg-transparent border border-[#333] text-gray-400 hover:border-white hover:text-white'}
      ${(loading || disabled) ? 'opacity-50 cursor-not-allowed' : ''}
      ${className}
    `}
  >
    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : children}
  </motion.button>
);

// --- AUTHENTICATION FLOW (FIREBASE INTEGRATED) ---

const AuthenticationFlow = ({ onAuthComplete }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        // Fetch extra data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        const userInfo = { 
          uid: user.uid,
          name: userData?.name || user.displayName || formData.email.split('@')[0], 
          email: user.email,
          surveyCompleted: userData?.surveyCompleted || false,
          surveyData: userData?.surveyData || null
        };
    
        saveUserToCookies(user.uid);
        onAuthComplete(userInfo);

      } else {
        // --- SIGNUP LOGIC ---
        // Validation
        if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match");
        if (formData.password.length < 6) throw new Error("Password must be 6+ chars");

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: formData.name });

        // Initialize User Doc
        await setDoc(doc(db, 'users', user.uid), {
          name: formData.name,
          email: formData.email,
          createdAt: new Date().toISOString(),
          surveyCompleted: false
        });

        saveUserToCookies(user.uid);
        
        onAuthComplete({ 
          uid: user.uid,
          name: formData.name, 
          email: formData.email,
          surveyCompleted: false 
        });
      }
    } catch (err) {
      console.error("Auth Error:", err);
      // Map Firebase errors to UI messages
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') setError("INVALID CREDENTIALS");
      else if (err.code === 'auth/email-already-in-use') setError("EMAIL ALREADY REGISTERED");
      else if (err.code === 'auth/too-many-requests') setError("TOO MANY ATTEMPTS. PAUSE.");
      else setError(err.message.replace('Firebase:', '').toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative z-10 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#D9FF00]/5 border border-[#D9FF00]/20 rounded-full flex items-center justify-center relative group">
             <div className="absolute inset-0 border border-[#D9FF00] rounded-full animate-ping opacity-20" />
             <Stethoscope className="w-8 h-8 text-[#D9FF00]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tighter">PROMPT_BIOTICS</h1>
          <p className="text-gray-500 font-mono text-[10px] tracking-widest">CLINICAL DECISION SUPPORT SYSTEM</p>
        </div>

        <div className="bg-[#0A0A0A]/90 backdrop-blur-xl border border-[#222] p-8 rounded-2xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-[#D9FF00] to-transparent" />
          
          <div className="flex gap-4 mb-8 bg-[#111] p-1 rounded-lg">
            <button 
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 rounded text-[10px] font-mono font-bold tracking-widest transition-all ${isLogin ? 'bg-[#222] text-[#D9FF00] shadow' : 'text-gray-600 hover:text-white'}`}
            >
              TERMINAL_ACCESS
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 rounded text-[10px] font-mono font-bold tracking-widest transition-all ${!isLogin ? 'bg-[#222] text-[#D9FF00] shadow' : 'text-gray-600 hover:text-white'}`}
            >
              NEW_PROFILE
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-mono flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <InputField 
                label="FULL NAME" 
                name="name"
                icon={User}
                placeholder="SARVAGYA SINGH" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            )}
            <InputField 
              label="EMAIL ADDRESS" 
              name="email"
              type="email"
              icon={FileText}
              placeholder="RESEARCHER@LAB.EDU" 
              value={formData.email}
              onChange={handleChange}
              required
            />
            <InputField 
              label="PASSWORD" 
              name="password"
              type="password"
              icon={ShieldAlert}
              placeholder="••••••••••••" 
              value={formData.password}
              onChange={handleChange}
              required
            />
            {!isLogin && (
               <InputField 
                label="CONFIRM PASSWORD" 
                name="confirmPassword"
                type="password"
                icon={ShieldAlert}
                placeholder="••••••••••••" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            )}
            
            <AcidButton loading={loading}>
              {isLogin ? 'INITIALIZE SYSTEM' : 'CREATE SEQUENCE'}
            </AcidButton>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// --- SURVEY STEPS ---

const Step1Basic = ({ data, update }) => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
    <div className="grid grid-cols-2 gap-4">
      <InputField label="AGE" type="number" value={data.age} onChange={e => update('age', e.target.value)} placeholder="YEARS" />
      <SelectField 
        label="GENDER" 
        value={data.gender} 
        onChange={e => update('gender', e.target.value)}
        options={[
          {value: 'male', label: 'MALE'},
          {value: 'female', label: 'FEMALE'},
          {value: 'other', label: 'OTHER'}
        ]}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <InputField label="HEIGHT (CM)" type="number" value={data.height} onChange={e => update('height', e.target.value)} placeholder="175" />
      <InputField label="WEIGHT (KG)" type="number" value={data.weight} onChange={e => update('weight', e.target.value)} placeholder="70" />
    </div>
    <SelectField 
        label="WEIGHT GOAL" 
        icon={Target}
        value={data.weightGoal} 
        onChange={e => update('weightGoal', e.target.value)}
        options={[
          {value: 'lose', label: 'LOSE WEIGHT'},
          {value: 'maintain', label: 'MAINTAIN WEIGHT'},
          {value: 'gain', label: 'GAIN WEIGHT'}
        ]}
      />
  </div>
);

const Step2Activity = ({ data, update }) => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
    <SelectField 
      label="ACTIVITY LEVEL" 
      icon={Activity}
      value={data.activityLevel} 
      onChange={e => update('activityLevel', e.target.value)}
      options={[
        {value: 'sedentary', label: 'SEDENTARY'},
        {value: 'light', label: 'LIGHT (1-3 days)'},
        {value: 'moderate', label: 'MODERATE (3-5 days)'},
        {value: 'active', label: 'ACTIVE (6-7 days)'},
        {value: 'athlete', label: 'ATHLETE (2x/day)'},
      ]}
    />
    <SelectField 
      label="SLEEP DURATION" 
      icon={Moon}
      value={data.sleepDuration} 
      onChange={e => update('sleepDuration', e.target.value)}
      options={[
        {value: '<5', label: '< 5 HOURS'},
        {value: '5-6', label: '5-6 HOURS'},
        {value: '7-8', label: '7-8 HOURS (OPTIMAL)'},
        {value: '>8', label: '> 8 HOURS'},
      ]}
    />
     <SelectField 
      label="OCCUPATION TYPE" 
      icon={User}
      value={data.occupation} 
      onChange={e => update('occupation', e.target.value)}
      options={[
        {value: 'desk', label: 'DESK JOB'},
        {value: 'standing', label: 'STANDING/WALKING'},
        {value: 'physical', label: 'HEAVY PHYSICAL LABOR'},
      ]}
    />
  </div>
);

const Step3Medical = ({ data, update }) => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
     <div className="space-y-3">
       <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase flex items-center gap-2">
          <span className="w-1 h-1 bg-[#FF3300]" /> DETECTED CONDITIONS
       </label>
       <div className="grid grid-cols-2 gap-3">
         {['Diabetes (T2DM)', 'Hypertension', 'Heart Disease', 'Thyroid', 'PCOS', 'None'].map(cond => (
           <label key={cond} className={`
              flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
              ${data.conditions.includes(cond) 
                ? 'bg-[#FF3300]/10 border-[#FF3300] text-[#FF3300]' 
                : 'bg-[#111] border-[#333] text-gray-400 hover:border-gray-500'}
           `}>
             <input 
               type="checkbox" 
               className="hidden"
               checked={data.conditions.includes(cond)}
               onChange={(e) => {
                 if(e.target.checked) update('conditions', [...data.conditions, cond]);
                 else update('conditions', data.conditions.filter(c => c !== cond));
               }}
             />
             <span className="text-xs font-mono uppercase">{cond}</span>
           </label>
         ))}
       </div>
     </div>
     <div className="space-y-2">
       <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase flex items-center gap-2">
         <AlertCircle className="w-3 h-3 text-[#FF3300]" /> ALLERGIES
       </label>
       <textarea 
         className="w-full bg-[#111] border border-[#333] text-white px-4 py-3 rounded-lg font-mono text-sm focus:outline-none focus:border-[#FF3300] transition-colors resize-none h-20"
         placeholder="NUTS, DAIRY, SHELLFISH..."
         value={data.allergies}
         onChange={e => update('allergies', e.target.value)}
       />
     </div>
  </div>
);

const Step4Dietary = ({ data, update }) => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
     <SelectField 
      label="DIETARY PATTERN" 
      icon={Utensils}
      value={data.dietPattern} 
      onChange={e => update('dietPattern', e.target.value)}
      options={[
        {value: 'omnivore', label: 'OMNIVORE'},
        {value: 'vegetarian', label: 'VEGETARIAN'},
        {value: 'vegan', label: 'VEGAN'},
        {value: 'keto', label: 'KETOGENIC'},
        {value: 'paleo', label: 'PALEO'},
        {value: 'mediterranean', label: 'MEDITERRANEAN'},
      ]}
    />
     <SelectField 
      label="MEAL FREQUENCY" 
      icon={Scale}
      value={data.mealsPerDay} 
      onChange={e => update('mealsPerDay', e.target.value)}
      options={[
        {value: '2', label: '2 MEALS (IF)'},
        {value: '3', label: '3 MEALS (Standard)'},
        {value: '4-5', label: '4-5 MEALS'},
        {value: '6', label: '6+ MEALS'},
      ]}
    />
    <div className="space-y-2">
       <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase flex items-center gap-2">
         <Info className="w-3 h-3 text-[#00F0FF]" /> FOOD DISLIKES
       </label>
       <textarea 
         className="w-full bg-[#111] border border-[#333] text-white px-4 py-3 rounded-lg font-mono text-sm focus:outline-none focus:border-[#00F0FF] transition-colors resize-none h-20"
         placeholder="MUSHROOMS, CILANTRO..."
         value={data.dislikes}
         onChange={e => update('dislikes', e.target.value)}
       />
     </div>
  </div>
);

const Step5Habits = ({ data, update }) => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
    <div className="grid grid-cols-2 gap-4">
      <SelectField 
        label="WATER INTAKE" 
        icon={Droplets}
        value={data.waterIntake} 
        onChange={e => update('waterIntake', e.target.value)}
        options={[
          {value: '<1', label: '< 1 LITER'},
          {value: '1-2', label: '1-2 LITERS'},
          {value: '2-3', label: '2-3 LITERS'},
          {value: '3+', label: '3+ LITERS'},
        ]}
      />
      <SelectField 
        label="CAFFEINE" 
        icon={Coffee}
        value={data.caffeine} 
        onChange={e => update('caffeine', e.target.value)}
        options={[
          {value: 'none', label: 'NONE'},
          {value: '1-2', label: '1-2 CUPS'},
          {value: '3-4', label: '3-4 CUPS'},
          {value: '5+', label: '5+ CUPS'},
        ]}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <SelectField 
        label="ALCOHOL" 
        icon={Wine}
        value={data.alcohol} 
        onChange={e => update('alcohol', e.target.value)}
        options={[
          {value: 'none', label: 'NONE'},
          {value: 'occasional', label: 'OCCASIONAL'},
          {value: 'moderate', label: 'MODERATE'},
          {value: 'frequent', label: 'FREQUENT'},
        ]}
      />
       <SelectField 
        label="COOKING" 
        icon={Utensils}
        value={data.cooking} 
        onChange={e => update('cooking', e.target.value)}
        options={[
          {value: 'daily', label: 'DAILY'},
          {value: 'often', label: 'OFTEN'},
          {value: 'rarely', label: 'RARELY'},
        ]}
      />
    </div>
  </div>
);

const Step6Additional = ({ data, update }) => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
    <div className="space-y-2">
       <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase flex items-center gap-2">
         <Pill className="w-3 h-3 text-[#D9FF00]" /> CURRENT MEDICATIONS LIST
       </label>
       <textarea 
         className="w-full bg-[#111] border border-[#333] text-white px-4 py-3 rounded-lg font-mono text-sm focus:outline-none focus:border-[#D9FF00] transition-colors resize-none h-24"
         placeholder="LISINOPRIL 10MG, METFORMIN 500MG..."
         value={data.medications}
         onChange={e => update('medications', e.target.value)}
       />
     </div>
     <SelectField 
        label="STRESS LEVEL" 
        icon={Zap}
        value={data.stress} 
        onChange={e => update('stress', e.target.value)}
        options={[
          {value: 'low', label: 'LOW'},
          {value: 'moderate', label: 'MODERATE'},
          {value: 'high', label: 'HIGH'},
          {value: 'severe', label: 'SEVERE'},
        ]}
      />
      <div className="space-y-2">
       <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase flex items-center gap-2">
         <Target className="w-3 h-3 text-[#00F0FF]" /> SPECIFIC HEALTH GOALS
       </label>
       <textarea 
         className="w-full bg-[#111] border border-[#333] text-white px-4 py-3 rounded-lg font-mono text-sm focus:outline-none focus:border-[#00F0FF] transition-colors resize-none h-24"
         placeholder="REDUCE A1C, LOWER BLOOD PRESSURE..."
         value={data.healthGoals}
         onChange={e => update('healthGoals', e.target.value)}
       />
     </div>
  </div>
);

// --- MEDICAL SURVEY WRAPPER ---

const MedicalSurvey = ({ user, onLogout, onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State init
  const [surveyData, setSurveyData] = useState({
    age: '', gender: '', height: '', weight: '', weightGoal: '', // Step 1
    activityLevel: '', sleepDuration: '', occupation: '', // Step 2
    conditions: [], allergies: '', // Step 3
    dietPattern: '', mealsPerDay: '', dislikes: '', // Step 4
    waterIntake: '', caffeine: '', alcohol: '', cooking: '', // Step 5
    medications: '', stress: '', healthGoals: '' // Step 6
  });

  const updateSurveyData = (field, value) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Basic validation logic
    if (step < totalSteps) setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // --- FIRESTORE SAVE LOGIC ---
      await updateDoc(doc(db, 'users', user.uid), {
        surveyData: surveyData,
        surveyCompleted: true,
        surveyCompletedAt: new Date().toISOString()
      });

      // Pass both data and user to complete
      onComplete({ ...surveyData, user });
    } catch (err) {
      console.error("Survey Save Error:", err);
      setError("FAILED TO UPLOAD CLINICAL DATA. RETRY.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* Header */}
      <div className="px-6 py-4 bg-[#0A0A0A]/90 backdrop-blur border-b border-[#222] flex justify-between items-center sticky top-0 z-50">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#D9FF00]/10 flex items-center justify-center font-bold text-[#D9FF00] border border-[#D9FF00]/30">
               {user.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{user.name || 'USER'}</h2>
              <p className="text-[10px] font-mono text-gray-500 uppercase">{user.email}</p>
            </div>
         </div>
         <button onClick={onLogout} className="text-xs font-mono text-gray-500 hover:text-white transition-colors flex items-center gap-2">
            <LogOut className="w-3 h-3" /> TERMINATE_SESSION
         </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
           {/* Progress Bar */}
           <div className="mb-12">
              <div className="flex justify-between items-end mb-2">
                 <h1 className="text-3xl font-bold text-white tracking-tight">CLINICAL INTAKE</h1>
                 <span className="font-mono text-[#D9FF00] text-xl">0{step}/0{totalSteps}</span>
              </div>
              <div className="h-1 bg-[#222] w-full rounded-full overflow-hidden">
                 <motion.div 
                   className="h-full bg-[#D9FF00]"
                   initial={{ width: 0 }}
                   animate={{ width: `${(step/totalSteps) * 100}%` }}
                 />
              </div>
           </div>

           {/* Dynamic Step Content */}
           <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-8 md:p-12 relative overflow-hidden min-h-[500px] flex flex-col shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                 <Database className="w-32 h-32 text-gray-500" />
              </div>
              
              <div className="flex-1">
                {error && (
                   <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-mono flex items-center gap-2">
                     <AlertCircle className="w-4 h-4" /> {error}
                   </div>
                )}
                <AnimatePresence mode="wait">
                  {step === 1 && <Step1Basic key="1" data={surveyData} update={updateSurveyData} />}
                  {step === 2 && <Step2Activity key="2" data={surveyData} update={updateSurveyData} />}
                  {step === 3 && <Step3Medical key="3" data={surveyData} update={updateSurveyData} />}
                  {step === 4 && <Step4Dietary key="4" data={surveyData} update={updateSurveyData} />}
                  {step === 5 && <Step5Habits key="5" data={surveyData} update={updateSurveyData} />}
                  {step === 6 && <Step6Additional key="6" data={surveyData} update={updateSurveyData} />}
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex gap-4 mt-12 pt-8 border-t border-[#333]">
                 <AcidButton 
                   variant="secondary" 
                   disabled={step === 1 || loading}
                   onClick={() => setStep(s => s - 1)}
                   className="flex-1"
                 >
                   <ArrowLeft className="w-4 h-4" /> PREVIOUS
                 </AcidButton>
                 
                 {step < totalSteps ? (
                   <AcidButton onClick={handleNext} className="flex-1">
                     NEXT PHASE <ArrowRight className="w-4 h-4" />
                   </AcidButton>
                 ) : (
                   <AcidButton onClick={handleSubmit} loading={loading} className="flex-1">
                     COMPILE DATASET <CheckCircle2 className="w-4 h-4" />
                   </AcidButton>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- LOADING SCREEN ---

const LoadingScreen = () => (
  <div className="min-h-screen bg-black flex items-center justify-center relative z-50">
    <div className="text-center">
       <div className="w-24 h-24 mx-auto mb-8 relative">
          <motion.div 
            className="absolute inset-0 border-t-2 border-[#D9FF00] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-2 border-t-2 border-[#00F0FF] rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <Stethoscope className="absolute inset-0 m-auto w-8 h-8 text-white opacity-50" />
       </div>
       <h2 className="text-white font-mono text-sm tracking-widest animate-pulse">INITIALIZING SYSTEM...</h2>
    </div>
  </div>
);

// --- MAIN APP COMPONENT (INTEGRATED) ---

export default function ClinicalCDSS() {
  const [appState, setAppState] = useState('loading'); // loading, auth, survey, dashboard
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  // --- RESTORE SESSION LOGIC ---
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const savedUid = getUserFromCookies();
        if (!savedUid) {
          setAppState('auth');
          return;
        }

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
          email: userData.email,
          surveyCompleted: userData.surveyCompleted
        };

        setCurrentUser(userInfo);
        setAppState(userData.surveyCompleted ? 'dashboard' : 'survey');
      } catch (error) {
        console.error("Session Restoration Error:", error);
        setAppState('auth');
      }
    };

    checkAuthState();
  }, []);

  const handleAuthComplete = (user) => {
    setCurrentUser(user);
    setAppState(user.surveyCompleted ? 'dashboard' : 'survey');
  };

  const handleSurveyComplete = (data) => {
    setAppState('dashboard');
    router.push('/chat'); // Redirect if you have a chat route
  };

  const handleLogout = () => {
    clearUserCookies();
    setCurrentUser(null);
    setAppState('auth');
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#D9FF00] selection:text-black">
      <NoiseOverlay />
      <MedicalParticles />
      
      <AnimatePresence mode="wait">
        {appState === 'loading' && (
          <motion.div key="loading" exit={{ opacity: 0 }}>
             <LoadingScreen />
          </motion.div>
        )}

        {appState === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <AuthenticationFlow onAuthComplete={handleAuthComplete} />
          </motion.div>
        )}

        {appState === 'survey' && currentUser && (
          <motion.div key="survey" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <MedicalSurvey 
               user={currentUser} 
               onLogout={handleLogout} 
               onComplete={handleSurveyComplete} 
             />
          </motion.div>
        )}

        {appState === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
             <div className="min-h-screen flex items-center justify-center relative z-10 px-4">
                <div className="bg-[#0A0A0A] border border-[#222] p-12 rounded-2xl text-center max-w-lg shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-[#D9FF00] to-transparent" />
                   <div className="w-20 h-20 bg-[#D9FF00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-[#D9FF00]" />
                   </div>
                   <h2 className="text-3xl font-bold text-white mb-4">PROFILE COMPILED</h2>
                   <p className="text-gray-400 mb-8 leading-relaxed">
                     Your clinical baseline has been established. The AI Reasoning Engine is now ready to assist you.
                   </p>
                   <div className="space-y-3">
                      <AcidButton onClick={() => router.push('/chat')}>
                        LAUNCH CONSOLE
                      </AcidButton>
                      <button onClick={handleLogout} className="text-xs font-mono text-gray-500 hover:text-white transition-colors">
                        CLOSE_SESSION
                      </button>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
