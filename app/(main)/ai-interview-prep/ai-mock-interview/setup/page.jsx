"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Briefcase, FileText, Link as LinkIcon, Clock, Layers } from "lucide-react";
// Import useUser to get the current user's ID for the DB
import { useUser } from "@clerk/nextjs";

export default function SetupPage() {
    const router = useRouter();
    const { user } = useUser(); // Get the current logged-in user
    const [loading, setLoading] = useState(false);

    // Form State
    const [jd, setJd] = useState("");
    const [company, setCompany] = useState("");
    const [type, setType] = useState("HR");
    const [duration, setDuration] = useState(15);
    const [difficulty, setDifficulty] = useState("Medium");
    const [resume, setResume] = useState(null);

    const handleStart = async () => {
        if (!jd) return alert("Please provide a Job Description.");
        setLoading(true);

        try {
            // 1. CALL YOUR BACKEND TO CREATE THE SESSION
            // We send all the setup data to the server
            const response = await fetch("http://localhost:3001/api/mock-ai-interview/create-interview-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?.id, // Send the Clerk User ID
                    jobDescription: jd,
                    jobRole: "Software Engineer", // You might want to add an input for this
                    companyName: company,
                    interviewType: type,
                    difficulty: difficulty,
                    duration: duration
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to create session");
            }

            const data = await response.json();

            // 2. GET THE REAL SESSION ID FROM THE RESPONSE
            // The backend returns: { sessionId: "65a123..." }
            const sessionId = data.sessionId;

            console.log("🔵 Mock Interview Session Created:", sessionId);

            if (!sessionId) {
                throw new Error("No sessionId returned from backend");
            }

            // 3. REDIRECT TO THE REAL DYNAMIC PAGE
            router.push(`/ai-interview-prep/ai-mock-interview/room/${sessionId}`);

        } catch (error) {
            console.error("Error starting interview:", error);
            alert("Failed to start session. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        // ... (Your existing JSX UI remains exactly the same)
        <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12 flex justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl w-full space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Configure Interview</h1>
                    <p className="text-neutral-400">Customize the AI persona to match your target role.</p>
                </div>

                <div className="space-y-8">

                    {/* 1. INPUTS SECTION */}
                    <section className="space-y-4 p-6 rounded-2xl bg-neutral-900/50 border border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="w-5 h-5 text-indigo-400" />
                            <h2 className="font-bold text-lg">Job Details</h2>
                        </div>

                        {/* Job Description */}
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">Job Description (Required)</label>
                            <textarea
                                value={jd}
                                onChange={(e) => setJd(e.target.value)}
                                placeholder="Paste the full job description here..."
                                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Inputs Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">Company Name or Website URL (Optional)</label>
                                <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-3">
                                    <LinkIcon className="w-4 h-4 text-neutral-500" />
                                    <input
                                        type="text"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        placeholder="Google / www.google.com (Optional)"
                                        className="w-full bg-transparent p-3 text-sm outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">Upload Resume (Optional)</label>
                                <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2">
                                    <FileText className="w-4 h-4 text-neutral-500 mr-2" />
                                    <input
                                        type="file"
                                        accept=".pdf,.docx"
                                        onChange={(e) => setResume(e.target.files[0])}
                                        className="text-sm text-neutral-400 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-white/10 file:text-white hover:file:bg-white/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. SETTINGS SECTION */}
                    <section className="space-y-6 p-6 rounded-2xl bg-neutral-900/50 border border-white/5">

                        {/* Interview Type Tabs */}
                        <div>
                            <label className="text-sm text-neutral-400 mb-3 block font-semibold">Interview Focus</label>
                            <div className="grid grid-cols-3 gap-3 p-1 bg-black/40 rounded-xl border border-white/5">
                                {["HR", "Technical", "Behavioral"].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`py-3 rounded-lg text-sm font-medium transition-all ${type === t ? "bg-indigo-600 text-white shadow-lg" : "text-neutral-400 hover:text-white"
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Duration */}
                            <div>
                                <label className="text-sm text-neutral-400 mb-3 block flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Duration
                                </label>
                                <div className="flex gap-2">
                                    {[15, 30, 45].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setDuration(m)}
                                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${duration === m
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                : "border-white/10 bg-transparent text-neutral-400 hover:border-white/20"
                                                }`}
                                        >
                                            {m} min
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="text-sm text-neutral-400 mb-3 block flex items-center gap-2">
                                    <Layers className="w-4 h-4" /> Difficulty
                                </label>
                                <div className="flex gap-2">
                                    {["Easy", "Medium", "Hard"].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setDifficulty(d)}
                                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${difficulty === d
                                                ? "border-white text-white bg-white/10"
                                                : "border-white/10 text-neutral-400 hover:border-white/20"
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </section>

                    {/* START BUTTON */}
                    <button
                        onClick={handleStart}
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-neutral-200 transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Start Interview Session"}
                    </button>

                    {/* ... */}
                </div>
            </motion.div>
        </div>
    );
}