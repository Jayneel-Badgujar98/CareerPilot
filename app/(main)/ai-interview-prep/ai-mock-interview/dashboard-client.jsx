'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Clock, Trophy, ArrowUpRight, PlayCircle, History,
    BrainCircuit, Zap, Activity, Plus, Calendar, Briefcase,
    Target, BarChart3, Star, TrendingUp, CheckCircle2
} from 'lucide-react';

export default function DashboardClient({ sessions = [] }) {
    const router = useRouter();

    // --- ROBUST STATS CALCULATION ---
    const stats = useMemo(() => {
        if (!sessions || sessions.length === 0) return null;

        // 1. Filter sessions that have analysis data
        const completedSessions = sessions.filter(s => s.analysis && s.analysis.score);

        // 2. ✅ FIXED: Calculate Total Practice Time using actualDuration
        // If actualDuration is missing (old records), fallback to 0 or duration
        const totalMinutes = sessions.reduce((acc, s) => acc + (s.actualDuration || 0), 0);

        // 3. Average Score
        const avgScore = completedSessions.length
            ? Math.round(completedSessions.reduce((acc, s) => acc + (s.analysis.score || 0), 0) / completedSessions.length)
            : 0;

        // 4. Calculate Category Averages
        const categoryAgg = completedSessions.reduce((acc, s) => {
            const cats = s.analysis.categoryScores || {};
            acc.technical += cats.technicalDepth || 0;
            acc.communication += cats.communicationClarity || 0;
            acc.behavioral += cats.cultureFit || 0;
            acc.confidence += cats.confidenceLevel || 0;
            return acc;
        }, { technical: 0, communication: 0, behavioral: 0, confidence: 0 });

        const categoryAvgs = completedSessions.length ? {
            technical: Math.round(categoryAgg.technical / completedSessions.length),
            communication: Math.round(categoryAgg.communication / completedSessions.length),
            behavioral: Math.round(categoryAgg.behavioral / completedSessions.length),
            confidence: Math.round(categoryAgg.confidence / completedSessions.length),
        } : { technical: 0, communication: 0, behavioral: 0, confidence: 0 };

        return {
            totalMinutes,
            avgScore,
            sessionCount: sessions.length,
            completedCount: completedSessions.length,
            categoryAvgs
        };
    }, [sessions]);

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 pb-20 selection:bg-indigo-500/30 font-sans">

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-10 animate-in fade-in duration-700">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
                    <div className="space-y-2">
                        {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"> */}
                        {/* <Activity size={12} className="text-emerald-400" /> */}
                        {/* <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">CareerPilot Advanced AI is Active</span> */}
                        {/* </div> */}
                        <h1 className="text-5xl font-extrabold tracking-tight text-white">
                            AI Mock Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">Analytics</span>
                        </h1>
                        <p className="text-slate-400 text-sm max-w-md">
                            Tracking your biometric performance and technical growth over time.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/ai-interview-prep/ai-mock-interview/setup')}
                        className="group relative flex items-center gap-3 bg-white hover:bg-indigo-50 text-black px-6 py-3.5 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5"
                    >
                        <Plus size={18} />
                        New Interview
                    </button>
                </header>

                {/* 1. HIGH-LEVEL STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        icon={<Trophy className="text-amber-400" />}
                        label="Avg. Score"
                        value={`${stats?.avgScore || 0}%`}
                        sub="Overall Readiness"
                    />
                    <StatCard
                        icon={<Clock className="text-blue-400" />}
                        label="Practice Time"
                        // Display hours and minutes logic
                        value={`${Math.floor((stats?.totalMinutes || 0) / 60)}h ${(stats?.totalMinutes || 0) % 60}m`}
                        sub="Actual Time Spent"
                    />
                    <StatCard
                        icon={<Briefcase className="text-purple-400" />}
                        label="Sessions"
                        value={stats?.sessionCount || 0}
                        sub="Total Attempts"
                    />

                </div>

                {/* 2. SKILL PROFICIENCY (NEW SECTION) */}
                {stats?.completedCount > 0 && (
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Skill Bars */}
                        <div className="lg:col-span-2 bg-[#0A0A0B] border border-white/10 p-8 rounded-3xl">
                            <div className="flex items-center gap-3 mb-8">
                                <BarChart3 size={20} className="text-indigo-500" />
                                <h3 className="text-lg font-bold text-white">Skill Proficiency</h3>
                            </div>
                            <div className="space-y-6">
                                <SkillBar label="Technical Knowledge" score={stats.categoryAvgs.technical} color="bg-indigo-500" />
                                <SkillBar label="Communication" score={stats.categoryAvgs.communication} color="bg-blue-500" />
                                <SkillBar label="Behavioral & Fit" score={stats.categoryAvgs.behavioral} color="bg-emerald-500" />
                                <SkillBar label="Confidence" score={stats.categoryAvgs.confidence} color="bg-purple-500" />
                            </div>
                        </div>

                        {/* Quick Insight */}
                        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-900/20 to-black border border-indigo-500/20 p-8 rounded-3xl flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <BrainCircuit size={100} className="text-indigo-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">AI Summary</span>
                            <p className="text-xl font-bold text-white leading-relaxed mb-4">
                                You have practiced for <span className="text-indigo-400">{stats.totalMinutes} minutes</span> across {stats.sessionCount} sessions.
                            </p>
                            <p className="text-sm text-slate-400">
                                Your technical scores are trending {stats.categoryAvgs.technical > 70 ? 'upwards' : 'steady'}. Focus on deep-dive system design questions next.
                            </p>
                        </div>
                    </section>
                )}

                {/* 3. SESSION HISTORY */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <History size={20} className="text-indigo-500" />
                            <h3 className="text-lg font-bold text-white tracking-tight">Interview History</h3>
                        </div>
                        <div className="h-[1px] flex-1 mx-8 bg-white/5 hidden md:block" />
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">{sessions.length} Archives</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {!sessions.length ? (
                            <div className="bg-[#0A0A0A] border border-white/5 border-dashed rounded-[2rem] py-24 flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 bg-white/5 rounded-full">
                                    <PlayCircle size={32} className="text-slate-600" />
                                </div>
                                <p className="text-slate-500 font-medium">No simulation data available yet.</p>
                                <button onClick={() => router.push('/ai-interview-prep/ai-mock-interview')} className="text-indigo-400 text-sm hover:underline">Start your first session</button>
                            </div>
                        ) : (
                            sessions.map((s) => <SessionRow key={s.id} session={s} router={router} />)
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

// --- SUB COMPONENTS ---

function StatCard({ icon, label, value, sub }) {
    return (
        <div className="group bg-[#0A0A0B] border border-white/10 p-6 rounded-2xl hover:border-indigo-500/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/[0.03] rounded-xl group-hover:scale-110 transition-transform">
                    {icon}
                </div>
            </div>
            <div>
                <h4 className="text-3xl font-black text-white tracking-tight mb-1">{value}</h4>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
                <p className="text-[10px] text-slate-600">{sub}</p>
            </div>
        </div>
    );
}

function SkillBar({ label, score, color }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</span>
                <span className="text-sm font-black text-white">{score}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-1000`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}

function SessionRow({ session, router }) {
    const score = session.analysis?.score || 0;
    const isHigh = score >= 70;

    return (
        <div
            onClick={() => router.push(`/ai-interview-prep/ai-mock-interview/result/${session.id}`)}
            className="group cursor-pointer bg-[#0A0A0B] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-[#0E0E0F] hover:border-indigo-500/30 transition-all"
        >
            <div className="flex items-center gap-6 w-full">
                {/* Score Badge */}
                <div className={`h-14 w-14 rounded-xl flex flex-col items-center justify-center shrink-0 border transition-colors ${session.analysis
                    ? (isHigh ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-amber-500/20 bg-amber-500/5 text-amber-400')
                    : 'border-white/5 bg-white/5 text-slate-600'
                    }`}>
                    <span className="text-lg font-bold">{session.analysis ? score : '-'}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                        <h4 className="text-base font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                            {session.jobRole || "Untitled Session"}
                        </h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded border uppercase tracking-widest font-bold ${session.analysis ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-slate-800 text-slate-500 border-white/5'
                            }`}>
                            {session.analysis ? 'Analyzed' : 'Incomplete'}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <Briefcase size={12} className="text-slate-600" />
                            {session.focus || "General"}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <Calendar size={12} className="text-slate-600" />
                            {new Date(session.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <Clock size={12} className="text-slate-600" />
                            {session.actualDuration || 0}m
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full md:w-auto flex items-center justify-end">
                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <ArrowUpRight size={14} />
                </div>
            </div>
        </div>
    );
}
