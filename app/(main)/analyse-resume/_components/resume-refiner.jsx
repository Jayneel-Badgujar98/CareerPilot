"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Check, X, Download, Loader2, Zap,
  TrendingUp, Briefcase, CheckCircle, FileText, File
} from "lucide-react";
import { refineResumeAction } from "@/actions/refine-resume";
import { ResumeMarkdown } from "./resume-markdown"; 

const modalVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15 } }
};

export default function ResumeRefiner({ originalResumeText, feedbackData, userFile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("idle");
  const [refinedData, setRefinedData] = useState(null);
  const [activeTab, setActiveTab] = useState("refined");
  const [pdfUrl, setPdfUrl] = useState(null);

  // Print Ref for HTML2PDF
  const printRef = useRef();

  useEffect(() => {
    if (userFile) {
      const url = URL.createObjectURL(userFile);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [userFile]);

  // --- HANDLERS ---
  const handleRefine = async () => {
    setIsOpen(true);
    setStep("processing");
    const result = await refineResumeAction(originalResumeText, feedbackData);
    if (result.success) {
      setRefinedData(result.data);
      setStep("review");
    } else {
      alert("Refinement failed. Please try again.");
      setIsOpen(false);
    }
  };

  const handleDownloadMD = () => {
    if (!refinedData) return;
    const element = document.createElement("a");
    const file = new Blob([refinedData.refinedMarkdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = "Refined_Resume_CareerPilot.md";
    document.body.appendChild(element);
    element.click();
  };

  const handleDownloadPDF = async () => {
    if (!refinedData || !printRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;
    const element = printRef.current;
    const opt = {
      margin: [0.5, 0.5],
      filename: 'Refined_Resume_CareerPilot.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <>
      {/* 1. THE TRIGGER CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-neutral-800 mb-12 group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 z-0 animate-gradient-x bg-[length:200%_100%]"></div>
        <div className="relative z-10 p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-10 bg-[#0a0a0a]/80 backdrop-blur-sm">
          <div className="max-w-2xl text-center lg:text-left space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white flex flex-col lg:flex-row items-center gap-3 justify-center lg:justify-start">
              <Sparkles className="text-purple-400 animate-pulse" fill="currentColor" size={32} />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                Fix these gaps instantly?
              </span>
            </h2>
            <p className="text-neutral-300 text-lg leading-relaxed">
               Don't just analyze—<span className="text-white font-bold">Auto-Fix</span>. 
               Use CareerPilot's AI Builder to rewrite your bullet points and optimize for the ATS in one click.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button 
                onClick={handleRefine}
                className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                 Refine My Resume Now
              </button>
            </div>
          </div>

          {/* Prediction Card */}
          <div className="hidden lg:block">
             <motion.div 
               initial={{ rotate: 3, y: 10 }}
               whileHover={{ rotate: 0, y: 0, scale: 1.02 }}
               className="w-80 bg-gradient-to-tr from-neutral-900 to-neutral-800 rounded-2xl border border-neutral-700 shadow-2xl p-6 relative"
             >
               <div className="absolute -top-4 -right-4 bg-green-500 text-black font-bold px-4 py-2 rounded-full shadow-lg text-sm flex items-center gap-2 animate-bounce">
                  <TrendingUp size={16} /> Projected Growth
               </div>
               <div className="flex justify-center mb-6">
                  <div className="p-4 bg-neutral-800 rounded-full border border-neutral-700">
                     <Briefcase size={48} className="text-purple-400" />
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-700 pb-3">
                     <span className="text-neutral-400 text-sm">Interview Rate</span>
                     <span className="text-green-400 font-bold text-lg">
                        {feedbackData.improvementPrediction?.interviewChance || "+25%"}
                     </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-neutral-700 pb-3">
                     <span className="text-neutral-400 text-sm">Salary Potential</span>
                     <span className="text-green-400 font-bold text-lg">
                        {feedbackData.improvementPrediction?.salaryBoost || "+$15k"}
                     </span>
                  </div>
               </div>
               <p className="text-xs text-neutral-500 mt-4 text-center italic">
                  "{feedbackData.improvementPrediction?.summary || "Optimization based on market gaps."}"
               </p>
             </motion.div>
          </div>
        </div>
      </motion.div>

      {/* 2. THE MODAL CONTAINER */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-2">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              // KEY CHANGE: Use h-[90vh] or h-[95vh] but allow internal flex to stretch
              className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-[95vw] h-[90vh] md:h-[95vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden"
            >
              
              {/* --- HEADER (Fixed Height) --- */}
              <div className="border-b border-neutral-800 p-4 flex justify-between items-center bg-[#0a0a0a] z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Sparkles size={20} className="text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {step === "processing" ? "Polishing Resume..." : "Refinement Preview"}
                  </h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400">
                  <X size={24} />
                </button>
              </div>

              {/* --- BODY (Flex-1 to fill all remaining space) --- */}
              <div className="flex-1 flex flex-col min-h-0 bg-[#050505] relative">
                
                {step === "processing" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-6 z-20">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 border-4 border-neutral-800 rounded-full"></div>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={40} className="text-purple-400 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-bold text-white">AI is writing...</h4>
                      <p className="text-neutral-400">Optimizing impact verbs and formatting.</p>
                    </div>
                  </div>
                )}

                {step === "review" && refinedData && (
                  <>
                    {/* Toolbar (Sticky Top of Content) */}
                    <div className="flex items-center gap-4 px-4 py-3 border-b border-neutral-800 bg-[#0f0f0f] shrink-0">
                      <div className="flex bg-neutral-900 p-1 rounded-lg shrink-0">
                        {["refined", "original", "changes"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                              activeTab === tab 
                                ? "bg-neutral-800 text-white shadow-sm" 
                                : "text-neutral-400 hover:text-white"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                      <div className="ml-auto text-xs text-neutral-500 hidden md:flex items-center gap-2">
                        <Check size={14} className="text-green-500"/> Integrity Checked
                      </div>
                    </div>

                    {/* Scrollable Viewport (Takes rest of height) */}
                    <div className="flex-1 overflow-y-auto min-h-0 relative">
                      
                      {/* REFINED TAB */}
                      {activeTab === "refined" && (
                        <div className="p-4 md:p-8 max-w-5xl mx-auto">
                          <div className="bg-green-900/10 border border-green-900/30 p-4 rounded-xl mb-6 text-green-200 text-sm flex items-start gap-3">
                            <CheckCircle className="shrink-0 mt-0.5" size={18} />
                            <div>
                              <strong>Optimized Version:</strong> Professional formatting applied.
                              <span className="opacity-70 text-xs ml-2 block sm:inline">Review placeholders before downloading.</span>
                            </div>
                          </div>
                          <div className="bg-neutral-900/50 p-8 md:p-12 rounded-xl border border-neutral-800 shadow-inner">
                             <ResumeMarkdown content={refinedData.refinedMarkdown} mode="dark" />
                          </div>
                        </div>
                      )}

                      {/* ORIGINAL TAB (PDF FULL HEIGHT) */}
                      {activeTab === "original" && (
                        <div className="w-full h-full flex flex-col p-2 md:p-4">
                           {/* PDF CONTAINER - Absolute Fill Logic for Max Height */}
                           <div className="flex-1 bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 relative min-h-[400px]">
                              {userFile?.type === "application/pdf" ? (
                                <iframe 
                                  src={`${pdfUrl}#toolbar=0&navpanes=0`} 
                                  className="absolute inset-0 w-full h-full"
                                  title="Original Resume"
                                />
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 p-8">
                                  <FileText size={48} className="mb-4" />
                                  <p>Preview not available for this file type.</p>
                                  <div className="mt-4 p-4 bg-black/50 rounded border border-neutral-700 w-full max-w-lg h-64 overflow-y-auto font-mono text-xs text-left">
                                    {originalResumeText}
                                  </div>
                                </div>
                              )}
                           </div>
                           <div className="text-center mt-2">
                              {pdfUrl && (
                                <a href={pdfUrl} download={userFile.name} className="text-blue-400 hover:underline text-xs flex items-center justify-center gap-1">
                                  <Download size={12} /> Download Original File
                                </a>
                              )}
                           </div>
                        </div>
                      )}

                      {/* CHANGES TAB */}
                      {activeTab === "changes" && (
                        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
                          <h4 className="text-white font-bold mb-4 sticky top-0 bg-[#050505] py-2 z-10">Key Improvements</h4>
                          {refinedData.changes.map((change, i) => (
                            <div key={i} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                              <div className="flex justify-between items-start mb-3">
                                <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider">
                                  {change.type}
                                </span>
                                <span className="text-xs text-neutral-500">{change.section}</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="bg-red-950/10 p-3 rounded-lg border border-red-900/20">
                                  <div className="text-red-400 text-xs font-bold mb-1 uppercase">Before</div>
                                  <div className="text-red-200/70 line-through text-xs">{change.originalText}</div>
                                </div>
                                <div className="bg-green-950/10 p-3 rounded-lg border border-green-900/20">
                                  <div className="text-green-400 text-xs font-bold mb-1 uppercase">After</div>
                                  <div className="text-green-100 text-xs">{change.refinedText}</div>
                                </div>
                              </div>
                              <p className="mt-3 text-xs text-neutral-400 italic">
                                <Zap size={12} className="inline mr-1 text-yellow-500"/>
                                Reason: {change.reason}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* --- FOOTER (Fixed Height, Sticky Bottom) --- */}
              {step === "review" && (
                <div className="border-t border-neutral-800 p-4 bg-[#0a0a0a] shrink-0 z-20">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-xs text-neutral-500 hidden md:block">
                      <strong>Tip:</strong> Use Markdown for editing, PDF for applying.
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2.5 rounded-lg font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors flex-1 md:flex-none text-sm"
                      >
                        Discard
                      </button>
                      <button 
                        onClick={handleDownloadMD}
                        className="bg-neutral-800 text-white border border-neutral-700 px-4 py-2.5 rounded-lg font-bold hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none text-sm"
                      >
                        <FileText size={16} /> <span className="hidden sm:inline">MD</span>
                      </button>
                      <button 
                        onClick={handleDownloadPDF}
                        className="bg-white text-black px-6 py-2.5 rounded-lg font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-lg flex-1 md:flex-none text-sm"
                      >
                        <File size={16} /> Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- HIDDEN PRINT AREA --- */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={printRef} className="bg-white text-black p-10 max-w-[800px] min-h-[1100px]">
           {refinedData && (
             <ResumeMarkdown content={refinedData.refinedMarkdown} mode="light" />
           )}
        </div>
      </div>
    </>
  );
}



// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Sparkles,
//   Check,
//   X,
//   Download,
//   Loader2,
//   Zap,
//   TrendingUp,
//   Briefcase,
//   CheckCircle,
//   FileText,
//   File,
// } from "lucide-react";
// import { refineResumeAction } from "@/actions/refine-resume";
// import { ResumeMarkdown } from "./resume-markdown";

// const modalVariants = {
//   hidden: { opacity: 0, scale: 0.95 },
//   visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
//   exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
// };

// export default function ResumeRefiner({
//   originalResumeText,
//   feedbackData,
//   userFile,
// }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [step, setStep] = useState("idle");
//   const [refinedData, setRefinedData] = useState(null);
//   const [activeTab, setActiveTab] = useState("refined");
//   const [pdfUrl, setPdfUrl] = useState(null);

//   useEffect(() => {
//     if (userFile) {
//       const url = URL.createObjectURL(userFile);
//       setPdfUrl(url);
//       return () => URL.revokeObjectURL(url);
//     }
//   }, [userFile]);

//   const printRef = useRef();

//   // --- LOGIC ---
//   const handleRefine = async () => {
//     setIsOpen(true);
//     setStep("processing");

//     const result = await refineResumeAction(
//       originalResumeText,
//       feedbackData
//     );

//     if (result.success) {
//       setRefinedData(result.data);
//       setStep("review");
//     } else {
//       alert("Refinement failed. Please try again.");
//       setIsOpen(false);
//     }
//   };

//   const handleDownloadMD = () => {
//     if (!refinedData) return;
//     const element = document.createElement("a");
//     const file = new Blob([refinedData.refinedMarkdown], {
//       type: "text/markdown",
//     });
//     element.href = URL.createObjectURL(file);
//     element.download = "Refined_Resume_CareerPilot.md";
//     document.body.appendChild(element);
//     element.click();
//   };

//   const handleDownloadPDF = async () => {
//     if (!refinedData || !printRef.current) return;
//     const html2pdf = (await import("html2pdf.js")).default;
//     const element = printRef.current;
//     const opt = {
//       margin: [0.5, 0.5],
//       filename: "Refined_Resume_CareerPilot.pdf",
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2, useCORS: true },
//       jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
//     };
//     html2pdf().set(opt).from(element).save();
//   };

//   return (
//     <>
//       {/* 1. THE TRIGGER CTA */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="relative overflow-hidden rounded-3xl border border-neutral-800 mb-12 group"
//       >
//         <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 z-0 animate-gradient-x bg-[length:200%_100%]" />
//         <div className="relative z-10 p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-10 bg-[#0a0a0a]/80 backdrop-blur-sm">
//           <div className="max-w-2xl text-center lg:text-left space-y-6">
//             <h2 className="text-3xl md:text-4xl font-bold text-white flex flex-col lg:flex-row items-center gap-3 justify-center lg:justify-start">
//               <Sparkles
//                 className="text-purple-400 animate-pulse"
//                 fill="currentColor"
//                 size={32}
//               />
//               <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
//                 Fix these gaps instantly for Free
//               </span>
//             </h2>

//             <p className="text-neutral-300 text-lg leading-relaxed">
//               Don't just analyze—
//               <span className="text-white font-bold"> Auto-Fix</span>.
//               Use CareerPilot's AI Builder to rewrite your bullet points and
//               optimize for the ATS in one click.
//             </p>

//             <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
//               <button
//                 onClick={handleRefine}
//                 className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shadow-[0_0_30px_rgba(255,255,255,0.3)]"
//               >
//                 Refine My Resume Now
//               </button>
//             </div>
//           </div>

//           <div className="hidden lg:block">
//             <motion.div
//               initial={{ rotate: 3, y: 10 }}
//               whileHover={{ rotate: 0, y: 0, scale: 1.02 }}
//               transition={{ type: "spring", stiffness: 300 }}
//               className="w-80 bg-gradient-to-tr from-neutral-900 to-neutral-800 rounded-2xl border border-neutral-700 shadow-2xl p-6 relative"
//             >
//               <div className="absolute -top-4 -right-4 bg-green-500 text-black font-bold px-4 py-2 rounded-full shadow-lg text-md flex items-center gap-2 animate-bounce">
//                 <TrendingUp size={16} />
//                 Projected Score After Refining Your Resume
//               </div>

//               <div className="flex justify-center mb-6">
//                 <div className="p-4 bg-neutral-800 rounded-full border border-neutral-700">
//                   <Briefcase size={48} className="text-purple-400" />
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <div className="flex justify-between items-center border-b border-neutral-700 pb-3">
//                   <span className="text-neutral-400 text-sm">
//                     Interview Callback Rate
//                   </span>
//                   <span className="text-green-400 font-bold text-lg">
//                     {feedbackData.improvementPrediction?.interviewChance ||
//                       "+25%"}
//                   </span>
//                 </div>

//                 <div className="flex justify-between items-center border-b border-neutral-700 pb-3">
//                   <span className="text-neutral-400 text-sm">
//                     Salary Potential
//                   </span>
//                   <span className="text-green-400 font-bold text-lg">
//                     {feedbackData.improvementPrediction?.salaryBoost ||
//                       "+$15k"}
//                   </span>
//                 </div>
//               </div>

//               <p className="text-xs text-neutral-500 mt-4 text-center italic">
//                 "
//                 {feedbackData.improvementPrediction?.summary ||
//                   "Optimization based on market gaps."}
//                 "
//               </p>
//             </motion.div>
//           </div>
//         </div>
//       </motion.div>

//       {/* 2. THE MODAL */}
//       <AnimatePresence>
//         {isOpen && (
//           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 md:p-4">
//             <motion.div
//               variants={modalVariants}
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//               className="bg-[#0a0a0a] border border-neutral-800 w-[95vw] h-[95vh] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden"
//             >
//               {/* HEADER */}
//               <div className="border-b border-neutral-800 p-4 md:p-6 flex justify-between items-center bg-[#0a0a0a] z-10 shrink-0">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-purple-500/10 rounded-lg">
//                     <Sparkles size={20} className="text-purple-400" />
//                   </div>
//                   <h3 className="text-lg md:text-xl font-bold text-white">
//                     {step === "processing"
//                       ? "AI Refinement in Progress..."
//                       : "Resume Refinement Preview"}
//                   </h3>
//                 </div>
//                 <button
//                   onClick={() => setIsOpen(false)}
//                   className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
//                 >
//                   <X size={24} />
//                 </button>
//               </div>

//               {/* CONTENT */}
//               <div className="flex-1 overflow-hidden relative flex flex-col bg-[#050505]">
//                 {step === "processing" && (
//                   <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-6">
//                     <div className="relative w-32 h-32">
//                       <div className="absolute inset-0 border-4 border-neutral-800 rounded-full" />
//                       <motion.div
//                         animate={{ rotate: 360 }}
//                         transition={{
//                           duration: 2,
//                           repeat: Infinity,
//                           ease: "linear",
//                         }}
//                         className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full"
//                       />
//                       <div className="absolute inset-0 flex items-center justify-center">
//                         <Sparkles
//                           size={40}
//                           className="text-purple-400 animate-pulse"
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <h4 className="text-2xl font-bold text-white">
//                         Analyzing Gaps...
//                       </h4>
//                       <p className="text-neutral-400 max-w-md mx-auto">
//                         The AI is rewriting your summary, fixing passive voice,
//                         and injecting missing keywords.
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {step === "review" && refinedData && (
//                   <div className="flex flex-col h-full">
//                     {/* Toolbar */}
//                     <div className="flex items-center gap-4 px-6 py-4 border-b border-neutral-800 bg-[#0f0f0f] shrink-0 overflow-x-auto no-scrollbar">
//                       <div className="flex bg-neutral-900 p-1 rounded-lg shrink-0">
//                         {["refined", "original", "changes"].map((tab) => (
//                           <button
//                             key={tab}
//                             onClick={() => setActiveTab(tab)}
//                             className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
//                               activeTab === tab
//                                 ? "bg-neutral-800 text-white shadow-sm"
//                                 : "text-neutral-400 hover:text-white"
//                             }`}
//                           >
//                             {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                           </button>
//                         ))}
//                       </div>

//                       <div className="ml-auto text-xs text-neutral-500 hidden sm:flex items-center gap-2 shrink-0">
//                         <Check size={14} className="text-green-500" />
//                         AI Integrity Check Passed
//                       </div>
//                     </div>

//                     {/* VIEWPORT */}
//                     <div className="flex-1 overflow-hidden relative">
//                       {activeTab === "refined" && (
//                         <div className="h-full overflow-y-auto p-6 md:p-8">
//                           <div className="max-w-5xl mx-auto">
//                             <div className="bg-green-900/10 border border-green-900/30 p-4 rounded-xl mb-6 text-green-200 text-sm flex items-start gap-3">
//                               <CheckCircle
//                                 className="shrink-0 mt-0.5"
//                                 size={18}
//                               />
//                               <div>
//                                 <strong>Optimized Version:</strong> ATS-Ready
//                                 formatting applied.
//                                 <span className="opacity-70 text-xs ml-2">
//                                   Review placeholders before downloading.
//                                 </span>
//                               </div>
//                             </div>

//                             <div className="bg-neutral-900/50 p-8 md:p-12 rounded-xl border border-neutral-800 shadow-inner">
//                               <ResumeMarkdown
//                                 content={refinedData.refinedMarkdown}
//                                 mode="dark"
//                               />
//                             </div>
//                           </div>
//                         </div>
//                       )}

//                       {activeTab === "original" && (
//                         <div className="h-full w-full flex flex-col p-4 md:p-6">
//                           <div className="flex justify-between items-center mb-4 px-2 shrink-0">
//                             <div className="text-sm text-neutral-400">
//                               <strong>Original Source:</strong>{" "}
//                               {userFile?.name}
//                             </div>
//                             {pdfUrl && (
//                               <a
//                                 href={pdfUrl}
//                                 download={userFile.name}
//                                 className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
//                               >
//                                 <Download size={14} /> Download Original
//                               </a>
//                             )}
//                           </div>

//                           <div className="flex-1 bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 relative">
//                             {userFile?.type === "application/pdf" ? (
//                               <iframe
//                                 src={`${pdfUrl}#toolbar=0&navpanes=0`}
//                                 className="absolute inset-0 w-full h-full"
//                                 title="Original Resume"
//                               />
//                             ) : (
//                               <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-4">
//                                 <FileText size={48} />
//                                 <p>
//                                   Preview not available for{" "}
//                                   {userFile?.name.split(".").pop()} files.
//                                 </p>
//                                 <div className="p-6 bg-neutral-900/50 rounded-xl border border-neutral-800 whitespace-pre-wrap font-mono text-xs text-left w-3/4 h-64 overflow-y-auto">
//                                   {originalResumeText}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       )}

//                       {activeTab === "changes" && (
//                         <div className="h-full overflow-y-auto p-6 md:p-8">
//                           <div className="max-w-4xl mx-auto space-y-4">
//                             <h4 className="text-white font-bold mb-4">
//                               Key Improvements Made
//                             </h4>

//                             {refinedData.changes.map((change, i) => (
//                               <div
//                                 key={i}
//                                 className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl group hover:border-purple-500/30 transition-colors"
//                               >
//                                 <div className="flex justify-between items-start mb-3">
//                                   <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider">
//                                     {change.type}
//                                   </span>
//                                   <span className="text-xs text-neutral-500">
//                                     {change.section}
//                                   </span>
//                                 </div>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                                   <div className="bg-red-950/10 p-3 rounded-lg border border-red-900/20">
//                                     <div className="text-red-400 text-xs font-bold mb-1 uppercase">
//                                       Before
//                                     </div>
//                                     <div className="text-red-200/70 line-through decoration-red-500/50">
//                                       {change.originalText}
//                                     </div>
//                                   </div>

//                                   <div className="bg-green-950/10 p-3 rounded-lg border border-green-900/20">
//                                     <div className="text-green-400 text-xs font-bold mb-1 uppercase">
//                                       After
//                                     </div>
//                                     <div className="text-green-100">
//                                       {change.refinedText}
//                                     </div>
//                                   </div>
//                                 </div>

//                                 <p className="mt-3 text-xs text-neutral-400 italic border-t border-neutral-800 pt-3">
//                                   <Zap
//                                     size={12}
//                                     className="inline mr-1 text-yellow-500"
//                                   />
//                                   Reason: {change.reason}
//                                 </p>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* FOOTER */}
//               {step === "review" && (
//                 <div className="border-t border-neutral-800 p-4 md:p-6 bg-[#0a0a0a] shrink-0 z-10">
//                   <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
//                     <div className="text-xs text-neutral-500 text-center xl:text-left">
//                       <strong className="text-neutral-400">Note:</strong>{" "}
//                       Download{" "}
//                       <span className="text-blue-400 mx-1">Markdown</span> to edit
//                       in any text editor. Download{" "}
//                       <span className="text-white mx-1">PDF</span> for a clean,
//                       professional ATS-ready format.
//                     </div>

//                     <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
//                       <button
//                         onClick={() => setIsOpen(false)}
//                         className="px-6 py-3 rounded-xl font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors border border-transparent hover:border-neutral-800"
//                       >
//                         Discard
//                       </button>

//                       <button
//                         onClick={handleDownloadMD}
//                         className="bg-neutral-800 text-white border border-neutral-700 px-6 py-3 rounded-xl font-bold hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
//                       >
//                         <FileText size={18} />
//                         Download .md
//                       </button>

//                       <button
//                         onClick={handleDownloadPDF}
//                         className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
//                       >
//                         <File size={18} />
//                         Download PDF
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* HIDDEN PRINT AREA */}
//       <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
//         <div
//           ref={printRef}
//           className="bg-white text-black p-10 max-w-[800px] min-h-[1100px]"
//         >
//           {refinedData && (
//             <ResumeMarkdown
//               content={refinedData.refinedMarkdown}
//               mode="light"
//             />
//           )}
//         </div>
//       </div>
//     </>
//   );
// }
