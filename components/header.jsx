import React from "react";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  FileSearch,
  ChevronDown,
  StarsIcon,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { checkUser } from "@/lib/checkUser";

export default async function Header() {
  await checkUser();

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">

        <Link href="/">
          <Image
            src={"/mainLogo.png"}
            alt="CareerPilot Logo"
            width={200}
            height={80}
            className="md:h-40 h-32 py-1 w-auto object-contain"
          />
        </Link>


        <div className="flex items-center space-x-2 md:space-x-4">
          <SignedIn>

            <Link href="/dashboard">
              <Button
                variant="outline"
                className="hidden md:inline-flex items-center gap-2 border-primary/20 hover:bg-primary/5 transition-all duration-200 shadow-sm"
              >
                <LayoutDashboard className="h-4 w-4 text-orange-500" />
                <span className="font-semibold text-primary">Industry Insights</span>
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden text-orange-500">
                <LayoutDashboard className="h-5 w-5" />
              </Button>
            </Link>


            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg border-0 ring-offset-2 focus:ring-2">
                  <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full duration-500 transition-transform -skew-x-12 -translate-x-full" />
                  <div className="flex items-center gap-2 relative z-10">
                    <StarsIcon className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                    <span className="hidden md:block font-semibold tracking-wide">
                      AI Growth Tools
                    </span>
                    <span className="md:hidden">Tools</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-72 p-3 shadow-2xl border-indigo-100/20 bg-background/95 backdrop-blur-xl rounded-xl">


                <div className="px-3 py-2 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">
                  Career Prep
                </div>

                <DropdownMenuItem asChild className="p-0 mb-1 focus:bg-transparent">
                  <Link href="/ai-interview-prep" className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 group transition-all duration-200 cursor-pointer">

                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-orange-200">
                      <GraduationCap className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold text-foreground group-hover:text-orange-600 transition-colors">AI Interview Prep</div>
                      <p className="text-xs text-muted-foreground">Mock interviews with AI</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                  <Link href="/analyse-resume" className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 group transition-all duration-200 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-purple-200">
                      <FileSearch className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground group-hover:text-purple-600 transition-colors">AI Resume Analysis</div>
                      <p className="text-xs text-muted-foreground">Get AI scoring & Refinement</p>
                    </div>
                  </Link>
                </DropdownMenuItem>




                <div className="px-3 py-2 mt-2 border-t border-border/50 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">
                  Resume Mastery
                </div>

                <DropdownMenuItem asChild className="p-0 mb-1 focus:bg-transparent">
                  <Link href="/resume" className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 group transition-all duration-200 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-blue-200">
                      <FileText className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">AI Build Resume</div>
                      <p className="text-xs text-muted-foreground">Create an ATS-friendly resume</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="p-0 mb-2 focus:bg-transparent">
                  <Link href="/ai-cover-letter" className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 group transition-all duration-200 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-emerald-200">
                      <PenBox className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground group-hover:text-emerald-600 transition-colors">AI Cover Letter</div>
                      <p className="text-xs text-muted-foreground">Generate tailored letters</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" className="border-primary/20 hover:bg-primary/5 hover:text-primary">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 border-2 border-indigo-100 hover:border-indigo-300 transition-colors",
                  userButtonPopoverCard: "shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}