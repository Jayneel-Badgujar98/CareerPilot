// // "use client";

// // import React, { useEffect, useRef } from "react";
// // import Image from "next/image";
// // import { Button } from "@/components/ui/button";
// // import Link from "next/link";

// // const HeroSection = () => {
// //   const imageRef = useRef(null);

// //   useEffect(() => {
// //     const imageElement = imageRef.current;

// //     const handleScroll = () => {
// //       const scrollPosition = window.scrollY;
// //       const scrollThreshold = 100;

// //       if (scrollPosition > scrollThreshold) {
// //         imageElement.classList.add("scrolled");
// //       } else {
// //         imageElement.classList.remove("scrolled");
// //       }
// //     };

// //     window.addEventListener("scroll", handleScroll);
// //     return () => window.removeEventListener("scroll", handleScroll);
// //   }, []);

// //   return (
// //     <section className="w-full pt-36 md:pt-48 pb-10">
// //       <div className="space-y-6 text-center">
// //         <div className="space-y-6 mx-auto">
// //           <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title animate-gradient">
// //             Your AI Career Coach for
// //             <br />
// //             Professional Success
// //           </h1>
// //           <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
// //             Advance your career with personalized guidance, interview prep, and
// //             AI-powered tools for job success.
// //           </p>
// //         </div>
// //         <div className="flex justify-center space-x-4">
// //           <Link href="/dashboard">
// //             <Button size="lg" className="px-8">
// //               Get Started
// //             </Button>
// //           </Link>
// //           <Link href="https://www.youtube.com/roadsidecoder">
// //             <Button size="lg" variant="outline" className="px-8">
// //               Watch Demo
// //             </Button>
// //           </Link>
// //         </div>
// //         <div className="hero-image-wrapper mt-5 md:mt-0">
// //           <div ref={imageRef} className="hero-image">
// //             <Image
// //               src="/banner.jpeg"
// //               width={1280}
// //               height={720}
// //               alt="Dashboard Preview"
// //               className="rounded-lg shadow-2xl border mx-auto"
// //               priority
// //             />
// //           </div>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // };

// // export default HeroSection;


// // "use client";

// // import React, { useEffect, useRef } from "react";
// // import Image from "next/image";
// // import { Button } from "@/components/ui/button";
// // import Link from "next/link";
// // import { ArrowRight } from "lucide-react";

// // const HeroSection = () => {
// //   const imageRef = useRef(null);

// //   useEffect(() => {
// //     const imageElement = imageRef.current;

// //     const handleScroll = () => {
// //       const scrollPosition = window.scrollY;
// //       const scrollThreshold = 100;

// //       if (scrollPosition > scrollThreshold) {
// //         imageElement.classList.add("scrolled");
// //       } else {
// //         imageElement.classList.remove("scrolled");
// //       }
// //     };

// //     window.addEventListener("scroll", handleScroll);
// //     return () => window.removeEventListener("scroll", handleScroll);
// //   }, []);

// //   return (
// //     <section className="w-full pt-36 md:pt-48 pb-20 relative overflow-hidden bg-background">

// //       {/* --- Background Decor --- */}
// //       {/* Grid Pattern */}
// //       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
// //       {/* Radial Fade for Grid */}
// //       <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />


// //       <div className="container mx-auto px-4 text-center">

// //         {/* 1. Animated Badge / Pill */}
// //         <div className="flex justify-center mb-6 fade-in-up delay-100">
// //           <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors cursor-default shadow-sm">
// //             <span className="relative flex h-2 w-2">
// //               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
// //               <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
// //             </span>
// //             <span>The #1 AI Career Coach</span>
// //           </div>
// //         </div>

// //         {/* 2. Main Typography */}
// //         <div className="space-y-6 mx-auto max-w-4xl fade-in-up delay-200">
// //           <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl xl:text-8xl leading-[1.1]">
// //             Your AI Coach for <br className="hidden md:block" />
// //             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 animate-gradient-x">
// //               Professional Success
// //             </span>
// //           </h1>
// //           <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed">
// //             Stop guessing. Start growing. Get personalized guidance, mock interviews, 
// //             and resume optimization powered by advanced AI.
// //           </p>
// //         </div>

// //         {/* 3. Call to Action Buttons */}
// //         <div className="flex justify-center gap-4 mt-8 fade-in-up delay-300">
// //           <Link href="/dashboard">
// //             <Button size="lg" className="px-8 h-14 text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all rounded-xl">
// //               Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
// //             </Button>
// //           </Link>
// //           <Link href="https://www.youtube.com/roadsidecoder" target="_blank">
// //             <Button size="lg" variant="outline" className="px-8 h-14 text-base border-primary/20 hover:bg-primary/5 rounded-xl">
// //                Watch Demo
// //             </Button>
// //           </Link>
// //         </div>

// //         {/* 4. The Hero Image (3D Tilt Effect) */}
// //         <div className="hero-image-wrapper mt-16 md:mt-24 relative z-10 fade-in-up delay-500">
// //           <div ref={imageRef} className="hero-image transition-all duration-1000 ease-out will-change-transform">

// //             {/* The Glow Behind the Image */}
// //             <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-3xl opacity-20 -z-10 group-hover:opacity-40 transition-opacity duration-500"></div>

// //             <Image
// //               src="/banner.jpeg"
// //               width={1280}
// //               height={720}
// //               alt="Dashboard Preview"
// //               className="rounded-xl shadow-2xl border border-primary/10 mx-auto bg-background/50 backdrop-blur-sm"
// //               priority
// //             />
// //           </div>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // };

// // export default HeroSection;


// // "use client";

// // import React, { useEffect, useRef } from "react";
// // import Image from "next/image";
// // import { Button } from "@/components/ui/button";
// // import Link from "next/link";
// // import { ArrowRight } from "lucide-react";

// // const HeroSection = () => {
// //   const imageRef = useRef(null);

// //   useEffect(() => {
// //     const imageElement = imageRef.current;

// //     const handleScroll = () => {
// //       const scrollPosition = window.scrollY;
// //       const scrollThreshold = 100;

// //       if (scrollPosition > scrollThreshold) {
// //         imageElement?.classList.add("scrolled");
// //       } else {
// //         imageElement?.classList.remove("scrolled");
// //       }
// //     };

// //     window.addEventListener("scroll", handleScroll);
// //     return () => window.removeEventListener("scroll", handleScroll);
// //   }, []);

// //   return (
// //     <section className="w-full pt-36 md:pt-48 pb-0 bg-background relative overflow-hidden">

// //       {/* 1. Background Atmosphere (Subtle & Professional) */}
// //       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
// //       <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0%,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]" />

// //       <div className="container mx-auto px-4 text-center">

// //         {/* 2. Professional "News Pill" */}
// //         <div className="flex justify-center mb-6 fade-in-up delay-100">
// //           <div className="group inline-flex items-center gap-2 rounded-full border border-primary/10 bg-secondary/30 px-4 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/50 transition-colors cursor-pointer backdrop-blur-sm">
// //             <span className="relative flex h-2 w-2">
// //               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
// //               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
// //             </span>
// //             <span className="opacity-80">We are committed to make it #1 AI CAREER COACH </span>
// //             <ArrowRight className="h-3 w-3 opacity-50 group-hover:translate-x-0.5 transition-transform" />
// //           </div>
// //         </div>

// //         {/* 3. High-Contrast Typography */}
// //         <div className="space-y-6 mx-auto max-w-4xl fade-in-up delay-200 z-10 relative">
// //           <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl leading-[1.1] text-foreground">
// //             Your Career, <br className="hidden md:block" />
// //             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
// //                Supercharged by AI
// //             </span>
// //           </h1>
// //           <p className="mx-auto max-w-[640px] text-muted-foreground text-lg md:text-xl leading-relaxed">
// //             CareerPilot is the all-in-one intelligence platform to craft resumes, ace interviews, and land your dream job 10x faster.
// //           </p>
// //         </div>

// //         {/* 4. Action Buttons */}
// //         <div className="flex justify-center gap-3 mt-10 fade-in-up delay-300 z-10 relative">
// //           <Link href="/dashboard">
// //             <Button size="lg" className="px-8 h-12 text-base font-semibold shadow-lg hover:shadow-blue-500/20 transition-all rounded-lg">
// //               Start For Free
// //             </Button>
// //           </Link>
// //           <Link href="#features">
// //             <Button size="lg" variant="ghost" className="px-8 h-12 text-base font-medium rounded-lg hover:bg-secondary/50">
// //                How it Works
// //             </Button>
// //           </Link>
// //         </div>

// //         {/* 5. THE SCROLLER (Replaces the static image) */}
// //         {/* This creates a "Wall of Features" effect that looks very SaaS-native */}
// //         <div className="mt-20 relative max-w-[100vw] overflow-hidden">

// //            {/* Fade edges to blend with background */}
// //            <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-background to-transparent z-10"></div>
// //            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-background to-transparent z-10"></div>

// //            {/* Row 1: Moving Left */}
// //            <div className="flex gap-6 animate-scroll-left hover:[animation-play-state:paused]">
// //               <Card title="Resume Scorer" score="98/100" desc="ATS Optimization" icon="📄" />
// //               <Card title="Mock Interview" score="A+" desc="Real-time Feedback" icon="🎤" />
// //               <Card title="Cover Letter" score="Generated" desc="Personalized AI" icon="✍️" />
// //               <Card title="Salary Insight" score="$120k" desc="Market Data" icon="💰" />
// //               {/* Duplicate for infinite loop */}
// //               <Card title="Resume Scorer" score="98/100" desc="ATS Optimization" icon="📄" />
// //               <Card title="Mock Interview" score="A+" desc="Real-time Feedback" icon="🎤" />
// //               <Card title="Cover Letter" score="Generated" desc="Personalized AI" icon="✍️" />
// //               <Card title="Salary Insight" score="$120k" desc="Market Data" icon="💰" />
// //            </div>

// //            {/* Row 2: Moving Right (Slower) */}
// //            <div className="flex gap-6 mt-6 animate-scroll-right hover:[animation-play-state:paused] ml-10">
// //               <Card title="Skill Gap" score="Identified" desc="Learning Path" icon="🧠" />
// //               <Card title="Quiz Mode" score="Hard" desc="Technical Prep" icon="⚡" />
// //               <Card title="LinkedIn" score="Optimized" desc="Profile Review" icon="💼" />
// //               <Card title="Networking" score="Active" desc="Outreach Templates" icon="🤝" />
// //               {/* Duplicate for infinite loop */}
// //               <Card title="Skill Gap" score="Identified" desc="Learning Path" icon="🧠" />
// //               <Card title="Quiz Mode" score="Hard" desc="Technical Prep" icon="⚡" />
// //               <Card title="LinkedIn" score="Optimized" desc="Profile Review" icon="💼" />
// //               <Card title="Networking" score="Active" desc="Outreach Templates" icon="🤝" />
// //            </div>
// //         </div>

// //         {/* 6. Social Proof Strip */}
// //         <div className="mt-20 border-t border-border/40 py-10">
// //            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">Trusted by students from</p>
// //            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
// //               <img src="/logos/harvard.png" alt="Harvard" className="h-8 object-contain" />
// //               <img src="/logos/stanford.png" alt="Stanford" className="h-8 object-contain" />
// //               <img src="/logos/mit.png" alt="MIT" className="h-8 object-contain" />
// //               <img src="/logos/berkeley.png" alt="Berkeley" className="h-8 object-contain" />
// //            </div>
// //         </div>

// //       </div>
// //     </section>
// //   );
// // };

// // // --- Sub-Component for the Cards ---
// // const Card = ({ title, score, desc, icon }) => (
// //   <div className="flex-shrink-0 w-72 h-32 rounded-xl border border-border/50 bg-secondary/5 p-4 flex items-center gap-4 backdrop-blur-sm hover:bg-secondary/10 transition-colors select-none">
// //      <div className="w-12 h-12 rounded-lg bg-background border flex items-center justify-center text-2xl shadow-sm">
// //         {icon}
// //      </div>
// //      <div className="text-left">
// //         <h3 className="font-semibold text-foreground">{title}</h3>
// //         <div className="text-sm font-medium text-green-500">{score}</div>
// //         <p className="text-xs text-muted-foreground">{desc}</p>
// //      </div>
// //   </div>
// // );

// // export default HeroSection;

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
  Zap
} from "lucide-react";

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
      
      {/* Layer 1: Base Background Color (Absolute bottom) */}
      <div className="absolute inset-0 -z-50 bg-background" />

      {/* Layer 2: YOUR PATTERN IMAGE */}
      {/* Replaced the Grid & Gradients with this Image component */}
      <div className="absolute inset-0 -z-40 w-full h-full">
        <Image 
          src="/pattern.png"
          alt="Background Pattern"
          fill
          priority
          className="object-cover" 
          // Note: Change 'opacity-30' to 'opacity-100' if you want it fully visible, 
          // or 'opacity-10' if you want it very subtle.
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
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10 fade-in-up delay-300">
          <Link href="/dashboard">
            <Button size="lg" className="h-14 px-8 text-base font-bold shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 border-0">
              <Sparkles className="mr-2 h-5 w-5 fill-white text-white" />
              Build My Resume
            </Button>
          </Link>
          <Link href="#features">
             <Button size="lg" variant="outline" className="h-14 px-8 text-base font-medium rounded-full border-2 hover:bg-secondary/50 backdrop-blur-sm">
                <Zap className="mr-2 h-5 w-5 text-orange-500 fill-orange-500" />
                Analyze CV
             </Button>
          </Link>
        </div>

        {/* --- INFINITE SCROLLER (Wall of Features) --- */}
        <div className="mt-24 w-full">
            <div className="relative max-w-[100vw] overflow-hidden py-10">
                {/* Fade Masks for Smooth Edges */}
                <div className="absolute top-0 left-0 h-full w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 h-full w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none"></div>

                {/* ROW 1: Moving Left */}
                <div className="flex gap-6 animate-scroll-left hover:[animation-play-state:paused] w-max mb-6">
                    <FeatureCard icon={<FileText className="text-blue-500" />} title="AI Builder" metric="ATS-Ready" />
                    <FeatureCard icon={<Search className="text-purple-500" />} title="Resume Scan" metric="Score: 92" />
                    <FeatureCard icon={<Edit3 className="text-orange-500" />} title="Smart Refiner" metric="Auto-Fix" />
                    <FeatureCard icon={<Download className="text-green-500" />} title="Export PDF" metric="HD Quality" />
                    <FeatureCard icon={<Bot className="text-pink-500" />} title="Cover Letter" metric="Instant" />
                    
                    {/* Duplicates for Loop */}
                    <FeatureCard icon={<FileText className="text-blue-500" />} title="AI Builder" metric="ATS-Ready" />
                    <FeatureCard icon={<Search className="text-purple-500" />} title="Resume Scan" metric="Score: 92" />
                    <FeatureCard icon={<Edit3 className="text-orange-500" />} title="Smart Refiner" metric="Auto-Fix" />
                    <FeatureCard icon={<Download className="text-green-500" />} title="Export PDF" metric="HD Quality" />
                    <FeatureCard icon={<Bot className="text-pink-500" />} title="Cover Letter" metric="Instant" />
                </div>

                {/* ROW 2: Moving Right */}
                <div className="flex gap-6 animate-scroll-right hover:[animation-play-state:paused] w-max">
                    <FeatureCard icon={<Mic className="text-red-500" />} title="Mock Interview" metric="Live Audio" />
                    <FeatureCard icon={<TrendingUp className="text-indigo-500" />} title="Skill Quiz" metric="Hard Mode" />
                    <FeatureCard icon={<CheckCircle2 className="text-emerald-500" />} title="Job Tracker" metric="Organized" />
                    <FeatureCard icon={<Sparkles className="text-yellow-500" />} title="LinkedIn" metric="Optimized" />
                    
                    {/* Duplicates for Loop */}
                    <FeatureCard icon={<Mic className="text-red-500" />} title="Mock Interview" metric="Live Audio" />
                    <FeatureCard icon={<TrendingUp className="text-indigo-500" />} title="Skill Quiz" metric="Hard Mode" />
                    <FeatureCard icon={<CheckCircle2 className="text-emerald-500" />} title="Job Tracker" metric="Organized" />
                    <FeatureCard icon={<Sparkles className="text-yellow-500" />} title="LinkedIn" metric="Optimized" />
                    <FeatureCard icon={<Mic className="text-red-500" />} title="Mock Interview" metric="Live Audio" />
                </div>
            </div>
        </div>

      </div>
    </section>
  );
};

// --- Sub-Component for Features ---
const FeatureCard = ({ title, metric, icon }) => (
  <div className="flex items-center gap-4 bg-background/50 border border-border/50 backdrop-blur-sm rounded-xl px-6 py-4 min-w-[240px] shadow-sm hover:shadow-md hover:border-primary/20 transition-all group cursor-default">
    <div className="p-2 bg-secondary/50 rounded-lg group-hover:scale-110 transition-transform">
        {icon}
    </div>
    <div className="text-left">
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">{metric}</p>
    </div>
  </div>
);

export default HeroSection;



