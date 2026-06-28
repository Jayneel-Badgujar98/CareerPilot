// app/ai-career-prep/layout.js
import { Suspense } from 'react';
import BackButton from "@/components/backButton"

export default function InterviewLayout({ children }) {
  return (
    // Added 'flex flex-col': This prevents child margins from pushing the layout down
    // Added 'relative': Ensures proper stacking context
    <div className="min-h-screen bg-background text-foreground flex flex-col relative">



      {/* <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" />
        {/* Added noise for better blending */}
      {/* <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div> *}
      </div> */}


      <div className="flex-grow w-full">
        <Suspense fallback={<LoadingSkeleton />}>
          {/* <BackButton /> */}
          {children}
        </Suspense>
      </div>
    </div>
  );
}

// Simple non-blocking loading state
function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center h-screen text-indigo-400/50 animate-pulse font-medium tracking-wide">
      Reloading Interview Prep...
    </div>
  );
}