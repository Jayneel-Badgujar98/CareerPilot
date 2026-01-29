import { Inter } from "next/font/google";
import { Suspense } from "react"; // ✅ Imported Suspense
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { dark } from "@clerk/themes";
import SmoothScroll from "@/components/SmoothScroll";
import BackButton from "@/components/backButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CareerPilot",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning={true}>
        <head>
          <link rel="icon" href="/newLogo.png" sizes="any" />
        </head>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="min-h-screen ">
              <SmoothScroll>

                <Suspense fallback={<LoadingFallback />}>
                  {children}
                </Suspense>
              </SmoothScroll>
            </main>
            <Toaster richColors />

            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-200">
                <p>Made with 💗 by Jayneel S Badgujar</p>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

// ✅ Professional Loading Component (Matches your Dark Theme)
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground animate-pulse">Loading...</span>
      </div>
    </div>
  );
}