import { BarLoader } from "react-spinners";
import { Suspense } from "react";
import BackButton from "@/components/backButton";

export default function Layout({ children }) {
  return (
    <div className="px-5 ">
      <div className="flex items-center justify-center mb-5 ">
        <h1 className="text-7xl font-bold gradient-title ">Industry Insights</h1>
      </div>
      <Suspense
        fallback={<BarLoader className="mt-20" width={"100%"} color="gray" />}
      >
        {children}
      </Suspense>
    </div>
  );
}
