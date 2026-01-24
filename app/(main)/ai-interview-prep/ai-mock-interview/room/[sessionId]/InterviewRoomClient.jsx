// // app/ai-mock-interview/room/[sessionId]/InterviewRoomClient.jsx

// 'use client';
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { GoogleGenAI, Modality } from '@google/genai';
// import { Mic, MicOff, PhoneOff, Sparkles, User, Volume2, History, X, Menu, Clock, Signal } from 'lucide-react';
// import { updateSessionTranscript } from '../../../actions/interview';

// // --- AUDIO HELPERS (Exact match to working code) ---
// const decode = (base64) => {
//   const binaryString = atob(base64);
//   const len = binaryString.length;
//   const bytes = new Uint8Array(len);
//   for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
//   return bytes;
// };

// const decodeAudioData = async (data, ctx, sampleRate, numChannels) => {
//   const dataInt16 = new Int16Array(data.buffer);
//   const frameCount = dataInt16.length / numChannels;
//   const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
//   for (let channel = 0; channel < numChannels; channel++) {
//     const channelData = buffer.getChannelData(channel);
//     for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
//   }
//   return buffer;
// };

// const createBlob = (data) => {
//   const l = data.length;
//   const int16 = new Int16Array(l);
//   for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
//   return {
//     data: btoa(String.fromCharCode(...new Uint8Array(int16.buffer))),
//     mimeType: 'audio/pcm;rate=16000',
//   };
// };

// export default function InterviewRoomClient({ session }) {
//   const sessionId = session.id;
//   const router = useRouter();

//   // --- STATE ---
//   const config = session.config;
//   const [isActive, setIsActive] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(config.durationMinutes * 60);
//   const [transcription, setTranscription] = useState([]);
//   const [isUserSpeaking, setIsUserSpeaking] = useState(false);
//   const [isAISpeaking, setIsAISpeaking] = useState(false);
//   const [currentSubtitle, setCurrentSubtitle] = useState('');
//   const [isMicMuted, setIsMicMuted] = useState(false);
//   const [showTranscript, setShowTranscript] = useState(true);
//   const [isEnding, setIsEnding] = useState(false); // Add this to your State section at the top

//   // --- REFS ---
//   const sessionRef = useRef(null);
//   const audioContextRef = useRef(null);
//   const outputAudioContextRef = useRef(null);
//   const nextStartTimeRef = useRef(0);
//   const sourcesRef = useRef(new Set());
//   const timerRef = useRef(null);
//   const chatScrollRef = useRef(null);
  
//   // FIX: Ref to track mute state inside audio processor closure
//   const isMicMutedRef = useRef(false);

//   const currentInputRef = useRef('');
//   const currentOutputRef = useRef('');
//   const transcriptHistoryRef = useRef([]);

//   // Sync mute ref
//   useEffect(() => {
//     isMicMutedRef.current = isMicMuted;
//   }, [isMicMuted]);



//   useEffect(() => {
//     transcriptHistoryRef.current = transcription;
//     if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
//   }, [transcription]);

//   // --- CLEANUP ---
//   const stopAllAudio = useCallback(() => {
//     sourcesRef.current.forEach(source => { try { source.stop(); } catch (e) { } });
//     sourcesRef.current.clear();
//     nextStartTimeRef.current = 0;
//     setIsAISpeaking(false);
//   }, []);

//   const cleanup = useCallback(() => {
//     if (timerRef.current) window.clearInterval(timerRef.current);
//     if (sessionRef.current) { try { sessionRef.current.close(); } catch (e) { } }
//     stopAllAudio();
//     if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close().catch(() => { });
//     if (outputAudioContextRef.current?.state !== 'closed') outputAudioContextRef.current?.close().catch(() => { });
//   }, [stopAllAudio]);

//   useEffect(() => { return () => cleanup(); }, [cleanup]);

//   // --- START INTERVIEW ---
//   const startInterview = async () => {
//     if (!config) return;
//     setIsConnecting(true);
//     setCurrentSubtitle("Calibrating audio link...");

//     try {
//       const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
//       const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
//       const inputCtx = new AudioCtxClass({ sampleRate: 16000 });
//       const outputCtx = new AudioCtxClass({ sampleRate: 24000 });

//       // Important: Resume contexts to handle browser autoplay policies
//       await inputCtx.resume();
//       await outputCtx.resume();

//       audioContextRef.current = inputCtx;
//       outputAudioContextRef.current = outputCtx;

//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//       const systemInstruction = `
//   # IDENTITY
//   You are an expert executive recruiter from the HR department at ${config.companyName || "a top-tier firm"}. 
//   You are conducting a professional interview for the position of ${config.jobRole}.

//   # CONTEXT & TECH STACK
//   Target Industry/Stack: ${config.techStack || "General Software Engineering"}.
//   Job Description Context: ${config.jobDescription}.
//   Interview Focus: ${config.focus}.
//   Difficulty Level: ${config.difficulty}.

//   # PERSONA & TONE (Mandatory Style: ${config.personality})
//   - If "Strict & Professional": Be formal, concise, and focused on high-pressure technical accuracy. Do not use filler words.
//   - If "Supportive & Encouraging": Be warm, use positive reinforcement, and guide the candidate if they get stuck.
//   - If "Fast-Paced & Aggressive": Interrupt if the answer is too long. Rapid-fire questions.
//   - If "Socratic & Deep-Dive": Ask "Why?" after every answer. Challenge their fundamental logic.
//   - If "Casual & Culture-Focused" : Be casual and friendly, use simple language, and focus on the candidate's personality and fit for the role.

//   # INTERVIEW PROTOCOL
//   1. OPENING: Start immediately. Greet them as a recruiter from ${config.companyName || "the firm"}. Briefly mention you are hiring for ${config.jobRole}.
//   2. FIRST STEP: Ask the candidate to introduce themselves and explain why they are a fit for this specific role and tech stack.
//   3. FLOW: Listen to their response, then ask follow-up questions one-by-one based on the focus: ${config.focus}.
//   4. CONSTRAINT: Keep your spoken responses under 25 words. Be a listener.
//   5. TRANSITION: Do not tell the user you are an AI. Stay in character until the session ends.
// `;

//       const sessionPromise = ai.live.connect({
//         model: 'gemini-2.5-flash-native-audio-preview-12-2025',
//         config: {
//           responseModalities: [Modality.AUDIO],
//           speechConfig: { 
//             voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } 
//           },
//           systemInstruction,
//           outputAudioTranscription: {},
//           inputAudioTranscription: {},
//         },
//         callbacks: {
//           onopen: () => {
//             setIsConnecting(false);
//             setIsActive(true);
            
//             sessionPromise.then(s => {
//               s.sendRealtimeInput({ text: "Candidate has connected. Start the session with a very brief welcome and first question." });
//             });

//             const source = inputCtx.createMediaStreamSource(stream);
//             const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
//             scriptProcessor.onaudioprocess = (e) => {
//               // Check Ref to avoid stale closure issue
//               if (audioContextRef.current?.state === 'closed' || isMicMutedRef.current) return;
              
//               const inputData = e.inputBuffer.getChannelData(0);
//               const pcmBlob = createBlob(inputData);
              
//               sessionPromise.then(s => {
//                 s.sendRealtimeInput({ media: pcmBlob });
//               });
//             };

//             source.connect(scriptProcessor);
//             scriptProcessor.connect(inputCtx.destination);

//             timerRef.current = window.setInterval(() => {
//               setTimeLeft(prev => {
//                 if (prev <= 1) { handleEnd(); return 0; }
//                 return prev - 1;
//               });
//             }, 1000);
//           },
//           onmessage: async (message) => {
//             // Handle Audio Playback - FIXED: Use outputAudioContextRef.current instead of outputCtx
//             const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
//             if (audioData && outputAudioContextRef.current?.state !== 'closed') {
//               setIsAISpeaking(true);
              
//               const outputContext = outputAudioContextRef.current;
//               const nextStart = Math.max(nextStartTimeRef.current, outputContext.currentTime + 0.1);
              
//               try {
//                 const buffer = await decodeAudioData(decode(audioData), outputContext, 24000, 1);
//                 const source = outputContext.createBufferSource();
//                 source.buffer = buffer;
//                 source.connect(outputContext.destination);
                
//                 source.onended = () => {
//                   sourcesRef.current.delete(source);
//                   if (sourcesRef.current.size === 0) {
//                     setIsAISpeaking(false);
//                   }
//                 };
                
//                 source.start(nextStart);
//                 nextStartTimeRef.current = nextStart + buffer.duration;
//                 sourcesRef.current.add(source);
//               } catch (err) {
//                 console.error('Error playing audio:', err);
//                 setIsAISpeaking(false);
//               }
//             }

//             if (message.serverContent?.interrupted) stopAllAudio();

//             // Handle Transcriptions
//             if (message.serverContent?.outputTranscription) {
//               const text = message.serverContent.outputTranscription.text;
//               currentOutputRef.current += text;
//               setCurrentSubtitle(currentOutputRef.current);
//             } 
            
//             if (message.serverContent?.inputTranscription) {
//               const text = message.serverContent.inputTranscription.text;
//               currentInputRef.current += text;
//               setCurrentSubtitle(currentInputRef.current);
//               setIsUserSpeaking(true);
//             }

//             if (message.serverContent?.turnComplete) {
//               const items = [];
//               if (currentInputRef.current.trim()) {
//                 items.push({ role: 'user', text: currentInputRef.current, timestamp: Date.now() });
//               }
//               if (currentOutputRef.current.trim()) {
//                 items.push({ role: 'model', text: currentOutputRef.current, timestamp: Date.now() });
//               }
              
//               if (items.length > 0) {
//                 setTranscription(prev => [...prev, ...items]);
//               }
              
//               // Clear buffers for movie-style line refreshing
//               currentInputRef.current = '';
//               currentOutputRef.current = '';
//               setCurrentSubtitle('');
//               setIsUserSpeaking(false);
//             }
//           },
//           onerror: (e) => {
//             console.error("Live API Error:", e);
//             setIsConnecting(false);
//           }
//         }
//       });
//       sessionRef.current = await sessionPromise;
//     } catch (err) {
//       setIsConnecting(false);
//       console.error("Failed to connect to Live API:", err);
//       setCurrentSubtitle("Connection error. Please try again.");
//     }
//   };

  
// const handleEnd = async () => {
//     if (isEnding) return;
//     setIsEnding(true);
//     setCurrentSubtitle("Finalizing your evaluation...");
    
//     cleanup(); // Stop audio immediately

//     // Calculate actual duration in minutes
//     // (Total Configured Time - Time Left) / 60
//     const totalDurationSeconds = config.durationMinutes * 60;
//     const timeSpentSeconds = totalDurationSeconds - timeLeft;
//     const timeSpentMinutes = Math.ceil(timeSpentSeconds / 60);

//     const finalTranscript = transcriptHistoryRef.current;
    
//     try {
//       // Pass the calculated time to the backend
//       await updateSessionTranscript(sessionId, finalTranscript, timeSpentMinutes);
      
//       // Redirect
//       router.push(`/ai-mock-interview/result/${sessionId}`);
//     } catch (error) {
//       console.error("Error saving session:", error);
//       // Fallback redirect
//       router.push(`/ai-mock-interview/result/${sessionId}`);
//     }
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   if (!config) return <div className="h-screen bg-black flex items-center justify-center text-neutral-500 text-sm">Loading Config...</div>;

//   return (
//     <div className="h-screen bg-neutral-950 flex flex-col font-sans text-slate-200 overflow-hidden selection:bg-indigo-500/30">
      
//       {/* 1. COMPACT HEADER */}
//       <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-neutral-900/80 backdrop-blur-md z-30">
//         <div className="flex items-center gap-3">
//           <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500'}`} />
//           <span className="font-medium text-xs md:text-sm text-slate-300 tracking-wide uppercase">{config.jobRole}</span>
//           <span className="text-xs text-slate-600 hidden sm:inline">|</span>
//           <span className="text-xs text-slate-500 hidden sm:inline">{config.difficulty} Mode</span>
//         </div>
//         <div className="flex items-center gap-3">
//           <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-md border border-white/5 text-xs font-mono text-slate-300">
//             <Clock size={12} className="text-indigo-400" />
//             {formatTime(timeLeft)}
//           </div>
//           <button onClick={() => setShowTranscript(!showTranscript)} className="lg:hidden p-2 text-slate-400 hover:text-white bg-white/5 rounded-md">
//             <Menu size={16} />
//           </button>
//         </div>
//       </header>

//       {/* 2. MAIN CONTENT */}
//       <div className="flex-1 flex overflow-hidden">
        
//         {/* VIDEO STAGE */}
//         <div className="flex-1 flex flex-col relative bg-[#050505]">

//           {/* SAVING / ENDING OVERLAY */}
//           {isEnding && (
//             <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/90 backdrop-blur-lg animate-in fade-in duration-500">
//               <div className="relative mb-8">
//                 <div className="w-24 h-24 border-2 border-indigo-500/20 rounded-full animate-ping absolute inset-0"></div>
//                 <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/30">
//                   <Sparkles className="w-10 h-10 text-indigo-500 animate-pulse" />
//                 </div>
//               </div>
//               <h2 className="text-2xl font-black tracking-tighter text-white mb-2">Generating Report</h2>
//               <p className="text-slate-400 text-sm font-medium animate-pulse">Our AI is analyzing your performance metrics...</p>
//             </div>
//           )}
            
//           {/* INITIALIZATION OVERLAY */}
//           {!isActive && (
//             <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-neutral-950 p-6">
//               <div className="relative">
//                 <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
//                   <Sparkles className={`w-8 h-8 ${isConnecting ? 'text-indigo-400 animate-spin' : 'text-indigo-500'}`} />
//                 </div>
//               </div>
//               <h2 className="text-xl font-medium text-white mb-2">Ready?</h2>
//               <p className="text-slate-500 mb-8 text-sm">Check your microphone.</p>
//               <button 
//                 onClick={startInterview} 
//                 disabled={isConnecting}
//                 className="px-8 py-2.5 bg-white hover:bg-slate-200 text-black text-sm font-semibold rounded-full transition-all disabled:opacity-50"
//               >
//                 {isConnecting ? 'Connecting...' : 'Start Interview'}
//               </button>
//             </div>
//           )}

//           {/* AVATAR GRID */}
//           <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 p-4 max-w-5xl mx-auto w-full">
            
//             {/* AI PANEL */}
//             <div className="relative w-full md:w-1/2 aspect-[16/10] bg-neutral-900/50 rounded-xl border border-white/5 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
//               <div className={`absolute inset-0 transition-opacity duration-300 ${isAISpeaking ? 'opacity-100' : 'opacity-0'}`}>
//                 <div className="absolute inset-0 bg-indigo-500/5"></div>
//               </div>
              
//               <div className={`
//                 relative w-24 h-24 lg:w-32 lg:h-32 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm
//                 transition-all duration-200 border 
//                 ${isAISpeaking ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105' : 'border-white/10'}
//               `}>
//                 <Sparkles size={32} className={`text-indigo-400 ${isAISpeaking ? 'animate-pulse' : 'opacity-50'}`} />
//               </div>
              
//               <div className="absolute bottom-3 left-3 flex items-center gap-2">
//                 <div className="bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-slate-300 border border-white/5 tracking-wider">
//                   AI INTERVIEWER
//                 </div>
//                 {isAISpeaking && <Signal size={12} className="text-indigo-400 animate-pulse" />}
//               </div>
//             </div>

//             {/* USER PANEL */}
//             <div className="relative w-full md:w-1/2 aspect-[16/10] bg-neutral-900/50 rounded-xl border border-white/5 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
//                <div className={`absolute inset-0 transition-opacity duration-300 ${isUserSpeaking ? 'opacity-100' : 'opacity-0'}`}>
//                 <div className="absolute inset-0 bg-emerald-500/5"></div>
//               </div>

//               <div className={`
//                 relative w-24 h-24 lg:w-32 lg:h-32 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm
//                 transition-all duration-200 border 
//                 ${isUserSpeaking ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105' : 'border-white/10'}
//               `}>
//                 <User size={32} className="text-emerald-500/80" />
//               </div>
              
//               <div className="absolute bottom-3 left-3 flex items-center gap-2">
//                 <div className="bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-slate-300 border border-white/5 tracking-wider">
//                   YOU
//                 </div>
//                 {isMicMuted ? <MicOff size={12} className="text-red-400" /> : (isUserSpeaking && <Signal size={12} className="text-emerald-400 animate-pulse" />)}
//               </div>
//             </div>
//           </div>

//           {/* FLOATING SUBTITLES */}
//           <div className="absolute bottom-24 left-0 right-0 flex justify-center px-6 pointer-events-none">
//             <div className={`
//               bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-xl transition-all duration-300
//               ${currentSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
//             `}>
//               <p className="text-sm md:text-base font-medium text-slate-100 max-w-2xl text-center">
//                 {currentSubtitle}
//               </p>
//             </div>
//           </div>

//           {/* DOCK CONTROLS */}
//           <div className="h-20 flex items-center justify-center gap-4 z-30 mb-4">
//              <div className="flex items-center gap-3 bg-neutral-900/90 border border-white/10 p-2 px-4 rounded-full shadow-2xl backdrop-blur-xl">
//                <button 
//                 onClick={() => setIsMicMuted(!isMicMuted)}
//                 className={`p-3 rounded-full transition-all ${isMicMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/5 hover:bg-white/10 text-white'}`}
//                >
//                 {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
//                </button>
               
//                <div className="w-px h-8 bg-white/10 mx-1"></div>

//                <button 
//                 onClick={handleEnd} 
//                 className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all shadow-lg active:scale-95 flex items-center gap-2"
//                >
//                 <PhoneOff size={14} fill="currentColor" />
//                 <span>END</span>
//                </button>
//              </div>
//           </div>
//         </div>

//         {/* TRANSCRIPT SIDEBAR */}
//         <div className={`
//           fixed inset-y-0 right-0 z-50 w-full lg:w-[320px] bg-neutral-900 border-l border-white/5 transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col shadow-2xl
//           ${showTranscript ? 'translate-x-0' : 'translate-x-full'}
//         `}>
//           <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-neutral-900">
//             <span className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
//               <History size={12} /> Transcript
//             </span>
//             <button onClick={() => setShowTranscript(false)} className="lg:hidden text-slate-400">
//               <X size={16} />
//             </button>
//           </div>

//           <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
//             {transcription.length === 0 && (
//               <div className="flex flex-col items-center justify-center h-40 text-slate-700 text-xs gap-2">
//                 <Volume2 size={24} className="opacity-20" />
//                 <span>Ready to capture...</span>
//               </div>
//             )}
            
//             {transcription.map((item, idx) => (
//               <div key={idx} className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'}`}>
//                 <div className="flex items-center gap-2 mb-1 px-1">
//                   <span className={`text-[10px] font-bold uppercase tracking-wider ${item.role === 'user' ? 'text-emerald-500' : 'text-indigo-500'}`}>
//                     {item.role === 'user' ? 'You' : 'AI'}
//                   </span>
//                   <span className="text-[9px] text-slate-700 font-mono">
//                     {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
//                   </span>
//                 </div>
//                 <div className={`
//                   max-w-[90%] p-3 rounded-xl text-sm leading-relaxed shadow-sm border
//                   ${item.role === 'user' 
//                     ? 'bg-emerald-900/10 text-emerald-100 border-emerald-500/10 rounded-tr-none' 
//                     : 'bg-neutral-800/50 text-slate-300 border-white/5 rounded-tl-none'}
//                 `}>
//                   {item.text}
//                 </div>
//               </div>
//             ))}

//             {(isAISpeaking || isUserSpeaking) && (
//               <div className="flex items-center gap-1.5 px-3 py-2">
//                 <div className="w-1 h-1 bg-slate-600 rounded-full animate-bounce"></div>
//                 <div className="w-1 h-1 bg-slate-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//                 <div className="w-1 h-1 bg-slate-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//               </div>
//             )}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }


// app/ai-mock-interview/room/[sessionId]/InterviewRoomClient.jsx

'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, PhoneOff, Sparkles, User, Volume2, History, X, Menu, Clock, Signal } from 'lucide-react';
import { updateSessionTranscript } from '@/actions/mockInterview';

// ... (Keep your audio helper functions: decode, decodeAudioData, createBlob exactly as they are) ...
const decode = (base64) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

const decodeAudioData = async (data, ctx, sampleRate, numChannels) => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
};

const createBlob = (data) => {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
  return {
    data: btoa(String.fromCharCode(...new Uint8Array(int16.buffer))),
    mimeType: 'audio/pcm;rate=16000',
  };
};

export default function InterviewRoomClient({ session }) {
  const sessionId = session.id;
  const router = useRouter();

  const config = session.config;
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.durationMinutes * 60);
  const [transcription, setTranscription] = useState([]);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [isEnding, setIsEnding] = useState(false);

  const sessionRef = useRef(null);
  const audioContextRef = useRef(null);
  const outputAudioContextRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set());
  const timerRef = useRef(null);
  const chatScrollRef = useRef(null);
  const isMicMutedRef = useRef(false);

  const currentInputRef = useRef('');
  const currentOutputRef = useRef('');
  const transcriptHistoryRef = useRef([]);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    transcriptHistoryRef.current = transcription;
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [transcription]);

  const stopAllAudio = useCallback(() => {
    sourcesRef.current.forEach(source => { try { source.stop(); } catch (e) { } });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsAISpeaking(false);
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (sessionRef.current) { try { sessionRef.current.close(); } catch (e) { } }
    stopAllAudio();
    if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close().catch(() => { });
    if (outputAudioContextRef.current?.state !== 'closed') outputAudioContextRef.current?.close().catch(() => { });
  }, [stopAllAudio]);

  useEffect(() => { return () => cleanup(); }, [cleanup]);

  const startInterview = async () => {
    if (!config) return;
    setIsConnecting(true);
    setCurrentSubtitle("Calibrating audio link...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      const inputCtx = new AudioCtxClass({ sampleRate: 16000 });
      const outputCtx = new AudioCtxClass({ sampleRate: 24000 });

      await inputCtx.resume();
      await outputCtx.resume();

      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const systemInstruction = `
  # IDENTITY
  You are an expert executive recruiter from the HR department at ${config.companyName || "a top-tier firm"}. 
  You are conducting a professional interview for the position of ${config.jobRole}.

  # CONTEXT & TECH STACK
  Target Industry/Stack: ${config.techStack || "General Software Engineering"}.
  Job Description Context: ${config.jobDescription}.
  Interview Focus: ${config.focus}.
  Difficulty Level: ${config.difficulty}.

  # PERSONA & TONE (Mandatory Style: ${config.personality})
  - If "Strict & Professional": Be formal, concise, and focused on high-pressure technical accuracy. Do not use filler words.
  - If "Supportive & Encouraging": Be warm, use positive reinforcement, and guide the candidate if they get stuck.
  - If "Fast-Paced & Aggressive": Interrupt if the answer is too long. Rapid-fire questions.
  - If "Socratic & Deep-Dive": Ask "Why?" after every answer. Challenge their fundamental logic.
  - If "Casual & Culture-Focused" : Be casual and friendly, use simple language, and focus on the candidate's personality and fit for the role.

  # INTERVIEW PROTOCOL
  1. OPENING: Start immediately. Greet them as a recruiter from ${config.companyName || "the firm"}. Briefly mention you are hiring for ${config.jobRole}.
  2. FIRST STEP: Ask the candidate to introduce themselves and explain why they are a fit for this specific role and tech stack.
  3. FLOW: Listen to their response, then ask follow-up questions one-by-one based on the focus: ${config.focus}.
  4. CONSTRAINT: Keep your spoken responses under 25 words. Be a listener.
  5. TRANSITION: Do not tell the user you are an AI. Stay in character until the session ends.
`;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } 
          },
          systemInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            
            sessionPromise.then(s => {
              s.sendRealtimeInput({ text: "Candidate has connected. Start the session with a very brief welcome and first question." });
            });

            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (audioContextRef.current?.state === 'closed' || isMicMutedRef.current) return;
              
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              sessionPromise.then(s => {
                s.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);

            timerRef.current = window.setInterval(() => {
              setTimeLeft(prev => {
                if (prev <= 1) { handleEnd(); return 0; }
                return prev - 1;
              });
            }, 1000);
          },
          onmessage: async (message) => {
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current?.state !== 'closed') {
              setIsAISpeaking(true);
              
              const outputContext = outputAudioContextRef.current;
              const nextStart = Math.max(nextStartTimeRef.current, outputContext.currentTime + 0.1);
              
              try {
                const buffer = await decodeAudioData(decode(audioData), outputContext, 24000, 1);
                const source = outputContext.createBufferSource();
                source.buffer = buffer;
                source.connect(outputContext.destination);
                
                source.onended = () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) {
                    setIsAISpeaking(false);
                  }
                };
                
                source.start(nextStart);
                nextStartTimeRef.current = nextStart + buffer.duration;
                sourcesRef.current.add(source);
              } catch (err) {
                console.error('Error playing audio:', err);
                setIsAISpeaking(false);
              }
            }

            if (message.serverContent?.interrupted) stopAllAudio();

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              currentOutputRef.current += text;
              setCurrentSubtitle(currentOutputRef.current);
            } 
            
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              currentInputRef.current += text;
              setCurrentSubtitle(currentInputRef.current);
              setIsUserSpeaking(true);
            }

            if (message.serverContent?.turnComplete) {
              const items = [];
              if (currentInputRef.current.trim()) {
                items.push({ role: 'user', text: currentInputRef.current, timestamp: Date.now() });
              }
              if (currentOutputRef.current.trim()) {
                items.push({ role: 'model', text: currentOutputRef.current, timestamp: Date.now() });
              }
              
              if (items.length > 0) {
                setTranscription(prev => [...prev, ...items]);
              }
              
              currentInputRef.current = '';
              currentOutputRef.current = '';
              setCurrentSubtitle('');
              setIsUserSpeaking(false);
            }
          },
          onerror: (e) => {
            console.error("Live API Error:", e);
            setIsConnecting(false);
          }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      setIsConnecting(false);
      console.error("Failed to connect to Live API:", err);
      setCurrentSubtitle("Connection error. Please try again.");
    }
  };

  // --- FIX IS HERE: handleEnd ---
  const handleEnd = async () => {
    if (isEnding) return;
    setIsEnding(true);
    setCurrentSubtitle("Finalizing your evaluation...");
    
    cleanup(); // Stop audio immediately

    const totalDurationSeconds = config.durationMinutes * 60;
    const timeSpentSeconds = totalDurationSeconds - timeLeft;
    const timeSpentMinutes = Math.ceil(timeSpentSeconds / 60);

    // 1. FLUSH BUFFERS: Capture any pending speech not yet marked as 'turnComplete'
    let finalTranscript = [...transcriptHistoryRef.current];
    
    if (currentInputRef.current.trim()) {
        finalTranscript.push({ role: 'user', text: currentInputRef.current, timestamp: Date.now() });
    }
    if (currentOutputRef.current.trim()) {
        finalTranscript.push({ role: 'model', text: currentOutputRef.current, timestamp: Date.now() });
    }

    // 2. ERROR CHECK: If still empty, add a placeholder so analysis triggers
    if (finalTranscript.length === 0) {
        finalTranscript.push({ role: 'model', text: "Interview ended before conversation started.", timestamp: Date.now() });
    }
    
    try {
      // 3. Save to DB
      await updateSessionTranscript(sessionId, finalTranscript, timeSpentMinutes);
      
      // 4. Redirect
      router.push(`/ai-mock-interview/result/${sessionId}`);
    } catch (error) {
      console.error("Error saving session:", error);
      // Even on error, try to redirect so user isn't stuck
      router.push(`/ai-mock-interview/result/${sessionId}`);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!config) return <div className="h-screen bg-black flex items-center justify-center text-neutral-500 text-sm">Loading Config...</div>;

  return (
    <div className="h-screen bg-neutral-950 flex flex-col font-sans text-slate-200 overflow-hidden selection:bg-indigo-500/30">
      
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-neutral-900/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500'}`} />
          <span className="font-medium text-xs md:text-sm text-slate-300 tracking-wide uppercase">{config.jobRole}</span>
          <span className="text-xs text-slate-600 hidden sm:inline">|</span>
          <span className="text-xs text-slate-500 hidden sm:inline">{config.difficulty} Mode</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-md border border-white/5 text-xs font-mono text-slate-300">
            <Clock size={12} className="text-indigo-400" />
            {formatTime(timeLeft)}
          </div>
          <button onClick={() => setShowTranscript(!showTranscript)} className="lg:hidden p-2 text-slate-400 hover:text-white bg-white/5 rounded-md">
            <Menu size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        <div className="flex-1 flex flex-col relative bg-[#050505]">

          {isEnding && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/90 backdrop-blur-lg animate-in fade-in duration-500">
              <div className="relative mb-8">
                <div className="w-24 h-24 border-2 border-indigo-500/20 rounded-full animate-ping absolute inset-0"></div>
                <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/30">
                  <Sparkles className="w-10 h-10 text-indigo-500 animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-black tracking-tighter text-white mb-2">Generating Report</h2>
              <p className="text-slate-400 text-sm font-medium animate-pulse">Our AI is analyzing your performance metrics...</p>
            </div>
          )}
            
          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-neutral-950 p-6">
              <div className="relative">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
                  <Sparkles className={`w-8 h-8 ${isConnecting ? 'text-indigo-400 animate-spin' : 'text-indigo-500'}`} />
                </div>
              </div>
              <h2 className="text-xl font-medium text-white mb-2">Ready?</h2>
              <p className="text-slate-500 mb-8 text-sm">Check your microphone.</p>
              <button 
                onClick={startInterview} 
                disabled={isConnecting}
                className="px-8 py-2.5 bg-white hover:bg-slate-200 text-black text-sm font-semibold rounded-full transition-all disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Start Interview'}
              </button>
            </div>
          )}

          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 p-4 max-w-5xl mx-auto w-full">
            
            <div className="relative w-full md:w-1/2 aspect-[16/10] bg-neutral-900/50 rounded-xl border border-white/5 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
              <div className={`absolute inset-0 transition-opacity duration-300 ${isAISpeaking ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-indigo-500/5"></div>
              </div>
              
              <div className={`
                relative w-24 h-24 lg:w-32 lg:h-32 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm
                transition-all duration-200 border 
                ${isAISpeaking ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105' : 'border-white/10'}
              `}>
                <Sparkles size={32} className={`text-indigo-400 ${isAISpeaking ? 'animate-pulse' : 'opacity-50'}`} />
              </div>
              
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-slate-300 border border-white/5 tracking-wider">
                  AI INTERVIEWER
                </div>
                {isAISpeaking && <Signal size={12} className="text-indigo-400 animate-pulse" />}
              </div>
            </div>

            <div className="relative w-full md:w-1/2 aspect-[16/10] bg-neutral-900/50 rounded-xl border border-white/5 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
               <div className={`absolute inset-0 transition-opacity duration-300 ${isUserSpeaking ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-emerald-500/5"></div>
              </div>

              <div className={`
                relative w-24 h-24 lg:w-32 lg:h-32 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm
                transition-all duration-200 border 
                ${isUserSpeaking ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105' : 'border-white/10'}
              `}>
                <User size={32} className="text-emerald-500/80" />
              </div>
              
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-slate-300 border border-white/5 tracking-wider">
                  YOU
                </div>
                {isMicMuted ? <MicOff size={12} className="text-red-400" /> : (isUserSpeaking && <Signal size={12} className="text-emerald-400 animate-pulse" />)}
              </div>
            </div>
          </div>

          <div className="absolute bottom-24 left-0 right-0 flex justify-center px-6 pointer-events-none">
            <div className={`
              bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-xl transition-all duration-300
              ${currentSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}>
              <p className="text-sm md:text-base font-medium text-slate-100 max-w-2xl text-center">
                {currentSubtitle}
              </p>
            </div>
          </div>

          <div className="h-20 flex items-center justify-center gap-4 z-30 mb-4">
             <div className="flex items-center gap-3 bg-neutral-900/90 border border-white/10 p-2 px-4 rounded-full shadow-2xl backdrop-blur-xl">
               <button 
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`p-3 rounded-full transition-all ${isMicMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/5 hover:bg-white/10 text-white'}`}
               >
                {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
               </button>
               
               <div className="w-px h-8 bg-white/10 mx-1"></div>

               <button 
                onClick={handleEnd} 
                disabled={isEnding}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                <PhoneOff size={14} fill="currentColor" />
                <span>{isEnding ? 'SAVING...' : 'END'}</span>
               </button>
             </div>
          </div>
        </div>

        <div className={`
          fixed inset-y-0 right-0 z-50 w-full lg:w-[320px] bg-neutral-900 border-l border-white/5 transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col shadow-2xl
          ${showTranscript ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-neutral-900">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <History size={12} /> Transcript
            </span>
            <button onClick={() => setShowTranscript(false)} className="lg:hidden text-slate-400">
              <X size={16} />
            </button>
          </div>

          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {transcription.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-700 text-xs gap-2">
                <Volume2 size={24} className="opacity-20" />
                <span>Ready to capture...</span>
              </div>
            )}
            
            {transcription.map((item, idx) => (
              <div key={idx} className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${item.role === 'user' ? 'text-emerald-500' : 'text-indigo-500'}`}>
                    {item.role === 'user' ? 'You' : 'AI'}
                  </span>
                  <span className="text-[9px] text-slate-700 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className={`
                  max-w-[90%] p-3 rounded-xl text-sm leading-relaxed shadow-sm border
                  ${item.role === 'user' 
                    ? 'bg-emerald-900/10 text-emerald-100 border-emerald-500/10 rounded-tr-none' 
                    : 'bg-neutral-800/50 text-slate-300 border-white/5 rounded-tl-none'}
                `}>
                  {item.text}
                </div>
              </div>
            ))}

            {(isAISpeaking || isUserSpeaking) && (
              <div className="flex items-center gap-1.5 px-3 py-2">
                <div className="w-1 h-1 bg-slate-600 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}