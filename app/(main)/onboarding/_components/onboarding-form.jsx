"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, GraduationCap, Briefcase, Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { onboardingSchema } from "@/lib/schema";
import { updateUser } from "@/actions/user";

const OnboardingForm = ({ industries }) => {
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState(null);

  const {
    loading: updateLoading,
    fn: updateUserFn,
    data: updateResult,
  } = useFetch(updateUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      userType: undefined,
      industry: "",
      subIndustry: "",
      experience: "",
      bio: "",
      skills: "",
      resume: null,
    },
  });

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("userType", values.userType);
      formData.append("industry", values.industry);
      formData.append("subIndustry", values.subIndustry);
      formData.append("experience", values.experience || "");
      formData.append("bio", values.bio || "");
      formData.append(
        "skills",
        Array.isArray(values.skills) ? values.skills.join(",") : (values.skills || "")
      );
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      await updateUserFn(formData);
    } catch (error) {
      console.error("Onboarding error:", error);
    }
  };

  useEffect(() => {
    if (updateResult?.success && !updateLoading) {
      toast.success("Profile completed successfully!");
      router.push("/industry-insights");
      router.refresh();
    }
  }, [updateResult, updateLoading]);

  const watchIndustry = watch("industry");
  const watchUserType = watch("userType");
  const selectedIndustry = industries.find((ind) => ind.id === watchIndustry);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      setResumeFile(file);
      setValue("resume", file, { shouldValidate: true });
    }
  };

  const [prevSkills, setPrevSkills] = useState("");

  const handleSkillsChange = (e) => {
    let val = e.target.value;
    if (val.length > prevSkills.length) {
      if (val.endsWith(" ") && !val.endsWith(" / ")) {
        if (val.endsWith(" /")) {
          val = val + " ";
        } else if (val.endsWith("/")) {
          val = val.slice(0, -1) + " / ";
        } else {
          const beforeSpace = val.slice(0, -1);
          if (beforeSpace.trim()) {
            val = beforeSpace.trim() + " / ";
          } else {
            val = "";
          }
        }
      }
    }
    setPrevSkills(val);
    setValue("skills", val, { shouldValidate: true });
  };

  return (
    <div className="flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg mt-10 mx-2 shadow-xl border border-border/60">
        <CardHeader>
          <CardTitle className="gradient-title text-4xl">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Tell us a bit about yourself to unlock tailored growth tools and AI-driven insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Who Are You Selection */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Who are you?</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setValue("userType", "student");
                    trigger("userType");
                  }}
                  className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-300 ${
                    watchUserType === "student"
                      ? "border-primary bg-primary/5 text-primary shadow-lg ring-1 ring-primary/20 scale-[1.02]"
                      : "border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/40 text-neutral-400"
                  }`}
                >
                  <GraduationCap className="h-8 w-8 mb-2" />
                  <span className="font-bold text-sm">Student</span>
                  <span className="text-[11px] text-center text-muted-foreground mt-1 px-1 leading-tight">
                    Studying or looking for entry roles
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setValue("userType", "working professional");
                    trigger("userType");
                  }}
                  className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-300 ${
                    watchUserType === "working professional"
                      ? "border-primary bg-primary/5 text-primary shadow-lg ring-1 ring-primary/20 scale-[1.02]"
                      : "border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/40 text-neutral-400"
                  }`}
                >
                  <Briefcase className="h-8 w-8 mb-2" />
                  <span className="font-bold text-sm">Working Professional</span>
                  <span className="text-[11px] text-center text-muted-foreground mt-1 px-1 leading-tight">
                    Currently employed or experienced
                  </span>
                </button>
              </div>
              {errors.userType && (
                <p className="text-sm text-red-500">{errors.userType.message}</p>
              )}
            </div>

            {/* Industry Selection */}
            <div className="space-y-2">
              <Label htmlFor="industry">Select Industry</Label>
              <Select
                onValueChange={(value) => {
                  setValue("industry", value);
                  setValue("subIndustry", "");
                  trigger("industry");
                }}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Industries</SelectLabel>
                    {industries.map((ind) => (
                      <SelectItem key={ind.id} value={ind.id}>
                        {ind.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-red-500">
                  {errors.industry.message}
                </p>
              )}
            </div>

            {/* Specialization Selection */}
            <div className="space-y-2">
              <Label htmlFor="subIndustry">Select Specialization</Label>
              <Select
                disabled={!watchIndustry}
                value={watch("subIndustry")}
                onValueChange={(value) => {
                  setValue("subIndustry", value);
                  trigger("subIndustry");
                }}
              >
                <SelectTrigger id="subIndustry">
                  <SelectValue placeholder={watchIndustry ? "Select your specialization" : "Select an industry first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Specializations</SelectLabel>
                    {selectedIndustry?.subIndustries.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.subIndustry && (
                <p className="text-sm text-red-500">
                  {errors.subIndustry.message}
                </p>
              )}
            </div>

            {/* Experience (Optional) - Only visible for working professionals */}
            {watchUserType === "working professional" && (
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience (Optional)</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="Enter years of experience"
                  {...register("experience")}
                />
                {errors.experience && (
                  <p className="text-sm text-red-500">
                    {errors.experience.message}
                  </p>
                )}
              </div>
            )}

            {/* Skills You Know */}
            <div className="space-y-2">
              <Label htmlFor="skills">Skills You Know</Label>
              <Input
                id="skills"
                placeholder="e.g., Python, JavaScript, Project Management"
                {...register("skills")}
                onChange={(e) => {
                  register("skills").onChange(e);
                  handleSkillsChange(e);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Separate skills with spaces (e.g., typing a space automatically inserts a " / "). Required if no resume is uploaded.
              </p>
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            {/* Resume Upload */}
            <div className="space-y-2">
              <Label htmlFor="resume">Upload Your Resume</Label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                  resumeFile
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-neutral-800 hover:border-neutral-700 bg-neutral-900/10 hover:bg-neutral-900/20"
                }`}
                onClick={() => document.getElementById("resume-upload").click()}
              >
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                {resumeFile ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-10 w-10 text-primary" />
                    <div className="text-sm font-semibold truncate max-w-xs">
                      {resumeFile.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeFile(null);
                        setValue("resume", null, { shouldValidate: true });
                      }}
                    >
                      <X className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 text-neutral-400">
                    <Upload className="h-10 w-10 text-neutral-500" />
                    <span className="text-sm font-semibold text-foreground">
                      Click to upload resume
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Supports PDF, DOCX, TXT (Max 5MB). Required if no skills are entered.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={updateLoading}>
              {updateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;
