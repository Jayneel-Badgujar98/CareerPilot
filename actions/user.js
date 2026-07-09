"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { extractTextFromFile } from "./analyse-resume";
import { generateAIInsights } from "./dashboard";
import { checkUser } from "@/lib/checkUser";

export async function updateUser(formData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    user = await checkUser();
  }

  if (!user) throw new Error("User not found");

  const userType = formData.get("userType");
  const industry = formData.get("industry");
  const subIndustry = formData.get("subIndustry");
  const experienceStr = formData.get("experience");
  const bio = formData.get("bio") || "";
  const skillsStr = formData.get("skills");
  const resumeFile = formData.get("resume");

  const experience = experienceStr ? parseInt(experienceStr, 10) : null;
  let skills = skillsStr
    ? skillsStr.split(/[/,]/).map((s) => s.trim()).filter(Boolean)
    : [];

  let resumeText = "";
  let isResumeVerified = false;

  if (resumeFile && resumeFile.size > 0) {
    try {
      resumeText = await extractTextFromFile(resumeFile);
    } catch (parseError) {
      console.error("Failed to parse resume text:", parseError);
      throw new Error("Unable to extract text from the uploaded file. Please ensure it is a valid PDF, DOCX, or TXT file.");
    }

    const { ChatGoogle } = await import("@langchain/google");
    const { z } = await import("zod");

    const model = new ChatGoogle({
      model: "gemini-3.1-flash-lite",
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
      temperature: 0,
    });

    const structuredModel = model.withStructuredOutput(
      z.object({
        documentType: z
          .enum(["resume", "study_notes", "other"])
          .describe("The classification of the document. Choose 'resume' if it is a CV or professional resume. Choose 'study_notes' if it is educational/study material. Choose 'other' for anything else."),
        hasProperSkillsSection: z
          .boolean()
          .describe("True if the document contains a clear, identifiable list or section of technical/professional skills."),
        extractedSkills: z
          .array(z.string())
          .describe("List of professional/technical skills found in the document. Empty array if none.")
      })
    );

    const textSample = resumeText.slice(0, 5000).trim();
    let classification;
    try {
      classification = await structuredModel.invoke([
        [
          "system",
          "You are an expert document classifier. Analyze the provided document text. Determine if it is a professional resume, check if it has a proper skills section, and extract the skills list."
        ],
        ["human", `Here is the document text:\n\n${textSample}`],
      ]);
    } catch (llmError) {
      console.error("LLM resume validation error:", llmError);
      throw new Error("Failed to validate the uploaded resume with AI. Please try again.");
    }

    if (classification.documentType !== "resume") {
      throw new Error("The uploaded file is not recognized as a valid professional resume. Please upload a valid resume/CV.");
    }

    if (!classification.hasProperSkillsSection || classification.extractedSkills.length === 0) {
      throw new Error("The uploaded resume does not contain a proper skills section. Please ensure your resume has a clear list of skills.");
    }

    // Merge manually typed skills and AI-extracted skills from the resume
    const mergedSkills = new Set([
      ...skills,
      ...classification.extractedSkills
    ]);
    skills = Array.from(mergedSkills);
    isResumeVerified = true;
  }

  // Require either manually typed skills or a verified resume with extracted skills
  const hasSkills = skills.length > 0;
  const hasResume = resumeFile && resumeFile.size > 0 && isResumeVerified;
  
  if (!hasSkills && !hasResume) {
    throw new Error("You must either write your skills or upload a valid resume containing skills.");
  }

  const formattedIndustry = `${industry}-${subIndustry.toLowerCase().replace(/ /g, "-")}`;

  try {
    // Start a transaction to handle multiple operations
    const result = await db.$transaction(
      async (tx) => {
        // First check if role exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            role: formattedIndustry,
          },
        });

        // If industry doesn't exist, create it with default values
        if (!industryInsight) {
          const insights = await generateAIInsights(industry, subIndustry);

          industryInsight = await tx.industryInsight.create({
            data: {
              role: formattedIndustry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Now update the user
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industryInsightId: industryInsight.id,
            experience,
            bio,
            skills,
            userType,
          },
        });

        // Optional: Extract resume text and save it if a file was uploaded
        if (resumeFile && resumeFile.size > 0) {
          await tx.resume.upsert({
            where: {
              userId: user.id,
            },
            update: {
              content: resumeText,
            },
            create: {
              userId: user.id,
              content: resumeText,
            },
          });
        }

        return { updatedUser, industryInsight };
      },
      {
        timeout: 15000,
      }
    );

    revalidatePath("/");
    revalidatePath("/industry-insights");
    return { success: true, user: result.updatedUser };
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    user = await checkUser();
  }

  if (!user) throw new Error("User not found");

  try {
    const userStatus = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industryInsight: true, // Fixed: check for relation existence
      },
    });

    return {
      isOnboarded: !!userStatus?.industryInsight,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}
