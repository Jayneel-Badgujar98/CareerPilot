import React, { Suspense } from "react";
import BackButton from "@/components/backButton"

const MainLayout = ({ children }) => {
  return (
    <div className="mt-20 container mx-auto mb-16">

      <Suspense fallback={<PageSkeleton />}>
        <BackButton />
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
