"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Sparkles, User } from "lucide-react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";

export default function InterviewRoomPage({ params }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  // State
  const [micOn, setMicOn] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [subtitle, setSubtitle] = useState("Connecting...");
  const [timeLeft, setTimeLeft] = useState(900);
  
  // Refs
  const socketRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  
  // ⚡ SILENCE DETECTION REFS
  const silenceTimer = useRef(null);
  const accumulatedText = useRef(""); // Stores text while waiting for silence

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on("connect", () => {
      socketRef.current.emit("start_interview", { sessionId: params.sessionId });
    });

    socketRef.current.on("ai_ready", (data) => handleAiSpeak(data.message));
    socketRef.current.on("ai_response", (data) => handleAiSpeak(data.text));

    // Initialize Text-to-Speech
    if (typeof window !== "undefined") {
      synthesisRef.current = window.speechSynthesis;
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (synthesisRef.current) synthesisRef.current.cancel();
      stopSpeechRecognition();
    };
  }, []);

  // --- 1. ROBUST SPEECH RECOGNITION (Logic for interruptions) ---
  useEffect(() => {
    if (typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true; // Keep listening continuously
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        // A. "Barge In": If user speaks, shut up the AI immediately
        if (synthesisRef.current && synthesisRef.current.speaking) {
           synthesisRef.current.cancel();
           setIsAiSpeaking(false);
        }

        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        const isFinal = event.results[current].isFinal;

        setSubtitle(transcript);

        if (isFinal) {
           // B. Silence Buffer: Don't send yet! Wait 1.5s to see if user says more.
           accumulatedText.current += " " + transcript;
           
           if (silenceTimer.current) clearTimeout(silenceTimer.current);
           
           silenceTimer.current = setTimeout(() => {
             // User has been silent for 1.5s -> SEND MESSAGE
             if (accumulatedText.current.trim()) {
               console.log("🎤 Sending:", accumulatedText.current);
               socketRef.current.emit("user_message", accumulatedText.current);
               accumulatedText.current = ""; // Reset buffer
             }
           }, 1500); // <--- Adjust this (1000ms = faster, 2000ms = more patient)
        }
      };
      
      // Auto-restart if it stops unexpectedly
      recognitionRef.current.onend = () => {
         if (micOn) {
           try { recognitionRef.current.start(); } catch(e) {}
         }
      };

      if (micOn) startSpeechRecognition();
    }
  }, [micOn]); 

  const startSpeechRecognition = () => {
    try { recognitionRef.current?.start(); } catch(e) {}
  };

  const stopSpeechRecognition = () => {
    try { recognitionRef.current?.stop(); } catch(e) {}
  };

  // --- 2. AI SPEAKING ---
  const handleAiSpeak = (text) => {
    setSubtitle(text);
    setIsAiSpeaking(true);

    if (synthesisRef.current) {
      synthesisRef.current.cancel(); // Cancel any existing speech
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = synthesisRef.current.getVoices();
      const voice = voices.find(v => v.name.includes("Google US English")) || voices[0];
      utterance.voice = voice;
      
      utterance.onend = () => setIsAiSpeaking(false);
      synthesisRef.current.speak(utterance);
    }
  };

  // --- 3. CONTROLS & UI ---
  const toggleMic = () => {
    setMicOn(!micOn);
    // Logic handled in useEffect dependency
  };

  const handleEnd = () => router.replace(`/ai-interview-prep/ai-mock-interview/result/${params.sessionId}`);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);
  const formatTime = (s) => `${Math.floor(s / 60)}:${s % 60 < 10 ? "0" : ""}${s % 60}`;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col overflow-hidden relative selection:bg-indigo-500/30">
      
      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
           <div className={`w-2 h-2 rounded-full animate-pulse ${micOn ? 'bg-red-500' : 'bg-gray-500'}`} />
           <span className="text-xs font-mono font-medium tracking-widest text-red-200">
             {micOn ? "LISTENING" : "MUTED"}
           </span>
        </div>
        <div className="font-mono text-xl font-bold tracking-widest text-neutral-400">
           {formatTime(timeLeft)}
        </div>
      </div>

      {/* AVATARS */}
      <div className="flex-grow flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-6 justify-center items-center h-full relative z-10">
        
        {/* AI PANEL */}
        <motion.div className="relative w-full md:w-1/2 h-full max-h-[600px] bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden flex flex-col items-center justify-center shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20" />
          <div className="relative z-10 flex flex-col items-center">
             <div className="relative">
                <div className={`absolute -inset-4 bg-indigo-500 rounded-full blur-xl transition-all duration-100 ${isAiSpeaking ? "opacity-50 scale-110" : "opacity-0 scale-100"}`} />
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-b from-neutral-800 to-black border-2 border-white/10 flex items-center justify-center relative shadow-inner z-10">
                   <Sparkles className={`w-12 h-12 text-indigo-400 ${isAiSpeaking ? "animate-pulse" : ""}`} />
                </div>
             </div>
             <div className="mt-8 text-center">
                <h3 className="text-xl font-bold text-white">AI Interviewer (AI)</h3>
                <p className="text-sm text-indigo-300 font-medium tracking-wide">
                   {isAiSpeaking ? "Speaking..." : "Listening..."}
                </p>
             </div>
          </div>
        </motion.div>

        {/* USER PANEL */}
        <motion.div className="relative w-full md:w-1/2 h-1/2 max-h-[400px] bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden flex flex-col items-center justify-center shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-cyan-900/10" />
          <div className="relative z-10 flex flex-col items-center">
             <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-neutral-800 overflow-hidden relative z-10 shadow-2xl">
                {isLoaded && user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center"><User className="w-12 h-12 text-neutral-500" /></div>
                )}
             </div>
             <div className="mt-8 text-center">
                <h3 className="text-xl font-bold text-white">You</h3>
                <p className="text-sm font-medium text-neutral-500 tracking-wide">{micOn ? "Mic On" : "Muted"}</p>
             </div>
          </div>
        </motion.div>
      </div>

      {/* SUBTITLES */}
      <AnimatePresence>
        {subtitle && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-28 left-0 right-0 z-40 flex justify-center px-4">
            <div className="bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 max-w-2xl text-center shadow-2xl">
               <p className="text-lg font-medium text-white/90 leading-relaxed">"{subtitle}"</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTROLS */}
      <div className="p-6 md:pb-10 flex justify-center items-center gap-6 relative z-50">
        <button onClick={toggleMic} className={`p-4 rounded-full border transition-all duration-200 shadow-lg ${micOn ? "bg-neutral-800 border-neutral-700 text-white" : "bg-red-500 text-white border-red-600"}`}>
          {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>
        <button onClick={handleEnd} className="px-8 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-3 transition-all shadow-lg hover:shadow-red-500/30 hover:scale-105">
          <PhoneOff className="w-6 h-6 fill-white" /> <span className="hidden md:inline">End Interview</span>
        </button>
      </div>
    </div>
  );
}


