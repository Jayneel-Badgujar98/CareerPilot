// app/analyse-resume/layout.js
import { Suspense } from 'react';
import BackButton from "@/components/backButton"

export default function AnalyzeResume({ children }) {
  return (

    <div className="min-h-screen bg-black text-white flex flex-col relative">
      
      <div className=" flex-grow w-full">
        <Suspense fallback={<LoadingSkeleton />}>
        <BackButton />
          {children}
        </Suspense>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center h-screen text-indigo-400/50 animate-pulse font-medium tracking-wide">
      Reloading Analyze Resume...
    </div>
  );
}