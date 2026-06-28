// app/actions/interview.js
'use server';

import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { checkUser } from "@/lib/checkUser";
import { GoogleGenAI, Type } from '@google/genai';

/**
 * Creates a new interview session.
 * Maps fields to top-level columns for high-performance dashboard querying.
 */
export async function createSession(data) {
    try {
        const user = await checkUser();
        if (!user) throw new Error("User not found");

        const session = await db.interviewSession.create({
            data: {
                userId: user.id,
                date: new Date(),
                // Top-level fields for fast Dashboard access
                jobRole: data.jobRole,
                focus: data.focus,
                companyName: data.companyName || '',
                techStack: data.techStack || '',
                difficulty: data.difficulty,
                personality: data.personality,
                duration: data.duration,
                jobDescription: data.jobDescription,

                // Backup of the full setup configuration
                config: {
                    ...data,
                    seniority: data.seniority || '',
                },

                transcript: [], // Initialize empty
                analysis: null, // Analysis generated later on Result Page
            },
        });

        return session.id;
    } catch (error) {
        console.error("Failed to create session:", error);
        throw new Error("Failed to create interview session");
    }
}

/**
 * Fetches a single session with all data (Transcript + Analysis).
 * Used by the Interview Room and the Result Detail page.
 */
export async function getSession(id) {
    if (!id) return null;
    try {
        const session = await db.interviewSession.findUnique({
            where: { id },
        });
        // We serialize the data to ensure Dates and ObjectIDs don't crash Client Components
        return session ? JSON.parse(JSON.stringify(session)) : null;
    } catch (error) {
        console.error("Failed to get session:", error);
        return null;
    }
}



/**
 * Updates the AI-generated analysis JSON.
 */
export async function updateSessionAnalysis(id, analysis) {
    try {
        await db.interviewSession.update({
            where: { id },
            data: { analysis },
        });
        // Refresh the dashboard and result page cache
        revalidatePath(`/ai-career-prep/ai-mock-interview/result/${id}`);
        revalidatePath('/ai-career-prep/ai-mock-interview');
        revalidatePath('/');
        return true;
    } catch (error) {
        console.error("Failed to update session analysis:", error);
        return false;
    }
}

/**
 * Saves the conversation transcript AND the actual time spent.
 */
export async function updateSessionTranscript(id, transcript, timeSpentMinutes) {
    try {
        await db.interviewSession.update({
            where: { id },
            data: {
                transcript,
                // Ensure we don't save negative numbers or nulls
                actualDuration: timeSpentMinutes ? Math.max(1, Math.round(timeSpentMinutes)) : 0
            },
        });
        // revalidatePath('/dashboard'); // Refresh dashboard stats immediately
        return true;
    } catch (error) {
        console.error("Failed to update session transcript:", error);
        return false;
    }
}


export async function getUserInterviews() {
    try {
        const user = await checkUser();
        if (!user) return [];

        const interviews = await db.interviewSession.findMany({
            where: {
                userId: user.id
            },
            orderBy: { date: 'desc' },
            select: {
                id: true,
                date: true,
                jobRole: true,
                companyName: true,
                focus: true,
                difficulty: true,
                duration: true,        // Planned time
                actualDuration: true,  // ✅ Actual time spent
                analysis: true,
            }
        });
        return JSON.parse(JSON.stringify(interviews));
    } catch (error) {
        console.error("Failed to fetch dashboard interviews:", error);
        return [];
    }
}

/**
 * Gated retrieval of the Gemini API Key.
 * Only returns the key if the current user session is verified via Clerk.
 */
export async function getGeminiKey() {
    try {
        const user = await checkUser();
        if (!user) throw new Error("Unauthorized");
        return process.env.GEMINI_API_KEY;
    } catch (error) {
        console.error("Failed to retrieve Gemini API key:", error);
        throw new Error("Failed to authenticate API access");
    }
}

/**
 * Server-side evaluation of mock interview transcripts.
 * Securely uses the private GEMINI_API_KEY, performs the LLM call, saves the analysis to the DB, and returns it.
 */
export async function generateSessionAnalysis(sessionId) {
    try {
        const user = await checkUser();
        if (!user) throw new Error("Unauthorized");

        const session = await db.interviewSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) throw new Error("Session not found");

        // If analysis already exists, return it
        if (session.analysis) {
            return session.analysis;
        }

        if (!session.transcript || session.transcript.length === 0) {
            throw new Error("No transcript found to analyze.");
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API key is not configured on the server.");

        const ai = new GoogleGenAI({ apiKey });
        const transcriptText = session.transcript
            .map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.text}`)
            .join('\n');

        const prompt = `
        # IDENTITY & ROLE
        You are a sophisticated Bar Raiser and Technical Hiring Manager at ${session.companyName || 'a Tier-1 Tech Company'}. 
        You are evaluating a candidate for the position of **${session.jobRole}**.

        # CANDIDATE CONTEXT (CRITICAL FOR SCORING)
        - **Role:** ${session.jobRole}
        - **Target Company:** ${session.companyName || 'Industry Standard'}
        - **Years of Exp/Seniority:** ${session.config?.seniority || "Assume based on Job Role title"}
        - **Tech Stack:** ${session.techStack || 'Not specified'}
        - **Interview Focus:** ${session.focus}

        # SCORING RUBRIC (CALIBRATION)
        Adjust your expectations based on the seniority implied by "${session.jobRole}":
        1. **If Intern/Fresher:** Focus on "Curiosity," "Foundational Logic," and "Coachability." Do NOT penalize for lack of complex system design experience. If they give a correct textbook answer, rate them highly.
        2. **If Senior/Lead:** Focus on "Trade-offs," "System Design," "Leadership," and "Business Impact." Penalize for surface-level answers.
        3. **Culture Fit:** Evaluate based on the known culture of ${session.companyName || "High Performance Teams"}.

        # TRANSCRIPT TO ANALYZE
        ${transcriptText}

        # JSON OUTPUT REQUIREMENTS
        Analyze the transcript and return a JSON object with these exact fields:

        1. **hiringDecision**: "Hired", "Strong Follow-up", or "Rejected". Be decisive.
        2. **score**: An integer (0-100). 
           - 90+: Exceptional (Raises the bar).
           - 70-89: Solid hire.
           - <50: Clear rejection.
        3. **hiringProbability**: A calculated percentage (0-100%) based on answer quality vs. role expectations.
        4. **interviewerThinking**: The raw, internal monologue of the recruiter. 
        5. **summary**: A professional executive summary of the interview.
        6. **improveVerbatim** (Array): Find 2-3 specific moments where the candidate stumbled.
           - **stumble**: The exact quote or vague phrase they used.
           - **professionalVersion**: How a top 1% candidate would have phrased it.
           - **explanation**: Why the new version is better (e.g., "uses stronger action verbs," "quantifies impact").
        7. **categoryScores**: Rate 0-100 for 'technicalDepth', 'communicationClarity', 'problemSolving', 'confidenceLevel', 'cultureFit'.
        8. **behavioralAnalysis**: Strings describing their 'leadership', 'adaptability', and 'emotionalIntelligence' signals found in the text.
        9. **strengths** & **weaknesses**: Specific arrays with 'point' and 'impact'/'actionableFix'.
        10. **actionPlan**: 3 concrete steps to improve before the real interview.

        RETURN ONLY RAW JSON. NO MARKDOWN.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        hiringDecision: { type: Type.STRING },
                        hiringProbability: { type: Type.NUMBER },
                        summary: { type: Type.STRING },
                        interviewerThinking: { type: Type.STRING },
                        categoryScores: {
                            type: Type.OBJECT,
                            properties: {
                                technicalDepth: { type: Type.NUMBER },
                                communicationClarity: { type: Type.NUMBER },
                                problemSolving: { type: Type.NUMBER },
                                confidenceLevel: { type: Type.NUMBER },
                                cultureFit: { type: Type.NUMBER }
                            },
                            required: ['technicalDepth', 'communicationClarity', 'problemSolving', 'confidenceLevel', 'cultureFit']
                        },
                        behavioralAnalysis: {
                            type: Type.OBJECT,
                            properties: {
                                leadership: { type: Type.STRING },
                                adaptability: { type: Type.STRING },
                                emotionalIntelligence: { type: Type.STRING }
                            }
                        },
                        strengths: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    point: { type: Type.STRING },
                                    impact: { type: Type.STRING }
                                }
                            }
                        },
                        improveVerbatim: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    stumble: { type: Type.STRING },
                                    professionalVersion: { type: Type.STRING },
                                    explanation: { type: Type.STRING }
                                }
                            }
                        },
                        weaknesses: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    point: { type: Type.STRING },
                                    actionableFix: { type: Type.STRING },
                                    priority: { type: Type.STRING }
                                }
                            }
                        },
                        criticalTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                        actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
                        keyTakeaway: { type: Type.STRING }
                    },
                    required: ['score', 'hiringDecision', 'hiringProbability', 'categoryScores', 'summary', 'interviewerThinking', 'improveVerbatim', 'strengths', 'weaknesses', 'actionPlan', 'keyTakeaway']
                }
            }
        });

        let rawText = "";
        if (typeof response.text === 'function') {
            rawText = response.text();
        } else if (typeof response.text === 'string') {
            rawText = response.text;
        } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
            rawText = response.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Could not extract text from AI response");
        }

        const cleanedText = rawText.replace(/```(?:json)?\n?/g, "").trim();
        const result = JSON.parse(cleanedText);

        const success = await updateSessionAnalysis(sessionId, result);
        if (!success) {
            throw new Error("Failed to save analysis to database");
        }
        return result;
    } catch (error) {
        console.error("Failed to generate session analysis on server:", error);
        throw error;
    }
}