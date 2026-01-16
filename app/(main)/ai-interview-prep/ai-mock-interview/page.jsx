// ai-interview-prep\ai-mock-interview\setup\page.jsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, TrendingUp, Clock, Calendar, ArrowRight, BarChart3 } from "lucide-react";

// Mock Data
const recentSessions = [
  { id: 1, role: "Full Stack Developer", date: "2 days ago", score: 85, type: "Technical" },
  { id: 2, role: "Product Manager", date: "5 days ago", score: 72, type: "Behavioral" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
              Interview Dashboard
            </h1>
            <p className="text-neutral-400 mt-2">Track your progress and prepare for your next big role.</p>
          </div>
          
          <Link href="/ai-interview-prep/ai-mock-interview/setup">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Start New Interview
            </motion.button>
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Avg. Score" value="78%" icon={<BarChart3 />} gradient="from-blue-500/20 to-cyan-500/20" />
          <StatCard title="Interviews Completed" value="12" icon={<Calendar />} gradient="from-purple-500/20 to-pink-500/20" />
          <StatCard title="Time Practiced" value="4h 30m" icon={<Clock />} gradient="from-emerald-500/20 to-teal-500/20" />
        </div>

        {/* RECENT HISTORY */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Recent Sessions</h2>
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div key={session.id} className="group flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-neutral-900/50 border border-white/5 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${session.score >= 80 ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {session.score}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{session.role}</h3>
                    <p className="text-sm text-neutral-400">{session.type} • {session.date}</p>
                  </div>
                </div>
                
                {/* FIXED LINK HERE */}
                <Link href={`/ai-interview-prep/ai-mock-interview/result/${session.id}`}>
                    <button className="mt-4 md:mt-0 px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
                    View Analysis
                    </button>
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, gradient }) {
  return (
    <div className={`p-6 rounded-3xl bg-neutral-900/50 border border-white/5 relative overflow-hidden group`}>
       <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
       <div className="relative z-10">
         <div className="flex justify-between items-start mb-4">
           <div className="p-3 rounded-xl bg-white/5 text-white">{icon}</div>
         </div>
         <h3 className="text-3xl font-bold text-white">{value}</h3>
         <p className="text-sm text-neutral-400">{title}</p>
       </div>
    </div>
  );
}