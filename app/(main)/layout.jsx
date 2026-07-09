import React, { Suspense } from "react";
import BackButton from "@/components/backButton"

const MainLayout = ({ children }) => {
  return (
    <div className="mt-20 container mx-auto mb-16">

      <Suspense fallback={<PageSkeleton />}>
        {/* <BackButton /> */}
        {children}
      </Suspense>
    </div>
  );
};

export default MainLayout;

// --- OPTIMIZATION: Lightweight Skeleton for this specific layout ---
function PageSkeleton() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Header imitation */}
      <div className="h-8 w-1/3 bg-neutral-800/50 rounded-lg" />
      <div className="h-4 w-2/3 bg-neutral-800/30 rounded-lg" />

      {/* Content imitation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-xl bg-neutral-900/50 border border-white/5" />
        ))}
      </div>
    </div>
  );
}


// after the user completes the auth via clerk auth then redirect
// him to the complete profile page where he will be asked to answer
// otheer details such as who are you ? 
// options are student , working professional 

// for both student and working professional show the same things below and also you can also use the onboarding page is already there in the (main)

// select Industry dropdown there will be many industries and then 
// below show there as Select Specialization 
// now below there will be two options both as optional
// and down "Skills You Know" here the user will enter his skills 
// and last option Upload Your Resume as optional 


// after the user completes his profile redirect him to the industry insights page 
// career pilot is an app which contains several ai Growth Tools for Both the Students and Working Professionals
// to upskill his / her career 
