"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="
        /* --- POSITIONING (Fixes layout disturbance) --- */
        fixed top-14 left-10 z-50
        
        /* --- SHAPE & SIZE (Mobile default: Circle) --- */
        h-10 w-10 rounded-full
        flex items-center justify-center shrink-0
        
        /* --- STYLING --- */
        bg-neutral-900 border border-neutral-800 text-neutral-400
        shadow-xl transition-all group
        
        /* --- HOVER EFFECTS --- */
        hover:text-white hover:border-cyan-500/50 
        hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]

        /* --- DESKTOP STYLES (Medium screens & up) --- */
        md:top-24 md:left-10
        md:h-auto md:w-auto
        md:px-5 md:py-2.5
        md:rounded-2xl
        md:gap-2
      "
    >
      <ChevronLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
      
      {/* Since your original CSS had 'md:gap-2', it implies you might want text 
         on desktop. I added this span. If you only want the icon, remove this span.
      */}
      {/* <span className="hidden md:inline font-medium text-sm">Back</span> */}
    </button>
  );
}