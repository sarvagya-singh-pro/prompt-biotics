'use client';

import React, { useState, useEffect } from 'react';
import { 
  motion, 
  useScroll, 
  useTransform, 
} from 'framer-motion';
import { 
  FileJson, 
  CheckCircle2, 
  Cpu, 
} from 'lucide-react';

// --- THEME TOKENS ---
const THEME = {
  black: '#050505',
  dark: '#0A0A0A',
  lime: '#D9FF00', 
  orange: '#FF3300', 
  cyan: '#00F0FF', 
  dim: '#444444',
  text: '#EAEAEA'
};

// --- UTILS & HOOKS ---

const useTypewriter = (text, speed = 20, delay = 0) => {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, started]);

  return displayedText;
};

// --- VISUAL COMPONENTS ---

const NoiseOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-[99] opacity-[0.04] mix-blend-overlay"
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }} 
  />
);

const SectionLabel = ({ number, title }) => (
  <div className="flex items-center gap-3 mb-8 opacity-60 font-mono text-xs tracking-widest border-b border-[#333] pb-2">
    <span className="text-[#D9FF00]">{number}</span>
    <span>{title}</span>
  </div>
);

// --- COMPLEX VISUALIZATIONS ---

// 1. The Interactive Console (Simulating Section IV-A: System Architecture)
const SystemConsole = () => {
  const logs = [
    { text: "INITIALIZING PROMPT_BIOTICS KERNEL...", color: "text-gray-500", delay: 0 },
    { text: "> LOAD MODULE: Gemini 2.0 Flash (Vertex AI)", color: "text-[#00F0FF]", delay: 800 },
    { text: "> LOAD DATASET: USDA FoodData Central (298,476 items)", color: "text-[#D9FF00]", delay: 1600 },
    { text: "> USER QUERY: 'Meal plan for T2DM + Hypertension taking Lisinopril'", color: "text-white", delay: 2800 },
    { text: "  [ANALYSIS] Retrieving AHA Guidelines...", color: "text-gray-400", delay: 3800 },
    { text: "  [SAFETY CHECK] Detecting Drug-Nutrient Interaction...", color: "text-[#FF3300]", delay: 4800 },
    { text: "  ! WARNING: Lisinopril + High Potassium (Hyperkalemia Risk)", color: "text-[#FF3300]", delay: 5800 },
    { text: "  [ADJUSTMENT] Reducing Banana/Spinach portions in plan.", color: "text-[#D9FF00]", delay: 6800 },
    { text: "> GENERATING RESPONSE (Confidence: 0.78)...", color: "text-[#00F0FF]", delay: 7800 },
    { text: "READY.", color: "text-green-500", delay: 9000 },
  ];

  return (
    <div className="w-full bg-[#080808] border border-[#333] rounded-sm overflow-hidden font-mono text-xs md:text-sm shadow-2xl">
      <div className="bg-[#111] px-4 py-2 border-b border-[#333] flex justify-between items-center">
        <span className="text-gray-500">live_inference_log.sh</span>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      </div>
      <div className="p-6 h-[400px] overflow-y-auto space-y-3">
        {logs.map((log, i) => (
          <LogEntry key={i} log={log} />
        ))}
      </div>
    </div>
  );
};

const LogEntry = ({ log }) => {
  const text = useTypewriter(log.text, 20, log.delay);
  return (
    <div className={`${log.color}`}>
      {text}
      {text.length === log.text.length && <span className="opacity-0">_</span>}
    </div>
  );
};

// 2. The Equation Visualizer
const EquationVisualizer = () => {
  return (
    <div className="bg-[#111] border border-[#333] p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
        <Cpu className="text-[#D9FF00]" />
      </div>
      
      <h3 className="font-mono text-[#D9FF00] mb-6 text-sm">FORMULA 1.2: CONFIDENCE SCORING</h3>
      
      <div className="font-serif text-2xl md:text-3xl text-gray-300 space-y-8 italic">
        {/* Model Confidence */}
        <div className="flex items-center gap-4">
          <span className="text-[#00F0FF]">C_model</span>
          <span>=</span>
          <div className="text-lg text-gray-500 not-italic">
            ¼ (C_length + C_entropy + C_prob + C_param)
          </div>
        </div>

        {/* Coherence */}
        <div className="flex items-center gap-4">
          <span className="text-[#D9FF00]">C_coherence</span>
          <span>=</span>
          <div className="text-lg text-gray-500 not-italic">
            0.3(Complete) + 0.3(Repetition) + 0.2(Medical)
          </div>
        </div>

        {/* Final Score */}
        <div className="pt-8 border-t border-[#333]">
           <span className="text-white">C_overall</span>
           <span className="mx-4">=</span>
           <span className="text-[#FF3300]">0.78</span> 
           <span className="text-xs font-mono text-gray-500 ml-4">(VALIDATION SET AVG)</span>
        </div>
      </div>
    </div>
  );
};

// --- SECTIONS ---
import { useRouter } from 'next/navigation'; // Add this import

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const router = useRouter(); // Hook for navigation

  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-20 relative pt-20 border-b border-[#222]">
      <div className="absolute right-10 top-20 hidden md:block text-right font-mono text-xs text-[#555]">
        <p>BUILD: V2.4.0-STABLE</p>
        <p>TARGET: CHRONIC_MGMT</p>
        <p>MODEL: GEMINI_2.0_FLASH</p>
      </div>

      <motion.div style={{ y }} className="max-w-5xl z-10">
        <div className="inline-block border border-[#D9FF00] bg-[#D9FF00]/10 text-[#D9FF00] px-3 py-1 font-mono text-[10px] mb-8">
          RESEARCH PREVIEW
        </div>

        <h1 className="text-6xl md:text-9xl font-bold tracking-tighter leading-[0.9] mb-8 text-white mix-blend-exclusion">
          PROMPT <br />
          <span className="text-[#555]">BIOTICS.</span>
        </h1>

        <div className="flex flex-col md:flex-row gap-12 md:items-end">
          <p className="text-xl text-[#999] max-w-xl leading-relaxed">
            A unified healthcare AI system combining <strong className="text-white">Vertex AI</strong> with 
            <strong className="text-white"> USDA FoodData Central</strong>. 
            Designed for Type 2 Diabetes, Hypertension, and CKD management.
          </p>

          <div className="flex gap-8 font-mono text-xs">
            <div className="border-l border-[#333] pl-4">
              <div className="text-[#D9FF00] text-2xl font-bold">98.5%</div>
              <div className="text-gray-500">SAFETY RECALL</div>
            </div>
            <div className="border-l border-[#333] pl-4">
              <div className="text-[#00F0FF] text-2xl font-bold">298k+</div>
              <div className="text-gray-500">USDA ITEMS</div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex gap-6">
          <button 
            onClick={() => router.push('/auth/signup')} // UPDATED: Goes to Login
            className="bg-[#D9FF00] text-black px-8 py-4 font-bold font-mono text-xs uppercase hover:bg-white transition-colors"
          >
            Start Demo
          </button>
       
        </div>
      </motion.div>
    </section>
  );
};


const MethodologyGrid = () => (
  <section className="py-32 px-6 md:px-20 border-b border-[#222]">
    <SectionLabel number="01" title="SYSTEM ARCHITECTURE" />
    
    <div className="grid md:grid-cols-2 gap-20">
      <div className="space-y-12">
        <div className="group">
          {/* FIX: Escaped quotes */}
          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#D9FF00] transition-colors">
            1. The &quot;Brain&quot;: Fine-Tuned LLM
          </h3>
          <p className="text-gray-400 leading-relaxed">
            We employ Google&apos;s <strong>Gemini 2.0 Flash</strong>, fine-tuned on a custom corpus of 
            3,847 clinical-nutritional examples. Unlike generic models, it is optimized for 
            medical terminology and specific dietary interventions.
          </p>
        </div>

        <div className="group">
          {/* FIX: Escaped quotes */}
          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#00F0FF] transition-colors">
            2. The &quot;Fuel&quot;: USDA Integration
          </h3>
          <p className="text-gray-400 leading-relaxed">
            The system ingests the <strong>USDA FoodData Central</strong> database (298,476 items). 
            It retrieves exact micronutrient profiles (Potassium, Sodium, Fiber) rather than 
            hallucinating nutritional values.
          </p>
        </div>

        <div className="group">
          {/* FIX: Escaped quotes */}
          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#FF3300] transition-colors">
            3. The &quot;Guardrails&quot;: Safety Framework
          </h3>
          <p className="text-gray-400 leading-relaxed">
            A deterministic rules engine runs parallel to the AI. It checks for:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm font-mono text-[#777]">
              <li>Drug-Nutrient Interactions (e.g. Warfarin + Vitamin K)</li>
              <li>Contraindications (e.g. CKD + Potassium)</li>
              <li>Dosage Hallucinations</li>
          </ul>
        </div>
      </div>

      {/* Visual Component */}
      <div className="sticky top-32">
        <EquationVisualizer />
      </div>
    </div>
  </section>
);

const DemoSection = () => (
  <section className="py-32 px-6 md:px-20 border-b border-[#222] bg-[#0A0A0A]">
    <SectionLabel number="02" title="INTERACTIVE SIMULATION" />
    
    <div className="grid lg:grid-cols-5 gap-12">
      <div className="lg:col-span-2">
        <h2 className="text-4xl font-bold text-white mb-6">
          See the Logic <br /> in Real-Time.
        </h2>
        <p className="text-gray-400 mb-8">
          The console to the right visualizes the exact pipeline described in Section IV of the research paper. 
          Watch how the system handles a complex query involving <strong>Type 2 Diabetes</strong> and 
          <strong>ACE Inhibitors</strong>.
        </p>
        
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center gap-4 text-[#777]">
            <CheckCircle2 size={16} className="text-[#D9FF00]" />
            <span>Ingestion Latency: 120ms</span>
          </div>
          <div className="flex items-center gap-4 text-[#777]">
            <CheckCircle2 size={16} className="text-[#D9FF00]" />
            <span>Inference Time: 850ms</span>
          </div>
          <div className="flex items-center gap-4 text-[#777]">
            <CheckCircle2 size={16} className="text-[#D9FF00]" />
            <span>Safety Check: PASS</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3">
        <SystemConsole />
      </div>
    </div>
  </section>
);

const DatasetVisual = () => (
  <section className="py-32 px-6 md:px-20 border-b border-[#222]">
    <SectionLabel number="03" title="DATASET STATISTICS (SECTION III)" />
    
    <div className="grid md:grid-cols-4 gap-8">
      {[
        { label: "Training Examples", val: "3,847", sub: "Clinical Q&A Pairs" },
        { label: "Food Items", val: "298,476", sub: "USDA Verified" },
        { label: "Conditions", val: "15", sub: "Chronic Diseases" },
        { label: "Medication Classes", val: "12", sub: "Pharmacological Types" },
      ].map((stat, i) => (
        <div key={i} className="bg-[#111] border border-[#222] p-8 hover:border-[#333] transition-colors">
          <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter">
            {stat.val}
          </div>
          <div className="text-[#D9FF00] font-mono text-xs uppercase tracking-widest mb-1">
            {stat.label}
          </div>
          <div className="text-gray-600 text-xs">
            {stat.sub}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-[#050505] py-20 px-6 md:px-20 text-[#555] font-mono text-xs">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
      <div className="space-y-4">
        <h2 className="text-2xl text-white font-bold tracking-tighter">PROMPT_BIOTICS</h2>
        <p className="max-w-md">
          A research project by Sarvagya Singh. <br />
          Developed for Delhi Public School, Bokaro Steel City.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-12">
        <div>
          <h4 className="text-white mb-4 uppercase">Project</h4>
          <ul className="space-y-2">
            <li className="hover:text-[#D9FF00] cursor-pointer">Architecture Paper</li>
            <li className="hover:text-[#D9FF00] cursor-pointer">GitHub Repository</li>
            <li className="hover:text-[#D9FF00] cursor-pointer">Live Demo</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white mb-4 uppercase">Tech Stack</h4>
          <ul className="space-y-2">
            <li>Google Vertex AI</li>
            <li>Gemini 2.0 Flash</li>
            <li>RunPod Serverless</li>
          </ul>
        </div>
      </div>
    </div>
    
    <div className="mt-20 border-t border-[#222] pt-8 flex justify-between">
      <span>© 2025 Prompt Biotics. All Rights Reserved.</span>
      <span>System Status: <span className="text-[#D9FF00]">OPERATIONAL</span></span>
    </div>
  </footer>
);

// --- MAIN APP ---

export default function App() {
  return (
    <div className="bg-[#050505] min-h-screen text-[#EAEAEA] font-sans selection:bg-[#D9FF00] selection:text-black">
      <NoiseOverlay />
      
      {/* Sticky Header */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#050505]/80 backdrop-blur-md border-b border-[#222]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#D9FF00]" />
          <span className="font-bold tracking-tight">PROMPT BIOTICS</span>
        </div>
        <div className="hidden md:flex gap-6 font-mono text-xs text-[#777]">
          <span className="hover:text-white cursor-pointer">01. ARCHITECTURE</span>
          <span className="hover:text-white cursor-pointer">02. SIMULATION</span>
          <span className="hover:text-white cursor-pointer">03. DATA</span>
        </div>
        <button className="bg-[#222] text-white px-4 py-1.5 font-mono text-xs hover:bg-[#333]">
          READ_PDF
        </button>
      </nav>

      <main>
        <Hero />
        <MethodologyGrid />
        <DemoSection />
        <DatasetVisual />
        <Footer />
      </main>
    </div>
  );
}
