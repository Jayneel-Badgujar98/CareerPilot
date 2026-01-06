"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const ResumeMarkdown = ({ content, mode = "dark" }) => {
  // Define colors based on mode
  const isDark = mode === "dark";
  
  const colors = {
    heading: isDark ? "text-white" : "text-black",
    subHeading: isDark ? "text-purple-400" : "text-purple-700", // Darker purple for paper
    body: isDark ? "text-neutral-300" : "text-gray-800",
    border: isDark ? "border-purple-500/50" : "border-gray-300",
    secondaryBorder: isDark ? "border-neutral-700" : "border-gray-200",
    strong: isDark ? "text-white" : "text-black",
    // --- NEW: Link Color (Bright Blue for Screen, Dark Blue for Print) ---
    link: isDark ? "text-blue-400" : "text-blue-700",
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // --- NEW: Handle Links (Clean, Colored, Clickable) ---
        a: ({ node, ...props }) => (
          <a 
            {...props} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`font-medium underline underline-offset-2 ${colors.link} hover:opacity-80 transition-opacity`}
          />
        ),

        // 1. NAME (H1)
        h1: ({ node, ...props }) => (
          <h1 className={`text-3xl md:text-4xl font-extrabold uppercase tracking-wide border-b-2 pb-2 mb-2 text-center ${colors.heading} ${colors.border}`} {...props} />
        ),
        
        // 2. SECTION HEADERS (H2)
        h2: ({ node, ...props }) => (
          <h2 className={`text-lg font-bold uppercase tracking-wider border-b pb-1 mt-6 mb-3 ${colors.subHeading} ${colors.secondaryBorder}`} {...props} />
        ),
        
        // 3. SUB-HEADERS (H3)
        h3: ({ node, ...props }) => (
          <h3 className={`text-base font-bold mt-3 mb-1 ${colors.heading}`} {...props} />
        ),
        
        // 4. BOLD TEXT
        strong: ({ node, ...props }) => (
          <span className={`font-bold ${colors.strong}`} {...props} />
        ),
        
        // 5. PARAGRAPHS
        p: ({ node, ...props }) => {
          // Check for Contact Info line (contains | pipe)
          const isContactInfo = props.children && typeof props.children[0] === 'string' && props.children[0].includes('|');
          if (isContactInfo) {
            return <p className={`text-center text-sm mb-6 font-mono ${colors.body}`} {...props} />;
          }
          return <p className={`leading-relaxed mb-2 text-sm ${colors.body}`} {...props} />;
        },

        // 6. LISTS
        ul: ({ node, ...props }) => (
          <ul className={`list-disc list-outside ml-5 space-y-1 mb-3 text-sm ${colors.body}`} {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="pl-1" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};