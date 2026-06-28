// app/ai-mock-interview/setup/page.jsx

'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSession } from '@/actions/mockInterview';
import {
  Briefcase, Clock, ChevronLeft, SlidersHorizontal,
  ShieldCheck, ChevronDown, Bot, Zap, Terminal,
  BarChart3, Sparkles, UserCircle2, BrainCircuit,
  HardHat, Coffee, Smile, AlertCircle, Info, Loader2
} from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state
  const [errors, setErrors] = useState({});
  const dropdownRef = useRef(null);
  const roleRef = useRef(null);
  const jdRef = useRef(null);
  const techStackRef = useRef(null);

  const [formData, setFormData] = useState({
    jobRole: '',
    jobDescription: '',
    companyName: '',
    focus: 'Behavioral & Leadership',
    duration: 15,
    difficulty: 'Easy',
    seniority: '',
    personality: 'Supportive & Encouraging',
    techStack: ''
  });

  const personalities = [
    { name: 'Supportive & Encouraging', icon: <Smile className="text-emerald-400" />, desc: 'Helps you through blocks and provides positive reinforcement.' },
    { name: 'Strict & Professional', icon: <HardHat className="text-amber-400" />, desc: 'No-nonsense environment focusing on industry-standard precision.' },
    { name: 'Fast-Paced & Aggressive', icon: <Zap className="text-rose-400" />, desc: 'Tests your ability to think under extreme pressure and time constraints.' },
    { name: 'Socratic & Deep-Dive', icon: <BrainCircuit className="text-violet-400" />, desc: 'Asks "why" repeatedly to test the absolute depth of your knowledge.' },
    { name: 'Casual & Culture-Focused', icon: <Coffee className="text-cyan-400" />, desc: 'Simulates a startup "vibe" check focusing on personality and fit.' },
  ];

  const presetDurations = [15, 25, 30, 45, 60];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsPersonaOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.jobRole.trim()) newErrors.jobRole = "Job role is required to calibrate the AI.";
    if (!formData.jobDescription.trim()) newErrors.jobDescription = "Please provide a job description or key responsibilities.";

    if (!formData.techStack.trim()) newErrors.techStack = "Please provide a tech stack or key technologies.";

    setErrors(newErrors);

    if (newErrors.jobRole) roleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else if (newErrors.jobDescription) jdRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else if (newErrors.techStack) techStackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true); // Start Loading

    try {
      const sessionId = await createSession({
        ...formData,
        durationMinutes: formData.duration
      });
      router.push(`/ai-career-prep/ai-mock-interview/room/${sessionId}`);
      // Note: We don't set loading to false here because we are redirecting.
      // Keeping it true prevents the user from clicking again while the new page loads.
    } catch (error) {
      console.error("Failed to start session:", error);
      setLoading(false); // Stop loading if error occurs
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 pb-20 selection:bg-cyan-500/30 overflow-x-hidden font-sans relative">


      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#404040 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>


      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/15 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-indigo-500/10 blur-[100px] rounded-full animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:py-12 py-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">


        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-800 pb-10">
          <div className="flex items-start gap-5">
            {/* <button
              onClick={() => router.push('/')}
              className="mt-1 p-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400 hover:text-white hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all group shadow-xl shrink-0"
            >
              <ChevronLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
            </button> */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
                <span className="text-xs sm:text-[15px] font-black text-cyan-400 tracking-wide">Advanced AI Interviewer is Waiting</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter text-white">
                Configure <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">Interview</span>
              </h1>
              <p className="text-neutral-400 text-xs sm:text-sm max-w-md leading-relaxed">Fine-tune the neural parameters for your upcoming simulated session.</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          <div className="lg:col-span-8 space-y-6 lg:space-y-8">


            <section className="bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-5 sm:p-8 md:p-10 space-y-8 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3 text-cyan-400">
                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20"><Briefcase size={20} /></div>
                <h2 className="font-black text-xs uppercase tracking-[0.2em] text-neutral-200">Contextual Intelligence</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3" ref={roleRef}>
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Job Role</label>
                  <div className={`relative group/input transition-all ${errors.jobRole ? 'ring-2 ring-rose-500/50 rounded-2xl' : ''}`}>
                    <input
                      type="text" placeholder="e.g. Senior React Developer"
                      className="w-full pl-11 pr-4 py-4 rounded-2xl border border-neutral-800 bg-black/40 text-sm text-neutral-100 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all placeholder:text-neutral-600 shadow-inner"
                      value={formData.jobRole}
                      onChange={e => {
                        setFormData({ ...formData, jobRole: e.target.value });
                        if (errors.jobRole) setErrors({ ...errors, jobRole: null });
                      }}
                    />
                    <Terminal size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within/input:text-cyan-400 transition-colors" />
                  </div>
                  {errors.jobRole && (
                    <p className="flex items-center gap-1.5 text-rose-400 text-[10px] font-bold mt-2 ml-1 animate-in slide-in-from-top-1">
                      <AlertCircle size={12} /> {errors.jobRole}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Organization</label>
                  <div className="relative group/input">
                    <input
                      type="text" placeholder="e.g. Google"
                      className="w-full pl-11 pr-4 py-4 rounded-2xl border border-neutral-800 bg-black/40 text-sm text-neutral-100 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all placeholder:text-neutral-600 shadow-inner"
                      value={formData.companyName}
                      onChange={e => {
                        setFormData({ ...formData, companyName: e.target.value });
                      }}
                    />
                    <UserCircle2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within/input:text-cyan-400 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <BrainCircuit size={14} className="text-violet-500" />
                    Tech Stack
                  </label>
                  <span className="text-[9px] font-bold text-neutral-500 bg-neutral-800/50 px-2 py-0.5 rounded-md uppercase border border-neutral-800">
                    {formData.techStack.length} / 200
                  </span>
                </div>

                <div className="relative group/input">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-cyan-500/20 rounded-[22px] blur-sm opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500" />

                  <div className="relative">
                    <textarea
                      placeholder="e.g. React, Next.js, TypeScript, PostgreSQL..."
                      className="w-full pl-12 pr-4 py-4 min-h-[100px] rounded-[20px] border border-neutral-800 bg-black/40 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all resize-none leading-relaxed custom-scrollbar shadow-inner"
                      ref={techStackRef}
                      value={formData.techStack}
                      onChange={(e) => {
                        if (e.target.value.length <= 200) {
                          setFormData({ ...formData, techStack: e.target.value });
                          if (errors.techStack) setErrors({ ...errors, techStack: null });
                        }
                      }}
                    />
                    <div className="absolute left-4 top-4 text-neutral-600 group-focus-within/input:text-violet-400 transition-colors duration-300">
                      <Terminal size={18} strokeWidth={2.5} />
                    </div>
                  </div>
                  {errors.techStack && (
                    <p className="flex items-center gap-1.5 text-rose-400 text-[10px] font-bold mt-2 ml-1 animate-in slide-in-from-top-1">
                      <AlertCircle size={12} /> {errors.techStack}
                    </p>
                  )}
                  <div className="absolute -bottom-6 left-2 opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300">
                    <p className="text-[9px] text-neutral-500 font-medium flex items-center gap-1.5">
                      <Sparkles size={10} className="text-violet-400" />
                      Separate skills with commas for better AI calibration
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3" ref={jdRef}>
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Job Description (JD)</label>
                <div className={`transition-all ${errors.jobDescription ? 'ring-2 ring-rose-500/50 rounded-3xl' : ''}`}>
                  <textarea
                    rows={6}
                    placeholder={`Paste the Job Description here.\n\nExample:\n- 3+ years experience with modern JavaScript frameworks.\n- Strong understanding of RESTful APIs.`}
                    className="w-full px-5 py-5 rounded-3xl border border-neutral-800 bg-black/40 text-sm text-neutral-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all resize-none leading-relaxed custom-scrollbar placeholder:text-neutral-600 shadow-inner"
                    value={formData.jobDescription}
                    onChange={e => {
                      setFormData({ ...formData, jobDescription: e.target.value });
                      if (errors.jobDescription) setErrors({ ...errors, jobDescription: null });
                    }}
                  />
                </div>
                {errors.jobDescription && (
                  <p className="flex items-center gap-1.5 text-rose-400 text-[10px] font-bold mt-1 ml-1 animate-in slide-in-from-top-1">
                    <AlertCircle size={12} /> {errors.jobDescription}
                  </p>
                )}
              </div>
            </section>


            <section className="bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-5 sm:p-8 md:p-10 space-y-8 shadow-2xl overflow-visible hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3 text-violet-400">
                <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20"><Bot size={20} /></div>
                <h2 className="font-black text-xs uppercase tracking-[0.2em] text-neutral-200">Interviewer Persona</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 overflow-visible">
                <div className="space-y-4 relative" ref={dropdownRef}>
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Personality Profile</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPersonaOpen(!isPersonaOpen)}
                      className="w-full px-5 py-4 rounded-2xl border border-neutral-800 bg-black/40 text-sm flex items-center justify-between hover:border-violet-500/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all text-neutral-200"
                    >
                      <div className="flex items-center gap-3 truncate">
                        {personalities.find(p => p.name === formData.personality)?.icon}
                        <span className="font-semibold truncate">{formData.personality}</span>
                      </div>
                      <ChevronDown className={`text-neutral-500 transition-transform duration-300 shrink-0 ${isPersonaOpen ? 'rotate-180' : ''}`} size={18} />
                    </button>

                    {isPersonaOpen && (
                      <div className="absolute bottom-full left-0 w-full mb-3 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl z-[100] py-2 animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden ring-1 ring-white/10">
                        {personalities.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, personality: p.name });
                              setIsPersonaOpen(false);
                            }}
                            className={`w-full px-5 py-4 text-left hover:bg-neutral-800 flex items-start gap-4 transition-colors ${formData.personality === p.name ? 'bg-violet-500/10' : ''}`}
                          >
                            <div className="mt-1 shrink-0">{p.icon}</div>
                            <div>
                              <p className="text-sm font-bold text-neutral-200">{p.name}</p>
                              <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{p.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Difficulty</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Easy', 'Medium', 'Hard'].map((d) => (
                      <button
                        key={d} type="button"
                        onClick={() => setFormData({ ...formData, difficulty: d })}
                        className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.difficulty === d
                          ? 'bg-cyan-600 border-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transform -translate-y-1'
                          : 'bg-black/40 border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
                          }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>


          <div className="lg:col-span-4 h-full">
            <div className="lg:sticky lg:top-12 space-y-6">
              <div className="bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-5 sm:p-8 space-y-10 shadow-2xl ring-1 ring-white/5">

                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
                    <div className="flex items-center gap-2 text-neutral-200">
                      <SlidersHorizontal size={18} className="text-cyan-400" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Live Summary</h3>
                    </div>
                  </div>


                  <div className="space-y-3 min-h-[140px]">
                    <div className="group/item min-h-[48px]">
                      {formData.jobRole ? (
                        <div className="flex items-center gap-3 bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20 animate-in fade-in slide-in-from-right-3 duration-500 shadow-sm relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/[0.05] to-transparent -translate-x-full group-hover/item:translate-x-full transition-transform duration-1000" />
                          <Terminal size={14} className="text-cyan-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-cyan-400/70 font-black uppercase tracking-tighter leading-none mb-1">Position</p>
                            <p className="text-xs font-bold text-white truncate block uppercase tracking-tight">{formData.jobRole}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 border border-dashed border-neutral-800 rounded-xl opacity-40">
                          <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center shrink-0"><Terminal size={14} /></div>
                          <div className="space-y-1.5 flex-1"><div className="h-2 w-12 bg-neutral-800 rounded-full" /></div>
                        </div>
                      )}
                    </div>

                    <div className="group/item min-h-[48px]">
                      {formData.companyName ? (
                        <div className="flex items-center gap-3 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 animate-in fade-in slide-in-from-right-3 duration-500 delay-75 shadow-sm relative overflow-hidden">
                          <UserCircle2 size={14} className="text-indigo-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-indigo-400/70 font-black uppercase tracking-tighter leading-none mb-1">Organization</p>
                            <p className="text-xs font-bold text-white truncate block tracking-tight">{formData.companyName}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 border border-dashed border-neutral-800 rounded-xl opacity-40">
                          <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center shrink-0"><UserCircle2 size={14} /></div>
                          <div className="space-y-1.5 flex-1"><div className="h-2 w-16 bg-neutral-800 rounded-full" /></div>
                        </div>
                      )}
                    </div>

                    <div className="group/item min-h-[48px]">
                      {formData.techStack ? (
                        <div className="flex items-center gap-3 bg-violet-500/10 p-3 rounded-xl border border-violet-500/20 animate-in fade-in slide-in-from-right-3 duration-500 delay-150 shadow-sm relative overflow-hidden">
                          <BrainCircuit size={14} className="text-violet-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-violet-400/70 font-black uppercase tracking-tighter leading-none mb-1">Ecosystem</p>
                            <p className="text-xs font-bold text-white truncate block tracking-tight italic">{formData.techStack}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 border border-dashed border-neutral-800 rounded-xl opacity-40">
                          <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center shrink-0"><BrainCircuit size={14} /></div>
                          <div className="space-y-1.5 flex-1"><div className="h-2 w-10 bg-neutral-800 rounded-full" /></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={16} className="text-cyan-500" /> Duration
                      </label>
                      <span className="text-sm font-black text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">{formData.duration}m</span>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {presetDurations.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setFormData({ ...formData, duration: m })}
                          className={`py-2.5 rounded-xl border text-[10px] font-black transition-all ${formData.duration === m
                            ? 'bg-cyan-600 text-white border-cyan-500'
                            : 'bg-black/40 border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
                            }`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2">
                      <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest ml-1">Custom Tuning</p>
                      <input
                        type="range" min="2" max="60" step="1"
                        className="w-full accent-cyan-500 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                      <BarChart3 size={16} className="text-violet-500" /> Focus Mode
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {['Technical Deep Dive', 'Behavioral & Leadership', 'System Design'].map((f) => (
                        <button
                          key={f} type="button"
                          onClick={() => setFormData({ ...formData, focus: f })}
                          className={`py-4 px-5 text-[11px] font-bold rounded-2xl border flex items-center justify-between transition-all ${formData.focus === f
                            ? 'bg-violet-500/10 border-violet-500/50 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.1)]'
                            : 'bg-black/40 border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
                            }`}
                        >
                          {f}
                          <div className={`w-2 h-2 rounded-full ${formData.focus === f ? 'bg-violet-400 animate-pulse shadow-[0_0_8px_violet]' : 'bg-neutral-800'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    group relative w-full overflow-hidden rounded-2xl
                    bg-white py-5
                    text-[11px] md:text-[13px] font-black tracking-widest md:tracking-[0.2em] text-neutral-950 uppercase
                    shadow-[0_0_20px_rgba(255,255,255,0.05)]
                    transition-all duration-300 ease-out
                    ${loading ? 'opacity-80 cursor-wait' : 'hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:tracking-[0.25em] active:scale-[0.98] active:translate-y-0'}
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white via-neutral-100 to-neutral-200 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-0 z-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-neutral-800/5 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                  <span className="relative z-10 flex items-center justify-center gap-2 md:gap-3 text-center">
                    {loading ? 'Preparing...' : 'Prepare Interview Session'}
                    {loading ? (
                      <Loader2 size={16} className="animate-spin text-neutral-950 shrink-0" />
                    ) : (
                      <Zap
                        size={16}
                        className="
                        fill-neutral-950 transition-all duration-300 
                        group-hover:rotate-12 group-hover:scale-125 
                        group-hover:text-cyan-600 group-hover:fill-cyan-600
                        shrink-0
                      "
                      />
                    )}
                  </span>
                </button>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl flex items-start gap-4">
                <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Privacy Guard</h4>
                  <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">Data is encrypted and used only for your feedback.</p>
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start shadow-inner">
                <Info size={16} className="text-blue-400 mt-0.5 shrink-0 animate-pulse" />
                <p className="text-xs text-neutral-300 leading-relaxed">
                  <strong className="text-blue-400">Note:</strong> We are not Responsible for
                  any AI Responses. The AI Can Generate Wrong Info So Kindly Verify
                  Before Trusting It.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #262626;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #404040;
        }
      `}</style>
    </div>
  );
}