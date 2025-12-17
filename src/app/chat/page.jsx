'use client';

/**
 * PROMPT BIOTICS - ULTIMATE CLINICAL CONSOLE
 * ------------------------------------------
 * RESTORED COMPONENTS:
 * - Full API Context Logic
 * - ConfidenceDisplay & SafetyBadge
 * - MedicalContext & QuickActions
 * - Rich ClinicalMessage Rendering
 * - File Upload with Previews
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Mic, Settings, Activity, Brain, History, Search, Plus, Trash2, 
  Stethoscope, Pill, Utensils, AlertTriangle, FileText, User, Calendar, 
  Shield, TrendingUp, CheckCircle2, AlertCircle, Info, Upload, 
  Image, X, Sparkles, Zap, Star, Award, Loader2,
  Paperclip, FileImage, FileType, LogOut, ArrowLeft, ExternalLink, Scale, Target
} from 'lucide-react';
import { marked } from 'marked';
import { useRouter } from 'next/navigation';

// Firebase imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase-config';
import { clearUserCookies, getUserFromCookies } from '@/app/lib/auth-cookies';

// --- THEME CONSTANTS ---
const THEME = {
  acid: '#D9FF00', // Primary
  cyan: '#00F0FF', // Secondary
  void: '#050505',
  dark: '#0A0A0A',
  glass: 'rgba(20, 20, 20, 0.8)',
  border: 'rgba(255, 255, 255, 0.1)'
};

// --- VISUAL UTILS ---
const NoiseOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] mix-blend-overlay"
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }} 
  />
);

const MedicalParticles = () => {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.4 + 0.1,
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

// ============================================================================
// RESTORED UI COMPONENTS (STYLED)
// ============================================================================

// 1. Enhanced File Upload
function FileUpload({ onFileUpload, acceptedTypes = "image/*,.pdf,.doc,.docx,.txt", maxSize = 10 }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const validFiles = files.filter(file => file.size / (1024 * 1024) <= maxSize);
    const fileData = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    onFileUpload(fileData);
  };

  return (
    <motion.div
      className={`relative border border-dashed rounded-lg p-6 text-center transition-all cursor-pointer group mb-4 ${
        isDragging ? 'border-[#D9FF00] bg-[#D9FF00]/5' : 'border-[#333] bg-[#0A0A0A] hover:border-[#666]'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(Array.from(e.dataTransfer.files));
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input ref={fileInputRef} type="file" multiple accept={acceptedTypes} onChange={(e) => handleFiles(Array.from(e.target.files))} className="hidden" />
      <div className="w-12 h-12 rounded-full bg-[#111] border border-[#333] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
         <Upload className={`w-5 h-5 ${isDragging ? 'text-[#D9FF00]' : 'text-gray-400'}`} />
      </div>
      <p className="text-gray-300 font-mono text-xs tracking-wider">DROP FILES / CLICK TO SCAN</p>
      <p className="text-gray-600 text-[10px] mt-1 font-mono">MAX {maxSize}MB • SECURE UPLOAD</p>
    </motion.div>
  );
}

// 2. Confidence Display
// Enhanced Confidence Score Display (Restored from Old Version)
function ConfidenceDisplay({ confidence }) {
  if (!confidence) return null;

  const getConfidenceColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return { 
        text: 'text-emerald-400', 
        bg: 'bg-emerald-500/20', 
        border: 'border-emerald-500/40',
        glow: 'shadow-emerald-500/20',
        bar: 'from-emerald-400 to-emerald-600'
      };
      case 'moderate': return { 
        text: 'text-amber-400', 
        bg: 'bg-amber-500/20', 
        border: 'border-amber-500/40',
        glow: 'shadow-amber-500/20',
        bar: 'from-amber-400 to-amber-600'
      };
      case 'low': return { 
        text: 'text-rose-400', 
        bg: 'bg-rose-500/20', 
        border: 'border-rose-500/40',
        glow: 'shadow-rose-500/20',
        bar: 'from-rose-400 to-rose-600'
      };
      default: return { 
        text: 'text-slate-400', 
        bg: 'bg-slate-500/20', 
        border: 'border-slate-500/40',
        glow: 'shadow-slate-500/20',
        bar: 'from-slate-400 to-slate-600'
      };
    }
  };

  const getConfidenceIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return <Award className="w-4 h-4" />;
      case 'moderate': return <Star className="w-4 h-4" />;
      case 'low': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const colors = getConfidenceColor(confidence.confidence_level);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`mb-4 p-4 rounded-xl border backdrop-blur-sm ${colors.border} ${colors.bg} ${colors.glow} shadow-lg relative overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${colors.border} bg-black/20`}>
          <span className={colors.text}>{getConfidenceIcon(confidence.confidence_level)}</span>
          <span className={`text-xs font-bold font-mono uppercase ${colors.text}`}>
            {confidence.confidence_level} CONFIDENCE
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-white font-mono">
            {(confidence.overall_confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      
      {/* Component Scores */}
      <div className="space-y-3 relative z-10">
        {confidence.component_scores && Object.entries(confidence.component_scores).map(([key, value], index) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-gray-400">
              <span>{key.replace(/_/g, ' ')}</span>
              <span className={colors.text}>{(value * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${value * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={`h-full rounded-full bg-gradient-to-r ${colors.bar}`}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}


// 3. Safety Badge
function SafetyBadge({ safety }) {
  if (!safety || typeof safety.is_safe !== 'boolean') return null;
  const isSafe = safety.is_safe;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono border uppercase tracking-wide mb-3 ${
      isSafe 
        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
        : 'bg-red-500/10 border-red-500/50 text-red-400'
    }`}>
      {isSafe ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {safety.message}
    </div>
  );
}

// 4. Medical Context
function MedicalContext({ medicalContext, domain }) {
  if (!medicalContext) return null;
  return (
    <div className="mt-4 p-4 rounded-xl bg-[#111] border border-[#333] relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#00F0FF]" />
      <h3 className="text-xs font-bold text-[#00F0FF] mb-3 uppercase flex items-center gap-2">
        <Brain className="w-3 h-3" /> {domain} CONTEXT
      </h3>
      
      {medicalContext.safety_considerations?.length > 0 && (
        <div className="mb-3">
          <h4 className="text-[10px] text-gray-500 uppercase mb-2">Safety Protocols</h4>
          {medicalContext.safety_considerations.map((item, i) => (
            <div key={i} className="flex gap-2 text-xs text-gray-300 mb-1">
              <Shield className="w-3 h-3 text-red-400 shrink-0" /> {item}
            </div>
          ))}
        </div>
      )}

      {medicalContext.follow_up_recommendations?.length > 0 && (
        <div>
          <h4 className="text-[10px] text-gray-500 uppercase mb-2">Recommended Actions</h4>
          {medicalContext.follow_up_recommendations.map((item, i) => (
            <div key={i} className="flex gap-2 text-xs text-gray-300 mb-1">
              <TrendingUp className="w-3 h-3 text-[#D9FF00] shrink-0" /> {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 5. Typing Indicator
function ClinicalTypingIndicator() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-[#111] border border-[#333] w-fit mb-6">
      <Loader2 className="w-4 h-4 text-[#D9FF00] animate-spin" />
      <span className="text-xs font-mono text-[#D9FF00] animate-pulse">ANALYZING BIOMETRICS...</span>
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
            className="w-1 h-1 bg-[#00F0FF] rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

// 6. Quick Actions
function QuickActions({ onActionSelect }) {
  const actions = [
    { id: 'diet', label: 'DIET PROTOCOL', icon: Utensils, desc: 'Nutrition Plan' },
    { id: 'diagnosis', label: 'DIAGNOSTIC SCAN', icon: Stethoscope, desc: 'Symptom Check' },
    { id: 'prescription', label: 'MED CHECK', icon: Pill, desc: 'Interactions' },
    { id: 'alert', label: 'RISK ASSESS', icon: Shield, desc: 'Safety Audit' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onActionSelect(action.id)}
          className="group p-4 bg-[#111] border border-[#333] hover:border-[#D9FF00] hover:bg-[#D9FF00]/5 rounded-xl text-left transition-all"
        >
          <div className="w-8 h-8 rounded bg-[#222] group-hover:bg-[#D9FF00] group-hover:text-black flex items-center justify-center mb-2 transition-colors">
            <action.icon className="w-4 h-4 text-gray-400 group-hover:text-black" />
          </div>
          <div className="text-xs font-bold text-white font-mono">{action.label}</div>
          <div className="text-[10px] text-gray-500">{action.desc}</div>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// 7. Rich Clinical Message (FIXED & SECURED)
// Enhanced Clinical Message (With Fixed Sources & Text)
function ClinicalMessage({ text, message, isUser, apiResponse, messageType }) {
  const isAI = !isUser;
  // Handle both 'text' and 'message' props safely
  const rawContent = apiResponse?.response || text || message || '';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-8`}
    >
      <div className={`max-w-[90%] md:max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`
          p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden shadow-2xl
          ${isUser 
            ? 'bg-[#111] border-[#333] text-gray-200' 
            : 'bg-[#0A0A0A]/90 border-[#333] text-gray-300'}
        `}>
          
          {/* AI Header Info */}
          {isAI && (
            <>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#D9FF00] to-[#00F0FF] opacity-80" />
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222]">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#D9FF00]" />
                  <span className="text-xs font-mono text-[#D9FF00] tracking-widest uppercase">
                    {apiResponse?.domain || 'CLINICAL_CORE'}
                  </span>
                </div>
                {apiResponse?.processing_time && (
                   <span className="flex items-center gap-1 text-[10px] font-mono text-gray-500">
                     <Zap className="w-3 h-3" /> {Number(apiResponse.processing_time).toFixed(2)}s
                   </span>
                )}
              </div>
            </>
          )}

          {/* Safety & Confidence */}
          {isAI && apiResponse?.safety && <SafetyBadge safety={apiResponse.safety} />}
          {isAI && apiResponse?.confidence && <ConfidenceDisplay confidence={apiResponse.confidence} />}

          {/* Main Text Content */}
          <div 
            className="prose prose-invert prose-sm max-w-none font-sans 
            prose-headings:font-mono prose-headings:text-white prose-headings:uppercase
            prose-strong:text-[#D9FF00] prose-code:text-[#00F0FF] prose-a:text-[#00F0FF] prose-a:underline"
            dangerouslySetInnerHTML={{ 
              __html: marked.parse(String(rawContent)) 
            }}
          />

          {/* Medical Context Box */}
          {isAI && apiResponse?.medical_context && (
            <MedicalContext medicalContext={apiResponse.medical_context} domain={apiResponse.domain} />
          )}

          {/* RESTORED SOURCES SECTION */}
          {isAI && apiResponse?.sources?.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[#222]">
              <h4 className="text-[10px] font-mono text-gray-500 mb-3 uppercase flex items-center gap-2">
                <FileText className="w-3 h-3" /> VERIFIED MEDICAL SOURCES ({apiResponse.sources.length})
              </h4>
              
              <div className="grid gap-2">
                {apiResponse.sources.slice(0, 5).map((source, i) => (
                  <div key={i} className="bg-[#111] p-3 rounded border border-[#222] hover:border-[#333] transition-colors flex gap-3 group">
                    <span className="text-[#D9FF00] font-mono text-xs mt-0.5">[{i+1}]</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-0.5">
                          {source.source_type || 'General Reference'}
                        </p>
                        {source.relevance_score && (
                           <span className="text-[10px] text-gray-600 bg-black/30 px-1.5 py-0.5 rounded border border-[#333]">
                             {(source.relevance_score * 100).toFixed(0)}% RELEVANT
                           </span>
                        )}
                      </div>
                      
                      <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-1.5">
                        {source.content}
                      </p>

                      {/* Clickable Link Logic */}
                      {source.source_url && source.source_url !== '' ? (
                        <a 
                          href={source.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#00F0FF] hover:text-white hover:underline flex items-center gap-1 w-fit transition-colors"
                        >
                          OPEN SOURCE <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-gray-600 italic flex items-center gap-1">
                          Offline Reference <Shield className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-[#333] bg-[#0A0A0A] shadow-lg shrink-0 ${isUser ? 'order-1 mr-4' : 'order-2 ml-4'}`}>
        {isUser ? <User className="w-5 h-5 text-gray-400" /> : <Activity className="w-5 h-5 text-[#D9FF00]" />}
      </div>
    </motion.div>
  );
}


// ============================================================================
// MAIN PAGE LOGIC
// ============================================================================

export default function ClinicalConsole() {
  const router = useRouter();
  
  // State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  
  const messagesEndRef = useRef(null);

  // API Config
  const API_URL = 'https://healthcare-ai-729813973979.us-central1.run.app/api/query';
  const API_KEY = 'aslka@kasdmSw12'; 

  // 1. Auth & Data Loading
  useEffect(() => {
    const init = async () => {
      const uid = getUserFromCookies();
      if (!uid) { router.push('/'); return; }
      
      try {
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCurrentUser({ uid, ...data });
          setUserData(data.surveyData);
          
          setMessages([{
            text: `**SYSTEM INITIALIZED.**\nWelcome  ${data.name || 'User'}. \nPatient clinical profile loaded. Select a protocol or enter query.`,
            isUser: false,
            messageType: 'system'
          }]);
        }
      } catch (e) {
        console.error("Auth Error", e);
      }
    };
    init();
  }, [router]);

  // 2. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 3. Context Builder Logic (From original file)
  const buildPatientContext = () => {
    if (!userData) return '';
    return `
      PATIENT PROFILE:
      Age: ${userData.age || '?'} | Gender: ${userData.gender || '?'}
      Height: ${userData.height}cm | Weight: ${userData.weight}kg
      Conditions: ${(userData.conditions || []).join(', ')}
      Medications: ${userData.medications || 'None'}
      Allergies: ${userData.allergies || 'None'}
      Diet: ${userData.dietPattern} | Activity: ${userData.activityLevel}
      Health Goals: ${userData.healthGoals}
    `;
  };

  // 4. Send Logic
const handleSend = async (overrideInput = null) => {
  const textToSend = overrideInput || input;
  // Don't send if empty and no files
  if ((!textToSend.trim() && uploadedFiles.length === 0) || isTyping) return;

  const currentFiles = [...uploadedFiles];
  
  // UI Updates immediately
  setInput('');
  setUploadedFiles([]);
  setShowFileUpload(false);
  
  const newMessages = [...messages, { 
    text: textToSend || "Files attached for analysis", 
    isUser: true,
    files: currentFiles.length > 0 ? currentFiles.map(f => ({ name: f.name, type: f.type })) : undefined
  }];
  
  setMessages(newMessages);
  setIsTyping(true);

  try {
    // --- 1. BUILD CONVERSATION HISTORY (Last 10 messages) ---
    const conversationHistory = newMessages.slice(-10).map(msg => {
      const role = msg.isUser ? 'User' : 'Assistant';
      const content = msg.text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1')     // Remove italic
        .replace(/\n+/g, ' ')            // Replace newlines
        .trim();
      return `${role}: ${content}`;
    }).join('\n');

    // --- 2. BUILD PATIENT CONTEXT (From userData) ---
    const context = [];
    if (userData?.age) context.push(`Age: ${userData.age} years`);
    if (userData?.gender) context.push(`Gender: ${userData.gender}`);
    if (userData?.height) context.push(`Height: ${userData.height} cm`);
    if (userData?.weight) context.push(`Weight: ${userData.weight} kg`);
    
    // BMI
    if (userData?.height && userData?.weight) {
      const bmi = (userData.weight / ((userData.height / 100) ** 2)).toFixed(1);
      context.push(`BMI: ${bmi} (${getBMICategory(bmi)})`);
    }
    
    // Medical Info
    if (userData?.conditions?.length > 0) context.push(`Medical Conditions: ${userData.conditions.join(', ')}`);
    if (userData?.allergies) context.push(`Allergies: ${userData.allergies}`);
    if (userData?.medications) context.push(`Medications: ${userData.medications}`);
    if (userData?.dietPattern) context.push(`Diet: ${userData.dietPattern}`);
    if (userData?.healthGoals) context.push(`Health goals: ${userData.healthGoals}`);

    const patientContext = context.join('\n');

    // --- 3. CONSTRUCT ENHANCED QUERY ---
    let enhancedQuery = `PATIENT INFO\n${patientContext}\n\nConversation History:\n${conversationHistory}\n\nCurrent query: ${textToSend}`;

    if (currentFiles.length > 0) {
      const fileInfo = currentFiles.map(f => `File: ${f.name} (${f.type})`).join(', ');
      enhancedQuery += `\n\nATTACHED FILES: ${fileInfo}`;
    }

    // --- 4. PREPARE PATIENT INFO OBJECT (Cleaned) ---
    const rawPatientInfo = {
      age: userData?.age,
      gender: userData?.gender,
      conditions: userData?.conditions,
      current_mode: 'clinical_analysis' // Important for API routing
    };
    
    // Remove null/undefined values
    const filteredPatientInfo = Object.fromEntries(
      Object.entries(rawPatientInfo).filter(([_, v]) => v != null && v !== '')
    );

    console.log("🚀 Sending Payload:", { question: enhancedQuery, patient_info: filteredPatientInfo });

    // --- 5. API CALL ---
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      },
      body: JSON.stringify({
        question: enhancedQuery,
        patient_info: filteredPatientInfo
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const result = data.output || data;

    // --- 6. HANDLE SUCCESS ---
    setMessages(prev => [...prev, {
      text: result.answer || result.response,
      isUser: false,
      apiResponse: {
        response: result.answer || result.response,
        domain: result.expert_type || result.domain,
        confidence: result.confidence,
        sources: result.sources || [],
        safety: result.safety || result.safety_assessment, // Handle legacy format
        medical_context: result.medical_context,
        processing_time: result.processing_time || result.processing_time_seconds
      }
    }]);

  } catch (error) {
    console.error("API Call Failed:", error);
    setMessages(prev => [...prev, {
      text: `⚠️ **SYSTEM ALERT**: Connection Failed. \n\n${error.message}`,
      isUser: false,
      messageType: 'alert'
    }]);
  } finally {
    setIsTyping(false);
  }
};
const getBMICategory = (bmi) => {
  const bmiValue = parseFloat(bmi);
  if (bmiValue < 18.5) return 'Underweight';
  if (bmiValue < 25) return 'Normal weight';
  if (bmiValue < 30) return 'Overweight';
  return 'Obese';
};


  if (!currentUser) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#D9FF00] font-mono">
      <Loader2 className="animate-spin mr-2" /> ACCESSING SECURE RECORDS...
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-[#D9FF00] selection:text-black overflow-hidden relative">
      <NoiseOverlay />
      <MedicalParticles />

      {/* SIDEBAR */}
      <div className="hidden md:flex w-72 border-r border-[#222] bg-[#0A0A0A]/90 backdrop-blur flex-col z-20">
        <div className="p-6 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D9FF00]/10 border border-[#D9FF00]/20 flex items-center justify-center animate-pulse">
              <Activity className="w-5 h-5 text-[#D9FF00]" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wider">PROMPT_BIOTICS</h1>
              <p className="text-[10px] text-gray-500 font-mono">CLINICAL OS V3.0</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-5 overflow-y-auto">
          <div className="mb-6">
            <p className="text-[10px] font-mono text-gray-500 mb-3 uppercase tracking-widest">Active Patient</p>
            <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-3 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-20"><User className="w-12 h-12" /></div>
               <div>
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="font-mono text-sm">{currentUser.name}</div>
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <div>
                    <div className="text-xs text-gray-500">Age</div>
                    <div className="font-mono">{userData?.age || 'N/A'}</div>
                 </div>
                 <div>
                    <div className="text-xs text-gray-500">BMI</div>
                    <div className="font-mono text-[#D9FF00]">
                      {userData?.weight && userData?.height 
                        ? (userData.weight / ((userData.height/100)**2)).toFixed(1) 
                        : '--'}
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#222]">
           <button onClick={() => { clearUserCookies(); router.push('/'); }} className="w-full flex items-center justify-center gap-2 p-3 rounded hover:bg-red-900/20 text-gray-500 hover:text-red-400 transition-colors text-xs font-mono border border-transparent hover:border-red-900/30">
             <LogOut className="w-3 h-3" /> SECURE LOGOUT
           </button>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative z-10 bg-gradient-to-b from-[#0A0A0A] to-[#050505]">
        {/* Header */}
        <header className="h-16 border-b border-[#222] bg-[#0A0A0A]/50 backdrop-blur flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#D9FF00] animate-pulse" />
            <span className="text-xs font-mono text-gray-400 tracking-widest">LIVE_SESSION</span>
          </div>
          <span className="text-xs font-mono text-[#00F0FF]">{new Date().toLocaleTimeString()}</span>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#333]">
          <div className="max-w-4xl mx-auto">
            {/* Quick Actions (Only show if empty or just system msg) */}
            {messages.length <= 1 && (
              <QuickActions onActionSelect={(id) => handleSend(`Initiate ${id} protocol for current patient.`)} />
            )}

            {messages.map((m, i) => (
              <ClinicalMessage key={i} {...m} />
            ))}
            
            {isTyping && <ClinicalTypingIndicator />}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-[#0A0A0A] border-t border-[#222] shrink-0">
          <div className="max-w-4xl mx-auto space-y-4">
            
            <AnimatePresence>
              {showFileUpload && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <FileUpload 
                    onFileUpload={(files) => {
                      setUploadedFiles(prev => [...prev, ...files]);
                      setShowFileUpload(false);
                    }} 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Uploaded Pills */}
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map(f => (
                  <div key={f.id} className="bg-[#111] border border-[#333] px-3 py-1.5 rounded text-xs flex items-center gap-2 text-[#D9FF00]">
                    <Paperclip className="w-3 h-3" /> {f.name}
                    <button onClick={() => setUploadedFiles(prev => prev.filter(p => p.id !== f.id))}>
                      <X className="w-3 h-3 hover:text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D9FF00] to-[#00F0FF] opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity rounded-xl pointer-events-none" />
              <div className="bg-[#111] border border-[#333] rounded-xl flex items-end p-2 relative z-10 transition-colors group-focus-within:border-[#444] shadow-lg">
                <button 
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className={`p-3 rounded-lg hover:bg-[#222] transition-colors ${showFileUpload ? 'text-[#D9FF00]' : 'text-gray-400'}`}
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                  placeholder="Enter clinical query or attach reports..."
                  className="flex-1 bg-transparent border-none text-white p-3 max-h-32 min-h-[48px] resize-none focus:ring-0 placeholder:text-gray-600 font-mono text-sm"
                  rows={1}
                />

                <button 
                  onClick={() => handleSend()}
                  disabled={isTyping || (!input && uploadedFiles.length === 0)}
                  className={`p-3 rounded-lg transition-all ${
                    input || uploadedFiles.length > 0 
                      ? 'bg-[#D9FF00] text-black hover:bg-white shadow-[0_0_15px_rgba(217,255,0,0.3)]' 
                      : 'bg-[#222] text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-gray-600 font-mono uppercase">
               <span>AI-Assisted Clinical Decision Support</span>
               <span>v2.4.0 • Secure Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
