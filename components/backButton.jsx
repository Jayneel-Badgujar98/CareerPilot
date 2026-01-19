"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ className, variant = "outline" }) {
  const router = useRouter();

  return (
    <Button
      variant={variant}
      onClick={() => router.back()}
      className={`
        group 
        absolute 
        z-50
        
        /* --- MOBILE STYLES (Default) --- */
        top-14 left-4
        h-10 w-10       /* Square/Circle on mobile */
        rounded-full 
        p-0             /* Remove padding to center icon */
        
        /* --- DESKTOP STYLES (Medium screens & up) --- */
        md:top-0
        md:h-auto md:w-auto   /* Auto width for text */
        md:px-5 md:py-2.5     /* Comfy padding */
        md:gap-2              /* Space between icon and text */

        /* --- VISUALS --- */
        bg-black/20 
        backdrop-blur-lg 
        border border-white/40 
        shadow-lg
        
        /* --- TEXT COLORS --- */
        text-neutral-300 
        font-bold
        tracking-wide
        text-md

        /* --- HOVER EFFECTS --- */
        hover:text-white 
        hover:bg-white/10 
        hover:border-white/50 
        hover:shadow-xl
        transition-all 
        duration-300
        
        ${className || ""}
      `}
    >
      <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
      
      {/* Text is HIDDEN on mobile, VISIBLE on desktop */}
      <span className="hidden md:inline">Back</span>
    </Button>
  );
}