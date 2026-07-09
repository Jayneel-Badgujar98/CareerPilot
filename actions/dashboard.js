"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.AI_MODEL });

async function fetchAdzunaJobsCount(role, country = "in") {
  const appId = process.env.ADZUNA_APPLICATION_ID;
  const apiKey = process.env.ADZUNA_API_KEY;

  if (!appId || !apiKey) {
    console.log("[Adzuna API] Credentials missing in .env, skipping live search.");
    return null;
  }

  const url = `https://api.adzuna.com/v1/api/jobs/${country.toLowerCase()}/search/1?app_id=${appId}&app_key=${apiKey}&what=${encodeURIComponent(role)}&results_per_page=1`;

  console.log(`[Adzuna API] Searching for jobs: role="${role}", country="${country}"...`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`[Adzuna API] HTTP Error: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    console.log(`[Adzuna API] Search successful. Found ${data.count} active jobs for "${role}" in ${country.toUpperCase()}.`);
    return data.count;
  } catch (err) {
    console.error(`[Adzuna API] Failed to query Adzuna jobs count:`, err.message);
    return null;
  }
}

export const generateAIInsights = async (industry, role = "all") => {
  // Map "all" role to a friendly general search term for Adzuna
  let searchKeyword = role;
  if (role === "all") {
    const industryMap = {
      tech: "Software Developer",
      finance: "Finance",
      healthcare: "Healthcare",
      manufacturing: "Manufacturing",
      retail: "Retail",
      media: "Media",
      education: "Education",
      energy: "Energy",
      consulting: "Consultant",
      telecom: "Telecommunication",
      transportation: "Transportation",
      agriculture: "Agriculture",
      construction: "Construction",
      hospitality: "Hospitality",
      nonprofit: "Non Profit"
    };
    searchKeyword = industryMap[industry] || "Software Developer";
  }

  // Query Adzuna for jobs count in India
  const adzunaCount = await fetchAdzunaJobsCount(searchKeyword, "in");

  const prompt = `
    Analyze the current (2026) state of the industry "${industry}" for the role "${role}" in India.
    Provide highly detailed, realistic, and structural market insights in ONLY the following JSON format without any additional notes or explanations:
    {
      "marketOutlook": "Bullish" | "Stable" | "Bearish",
      "demandLevel": "High" | "Medium" | "Low",
      "activeJobs": number,
      "topHubs": [
        { "city": "string", "share": number }
      ],
      "skillGapAlert": "string describing demand vs supply gaps",
      "salaryRange": {
        "entry": number,
        "mid": number,
        "senior": number
      },
      "domainComparison": [
        { "domain": "string", "medianSalary": number, "jobCount": number }
      ],
      "topSkills": ["string"],
      "emergingTech": ["string"],
      "decliningSkills": ["string"],
      "skillProximity": [
        { "skill": "string", "pairsWith": "string", "frequency": "string" }
      ]
    }

    IMPORTANT Guidelines:
    1. Return ONLY the raw JSON. Do not include markdown codeblocks (no \`\`\`json) or conversational text.
    2. Provide at least 5 topSkills, 5 emergingTech, 5 decliningSkills, and 5 skillProximity pairs.
    3. Include at least 5 domains in domainComparison.
    4. Active jobs count: ${adzunaCount !== null ? `Must be exactly ${adzunaCount} (as fetched from the Adzuna API).` : "Should be a realistic active job openings count in India (between 5,000 and 100,000 depending on role)."}
    5. The location hubs (topHubs) MUST contain ONLY major hiring cities/regions in India (e.g. Bengaluru, Pune, Hyderabad, Mumbai, Delhi NCR, Chennai, Remote). Under no circumstances include foreign cities like San Francisco, London, New York, or Berlin.
    6. For topHubs, the "share" property MUST be a whole number percentage representing the proportion (e.g. 45 instead of 0.45 or 0.22). The sum of all shares should add up to approximately 100.
    7. Salary ranges must be realistic entry, mid, and senior levels for the given industry/role in India, represented in INR context (Annual CTC in Indian Rupees, e.g. entry level 300000 to 800000, mid level 800000 to 2000000, senior level 1800000 to 4500000).
    8. All median salaries in domainComparison must also be in INR (Annual CTC in Indian Rupees).
    9. If the role parameter is "all", evaluate the general, industry-wide demand level, salaries, and hubs. If a specific role is selected, evaluate that role specifically.
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  return JSON.parse(cleanedText);
};

export async function getIndustryInsights(selectedRole = "all") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // Determine user's main industry ID
  let userIndustry = "tech"; // Fallback default
  if (user.industryInsight) {
    userIndustry = user.industryInsight.role.split("-")[0];
  }

  // Format the target role key
  const formattedRole = `${userIndustry}-${selectedRole.toLowerCase().replace(/ /g, "-")}`;

  // Find if we already have it in the database
  let industryInsight = await db.industryInsight.findUnique({
    where: {
      role: formattedRole,
    },
  });

  // If the cached insight has foreign cities, force a refresh to get Indian cities
  const hasForeignCities = industryInsight?.topHubs?.some(hub => 
    ["san francisco", "london", "new york", "berlin", "tokyo", "paris"].includes(hub.city.toLowerCase())
  );

  // If not found, stale (older than 7 days), or contains foreign cities, generate it
  if (!industryInsight || hasForeignCities || new Date() > new Date(industryInsight.nextUpdate)) {
    const insights = await generateAIInsights(userIndustry, selectedRole);

    industryInsight = await db.industryInsight.upsert({
      where: {
        role: formattedRole,
      },
      update: {
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      create: {
        role: formattedRole,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  return {
    insight: industryInsight,
    user: {
      skills: user.skills,
      industry: userIndustry,
    }
  };
}
