'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Stethoscope, Brain, Utensils, Activity, Sparkles, ArrowRight,
  Shield, Heart, TrendingUp, Zap, CheckCircle, Award,
  User, FileText, ChevronRight
} from 'lucide-react';

// Medical Particles Component
function MedicalParticles() {
  const [particles, setParticles] = React.useState([]);

  React.useEffect(() => {
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

// Landing Page Component
export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0">
        <MedicalParticles />
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="p-6 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Prompt Biotics</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
            >
              Get Started
            </motion.button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-full text-blue-300 text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Healthcare Decision Support
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Your Personal<br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Health AI Companion
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Advanced medical decision support combined with personalized diet planning. 
              Get 24/7 access to evidence-based health recommendations tailored to your unique needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-slate-800/60 hover:bg-slate-700/60 text-white rounded-xl font-semibold text-lg border border-slate-700/60 transition-all duration-300"
              >
                Watch Demo
              </motion.button>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {[
              {
                icon: Brain,
                color: 'blue',
                title: 'AI-Powered Insights',
                description: 'Advanced machine learning algorithms analyze your health data to provide personalized recommendations'
              },
              {
                icon: Utensils,
                color: 'emerald',
                title: 'Custom Diet Plans',
                description: 'Personalized nutrition plans tailored to your goals, preferences, and medical conditions'
              },
              {
                icon: Activity,
                color: 'purple',
                title: '24/7 Health Support',
                description: 'Round-the-clock access to health guidance and symptom assessment whenever you need it'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                className="bg-gradient-to-br from-slate-800/60 to-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-8 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-full bg-${feature.color}-500/20 border border-${feature.color}-500/40 flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-12 mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
              Why Choose Our Platform?
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              Combining cutting-edge AI technology with medical expertise to deliver personalized healthcare solutions
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Shield,
                  title: 'Evidence-Based Recommendations',
                  description: 'All suggestions backed by latest medical research and clinical guidelines'
                },
                {
                  icon: Heart,
                  title: 'Personalized Care',
                  description: 'Tailored to your unique health profile, goals, and medical history'
                },
                {
                  icon: TrendingUp,
                  title: 'Progress Tracking',
                  description: 'Monitor your health journey with detailed analytics and insights'
                },
                {
                  icon: Zap,
                  title: 'Instant Responses',
                  description: 'Get immediate answers to health questions without waiting'
                },
                {
                  icon: CheckCircle,
                  title: 'Comprehensive Assessments',
                  description: 'Detailed medical and dietary evaluations for complete health picture'
                },
                {
                  icon: Award,
                  title: 'Trusted Technology',
                  description: 'HIPAA-compliant platform with enterprise-grade security'
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">{benefit.title}</h4>
                    <p className="text-gray-400 text-sm">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  icon: User,
                  title: 'Create Your Profile',
                  description: 'Sign up and complete a comprehensive health assessment'
                },
                {
                  step: '02',
                  icon: FileText,
                  title: 'Complete Medical Survey',
                  description: 'Answer detailed questions about your health, lifestyle, and goals'
                },
                {
                  step: '03',
                  icon: Sparkles,
                  title: 'Get AI Recommendations',
                  description: 'Receive personalized diet plans and health guidance instantly'
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + index * 0.15, duration: 0.5 }}
                  className="relative"
                >
                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-8 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                    <div className="text-6xl font-bold text-slate-700/50 mb-4">{step.step}</div>
                    <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/40 flex items-center justify-center">
                      <step.icon className="w-7 h-7 text-blue-400" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ChevronRight className="w-8 h-8 text-slate-700" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/40 rounded-3xl p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Health?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust our AI-powered platform for their healthcare needs
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 inline-flex items-center gap-3"
            >
              Get Started Free
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800/60 mt-20 py-8">
          <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
            <p>&copy; 2025 Prompt Biotics. Advanced Medical Decision Support System.</p>
            <p className="mt-2">AI-powered healthcare for everyone, everywhere.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}