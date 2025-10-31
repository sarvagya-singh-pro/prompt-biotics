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
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebase-config';
import { clearUserCookies, getUserFromCookies } from '@/app/lib/auth-cookies';

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

// Enhanced File Upload Component
function FileUpload({ onFileUpload, acceptedTypes = "image/*,.pdf,.doc,.docx,.txt", maxSize = 10 }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const sizeInMB = file.size / (1024 * 1024);
      return sizeInMB <= maxSize;
    });

    if (validFiles.length !== files.length) {
      alert(`Some files were too large. Maximum size is ${maxSize}MB.`);
    }

    const fileData = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setUploadedFiles(prev => [...prev, ...fileData]);
    onFileUpload(fileData);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      const removed = prev.find(f => f.id === fileId);
      if (removed && removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <FileImage className="w-5 h-5" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <FileType className="w-5 h-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${
          isDragging 
            ? 'border-blue-400 bg-blue-500/10 scale-105' 
            : 'border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <motion.div
          animate={{
            y: isDragging ? -5 : 0,
            scale: isDragging ? 1.1 : 1
          }}
          className="space-y-3"
        >
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-medium">
              {isDragging ? 'Drop files here' : 'Upload medical files'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Drag & drop or click to browse • Max {maxSize}MB
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Supports images, PDFs, documents
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
          >
            {uploadedFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-lg border border-slate-700"
              >
                <div className="text-blue-400">
                  {getFileIcon(file.type)}
                </div>
                {file.preview && (
                  <img 
                    src={file.preview} 
                    alt="Preview" 
                    className="w-10 h-10 object-cover rounded border border-slate-600"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{file.name}</p>
                  <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
                </div>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="p-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced Confidence Score Display Component
function ConfidenceDisplay({ confidence }) {
  const getConfidenceColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return { 
        text: 'text-emerald-400', 
        bg: 'bg-emerald-500/20', 
        border: 'border-emerald-500/40',
        glow: 'shadow-emerald-500/20'
      };
      case 'moderate': return { 
        text: 'text-amber-400', 
        bg: 'bg-amber-500/20', 
        border: 'border-amber-500/40',
        glow: 'shadow-amber-500/20'
      };
      case 'low': return { 
        text: 'text-rose-400', 
        bg: 'bg-rose-500/20', 
        border: 'border-rose-500/40',
        glow: 'shadow-rose-500/20'
      };
      default: return { 
        text: 'text-slate-400', 
        bg: 'bg-slate-500/20', 
        border: 'border-slate-500/40',
        glow: 'shadow-slate-500/20'
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
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`mb-4 p-4 rounded-xl bg-gradient-to-r from-slate-800/40 to-slate-800/60 border backdrop-blur-sm ${colors.border} ${colors.glow} shadow-lg`}
    >
      <div className="flex items-center justify-between mb-3">
        <motion.div 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${colors.bg} ${colors.border} ${colors.text}`}
          whileHover={{ scale: 1.05 }}
        >
          {getConfidenceIcon(confidence.confidence_level)}
          <span className="text-sm font-semibold">{confidence.confidence_level} Confidence</span>
        </motion.div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">
            {(confidence.overall_confidence * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400">Overall Score</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(confidence.component_scores).map(([key, value], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-300 capitalize">
                {key.replace('_', ' ')}
              </span>
              <span className="text-sm font-bold text-blue-400">
                {(value * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <motion.div
                className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${value * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Enhanced Safety Badge Component
function SafetyBadge({ safety }) {
  if (!safety || typeof safety.is_safe !== 'boolean') {
    return null;
  }

  const safetyConfig = safety.is_safe ? {
    icon: CheckCircle,
    colors: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    glow: 'shadow-emerald-500/20'
  } : {
    icon: AlertTriangle,
    colors: 'bg-rose-500/20 border-rose-500/40 text-rose-400',
    glow: 'shadow-rose-500/20'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm ${safetyConfig.colors} ${safetyConfig.glow} shadow-lg`}
    >
      <safetyConfig.icon className="w-4 h-4" />
      <span>{safety.message}</span>
    </motion.div>
  );
}

// Enhanced Medical Context Component
function MedicalContext({ medicalContext, domain }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mt-5 p-5 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-800/80 border border-slate-700/60 backdrop-blur-sm shadow-lg"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-blue-500/20 border border-blue-500/40">
          <Brain className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white capitalize">{domain} Clinical Context</h3>
          <p className="text-xs text-gray-400">Evidence-based recommendations</p>
        </div>
      </div>

      <div className="space-y-4">
        {medicalContext.safety_considerations?.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400" />
              Safety Considerations
            </h4>
            <div className="space-y-2">
              {medicalContext.safety_considerations.map((consideration, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg"
                >
                  <div className="w-2 h-2 bg-rose-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-gray-300 leading-relaxed">{consideration}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {medicalContext.follow_up_recommendations?.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Follow-up Recommendations
            </h4>
            <div className="space-y-2">
              {medicalContext.follow_up_recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
                >
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-gray-300 leading-relaxed">{recommendation}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Enhanced Clinical Message Component
function ClinicalMessage({ message, isUser, apiResponse = null, messageType = 'general', delay = 0 }) {
  const getMessageIcon = () => {
    if (apiResponse?.domain) {
      switch (apiResponse.domain) {
        case 'prescription': return <Pill className="w-5 h-5 text-amber-400" />;
        case 'nutrition': return <Utensils className="w-5 h-5 text-orange-400" />;
        case 'diagnosis': return <Stethoscope className="w-5 h-5 text-blue-400" />;
        case 'safety': return <AlertTriangle className="w-5 h-5 text-rose-400" />;
        default: return <Brain className="w-5 h-5 text-blue-400" />;
      }
    }
    switch (messageType) {
      case 'prescription': return <Pill className="w-5 h-5 text-amber-400" />;
      case 'diet': return <Utensils className="w-5 h-5 text-orange-400" />;
      case 'diagnosis': return <Stethoscope className="w-5 h-5 text-blue-400" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      default: return <Brain className="w-5 h-5 text-blue-400" />;
    }
  };

  const getMessageBorder = () => {
    if (apiResponse?.domain) {
      switch (apiResponse.domain) {
        case 'prescription': return 'border-amber-400/40';
        case 'nutrition': return 'border-orange-400/40';
        case 'diagnosis': return 'border-blue-400/40';
        case 'safety': return 'border-rose-400/40';
        default: return 'border-blue-400/40';
      }
    }
    switch (messageType) {
      case 'prescription': return 'border-amber-400/40';
      case 'diet': return 'border-orange-400/40';
      case 'diagnosis': return 'border-blue-400/40';
      case 'alert': return 'border-rose-400/40';
      default: return 'border-blue-400/40';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-8`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        <motion.div
          whileHover={{ scale: 1.01, y: -2 }}
          transition={{ duration: 0.2 }}
          className={`p-6 rounded-2xl backdrop-blur-xl border transition-all duration-500 shadow-xl relative overflow-hidden ${
            isUser
               ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/60 text-white ml-4 shadow-slate-900/40'
               : `bg-gradient-to-br from-white/5 to-white/10 ${getMessageBorder()} text-gray-100 mr-4 shadow-black/20`
          }`}
        >
          {/* Subtle glow effect for AI messages */}
          {!isUser && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl" />
          )}
          
          {!isUser && apiResponse && (
            <div className="relative mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-full bg-blue-500/20 border border-blue-500/40">
                    {getMessageIcon()}
                  </div>
                  <div>
                    <span className="font-semibold text-white capitalize">
                      {apiResponse.domain || messageType} Analysis
                    </span>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(apiResponse.timestamp).toLocaleTimeString()}
                      {apiResponse.processing_time && (
                        <>
                          <span>•</span>
                          <Zap className="w-3 h-3" />
                          {apiResponse.processing_time.toFixed(2)}s
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <SafetyBadge safety={apiResponse.safety} />
            </div>
          )}

          {!isUser && apiResponse?.confidence && (
            <ConfidenceDisplay confidence={apiResponse.confidence} />
          )}

          <div 
            className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-code:text-blue-300 prose-pre:bg-slate-900/60 prose-pre:border prose-pre:border-slate-700"
            dangerouslySetInnerHTML={{ __html: marked.parse(apiResponse?.response || message) }}
          />

          {!isUser && apiResponse?.medical_context && (
            <MedicalContext
               medicalContext={apiResponse.medical_context}
               domain={apiResponse.domain}
            />
          )}
        </motion.div>
      </div>
      
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: delay + 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl ${
          isUser 
            ? 'order-1 bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 shadow-slate-900/40' 
            : 'order-2 bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/40'
        }`}
      >
        {isUser ? (
          <User className="w-6 h-6 text-slate-300" />
        ) : (
          <Brain className="w-6 h-6 text-white" />
        )}
      </motion.div>
    </motion.div>
  );
}

// Enhanced Clinical Analysis Typing Indicator
function ClinicalTypingIndicator() {
  const dots = [];
  for (let i = 0; i < 4; i++) {
    dots.push(
      <motion.div
        key={i}
        animate={{
           y: [0, -8, 0],
          opacity: [0.4, 1, 0.4],
          scale: [1, 1.2, 1]
         }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeInOut"
        }}
        className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
      />
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="flex justify-start mb-8"
    >
      <motion.div
         animate={{
           boxShadow: [
            '0 0 30px rgba(59, 130, 246, 0.1)',
             '0 0 50px rgba(59, 130, 246, 0.3)',
             '0 0 30px rgba(59, 130, 246, 0.1)'
          ]
         }}
        transition={{ duration: 3, repeat: Infinity }}
        className="flex items-center space-x-4 bg-gradient-to-r from-slate-800/80 to-slate-800/60 border border-blue-500/30 p-5 rounded-2xl backdrop-blur-xl shadow-xl relative overflow-hidden"
      >
        {/* Animated background gradient */}
        <motion.div
          animate={{
            background: [
              'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
              'linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))'
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl"
        />
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="relative z-10"
        >
          <Loader2 className="w-6 h-6 text-blue-400" />
        </motion.div>
        <div className="flex space-x-1.5 relative z-10">
          {dots}
        </div>
        <span className="text-gray-300 text-sm font-medium relative z-10">
          Analyzing clinical data with AI...
        </span>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative z-10"
        >
          <Sparkles className="w-5 h-5 text-purple-400" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Enhanced Quick Action Buttons Component
function QuickActions({ onActionSelect }) {
  const actions = [
    { id: 'diet', label: 'Diet Planning', icon: Utensils, color: 'orange', description: 'Personalized nutrition' },
    { id: 'diagnosis', label: 'Diagnostic Support', icon: Stethoscope, color: 'blue', description: 'AI-powered analysis' },
    { id: 'prescription', label: 'Medication Review', icon: Pill, color: 'amber', description: 'Drug interactions' },
    { id: 'alert', label: 'Safety Check', icon: AlertTriangle, color: 'rose', description: 'Risk assessment' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      className="mb-8"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Quick Actions
        </h3>
        <p className="text-sm text-gray-400">Choose a specialized analysis mode</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              boxShadow: `0 20px 40px rgba(59, 130, 246, 0.3)`
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onActionSelect(action.id)}
            className={`group relative p-5 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-800/80 border border-blue-500/30 backdrop-blur-md hover:border-blue-400/50 transition-all duration-500 shadow-lg overflow-hidden`}
          >
            {/* Animated background glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              animate={{
                background: [
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent)',
                  'linear-gradient(135deg, transparent, rgba(59, 130, 246, 0.1))',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="relative z-10">
              <motion.div
                whileHover={{ rotate: 10 }}
                className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg`}
              >
                <action.icon className="w-6 h-6 text-white" />
              </motion.div>
              
              <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-white transition-colors">
                {action.label}
              </h4>
              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                {action.description}
              </p>
            </div>

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
              style={{
                transform: 'skewX(-20deg)',
              }}
            />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN CHAT INTERFACE WITH API INTEGRATION
// ============================================================================

function ClinicalCDSSChat() {
  const [messages, setMessages] = useState([
    {
      text: "👋 Welcome to **Prompt Biotics**! I'm your AI medical assistant, ready to help with:\n\n🔬 **Diagnostic Analysis** - Symptom evaluation and differential diagnosis\n💊 **Medication Review** - Drug interactions and safety checks  \n🥗 **Nutrition Planning** - Personalized dietary recommendations\n📋 **Risk Assessment** - Safety evaluations and clinical guidelines\n\nHow can I assist you with your clinical needs today?",
      isUser: false,
      messageType: 'general'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState('general');
  const [apiError, setApiError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: '',
    conditions: []
  });
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const router = useRouter();

  // In-memory storage for demo
  const [memoryStorage, setMemoryStorage] = useState({});
  const mockLocalStorage = {
    getItem: (key) => memoryStorage[key] || null,
    setItem: (key, value) => {
      setMemoryStorage(prev => ({ ...prev, [key]: value }));
    }
  };

  // API configuration
  const API_URL = 'https://healthcare-ai-service-729813973979.us-central1.run.app/api/query';
  const API_KEY = 'aslka@kasdmSw12';

  // Load chat history and user data
  useEffect(() => {
    const savedHistory = JSON.parse(mockLocalStorage.getItem('clinicalChatHistory') || '[]');
    setChatHistory(savedHistory);
  }, []);

  // Check authentication and load user data
  useEffect(() => {
    const checkAuth = async () => {
      const savedUid = getUserFromCookies();
      
      if (!savedUid) {
        router.push('/');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', savedUid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCurrentUser({
            uid: savedUid,
            name: data.name,
            email: data.email
          });
          setUserData(data.surveyData || {});
          
          // Set patient info from survey data
          if (data.surveyData) {
            setPatientInfo({
              age: data.surveyData.age || '',
              gender: data.surveyData.gender || '',
              conditions: data.surveyData.medicalConditions || []
            });
          }
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

    const callMedicalAPI = async (query, files = [], currentMessages = []) => {
      try {
        // Build conversation history context (last 10 messages to avoid token limits)
        const buildConversationHistory = () => {
          // Get last 10 messages (5 exchanges) to maintain context without overwhelming the API
          const recentMessages = currentMessages.slice(-10);
          
          return recentMessages.map(msg => {
            const role = msg.isUser ? 'User' : 'Assistant';
            const content = msg.text.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove markdown for cleaner context
            return `${role}: ${content}`;
          }).join('\n');
        };
    
        // Build comprehensive patient context from survey data
        const buildPatientContext = () => {
          const context = [];
          
          // Basic Information
          if (userData?.age) context.push(`Age: ${userData.age} years`);
          if (userData?.gender) context.push(`Gender: ${userData.gender}`);
          if (userData?.height) context.push(`Height: ${userData.height} cm`);
          if (userData?.weight) context.push(`Weight: ${userData.weight} kg`);
          if (userData?.weightGoal) context.push(`Weight Goal: ${userData.weightGoal}`);
          
          // BMI calculation
          if (userData?.height && userData?.weight) {
            const bmi = (userData.weight / ((userData.height / 100) ** 2)).toFixed(1);
            context.push(`BMI: ${bmi} (${getBMICategory(bmi)})`);
          }
          
          // Activity & Lifestyle
          if (userData?.activityLevel) context.push(`Activity Level: ${userData.activityLevel}`);
          if (userData?.sleepDuration) context.push(`Sleep: ${userData.sleepDuration}`);
          if (userData?.occupationType) context.push(`Occupation: ${userData.occupationType}`);
          
          // Medical History
          if (userData?.medicalConditions?.length > 0) {
            context.push(`Medical Conditions: ${userData.medicalConditions.join(', ')}`);
          }
          if (userData?.allergies) context.push(`Allergies: ${userData.allergies}`);
          if (userData?.medications) context.push(`Medications: ${userData.medications}`);
          
          // Dietary Preferences
          if (userData?.dietPattern) context.push(`Diet: ${userData.dietPattern}`);
          if (userData?.mealsPerDay) context.push(`Meals per day: ${userData.mealsPerDay}`);
          if (userData?.foodDislikes) context.push(`Food dislikes: ${userData.foodDislikes}`);
          
          // Current Habits
          if (userData?.waterIntake) context.push(`Water intake: ${userData.waterIntake}`);
          if (userData?.alcoholConsumption) context.push(`Alcohol: ${userData.alcoholConsumption}`);
          if (userData?.caffeineIntake) context.push(`Caffeine: ${userData.caffeineIntake}`);
          if (userData?.cookingFrequency) context.push(`Cooking frequency: ${userData.cookingFrequency}`);
          
          // Additional Information
          if (userData?.stressLevel) context.push(`Stress level: ${userData.stressLevel}`);
          if (userData?.digestiveIssues) context.push(`Digestive issues: ${userData.digestiveIssues}`);
          if (userData?.healthGoals) context.push(`Health goals: ${userData.healthGoals}`);
          
          return context.join('\n');
        };
    
        // Helper function for BMI categorization
        const getBMICategory = (bmi) => {
          const bmiValue = parseFloat(bmi);
          if (bmiValue < 18.5) return 'Underweight';
          if (bmiValue < 25) return 'Normal weight';
          if (bmiValue < 30) return 'Overweight';
          return 'Obese';
        };
    
        const patientContext = buildPatientContext();
        const conversationHistory = buildConversationHistory();
        
        // Build enhanced query with full context
        let contextSections = [];
        
        if (conversationHistory) {
          contextSections.push(`CONVERSATION HISTORY:\n${conversationHistory}`);
        }
        
        if (patientContext) {
          contextSections.push(`PATIENT PROFILE:\n${patientContext}`);
        }
        
        let enhancedQuery = query;
        if (contextSections.length > 0) {
          enhancedQuery = `${contextSections.join('\n\n')}\n\nCURRENT QUERY: ${query}`;
        }
        
        if (files.length > 0) {
          const fileInfo = files.map(f => `File: ${f.name} (${f.type})`).join(', ');
          enhancedQuery += `\n\nATTACHED FILES: ${fileInfo}`;
        }
    
        // Enhanced patient info for structured data
        const enhancedPatientInfo = {
          // Basic Information
              current_mode: selectedMode
        };
    
        // Filter out null values for cleaner payload
        const filteredPatientInfo = Object.fromEntries(
          Object.entries(enhancedPatientInfo).filter(([_, value]) => 
            value !== null && value !== undefined && value !== ''
          )
        );
    
        console.log('Sending enhanced context to API:', {
          conversation_messages: currentMessages.length,
          patient_data_points: Object.keys(filteredPatientInfo).length,
          domain: selectedMode
        });
    
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': API_KEY
          },
          body: JSON.stringify({
            question: enhancedQuery,
          
            domain: selectedMode !== 'general' ? selectedMode : undefined,
           
          })
        });
    
        if (!response.ok) {
          let errorData = {};
          try {
            errorData = await response.json();
          } catch (jsonError) {
            console.error("Failed to parse error response JSON:", jsonError);
          }
          const errorMessage = errorData.error || `API call failed: ${response.status} ${response.statusText}`;
          throw new Error(errorMessage);
        }
    
        const data = await response.json();
        
        return {
          response: data.response,
          domain: data.domain,
          timestamp: new Date().toISOString(),
          confidence: data.confidence,
          safety: {
            is_safe: data.safety_assessment?.is_safe ?? true,
            message: data.safety_assessment?.message || '✅ Safe',
            safety_level: data.safety_assessment?.safety_level
          },
          medical_context: {
            safety_considerations: data.safety_assessment?.issues || [],
            follow_up_recommendations: data.recommendations || []
          },
          processing_time: data.processing_time_seconds,
          context_used: {
            conversation_history: conversationHistory.length > 0,
            patient_profile: patientContext.length > 0
          }
        };
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    };
  

  const handleFileUpload = (files) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeUploadedFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const saveCurrentChat = () => {
    if (messages.length <= 1) return;

    const chatId = currentChatId || Date.now().toString();
    const chatTitle = messages.find(m => m.isUser)?.text.slice(0, 50) + (messages.find(m => m.isUser)?.text.length > 50 ? '...' : '') || 'New Clinical Session';
    const timestamp = new Date().toISOString();

    const chatData = {
      id: chatId,
      title: chatTitle,
      messages: messages,
      timestamp: timestamp,
      mode: selectedMode,
      patientInfo: patientInfo
    };

    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    updatedHistory.unshift(chatData);

    setChatHistory(updatedHistory);
    mockLocalStorage.setItem('clinicalChatHistory', JSON.stringify(updatedHistory));
    setCurrentChatId(chatId);
  };

  const loadChat = (chatId) => {
    saveCurrentChat();

    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
      setSelectedMode(chat.mode || 'general');
      setPatientInfo(chat.patientInfo || { age: '', gender: '', conditions: [] });
      setShowHistory(false);
      setApiError(null);
      setUploadedFiles([]);
    }
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    mockLocalStorage.setItem('clinicalChatHistory', JSON.stringify(updatedHistory));

    if (currentChatId === chatId) {
      startNewChat();
    }
  };

  const startNewChat = () => {
    if (messages.length > 1 || currentChatId) {
      saveCurrentChat();
    }
    setMessages([
      {
        text: "👋 Welcome to **Prompt Biotics**! I'm your AI medical assistant, ready to help with:\n\n🔬 **Diagnostic Analysis** - Symptom evaluation and differential diagnosis\n💊 **Medication Review** - Drug interactions and safety checks  \n🥗 **Nutrition Planning** - Personalized dietary recommendations\n📋 **Risk Assessment** - Safety evaluations and clinical guidelines\n\nHow can I assist you with your clinical needs today?",
        isUser: false,
        messageType: 'general'
      }
    ]);
    setCurrentChatId(null);
    setSelectedMode('general');
    setShowHistory(false);
    setApiError(null);
    setUploadedFiles([]);
  };

  const filteredChats = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleQuickAction = (actionType) => {
    setSelectedMode(actionType);
    const prompts = {
      diet: "I need help creating a personalized nutrition plan based on my health profile.",
      diagnosis: "I need diagnostic support to evaluate some symptoms I'm experiencing.",
      prescription: "I need assistance with medication review and analysis.",
      alert: "I need a comprehensive safety assessment for my current health situation."
    };

    setInput(prompts[actionType]);
  };

  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;
    
    const userMessage = input || "Files attached for analysis";
    const currentFiles = [...uploadedFiles];
    
    setInput('');
    setUploadedFiles([]);
    setApiError(null);

    const newMessages = [...messages, { 
      text: userMessage, 
      isUser: true,
      files: currentFiles.length > 0 ? currentFiles.map(f => ({ name: f.name, type: f.type })) : undefined
    }];
    setMessages(newMessages);
    setIsTyping(true);

    setTimeout(() => {
      saveCurrentChat();
    }, 100);

    try {
      const apiResponse = await callMedicalAPI(userMessage, currentFiles);

      setIsTyping(false);
      setMessages(prev => {
        const updatedMessages = [...prev, {
          text: apiResponse.response,
          isUser: false,
          messageType: apiResponse.domain || selectedMode,
          apiResponse: apiResponse
        }];

        setTimeout(() => {
          const chatId = currentChatId || Date.now().toString();
          const chatTitle = updatedMessages.find(m => m.isUser)?.text.slice(0, 50) + (updatedMessages.find(m => m.isUser)?.text.length > 50 ? '...' : '') || 'New Clinical Session';
          const timestamp = new Date().toISOString();

          const chatData = {
            id: chatId,
            title: chatTitle,
            messages: updatedMessages,
            timestamp: timestamp,
            mode: selectedMode,
            patientInfo: patientInfo
          };
          const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
          updatedHistory.unshift(chatData);

          setChatHistory(updatedHistory);
          mockLocalStorage.setItem('clinicalChatHistory', JSON.stringify(updatedHistory));
          setCurrentChatId(chatId);
        }, 100);

        return updatedMessages;
      });
    } catch (error) {
      setIsTyping(false);
      setApiError(error.message || 'Failed to get response from medical API. Please try again.');
      console.error('Error calling API:', error);

      setMessages(prev => [
        ...prev,
        {
          text: `⚠️ **System Error**: ${error.message || 'Could not connect to the AI system. Please check your connection and try again.'}\n\nPlease try rephrasing your question or contact support if the issue persists.`,
          isUser: false,
          messageType: 'alert'
        }
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => setIsListening(false), 4000);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      clearUserCookies();
      router.push('/');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black relative overflow-hidden">
      {/* Enhanced Medical Background */}
      <div className="absolute inset-0">
        <MedicalParticles />
      </div>

      {/* Enhanced Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 80px 80px, 80px 80px'
        }} />
      </div>

      {/* Enhanced Chat History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-slate-900/95 to-slate-900/98 backdrop-blur-xl border-r border-slate-700/60 z-50 flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-slate-700/60 bg-gradient-to-r from-slate-800/80 to-slate-800/60">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/20 border border-blue-500/40">
                    <History className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Clinical Sessions</h2>
                    <p className="text-xs text-gray-400">{chatHistory.length} saved conversations</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={startNewChat}
                  className="p-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
              {filteredChats.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-400 mt-16 space-y-4"
                >
                  <div className="w-20 h-20 rounded-full bg-slate-800/60 flex items-center justify-center mx-auto">
                    <FileText className="w-10 h-10 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-2">No sessions found</p>
                    <p className="text-sm text-gray-500 mb-6">Start a new conversation to begin</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startNewChat}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" /> Start New Chat
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                filteredChats.map((chat, index) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    onClick={() => loadChat(chat.id)}
                    className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      currentChatId === chat.id 
                        ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/20 border border-blue-500/50 shadow-lg' 
                        : 'bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/40 hover:border-slate-600/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white mb-1 truncate group-hover:text-white transition-colors">
                          {chat.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                          <Calendar className="w-3 h-3" />
                          {new Date(chat.timestamp).toLocaleDateString()}
                          <span>•</span>
                          {chat.messages.length - 1} messages
                        </div>
                        {chat.mode !== 'general' && (
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            chat.mode === 'diagnosis' ? 'bg-blue-500/20 text-blue-400' :
                            chat.mode === 'prescription' ? 'bg-amber-500/20 text-amber-400' :
                            chat.mode === 'diet' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-rose-500/20 text-rose-400'
                          }`}>
                            {chat.mode}
                          </span>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => deleteChat(chat.id, e)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Interface */}
      <div className={`relative z-10 flex flex-col min-h-screen transition-all duration-300 ${showHistory ? 'ml-80' : 'ml-0'}`}>
        {/* Enhanced Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900/95 to-slate-900/90 backdrop-blur-xl border-b border-slate-700/60 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowHistory(!showHistory)}
              className="p-3 rounded-xl bg-slate-800/60 text-blue-400 hover:bg-slate-700/60 hover:text-blue-300 transition-all duration-300 border border-slate-700/60"
            >
              <History className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Prompt Biotics</h1>
                <p className="text-xs text-gray-400">AI Medical Assistant</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startNewChat}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
            >
              <Plus className="w-4 h-4" /> New Session
            </motion.button>
            
            <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                {currentUser?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{currentUser.name}</p>
                <p className="text-xs text-gray-400">{userData?.age || 'N/A'} yrs • {userData?.gender || 'N/A'}</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 text-gray-300 rounded-xl transition-all duration-300 border border-slate-700/60"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </div>
        </div>

        {/* Enhanced Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {messages.map((msg, index) => (
            <ClinicalMessage
              key={index}
              message={msg.text}
              isUser={msg.isUser}
              apiResponse={msg.apiResponse}
              messageType={msg.messageType}
              delay={0.05 * index}
            />
          ))}
          {isTyping && <ClinicalTypingIndicator />}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex justify-center my-6"
            >
              <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border border-red-500/40 px-6 py-4 rounded-xl text-sm flex items-center gap-3 backdrop-blur-sm shadow-lg max-w-md">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Connection Error</p>
                  <p className="text-xs text-red-400">{apiError}</p>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input Area */}
        <div className="p-6 bg-gradient-to-r from-slate-900/95 to-slate-900/90 backdrop-blur-xl border-t border-slate-700/60 shadow-xl">
          {messages.length === 1 && !isTyping && ( 
            <QuickActions onActionSelect={handleQuickAction} />
          )}

          {/* File Upload Section */}
          <AnimatePresence>
            {showFileUpload && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <FileUpload onFileUpload={handleFileUpload} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Uploaded Files Display */}
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700/60"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Attached Files ({uploadedFiles.length})
                </h4>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setUploadedFiles([])}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                  Clear all
                </motion.button>
              </div>
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700/60 rounded-lg border border-slate-600/60"
                  >
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-white truncate max-w-[120px]">{file.name}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeUploadedFile(file.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Enhanced Input Field */}
          <div className="relative">
            <div className="flex items-end gap-3 bg-gradient-to-r from-slate-800/80 to-slate-800/60 border border-slate-700/60 rounded-2xl shadow-lg p-3 backdrop-blur-sm">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowFileUpload(!showFileUpload)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  showFileUpload 
                    ? 'bg-blue-500/30 text-blue-400 border border-blue-500/40' 
                    : 'bg-slate-700/60 text-gray-400 hover:bg-slate-700/80 hover:text-blue-400'
                }`}
                title="Upload files"
              >
                <Paperclip className="w-5 h-5" />
              </motion.button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "🎤 Listening..." : "Ask me anything about clinical care, diagnosis, medications, or nutrition..."}
                className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none focus:ring-0 py-3 px-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 min-h-[20px] max-h-[120px]"
                rows={1}
              />

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleListening}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    isListening 
                      ? 'bg-red-500/30 text-red-400 border border-red-500/40 animate-pulse' 
                      : 'bg-slate-700/60 text-gray-400 hover:bg-slate-700/80 hover:text-blue-400'
                  }`}
                  title="Voice input"
                >
                  <Mic className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={(!input.trim() && uploadedFiles.length === 0) || isTyping}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    (!input.trim() && uploadedFiles.length === 0) || isTyping
                      ? 'bg-gray-700/60 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:shadow-lg hover:shadow-emerald-500/30'
                  }`}
                  title="Send message"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Input hints */}
            {!input && uploadedFiles.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute -top-8 left-0 text-xs text-gray-500 flex items-center gap-4"
              >
              
              </motion.div>
            )}
          </div>

          {/* Mode indicator */}
          {selectedMode !== 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-center"
            >
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                selectedMode === 'diagnosis' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
                selectedMode === 'prescription' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                selectedMode === 'diet' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}>
                🎯 {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Mode Active
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClinicalCDSSChat;