// // app/ai-mock-interview/result/[sessionId]/page.jsx

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { GoogleGenAI, Type } from '@google/genai';
// import {
//     LayoutDashboard, RotateCcw, TrendingUp, CheckCircle2,
//     AlertCircle, Lightbulb, Target, Calendar, BrainCircuit,
//     ArrowUpRight, Quote, MessageSquare, Briefcase, Zap, ShieldCheck, Award
// } from 'lucide-react';
// import { getSession, updateSessionAnalysis } from '../../../actions/interview';

// export default function ResultPage() {
//     const { sessionId } = useParams();
//     const router = useRouter();
//     const [session, setSession] = useState(null);
//     const [loading, setLoading] = useState(true);

//     // --- 1. DATA FETCHING ---
//     useEffect(() => {
//         const fetchSession = async () => {
//             const data = await getSession(sessionId);
//             if (data) setSession(data);
//             else router.push('/');
//         };
//         fetchSession();
//     }, [sessionId]);

//     // --- 2. GENERATE ADVANCED ANALYSIS ---
//     useEffect(() => {
//         if (!session) return;

//         // If analysis already exists, stop loading
//         if (session.analysis) {
//             setLoading(false);
//             return;
//         }

//         // If no transcript, we can't generate analysis. Stop loading.
//         if (!session.transcript || session.transcript.length === 0) {
//             setLoading(false);
//             return;
//         }

//         const generateAnalysis = async () => {
//             try {
//                 const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
//                 const ai = new GoogleGenAI({ apiKey });

//                 const transcriptText = session.transcript
//                     .map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.text}`)
//                     .join('\n');

//                 const response = await ai.models.generateContent({
//                     model: 'gemini-2.5-flash-lite',
//                     contents: `
//             # ROLE
//             You are a world-class Executive Hiring Manager and a Behavioral Psychologist with 20 years of experience at top-tier firms like Google and McKinsey.
            
//             # CONTEXT
//             Job Role: ${session.jobRole}
//             Target Company: ${session.companyName || 'Fortune 500 Standard'}
//             Focus Area: ${session.focus}
//             Tech Stack: ${session.techStack || 'Not specified'}
//             Job Description: ${session.jobDescription}

//             # TASK
//             Analyze the provided interview transcript with brutal honesty and extreme detail. 
//             Don't just give feedback; provide a psychological profile of the candidate's performance.

//             # TRANSCRIPT TO EVALUATE
//             ${transcriptText}

//             # INSTRUCTIONS for JSON fields:
//             - hiringDecision: Must be "Hired", "Strong Follow-up", or "Rejected".
//             - interviewerThinking: Explain the "subtext"—what the recruiter was likely thinking about the candidate's confidence and depth.
//             - improveVerbatim: Identify exactly where the candidate stumbled. Provide "What you said" vs "The Pro version".
//             - behavioralAnalysis: Profile their soft skills (Leadership, Adaptability, EQ).
//             - hiringProbability : 0-100 percentage based on the performance.
//             `,
//                     config: {
//                         responseMimeType: 'application/json',
//                         responseSchema: {
//                             type: Type.OBJECT,
//                             properties: {
//                                 score: { type: Type.NUMBER }, // 0-100
//                                 hiringDecision: { type: Type.STRING }, // Hired, Rejected, etc.
//                                 hiringProbability: { type: Type.NUMBER }, // 0-100 percentage
//                                 summary: { type: Type.STRING },
//                                 interviewerThinking: { type: Type.STRING }, // Internal monologue of the recruiter

//                                 categoryScores: {
//                                     type: Type.OBJECT,
//                                     properties: {
//                                         technicalDepth: { type: Type.NUMBER },
//                                         communicationClarity: { type: Type.NUMBER },
//                                         problemSolving: { type: Type.NUMBER },
//                                         confidenceLevel: { type: Type.NUMBER },
//                                         cultureFit: { type: Type.NUMBER }
//                                     },
//                                     required: ['technicalDepth', 'communicationClarity', 'problemSolving', 'confidenceLevel', 'cultureFit']
//                                 },

//                                 behavioralAnalysis: {
//                                     type: Type.OBJECT,
//                                     properties: {
//                                         leadership: { type: Type.STRING },
//                                         adaptability: { type: Type.STRING },
//                                         emotionalIntelligence: { type: Type.STRING }
//                                     }
//                                 },

//                                 strengths: {
//                                     type: Type.ARRAY,
//                                     items: {
//                                         type: Type.OBJECT,
//                                         properties: {
//                                             point: { type: Type.STRING },
//                                             impact: { type: Type.STRING } // Why this helps them get hired
//                                         }
//                                     }
//                                 },

//                                 improveVerbatim: {
//                                     type: Type.ARRAY,
//                                     items: {
//                                         type: Type.OBJECT,
//                                         properties: {
//                                             stumble: { type: Type.STRING }, // What the user said wrong or weakly
//                                             professionalVersion: { type: Type.STRING }, // How a 10x candidate would say it
//                                             explanation: { type: Type.STRING } // Why the pro version is better
//                                         }
//                                     }
//                                 },

//                                 weaknesses: {
//                                     type: Type.ARRAY,
//                                     items: {
//                                         type: Type.OBJECT,
//                                         properties: {
//                                             point: { type: Type.STRING },
//                                             actionableFix: { type: Type.STRING },
//                                             priority: { type: Type.STRING } // High, Medium, Low
//                                         }
//                                     }
//                                 },

//                                 criticalTips: { type: Type.ARRAY, items: { type: Type.STRING } },
//                                 actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
//                                 keyTakeaway: { type: Type.STRING }
//                             },
//                             required: ['score', 'hiringDecision', 'hiringProbability', 'categoryScores', 'summary', 'improveVerbatim', 'strengths', 'weaknesses', 'actionPlan', 'keyTakeaway']
//                         }
//                     }
//                 });

//                 const result = JSON.parse(response.text || '{}');
//                 const success = await updateSessionAnalysis(sessionId, result);
//                 if (success) setSession(prev => ({ ...prev, analysis: result }));
//             } catch (err) {
//                 console.error('Advanced Feedback analysis failed:', err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         generateAnalysis();
//     }, [session]);

//     if (loading || !session) {
//         return (
//             <div className="flex flex-col items-center justify-center min-h-screen bg-[#020202] text-white">
//                 <div className="relative w-16 h-16 mb-6">
//                     <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
//                     <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin shadow-[0_0_15px_indigo]"></div>
//                 </div>
//                 <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-indigo-400 animate-pulse">Analyzing Session...</h2>
//             </div>
//         );
//     }

//     const a = session.analysis;

//     return (
//         <div className="min-h-screen bg-[#020202] text-slate-200 pb-20 selection:bg-indigo-500/30">
//             {/* Background Gradients */}
//             <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20">
//                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full" />
//                 <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full" />
//             </div>

//             <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

//                 {/* 1. HERO HEADER: HIRING DECISION */}
//                 <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/5 pb-8">
//                     <div className="lg:col-span-8 space-y-4">
//                         <div className="flex items-center gap-3">
//                             <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-3 py-1 rounded-md border border-indigo-500/20 uppercase tracking-widest">
//                                 {session.focus} Focus
//                             </span>
//                             <span className="text-slate-500 text-[10px] font-mono flex items-center gap-1.5 uppercase">
//                                 <Calendar size={12} /> {new Date(session.date).toLocaleDateString()}
//                             </span>
//                         </div>
//                         <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white uppercase leading-none">
//                             {session.jobRole} <span className="text-indigo-500">Evaluation</span>
//                         </h1>
//                         <p className="text-sm text-slate-400 font-medium italic border-l-2 border-indigo-500/50 pl-4 py-1 leading-relaxed max-w-2xl">
//                             "{a?.summary}"
//                         </p>
//                     </div>

//                     <div className="lg:col-span-4 bg-[#0A0A0A] p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden ring-1 ring-white/5">
//                         <div className={`text-[9px] font-bold uppercase tracking-[0.2em] mb-2 ${a?.hiringDecision === 'Rejected' ? 'text-rose-500' : 'text-emerald-500'}`}>
//                             Final Verdict
//                         </div>
//                         <div className={`text-3xl font-black italic uppercase mb-1 ${a?.hiringDecision === 'Rejected' ? 'text-rose-500' : 'text-emerald-400'}`}>
//                             {a?.hiringDecision}
//                         </div>
//                         <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
//                             {a?.hiringProbability}% Hire Probability
//                         </div>
//                     </div>
//                 </header>

//                 {/* 2. STATS GRID (FIXED MAPPING) */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <StatCard label="Technical" score={a?.categoryScores?.technicalDepth || 0} color="indigo" icon={<Briefcase size={16} />} />
//                     <StatCard label="Communication" score={a?.categoryScores?.communicationClarity || 0} color="blue" icon={<MessageSquare size={16} />} />
//                     <StatCard label="Problem Solving" score={a?.categoryScores?.problemSolving || 0} color="emerald" icon={<Zap size={16} />} />
//                     <StatCard label="Confidence" score={a?.categoryScores?.confidenceLevel || 0} color="purple" icon={<Target size={16} />} />
//                 </div>

//                 {/* 3. RECRUITER'S MINDSET */}
//                 <section className="bg-indigo-600/[0.03] border border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden">
//                     <div className="absolute top-0 right-0 p-6 opacity-10">
//                         <BrainCircuit size={80} className="text-indigo-500" />
//                     </div>
//                     <div className="max-w-4xl space-y-3">
//                         <h3 className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-[10px] tracking-widest">
//                             <Quote size={14} /> Interviewer's Notes
//                         </h3>
//                         <p className="text-lg font-semibold text-white leading-relaxed">
//                             {a?.interviewerThinking}
//                         </p>
//                     </div>
//                 </section>

//                 {/* 5. STRENGTHS & WEAKNESSES */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                     <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 space-y-6">
//                         <h3 className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[10px] tracking-widest">
//                             <CheckCircle2 size={16} /> Key Strengths
//                         </h3>
//                         <div className="space-y-4">
//                             {a?.strengths?.map((s, i) => (
//                                 <div key={i} className="space-y-1">
//                                     <p className="text-sm font-bold text-white">{s.point}</p>
//                                     <p className="text-xs text-slate-500">{s.impact}</p>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 space-y-6">
//                         <h3 className="flex items-center gap-2 text-rose-400 font-bold uppercase text-[10px] tracking-widest">
//                             <AlertCircle size={16} /> Weaknesses to Fix
//                         </h3>
//                         <div className="space-y-4">
//                             {a?.weaknesses?.map((w, i) => (
//                                 <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 relative">
//                                     <span className={`absolute top-3 right-3 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${w.priority === 'High' ? 'text-rose-500 border-rose-500/50 bg-rose-500/10' : 'text-slate-500 border-white/10'}`}>
//                                         {w.priority}
//                                     </span>
//                                     <p className="text-sm font-bold text-slate-200 mb-1 pr-12">{w.point}</p>
//                                     <div className="text-xs text-slate-500 flex gap-1.5 items-center">
//                                         <TrendingUp size={10} className="text-indigo-400" />
//                                         {w.actionableFix}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>

//                 {/* 4. VERBATIM DEEP DIVE (THE COACH) */}
//                 <section className="space-y-4">
//                     <h3 className="flex items-center gap-2 text-white font-bold uppercase text-[10px] tracking-widest ml-1">
//                         <ArrowUpRight size={14} className="text-indigo-500" /> Improvement Opportunities Based on Interview Transcript
//                     </h3>
//                     <div className="grid grid-cols-1 gap-4">
//                         {a?.improveVerbatim?.map((item, i) => (
//                             <div key={i} className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-all">
//                                 <div className="p-4 border-b border-white/5 bg-white/[0.02]">
//                                     <span className="text-[9px] font-bold uppercase text-rose-400 tracking-widest block mb-1">Gap:</span>
//                                     <p className="text-sm text-slate-400 italic">"{item.stumble}"</p>
//                                 </div>
//                                 <div className="p-4 bg-indigo-500/[0.03] space-y-2">
//                                     <span className="text-[9px] font-bold uppercase text-emerald-400 tracking-widest block">Better Approach:</span>
//                                     <p className="text-sm font-semibold text-slate-200">"{item.professionalVersion}"</p>
//                                     <p className="text-[10px] text-slate-500 leading-relaxed pt-2 border-t border-white/5 mt-2">
//                                         <Lightbulb size={10} className="inline mr-1 text-amber-500" />
//                                         {item.explanation}
//                                     </p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </section>



//                 {/* 6. STRATEGIC ROADMAP */}
//                 <section className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl text-center">
//                     <h3 className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest mb-6 flex justify-center items-center gap-2">
//                         <Award size={16} /> Action Plan
//                     </h3>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         {a?.actionPlan?.map((step, i) => (
//                             <div key={i} className="bg-[#050505] p-4 rounded-xl border border-white/5 flex flex-col gap-2 items-center hover:border-indigo-500/30 transition-all">
//                                 <span className="text-2xl font-black text-white/10">0{i + 1}</span>
//                                 <p className="text-xs font-bold text-slate-300 uppercase leading-snug">{step}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </section>

//                 {/* 7. FOOTER ACTIONS */}
//                 <footer className="flex flex-col sm:flex-row justify-center items-center gap-4 py-8 border-t border-white/5">
//                     <button onClick={() => router.push('/')} className="px-6 py-3 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
//                         <LayoutDashboard size={14} /> Dashboard
//                     </button>
//                     <button onClick={() => router.push('/ai-mock-interview')} className="bg-white hover:bg-slate-200 text-black px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 active:scale-95">
//                         <RotateCcw size={14} strokeWidth={2.5} /> New Session
//                     </button>
//                 </footer>
//             </div>
//         </div>
//     );
// }

// const StatCard = ({ label, score, color, icon }) => {
//     const colorMap = {
//         indigo: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
//         blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
//         emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
//         purple: 'text-purple-400 border-purple-500/20 bg-purple-500/5'
//     };
//     return (
//         <div className={`p-4 rounded-2xl border ${colorMap[color]} group transition-all hover:bg-opacity-10`}>
//             <div className="flex justify-between items-start mb-3">
//                 <div className="p-1.5 bg-black/40 rounded-lg border border-white/5">{icon}</div>
//                 <div className="text-xl font-black tracking-tighter text-white">{score}%</div>
//             </div>
//             <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 opacity-80">{label}</div>
//             <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
//                 <div className={`h-full bg-current rounded-full transition-all duration-1000 shadow-[0_0_10px_currentColor]`} style={{ width: `${score}%` }} />
//             </div>
//         </div>
//     );
// };

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GoogleGenAI, Type } from '@google/genai';
import {
    LayoutDashboard, RotateCcw, TrendingUp, CheckCircle2,
    AlertCircle, Lightbulb, Target, Calendar, BrainCircuit,
    ArrowUpRight, Quote, MessageSquare, Briefcase, Zap, ShieldCheck, Award,
    Building2, Code2, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { getSession, updateSessionAnalysis } from '@/actions/mockInterview';

// --- ROBUST JSON CLEANER ---
const cleanJsonResponse = (text) => {
    if (!text) return "{}";
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstOpen = cleaned.indexOf('{');
    const lastClose = cleaned.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
        cleaned = cleaned.substring(firstOpen, lastClose + 1);
    }
    return cleaned;
};

export default function ResultPage() {
    const { sessionId } = useParams();
    const router = useRouter();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analysisError, setAnalysisError] = useState(null);
    const [showFullJD, setShowFullJD] = useState(false); // State for JD toggle

    // --- 1. DATA FETCHING ---
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const data = await getSession(sessionId);
                if (data) {
                    setSession(data);
                } else {
                    router.push('/');
                }
            } catch (e) {
                console.error("Fetch Error", e);
                router.push('/');
            }
        };
        fetchSession();
    }, [sessionId, router]);

    // --- 2. GENERATE ADVANCED ANALYSIS ---
    useEffect(() => {
        if (!session) return;

        if (session.analysis) {
            setLoading(false);
            return;
        }

        if (!session.transcript || session.transcript.length === 0) {
            setLoading(false);
            setAnalysisError("No transcript found. The interview might have ended too quickly.");
            return;
        }

        const generateAnalysis = async () => {
            try {
                const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
                const ai = new GoogleGenAI({ apiKey });

                const transcriptText = session.transcript
                    .map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.text}`)
                    .join('\n');

                const prompt = `
                # IDENTITY & ROLE
                You are a sophisticated Bar Raiser and Technical Hiring Manager at ${session.companyName || 'a Tier-1 Tech Company'}. 
                You are evaluating a candidate for the position of **${session.jobRole}**.

                # CANDIDATE CONTEXT (CRITICAL FOR SCORING)
                - **Role:** ${session.jobRole}
                - **Target Company:** ${session.companyName || 'Industry Standard'}
                - **Years of Exp/Seniority:** ${session.config?.seniority || "Assume based on Job Role title"}
                - **Tech Stack:** ${session.techStack || 'Not specified'}
                - **Interview Focus:** ${session.focus}

                # SCORING RUBRIC (CALIBRATION)
                Adjust your expectations based on the seniority implies by "${session.jobRole}":
                1. **If Intern/Fresher:** Focus on "Curiosity," "Foundational Logic," and "Coachability." Do NOT penalize for lack of complex system design experience. If they give a correct textbook answer, rate them highly.
                2. **If Senior/Lead:** Focus on "Trade-offs," "System Design," "Leadership," and "Business Impact." Penalize for surface-level answers.
                3. **Culture Fit:** Evaluate based on the known culture of ${session.companyName || "High Performance Teams"}.

                # TRANSCRIPT TO ANALYZE
                ${transcriptText}

                # JSON OUTPUT REQUIREMENTS
                Analyze the transcript and return a JSON object with these exact fields:

                1. **hiringDecision**: "Hired", "Strong Follow-up", or "Rejected". Be decisive.
                2. **score**: An integer (0-100). 
                   - 90+: Exceptional (Raises the bar).
                   - 70-89: Solid hire.
                   - <50: Clear rejection.
                3. **hiringProbability**: A calculated percentage (0-100%) based on answer quality vs. role expectations.
                4. **interviewerThinking**: The raw, internal monologue of the recruiter. 
                   - *Example:* "The candidate started weak on the React lifecycle question, but their explanation of API optimization was brilliant. They show promise for a junior role, though I worry about their communication style."
                5. **summary**: A professional executive summary of the interview.
                6. **improveVerbatim** (Array): Find 2-3 specific moments where the candidate stumbled.
                   - **stumble**: The exact quote or vague phrase they used.
                   - **professionalVersion**: How a top 1% candidate would have phrased it.
                   - **explanation**: Why the new version is better (e.g., "uses stronger action verbs," "quantifies impact").
                7. **categoryScores**: Rate 0-100 for 'technicalDepth', 'communicationClarity', 'problemSolving', 'confidenceLevel', 'cultureFit'.
                8. **behavioralAnalysis**: Strings describing their 'leadership', 'adaptability', and 'emotionalIntelligence' signals found in the text.
                9. **strengths** & **weaknesses**: Specific arrays with 'point' and 'impact'/'actionableFix'.
                10. **actionPlan**: 3 concrete steps to improve before the real interview.

                RETURN ONLY RAW JSON. NO MARKDOWN.
                `;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                score: { type: Type.NUMBER },
                                hiringDecision: { type: Type.STRING },
                                hiringProbability: { type: Type.NUMBER },
                                summary: { type: Type.STRING },
                                interviewerThinking: { type: Type.STRING },
                                categoryScores: {
                                    type: Type.OBJECT,
                                    properties: {
                                        technicalDepth: { type: Type.NUMBER },
                                        communicationClarity: { type: Type.NUMBER },
                                        problemSolving: { type: Type.NUMBER },
                                        confidenceLevel: { type: Type.NUMBER },
                                        cultureFit: { type: Type.NUMBER }
                                    },
                                    required: ['technicalDepth', 'communicationClarity', 'problemSolving', 'confidenceLevel', 'cultureFit']
                                },
                                behavioralAnalysis: {
                                    type: Type.OBJECT,
                                    properties: {
                                        leadership: { type: Type.STRING },
                                        adaptability: { type: Type.STRING },
                                        emotionalIntelligence: { type: Type.STRING }
                                    }
                                },
                                strengths: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            point: { type: Type.STRING },
                                            impact: { type: Type.STRING }
                                        }
                                    }
                                },
                                improveVerbatim: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            stumble: { type: Type.STRING },
                                            professionalVersion: { type: Type.STRING },
                                            explanation: { type: Type.STRING }
                                        }
                                    }
                                },
                                weaknesses: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            point: { type: Type.STRING },
                                            actionableFix: { type: Type.STRING },
                                            priority: { type: Type.STRING }
                                        }
                                    }
                                },
                                criticalTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                                actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
                                keyTakeaway: { type: Type.STRING }
                            },
                            required: ['score', 'hiringDecision', 'hiringProbability', 'categoryScores', 'summary', 'interviewerThinking', 'improveVerbatim', 'strengths', 'weaknesses', 'actionPlan', 'keyTakeaway']
                        }
                    }
                });

                let rawText = "";
                if (typeof response.text === 'function') {
                    rawText = response.text(); 
                } else if (typeof response.text === 'string') {
                    rawText = response.text;
                } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
                    rawText = response.candidates[0].content.parts[0].text;
                } else {
                    throw new Error("Could not extract text from AI response");
                }

                const cleanedText = cleanJsonResponse(rawText);
                const result = JSON.parse(cleanedText);
                
                const success = await updateSessionAnalysis(sessionId, result);
                if (success) {
                    setSession(prev => ({ ...prev, analysis: result }));
                } else {
                    throw new Error("DB Update failed");
                }

            } catch (err) {
                console.error('Advanced Feedback analysis failed:', err);
                setAnalysisError("Failed to generate detailed analysis. Please try refreshing.");
            } finally {
                setLoading(false);
            }
        };

        generateAnalysis();
    }, [session, sessionId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#020202] text-white">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin shadow-[0_0_15px_indigo]"></div>
                </div>
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-indigo-400 animate-pulse">Analyzing Session...</h2>
            </div>
        );
    }

    if (analysisError || !session?.analysis) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#020202] text-white">
                <div className="p-6 bg-neutral-900 border border-red-500/20 rounded-xl text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Analysis Failed</h2>
                    <p className="text-slate-400 mb-6">{analysisError || "Data could not be processed."}</p>
                    <button onClick={() => window.location.reload()} className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm">Retry Analysis</button>
                    <button onClick={() => router.push('/')} className="block mt-4 text-xs text-slate-500 hover:text-white mx-auto">Return to Dashboard</button>
                </div>
            </div>
        );
    }

    const a = session.analysis;

    return (
        <div className="min-h-screen bg-[#020202] text-slate-200 pb-20 selection:bg-indigo-500/30">
            {/* Background Gradients */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

                {/* 1. HERO HEADER */}
                <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/5 pb-8">
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-3 py-1 rounded-md border border-indigo-500/20 uppercase tracking-widest">
                                {session.focus} Focus
                            </span>
                            <span className="text-slate-500 text-[10px] font-mono flex items-center gap-1.5 uppercase">
                                <Calendar size={12} /> {new Date(session.date).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white uppercase leading-none">
                            {session.jobRole} <span className="text-indigo-500">Evaluation</span>
                        </h1>
                        <p className="text-sm text-slate-400 font-medium italic border-l-2 border-indigo-500/50 pl-4 py-1 leading-relaxed max-w-2xl">
                            "{a?.summary}"
                        </p>
                    </div>

                    <div className="lg:col-span-4 bg-[#0A0A0A] p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden ring-1 ring-white/5">
                        <div className={`text-[9px] font-bold uppercase tracking-[0.2em] mb-2 ${a?.hiringDecision === 'Rejected' ? 'text-rose-500' : 'text-emerald-500'}`}>
                            Final Verdict
                        </div>
                        <div className={`text-3xl font-black italic uppercase mb-1 ${a?.hiringDecision === 'Rejected' ? 'text-rose-500' : 'text-emerald-400'}`}>
                            {a?.hiringDecision}
                        </div>
                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                            {a?.hiringProbability}% Hire Probability
                        </div>
                    </div>
                </header>

                {/* --- NEW SECTION: SESSION CONTEXT DETAILS --- */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
                        <Briefcase size={14} className="text-indigo-500" /> Session Context
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        {/* Company */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                <Building2 size={12} /> Target Company
                            </div>
                            <p className="text-sm font-semibold text-white">{session.companyName || "Not Specified"}</p>
                        </div>

                        {/* Job Role */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                <Target size={12} /> Role Title
                            </div>
                            <p className="text-sm font-semibold text-white">{session.jobRole}</p>
                        </div>

                        {/* Tech Stack */}
                        <div className="space-y-1 md:col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                <Code2 size={12} /> Tech Stack
                            </div>
                            <p className="text-sm font-mono text-indigo-200/80 truncate">
                                {session.techStack || "General"}
                            </p>
                        </div>

                        {/* Job Description (Expandable) */}
                        {session.jobDescription && (
                            <div className="md:col-span-2 lg:col-span-4 pt-4 border-t border-white/5 mt-2">
                                <div 
                                    className="flex items-center justify-between cursor-pointer group"
                                    onClick={() => setShowFullJD(!showFullJD)}
                                >
                                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider group-hover:text-indigo-400 transition-colors">
                                        <FileText size={12} /> Job Description Analysis
                                    </div>
                                    {showFullJD ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                                </div>
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFullJD ? 'max-h-96 mt-3' : 'max-h-0'}`}>
                                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                        {session.jobDescription}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* --------------------------------------------- */}

                {/* 2. STATS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Technical" score={a?.categoryScores?.technicalDepth || 0} color="indigo" icon={<Briefcase size={16} />} />
                    <StatCard label="Communication" score={a?.categoryScores?.communicationClarity || 0} color="blue" icon={<MessageSquare size={16} />} />
                    <StatCard label="Problem Solving" score={a?.categoryScores?.problemSolving || 0} color="emerald" icon={<Zap size={16} />} />
                    <StatCard label="Confidence" score={a?.categoryScores?.confidenceLevel || 0} color="purple" icon={<Target size={16} />} />
                </div>

                {/* 3. RECRUITER'S MINDSET */}
                <section className="bg-indigo-600/[0.03] border border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <BrainCircuit size={80} className="text-indigo-500" />
                    </div>
                    <div className="max-w-4xl space-y-3">
                        <h3 className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-[10px] tracking-widest">
                            <Quote size={14} /> Interviewer's Notes
                        </h3>
                        <p className="text-lg font-semibold text-white leading-relaxed">
                            {a?.interviewerThinking}
                        </p>
                    </div>
                </section>

                {/* 5. STRENGTHS & WEAKNESSES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 space-y-6">
                        <h3 className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[10px] tracking-widest">
                            <CheckCircle2 size={16} /> Key Strengths
                        </h3>
                        <div className="space-y-4">
                            {a?.strengths?.map((s, i) => (
                                <div key={i} className="space-y-1">
                                    <p className="text-sm font-bold text-white">{s.point}</p>
                                    <p className="text-xs text-slate-500">{s.impact}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 space-y-6">
                        <h3 className="flex items-center gap-2 text-rose-400 font-bold uppercase text-[10px] tracking-widest">
                            <AlertCircle size={16} /> Weaknesses to Fix
                        </h3>
                        <div className="space-y-4">
                            {a?.weaknesses?.map((w, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 relative">
                                    <span className={`absolute top-3 right-3 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${w.priority === 'High' ? 'text-rose-500 border-rose-500/50 bg-rose-500/10' : 'text-slate-500 border-white/10'}`}>
                                        {w.priority}
                                    </span>
                                    <p className="text-sm font-bold text-slate-200 mb-1 pr-12">{w.point}</p>
                                    <div className="text-xs text-slate-500 flex gap-1.5 items-center">
                                        <TrendingUp size={10} className="text-indigo-400" />
                                        {w.actionableFix}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. VERBATIM DEEP DIVE */}
                <section className="space-y-4">
                    <h3 className="flex items-center gap-2 text-white font-bold uppercase text-[10px] tracking-widest ml-1">
                        <ArrowUpRight size={14} className="text-indigo-500" /> Improvement Opportunities Based on Interview Transcript
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {a?.improveVerbatim?.map((item, i) => (
                            <div key={i} className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-all">
                                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                                    <span className="text-[9px] font-bold uppercase text-rose-400 tracking-widest block mb-1">Gap:</span>
                                    <p className="text-sm text-slate-400 italic">"{item.stumble}"</p>
                                </div>
                                <div className="p-4 bg-indigo-500/[0.03] space-y-2">
                                    <span className="text-[9px] font-bold uppercase text-emerald-400 tracking-widest block">Better Approach:</span>
                                    <p className="text-sm font-semibold text-slate-200">"{item.professionalVersion}"</p>
                                    <p className="text-[10px] text-slate-500 leading-relaxed pt-2 border-t border-white/5 mt-2">
                                        <Lightbulb size={10} className="inline mr-1 text-amber-500" />
                                        {item.explanation}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. STRATEGIC ROADMAP */}
                <section className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl text-center">
                    <h3 className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest mb-6 flex justify-center items-center gap-2">
                        <Award size={16} /> Action Plan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {a?.actionPlan?.map((step, i) => (
                            <div key={i} className="bg-[#050505] p-4 rounded-xl border border-white/5 flex flex-col gap-2 items-center hover:border-indigo-500/30 transition-all">
                                <span className="text-2xl font-black text-white/10">0{i + 1}</span>
                                <p className="text-xs font-bold text-slate-300 uppercase leading-snug">{step}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 7. FOOTER ACTIONS */}
                <footer className="flex flex-col sm:flex-row justify-center items-center gap-4 py-8 border-t border-white/5">
                    <button onClick={() => router.push('/ai-interview-prep/ai-mock-interview')} className="px-6 py-3 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                        <LayoutDashboard size={14} /> Dashboard
                    </button>
                    <button onClick={() => router.push('/ai-interview-prep/ai-mock-interview/setup')} className="bg-white hover:bg-slate-200 text-black px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 active:scale-95">
                        <RotateCcw size={14} strokeWidth={2.5} /> Practice Again
                    </button>
                </footer>
            </div>
        </div>
    );
}

const StatCard = ({ label, score, color, icon }) => {
    const colorMap = {
        indigo: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
        blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
        emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
        purple: 'text-purple-400 border-purple-500/20 bg-purple-500/5'
    };
    return (
        <div className={`p-4 rounded-2xl border ${colorMap[color]} group transition-all hover:bg-opacity-10`}>
            <div className="flex justify-between items-start mb-3">
                <div className="p-1.5 bg-black/40 rounded-lg border border-white/5">{icon}</div>
                <div className="text-xl font-black tracking-tighter text-white">{score}%</div>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 opacity-80">{label}</div>
            <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                <div className={`h-full bg-current rounded-full transition-all duration-1000 shadow-[0_0_10px_currentColor]`} style={{ width: `${score}%` }} />
            </div>
        </div>
    );
};