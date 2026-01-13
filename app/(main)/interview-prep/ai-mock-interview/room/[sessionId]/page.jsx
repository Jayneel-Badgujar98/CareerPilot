"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs"; // Import Clerk
import { motion } from "framer-motion";
import { Mic, MicOff, PhoneOff, Sparkles, User } from "lucide-react";

export default function InterviewRoomPage({ params }) {
  const router = useRouter();
  const { user, isLoaded } = useUser(); // Get Clerk User Data

  const [micOn, setMicOn] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(true); // AI initially speaks
  const [isUserSpeaking, setIsUserSpeaking] = useState(false); // Track user voice
  const [timeLeft, setTimeLeft] = useState(900); // 15 min

  // Audio Analysis Refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const rafIdRef = useRef(null);

  // 1. Initialize Microphone & Audio Analysis (The "Glow" Logic)
  useEffect(() => {
    let stream = null;

    const startMic = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Setup Audio Context for visualization
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          
          sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
          sourceRef.current.connect(analyserRef.current);
          
          dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
          
          checkAudioLevel();
        }
      } catch (err) {
        console.error("Mic Error:", err);
        setMicOn(false);
      }
    };

    if (micOn) {
      startMic();
    } else {
      stopMicAnalysis();
    }

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      stopMicAnalysis();
    };
  }, [micOn]);

  // Helper to check volume level
  const checkAudioLevel = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    const average = sum / dataArrayRef.current.length;

    // Threshold to trigger "Speaking" state (adjust 10 as needed)
    setIsUserSpeaking(average > 10);

    rafIdRef.current = requestAnimationFrame(checkAudioLevel);
  };

  const stopMicAnalysis = () => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    setIsUserSpeaking(false);
  };

  // 2. Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleEndInterview = () => {
    router.replace(`/ai-mock-interview/result/${params.sessionId || 'demo'}`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col overflow-hidden relative selection:bg-indigo-500/30">
      
      {/* --- TOP HEADER --- */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
           <span className="text-xs font-mono font-medium tracking-widest text-red-200">REC</span>
        </div>
        <div className="font-mono text-xl font-bold tracking-widest text-neutral-400">
           {formatTime(timeLeft)}
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="flex-grow flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-6 justify-center items-center h-full">
        
        {/* PANEL 1: AI INTERVIEWER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="relative w-full md:w-1/2 h-full max-h-[600px] bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden flex flex-col items-center justify-center shadow-2xl"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20" />
          
          <div className="relative z-10 flex flex-col items-center">
             <div className="relative">
                {/* AI GLOW RING */}
                <div 
                   className={`absolute -inset-4 bg-indigo-500 rounded-full blur-xl transition-all duration-100 ${
                     isAiSpeaking ? "opacity-50 scale-110" : "opacity-0 scale-100"
                   }`} 
                />
                
                {/* AI AVATAR */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-b from-neutral-800 to-black border-2 border-white/10 flex items-center justify-center relative shadow-inner z-10">
                   <Sparkles className={`w-12 h-12 text-indigo-400 ${isAiSpeaking ? "animate-pulse" : ""}`} />
                </div>
             </div>
             
             <div className="mt-8 text-center space-y-2">
                <h3 className="text-xl font-bold text-white">Sophia (AI)</h3>
                <p className="text-sm text-indigo-300 font-medium tracking-wide">
                  {isAiSpeaking ? "Speaking..." : "Listening..."}
                </p>
             </div>
          </div>
        </motion.div>


        {/* PANEL 2: YOU (CLERK PROFILE) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="relative w-full md:w-1/2 h-full max-h-[600px] bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden flex flex-col items-center justify-center shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-cyan-900/10" />

          <div className="relative z-10 flex flex-col items-center">
             <div className="relative">
                
                {/* USER GLOW RING (Reacts to Voice) */}
                <div 
                   className={`absolute -inset-4 bg-emerald-500 rounded-full blur-xl transition-all duration-75 ${
                     isUserSpeaking ? "opacity-40 scale-110" : "opacity-0 scale-100"
                   }`} 
                />

                {/* USER AVATAR (From Clerk) */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-neutral-800 overflow-hidden relative z-10 shadow-2xl">
                   {isLoaded && user?.imageUrl ? (
                     <img 
                       src={user.imageUrl} 
                       alt="Profile" 
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                       <User className="w-12 h-12 text-neutral-500" />
                     </div>
                   )}
                </div>

                {/* Mute Indicator Icon */}
                {!micOn && (
                   <div className="absolute -bottom-2 -right-2 bg-red-500 p-2 rounded-full border-4 border-neutral-900 z-20">
                      <MicOff className="w-4 h-4 text-white" />
                   </div>
                )}
             </div>

             <div className="mt-8 text-center space-y-2">
                <h3 className="text-xl font-bold text-white">You</h3>
                <p className={`text-sm font-medium tracking-wide transition-colors ${isUserSpeaking ? "text-emerald-400" : "text-neutral-500"}`}>
                  {isUserSpeaking ? "Speaking..." : (micOn ? "Mic On" : "Muted")}
                </p>
             </div>
          </div>
        </motion.div>

      </div>

      {/* --- BOTTOM CONTROLS --- */}
      <div className="p-6 md:pb-10 flex justify-center items-center gap-6 relative z-30">
        
        {/* Toggle Mic */}
        <button 
          onClick={() => setMicOn(!micOn)}
          className={`p-4 rounded-full border transition-all duration-200 shadow-lg ${
             micOn 
             ? "bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700" 
             : "bg-red-500 text-white border-red-600 hover:bg-red-600 shadow-red-500/20"
          }`}
        >
          {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        {/* End Call */}
        <button 
          onClick={handleEndInterview}
          className="px-8 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-3 transition-all shadow-lg hover:shadow-red-500/30 hover:scale-105"
        >
          <PhoneOff className="w-6 h-6 fill-white" />
          <span className="hidden md:inline">End Interview</span>
        </button>

      </div>
    </div>
  );
}