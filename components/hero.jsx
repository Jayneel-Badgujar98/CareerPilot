"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  FileText,
  Bot,
  Search,
  Edit3,
  Download,
  Mic,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Zap,
  BrainCircuit,
  LineChart
} from "lucide-react";

// ✅ ENHANCED DATA: Specific features for the Hero Scroller
// (I defined this here to ensure your specific "Mock Quiz" and "Builder" requests are shown immediately)
const heroFeatures1 = [
  { icon: <Mic className="text-red-500" />, title: "AI Mock Interview", metric: "Live Audio" },
  { icon: <BrainCircuit className="text-indigo-500" />, title: "AI Mock Quiz", metric: "Hard Mode" },
  { icon: <FileText className="text-blue-500" />, title: "AI Resume Builder", metric: "ATS-Ready" },
  { icon: <Search className="text-purple-500" />, title: "AI Resume Analysis", metric: "Deep Scan" },
  { icon: <Bot className="text-pink-500" />, title: "AI Cover Letter", metric: "Instant" },
  { icon: <LineChart className="text-emerald-500" />, title: "Industry Insights", metric: "Live Trends" },
  { icon: <Download className="text-green-500" />, title: "PDF Download", metric: "HD Quality" },
];

const heroFeatures2 = [
  { icon: <Download className="text-green-500" />, title: "PDF Download", metric: "HD Quality" },
  { icon: <LineChart className="text-emerald-500" />, title: "Industry Insights", metric: "Live Trends" },
  { icon: <Bot className="text-pink-500" />, title: "AI Cover Letter", metric: "Instant" },
  { icon: <Search className="text-purple-500" />, title: "AI Resume Analysis", metric: "Deep Scan" },
  { icon: <Mic className="text-red-500" />, title: "AI Interviewer", metric: "Live Audio" },
  { icon: <BrainCircuit className="text-indigo-500" />, title: "Track Your Progress", metric: "Organized" },
  { icon: <FileText className="text-blue-500" />, title: "AI Resume Builder", metric: "ATS-Ready" },
];

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;
      if (scrollPosition > scrollThreshold) {
        imageElement?.classList.add("scrolled");
      } else {
        imageElement?.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="w-full pt-36 md:pt-48 pb-10 relative overflow-hidden">

      {/* --- BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 -z-50 bg-background" />
      <div className="absolute inset-0 -z-40 w-full h-full">
        <Image
          src="/pattern.png"
          alt="Background Pattern"
          fill
          priority
          className="object-cover" // Adjusted opacity for dark theme balance
        />
      </div>

      <div className="container mx-auto px-4 text-center z-10 relative">

        {/* --- NEWS PILL --- */}
        <div className="flex justify-center mb-8 fade-in-up delay-100">
          <div className="group inline-flex items-center gap-2 rounded-full border border-primary/10 bg-secondary/30 px-4 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/50 transition-all cursor-pointer backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="opacity-90">We are committed to make it #1 AI CAREER COACH</span>
            <ArrowRight className="h-3 w-3 opacity-50 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* --- HEADLINE --- */}
        <div className="space-y-6 mx-auto max-w-4xl fade-in-up delay-200">
          <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl leading-[1.1] text-foreground">
            Your Career, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 animate-gradient-x">
              Supercharged by AI
            </span>
          </h1>
          <p className="mx-auto max-w-[640px] text-muted-foreground text-lg md:text-xl leading-relaxed">
            CareerPilot is the all-in-one intelligence platform to craft resumes, ace interviews, and land your dream job 10x faster.
          </p>
        </div>

        {/* --- CTA BUTTONS --- */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12 fade-in-up delay-300">
          {/* PRIMARY CTA */}
          <Link href="/ai-interview-prep">
            <Button
              size="lg"
              className="relative group h-14 px-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 text-white font-semibold text-lg tracking-tight overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(124,58,237,0.3)] border border-white/10 border-t-white/20"
            >
              <div className="relative z-10 flex items-center">
                <Sparkles className="mr-2.5 h-5 w-5 text-indigo-100 group-hover:text-white group-hover:rotate-12 transition-all duration-300" />
                <span>AI Interview Prep</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </Button>
          </Link>

          {/* SECONDARY CTA */}
          <Link href="/analyse-resume">
            <Button
              size="lg"
              variant="ghost"
              className="group h-14 px-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-neutral-200 font-medium text-lg tracking-tight backdrop-blur-md transition-all duration-300"
            >
              <Zap className="mr-2.5 h-5 w-5 text-orange-400 group-hover:text-orange-300 group-hover:scale-110 transition-all duration-300 fill-orange-400/20" />
              <span>AI Resume Analysis</span>
            </Button>
          </Link>
        </div>

        {/* --- REFINED FEATURES SECTION (Integrated Here) --- */}
        <div className="mt-24 w-full fade-in-up delay-500">
          <p className="text-sm text-muted-foreground uppercase tracking-widest mb-6 font-semibold opacity-70">
            Powered by Advanced AI Models
          </p>

          <div className="relative max-w-[100vw] overflow-hidden py-4">
            {/* Soft Fade Masks for Seamless Look */}
            <div className="absolute top-0 left-0 h-full w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
            <div className="absolute top-0 right-0 h-full w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

            {/* ROW 1: SCROLLS LEFT */}
            <div className="flex gap-6 animate-scroll-left hover:[animation-play-state:paused] w-max">
              {/* Original Set */}
              {heroFeatures1.map((feature, index) => (
                <FeatureCard
                  key={`row1-${index}`}
                  icon={feature.icon}
                  title={feature.title}
                  metric={feature.metric}
                />
              ))}
              {/* Duplicate Set for Infinite Loop */}
              {heroFeatures1.map((feature, index) => (
                <FeatureCard
                  key={`row1-dup-${index}`}
                  icon={feature.icon}
                  title={feature.title}
                  metric={feature.metric}
                />
              ))}
            </div>

            {/* ROW 2: SCROLLS RIGHT (Added Margin Top) */}
            <div className="flex gap-6 mt-6 animate-scroll-right hover:[animation-play-state:paused] w-max">
              {/* Original Set */}
              {heroFeatures2.map((feature, index) => (
                <FeatureCard
                  key={`row2-${index}`}
                  icon={feature.icon}
                  title={feature.title}
                  metric={feature.metric}
                />
              ))}
              {/* Duplicate Set for Infinite Loop */}
              {heroFeatures2.map((feature, index) => (
                <FeatureCard
                  key={`row2-dup-${index}`}
                  icon={feature.icon}
                  title={feature.title}
                  metric={feature.metric}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

// --- ENHANCED SUB-COMPONENT ---
// Professional Glassmorphism Card
const FeatureCard = ({ title, metric, icon }) => (
  <div className="flex items-center gap-4 bg-background/40 border border-white/5 backdrop-blur-md rounded-xl px-6 py-4 min-w-[240px] shadow-lg shadow-black/5 hover:shadow-indigo-500/10 hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 group cursor-default select-none">
    <div className="p-2.5 bg-white/5 rounded-lg border border-white/5 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-transform duration-300">
      {React.cloneElement(icon, { className: `w-5 h-5 ${icon.props.className}` })}
    </div>
    <div className="text-left">
      <h3 className="font-semibold text-sm text-foreground tracking-tight group-hover:text-indigo-400 transition-colors">
        {title}
      </h3>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider opacity-80">
          {metric}
        </p>
      </div>
    </div>
  </div>
);

export default HeroSection;